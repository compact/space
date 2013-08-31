/**
 * The different flight modes:
 * <br> free: User-controlled flight.
 * <br> auto: Automatically guided flight.
 * @namespace flight
 * @memberOf  module:KIMCHI
 */
var KIMCHI = (function (KIMCHI, _, $, THREE) {
  'use strict';

  var flight = {}, Mode;
  KIMCHI.flight = flight;


  /**
   * The current flight mode.
   * @memberOf module:KIMCHI.flight
   */
  flight.mode = false; // possible values are 'free', 'auto', and false



  /**
   * Flight mode. Can be constructed only inside kimchi.flight.js.
   * @param       {String} name
   * @constructor Mode
   */
  Mode = function (name) {
    this.name = name;
    this.enabled = false;
  };
  /**
   * Enable.
   * @memberOf Mode
   */
  Mode.prototype.enable = function () {
    KIMCHI.$overlay.hide();
    KIMCHI.clock.start();
    flight.mode = this.name;
  };
  /**
   * Disable.
   * @memberOf Mode
   */
  Mode.prototype.disable = function () {
    KIMCHI.clock.stop();
    flight.mode = false;
    KIMCHI.$overlay.show();
/*    KIMCHI.$overlay.blurjs({
      source: '#space',
      radius: 7,
      overlay: 'rgba(255,255,255,0.4)'
    });*/
    KIMCHI.ui.panel.update();
  };
  /**
   * Toggle.
   * @memberOf Mode
   */
  Mode.prototype.toggle = function (enable) {
    if (typeof enable === 'boolean') {
      if (enable) {
        this.enable();
      } else {
        this.disable();
      }
    } else if (this.enabled) {
      this.enable();
    } else {
      this.disable();
    }
  };
  /**
   * In this mode, what happens in each animation frame?
   * @param    {Number} delta
   * @memberOf Mode
   */
  Mode.prototype.animationFrame = function () {};
  /**
   * Shortcut for KIMCHI.rendering.animate(this.animationFrame).
   * @memberOf Mode
   */
  Mode.prototype.animate = function () {
    KIMCHI.rendering.animate(this.animationFrame);
  };



  /**
   * Free flight.
   * @memberOf module:KIMCHI.flight
   */
  flight.free = (function () {
    var mode, colliding;

    /**
     * @returns {Boolean} Whether the camera is current in collision, i.e.
     *   within any Body's collision distance.
     * @private
     */
    colliding = (function () {
      var translationVector, raycaster, intersects, returnValue;

      raycaster = new THREE.Raycaster();

      return function () {
        translationVector = KIMCHI.controls.getLocalTranslationVector();

        // scaling may be necessary if translationVector's magnitude is much
        // larger or smaller than the camera position
//      translationVector.multiplyScalar(1000);

        if (translationVector.length() === 0) { // not moving, can't be colliding
          return false;
        }

        raycaster.set(
          KIMCHI.camera.position.clone(),
          // calculation based on http://stackoverflow.com/questions/11473755/how-to-detect-collision-in-three-js
          KIMCHI.camera.localToWorld(translationVector)
            .sub(KIMCHI.camera.position)
//        KIMCHI.camera.position.clone().sub(translationVector.applyMatrix4(KIMCHI.camera.matrix)),
        );

        intersects = raycaster.intersectObjects(
          KIMCHI.space.getCollideableObject3Ds()
        );

        // no objects are in the current direction of translation, so not
        // colliding
        if (intersects.length === 0) {
          return false;
        }

        returnValue = false;
        _.forEach(intersects, function (intersect) {
          // TODO take into account the object's Body's radius
          var body = KIMCHI.space.getBody(intersect.object.name);
          if (intersect.distance < body.getCollisionDistance()) {
console.log(intersect.distance + ' < ' + body.getCollisionDistance());
            returnValue = true;
            return false; // break the loop
          }
        });
        return returnValue;
      };
    }());

    mode = new Mode();
    mode.enable = function () {
      Mode.prototype.enable.call(this);

      KIMCHI.pointerLock.unbind();
      $('#hud1').show();
      KIMCHI.rendering.animate(this.animationFrame);
      KIMCHI.controls.enable();
    };
    mode.disable = function () {
      Mode.prototype.disable.call(this);

      KIMCHI.controls.disable();
      $('#hud1').hide();
      KIMCHI.pointerLock.bind();
    };
    mode.animationFrame = function (delta) {
      if (!colliding()) {
        KIMCHI.controls.moveCamera(
          delta,
          flight.getTranslationSpeedMultiplier()
        );
      }

      KIMCHI.space.moveBodies(delta);
      KIMCHI.ui.hud.update(delta);
      KIMCHI.date.setDate(KIMCHI.date.getDate() + 1);
    };

    return mode;
  }());



  /**
   * Auto flight.
   * @memberOf module:KIMCHI.flight
   */
  flight.auto = (function () {
    var mode, panTo, translateTo;

    /**
     * Pan (rotate) the camera towards the given Body (without translating).
     *   Return false to disable auto flight.
     * @returns {(undefined|false)}
     * @private
     */
    panTo = (function () {
      var initQuaternion, rotationMatrix, targetQuaternion, t;

      rotationMatrix = new THREE.Matrix4();
      targetQuaternion = new THREE.Quaternion();

      return function (body) {
        initQuaternion = KIMCHI.camera.quaternion.clone();

        rotationMatrix.lookAt(
          KIMCHI.camera.position,
          body.mesh.position,
          KIMCHI.camera.up
        );

        targetQuaternion.setFromRotationMatrix(rotationMatrix);

        t = 0;
        KIMCHI.rendering.animate(function (delta) {
          // avoid rounding imprecision because we want the final rotation to be
          // centered exactly onto the target body (t = 1)
          if (t > 1 && t < 1 + 0.05) {
            t = 1;
          }

          if (t <= 1) {
            KIMCHI.camera.quaternion.copy(
              initQuaternion.slerp(targetQuaternion, t)
            );
            mode.animationFrame(delta);

            t += 0.05;
          } else {
            translateTo(body);
            return false; // disable
          }
        });
      };
    }());

    /**
     * Translate the camera to the given Body until within range of collision.
     * @private
     */
    translateTo = function (body) {
      KIMCHI.rendering.animate(function (delta) {
        if (THREE.Object3D.distance(KIMCHI.camera, body.mesh) - body.radius >=
            body.getCollisionDistance()) {
          KIMCHI.camera.translateZ(-KIMCHI.config.controls.zSpeed * delta *
            flight.getTranslationSpeedMultiplier([body.mesh]));
          mode.animationFrame(delta);
        } else {
          mode.disable();
        }
      });
    };

    mode = new Mode();
    mode.disable = function () {
      Mode.prototype.disable.call(this);

      KIMCHI.notice.clear(); // TODO move this
    };
    mode.animationFrame = function (delta) {
      KIMCHI.space.moveBodyChildren(); // do not move the Body Meshes themselves
      KIMCHI.ui.hud.update(delta);
    };

    /**
     * Bind the "fly to" links.
     * @public
     */
    mode.init = function () {
      KIMCHI.ui.panel.update(); // maybe shouldn't be here

      $('#bodies').on('click', '.fly-to', function (event) {
        var name, body;

        name = $(this).data('name');
        body = KIMCHI.space.getBody(name);
        mode.flyTo(body);
      });
    };
    /**
     * Fly to the given Body. Two private functions are used sequentially to
     *   first pan and then translate to it. translateTo(body) is called when
     *   panTo(body) ends. disable() is called when translateTo(body) ends
     * @public
     */
    mode.flyTo = function (body) {
      KIMCHI.notice.set('Flying to ' + body.name + '...');
      this.enable();
      panTo(body);
      // TODO make function queue for successive setTimeout() calls
    };

    return mode;
  }());



  /**
   * Return a number for scaling the camera translation speed (in every
   *   direction) depending on how close the camera is to the closest of the
   *   given collideable Bodies; if not given, consider all collideable Bodies.
   * @param    {Array}  Bodies
   * @returns  {Number}
   * @memberOf module:KIMCHI.flight
   */
  flight.getTranslationSpeedMultiplier = function (bodies) {
    if (typeof bodies === 'undefined') {
      bodies = KIMCHI.space.getCollideableBodies();
    }

    return KIMCHI.space.getClosestDistance(bodies);
  };



  return KIMCHI;
}(KIMCHI || {}, _, jQuery, THREE));