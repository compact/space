var KIMCHI = (function (KIMCHI, _) {
  'use strict';

  KIMCHI.watcher = (function () {
    var watches = {};

    return {
      'watch': function (callback) {
        var id = Math.random().toString();
        watches[id] = callback;

        return function () {
          console.log('w');
          watches[id] = null;
          delete watches[id];
        };
      },
      'trigger': function () {
        _.each(watches, function (watch) {
          console.log('t');
          watch(1);
        });
      }
    };
  }());

  return KIMCHI;
}(KIMCHI || {}, _));