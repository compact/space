/**
 * Extensible module for KIMCHI. Extend like this:
 * <br> var KIMCHI = (function (KIMCHI) {
 * <br>   KIMCHI.foo = ...;
 * <br>   return KIMCHI;
 * <br> }(KIMCHI));
 * @module KIMCHI
 */
var KIMCHI = (function (KIMCHI, _, $, THREE) {
  'use strict';
  var format;



  /**
   * Initialize KIMCHI.
   */
  KIMCHI.init = function () {
    // clock
    KIMCHI.clock = new THREE.Clock(false); // do not autostart

    // scene
    KIMCHI.scene = new THREE.Scene();
    // camera: don't use OrthographicCamera because it lacks perspective
    KIMCHI.camera = new THREE.PerspectiveCamera(
      KIMCHI.config.camera.fov,
      1, // placeholder, set with KIMCHI.size.init()
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
    KIMCHI.space.init();
    KIMCHI.scene.add(KIMCHI.space.getObject3Ds());

    // add background stars, an array of ParticleSystems
    KIMCHI.scene.add(new THREE.Stars(KIMCHI.config.stars));



    // lighting
    KIMCHI.lights = {};
    // sunlight
    KIMCHI.lights.sun = new THREE.PointLight(0xffffee, 2, 100);
    KIMCHI.lights.sun.position.set(0, 0, 0);
    KIMCHI.scene.add(KIMCHI.lights.sun);
    // ambient light: remove for production TODO
    KIMCHI.scene.add(new THREE.AmbientLight(0xff0000));



    // first person controls
    KIMCHI.controls = new THREE.Controls(KIMCHI.camera, KIMCHI.config.controls);



    // initialize camera position and rotation
    KIMCHI.camera.position.copy(KIMCHI.config.camera.initialPosition);
    KIMCHI.camera.lookAt(new THREE.Vector3(0, 0, 0));
    // render() has to be called to set the camera position for objects and
    // elements to appear in animate()
    KIMCHI.rendering.render();
    KIMCHI.flight.modes.auto.animate(); // TODO



    // add renderer to DOM
    $('body').append(KIMCHI.renderer.domElement);
//    $(KIMCHI.renderer.domElement).attr('id', 'space'); // for blurjs
    KIMCHI.date = new Date();
    // bind
    KIMCHI.pointerLock.init();
    KIMCHI.ui.panel.init();
    KIMCHI.ui.notice.init();
    KIMCHI.flight.setMode('menu');
  };



  /**
   * Functions for rendering and animating using the three.js renderer.
   * @memberOf module:KIMCHI
   */
  KIMCHI.rendering = {
    'render': function () {
      KIMCHI.renderer.render(KIMCHI.scene, KIMCHI.camera);
    },
    // callback is called before rendering. If it returns false, stop animating.
    'animate': function (callback) {
      setTimeout(function () { // TODO: remove for production
//console.log(document.webkitPointerLockElement !== null);
        var proceed = callback(KIMCHI.clock.getDelta());

        KIMCHI.rendering.render();

        // stop the next frame if the callback returns false
//console.log(proceed);
        if (proceed !== false) {
          window.requestAnimationFrame(function () {
            KIMCHI.rendering.animate(callback);
          });
        }
      }, 50);
    }
  };



  /**
   * Camera and renderer dimensions.
   * @memberOf module:KIMCHI
   */
  KIMCHI.size = {
    'width': 0,
    'height': 0,
    'init': function () {
      KIMCHI.size.update();
      KIMCHI.$window.on('resize', function () {
        KIMCHI.size.update();
        KIMCHI.flight.modes.auto.animate(); // TODO
      });
    },
    'update': function () {
      KIMCHI.size.width = KIMCHI.$window.width();
      KIMCHI.size.height = KIMCHI.$window.height() - 5; // TODO
      KIMCHI.camera.update(KIMCHI.size.width, KIMCHI.size.height);
      KIMCHI.renderer.setSize(KIMCHI.size.width, KIMCHI.size.height);
    }
  };



  /**
   * @namespace format
   * @memberOf  module:KIMCHI
   */
  format = {};
  KIMCHI.format = format;
  /**
   * @param    {Number}  number         The number to round.
   * @param    {Number}  precision      The number of decimal places to round to.
   * @param    {Boolean} trailingZeroes Whether to include trailing zeroes.
   *                                    Defaults true.
   * @return   {Number}                 The rounded result.
   * @memberOf module:KIMCHI.format
   */
  format.roundDecimals = function (number, precision, trailingZeroes) {
    'use strict';
    var multiplier, result;
    multiplier = Math.pow(10, precision);
    result = Math.round(number * multiplier) / multiplier;
    if (typeof trailingZeroes === 'boolean' && trailingZeroes) {
      result = result.toFixed(precision);
    }
    return result;
  };
  /**
   * Round the given number "nicely", as in determine the number of decimals
   *   based on the number of digits.
   * @param    {Number} number The number to round.
   * @return   {Number}        The rounded result.
   * @memberOf module:KIMCHI.format
   */
  format.roundNicely = function (number) {
    'use strict';
    if (number < 1) {
      return format.roundDecimals(number, 2);
    } else if (number < 10) {
      return format.roundDecimals(number, 1);
    } else {
      return Math.round(number);
    }
  };
  /**
   * @param    {Number} number
   * @returns  {Number}        The number formatted in astronomical units.
   * @memberOf module:KIMCHI.format
   */
  format.au = function (number) {
    return format.roundNicely(number) + ' au';
  };
  /**
   * @param    {Number} number
   * @returns  {Number}        The number formatted in kilometres.
   * @memberOf module:KIMCHI.format
   */
  format.km = function (number) {
    return Math.round(number) + ' km';
  };
  /**
   * @return   {String} Date custom formatted for the KIMCHI hud.
   * @memberOf module:KIMCHI.format
   */
  format.date = function (date) {
    return date.getDate() + ' ' +
      KIMCHI.config.language.months[date.getMonth()] + ' ' + date.getFullYear();
  };



  return KIMCHI;
}(KIMCHI || {}, _, jQuery, THREE));