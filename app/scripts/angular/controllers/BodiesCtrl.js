/**
 * This controller handles the bodies panel, where actions can be taken on
 *   Bodies.
 */
angular.module('kimchi').controller('BodiesCtrl', function ($scope, $timeout,
    KIMCHI) {
  $scope.panTo = function (body) {
    KIMCHI.flight.modes.orbit.updateTargetBody(body);
    $scope.setMode('auto').panTo(body).then(function () {
      $timeout(function () {
        KIMCHI.flight.setMode('pointerLock');
      });
    });
  };

  $scope.flyTo = function (body) {
    KIMCHI.flight.modes.orbit.updateTargetBody(body);
    $scope.setMode('auto').flyTo(body).then(function () {
      $timeout(function () { // $digest to update the current distances
        // TODO: set last mode, whether pointerLock or orbit
        KIMCHI.flight.setMode('pointerLock');
      });
    });
  };

  $scope.orbit = function (body) {
    KIMCHI.flight.modes.orbit.updateTargetBody(body);
    $scope.setMode('auto').flyTo(body).then(function () {
      $timeout(function () {
        $scope.setMode('orbit');
      });
    });
  };
});
