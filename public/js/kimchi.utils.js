/**
 * Extensible module for KIMCHI. Extend like this:
 * <br> var KIMCHI = (function (KIMCHI) {
 * <br>   KIMCHI.foo = ...;
 * <br>   return KIMCHI;
 * <br> }(KIMCHI));
 * @module KIMCHI
 */
var KIMCHI = (function (KIMCHI, $, THREE) {
  'use strict';

  var constants, format;



  /**
   * Constants.
   * @memberOf KIMCHI
   */
  constants = {};
  KIMCHI.constants = constants;
  constants.kmPerAu = 149597871;



  /**
   * Initialize KIMCHI.
   * @memberOf KIMCHI
   */
  KIMCHI.init = function () {
    // jQuery objects
    KIMCHI.$document = $(document);
    KIMCHI.$window = $(window);
    KIMCHI.$overlay = $('#overlay');



    // construct three.js objects
    // clock
    KIMCHI.clock = new THREE.Clock(false); // do not autostart
    // scene
    KIMCHI.scene = new THREE.Scene();
    // camera: don't use OrthographicCamera because it lacks perspective
    KIMCHI.camera = new THREE.PerspectiveCamera(
      KIMCHI.config.get('camera-fov'),
      1, // placeholder, set with KIMCHI.size.init()
      KIMCHI.config.get('camera-near'),
      KIMCHI.config.get('camera-far')
    );
    // renderer
    KIMCHI.renderer.init();
    // set camera size and renderer size
    KIMCHI.size.init();



    // add astronomical objects
    KIMCHI.space.init();
    KIMCHI.scene.add(KIMCHI.space.getObject3Ds());

    // add background stars, an array of ParticleSystems
    KIMCHI.stars = new THREE.Stars({
      'scale': KIMCHI.config.get('stars-scale'),
      'count': KIMCHI.config.get('stars-count')
    });
    KIMCHI.scene.add(KIMCHI.stars);



    // lighting
    KIMCHI.lights = {};
    // sunlight
    KIMCHI.lights.sun = new THREE.PointLight(0xffffee, 2, 100);
    KIMCHI.lights.sun.position.set(0, 0, 0);
    KIMCHI.scene.add(KIMCHI.lights.sun);
    // ambient light: remove for production TODO
    KIMCHI.lights.ambient = new THREE.AmbientLight(0xff0000);
    KIMCHI.scene.add(KIMCHI.lights.ambient);



    // first person controls
    KIMCHI.controls = new THREE.Controls(KIMCHI.camera, {
      'lookSpeed': KIMCHI.config.get('controls-look-speed'),
      'zSpeed': KIMCHI.config.get('controls-z-speed'),
      'strafeSpeed': KIMCHI.config.get('controls-strafe-speed'),
      'rollSpeed': KIMCHI.config.get('controls-roll-speed')
    });



    // initialize camera position and rotation
    KIMCHI.camera.position.copy(KIMCHI.config.get('camera-initial-position'));
    KIMCHI.camera.lookAt(new THREE.Vector3(0, 0, 0));



    // initialize submodules
    KIMCHI.pointerLock.init();
    KIMCHI.ui.panel.init();
    KIMCHI.config.init(); // .config.init() requires .panel.init()
    KIMCHI.ui.notice.init();
    KIMCHI.flight.setMode('menu');



    // initialize Body children positions and scales for rendering
    KIMCHI.space.moveBodyChildren();
    setTimeout(function () {
      // TODO: prefer to do this without a delay, in a callback somewhere
      KIMCHI.renderer.render();
    }, 500);
  };



  /**
   * Wrapper around THREE.WebGLRenderer for rendering and animation.
   * @namespace renderer
   * @memberOf  module:KIMCHI
   */
  KIMCHI.renderer = (function () {
    var module = {}, renderer;

    /**
     * Call after the DOM is ready.
     * @alias    init
     * @memberOf module:KIMCHI.renderer
     */
    module.init = function () {
      /**
       * THREE.WebGLRenderer object.
       * @private
       * @memberOf module:KIMCHI.renderer
       */
      renderer = new THREE.WebGLRenderer({
        'antialias': true
      });

      // append to DOM
      $('body').append(renderer.domElement);
//    $(renderer.domElement).attr('id', 'space'); // for blurjs
    };

    /**
     * Shortcut for THREE.WebGLRenderer.render() without needing to provide
     *   the parameters.
     * @alias    render
     * @memberOf module:KIMCHI.renderer
     */
    module.render = function () {
      renderer.render(KIMCHI.scene, KIMCHI.camera);
    };

    /**
     * Render repeatedly. The given callback is called before rendering. Stop
     *   animating only when the callback returns false.
     * @param     {Function} callback
     * @alias     animate
     * @memberOf  module:KIMCHI.renderer
     */
    module.animate = function (callback) {
      // TODO: consider removing this delay for production
      window.setTimeout(function () {
        var proceed = callback(KIMCHI.clock.getDelta());

        KIMCHI.renderer.render();

        // stop the next frame if the callback returns false
        if (proceed !== false) {
          window.requestAnimationFrame(function () {
            KIMCHI.renderer.animate(callback);
          });
        }
      }, 50);
    };

    /**
     * See THREE.WebGLRenderer.setSize.
     * @param    {Number} width
     * @param    {Number} height
     * @alias    setSize
     * @memberOf module:KIMCHI.renderer
     */
    module.setSize = function (width, height) {
      renderer.setSize(width, height);
    };

    return module;
  }());



  /**
   * Camera and renderer dimensions controller.
   * @namespace size
   * @memberOf  module:KIMCHI
   */
  KIMCHI.size = (function () {
    var size, width, height;

    size = {};
    /**
     * @alias    width
     * @memberOf module:KIMCHI.size
     */
    width = 0;
    /**
     * @alias    height
     * @memberOf module:KIMCHI.size
     */
    height = 0;

    /**
     * Initialize the camera and renderer dimensions. Bind the window resize
     *   event handler.
     * @memberOf module:KIMCHI.size
     */
    size.init = function () {
      size.update();

      KIMCHI.$window.on('resize', function () {
        size.update();
        KIMCHI.renderer.render();
      });
    };

    /**
     * Update the camera and renderer dimensions.
     * @memberOf module:KIMCHI.size
     */
    size.update = function () {
      width = KIMCHI.$window.width();
      height = KIMCHI.$window.height() - 5; // TODO
      KIMCHI.camera.update(width, height);
      KIMCHI.renderer.setSize(width, height);

      console.log('size changed to ' + width + ' x ' + height);
    };

    return size;
  }());



  /**
   * Time controller. When the time is on, the Bodies move; when the time is
   *   off, the Bodies stop moving. We use "on"/"off"/"isOn" rather than
   *   "start"/"stop"/"isEnabled" for a better adjective and to avoid
   *   confusion with THREE.Clock.
   * @namespace time
   * @memberOf  module:KIMCHI
   */
  KIMCHI.time = (function () {
    var time, date, on;

    time = {};
    /**
     * The Date corresponding to the current positions of Bodies.
     * @private
     * @memberOf module:KIMCHI.time
     */
    date = new Date();
    /**
     * The current state.
     * @private
     * @memberOf module:KIMCHI.time
     */
    on = true;

    /**
     * @returns  {Date}
     * @memberOf module:KIMCHI.time
     */
    time.getDate = function () {
      return date;
    };
    /**
     * Increment the current time based on delta. TODO: Not implemented yet.
     * @param    {Number} delta
     * @memberOf module:KIMCHI.time
     */
    time.increment = function (delta) {
      date.setDate(date.getDate() + 1);
    };
    /**
     * Turn time on.
     * @memberOf module:KIMCHI.time
     */
    time.on = function () {
      on = true;
    };
    /**
     * Turn time off.
     * @memberOf module:KIMCHI.time
     */
    time.off = function () {
      on = false;
    };
    /**
     * @returns  {Boolean} Whether time is currently on.
     * @memberOf module:KIMCHI.time
     */
    time.isOn = function () {
      return on;
    };

    return time;
  }());



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
   * @return   {String} The current {@link time} formatted for the {@link hud}.
   * @memberOf module:KIMCHI.format
   */
  format.time = function () {
    var date = KIMCHI.time.getDate();
    return date.getDate() + ' ' +
      KIMCHI.config.get('language-months')[date.getMonth()] + ' ' +
      date.getFullYear();
  };



  return KIMCHI;
}(KIMCHI || {}, jQuery, THREE));