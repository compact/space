app.controller('DebugCtrl', function ($scope, $timeout, KIMCHI) {
  var handler, position, rotation;

  $scope.data = {};

  handler = function () {
    $timeout(function () { // $digest
      position = KIMCHI.camera.position;
      rotation = KIMCHI.camera.rotation;

      $scope.data.delta = KIMCHI.format.roundDecimals(KIMCHI.renderer.delta, 4,
        true);
      $scope.data.position = Math.round(position.x) + ', ' +
        Math.round(position.y) + ', ' + Math.round(position.z);
      $scope.data.rotation = KIMCHI.format.angle(rotation.x) + ', ' +
        KIMCHI.format.angle(rotation.y) + ', ' + KIMCHI.format.angle(rotation.z);
    });
  };

  KIMCHI.on('render', handler);

  $scope.$on('$destroy', function () {
    KIMCHI.off('render', handler);
  });

  $scope.settings = {
    visible: KIMCHI.config.get('debug')
  };
});