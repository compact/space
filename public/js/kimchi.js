/**
 * Extensible module for kimchi. Extend like this:
 *
 * var kimchi = (function (kimchi) {
 *   kimchi.foo = ...;
 *   return kimchi;
 * }(kimchi));
 */

var kimchi = (function (jQuery, THREE) {
	'use strict';

	var kimchi = {};



	// configuration options
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
			'position': 1 // positions are given in AU
		},
		'orbits': {
			'color': 0xffff00,
			'opacity': 0.5,
			'lineSegments': 90 // how many lines make up each orbit?
		},
		'sphereSegments': 48,
		'startingZ': -10,
		'stars': {
			'scale': 100000,
			'count': 2000
		}
	};



	// contains astronomical bodies and their Object3Ds
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



	// three.js rendering functions
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
	// return whether the camera is colliding with an object along the current
	// movement direction
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



	// hud
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



	// binds
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



	kimchi.$ = $;
	kimchi.THREE = THREE;

	return kimchi;
}(jQuery, THREE));