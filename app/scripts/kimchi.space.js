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
  space = KIMCHI.space;

//  var jsonLoader = new THREE.JSONLoader();



  /**
   * Contains instances of Body.
   * @private
   * @memberOf module:KIMCHI.space
   */
  bodies = {};



  /**
   * Class for astronomical bodies. All spheres for now. Can only be
   *   constructed inside kimchi.space.js. Raw data for each Body is stored in
   *   /json/kimchi.space.bodies.json for passing into this constructor.
   * @param {Object} options Options.
   * <br> name:
   *        Required. Displayed to users.
   * <br> radiusInKm:
   *        In km.
   * <br> rotation:
   *        Vector3 of the body's initial Euler rotation.
   * <br> labelVisibleDistance:
   *        How far away the text mesh remains visible.
   * <br> mesh:
   *        Optional. If not given, a Mesh is automatically generated.
   * <br> translate:
   *        Optional. Translate the Mesh, e.g. for orbit.
   * <br> rotate:
   *        Optional. Rotate the Mesh.
   * <br> texturePath:
   *        Optional path to the texture image. Defaults to 'name.jpg'.
   * @constructor Body
   */
  Body = function (options) {
    var geometry, material, length, curve;

    // further default options appear below in the prototype
    _.assign(this, options);

    // contains all THREE.Object3D objects belonging to this Body
    this.object3Ds = {};

    // convert the radius back to au (it is stored in km for convenience)
    this.radius = this.radiusInKm / KIMCHI.constants.kmPerAu;

    // geometry
    geometry = new THREE.SphereGeometry(this.radius,
      KIMCHI.config.get('sphere-segments'),
      KIMCHI.config.get('sphere-segments'));

    // material
    material = new THREE.MeshPhongMaterial({
      'map': THREE.ImageUtils.loadTexture(this.getTexturePath())
    });
    if (this.hasBumpMap) {
      material.bumpMap = THREE.ImageUtils.loadTexture(this.getTexturePath('bump'));
      material.bumpScale = 0.003;
    }
    if (this.hasSpecularMap) {
      material.specularMap = THREE.ImageUtils.loadTexture(this.getTexturePath('specular'));
      material.specular = new THREE.Color('grey');
    }

    // create a Mesh for the Body
    this.object3Ds.main = new THREE.Mesh(geometry, material);

    // store the name in the Mesh, so in situations where we are given the Mesh
    // only, the Body can be identified using space.getBody()
    this.object3Ds.main.name = this.name;

    // set Mesh properties
//    this.object3Ds.main.rotation.copy(this.rotation);
    this.setScale();

    // position the Mesh
    this.translate();

    // create a Curve for the orbit, which can be used to create a Line
    length = this.object3Ds.main.position.length();
    // clockwise
    curve = new THREE.EllipseCurve(0, 0, length, length, 0, 2 * Math.PI);
    this.object3Ds.orbit = curve.createLine({
      'color': KIMCHI.config.get('orbits-color'),
      'opacity': KIMCHI.config.get('orbits-opacity'),
      'lineSegments': KIMCHI.config.get('orbits-line-segments')
    });

    /***
     * Create a Mesh for the text label. We could do
     *   this.object3Ds.main.add(this.object3Ds.label);
     * but then the text Mesh rotates with the body and it is nontrivial to
     * rotate it back.
     */
    this.object3Ds.label = new THREE.Mesh(
      new THREE.TextGeometry(this.name, {
        'size': 10,
        'height': 0.1,
        'curveSegments': 10,
        'font': 'helvetiker',
        'bevelEnabled': true,
        'bevelThickness': 0.5,
        'bevelSize': 0.5
      }),
      new THREE.MeshBasicMaterial({
        'color': 0xeeeeff
      })
    );
  };

  // default values
  Body.prototype.name = '';
  Body.prototype.radiusInKm = 0;
  Body.prototype.initialPositionArray = [3, 3, 0];
  Body.prototype.collideable = true;
  Body.prototype.labelVisibleDistance = 100;
  Body.prototype.hasBumpMap = false;
  Body.prototype.hasSpecularMap = false;

  Body.prototype.getTexturePath = function (type) {
    type = typeof type === 'undefined' ? '' : '-' + type;
    return 'images/textures/' + this.name.toLowerCase() + type + '.jpg';
  };

  /**
   * Set this Body's scale.
   * @param    {Number|String} value See the config setting 'scales-size' for
   *   allowed values. If value is not given, use the current config value.
   * @memberOf Body
   */
  Body.prototype.setScale = function (value) {
    if (typeof value === 'undefined') {
      value = KIMCHI.config.get('scales-size');
    }
    if (value === 'large') {
      value = 0.1 / this.radius;
    }
    this.object3Ds.main.scale.setXYZ(value);
  };

  /**
   * Bodies do not translate by default; this function can be overwritten for
   *   any Body object.
   * @param    {Number} delta
   * @memberOf Body
   */
  Body.prototype.translate = function () {
    this.scalePositionFromArray(
      KIMCHI.ephemeris.getCurrentPosition(this.ephemerisIndex));
  };

  /**
   * @param    {Array}  Array because this function gets called only with
   *   ephemeris data.
   * @memberOf Body
   */
  Body.prototype.scalePositionFromArray = function (position) {
    // first set the position from the parameter, then scale it
    this.object3Ds.main.position.fromArray(position)
      .multiplyScalar(KIMCHI.config.get('scales-position'));
    // TODO implement scales-position
  };

  /**
   * Rotate this Body. Overwriting this function is optional.
   * @param    {Number} delta
   * @memberOf Body
   */
  Body.prototype.rotate = function () {
    // TODO remove this placeholder
    this.object3Ds.main.rotateOnAxis((new THREE.Vector3(-1, -0.5, 0.2)).normalize(), 0.2);
  };

  /**
   * @returns  {Number} The radius of this Body in its current scale.
   * @memberOf Body
   */
  Body.prototype.getScaledRadius = function () {
    // This is the most general calculation.
    // this.radius * KIMCHI.config.get('scales-size') works for all cases except
    // when KIMCHI.config.get('scales-size') === 'large'
    return this.radius * this.object3Ds.main.scale.x;
  };

  /**
   * @returns  {Number} The collision distance between the camera and this Body.
   * @memberOf Body
   */
  Body.prototype.getCollisionDistance = function () {
    return this.getScaledRadius();
  };

  /**
   * @returns  {Number} The distance between the given Object3D and the closest
   *   surface of this Body.
   * @memberOf Body
   */
  Body.prototype.getSurfaceDistance = function (object3D) {
    return THREE.Object3D.getDistance(this.object3Ds.main, object3D) -
      this.getScaledRadius();
  };

  /**
   * @returns  {Number} Whether this Body is current in collision with the
   *   given objects
   * @memberOf Body
   */
  Body.prototype.isColliding = function (object3D) {
    return this.getSurfaceDistance(object3D) < this.getCollisionDistance();
  };



  /**
   * Populate the private bodies object.
   * @params   {Function} callback Optional.
   * @memberOf module:KIMCHI.space
   */
  space.init = function (callback) {
    // get the ephemeris data
    KIMCHI.ephemeris.loadBatch(KIMCHI.time.getJulian()).done(function () {
      // construct the Bodies
      _.each(space.data, function (options) {
        bodies[options.name] = new Body(options);
      });

      // initialize Body children positions and scales for rendering
      space.updateBodyChildren();

      // optional callback
      if (typeof callback === 'function') {
        callback.call(space);
      }
    });
  };

  /**
   * @returns  {Object} Bodies.
   * @memberOf module:KIMCHI.space
   */
  space.getBodies = function () {
    return bodies;
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
   * @param    {String} type Optional.
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
      return _.pluck(object3Ds, type);
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
   *   TODO: Use delta.
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
   * Rotate the Bodies. TODO: Use delta.
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
      var distance;

      // move the text label Mesh
      if (KIMCHI.config.get('show-labels')) {
        distance = THREE.Object3D.getDistance(KIMCHI.camera, body.object3Ds.main);

        if (distance > body.labelVisibleDistance) {
          body.object3Ds.label.visible = false;
        } else {
          body.object3Ds.label.visible = true;

          // scale
          body.object3Ds.label.scale.setXYZ(distance / 1000);

          // the text Mesh always faces the camera
          body.object3Ds.label.quaternion.copy(KIMCHI.camera.quaternion.clone());

          // move it in front of the associated mesh so it's not hidden inside
          body.object3Ds.label.geometry.computeBoundingSphere();
          var v = KIMCHI.camera.position.clone().sub(body.object3Ds.main.position)
            .normalize().multiplyScalar(body.getScaledRadius() * 1.1);
          var w = body.object3Ds.main.position.clone().add(v);
/*        var x = body.object3Ds.main.position.clone().cross(v).cross(v)
          .normalize().multiplyScalar(
            body.object3Ds.label.geometry.boundingSphere.radius / 100
          );*/
          body.object3Ds.label.position.copy(w);//.add(x);
        }
      }
    });
  };



  /**fly-
   * @param    {Object} bodies
   * @returns  {Array}  Objects with keys 'name' and 'distance', with the latter
   *   being the distance between the camera and the Body.
   * @memberOf module:KIMCHI.space
   */
  space.getDistances = function (bodies) {
    if (typeof bodies === 'undefined') {
      bodies = KIMCHI.space.getBodies();
    }

    return _.map(bodies, function (body, name) {
      return {
        'name': name,
        'distance': THREE.Object3D.getDistance(KIMCHI.camera, body.object3Ds.main)
      };
    });
/*    return _.each(bodies, function (body, name) {
      distances[name] = THREE.Object3D.getDistance(KIMCHI.camera, body.object3Ds.main);
    });*/
  };

  /**
   * @param    {Object} bodies
   * @returns  {Array} Objects with keys 'name' and 'distance', with the latter
   *   being the distance between the camera and the Body. Sorted ascending.
   * @memberOf module:KIMCHI.space
   */
  space.getSortedDistances = function (bodies) {
    return space.getDistances(bodies).sort(function (body1, body2) {
      return body1.distance - body2.distance;
    });
  };

  /**
   * @param    {Object} bodies
   * @returns  {Number} The distance to the closest Body Mesh.
   * @memberOf module:KIMCHI.space
   */
  space.getClosestDistance = function (bodies) {
    return KIMCHI.space.getSortedDistances(bodies)[0].distance;
  };



  return KIMCHI;
}(KIMCHI || {}, _, jQuery, THREE));