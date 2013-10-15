/**
 * Notice box.
 * @namespace notice
 * @memberOf  module:KIMCHI
 */
var KIMCHI = (function (KIMCHI) {
  'use strict';

  var notices, collection;
  notices = {};
  KIMCHI.notices = notices;

  /**
   * Contains all current notices.
   * @private
   * @memberOf module:KIMCHI.notice
   */
  collection = [];

  /**
   * @returns  {Array} All current notices.
   * @memberOf module:KIMCHI.notice
   */
  notices.get = function () {
    return collection;
  };

  /**
   * @param    {String} notice
   * @memberOf module:KIMCHI.notice
   */
  notices.add = function (notice) {
    collection.push(notice);
    KIMCHI.trigger('noticesChanged', collection);
  };

  /**
   * @param    {String} notice
   * @memberOf module:KIMCHI.notice
   */
  notices.remove = function (notice) {
    _.pull(collection, notice);
    KIMCHI.trigger('noticesChanged', collection);
  };

  /**
   * @memberOf module:KIMCHI.notice
   */
  notices.clear = function () {
    collection = [];
    KIMCHI.trigger('noticesChanged', collection);
  };

  return KIMCHI;
}(KIMCHI || {}));