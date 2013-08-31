/**
 * User interface features with jQuery and Bootstrap.
 * @namespace ui
 * @memberOf  module:KIMCHI
 */
var KIMCHI = (function (KIMCHI, $) {
  'use strict';

  var ui = {}, hud = {}, panel = {};
  ui.hud = hud;
  ui.panel = panel;
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
    _.forEach(KIMCHI.space.getBodies(), function (body) {
      $bodies.append(
        $('<tr>').append(
          $('<td>').text(body.name),
          $('<td>').append(
            $('<a>').text('Fly There!')
          ),
          $('<td>').text(body.radius)
        )
      );
    });
  };
  panel.update = function () {
    panel.updateBodiesTable();
  };
  panel.updateBodiesTable = function () {
    var distances = KIMCHI.space.getSortedDistances();
    console.log(distances);
    _.forEach(bodies, function (body) {
      $('#' + body.name + ' .distance')
        .text(Math.roundNicely(body.distance) + ' AU');
    });
  };



  return KIMCHI;
}(KIMCHI || {}, jQuery));