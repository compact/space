(function (KIMCHI, $, THREE) {
  'use strict';

  $(function () {
    KIMCHI.$document = $(document);
    KIMCHI.$window = $(window);
    KIMCHI.$overlay = $('#overlay');

    KIMCHI.$overlay.one('click', '.continue-flying', function () {
      var $this = $(this);

      $this.button('loading');
      // short delay for the button to go into its loading state first
      setTimeout(function () {
        KIMCHI.init();
        KIMCHI.pointerLock.request(); // async
        // TODO: this button changing before free flight gets enabled is unsightly, so move this line to pointerLock change()
        $this.button('continue');

        KIMCHI.$overlay.on('click', '.continue-flying',
          KIMCHI.pointerLock.request);
      }, 50);
    });

  });
}(KIMCHI, jQuery, THREE));