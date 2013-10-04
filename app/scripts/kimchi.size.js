/**
 * Camera and renderer dimensions controller.
 * @namespace size
 * @memberOf  module:KIMCHI
 */
var KIMCHI = (function (KIMCHI, $) {
  'use strict';

  var size = {}, width, height;
  KIMCHI.size = size;

  /**
   * @private
   * @memberOf module:KIMCHI.size
   */
  width = 0;
  /**
   * @private
   * @memberOf module:KIMCHI.size
   */
  height = 0;

  /**
   * Initialize the camera and renderer dimensions. Bind the window resize
   *   event handler.
   * @memberOf module:KIMCHI.size
   */
  size.init = function () {
    size.update();

    KIMCHI.$window.on('resize', function () {
      size.update();
      KIMCHI.renderer.render();
    });
  };

  /**
   * Update the camera and renderer dimensions.
   * @memberOf module:KIMCHI.size
   */
  size.update = function () {
    width = KIMCHI.$window.width();
    height = KIMCHI.$window.height() - 5; // TODO
    KIMCHI.camera.update(width, height);
    KIMCHI.occlusionCamera.update(width, height);
    KIMCHI.renderer.setSize(width, height);

    console.log('size changed to ' + width + ' x ' + height);
  };

  return KIMCHI;
}(KIMCHI || {}, jQuery));