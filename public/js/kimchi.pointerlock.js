/**
 * Pointer lock state (not controls, which are handled by three.controls.js).
 * @namespace pointerLock
 * @memberOf  module:KIMCHI
 */
var KIMCHI = (function (KIMCHI, $) {
  'use strict';

  var pointerLock = {}, requestPointerLock, bind, keydown, click;
  KIMCHI.pointerLock = pointerLock;



  /**
   * Request pointer lock from the browser. This is called whenever the user
   *   enters free flight mode.
   * @memberOf module:KIMCHI.pointerLock
   */
  pointerLock.request = function () {
    requestPointerLock.call(document.body);
    console.log('pointer lock requested');
  };

  /**
   * Has to be called once, before any pointer lock requests.
   * @memberOf module:KIMCHI.pointerLock
   */
  pointerLock.init = function () {
    var havePointerLock, body, change, error;

    havePointerLock = 'pointerLockElement' in document ||
      'mozPointerLockElement' in document ||
      'webkitPointerLockElement' in document;
    if (!havePointerLock) {
      // TODO we can use FirstPersonControls here instead
      KIMCHI.ui.notice.set(KIMCHI.config.notices.pointerLockNotSupported);
      return;
    }

    body = document.body;

    /**
     * The browser's requestPointerLock function, used in request().
     * @memberOf module:KIMCHI.pointerLock
     * @private
     * @function
     */
    requestPointerLock = body.requestPointerLock ||
      body.mozRequestPointerLock || body.webkitRequestPointerLock;

    change = function () {
      var on = document.pointerLockElement === body ||
        document.mozPointerLockElement === body ||
        document.webkitPointerLockElement === body;
      bind(on);
      KIMCHI.flight.free.toggle(on);
    };
    document.addEventListener('pointerlockchange', change, false);
    document.addEventListener('mozpointerlockchange', change, false);
    document.addEventListener('webkitpointerlockchange', change, false);

    error = function (event) {
      console.log('Pointer Lock error:');
      console.log(event);
    };
    document.addEventListener('pointerlockerror', error, false);
    document.addEventListener('mozpointerlockerror', error, false);
    document.addEventListener('webkitpointerlockerror', error, false);

    // the initial flight state is false, so bind the relevant event handlers
    KIMCHI.$overlay.on('click', '#continue-flying', pointerLock.request);
    bind(false);
  };



  /**
   * Bind or unbind the event handlers for triggering the request of pointer
   *   lock.
   * @memberOf module:KIMCHI.pointerLock
   */
  bind = function (on) {
    if (on) {
      KIMCHI.$document.off('keydown', keydown);
    } else {
      KIMCHI.$document.on('keydown', keydown);
    }
  };

  /**
   * The event handler for pressing Escape to request pointer lock. We request
   *   pointer lock only on keyup; otherwise, the continued Escape keydown
   *   event causes the pointer lock to disable immediately, even if one lets
   *   go of the Escape key asap. Also, the flag keydownInProgress prevents
   *   multiple handlers of .one('keyup') from being binded.
   * @memberOf module:KIMCHI.pointerLock
   */
  keydown = (function () {
    var keydownInProgress = false;

    return function (event) {
      if (event.which === 27) { // Esc
        keydownInProgress = true;
        $(this).one('keyup', function (event) {
          if (event.which === 27 && keydownInProgress) {
            pointerLock.request();
            keydownInProgress = false;
          }
        });
      }
    };
  }());



  return KIMCHI;
}(KIMCHI || {}, jQuery));