var app = angular.module('kimchi', ['three', '$strap.directives']);

app.factory('Kimchi', function () {
  return window.KIMCHI;
});