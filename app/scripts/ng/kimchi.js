var app = angular.module('kimchi', ['$strap.directives']);

app.factory('KIMCHI', function () {
  return window.KIMCHI;
});

app.factory('THREE', function () {
  return window.THREE;
});

app.run(function ($window, KIMCHI) {
  // initialize KIMCHI, step 2 of 2; see kimchi.init.js
  KIMCHI.ready();

  // bind window resize
  angular.element($window).bind('resize', function () {
    KIMCHI.size.update();
    KIMCHI.renderer.render();
  });
});