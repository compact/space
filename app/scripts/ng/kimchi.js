var app = angular.module('kimchi', ['three', '$strap.directives']);

app.factory('Kimchi', function ($rootScope, $q) {
  var KIMCHI, deferred;

  KIMCHI = window.KIMCHI;



  console.log('initializing KIMCHI...');

  // we construct the deferred ourselves because $q.when() didn't work with the
  // promise returned from KIMCHI.init()
  deferred = $q.defer();

  KIMCHI.init().done(function () {
    console.log('...finished initializing KIMCHI');
    deferred.resolve();
    $rootScope.$digest();
  }).fail(function () {
    console.log('...error initializing KIMCHI');
    deferred.reject();
    $rootScope.$digest();
  });

  KIMCHI.init.promise = deferred.promise;



  return KIMCHI;
});