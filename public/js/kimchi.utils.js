/**
 * Extensible module for KIMCHI. Extend like this:
 * <br> var KIMCHI = (function (KIMCHI) {
 * <br>   KIMCHI.foo = ...;
 * <br>   return KIMCHI;
 * <br> }(KIMCHI));
 * @module KIMCHI
 */
var KIMCHI = (function (KIMCHI, _, $, THREE) {
  'use strict';
  var format;



  /**
   * Functions for rendering and animating using the three.js renderer.
   * @memberOf module:KIMCHI
   */
  KIMCHI.rendering = {
    'render': function () {
      KIMCHI.renderer.render(KIMCHI.scene, KIMCHI.camera);
    },
    // callback is called before rendering. If it returns false, stop animating.
    'animate': function (callback) {
      setTimeout(function () { // TODO: remove for production
//console.log(document.webkitPointerLockElement !== null);
        var proceed = callback(KIMCHI.clock.getDelta());

        KIMCHI.rendering.render();

        // stop the next frame if the user has paused
        if (proceed !== false && KIMCHI.flight.mode !== false) {
          window.requestAnimationFrame(function () {
            KIMCHI.rendering.animate(callback);
          });
        }
      }, 50);
    }
  };



  /**
   * Camera and renderer dimensions.
   * @memberOf module:KIMCHI
   */
  KIMCHI.size = {
    'width': 0,
    'height': 0,
    'init': function () {
      KIMCHI.size.update();
      KIMCHI.$window.on('resize', function () {
        KIMCHI.size.update();
        KIMCHI.flight.auto.animate();
      });
    },
    'update': function () {
      KIMCHI.size.width = KIMCHI.$window.width();
      KIMCHI.size.height = KIMCHI.$window.height() - 5; // TODO
      KIMCHI.camera.update(KIMCHI.size.width, KIMCHI.size.height);
      KIMCHI.renderer.setSize(KIMCHI.size.width, KIMCHI.size.height);
    }
  };



  /**
   * @namespace format
   * @memberOf  module:KIMCHI
   */
  format = {};
  KIMCHI.format = format;
  /**
   * @param    {Number}  number         The number to round.
   * @param    {Number}  precision      The number of decimal places to round to.
   * @param    {Boolean} trailingZeroes Whether to include trailing zeroes.
   *                                    Defaults true.
   * @return   {Number}                 The rounded result.
   * @memberOf module:KIMCHI.format
   */
  format.roundDecimals = function (number, precision, trailingZeroes) {
    'use strict';
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
    'use strict';
    if (number < 1) {
      return format.roundDecimals(number, 2);
    } else if (number < 10) {
      return format.roundDecimals(number, 1);
    } else {
      return Math.round(number);
    }
  };
  /**
   * @param    {Number} number
   * @returns  {Number}        The number formatted in astronomical units.
   * @memberOf module:KIMCHI.format
   */
  format.au = function (number) {
    return format.roundNicely(number) + ' au';
  };
  /**
   * @param    {Number} number
   * @returns  {Number}        The number formatted in kilometres.
   * @memberOf module:KIMCHI.format
   */
  format.km = function (number) {
    return Math.round(number) + ' km';
  };
  /**
   * @return   {String} Date custom formatted for the KIMCHI hud.
   * @memberOf module:KIMCHI.format
   */
  format.date = function (date) {
    return date.getDate() + ' ' +
      KIMCHI.config.language.months[date.getMonth()] + ' ' + date.getFullYear();
  };



  return KIMCHI;
}(KIMCHI || {}, _, jQuery, THREE));