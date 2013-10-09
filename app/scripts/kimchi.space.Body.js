/**
 * Class for astronomical bodies. All spheres for now. Can only be constructed
 *   inside kimchi.space.js. Raw data for each Body is stored in
 *   /data/kimchi.space.bodies.js for passing into this constructor.
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
 * @memberOf    KIMCHI.space
 */
var KIMCHI = (function (KIMCHI, _, THREE) {
  var Body = function (options) {
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
    if (this.material === 'function') {
      material = this.material();
    } else {
      material = new THREE.MeshPhongMaterial({
        'map': THREE.ImageUtils.loadTexture(this.getTexturePath())
      });
    }
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

    // create an orbit Line with a clockwise Curve
    if (this.createOrbit) {
      length = this.object3Ds.main.position.length();
      curve = new THREE.EllipseCurve(0, 0, length, length, 0, 2 * Math.PI);
      this.object3Ds.orbit = curve.createLine({
        'color': KIMCHI.config.get('orbits-color'),
        'opacity': KIMCHI.config.get('orbits-opacity'),
        'lineSegments': KIMCHI.config.get('orbits-line-segments')
      });
    }

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
  Body.prototype.initialPositionArray = [3, 3, 0];
  Body.prototype.collideable = true;
  Body.prototype.labelVisibleDistance = 100;
  Body.prototype.createOrbit = false;
  Body.prototype.hasBumpMap = false;
  Body.prototype.hasSpecularMap = false;

  /**
   * @param    {String} type Optional
   * @returns  {String} Path to the given texture type.
   * @memberOf KIMCHI.space.Body
   */
  Body.prototype.getTexturePath = function (type) {
    type = typeof type === 'undefined' ? '' : '-' + type;
    return 'images/textures/' + this.name.toLowerCase() + type + '.jpg';
  };

  /**
   * Set this Body's scale.
   * @param    {Number|String} value See the config setting 'scales-size' for
   *   allowed values. If value is not given, use the current config value.
   * @memberOf KIMCHI.space.Body
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
   * @memberOf KIMCHI.space.Body
   */
  Body.prototype.translate = function () {
    this.scalePositionFromArray(
      KIMCHI.ephemeris.getCurrentPosition(this.ephemerisIndex));
  };

  /**
   * @param    {Array}  Array because this function gets called only with
   *   ephemeris data.
   * @memberOf KIMCHI.space.Body
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
   * @memberOf KIMCHI.space.Body
   */
  Body.prototype.rotate = function () {
    // TODO remove this placeholder
    this.object3Ds.main.rotateOnAxis((new THREE.Vector3(-1, -0.5, 0.2)).normalize(), 0.2);
  };

  /**
   * @returns  {Number} The radius of this Body in its current scale.
   * @memberOf KIMCHI.space.Body
   */
  Body.prototype.getScaledRadius = function () {
    // This is the most general calculation.
    // this.radius * KIMCHI.config.get('scales-size') works for all cases except
    // when KIMCHI.config.get('scales-size') === 'large'
    return this.radius * this.object3Ds.main.scale.x;
  };

  /**
   * @returns  {Number} The collision distance between the camera and this Body.
   * @memberOf KIMCHI.space.Body
   */
  Body.prototype.getCollisionDistance = function () {
    return this.getScaledRadius();
  };

  /**
   * @returns  {Number} The distance between the given Object3D and the closest
   *   surface of this Body.
   * @memberOf KIMCHI.space.Body
   */
  Body.prototype.getSurfaceDistance = function (object3D) {
    return THREE.Object3D.getDistance(this.object3Ds.main, object3D) -
      this.getScaledRadius();
  };

  /**
   * @returns  {Number} Whether this Body is current in collision with the
   *   given objects
   * @memberOf KIMCHI.space.Body
   */
  Body.prototype.isColliding = function (object3D) {
    return this.getSurfaceDistance(object3D) < this.getCollisionDistance();
  };

  KIMCHI.space = KIMCHI.space || {};
  KIMCHI.space.Body = Body;
  return KIMCHI;
}(KIMCHI || {}, _, THREE));