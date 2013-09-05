(function (KIMCHI, $, THREE) {
  'use strict';

  $(function () {
    // initialize KIMCHI
    KIMCHI.init();
//    KIMCHI.ui.panel.init();

    // event handler for the first time the user clicks "Start Flying"
    KIMCHI.$overlay.one('click', '.continue-flying', function () {
      var $this = $(this);

      KIMCHI.pointerLock.request(); // async
      // TODO: this button changing before free flight gets enabled is unsightly, so move this line to pointerLock change()
      window.setTimeout(function () {
        $this.button('continue');
      }, 250);

      KIMCHI.$overlay.on('click', '.continue-flying',
        KIMCHI.pointerLock.request);
    });

  });
}(KIMCHI, jQuery, THREE));