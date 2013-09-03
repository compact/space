(function (KIMCHI, $, THREE) {
  'use strict';

  $(function () {
    KIMCHI.$document = $(document);
    KIMCHI.$window = $(window);
    KIMCHI.$overlay = $('#overlay');

    KIMCHI.init();

    KIMCHI.$overlay.one('click', '.continue-flying', function () {
      var $this = $(this);

      KIMCHI.pointerLock.request(); // async
      // TODO: this button changing before free flight gets enabled is unsightly, so move this line to pointerLock change()
      setTimeout(function () {
        $this.button('continue');
      }, 250);

      KIMCHI.$overlay.on('click', '.continue-flying',
        KIMCHI.pointerLock.request);
    });

  });
}(KIMCHI, jQuery, THREE));