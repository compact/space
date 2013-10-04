var hud = angular.module('hud', ['kimchi', 'three']);

function debugCtrl($scope, $timeout, Kimchi, Three) {
  var unbind, position, rotation;

  $scope.kimchi = Kimchi;
  // placeholder values that appear before kimchi finishes initializing
  $scope.data = {};
  $scope.data.delta = 0;
  $scope.data.position = '0, 0, 0';
  $scope.data.rotation = '0, 0, 0';

  unbind = Kimchi.watcher.watch(function () {
    position = Kimchi.camera.position;
    rotation = Kimchi.camera.rotation;

    $scope.data.delta = Kimchi.format.roundDecimals(Kimchi.renderer.delta, 4,
      true);
    $scope.data.position = Math.round(position.x) + ', ' +
      Math.round(position.y) + ', ' + Math.round(position.z);
    $scope.data.rotation = Kimchi.format.angle(rotation.x) + ', ' +
      Kimchi.format.angle(rotation.y) + ', ' + Kimchi.format.angle(rotation.z);

    $scope.$digest();
  });

  $scope.$on('$destroy', unbind);

  // $scope.translateRotation = function (val) {
  //   return val * 180 / Math.PI;
  // };

  $scope.settings = {
    visible: Kimchi.config.get('debug')
  };
}