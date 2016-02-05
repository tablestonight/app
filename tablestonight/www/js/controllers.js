angular.module('starter.controllers', [])

.controller('HomeCtrl', function($scope) {
  $scope.$on("$ionicView.enter", function() {
    $scope.$emit('show');
  });
})

.controller('HostsCtrl', function($scope, Chats) {
  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  $scope.chats = Chats.all();
  $scope.remove = function(chat) {
    Chats.remove(chat);
  };
  $scope.$on("$ionicView.enter", function() {
    $scope.$emit('show');
  });
})

.controller('AbstractCtrl', function($scope) {
  $scope.$on('hide', function() {
    $scope.hiding = true;
  });

  $scope.$on('show', function() {
    $scope.hiding = false;
  });
})

.controller('HostDetailCtrl', function($scope, $stateParams, Chats, $rootScope) {
  $scope.chat = Chats.get($stateParams.chatId);
  $scope.$on("$ionicView.enter", function() {
    $scope.$emit('hide');
  });

});
