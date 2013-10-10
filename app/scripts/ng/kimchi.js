var app = angular.module('kimchi', ['three', '$strap.directives']);

app.factory('Kimchi', function ($rootScope, $q) {
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



  return KIMCHI;
});