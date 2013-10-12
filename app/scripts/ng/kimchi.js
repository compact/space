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
      KIMCHI.flight.setMode('free');
      break;
    case 51: // 3
      KIMCHI.flight.setMode('orbit');
      break;
    }
  });



  return KIMCHI;
});



app.controller('KimchiCtrl', function ($scope, Kimchi) {
  $scope.Kimchi = Kimchi;
});



app.controller('BodiesCtrl', function ($scope, Kimchi, $timeout) {
  $scope.flyTo = function (body) {
    Kimchi.flight.setMode('auto');
    Kimchi.flight.modes.auto.flyTo(body).then(function () {
      $timeout(function () { // $digest to update the current distances
        Kimchi.flight.setMode('free');
      });
    });
  };

  $scope.panTo = function (body) {
    Kimchi.flight.setMode('auto');
    Kimchi.flight.modes.auto.panTo(body).then(function () {
      $timeout(function () { // $digest to update the current distances
        Kimchi.flight.setMode('free');
      });
    });
  };
});