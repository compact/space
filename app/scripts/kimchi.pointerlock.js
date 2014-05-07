/**
 * This module handles the browser's pointer lock state. <br> For the pointer
 *   lock API, see {@link
 *   https://developer.mozilla.org/en-US/docs/WebAPI/Pointer_Lock}. <br> For
 *   the pointer lock flight mode in KIMCHI, see {@link
 *   module:KIMCHI.flight.modes.pointerLock|KIMCHI.flight.modes.pointerLock}.
 *   <br> For the pointer lock controls in KIMCHI, see {@link
 *   external:THREE.PointerLockControls|THREE.PointerLockControls}.
 * @namespace pointerLock
 * @memberOf  module:KIMCHI
 */
var KIMCHI = (function (KIMCHI) {
  'use strict';

  var pointerLock = {}, requestPointerLock, exitPointerLock;
  KIMCHI.pointerLock = pointerLock;



  /**
   * Request pointer lock from the browser.
   * @memberOf module:KIMCHI.pointerLock
   */
  pointerLock.request = function () {
    console.log('.pointerLock: requesting');
    requestPointerLock.call(document.body);
  };

  /**
   * Exit pointer lock.
   * @memberOf module:KIMCHI.pointerLock
   */
  pointerLock.exit = function () {
    console.log('.pointerLock: exiting');
    exitPointerLock.call(document);
  };

  /**
   * Has to be called once, before any pointer lock requests.
   * @memberOf module:KIMCHI.pointerLock
   */
  pointerLock.init = function () {
    var havePointerLock, body, errorHandler;

    // check whether pointer lock is enabled
    havePointerLock = 'pointerLockElement' in document ||
      'mozPointerLockElement' in document ||
      'webkitPointerLockElement' in document;
    if (!havePointerLock) {
      // TODO we can use FirstPersonControls here instead
      KIMCHI.notices.add({
        'message': KIMCHI.config.get('noticePointerLockNotSupported'),
        'type': 'error'
      });
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

    /**
     * The browser's exitPointerLock function, used in exit().
     * @private
     * @memberOf module:KIMCHI.pointerLock
     */
    exitPointerLock = document.exitPointerLock || document.mozExitPointerLock ||
      document.webkitExitPointerLock;

    errorHandler = function (event) {
      // show a notice to the user
      var notice = {
        'message': KIMCHI.config.get('noticePointerLockError'),
        'type': 'error'
      };
      KIMCHI.notices.add(notice);

      // remove the notice when the user changes the flight mode
      KIMCHI.on('modeChanged', function (modeName) {
        if (modeName !== 'pointerLock') {
          KIMCHI.notices.remove(notice);
        }
      });

      // for debugging
      console.warn('.pointerLock: error:', event);
    };

    // bind the error handler
    document.addEventListener('pointerlockerror', errorHandler, false);
    document.addEventListener('mozpointerlockerror', errorHandler, false);
    document.addEventListener('webkitpointerlockerror', errorHandler, false);
  };

  /**
   * @param   {String}   event             'change' or 'error'
   * @param   {Function} handlerGivenState This handler is given a boolean
   *   indicating whether pointer lock is currently enabled.
   * @memberOf module:KIMCHI.pointerLock
   */
  pointerLock.on = function (event, handlerGivenState) {
    var handler = function () {
      var pointerLocked = document.pointerLockElement === document.body ||
        document.mozPointerLockElement === document.body ||
        document.webkitPointerLockElement === document.body;

      handlerGivenState(pointerLocked);
    };

    document.addEventListener('pointerlock' + event, handler, false);
    document.addEventListener('mozpointerlock' + event, handler, false);
    document.addEventListener('webkitpointerlock' + event, handler, false);
  };



  return KIMCHI;
}(KIMCHI || {}));