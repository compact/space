angular.module('kimchi', ['$strap.directives']);

angular.module('kimchi').factory('KIMCHI', function () {
  return window.KIMCHI;
});

angular.module('kimchi').factory('THREE', function () {
  return window.THREE;
});

angular.module('kimchi').run(function ($window, KIMCHI) {
  // initialize KIMCHI, step 2 of 2; see kimchi.init.js
  KIMCHI.ready();

  // bind window resize
  angular.element($window).bind('resize', function () {
    KIMCHI.size.update();
    KIMCHI.renderer.render();
  });
});
