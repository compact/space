var app = angular.module('kimchi', ['three', '$strap.directives']);

app.factory('Kimchi', function () {
  return window.KIMCHI;
});

app.run(function ($window, Kimchi) {
  // initialize KIMCHI, step 2 of 2; see kimchi.init.js
  Kimchi.ready();

  // bind window resize
  angular.element($window).bind('resize', function () {
    Kimchi.size.update();
    Kimchi.renderer.render();
  });
});