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
  ephemeris.lastJulianInBatch = 0; // TODO

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
      console.log('.ephemeris: failed to GET batch ' + file);
      KIMCHI.config.set('bodiesSpeed', 0);
    }));
  };

  /**
   * @param    {Number} index
   * @returns  {Number} The current position [x, y, z] of the body
   *   corresponding to the given index.
   * @memberOf module:KIMCHI.ephemeris
   */
  ephemeris.getCurrentPosition = function (index) {
    return batch[KIMCHI.time.getJulian()][index];
  };

  return KIMCHI;
}(KIMCHI, Q, jQuery));