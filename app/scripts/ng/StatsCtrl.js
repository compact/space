/**
 * This controller handles the part of the hud that displays statistics to the
 *   user.
 */
app.controller('StatsCtrl', function ($scope, $timeout, KIMCHI, THREE) {
  var handler;

  $scope.data = {};

  handler = function () {
    $timeout(function () { // $digest
      $scope.data.time = KIMCHI.format.time();
      $scope.data.distanceFromSun = KIMCHI.format.roundNicely(THREE.Object3D.getDistance(KIMCHI.camera, KIMCHI.space.getBody('Sun').object3Ds.main), 2, true);
      $scope.data.speed = KIMCHI.format.roundDecimals(KIMCHI.flight.getSpeed(), 2, true);
    });
  };

  KIMCHI.on('render', handler);

  $scope.$on('$destroy', function () {
    KIMCHI.off('render', handler);
  });
});