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
			'lineSegments': 720 // how many lines make up each orbit?
		},
		'sphereSegments': 48,
		'initVector': new THREE.Vector3(0, 0, -10),
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
				'visibleDistance': 1000000,
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
/*			this.textMesh = new THREE.Mesh(
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
*/
			this.$label = $('<div class="label">').text(this.name).appendTo('body');
		},
		// contains instances of space.Body
		'bodies': {},
		'setBodies': function () {
			$.each(kimchi.space.data, function (i, options) {
				kimchi.space.bodies[options.name] = new kimchi.space.Body(options);
			});
		},
		// return an array of Object3Ds objects for each spaces.bodies
		'getObject3Ds': function () {
			var objects = [];
			$.each(kimchi.space.bodies, function (name, body) {
				objects.push(body.mesh, body.line); // , body.textMesh
			});
			return objects;
		},
		'move': function (delta) { // TODO use delta
			$.each(kimchi.space.bodies, function (name, body) {
				var distance, scale;

				// move the body mesh (custom function)
				body.move();

				kimchi.space.update();
			});
		},
		'update': function () {
			// update the positioning of all elements that don't move in move()
			$.each(kimchi.space.bodies, function (name, body) {
				var distance = kimchi.camera.position.distanceTo(body.mesh.position);

				// move the text mesh
/*			if (distance > body.visibleDistance) {
					body.textMesh.visible = false;
				} else {
					body.textMesh.visible = true;

					scale = distance / 1000;
					body.textMesh.scale.set(scale, scale, scale);

					// the text mesh always face the camera
					body.textMesh.rotation.copy(kimchi.camera.rotation.clone());

					// move it in front of the associated mesh so it's not hidden inside
					body.textMesh.geometry.computeBoundingSphere();
					var v = kimchi.camera.position.clone().sub(body.mesh.position)
						.normalize().multiplyScalar(body.radius + 0.01);
					var w = body.mesh.position.clone().add(v);
					var x = body.mesh.position.clone().cross(v).cross(v)
						.normalize().multiplyScalar(
							body.textMesh.geometry.boundingSphere.radius / 100
						);
					body.textMesh.position.copy(w);//.add(x));
				}
*/

				// overlay text labels on top of the canvas
				if (distance > body.visibleDistance) { // too far away
					body.$label.hide();
				} else {
					var projector = new THREE.Projector();
					var v = projector.projectVector(body.mesh.position.clone(), kimchi.camera);
					var left = (v.x + 1) / 2 * kimchi.size.width;
					var top = (1 - v.y) / 2 * kimchi.size.height;

					if (left < -body.$label.outerWidth() || left > kimchi.size.width || top < -body.$label.outerHeight() || top > kimchi.size.height) {
						// the body is not visible on screen
						body.$label.hide();
					} else {
						body.$label.css({
							'left': left - body.$label.outerWidth() / 2,
							'top': top - body.$label.outerHeight() / 2,
						}).show();
					}
				}
			});
		},
		// returns an array of Mesh objects set to be collideable with the camera
		'getCollideableObject3Ds': function () {
			var object3Ds = [];
			$.each(kimchi.space.bodies, function (name, body) {
				if (body.collideable) {
					object3Ds.push(body.mesh);
				}
			});
			return object3Ds;
		}
	};



	// functions for rendering, animating using the three.js renderer
	kimchi.rendering = {
		'render': function () {
			kimchi.renderer.render(kimchi.scene, kimchi.camera);
		},
		// callback is called before rendering. If it returns false, stop animating.
		'animate': function (callback) {
			setTimeout(function () { // TODO: remove for production
				var proceed = callback(kimchi.clock.getDelta());

				kimchi.rendering.render();

				// stop the next frame if the user has paused
				if (proceed !== false && kimchi.flight.mode !== false) {
					window.requestAnimationFrame(function () {
						kimchi.rendering.animate(callback);
					});
				}
			}, 50);
		}
	};
	// return whether the camera is colliding with an object along the current
	// movement direction
	kimchi.colliding = function () {
		var translationVector, raycaster, intersection;

		translationVector = kimchi.controls.getLocalTranslationVector();

		// scaling may be necessary if translationVector's magnitude is much larger
		// or smaller than the camera position
//		translationVector.multiplyScalar(1000);

		if (translationVector.length() === 0) { // not moving, can't be colliding
			return false;
		}

		raycaster = new THREE.Raycaster(
			kimchi.camera.position.clone(),
			// calculation based on http://stackoverflow.com/questions/11473755/how-to-detect-collision-in-three-js
			kimchi.camera.localToWorld(translationVector).sub(kimchi.camera.position),
//			kimchi.camera.position.clone().sub(translationVector.applyMatrix4(kimchi.camera.matrix)),
			0,
			kimchi.config.collisionDistance
		);
		intersection = raycaster.intersectObjects(
			kimchi.space.getCollideableObject3Ds()
		);
		return intersection.length > 0;
	};
	// return a number for scaling the camera speed (in each direction) depending
	// on how close the camera is to collideable objects
	kimchi.getTranslationSpeedMultiplier = function () {
		var distances = [];

		$.each(kimchi.space.getCollideableObject3Ds(), function (i, object3D) {
			distances.push(kimchi.camera.position.distanceTo(object3D.position));
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
			'<strong>Debug</strong><br />' +
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



	kimchi.flight = {
		'mode': false, // possible values are 'free', 'auto', and false
		'free': {
			'start': function () {
				kimchi.pointerLock.unbind();
				kimchi.$overlay.hide();
				$('#hud1').show();

				kimchi.clock.start();
				kimchi.flight.mode = 'free';
				kimchi.rendering.animate(kimchi.flight.free.animate);
				kimchi.controls.enable();
			},
			'stop': function () {
				kimchi.controls.disable();
				kimchi.flight.mode = false;
				kimchi.clock.stop();

				$('#hud1').hide();
				kimchi.$overlay.show();

				kimchi.pointerLock.bind();
			},
			'toggle': function (enable) {
				if (enable) {
					kimchi.flight.free.start();
				} else {
					kimchi.flight.free.stop();
				}
			},
			'animate': function (delta) {
				if (!kimchi.colliding()) {
					kimchi.controls.moveCamera(
						delta,
						kimchi.getTranslationSpeedMultiplier()
					);
				}

				kimchi.space.move(delta);
				kimchi.hud.update(delta);
				kimchi.date.setDate(kimchi.date.getDate() + 1);
			}
		},
		'auto': {
			'init': function () {
				$('.nav').on('click', 'a', function (event) {
					var name;

					// prevent the overlay from being clicked to trigger free flight mode
					event.stopPropagation();

					name = $(this).data('name');
					if (typeof kimchi.space.bodies[name] === 'object') {
						kimchi.flight.auto.flyTo(kimchi.space.bodies[name]);
					} else {
						console.log(name + ' not found in kimchi.flight.auto')
					}
				});
			},
			'flyTo': function (body) {
				// set notice
				kimchi.notice.set('Flying to ' + body.name + '...');

				kimchi.flight.auto.panTo(body);
				kimchi.flight.auto.translateTo(body);
			},
			'panTo': function (body) {
				var rotationMatrix, initQuaternion, targetQuaternion, t;

				rotationMatrix = new THREE.Matrix4();
				rotationMatrix.lookAt(kimchi.camera.position, body.mesh.position, kimchi.camera.up);

				kimchi.camera.useQuaternion = true;
				initQuaternion = kimchi.camera.quaternion.clone();

				targetQuaternion = new THREE.Quaternion();
				targetQuaternion.setFromRotationMatrix(rotationMatrix);

				t = 0;
				kimchi.flight.mode = 'auto';
				kimchi.rendering.animate(function (delta) {
					// avoid rounding imprecision because we want the final rotation to be
					// centered exactly onto the target body (t = 1)
					if (t > 1 && t < 1 + 0.05) {
						t = 1;
					}

					if (t <= 1) {
						kimchi.camera.quaternion.copy(
							initQuaternion.slerp(targetQuaternion, t)
						);
						kimchi.flight.auto.animate(delta);

						t += 0.05;
					} else {
						return false;
					}
				});
			},
			'translateTo': function (body) {

			},
			'animate': function (delta) {
				kimchi.space.update();
				kimchi.hud.update(delta);
			}
		}
	};



	// pointer lock
	kimchi.pointerLock = {
		'request': function () {
			document.body.requestPointerLock();
			console.log((new Date()) + ' pointer lock requested');
			console.log(document.pointerLockElement ||
					document.mozPointerLockElement ||
					document.webkitPointerLockElement);
		},
		'bind': function () {
			kimchi.$document.on('keydown', kimchi.pointerLock.keydown);
		},
		'unbind': function () {
			kimchi.$document.off('keydown', kimchi.pointerLock.keydown);
		},
		'keydownInProgress': false,
		'keydown': function (event) {
			// Request pointer lock only on keyup; otherwise, the continued Escape
			// keydown event causes the pointer lock to disable immediately, even
			// if one lets go of the Escape key asap. Also, the flag
			// kimchi.pointerLock.keydownInProgress prevents multiple handlers of
			// .one('keyup') from being binded.
			if (event.which === 27) { // Esc
				kimchi.pointerLock.keydownInProgress = true;
				$(this).one('keyup', function (event) {
					if (event.which === 27 && kimchi.pointerLock.keydownInProgress) {
						kimchi.pointerLock.request();
						kimchi.pointerLock.keydownInProgress = false;
					}
				});
			}
		},
		'click': function (event) {
			kimchi.pointerLock.request();
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

//			kimchi.pointerLock.request = body.requestPointerLock ||
//				body.mozRequestPointerLock || body.webkitRequestPointerLock;

			change = function (event) {
				kimchi.flight.free.toggle(document.pointerLockElement === body ||
					document.mozPointerLockElement === body ||
					document.webkitPointerLockElement === body);
			}
			document.addEventListener('pointerlockchange', change, false);
			document.addEventListener('mozpointerlockchange', change, false);
			document.addEventListener('webkitpointerlockchange', change, false);

			error = function (event) {
				console.log('Pointer Lock error:');
				console.log(event);
			}
			document.addEventListener('pointerlockerror', error, false);
			document.addEventListener('mozpointerlockerror', error, false);
			document.addEventListener('webkitpointerlockerror', error, false);

			// used in request()
			// don't set this function to another var since the caller has to be body
			body.requestPointerLock = body.requestPointerLock ||
				body.mozRequestPointerLock || body.webkitRequestPointerLock;

			// the initial flight state is false, so bind the relevant event handlers
			kimchi.$overlay.on('click', kimchi.pointerLock.click);
			kimchi.pointerLock.bind();
		}
	};



	kimchi.size = {
		'width': 9,
		'height': 9,
		'init': function () {
			kimchi.size.set();
			kimchi.$window.on('resize', function () {
				kimchi.size.set();
				kimchi.rendering.animate(kimchi.flight.auto.animate);
			});
		},
		'set': function () {
			kimchi.size.width = kimchi.$window.width();
			kimchi.size.height = kimchi.$window.height() - 5;
			kimchi.camera.update(kimchi.size.width, kimchi.size.height);
			kimchi.renderer.setSize(kimchi.size.width, kimchi.size.height);
		}
	};



	// a notice box that appears to users
	kimchi.notice = {
		'$notice': $(),
		'init': function () {
			kimchi.notice.$notice = $('#notice');
		},
		'set': function (message) {
			kimchi.notice.$notice.html(message).fadeIn();
		},
		'hide': function () {
			kimchi.notice.$notice.text('').fadeOut();
		}
	}




	kimchi.$ = $;
	kimchi.THREE = THREE;

	return kimchi;
}(jQuery, THREE));