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

  // for THREE.PerspectiveCamera
  config['camera-fov'] = 45; 
  config['camera-near'] = 0.000001;
  config['camera-far'] = 10000000;
  // for KIMCHI.init()
  config['camera-initial-position'] = new THREE.Vector3(0, 0, -30);

  // for THREE.Controls
  config['controls-look-speed'] = 0.0002; // pitch/yaw with mouse
  config['controls-z-speed'] = 1; // move forward/backward with keyboard
  config['controls-strafe-speed'] = 0.5; // move left/right/up/down with keyboard
  config['controls-roll-speed'] = 2; // roll with keyboard

  // for the astronomical bodies in KIMCHI.space
  config['sphere-segments'] = 48;
  config['scales-radius'] = 10 / 149597871; // radii are given in km
  config['scales-position'] = 1; // positions are given in au

  // for the orbits in KIMCHI.space
  config['show-orbits'] = true;
  config['orbits-color'] = 0xffffcc;
  config['orbits-opacity'] = 0.5;
  config['orbits-line-segments'] = 720; // how many lines make up each orbit?

  // for THREE.Stars
  config['stars-scale'] = 100000;
  config['stars-count'] = 2000;

  config['notices-pointer-lock-not-supported'] = 'This website does not work in your current browser since it does not support Pointer Lock API. Please use the latest version of Chrome or Firefox.';
  config['notices-fly-to'] = function (body) {
    return 'Flying to ' + body.name + '...<br />Press Esc to stop.';
  };

  config['language-months'] = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  /**
   * @param   {String} name  Config key.
   * @param   {String} value 'true' and 'false' have to be converted to Boolean.
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
  };

  return KIMCHI;
}(KIMCHI || {}, THREE));