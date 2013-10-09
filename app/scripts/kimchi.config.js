/**
 * KIMCHI configuration settings. We call the 'global' KIMCHI settings here
 *   'config' while settings for submodules are 'options'.
 * @namespace config
 * @memberOf  module:KIMCHI
 */
var KIMCHI = (function (KIMCHI, _, THREE) {
  'use strict';

  var config = {}, settings = {}, handlers = {}, parse;
  KIMCHI.config = config;


  /**
   * An object storing all the config values by key.
   * @alias    settings
   * @private
   * @memberOf module:KIMCHI.config
   */

  // for dev testing
  settings.debug = true;

  // for THREE.PerspectiveCamera
  settings.cameraFov = 45;
  settings.cameraNear = 0.001;
  settings.cameraFar = 1000;
  // for KIMCHI.init()
  settings.cameraInitialPosition = new THREE.Vector3(0, 0, -5);

  // for THREE.Controls
  settings.controlsLookSpeed = 0.0002; // pitch/yaw with mouse
  // these three values are determined by base value * multiplier; do not change
  // them directly
  settings.controlsZSpeed = 1; // move forward/backward with keyboard
  settings.controlsStrafeSpeed = 0.5; // move left/right/up/down with keyboard
  settings.controlsRollSpeed = 2; // roll with keyboard
  // base values
  settings.controlsBaseZSpeed = 1;
  settings.controlsBaseStrafeSpeed = 0.5;
  settings.controlsBaseRollSpeed = 2;
  // multiplier
  settings.controlsKeyboardSpeedMultiplier = 1; // user setting

  // lighting
  settings.ambientLight = false;

  // for the astronomical bodies in KIMCHI.space
  settings.rotateBodies = true;
  settings.bodiesSpeed = 0;
  settings.showLabels = true;
  settings.sphereSegments = 64;
  settings.bodiesSizeScale = 1;
  settings.bodiesPositionScale = 1;

  // for the orbits in KIMCHI.space
  settings.showOrbits = true;
  settings.orbitsColor = 0xffffcc;
  settings.orbitsOpacity = 0.5;
  settings.orbitsLineSegments = 1080; // how many lines make up each orbit?

  // for THREE.Stars
  settings.showStars = true;
  settings.starsScale = 100000;
  settings.starsCount = 2000;

  // for KIMCHI.ui.notice
  settings.noticePointerLockNotSupported = 'This website does not work in your current browser since it does not support Pointer Lock API. Please use the latest version of Chrome or Firefox.';
  settings.noticeFlyTo = function (body) {
    return 'Flying to ' + body.name + '...<br />Press Esc to stop.';
  };

  // language constants
  settings.langMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  settings.langFlyTo = 'Fly there!';
  settings.langWebGLNotSupported = 'Your browser does not support WebGL. Please go to <a href="http://get.webgl.org/">get.webgl.org</a> for more information.';
  settings.langWebGLError = 'WebGL failed to initialize in your browser. Please go to <a href="http://get.webgl.org/troubleshooting">get.webgl.org/troubleshooting</a> to fix the issue.';



  /**
   * Handlers for config setting value changes. A handler is not required for
   *   each config setting.
   * @alias    handlers
   * @private
   * @memberOf module:KIMCHI.config
   */
  handlers.bodiesSpeed = function (value) {
    KIMCHI.time.setStep(value);
  };
  handlers.bodiesSizeScale = function (value) {
    _.each(KIMCHI.space.getBodies(), function (body) {
      body.setScale(value);
    });
    KIMCHI.renderer.render();
  };
  handlers.ambientLight = function (value) {
    KIMCHI.lights.ambient.visible = value;
    KIMCHI.renderer.render();
  };
  handlers.showLabels = function (value) {
    _.each(KIMCHI.space.getObject3Ds('label'), function (mesh) {
      mesh.visible = value;
    });
    KIMCHI.renderer.render();
  };
  handlers.showOrbits = function (value) {
    _.each(KIMCHI.space.getObject3Ds('orbit'), function (line) {
      line.visible = value;
    });
    KIMCHI.renderer.render();
  };
  handlers.showStars = function (value) {
    _.each(KIMCHI.stars, function (particleSystem) {
      particleSystem.visible = value;
    });
    KIMCHI.renderer.render();
  };
  handlers.controlsKeyboardSpeedMultiplier = function (value) {
    settings.controlsZSpeed = settings.controlsBaseZSpeed * value;
    settings.controlsStrafeSpeed = settings.controlsBaseStrafeSpeed * value;
    settings.controlsRollSpeed = settings.controlsBaseRollSpeed * value;
    KIMCHI.controls.options.zSpeed = settings.controlsZSpeed;
    KIMCHI.controls.options.strafeSpeed = settings.controlsStrafeSpeed;
    KIMCHI.controls.options.rollSpeed = settings.controlsRollSpeed;
  };
  handlers.controlsLookSpeed = function (value) {
    KIMCHI.controls.options.lookSpeed = value;
  };



  /**
   * Since HTML and localStorage process strings only, this function parses
   *   the given value into the correct type.
   * @param    {*} value
   * @returns  {*}
   * @private
   * @memberOf module:KIMCHI.config
   */
  parse = function (value) {
    if (value === 'true') {
      value = true;
    } else if (value === 'false') {
      value = false;
    } else if (/^\-?[0-9]+(\.[0-9]+)?$/.test(value)) {
      value = Number(value);
    }
    return value;
  };



  /**
   * Keys of settings that can be changed by the user.
   * @memberOf module:KIMCHI.config
   */
  config.userConfigurableKeys = [
    'bodiesSpeed',
    'rotateBodies',
    'bodiesSizeScale',
    'ambientLight',
    'showLabels',
    'showOrbits',
    'showStars',
    'controlsKeyboardSpeedMultiplier',
    'controlsLookSpeed'
  ];

  /**
   * User configurable settings are stored in localStorage. This function sets
   *   them.
   * @memberOf module:KIMCHI.config
   */
  config.init = function () {
    var userSettings = _.transform(localStorage,
      function (userSettings, value, key) {
        userSettings[key] = parse(value);
      }
    );
    _.assign(settings, userSettings);

    // these settings are now set in ng/options.js
    // _.each(userConfigurableKeys, function (key) {
    //   config.set(key, settings[key]);
    // });
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
    value = parse(value);

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
    // KIMCHI.ui.panel.updateConfig(key, value);
  };



  return KIMCHI;
}(KIMCHI || {}, _, THREE));