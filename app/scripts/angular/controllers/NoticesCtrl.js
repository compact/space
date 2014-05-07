angular.module('kimchi').controller('NoticesCtrl', function ($scope, KIMCHI) {
  KIMCHI.on('noticesChanged', function (notices) {
    $scope.notices = _.each(notices, function (notice) {
      // set the associated Bootstrap alert class
      switch (notice.type) {
        case 'error':
          notice.class = 'alert-danger';
          break;
        case 'notice':
          notice.class = 'alert-success';
          break;
      }
    });
  });
});
