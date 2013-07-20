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
 * Extensible module for kimchi. Extend like this:
 *
 * var kimchi = (function (kimchi) {
 *   kimchi.foo = ...;
 *   return kimchi;
 * }(kimchi));
 */
var kimchi = (function (jQuery, THREE) {
	'use strict';

	var kimchi = {};



	// functions for rendering, animating using the three.js renderer
	kimchi.rendering = {
		'render': function () {
			kimchi.renderer.render(kimchi.scene, kimchi.camera);
		},
		// callback is called before rendering. If it returns false, stop animating.
		'animate': function (callback) {
			setTimeout(function () { // TODO: remove for production
				var proceed = callback(kimchi.clock.getDelta());

				kimchi.rendering.render();

				// stop the next frame if the user has paused
				if (proceed !== false && kimchi.flight.mode !== false) {
					window.requestAnimationFrame(function () {
						kimchi.rendering.animate(callback);
					});
				}
			}, 50);
		}
	};



	// hud
	kimchi.hud = {};
	kimchi.hud.update = function (delta) {
		var translation = kimchi.controls.getLocalTranslationVector();
		$('#hud-distance-from-sun').text(Math.roundDecimals(kimchi.camera.position.length(), 2, true));
		$('#hud-speed').text(Math.roundDecimals((new THREE.Vector3(
			translation.x * kimchi.config.controls.strafeSpeed,
			translation.y * kimchi.config.controls.strafeSpeed,
			translation.z * kimchi.config.controls.zSpeed
		)).length() * kimchi.flight.getTranslationSpeedMultiplier(), 2, true));
		$('#hud-time').text(kimchi.date.format());

		if (kimchi.config.debug) {
			$('#hud4').html(
				'<strong>Debug</strong><br />' +
				'Delta: ' +
					Math.roundDecimals(delta, 4, true) + '<br />' +
				'Camera position (px): ' +
					Math.round(kimchi.camera.position.x) + ', ' +
					Math.round(kimchi.camera.position.y) + ', ' +
					Math.round(kimchi.camera.position.z) + '<br />' +
				'Camera rotation (deg): ' +
					Math.round(kimchi.camera.rotation.x * 180 / Math.PI) + ', ' +
					Math.round(kimchi.camera.rotation.y * 180 / Math.PI) + ', ' +
					Math.round(kimchi.camera.rotation.z * 180 / Math.PI) + '<br />'
/*			'movement: ' +
					translation.x + ', ' +
					translation.y + ', ' +
					translation.z + '<br />' +*/
			);
		}
	};
	// nav is the navigation that appears when free flight is paused
	kimchi.nav = {};
	kimchi.nav.update = function () {
		kimchi.nav.updateFlyToList();
	};
	kimchi.nav.updateFlyToList = function () {
		var bodies = kimchi.space.getBodiesByDistance();
		$('#nav-fly-to').empty();
		$.each(bodies, function (i, body) {
			$('#nav-fly-to').append(
				$('<li>').append(
					$('<a>').text(body.name).data('name', body.name),
					$('<span>').text(' (' + Math.roundForUser(body.distance) + ' AU)')
				)
			);
		});
	};



	kimchi.size = {
		'width': 1,
		'height': 6,
		'init': function () {
			kimchi.size.set();
			kimchi.$window.on('resize', function () {
				kimchi.size.set();
				kimchi.rendering.animate(kimchi.flight.auto.animationFrame);
			});
		},
		'set': function () {
			kimchi.size.width = kimchi.$window.width();
			kimchi.size.height = kimchi.$window.height() - 5; // TODO
			kimchi.camera.update(kimchi.size.width, kimchi.size.height);
			kimchi.renderer.setSize(kimchi.size.width, kimchi.size.height);
		}
	};



	// a notice box that appears to users
	kimchi.notice = {
		'$notice': $(),
		'init': function () {
			kimchi.notice.$notice = $('#notice');
		},
		'set': function (message) {
			kimchi.notice.$notice.html(message).fadeIn();
		},
		'clear': function () {
			kimchi.notice.$notice.text('').fadeOut();
		}
	}



	kimchi.jQuery = $;
	kimchi.THREE = THREE;

	return kimchi;
}(jQuery, THREE));