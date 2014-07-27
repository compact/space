angular.module('kimchi').controller('OptionsCtrl', function ($scope, $document,
    KIMCHI) {
  var keys, radioKeys, dropdownKeys;

  // Radio settings and dropdown settings are handled differently. When editing
  // these arrays, edit KIMCHI.config.userConfigurableKeys accordingly.
  radioKeys = [
    'rotateBodies',
    'ambientLight',
    'showLabels',
    'showOrbits',
    'showStars',
    'controlsKeyboardSpeedMultiplier',
    'controlsLookSpeed'
  ];
  dropdownKeys = [
    'daysPerSecond',
    'bodiesSizeScale'
  ];
  keys = radioKeys.concat(dropdownKeys);

  $scope.options = {
    'daysPerSecond': [
      {
        'value': 0,
        'label': 'Pause'
      },
      {
        'value': 1,
        'label': '1'
      },
      {
        'value': 7,
        'label': '7'
      },
      {
        'value': 20,
        'label': '20'
      },
      {
        'value': 60,
        'label': '60'
      },
      {
        'value': 365,
        'label': '365'
      },
      {
        'value': 3650,
        'label': '3650'
      },
    ],
    'bodiesSizeScale': [
      {
        'value': 1,
        'label': '1x'
      },
      {
        'value': 10,
        'label': '10x' // (distances lose scale)
      },
      {
        'value': 100,
        'label': '100x' // (distances lose more scale)
      },
      {
        'value': 1000,
        'label': '1000x' // (distances lose even more scale)
      },
      {
        'value': 'large',
        'label': 'Large' // (all bodies appear large without regard to scale)
      }
    ]
  };

  // The config values cannot be set before KIMCHI is initialized because their
  // set handlers make changes to KIMCHI.
  KIMCHI.init.promise.then(function () {
    // radios
    _.each(radioKeys, function (key) {
      // set the initial value (either default or from localStorage)
      $scope[key] = KIMCHI.config.get(key);

      // watch for changes, and set the new value accordingly
      $scope.$watch(key, function (value) {
        KIMCHI.config.set(key, value);
      });
    });

    // dropdowns
    _.each(dropdownKeys, function (key) {
      // set the initial value, which is an object
      $scope[key] = _.find($scope.options[key], {
        'value': KIMCHI.config.get(key)
      });

      $scope.$watch(key, function (option) {
        KIMCHI.config.set(key, option.value);
      });
    });

    KIMCHI.renderer.render();
  });

  // bind toggling of body movement
  $document.on('keypress', function (event) {
    switch (event.which) {
    case 32: // space
      if (KIMCHI.config.get('daysPerSecond') > 0) {
        KIMCHI.config.set('daysPerSecond', 0);
      } else {
        KIMCHI.config.set('daysPerSecond',
          KIMCHI.config.get('prevDaysPerSecond'));
      }
      break;
    }
  });
});
