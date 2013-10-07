/**
 * Camera and renderer dimensions controller.
 * @namespace size
 * @memberOf  module:KIMCHI
 */
var KIMCHI = (function (KIMCHI, $) {
  'use strict';

  var size = {};
  KIMCHI.size = size;

  /**
   * @memberOf module:KIMCHI.size
   */
  size.width = 0;
  /**
   * @memberOf module:KIMCHI.size
   */
  size.height = 0;

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
    size.width = KIMCHI.$window.width();
    size.height = KIMCHI.$window.height() - 5; // TODO
    KIMCHI.camera.update(size.width, size.height);
    KIMCHI.occlusionCamera.update(size.width, size.height);
    KIMCHI.renderer.setSize(size.width, size.height);

    console.log('size changed to ' + size.width + ' x ' + size.height);
  };

  return KIMCHI;
}(KIMCHI || {}, jQuery));