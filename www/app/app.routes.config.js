(function() {
	angular
		.module('tablesTonight.routes', ['ionic'])
		.run(ionicConfig)
		.config(routeConfig);

	function ionicConfig($ionicPlatform) {
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
	}

	function routeConfig($stateProvider, $urlRouterProvider) {
	  $stateProvider
	    .state('tab', {
	    url: '/tab',
	    abstract: true,
	    controller: 'MenuTabsCtrl',
	    templateUrl: 'app/menu-tabs/tabs.html'
	  })
	  // Each tab has its own nav history stack:
	  .state('home', {
	    url: '/home',
			templateUrl: 'app/home/home.html',
			controller: 'HomeCtrl'
	  })
	  .state('locations', {
	    url: '/locations',
			templateUrl: 'app/locations/locations.html',
			controller: 'LocationsCtrl'
	  })
	  .state('hosts', {
	    url: '/hosts',
			templateUrl: 'app/hosts/hosts.html',
			controller: 'HostsCtrl'
	  })
	  .state('host-detail', {
	    url: '/host/:hostId',
			templateUrl: 'app/host-detail/host-detail.html',
			controller: 'HostDetailCtrl'
	  });
	  $urlRouterProvider.otherwise('/home');
	}
})();
