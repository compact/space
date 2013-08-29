var KIMCHI = (function (KIMCHI, $) {
	'use strict';

	/**
	 * Pointer lock state (not controls, which are handled by three.controls.js).
	 * @namespace pointerLock
	 * @memberOf KIMCHI
	 */
	var pointerLock = {};
	KIMCHI.pointerLock = pointerLock;

	/**
	 * Request pointer lock from the browser. This is called whenever the user
	 * enters free flight mode.
	 * @memberOf pointerLock
	 */
	pointerLock.request = function () {
		pointerLock.requestPointerLock.call(document.body);
		console.log((new Date()) + ' pointer lock requested');
		console.log(document.pointerLockElement ||
				document.mozPointerLockElement ||
				document.webkitPointerLockElement);
	};

	/**
	 * Has to be called once, before any pointer lock requests.
	 * @memberOf pointerLock
	 */
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

		/**
		 * The browser's requestPointerLock function, used in
		 * {@link pointerLock.request}.
		 * @memberOf pointerLock
		 */
		pointerLock.requestPointerLock = body.requestPointerLock ||
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



	/**
	 * Bind the event handlers for triggering the request of pointer lock.
	 * @memberOf pointerLock
	 */
	pointerLock.bind = function () {
		KIMCHI.$document.on('keydown', pointerLock.keydown);
	};
	/**
	 * Unbind the event handlers for triggering the request of pointer lock.
	 * @memberOf pointerLock
	 */
	pointerLock.unbind = function () {
		KIMCHI.$document.off('keydown', pointerLock.keydown);
	};
	/**
	 * The event handler for pressing Escape to request pointer lock. We request
	 * pointer lock only on keyup; otherwise, the continued Escape keydown event
	 * causes the pointer lock to disable immediately, even if one lets go of the
	 * Escape key asap. Also, the flag pointerLock.keydownInProgress prevents
	 * multiple handlers of .one('keyup') from being binded.
	 * @memberOf pointerLock
	 */
	pointerLock.keydown = function (event) {
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
	/**
	 * Whether the keydown key (Escape, in our case) is currently being pressed.
	 * @memberOf pointerLock
	 */
	pointerLock.keydownInProgress = false;
	/**
	 * The event handler for clicking to request pointer lock.
	 * @memberOf pointerLock
	 */
	pointerLock.click = function () {
		pointerLock.request();
	};



	return KIMCHI;
}(KIMCHI || {}, jQuery));