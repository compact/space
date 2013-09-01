(function (KIMCHI, $, THREE) {
  'use strict';

  $(function () {
    KIMCHI.$document = $(document);
    KIMCHI.$window = $(window);
    KIMCHI.$overlay = $('#overlay');

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
    KIMCHI.flight.modes.auto.animate();



    // add renderer to DOM
    $('body').append(KIMCHI.renderer.domElement);
    $(KIMCHI.renderer.domElement).attr("id","space");
    KIMCHI.date = new Date();
    // bind
    KIMCHI.pointerLock.init();
    KIMCHI.ui.panel.init();
    KIMCHI.ui.notice.init();
  });
}(KIMCHI, jQuery, THREE));