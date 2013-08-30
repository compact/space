/**
 * The different flight modes:
 * <br> free: User-controlled flight.
 * <br> auto: Automatically guided flight.
 * @namespace flight
 * @memberOf  module:KIMCHI
 */
var KIMCHI = (function (KIMCHI, $, THREE) {
	'use strict';

	var flight = {}, Mode;
	KIMCHI.flight = flight;


	/**
	 * The current flight mode.
	 * @memberOf module:KIMCHI.flight
	 */
	flight.mode = false; // possible values are 'free', 'auto', and false



	/**
	 * Flight mode.
	 * @param {String} name
	 * @memberOf module:KIMCHI.flight
	 */
	Mode = function (name) {
		this.name = name;
		this.enabled = false;
	};
	/**
	 * Enable.
	 * @memberOf module:KIMCHI.flight.Mode
	 */
	Mode.prototype.enable = function () {
		KIMCHI.$overlay.hide();
		KIMCHI.clock.start();
		flight.mode = this.name;
	};
	/**
	 * Disable.
	 * @memberOf module:KIMCHI.flight.Mode
	 */
	Mode.prototype.disable = function () {
		KIMCHI.clock.stop();
		flight.mode = false;
		KIMCHI.$overlay.show();
		KIMCHI.nav.update();
	};
	/**
	 * Toggle.
	 * @memberOf module:KIMCHI.flight.Mode
	 */
	Mode.prototype.toggle = function (enable) {
		if (typeof enable === 'boolean') {
			if (enable) {
				this.enable();
			} else {
				this.disable();
			}
		} else if (this.enabled) {
			this.enable();
		} else {
			this.disable();
		}
	};
	/**
	 * In this mode, what happens in each animation frame?
	 * @param    {Number} delta
	 * @memberOf module:KIMCHI.flight.Mode
	 */
	Mode.prototype.animationFrame = function (delta) {};
	/**
	 * Shortcut for KIMCHI.rendering.animate(this.animationFrame).
	 * @memberOf module:KIMCHI.flight.Mode
	 */
	Mode.prototype.animate = function () {
		KIMCHI.rendering.animate(this.animationFrame);
	};



	/**
	 * Free flight.
	 * @memberOf module:KIMCHI.flight
	 */
	flight.free = (function () {
		var mode, colliding;

		/**
		 * @returns {Boolean} Whether the camera is current in collision.
		 * @private
		 */
		colliding = (function () {
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
		}());

		mode = new Mode();
		mode.enable = function () {
			Mode.prototype.enable.call(this);

			KIMCHI.pointerLock.unbind();
			$('#hud1').show();
			KIMCHI.rendering.animate(this.animationFrame);
			KIMCHI.controls.enable();
		};
		mode.disable = function () {
			Mode.prototype.disable.call(this);

			KIMCHI.controls.disable();
			$('#hud1').hide();
			KIMCHI.pointerLock.bind();
		};
		mode.animationFrame = function (delta) {
			if (!colliding()) {
				KIMCHI.controls.moveCamera(
					delta,
					flight.getTranslationSpeedMultiplier()
				);
			}

			KIMCHI.space.moveBodies(delta);
			KIMCHI.hud.update(delta);
			KIMCHI.date.setDate(KIMCHI.date.getDate() + 1);
		};

		return mode;
	}());



	/**
	 * Auto flight.
	 * @memberOf module:KIMCHI.flight
	 */
	flight.auto = (function () {
		var mode, panTo, translateTo;

		/**
		 * @private
		 */
		panTo = (function () {
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
						mode.animationFrame(delta);

						t += 0.05;
					} else {
						translateTo(body);
						return false; // stop
					}
				});
			};
		}());

		/**
		 * @private
		 */
		translateTo = function (body) {
			KIMCHI.rendering.animate(function (delta) {
				if (THREE.Object3D.distance(KIMCHI.camera, body.mesh) >=
						body.radius + KIMCHI.config.collisionDistance) {
					KIMCHI.camera.translateZ(-KIMCHI.config.controls.zSpeed * delta *
						flight.getTranslationSpeedMultiplier([body.mesh]));
					mode.animationFrame(delta);
				} else {
					mode.disable();
				}
			});
		};

		mode = new Mode();
		mode.disable = function () {
			Mode.prototype.disable.call(this);

			KIMCHI.notice.clear(); // TODO move this
		};
		mode.animationFrame = function (delta) {
			KIMCHI.space.moveBodyChildren(); // do not move the Body Meshes themselves
			KIMCHI.hud.update(delta);
		};

		/**
		 * @public
		 */
		mode.init = function () {
			KIMCHI.nav.update(); // maybe shouldn't be here

			$('.nav').on('click', 'a', function (event) {
				var name;

				// prevent the overlay from being clicked to trigger free flight mode
				event.stopPropagation();

				name = $(this).data('name');
				if (typeof KIMCHI.space.bodies[name] === 'object') {
					mode.flyTo(KIMCHI.space.bodies[name]);
				} else { // TODO write a general function to get a body
					console.log(name + ' not found in KIMCHI.flight.auto');
				}
			});
		};
		/**
		 * @public
		 */
		mode.flyTo = function (body) {
			KIMCHI.notice.set('Flying to ' + body.name + '...');
			this.enable();
			panTo(body);
			// translateTo(body) is called when panTo(body) ends
			// disable() is called when translateTo(body) ends
			// TODO make function queue for successive setTimeout() calls
		};

		return mode;
	}());



	// Return a number for scaling the camera speed (in each direction) depending
	// on how close the camera is to collideable objects. If the parameter is not
	// given, consider all collideable objects.
	flight.getTranslationSpeedMultiplier = function (object3Ds) {
		var distances = [];

		if (typeof object3Ds === 'undefined') {
			object3Ds = KIMCHI.space.getCollideableObject3Ds();
		}

		// TODO maybe use KIMCHI.space.getBodiesByDistance() as a helper here
		_.forEach(object3Ds, function (object3D) {
			distances.push(THREE.Object3D.distance(KIMCHI.camera, object3D));
		});
		distances.sort(function (a, b) { // sort numerically
			return a - b;
		});
		return distances[0];
	};



	return KIMCHI;
}(KIMCHI || {}, jQuery, THREE));