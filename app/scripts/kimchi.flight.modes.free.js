/**
 * Free, user-controlled flight.
 * @namespace free
 * @memberOf  module:KIMCHI.flight.modes
 */
var KIMCHI = (function (KIMCHI, _, Q, $, THREE) {
  'use strict';

  var flight, Mode, mode, cameraMovement, cameraWillCollide, getSpeed;



  flight = KIMCHI.flight;
  Mode = flight.Mode;
  mode = new Mode('free');
  KIMCHI.flight.modes.free = mode;

  mode.enable = function () {
    Mode.prototype.enable.call(this);

    KIMCHI.pointerLock.request();
    // See the handler in init() for what happens after this request is
    // successful.
  };

  mode.disable = function () {
    Mode.prototype.disable.call(this);

    // When the user exits pointer lock directly by pressing Esc or through
    // other means, this call is unnecessary; in fact, that exit triggers this
    // function, disable(). In other cases, when the user disables free flight
    // by pressing a key, this call is necessary.
    KIMCHI.pointerLock.exit();

    KIMCHI.pointerLockControls.disable();
    $('#hud1').hide();
  };

  mode.animationFrame = function (delta) {
    // move the Camera
    cameraMovement = KIMCHI.pointerLockControls.getCameraMovement(
      delta * flight.getTranslationSpeedMultiplier());
    if (!cameraWillCollide(cameraMovement.translationVector)) {
      KIMCHI.pointerLockControls.moveCamera(cameraMovement);
      this.speed = cameraMovement.translationVector.length() / delta;
    }

    return flight.updateSpaceTime(delta);
  };

  /**
   * Bind the pointer lock handler for when free flight gets enabled or
   *   disabled.
   * @memberOf module:KIMCHI.flight.modes.free
   */
  mode.init = function () {
    KIMCHI.pointerLock.on('change', function (pointerLocked) {
      if (pointerLocked) { // enabling
        $('#hud1').show();
        KIMCHI.pointerLockControls.enable();
      } else if (flight.getMode() === 'free') { // disabling
        // This is the case when the user has exited pointer lock directly [by
        // pressing Esc or through other means]. In the other cases, the user
        // has changed to another flight mode directly.
        KIMCHI.flight.setMode('menu');
      }
    });
  };



  /**
   * @returns  {Boolean} If the camera is to translate with the given vector,
   *   whether it will be within the collision distance of any Body.
   * @private
   * @memberOf module:KIMCHI.flight.modes.free
   */
  cameraWillCollide = (function () {
    var willCollide, raycaster, cameraPosition, translationDirection,
      intersects, body;

    raycaster = new THREE.Raycaster();
    // the default precision, 0.0001, is not low enough for our 1x scale
    // TODO: consider basing precision on the scale config value
    raycaster.precision = 0.000001;

    // use these to avoid having to create new clones every call
    cameraPosition = new THREE.Vector3();
    translationDirection = new THREE.Vector3();

    return function (translationVector) {
      if (translationVector.length() === 0) {
        // not translating, so won't be colliding
        return false;
      }

      cameraPosition.copy(KIMCHI.camera.position);
      translationDirection.copy(translationVector).normalize(); // local
      KIMCHI.camera.localToWorld(translationDirection).normalize(); // world

      // the Raycaster direction should be normalized, according to
      // https://github.com/mrdoob/three.js/blob/master/src/core/Raycaster.js
      raycaster.set(cameraPosition, translationDirection);

      // get all Object3Ds in the direction of translation
      intersects = raycaster.intersectObjects(
        KIMCHI.space.getCollideableObject3Ds()
      );

      if (intersects.length === 0) {
        // no Object3Ds, so won't be colliding
        return false;
      }

      willCollide = false;
      // check whether each Body corresponding to the Object3Ds is within
      // collision distance
      _.each(intersects, function (intersect) {
        body = KIMCHI.space.getBody(intersect.object.name);
        if (intersect.distance < body.getCollisionDistance()) {
          // console.log(intersect.distance, body.getCollisionDistance());
          willCollide = true;
          return false; // break the loop
        }
      });
      return willCollide;
    };
  }());



  return KIMCHI;
}(KIMCHI || {}, _, Q, jQuery, THREE));