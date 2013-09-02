(function (KIMCHI, $, THREE) {
  'use strict';

  $(function () {
    KIMCHI.$document = $(document);
    KIMCHI.$window = $(window);
    KIMCHI.$overlay = $('#overlay');

    KIMCHI.$overlay.one('click', '#continue-flying', function () {
      KIMCHI.init();
      KIMCHI.pointerLock.request();

      KIMCHI.$overlay.on('click', '#continue-flying',
        KIMCHI.pointerLock.request);
    });

  });
}(KIMCHI, jQuery, THREE));