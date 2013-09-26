/**
 * Contains astronomical bodies, which are represented by instances of the
 *   {@link Body} class, and their associated Object3Ds. Can only be constructed
 *   inside kimchi.space.js.
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
   * Class for astronomical bodies. All spheres for now.
   * @param {Object} options Options.
   * <br> name:            Required. Displayed to users.
   * <br> radius:          In km.
   * <br> position:        Vector3 of the body's initial position, in au. Not to
   *                       be confused with Mesh.position, which gives the
   *                       current position.
   * <br> rotation:        Vector3 of the body's initial Euler rotation.
   * <br> visibleDistance: How far away the text mesh remains visible.
   * <br>                  TODO rename to labelMeshDistance or something.
   * <br> mesh:            Optional. If not given, a Mesh is automatically
   *                       generated.
   * <br> move:            Optional. Given an Object3D, perform rotations and
   *                       revolutions.
   * <br> texturePath:     Optional path to the texture image. Defaults to
   *                       'name.jpg'.
   * @constructor Body
   */
  Body = function (options) {
    var length, curve;

    _.assign(this, { // default options
      'name': '',
      'radiusInKm': 0,
      'position': new THREE.Vector3(),
      'rotation': new THREE.Euler(),
      'collideable': true,
      'visibleDistance': 100,
      'move': function () {},
      'texturePath': 'images/textures/' + options.name.toLowerCase() + '.jpg'
    }, options);

    // the radius and position are scaled
    this.radius = this.radiusInKm / KIMCHI.constants.kmPerAu;
    this.position.multiplyScalar(KIMCHI.config.get('scales-position'));

    // create a Mesh for the body; it can already be set in data
    if (typeof this.mesh !== 'object') {
      this.mesh = new THREE.Mesh(
        new THREE.SphereGeometry(this.radius,
          KIMCHI.config.get('sphere-segments'),
          KIMCHI.config.get('sphere-segments')),
        new THREE.MeshLambertMaterial({
          'map': new THREE.ImageUtils.loadTexture(this.texturePath)
        })
      );
    }

    // store the name in the Mesh, so in situations where we are given the Mesh
    // only, the Body can be identified using space.getBody()
    this.mesh.name = this.name;

    // set Mesh properties
    this.mesh.position.copy(this.position);
    this.mesh.rotation.copy(this.rotation);
    this.mesh.scale.setXYZ(KIMCHI.config.get('scales-size'));

    // create a Curve for the orbit, which can be used to create a Line
    length = this.position.length();
    // clockwise
    curve = new THREE.EllipseCurve(0, 0, 2 * length, length, 0, 2 * Math.PI);
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

  /**
   * Bodies do not move by default; this function is to be overwritten by Body
   *   instances.
   * @param    {Number} delta
   * @memberOf Body
   */
  Body.prototype.move = function () {};

  /**
   * @returns  {Number} The collision distance between the camera and this Body.
   * @memberOf Body
   */
  Body.prototype.getCollisionDistance = function () {
    // This is the most general calculation.
    // this.radius * KIMCHI.config.get('scales-size') works for all cases except
    // when KIMCHI.config.get('scales-size') === 'large'
    return this.radius * this.mesh.scale.x;
  };

  /**
   * @returns  {Number} The distance between the given Object3D and the closest
   *   surface of this Body.
   * @memberOf Body
   */
  Body.prototype.getSurfaceDistance = function (object3D) {
    return THREE.Object3D.getDistance(this.mesh, object3D) -
      this.radius * this.mesh.scale.x;
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
   * Contains instances of Body.
   * @private
   * @memberOf module:KIMCHI.space
   */
  bodies = {};

  /**
   * Populate the private bodies object.
   * @memberOf module:KIMCHI.space
   */
  space.init = function () {
    _.forEach(space.data, function (options) {
      bodies[options.name] = new Body(options);
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
    _.forEach(bodies, function (body) {
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
    _.forEach(bodies, function (body, name) {
      if (body.collideable) {
        collideableBodies[name] = body;
      }
    });
    return collideableBodies;
  };



  /**
   * Move the Bodies. TODO use delta
   * @memberOf module:KIMCHI.space
   */
  space.moveBodies = function (delta) {
    _.forEach(bodies, function (body) {
      // move the Body Mesh
      body.move(delta);
    });
  };

  /**
   * Without moving the Body Meshes themselves, update the visibility,
   *   position, and size of all Object3Ds associated with the Bodies (such as
   *   text label Meshes). This function should be called whenever the camera
   *   moves. TODO use delta
   * @memberOf module:KIMCHI.space
   */
  space.moveBodyChildren = function (delta) {
    _.forEach(bodies, function (body) {
      var distance;

      // move the text mesh
      if (KIMCHI.config.get('show-labels')) {
        distance = THREE.Object3D.getDistance(KIMCHI.camera, body.mesh);

        if (distance > body.visibleDistance) {
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
            .normalize().multiplyScalar(body.radius + 0.01);
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
/*    return _.forEach(bodies, function (body, name) {
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
}(KIMCHI || {}, _, $, THREE));