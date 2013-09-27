/**
 * Extensible module for KIMCHI. Extend like this:
 * <br> var KIMCHI = (function (KIMCHI) {
 * <br>   KIMCHI.foo = ...;
 * <br>   return KIMCHI;
 * <br> }(KIMCHI));
 * <br>
 * <br> Conventions:
 * <br> Movement consists of translation and rotation. If you are only
 *        translating or rotating, do not use 'move' words.
 * <br> 'Bodies' refer to astronomical bodies.
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
    var success;



    // jQuery objects
    KIMCHI.$document = $(document);
    KIMCHI.$window = $(window);
    KIMCHI.$overlay = $('#overlay');



    // WebGL check
    if (typeof window.WebGLRenderingContext !== 'function') {
      // WebGL is not supported by the browser
      $('.continue-flying').replaceWith(
        '<p>' + KIMCHI.config.get('language-webgl-not-supported') + '</p>');
      return false;
    }

    // renderer
    success = KIMCHI.renderer.init();
    if (!success) {
      // the renderer failed to initialize
      $('.continue-flying').replaceWith(
        '<p>' + KIMCHI.config.get('language-webgl-error') + '</p>');
      return false;
    }



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
    // set camera size and renderer size
    KIMCHI.size.init();



    // add astronomical objects
    KIMCHI.space.init(function () {
      KIMCHI.scene.add(this.getObject3Ds());
      KIMCHI.ui.panel.init();
    });

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
//    KIMCHI.lights.sun.position.set(0, 0, 0);
    KIMCHI.scene.add(KIMCHI.lights.sun);
    // ambient light: remove for production TODO
    //KIMCHI.lights.ambient = new THREE.AmbientLight(0xff0000);
    //KIMCHI.scene.add(KIMCHI.lights.ambient);



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
    KIMCHI.config.init(); // .config.init() requires .panel.init()
    KIMCHI.ui.notice.init();
    KIMCHI.flight.setMode('menu');



    // fix Body children positions and scales
    setTimeout(function () {
      // TODO: prefer to do this without a delay, in a callback somewhere
      KIMCHI.renderer.render();
    }, 3000);
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
     * @returns  {Boolean} Whether the renderer is successfully created.
     * @alias    init
     * @memberOf module:KIMCHI.renderer
     */
    module.init = function () {
      try {
        /**
         * THREE.WebGLRenderer object.
         * @private
         * @memberOf module:KIMCHI.renderer
         */
        renderer = new THREE.WebGLRenderer({
          'antialias': true
        });
      } catch (error) {
        return false;
      }

      // append to DOM
      $('body').append(renderer.domElement);
//    $(renderer.domElement).attr('id', 'space'); // for blurjs
      return true;
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
    var time, date, on, julianToGregorian, gregorianToJulian;

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
     * EGR, Algorithm F "Optimising" taken from {@link
     *   http://www.merlyn.demon.co.uk/daycount.htm#E2}. Slower than
     *   julianToGregorian().
     * @returns {Array}
     * @private
     * @memberOf module:KIMCHI.time
     */
    julianToGregorian = function (julian) {
      var g = 0, J, t, D, M, Y;
      J = julian + 2400001;
      // Alg F : To convert a Julian day number, J, to a date D/M/Y
      g = ((3 * (((4 * J + 274277) / 146097 | 0)) / 4) | 0) - 38; // not Julian
      J += 1401 + g;
      t = 4 * J + 3;
      Y = (t / 1461) | 0;
      t = (t % 1461) >> 2;
      M = ((t * 5 + 461) / 153) | 0;
      D = (((t * 5 + 2) % 153) / 5) | 0;
      if (M > 12) {
        Y++;
        M -= 12;
      }
      return [Y - 4716, M, D + 1];
    };
    /**
     * EGR, Algorithm E "Optimising" taken from {@link
     *   http://www.merlyn.demon.co.uk/daycount.htm#E1}.
     * @returns {Number} Julian Day Number.
     * @private
     * @memberOf module:KIMCHI.time
     */
    gregorianToJulian = function (Y, M, D) {
      var c, d, g = 0;
      // Alg E : To convert a date D/M/Y to a Julian day number, J
      Y += 4716;
      if (M < 3) {
        Y--;
        M += 12;
      }
      c = Y * 1461 >> 2;
      d = ((153 * M - 457) / 5) | 0;
      g = (((3 * (((Y + 184) / 100) | 0)) / 4) | 0) - 38; // omit for Julian
      return c + d + D - g - 2401403; /* -2400001 is for CMJD */
    };

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
    time.increment = function () {
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
   * Format values for output.
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
   * Taken from {@link
   *   http://stackoverflow.com/questions/2901102/how-to-print-a-number-with-commas-as-thousands-separators-in-javascript}.
   *   Note there are issues with decimals, which we are not using at the
   *   moment.
   * @param    {Number} number
   * @returns  {String} The number separated into thousands by commas.
   * @memberOf module:KIMCHI.format
   */
  format.separateThousands = function (number) {
    return String(number).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };
  /**
   * @param    {Number} number Optional.
   * @returns  {String}        The number formatted in astronomical units.
   * @memberOf module:KIMCHI.format
   */
  format.au = function (number) {
    if (typeof number === 'undefined') {
      return '';
    }
    return format.roundNicely(number) + ' au';
  };
  /**
   * @param    {Number} number Optional.
   * @returns  {String}        The number formatted in kilometres.
   * @memberOf module:KIMCHI.format
   */
  format.km = function (number) {
    if (typeof number === 'undefined') {
      return '';
    }
    return format.separateThousands(Math.round(number)) + ' km';
  };
  /**
   * @return   {String} The current {@link module:KIMCHI.time|time} formatted
   *                    for the {@link module:KIMCHI.ui.hud|hud}.
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