/**
 * KIMCHI configuration options.
 * @namespace config
 * @memberOf  module:KIMCHI
 */
var KIMCHI = (function (KIMCHI, _, THREE) {
  'use strict';

  var config = {}, setConfigHandlers = {};
  KIMCHI.config = config;

  // for dev testing
  config['debug'] = true;

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
  config['controls-flying-speed-multiplier'] = 1; // user setting

  // lighting
  config['ambient-lighting'] = false;

  // for the astronomical bodies in KIMCHI.space
  config['rotate'] = true;
  config['time-on'] = false; // pause the movement of Bodies
  config['show-labels'] = true;
  config['sphere-segments'] = 48;
  config['scales-size'] = 1;
  config['scales-position'] = 1;

  // for the orbits in KIMCHI.space
  config['show-orbits'] = true;
  config['orbits-color'] = 0xffffcc;
  config['orbits-opacity'] = 0.5;
  config['orbits-line-segments'] = 720; // how many lines make up each orbit?

  // for THREE.Stars
  config['show-stars'] = true;
  config['stars-scale'] = 100000;
  config['stars-count'] = 2000;

  // for KIMCHI.ui.notice
  config['notices-pointer-lock-not-supported'] = 'This website does not work in your current browser since it does not support Pointer Lock API. Please use the latest version of Chrome or Firefox.';
  config['notices-fly-to'] = function (body) {
    return 'Flying to ' + body.name + '...<br />Press Esc to stop.';
  };

  // language constants
  config['language-months'] = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  config['language-fly-to'] = 'Fly there!';



  /**
   * User configurable settings are stored in localStorage. This function sets
   *   them.
   * @memberOf KIMCHI
   */
  KIMCHI.initConfig = function () {
    var userConfigurableKeys = [
      'rotate',
      'time-on',
      'scales-size',
      'ambient-lighting',
      'show-labels',
      'show-orbits',
      'show-stars',
      'controls-flying-speed-multiplier',
      'controls-look-speed'
    ];

    _.assign(config, window.localStorage);
    _.forEach(userConfigurableKeys, function (key) {
      KIMCHI.setConfig(key, config[key]);
    });
  };

  /**
   * @param   {String} key   The key in KIMCHI.config.
   * @param   {String} value 'true' and 'false' have to be converted to
   *   Boolean.
   * @memberOf KIMCHI
   */
  KIMCHI.setConfig = function (key, value) {
    // parse value
    if (value === 'true') {
      value = true;
    } else if (value === 'false') {
      value = false;
    } else if (/^\-?[0-9]+(\.[0-9]+)?$/.test(value)) {
      value = Number(value);
    }

    // set config
    config[key] = value;
    // set config in localStorage
    window.localStorage[key] = value;
    // call handler, if it exists
    if (typeof setConfigHandlers[key] === 'function') {
      setConfigHandlers[key](value);
    }

    console.log('set config: ' + key + ' = ' + value);

    // update the config user interface
    KIMCHI.ui.panel.updateConfig(key, value);
  };

  setConfigHandlers['rotate'] = function (value) {
  };

  setConfigHandlers['time-on'] = function (value) {
    if (value) {
      KIMCHI.time.on();
    } else {
      KIMCHI.time.off();
    }
  };

  setConfigHandlers['scales-size'] = function (value) {
    if (value === 'large') {
      _.forEach(KIMCHI.space.getBodies(), function (body) {
        body.mesh.scale.setXYZ(0.1 / body.radius);
      });
    } else { // value is a Number
      _.forEach(KIMCHI.space.getMeshes(), function (mesh) {
        mesh.scale.setXYZ(value);
      });
    }
  };

  setConfigHandlers['ambient-lighting'] = function (value) {
    KIMCHI.lights.ambient.visible = value;
  };

  setConfigHandlers['show-labels'] = function (value) {
    _.forEach(KIMCHI.space.getLabelMeshes(), function (mesh) {
      mesh.visible = value;
    });
  };

  setConfigHandlers['show-orbits'] = function (value) {
    _.forEach(KIMCHI.space.getOrbitLines(), function (line) {
      line.visible = value;
    });
  };

  setConfigHandlers['show-stars'] = function (value) {
    _.each(KIMCHI.stars, function (particleSystem) {
      particleSystem.visible = value;
    });
  };

  setConfigHandlers['controls-flying-speed-multiplier'] = function (value) {
    KIMCHI.controls.options.zSpeed = config['controls-z-speed'] * value;
    KIMCHI.controls.options.strafeSpeed = config['controls-strafe-speed'] * value;
    KIMCHI.controls.options.rollSpeed = config['controls-roll-speed'] * value;
  };

  setConfigHandlers['controls-look-speed'] = function (value) {
    KIMCHI.controls.options.lookSpeed = value;
  };

  return KIMCHI;
}(KIMCHI || {}, _, THREE));