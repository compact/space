var app = angular.module('kimchi', ['three', '$strap.directives']);

app.factory('Kimchi', function ($rootScope, $q) {
  var KIMCHI, deferred;

  KIMCHI = window.KIMCHI;



  // we construct the deferred ourselves because $q.when() didn't work with the
  // promise returned from KIMCHI
  deferred = $q.defer();

  KIMCHI.init.promise.done(function () {
    deferred.resolve();
    // TODO: got a "$apply already in progress" error here once
    $rootScope.$digest();
  }).fail(function () {
    deferred.reject();
    $rootScope.$digest();
  });

  KIMCHI.init.ngPromise = deferred.promise;



  return KIMCHI;
});