// usage: stop-propagation="click"
app.directive('stopPropagation', function () {
  return function (scope, iElement, iAttrs) {
    iElement.on(iAttrs.stopPropagation, function (event) {
      event.stopPropagation();
    });
  };
});