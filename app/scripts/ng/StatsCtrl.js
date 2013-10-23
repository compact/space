/**
 * This controller handles the part of the hud that displays statistics to the
 *   user.
 */
angular.module('kimchi').controller('StatsCtrl', function ($scope, $timeout, Kimchi, Three) {
  var handler;

  $scope.data = {};

  handler = function () {
    $timeout(function () { // $digest
      $scope.data.time = Kimchi.format.time();
      $scope.data.distanceFromSun = Kimchi.format.roundNicely(Three.Object3D.getDistance(Kimchi.camera, Kimchi.space.getBody('Sun').object3Ds.main), 2, true);
      $scope.data.speed = Kimchi.format.roundDecimals(Kimchi.flight.getSpeed(), 2, true);
    });
  };

  Kimchi.on('render', handler);

  $scope.$on('$destroy', function () {
    Kimchi.off('render', handler);
  });
});