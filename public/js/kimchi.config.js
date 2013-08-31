/**
 * KIMCHI configuration options.
 * @namespace config
 * @memberOf module:KIMCHI
 */
var KIMCHI = (function (KIMCHI, THREE) {
  'use strict';

  KIMCHI.config = {
    'debug': true,
    'camera': {
      'fov': 45, // for THREE.PerspectiveCamera
      'near': 0.000001, // for THREE.PerspectiveCamera
      'far': 10000000, // for THREE.PerspectiveCamera
      'initialPosition': new THREE.Vector3(0, 0, -30)
    },
    'controls': { // for THREE.Controls
      'lookSpeed': 0.0002, // pitch/yaw with mouse
      'zSpeed': 1, // move forward/backward with keyboard
      'strafeSpeed': 0.5, // move left/right/up/down with keyboard
      'rollSpeed': 2 // roll with keyboard
    },
    'scales': {
      'radius': 10 / 149597871, // radii are given in km
      'position': 1 // positions are given in AU
    },
    'orbits': {
      'color': 0xffffcc,
      'opacity': 0.5,
      'lineSegments': 720 // how many lines make up each orbit?
    },
    'sphereSegments': 48,
    'stars': {
      'scale': 100000,
      'count': 2000
    },
    'notices': {
      'pointerLockNotSupported': 'This website does not work in your current browser since it does not support Pointer Lock API. Please use the latest version of Chrome or Firefox.'
    },
    'months': ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
      'Oct', 'Nov', 'Dec']
  };

  return KIMCHI;
}(KIMCHI || {}, THREE));