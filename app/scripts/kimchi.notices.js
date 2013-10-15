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
    console.log(message);
    KIMCHI.trigger('noticesChanged', messages);
  };
  notices.remove = function (message) {
    _.pull(messages, message);
    KIMCHI.trigger('noticesChanged', messages);
  };
  notices.clear = function () {
    messages = [];
    KIMCHI.trigger('noticesChanged', messages);
  };

  return KIMCHI;
}(KIMCHI || {}, jQuery));