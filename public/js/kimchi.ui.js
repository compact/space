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
   * @namespace hud
   * @memberOf  module:KIMCHI.ui
   */
  hud.update = function (delta) {
    $('#hud-distance-from-sun').text(KIMCHI.format.roundDecimals(KIMCHI.camera.position.length(), 2, true));
    $('#hud-speed').text(KIMCHI.format.roundDecimals(KIMCHI.flight.getSpeed(), 2, true));
    $('#hud-time').text(KIMCHI.format.time());

    if (KIMCHI.config.get('debug')) {
      $('#hud4').html(
        '<strong>Debug</strong><br />' +
        'Delta: ' +
          KIMCHI.format.roundDecimals(delta, 4, true) + '<br />' +
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
          '<td><a class="fly-to" data-name="' + body.name + '">' +
            KIMCHI.config.get('language-fly-to') + '</a></td>' +
          '<td class="distance"></td>' +
          '<td>' + KIMCHI.format.km(body.radiusInKm) + '</td>' +
          '<td>' + KIMCHI.format.au(body.position.y) + '</td>' +
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

    // bind config
    $('#config-pane').on('click', '[data-toggle="buttons"] .btn', function () {
      // radios and checkboxes
      var $input = $(this).children('input');
      KIMCHI.config.set($input.attr('name'), $input.val());
    }).on('click', '.dropdown-menu a', function () {
      // dropdowns
      var $this = $(this);
      KIMCHI.config.set(
        $this.parents('.btn-group').eq(0).data('key'),
        $this.data('value')
      );
    });

    // update the panel
    panel.update();
  };
  panel.update = function () {
    panel.updateBodiesTable();
  };
  panel.updateBodiesTable = function () {
    _.forEach(KIMCHI.space.getSortedDistances(), function (body) {
      $('#body-' + body.name + ' .distance')
        .text(KIMCHI.format.au(body.distance));
    });
  };
  /**
   * Update the config panel for the given key and value.
   * @param   {String} key
   * @param   {(String|Boolean|Number)} value
   */
  panel.updateConfig = function (key, value) {
    var $config, $button, addClass, removeClass, $btnGroup, label;

    // "unparse" the value back into a String
    value = String(value);

    $config = $('.config');

    // case 1: radios and checkboxes
    $button = $config.find(
      '[name="' + key + '"][value="' + value + '"]'
    ).parent();
    if ($button.length === 1) {
      // determine css classes to add and remove from the respective buttons
      addClass = 'active ';
      if (value === 'true') {
        removeClass = 'btn-danger';
        addClass += 'btn-success';
      } else if (value === 'false') {
        removeClass = 'btn-success';
        addClass += 'btn-danger';
      } else {
        removeClass = 'btn-primary';
        addClass += 'btn-primary';
      }
      $button.siblings().removeClass(removeClass);
      $button.addClass(addClass);
      return;
    }

    // case 2: dropdowns
    $btnGroup = $config.filter('[data-key="' + key + '"]');
    label = $btnGroup.find('[data-value="' + value + '"]').text()
      .replace(/ \(.+\)/, '');
    $btnGroup.find('.selected-value').text(label);
  };



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