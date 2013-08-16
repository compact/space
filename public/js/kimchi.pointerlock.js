/**
 * Pointer lock state (not controls, which is handled by three.controls.js).
 */

var KIMCHI = (function (KIMCHI, $) {
	'use strict';

	KIMCHI.pointerLock = {};

	// request pointer lock from the browser, called whenever the user enters free
	// flight mode
	KIMCHI.pointerLock.request = function () {
		document.body.requestPointerLock();
		console.log((new Date()) + ' pointer lock requested');
		console.log(document.pointerLockElement ||
				document.mozPointerLockElement ||
				document.webkitPointerLockElement);
	};

	// has to be called once, before any pointer lock requests
	KIMCHI.pointerLock.init = function () {
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
		KIMCHI.$overlay.on('click', KIMCHI.pointerLock.click);
		KIMCHI.pointerLock.bind();
	};



	// events
	KIMCHI.pointerLock.bind = function () {
		KIMCHI.$document.on('keydown', KIMCHI.pointerLock.keydown);
	};
	KIMCHI.pointerLock.unbind = function () {
		KIMCHI.$document.off('keydown', KIMCHI.pointerLock.keydown);
	};
	KIMCHI.pointerLock.keydownInProgress = false;
	KIMCHI.pointerLock.keydown = function (event) {
		// Request pointer lock only on keyup; otherwise, the continued Escape
		// keydown event causes the pointer lock to disable immediately, even
		// if one lets go of the Escape key asap. Also, the flag
		// KIMCHI.pointerLock.keydownInProgress prevents multiple handlers of
		// .one('keyup') from being binded.
		if (event.which === 27) { // Esc
			KIMCHI.pointerLock.keydownInProgress = true;
			$(this).one('keyup', function (event) {
				if (event.which === 27 && KIMCHI.pointerLock.keydownInProgress) {
					KIMCHI.pointerLock.request();
					KIMCHI.pointerLock.keydownInProgress = false;
				}
			});
		}
	};
	KIMCHI.pointerLock.click = function () {
		KIMCHI.pointerLock.request();
	};

	return KIMCHI;
}(KIMCHI, jQuery));