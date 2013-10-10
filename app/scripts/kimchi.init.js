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
   * Initialize KIMCHI. Call after the DOM is ready.
   * @memberOf module:KIMCHI
   */
  KIMCHI.init = function () {
    var promise, success;

    // jQuery objects
    KIMCHI.$document = $(document);
    KIMCHI.$window = $(window);
    KIMCHI.$overlay = $('#overlay');



    // WebGL check
    if (typeof window.WebGLRenderingContext !== 'function') {
      // WebGL is not supported by the browser
      $('.continue-flying').replaceWith(
        '<p>' + KIMCHI.config.get('langWebGLNotSupported') + '</p>');
      return false;
    }

    // renderer
    success = KIMCHI.renderer.init();
    if (!success) {
      // the renderer failed to initialize
      $('.continue-flying').replaceWith(
        '<p>' + KIMCHI.config.get('langWebGLError') + '</p>');
      return false;
    }



    // construct three.js objects
    // clock
    KIMCHI.clock = new THREE.Clock(false); // do not autostart
    // scene
    KIMCHI.scene = new THREE.Scene();
    // camera: don't use OrthographicCamera because it lacks perspective
    KIMCHI.camera = new THREE.PerspectiveCamera(
      KIMCHI.config.get('cameraFov'),
      1, // placeholder, set with KIMCHI.size.init()
      KIMCHI.config.get('cameraNear'),
      KIMCHI.config.get('cameraFar')
    );
    // set camera size and renderer size
    KIMCHI.size.init();
    // initialize camera position and rotation
    KIMCHI.camera.position.copy(KIMCHI.config.get('cameraInitialPosition'));
    KIMCHI.camera.lookAt(new THREE.Vector3(0, 0, 0));



    // lighting
    KIMCHI.lights = {};
    // sunlight
    KIMCHI.lights.sun = new THREE.PointLight(0xffffee, 2, 0);
    KIMCHI.scene.add(KIMCHI.lights.sun);
    // ambient light
    KIMCHI.lights.ambient = new THREE.AmbientLight(0x333333);
    KIMCHI.scene.add(KIMCHI.lights.ambient);



    // add background stars, an array of ParticleSystems
    KIMCHI.stars = new THREE.Stars({
      'scale': KIMCHI.config.get('starsScale'),
      'count': KIMCHI.config.get('starsCount')
    });
    KIMCHI.scene.add(KIMCHI.stars);

    // add astronomical bodies
    KIMCHI.space.init();
    KIMCHI.scene.add(KIMCHI.space.getObject3Ds());

    // get ephemeris data
    promise = KIMCHI.ephemeris.loadBatch(KIMCHI.time.getJulian()).done(function () {
      // initialize Body positions
      KIMCHI.space.translateBodies();

      // initialize Body children positions and scales for rendering
      KIMCHI.space.updateBodyChildren();
    });



    // first person controls
    KIMCHI.controls = new THREE.PointerLockControls(KIMCHI.camera);



    // initialize submodules
    KIMCHI.config.init();
    KIMCHI.pointerLock.init();
    KIMCHI.ui.notice.init();
    KIMCHI.ui.panel.init();
    KIMCHI.flight.setMode('menu');



    return promise;
  };

  return KIMCHI;
}(KIMCHI || {}, jQuery));