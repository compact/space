/**
 * User interface features with jQuery and Bootstrap.
 * @namespace ui
 * @memberOf  module:KIMCHI
 */
var KIMCHI = (function (KIMCHI, $) {
  'use strict';

  var ui = {}, notice = {};
  ui.notice = notice;
  KIMCHI.ui = ui;



  /**
   * The overlay panel that appears when free flight is paused.
   * @namespace panel
   * @memberOf  module:KIMCHI.ui
   */
  ui.panel = (function () {
    var panel = {}, $config = $();

    /**
     * Populate the panel with data and bind its handlers.
     * @memberOf module:KIMCHI.ui.panel
     */
    panel.init = function () {
      var $bodies = $('#bodies');

      // populate the bodies table
      _.each(KIMCHI.space.getBodies(), function (body) {
        $('<tr id="body-' + body.name + '">' +
            '<td>' + body.name + '</td>' +
            '<td><a class="fly-to" data-name="' + body.name + '">' +
              KIMCHI.config.get('langFlyTo') + '</a></td>' +
            '<td class="distance"></td>' +
            '<td>' + KIMCHI.format.km(body.radiusInKm) + '</td>' +
            '<td>' + KIMCHI.format.au(body.distanceFromSun) + '</td>' +
          '</tr>').appendTo($bodies);
      });

      // bind fly-to links
      $('#bodies').on('click', '.fly-to', function () {
        var name, body;

        name = $(this).data('name');
        body = KIMCHI.space.getBody(name);
        KIMCHI.flight.setMode('auto');
        KIMCHI.flight.modes.auto.flyTo(body);
      });

      // update the panel
      panel.update();

      // bind "Start Flying" button
      KIMCHI.$overlay.one('click', '.continue-flying', function () {
        var $this = $(this);

        KIMCHI.flight.setMode('free'); // async
        // this delay is because the button changing before free flight gets
        // enabled is unsightly
        window.setTimeout(function () {
          $this.button('continue');
        }, 250);

        KIMCHI.$overlay.on('click', '.continue-flying', function () {
          KIMCHI.flight.setMode('free');
        });
      });

      // used by updateConfig()
      $config = $('.config');
    };

    /**
     * Update the panel with data that may change each time the flight mode
     *   changes to menu, such as Body distances.
     * @memberOf module:KIMCHI.ui.panel
     */
    panel.update = function () {
      // update the bodies table
      _.each(KIMCHI.space.getSortedDistances(), function (body) {
        $('#body-' + body.name + ' .distance')
          .text(KIMCHI.format.au(body.distance));
      });
    };

    return panel;
  }());



  /**
   * Notice box.
   * @namespace notice
   * @memberOf  module:KIMCHI.ui
   */
  notice.init = function () {
    notice.$notice = $('#notice');
  };
  notice.set = function (message) {
    notice.$notice.html(message).fadeIn();
  };
  notice.clear = function () {
    notice.$notice.text('').fadeOut();
  };



  return KIMCHI;
}(KIMCHI || {}, jQuery));