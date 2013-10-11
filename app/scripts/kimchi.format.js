/**
 * Format values for output.
 * @namespace format
 * @memberOf  module:KIMCHI
 */
var KIMCHI = (function (KIMCHI) {
  'use strict';

  var format = {}, constants = {};
  KIMCHI.format = format;



  /**
   * Constants.
   * @memberOf module:KIMCHI
   */
  KIMCHI.constants = constants;
  constants.kmPerAu = 149597871;



  /**
   * @param    {Number}  number         The number to round.
   * @param    {Number}  precision      The number of decimal places to round to.
   * @param    {Boolean} trailingZeroes Whether to include trailing zeroes.
   *                                    Defaults true.
   * @return   {Number}                 The rounded result.
   * @memberOf module:KIMCHI.format
   */
  format.roundDecimals = function (number, precision, trailingZeroes) {
    var multiplier, result;
    multiplier = Math.pow(10, precision);
    result = Math.round(number * multiplier) / multiplier;
    if (typeof trailingZeroes === 'boolean' && trailingZeroes) {
      result = result.toFixed(precision);
    }
    return result;
  };

  /**
   * Round the given number "nicely", as in determine the number of decimals
   *   based on the number of digits.
   * @param    {Number} number The number to round.
   * @return   {Number}        The rounded result.
   * @memberOf module:KIMCHI.format
   */
  format.roundNicely = function (number) {
    if (number < 1) {
      return format.roundDecimals(number, 2);
    } else if (number < 10) {
      return format.roundDecimals(number, 1);
    } else {
      return Math.round(number);
    }
  };

  format.angle = function (angle) {
    return Math.round(angle * 180 / Math.PI);
  };

  /**
   * Taken from {@link
   *   http://stackoverflow.com/questions/2901102/how-to-print-a-number-with-commas-as-thousands-separators-in-javascript}.
   *   Note there are issues with decimals, which we are not using at the
   *   moment.
   * @param    {Number} number
   * @returns  {String} The number separated into thousands by commas.
   * @memberOf module:KIMCHI.format
   */
  format.separateThousands = function (number) {
    return String(number).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  /**
   * @param    {Number} [number]
   * @returns  {String} The number formatted in astronomical units.
   * @memberOf module:KIMCHI.format
   */
  format.au = function (number) {
    if (typeof number === 'undefined') {
      return '';
    }
    return format.roundNicely(number) + ' au';
  };

  /**
   * @param    {Number} [number]
   * @returns  {String} The number formatted in kilometres.
   * @memberOf module:KIMCHI.format
   */
  format.km = function (number) {
    if (typeof number === 'undefined') {
      return '';
    }
    return format.separateThousands(Math.round(number)) + ' km';
  };

  /**
   * @return   {String} The current {@link module:KIMCHI.time|time} formatted
   *   for output to the user.
   * @memberOf module:KIMCHI.format
   */
  format.time = function () {
    var dmy = KIMCHI.time.getDMY();
    return dmy[0] + '-' + dmy[1] + '-' + dmy[2];
  };

  return KIMCHI;
}(KIMCHI || {}));