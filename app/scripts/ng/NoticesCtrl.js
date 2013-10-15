app.controller('NoticesCtrl', function ($scope, Kimchi) {
  Kimchi.on('noticesChanged', function (notices) {
    $scope.notices = notices;
  });
});