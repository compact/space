app.controller('PanelsCtrl', function ($scope, $document, Kimchi) {
  // whether to show each panel
  $scope.panels = {
    'about': true,
    'bodies': false,
    'options': false
  };

  // this is a helper function because we need to hide all panels in addition to
  // setting the flight mode
  $scope.setMode = function (name) {
    angular.forEach($scope.panels, function (value, key) {
      $scope.panels[key] = false;
    });

    return Kimchi.flight.setMode(name);
  };

  // bind keys for flight mode changes
  $document.on('keypress', function (event) {
    switch (event.which) {
    case 49: // 1
      // case not covered by $scope.setMode()
      Kimchi.flight.setMode('orbit');
      $scope.panels.about = true;
      break;
    case 50: // 2
      $scope.setMode('pointerLock');
      break;
    case 51: // 3
      $scope.setMode('orbit');
      break;
    }
  });
});