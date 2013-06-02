/**
 * @author mrdoob / http://mrdoob.com/
 * Based on PointerLockControls.js. Edited by Chris.
 */

THREE.Controls = function (camera, options) {
	options = $.extend({
		'lookSpeed': 0.001,
		'moveSpeed': 100,
		'strafeSpeed': 100,
		'rollSpeed': 1
	}, options);

	var self = this;

	var moveForward = false;
	var moveBackward = false;
	var moveLeft = false;
	var moveRight = false;
	var moveUp = false;
	var moveDown = false;
	var rollLeft = false;
	var rollRight = false;

	var translationVector = new THREE.Vector3();

	var $document = $(document);

	// unit vectors
	var i, j, k;
	i = new THREE.Vector3(1, 0, 0);
	j = new THREE.Vector3(0, 1, 0);
	k = new THREE.Vector3(0, 0, 1);

	var onMouseMove = function (event) {
		if (!self.enabled) {
			return;
		}

		var movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
		var movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;
console.log('moving');
		camera.rotateOnAxis(j, -movementX * options.lookSpeed);
		camera.rotateOnAxis(i, -movementY * options.lookSpeed);
	};

	var onKeyDown = function (event) {
		switch (event.keyCode) {
			case 38: // up
			case 87: // w
				moveForward = true;
				break;

			case 37: // left
			case 65: // a
				moveLeft = true;
				break;

			case 40: // down
			case 83: // s
				moveBackward = true;
				break;

			case 39: // right
			case 68: // d
				moveRight = true;
				break;

			case 82: /*R*/ moveUp = true; break;
			case 70: /*F*/ moveDown = true; break;

			case 81: /*Q*/ rollLeft = true; break;
			case 69: /*E*/ rollRight = true; break;
		}
	};

	var onKeyUp = function (event) {
		switch(event.keyCode) {
			case 38: // up
			case 87: // w
				moveForward = false;
				break;

			case 37: // left
			case 65: // a
				moveLeft = false;
				break;

			case 40: // down
			case 83: // a
				moveBackward = false;
				break;

			case 39: // right
			case 68: // d
				moveRight = false;
				break;

			case 82: /*R*/ moveUp = false; break;
			case 70: /*F*/ moveDown = false; break;

			case 81: /*Q*/ rollLeft = false; break;
			case 69: /*E*/ rollRight = false; break;
		}
	};

	// enable/disable
	this.enabled = false;
	this.enable = function () {
		$document.on({
			'keydown': onKeyDown,
			'keyup': onKeyUp
		});

		// not using jQuery to get event.movementX properties
		document.addEventListener('mousemove', onMouseMove, false);

		this.enabled = true;
	};
	this.disable = function () {
		$document.off({
			'mousemove': onMouseMove,
			'keydown': onKeyDown,
			'keyup': onKeyUp
		});
		this.enabled = false;
	};

	this.update = function (delta) {
		if (!self.enabled) {
			return;
		}

		// translate
		if (moveForward) translationVector.z -= delta * options.moveSpeed;
		if (moveBackward) translationVector.z += delta * options.moveSpeed;

		if (moveLeft) translationVector.x -= delta * options.strafeSpeed;
		if (moveRight) translationVector.x += delta * options.strafeSpeed;

		if (moveUp) translationVector.y += delta * options.strafeSpeed;
		if (moveDown) translationVector.y -= delta * options.strafeSpeed;

		camera.translateX(translationVector.x);
		camera.translateY(translationVector.y);
		camera.translateZ(translationVector.z);


		// rotate
		if (rollLeft) {
			camera.rotateOnAxis(k, -delta * options.rollSpeed);
		}
		if (rollRight) {
			camera.rotateOnAxis(k, delta * options.rollSpeed);
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
		console.log('q');
		translationVector.set(0, 0, 0);
	};
};