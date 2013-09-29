/**
 * Contains astronomical bodies, which are represented by instances of the
 *   {@link Body} class, and their associated THREE.Object3D objects.
 * @namespace space
 * @memberOf  module:KIMCHI
 */
var KIMCHI = (function (KIMCHI, _, $, THREE) {
  'use strict';

  var space, Body, bodies;
  space = {};
  KIMCHI.space = space;

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
    var length, curve;

    _.assign(this, { // further default options appear below in the prototype
      'texturePath': 'images/textures/' + options.name.toLowerCase() + '.jpg'
    }, options);

    // convert the radius back to au (it is stored in km for convenience)
    this.radius = this.radiusInKm / KIMCHI.constants.kmPerAu;

    // create a Mesh for the Body
    this.mesh = new THREE.Mesh(
      new THREE.SphereGeometry(this.radius,
        KIMCHI.config.get('sphere-segments'),
        KIMCHI.config.get('sphere-segments')),
      new THREE.MeshLambertMaterial({
        'map': new THREE.ImageUtils.loadTexture(this.texturePath)
      })
    );

    // store the name in the Mesh, so in situations where we are given the Mesh
    // only, the Body can be identified using space.getBody()
    this.mesh.name = this.name;

    // set Mesh properties
//    this.mesh.position.copy(this.position);
//    this.mesh.rotation.copy(this.rotation);
    this.setScale();

    // position the Mesh
    this.translate();

    // create a Curve for the orbit, which can be used to create a Line
    length = this.mesh.position.length();
    // clockwise
    curve = new THREE.EllipseCurve(0, 0, length, length, 0, 2 * Math.PI);
    this.orbitLine = curve.createLine({
      'color': KIMCHI.config.get('orbits-color'),
      'opacity': KIMCHI.config.get('orbits-opacity'),
      'lineSegments': KIMCHI.config.get('orbits-line-segments')
    });

    /***
     * Create a Mesh for the text label. We could do
     *   this.mesh.add(this.labelMesh);
     * but then the text Mesh rotates with the body and it is nontrivial to
     * rotate it back.
     */
    this.labelMesh = new THREE.Mesh(
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
    this.mesh.scale.setXYZ(value);
  };

  /**
   * Bodies do not translate by default; this function can be overwritten for
   *   any Body object.
   * @param    {Number} delta
   * @memberOf Body
   */
  Body.prototype.translate = function () {
    var self = this;
    KIMCHI.ephemeris.getCurrentPosition(this.ephemerisIndex).done(function (position) {
      self.scalePositionFromArray(position);
    });
  };

  /**
   * @param    {Array}  Array because this function gets called only with
   *   ephemeris data.
   * @memberOf Body
   */
  Body.prototype.scalePositionFromArray = function (position) {
    // first set the position from the parameter, then scale it
    this.mesh.position.fromArray(position)
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
    this.mesh.rotateOnAxis((new THREE.Vector3(-1, -0.5, 0.2)).normalize(), 0.2);
  };

  /**
   * @returns  {Number} The radius of this Body in its current scale.
   * @memberOf Body
   */
  Body.prototype.getScaledRadius = function () {
    // This is the most general calculation.
    // this.radius * KIMCHI.config.get('scales-size') works for all cases except
    // when KIMCHI.config.get('scales-size') === 'large'
    return this.radius * this.mesh.scale.x;
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
    return THREE.Object3D.getDistance(this.mesh, object3D) -
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
      // get the bodies data
      $.getJSON('/data/kimchi.space.bodies.json', function (data) {
        // construct the Bodies
        _.each(data, function (options) {
          bodies[options.name] = new Body(options);
        });

        // initialize Body children positions and scales for rendering
        space.moveBodyChildren();

        // optional callback
        if (typeof callback === 'function') {
          callback.call(space);
        }
      });
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
   * @returns  {Array} Meshes from the Bodies.
   * @memberOf module:KIMCHI.space
   */
  space.getMeshes = function () {
    return _.pluck(bodies, 'mesh');
  };

  /**
   * @returns  {Array} Label Meshes from the Bodies.
   * @memberOf module:KIMCHI.space
   */
  space.getLabelMeshes = function () {
    return _.pluck(bodies, 'labelMesh');
  };

  /**
   * @returns  {Array} Orbit Lines from the Bodies.
   * @memberOf module:KIMCHI.space
   */
  space.getOrbitLines = function () {
    return _.pluck(bodies, 'orbitLine');
  };

  /**
   * @returns  {Array} Object3Ds from the Bodies. Note that each Body may have
   *   more than one Object3D, e.g. for orbit lines and text labels.
   * @memberOf module:KIMCHI.space
   */
  space.getObject3Ds = function () {
    var object3Ds = [];
    _.each(bodies, function (body) {
      object3Ds.push(body.mesh, body.orbitLine, body.labelMesh);
    });
    return object3Ds;
  };

  /**
   * @returns  {Array} Object3Ds of Bodies set to be collideable with the
   *   camera.
   * @memberOf module:KIMCHI.space
   */
  space.getCollideableObject3Ds = function () {
    return _.pluck(_.filter(bodies, 'collideable'), 'mesh');
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
  space.moveBodyChildren = function () {
    _.each(bodies, function (body) {
      var distance;

      // move the text label Mesh
      if (KIMCHI.config.get('show-labels')) {
        distance = THREE.Object3D.getDistance(KIMCHI.camera, body.mesh);

        if (distance > body.labelVisibleDistance) {
          body.labelMesh.visible = false;
        } else {
          body.labelMesh.visible = true;

          // scale
          body.labelMesh.scale.setXYZ(distance / 1000);

          // the text Mesh always faces the camera
          body.labelMesh.quaternion.copy(KIMCHI.camera.quaternion.clone());

          // move it in front of the associated mesh so it's not hidden inside
          body.labelMesh.geometry.computeBoundingSphere();
          var v = KIMCHI.camera.position.clone().sub(body.mesh.position)
            .normalize().multiplyScalar(body.getScaledRadius() * 1.1);
          var w = body.mesh.position.clone().add(v);
/*        var x = body.mesh.position.clone().cross(v).cross(v)
          .normalize().multiplyScalar(
            body.labelMesh.geometry.boundingSphere.radius / 100
          );*/
          body.labelMesh.position.copy(w);//.add(x);
        }
      }
    });
  };



  /**
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
        'distance': THREE.Object3D.getDistance(KIMCHI.camera, body.mesh)
      };
    });
/*    return _.each(bodies, function (body, name) {
      distances[name] = THREE.Object3D.getDistance(KIMCHI.camera, body.mesh);
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