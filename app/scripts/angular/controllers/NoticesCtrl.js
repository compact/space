angular.module('kimchi').controller('NoticesCtrl', function ($scope, KIMCHI) {
  KIMCHI.on('noticesChanged', function (notices) {
    $scope.notices = notices;
  });
});
