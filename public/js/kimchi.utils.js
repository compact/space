/** @external Math */
/**
 * @param    {Number}  number         The number to round.
 * @param    {Number}  precision      The number of decimal places to round to.
 * @param    {Boolean} trailingZeroes Whether to include trailing zeroes.
 *                                    Defaults true.
 * @return   {Number}                 The rounded result..
 * @memberOf external:Math
 */
Math.roundDecimals = function (number, precision, trailingZeroes) {
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
 * @memberOf external:Math
 */
Math.roundNicely = function (number) {
  'use strict';
  if (number < 1) {
    return Math.roundDecimals(number, 2);
  } else if (number < 10) {
    return Math.roundDecimals(number, 1);
  } else {
    return Math.round(number);
  }
};



/** @external Date */
/**
 * Month Strings for {@link Date.prototype.format}.
 * @memberOf external:Date
 */
Date.months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
  'Oct', 'Nov', 'Dec'];
/**
 * @return   {String} Date custom formatted for the KIMCHI hud.
 * @alias    format
 * @instance
 * @memberOf external:Date
 */
Date.prototype.format = function () {
  'use strict';
  return Date.months[this.getMonth()] + ' ' + this.getDate() + ', ' +
    this.getFullYear();
};



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
   * Heads up display during free flight.
   * @memberOf module:KIMCHI
   */
  KIMCHI.hud = {};
  KIMCHI.hud.update = function (delta) {
    var translation = KIMCHI.controls.getLocalTranslationVector();
    $('#hud-distance-from-sun').text(Math.roundDecimals(KIMCHI.camera.position.length(), 2, true));
    $('#hud-speed').text(Math.roundDecimals((new THREE.Vector3(
      translation.x * KIMCHI.config.controls.strafeSpeed,
      translation.y * KIMCHI.config.controls.strafeSpeed,
      translation.z * KIMCHI.config.controls.zSpeed
    )).length() * KIMCHI.flight.getTranslationSpeedMultiplier(), 2, true));
    $('#hud-time').text(KIMCHI.date.format());

    if (KIMCHI.config.debug) {
      $('#hud4').html(
        '<strong>Debug</strong><br />' +
        'Delta: ' +
          Math.roundDecimals(delta, 4, true) + '<br />' +
        'Camera position (px): ' +
          Math.round(KIMCHI.camera.position.x) + ', ' +
          Math.round(KIMCHI.camera.position.y) + ', ' +
          Math.round(KIMCHI.camera.position.z) + '<br />' +
        'Camera rotation (deg): ' +
          Math.round(KIMCHI.camera.rotation.x * 180 / Math.PI) + ', ' +
          Math.round(KIMCHI.camera.rotation.y * 180 / Math.PI) + ', ' +
          Math.round(KIMCHI.camera.rotation.z * 180 / Math.PI) + '<br />'
/*      'movement: ' +
          translation.x + ', ' +
          translation.y + ', ' +
          translation.z + '<br />' +*/
      );
    }
  };

  /**
   * The navigation that appears when free flight is paused.
   * @memberOf module:KIMCHI
   */
  KIMCHI.nav = {};
  KIMCHI.nav.update = function () {
    KIMCHI.nav.updateFlyToList();
  };
  KIMCHI.nav.updateFlyToList = function () {
    var bodies = KIMCHI.space.getBodiesByDistance();
    $('#fly-to').empty();
    _.forEach(bodies, function (body) {
      $('#fly-to').append(
        $('<li>').append(
          $('<a>').text(body.name).data('name', body.name),
          $('<span>').text(' (' + Math.roundNicely(body.distance) + ' AU)')
        )
      );
    });
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
   * Notice box.
   * @memberOf module:KIMCHI
   */
  KIMCHI.notice = {
    '$notice': $(),
    'init': function () {
      KIMCHI.notice.$notice = $('#notice');
    },
    'set': function (message) {
      KIMCHI.notice.$notice.html(message).fadeIn();
    },
    'clear': function () {
      KIMCHI.notice.$notice.text('').fadeOut();
    }
  };



  return KIMCHI;
}(KIMCHI || {}, _, jQuery, THREE));