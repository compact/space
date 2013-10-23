app.controller('OptionsCtrl', function ($scope, KIMCHI) {
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
    'bodiesSpeed',
    'bodiesSizeScale'
  ];
  keys = radioKeys.concat(dropdownKeys);

  $scope.options = {
    'bodiesSpeed': [
      {
        'value': 0,
        'label': 'Off'
      },
      {
        'value': 1,
        'label': 'Fast'
      },
      {
        'value': 2,
        'label': 'Faster'
      },
      {
        'value': 8,
        'label': 'Fastest'
      }
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
});