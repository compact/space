/**
 * Extensible module for kimchi. Extend like this:
 *
 * var kimchi = (function (kimchi) {
 *   kimchi.foo = ...;
 *   return kimchi;
 * }(kimchi));
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

Date.months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
	'Oct', 'Nov', 'Dec'];
Date.prototype.format = function () {
	return Date.months[this.getMonth()] + ' ' + this.getDate() + ', ' + this.getFullYear();
};

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
			'zSpeed': 1, // move forward/backward with keyboard
			'strafeSpeed': 0.5, // move left/right/up/down with keyboard
			'rollSpeed': 2 // roll with keyboard
		},
		'collisionDistance': 0.05,
		'scales': {
			'radius': 1000 / 149597871, // radii are given in km
			'position': 1 // positions are given in AU
		},
		'orbits': {
			'color': 0xffffcc,
			'opacity': 0.5,
			'lineSegments': 360 // how many lines make up each orbit?
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
				'radius': 696000 / 10,
				'position': new THREE.Vector3(0, 0, 0),
				'visibleDistance': 100000,
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
				'visibleDistance': 50,
				'move': function () {
//					this.mesh.rotateOnAxis(new THREE.Vector3(1, 2, -3), 0.001);
//				this.mesh.orbit(new THREE.Vector3(0, 0, 1), 0.025);
				},
				'children': [
					{
						'name': 'Moon',
						'radius': 1737,
						'position': new THREE.Vector3(0, 1.00000011, 0),
						'visibleDistance': 20,
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
				'visibleDistance': 50,
				'move': function () {
					this.mesh.rotateOnAxis(new THREE.Vector3(-1, 1, 0.5), 0.02);
					this.mesh.orbit(new THREE.Vector3(0, 0, 1), 0.0025);
				}
			},
			{
				'name': 'Jupiter',
				'radius': 71492,
				'position': new THREE.Vector3(0, 5.20336301, 0),
				'visibleDistance': 250,
				'move': function () {
					this.mesh.rotateOnAxis(new THREE.Vector3(-1, -1, -1), 0.001);
					this.mesh.orbit(new THREE.Vector3(0, 0, 1), 0.0025);
				}
			}, {
				'name': 'Saturn',
				'radius': 60267,
				'position': new THREE.Vector3(0, 9.53707032, 0),
				'visibleDistance': 250,
				'move': function () {
					this.mesh.rotateOnAxis(new THREE.Vector3(1, 2, -3), 0.01);
					this.mesh.orbit(new THREE.Vector3(0, 0, 1), 0.0025);
				}
			},
			{
				'name': 'Neptune',
				'radius': 24766,
				'position': new THREE.Vector3(0, 30.06896348, 0),
				'visibleDistance': 1000,
				'move': function () {
					this.mesh.rotateOnAxis(new THREE.Vector3(1, 2, -3), 0.01);
					this.mesh.orbit(new THREE.Vector3(0, 0, 1), 0.0025);
				}
			}
		],
		/**
		 * Class for astronomical bodies. All spheres for now.
		 * Currently not extensible; set the functions in the prototype to do that.
		 * name: Required. Label displayed to users.
		 * radius: In km.
		 * position: Vector3 of the starting position in AU. Not to be confused with
		 *   Mesh.position, which gives the current position.
		 * rotation: Vector3 of the starting rotation.
		 * visibleDistance: How far away the text mesh remains visible.
		 *   TODO rename to textMeshDistance or something.
		 * move: Optional. Given an Object3D (Mesh), perform rotations and revolutions.
		 * texturePath: Optional path to the texture image. The default is name.jpg.
		 */
		'Body': function (options) {
			var length, curve;

			$.extend(this, { // default options
				'name': '',
				'radius': 0,
				'position': new THREE.Vector3(),
				'rotation': new THREE.Vector3(),
				'collideable': true,
				'visibleDistance': 100,
				'move': function () {},
				'texturePath': 'images/textures/' + options.name.toLowerCase() + '.jpg'
			}, options);

			this.radius *= kimchi.config.scales.radius;

			// create a Mesh for the body; it can already be set in space.data
			if (typeof this.mesh !== 'object') { 
				this.mesh = new THREE.Mesh(
					new THREE.SphereGeometry(this.radius, kimchi.config.sphereSegments, kimchi.config.sphereSegments),
					new THREE.MeshLambertMaterial({
						'map': new THREE.ImageUtils.loadTexture(this.texturePath)
					})
				);
			}
			this.position.multiplyScalar(kimchi.config.scales.position);
			this.mesh.position.copy(this.position);
			this.mesh.rotation.copy(this.rotation);
			length = this.position.length();

			// create a Curve for the orbit, which can be used to create a Line
			curve = new THREE.EllipseCurve(0, 0, 2 * length, length, 0, 2 * Math.PI, true);
			this.line = curve.createLine({
				'color': kimchi.config.orbits.color,
				'opacity': kimchi.config.orbits.opacity,
				'lineSegments': kimchi.config.orbits.lineSegments,
			});

			/**
			 * Create a Mesh for the text label. We could do
			 *   this.mesh.add(this.textMesh);
			 * but then the text Mesh rotates with the body and it is nontrivial to
			 * rotate it back.
			 */
			this.textMesh = new THREE.Mesh(
				new THREE.TextGeometry(this.name, {
					'size': 10,
					'height': 0.1,
					'curveSegments': 10,
					'font': 'helvetiker'/*,
					'bevelEnabled': true,
					'bevelThickness': 0.5,
					'bevelSize': 0.5*/
				}),
				new THREE.MeshBasicMaterial({
					'color': 0xeeeeff
				})
			);
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
				objects.push(body.mesh, body.line, body.textMesh);
			});
			return objects;
		},
		'moveMeshes': function (delta) { // TODO use delta
			$.each(kimchi.space.bodies, function (i, body) {
				var distance, scale;

				// move the body mesh (custom function)
				body.move();

				// move the text mesh
				distance = kimchi.camera.position.distanceTo(body.textMesh.position);
				if (distance > body.visibleDistance) {
					body.textMesh.visible = false;
				} else {
					body.textMesh.visible = true;

					scale = distance / 1000;
					body.textMesh.scale.set(scale, scale, scale);

					// the text mesh always face the camera
//				body.textMesh.rotation.copy(body.mesh.rotation.clone().multiplyScalar(-1));
					body.textMesh.rotation.copy(kimchi.camera.rotation.clone());

					// move it in front of the associated mesh so it's not hidden inside
					body.textMesh.geometry.computeBoundingSphere();
					var v = kimchi.camera.position.clone().sub(body.mesh.position)
						.normalize().multiplyScalar(body.radius + 0.1);
					var w = body.mesh.position.clone().add(v);
					var x = body.mesh.position.clone().cross(v).cross(v)
						.normalize().multiplyScalar(
							body.textMesh.geometry.boundingSphere.radius / 100
						);
					body.textMesh.position.copy(w);
						//.add(x));
				}
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
		setTimeout(function () { // TODO: remove for production
			var delta;

			// stop the next frame if the user has paused
			if (kimchi.state.enabled) {
				window.requestAnimationFrame(function () {
					kimchi.animate();
				});
			}

			delta = kimchi.clock.getDelta();
			if (!kimchi.colliding()) {
				kimchi.controls.moveCamera(
					delta,
					kimchi.getTranslationSpeedMultiplier()
				);
			}

			kimchi.space.moveMeshes(delta);
			kimchi.hud.update(delta);
			kimchi.date.setDate(kimchi.date.getDate() + 1);

			kimchi.renderer.render(kimchi.scene, kimchi.camera);
		}, 50); // TODO
	}
	// return whether the camera is colliding with an object along the current
	// movement direction
	kimchi.colliding = function () {
		var translationVector, raycaster, intersection;

		translationVector = kimchi.controls.getLocalTranslationVector();

		// scaling may be necessary if translationVector's magnitude is much larger
		// or smaller than the camera position
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
		intersection = raycaster.intersectObjects(
			kimchi.space.getCollideableMeshes()
		);
		return intersection.length > 0;
	};
	// return a number for scaling the camera speed (in each direction) depending
	// on how close the camera is to collideable meshes
	kimchi.getTranslationSpeedMultiplier = function () {
		var distances = [];

		$.each(kimchi.space.getCollideableMeshes(), function (i, mesh) {
			distances.push(kimchi.camera.position.distanceTo(mesh.position));
		});
		distances.sort(function (a, b) { // sort numerically
			return a - b;
		});
		return distances[0];
	};



	// hud
	kimchi.hud = {};
	kimchi.hud.update = function (delta) {
		var translation = kimchi.controls.getLocalTranslationVector();
		$('#hud-distance-from-sun').text(Math.roundDecimals(kimchi.camera.position.length(), 2, true));
		$('#hud-speed').text(Math.roundDecimals((new THREE.Vector3(
			translation.x * kimchi.config.controls.strafeSpeed,
			translation.y * kimchi.config.controls.strafeSpeed,
			translation.z * kimchi.config.controls.zSpeed
		)).length() * kimchi.getTranslationSpeedMultiplier(), 2));
		$('#hud-time').text(kimchi.date.format());

		$('#hud4').html(
			'Delta: ' +
				Math.roundDecimals(delta, 4) + '<br />' +
			'Camera position (px): ' +
				Math.round(kimchi.camera.position.x) + ', ' +
				Math.round(kimchi.camera.position.y) + ', ' +
				Math.round(kimchi.camera.position.z) + '<br />' +
			'Camera rotation (deg): ' +
				Math.round(kimchi.camera.rotation.x * 180 / Math.PI) + ', ' +
				Math.round(kimchi.camera.rotation.y * 180 / Math.PI) + ', ' +
				Math.round(kimchi.camera.rotation.z * 180 / Math.PI) + '<br />'
/*			'movement: ' +
				translation.x + ', ' +
				translation.y + ', ' +
				translation.z + '<br />' +*/
		);
	};



	// state
	kimchi.state = {
		'enabled': false,
		'start': function () {
			kimchi.$overlay.hide();
			kimchi.clock.start();
			kimchi.state.enabled = true;
			kimchi.animate();
			kimchi.controls.enable();
		},
		'stop': function () {
			kimchi.controls.disable();
			kimchi.state.enabled = false;
			kimchi.clock.stop();
			kimchi.$overlay.find('.notice').text('Click to Continue');
			kimchi.$overlay.show();
		},
		'toggle': function (enable) {
			if (enable) {
				kimchi.state.start();
			} else {
				kimchi.state.stop();
			}
		},
		'init': function () {
			var havePointerLock, body, change, error;

			havePointerLock = 'pointerLockElement' in document ||
				'mozPointerLockElement' in document ||
				'webkitPointerLockElement' in document;
			if (!havePointerLock) {
				// TODO we can use FirstPersonControls here instead
				console.log('Your browser does not support Pointer Lock API.');
				return;
			}

			body = document.body;

			change = function (event) {
				kimchi.state.toggle(document.pointerLockElement === body ||
					document.mozPointerLockElement === body ||
					document.webkitPointerLockElement === body);
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

//				kimchi.$overlay.hide();
//				kimchi.state.start();
			});
		}
	};

	// binds
	kimchi.resize = function (width, height) {
		var width = kimchi.$window.width(), height = kimchi.$window.height() - 5;
		kimchi.camera.update(width, height);
		kimchi.renderer.setSize(width, height);
	};



	kimchi.$ = $;
	kimchi.THREE = THREE;

	return kimchi;
}(jQuery, THREE));