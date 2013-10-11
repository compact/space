/**
 * Flight mode. Should be constructed inside kimchi.flight.js only.
 * @param       {String} name
 * @constructor Mode
 * @memberOf    module:KIMCHI.flight
 */
var KIMCHI = (function (KIMCHI, $) {
  'use strict';

  var Mode = function (name) {
    this.name = name;
  };

  /**
   * Whether this mode is currently enabled.
   * @memberOf module:KIMCHI.flight.Mode
   */
  Mode.prototype.enabled = false;

  /**
   * Enable.
   * @memberOf module:KIMCHI.flight.Mode
   */
  Mode.prototype.enable = function () {
    this.enabled = true;
    this.animate();
  };

  /**
   * Disable.
   * @memberOf module:KIMCHI.flight.Mode
   */
  Mode.prototype.disable = function () {
    this.enabled = false;
  };

  /**
   * Toggle.
   * @memberOf module:KIMCHI.flight.Mode
   */
  Mode.prototype.toggle = function (enable) {
    if (typeof enable === 'boolean') {
      if (enable) {
        this.enable();
      } else {
        this.disable();
      }
    } else if (this.enabled) {
      this.enable();
    } else {
      this.disable();
    }
  };

  /**
   * In this mode, what happens in each animation frame?
   * @param    {Number} delta
   * @memberOf module:KIMCHI.flight.Mode
   */
  Mode.prototype.animationFrame = function () {};

  /**
   * Start animating for this mode with this.animationFrame(). This function
   *   should only be called once, when this mode is enabled. The animation
   *   stops if either this mode is disabled or this.animationFrame() returns
   *   false.
   * @memberOf module:KIMCHI.flight.Mode
   */
  Mode.prototype.animate = function () {
    var self = this;
    KIMCHI.renderer.animate(function (delta) {
      if (!self.enabled) {
        // this mode is being disabled
        console.log('.flight.Mode: stopping animation for ' + self.name);
        return $.when(false);
      }

      return $.when(self.animationFrame(delta));
    });
  };

  /**
   * The current speed.
   * @memberOf module:KIMCHI.flight.Mode
   */
  Mode.prototype.speed = 0;

  KIMCHI.flight = KIMCHI.flight || {};
  KIMCHI.flight.Mode = Mode;
  return KIMCHI;
}(KIMCHI || {}, jQuery));