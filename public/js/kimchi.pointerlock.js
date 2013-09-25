/**
 * Pointer lock state (not controls, which are handled by three.controls.js).
 * @namespace pointerLock
 * @memberOf  module:KIMCHI
 */
var KIMCHI = (function (KIMCHI) {
  'use strict';

  var pointerLock = {}, requestPointerLock;
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

    // check whether pointer lock is enabled
    havePointerLock = 'pointerLockElement' in document ||
      'mozPointerLockElement' in document ||
      'webkitPointerLockElement' in document;
    if (!havePointerLock) {
      // TODO we can use FirstPersonControls here instead
      KIMCHI.ui.notice.set(KIMCHI.config['notices-pointer-lock-not-supported']);
      return;
    }

    body = document.body;

    /**
     * The browser's requestPointerLock function, used in request().
     * @private
     * @memberOf module:KIMCHI.pointerLock
     */
    requestPointerLock = body.requestPointerLock ||
      body.mozRequestPointerLock || body.webkitRequestPointerLock;

    // bind pointer lock change and error handlers
    change = function (event) {
      var on = document.pointerLockElement === body ||
        document.mozPointerLockElement === body ||
        document.webkitPointerLockElement === body;

      if (on) {
        KIMCHI.flight.setMode('free');
      } else if (KIMCHI.flight.getMode() === 'free') {
        KIMCHI.flight.setMode('menu');
      }
    };
    document.addEventListener('pointerlockchange', change, false);
    document.addEventListener('mozpointerlockchange', change, false);
    document.addEventListener('webkitpointerlockchange', change, false);

    error = function (event) {
      console.log('pointerlockerror:');
      console.log(event);
    };
    document.addEventListener('pointerlockerror', error, false);
    document.addEventListener('mozpointerlockerror', error, false);
    document.addEventListener('webkitpointerlockerror', error, false);
  };



  return KIMCHI;
}(KIMCHI || {}));