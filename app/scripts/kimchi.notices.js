/**
 * Notice box.
 * @namespace notice
 * @memberOf  module:KIMCHI
 */
var KIMCHI = (function (KIMCHI, $) {
  'use strict';

  var notices = {}, messages = [];
  KIMCHI.notices = notices;

  notices.get = function (message) {
    return messages;
  };
  notices.add = function (message, type) {
    messages.push(message);
  };
  notices.remove = function (message) {
    _.pull(messages, message);
  };
  notices.clear = function () {
    messages = [];
  };

  return KIMCHI;
}(KIMCHI || {}, jQuery));