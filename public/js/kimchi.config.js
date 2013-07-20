/**
 * kimchi configuration options.
 */

var kimchi = (function (kimchi) {
	kimchi.config = {
		'debug': true,
		'camera': { // for THREE.PerspectiveCamera
			'fov': 45,
			'near': 0.001,
			'far': 10000000
		},
		'controls': { // for THREE.Controls
			'lookSpeed': 0.0002, // pitch/yaw with mouse
			'zSpeed': 1, // move forward/backward with keyboard
			'strafeSpeed': 0.5, // move left/right/up/down with keyboard
			'rollSpeed': 2 // roll with keyboard
		},
		'collisionDistance': 0.1,
		'scales': {
			'radius': 3000 / 149597871, // radii are given in km
			'position': 1 // positions are given in AU
		},
		'orbits': {
			'color': 0xffffcc,
			'opacity': 0.5,
			'lineSegments': 720 // how many lines make up each orbit?
		},
		'sphereSegments': 48,
		'initVector': new THREE.Vector3(0, 0, -10),
		'stars': {
			'scale': 100000,
			'count': 2000
		},
		'notices': {
			'pointerLockNotSupported': 'This website does not work in your current browser since it does not support Pointer Lock API. Please use the latest version of Chrome or Firefox.'
		}
	};
	return kimchi;
}(kimchi));