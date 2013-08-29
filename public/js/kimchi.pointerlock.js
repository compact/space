/**
 * Pointer lock state (not controls, which is handled by three.controls.js).
 */

var KIMCHI = (function (KIMCHI, $) {
	'use strict';

	var pointerLock = {};

	// request pointer lock from the browser, called whenever the user enters free
	// flight mode
	pointerLock.request = function () {
		document.body.requestPointerLock();
		console.log((new Date()) + ' pointer lock requested');
		console.log(document.pointerLockElement ||
				document.mozPointerLockElement ||
				document.webkitPointerLockElement);
	};

	// has to be called once, before any pointer lock requests
	pointerLock.init = function () {
		var havePointerLock, body, change, error;

		havePointerLock = 'pointerLockElement' in document ||
			'mozPointerLockElement' in document ||
			'webkitPointerLockElement' in document;
		if (!havePointerLock) {
			// TODO we can use FirstPersonControls here instead
			KIMCHI.notice.set(KIMCHI.config.notices.pointerLockNotSupported);
			return;
		}

		body = document.body;

		// used in request()
		// don't set this function to another var since the caller has to be body
		body.requestPointerLock = body.requestPointerLock ||
			body.mozRequestPointerLock || body.webkitRequestPointerLock;

		change = function () {
			KIMCHI.flight.free.toggle(document.pointerLockElement === body ||
				document.mozPointerLockElement === body ||
				document.webkitPointerLockElement === body);
		};
		document.addEventListener('pointerlockchange', change, false);
		document.addEventListener('mozpointerlockchange', change, false);
		document.addEventListener('webkitpointerlockchange', change, false);

		error = function (event) {
			console.log('Pointer Lock error:');
			console.log(event);
		};
		document.addEventListener('pointerlockerror', error, false);
		document.addEventListener('mozpointerlockerror', error, false);
		document.addEventListener('webkitpointerlockerror', error, false);

		// the initial flight state is false, so bind the relevant event handlers
		KIMCHI.$overlay.on('click', pointerLock.click);
		pointerLock.bind();
	};



	// events
	pointerLock.bind = function () {
		KIMCHI.$document.on('keydown', pointerLock.keydown);
	};
	pointerLock.unbind = function () {
		KIMCHI.$document.off('keydown', pointerLock.keydown);
	};
	pointerLock.keydownInProgress = false;
	pointerLock.keydown = function (event) {
		// Request pointer lock only on keyup; otherwise, the continued Escape
		// keydown event causes the pointer lock to disable immediately, even
		// if one lets go of the Escape key asap. Also, the flag
		// pointerLock.keydownInProgress prevents multiple handlers of
		// .one('keyup') from being binded.
		if (event.which === 27) { // Esc
			pointerLock.keydownInProgress = true;
			$(this).one('keyup', function (event) {
				if (event.which === 27 && pointerLock.keydownInProgress) {
					pointerLock.request();
					pointerLock.keydownInProgress = false;
				}
			});
		}
	};
	pointerLock.click = function () {
		pointerLock.request();
	};

	KIMCHI.pointerLock = pointerLock;

	return KIMCHI;
}(KIMCHI || {}, jQuery));