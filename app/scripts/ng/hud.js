// var hud = angular.module('hud', ['kimchi', 'three']);

angular.module('kimchi').controller('statsCtrl', function ($scope, Kimchi) {
  var unbind;

  $scope.data = {};

  unbind = Kimchi.watcher.watch(function () {
    $scope.data.time = Kimchi.format.time();
    $scope.data.distanceFromSun = Kimchi.format.roundNicely(THREE.Object3D.getDistance(Kimchi.camera, Kimchi.space.getBody('Sun').object3Ds.main), 2, true);
    $scope.data.speed = Kimchi.format.roundDecimals(Kimchi.flight.getSpeed(), 2, true);

    $scope.$digest();
  });

  $scope.$on('$destroy', unbind);
});

angular.module('kimchi').controller('debugCtrl', function ($scope, Kimchi) {
  var unbind, position, rotation;

  $scope.data = {};

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

  $scope.settings = {
    visible: Kimchi.config.get('debug')
  };
});