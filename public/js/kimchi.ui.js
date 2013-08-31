/**
 * User interface features with jQuery and Bootstrap.
 * @namespace ui
 * @memberOf  module:KIMCHI
 */
var KIMCHI = (function (KIMCHI, $) {
  'use strict';

  var ui = {}, hud = {}, panel = {}, notice = {};
  ui.hud = hud;
  ui.panel = panel;
  ui.notice = notice;
  KIMCHI.ui = ui;



  /**
   * Heads up display during free flight.
   * @namespace ui
   * @memberOf  module:KIMCHI.ui
   */
  hud.update = function (delta) {
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
   * The overlay panel that appears when free flight is paused.
   * @namespace panel
   * @memberOf  module:KIMCHI.ui
   */
  panel.init = function () {
    var $bodies = $('#bodies');

    // populate the bodies table
    _.forEach(KIMCHI.space.getBodies(), function (body) {
      $('<tr id="body-' + body.name + '">' +
          '<td>' + body.name + '</td>' +
          '<td><a class="fly-to" data-name="' + body.name + '">Fly There!</a></td>' +
          '<td class="distance"></td>' +
          '<td>' + body.radiusInKm + ' km</td>' +
        '</tr>').appendTo($bodies);
    });

    // bind fly-to links
    $('#bodies').on('click', '.fly-to', function (event) {
      var name, body;

      name = $(this).data('name');
      body = KIMCHI.space.getBody(name);
      KIMCHI.flight.auto.flyTo(body);
    });

    panel.update();
  };
  panel.update = function () {
    panel.updateBodiesTable();
  };
  panel.updateBodiesTable = function () {
    _.forEach(KIMCHI.space.getSortedDistances(), function (body) {
      $('#body-' + body.name + ' .distance')
        .text(Math.roundNicely(body.distance) + ' AU');
    });
  };



  /**
   * Notice box.
   * @namespace notice
   * @memberOf  module:KIMCHI
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