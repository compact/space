var app = angular.module('kimchi', ['three', '$strap.directives']);

app.factory('Kimchi', function ($rootScope, $q, $document) {
  var KIMCHI, deferred;

  KIMCHI = window.KIMCHI;



  // we construct the deferred ourselves because $q.when() didn't work with the
  // promise returned from KIMCHI
  deferred = $q.defer();

  KIMCHI.init.promise.done(function () {
    deferred.resolve();

    if (!$rootScope.$$phase) {
      $rootScope.$digest();
    }
  }).fail(function () {
    deferred.reject();

    if (!$rootScope.$$phase) {
      $rootScope.$digest();
    }
  });

  KIMCHI.init.ngPromise = deferred.promise;



  $document.on('keypress', function (event) {
    switch (event.which) {
    case 49: // 1
      KIMCHI.flight.setMode('menu');
      break;
    case 50: // 2
      KIMCHI.flight.setMode('free');
      break;
    case 51: // 3
      KIMCHI.flight.setMode('orbit');
      break;
    }
  });



  return KIMCHI;
});