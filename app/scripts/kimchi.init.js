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

    initPostprocessing();
  };



  function initPostprocessing () {
    var bgColor = 0x000511;
    var sunColor = 0xffee00;

    var postprocessing = {};
    postprocessing.enabled = true;

    postprocessing.scene = new THREE.Scene();

    postprocessing.camera = new THREE.OrthographicCamera( KIMCHI.size.width / - 2, KIMCHI.size.width / 2,  KIMCHI.size.height / 2, KIMCHI.size.height / - 2, -10000, 10000 );
    // postprocessing.camera.position.z = 100;

    postprocessing.scene.add( postprocessing.camera );

    var pars = { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBFormat };
    postprocessing.rtTextureColors = new THREE.WebGLRenderTarget( KIMCHI.size.width, KIMCHI.size.height, pars );

    // Switching the depth formats to luminance from rgb doesn't seem to work. I didn't
    // investigate further for now.
    // pars.format = THREE.LuminanceFormat;

    // I would have this quarter size and use it as one of the ping-pong render
    // targets but the aliasing causes some temporal flickering

    postprocessing.rtTextureDepth = new THREE.WebGLRenderTarget( KIMCHI.size.width, KIMCHI.size.height, pars );

    // Aggressive downsize god-ray ping-pong render targets to minimize cost

    var w = KIMCHI.size.width / 4.0;
    var h = KIMCHI.size.height / 4.0;
    postprocessing.rtTextureGodRays1 = new THREE.WebGLRenderTarget( w, h, pars );
    postprocessing.rtTextureGodRays2 = new THREE.WebGLRenderTarget( w, h, pars );

    // god-ray shaders

    var godraysGenShader = THREE.ShaderGodRays[ "godrays_generate" ];
    postprocessing.godrayGenUniforms = THREE.UniformsUtils.clone( godraysGenShader.uniforms );
    postprocessing.materialGodraysGenerate = new THREE.ShaderMaterial( {

      uniforms: postprocessing.godrayGenUniforms,
      vertexShader: godraysGenShader.vertexShader,
      fragmentShader: godraysGenShader.fragmentShader

    } );

    var godraysCombineShader = THREE.ShaderGodRays[ "godrays_combine" ];
    postprocessing.godrayCombineUniforms = THREE.UniformsUtils.clone( godraysCombineShader.uniforms );
    postprocessing.materialGodraysCombine = new THREE.ShaderMaterial( {

      uniforms: postprocessing.godrayCombineUniforms,
      vertexShader: godraysCombineShader.vertexShader,
      fragmentShader: godraysCombineShader.fragmentShader

    } );

    var godraysFakeSunShader = THREE.ShaderGodRays[ "godrays_fake_sun" ];
    postprocessing.godraysFakeSunUniforms = THREE.UniformsUtils.clone( godraysFakeSunShader.uniforms );
    postprocessing.materialGodraysFakeSun = new THREE.ShaderMaterial( {

      uniforms: postprocessing.godraysFakeSunUniforms,
      vertexShader: godraysFakeSunShader.vertexShader,
      fragmentShader: godraysFakeSunShader.fragmentShader

    } );

    postprocessing.godraysFakeSunUniforms.bgColor.value.setHex( bgColor );
    postprocessing.godraysFakeSunUniforms.sunColor.value.setHex( sunColor );

    postprocessing.godrayCombineUniforms.fGodRayIntensity.value = 0.75;

    postprocessing.quad = new THREE.Mesh( new THREE.PlaneGeometry( KIMCHI.size.width, KIMCHI.size.height ), postprocessing.materialGodraysGenerate );
    postprocessing.quad.position.z = -9900;
    postprocessing.scene.add( postprocessing.quad );

    KIMCHI.postprocessing = postprocessing;
  }



  $(function () {
    // initialize KIMCHI
    KIMCHI.init();
  });
}(KIMCHI, jQuery));