/**
 * Bugs:
 * Sometimes pointerlock is disabled on start, don't know why.
 */

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

var kimchi = (function (kimchi) {
	'use strict';

	$(function () {
		kimchi.$window = $(window);
		kimchi.$overlay = $('#overlay');

		// clock used for movement speed
		kimchi.clock = new THREE.Clock();

		// scene
		kimchi.scene = new THREE.Scene();
		// camera: don't use OrthographicCamera because it lacks perspective
		kimchi.camera = new THREE.PerspectiveCamera();
		// renderer
		kimchi.renderer = new THREE.WebGLRenderer();
		// set camera size and renderer size
		kimchi.resize();



		// add astronomical objects
		kimchi.space.setBodies();
		kimchi.scene.addMultiple(kimchi.space.getObject3Ds());

		// add background stars, an array of ParticleSystems
		kimchi.scene.addMultiple(new THREE.Stars(kimchi.config.stars));



		// lighting
		kimchi.lights = {};
		// sunlight
		kimchi.lights.sun = new THREE.PointLight(0xffffee, 10, 123456);
		kimchi.lights.sun.position.set(0, 0, 0);
		kimchi.scene.add(kimchi.lights.sun);
		// ambient light: remove for production
		kimchi.scene.add(new THREE.AmbientLight(0x888888));



		// first person controls
		kimchi.controls = new THREE.Controls(kimchi.camera, kimchi.config.controls);



		// animate: render repeatedly
		kimchi.camera.position.z = kimchi.config.startingZ;
		kimchi.camera.lookAt(new THREE.Vector3(0, 0, 0));
		kimchi.animate();



		// add renderer to DOM
		$('body').append(kimchi.renderer.domElement);
		// bind
		kimchi.setPointerLock();
		kimchi.$window.on('resize', kimchi.resize);
	});

	return kimchi;
}(kimchi));