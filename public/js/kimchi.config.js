/**
 * KIMCHI configuration settings. We call the 'global' KIMCHI settings here
 *   'config' while settings for submodules are 'options'.
 * @namespace config
 * @memberOf  module:KIMCHI
 */
var KIMCHI = (function (KIMCHI, _, THREE) {
  'use strict';

  var config = {}, settings = {}, handlers = {};
  KIMCHI.config = config;



  /**
   * An object storing all the config values by key.
   * @alias    settings
   * @private
   * @memberOf module:KIMCHI.config
   */

  // for dev testing
  settings['debug'] = true;

  // for THREE.PerspectiveCamera
  settings['camera-fov'] = 45; 
  settings['camera-near'] = 0.000001;
  settings['camera-far'] = 10000000;
  // for KIMCHI.init()
  settings['camera-initial-position'] = new THREE.Vector3(0, 0, -5);

  // for THREE.Controls
  settings['controls-look-speed'] = 0.0002; // pitch/yaw with mouse
  settings['controls-z-speed'] = 1; // move forward/backward with keyboard
  settings['controls-strafe-speed'] = 0.5; // move left/right/up/down with keyboard
  settings['controls-roll-speed'] = 2; // roll with keyboard
  settings['controls-flying-speed-multiplier'] = 1; // user setting

  // lighting
  settings['ambient-lighting'] = false;

  // for the astronomical bodies in KIMCHI.space
  settings['rotate-bodies'] = true;
  settings['time-on'] = false; // pause the movement of Bodies
  settings['show-labels'] = true;
  settings['sphere-segments'] = 48;
  settings['scales-size'] = 1;
  settings['scales-position'] = 1;

  // for the orbits in KIMCHI.space
  settings['show-orbits'] = true;
  settings['orbits-color'] = 0xffffcc;
  settings['orbits-opacity'] = 0.5;
  settings['orbits-line-segments'] = 720; // how many lines make up each orbit?

  // for THREE.Stars
  settings['show-stars'] = true;
  settings['stars-scale'] = 100000;
  settings['stars-count'] = 2000;

  // for KIMCHI.ui.notice
  settings['notices-pointer-lock-not-supported'] = 'This website does not work in your current browser since it does not support Pointer Lock API. Please use the latest version of Chrome or Firefox.';
  settings['notices-fly-to'] = function (body) {
    return 'Flying to ' + body.name + '...<br />Press Esc to stop.';
  };

  // language constants
  settings['language-months'] = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  settings['language-fly-to'] = 'Fly there!';



  /**
   * Handlers for config setting value changes. A handler is not required for
   *   each config setting.
   * @alias    handlers
   * @private
   * @memberOf module:KIMCHI.config
   */

  handlers['time-on'] = function (value) {
    if (value) {
      KIMCHI.time.on();
    } else {
      KIMCHI.time.off();
    }
  };

  handlers['scales-size'] = function (value) {
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

  handlers['ambient-lighting'] = function (value) {
    KIMCHI.lights.ambient.visible = value;
  };

  handlers['show-labels'] = function (value) {
    _.forEach(KIMCHI.space.getLabelMeshes(), function (mesh) {
      mesh.visible = value;
    });
  };

  handlers['show-orbits'] = function (value) {
    _.forEach(KIMCHI.space.getOrbitLines(), function (line) {
      line.visible = value;
    });
  };

  handlers['show-stars'] = function (value) {
    _.each(KIMCHI.stars, function (particleSystem) {
      particleSystem.visible = value;
    });
  };

  handlers['controls-flying-speed-multiplier'] = function (value) {
    KIMCHI.controls.options.zSpeed = settings['controls-z-speed'] * value;
    KIMCHI.controls.options.strafeSpeed = settings['controls-strafe-speed'] * value;
    KIMCHI.controls.options.rollSpeed = settings['controls-roll-speed'] * value;
  };

  handlers['controls-look-speed'] = function (value) {
    KIMCHI.controls.options.lookSpeed = value;
  };



  /**
   * User configurable settings are stored in localStorage. This function sets
   *   them.
   * @memberOf module:KIMCHI.config
   */
  config.init = function () {
    var userConfigurableKeys = [
      'rotate-bodies',
      'time-on',
      'scales-size',
      'ambient-lighting',
      'show-labels',
      'show-orbits',
      'show-stars',
      'controls-flying-speed-multiplier',
      'controls-look-speed'
    ];

    _.assign(settings, window.localStorage);
    _.forEach(userConfigurableKeys, function (key) {
      config.set(key, settings[key]);
    });
  };

  /**
   * @param    {String} key
   * @returns  {String|Boolean|Number}
   * @memberOf module:KIMCHI.config
   */
  config.get = function (key) {
    return settings[key];
  };

  /**
   * @param    {String} key
   * @param    {String} value May be 'true' or 'false', which get converted to
   *   Boolean.
   * @memberOf module:KIMCHI.config
   */
  config.set = function (key, value) {
    // parse value
    if (value === 'true') {
      value = true;
    } else if (value === 'false') {
      value = false;
    } else if (/^\-?[0-9]+(\.[0-9]+)?$/.test(value)) {
      value = Number(value);
    }

    // set the setting
    settings[key] = value;
    // set the setting in localStorage
    window.localStorage[key] = value;
    // call the handler if it exists
    if (typeof handlers[key] === 'function') {
      handlers[key](value);
    }

    console.log('set config: ' + key + ' = ' + value);

    // update the config user interface
    KIMCHI.ui.panel.updateConfig(key, value);
  };



  return KIMCHI;
}(KIMCHI || {}, _, THREE));