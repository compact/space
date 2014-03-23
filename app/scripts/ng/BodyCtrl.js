angular.module('kimchi').controller('BodyCtrl', function ($scope, KIMCHI) {
  $scope.KIMCHI = KIMCHI;

  // whether to hide the loading overlay
  $scope.loaded = false;

  KIMCHI.ready.promise.then(function () {
    $scope.loaded = true;
  });
});
