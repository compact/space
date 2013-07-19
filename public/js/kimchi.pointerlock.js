/**
 * Pointer lock state (not controls, which is handled by three.controls.js).
 */

var kimchi = (function (kimchi) {
	var $ = kimchi.jQuery;

	kimchi.pointerLock = {};

	// request pointer lock from the browser, called whenever the user enters free
	// flight mode
	kimchi.pointerLock.request = function () {
		document.body.requestPointerLock();
		console.log((new Date()) + ' pointer lock requested');
		console.log(document.pointerLockElement ||
				document.mozPointerLockElement ||
				document.webkitPointerLockElement);
	};

	// has to be called once, before any pointer lock requests
	kimchi.pointerLock.init = function () {
		var havePointerLock, body, change, error;

		havePointerLock = 'pointerLockElement' in document ||
			'mozPointerLockElement' in document ||
			'webkitPointerLockElement' in document;
		if (!havePointerLock) {
			// TODO we can use FirstPersonControls here instead
			kimchi.notice.set(kimchi.config.notices.pointerLockNotSupported);
			return;
		}

		body = document.body;

		// used in request()
		// don't set this function to another var since the caller has to be body
		body.requestPointerLock = body.requestPointerLock ||
			body.mozRequestPointerLock || body.webkitRequestPointerLock;

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

		// the initial flight state is false, so bind the relevant event handlers
		kimchi.$overlay.on('click', kimchi.pointerLock.click);
		kimchi.pointerLock.bind();
	};



	// events
	kimchi.pointerLock.bind = function () {
		kimchi.$document.on('keydown', kimchi.pointerLock.keydown);
	};
	kimchi.pointerLock.unbind = function () {
		kimchi.$document.off('keydown', kimchi.pointerLock.keydown);
	};
	kimchi.pointerLock.keydownInProgress = false,
	kimchi.pointerLock.keydown = function (event) {
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
	};
	kimchi.pointerLock.click = function (event) {
		kimchi.pointerLock.request();
	};

	return kimchi;
}(kimchi));