var hud = angular.module('hud', ['kimchi', 'three']);

function debugCtrl($scope, $timeout, Kimchi, Three){

  $scope.kimchi = Kimchi;
  $scope.delta = 0;
 
  var unbind = KIMCHI.watcher.watch(function() {
    $scope.delta = $scope.kimchi.renderer.lastDelta;
    $scope.$digest();
  });

  $scope.$on('$destroy', unbind);

  $scope.translateRotation = function(val){
    return val * 180 / Math.PI;
  }

  $scope.settings = {
    visible: Kimchi.config.get('debug')
  }

}