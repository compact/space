/**
 * Time controller. When the time is on, the Bodies move; when the time is
 *   off, the Bodies stop moving. We use "on"/"off"/"isOn" rather than
 *   "start"/"stop"/"isEnabled" for a better adjective and to avoid
 *   confusion with THREE.Clock.
 * @namespace time
 * @memberOf  module:KIMCHI
 */
var KIMCHI = (function (KIMCHI, $) {
  'use strict';

  var time, julian, on, step, julianToGregorian, gregorianToJulian;

  time = {};
  KIMCHI.time = time;

  /**
   * The Julian Date which will determine the current positions of Bodies.
   *   We use the original convention where .0 is noon. The ephemeris data
   *   is given with Julian Dates ending in .0.
   * @private
   * @memberOf module:KIMCHI.time
   */
  julian = 2451544;

  /**
   * The current state of time, whether it is currently on.
   * @private
   * @memberOf module:KIMCHI.time
   */
  on = true;

  /**
   * The current step to increment the julian by in each frame. The higher
   *   this is, the faster bodies move.
   * @private
   * @memberOf module:KIMCHI.time
   */
  step = 1;

  /**
   * Based on EGR, Algorithm F ("Optimising") taken from {@link
   *   http://www.merlyn.demon.co.uk/daycount.htm#E2}. Slower than
   *   julianToGregorian().
   * @returns {Array}
   * @private
   * @memberOf module:KIMCHI.time
   */
  julianToGregorian = function (julian) {
    var g = 0, J, t, D, M, Y;

    // offset by (+ 2400001 - 2400000.5) since the param was originally CMJD
    J = julian + 0.5;

    // Alg F : To convert a Julian day number, J, to a date D/M/Y
    g = ((3 * (((4 * J + 274277) / 146097 | 0)) / 4) | 0) - 38; // not Julian
    J += 1401 + g;
    t = 4 * J + 3;
    Y = (t / 1461) | 0;
    t = (t % 1461) >> 2;
    M = ((t * 5 + 461) / 153) | 0;
    D = (((t * 5 + 2) % 153) / 5) | 0;
    if (M > 12) {
      Y++;
      M -= 12;
    }
    return [Y - 4716, M, D + 1];
  };

  /**
   * Based on EGR, Algorithm E ("Optimising") taken from {@link
   *   http://www.merlyn.demon.co.uk/daycount.htm#E1}.
   * @returns {Number} Julian Day Number.
   * @private
   * @memberOf module:KIMCHI.time
   */
  gregorianToJulian = function (Y, M, D) {
    var c, d, g = 0;

    // Alg E : To convert a date D/M/Y to a Julian day number, J
    Y += 4716;
    if (M < 3) {
      Y--;
      M += 12;
    }
    c = Y * 1461 >> 2;
    d = ((153 * M - 457) / 5) | 0;
    g = (((3 * (((Y + 184) / 100) | 0)) / 4) | 0) - 38; // omit for Julian

    // offset by - 2401403 + 2400000.5 to return JD rather than CMJD
    return c + d + D - g -1402.5;
  };



  /**
   * @returns  {Date}
   * @memberOf module:KIMCHI.time
   */
  time.getDMY = function () {
    return julianToGregorian(julian);
  };

  /**
   * @returns  {Number}
   * @memberOf module:KIMCHI.time
   */
  time.getJulian = function () {
    return julian;
  };

  /**
   * Increment the current time based on delta. TODO: Not implemented yet.
   * @param    {Number} delta
   * @memberOf module:KIMCHI.time
   */
  time.increment = function () {
    var newJulian, deferred;

    newJulian = julian + step;

    if (newJulian <= KIMCHI.ephemeris.lastJulianInBatch) {
      // "Empty" promise to match the return type in the case below.
      julian = newJulian;
      return $.when(newJulian);
    } else {
      // We are at the last of the current batch, so we have to load the next
      // batch before incrementing the date. The Deferred object is used to
      // return the position after loading the next batch.
      deferred = $.Deferred();

      KIMCHI.ephemeris.loadBatch(newJulian).done(function (data) {
        julian = newJulian;
        deferred.resolve(data);
      });

      return deferred.promise();
    }
  };

  /**
   * Turn time on.
   * @memberOf module:KIMCHI.time
   */
  time.on = function () {
    on = true;
  };

  /**
   * Turn time off.
   * @memberOf module:KIMCHI.time
   */
  time.off = function () {
    on = false;
  };

  /**
   * @param {Number} days The number of days to increment julian by in each
   *   call of increment().
   */
  time.setStep = function (days) {
    if (days === 0) {
      time.off();
    } else {
      step = days;
      time.on();
    }
  };

  /**
   * @returns  {Boolean} Whether time is currently on.
   * @memberOf module:KIMCHI.time
   */
  time.isOn = function () {
    return on;
  };

  return KIMCHI;
}(KIMCHI || {}, jQuery));