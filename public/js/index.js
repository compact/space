/**
 * Bugs:
 * Sometimes pointerlock is disabled on start, don't know why.
 */

// precision is the number of decimals
Math.round2 = function (number, precision) {
	var multiplier = Math.pow(10, precision);
	return Math.round(number * multiplier) / multiplier;
};

(function ($, THREE) {
	'use strict';

	var config, astronomicalBodies;

	config = {
		'camera': { // for THREE.PerspectiveCamera
			'fov': 30,
			'near': 1,
			'far': 1000000000
		},
		'controls': { // for THREE.Controls
			'lookSpeed': 0.0002, // pitch/yaw with mouse
			'moveSpeed': 2000000000, // move forward/backward/up/down with keyboard
			'strafeSpeed': 10000000, // move left/right with keyboard
			'rollSpeed': 2 // yaw with keyboard
		},
		'collisionDistance': 10000001
	};

	/**
	 * radius: in km
	 * position: starting position
	 * move: given an Object3D (Mesh), perform rotations and revolutions
	 *
	 */
	astronomicalBodies = {
		'sun': {
			'radius': 696000 * 100,
			'position': new THREE.Vector3(0, 0, 0),
			'move': function () {},
			'createMesh': function () { // custom function
//			mesh.material.transparent = false;
//			mesh.material.opacity = 0.5;
				return new THREE.Mesh(
					new THREE.SphereGeometry(this.radius, 64, 64),
					new THREE.MeshBasicMaterial({ // not Lambert since sunlight is in the center of the sun
						'map': new THREE.ImageUtils.loadTexture('images/textures/sun2.jpg')
					})
				);
			}
		},
		'earth': {
			'radius': 6378 * 1000,
			'position': new THREE.Vector3(0, 149597870, 0),
			'move': function () {
				this.mesh.rotateOnAxis(new THREE.Vector3(1, 2, -3), 0.01);
				this.mesh.revolve(new THREE.Vector3(0, 0, 1), 0.025);
			}
		},
		'moon': {
			'radius': 1737 * 1000,
			'position': new THREE.Vector3(10000, 149597890, 20000),
			'move': function () {
				this.mesh.rotateOnAxis(new THREE.Vector3(-5, -8, 4), 0.001);
				this.mesh.revolve(new THREE.Vector3(1, 1, 1), 0.025);
			}
		},
		'mars': {
			'radius': 3397 * 1000,
			'position': new THREE.Vector3(227936640, 0, 0),
			'move': function () {
				this.mesh.rotateOnAxis(new THREE.Vector3(-1, 1, 0.5), 0.02);
				this.mesh.revolve(new THREE.Vector3(0, 0, 1), 0.025);
			}
		},
		'jupiter': {
			'radius': 71492 * 1000,
			'position': new THREE.Vector3(0, 778412010, 0),
			'move': function () {
				this.mesh.rotateOnAxis(new THREE.Vector3(-1, -1, -1), 0.001);
				this.mesh.revolve(new THREE.Vector3(0, 0, 1), 0.025);
			}
		},
		'saturn': {
			'radius': 60267 * 1000,
			'position': new THREE.Vector3(0, 1426725400, 0),
			'move': function () {
				this.mesh.rotateOnAxis(new THREE.Vector3(1, 2, -3), 0.01);
				this.mesh.revolve(new THREE.Vector3(0, 0, 1), 0.025);
			}
		},
		'neptune': {
			'radius': 24766 * 1000,
			'position': new THREE.Vector3(0, 4498252900, 0),
			'move': function () {
				this.mesh.rotateOnAxis(new THREE.Vector3(1, 2, -3), 0.01);
				this.mesh.revolve(new THREE.Vector3(0, 0, 1), 0.025);
			}
		}
	};



	// unit vectors
	THREE.unitVectors = {
		'x': new THREE.Vector3(1, 0, 0),
		'y': new THREE.Vector3(0, 1, 0),
		'z': new THREE.Vector3(0, 0, 1),
		'negX': new THREE.Vector3(-1, 0, 0),
		'negY': new THREE.Vector3(0, -1, 0),
		'negZ': new THREE.Vector3(0, 0, -1)
	};
	// extensions
	THREE.PerspectiveCamera.prototype.update = function (width, height) {
		this.fov = config.camera.fov;
		this.aspect = width / height;
		this.near = config.camera.near;
		this.far = config.camera.far;
		this.updateProjectionMatrix();
	};
	// Revolve around the given Vector3, which is not local based on the object,
	// but global in the world.
	THREE.Object3D.prototype.revolve = function (worldAxis, angle) {
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
	};



	$(function () {
		var $window, $overlay, width, height,
			clock, scene, camera, renderer, collideableMeshes, controls, lights = {};

		$window = $(window);
		$overlay = $('#overlay');

		// canvas dimensions
		width = $window.width();
		height = $window.height() - 5;

		// clock: for movement speed
		clock = new THREE.Clock();

		// scene
		scene = new THREE.Scene();

		// camera: don't use OrthographicCamera because it lacks perspective
		camera = new THREE.PerspectiveCamera();
		camera.update(width, height);
		// canvas
		renderer = new THREE.WebGLRenderer();
		renderer.setSize(width, height);
		$('body').append(renderer.domElement);



		// add astronomical objects
		collideableMeshes = [];
		$.each(astronomicalBodies, function (name, body) {
			var mesh;
			if (typeof body.createMesh === 'function') { // optional function
				mesh = body.createMesh();
			} else {
				mesh = new THREE.Mesh(
					new THREE.SphereGeometry(body.radius, 48, 48),
					new THREE.MeshLambertMaterial({
						'map': new THREE.ImageUtils.loadTexture('images/textures/' + name + '.jpg')
					})
				);
			}
			mesh.position = body.position;
			scene.add(mesh);
			// perhaps some astronomical meshes will not be collideable
			collideableMeshes.push(mesh);
			body.mesh = mesh;
		});
		// add background stars
/*		var stars = new THREE.Stars();
		// TODO overload Object3D.add() to handle arrays of objects to add
		$.each(stars.particleSystems, function (i, particleSystem) {
			scene.add(particleSystem);
		});
*/


		// lighting
		// sunlight
		lights.sun = new THREE.PointLight(0xffffee, 10, 2500000010);
		lights.sun.position.set(0, 0, 0);
		scene.add(lights.sun);
		lights.ambient = new THREE.AmbientLight(0x888888);
		scene.add(lights.ambient);



		// first person controls
		controls = new THREE.Controls(camera, config.controls);



		// animate: render repeatedly
		camera.position.z = -4495978700;
		camera.lookAt(new THREE.Vector3(0, 0, 0));
		function animate() {
			var delta;

			window.requestAnimationFrame(animate);

			delta = clock.getDelta();
			if (!colliding()) {
				controls.update(delta);
			}

			moveastronomicalBodies();
			updateHud();

			renderer.render(scene, camera);
		}
		var colliding = function () {
//			return false;
			var translationVector, raycaster, intersection;

			translationVector = controls.getLocalTranslationVector();
			if (translationVector.length() === 0) { // not moving, can't be colliding
				return false;
			}

			raycaster = new THREE.Raycaster(
				camera.position.clone(),
				// calculation based on http://stackoverflow.com/questions/11473755/how-to-detect-collision-in-three-js
				camera.localToWorld(translationVector).sub(camera.position),
//				camera.position.clone().sub(translationVector.applyMatrix4(camera.matrix)),
				0,
				config.collisionDistance
			);
			intersection = raycaster.intersectObjects(collideableMeshes);
			return intersection.length > 0;
		};
		var moveastronomicalBodies = function () {
			$.each(astronomicalBodies, function (i, body) {
				body.move();
			});
		};
		var updateHud = function () {
			var m = controls.getLocalTranslationVector();
			$('#hud2').html(
				'position (px): ' +
					Math.round(camera.position.x) + ', ' +
					Math.round(camera.position.y) + ', ' +
					Math.round(camera.position.z) + '<br />' +
				'rotation (deg): ' +
					Math.round(camera.rotation.x * 180 / Math.PI) + ', ' +
					Math.round(camera.rotation.y * 180 / Math.PI) + ', ' +
					Math.round(camera.rotation.z * 180 / Math.PI) + '<br />' +
				'movement: ' +
					m.x + ', ' +
					m.y + ', ' +
					m.z
			);
		};
		animate();


		// pointer lock
		var havePointerLock = 'pointerLockElement' in document ||
			'mozPointerLockElement' in document ||
			'webkitPointerLockElement' in document;
		if (!havePointerLock) {
			// we can use FirstPersonControls here instead
			console.log('Your browser does not support Pointer Lock API.');
		} else {
			var element = document.body;

			var pointerlockchange = function (event) {
				if (document.pointerLockElement === element || document.mozPointerLockElement === element || document.webkitPointerLockElement === element) {
					controls.enable();
					$overlay.hide();
				} else {
					controls.disable();
					$overlay.find('.notice').text('Click to Continue');
					$overlay.show();
				}
			}

			var pointerlockerror = function (event) {
				console.log('Pointer Lock error:');
				console.log(event);
			}

			// Hook pointer lock state change events
			document.addEventListener('pointerlockchange', pointerlockchange, false);
			document.addEventListener('mozpointerlockchange', pointerlockchange, false);
			document.addEventListener('webkitpointerlockchange', pointerlockchange, false);

			document.addEventListener('pointerlockerror', pointerlockerror, false);
			document.addEventListener('mozpointerlockerror', pointerlockerror, false);
			document.addEventListener('webkitpointerlockerror', pointerlockerror, false);

			$overlay.on('click', function () {
				// Ask the browser to lock the pointer
				element.requestPointerLock = element.requestPointerLock || element.mozRequestPointerLock || element.webkitRequestPointerLock;
				element.requestPointerLock();

				$overlay.hide();
			});
		}

		$window.on('resize', function () {
			var width = $window.width(), height = $window.height();
			camera.update(width, height);
			renderer.setSize(width, height);
		});
	});
}(jQuery, THREE));