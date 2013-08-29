// precision is the number of decimals
Math.roundDecimals = function (number, precision, trailingZeroes) {
	var multiplier, result;
	multiplier = Math.pow(10, precision);
	result = Math.round(number * multiplier) / multiplier;
	if (typeof trailingZeroes === 'boolean' && trailingZeroes) {
		result = result.toFixed(precision);
	}
	return result;
};
Math.roundForUser = function (number) {
	if (number < 1) {
		return Math.roundDecimals(number, 2);
	} else if (number < 10) {
		return Math.roundDecimals(number, 1);
	} else {
		return Math.round(number);
	}
};

Date.months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
	'Oct', 'Nov', 'Dec'];
Date.prototype.format = function () {
	return Date.months[this.getMonth()] + ' ' + this.getDate() + ', ' + this.getFullYear();
};



/**
 * Extensible module for KIMCHI. Extend like this:
 *
 * var KIMCHI = (function (KIMCHI) {
 *   KIMCHI.foo = ...;
 *   return KIMCHI;
 * }(KIMCHI));
 */
var KIMCHI = (function (KIMCHI, $, THREE) {
	'use strict';



	// functions for rendering, animating using the three.js renderer
	KIMCHI.rendering = {
		'render': function () {
			KIMCHI.renderer.render(KIMCHI.scene, KIMCHI.camera);
		},
		// callback is called before rendering. If it returns false, stop animating.
		'animate': function (callback) {
			setTimeout(function () { // TODO: remove for production
				var proceed = callback(KIMCHI.clock.getDelta());

				KIMCHI.rendering.render();

				// stop the next frame if the user has paused
				if (proceed !== false && KIMCHI.flight.mode !== false) {
					window.requestAnimationFrame(function () {
						KIMCHI.rendering.animate(callback);
					});
				}
			}, 50);
		}
	};



	// hud
	KIMCHI.hud = {};
	KIMCHI.hud.update = function (delta) {
		var translation = KIMCHI.controls.getLocalTranslationVector();
		$('#hud-distance-from-sun').text(Math.roundDecimals(KIMCHI.camera.position.length(), 2, true));
		$('#hud-speed').text(Math.roundDecimals((new THREE.Vector3(
			translation.x * KIMCHI.config.controls.strafeSpeed,
			translation.y * KIMCHI.config.controls.strafeSpeed,
			translation.z * KIMCHI.config.controls.zSpeed
		)).length() * KIMCHI.flight.getTranslationSpeedMultiplier(), 2, true));
		$('#hud-time').text(KIMCHI.date.format());

		if (KIMCHI.config.debug) {
			$('#hud4').html(
				'<strong>Debug</strong><br />' +
				'Delta: ' +
					Math.roundDecimals(delta, 4, true) + '<br />' +
				'Camera position (px): ' +
					Math.round(KIMCHI.camera.position.x) + ', ' +
					Math.round(KIMCHI.camera.position.y) + ', ' +
					Math.round(KIMCHI.camera.position.z) + '<br />' +
				'Camera rotation (deg): ' +
					Math.round(KIMCHI.camera.rotation.x * 180 / Math.PI) + ', ' +
					Math.round(KIMCHI.camera.rotation.y * 180 / Math.PI) + ', ' +
					Math.round(KIMCHI.camera.rotation.z * 180 / Math.PI) + '<br />'
/*			'movement: ' +
					translation.x + ', ' +
					translation.y + ', ' +
					translation.z + '<br />' +*/
			);
		}
	};



	// nav is the navigation that appears when free flight is paused
	KIMCHI.nav = {};
	KIMCHI.nav.update = function () {
		KIMCHI.nav.updateFlyToList();
	};
	KIMCHI.nav.updateFlyToList = function () {
		var bodies = KIMCHI.space.getBodiesByDistance();
		$('#nav-fly-to').empty();
		_.forEach(bodies, function (i, body) {
			$('#nav-fly-to').append(
				$('<li>').append(
					$('<a>').text(body.name).data('name', body.name),
					$('<span>').text(' (' + Math.roundForUser(body.distance) + ' AU)')
				)
			);
		});
	};



	KIMCHI.size = {
		'width': 0,
		'height': 0,
		'init': function () {
			KIMCHI.size.update();
			KIMCHI.$window.on('resize', function () {
				KIMCHI.size.update();
				KIMCHI.rendering.animate(KIMCHI.flight.auto.animationFrame);
			});
		},
		'update': function () {
			KIMCHI.size.width = KIMCHI.$window.width();
			KIMCHI.size.height = KIMCHI.$window.height() - 5; // TODO
			KIMCHI.camera.update(KIMCHI.size.width, KIMCHI.size.height);
			KIMCHI.renderer.setSize(KIMCHI.size.width, KIMCHI.size.height);
		}
	};



	// a notice box that appears to users
	KIMCHI.notice = {
		'$notice': $(),
		'init': function () {
			KIMCHI.notice.$notice = $('#notice');
		},
		'set': function (message) {
			KIMCHI.notice.$notice.html(message).fadeIn();
		},
		'clear': function () {
			KIMCHI.notice.$notice.text('').fadeOut();
		}
	};



	return KIMCHI;
}(KIMCHI || {}, jQuery, THREE));