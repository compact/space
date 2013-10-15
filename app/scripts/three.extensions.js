/**
 * three.js extensions for KIMCHI.
 * @external    THREE
 */
/**
 * @constructor Object3D
 * @memberOf    external:THREE
 */
/**
 * @constructor PerspectiveCamera
 * @memberOf    external:THREE
 */
/**
 * @constructor Vector3
 * @memberOf    external:THREE
 */
/**
 * @constructor Matrix3
 * @memberOf    external:THREE
 */
/**
 * @constructor Curve
 * @memberOf    external:THREE
 */

(function (_, THREE) {
  'use strict';

  /**
   * "Constant" vectors. Take care to not set other variables to these objects
   *   directly lest their coordinates change (e.g. position or rotation). Clone
   *   them instead.
   * @memberOf external:THREE
   */
  THREE.unitVectors = {
    'x': new THREE.Vector3(1, 0, 0),
    'y': new THREE.Vector3(0, 1, 0),
    'z': new THREE.Vector3(0, 0, 1),
    'negX': new THREE.Vector3(-1, 0, 0),
    'negY': new THREE.Vector3(0, -1, 0),
    'negZ': new THREE.Vector3(0, 0, -1)
  };



  /**
   * @param    {THREE.Object3D} object1
   * @param    {THREE.Object3D} object2
   * @return   {Number}         The distance between the two objects.
   * @alias    distance
   * @memberOf external:THREE.Object3D
   */
  THREE.Object3D.getDistance = function (object1, object2) {
    return object1.position.distanceTo(object2.position);
  };

  /**
   * "Overload" the original function of THREE.Object3D.prototype.add to
   *   accept arrays as well.
   * @param    {THREE.Object3D|Array} param
   *   Either an Object3D or an array of Object3Ds to be added.
   * @alias    add
   * @instance
   * @function
   * @memberOf external:THREE.Object3D
   */
  THREE.Object3D.prototype.add = (function () {
    var addSingle = THREE.Object3D.prototype.add;
    return function (param) {
      var self = this;

      if (Object.prototype.toString.call(param) === '[object Array]') { // add multiple Object3Ds
        _.each(param, function (object) {
          self.add(object);
        });
      } else { // add a single Object3D
        addSingle.call(self, param);
      }
    };
  }());

  /**
   * Revolve around the given world axis. TODO provide a translation
   *   vector for cases where the world axis doesn't pass through the origin
   * @param    {THREE.Vector3} worldAxis Not local based on the object, but
   *                                     but global in the world.
   * @param    {Number}        angle     In Radians.
   * @alias    orbit
   * @instance
   * @function
   * @memberOf external:THREE.Object3D
   */
  THREE.Object3D.prototype.orbit = (function () {
    var position, sin, cos, x, y, z, rotationMatrix, scalingMatrix;
    rotationMatrix = new THREE.Matrix3();
    scalingMatrix = new THREE.Matrix3();

    return function (worldAxis, angle) {
      sin = Math.sin(angle);
      cos = Math.cos(angle);
      worldAxis = worldAxis.normalize();
      x = worldAxis.x;
      y = worldAxis.y;
      z = worldAxis.z;

      scalingMatrix.set(
        1, 0, 0,
        0, 1, 0,
        0, 0, 1
      );
      rotationMatrix.set( // http://en.wikipedia.org/wiki/Rotation_matrix
        cos + x * x * (1 - cos),
        x * y * (1 - cos) - z * sin,
        x * z * (1 - cos) + y * sin,
        y * x * (1 - cos) + z * sin,
        cos + y * y * (1 - cos),
        y * z * (1 - cos) - x * sin,
        z * x * (1 - cos) - y * sin,
        z * y * (1 - cos) + x * sin,
        cos + z * z * (1 - cos)
      );

      position = this.position.clone();
      position.applyMatrix3(scalingMatrix)
        .applyMatrix3(rotationMatrix)
        .applyMatrix3(scalingMatrix.inverse());
      this.position.copy(position);
    };
  }());



  /**
   * Update the camera with the given options. The aspect ratio is calculated
   *   from the given width and height. See {@link
   *   http://threejs.org/docs/#Reference/Cameras/PerspectiveCamera} for the
   *   other properties.
   * @param    {Object} options
   * @param    {Number} [options.width] If given, height must also be given
   * @param    {Number} [options.height] If given, width must also be given.
   * @param    {Number} [options.fov]
   * @param    {Number} [options.near]
   * @param    {Number} [options.far]
   * @alias    update
   * @instance
   * @memberOf external:THREE.PerspectiveCamera
   */
  THREE.PerspectiveCamera.prototype.update = function (options) {
    if (typeof options.width === 'number' && options.height > 0) {
      this.aspect = options.width / options.height;

      // the camera doesn't have width and height properties; no need to assign
      _.omit(options, ['width', 'height']);
    }
    _.assign(this, options);

    // must be called after changing options
    this.updateProjectionMatrix();
  };



  /**
   * Set the x, y, and z values of this vector to all be the given value.
   * @param    {Number} value
   * @memberOf external:THREE.Vector3
   */
  THREE.Vector3.prototype.setXYZ = function (value) {
    return this.set(value, value, value);
  };



  /**
   * The original function getInverse() also sets this and requires a Matrix4,
   *   so we write our own function to only return the inverse.
   * @returns  {Matrix3} The inverse matrix.
   * @alias    inverse
   * @instance
   * @function
   * @memberOf external:THREE.Matrix3
   */
  THREE.Matrix3.prototype.inverse = (function () {
    var determinant, e, inverse = new THREE.Matrix3();

    return function () {
      determinant = this.determinant();
      e = this.elements;

      if (determinant === 0) {
        throw new Error('Matrix3.inverse(): Matrix not invertible.');
      }

      inverse.set(
        e[4] * e[8] - e[5] * e[7],
        e[2] * e[7] - e[1] * e[8],
        e[1] * e[5] - e[2] * e[4],
        e[5] * e[6] - e[3] * e[8],
        e[0] * e[8] - e[2] * e[6],
        e[2] * e[3] - e[0] * e[5],
        e[3] * e[7] - e[4] * e[6],
        e[1] * e[6] - e[0] * e[7],
        e[0] * e[4] - e[1] * e[3]
      );

      return inverse.multiplyScalar(1 / determinant);
    };
  }());



  /**
   * For this Curve, create a Line which can be added to a scene.
   *   Based on {@link
   *   http://mrdoob.github.io/three.js/examples/webgl_geometry_shapes.html}
   * @param    {Object}      options
   * <br>      position:     THREE.Vector3.
   * <br>      rotation:     THREE.Euler.
   * <br>      color:        Hexadecimal.
   * <br>      opacity:      Number.
   * <br>      lineSegments: Number of line segments to make up the Line.
   * <br>      scale:        THREE.Vector3.
   * @returns  {THREE.Line}
   * @alias    createLine
   * @instance
   * @memberOf external:THREE.Curve
   */
  THREE.Curve.prototype.createLine = function (options) {
    var curvePath, geometry, line;

    options = _.assign({
      'position': new THREE.Vector3(),
      'rotation': new THREE.Euler(),
      'color': 0x888888,
      'opacity': 1,
      'lineSegments': 360,
      'scale': new THREE.Vector3(1, 1, 1)
    }, options);

    // a CurvePath is needed since it has the createGeometry() functions
    curvePath = new THREE.CurvePath();
    curvePath.add(this);
    geometry = curvePath.createSpacedPointsGeometry(options.lineSegments);

    // create Line
    line = new THREE.Line(geometry, new THREE.LineBasicMaterial({
      'color': options.color,
      'transparent': options.opacity < 1,
      'opacity': options.opacity,
      'linewidth': 1
    }));
    line.position.copy(options.position);
    line.rotation.copy(options.rotation);
    line.scale.copy(options.scale);
    return line;
  };
}(_, THREE));