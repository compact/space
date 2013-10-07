/**
 * Wrapper around THREE.WebGLRenderer for rendering and animation.
 * @namespace renderer
 * @memberOf  module:KIMCHI
 */
var KIMCHI = (function (KIMCHI, $, THREE) {
  'use strict';

  var module = {}, renderer;
  KIMCHI.renderer = module;

  /**
   * The time between the current call of .animate() and the previous call.
   * @alias    delta
   * @memberOf module:KIMCHI.renderer
   */
  module.delta = 0;

  /**
   * Call after the DOM is ready.
   * @returns  {Boolean} Whether the renderer is successfully created.
   * @alias    initdeltadelta
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
        'canvas': document.getElementById('kimchi'),
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
      module.delta = KIMCHI.clock.getDelta();

      callback(module.delta).done(function (proceed) {

        var postprocessing = KIMCHI.postprocessing;
        var projector = new THREE.Projector();
        var sunPosition = new THREE.Vector3();
        var screenSpacePosition = new THREE.Vector3();
        if ( postprocessing.enabled ) {

          // Find the screenspace position of the sun

          screenSpacePosition.copy( sunPosition );
          projector.projectVector( screenSpacePosition, KIMCHI.camera );

          screenSpacePosition.x = ( screenSpacePosition.x + 1 ) / 2;
          screenSpacePosition.y = ( screenSpacePosition.y + 1 ) / 2;

          // Give it to the god-ray and sun shaders

          postprocessing.godrayGenUniforms[ "vSunPositionScreenSpace" ].value.x = screenSpacePosition.x;
          postprocessing.godrayGenUniforms[ "vSunPositionScreenSpace" ].value.y = screenSpacePosition.y;

          postprocessing.godraysFakeSunUniforms[ "vSunPositionScreenSpace" ].value.x = screenSpacePosition.x;
          postprocessing.godraysFakeSunUniforms[ "vSunPositionScreenSpace" ].value.y = screenSpacePosition.y;

          // -- Draw sky and sun --

          // Clear colors and depths, will clear to sky color

          renderer.clearTarget( postprocessing.rtTextureColors, true, true, false );

          // Sun render. Runs a shader that gives a brightness based on the screen
          // space distance to the sun. Not very efficient, so i make a scissor
          // rectangle around the suns position to avoid rendering surrounding pixels.

          var sunsqH = 0.74 * KIMCHI.size.height; // 0.74 depends on extent of sun from shader
          var sunsqW = 0.74 * KIMCHI.size.height; // both depend on height because sun is aspect-corrected

          screenSpacePosition.x *= KIMCHI.size.width;
          screenSpacePosition.y *= KIMCHI.size.height;

          renderer.setScissor( screenSpacePosition.x - sunsqW / 2, screenSpacePosition.y - sunsqH / 2, sunsqW, sunsqH );
          renderer.enableScissorTest( true );

          postprocessing.godraysFakeSunUniforms[ "fAspect" ].value = KIMCHI.size.width / KIMCHI.size.height;

          postprocessing.scene.overrideMaterial = postprocessing.materialGodraysFakeSun;
          renderer.render( postprocessing.scene, postprocessing.camera, postprocessing.rtTextureColors );

          renderer.enableScissorTest( false );

          // -- Draw scene objects --

          // Colors

          KIMCHI.scene.overrideMaterial = null;
          renderer.render( KIMCHI.scene, KIMCHI.camera, postprocessing.rtTextureColors );

          // Depth

          KIMCHI.scene.overrideMaterial = new THREE.MeshDepthMaterial(); // TODO
          renderer.render( KIMCHI.scene, KIMCHI.camera, postprocessing.rtTextureDepth, true );

          // -- Render god-rays --

          // Maximum length of god-rays (in texture space [0,1]X[0,1])

          var filterLen = 1.0;

          // Samples taken by filter

          var TAPS_PER_PASS = 6.0;

          // Pass order could equivalently be 3,2,1 (instead of 1,2,3), which
          // would start with a small filter support and grow to large. however
          // the large-to-small order produces less objectionable aliasing artifacts that
          // appear as a glimmer along the length of the beams

          // pass 1 - render into first ping-pong target

          var pass = 1.0;
          var stepLen = filterLen * Math.pow( TAPS_PER_PASS, -pass );

          postprocessing.godrayGenUniforms[ "fStepSize" ].value = stepLen;
          postprocessing.godrayGenUniforms[ "tInput" ].value = postprocessing.rtTextureDepth;

          postprocessing.scene.overrideMaterial = postprocessing.materialGodraysGenerate;

          renderer.render( postprocessing.scene, postprocessing.camera, postprocessing.rtTextureGodRays2 );

          // pass 2 - render into second ping-pong target

          pass = 2.0;
          stepLen = filterLen * Math.pow( TAPS_PER_PASS, -pass );

          postprocessing.godrayGenUniforms[ "fStepSize" ].value = stepLen;
          postprocessing.godrayGenUniforms[ "tInput" ].value = postprocessing.rtTextureGodRays2;

          renderer.render( postprocessing.scene, postprocessing.camera, postprocessing.rtTextureGodRays1  );

          // pass 3 - 1st RT

          pass = 3.0;
          stepLen = filterLen * Math.pow( TAPS_PER_PASS, -pass );

          postprocessing.godrayGenUniforms[ "fStepSize" ].value = stepLen;
          postprocessing.godrayGenUniforms[ "tInput" ].value = postprocessing.rtTextureGodRays1;

          renderer.render( postprocessing.scene, postprocessing.camera , postprocessing.rtTextureGodRays2  );

          // final pass - composite god-rays onto colors

          postprocessing.godrayCombineUniforms["tColors"].value = postprocessing.rtTextureColors;
          postprocessing.godrayCombineUniforms["tGodRays"].value = postprocessing.rtTextureGodRays2;

          postprocessing.scene.overrideMaterial = postprocessing.materialGodraysCombine;

          renderer.render( postprocessing.scene, postprocessing.camera );
          postprocessing.scene.overrideMaterial = null;

        }


        // module.render();

        KIMCHI.watcher.trigger(); // trigger KIMCHI.watcher so observers (specifically angularjs) are aware that kimchi has changed

        // stop the next frame if the callback returns false
        if (proceed !== false) {
          window.requestAnimationFrame(function () {
            module.animate(callback);
          });
        }
      });
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

  return KIMCHI;
}(KIMCHI || {}, jQuery, THREE));