/**
 * Camera and renderer dimensions controller.
 * @namespace size
 * @memberOf  module:KIMCHI
 */
var KIMCHI = (function (KIMCHI) {
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
   * Initialize the camera and renderer dimensions. The window resize event
   *   handler gets binded in Angular.
   * @memberOf module:KIMCHI.size
   */
  size.init = function () {
    size.update();
  };

  /**
   * Update the camera and renderer dimensions.
   * @memberOf module:KIMCHI.size
   */
  size.update = function () {
    size.width = window.innerWidth;
    size.height = window.innerHeight;
    KIMCHI.camera.update({
      'width': size.width,
      'height': size.height
    });
    KIMCHI.renderer.setSize(size.width, size.height);

    console.log('.size: resized to ' + size.width + ' x ' + size.height);
  };

  return KIMCHI;
}(KIMCHI || {}));