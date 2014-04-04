/**
 * Ephemeris data.
 * @namespace ephemeris
 * @memberOf  module:KIMCHI
 */
var KIMCHI = (function (KIMCHI, Q, $) {
  'use strict';

  var ephemeris, batch;
  ephemeris = {};
  KIMCHI.ephemeris = ephemeris;

  /**
   * We call it a "batch" of the data since this array contains only a subset
   *   of all the ephemeris data.
   * @private
   * @memberOf module:KIMCHI.ephemeris
   */
  batch = [];

  /**
   * @type     {Number}
   * @memberOf module:KIMCHI.ephemeris
   */
  ephemeris.lastJulianInBatch = 0;

  ephemeris.updateLastJulianInBatch = function () {
    var keys = Object.keys(batch);
    ephemeris.lastJulianInBatch = Number(keys[keys.length - 1]);
  };

  /**
   * @param    {Number}  julian
   * @returns  {Promise}
   * @memberOf module:KIMCHI.ephemeris
   */
  ephemeris.loadBatch = function (julian) {
    var file = 'data/de405/' + julian + '.json';

    console.log('.ephemeris: loading batch ' + julian);

    return Q($.getJSON(file).then(function (data) {
      console.log('.ephemeris: loaded batch ' + julian);
      batch = data;
      ephemeris.updateLastJulianInBatch();
    }, function () { // jqXHR, textStatus, error
      console.warn('.ephemeris: failed to GET batch ' + file);
      KIMCHI.notices.add(KIMCHI.config.get('noticeEndOfTime'));
      KIMCHI.config.set('bodiesSpeed', 0);
    }));
  };

  /**
   * @param    {Number} index
   * @param    {Number} [julianOffset=0]
   * @returns  {Array}  The [x, y, z] position of the body with the given
   *   index on the julian date with the given offset.
   * @memberOf module:KIMCHI.ephemeris
   */
  ephemeris.getPositionArray = function (index, julianOffset) {
    if (typeof julianOffset !== 'number') {
      julianOffset = 0;
    }

    var julian = KIMCHI.time.getJulian() + julianOffset;
    return typeof batch[julian] !== 'undefined' ? batch[julian][index] : null;
  };

  return KIMCHI;
}(KIMCHI, Q, jQuery));
