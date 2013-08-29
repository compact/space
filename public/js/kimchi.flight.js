/**
 * KIMCHI.flight contains the different flight modes:
 *   free: User-controlled flight.
 *   auto: Automatically guided flight.
 */

var KIMCHI = (function (KIMCHI, $, THREE) {
	'use strict';

	var flight = {};
	flight.mode = false; // possible values are 'free', 'auto', and false



	// free flight
	flight.free = {
		'start': function () {
			KIMCHI.pointerLock.unbind();
			KIMCHI.$overlay.hide();
			$('#hud1').show();

			KIMCHI.clock.start();
			flight.mode = 'free';
			KIMCHI.rendering.animate(flight.free.animationFrame);
			KIMCHI.controls.enable();
		},
		'stop': function () {
			KIMCHI.controls.disable();
			flight.mode = false;
			KIMCHI.clock.stop();

			$('#hud1').hide();
			KIMCHI.$overlay.show();
			KIMCHI.nav.update();

			KIMCHI.pointerLock.bind();
		},
		'toggle': function (enable) {
			if (enable) {
				flight.free.start();
			} else {
				flight.free.stop();
			}
		},
		'animationFrame': function (delta) {
			if (!flight.free.colliding()) {
				KIMCHI.controls.moveCamera(
					delta,
					flight.getTranslationSpeedMultiplier()
				);
			}

			KIMCHI.space.move(delta);
			KIMCHI.hud.update(delta);
			KIMCHI.date.setDate(KIMCHI.date.getDate() + 1);
		},
		// Return whether the camera is colliding with an object along the current
		// movement direction.
		'colliding': (function () {
			var translationVector, raycaster, intersection;

			raycaster = new THREE.Raycaster();

			return function () {
				translationVector = KIMCHI.controls.getLocalTranslationVector();

				// scaling may be necessary if translationVector's magnitude is much larger
				// or smaller than the camera position
	//		translationVector.multiplyScalar(1000);

				if (translationVector.length() === 0) { // not moving, can't be colliding
					return false;
				}

				raycaster.set(
					KIMCHI.camera.position.clone(),
					// calculation based on http://stackoverflow.com/questions/11473755/how-to-detect-collision-in-three-js
					KIMCHI.camera.localToWorld(translationVector)
						.sub(KIMCHI.camera.position)
//				KIMCHI.camera.position.clone().sub(translationVector.applyMatrix4(KIMCHI.camera.matrix)),
				);

				// TODO make this variably dependent on body radius
				raycaster.far = KIMCHI.config.collisionDistance;

				intersection = raycaster.intersectObjects(
					KIMCHI.space.getCollideableObject3Ds()
				);
				return intersection.length > 0;
			};
		}())
	};



	flight.auto = {
		'init': function () {
			KIMCHI.nav.update(); // maybe shouldn't be here

			$('.nav').on('click', 'a', function (event) {
				var name;

				// prevent the overlay from being clicked to trigger free flight mode
				event.stopPropagation();

				name = $(this).data('name');
				if (typeof KIMCHI.space.bodies[name] === 'object') {
					flight.auto.flyTo(KIMCHI.space.bodies[name]);
				} else { // TODO write a general function to get a body
					console.log(name + ' not found in flight.auto');
				}
			});
		},
		'start': function () {
			KIMCHI.$overlay.hide();
			KIMCHI.clock.start();
			flight.mode = 'auto';
		},
		'stop': function () {
			KIMCHI.clock.stop();
			flight.mode = false;
			KIMCHI.notice.clear(); // TODO move this
			KIMCHI.$overlay.show();
			KIMCHI.nav.update();
		},
		'flyTo': function (body) {
			KIMCHI.notice.set('Flying to ' + body.name + '...');
			flight.auto.start();
			flight.auto.panTo(body);
			// translateTo(body) is called when panTo(body) ends
			// stop() is called when translateTo(body) ends
			// TODO make function queue for successive setTimeout() calls
		},
		'panTo': (function () {
			var initQuaternion, rotationMatrix, targetQuaternion, t;

			rotationMatrix = new THREE.Matrix4();
			targetQuaternion = new THREE.Quaternion();

			return function (body) {
				initQuaternion = KIMCHI.camera.quaternion.clone();

				rotationMatrix.lookAt(
					KIMCHI.camera.position,
					body.mesh.position,
					KIMCHI.camera.up
				);

				targetQuaternion.setFromRotationMatrix(rotationMatrix);

				t = 0;
				KIMCHI.rendering.animate(function (delta) {
					// avoid rounding imprecision because we want the final rotation to be
					// centered exactly onto the target body (t = 1)
					if (t > 1 && t < 1 + 0.05) {
						t = 1;
					}

					if (t <= 1) {
						KIMCHI.camera.quaternion.copy(
							initQuaternion.slerp(targetQuaternion, t)
						);
						flight.auto.animationFrame(delta);

						t += 0.05;
					} else {
						flight.auto.translateTo(body);
						return false; // stop
					}
				});
			};
		}()),
		'translateTo': function (body) {
			KIMCHI.rendering.animate(function (delta) {
				if (THREE.Object3D.distance(KIMCHI.camera, body.mesh) >=
						body.radius + KIMCHI.config.collisionDistance) {
					KIMCHI.camera.translateZ(-KIMCHI.config.controls.zSpeed * delta *
						flight.getTranslationSpeedMultiplier([body.mesh]));
					flight.auto.animationFrame(delta);
				} else {
					flight.auto.stop();
				}
			});
		},
		'animationFrame': function (delta) {
			KIMCHI.space.update();
			KIMCHI.hud.update(delta);
//			KIMCHI.nav.update(); // TODO remove
		}
	};



	// Return a number for scaling the camera speed (in each direction) depending
	// on how close the camera is to collideable objects. If the parameter is not
	// given, consider all collideable objects.
	flight.getTranslationSpeedMultiplier = function (object3Ds) {
		var distances = [];

		if (typeof object3Ds === 'undefined') {
			object3Ds = KIMCHI.space.getCollideableObject3Ds();
		}

		// TODO maybe use KIMCHI.space.getBodiesByDistance() as a helper here
		$.each(object3Ds, function (i, object3D) {
			distances.push(THREE.Object3D.distance(KIMCHI.camera, object3D));
		});
		distances.sort(function (a, b) { // sort numerically
			return a - b;
		});
		return distances[0];
	};



	KIMCHI.flight = flight;
	return KIMCHI;
}(KIMCHI || {}, jQuery, THREE));