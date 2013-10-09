// var options = angular.module('options', ['kimchi', 'three']);

angular.module('kimchi').controller('optionsCtrl', function ($scope, Kimchi) {

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

  $scope.rotation = true;
  $scope.ambientLighting = true;
  $scope.showTextLabels = true;
  $scope.showOrbitCurves = true;
  $scope.showStars = true;
  $scope.flightSpeed = 1;
  $scope.mouseSensitivity = 0.0002;
  $scope.revolutionSpeed = $scope.revolutionSpeeds[1];
  $scope.scaledSize = $scope.scaledSizes[4];

  $scope.$watch('revolutionSpeed', function(newVal, oldVal){
    Kimchi.config.set('bodies-speed', newVal.val);
  });

  $scope.$watch('scaledSize', function(newVal, oldVal){
    Kimchi.config.set('scales-size', newVal.val);
  });

  $scope.$watch('rotation', function(newVal, oldVal){
    Kimchi.config.set('rotate-bodies', newVal);
    console.log(newVal);
  });

  $scope.$watch('ambientLighting', function(newVal, oldVal){
    Kimchi.config.set('ambient-lighting', newVal);
  });

  $scope.$watch('showTextLabels', function(newVal, oldVal){
    Kimchi.config.set('show-labels', newVal);
  });

  $scope.$watch('showOrbitCurves', function(newVal, oldVal){
    Kimchi.config.set('show-orbits', newVal);
  });

  $scope.$watch('showStars', function(newVal, oldVal){
    Kimchi.config.set('show-stars', newVal);
  });

  $scope.$watch('flightSpeed', function(newVal, oldVal){
    if(Kimchi.controls !== undefined){
      Kimchi.config.set('controls-flying-speed-multiplier', newVal);
    }
  });

  $scope.$watch('mouseSensitivity', function(newVal, oldVal){
    if(Kimchi.controls !== undefined){
      Kimchi.config.set('controls-look-speed', newVal);
    }
  });

});