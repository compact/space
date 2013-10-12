/**
 * Class for astronomical bodies. All spheres for now. Should only be
 *   constructed inside kimchi.space.js. Raw data for each Body is stored in
 *   /data/kimchi.space.bodies.js for passing into this constructor.
 * @param {Object}   options
 * @param {String}   options.name Used to generate a label that is displayed
 *   to users.
 * @param {Number}   [options.ephemerisIndex] The index for {@link
 *   module:KIMCHI.ephemeris|ephemeris}.
 * @param {Number}  options.radiusInKm TODO: Make optional.
 * @param {Number}   [options.labelVisibleDistance=100] How far away the label
 *   remains visible.
 * @param {Boolean}  [options.collideable=true] Whether this Body is to be
 *   collideable with the camera.
 * @param {Boolean}  [options.createOrbit=false] Whether to create an orbit
 *   for this Body.
 * @param {Boolean}  [options.hasBumpMap=false] Whether this Body has a bump
 *   map.
 * @param {Boolean}  [options.hasSpecularMap=false] Whether this Body has a
 *   specular map.
 * @param {Function} [options.material] Function returning custom material for
 *   this Body
 * @param {Function} [options.callback] Custom callback called at the end of
 *   this constructor.
 * @constructor Body
 * @memberOf    module:KIMCHI.space
 */
var KIMCHI = (function (KIMCHI, _, THREE) {
  'use strict';

  var Body = function (options) {
    var geometry, material;

    // further default options appear below in the prototype
    _.assign(this, options);

    console.log('.space: constructing ' + this.name);

    // contains all THREE.Object3D objects belonging to this Body
    this.object3Ds = {};

    // convert the radius back to au (it is stored in km for convenience)
    this.radius = this.radiusInKm / KIMCHI.constants.kmPerAu;

    // geometry
    geometry = new THREE.SphereGeometry(this.radius,
      KIMCHI.config.get('sphereSegments'),
      KIMCHI.config.get('sphereSegments'));

    // material
    if (this.material === 'function') {
      material = this.material();
    } else {
      material = new THREE.MeshPhongMaterial({
        'map': THREE.ImageUtils.loadTexture(this.getTexturePath())
      });
    }
    if (this.hasBumpMap) {
      material.bumpMap = THREE.ImageUtils.loadTexture(this.getTexturePath('bump'));
      // material.bumpScale is set in KIMCHI.config
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

    // Create a Mesh for the text label. We could do
    // this.object3Ds.main.add(this.object3Ds.label); but then the text Mesh
    // rotates with the body and it is nontrivial to rotate it back.
    this.object3Ds.label = new THREE.Mesh(
      new THREE.TextGeometry(this.name, {
        'size': 10,
        'height': 0.01,
        'curveSegments': 20,
        'font': 'helvetiker',
        'bevelEnabled': true,
        'bevelThickness': 0.5,
        'bevelSize': 0.5
      }),
      new THREE.MeshBasicMaterial({
        'color': 0xeeeeff
      })
    );

    // optional callback
    if (typeof this.callback === 'function') {
      this.callback();
    }
  };

  // default values
  Body.prototype.name = '';
  Body.prototype.radiusInKm = 0;
  Body.prototype.labelVisibleDistance = 100;
  Body.prototype.collideable = true;
  Body.prototype.createOrbit = false;
  Body.prototype.hasBumpMap = false;
  Body.prototype.hasSpecularMap = false;

  /**
   * @param    {String} [type]
   * @returns  {String} Path to the given texture type.
   * @memberOf module:KIMCHI.space.Body
   */
  Body.prototype.getTexturePath = function (type) {
    type = typeof type === 'undefined' ? '' : '-' + type;
    return 'images/textures/' + this.name.toLowerCase() + type + '.jpg';
  };

  /**
   * Bodies do not translate by default; this function can be overwritten for
   *   any Body object.
   * @param    {Number} delta
   * @memberOf module:KIMCHI.space.Body
   */
  Body.prototype.translate = function () {
    this.scalePositionFromArray(
      KIMCHI.ephemeris.getCurrentPosition(this.ephemerisIndex));
  };

  /**
   * @param    {Array}  Array because this function gets called only with
   *   ephemeris data.
   * @memberOf module:KIMCHI.space.Body
   */
  Body.prototype.scalePositionFromArray = function (position) {
    // first set the position from the parameter, then scale it
    this.object3Ds.main.position.fromArray(position)
      .multiplyScalar(KIMCHI.config.get('bodiesPositionScale'));
    // TODO implement scales-position
  };

  /**
   * Rotate this Body. Overwriting this function is optional.
   * @param    {Number} delta
   * @memberOf module:KIMCHI.space.Body
   */
  Body.prototype.rotate = function () {
    // TODO remove this placeholder
    this.object3Ds.main.rotateOnAxis((new THREE.Vector3(-1, -0.5, 0.2)).normalize(), 0.2);
  };

  /**
   * @returns  {Number} The radius of this Body in its current scale.
   * @memberOf module:KIMCHI.space.Body
   */
  Body.prototype.getScaledRadius = function () {
    // This is the most general calculation.
    // this.radius * KIMCHI.config.get('bodiesSizeScale') works for all cases except
    // when KIMCHI.config.get('bodiesSizeScale') === 'large'
    return this.radius * this.object3Ds.main.scale.x;
  };

  /**
   * @returns  {Number} The distance between the camera and this Body.
   * @memberOf module:KIMCHI.space.Body
   */
  Body.prototype.getCameraDistance = function () {
    return THREE.Object3D.getDistance(KIMCHI.camera, this.object3Ds.main);
  };

  /**
   * @returns  {Number} The collision distance between the camera and this Body.
   * @memberOf module:KIMCHI.space.Body
   */
  Body.prototype.getCollisionDistance = function () {
    return this.getScaledRadius();
  };

  /**
   * @returns  {Number} The distance between the given Object3D and the closest
   *   surface of this Body.
   * @memberOf module:KIMCHI.space.Body
   */
  Body.prototype.getSurfaceDistance = function (object3D) {
    return THREE.Object3D.getDistance(this.object3Ds.main, object3D) -
      this.getScaledRadius();
  };

  /**
   * @returns  {Number} Whether this Body is current in collision with the
   *   given objects
   * @memberOf module:KIMCHI.space.Body
   */
  Body.prototype.isColliding = function (object3D) {
    return this.getSurfaceDistance(object3D) < this.getCollisionDistance();
  };

  KIMCHI.space = KIMCHI.space || {};
  KIMCHI.space.Body = Body;
  return KIMCHI;
}(KIMCHI || {}, _, THREE));