/**
 * In this mode, flight is paused and the menu is shown. Instance of {@link
 *   module:KIMCHI.flight.Mode|Mode}.
 * @namespace menu
 * @memberOf  module:KIMCHI.flight.modes
 */
var KIMCHI = (function (KIMCHI) {
  'use strict';

  var flight, Mode, mode;

  flight = KIMCHI.flight;
  Mode = flight.Mode;
  mode = new Mode('menu');
  KIMCHI.flight.modes.menu = mode;



  /**
   * @memberOf module:KIMCHI.flight.modes.menu
   */
  mode.enable = function () {
    Mode.prototype.enable.call(this);

    KIMCHI.clock.stop();
    KIMCHI.$overlay.show();
/*    KIMCHI.$overlay.blurjs({
      source: '#space',
      radius: 7,
      overlay: 'rgba(255,255,255,0.4)'
    });*/
  };

  /**
   * @memberOf module:KIMCHI.flight.modes.menu
   */
  mode.disable = function () {
    Mode.prototype.disable.call(this);

    KIMCHI.$overlay.hide();
    KIMCHI.clock.start();
  };

  /**
   * @memberOf module:KIMCHI.flight.modes.menu
   */
  mode.animationFrame = function () {
    return false;
  };



  return KIMCHI;
}(KIMCHI || {}));