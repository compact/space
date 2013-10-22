app.controller('BodiesCtrl', function ($scope, Kimchi, $timeout) {
  $scope.panTo = function (body) {
    $scope.setMode('auto').panTo(body).then(function () {
      $timeout(function () {
        Kimchi.flight.setMode('pointerLock');
      });
    });
  };

  $scope.flyTo = function (body) {
    $scope.setMode('auto').flyTo(body).then(function () {
      $timeout(function () { // $digest to update the current distances
        // TODO: set last mode, whether pointerLock or orbit
        Kimchi.flight.setMode('pointerLock');
      });
    });
  };

  $scope.orbit = function (body) {
    Kimchi.flight.modes.orbit.setTargetBody(body);
    $scope.setMode('auto').flyTo(body).then(function () {
      $timeout(function () {
        $scope.setMode('orbit');
      });
    });
  };
});