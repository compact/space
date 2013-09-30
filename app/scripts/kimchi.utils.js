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

  var constants;



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
      KIMCHI.ui.panel.init(); // depends on .space.init()
      KIMCHI.config.init(); // depends on .panel.init()
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
        var useCanvas = document.getElementById('kimchi');
        renderer = new THREE.WebGLRenderer({
          'canvas': useCanvas,
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



  return KIMCHI;
}(KIMCHI || {}, jQuery, THREE));