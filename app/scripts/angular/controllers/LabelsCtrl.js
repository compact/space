angular.module('kimchi').controller('LabelsCtrl', function ($scope, KIMCHI) {
  $scope.labels = {};

  // initialize the labels with the relevant Body properties
  KIMCHI.init.promise.then(function () {
    _.each(KIMCHI.space.bodies, function (body) {
      $scope.labels[body.name] = {
        'name': body.name,
        'css': {}
      };
    });
  });

  // update the labels on every render
  KIMCHI.on('render', function () {
    if (KIMCHI.config.get('showLabels')) {
      var label, coords, sortedDistances = KIMCHI.space.getSortedDistances();

      _.each(KIMCHI.space.bodies, function (body) {
        label = $scope.labels[body.name];
        coords = body.getCanvasCoords();

        if (coords) {
          // show and position the label
          label.css.left = coords.x + 'px',
          label.css.top = coords.y + 'px',
          label.css.zIndex = 100 + // TODO: constant offset
            _.findIndex(sortedDistances, {'name': body.name});
          label.show = true;
        } else {
          // hide the label; the Body is either not visible in the current view
          // or too far away
          label.show = false;
        }
      });
    }
  });
});
