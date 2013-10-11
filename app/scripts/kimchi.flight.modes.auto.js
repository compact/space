/**
 * Automatically guided flight.
 * @namespace auto
 * @memberOf  module:KIMCHI.flight.modes
 */
var KIMCHI = (function (KIMCHI, $, THREE) {
  'use strict';

  var flight, Mode, mode, keydown, update, panTo, translateTo;



  flight = KIMCHI.flight;
  Mode = flight.Mode;
  mode = new Mode('auto');
  KIMCHI.flight.modes.auto = mode;

  mode.enable = function () {
    Mode.prototype.enable.call(this);

    KIMCHI.$document.on('keydown', keydown);
  };

  mode.disable = function () {
    Mode.prototype.disable.call(this);

    KIMCHI.ui.notice.clear(); // TODO move this
    KIMCHI.$document.off('keydown', keydown);
  };

  /**
   * Fly to the given Body. Two private functions are used sequentially to
   *   first pan and then translate to it. translateTo(body) is called when
   *   panTo(body) ends. disable() is called when translateTo(body) ends
   * @alias    flyTo
   * @memberOf module:KIMCHI.flight.modes.auto
   */
  mode.flyTo = function (body) {
    KIMCHI.ui.notice.set(KIMCHI.config.get('noticeFlyTo')(body));
    KIMCHI.config.set('bodiesSpeed', 0);
    panTo(body);
    // TODO make function queue for successive setTimeout() calls
  };



  /**
   * The event handler for pressing Escape to stop auto flight and return to
   *   menu mode.
   * @private
   * @memberOf module:KIMCHI.flight.modes.auto
   */
  keydown = (function () {
    var keydownInProgress = false;

    return function (event) {
      if (event.which === 27) { // Esc
        keydownInProgress = true;
        $(this).one('keyup', function (event) {
          if (event.which === 27 && keydownInProgress) {
            flight.setMode('menu');
            keydownInProgress = false;
          }
        });
      }
    };
  }());

  /**
   * Helper function called in every animationFrame() to update space.
   * @param    {Number} delta
   * @private
   * @memberOf module:KIMCHI.flight.modes.auto
   */
  update = function (delta) {
    // do not move the Body Meshes themselves
    KIMCHI.space.updateBodyChildren();
  };

  /**
   * Pan (rotate) the camera towards the given Body (without translating).
   *   Return false to disable auto flight.
   * @returns  {undefined|false}
   * @private
   * @memberOf module:KIMCHI.flight.modes.auto
   */
  panTo = (function () {
    var initialQuaternion, rotationMatrix, targetQuaternion, t;

    rotationMatrix = new THREE.Matrix4();
    targetQuaternion = new THREE.Quaternion();

    return function (body) {
      initialQuaternion = KIMCHI.camera.quaternion.clone();

      rotationMatrix.lookAt(
        KIMCHI.camera.position,
        body.object3Ds.main.position,
        KIMCHI.camera.up
      );

      targetQuaternion.setFromRotationMatrix(rotationMatrix);

      t = 0;
      mode.animationFrame = function (delta) {
        // avoid rounding imprecision because we want the final rotation to be
        // centered exactly onto the target body (t = 1); the t += 0.05
        // calculations can be imprecise
        if (t > 1 && t < 1 + 0.05) {
          t = 1;
        }

        if (t <= 1) {
          KIMCHI.camera.quaternion.copy(
            initialQuaternion.clone().slerp(targetQuaternion, t)
          );
          update(delta);

          t += 0.05;
        } else {
          translateTo(body);
          //return false; // disable
        }
      };
    };
  }());

  /**
   * Translate the camera to the given Body until within range of collision.
   * @private
   * @memberOf module:KIMCHI.flight.modes.auto
   */
  translateTo = function (body) {
    mode.animationFrame = function (delta) {
      var translationZ;

      if (body.isColliding(KIMCHI.camera)) {
        flight.setMode('menu');
        // KIMCHI.pointerLock.request();
        return false;
      } else {
        translationZ = KIMCHI.config.get('controlsZSpeed') * delta *
          flight.getTranslationSpeedMultiplier([body]);
        this.speed = translationZ / delta;
        KIMCHI.camera.translateZ(-translationZ);
        update(delta);
      }
    };
  };



  return KIMCHI;
}(KIMCHI || {}, jQuery, THREE));