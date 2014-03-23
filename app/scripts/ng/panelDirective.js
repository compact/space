/**
 * Bootstrap-styled panel. Usage:
 *   <panel key="" title="">content</panel>
 * For values of key, see PanelsCtrl. Title appears in the panel heading.
 */
angular.module('kimchi').directive('panel', function () {
  return {
    'restrict': 'E',
    'transclude': true,
    'scope': true,
    'template':
      '<div class="panel panel-success" ng-show="panels[key]" stop-propagation="mousedown">' +
        '<div class="panel-heading">' +
          '<button type="button" class="close" aria-hidden="true" ng-click="panels[key] = false">&times;</button>' +
          '<h2 class="panel-title">{{title}}</h3>' +
        '</div>' +
        '<div class="panel-body" ng-transclude></div>' +
      '</div>',
    'link': function (scope, iElement, iAttrs) {
      scope.key = iAttrs.key;
      scope.title = iAttrs.title;
    }
  };
});
