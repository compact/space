/**
 * Bugs:
 * Sometimes pointerlock is disabled on start, don't know why.
 */

var KIMCHI = (function (KIMCHI, $, THREE) {
	'use strict';

	$(function () {
		KIMCHI.$document = $(document);
		KIMCHI.$window = $(window);
		KIMCHI.$overlay = $('#overlay');

		KIMCHI.clock = new THREE.Clock(false); // do not autostart

		// scene
		KIMCHI.scene = new THREE.Scene();
		// camera: don't use OrthographicCamera because it lacks perspective
		KIMCHI.camera = new THREE.PerspectiveCamera(
			KIMCHI.config.camera.fov,
			1,
			KIMCHI.config.camera.near,
			KIMCHI.config.camera.far
		);
		// renderer
		KIMCHI.renderer = new THREE.WebGLRenderer({
			'antialias': true
		});
		// set camera size and renderer size
		KIMCHI.size.init();



		// add astronomical objects
		KIMCHI.space.setBodies();
		KIMCHI.scene.addMultiple(KIMCHI.space.getObject3Ds());

		// add background stars, an array of ParticleSystems
		KIMCHI.scene.addMultiple(new THREE.Stars(KIMCHI.config.stars));
/*var m = new THREE.Mesh(
	new THREE.SphereGeometry(0.1, 45, 45),
	new THREE.MeshBasicMaterial({
		'color': 0xffffff
	})
);
m.position.copy(new THREE.Vector3(0, 0.38709893, 0));
KIMCHI.scene.add(m);
*/

		// lighting
		KIMCHI.lights = {};
		// sunlight
		KIMCHI.lights.sun = new THREE.PointLight(0xffffee, 2, 100);
		KIMCHI.lights.sun.position.set(0, 0, -5);
		KIMCHI.scene.add(KIMCHI.lights.sun);
		// ambient light: remove for production TODO
		KIMCHI.scene.add(new THREE.AmbientLight(0xff0000));



		// first person controls
		KIMCHI.controls = new THREE.Controls(KIMCHI.camera, KIMCHI.config.controls);



		// initialize camera position and rotation
		KIMCHI.camera.position.copy(KIMCHI.config.initVector);
		KIMCHI.camera.lookAt(new THREE.Vector3(0, 0, 0));
		// render() has to be called to set the camera position for objects and
		// elements to appear in animate()
		KIMCHI.rendering.render();
		KIMCHI.rendering.animate(KIMCHI.flight.auto.animationFrame);



		// add renderer to DOM
		$('body').append(KIMCHI.renderer.domElement);
		KIMCHI.date = new Date();
		// bind
		KIMCHI.pointerLock.init();
		KIMCHI.flight.auto.init();
		KIMCHI.notice.init();
	});

	return KIMCHI;
}(KIMCHI, jQuery, THREE));