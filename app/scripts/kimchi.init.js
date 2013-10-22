/**
 * Extensible module for KIMCHI.
 * <br>
 * <br> Conventions:
 * <br> Movement consists of translation and rotation. If you are only
 *        translating or rotating, do not use the word 'move'.
 * <br> "Bodies" refer to astronomical bodies.
 * @module KIMCHI
 */

var KIMCHI = (function (KIMCHI, Q, $) {
  'use strict';

  /**
   * This function can be called before the DOM is ready.
   * @memberOf module:KIMCHI
   */
  KIMCHI.init = function () {
    console.log('.init(): start');

    var deferred, rendererSuccess;

    deferred = Q.defer();
    /**
     * @type     {Promise}
     * @memberOf module:KIMCHI
     */
    KIMCHI.init.promise = deferred.promise;



    // WebGL check
    if (typeof window.WebGLRenderingContext !== 'function') {
      // WebGL is not supported by the browser
      console.warn('.init(): WebGL is not supported by the browser');
      KIMCHI.notices.add(KIMCHI.config.get('langWebGLNotSupported'));
      return false;
    }

    // renderer
    rendererSuccess = KIMCHI.renderer.init();
    if (!rendererSuccess) {
      // the renderer failed to initialize
      console.warn('.init(): the renderer failed to initialize');
      KIMCHI.notices.add(KIMCHI.config.get('langWebGLError'));
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
    KIMCHI.clock = new THREE.Clock();

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
     * Stars in the background.
     * @type     {THREE.ParticleSystem[]}
     * @memberOf module:KIMCHI
     */
    KIMCHI.stars = new THREE.Stars({
      'scale': KIMCHI.config.get('starsScale'),
      'count': KIMCHI.config.get('starsCount')
    });
    KIMCHI.scene.add(KIMCHI.stars);



    // add astronomical bodies
    KIMCHI.space.init();
    KIMCHI.scene.add(KIMCHI.space.getObject3Ds());



    // get ephemeris data
    KIMCHI.ephemeris.loadBatch(KIMCHI.time.getJulian()).then(function () {
      // initialize Body positions
      console.log('.init(): position Bodies');
      KIMCHI.space.translateBodies();

      // initialize Body children positions and scales for rendering
      console.log('.init(): update Body children');
      KIMCHI.space.updateBodyChildren();

      deferred.resolve();
    });



    /**
     * Lighting.
     * @memberOf module:KIMCHI
     */
    KIMCHI.lights = {};
    // sunlight
    KIMCHI.lights.sun = new THREE.PointLight(0xffffee, 2, 0);
    KIMCHI.lights.sun.position = KIMCHI.space.getBody('Sun').object3Ds.main.position;
    KIMCHI.scene.add(KIMCHI.lights.sun);
    // ambient light
    KIMCHI.lights.ambient = new THREE.AmbientLight(0x333333);
    KIMCHI.scene.add(KIMCHI.lights.ambient);



    KIMCHI.init.promise.then(function () {
      console.log('.init(): done');
    });

    return KIMCHI.init.promise;
  };



  /**
   * Call this function after the DOM is ready.
   * @memberOf module:KIMCHI
   */
  KIMCHI.ready = function () {
    console.log('.ready(): start');

    // jQuery objects
    KIMCHI.$document = $(document);
    KIMCHI.$window = $(window);
    KIMCHI.$overlay = $('#overlay');

    KIMCHI.init.promise.then(function () {
      // add orbit lines
      KIMCHI.space.ready();
      KIMCHI.scene.add(KIMCHI.space.getObject3Ds('orbit'));

      KIMCHI.size.init();
      KIMCHI.pointerLock.init();
      KIMCHI.flight.init();

      console.log('.ready(): done');
    });
  };



  // turn off in production
  Q.longStackSupport = true;

  KIMCHI.init();

  $(function () {
    KIMCHI.ready();
  });



  return KIMCHI;
}(KIMCHI || {}, Q, jQuery));