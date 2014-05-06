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

  /**
   * Helper for mode.animationFrame().
   * @param    {THREE.Vector3} translationVector From {@link
   *   external:THREE.PointerLockControls#move|THREE.PointerLockControls#move}.
   * @returns  {Boolean}       If the camera is to translate with the given
   *   vector, whether it will be within the collision distance of any Body.
   * @function
   * @memberOf module:KIMCHI.flight
   */
  flight.willCollide = (function () {
    var willCollide, getDirection, raycaster, cameraPosition,
      translationDirection, intersects, body;

    /**
     * Helper for willCollide(). Can be moved into THREE.Vector3.prototype if
     *   needed elsewhere.
     * @param   {THREE.Vector3} startingPosition
     * @param   {THREE.Vector3} localVector A vector local to startingPosition.
     * @returns {THREE.Vector3} A normalized world direction vector for
     *   localVector.
     * @private
     * @function
     * @memberOf module:KIMCHI.flight
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
        // console.log(intersect.distance, body.getSurfaceCollisionDistance(), translationDirection);
        if (intersect.distance < body.getSurfaceCollisionDistance()) {
          willCollide = true;
          return false; // break the loop
        }
      });
      return willCollide;
    };
  }());

  return KIMCHI;
}(KIMCHI || {}));
