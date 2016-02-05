angular.module('starter', ['ionic', 'starter.controllers', 'starter.services'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });
})

.config(function($stateProvider, $urlRouterProvider) {

  $stateProvider
    .state('tab', {
    url: '/tab',
    abstract: true,
    controller: 'AbstractCtrl',
    templateUrl: 'templates/tabs.html'
  })
  // Each tab has its own nav history stack:
  .state('tab.home', {
    url: '/home',
    views: {
      'tab-home': {
        templateUrl: 'templates/tab-home.html',
        controller: 'HomeCtrl'
      }
    }
  })
  .state('tab.locations', {
    url: '/locations',
    views: {
      'tab-locations': {
        templateUrl: 'templates/tab-locations.html',
        controller: 'LocationsCtrl'
      }
    }
  })
  .state('tab.hosts', {
    url: '/hosts',
    views: {
      'tab-locations': {
        templateUrl: 'templates/tab-hosts.html',
        controller: 'HostsCtrl'
      }
    }
  })
  .state('tab.host-detail', {
    url: '/hosts/:chatId',
    views: {
      'tab-locations': {
        templateUrl: 'templates/host-detail.html',
        controller: 'HostDetailCtrl'
      }
    }
  });

  $urlRouterProvider.otherwise('/tab/home');

});
