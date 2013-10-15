var app = angular.module('kimchi', ['three', '$strap.directives']);

app.factory('Kimchi', function ($rootScope, $document) {
  var KIMCHI = window.KIMCHI;

  // flight mode changes
  $document.on('keypress', function (event) {
    switch (event.which) {
    case 49: // 1
      KIMCHI.flight.setMode('menu');
      break;
    case 50: // 2
      KIMCHI.flight.setMode('pointerLock');
      break;
    case 51: // 3
      KIMCHI.flight.setMode('orbit');
      break;
    }
  });

  return KIMCHI;
});