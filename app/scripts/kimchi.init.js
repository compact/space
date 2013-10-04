var KIMCHI = KIMCHI || {};

(function (KIMCHI, $) {
  'use strict';

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



    // OCCLUSION SCENE
    var oclscene = new THREE.Scene();
    oclscene.add(new THREE.AmbientLight(0xffffff));
    KIMCHI.occlusionCamera = new THREE.PerspectiveCamera(
      KIMCHI.config.get('camera-fov'),
      1, // placeholder, set with KIMCHI.size.init()
      KIMCHI.config.get('camera-near'),
      KIMCHI.config.get('camera-far')
    );
    KIMCHI.occlusionCamera.position = KIMCHI.camera.position;
    // Volumetric light
    var vlight = new THREE.Mesh(
      new THREE.IcosahedronGeometry(50, 3),
      new THREE.MeshBasicMaterial({
        'color': 0xffffff
      })
    );
    vlight.position.y = 0;
    oclscene.add(vlight);



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
    KIMCHI.lights.sun = new THREE.PointLight(0xffffee, 2, 0);
    // KIMCHI.lights.sun.position.set(0, 0, 0);
    // KIMCHI.lights.sun = new THREE.SpotLight(0xffffee, 2, 0);
    // KIMCHI.lights.sun.target = KIMCHI.space.getBodies().Earth.mesh;
    KIMCHI.scene.add(KIMCHI.lights.sun);
    // ambient light
    KIMCHI.lights.ambient = new THREE.AmbientLight(0x0000cc);
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