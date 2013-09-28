'use strict';

var kimchi = angular.module('kimchi',[]);

kimchi.factory('ThreeJS', function(){
  return THREE;
})

function TestCtrl($scope, Service){
  $scope.message = "zorplol";
  $scope.servicemessage = Service;
  $scope.alertSomething = function(){
    alert("A MESSAGEEE");
  };
}