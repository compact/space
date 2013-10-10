/**
 * Free, user-controlled flight.
 * @namespace free
 * @memberOf  module:KIMCHI.flight.modes
 */
var KIMCHI = (function (KIMCHI, _, $, THREE) {
  'use strict';

  var flight, Mode, mode, colliding, getSpeed;



  flight = KIMCHI.flight;
  Mode = flight.Mode;
  mode = new Mode('free');
  KIMCHI.flight.modes.free = mode;

  mode.enable = function () {
    Mode.prototype.enable.call(this);

    $('#hud1').show();
    KIMCHI.controls.enable();
  };

  mode.disable = function () {
    Mode.prototype.disable.call(this);

    KIMCHI.controls.disable();
    $('#hud1').hide();
  };

  mode.animationFrame = function (delta) {
    // resolve true/false to continue/stop animating
    var deferred = $.Deferred();

    // move the Camera
    if (!colliding()) {
      KIMCHI.controls.moveCamera(
        delta,
        flight.getTranslationSpeedMultiplier()
      );
      this.speed = getSpeed(delta);
    }

    // move the Bodies and increment the current time
    if (KIMCHI.config.get('bodiesSpeed')) {
      KIMCHI.time.increment().done(function () {
        KIMCHI.space.translateBodies(delta);
        deferred.resolve(true);
      }).fail(function () {
        deferred.resolve(false);
      });
    } else {
      deferred.resolve(true);
    }

    // rotate the Bodies
    if (KIMCHI.config.get('rotateBodies')) {
      KIMCHI.space.rotateBodies(delta);
    }

    // move the Bodies' children
    KIMCHI.space.updateBodyChildren();

    // update hud
    KIMCHI.ui.hud.update(delta);

    return deferred.promise();
  };



  /**
   * @returns  {Boolean} Whether the camera is current in collision, i.e.
   *   within any Body's collision distance.
   * @private
   * @memberOf module:KIMCHI.flight.modes.free
   */
  colliding = (function () {
    var translationVector, raycaster, intersects, returnValue;

    raycaster = new THREE.Raycaster();
    // the default precision, 0.0001, is not low enough for our 1x scale
    raycaster.precision = 0.000001;

    return function () {
      translationVector = KIMCHI.controls.getLocalTranslationVector();

      // scaling may be necessary if translationVector's magnitude is much
      // larger or smaller than the camera position
      // translationVector.multiplyScalar(1000);

      if (translationVector.length() === 0) { // not moving, can't be colliding
        return false;
      }

      raycaster.set(
        KIMCHI.camera.position.clone(),
        // calculation based on http://stackoverflow.com/questions/11473755/how-to-detect-collision-in-three-js
        KIMCHI.camera.localToWorld(translationVector)
          .sub(KIMCHI.camera.position)
          // KIMCHI.camera.position.clone().sub(translationVector.applyMatrix4(KIMCHI.camera.matrix)),
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
      _.each(intersects, function (intersect) {
        // TODO take into account the object's Body's radius
        var body = KIMCHI.space.getBody(intersect.object.name);
        if (intersect.distance < body.getCollisionDistance()) {
          returnValue = true;
          return false; // break the loop
        }
      });
      return returnValue;
    };
  }());

  /**
   * @returns  {Number} The current speed.
   * @private
   * @memberOf module:KIMCHI.flight.modes.free
   */
  getSpeed = function (delta) {
    var translation = KIMCHI.controls.getLocalTranslationVector();
    return (new THREE.Vector3(
        translation.x * KIMCHI.config.get('controlsStrafeSpeed'),
        translation.y * KIMCHI.config.get('controlsStrafeSpeed'),
        translation.z * KIMCHI.config.get('controlsZSpeed')
      )).length() * flight.getTranslationSpeedMultiplier() / delta;
  };



  return KIMCHI;
}(KIMCHI || {}, _, jQuery, THREE));