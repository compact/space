/**
 * @author mrdoob / http://mrdoob.com/
 * Based on PointerLockControls.js. Edited by Chris.
 * Requires THREE.unitVectors, as defined in index.js.
 */

(function ($, THREE) {
	'use strict';

	THREE.Controls = function (camera, options) {
		var self = this;

		this.camera = camera;
		this.options = $.extend({
			'lookSpeed': 0.00025,
			'zSpeed': 500,
			'strafeSpeed': 500,
			'rollSpeed': 2
		}, options);

/* used in PointerLockControls, but doesn't seem necessary
		yawObject takes the place of the camera object
		var pitchObject = new THREE.Object3D();
		pitchObject.add(camera);
		var yawObject = new THREE.Object3D();
		yawObject.add(pitchObject);
		scene.add(yawObject);
*/

		this.resetStates();
		this.$document = $(document);

		// event handlers; not a propotype property for convenient reference to self
		this.events = {
			'mousemove': function (event) {
				var movementX, movementY;

				if (!self.enabled) {
					return;
				}

				movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
				movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;

				// TODO perform the rotation in update() instead of here -Chris
				self.camera.rotateOnAxis(THREE.unitVectors.x, -movementY * self.options.lookSpeed);
				self.camera.rotateOnAxis(THREE.unitVectors.y, -movementX * self.options.lookSpeed);
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
				switch (event.which) {
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
	};

	THREE.Controls.prototype.resetStates = function () {
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
	};

	// enable/disable
	THREE.Controls.prototype.enabled = false;
	THREE.Controls.prototype.enable = function () {
		this.$document.on({
			'keydown': this.events.keydown,
			'keyup': this.events.keyup
		});

		// not using jQuery to get event.movementX properties
		document.addEventListener('mousemove', this.events.mousemove, false);

		this.enabled = true;
	};
	THREE.Controls.prototype.disable = function () {
		this.resetStates();
		this.$document.off({
			'mousemove': this.events.mousemove,
			'keydown': this.events.keydown,
			'keyup': this.events.keyup
		});
		this.enabled = false;
	};

	// speedMultiplier is delta, applies to all movements (translations and
	// rotations
	THREE.Controls.prototype.moveCamera = function (speedMultiplier, translationSpeedMultiplier) {
		var translationVector = new THREE.Vector3(), angle = 0;

		if (!this.enabled) {
			return;
		}

		// translate
		translationVector = this.getLocalTranslationVector();
		this.camera.translateX(translationVector.x * this.options.strafeSpeed *
			speedMultiplier * translationSpeedMultiplier);
		this.camera.translateY(translationVector.y * this.options.strafeSpeed *
			speedMultiplier * translationSpeedMultiplier);
		this.camera.translateZ(translationVector.z * this.options.zSpeed *
			speedMultiplier * translationSpeedMultiplier);

		// rotate
		if (this.states.rollLeft) {
			angle -= this.options.rollSpeed * speedMultiplier;
		}
		if (this.states.rollRight) {
			angle += this.options.rollSpeed * speedMultiplier;
		}
		this.camera.rotateOnAxis(THREE.unitVectors.z, angle);
	};

	// Return a Vector3 object corresponding to the current local movement
	// direction(s). To check whether the camera is currently moving, call
	// .getTranslationVector().length() > 0
	THREE.Controls.prototype.getLocalTranslationVector = function () {
		var vector = new THREE.Vector3();

		if (!this.enabled) {
			return vector;
		}

		if (this.states.moveForward) {
			vector.add(THREE.unitVectors.negZ);
		}
		if (this.states.moveBackward) {
			vector.add(THREE.unitVectors.z);
		}
		if (this.states.moveLeft) {
			vector.add(THREE.unitVectors.negX);
		}
		if (this.states.moveRight) {
			vector.add(THREE.unitVectors.x);
		}
		if (this.states.moveUp) {
			vector.add(THREE.unitVectors.y);
		}
		if (this.states.moveDown) {
			vector.add(THREE.unitVectors.negY);
		}
		return vector;
	};
	// Not used.
	THREE.Controls.prototype.getWorldTranslationVector = function () {
		return this.camera.localToWorld(this.getLocalTranslationVector());
	};
}(jQuery, THREE));