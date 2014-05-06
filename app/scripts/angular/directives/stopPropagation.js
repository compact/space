/**
 * Usage:
 *   <element stop-propagation="click">
 */
angular.module('kimchi').directive('stopPropagation', function () {
  return function (scope, iElement, iAttrs) {
    iElement.on(iAttrs.stopPropagation, function (event) {
      event.stopPropagation();
    });
  };
});
