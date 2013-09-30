(function (KIMCHI, $) {
  'use strict';

  KIMCHI = KIMCHI || {};
  KIMCHI.watcher = (function() {
    var watches = {};

    return {
        watch: function(callback) {
            var id = Math.random().toString();
            watches[id] = callback;

            return function() {
                watches[id] = null;
                delete watches[id];
            }
        },
        trigger: function() {
            for (var k in watches) {
                watches[k](1);
            }
        }
    }
  })();

}(KIMCHI, jQuery));