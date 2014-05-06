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
var KIMCHI = (function (KIMCHI, _, Q, THREE) {
  'use strict';

  var flight, Mode, mode, willCollide, getDirection;

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

    KIMCHI.keyboardControls.enable();
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
    KIMCHI.keyboardControls.disable();
  };

  /**
   * @memberOf module:KIMCHI.flight.modes.pointerLock
   */
  mode.animationFrame = function (delta) {
    var self = this;

    // PointerLockControls: move the camera
    KIMCHI.pointerLockControls.move(function (movement) {
      return true;
    });

    // KeyboardControls: move the camera, but only if it won't be in collision
    KIMCHI.keyboardControls.move(function (movement) {
      // scale the translation speed
      movement.translationVector.multiplyScalar(
        delta * flight.getTranslationSpeedMultiplier()
      );

      if (!flight.willCollide(movement.translationVector)) {
        self.speed = movement.translationVector.length() / delta;
        return true; // move
      } else {
        return false; // don't move
      }
    });

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
      } else if (flight.getModeName() === 'pointerLock') { // disabling
        // This is the case when the user has exited pointer lock directly [by
        // pressing Esc or through other means]. In the other cases, the user
        // has changed to another flight mode directly.
        KIMCHI.flight.setMode('orbit');
      }
    });
  };



  return KIMCHI;
}(KIMCHI || {}, _, Q, THREE));