/**
 * KIMCHI configuration options.
 * @namespace config
 * @memberOf module:KIMCHI
 */
var KIMCHI = (function (KIMCHI, THREE) {
  'use strict';

  var config = {};
  KIMCHI.config = config;

  config.debug = true;

  config.camera = {
    'fov': 45, // for THREE.PerspectiveCamera
    'near': 0.000001, // for THREE.PerspectiveCamera
    'far': 10000000, // for THREE.PerspectiveCamera
    'initialPosition': new THREE.Vector3(0, 0, -30)
  };
  config.controls = { // for THREE.Controls
    'lookSpeed': 0.0002, // pitch/yaw with mouse
    'zSpeed': 1, // move forward/backward with keyboard
    'strafeSpeed': 0.5, // move left/right/up/down with keyboard
    'rollSpeed': 2 // roll with keyboard
  };

  // space config
  config.scales = {
    'radius': 10 / 149597871, // radii are given in km
    'position': 1 // positions are given in au
  };
  config.orbits = {
    'color': 0xffffcc,
    'opacity': 0.5,
    'lineSegments': 720 // how many lines make up each orbit?
  };
  config.sphereSegments = 48;

  config.stars = {
    'scale': 100000,
    'count': 2000
  };

  config.notices = {
    'pointerLockNotSupported': 'This website does not work in your current browser since it does not support Pointer Lock API. Please use the latest version of Chrome or Firefox.',
    'flyTo': function (body) {
      return 'Flying to ' + body.name + '...<br />Press Esc to stop.';
    }
  };
  config.language = {
    'months': ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
      'Oct', 'Nov', 'Dec']
  };

  /**
   * @param   {String} name  Config key.
   * @param   {String} value 'true' and 'false' have to be converted to Boolean.
   * @returns {Object}       The value, type converted.
   */
  KIMCHI.setConfig = function (name, value) {
    var $button, addClass, removeClass;

    // find the button before value gets changed
    $button = $('.setting').find('input[name="' + name + '"][value="' + value +
      '"]').parent();

    // parse value
    if (value === 'true') {
      value = true;
    } else if (value === 'false') {
      value = false;
    }/* TODO else if (/^\-?[0-9]+(\.[0-9]+)?$/.test(value)) {
      value = Number(value);
    }*/

    // set config
    config[name] = value;

    console.log('setting: ' + name + ' = ' + value);

    if (value === true) {
      removeClass = 'btn-danger';
      addClass = 'btn-success';
    } else if (value === false) {
      removeClass = 'btn-success';
      addClass = 'btn-danger';
    } else {
      removeClass = 'btn-primary';
      addClass = 'btn-primary';
    }
    $button.siblings().removeClass(removeClass);
    $button.addClass(addClass);

    return value;
  };

  return KIMCHI;
}(KIMCHI || {}, THREE));