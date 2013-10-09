// var options = angular.module('options', ['kimchi', 'three']);

angular.module('kimchi').controller('optionsCtrl', function ($scope, $timeout, Kimchi) {

  $scope.revolutionSpeeds = [
    {
      'val': 0,
      'text': 'Off'
    },
    {
      'val': 1,
      'text': 'Fast'
    },
    {
      'val': 2,
      'text': 'Faster'
    },
    {
      'val': 8,
      'text': 'Fastest'
    }
  ];

  $scope.scaledSizes = [
    {
      'val': '1',
      'text': '1x'
    },
    {
      'val': '10',
      'text': '10x'
    },
    {
      'val': '100',
      'text': '100x'
    },
    {
      'val': '1000',
      'text': '1000x'
    },
    {
      'val': 'large',
      'text': 'Large'
    }
  ];

  $timeout(function () {
    $scope.rotation = true;
    $scope.ambientLighting = true;
    $scope.showTextLabels = true;
    $scope.showOrbitCurves = true;
    $scope.showStars = true;
    $scope.flightSpeed = 1;
    $scope.mouseSensitivity = 0.0002;
    $scope.revolutionSpeed = $scope.revolutionSpeeds[1];
    $scope.scaledSize = $scope.scaledSizes[4];

    $scope.$watch('revolutionSpeed', function (option) {
      Kimchi.config.set('bodies-speed', option.val);
    });

    $scope.$watch('scaledSize', function (option) {
      Kimchi.config.set('scales-size', option.val);
    });

    $scope.$watch('rotation', function (value) {
      Kimchi.config.set('rotate-bodies', value);
    });

    $scope.$watch('ambientLighting', function (value) {
      Kimchi.config.set('ambient-lighting', value);
    });

    $scope.$watch('showTextLabels', function (value) {
      Kimchi.config.set('show-labels', value);
    });

    $scope.$watch('showOrbitCurves', function (value) {
      Kimchi.config.set('show-orbits', value);
    });

    $scope.$watch('showStars', function (value) {
      Kimchi.config.set('show-stars', value);
    });

    $scope.$watch('flightSpeed', function (value) {
      Kimchi.config.set('controls-flying-speed-multiplier', value);
    });

    $scope.$watch('mouseSensitivity', function (value) {
      Kimchi.config.set('controls-look-speed', value);
    });
  });
});