/**
 * three.js extensions for KIMCHI.
 */
(function ($, THREE) {
	'use strict';

	/**
	 * "Constant" vectors. Take care to not set other variables to these objects
	 *   directly lest their coordinates change (e.g. position or rotation). Clone
	 *   them instead.
	 * @memberOf THREE
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
	 * @memberOf THREE
	 */
	THREE.Object3D.distance = function (object1, object2) {
		return object1.position.distanceTo(object2.position);
	};

	/**
	 * "Overload" the original function of THREE.Object3D.prototype.add.
	 * @param {(THREE.Object3D|Array)} param
	 *   Either an Object3D or an array of Object3Ds to be added.
	 * @memberOf THREE
	 */
	THREE.Object3D.prototype.add = (function () {
		var addSingle = THREE.Object3D.prototype.add;
		return function (param) {
			var self = this;

			if (Object.prototype.toString.call(param) === '[object Array]') { // add multiple Object3Ds
				_.forEach(param, function (object) {
					self.add(object);
				});
			} else { // add a single Object3D
				addSingle.call(self, param);
			}
		};
	}());

	/**
	 * Update the camera given dimensions.
	 * @param    {Number} width
	 * @param    {Number} height
	 * @memberOf THREE
	 */
	THREE.PerspectiveCamera.prototype.update = function (width, height) {
		this.aspect = width / height;
		this.updateProjectionMatrix();
	};

	/**
	 * We use this function instead of getInverse() because getInverse() also
	 *   sets this and requires a Matrix4.
	 * @returns {Matrix3} The inverse.
	 */
	THREE.Matrix3.prototype.inverse = (function () {
		var determinant, e, inverse = new THREE.Matrix3();

		return function () {
			determinant = this.determinant();
			e = this.elements;

			if (determinant === 0) {
				throw new Error('Matrix3.getInverse(): Matrix not invertible.');
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

	// Revolve around the given Vector3, which is not local based on the object,
	// but global in the world.
	// TODO provide a translation vector for cases where the world axis doesn't pass the origin
	THREE.Object3D.prototype.orbit = (function () {
		var sin, cos, x, y, z, rotationMatrix, scalingMatrix;
		rotationMatrix = new THREE.Matrix3();
		scalingMatrix = new THREE.Matrix3();

		return function (worldAxis, angle) {
			sin = Math.sin(angle);
			cos = Math.cos(angle);
			worldAxis = worldAxis.normalize();
			x = worldAxis.x;
			y = worldAxis.y;
			z = worldAxis.z;

			scalingMatrix.set( // TODO
				1, 0, 0,
				0, 2, 0,
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
			this.position
				.applyMatrix3(scalingMatrix)
				.applyMatrix3(rotationMatrix)
				.applyMatrix3(scalingMatrix.inverse());
		};
	}());

	// For this Curve, create a Line which can be added to a scene.
	// based on http://mrdoob.github.io/three.js/examples/webgl_geometry_shapes.html
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
		line.scale = options.scale;
		return line;
	};
}(jQuery, THREE));