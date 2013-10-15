/**
 * Contains the different flight modes, the Mode class instantiated by them,
 *   and general flight functions such as speed functions.
 * @namespace flight
 * @memberOf  module:KIMCHI
 */
var KIMCHI = (function (KIMCHI) {
  'use strict';

  var flight = {}, currentMode;
  if (typeof KIMCHI.flight === 'object') {
    flight = KIMCHI.flight;
  } else {
    flight = {};
    KIMCHI.flight = flight;
  }

  /**
   * The current flight mode.
   * @private
   * @memberOf module:KIMCHI.flight
   */
  currentMode = '';

  /**
   * The available flight modes, each an instance of {@link Mode}.
   * @namespace modes
   * @memberOf  module:KIMCHI.flight
   */
  flight.modes = {};

  /**
   * Any init() functions from the flight modes can be called here. Set the
   *   initial flight mode.
   * @memberOf module:KIMCHI.flight
   */
  flight.init = function () {
    flight.modes.pointerLock.init();
    flight.setMode('menu');
  };

  /**
   * @returns  {String|Boolean}
   * @memberOf module:KIMCHI.flight
   */
  flight.getMode = function () {
    return currentMode;
  };

  /**
   * @param    {String|Boolean}
   * @memberOf module:KIMCHI.flight
   */
  flight.setMode = function (name) {
    var prevName = currentMode;

    if (prevName === name) {
      // the given mode is already the current mode; do nothing
      return;
    }

    if (typeof flight.modes[prevName] === 'object') {
      // on the first call to setMode(), there is no previous mode
      flight.modes[prevName].disable();
    }
    flight.modes[name].enable();
    currentMode = name;

    console.log('.flight: mode changed ' +
      (prevName ? 'from ' + prevName + ' ': '') + 'to ' + name);
  };

  /**
   * Return a number for scaling the camera translation speed (in every
   *   direction) depending on how close the camera is to the closest of the
   *   given collideable Bodies; if not given, consider all collideable Bodies.
   * @param    {Array}  [bodies]
   * @returns  {Number}
   * @memberOf module:KIMCHI.flight
   */
  flight.getTranslationSpeedMultiplier = function (bodies) {
    if (typeof bodies === 'undefined') {
      bodies = KIMCHI.space.getCollideableBodies();
    }

    return KIMCHI.space.getClosestDistance(bodies);
  };

  /**
   * @returns  {THREE.Vector3} The current translation speed of the camera.
   * @memberOf module:KIMCHI.flight
   */
  flight.getSpeed = function () {
    return flight.modes[currentMode].speed;
  };

  /**
   * Helper function used in animationFrame() of the pointer lock and orbit
   *   modes.
   * @returns {Promise} [description]
   */
  flight.updateSpaceTime = function (delta) {
    // resolve true or false to continue or stop animating
    var deferred = Q.defer();

    // increment the current time and move the Bodies
    if (KIMCHI.config.get('bodiesSpeed')) {
      KIMCHI.time.increment().then(function () {
        KIMCHI.space.translateBodies(delta);
        deferred.resolve(true);
        // we don't resolve false in a rejection handler because we don't want
        // the controls to end even when time cannot be incremented
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

    return deferred.promise;
  };

  return KIMCHI;
}(KIMCHI || {}));