/**
 * Extensible module for KIMCHI.
 * <br>
 * <br> Conventions:
 * <br> Movement consists of translation and rotation. If you are only
 *        translating or rotating, do not use the word 'move'.
 * <br> "Bodies" refer to astronomical bodies.
 * @module KIMCHI
 */

var KIMCHI = KIMCHI || {};

(function (KIMCHI, $) {
  'use strict';

  /**
   * Initialize KIMCHI. Call after the DOM is ready.
   * @memberOf module:KIMCHI
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



    // add astronomical objects
    KIMCHI.space.init(function () {
      KIMCHI.scene.add(this.getObject3Ds());
      KIMCHI.ui.panel.init(); // depends on .space.init()
    });

    // add background stars, an array of ParticleSystems
    KIMCHI.stars = new THREE.Stars({
      'scale': KIMCHI.config.get('starsScale'),
      'count': KIMCHI.config.get('starsCount')
    });
    KIMCHI.scene.add(KIMCHI.stars);



    // lighting
    KIMCHI.lights = {};
    // sunlight
    KIMCHI.lights.sun = new THREE.PointLight(0xffffee, 2, 0);
    // KIMCHI.lights.sun.position.set(0, 0, 0);
    // KIMCHI.lights.sun = new THREE.SpotLight(0xffffee, 2, 0);
    // KIMCHI.lights.sun.target = KIMCHI.space.getBodies().Earth.mesh;
    KIMCHI.scene.add(KIMCHI.lights.sun);
    // ambient light
    KIMCHI.lights.ambient = new THREE.AmbientLight(0x333333);
    KIMCHI.scene.add(KIMCHI.lights.ambient);



    // first person controls
    KIMCHI.controls = new THREE.Controls(KIMCHI.camera);



    // initialize camera position and rotation
    KIMCHI.camera.position.copy(KIMCHI.config.get('cameraInitialPosition'));
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

  $(function () {
    // initialize KIMCHI
    KIMCHI.init();
  });
}(KIMCHI, jQuery));