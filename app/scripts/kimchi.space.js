/**
 * Contains astronomical bodies, which are represented by instances of the
 *   {@link Body} class, and their associated THREE.Object3D objects. Include
 *   data/kimchi.space.bodies.js before this script
 * @namespace space
 * @memberOf  module:KIMCHI
 */
var KIMCHI = (function (KIMCHI, _, $, THREE) {
  'use strict';

  var space, Body, bodies;
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
   * Each Body may have more than one Object3D, e.g. for orbit lines and text
   *   labels. The parameter can be used to restrict the array returned.
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
   *   TODO: In the future, for optimization, consider first storing the
   *   ephemeris batch array element in one variable for all bodies.
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
   * Without moving the Body Meshes themselves, update the visibility,
   *   position, and size of all Object3Ds associated with the Bodies (such as
   *   text label Meshes). This function should be called whenever the camera
   *   moves. TODO: Use delta.
   * @memberOf module:KIMCHI.space
   */
  space.updateBodyChildren = function () {
    _.each(bodies, function (body) {
      var bodyDistance, label, labelDistance, labelLocalLength,
        labelLocalVector, labelWorldVector;

      // update the text label Mesh
      if (KIMCHI.config.get('showLabels')) {
        bodyDistance = THREE.Object3D.getDistance(KIMCHI.camera, body.object3Ds.main);
        label = body.object3Ds.label;

        if (bodyDistance > body.labelVisibleDistance) {
          label.visible = false;
        } else {
          label.visible = true;

          // rotate to face the camera
          label.quaternion.copy(KIMCHI.camera.quaternion.clone());

          // distance between the label to the camera
          labelDistance = (bodyDistance - body.getScaledRadius()) / 2;
          // distance between the center of the Body Mesh and the label
          labelLocalLength = labelDistance + body.getScaledRadius();
          // vector from the center of the Body Mesh to the label
          labelLocalVector = KIMCHI.camera.position.clone()
            .sub(body.object3Ds.main.position).setLength(labelLocalLength);
          // vector from the origin of the world to the label
          labelWorldVector = body.object3Ds.main.position.clone()
            .add(labelLocalVector);
          // move it in front of the Body Mesh so it's not hidden inside
          label.position.copy(labelWorldVector);

          // scale
          label.scale.setXYZ(labelDistance / 1000);
        }
      }
    });
  };



  /**fly-
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
        'distance': THREE.Object3D.getDistance(KIMCHI.camera, body.object3Ds.main)
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
}(KIMCHI || {}, _, jQuery, THREE));