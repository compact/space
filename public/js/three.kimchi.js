/**
 * three.js extensions for kimchi.
 */
(function ($, THREE) {
	'use strict';

	// "constant" vectors; don't use as objects that can be changed, such as location or rotation
	THREE.unitVectors = {
		'x': new THREE.Vector3(1, 0, 0),
		'y': new THREE.Vector3(0, 1, 0),
		'z': new THREE.Vector3(0, 0, 1),
		'negX': new THREE.Vector3(-1, 0, 0),
		'negY': new THREE.Vector3(0, -1, 0),
		'negZ': new THREE.Vector3(0, 0, -1)
	};

	THREE.Object3D.distance = function (object1, object2) {
		return object1.position.distanceTo(object2.position);
	};

	THREE.Object3D.prototype.addMultiple = function (objects) {
		var self = this;
		$.each(objects, function (i, object) {
			self.add(object);
		});
	};

	THREE.PerspectiveCamera.prototype.update = function (width, height) {
		this.aspect = width / height;
		this.updateProjectionMatrix();
	};

	// getInverse() also sets and requires a Matrix4
	THREE.Matrix3.prototype.inverse = function () {
		var determinant = this.determinant(), inverse, e = this.elements;
		if (determinant === 0) {
			throw new Error('Matrix3.getInverse(): Matrix not invertible.');
		}
		inverse = new THREE.Matrix3(
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

	// Revolve around the given Vector3, which is not local based on the object,
	// but global in the world.
	// TODO provide a translation vector for cases where the world axis doesn't pass the origin
	THREE.Object3D.prototype.orbit = function (worldAxis, angle) {
		var sin, cos, x, y, z, rotationMatrix, scalingMatrix;
		sin = Math.sin(angle);
		cos = Math.cos(angle);
		worldAxis = worldAxis.normalize();
		x = worldAxis.x;
		y = worldAxis.y;
		z = worldAxis.z;
		rotationMatrix = new THREE.Matrix3();
		scalingMatrix = new THREE.Matrix3();

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

	// For this Curve, create a Line which can be added to a scene.
	// based on http://mrdoob.github.io/three.js/examples/webgl_geometry_shapes.html
	THREE.Curve.prototype.createLine = function (options) {
		var curvePath, geometry, line;

		options = $.extend({
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