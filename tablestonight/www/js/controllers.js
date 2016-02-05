angular.module('starter.controllers', [])

.controller('AbstractCtrl', function($scope) {
  $scope.$on('hide', function() {
    $scope.hiding = true;
  });

  $scope.$on('show', function() {
    $scope.hiding = false;
  });
})

.controller('HomeCtrl', function($scope) {
  $scope.$on("$ionicView.enter", function() {
    $scope.$emit('show');
  });
})

.controller('LocationsCtrl', function($scope, Locations) {
  $scope.locations = Locations.all();
})

.controller('HostsCtrl', function($scope, Chats) {
  $scope.chats = Chats.all();
  $scope.remove = function(chat) {
    Chats.remove(chat);
  };
  $scope.$on("$ionicView.enter", function() {
    $scope.$emit('show');
  });
})

.controller('HostDetailCtrl', function($scope, $stateParams, Chats, $rootScope) {
  $scope.chat = Chats.get($stateParams.chatId);
  $scope.$on("$ionicView.enter", function() {
    $scope.$emit('hide');
  });

});
