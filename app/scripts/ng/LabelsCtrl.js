angular.module('kimchi').controller('LabelsCtrl', function ($scope, KIMCHI) {
  KIMCHI.on('render', function () {
    $scope.labels = [];
    _.each(KIMCHI.space.bodies, function (body) {
      var coords = body.getCanvasCoords();

      if (coords) {
        $scope.labels.push({
          'name': body.name,
          'left': coords.x + 'px',
          'top': coords.y + 'px'
        });
      }
    });
  });
});
