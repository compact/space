/**
 * @author mrdoob / http://mrdoob.com/
 * Based on PointerLockControls.js. Edited by Chris.
 * Requires THREE.unitVectors, as defined in index.js.
 */

(function ($, THREE) {
	'use strict';

	THREE.Controls = function (camera, options) {
		options = $.extend({
			'lookSpeed': 0.00025,
			'zSpeed': 500,
			'strafeSpeed': 500,
			'rollSpeed': 2
		}, options);

		var self, events, $document;

		self = this;

/* used in PointerLockControls, but doesn't seem necessary
		yawObject takes the place of the camera object
		var pitchObject = new THREE.Object3D();
		pitchObject.add(camera);
		var yawObject = new THREE.Object3D();
		yawObject.add(pitchObject);
		scene.add(yawObject);
*/

		$document = $(document);

		this.states = {
			'moveForward': false,
			'moveBackward': false,
			'moveLeft': false,
			'moveRight': false,
			'moveUp': false,
			'moveDown': false,
			'rollLeft': false,
			'rollRight': false
		};

		events = {
			'mousemove': function (event) {
				var movementX, movementY;

				if (!self.enabled) {
					return;
				}

				movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
				movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;

				// TODO perform the rotation in update() instead of here -Chris
				camera.rotateOnAxis(THREE.unitVectors.x, -movementY * options.lookSpeed);
				camera.rotateOnAxis(THREE.unitVectors.y, -movementX * options.lookSpeed);
			},
			'keydown': function (event) {
				switch (event.which) {
					case 38: case 87: self.states.moveForward = true; break; // up, W
					case 40: case 83: self.states.moveBackward = true; break; // down, S
					case 37: case 65: self.states.moveLeft = true; break; // left, A
					case 39: case 68: self.states.moveRight = true; break; // right, D
					case 82: self.states.moveUp = true; break; // R
					case 70: self.states.moveDown = true; break; // F
					case 81: self.states.rollLeft = true; break; // Q
					case 69: self.states.rollRight = true; break; // E
				}
			},
			'keyup': function (event) {
				switch(event.which) {
					case 38: case 87: self.states.moveForward = false; break; // up, W
					case 40: case 83: self.states.moveBackward = false; break; // down, S
					case 37: case 65: self.states.moveLeft = false; break; // left, A
					case 39: case 68: self.states.moveRight = false; break; // right, D
					case 82: self.states.moveUp = false; break; // R
					case 70: self.states.moveDown = false; break; // F
					case 81: self.states.rollLeft = false; break; // Q
					case 69: self.states.rollRight = false; break; // E
				}
			}
		};

		// enable/disable
		this.enabled = false;
		this.enable = function () {
			$document.on({
				'keydown': events.keydown,
				'keyup': events.keyup
			});

			// not using jQuery to get event.movementX properties
			document.addEventListener('mousemove', events.mousemove, false);

			this.enabled = true;
		};
		this.disable = function () {
			$document.off({
				'mousemove': events.mousemove,
				'keydown': events.keydown,
				'keyup': events.keyup
			});
			this.enabled = false;
		};

		// speedMultiplier is delta, applies to all movements (translations and
		// rotations
		this.moveCamera = function (speedMultiplier, translationSpeedMultiplier) {
			var translationVector = new THREE.Vector3(), angle = 0;

			if (!self.enabled) {
				return;
			}

			// translate
			var translationVector = this.getLocalTranslationVector();
			camera.translateX(translationVector.x * options.strafeSpeed *
				speedMultiplier * translationSpeedMultiplier);
			camera.translateY(translationVector.y * options.strafeSpeed *
				speedMultiplier * translationSpeedMultiplier);
			camera.translateZ(translationVector.z * options.zSpeed *
				speedMultiplier * translationSpeedMultiplier);

			// rotate
			if (self.states.rollLeft) {
				angle -= options.rollSpeed * speedMultiplier;
			}
			if (self.states.rollRight) {
				angle += options.rollSpeed * speedMultiplier;
			}
			camera.rotateOnAxis(THREE.unitVectors.z, angle);
		};

		// Return a Vector3 object corresponding to the current local movement
		// direction(s).
		// To check whether the camera is currently moving, call
		// .getTranslationVector().length() > 0
		this.getLocalTranslationVector = function () {
			var vector = new THREE.Vector3();

			if (!self.enabled) {
				return vector;
			}

			if (self.states.moveForward) {
				vector.add(THREE.unitVectors.negZ);
			}
			if (self.states.moveBackward) {
				vector.add(THREE.unitVectors.z);
			}
			if (self.states.moveLeft) {
				vector.add(THREE.unitVectors.negX);
			}
			if (self.states.moveRight) {
				vector.add(THREE.unitVectors.x);
			}
			if (self.states.moveUp) {
				vector.add(THREE.unitVectors.y);
			}
			if (self.states.moveDown) {
				vector.add(THREE.unitVectors.negY);
			}
			return vector;
		};
		// Not used.
		this.getWorldTranslationVector = function () {
			return camera.localToWorld(this.getLocalTranslationVector());
		};
	};
}(jQuery, THREE));