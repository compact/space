/**
 * Contains the different flight modes, the Mode class instantiated by them,
 *   and general flight functions such as speed functions.
 * @namespace flight
 * @memberOf  module:KIMCHI
 */
var KIMCHI = (function (KIMCHI) {
  'use strict';

  var flight = {}, currentModeName;

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
  currentModeName = '';

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
    flight.modes.orbit.init();
    flight.modes.pointerLock.init();
    flight.setMode('orbit');
  };

  /**
   * @returns  {String|Boolean}
   * @memberOf module:KIMCHI.flight
   */
  flight.getModeName = function () {
    return currentModeName;
  };

  /**
   * @param    {String|Boolean}
   * @return   {Mode}           The Mode being set.
   * @memberOf module:KIMCHI.flight
   */
  flight.setMode = function (name) {
    var prevName = currentModeName;

    if (prevName !== name) {
      // disable the previous mode
      if (typeof flight.modes[prevName] === 'object') {
        // on the first call, there is no previous mode
        flight.modes[prevName].disable();
      }

      // enable the new mode
      flight.modes[name].enable();
      currentModeName = name;

      // trigger an event
      KIMCHI.trigger('modeChanged', name);

      console.log('.flight: mode changed ' +
        (prevName ? 'from ' + prevName + ' ': '') + 'to ' + name);
    }

    return flight.modes[name];
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
    return flight.modes[currentModeName].speed;
  };

  /**
   * Helper function used in animationFrame() of the pointer lock and orbit
   *   modes.
   * @returns  {Promise} Resolves as true only.
   * @memberOf module:KIMCHI.flight
   */
  flight.updateSpaceTime = (function () {
    var frameCounter = 0;

    return function (delta) {
      // resolve true or false to continue or stop animating
      var deferred = Q.defer();

      frameCounter++;
      // if framesPerDay > 1, Bodies are not to be moved until that many frames
      // have passed
      if (frameCounter % KIMCHI.config.get('framesPerDay') === 0) {
        // increment the current time
        KIMCHI.time.increment().then(function () {
          // move the Bodies to their new positions
          KIMCHI.space.translateBodies(delta);

          // move the Bodies' orbits accordingly
          KIMCHI.space.updateOrbits();

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

      return deferred.promise;
    }
  }());

  return KIMCHI;
}(KIMCHI || {}));
