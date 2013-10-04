angular.module('kimchi', ['three']).factory('Kimchi', function () {
  return window.KIMCHI || {};
});