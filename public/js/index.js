/**
 * Bugs:
 * Sometimes pointerlock is disabled on start, don't know why.
 */

var kimchi = (function (kimchi) {
	'use strict';

	$(function () {
		kimchi.$document = $(document);
		kimchi.$window = $(window);
		kimchi.$overlay = $('#overlay');

		kimchi.clock = new THREE.Clock(false); // do not autostart

		// scene
		kimchi.scene = new THREE.Scene();
		// camera: don't use OrthographicCamera because it lacks perspective
		kimchi.camera = new THREE.PerspectiveCamera(
			kimchi.config.camera.fov,
			1,
			kimchi.config.camera.near,
			kimchi.config.camera.far
		);
		// renderer
		kimchi.renderer = new THREE.WebGLRenderer({
			'antialias': true
		});
		// set camera size and renderer size
		kimchi.size.init();



		// add astronomical objects
		kimchi.space.setBodies();
		kimchi.scene.addMultiple(kimchi.space.getObject3Ds());

		// add background stars, an array of ParticleSystems
		kimchi.scene.addMultiple(new THREE.Stars(kimchi.config.stars));
/*var m = new THREE.Mesh(
	new THREE.SphereGeometry(0.1, 45, 45),
	new THREE.MeshBasicMaterial({
		'color': 0xffffff
	})
);
m.position.copy(new THREE.Vector3(0, 0.38709893, 0));
kimchi.scene.add(m);
*/

		// lighting
		kimchi.lights = {};
		// sunlight
		kimchi.lights.sun = new THREE.PointLight(0xffffee, 2, 100);
		kimchi.lights.sun.position.set(0, 0, -5);
		kimchi.scene.add(kimchi.lights.sun);
		// ambient light: remove for production TODO
		kimchi.scene.add(new THREE.AmbientLight(0xff8800));



		// first person controls
		kimchi.controls = new THREE.Controls(kimchi.camera, kimchi.config.controls);



		// initialize camera position and rotation
		kimchi.camera.position.copy(kimchi.config.initVector);
		kimchi.camera.lookAt(new THREE.Vector3(0, 0, 0));
		// render() has to be called to set the camera position for objects and
		// elements to appear in animate()
		kimchi.rendering.render();
		kimchi.rendering.animate(kimchi.flight.auto.animationFrame);



		// add renderer to DOM
		$('body').append(kimchi.renderer.domElement);
		kimchi.date = new Date();
		// bind
		kimchi.pointerLock.init();
		kimchi.flight.auto.init();
		kimchi.notice.init();
	});

	return kimchi;
}(kimchi));