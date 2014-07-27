/**
 * Wrapper around THREE.WebGLRenderer for rendering and animation.
 * @namespace renderer
 * @memberOf  module:KIMCHI
 */
var KIMCHI = (function (KIMCHI, THREE) {
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
      renderer = new THREE.WebGLRenderer({
        'canvas': document.getElementById('kimchi'),
        'antialias': true
      }); // TODO: don't hard code the canvas id
    } catch (error) {
      return false;
    }

    return true;
  };

  /**
   * Render the scene. Trigger the 'render' event.
   * @alias    render
   * @memberOf module:KIMCHI.renderer
   */
  module.render = function () {
    renderer.render(KIMCHI.scene, KIMCHI.camera);
    KIMCHI.trigger('render');
  };

  /**
   * Render repeatedly. The given callback is called before rendering. Stop
   *   animating only when the callback returns false.
   * @param     {Function} callback
   * @alias     animate
   * @memberOf  module:KIMCHI.renderer
   */
  module.animate = function (callback) {
    window.setTimeout(function () {
      module.delta = KIMCHI.clock.getDelta();

      callback(module.delta).then(function (proceed) {
        module.render();

        // stop the next frame if the callback returns false
        if (proceed !== false) {
          window.requestAnimationFrame(function () {
            module.animate(callback);
          });
        }
      });
    }, KIMCHI.config.get('frameDelay'));
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
}(KIMCHI || {}, THREE));
