/**
 * Bugs:
 * Sometimes pointerlock is disabled on start, don't know why.
 */

// precision is the number of decimals
Math.roundDecimals = function (number, precision, trailingZeroes) {
	var multiplier, result;
	multiplier = Math.pow(10, precision);
	result = Math.round(number * multiplier) / multiplier;
	if (typeof trailingZeroes === 'boolean' && trailingZeroes) {
		result = result.toFixed(precision);
	}
	return result;
};

var kimchi = (function ($, THREE) {
	'use strict';

	var kimchi = {};



	kimchi.config = {
		'camera': { // for THREE.PerspectiveCamera
			'fov': 30,
			'near': 0.01,
			'far': 10000000
		},
		'controls': { // for THREE.Controls
			'lookSpeed': 0.0002, // pitch/yaw with mouse
			'moveSpeed': 100, // move forward/backward/up/down with keyboard
			'strafeSpeed': 5, // move left/right with keyboard
			'rollSpeed': 2 // yaw with keyboard
		},
		'collisionDistance': 0.25,
		'scales': {
			'radius': 1000 / 149597871, // radii are given in km
			'position': 1, // positions are given in AU
			'stars': 100000
		},
		'orbits': {
			'color': 0xffff00,
			'opacity': 0.5
		},
		'sphereSegments': 48,
		'startingZ': -10
	};



	kimchi.space = {
		'data': [
			{
				'name': 'Sun',
				'radius': 696000,
				'position': new THREE.Vector3(0, 0, 0),
				'move': function () {},
				'mesh': new THREE.Mesh(
					new THREE.SphereGeometry(696000 * kimchi.config.scales.radius / 10, kimchi.config.sphereSegments, kimchi.config.sphereSegments),
					new THREE.MeshBasicMaterial({ // not Lambert since sunlight is in the center of the sun
						'map': new THREE.ImageUtils.loadTexture('images/textures/sun2.jpg')
					})
				)
			},
			{
				'name': 'Earth',
				'radius': 6378,
				'position': new THREE.Vector3(0, 1.00000011, 0),
				'move': function () {
					this.mesh.rotateOnAxis(new THREE.Vector3(1, 2, -3), 0.001);
//				this.mesh.orbit(new THREE.Vector3(0, 0, 1), 0.025);
				},
				'children': [
					{
						'name': 'Moon',
						'radius': 1737,
						'position': new THREE.Vector3(0, 1.00000011, 0),
						'move': function () {
							this.mesh.rotateOnAxis(new THREE.Vector3(1, 1, 1), 0.001);
							this.mesh.orbit(new THREE.Vector3(0, 0, 1), 0.025);
						}
					}
				]
			},
			{
				'name': 'Mars',
				'radius': 3397,
				'position': new THREE.Vector3(0, 1.52366231, 0),
				'move': function () {
					this.mesh.rotateOnAxis(new THREE.Vector3(-1, 1, 0.5), 0.02);
					this.mesh.orbit(new THREE.Vector3(0, 0, 1), 0.025);
				}
			},
			{
				'name': 'Jupiter',
				'radius': 71492,
				'position': new THREE.Vector3(0, 5.20336301, 0),
				'move': function () {
					this.mesh.rotateOnAxis(new THREE.Vector3(-1, -1, -1), 0.001);
					this.mesh.orbit(new THREE.Vector3(0, 0, 1), 0.025);
				}
			}, {
				'name': 'Saturn',
				'radius': 60267,
				'position': new THREE.Vector3(0, 9.53707032, 0),
				'move': function () {
					this.mesh.rotateOnAxis(new THREE.Vector3(1, 2, -3), 0.01);
					this.mesh.orbit(new THREE.Vector3(0, 0, 1), 0.025);
				}
			},
			{
				'name': 'Neptune',
				'radius': 24766,
				'position': new THREE.Vector3(0, 30.06896348, 0),
				'move': function () {
					this.mesh.rotateOnAxis(new THREE.Vector3(1, 2, -3), 0.01);
					this.mesh.orbit(new THREE.Vector3(0, 0, 1), 0.025);
				}
			}
		],
		/**
		 * Class for astronomical bodies. All spheres for now.
		 * Currently not extensible; set the functions in the prototype to do that.
		 * name: Required. Label displayed to users.
		 * radius: In km.
		 * position: Vector3 of the starting position in AU.
		 * move: Optional. Given an Object3D (Mesh), perform rotations and revolutions.
		 * texturePath: Optional path to the texture image. The default is name.jpg.
		 */
		'Body': function (options) {
			var length, curve;

			$.extend(this, { // default options
				'name': '',
				'radius': 0,
				'position': new THREE.Vector3(),
				'collideable': true,
				'move': function () {},
				'texturePath': 'images/textures/' + options.name.toLowerCase() + '.jpg'
			}, options);

			this.radius *= kimchi.config.scales.radius;

			// create mesh; it can already be set in space.data
			if (typeof this.mesh !== 'object') { 
				this.mesh = new THREE.Mesh(
					new THREE.SphereGeometry(this.radius, kimchi.config.sphereSegments, kimchi.config.sphereSegments),
					new THREE.MeshLambertMaterial({
						'map': new THREE.ImageUtils.loadTexture(this.texturePath)
					})
				);
			}
			this.position = this.position.multiplyScalar(kimchi.config.scales.position);
			this.mesh.position = this.position;
			length = this.position.length();

			// create a Curve for the orbit, which can be used to create a Line
			curve = new THREE.EllipseCurve(0, 0, 2 * length, length, 0, 2 * Math.PI, true);
			this.line = curve.createLine();
		},
		// contains instances of space.Body
		'bodies': [],
		'setBodies': function () {
			$.each(kimchi.space.data, function (i, options) {
				kimchi.space.bodies.push(new kimchi.space.Body(options));
			});
		},
		// return an array of Object3Ds objects for each spaces.bodies
		'getObject3Ds': function () {
			var objects = [];
			$.each(kimchi.space.bodies, function (i, body) {
				objects.push(body.mesh, this.line);
			});
			return objects;
		},
		'moveMeshes': function () {
			$.each(kimchi.space.bodies, function (i, body) {
				body.move();
			});
		},
		// returns an array of Mesh objects set to be collideable with the camera
		'getCollideableMeshes': function () {
			var meshes = [];
			$.each(kimchi.space.bodies, function (i, body) {
				if (body.collideable) {
					meshes.push(body.mesh);
				}
			});
			return meshes;
		}
	};
	kimchi.animate = function () {
		var delta;

		window.requestAnimationFrame(kimchi.animate);

		delta = kimchi.clock.getDelta();
		if (!kimchi.colliding()) {
			kimchi.controls.update(delta);
		}

		kimchi.space.moveMeshes();
		kimchi.hud.update();

		kimchi.renderer.render(kimchi.scene, kimchi.camera);
	}
	kimchi.colliding = function () {
		var translationVector, raycaster, intersection;

		translationVector = kimchi.controls.getLocalTranslationVector();

		// TODO collision bugs out without this scaling, where all movement directions lead are found as collide with the same mesh
//			translationVector.multiplyScalar(1000);

		if (translationVector.length() === 0) { // not moving, can't be colliding
			return false;
		}

		raycaster = new THREE.Raycaster(
			kimchi.camera.position.clone(),
			// calculation based on http://stackoverflow.com/questions/11473755/how-to-detect-collision-in-three-js
			kimchi.camera.localToWorld(translationVector).sub(kimchi.camera.position),
//				kimchi.camera.position.clone().sub(translationVector.applyMatrix4(kimchi.camera.matrix)),
			0,
			kimchi.config.collisionDistance
		);
		intersection = raycaster.intersectObjects(kimchi.space.getCollideableMeshes());
		return intersection.length > 0;
	};
	kimchi.hud = {};
	kimchi.hud.update = function () {
		var translation = kimchi.controls.getLocalTranslationVector();
		$('#hud2').html(
			'Distance from the sun: ' + Math.roundDecimals(kimchi.camera.position.length(), 2, true) + ' AU'
		);
		$('#hud4').html(
			'position (px): ' +
				Math.round(kimchi.camera.position.x) + ', ' +
				Math.round(kimchi.camera.position.y) + ', ' +
				Math.round(kimchi.camera.position.z) + '<br />' +
			'rotation (deg): ' +
				Math.round(kimchi.camera.rotation.x * 180 / Math.PI) + ', ' +
				Math.round(kimchi.camera.rotation.y * 180 / Math.PI) + ', ' +
				Math.round(kimchi.camera.rotation.z * 180 / Math.PI) + '<br />' +
			'movement: ' +
				translation.x + ', ' +
				translation.y + ', ' +
				translation.z
		);
	};
	kimchi.resize = function (width, height) {
		var width = kimchi.$window.width(), height = kimchi.$window.height() - 5;
		kimchi.camera.update(width, height);
		kimchi.renderer.setSize(width, height);
	};
	kimchi.setPointerLock = function () {
		var havePointerLock, body, change, error;

		havePointerLock = 'pointerLockElement' in document ||
			'mozPointerLockElement' in document ||
			'webkitPointerLockElement' in document;
		if (!havePointerLock) {
			// we can use FirstPersonControls here instead
			console.log('Your browser does not support Pointer Lock API.');
			return;
		}

		body = document.body;

		change = function (event) {
			if (document.pointerLockElement === body || document.mozPointerLockElement === body || document.webkitPointerLockElement === body) {
				kimchi.controls.enable();
				kimchi.$overlay.hide();
			} else {
				kimchi.controls.disable();
				kimchi.$overlay.find('.notice').text('Click to Continue');
				kimchi.$overlay.show();
			}
		}

		error = function (event) {
			console.log('Pointer Lock error:');
			console.log(event);
		}

		// Hook pointer lock state change events
		document.addEventListener('pointerlockchange', change, false);
		document.addEventListener('mozpointerlockchange', change, false);
		document.addEventListener('webkitpointerlockchange', change, false);

		document.addEventListener('pointerlockerror', error, false);
		document.addEventListener('mozpointerlockerror', error, false);
		document.addEventListener('webkitpointerlockerror', error, false);

		kimchi.$overlay.on('click', function () {
			// Ask the browser to lock the pointer
			body.requestPointerLock = body.requestPointerLock || body.mozRequestPointerLock || body.webkitRequestPointerLock;
			body.requestPointerLock();

			kimchi.$overlay.hide();
		});
	};


	// three.js extensions
	// "constant" vectors
	THREE.zeroVector = new THREE.Vector3(0, 0, 0);
	THREE.unitVectors = {
		'x': new THREE.Vector3(1, 0, 0),
		'y': new THREE.Vector3(0, 1, 0),
		'z': new THREE.Vector3(0, 0, 1),
		'negX': new THREE.Vector3(-1, 0, 0),
		'negY': new THREE.Vector3(0, -1, 0),
		'negZ': new THREE.Vector3(0, 0, -1)
	};
	THREE.Object3D.prototype.addMultiple = function (objects) {
		var self = this;
		$.each(objects, function (i, object) {
			self.add(object);
		});
	};
	THREE.PerspectiveCamera.prototype.update = function (width, height) {
		this.fov = kimchi.config.camera.fov;
		this.aspect = width / height;
		this.near = kimchi.config.camera.near;
		this.far = kimchi.config.camera.far;
		this.updateProjectionMatrix();
	};
	// Revolve around the given Vector3, which is not local based on the object,
	// but global in the world.
	// TODO provide a translation vector for cases where the world axis doesn't pass the origin
/*	THREE.Object3D.prototype.revolve = function (worldAxis, angle) {
		var sin, cos, x, y, z, rotationMatrix;
		sin = Math.sin(angle);
		cos = Math.cos(angle);
		worldAxis = worldAxis.normalize();
		x = worldAxis.x;
		y = worldAxis.y;
		z = worldAxis.z;
		rotationMatrix = new THREE.Matrix3();

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
		this.position.applyMatrix3(rotationMatrix);
	};*/
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

		scalingMatrix.set(
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
	// based on http://mrdoob.github.io/three.js/examples/webgl_geometry_shapes.html
/*	THREE.Object3D.prototype.addCurve = function (options) {
		var curvePath, geometry, line, particleSystem;

		options = $.extend({
			'curve': new THREE.Curve(),
			'color': 0x000000,
			'position': new THREE.Vector3(),
			'rotation': new THREE.Vector3(),
			'divisions': 180,
			'scale': new THREE.Vector3(1, 1, 1)
		}, options);

		curvePath = new THREE.CurvePath();
		curvePath.add(options.curve);
		geometry = curvePath.createSpacedPointsGeometry(options.divisions);

		// transparent line from real points
		line = new THREE.Line(geometry, new THREE.LineBasicMaterial({
			'color': options.color,
			'opacity': 0.25
		}));
		line.position = options.position;
		line.rotation = options.rotation;
		line.scale = options.scale;
		this.add(line);

		// vertices from real points
		// particleSystem = new THREE.ParticleSystem(geometry.clone(), new THREE.ParticleBasicMaterial({
		// 	'color': options.color,
		// 	'size': 1,
		// 	'opacity': 0.5
		// }));
		// particleSystem.position = options.position;
		// particleSystem.rotation = options.rotation;
		// particleSystem.scale = options.scale;
		// this.add(particleSystem);
	};*/
	// based on http://mrdoob.github.io/three.js/examples/webgl_geometry_shapes.html
	THREE.Curve.prototype.createLine = function (options) {
		var curvePath, geometry, line, particleSystem;

		options = $.extend({
			'color': kimchi.config.orbits.color,
			'opacity': kimchi.config.orbits.opacity,
			'position': new THREE.Vector3(),
			'rotation': new THREE.Vector3(),
			'divisions': 20,
			'scale': new THREE.Vector3(1, 1, 1)
		}, options);

		curvePath = new THREE.CurvePath();
		curvePath.add(this);
		geometry = curvePath.createSpacedPointsGeometry(options.divisions);

		// transparent line from real points
		line = new THREE.Line(geometry, new THREE.LineBasicMaterial({
			'color': options.color,
			'transparent': options.opacity < 1,
			'opacity': options.opacity,
			'linewidth': 1
		}));
		line.position = options.position;
		line.rotation = options.rotation;
		line.scale = options.scale;
		return line;
	};



	$(function () {
		kimchi.$window = $(window);
		kimchi.$overlay = $('#overlay');

		// clock: for movement speed
		kimchi.clock = new THREE.Clock();

		// scene
		kimchi.scene = new THREE.Scene();

		// camera: don't use OrthographicCamera because it lacks perspective
		kimchi.camera = new THREE.PerspectiveCamera();

		// renderer
		kimchi.renderer = new THREE.WebGLRenderer();

		// set camera size and renderer size
		kimchi.resize();

		// TODO put this at the bottom, after adding all objects?
		$('body').append(kimchi.renderer.domElement);



		// add astronomical objects
		kimchi.space.setBodies();
		kimchi.scene.addMultiple(kimchi.space.getObject3Ds());



		// add background stars
		kimchi.stars = new THREE.Stars(kimchi.config.scales.stars);
		kimchi.scene.addMultiple(kimchi.stars.particleSystems);



		// lighting
		kimchi.lights = {};
		// sunlight
		kimchi.lights.sun = new THREE.PointLight(0xffffee, 10, 123456);
		kimchi.lights.sun.position.set(0, 0, 0);
		kimchi.scene.add(kimchi.lights.sun);
		// ambient light
		kimchi.lights.ambient = new THREE.AmbientLight(0x888888);
		kimchi.scene.add(kimchi.lights.ambient);



		// first person controls
		kimchi.controls = new THREE.Controls(kimchi.camera, kimchi.config.controls);



		// animate: render repeatedly
		kimchi.camera.position.z = kimchi.config.startingZ;
		kimchi.camera.lookAt(new THREE.Vector3(0, 0, 0));
		kimchi.animate();



		// bind
		kimchi.setPointerLock();
		kimchi.$window.on('resize', kimchi.resize);
	});

	kimchi.$ = $;
	kimchi.THREE = THREE;
	return kimchi;
}(jQuery, THREE));