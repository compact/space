/**
 * Contains astronomical bodies, which are represented by instances of the
 *   {@link Body} class, and their associated THREE.Object3D objects. Include
 *   data/kimchi.space.bodies.js before this script
 * @namespace space
 * @memberOf  module:KIMCHI
 */
var KIMCHI = (function (KIMCHI, _) {
  'use strict';

  var space, bodies;
  if (typeof KIMCHI.space === 'object') {
    space = KIMCHI.space;
  } else {
    space = {};
    KIMCHI.space = space;
  }

  /**
   * Contains instances of Body.
   * @memberOf module:KIMCHI.space
   */
  bodies = {};
  space.bodies = bodies;



  /**
   * Populate the private bodies object.
   * @memberOf module:KIMCHI.space
   */
  space.init = function () {
    _.each(space.data, function (options) {
      bodies[options.name] = new space.Body(options);
    });
  };



  /**
   * TODO check bodies[name] actually exists
   * @param    {String} name
   * @returns  {Body}
   * @memberOf module:KIMCHI.space
   */
  space.getBody = function (name) {
    return bodies[name];
  };

  /**
   * Each Body may have more than one Object3D, e.g. for orbit lines. The
   *   parameter can be used to restrict the array returned.
   * @param    {String} [type]
   * @returns  {Array}  Object3Ds from the Bodies.
   * @memberOf module:KIMCHI.space
   */
  space.getObject3Ds = function (type) {
    var object3Ds = _.pluck(bodies, 'object3Ds');
    if (typeof type === 'undefined') {
      // flatten the nested object
      return _.reduce(object3Ds, function (allObject3Ds, bodyObject3Ds) {
        return allObject3Ds.concat(_.values(bodyObject3Ds));
      }, []);
    } else {
      return _.filter(_.pluck(object3Ds, type));
    }
  };

  /**
   * @returns  {Array} Object3Ds of Bodies set to be collideable with the
   *   camera.
   * @memberOf module:KIMCHI.space
   */
  space.getCollideableObject3Ds = function () {
    return _(bodies).filter('collideable').pluck('object3Ds').pluck('main')
      .valueOf();
  };

  /**
   * @returns {Object} Bodies with names as keys.
   * @memberOf module:KIMCHI.space
   */
  space.getCollideableBodies = function () {
    // _.filter(bodies, 'collideable') returns an Array, not an Object with keys
    var collideableBodies = {};
    _.each(bodies, function (body, name) {
      if (body.collideable) {
        collideableBodies[name] = body;
      }
    });
    return collideableBodies;
  };



  /**
   * Translate the Bodies. Does not move their children.
   * @memberOf module:KIMCHI.space
   */
  space.translateBodies = function (delta) {
    _.each(bodies, function (body) {
      body.translate(delta);
    });
  };

  /**
   * Rotate the Bodies.
   * @memberOf module:KIMCHI.space
   */
  space.rotateBodies = function (delta) {
    _.each(bodies, function (body) {
      body.rotate(delta);
    });
  };



  /**
   * Create the orbits of all Bodies that have orbits.
   * @memberOf module:KIMCHI.space
   */
  space.createOrbits = function () {
    _.each(bodies, function (body) {
      if (body.hasOrbitLine) {
        body.orbit = new space.Orbit({
          'name': body.name,
          'orbitalPeriod': body.orbitalPeriod
        });
        body.object3Ds.orbit = body.orbit.line;
      }
    });
  };

  /**
   * Move the orbits. This method should be called whenever the Bodies move.
   * @memberOf module:KIMCHI.space
   */
  space.updateOrbits = function () {
    if (KIMCHI.config.get('daysPerSecond') > 0) {
      _.each(bodies, function (body) {
        if (body.hasOrbitLine) {
          body.orbit.update();
        }
      });
    }
  };



  /**
   * @param    {Object} [bodies]
   * @returns  {Array}  Objects with keys 'name' and 'distance', with the latter
   *   being the distance between the camera and the Body.
   * @memberOf module:KIMCHI.space
   */
  space.getDistances = function (bodies) {
    if (typeof bodies === 'undefined') {
      bodies = KIMCHI.space.bodies;
    }

    return _.map(bodies, function (body, name) {
      return {
        'name': name,
        'distance': body.getDistance(KIMCHI.camera)
      };
    });
  };

  /**
   * @param    {Object} [bodies]
   * @returns  {Array}  Objects with keys 'name' and 'distance', with the
   *   latter being the distance between the camera and the Body. Sorted
   *   ascending.
   * @memberOf module:KIMCHI.space
   */
  space.getSortedDistances = function (bodies) {
    return space.getDistances(bodies).sort(function (body1, body2) {
      return body1.distance - body2.distance;
    });
  };

  /**
   * @param    {Object} [bodies]
   * @returns  {Number} The distance to the closest Body Mesh.
   * @memberOf module:KIMCHI.space
   */
  space.getClosestDistance = function (bodies) {
    return KIMCHI.space.getSortedDistances(bodies)[0].distance;
  };



  return KIMCHI;
}(KIMCHI || {}, _));
