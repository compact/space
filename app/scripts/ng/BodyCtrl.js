app.controller('BodyCtrl', function ($scope, Kimchi) {
  $scope.Kimchi = Kimchi;

  // whether to hide the loading overlay
  $scope.loaded = false;

  Kimchi.ready.promise.then(function () {
    $scope.loaded = true;
  });
});