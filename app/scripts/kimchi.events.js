// Custom event handling.
var KIMCHI = (function (KIMCHI, _) {
  'use strict';

  // keys are event names
  var handlers = {};

  /**
   * Bind the given handler to the given event.
   * @param    {String} event
   * @param    {Function} handler
   * @memberOf module:KIMCHI
   */
  KIMCHI.on = function (event, handler) {
    if (typeof handlers[event] !== 'object') {
      handlers[event] = [];
    }

    handlers[event].push(handler);
  };

  /**
   * Unbind the given handler from the given event.
   * @param    {String} event
   * @param    {Function} handler
   * @memberOf module:KIMCHI
   */
  KIMCHI.off = function (event, handler) {
    var index = _.indexOf(handlers[event], handler);

    if (index === -1) {
      console.warn('.off(): the following handler was not found for event ' + event + ':',
        handler);
    }

    handlers[event].splice(index, 1);
  };

  /**
   * Trigger the given event by calling all its handlers.
   * @param    {String} event
   * @memberOf module:KIMCHI
   */
  KIMCHI.trigger = function (event) {
    var args = Array.prototype.slice.call(arguments, 1);

    _.each(handlers[event], function (handler) {
      handler.apply(KIMCHI, args);
    });
  };

  return KIMCHI;
}(KIMCHI || {}, _));