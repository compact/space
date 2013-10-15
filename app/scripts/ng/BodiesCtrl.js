app.controller('BodiesCtrl', function ($scope, Kimchi, $timeout) {
  $scope.flyTo = function (body) {
    Kimchi.flight.setMode('auto');
    Kimchi.flight.modes.auto.flyTo(body).then(function () {
      $timeout(function () { // $digest to update the current distances
        // TODO: set last mode, whether pointerLock or orbit
        Kimchi.flight.setMode('pointerLock');
      });
    });
  };

  $scope.panTo = function (body) {
    Kimchi.flight.setMode('auto');
    Kimchi.flight.modes.auto.panTo(body).then(function () {
      $timeout(function () { // $digest to update the current distances
        Kimchi.flight.setMode('pointerLock');
      });
    });
  };
});