/**
 * Flight is paused and the menu is shown.
 * @namespace menu
 * @memberOf  module:KIMCHI.flight.modes
 */
var KIMCHI = (function (KIMCHI, $) {
  'use strict';

  var flight, Mode, mode, keydown;



  flight = KIMCHI.flight;
  Mode = flight.Mode;
  mode = new Mode('menu');
  KIMCHI.flight.modes.menu = mode;

  mode.enable = function () {
    Mode.prototype.enable.call(this);

    KIMCHI.clock.stop();
    KIMCHI.ui.panel.update();
    KIMCHI.$overlay.show();
/*    KIMCHI.$overlay.blurjs({
      source: '#space',
      radius: 7,
      overlay: 'rgba(255,255,255,0.4)'
    });*/
    KIMCHI.$document.on('keydown', keydown);
  };

  mode.disable = function () {
    Mode.prototype.disable.call(this);

    KIMCHI.$overlay.hide();
    KIMCHI.clock.start();
    KIMCHI.$document.off('keydown', keydown);
  };

  mode.animationFrame = function () {
    return false;
  };



  /**
   * The event handler for pressing Escape to request pointer lock. We request
   *   pointer lock only on keyup; otherwise, the continued Escape keydown
   *   event causes the pointer lock to disable immediately, even if one lets
   *   go of the Escape key asap. Also, the flag keydownInProgress prevents
   *   multiple handlers of .one('keyup') from being binded.
   * @private
   * @memberOf module:KIMCHI.flight.modes.menu
   */
  keydown = (function () {
    var keydownInProgress = false;

    return function (event) {
      if (event.which === 27) { // Esc
        keydownInProgress = true;
        $(this).one('keyup', function (event) {
          if (event.which === 27 && keydownInProgress) {
            KIMCHI.pointerLock.request();
            keydownInProgress = false;
          }
        });
      }
    };
  }());



  return KIMCHI;
}(KIMCHI || {}, jQuery));