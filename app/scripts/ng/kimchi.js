angular.module('kimchi', ['three', '$strap.directives']).factory('Kimchi', function () {
  return window.KIMCHI || {};
});