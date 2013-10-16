/**
 * Pointer lock flight mode. Instance of {@link
 *   module:KIMCHI.flight.Mode|Mode}. The user can move the camera with the
 *   mouse and keyboard using {@link
 *   external:THREE.PointerLockControls|THREE.PointerLockControls}. The cursor
 *   is locked to the screen and not visible. <br> The pointer lock API is not
 *   handled here, but rather in {@link
 *   module:KIMCHI.pointerLock|KIMCHI.pointerLock}.
 * @namespace pointerLock
 * @memberOf  module:KIMCHI.flight.modes
 */
var KIMCHI = (function (KIMCHI, _, Q, $, THREE) {
  'use strict';

  var flight, Mode, mode, cameraMovement, cameraWillCollide, getDirection;

  flight = KIMCHI.flight;
  Mode = flight.Mode;
  mode = new Mode('pointerLock');
  KIMCHI.flight.modes.pointerLock = mode;



  /**
   * @memberOf module:KIMCHI.flight.modes.pointerLock
   */
  mode.enable = function () {
    Mode.prototype.enable.call(this);

    KIMCHI.pointerLock.request();
    // See the handler in init() for what happens after this request is
    // successful.
  };

  /**
   * @memberOf module:KIMCHI.flight.modes.pointerLock
   */
  mode.disable = function () {
    Mode.prototype.disable.call(this);

    // When the user exits pointer lock directly by pressing Esc or through
    // other means, this call is unnecessary; in fact, that exit triggers this
    // function, disable(). In other cases, when the user disables pointer lock
    // flight by pressing a key, this call is necessary.
    KIMCHI.pointerLock.exit();

    KIMCHI.pointerLockControls.disable();
  };

  /**
   * @memberOf module:KIMCHI.flight.modes.pointerLock
   */
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
   * Bind the pointer lock handler for when pointer lock flight gets enabled or
   *   disabled.
   * @memberOf module:KIMCHI.flight.modes.pointerLock
   */
  mode.init = function () {
    KIMCHI.pointerLock.on('change', function (pointerLocked) {
      if (pointerLocked) { // enabling
        KIMCHI.pointerLockControls.enable();
      } else if (flight.getMode() === 'pointerLock') { // disabling
        // This is the case when the user has exited pointer lock directly [by
        // pressing Esc or through other means]. In the other cases, the user
        // has changed to another flight mode directly.
        KIMCHI.flight.setMode('menu');
      }
    });
  };



  /**
   *
   * @param    {THREE.Vector3} translationVector From {@link
   *   external:THREE.PointerLockControls#moveCamera|THREE.PointerLockControls#moveCamera}.
   * @returns  {Boolean}       If the camera is to translate with the given
   *   vector, whether it will be within the collision distance of any Body.
   * @private
   * @function
   * @memberOf module:KIMCHI.flight.modes.pointerLock
   */
  cameraWillCollide = (function () {
    var willCollide, raycaster, cameraPosition, translationDirection,
      intersects, body;

    raycaster = new THREE.Raycaster();
    // the default precision, 0.0001, is not low enough for our 1x scale
    // TODO: consider basing precision on the scale config value
    raycaster.precision = 0.000001;

    // these two Vector3s are passed into the raycaster
    cameraPosition = new THREE.Vector3();

    return function (translationVector) {
      if (translationVector.length() === 0) {
        // not translating, so won't be colliding
        return false;
      }

      willCollide = false;

      cameraPosition.copy(KIMCHI.camera.position);
      translationDirection = getDirection(cameraPosition, translationVector);
      raycaster.set(cameraPosition, translationDirection);

      // get all Object3Ds in the direction of translation
      intersects = raycaster.intersectObjects(
        KIMCHI.space.getCollideableObject3Ds()
      );

      if (intersects.length === 0) {
        // no Object3Ds, so won't be colliding
        return false;
      }

      // check whether each Body corresponding to the Object3Ds is within
      // collision distance
      _.each(intersects, function (intersect) {
        body = KIMCHI.space.getBody(intersect.object.name);
        // console.log(intersect.distance, body.getCollisionDistance(), translationDirection);
        if (intersect.distance < body.getCollisionDistance()) {
          willCollide = true;
          return false; // break the loop
        }
      });
      return willCollide;
    };
  }());

  /**
   * This function is written generally, but it is currently used only as a
   *   helper for cameraWillCollide(). Can be moved into
   *   THREE.Vector3.prototype if needed elsewhere.
   * @param   {THREE.Vector3} startingPosition
   * @param   {THREE.Vector3} localVector A vector local to startingPosition.
   * @returns {THREE.Vector3} A normalized world direction vector for
   *   localVector.
   * @private
   * @function
   * @memberOf module:KIMCHI.flight.modes.pointerLock
   */
  getDirection = (function () {
    var direction = new THREE.Vector3();

    return function (startingPosition, localVector) {
      // local vector from the camera
      direction.copy(localVector);
      // set the two vectors to have equal lengths for accuracy; if one is
      // much longer than the other, errors arise
      direction.setLength(startingPosition.length());
      // world vector from the origin to the endpoint of the local vector
      KIMCHI.camera.localToWorld(direction);
      // world direction vector
      direction.sub(startingPosition);
      // the Raycaster direction should be normalized, according to
      // https://github.com/mrdoob/three.js/blob/master/src/core/Raycaster.js
      direction.normalize();

      return direction;
    };
  }());



  return KIMCHI;
}(KIMCHI || {}, _, Q, jQuery, THREE));