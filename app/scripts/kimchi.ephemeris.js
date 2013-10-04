/**
 * Ephemeris data.
 * @namespace ephemeris
 * @memberOf  module:KIMCHI
 */
var KIMCHI = (function (KIMCHI, $) {
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
    console.log('last julian in batch: ' + ephemeris.lastJulianInBatch);
  };

  /**
   * @param    {Number}  julian
   * @returns  {Promise}
   * @memberOf module:KIMCHI.ephemeris
   */
  ephemeris.loadBatch = function (julian) {
    var file = '/data/de405/' + julian + '.json';

    console.log('loading ephemeris batch: ' + julian);

    return $.getJSON(file).done(function (data) {
      batch = data;
      ephemeris.updateLastJulianInBatch();
    }).fail(function () { // jqXHR, textStatus, error
      console.log('Failed to get: ' + file);
    });
  };

  /**
   * @param    {Number} index
   * @returns  {Number} The current position [x, y, z] of the body
   *   corresponding to the given index.
   * @memberOf module:KIMCHI.ephemeris
   */
  ephemeris.getCurrentPosition = function (index) {
    return batch[KIMCHI.time.getJulian()][index];

    var currentBatch, julian, position, deferred;

    julian = KIMCHI.time.getJulian();
    currentBatch = batch[julian];

    if (typeof currentBatch === 'object') {
      position = currentBatch[index];
      // "Empty" Promise to match the return type in the case below.
      return $.when(position);
    } else {
      // We are at the last of the current batch, so load the next batch. The
      // Deferred object is used to return the position after loading the next
      // batch.
      deferred = $.Deferred();

      ephemeris.loadBatch(julian).done(function (data) {
        position = data[julian];
        deferred.resolve(position);
      });

      return deferred.promise();
    }
  };

  return KIMCHI;
}(KIMCHI, jQuery));