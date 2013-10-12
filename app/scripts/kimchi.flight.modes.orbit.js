/**
 * @namespace orbit
 * @memberOf  module:KIMCHI.flight.modes
 */
var KIMCHI = (function (KIMCHI) {
  'use strict';

  var flight, Mode, mode;



  flight = KIMCHI.flight;
  Mode = flight.Mode;
  mode = new Mode('orbit');
  KIMCHI.flight.modes.orbit = mode;

  mode.enable = function () {
    Mode.prototype.enable.call(this);

    KIMCHI.orbitControls.enable();
  };

  mode.disable = function () {
    Mode.prototype.disable.call(this);

    KIMCHI.orbitControls.disable();
  };

  mode.animationFrame = function (delta) {
    KIMCHI.orbitControls.update();

    // rotate the Bodies
    if (KIMCHI.config.get('rotateBodies')) {
      KIMCHI.space.rotateBodies(delta);
    }

    // move the Bodies' children
    KIMCHI.space.updateBodyChildren();
  };



  return KIMCHI;
}(KIMCHI || {}));