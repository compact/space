angular.module('kimchi').controller('LabelsCtrl', function ($scope, KIMCHI) {
  KIMCHI.on('render', function () {
    var sortedDistances = KIMCHI.space.getSortedDistances();

    $scope.labels = [];

    _.each(KIMCHI.space.bodies, function (body) {
      var coords = body.getCanvasCoords();

      if (coords) {
        $scope.labels.push({
          'name': body.name,
          'css': {
            'left': coords.x + 'px',
            'top': coords.y + 'px',
            // TODO: constant offset
            'zIndex': 100 + _.findIndex(sortedDistances, {'name': body.name})
          }
        });
      }
    });
  });
});
