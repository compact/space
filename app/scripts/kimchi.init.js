/**
 * Extensible module for KIMCHI.
 * <br>
 * <br> Conventions:
 * <br> Movement consists of translation and rotation. If you are only
 *        translating or rotating, do not use the word 'move'.
 * <br> "Bodies" refer to astronomical bodies.
 * @module KIMCHI
 */

var KIMCHI = (function (KIMCHI, $) {
  'use strict';

  /**
   * This function can be called before the DOM is ready.
   * @memberOf module:KIMCHI
   */
  KIMCHI.init = function () {
    console.log('.init(): start');

    var deferred, rendererSuccess;

    deferred = $.Deferred();
    /**
     * @type     {Promise}
     * @memberOf module:KIMCHI
     */
    KIMCHI.init.promise = deferred.promise();



    // WebGL check
    if (typeof window.WebGLRenderingContext !== 'function') {
      // WebGL is not supported by the browser
      console.log('.init(): WebGL is not supported by the browser');
      // $('.continue-flying').replaceWith(
      //   '<p>' + KIMCHI.config.get('langWebGLNotSupported') + '</p>');
      return false;
    }

    // renderer
    rendererSuccess = KIMCHI.renderer.init();
    if (!rendererSuccess) {
      // the renderer failed to initialize
      console.log('.init(): the renderer failed to initialize');
      // $('.continue-flying').replaceWith(
      //   '<p>' + KIMCHI.config.get('langWebGLError') + '</p>');
      return false;
    }



    // config
    KIMCHI.config.init();

    /**
     * This clock keeps track of time for three.js. It is different from
     *   {@link module:KIMCHI.time|KIMCHI.time}, which keeps track of the
     *   user's current Julian Date in space.
     * @type     {THREE.Clock}
     * @memberOf module:KIMCHI
     */
    KIMCHI.clock = new THREE.Clock(false); // do not autostart

    /**
     * @type     {THREE.Scene}
     * @memberOf module:KIMCHI
     */
    KIMCHI.scene = new THREE.Scene();

    /**
     * Don't use OrthographicCamera because it lacks perspective.
     * @type     {THREE.PerspectiveCamera}
     * @memberOf module:KIMCHI
     */
    KIMCHI.camera = new THREE.PerspectiveCamera(
      KIMCHI.config.get('cameraFov'),
      1, // placeholder, set with KIMCHI.size.init()
      KIMCHI.config.get('cameraNear'),
      KIMCHI.config.get('cameraFar')
    );
    // initialize camera position and rotation
    KIMCHI.camera.position.copy(KIMCHI.config.get('cameraInitialPosition'));
    KIMCHI.camera.lookAt(new THREE.Vector3(0, 0, 0));



    /**
     * @type     {THREE.PointerLockControls}
     * @memberOf module:KIMCHI
     */
    KIMCHI.pointerLockControls = new THREE.PointerLockControls(KIMCHI.camera);
    /**
     * @type     {THREE.OrbitControls}
     * @memberOf module:KIMCHI
     */
    KIMCHI.orbitControls = new THREE.OrbitControls(KIMCHI.camera);



    /**
     * Lighting.
     * @memberOf module:KIMCHI
     */
    KIMCHI.lights = {};
    // sunlight
    KIMCHI.lights.sun = new THREE.PointLight(0xffffee, 2, 0);
    KIMCHI.scene.add(KIMCHI.lights.sun);
    // ambient light
    KIMCHI.lights.ambient = new THREE.AmbientLight(0x333333);
    KIMCHI.scene.add(KIMCHI.lights.ambient);



    /**
     * Stars in the background.
     * @type     {THREE.ParticleSystem[]}
     * @memberOf module:KIMCHI
     */
    console.log(KIMCHI.config.get('starsCount'));
    KIMCHI.stars = new THREE.Stars({
      'scale': KIMCHI.config.get('starsScale'),
      'count': KIMCHI.config.get('starsCount')
    });
    KIMCHI.scene.add(KIMCHI.stars);



    // add astronomical bodies
    KIMCHI.space.init();
    KIMCHI.scene.add(KIMCHI.space.getObject3Ds());



    // get ephemeris data
    KIMCHI.ephemeris.loadBatch(KIMCHI.time.getJulian()).done(function () {
      // initialize Body positions
      console.log('.init(): position Bodies');
      KIMCHI.space.translateBodies();

      // initialize Body children positions and scales for rendering
      console.log('.init(): update Body children');
      KIMCHI.space.updateBodyChildren();

      deferred.resolve();
    });



    KIMCHI.init.promise.done(function () {
      console.log('.init(): done');
    });

    return KIMCHI.init.promise;
  };



  /**
   * Call this function after the DOM is ready.
   * @memberOf module:KIMCHI
   */
  KIMCHI.ready = function () {
    var success;

    console.log('.ready(): start');

    // jQuery objects
    KIMCHI.$document = $(document);
    KIMCHI.$window = $(window);
    KIMCHI.$overlay = $('#overlay');

    KIMCHI.init.promise.done(function () {
      // add orbit lines
      KIMCHI.space.ready();
      KIMCHI.scene.add(KIMCHI.space.getObject3Ds('orbit'));

      KIMCHI.size.init();
      KIMCHI.pointerLock.init();
      KIMCHI.ui.notice.init();
      KIMCHI.flight.init();

      console.log('.ready(): done');
    });
  };



  KIMCHI.init();

  $(function () {
    KIMCHI.ready();
  });



  return KIMCHI;
}(KIMCHI || {}, jQuery));