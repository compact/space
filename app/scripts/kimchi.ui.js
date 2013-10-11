/**
 * User interface features with jQuery and Bootstrap.
 * @namespace ui
 * @memberOf  module:KIMCHI
 */
var KIMCHI = (function (KIMCHI, $) {
  'use strict';

  var ui = {}, notice = {};
  ui.notice = notice;
  KIMCHI.ui = ui;



  /**
   * Notice box.
   * @namespace notice
   * @memberOf  module:KIMCHI.ui
   */
  notice.init = function () {
    notice.$notice = $('#notice');
  };
  notice.set = function (message) {
    notice.$notice.html(message).fadeIn();
  };
  notice.clear = function () {
    notice.$notice.text('').fadeOut();
  };



  return KIMCHI;
}(KIMCHI || {}, jQuery));