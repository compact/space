/**
 * @author mrdoob / http://mrdoob.com/
 * Based on PointerLockControls.js. Edited by Chris.
 */

(function ($, THREE) {
	THREE.Controls = function (camera, options) {
		options = $.extend({
			'lookSpeed': 0.001,
			'moveSpeed': 100,
			'strafeSpeed': 100,
			'rollSpeed': 1
		}, options);

		var self, states, events, $document;

		self = this;

		states = {
			'moveForward': false,
			'moveBackward': false,
			'moveLeft': false,
			'moveRight': false,
			'moveUp': false,
			'moveDown': false,
			'rollLeft': false,
			'rollRight': false
		};

		$document = $(document);

		// unit vectors
		if (typeof THREE.unitVectors !== 'object') {
			THREE.unitVectors = {
				'i': new THREE.Vector3(1, 0, 0),
				'j': new THREE.Vector3(0, 1, 0),
				'k': new THREE.Vector3(0, 0, 1)
			};
		}

		events = {
			'mousemove': function (event) {
				var movementX, movementY;

				if (!self.enabled) {
					return;
				}

				movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
				movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;

				camera.rotateOnAxis(THREE.unitVectors.j, -movementX * options.lookSpeed);
				camera.rotateOnAxis(THREE.unitVectors.i, -movementY * options.lookSpeed);
			},
			'keydown': function (event) {
				switch (event.which) {
					case 38: case 87: states.moveForward = true; break; // up, W
					case 40: case 83: states.moveBackward = true; break; // down, S
					case 37: case 65: states.moveLeft = true; break; // left, A
					case 39: case 68: states.moveRight = true; break; // right, D
					case 82: states.moveUp = true; break; // R
					case 70: states.moveDown = true; break; // F
					case 81: states.rollLeft = true; break; // Q
					case 69: states.rollRight = true; break; // E
				}
			},
			'keyup': function (event) {
				switch(event.which) {
					case 38: case 87: states.moveForward = false; break; // up, W
					case 40: case 83: states.moveBackward = false; break; // down, S
					case 37: case 65: states.moveLeft = false; break; // left, A
					case 39: case 68: states.moveRight = false; break; // right, D
					case 82: states.moveUp = false; break; // R
					case 70: states.moveDown = false; break; // F
					case 81: states.rollLeft = false; break; // Q
					case 69: states.rollRight = false; break; // E
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

		this.update = function (delta) {
			var translationVector = new THREE.Vector3();

			if (!self.enabled) {
				return;
			}

			// translate
			if (states.moveForward) translationVector.z -= delta * options.moveSpeed;
			if (states.moveBackward) translationVector.z += delta * options.moveSpeed;

			if (states.moveLeft) translationVector.x -= delta * options.strafeSpeed;
			if (states.moveRight) translationVector.x += delta * options.strafeSpeed;

			if (states.moveUp) translationVector.y += delta * options.strafeSpeed;
			if (states.moveDown) translationVector.y -= delta * options.strafeSpeed;

			camera.translateX(translationVector.x);
			camera.translateY(translationVector.y);
			camera.translateZ(translationVector.z);


			// rotate
			if (states.rollLeft) {
				camera.rotateOnAxis(THREE.unitVectors.k, -delta * options.rollSpeed);
			}
			if (states.rollRight) {
				camera.rotateOnAxis(THREE.unitVectors.k, delta * options.rollSpeed);
			}


			$('#hud2').html(
				'position (px): ' +
					Math.round(camera.position.x) + ', ' +
					Math.round(camera.position.y) + ', ' +
					Math.round(camera.position.z) + '<br />' +
				'rotation (deg): ' +
					Math.round(camera.rotation.x * 180 / Math.PI) + ', ' +
					Math.round(camera.rotation.y * 180 / Math.PI) + ', ' +
					Math.round(camera.rotation.z * 180 / Math.PI) + '<br />' +
				'movement vector (px): ' +
					Math.round(translationVector.x) + ', ' +
					Math.round(translationVector.y) + ', ' +
					Math.round(translationVector.z)
			);

			translationVector.set(0, 0, 0);
		};
	};
}(jQuery, THREE));