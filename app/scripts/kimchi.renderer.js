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
      var proceed;

      module.delta = KIMCHI.clock.getDelta();
      proceed = callback(module.delta);
      module.render();
      KIMCHI.watcher.trigger(); // trigger KIMCHI.watcher so observers (specifically angularjs) are aware that kimchi has changed

      // stop the next frame if the callback returns false
      if (proceed !== false) {
        window.requestAnimationFrame(function () {
          module.animate(callback);
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

  return KIMCHI;
}(KIMCHI || {}, jQuery, THREE));