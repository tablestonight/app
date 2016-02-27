(function() {
	angular
		.module('app.data', [])
		.factory('TablesTonightService', TablesTonightService);

	function TablesTonightService() {

		var svc = {};
		var location = null;

		svc.currentLocation = currentLocation;
		svc.saveLocation = saveLocation;
		svc.dayClubList   = dayClubList();
		svc.nightClubList = nightClubList();

		return svc;

		function currentLocation() {
			return location;
		}

		function saveLocation(newLocation) {
			location = newLocation;
		}

		function dayClubList() {
			return [
				'Azure',
				'Bare',
				'Daylight',
				'Delano Beach Club',
				'Drais Beach Club',
				'Encore Beach Club',
				'Foxtail Beach Club',
				'Lavo Brunch',
				'Liquid Pool',
				'Marquee Day Club',
				'Moorea',
				'Palms Pool Day Club',
				'Rehab Beach Club',
				'TAO Beach Club',
				'Wet Republic'
			]
		}

		function nightClubList() {

			return [
				'1OAK',
				'Chateau',
				'Embassy',
				'Foundation Room',
				'Foxtail',
				'Hakkasan',
				'Hyde',
				'Lavo',
				'LAX',
				'Light',
				'Marquee',
				'Omnia',
				'Sayers Club',
				'Surrender',
				'Tao',
				'The Bank',
				'XS'
			];
		}
	}
})();

angular
	.module('tablesTonight', [
		'tablesTonight.routes',
		'tablesTonight.menu-tabs',
		'tablesTonight.home',
		'tablesTonight.locations',
		'tablesTonight.hosts',
		'tablesTonight.host-detail',
		'app.data'
	]);

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
	    url: '/:type/:name',
			templateUrl: 'app/hosts/hosts.html',
			controller: 'HostsCtrl'
	  })
	  .state('host-detail', {
	    url: '/host',
			templateUrl: 'app/host-detail/host-detail.html',
			controller: 'HostDetailCtrl'
	  });
	  $urlRouterProvider.otherwise('/home');
	}
})();

(function() {
	angular
		.module('tablesTonight.home.controller', [])
		.controller('HomeCtrl', HomeCtrl);

	function HomeCtrl($scope, $ionicModal, $state, HostService, TablesTonightService) {

		$scope.credentials       = {};
		$scope.updateInformation = false;
		$scope.login             = login;
		$scope.navigate          = navigate;
		$scope.openModal         = openModal;
		$scope.closeModal        = closeModal;
		init();

		///////////////////////////////////////////////////////////////////////////

		function login() {
			HostService.login($scope.credentials)
				.then(function(host) {
					if (!host.error) {
						$scope.updateInformation = 'step1';
					}
				});
			// closeModal();
		}

		function navigate(location) {
			TablesTonightService.saveLocation(location);
			$state.go('locations');
		}

		function openModal() {
			$scope.modal.show();
	  }

		function closeModal() {
			if (HostService.getHostInfo()) {
				$scope.updateInformation = 'step1';
			}
	    $scope.modal.remove();
			delete $scope.modal;
			init();
	  }

		function init() {
			$ionicModal.fromTemplateUrl('app/home/my-modal.html', {
		    scope: $scope,
		    animation: 'slide-in-up'
		  }).then(function(modal) {
		    $scope.modal = modal;
		  });

			configureListeners();

			function configureListeners() {
				$scope.$on('$destroy', function() {
			    $scope.modal.remove();
			  });
			  // Execute action on hide modal
			  $scope.$on('modal.hidden', function() {
			    // Execute action
			  });
			  // Execute action on remove modal
			  $scope.$on('modal.removed', function() {
			    // Execute action
			  });
			}
		}
	}
})();

angular
	.module('tablesTonight.home', [
		'tablesTonight.home.controller',
		'app.home.host',
		'app.home.update-information'
	]);

(function() {
	angular
		.module('app.home.host', [])
		.factory('HostService', function($http, TablesTonightService) {

			var svc                   = {};

			var hostInfo              = null;
			svc.login                 = login;
			svc.getHostInfo           = getHostInfo;
			svc.updateHostInformation = updateHostInformation
			svc.dayClubList           = TablesTonightService.dayClubList;
			svc.nightClubList         = TablesTonightService.nightClubList;

			return svc;

			function login(credentials) {
				return $http.post('http://localhost:1337/host/login', credentials)
					.then(function(response) {
						if (!response.data.error) {
							hostInfo = response.data;
						}
						return response.data;
					});
			}

			function getHostInfo() {
				return hostInfo;
			}

			function updateHostInformation() {
				return $http.post('http://localhost:1337/host/update', hostInfo)
					.then(function(response) {
						if (!response.data.error) {
							hostInfo = response.data;
						}
						return response.data;
					});
			}
		});
})();

(function() {
	angular
		.module('tablesTonight.host-detail.controller', [])
		.controller('HostDetailCtrl', HostDetailCtrl);

	function HostDetailCtrl($scope, HostsService, $stateParams) {
	  $scope.$on("$ionicView.beforeEnter", function() {
	    $scope.host = HostsService.getHost();
	  });
	}
})();

angular
	.module('tablesTonight.host-detail', [
		'tablesTonight.host-detail.controller'
	]);

(function() {
	angular
		.module('tablesTonight.hosts.controller', [])
		.controller('HostsCtrl', HostsCtrl);

	function HostsCtrl($scope, $stateParams, HostsService) {
	  $scope.$on("$ionicView.beforeEnter", function(HostDetailCtrl) {
			var name = $stateParams.name;
			var type = $stateParams.type;
			getHosts(name)
				.then(function(hosts) {
					$scope.hosts = hosts;
				});
	  });

		$scope.saveHost = saveHost;

		function saveHost(index) {
			HostsService.saveHost($scope.hosts[index]);
		}

		function getHosts(club) {
			if ($stateParams.type === 'day') {
				return HostsService.getDayClubHosts(club);
			}
			return HostsService.getNightClubHosts(club);
		}
	}
})();

(function() {
	angular
		.module('tablesTonight.hosts.data', [])
		.factory('HostsService', HostsService);

	function HostsService($http) {
		var svc = {};
		svc.getNightClubHosts = getNightClubHosts;
		svc.getDayClubHosts   = getDayClubHosts;
		svc.saveHost          = saveHost;
		svc.getHost           = getHost;
		return svc;

		function getNightClubHosts(nightclub) {
			return $http.get('http://localhost:1337/nightclub/'+nightclub)
				.then(function(response) {
					return response.data;
				});
		}

		function getDayClubHosts(dayclub) {
			return $http.get('http://localhost:1337/dayclub/'+dayclub)
				.then(function(response) {
					return response.data;
				});
		}

		function saveHost(host) {
			currentHost = host;
		}

		function getHost() {
			return currentHost;
		}
	}
})();

angular
	.module('tablesTonight.hosts', [
		'tablesTonight.hosts.controller',
		'tablesTonight.hosts.data'
	]);

(function() {
	angular
		.module('tablesTonight.locations.controller', [])
		.controller('LocationsCtrl', LocationsCtrl);

	function LocationsCtrl($scope, TablesTonightService) {
		$scope.$on("$ionicView.beforeEnter", function() {
			if ($scope.type !== TablesTonightService.currentLocation()) {
				$scope.type = TablesTonightService.currentLocation();
				$scope.locations = TablesTonightService.nightClubList;
				$scope.title = 'Night Clubs';
				if ($scope.type === 'day') {
					$scope.locations = TablesTonightService.dayClubList;
					$scope.title = 'Day Clubs';
				}
			}
		});
	}
})();

angular
	.module('tablesTonight.locations', [
		'tablesTonight.locations.controller',
	]);

(function() {
	angular
		.module('tablesTonight.menu-tabs.controller', [])
		.controller('MenuTabsCtrl', MenuTabsCtrl);

	function MenuTabsCtrl($scope) {
	  $scope.$on('hide', function() {
	    $scope.hiding = true;
	  });

	  $scope.$on('show', function() {
	    $scope.hiding = false;
	  });
	}
})();

angular
	.module('tablesTonight.menu-tabs', [
		'tablesTonight.menu-tabs.controller'
	]);

(function() {
	angular
		.module('app.home.update-information.steps', [])
		.directive('updateInformationSteps', function(HostService) {
			var directive = {
					scope: {
						step: '=',
						close: '='
					},
					restrict: 'AE',
					link: link,
					templateUrl: './app/home/update-information/update-information.html'
			};

			return directive;

			///////////////////////////////////////////////////////////////////////////

			function link(scope, element, attrs) {
				scope.step = 'step1';
				scope.next = next;
				scope.finish = finish;

				function next() {
					scope.step = 'step2';
				}

				function finish() {
					HostService.updateHostInformation()
						.then(function(host) {
							if (!host.error) {
								scope.close();
							}
						});
				}
			}

		});
})();

angular
	.module('app.home.update-information', [
		'app.home.update-information.steps',
		'app.home.update-information.step1',
		'app.home.update-information.step2'
	]);

(function() {
	angular
		.module('app.home.update-information.step1', [])
		.directive('updateInformationStepOne', function(HostService) {
			var directive = {
					scope: {
						step: '=',
						next: '='
					},
					restrict: 'AE',
					link: link,
					templateUrl: './app/home/update-information/step1/step1.html'
			};

			return directive;

			///////////////////////////////////////////////////////////////////////////

			function link(scope, element, attrs) {
				scope.host = HostService.getHostInfo();
				scope.nightClubList = HostService.nightClubList;
				// scope.takePicture = function() {
				// 	var options = {
        //     quality: 100,
        //     destinationType: Camera.DestinationType.FILE_URI,
        //     sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
        //     allowEdit: true,
        //     encodingType: Camera.EncodingType.JPEG,
        //     popoverOptions: CameraPopoverOptions,
        //     saveToPhotoAlbum: false
	      //   };
				//
	      //   $cordovaCamera.getPicture(options).then(function(imageData) {
				// 		debugger;
				// 	});
				// };
			}

		});
})();

(function() {
	angular
		.module('app.home.update-information.step2', [])
		.directive('updateInformationStepTwo', function(HostService) {
			var directive = {
					scope: {
						step: '=',
						finish: '='
					},
					restrict: 'AE',
					link: link,
					templateUrl: './app/home/update-information/step2/step2.html'
			};

			return directive;

			///////////////////////////////////////////////////////////////////////////

			function link(scope, element, attrs) {
				scope.host = HostService.getHostInfo();
				scope.dayClubList = HostService.dayClubList;
			}

		});
})();

(function() {
	angular
		.module('app.data', [])
		.factory('TablesTonightService', TablesTonightService);

	function TablesTonightService() {

		var svc = {};
		var location = null;

		svc.currentLocation = currentLocation;
		svc.saveLocation = saveLocation;
		svc.dayClubList   = dayClubList();
		svc.nightClubList = nightClubList();

		return svc;

		function currentLocation() {
			return location;
		}

		function saveLocation(newLocation) {
			location = newLocation;
		}

		function dayClubList() {
			return [
				'Azure',
				'Bare',
				'Daylight',
				'Delano Beach Club',
				'Drais Beach Club',
				'Encore Beach Club',
				'Foxtail Beach Club',
				'Lavo Brunch',
				'Liquid Pool',
				'Marquee Day Club',
				'Moorea',
				'Palms Pool Day Club',
				'Rehab Beach Club',
				'TAO Beach Club',
				'Wet Republic'
			]
		}

		function nightClubList() {

			return [
				'1OAK',
				'Chateau',
				'Embassy',
				'Foundation Room',
				'Foxtail',
				'Hakkasan',
				'Hyde',
				'Lavo',
				'LAX',
				'Light',
				'Marquee',
				'Omnia',
				'Sayers Club',
				'Surrender',
				'Tao',
				'The Bank',
				'XS'
			];
		}
	}
})();

angular
	.module('tablesTonight', [
		'tablesTonight.routes',
		'tablesTonight.menu-tabs',
		'tablesTonight.home',
		'tablesTonight.locations',
		'tablesTonight.hosts',
		'tablesTonight.host-detail',
		'app.data'
	]);

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
	    url: '/:type/:name',
			templateUrl: 'app/hosts/hosts.html',
			controller: 'HostsCtrl'
	  })
	  .state('host-detail', {
	    url: '/host',
			templateUrl: 'app/host-detail/host-detail.html',
			controller: 'HostDetailCtrl'
	  });
	  $urlRouterProvider.otherwise('/home');
	}
})();

(function() {
	angular
		.module('tablesTonight.home.controller', [])
		.controller('HomeCtrl', HomeCtrl);

	function HomeCtrl($scope, $ionicModal, $state, HostService, TablesTonightService) {

		$scope.credentials       = {};
		$scope.updateInformation = false;
		$scope.login             = login;
		$scope.navigate          = navigate;
		$scope.openModal         = openModal;
		$scope.closeModal        = closeModal;
		init();

		///////////////////////////////////////////////////////////////////////////

		function login() {
			HostService.login($scope.credentials)
				.then(function(host) {
					if (!host.error) {
						$scope.updateInformation = 'step1';
					}
				});
			// closeModal();
		}

		function navigate(location) {
			TablesTonightService.saveLocation(location);
			$state.go('locations');
		}

		function openModal() {
			$scope.modal.show();
	  }

		function closeModal() {
			if (HostService.getHostInfo()) {
				$scope.updateInformation = 'step1';
			}
	    $scope.modal.remove();
			delete $scope.modal;
			init();
	  }

		function init() {
			$ionicModal.fromTemplateUrl('app/home/my-modal.html', {
		    scope: $scope,
		    animation: 'slide-in-up'
		  }).then(function(modal) {
		    $scope.modal = modal;
		  });

			configureListeners();

			function configureListeners() {
				$scope.$on('$destroy', function() {
			    $scope.modal.remove();
			  });
			  // Execute action on hide modal
			  $scope.$on('modal.hidden', function() {
			    // Execute action
			  });
			  // Execute action on remove modal
			  $scope.$on('modal.removed', function() {
			    // Execute action
			  });
			}
		}
	}
})();

angular
	.module('tablesTonight.home', [
		'tablesTonight.home.controller',
		'app.home.host',
		'app.home.update-information'
	]);

(function() {
	angular
		.module('app.home.host', [])
		.factory('HostService', function($http, TablesTonightService) {

			var svc                   = {};

			var hostInfo              = null;
			svc.login                 = login;
			svc.getHostInfo           = getHostInfo;
			svc.updateHostInformation = updateHostInformation
			svc.dayClubList           = TablesTonightService.dayClubList;
			svc.nightClubList         = TablesTonightService.nightClubList;

			return svc;

			function login(credentials) {
				return $http.post('http://localhost:1337/host/login', credentials)
					.then(function(response) {
						if (!response.data.error) {
							hostInfo = response.data;
						}
						return response.data;
					});
			}

			function getHostInfo() {
				return hostInfo;
			}

			function updateHostInformation() {
				return $http.post('http://localhost:1337/host/update', hostInfo)
					.then(function(response) {
						if (!response.data.error) {
							hostInfo = response.data;
						}
						return response.data;
					});
			}
		});
})();

(function() {
	angular
		.module('tablesTonight.host-detail.controller', [])
		.controller('HostDetailCtrl', HostDetailCtrl);

	function HostDetailCtrl($scope, HostsService, $stateParams) {
	  $scope.$on("$ionicView.beforeEnter", function() {
	    $scope.host = HostsService.getHost();
	  });
	}
})();

angular
	.module('tablesTonight.host-detail', [
		'tablesTonight.host-detail.controller'
	]);

(function() {
	angular
		.module('tablesTonight.hosts.controller', [])
		.controller('HostsCtrl', HostsCtrl);

	function HostsCtrl($scope, $stateParams, HostsService) {
	  $scope.$on("$ionicView.beforeEnter", function(HostDetailCtrl) {
			var name = $stateParams.name;
			var type = $stateParams.type;
			getHosts(name)
				.then(function(hosts) {
					$scope.hosts = hosts;
				});
	  });

		$scope.saveHost = saveHost;

		function saveHost(index) {
			HostsService.saveHost($scope.hosts[index]);
		}

		function getHosts(club) {
			if ($stateParams.type === 'day') {
				return HostsService.getDayClubHosts(club);
			}
			return HostsService.getNightClubHosts(club);
		}
	}
})();

(function() {
	angular
		.module('tablesTonight.hosts.data', [])
		.factory('HostsService', HostsService);

	function HostsService($http) {
		var svc = {};
		svc.getNightClubHosts = getNightClubHosts;
		svc.getDayClubHosts   = getDayClubHosts;
		svc.saveHost          = saveHost;
		svc.getHost           = getHost;
		return svc;

		function getNightClubHosts(nightclub) {
			return $http.get('http://localhost:1337/nightclub/'+nightclub)
				.then(function(response) {
					return response.data;
				});
		}

		function getDayClubHosts(dayclub) {
			return $http.get('http://localhost:1337/dayclub/'+dayclub)
				.then(function(response) {
					return response.data;
				});
		}

		function saveHost(host) {
			currentHost = host;
		}

		function getHost() {
			return currentHost;
		}
	}
})();

angular
	.module('tablesTonight.hosts', [
		'tablesTonight.hosts.controller',
		'tablesTonight.hosts.data'
	]);

(function() {
	angular
		.module('tablesTonight.locations.controller', [])
		.controller('LocationsCtrl', LocationsCtrl);

	function LocationsCtrl($scope, TablesTonightService) {
		$scope.$on("$ionicView.beforeEnter", function() {
			if ($scope.type !== TablesTonightService.currentLocation()) {
				$scope.type = TablesTonightService.currentLocation();
				$scope.locations = TablesTonightService.nightClubList;
				$scope.title = 'Night Clubs';
				if ($scope.type === 'day') {
					$scope.locations = TablesTonightService.dayClubList;
					$scope.title = 'Day Clubs';
				}
			}
		});
	}
})();

angular
	.module('tablesTonight.locations', [
		'tablesTonight.locations.controller',
	]);

(function() {
	angular
		.module('tablesTonight.menu-tabs.controller', [])
		.controller('MenuTabsCtrl', MenuTabsCtrl);

	function MenuTabsCtrl($scope) {
	  $scope.$on('hide', function() {
	    $scope.hiding = true;
	  });

	  $scope.$on('show', function() {
	    $scope.hiding = false;
	  });
	}
})();

angular
	.module('tablesTonight.menu-tabs', [
		'tablesTonight.menu-tabs.controller'
	]);

(function() {
	angular
		.module('app.home.update-information.steps', [])
		.directive('updateInformationSteps', function(HostService) {
			var directive = {
					scope: {
						step: '=',
						close: '='
					},
					restrict: 'AE',
					link: link,
					templateUrl: './app/home/update-information/update-information.html'
			};

			return directive;

			///////////////////////////////////////////////////////////////////////////

			function link(scope, element, attrs) {
				scope.step = 'step1';
				scope.next = next;
				scope.finish = finish;

				function next() {
					scope.step = 'step2';
				}

				function finish() {
					HostService.updateHostInformation()
						.then(function(host) {
							if (!host.error) {
								scope.close();
							}
						});
				}
			}

		});
})();

angular
	.module('app.home.update-information', [
		'app.home.update-information.steps',
		'app.home.update-information.step1',
		'app.home.update-information.step2'
	]);

(function() {
	angular
		.module('app.home.update-information.step1', [])
		.directive('updateInformationStepOne', function(HostService) {
			var directive = {
					scope: {
						step: '=',
						next: '='
					},
					restrict: 'AE',
					link: link,
					templateUrl: './app/home/update-information/step1/step1.html'
			};

			return directive;

			///////////////////////////////////////////////////////////////////////////

			function link(scope, element, attrs) {
				scope.host = HostService.getHostInfo();
				scope.nightClubList = HostService.nightClubList;
				scope.takePicture = function() {
					var options = {
            quality: 100,
            destinationType: Camera.DestinationType.FILE_URI,
            sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
            allowEdit: true,
            encodingType: Camera.EncodingType.JPEG,
            popoverOptions: CameraPopoverOptions,
            saveToPhotoAlbum: false
	        };

	        $cordovaCamera.getPicture(options).then(function(imageData) {
						debugger;
					});
				};
			}

		});
})();

(function() {
	angular
		.module('app.home.update-information.step2', [])
		.directive('updateInformationStepTwo', function(HostService) {
			var directive = {
					scope: {
						step: '=',
						finish: '='
					},
					restrict: 'AE',
					link: link,
					templateUrl: './app/home/update-information/step2/step2.html'
			};

			return directive;

			///////////////////////////////////////////////////////////////////////////

			function link(scope, element, attrs) {
				scope.host = HostService.getHostInfo();
				scope.dayClubList = HostService.dayClubList;
			}

		});
})();

(function() {
	angular
		.module('app.data', [])
		.factory('TablesTonightService', TablesTonightService);

	function TablesTonightService() {

		var svc = {};
		var location = null;

		svc.currentLocation = currentLocation;
		svc.saveLocation = saveLocation;
		svc.dayClubList   = dayClubList();
		svc.nightClubList = nightClubList();

		return svc;

		function currentLocation() {
			return location;
		}

		function saveLocation(newLocation) {
			location = newLocation;
		}

		function dayClubList() {
			return [
				'Azure',
				'Bare',
				'Daylight',
				'Delano Beach Club',
				'Drais Beach Club',
				'Encore Beach Club',
				'Foxtail Beach Club',
				'Lavo Brunch',
				'Liquid Pool',
				'Marquee Day Club',
				'Moorea',
				'Palms Pool Day Club',
				'Rehab Beach Club',
				'TAO Beach Club',
				'Wet Republic'
			]
		}

		function nightClubList() {

			return [
				'1OAK',
				'Chateau',
				'Embassy',
				'Foundation Room',
				'Foxtail',
				'Hakkasan',
				'Hyde',
				'Lavo',
				'LAX',
				'Light',
				'Marquee',
				'Omnia',
				'Sayers Club',
				'Surrender',
				'Tao',
				'The Bank',
				'XS'
			];
		}
	}
})();

angular
	.module('tablesTonight', [
		'tablesTonight.routes',
		'tablesTonight.menu-tabs',
		'tablesTonight.home',
		'tablesTonight.locations',
		'tablesTonight.hosts',
		'tablesTonight.host-detail',
		'app.data'
	]);

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
	    url: '/:type/:name',
			templateUrl: 'app/hosts/hosts.html',
			controller: 'HostsCtrl'
	  })
	  .state('host-detail', {
	    url: '/host',
			templateUrl: 'app/host-detail/host-detail.html',
			controller: 'HostDetailCtrl'
	  });
	  $urlRouterProvider.otherwise('/home');
	}
})();

(function() {
	angular
		.module('tablesTonight.home.controller', [])
		.controller('HomeCtrl', HomeCtrl);

	function HomeCtrl($scope, $ionicModal, $state, HostService, TablesTonightService) {

		$scope.credentials       = {};
		$scope.updateInformation = false;
		$scope.login             = login;
		$scope.navigate          = navigate;
		$scope.openModal         = openModal;
		$scope.closeModal        = closeModal;
		init();

		///////////////////////////////////////////////////////////////////////////

		function login() {
			HostService.login($scope.credentials)
				.then(function(host) {
					if (!host.error) {
						$scope.updateInformation = 'step1';
					}
				});
			// closeModal();
		}

		function navigate(location) {
			TablesTonightService.saveLocation(location);
			$state.go('locations');
		}

		function openModal() {
			$scope.modal.show();
	  }

		function closeModal() {
			if (HostService.getHostInfo()) {
				$scope.updateInformation = 'step1';
			}
	    $scope.modal.remove();
			delete $scope.modal;
			init();
	  }

		function init() {
			$ionicModal.fromTemplateUrl('app/home/my-modal.html', {
		    scope: $scope,
		    animation: 'slide-in-up'
		  }).then(function(modal) {
		    $scope.modal = modal;
		  });

			configureListeners();

			function configureListeners() {
				$scope.$on('$destroy', function() {
			    $scope.modal.remove();
			  });
			  // Execute action on hide modal
			  $scope.$on('modal.hidden', function() {
			    // Execute action
			  });
			  // Execute action on remove modal
			  $scope.$on('modal.removed', function() {
			    // Execute action
			  });
			}
		}
	}
})();

angular
	.module('tablesTonight.home', [
		'tablesTonight.home.controller',
		'app.home.host',
		'app.home.update-information'
	]);

(function() {
	angular
		.module('app.home.host', [])
		.factory('HostService', function($http, TablesTonightService) {

			var svc                   = {};

			var hostInfo              = null;
			svc.login                 = login;
			svc.getHostInfo           = getHostInfo;
			svc.updateHostInformation = updateHostInformation
			svc.dayClubList           = TablesTonightService.dayClubList;
			svc.nightClubList         = TablesTonightService.nightClubList;

			return svc;

			function login(credentials) {
				return $http.post('http://localhost:1337/host/login', credentials)
					.then(function(response) {
						if (!response.data.error) {
							hostInfo = response.data;
						}
						return response.data;
					});
			}

			function getHostInfo() {
				return hostInfo;
			}

			function updateHostInformation() {
				return $http.post('http://localhost:1337/host/update', hostInfo)
					.then(function(response) {
						if (!response.data.error) {
							hostInfo = response.data;
						}
						return response.data;
					});
			}
		});
})();

(function() {
	angular
		.module('tablesTonight.host-detail.controller', [])
		.controller('HostDetailCtrl', HostDetailCtrl);

	function HostDetailCtrl($scope, HostsService, $stateParams) {
	  $scope.$on("$ionicView.beforeEnter", function() {
	    $scope.host = HostsService.getHost();
	  });
	}
})();

angular
	.module('tablesTonight.host-detail', [
		'tablesTonight.host-detail.controller'
	]);

(function() {
	angular
		.module('tablesTonight.hosts.controller', [])
		.controller('HostsCtrl', HostsCtrl);

	function HostsCtrl($scope, $stateParams, HostsService) {
	  $scope.$on("$ionicView.beforeEnter", function(HostDetailCtrl) {
			var name = $stateParams.name;
			var type = $stateParams.type;
			getHosts(name)
				.then(function(hosts) {
					$scope.hosts = hosts;
				});
	  });

		$scope.saveHost = saveHost;

		function saveHost(index) {
			HostsService.saveHost($scope.hosts[index]);
		}

		function getHosts(club) {
			if ($stateParams.type === 'day') {
				return HostsService.getDayClubHosts(club);
			}
			return HostsService.getNightClubHosts(club);
		}
	}
})();

(function() {
	angular
		.module('tablesTonight.hosts.data', [])
		.factory('HostsService', HostsService);

	function HostsService($http) {
		var svc = {};
		svc.getNightClubHosts = getNightClubHosts;
		svc.getDayClubHosts   = getDayClubHosts;
		svc.saveHost          = saveHost;
		svc.getHost           = getHost;
		return svc;

		function getNightClubHosts(nightclub) {
			return $http.get('http://localhost:1337/nightclub/'+nightclub)
				.then(function(response) {
					return response.data;
				});
		}

		function getDayClubHosts(dayclub) {
			return $http.get('http://localhost:1337/dayclub/'+dayclub)
				.then(function(response) {
					return response.data;
				});
		}

		function saveHost(host) {
			currentHost = host;
		}

		function getHost() {
			return currentHost;
		}
	}
})();

angular
	.module('tablesTonight.hosts', [
		'tablesTonight.hosts.controller',
		'tablesTonight.hosts.data'
	]);

(function() {
	angular
		.module('tablesTonight.locations.controller', [])
		.controller('LocationsCtrl', LocationsCtrl);

	function LocationsCtrl($scope, TablesTonightService) {
		$scope.$on("$ionicView.beforeEnter", function() {
			if ($scope.type !== TablesTonightService.currentLocation()) {
				$scope.type = TablesTonightService.currentLocation();
				$scope.locations = TablesTonightService.nightClubList;
				$scope.title = 'Night Clubs';
				if ($scope.type === 'day') {
					$scope.locations = TablesTonightService.dayClubList;
					$scope.title = 'Day Clubs';
				}
			}
		});
	}
})();

angular
	.module('tablesTonight.locations', [
		'tablesTonight.locations.controller',
	]);

(function() {
	angular
		.module('tablesTonight.menu-tabs.controller', [])
		.controller('MenuTabsCtrl', MenuTabsCtrl);

	function MenuTabsCtrl($scope) {
	  $scope.$on('hide', function() {
	    $scope.hiding = true;
	  });

	  $scope.$on('show', function() {
	    $scope.hiding = false;
	  });
	}
})();

angular
	.module('tablesTonight.menu-tabs', [
		'tablesTonight.menu-tabs.controller'
	]);

(function() {
	angular
		.module('app.home.update-information.steps', [])
		.directive('updateInformationSteps', function(HostService) {
			var directive = {
					scope: {
						step: '=',
						close: '='
					},
					restrict: 'AE',
					link: link,
					templateUrl: './app/home/update-information/update-information.html'
			};

			return directive;

			///////////////////////////////////////////////////////////////////////////

			function link(scope, element, attrs) {
				scope.step = 'step1';
				scope.next = next;
				scope.finish = finish;

				function next() {
					scope.step = 'step2';
				}

				function finish() {
					HostService.updateHostInformation()
						.then(function(host) {
							if (!host.error) {
								scope.close();
							}
						});
				}
			}

		});
})();

angular
	.module('app.home.update-information', [
		'app.home.update-information.steps',
		'app.home.update-information.step1',
		'app.home.update-information.step2'
	]);

(function() {
	angular
		.module('app.home.update-information.step1', [])
		.directive('updateInformationStepOne', function(HostService) {
			var directive = {
					scope: {
						step: '=',
						next: '='
					},
					restrict: 'AE',
					link: link,
					templateUrl: './app/home/update-information/step1/step1.html'
			};

			return directive;

			///////////////////////////////////////////////////////////////////////////

			function link(scope, element, attrs) {
				scope.host = HostService.getHostInfo();
				scope.nightClubList = HostService.nightClubList;
				scope.getPicture = function() {
					var options = {
            quality: 100,
            destinationType: Camera.DestinationType.FILE_URI,
            sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
            allowEdit: true,
            encodingType: Camera.EncodingType.JPEG,
            popoverOptions: CameraPopoverOptions,
            saveToPhotoAlbum: false
	        };

	        $cordovaCamera.getPicture(options).then(function(imageData) {
						debugger;
					});
				};
			}

		});
})();

(function() {
	angular
		.module('app.home.update-information.step2', [])
		.directive('updateInformationStepTwo', function(HostService) {
			var directive = {
					scope: {
						step: '=',
						finish: '='
					},
					restrict: 'AE',
					link: link,
					templateUrl: './app/home/update-information/step2/step2.html'
			};

			return directive;

			///////////////////////////////////////////////////////////////////////////

			function link(scope, element, attrs) {
				scope.host = HostService.getHostInfo();
				scope.dayClubList = HostService.dayClubList;
			}

		});
})();

(function() {
	angular
		.module('app.data', [])
		.factory('TablesTonightService', TablesTonightService);

	function TablesTonightService() {

		var svc = {};
		var location = null;

		svc.currentLocation = currentLocation;
		svc.saveLocation = saveLocation;
		svc.dayClubList   = dayClubList();
		svc.nightClubList = nightClubList();

		return svc;

		function currentLocation() {
			return location;
		}

		function saveLocation(newLocation) {
			location = newLocation;
		}

		function dayClubList() {
			return [
				'Azure',
				'Bare',
				'Daylight',
				'Delano Beach Club',
				'Drais Beach Club',
				'Encore Beach Club',
				'Foxtail Beach Club',
				'Lavo Brunch',
				'Liquid Pool',
				'Marquee Day Club',
				'Moorea',
				'Palms Pool Day Club',
				'Rehab Beach Club',
				'TAO Beach Club',
				'Wet Republic'
			]
		}

		function nightClubList() {

			return [
				'1OAK',
				'Chateau',
				'Embassy',
				'Foundation Room',
				'Foxtail',
				'Hakkasan',
				'Hyde',
				'Lavo',
				'LAX',
				'Light',
				'Marquee',
				'Omnia',
				'Sayers Club',
				'Surrender',
				'Tao',
				'The Bank',
				'XS'
			];
		}
	}
})();

angular
	.module('tablesTonight', [
		'tablesTonight.routes',
		'tablesTonight.menu-tabs',
		'tablesTonight.home',
		'tablesTonight.locations',
		'tablesTonight.hosts',
		'tablesTonight.host-detail',
		'app.data'
	]);

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
	    url: '/:type/:name',
			templateUrl: 'app/hosts/hosts.html',
			controller: 'HostsCtrl'
	  })
	  .state('host-detail', {
	    url: '/host',
			templateUrl: 'app/host-detail/host-detail.html',
			controller: 'HostDetailCtrl'
	  });
	  $urlRouterProvider.otherwise('/home');
	}
})();

(function() {
	angular
		.module('tablesTonight.home.controller', [])
		.controller('HomeCtrl', HomeCtrl);

	function HomeCtrl($scope, $ionicModal, $state, HostService, TablesTonightService) {

		$scope.credentials       = {};
		$scope.updateInformation = false;
		$scope.login             = login;
		$scope.navigate          = navigate;
		$scope.openModal         = openModal;
		$scope.closeModal        = closeModal;
		init();

		///////////////////////////////////////////////////////////////////////////

		function login() {
			HostService.login($scope.credentials)
				.then(function(host) {
					if (!host.error) {
						$scope.updateInformation = 'step1';
					}
				});
			// closeModal();
		}

		function navigate(location) {
			TablesTonightService.saveLocation(location);
			$state.go('locations');
		}

		function openModal() {
			$scope.modal.show();
	  }

		function closeModal() {
			if (HostService.getHostInfo()) {
				$scope.updateInformation = 'step1';
			}
	    $scope.modal.remove();
			delete $scope.modal;
			init();
	  }

		function init() {
			$ionicModal.fromTemplateUrl('app/home/my-modal.html', {
		    scope: $scope,
		    animation: 'slide-in-up'
		  }).then(function(modal) {
		    $scope.modal = modal;
		  });

			configureListeners();

			function configureListeners() {
				$scope.$on('$destroy', function() {
			    $scope.modal.remove();
			  });
			  // Execute action on hide modal
			  $scope.$on('modal.hidden', function() {
			    // Execute action
			  });
			  // Execute action on remove modal
			  $scope.$on('modal.removed', function() {
			    // Execute action
			  });
			}
		}
	}
})();

angular
	.module('tablesTonight.home', [
		'tablesTonight.home.controller',
		'app.home.host',
		'app.home.update-information'
	]);

(function() {
	angular
		.module('app.home.host', [])
		.factory('HostService', function($http, TablesTonightService) {

			var svc                   = {};

			var hostInfo              = null;
			svc.login                 = login;
			svc.getHostInfo           = getHostInfo;
			svc.updateHostInformation = updateHostInformation
			svc.dayClubList           = TablesTonightService.dayClubList;
			svc.nightClubList         = TablesTonightService.nightClubList;

			return svc;

			function login(credentials) {
				return $http.post('http://localhost:1337/host/login', credentials)
					.then(function(response) {
						if (!response.data.error) {
							hostInfo = response.data;
						}
						return response.data;
					});
			}

			function getHostInfo() {
				return hostInfo;
			}

			function updateHostInformation() {
				return $http.post('http://localhost:1337/host/update', hostInfo)
					.then(function(response) {
						if (!response.data.error) {
							hostInfo = response.data;
						}
						return response.data;
					});
			}
		});
})();

(function() {
	angular
		.module('tablesTonight.host-detail.controller', [])
		.controller('HostDetailCtrl', HostDetailCtrl);

	function HostDetailCtrl($scope, HostsService, $stateParams) {
	  $scope.$on("$ionicView.beforeEnter", function() {
	    $scope.host = HostsService.getHost();
	  });
	}
})();

angular
	.module('tablesTonight.host-detail', [
		'tablesTonight.host-detail.controller'
	]);

(function() {
	angular
		.module('tablesTonight.hosts.controller', [])
		.controller('HostsCtrl', HostsCtrl);

	function HostsCtrl($scope, $stateParams, HostsService) {
	  $scope.$on("$ionicView.beforeEnter", function(HostDetailCtrl) {
			var name = $stateParams.name;
			var type = $stateParams.type;
			getHosts(name)
				.then(function(hosts) {
					$scope.hosts = hosts;
				});
	  });

		$scope.saveHost = saveHost;

		function saveHost(index) {
			HostsService.saveHost($scope.hosts[index]);
		}

		function getHosts(club) {
			if ($stateParams.type === 'day') {
				return HostsService.getDayClubHosts(club);
			}
			return HostsService.getNightClubHosts(club);
		}
	}
})();

(function() {
	angular
		.module('tablesTonight.hosts.data', [])
		.factory('HostsService', HostsService);

	function HostsService($http) {
		var svc = {};
		svc.getNightClubHosts = getNightClubHosts;
		svc.getDayClubHosts   = getDayClubHosts;
		svc.saveHost          = saveHost;
		svc.getHost           = getHost;
		return svc;

		function getNightClubHosts(nightclub) {
			return $http.get('http://localhost:1337/nightclub/'+nightclub)
				.then(function(response) {
					return response.data;
				});
		}

		function getDayClubHosts(dayclub) {
			return $http.get('http://localhost:1337/dayclub/'+dayclub)
				.then(function(response) {
					return response.data;
				});
		}

		function saveHost(host) {
			currentHost = host;
		}

		function getHost() {
			return currentHost;
		}
	}
})();

angular
	.module('tablesTonight.hosts', [
		'tablesTonight.hosts.controller',
		'tablesTonight.hosts.data'
	]);

(function() {
	angular
		.module('tablesTonight.locations.controller', [])
		.controller('LocationsCtrl', LocationsCtrl);

	function LocationsCtrl($scope, TablesTonightService) {
		$scope.$on("$ionicView.beforeEnter", function() {
			if ($scope.type !== TablesTonightService.currentLocation()) {
				$scope.type = TablesTonightService.currentLocation();
				$scope.locations = TablesTonightService.nightClubList;
				$scope.title = 'Night Clubs';
				if ($scope.type === 'day') {
					$scope.locations = TablesTonightService.dayClubList;
					$scope.title = 'Day Clubs';
				}
			}
		});
	}
})();

angular
	.module('tablesTonight.locations', [
		'tablesTonight.locations.controller',
	]);

(function() {
	angular
		.module('tablesTonight.menu-tabs.controller', [])
		.controller('MenuTabsCtrl', MenuTabsCtrl);

	function MenuTabsCtrl($scope) {
	  $scope.$on('hide', function() {
	    $scope.hiding = true;
	  });

	  $scope.$on('show', function() {
	    $scope.hiding = false;
	  });
	}
})();

angular
	.module('tablesTonight.menu-tabs', [
		'tablesTonight.menu-tabs.controller'
	]);

(function() {
	angular
		.module('app.home.update-information.steps', [])
		.directive('updateInformationSteps', function(HostService) {
			var directive = {
					scope: {
						step: '=',
						close: '='
					},
					restrict: 'AE',
					link: link,
					templateUrl: './app/home/update-information/update-information.html'
			};

			return directive;

			///////////////////////////////////////////////////////////////////////////

			function link(scope, element, attrs) {
				scope.step = 'step1';
				scope.next = next;
				scope.finish = finish;

				function next() {
					scope.step = 'step2';
				}

				function finish() {
					HostService.updateHostInformation()
						.then(function(host) {
							if (!host.error) {
								scope.close();
							}
						});
				}
			}

		});
})();

angular
	.module('app.home.update-information', [
		'app.home.update-information.steps',
		'app.home.update-information.step1',
		'app.home.update-information.step2'
	]);

(function() {
	angular
		.module('app.home.update-information.step1', [])
		.directive('updateInformationStepOne', function(HostService) {
			var directive = {
					scope: {
						step: '=',
						next: '='
					},
					restrict: 'AE',
					link: link,
					templateUrl: './app/home/update-information/step1/step1.html'
			};

			return directive;

			///////////////////////////////////////////////////////////////////////////

			function link(scope, element, attrs) {
				scope.host = HostService.getHostInfo();
				scope.nightClubList = HostService.nightClubList;
				scope.getPicture = function() {
					navigator.camera.getPicture(function(imageURI) {

				    // imageURI is the URL of the image that we can use for
				    // an <img> element or backgroundImage.

				  }, function(err) {

				    // Ruh-roh, something bad happened

				  }, cameraOptions);
				};
			}

		});
})();

(function() {
	angular
		.module('app.home.update-information.step2', [])
		.directive('updateInformationStepTwo', function(HostService) {
			var directive = {
					scope: {
						step: '=',
						finish: '='
					},
					restrict: 'AE',
					link: link,
					templateUrl: './app/home/update-information/step2/step2.html'
			};

			return directive;

			///////////////////////////////////////////////////////////////////////////

			function link(scope, element, attrs) {
				scope.host = HostService.getHostInfo();
				scope.dayClubList = HostService.dayClubList;
			}

		});
})();

(function() {
	angular
		.module('app.data', [])
		.factory('TablesTonightService', TablesTonightService);

	function TablesTonightService() {

		var svc = {};
		var location = null;

		svc.currentLocation = currentLocation;
		svc.saveLocation = saveLocation;
		svc.dayClubList   = dayClubList();
		svc.nightClubList = nightClubList();

		return svc;

		function currentLocation() {
			return location;
		}

		function saveLocation(newLocation) {
			location = newLocation;
		}

		function dayClubList() {
			return [
				'Azure',
				'Bare',
				'Daylight',
				'Delano Beach Club',
				'Drais Beach Club',
				'Encore Beach Club',
				'Foxtail Beach Club',
				'Lavo Brunch',
				'Liquid Pool',
				'Marquee Day Club',
				'Moorea',
				'Palms Pool Day Club',
				'Rehab Beach Club',
				'TAO Beach Club',
				'Wet Republic'
			]
		}

		function nightClubList() {

			return [
				'1OAK',
				'Chateau',
				'Embassy',
				'Foundation Room',
				'Foxtail',
				'Hakkasan',
				'Hyde',
				'Lavo',
				'LAX',
				'Light',
				'Marquee',
				'Omnia',
				'Sayers Club',
				'Surrender',
				'Tao',
				'The Bank',
				'XS'
			];
		}
	}
})();

angular
	.module('tablesTonight', [
		'tablesTonight.routes',
		'tablesTonight.menu-tabs',
		'tablesTonight.home',
		'tablesTonight.locations',
		'tablesTonight.hosts',
		'tablesTonight.host-detail',
		'app.data'
	]);

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
	    url: '/:type/:name',
			templateUrl: 'app/hosts/hosts.html',
			controller: 'HostsCtrl'
	  })
	  .state('host-detail', {
	    url: '/host',
			templateUrl: 'app/host-detail/host-detail.html',
			controller: 'HostDetailCtrl'
	  });
	  $urlRouterProvider.otherwise('/home');
	}
})();

(function() {
	angular
		.module('tablesTonight.home.controller', [])
		.controller('HomeCtrl', HomeCtrl);

	function HomeCtrl($scope, $ionicModal, $state, HostService, TablesTonightService) {

		$scope.credentials       = {};
		$scope.updateInformation = false;
		$scope.login             = login;
		$scope.navigate          = navigate;
		$scope.openModal         = openModal;
		$scope.closeModal        = closeModal;
		init();

		///////////////////////////////////////////////////////////////////////////

		function login() {
			HostService.login($scope.credentials)
				.then(function(host) {
					if (!host.error) {
						$scope.updateInformation = 'step1';
					}
				});
			// closeModal();
		}

		function navigate(location) {
			TablesTonightService.saveLocation(location);
			$state.go('locations');
		}

		function openModal() {
			$scope.modal.show();
	  }

		function closeModal() {
			if (HostService.getHostInfo()) {
				$scope.updateInformation = 'step1';
			}
	    $scope.modal.remove();
			delete $scope.modal;
			init();
	  }

		function init() {
			$ionicModal.fromTemplateUrl('app/home/my-modal.html', {
		    scope: $scope,
		    animation: 'slide-in-up'
		  }).then(function(modal) {
		    $scope.modal = modal;
		  });

			configureListeners();

			function configureListeners() {
				$scope.$on('$destroy', function() {
			    $scope.modal.remove();
			  });
			  // Execute action on hide modal
			  $scope.$on('modal.hidden', function() {
			    // Execute action
			  });
			  // Execute action on remove modal
			  $scope.$on('modal.removed', function() {
			    // Execute action
			  });
			}
		}
	}
})();

angular
	.module('tablesTonight.home', [
		'tablesTonight.home.controller',
		'app.home.host',
		'app.home.update-information'
	]);

(function() {
	angular
		.module('app.home.host', [])
		.factory('HostService', function($http, TablesTonightService) {

			var svc                   = {};

			var hostInfo              = null;
			svc.login                 = login;
			svc.getHostInfo           = getHostInfo;
			svc.updateHostInformation = updateHostInformation
			svc.dayClubList           = TablesTonightService.dayClubList;
			svc.nightClubList         = TablesTonightService.nightClubList;

			return svc;

			function login(credentials) {
				return $http.post('http://localhost:1337/host/login', credentials)
					.then(function(response) {
						if (!response.data.error) {
							hostInfo = response.data;
						}
						return response.data;
					});
			}

			function getHostInfo() {
				return hostInfo;
			}

			function updateHostInformation() {
				return $http.post('http://localhost:1337/host/update', hostInfo)
					.then(function(response) {
						if (!response.data.error) {
							hostInfo = response.data;
						}
						return response.data;
					});
			}
		});
})();

(function() {
	angular
		.module('tablesTonight.host-detail.controller', [])
		.controller('HostDetailCtrl', HostDetailCtrl);

	function HostDetailCtrl($scope, HostsService, $stateParams) {
	  $scope.$on("$ionicView.beforeEnter", function() {
	    $scope.host = HostsService.getHost();
	  });
	}
})();

angular
	.module('tablesTonight.host-detail', [
		'tablesTonight.host-detail.controller'
	]);

(function() {
	angular
		.module('tablesTonight.hosts.controller', [])
		.controller('HostsCtrl', HostsCtrl);

	function HostsCtrl($scope, $stateParams, HostsService) {
	  $scope.$on("$ionicView.beforeEnter", function(HostDetailCtrl) {
			var name = $stateParams.name;
			var type = $stateParams.type;
			getHosts(name)
				.then(function(hosts) {
					$scope.hosts = hosts;
				});
	  });

		$scope.saveHost = saveHost;

		function saveHost(index) {
			HostsService.saveHost($scope.hosts[index]);
		}

		function getHosts(club) {
			if ($stateParams.type === 'day') {
				return HostsService.getDayClubHosts(club);
			}
			return HostsService.getNightClubHosts(club);
		}
	}
})();

(function() {
	angular
		.module('tablesTonight.hosts.data', [])
		.factory('HostsService', HostsService);

	function HostsService($http) {
		var svc = {};
		svc.getNightClubHosts = getNightClubHosts;
		svc.getDayClubHosts   = getDayClubHosts;
		svc.saveHost          = saveHost;
		svc.getHost           = getHost;
		return svc;

		function getNightClubHosts(nightclub) {
			return $http.get('http://localhost:1337/nightclub/'+nightclub)
				.then(function(response) {
					return response.data;
				});
		}

		function getDayClubHosts(dayclub) {
			return $http.get('http://localhost:1337/dayclub/'+dayclub)
				.then(function(response) {
					return response.data;
				});
		}

		function saveHost(host) {
			currentHost = host;
		}

		function getHost() {
			return currentHost;
		}
	}
})();

angular
	.module('tablesTonight.hosts', [
		'tablesTonight.hosts.controller',
		'tablesTonight.hosts.data'
	]);

(function() {
	angular
		.module('tablesTonight.locations.controller', [])
		.controller('LocationsCtrl', LocationsCtrl);

	function LocationsCtrl($scope, TablesTonightService) {
		$scope.$on("$ionicView.beforeEnter", function() {
			if ($scope.type !== TablesTonightService.currentLocation()) {
				$scope.type = TablesTonightService.currentLocation();
				$scope.locations = TablesTonightService.nightClubList;
				$scope.title = 'Night Clubs';
				if ($scope.type === 'day') {
					$scope.locations = TablesTonightService.dayClubList;
					$scope.title = 'Day Clubs';
				}
			}
		});
	}
})();

angular
	.module('tablesTonight.locations', [
		'tablesTonight.locations.controller',
	]);

(function() {
	angular
		.module('tablesTonight.menu-tabs.controller', [])
		.controller('MenuTabsCtrl', MenuTabsCtrl);

	function MenuTabsCtrl($scope) {
	  $scope.$on('hide', function() {
	    $scope.hiding = true;
	  });

	  $scope.$on('show', function() {
	    $scope.hiding = false;
	  });
	}
})();

angular
	.module('tablesTonight.menu-tabs', [
		'tablesTonight.menu-tabs.controller'
	]);

(function() {
	angular
		.module('app.home.update-information.steps', [])
		.directive('updateInformationSteps', function(HostService) {
			var directive = {
					scope: {
						step: '=',
						close: '='
					},
					restrict: 'AE',
					link: link,
					templateUrl: './app/home/update-information/update-information.html'
			};

			return directive;

			///////////////////////////////////////////////////////////////////////////

			function link(scope, element, attrs) {
				scope.step = 'step1';
				scope.next = next;
				scope.finish = finish;

				function next() {
					scope.step = 'step2';
				}

				function finish() {
					HostService.updateHostInformation()
						.then(function(host) {
							if (!host.error) {
								scope.close();
							}
						});
				}
			}

		});
})();

angular
	.module('app.home.update-information', [
		'app.home.update-information.steps',
		'app.home.update-information.step1',
		'app.home.update-information.step2'
	]);

(function() {
	angular
		.module('app.home.update-information.step1', [])
		.directive('updateInformationStepOne', function(HostService) {
			var directive = {
					scope: {
						step: '=',
						next: '='
					},
					restrict: 'AE',
					link: link,
					templateUrl: './app/home/update-information/step1/step1.html'
			};

			return directive;

			///////////////////////////////////////////////////////////////////////////

			function link(scope, element, attrs) {
				scope.host = HostService.getHostInfo();
				scope.nightClubList = HostService.nightClubList;
				scope.getPicture = function() {
					camera.getPicture(function(imageURI) {

				    // imageURI is the URL of the image that we can use for
				    // an <img> element or backgroundImage.

				  }, function(err) {

				    // Ruh-roh, something bad happened

				  }, cameraOptions);
				};
			}

		});
})();

(function() {
	angular
		.module('app.home.update-information.step2', [])
		.directive('updateInformationStepTwo', function(HostService) {
			var directive = {
					scope: {
						step: '=',
						finish: '='
					},
					restrict: 'AE',
					link: link,
					templateUrl: './app/home/update-information/step2/step2.html'
			};

			return directive;

			///////////////////////////////////////////////////////////////////////////

			function link(scope, element, attrs) {
				scope.host = HostService.getHostInfo();
				scope.dayClubList = HostService.dayClubList;
			}

		});
})();

(function() {
	angular
		.module('app.data', [])
		.factory('TablesTonightService', TablesTonightService);

	function TablesTonightService() {

		var svc = {};
		var location = null;

		svc.currentLocation = currentLocation;
		svc.saveLocation = saveLocation;
		svc.dayClubList   = dayClubList();
		svc.nightClubList = nightClubList();

		return svc;

		function currentLocation() {
			return location;
		}

		function saveLocation(newLocation) {
			location = newLocation;
		}

		function dayClubList() {
			return [
				'Azure',
				'Bare',
				'Daylight',
				'Delano Beach Club',
				'Drais Beach Club',
				'Encore Beach Club',
				'Foxtail Beach Club',
				'Lavo Brunch',
				'Liquid Pool',
				'Marquee Day Club',
				'Moorea',
				'Palms Pool Day Club',
				'Rehab Beach Club',
				'TAO Beach Club',
				'Wet Republic'
			]
		}

		function nightClubList() {

			return [
				'1OAK',
				'Chateau',
				'Embassy',
				'Foundation Room',
				'Foxtail',
				'Hakkasan',
				'Hyde',
				'Lavo',
				'LAX',
				'Light',
				'Marquee',
				'Omnia',
				'Sayers Club',
				'Surrender',
				'Tao',
				'The Bank',
				'XS'
			];
		}
	}
})();

angular
	.module('tablesTonight', [
		'tablesTonight.routes',
		'tablesTonight.menu-tabs',
		'tablesTonight.home',
		'tablesTonight.locations',
		'tablesTonight.hosts',
		'tablesTonight.host-detail',
		'app.data'
	]);

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
	    url: '/:type/:name',
			templateUrl: 'app/hosts/hosts.html',
			controller: 'HostsCtrl'
	  })
	  .state('host-detail', {
	    url: '/host',
			templateUrl: 'app/host-detail/host-detail.html',
			controller: 'HostDetailCtrl'
	  });
	  $urlRouterProvider.otherwise('/home');
	}
})();

(function() {
	angular
		.module('tablesTonight.home.controller', [])
		.controller('HomeCtrl', HomeCtrl);

	function HomeCtrl($scope, $ionicModal, $state, HostService, TablesTonightService) {

		$scope.credentials       = {};
		$scope.updateInformation = false;
		$scope.login             = login;
		$scope.navigate          = navigate;
		$scope.openModal         = openModal;
		$scope.closeModal        = closeModal;
		init();

		///////////////////////////////////////////////////////////////////////////

		function login() {
			HostService.login($scope.credentials)
				.then(function(host) {
					if (!host.error) {
						$scope.updateInformation = 'step1';
					}
				});
			// closeModal();
		}

		function navigate(location) {
			TablesTonightService.saveLocation(location);
			$state.go('locations');
		}

		function openModal() {
			$scope.modal.show();
	  }

		function closeModal() {
			if (HostService.getHostInfo()) {
				$scope.updateInformation = 'step1';
			}
	    $scope.modal.remove();
			delete $scope.modal;
			init();
	  }

		function init() {
			$ionicModal.fromTemplateUrl('app/home/my-modal.html', {
		    scope: $scope,
		    animation: 'slide-in-up'
		  }).then(function(modal) {
		    $scope.modal = modal;
		  });

			configureListeners();

			function configureListeners() {
				$scope.$on('$destroy', function() {
			    $scope.modal.remove();
			  });
			  // Execute action on hide modal
			  $scope.$on('modal.hidden', function() {
			    // Execute action
			  });
			  // Execute action on remove modal
			  $scope.$on('modal.removed', function() {
			    // Execute action
			  });
			}
		}
	}
})();

angular
	.module('tablesTonight.home', [
		'tablesTonight.home.controller',
		'app.home.host',
		'app.home.update-information'
	]);

(function() {
	angular
		.module('app.home.host', [])
		.factory('HostService', function($http, TablesTonightService) {

			var svc                   = {};

			var hostInfo              = null;
			svc.login                 = login;
			svc.getHostInfo           = getHostInfo;
			svc.updateHostInformation = updateHostInformation
			svc.dayClubList           = TablesTonightService.dayClubList;
			svc.nightClubList         = TablesTonightService.nightClubList;

			return svc;

			function login(credentials) {
				return $http.post('http://localhost:1337/host/login', credentials)
					.then(function(response) {
						if (!response.data.error) {
							hostInfo = response.data;
						}
						return response.data;
					});
			}

			function getHostInfo() {
				return hostInfo;
			}

			function updateHostInformation() {
				return $http.post('http://localhost:1337/host/update', hostInfo)
					.then(function(response) {
						if (!response.data.error) {
							hostInfo = response.data;
						}
						return response.data;
					});
			}
		});
})();

(function() {
	angular
		.module('tablesTonight.host-detail.controller', [])
		.controller('HostDetailCtrl', HostDetailCtrl);

	function HostDetailCtrl($scope, HostsService, $stateParams) {
	  $scope.$on("$ionicView.beforeEnter", function() {
	    $scope.host = HostsService.getHost();
	  });
	}
})();

angular
	.module('tablesTonight.host-detail', [
		'tablesTonight.host-detail.controller'
	]);

(function() {
	angular
		.module('tablesTonight.hosts.controller', [])
		.controller('HostsCtrl', HostsCtrl);

	function HostsCtrl($scope, $stateParams, HostsService) {
	  $scope.$on("$ionicView.beforeEnter", function(HostDetailCtrl) {
			var name = $stateParams.name;
			var type = $stateParams.type;
			getHosts(name)
				.then(function(hosts) {
					$scope.hosts = hosts;
				});
	  });

		$scope.saveHost = saveHost;

		function saveHost(index) {
			HostsService.saveHost($scope.hosts[index]);
		}

		function getHosts(club) {
			if ($stateParams.type === 'day') {
				return HostsService.getDayClubHosts(club);
			}
			return HostsService.getNightClubHosts(club);
		}
	}
})();

(function() {
	angular
		.module('tablesTonight.hosts.data', [])
		.factory('HostsService', HostsService);

	function HostsService($http) {
		var svc = {};
		svc.getNightClubHosts = getNightClubHosts;
		svc.getDayClubHosts   = getDayClubHosts;
		svc.saveHost          = saveHost;
		svc.getHost           = getHost;
		return svc;

		function getNightClubHosts(nightclub) {
			return $http.get('http://localhost:1337/nightclub/'+nightclub)
				.then(function(response) {
					return response.data;
				});
		}

		function getDayClubHosts(dayclub) {
			return $http.get('http://localhost:1337/dayclub/'+dayclub)
				.then(function(response) {
					return response.data;
				});
		}

		function saveHost(host) {
			currentHost = host;
		}

		function getHost() {
			return currentHost;
		}
	}
})();

angular
	.module('tablesTonight.hosts', [
		'tablesTonight.hosts.controller',
		'tablesTonight.hosts.data'
	]);

(function() {
	angular
		.module('tablesTonight.locations.controller', [])
		.controller('LocationsCtrl', LocationsCtrl);

	function LocationsCtrl($scope, TablesTonightService) {
		$scope.$on("$ionicView.beforeEnter", function() {
			if ($scope.type !== TablesTonightService.currentLocation()) {
				$scope.type = TablesTonightService.currentLocation();
				$scope.locations = TablesTonightService.nightClubList;
				$scope.title = 'Night Clubs';
				if ($scope.type === 'day') {
					$scope.locations = TablesTonightService.dayClubList;
					$scope.title = 'Day Clubs';
				}
			}
		});
	}
})();

angular
	.module('tablesTonight.locations', [
		'tablesTonight.locations.controller',
	]);

(function() {
	angular
		.module('tablesTonight.menu-tabs.controller', [])
		.controller('MenuTabsCtrl', MenuTabsCtrl);

	function MenuTabsCtrl($scope) {
	  $scope.$on('hide', function() {
	    $scope.hiding = true;
	  });

	  $scope.$on('show', function() {
	    $scope.hiding = false;
	  });
	}
})();

angular
	.module('tablesTonight.menu-tabs', [
		'tablesTonight.menu-tabs.controller'
	]);

(function() {
	angular
		.module('app.home.update-information.steps', [])
		.directive('updateInformationSteps', function(HostService) {
			var directive = {
					scope: {
						step: '=',
						close: '='
					},
					restrict: 'AE',
					link: link,
					templateUrl: './app/home/update-information/update-information.html'
			};

			return directive;

			///////////////////////////////////////////////////////////////////////////

			function link(scope, element, attrs) {
				scope.step = 'step1';
				scope.next = next;
				scope.finish = finish;

				function next() {
					scope.step = 'step2';
				}

				function finish() {
					HostService.updateHostInformation()
						.then(function(host) {
							if (!host.error) {
								scope.close();
							}
						});
				}
			}

		});
})();

angular
	.module('app.home.update-information', [
		'app.home.update-information.steps',
		'app.home.update-information.step1',
		'app.home.update-information.step2'
	]);

(function() {
	angular
		.module('app.home.update-information.step1', [])
		.directive('updateInformationStepOne', function(HostService) {
			var directive = {
					scope: {
						step: '=',
						next: '='
					},
					restrict: 'AE',
					link: link,
					templateUrl: './app/home/update-information/step1/step1.html'
			};

			return directive;

			///////////////////////////////////////////////////////////////////////////

			function link(scope, element, attrs) {
				scope.host = HostService.getHostInfo();
				scope.nightClubList = HostService.nightClubList;
				scope.getPicture = function() {
					Camera.getPicture(function(imageURI) {

				    // imageURI is the URL of the image that we can use for
				    // an <img> element or backgroundImage.

				  }, function(err) {

				    // Ruh-roh, something bad happened

				  }, cameraOptions);
				};
			}

		});
})();

(function() {
	angular
		.module('app.home.update-information.step2', [])
		.directive('updateInformationStepTwo', function(HostService) {
			var directive = {
					scope: {
						step: '=',
						finish: '='
					},
					restrict: 'AE',
					link: link,
					templateUrl: './app/home/update-information/step2/step2.html'
			};

			return directive;

			///////////////////////////////////////////////////////////////////////////

			function link(scope, element, attrs) {
				scope.host = HostService.getHostInfo();
				scope.dayClubList = HostService.dayClubList;
			}

		});
})();

(function() {
	angular
		.module('app.data', [])
		.factory('TablesTonightService', TablesTonightService);

	function TablesTonightService() {

		var svc = {};
		var location = null;

		svc.currentLocation = currentLocation;
		svc.saveLocation = saveLocation;
		svc.dayClubList   = dayClubList();
		svc.nightClubList = nightClubList();

		return svc;

		function currentLocation() {
			return location;
		}

		function saveLocation(newLocation) {
			location = newLocation;
		}

		function dayClubList() {
			return [
				'Azure',
				'Bare',
				'Daylight',
				'Delano Beach Club',
				'Drais Beach Club',
				'Encore Beach Club',
				'Foxtail Beach Club',
				'Lavo Brunch',
				'Liquid Pool',
				'Marquee Day Club',
				'Moorea',
				'Palms Pool Day Club',
				'Rehab Beach Club',
				'TAO Beach Club',
				'Wet Republic'
			]
		}

		function nightClubList() {

			return [
				'1OAK',
				'Chateau',
				'Embassy',
				'Foundation Room',
				'Foxtail',
				'Hakkasan',
				'Hyde',
				'Lavo',
				'LAX',
				'Light',
				'Marquee',
				'Omnia',
				'Sayers Club',
				'Surrender',
				'Tao',
				'The Bank',
				'XS'
			];
		}
	}
})();

angular
	.module('tablesTonight', [
		'tablesTonight.routes',
		'tablesTonight.menu-tabs',
		'tablesTonight.home',
		'tablesTonight.locations',
		'tablesTonight.hosts',
		'tablesTonight.host-detail',
		'app.data'
	]);

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
	    url: '/:type/:name',
			templateUrl: 'app/hosts/hosts.html',
			controller: 'HostsCtrl'
	  })
	  .state('host-detail', {
	    url: '/host',
			templateUrl: 'app/host-detail/host-detail.html',
			controller: 'HostDetailCtrl'
	  });
	  $urlRouterProvider.otherwise('/home');
	}
})();

(function() {
	angular
		.module('tablesTonight.home.controller', [])
		.controller('HomeCtrl', HomeCtrl);

	function HomeCtrl($scope, $ionicModal, $state, HostService, TablesTonightService) {

		$scope.credentials       = {};
		$scope.updateInformation = false;
		$scope.login             = login;
		$scope.navigate          = navigate;
		$scope.openModal         = openModal;
		$scope.closeModal        = closeModal;
		init();

		///////////////////////////////////////////////////////////////////////////

		function login() {
			HostService.login($scope.credentials)
				.then(function(host) {
					if (!host.error) {
						$scope.updateInformation = 'step1';
					}
				});
			// closeModal();
		}

		function navigate(location) {
			TablesTonightService.saveLocation(location);
			$state.go('locations');
		}

		function openModal() {
			$scope.modal.show();
	  }

		function closeModal() {
			if (HostService.getHostInfo()) {
				$scope.updateInformation = 'step1';
			}
	    $scope.modal.remove();
			delete $scope.modal;
			init();
	  }

		function init() {
			$ionicModal.fromTemplateUrl('app/home/my-modal.html', {
		    scope: $scope,
		    animation: 'slide-in-up'
		  }).then(function(modal) {
		    $scope.modal = modal;
		  });

			configureListeners();

			function configureListeners() {
				$scope.$on('$destroy', function() {
			    $scope.modal.remove();
			  });
			  // Execute action on hide modal
			  $scope.$on('modal.hidden', function() {
			    // Execute action
			  });
			  // Execute action on remove modal
			  $scope.$on('modal.removed', function() {
			    // Execute action
			  });
			}
		}
	}
})();

angular
	.module('tablesTonight.home', [
		'tablesTonight.home.controller',
		'app.home.host',
		'app.home.update-information'
	]);

(function() {
	angular
		.module('app.home.host', [])
		.factory('HostService', function($http, TablesTonightService) {

			var svc                   = {};

			var hostInfo              = null;
			svc.login                 = login;
			svc.getHostInfo           = getHostInfo;
			svc.updateHostInformation = updateHostInformation
			svc.dayClubList           = TablesTonightService.dayClubList;
			svc.nightClubList         = TablesTonightService.nightClubList;

			return svc;

			function login(credentials) {
				return $http.post('http://localhost:1337/host/login', credentials)
					.then(function(response) {
						if (!response.data.error) {
							hostInfo = response.data;
						}
						return response.data;
					});
			}

			function getHostInfo() {
				return hostInfo;
			}

			function updateHostInformation() {
				return $http.post('http://localhost:1337/host/update', hostInfo)
					.then(function(response) {
						if (!response.data.error) {
							hostInfo = response.data;
						}
						return response.data;
					});
			}
		});
})();

(function() {
	angular
		.module('tablesTonight.host-detail.controller', [])
		.controller('HostDetailCtrl', HostDetailCtrl);

	function HostDetailCtrl($scope, HostsService, $stateParams) {
	  $scope.$on("$ionicView.beforeEnter", function() {
	    $scope.host = HostsService.getHost();
	  });
	}
})();

angular
	.module('tablesTonight.host-detail', [
		'tablesTonight.host-detail.controller'
	]);

(function() {
	angular
		.module('tablesTonight.hosts.controller', [])
		.controller('HostsCtrl', HostsCtrl);

	function HostsCtrl($scope, $stateParams, HostsService) {
	  $scope.$on("$ionicView.beforeEnter", function(HostDetailCtrl) {
			var name = $stateParams.name;
			var type = $stateParams.type;
			getHosts(name)
				.then(function(hosts) {
					$scope.hosts = hosts;
				});
	  });

		$scope.saveHost = saveHost;

		function saveHost(index) {
			HostsService.saveHost($scope.hosts[index]);
		}

		function getHosts(club) {
			if ($stateParams.type === 'day') {
				return HostsService.getDayClubHosts(club);
			}
			return HostsService.getNightClubHosts(club);
		}
	}
})();

(function() {
	angular
		.module('tablesTonight.hosts.data', [])
		.factory('HostsService', HostsService);

	function HostsService($http) {
		var svc = {};
		svc.getNightClubHosts = getNightClubHosts;
		svc.getDayClubHosts   = getDayClubHosts;
		svc.saveHost          = saveHost;
		svc.getHost           = getHost;
		return svc;

		function getNightClubHosts(nightclub) {
			return $http.get('http://localhost:1337/nightclub/'+nightclub)
				.then(function(response) {
					return response.data;
				});
		}

		function getDayClubHosts(dayclub) {
			return $http.get('http://localhost:1337/dayclub/'+dayclub)
				.then(function(response) {
					return response.data;
				});
		}

		function saveHost(host) {
			currentHost = host;
		}

		function getHost() {
			return currentHost;
		}
	}
})();

angular
	.module('tablesTonight.hosts', [
		'tablesTonight.hosts.controller',
		'tablesTonight.hosts.data'
	]);

(function() {
	angular
		.module('tablesTonight.locations.controller', [])
		.controller('LocationsCtrl', LocationsCtrl);

	function LocationsCtrl($scope, TablesTonightService) {
		$scope.$on("$ionicView.beforeEnter", function() {
			if ($scope.type !== TablesTonightService.currentLocation()) {
				$scope.type = TablesTonightService.currentLocation();
				$scope.locations = TablesTonightService.nightClubList;
				$scope.title = 'Night Clubs';
				if ($scope.type === 'day') {
					$scope.locations = TablesTonightService.dayClubList;
					$scope.title = 'Day Clubs';
				}
			}
		});
	}
})();

angular
	.module('tablesTonight.locations', [
		'tablesTonight.locations.controller',
	]);

(function() {
	angular
		.module('tablesTonight.menu-tabs.controller', [])
		.controller('MenuTabsCtrl', MenuTabsCtrl);

	function MenuTabsCtrl($scope) {
	  $scope.$on('hide', function() {
	    $scope.hiding = true;
	  });

	  $scope.$on('show', function() {
	    $scope.hiding = false;
	  });
	}
})();

angular
	.module('tablesTonight.menu-tabs', [
		'tablesTonight.menu-tabs.controller'
	]);

(function() {
	angular
		.module('app.home.update-information.steps', [])
		.directive('updateInformationSteps', function(HostService) {
			var directive = {
					scope: {
						step: '=',
						close: '='
					},
					restrict: 'AE',
					link: link,
					templateUrl: './app/home/update-information/update-information.html'
			};

			return directive;

			///////////////////////////////////////////////////////////////////////////

			function link(scope, element, attrs) {
				scope.step = 'step1';
				scope.next = next;
				scope.finish = finish;

				function next() {
					scope.step = 'step2';
				}

				function finish() {
					HostService.updateHostInformation()
						.then(function(host) {
							if (!host.error) {
								scope.close();
							}
						});
				}
			}

		});
})();

angular
	.module('app.home.update-information', [
		'app.home.update-information.steps',
		'app.home.update-information.step1',
		'app.home.update-information.step2'
	]);

(function() {
	angular
		.module('app.home.update-information.step1', [])
		.directive('updateInformationStepOne', function(HostService) {
			var directive = {
					scope: {
						step: '=',
						next: '='
					},
					restrict: 'AE',
					link: link,
					templateUrl: './app/home/update-information/step1/step1.html'
			};

			return directive;

			///////////////////////////////////////////////////////////////////////////

			function link(scope, element, attrs) {
				scope.host = HostService.getHostInfo();
				scope.nightClubList = HostService.nightClubList;
				scope.getPicture = function() {
					Camera.getPicture(function(imageURI) {

				    // imageURI is the URL of the image that we can use for
				    // an <img> element or backgroundImage.

				  }, function(err) {

				    // Ruh-roh, something bad happened

				  }, cameraOptions);
				};
			}

		});
})();

(function() {
	angular
		.module('app.home.update-information.step2', [])
		.directive('updateInformationStepTwo', function(HostService) {
			var directive = {
					scope: {
						step: '=',
						finish: '='
					},
					restrict: 'AE',
					link: link,
					templateUrl: './app/home/update-information/step2/step2.html'
			};

			return directive;

			///////////////////////////////////////////////////////////////////////////

			function link(scope, element, attrs) {
				scope.host = HostService.getHostInfo();
				scope.dayClubList = HostService.dayClubList;
			}

		});
})();

(function() {
	angular
		.module('app.data', [])
		.factory('TablesTonightService', TablesTonightService);

	function TablesTonightService() {

		var svc = {};
		var location = null;

		svc.currentLocation = currentLocation;
		svc.saveLocation = saveLocation;
		svc.dayClubList   = dayClubList();
		svc.nightClubList = nightClubList();

		return svc;

		function currentLocation() {
			return location;
		}

		function saveLocation(newLocation) {
			location = newLocation;
		}

		function dayClubList() {
			return [
				'Azure',
				'Bare',
				'Daylight',
				'Delano Beach Club',
				'Drais Beach Club',
				'Encore Beach Club',
				'Foxtail Beach Club',
				'Lavo Brunch',
				'Liquid Pool',
				'Marquee Day Club',
				'Moorea',
				'Palms Pool Day Club',
				'Rehab Beach Club',
				'TAO Beach Club',
				'Wet Republic'
			]
		}

		function nightClubList() {

			return [
				'1OAK',
				'Chateau',
				'Embassy',
				'Foundation Room',
				'Foxtail',
				'Hakkasan',
				'Hyde',
				'Lavo',
				'LAX',
				'Light',
				'Marquee',
				'Omnia',
				'Sayers Club',
				'Surrender',
				'Tao',
				'The Bank',
				'XS'
			];
		}
	}
})();

angular
	.module('tablesTonight', [
		'tablesTonight.routes',
		'tablesTonight.menu-tabs',
		'tablesTonight.home',
		'tablesTonight.locations',
		'tablesTonight.hosts',
		'tablesTonight.host-detail',
		'app.data'
	]);

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
	    url: '/:type/:name',
			templateUrl: 'app/hosts/hosts.html',
			controller: 'HostsCtrl'
	  })
	  .state('host-detail', {
	    url: '/host',
			templateUrl: 'app/host-detail/host-detail.html',
			controller: 'HostDetailCtrl'
	  });
	  $urlRouterProvider.otherwise('/home');
	}
})();

(function() {
	angular
		.module('tablesTonight.home.controller', [])
		.controller('HomeCtrl', HomeCtrl);

	function HomeCtrl($scope, $ionicModal, $state, HostService, TablesTonightService) {

		$scope.credentials       = {};
		$scope.updateInformation = false;
		$scope.login             = login;
		$scope.navigate          = navigate;
		$scope.openModal         = openModal;
		$scope.closeModal        = closeModal;
		init();

		///////////////////////////////////////////////////////////////////////////

		function login() {
			HostService.login($scope.credentials)
				.then(function(host) {
					if (!host.error) {
						$scope.updateInformation = 'step1';
					}
				});
			// closeModal();
		}

		function navigate(location) {
			TablesTonightService.saveLocation(location);
			$state.go('locations');
		}

		function openModal() {
			$scope.modal.show();
	  }

		function closeModal() {
			if (HostService.getHostInfo()) {
				$scope.updateInformation = 'step1';
			}
	    $scope.modal.remove();
			delete $scope.modal;
			init();
	  }

		function init() {
			$ionicModal.fromTemplateUrl('app/home/my-modal.html', {
		    scope: $scope,
		    animation: 'slide-in-up'
		  }).then(function(modal) {
		    $scope.modal = modal;
		  });

			configureListeners();

			function configureListeners() {
				$scope.$on('$destroy', function() {
			    $scope.modal.remove();
			  });
			  // Execute action on hide modal
			  $scope.$on('modal.hidden', function() {
			    // Execute action
			  });
			  // Execute action on remove modal
			  $scope.$on('modal.removed', function() {
			    // Execute action
			  });
			}
		}
	}
})();

angular
	.module('tablesTonight.home', [
		'tablesTonight.home.controller',
		'app.home.host',
		'app.home.update-information'
	]);

(function() {
	angular
		.module('app.home.host', [])
		.factory('HostService', function($http, TablesTonightService) {

			var svc                   = {};

			var hostInfo              = null;
			svc.login                 = login;
			svc.getHostInfo           = getHostInfo;
			svc.updateHostInformation = updateHostInformation
			svc.dayClubList           = TablesTonightService.dayClubList;
			svc.nightClubList         = TablesTonightService.nightClubList;

			return svc;

			function login(credentials) {
				return $http.post('http://localhost:1337/host/login', credentials)
					.then(function(response) {
						if (!response.data.error) {
							hostInfo = response.data;
						}
						return response.data;
					});
			}

			function getHostInfo() {
				return hostInfo;
			}

			function updateHostInformation() {
				return $http.post('http://localhost:1337/host/update', hostInfo)
					.then(function(response) {
						if (!response.data.error) {
							hostInfo = response.data;
						}
						return response.data;
					});
			}
		});
})();

(function() {
	angular
		.module('tablesTonight.host-detail.controller', [])
		.controller('HostDetailCtrl', HostDetailCtrl);

	function HostDetailCtrl($scope, HostsService, $stateParams) {
	  $scope.$on("$ionicView.beforeEnter", function() {
	    $scope.host = HostsService.getHost();
	  });
	}
})();

angular
	.module('tablesTonight.host-detail', [
		'tablesTonight.host-detail.controller'
	]);

(function() {
	angular
		.module('tablesTonight.hosts.controller', [])
		.controller('HostsCtrl', HostsCtrl);

	function HostsCtrl($scope, $stateParams, HostsService) {
	  $scope.$on("$ionicView.beforeEnter", function(HostDetailCtrl) {
			var name = $stateParams.name;
			var type = $stateParams.type;
			getHosts(name)
				.then(function(hosts) {
					$scope.hosts = hosts;
				});
	  });

		$scope.saveHost = saveHost;

		function saveHost(index) {
			HostsService.saveHost($scope.hosts[index]);
		}

		function getHosts(club) {
			if ($stateParams.type === 'day') {
				return HostsService.getDayClubHosts(club);
			}
			return HostsService.getNightClubHosts(club);
		}
	}
})();

(function() {
	angular
		.module('tablesTonight.hosts.data', [])
		.factory('HostsService', HostsService);

	function HostsService($http) {
		var svc = {};
		svc.getNightClubHosts = getNightClubHosts;
		svc.getDayClubHosts   = getDayClubHosts;
		svc.saveHost          = saveHost;
		svc.getHost           = getHost;
		return svc;

		function getNightClubHosts(nightclub) {
			return $http.get('http://localhost:1337/nightclub/'+nightclub)
				.then(function(response) {
					return response.data;
				});
		}

		function getDayClubHosts(dayclub) {
			return $http.get('http://localhost:1337/dayclub/'+dayclub)
				.then(function(response) {
					return response.data;
				});
		}

		function saveHost(host) {
			currentHost = host;
		}

		function getHost() {
			return currentHost;
		}
	}
})();

angular
	.module('tablesTonight.hosts', [
		'tablesTonight.hosts.controller',
		'tablesTonight.hosts.data'
	]);

(function() {
	angular
		.module('tablesTonight.locations.controller', [])
		.controller('LocationsCtrl', LocationsCtrl);

	function LocationsCtrl($scope, TablesTonightService) {
		$scope.$on("$ionicView.beforeEnter", function() {
			if ($scope.type !== TablesTonightService.currentLocation()) {
				$scope.type = TablesTonightService.currentLocation();
				$scope.locations = TablesTonightService.nightClubList;
				$scope.title = 'Night Clubs';
				if ($scope.type === 'day') {
					$scope.locations = TablesTonightService.dayClubList;
					$scope.title = 'Day Clubs';
				}
			}
		});
	}
})();

angular
	.module('tablesTonight.locations', [
		'tablesTonight.locations.controller',
	]);

(function() {
	angular
		.module('tablesTonight.menu-tabs.controller', [])
		.controller('MenuTabsCtrl', MenuTabsCtrl);

	function MenuTabsCtrl($scope) {
	  $scope.$on('hide', function() {
	    $scope.hiding = true;
	  });

	  $scope.$on('show', function() {
	    $scope.hiding = false;
	  });
	}
})();

angular
	.module('tablesTonight.menu-tabs', [
		'tablesTonight.menu-tabs.controller'
	]);

(function() {
	angular
		.module('app.home.update-information.steps', [])
		.directive('updateInformationSteps', function(HostService) {
			var directive = {
					scope: {
						step: '=',
						close: '='
					},
					restrict: 'AE',
					link: link,
					templateUrl: './app/home/update-information/update-information.html'
			};

			return directive;

			///////////////////////////////////////////////////////////////////////////

			function link(scope, element, attrs) {
				scope.step = 'step1';
				scope.next = next;
				scope.finish = finish;

				function next() {
					scope.step = 'step2';
				}

				function finish() {
					HostService.updateHostInformation()
						.then(function(host) {
							if (!host.error) {
								scope.close();
							}
						});
				}
			}

		});
})();

angular
	.module('app.home.update-information', [
		'app.home.update-information.steps',
		'app.home.update-information.step1',
		'app.home.update-information.step2'
	]);

(function() {
	angular
		.module('app.home.update-information.step1', [])
		.directive('updateInformationStepOne', function(HostService, $cordovaCamera) {
			var directive = {
					scope: {
						step: '=',
						next: '='
					},
					restrict: 'AE',
					link: link,
					templateUrl: './app/home/update-information/step1/step1.html'
			};

			return directive;

			///////////////////////////////////////////////////////////////////////////

			function link(scope, element, attrs) {
				scope.host = HostService.getHostInfo();
				scope.nightClubList = HostService.nightClubList;
				scope.getPicture = function() {
					var options = {
                    //quality : 75,
                    destinationType : Camera.DestinationType.DATA_URL,
                    sourceType : Camera.PictureSourceType.PHOTOLIBRARY,
                    allowEdit : true,
                    encodingType: Camera.EncodingType.JPEG,
                    //targetWidth: 100,
                    //targetHeight: 100,
                    popoverOptions: CameraPopoverOptions,
                            saveToPhotoAlbum: false
            };
        $cordovaCamera.getPicture(options).then(function(imageData) {
                    // success image data is here
                    }, function(err) {
                            // An error occured. Show a message to the user
            });
				};
			}

		});
})();

(function() {
	angular
		.module('app.home.update-information.step2', [])
		.directive('updateInformationStepTwo', function(HostService) {
			var directive = {
					scope: {
						step: '=',
						finish: '='
					},
					restrict: 'AE',
					link: link,
					templateUrl: './app/home/update-information/step2/step2.html'
			};

			return directive;

			///////////////////////////////////////////////////////////////////////////

			function link(scope, element, attrs) {
				scope.host = HostService.getHostInfo();
				scope.dayClubList = HostService.dayClubList;
			}

		});
})();

(function() {
	angular
		.module('app.data', [])
		.factory('TablesTonightService', TablesTonightService);

	function TablesTonightService() {

		var svc = {};
		var location = null;

		svc.currentLocation = currentLocation;
		svc.saveLocation = saveLocation;
		svc.dayClubList   = dayClubList();
		svc.nightClubList = nightClubList();

		return svc;

		function currentLocation() {
			return location;
		}

		function saveLocation(newLocation) {
			location = newLocation;
		}

		function dayClubList() {
			return [
				'Azure',
				'Bare',
				'Daylight',
				'Delano Beach Club',
				'Drais Beach Club',
				'Encore Beach Club',
				'Foxtail Beach Club',
				'Lavo Brunch',
				'Liquid Pool',
				'Marquee Day Club',
				'Moorea',
				'Palms Pool Day Club',
				'Rehab Beach Club',
				'TAO Beach Club',
				'Wet Republic'
			]
		}

		function nightClubList() {

			return [
				'1OAK',
				'Chateau',
				'Embassy',
				'Foundation Room',
				'Foxtail',
				'Hakkasan',
				'Hyde',
				'Lavo',
				'LAX',
				'Light',
				'Marquee',
				'Omnia',
				'Sayers Club',
				'Surrender',
				'Tao',
				'The Bank',
				'XS'
			];
		}
	}
})();

angular
	.module('tablesTonight', [
		'tablesTonight.routes',
		'tablesTonight.menu-tabs',
		'tablesTonight.home',
		'tablesTonight.locations',
		'tablesTonight.hosts',
		'tablesTonight.host-detail',
		'app.data'
	]);

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
	    url: '/:type/:name',
			templateUrl: 'app/hosts/hosts.html',
			controller: 'HostsCtrl'
	  })
	  .state('host-detail', {
	    url: '/host',
			templateUrl: 'app/host-detail/host-detail.html',
			controller: 'HostDetailCtrl'
	  });
	  $urlRouterProvider.otherwise('/home');
	}
})();

(function() {
	angular
		.module('tablesTonight.home.controller', [])
		.controller('HomeCtrl', HomeCtrl);

	function HomeCtrl($scope, $ionicModal, $state, HostService, TablesTonightService) {

		$scope.credentials       = {};
		$scope.updateInformation = false;
		$scope.login             = login;
		$scope.navigate          = navigate;
		$scope.openModal         = openModal;
		$scope.closeModal        = closeModal;
		init();

		///////////////////////////////////////////////////////////////////////////

		function login() {
			HostService.login($scope.credentials)
				.then(function(host) {
					if (!host.error) {
						$scope.updateInformation = 'step1';
					}
				});
			// closeModal();
		}

		function navigate(location) {
			TablesTonightService.saveLocation(location);
			$state.go('locations');
		}

		function openModal() {
			$scope.modal.show();
	  }

		function closeModal() {
			if (HostService.getHostInfo()) {
				$scope.updateInformation = 'step1';
			}
	    $scope.modal.remove();
			delete $scope.modal;
			init();
	  }

		function init() {
			$ionicModal.fromTemplateUrl('app/home/my-modal.html', {
		    scope: $scope,
		    animation: 'slide-in-up'
		  }).then(function(modal) {
		    $scope.modal = modal;
		  });

			configureListeners();

			function configureListeners() {
				$scope.$on('$destroy', function() {
			    $scope.modal.remove();
			  });
			  // Execute action on hide modal
			  $scope.$on('modal.hidden', function() {
			    // Execute action
			  });
			  // Execute action on remove modal
			  $scope.$on('modal.removed', function() {
			    // Execute action
			  });
			}
		}
	}
})();

angular
	.module('tablesTonight.home', [
		'tablesTonight.home.controller',
		'app.home.host',
		'app.home.update-information'
	]);

(function() {
	angular
		.module('app.home.host', [])
		.factory('HostService', function($http, TablesTonightService) {

			var svc                   = {};

			var hostInfo              = null;
			svc.login                 = login;
			svc.getHostInfo           = getHostInfo;
			svc.updateHostInformation = updateHostInformation
			svc.dayClubList           = TablesTonightService.dayClubList;
			svc.nightClubList         = TablesTonightService.nightClubList;

			return svc;

			function login(credentials) {
				return $http.post('http://localhost:1337/host/login', credentials)
					.then(function(response) {
						if (!response.data.error) {
							hostInfo = response.data;
						}
						return response.data;
					});
			}

			function getHostInfo() {
				return hostInfo;
			}

			function updateHostInformation() {
				return $http.post('http://localhost:1337/host/update', hostInfo)
					.then(function(response) {
						if (!response.data.error) {
							hostInfo = response.data;
						}
						return response.data;
					});
			}
		});
})();

(function() {
	angular
		.module('tablesTonight.hosts.controller', [])
		.controller('HostsCtrl', HostsCtrl);

	function HostsCtrl($scope, $stateParams, HostsService) {
	  $scope.$on("$ionicView.beforeEnter", function(HostDetailCtrl) {
			var name = $stateParams.name;
			var type = $stateParams.type;
			getHosts(name)
				.then(function(hosts) {
					$scope.hosts = hosts;
				});
	  });

		$scope.saveHost = saveHost;

		function saveHost(index) {
			HostsService.saveHost($scope.hosts[index]);
		}

		function getHosts(club) {
			if ($stateParams.type === 'day') {
				return HostsService.getDayClubHosts(club);
			}
			return HostsService.getNightClubHosts(club);
		}
	}
})();

(function() {
	angular
		.module('tablesTonight.hosts.data', [])
		.factory('HostsService', HostsService);

	function HostsService($http) {
		var svc = {};
		svc.getNightClubHosts = getNightClubHosts;
		svc.getDayClubHosts   = getDayClubHosts;
		svc.saveHost          = saveHost;
		svc.getHost           = getHost;
		return svc;

		function getNightClubHosts(nightclub) {
			return $http.get('http://localhost:1337/nightclub/'+nightclub)
				.then(function(response) {
					return response.data;
				});
		}

		function getDayClubHosts(dayclub) {
			return $http.get('http://localhost:1337/dayclub/'+dayclub)
				.then(function(response) {
					return response.data;
				});
		}

		function saveHost(host) {
			currentHost = host;
		}

		function getHost() {
			return currentHost;
		}
	}
})();

angular
	.module('tablesTonight.hosts', [
		'tablesTonight.hosts.controller',
		'tablesTonight.hosts.data'
	]);

(function() {
	angular
		.module('tablesTonight.host-detail.controller', [])
		.controller('HostDetailCtrl', HostDetailCtrl);

	function HostDetailCtrl($scope, HostsService, $stateParams) {
	  $scope.$on("$ionicView.beforeEnter", function() {
	    $scope.host = HostsService.getHost();
	  });
	}
})();

angular
	.module('tablesTonight.host-detail', [
		'tablesTonight.host-detail.controller'
	]);

(function() {
	angular
		.module('tablesTonight.locations.controller', [])
		.controller('LocationsCtrl', LocationsCtrl);

	function LocationsCtrl($scope, TablesTonightService) {
		$scope.$on("$ionicView.beforeEnter", function() {
			if ($scope.type !== TablesTonightService.currentLocation()) {
				$scope.type = TablesTonightService.currentLocation();
				$scope.locations = TablesTonightService.nightClubList;
				$scope.title = 'Night Clubs';
				if ($scope.type === 'day') {
					$scope.locations = TablesTonightService.dayClubList;
					$scope.title = 'Day Clubs';
				}
			}
		});
	}
})();

angular
	.module('tablesTonight.locations', [
		'tablesTonight.locations.controller',
	]);

(function() {
	angular
		.module('tablesTonight.menu-tabs.controller', [])
		.controller('MenuTabsCtrl', MenuTabsCtrl);

	function MenuTabsCtrl($scope) {
	  $scope.$on('hide', function() {
	    $scope.hiding = true;
	  });

	  $scope.$on('show', function() {
	    $scope.hiding = false;
	  });
	}
})();

angular
	.module('tablesTonight.menu-tabs', [
		'tablesTonight.menu-tabs.controller'
	]);

(function() {
	angular
		.module('app.home.update-information.steps', [])
		.directive('updateInformationSteps', function(HostService) {
			var directive = {
					scope: {
						step: '=',
						close: '='
					},
					restrict: 'AE',
					link: link,
					templateUrl: './app/home/update-information/update-information.html'
			};

			return directive;

			///////////////////////////////////////////////////////////////////////////

			function link(scope, element, attrs) {
				scope.step = 'step1';
				scope.next = next;
				scope.finish = finish;

				function next() {
					scope.step = 'step2';
				}

				function finish() {
					HostService.updateHostInformation()
						.then(function(host) {
							if (!host.error) {
								scope.close();
							}
						});
				}
			}

		});
})();

angular
	.module('app.home.update-information', [
		'app.home.update-information.steps',
		'app.home.update-information.step1',
		'app.home.update-information.step2'
	]);

(function() {
	angular
		.module('app.home.update-information.step1', [])
		.directive('updateInformationStepOne', function(HostService, $cordovaCamera) {
			var directive = {
					scope: {
						step: '=',
						next: '='
					},
					restrict: 'AE',
					link: link,
					templateUrl: './app/home/update-information/step1/step1.html'
			};

			return directive;

			///////////////////////////////////////////////////////////////////////////

			function link(scope, element, attrs) {
				scope.host = HostService.getHostInfo();
				scope.nightClubList = HostService.nightClubList;
				scope.getPicture = function() {
					var options = {
                    //quality : 75,
                    destinationType : Camera.DestinationType.DATA_URL,
                    sourceType : Camera.PictureSourceType.PHOTOLIBRARY,
                    allowEdit : true,
                    encodingType: Camera.EncodingType.JPEG,
                    //targetWidth: 100,
                    //targetHeight: 100,
                    popoverOptions: CameraPopoverOptions,
                            saveToPhotoAlbum: false
            };
        $cordovaCamera.getPicture(options).then(function(imageData) {
                    // success image data is here
                    }, function(err) {
                            // An error occured. Show a message to the user
            });
				};
			}

		});
})();

(function() {
	angular
		.module('app.home.update-information.step2', [])
		.directive('updateInformationStepTwo', function(HostService) {
			var directive = {
					scope: {
						step: '=',
						finish: '='
					},
					restrict: 'AE',
					link: link,
					templateUrl: './app/home/update-information/step2/step2.html'
			};

			return directive;

			///////////////////////////////////////////////////////////////////////////

			function link(scope, element, attrs) {
				scope.host = HostService.getHostInfo();
				scope.dayClubList = HostService.dayClubList;
			}

		});
})();

(function() {
	angular
		.module('app.data', [])
		.factory('TablesTonightService', TablesTonightService);

	function TablesTonightService() {

		var svc = {};
		var location = null;

		svc.currentLocation = currentLocation;
		svc.saveLocation = saveLocation;
		svc.dayClubList   = dayClubList();
		svc.nightClubList = nightClubList();

		return svc;

		function currentLocation() {
			return location;
		}

		function saveLocation(newLocation) {
			location = newLocation;
		}

		function dayClubList() {
			return [
				'Azure',
				'Bare',
				'Daylight',
				'Delano Beach Club',
				'Drais Beach Club',
				'Encore Beach Club',
				'Foxtail Beach Club',
				'Lavo Brunch',
				'Liquid Pool',
				'Marquee Day Club',
				'Moorea',
				'Palms Pool Day Club',
				'Rehab Beach Club',
				'TAO Beach Club',
				'Wet Republic'
			]
		}

		function nightClubList() {

			return [
				'1OAK',
				'Chateau',
				'Embassy',
				'Foundation Room',
				'Foxtail',
				'Hakkasan',
				'Hyde',
				'Lavo',
				'LAX',
				'Light',
				'Marquee',
				'Omnia',
				'Sayers Club',
				'Surrender',
				'Tao',
				'The Bank',
				'XS'
			];
		}
	}
})();

angular
	.module('tablesTonight', [
		'tablesTonight.routes',
		'tablesTonight.menu-tabs',
		'tablesTonight.home',
		'tablesTonight.locations',
		'tablesTonight.hosts',
		'tablesTonight.host-detail',
		'app.data'
	]);

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
	    url: '/:type/:name',
			templateUrl: 'app/hosts/hosts.html',
			controller: 'HostsCtrl'
	  })
	  .state('host-detail', {
	    url: '/host',
			templateUrl: 'app/host-detail/host-detail.html',
			controller: 'HostDetailCtrl'
	  });
	  $urlRouterProvider.otherwise('/home');
	}
})();

(function() {
	angular
		.module('tablesTonight.home.controller', [])
		.controller('HomeCtrl', HomeCtrl);

	function HomeCtrl($scope, $ionicModal, $state, HostService, TablesTonightService) {

		$scope.credentials       = {};
		$scope.updateInformation = false;
		$scope.login             = login;
		$scope.navigate          = navigate;
		$scope.openModal         = openModal;
		$scope.closeModal        = closeModal;
		init();

		///////////////////////////////////////////////////////////////////////////

		function login() {
			HostService.login($scope.credentials)
				.then(function(host) {
					if (!host.error) {
						$scope.updateInformation = 'step1';
					}
				});
			// closeModal();
		}

		function navigate(location) {
			TablesTonightService.saveLocation(location);
			$state.go('locations');
		}

		function openModal() {
			$scope.modal.show();
	  }

		function closeModal() {
			if (HostService.getHostInfo()) {
				$scope.updateInformation = 'step1';
			}
	    $scope.modal.remove();
			delete $scope.modal;
			init();
	  }

		function init() {
			$ionicModal.fromTemplateUrl('app/home/my-modal.html', {
		    scope: $scope,
		    animation: 'slide-in-up'
		  }).then(function(modal) {
		    $scope.modal = modal;
		  });

			configureListeners();

			function configureListeners() {
				$scope.$on('$destroy', function() {
			    $scope.modal.remove();
			  });
			  // Execute action on hide modal
			  $scope.$on('modal.hidden', function() {
			    // Execute action
			  });
			  // Execute action on remove modal
			  $scope.$on('modal.removed', function() {
			    // Execute action
			  });
			}
		}
	}
})();

angular
	.module('tablesTonight.home', [
		'tablesTonight.home.controller',
		'app.home.host',
		'app.home.update-information'
	]);

(function() {
	angular
		.module('app.home.host', [])
		.factory('HostService', function($http, TablesTonightService) {

			var svc                   = {};

			var hostInfo              = null;
			svc.login                 = login;
			svc.getHostInfo           = getHostInfo;
			svc.updateHostInformation = updateHostInformation
			svc.dayClubList           = TablesTonightService.dayClubList;
			svc.nightClubList         = TablesTonightService.nightClubList;

			return svc;

			function login(credentials) {
				return $http.post('http://localhost:1337/host/login', credentials)
					.then(function(response) {
						if (!response.data.error) {
							hostInfo = response.data;
						}
						return response.data;
					});
			}

			function getHostInfo() {
				return hostInfo;
			}

			function updateHostInformation() {
				return $http.post('http://localhost:1337/host/update', hostInfo)
					.then(function(response) {
						if (!response.data.error) {
							hostInfo = response.data;
						}
						return response.data;
					});
			}
		});
})();

(function() {
	angular
		.module('tablesTonight.hosts.controller', [])
		.controller('HostsCtrl', HostsCtrl);

	function HostsCtrl($scope, $stateParams, HostsService) {
	  $scope.$on("$ionicView.beforeEnter", function(HostDetailCtrl) {
			var name = $stateParams.name;
			var type = $stateParams.type;
			getHosts(name)
				.then(function(hosts) {
					$scope.hosts = hosts;
				});
	  });

		$scope.saveHost = saveHost;

		function saveHost(index) {
			HostsService.saveHost($scope.hosts[index]);
		}

		function getHosts(club) {
			if ($stateParams.type === 'day') {
				return HostsService.getDayClubHosts(club);
			}
			return HostsService.getNightClubHosts(club);
		}
	}
})();

(function() {
	angular
		.module('tablesTonight.hosts.data', [])
		.factory('HostsService', HostsService);

	function HostsService($http) {
		var svc = {};
		svc.getNightClubHosts = getNightClubHosts;
		svc.getDayClubHosts   = getDayClubHosts;
		svc.saveHost          = saveHost;
		svc.getHost           = getHost;
		return svc;

		function getNightClubHosts(nightclub) {
			return $http.get('http://localhost:1337/nightclub/'+nightclub)
				.then(function(response) {
					return response.data;
				});
		}

		function getDayClubHosts(dayclub) {
			return $http.get('http://localhost:1337/dayclub/'+dayclub)
				.then(function(response) {
					return response.data;
				});
		}

		function saveHost(host) {
			currentHost = host;
		}

		function getHost() {
			return currentHost;
		}
	}
})();

angular
	.module('tablesTonight.hosts', [
		'tablesTonight.hosts.controller',
		'tablesTonight.hosts.data'
	]);

(function() {
	angular
		.module('tablesTonight.host-detail.controller', [])
		.controller('HostDetailCtrl', HostDetailCtrl);

	function HostDetailCtrl($scope, HostsService, $stateParams) {
	  $scope.$on("$ionicView.beforeEnter", function() {
	    $scope.host = HostsService.getHost();
	  });
	}
})();

angular
	.module('tablesTonight.host-detail', [
		'tablesTonight.host-detail.controller'
	]);

(function() {
	angular
		.module('tablesTonight.locations.controller', [])
		.controller('LocationsCtrl', LocationsCtrl);

	function LocationsCtrl($scope, TablesTonightService) {
		$scope.$on("$ionicView.beforeEnter", function() {
			if ($scope.type !== TablesTonightService.currentLocation()) {
				$scope.type = TablesTonightService.currentLocation();
				$scope.locations = TablesTonightService.nightClubList;
				$scope.title = 'Night Clubs';
				if ($scope.type === 'day') {
					$scope.locations = TablesTonightService.dayClubList;
					$scope.title = 'Day Clubs';
				}
			}
		});
	}
})();

angular
	.module('tablesTonight.locations', [
		'tablesTonight.locations.controller',
	]);

(function() {
	angular
		.module('tablesTonight.menu-tabs.controller', [])
		.controller('MenuTabsCtrl', MenuTabsCtrl);

	function MenuTabsCtrl($scope) {
	  $scope.$on('hide', function() {
	    $scope.hiding = true;
	  });

	  $scope.$on('show', function() {
	    $scope.hiding = false;
	  });
	}
})();

angular
	.module('tablesTonight.menu-tabs', [
		'tablesTonight.menu-tabs.controller'
	]);

(function() {
	angular
		.module('app.home.update-information.steps', [])
		.directive('updateInformationSteps', function(HostService) {
			var directive = {
					scope: {
						step: '=',
						close: '='
					},
					restrict: 'AE',
					link: link,
					templateUrl: './app/home/update-information/update-information.html'
			};

			return directive;

			///////////////////////////////////////////////////////////////////////////

			function link(scope, element, attrs) {
				scope.step = 'step1';
				scope.next = next;
				scope.finish = finish;

				function next() {
					scope.step = 'step2';
				}

				function finish() {
					HostService.updateHostInformation()
						.then(function(host) {
							if (!host.error) {
								scope.close();
							}
						});
				}
			}

		});
})();

angular
	.module('app.home.update-information', [
		'app.home.update-information.steps',
		'app.home.update-information.step1',
		'app.home.update-information.step2'
	]);

(function() {
	angular
		.module('app.home.update-information.step1', [])
		.directive('updateInformationStepOne', function(HostService) {
			var directive = {
					scope: {
						step: '=',
						next: '='
					},
					restrict: 'AE',
					link: link,
					templateUrl: './app/home/update-information/step1/step1.html'
			};

			return directive;

			///////////////////////////////////////////////////////////////////////////

			function link(scope, element, attrs) {
				scope.host = HostService.getHostInfo();
				scope.nightClubList = HostService.nightClubList;
				scope.getPicture = function() {
					navigator.camera.getPicture(function(imageURI) {

				    // imageURI is the URL of the image that we can use for
				    // an <img> element or backgroundImage.

				  }, function(err) {

				    // Ruh-roh, something bad happened

				  }, cameraOptions);
				};
			}

		});
})();

(function() {
	angular
		.module('app.home.update-information.step2', [])
		.directive('updateInformationStepTwo', function(HostService) {
			var directive = {
					scope: {
						step: '=',
						finish: '='
					},
					restrict: 'AE',
					link: link,
					templateUrl: './app/home/update-information/step2/step2.html'
			};

			return directive;

			///////////////////////////////////////////////////////////////////////////

			function link(scope, element, attrs) {
				scope.host = HostService.getHostInfo();
				scope.dayClubList = HostService.dayClubList;
			}

		});
})();

(function() {
	angular
		.module('app.data', [])
		.factory('TablesTonightService', TablesTonightService);

	function TablesTonightService() {

		var svc = {};
		var location = null;

		svc.currentLocation = currentLocation;
		svc.saveLocation = saveLocation;
		svc.dayClubList   = dayClubList();
		svc.nightClubList = nightClubList();

		return svc;

		function currentLocation() {
			return location;
		}

		function saveLocation(newLocation) {
			location = newLocation;
		}

		function dayClubList() {
			return [
				'Azure',
				'Bare',
				'Daylight',
				'Delano Beach Club',
				'Drais Beach Club',
				'Encore Beach Club',
				'Foxtail Beach Club',
				'Lavo Brunch',
				'Liquid Pool',
				'Marquee Day Club',
				'Moorea',
				'Palms Pool Day Club',
				'Rehab Beach Club',
				'TAO Beach Club',
				'Wet Republic'
			]
		}

		function nightClubList() {

			return [
				'1OAK',
				'Chateau',
				'Embassy',
				'Foundation Room',
				'Foxtail',
				'Hakkasan',
				'Hyde',
				'Lavo',
				'LAX',
				'Light',
				'Marquee',
				'Omnia',
				'Sayers Club',
				'Surrender',
				'Tao',
				'The Bank',
				'XS'
			];
		}
	}
})();

angular
	.module('tablesTonight', [
		'tablesTonight.routes',
		'tablesTonight.menu-tabs',
		'tablesTonight.home',
		'tablesTonight.locations',
		'tablesTonight.hosts',
		'tablesTonight.host-detail',
		'app.data'
	]);

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
	    url: '/:type/:name',
			templateUrl: 'app/hosts/hosts.html',
			controller: 'HostsCtrl'
	  })
	  .state('host-detail', {
	    url: '/host',
			templateUrl: 'app/host-detail/host-detail.html',
			controller: 'HostDetailCtrl'
	  });
	  $urlRouterProvider.otherwise('/home');
	}
})();

(function() {
	angular
		.module('tablesTonight.home.controller', [])
		.controller('HomeCtrl', HomeCtrl);

	function HomeCtrl($scope, $ionicModal, $state, HostService, TablesTonightService) {

		$scope.credentials       = {};
		$scope.updateInformation = false;
		$scope.login             = login;
		$scope.navigate          = navigate;
		$scope.openModal         = openModal;
		$scope.closeModal        = closeModal;
		init();

		///////////////////////////////////////////////////////////////////////////

		function login() {
			HostService.login($scope.credentials)
				.then(function(host) {
					if (!host.error) {
						$scope.updateInformation = 'step1';
					}
				});
			// closeModal();
		}

		function navigate(location) {
			TablesTonightService.saveLocation(location);
			$state.go('locations');
		}

		function openModal() {
			$scope.modal.show();
	  }

		function closeModal() {
			if (HostService.getHostInfo()) {
				$scope.updateInformation = 'step1';
			}
	    $scope.modal.remove();
			delete $scope.modal;
			init();
	  }

		function init() {
			$ionicModal.fromTemplateUrl('app/home/my-modal.html', {
		    scope: $scope,
		    animation: 'slide-in-up'
		  }).then(function(modal) {
		    $scope.modal = modal;
		  });

			configureListeners();

			function configureListeners() {
				$scope.$on('$destroy', function() {
			    $scope.modal.remove();
			  });
			  // Execute action on hide modal
			  $scope.$on('modal.hidden', function() {
			    // Execute action
			  });
			  // Execute action on remove modal
			  $scope.$on('modal.removed', function() {
			    // Execute action
			  });
			}
		}
	}
})();

angular
	.module('tablesTonight.home', [
		'tablesTonight.home.controller',
		'app.home.host',
		'app.home.update-information'
	]);

(function() {
	angular
		.module('app.home.host', [])
		.factory('HostService', function($http, TablesTonightService) {

			var svc                   = {};

			var hostInfo              = null;
			svc.login                 = login;
			svc.getHostInfo           = getHostInfo;
			svc.updateHostInformation = updateHostInformation
			svc.dayClubList           = TablesTonightService.dayClubList;
			svc.nightClubList         = TablesTonightService.nightClubList;

			return svc;

			function login(credentials) {
				return $http.post('http://localhost:1337/host/login', credentials)
					.then(function(response) {
						if (!response.data.error) {
							hostInfo = response.data;
						}
						return response.data;
					});
			}

			function getHostInfo() {
				return hostInfo;
			}

			function updateHostInformation() {
				return $http.post('http://localhost:1337/host/update', hostInfo)
					.then(function(response) {
						if (!response.data.error) {
							hostInfo = response.data;
						}
						return response.data;
					});
			}
		});
})();

(function() {
	angular
		.module('tablesTonight.host-detail.controller', [])
		.controller('HostDetailCtrl', HostDetailCtrl);

	function HostDetailCtrl($scope, HostsService, $stateParams) {
	  $scope.$on("$ionicView.beforeEnter", function() {
	    $scope.host = HostsService.getHost();
	  });
	}
})();

angular
	.module('tablesTonight.host-detail', [
		'tablesTonight.host-detail.controller'
	]);

(function() {
	angular
		.module('tablesTonight.hosts.controller', [])
		.controller('HostsCtrl', HostsCtrl);

	function HostsCtrl($scope, $stateParams, HostsService) {
	  $scope.$on("$ionicView.beforeEnter", function(HostDetailCtrl) {
			var name = $stateParams.name;
			var type = $stateParams.type;
			getHosts(name)
				.then(function(hosts) {
					$scope.hosts = hosts;
				});
	  });

		$scope.saveHost = saveHost;

		function saveHost(index) {
			HostsService.saveHost($scope.hosts[index]);
		}

		function getHosts(club) {
			if ($stateParams.type === 'day') {
				return HostsService.getDayClubHosts(club);
			}
			return HostsService.getNightClubHosts(club);
		}
	}
})();

(function() {
	angular
		.module('tablesTonight.hosts.data', [])
		.factory('HostsService', HostsService);

	function HostsService($http) {
		var svc = {};
		svc.getNightClubHosts = getNightClubHosts;
		svc.getDayClubHosts   = getDayClubHosts;
		svc.saveHost          = saveHost;
		svc.getHost           = getHost;
		return svc;

		function getNightClubHosts(nightclub) {
			return $http.get('http://localhost:1337/nightclub/'+nightclub)
				.then(function(response) {
					return response.data;
				});
		}

		function getDayClubHosts(dayclub) {
			return $http.get('http://localhost:1337/dayclub/'+dayclub)
				.then(function(response) {
					return response.data;
				});
		}

		function saveHost(host) {
			currentHost = host;
		}

		function getHost() {
			return currentHost;
		}
	}
})();

angular
	.module('tablesTonight.hosts', [
		'tablesTonight.hosts.controller',
		'tablesTonight.hosts.data'
	]);

(function() {
	angular
		.module('tablesTonight.locations.controller', [])
		.controller('LocationsCtrl', LocationsCtrl);

	function LocationsCtrl($scope, TablesTonightService) {
		$scope.$on("$ionicView.beforeEnter", function() {
			if ($scope.type !== TablesTonightService.currentLocation()) {
				$scope.type = TablesTonightService.currentLocation();
				$scope.locations = TablesTonightService.nightClubList;
				$scope.title = 'Night Clubs';
				if ($scope.type === 'day') {
					$scope.locations = TablesTonightService.dayClubList;
					$scope.title = 'Day Clubs';
				}
			}
		});
	}
})();

angular
	.module('tablesTonight.locations', [
		'tablesTonight.locations.controller',
	]);

(function() {
	angular
		.module('tablesTonight.menu-tabs.controller', [])
		.controller('MenuTabsCtrl', MenuTabsCtrl);

	function MenuTabsCtrl($scope) {
	  $scope.$on('hide', function() {
	    $scope.hiding = true;
	  });

	  $scope.$on('show', function() {
	    $scope.hiding = false;
	  });
	}
})();

angular
	.module('tablesTonight.menu-tabs', [
		'tablesTonight.menu-tabs.controller'
	]);

(function() {
	angular
		.module('app.home.update-information.steps', [])
		.directive('updateInformationSteps', function(HostService) {
			var directive = {
					scope: {
						step: '=',
						close: '='
					},
					restrict: 'AE',
					link: link,
					templateUrl: './app/home/update-information/update-information.html'
			};

			return directive;

			///////////////////////////////////////////////////////////////////////////

			function link(scope, element, attrs) {
				scope.step = 'step1';
				scope.next = next;
				scope.finish = finish;

				function next() {
					scope.step = 'step2';
				}

				function finish() {
					HostService.updateHostInformation()
						.then(function(host) {
							if (!host.error) {
								scope.close();
							}
						});
				}
			}

		});
})();

angular
	.module('app.home.update-information', [
		'app.home.update-information.steps',
		'app.home.update-information.step1',
		'app.home.update-information.step2'
	]);

(function() {
	angular
		.module('app.home.update-information.step1', [])
		.directive('updateInformationStepOne', function(HostService) {
			var directive = {
					scope: {
						step: '=',
						next: '='
					},
					restrict: 'AE',
					link: link,
					templateUrl: './app/home/update-information/step1/step1.html'
			};

			return directive;

			///////////////////////////////////////////////////////////////////////////

			function link(scope, element, attrs) {
				scope.host = HostService.getHostInfo();
				scope.nightClubList = HostService.nightClubList;
				scope.getPicture = function() {
					debugger;
					navigator.camera.getPicture(function(imageURI) {

				    // imageURI is the URL of the image that we can use for
				    // an <img> element or backgroundImage.

				  }, function(err) {

				    // Ruh-roh, something bad happened

				  }, cameraOptions);
				};
			}

		});
})();

(function() {
	angular
		.module('app.home.update-information.step2', [])
		.directive('updateInformationStepTwo', function(HostService) {
			var directive = {
					scope: {
						step: '=',
						finish: '='
					},
					restrict: 'AE',
					link: link,
					templateUrl: './app/home/update-information/step2/step2.html'
			};

			return directive;

			///////////////////////////////////////////////////////////////////////////

			function link(scope, element, attrs) {
				scope.host = HostService.getHostInfo();
				scope.dayClubList = HostService.dayClubList;
			}

		});
})();

(function() {
	angular
		.module('app.data', [])
		.factory('TablesTonightService', TablesTonightService);

	function TablesTonightService() {

		var svc = {};
		var location = null;

		svc.currentLocation = currentLocation;
		svc.saveLocation = saveLocation;
		svc.dayClubList   = dayClubList();
		svc.nightClubList = nightClubList();

		return svc;

		function currentLocation() {
			return location;
		}

		function saveLocation(newLocation) {
			location = newLocation;
		}

		function dayClubList() {
			return [
				'Azure',
				'Bare',
				'Daylight',
				'Delano Beach Club',
				'Drais Beach Club',
				'Encore Beach Club',
				'Foxtail Beach Club',
				'Lavo Brunch',
				'Liquid Pool',
				'Marquee Day Club',
				'Moorea',
				'Palms Pool Day Club',
				'Rehab Beach Club',
				'TAO Beach Club',
				'Wet Republic'
			]
		}

		function nightClubList() {

			return [
				'1OAK',
				'Chateau',
				'Embassy',
				'Foundation Room',
				'Foxtail',
				'Hakkasan',
				'Hyde',
				'Lavo',
				'LAX',
				'Light',
				'Marquee',
				'Omnia',
				'Sayers Club',
				'Surrender',
				'Tao',
				'The Bank',
				'XS'
			];
		}
	}
})();

angular
	.module('tablesTonight', [
		'tablesTonight.routes',
		'tablesTonight.menu-tabs',
		'tablesTonight.home',
		'tablesTonight.locations',
		'tablesTonight.hosts',
		'tablesTonight.host-detail',
		'app.data'
	]);

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
	    url: '/:type/:name',
			templateUrl: 'app/hosts/hosts.html',
			controller: 'HostsCtrl'
	  })
	  .state('host-detail', {
	    url: '/host',
			templateUrl: 'app/host-detail/host-detail.html',
			controller: 'HostDetailCtrl'
	  });
	  $urlRouterProvider.otherwise('/home');
	}
})();

(function() {
	angular
		.module('tablesTonight.home.controller', [])
		.controller('HomeCtrl', HomeCtrl);

	function HomeCtrl($scope, $ionicModal, $state, HostService, TablesTonightService) {

		$scope.credentials       = {};
		$scope.updateInformation = false;
		$scope.login             = login;
		$scope.navigate          = navigate;
		$scope.openModal         = openModal;
		$scope.closeModal        = closeModal;
		init();

		///////////////////////////////////////////////////////////////////////////

		function login() {
			HostService.login($scope.credentials)
				.then(function(host) {
					if (!host.error) {
						$scope.updateInformation = 'step1';
					}
				});
			// closeModal();
		}

		function navigate(location) {
			TablesTonightService.saveLocation(location);
			$state.go('locations');
		}

		function openModal() {
			$scope.modal.show();
	  }

		function closeModal() {
			if (HostService.getHostInfo()) {
				$scope.updateInformation = 'step1';
			}
	    $scope.modal.remove();
			delete $scope.modal;
			init();
	  }

		function init() {
			$ionicModal.fromTemplateUrl('app/home/my-modal.html', {
		    scope: $scope,
		    animation: 'slide-in-up'
		  }).then(function(modal) {
		    $scope.modal = modal;
		  });

			configureListeners();

			function configureListeners() {
				$scope.$on('$destroy', function() {
			    $scope.modal.remove();
			  });
			  // Execute action on hide modal
			  $scope.$on('modal.hidden', function() {
			    // Execute action
			  });
			  // Execute action on remove modal
			  $scope.$on('modal.removed', function() {
			    // Execute action
			  });
			}
		}
	}
})();

angular
	.module('tablesTonight.home', [
		'tablesTonight.home.controller',
		'app.home.host',
		'app.home.update-information'
	]);

(function() {
	angular
		.module('app.home.host', [])
		.factory('HostService', function($http, TablesTonightService) {

			var svc                   = {};

			var hostInfo              = null;
			svc.login                 = login;
			svc.getHostInfo           = getHostInfo;
			svc.updateHostInformation = updateHostInformation
			svc.dayClubList           = TablesTonightService.dayClubList;
			svc.nightClubList         = TablesTonightService.nightClubList;

			return svc;

			function login(credentials) {
				return $http.post('http://localhost:1337/host/login', credentials)
					.then(function(response) {
						if (!response.data.error) {
							hostInfo = response.data;
						}
						return response.data;
					});
			}

			function getHostInfo() {
				return hostInfo;
			}

			function updateHostInformation() {
				return $http.post('http://localhost:1337/host/update', hostInfo)
					.then(function(response) {
						if (!response.data.error) {
							hostInfo = response.data;
						}
						return response.data;
					});
			}
		});
})();

(function() {
	angular
		.module('tablesTonight.host-detail.controller', [])
		.controller('HostDetailCtrl', HostDetailCtrl);

	function HostDetailCtrl($scope, HostsService, $stateParams) {
	  $scope.$on("$ionicView.beforeEnter", function() {
	    $scope.host = HostsService.getHost();
	  });
	}
})();

angular
	.module('tablesTonight.host-detail', [
		'tablesTonight.host-detail.controller'
	]);

(function() {
	angular
		.module('tablesTonight.hosts.controller', [])
		.controller('HostsCtrl', HostsCtrl);

	function HostsCtrl($scope, $stateParams, HostsService) {
	  $scope.$on("$ionicView.beforeEnter", function(HostDetailCtrl) {
			var name = $stateParams.name;
			var type = $stateParams.type;
			getHosts(name)
				.then(function(hosts) {
					$scope.hosts = hosts;
				});
	  });

		$scope.saveHost = saveHost;

		function saveHost(index) {
			HostsService.saveHost($scope.hosts[index]);
		}

		function getHosts(club) {
			if ($stateParams.type === 'day') {
				return HostsService.getDayClubHosts(club);
			}
			return HostsService.getNightClubHosts(club);
		}
	}
})();

(function() {
	angular
		.module('tablesTonight.hosts.data', [])
		.factory('HostsService', HostsService);

	function HostsService($http) {
		var svc = {};
		svc.getNightClubHosts = getNightClubHosts;
		svc.getDayClubHosts   = getDayClubHosts;
		svc.saveHost          = saveHost;
		svc.getHost           = getHost;
		return svc;

		function getNightClubHosts(nightclub) {
			return $http.get('http://localhost:1337/nightclub/'+nightclub)
				.then(function(response) {
					return response.data;
				});
		}

		function getDayClubHosts(dayclub) {
			return $http.get('http://localhost:1337/dayclub/'+dayclub)
				.then(function(response) {
					return response.data;
				});
		}

		function saveHost(host) {
			currentHost = host;
		}

		function getHost() {
			return currentHost;
		}
	}
})();

angular
	.module('tablesTonight.hosts', [
		'tablesTonight.hosts.controller',
		'tablesTonight.hosts.data'
	]);

(function() {
	angular
		.module('tablesTonight.locations.controller', [])
		.controller('LocationsCtrl', LocationsCtrl);

	function LocationsCtrl($scope, TablesTonightService) {
		$scope.$on("$ionicView.beforeEnter", function() {
			if ($scope.type !== TablesTonightService.currentLocation()) {
				$scope.type = TablesTonightService.currentLocation();
				$scope.locations = TablesTonightService.nightClubList;
				$scope.title = 'Night Clubs';
				if ($scope.type === 'day') {
					$scope.locations = TablesTonightService.dayClubList;
					$scope.title = 'Day Clubs';
				}
			}
		});
	}
})();

angular
	.module('tablesTonight.locations', [
		'tablesTonight.locations.controller',
	]);

(function() {
	angular
		.module('tablesTonight.menu-tabs.controller', [])
		.controller('MenuTabsCtrl', MenuTabsCtrl);

	function MenuTabsCtrl($scope) {
	  $scope.$on('hide', function() {
	    $scope.hiding = true;
	  });

	  $scope.$on('show', function() {
	    $scope.hiding = false;
	  });
	}
})();

angular
	.module('tablesTonight.menu-tabs', [
		'tablesTonight.menu-tabs.controller'
	]);

(function() {
	angular
		.module('app.home.update-information.steps', [])
		.directive('updateInformationSteps', function(HostService) {
			var directive = {
					scope: {
						step: '=',
						close: '='
					},
					restrict: 'AE',
					link: link,
					templateUrl: './app/home/update-information/update-information.html'
			};

			return directive;

			///////////////////////////////////////////////////////////////////////////

			function link(scope, element, attrs) {
				scope.step = 'step1';
				scope.next = next;
				scope.finish = finish;

				function next() {
					scope.step = 'step2';
				}

				function finish() {
					HostService.updateHostInformation()
						.then(function(host) {
							if (!host.error) {
								scope.close();
							}
						});
				}
			}

		});
})();

angular
	.module('app.home.update-information', [
		'app.home.update-information.steps',
		'app.home.update-information.step1',
		'app.home.update-information.step2'
	]);

(function() {
	angular
		.module('app.home.update-information.step1', [])
		.directive('updateInformationStepOne', function(HostService) {
			var directive = {
					scope: {
						step: '=',
						next: '='
					},
					restrict: 'AE',
					link: link,
					templateUrl: './app/home/update-information/step1/step1.html'
			};

			return directive;

			///////////////////////////////////////////////////////////////////////////

			function link(scope, element, attrs) {
				scope.host = HostService.getHostInfo();
				scope.nightClubList = HostService.nightClubList;
				scope.getPicture = function() {
					navigator.camera.getPicture(function(imageURI) {

				    // imageURI is the URL of the image that we can use for
				    // an <img> element or backgroundImage.

				  }, function(err) {

				    // Ruh-roh, something bad happened

				  }, cameraOptions);
				};
			}

		});
})();

(function() {
	angular
		.module('app.home.update-information.step2', [])
		.directive('updateInformationStepTwo', function(HostService) {
			var directive = {
					scope: {
						step: '=',
						finish: '='
					},
					restrict: 'AE',
					link: link,
					templateUrl: './app/home/update-information/step2/step2.html'
			};

			return directive;

			///////////////////////////////////////////////////////////////////////////

			function link(scope, element, attrs) {
				scope.host = HostService.getHostInfo();
				scope.dayClubList = HostService.dayClubList;
			}

		});
})();

(function() {
	angular
		.module('app.data', [])
		.factory('TablesTonightService', TablesTonightService);

	function TablesTonightService() {

		var svc = {};
		var location = null;

		svc.currentLocation = currentLocation;
		svc.saveLocation = saveLocation;
		svc.dayClubList   = dayClubList();
		svc.nightClubList = nightClubList();

		return svc;

		function currentLocation() {
			return location;
		}

		function saveLocation(newLocation) {
			location = newLocation;
		}

		function dayClubList() {
			return [
				'Azure',
				'Bare',
				'Daylight',
				'Delano Beach Club',
				'Drais Beach Club',
				'Encore Beach Club',
				'Foxtail Beach Club',
				'Lavo Brunch',
				'Liquid Pool',
				'Marquee Day Club',
				'Moorea',
				'Palms Pool Day Club',
				'Rehab Beach Club',
				'TAO Beach Club',
				'Wet Republic'
			]
		}

		function nightClubList() {

			return [
				'1OAK',
				'Chateau',
				'Embassy',
				'Foundation Room',
				'Foxtail',
				'Hakkasan',
				'Hyde',
				'Lavo',
				'LAX',
				'Light',
				'Marquee',
				'Omnia',
				'Sayers Club',
				'Surrender',
				'Tao',
				'The Bank',
				'XS'
			];
		}
	}
})();

angular
	.module('tablesTonight', [
		'tablesTonight.routes',
		'tablesTonight.menu-tabs',
		'tablesTonight.home',
		'tablesTonight.locations',
		'tablesTonight.hosts',
		'tablesTonight.host-detail',
		'app.data'
	]);

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
	    url: '/:type/:name',
			templateUrl: 'app/hosts/hosts.html',
			controller: 'HostsCtrl'
	  })
	  .state('host-detail', {
	    url: '/host',
			templateUrl: 'app/host-detail/host-detail.html',
			controller: 'HostDetailCtrl'
	  });
	  $urlRouterProvider.otherwise('/home');
	}
})();

(function() {
	angular
		.module('tablesTonight.home.controller', [])
		.controller('HomeCtrl', HomeCtrl);

	function HomeCtrl($scope, $ionicModal, $state, HostService, TablesTonightService) {

		$scope.credentials       = {};
		$scope.updateInformation = false;
		$scope.login             = login;
		$scope.navigate          = navigate;
		$scope.openModal         = openModal;
		$scope.closeModal        = closeModal;
		init();

		///////////////////////////////////////////////////////////////////////////

		function login() {
			HostService.login($scope.credentials)
				.then(function(host) {
					if (!host.error) {
						$scope.updateInformation = 'step1';
					}
				});
			// closeModal();
		}

		function navigate(location) {
			TablesTonightService.saveLocation(location);
			$state.go('locations');
		}

		function openModal() {
			$scope.modal.show();
	  }

		function closeModal() {
			if (HostService.getHostInfo()) {
				$scope.updateInformation = 'step1';
			}
	    $scope.modal.remove();
			delete $scope.modal;
			init();
	  }

		function init() {
			$ionicModal.fromTemplateUrl('app/home/my-modal.html', {
		    scope: $scope,
		    animation: 'slide-in-up'
		  }).then(function(modal) {
		    $scope.modal = modal;
		  });

			configureListeners();

			function configureListeners() {
				$scope.$on('$destroy', function() {
			    $scope.modal.remove();
			  });
			  // Execute action on hide modal
			  $scope.$on('modal.hidden', function() {
			    // Execute action
			  });
			  // Execute action on remove modal
			  $scope.$on('modal.removed', function() {
			    // Execute action
			  });
			}
		}
	}
})();

angular
	.module('tablesTonight.home', [
		'tablesTonight.home.controller',
		'app.home.host',
		'app.home.update-information'
	]);

(function() {
	angular
		.module('app.home.host', [])
		.factory('HostService', function($http, TablesTonightService) {

			var svc                   = {};

			var hostInfo              = null;
			svc.login                 = login;
			svc.getHostInfo           = getHostInfo;
			svc.updateHostInformation = updateHostInformation
			svc.dayClubList           = TablesTonightService.dayClubList;
			svc.nightClubList         = TablesTonightService.nightClubList;

			return svc;

			function login(credentials) {
				return $http.post('http://localhost:1337/host/login', credentials)
					.then(function(response) {
						if (!response.data.error) {
							hostInfo = response.data;
						}
						return response.data;
					});
			}

			function getHostInfo() {
				return hostInfo;
			}

			function updateHostInformation() {
				return $http.post('http://localhost:1337/host/update', hostInfo)
					.then(function(response) {
						if (!response.data.error) {
							hostInfo = response.data;
						}
						return response.data;
					});
			}
		});
})();

(function() {
	angular
		.module('tablesTonight.host-detail.controller', [])
		.controller('HostDetailCtrl', HostDetailCtrl);

	function HostDetailCtrl($scope, HostsService, $stateParams) {
	  $scope.$on("$ionicView.beforeEnter", function() {
	    $scope.host = HostsService.getHost();
	  });
	}
})();

angular
	.module('tablesTonight.host-detail', [
		'tablesTonight.host-detail.controller'
	]);

(function() {
	angular
		.module('tablesTonight.hosts.controller', [])
		.controller('HostsCtrl', HostsCtrl);

	function HostsCtrl($scope, $stateParams, HostsService) {
	  $scope.$on("$ionicView.beforeEnter", function(HostDetailCtrl) {
			var name = $stateParams.name;
			var type = $stateParams.type;
			getHosts(name)
				.then(function(hosts) {
					$scope.hosts = hosts;
				});
	  });

		$scope.saveHost = saveHost;

		function saveHost(index) {
			HostsService.saveHost($scope.hosts[index]);
		}

		function getHosts(club) {
			if ($stateParams.type === 'day') {
				return HostsService.getDayClubHosts(club);
			}
			return HostsService.getNightClubHosts(club);
		}
	}
})();

(function() {
	angular
		.module('tablesTonight.hosts.data', [])
		.factory('HostsService', HostsService);

	function HostsService($http) {
		var svc = {};
		svc.getNightClubHosts = getNightClubHosts;
		svc.getDayClubHosts   = getDayClubHosts;
		svc.saveHost          = saveHost;
		svc.getHost           = getHost;
		return svc;

		function getNightClubHosts(nightclub) {
			return $http.get('http://localhost:1337/nightclub/'+nightclub)
				.then(function(response) {
					return response.data;
				});
		}

		function getDayClubHosts(dayclub) {
			return $http.get('http://localhost:1337/dayclub/'+dayclub)
				.then(function(response) {
					return response.data;
				});
		}

		function saveHost(host) {
			currentHost = host;
		}

		function getHost() {
			return currentHost;
		}
	}
})();

angular
	.module('tablesTonight.hosts', [
		'tablesTonight.hosts.controller',
		'tablesTonight.hosts.data'
	]);

(function() {
	angular
		.module('tablesTonight.locations.controller', [])
		.controller('LocationsCtrl', LocationsCtrl);

	function LocationsCtrl($scope, TablesTonightService) {
		$scope.$on("$ionicView.beforeEnter", function() {
			if ($scope.type !== TablesTonightService.currentLocation()) {
				$scope.type = TablesTonightService.currentLocation();
				$scope.locations = TablesTonightService.nightClubList;
				$scope.title = 'Night Clubs';
				if ($scope.type === 'day') {
					$scope.locations = TablesTonightService.dayClubList;
					$scope.title = 'Day Clubs';
				}
			}
		});
	}
})();

angular
	.module('tablesTonight.locations', [
		'tablesTonight.locations.controller',
	]);

(function() {
	angular
		.module('tablesTonight.menu-tabs.controller', [])
		.controller('MenuTabsCtrl', MenuTabsCtrl);

	function MenuTabsCtrl($scope) {
	  $scope.$on('hide', function() {
	    $scope.hiding = true;
	  });

	  $scope.$on('show', function() {
	    $scope.hiding = false;
	  });
	}
})();

angular
	.module('tablesTonight.menu-tabs', [
		'tablesTonight.menu-tabs.controller'
	]);

(function() {
	angular
		.module('app.home.update-information.steps', [])
		.directive('updateInformationSteps', function(HostService) {
			var directive = {
					scope: {
						step: '=',
						close: '='
					},
					restrict: 'AE',
					link: link,
					templateUrl: './app/home/update-information/update-information.html'
			};

			return directive;

			///////////////////////////////////////////////////////////////////////////

			function link(scope, element, attrs) {
				scope.step = 'step1';
				scope.next = next;
				scope.finish = finish;

				function next() {
					scope.step = 'step2';
				}

				function finish() {
					HostService.updateHostInformation()
						.then(function(host) {
							if (!host.error) {
								scope.close();
							}
						});
				}
			}

		});
})();

angular
	.module('app.home.update-information', [
		'app.home.update-information.steps',
		'app.home.update-information.step1',
		'app.home.update-information.step2'
	]);

(function() {
	angular
		.module('app.home.update-information.step1', [])
		.directive('updateInformationStepOne', function(HostService) {
			var directive = {
					scope: {
						step: '=',
						next: '='
					},
					restrict: 'AE',
					link: link,
					templateUrl: './app/home/update-information/step1/step1.html'
			};

			return directive;

			///////////////////////////////////////////////////////////////////////////

			function link(scope, element, attrs) {
				scope.host = HostService.getHostInfo();
				scope.nightClubList = HostService.nightClubList;
				scope.getPicture = function() {
					debugger;
					navigator.camera.getPicture(function(imageURI) {

				    // imageURI is the URL of the image that we can use for
				    // an <img> element or backgroundImage.

				  }, function(err) {

				    // Ruh-roh, something bad happened

				  }, cameraOptions);
				};
			}

		});
})();

(function() {
	angular
		.module('app.home.update-information.step2', [])
		.directive('updateInformationStepTwo', function(HostService) {
			var directive = {
					scope: {
						step: '=',
						finish: '='
					},
					restrict: 'AE',
					link: link,
					templateUrl: './app/home/update-information/step2/step2.html'
			};

			return directive;

			///////////////////////////////////////////////////////////////////////////

			function link(scope, element, attrs) {
				scope.host = HostService.getHostInfo();
				scope.dayClubList = HostService.dayClubList;
			}

		});
})();

(function() {
	angular
		.module('app.data', [])
		.factory('TablesTonightService', TablesTonightService);

	function TablesTonightService() {

		var svc = {};
		var location = null;

		svc.currentLocation = currentLocation;
		svc.saveLocation = saveLocation;
		svc.dayClubList   = dayClubList();
		svc.nightClubList = nightClubList();

		return svc;

		function currentLocation() {
			return location;
		}

		function saveLocation(newLocation) {
			location = newLocation;
		}

		function dayClubList() {
			return [
				'Azure',
				'Bare',
				'Daylight',
				'Delano Beach Club',
				'Drais Beach Club',
				'Encore Beach Club',
				'Foxtail Beach Club',
				'Lavo Brunch',
				'Liquid Pool',
				'Marquee Day Club',
				'Moorea',
				'Palms Pool Day Club',
				'Rehab Beach Club',
				'TAO Beach Club',
				'Wet Republic'
			]
		}

		function nightClubList() {

			return [
				'1OAK',
				'Chateau',
				'Embassy',
				'Foundation Room',
				'Foxtail',
				'Hakkasan',
				'Hyde',
				'Lavo',
				'LAX',
				'Light',
				'Marquee',
				'Omnia',
				'Sayers Club',
				'Surrender',
				'Tao',
				'The Bank',
				'XS'
			];
		}
	}
})();

angular
	.module('tablesTonight', [
		'tablesTonight.routes',
		'tablesTonight.menu-tabs',
		'tablesTonight.home',
		'tablesTonight.locations',
		'tablesTonight.hosts',
		'tablesTonight.host-detail',
		'app.data'
	]);

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
	    url: '/:type/:name',
			templateUrl: 'app/hosts/hosts.html',
			controller: 'HostsCtrl'
	  })
	  .state('host-detail', {
	    url: '/host',
			templateUrl: 'app/host-detail/host-detail.html',
			controller: 'HostDetailCtrl'
	  });
	  $urlRouterProvider.otherwise('/home');
	}
})();

(function() {
	angular
		.module('tablesTonight.home.controller', [])
		.controller('HomeCtrl', HomeCtrl);

	function HomeCtrl($scope, $ionicModal, $state, HostService, TablesTonightService) {

		$scope.credentials       = {};
		$scope.updateInformation = false;
		$scope.login             = login;
		$scope.navigate          = navigate;
		$scope.openModal         = openModal;
		$scope.closeModal        = closeModal;
		init();

		///////////////////////////////////////////////////////////////////////////

		function login() {
			HostService.login($scope.credentials)
				.then(function(host) {
					if (!host.error) {
						$scope.updateInformation = 'step1';
					}
				});
			// closeModal();
		}

		function navigate(location) {
			TablesTonightService.saveLocation(location);
			$state.go('locations');
		}

		function openModal() {
			$scope.modal.show();
	  }

		function closeModal() {
			if (HostService.getHostInfo()) {
				$scope.updateInformation = 'step1';
			}
	    $scope.modal.remove();
			delete $scope.modal;
			init();
	  }

		function init() {
			$ionicModal.fromTemplateUrl('app/home/my-modal.html', {
		    scope: $scope,
		    animation: 'slide-in-up'
		  }).then(function(modal) {
		    $scope.modal = modal;
		  });

			configureListeners();

			function configureListeners() {
				$scope.$on('$destroy', function() {
			    $scope.modal.remove();
			  });
			  // Execute action on hide modal
			  $scope.$on('modal.hidden', function() {
			    // Execute action
			  });
			  // Execute action on remove modal
			  $scope.$on('modal.removed', function() {
			    // Execute action
			  });
			}
		}
	}
})();

angular
	.module('tablesTonight.home', [
		'tablesTonight.home.controller',
		'app.home.host',
		'app.home.update-information'
	]);

(function() {
	angular
		.module('app.home.host', [])
		.factory('HostService', function($http, TablesTonightService) {

			var svc                   = {};

			var hostInfo              = null;
			svc.login                 = login;
			svc.getHostInfo           = getHostInfo;
			svc.updateHostInformation = updateHostInformation
			svc.dayClubList           = TablesTonightService.dayClubList;
			svc.nightClubList         = TablesTonightService.nightClubList;

			return svc;

			function login(credentials) {
				return $http.post('http://localhost:1337/host/login', credentials)
					.then(function(response) {
						if (!response.data.error) {
							hostInfo = response.data;
						}
						return response.data;
					});
			}

			function getHostInfo() {
				return hostInfo;
			}

			function updateHostInformation() {
				return $http.post('http://localhost:1337/host/update', hostInfo)
					.then(function(response) {
						if (!response.data.error) {
							hostInfo = response.data;
						}
						return response.data;
					});
			}
		});
})();

(function() {
	angular
		.module('tablesTonight.host-detail.controller', [])
		.controller('HostDetailCtrl', HostDetailCtrl);

	function HostDetailCtrl($scope, HostsService, $stateParams) {
	  $scope.$on("$ionicView.beforeEnter", function() {
	    $scope.host = HostsService.getHost();
	  });
	}
})();

angular
	.module('tablesTonight.host-detail', [
		'tablesTonight.host-detail.controller'
	]);

(function() {
	angular
		.module('tablesTonight.hosts.controller', [])
		.controller('HostsCtrl', HostsCtrl);

	function HostsCtrl($scope, $stateParams, HostsService) {
	  $scope.$on("$ionicView.beforeEnter", function(HostDetailCtrl) {
			var name = $stateParams.name;
			var type = $stateParams.type;
			getHosts(name)
				.then(function(hosts) {
					$scope.hosts = hosts;
				});
	  });

		$scope.saveHost = saveHost;

		function saveHost(index) {
			HostsService.saveHost($scope.hosts[index]);
		}

		function getHosts(club) {
			if ($stateParams.type === 'day') {
				return HostsService.getDayClubHosts(club);
			}
			return HostsService.getNightClubHosts(club);
		}
	}
})();

(function() {
	angular
		.module('tablesTonight.hosts.data', [])
		.factory('HostsService', HostsService);

	function HostsService($http) {
		var svc = {};
		svc.getNightClubHosts = getNightClubHosts;
		svc.getDayClubHosts   = getDayClubHosts;
		svc.saveHost          = saveHost;
		svc.getHost           = getHost;
		return svc;

		function getNightClubHosts(nightclub) {
			return $http.get('http://localhost:1337/nightclub/'+nightclub)
				.then(function(response) {
					return response.data;
				});
		}

		function getDayClubHosts(dayclub) {
			return $http.get('http://localhost:1337/dayclub/'+dayclub)
				.then(function(response) {
					return response.data;
				});
		}

		function saveHost(host) {
			currentHost = host;
		}

		function getHost() {
			return currentHost;
		}
	}
})();

angular
	.module('tablesTonight.hosts', [
		'tablesTonight.hosts.controller',
		'tablesTonight.hosts.data'
	]);

(function() {
	angular
		.module('tablesTonight.locations.controller', [])
		.controller('LocationsCtrl', LocationsCtrl);

	function LocationsCtrl($scope, TablesTonightService) {
		$scope.$on("$ionicView.beforeEnter", function() {
			if ($scope.type !== TablesTonightService.currentLocation()) {
				$scope.type = TablesTonightService.currentLocation();
				$scope.locations = TablesTonightService.nightClubList;
				$scope.title = 'Night Clubs';
				if ($scope.type === 'day') {
					$scope.locations = TablesTonightService.dayClubList;
					$scope.title = 'Day Clubs';
				}
			}
		});
	}
})();

angular
	.module('tablesTonight.locations', [
		'tablesTonight.locations.controller',
	]);

(function() {
	angular
		.module('tablesTonight.menu-tabs.controller', [])
		.controller('MenuTabsCtrl', MenuTabsCtrl);

	function MenuTabsCtrl($scope) {
	  $scope.$on('hide', function() {
	    $scope.hiding = true;
	  });

	  $scope.$on('show', function() {
	    $scope.hiding = false;
	  });
	}
})();

angular
	.module('tablesTonight.menu-tabs', [
		'tablesTonight.menu-tabs.controller'
	]);

(function() {
	angular
		.module('app.home.update-information.steps', [])
		.directive('updateInformationSteps', function(HostService) {
			var directive = {
					scope: {
						step: '=',
						close: '='
					},
					restrict: 'AE',
					link: link,
					templateUrl: './app/home/update-information/update-information.html'
			};

			return directive;

			///////////////////////////////////////////////////////////////////////////

			function link(scope, element, attrs) {
				scope.step = 'step1';
				scope.next = next;
				scope.finish = finish;

				function next() {
					scope.step = 'step2';
				}

				function finish() {
					HostService.updateHostInformation()
						.then(function(host) {
							if (!host.error) {
								scope.close();
							}
						});
				}
			}

		});
})();

angular
	.module('app.home.update-information', [
		'app.home.update-information.steps',
		'app.home.update-information.step1',
		'app.home.update-information.step2'
	]);

(function() {
	angular
		.module('app.home.update-information.step1', [])
		.directive('updateInformationStepOne', function(HostService) {
			var directive = {
					scope: {
						step: '=',
						next: '='
					},
					restrict: 'AE',
					link: link,
					templateUrl: './app/home/update-information/step1/step1.html'
			};

			return directive;

			///////////////////////////////////////////////////////////////////////////

			function link(scope, element, attrs) {
				scope.host = HostService.getHostInfo();
				scope.nightClubList = HostService.nightClubList;
				scope.getPicture = function() {
					debugger;
					navigator.camera.getPicture(function(imageURI) {

				    // imageURI is the URL of the image that we can use for
				    // an <img> element or backgroundImage.

				  }, function(err) {

				    // Ruh-roh, something bad happened

				  }, cameraOptions);
				};
			}

		});
})();

(function() {
	angular
		.module('app.home.update-information.step2', [])
		.directive('updateInformationStepTwo', function(HostService) {
			var directive = {
					scope: {
						step: '=',
						finish: '='
					},
					restrict: 'AE',
					link: link,
					templateUrl: './app/home/update-information/step2/step2.html'
			};

			return directive;

			///////////////////////////////////////////////////////////////////////////

			function link(scope, element, attrs) {
				scope.host = HostService.getHostInfo();
				scope.dayClubList = HostService.dayClubList;
			}

		});
})();

(function() {
	angular
		.module('app.data', [])
		.factory('TablesTonightService', TablesTonightService);

	function TablesTonightService() {

		var svc = {};
		var location = null;

		svc.currentLocation = currentLocation;
		svc.saveLocation = saveLocation;
		svc.dayClubList   = dayClubList();
		svc.nightClubList = nightClubList();

		return svc;

		function currentLocation() {
			return location;
		}

		function saveLocation(newLocation) {
			location = newLocation;
		}

		function dayClubList() {
			return [
				'Azure',
				'Bare',
				'Daylight',
				'Delano Beach Club',
				'Drais Beach Club',
				'Encore Beach Club',
				'Foxtail Beach Club',
				'Lavo Brunch',
				'Liquid Pool',
				'Marquee Day Club',
				'Moorea',
				'Palms Pool Day Club',
				'Rehab Beach Club',
				'TAO Beach Club',
				'Wet Republic'
			]
		}

		function nightClubList() {

			return [
				'1OAK',
				'Chateau',
				'Embassy',
				'Foundation Room',
				'Foxtail',
				'Hakkasan',
				'Hyde',
				'Lavo',
				'LAX',
				'Light',
				'Marquee',
				'Omnia',
				'Sayers Club',
				'Surrender',
				'Tao',
				'The Bank',
				'XS'
			];
		}
	}
})();

angular
	.module('tablesTonight', [
		'tablesTonight.routes',
		'tablesTonight.home',
		'tablesTonight.locations',
		'tablesTonight.hosts',
		'tablesTonight.host-detail',
		'app.data'
	]);

(function() {
	angular
		.module('tablesTonight.routes', ['ionic', 'ngCordova'])
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
	    url: '/:type/:name',
			templateUrl: 'app/hosts/hosts.html',
			controller: 'HostsCtrl'
	  })
	  .state('host-detail', {
	    url: '/host',
			templateUrl: 'app/host-detail/host-detail.html',
			controller: 'HostDetailCtrl'
	  });
	  $urlRouterProvider.otherwise('/home');
	}
})();

(function() {
	angular
		.module('tablesTonight.home.controller', [])
		.controller('HomeCtrl', HomeCtrl);

	function HomeCtrl($scope, $ionicModal, $state, HostService, TablesTonightService) {

		$scope.credentials       = {};
		$scope.updateInformation = false;
		$scope.login             = login;
		$scope.navigate          = navigate;
		$scope.openModal         = openModal;
		$scope.closeModal        = closeModal;
		init();

		///////////////////////////////////////////////////////////////////////////

		function login() {
			HostService.login($scope.credentials)
				.then(function(host) {
					if (!host.error) {
						$scope.updateInformation = 'step1';
					}
				});
			// closeModal();
		}

		function navigate(location) {
			TablesTonightService.saveLocation(location);
			$state.go('locations');
		}

		function openModal() {
			$scope.modal.show();
	  }

		function closeModal() {
			if (HostService.getHostInfo()) {
				$scope.updateInformation = 'step1';
			}
	    $scope.modal.remove();
			delete $scope.modal;
			init();
	  }

		function init() {
			$ionicModal.fromTemplateUrl('app/home/my-modal.html', {
		    scope: $scope,
		    animation: 'slide-in-up'
		  }).then(function(modal) {
		    $scope.modal = modal;
		  });

			configureListeners();

			function configureListeners() {
				$scope.$on('$destroy', function() {
			    $scope.modal.remove();
			  });
			  // Execute action on hide modal
			  $scope.$on('modal.hidden', function() {
			    // Execute action
			  });
			  // Execute action on remove modal
			  $scope.$on('modal.removed', function() {
			    // Execute action
			  });
			}
		}
	}
})();

angular
	.module('tablesTonight.home', [
		'tablesTonight.home.controller',
		'app.home.host',
		'app.home.update-information'
	]);

(function() {
	angular
		.module('app.home.host', [])
		.factory('HostService', function($http, TablesTonightService) {

			var svc                   = {};

			var hostInfo              = null;
			svc.login                 = login;
			svc.getHostInfo           = getHostInfo;
			svc.updateHostInformation = updateHostInformation
			svc.dayClubList           = TablesTonightService.dayClubList;
			svc.nightClubList         = TablesTonightService.nightClubList;

			return svc;

			function login(credentials) {
				return $http.post('http://localhost:1337/host/login', credentials)
					.then(function(response) {
						if (!response.data.error) {
							hostInfo = response.data;
						}
						return response.data;
					});
			}

			function getHostInfo() {
				return hostInfo;
			}

			function updateHostInformation() {
				return $http.post('http://localhost:1337/host/update', hostInfo)
					.then(function(response) {
						if (!response.data.error) {
							hostInfo = response.data;
						}
						return response.data;
					});
			}
		});
})();

(function() {
	angular
		.module('tablesTonight.host-detail.controller', [])
		.controller('HostDetailCtrl', HostDetailCtrl);

	function HostDetailCtrl($scope, HostsService, $stateParams) {
	  $scope.$on("$ionicView.beforeEnter", function() {
	    $scope.host = HostsService.getHost();
	  });
	}
})();

angular
	.module('tablesTonight.host-detail', [
		'tablesTonight.host-detail.controller'
	]);

(function() {
	angular
		.module('tablesTonight.hosts.controller', [])
		.controller('HostsCtrl', HostsCtrl);

	function HostsCtrl($scope, $stateParams, HostsService) {
	  $scope.$on("$ionicView.beforeEnter", function(HostDetailCtrl) {
			var name = $stateParams.name;
			var type = $stateParams.type;
			getHosts(name)
				.then(function(hosts) {
					$scope.hosts = hosts;
				});
	  });

		$scope.saveHost = saveHost;

		function saveHost(index) {
			HostsService.saveHost($scope.hosts[index]);
		}

		function getHosts(club) {
			if ($stateParams.type === 'day') {
				return HostsService.getDayClubHosts(club);
			}
			return HostsService.getNightClubHosts(club);
		}
	}
})();

(function() {
	angular
		.module('tablesTonight.hosts.data', [])
		.factory('HostsService', HostsService);

	function HostsService($http) {
		var svc = {};
		svc.getNightClubHosts = getNightClubHosts;
		svc.getDayClubHosts   = getDayClubHosts;
		svc.saveHost          = saveHost;
		svc.getHost           = getHost;
		return svc;

		function getNightClubHosts(nightclub) {
			return $http.get('http://localhost:1337/nightclub/'+nightclub)
				.then(function(response) {
					return response.data;
				});
		}

		function getDayClubHosts(dayclub) {
			return $http.get('http://localhost:1337/dayclub/'+dayclub)
				.then(function(response) {
					return response.data;
				});
		}

		function saveHost(host) {
			currentHost = host;
		}

		function getHost() {
			return currentHost;
		}
	}
})();

angular
	.module('tablesTonight.hosts', [
		'tablesTonight.hosts.controller',
		'tablesTonight.hosts.data'
	]);

(function() {
	angular
		.module('tablesTonight.locations.controller', [])
		.controller('LocationsCtrl', LocationsCtrl);

	function LocationsCtrl($scope, TablesTonightService) {
		$scope.$on("$ionicView.beforeEnter", function() {
			if ($scope.type !== TablesTonightService.currentLocation()) {
				$scope.type = TablesTonightService.currentLocation();
				$scope.locations = TablesTonightService.nightClubList;
				$scope.title = 'Night Clubs';
				if ($scope.type === 'day') {
					$scope.locations = TablesTonightService.dayClubList;
					$scope.title = 'Day Clubs';
				}
			}
		});
	}
})();

angular
	.module('tablesTonight.locations', [
		'tablesTonight.locations.controller',
	]);

(function() {
	angular
		.module('tablesTonight.menu-tabs.controller', [])
		.controller('MenuTabsCtrl', MenuTabsCtrl);

	function MenuTabsCtrl($scope) {
	  $scope.$on('hide', function() {
	    $scope.hiding = true;
	  });

	  $scope.$on('show', function() {
	    $scope.hiding = false;
	  });
	}
})();

angular
	.module('tablesTonight.menu-tabs', [
		'tablesTonight.menu-tabs.controller'
	]);

(function() {
	angular
		.module('app.home.update-information.steps', [])
		.directive('updateInformationSteps', function(HostService) {
			var directive = {
					scope: {
						step: '=',
						close: '='
					},
					restrict: 'AE',
					link: link,
					templateUrl: './app/home/update-information/update-information.html'
			};

			return directive;

			///////////////////////////////////////////////////////////////////////////

			function link(scope, element, attrs) {
				scope.step = 'step1';
				scope.next = next;
				scope.finish = finish;

				function next() {
					scope.step = 'step2';
				}

				function finish() {
					HostService.updateHostInformation()
						.then(function(host) {
							if (!host.error) {
								scope.close();
							}
						});
				}
			}

		});
})();

angular
	.module('app.home.update-information', [
		'app.home.update-information.steps',
		'app.home.update-information.step1',
		'app.home.update-information.step2'
	]);

(function() {
	angular
		.module('app.home.update-information.step1', [])
		.directive('updateInformationStepOne', function(HostService) {
			var directive = {
					scope: {
						step: '=',
						next: '='
					},
					restrict: 'AE',
					link: link,
					templateUrl: './app/home/update-information/step1/step1.html'
			};

			return directive;

			///////////////////////////////////////////////////////////////////////////

			function link(scope, element, attrs) {
				scope.host = HostService.getHostInfo();
				scope.nightClubList = HostService.nightClubList;
				scope.getPicture = function() {
					// navigator.camera.getPicture(function(imageURI) {
					//
				  //   // imageURI is the URL of the image that we can use for
				  //   // an <img> element or backgroundImage.
					//
				  // }, function(err) {
					//
				  //   // Ruh-roh, something bad happened
					//
				  // }, cameraOptions);
				};
			}

		});
})();

(function() {
	angular
		.module('app.home.update-information.step2', [])
		.directive('updateInformationStepTwo', function(HostService) {
			var directive = {
					scope: {
						step: '=',
						finish: '='
					},
					restrict: 'AE',
					link: link,
					templateUrl: './app/home/update-information/step2/step2.html'
			};

			return directive;

			///////////////////////////////////////////////////////////////////////////

			function link(scope, element, attrs) {
				scope.host = HostService.getHostInfo();
				scope.dayClubList = HostService.dayClubList;
			}

		});
})();

(function() {
	angular
		.module('app.data', [])
		.factory('TablesTonightService', TablesTonightService);

	function TablesTonightService() {

		var svc = {};
		var location = null;

		svc.currentLocation = currentLocation;
		svc.saveLocation = saveLocation;
		svc.dayClubList   = dayClubList();
		svc.nightClubList = nightClubList();

		return svc;

		function currentLocation() {
			return location;
		}

		function saveLocation(newLocation) {
			location = newLocation;
		}

		function dayClubList() {
			return [
				'Azure',
				'Bare',
				'Daylight',
				'Delano Beach Club',
				'Drais Beach Club',
				'Encore Beach Club',
				'Foxtail Beach Club',
				'Lavo Brunch',
				'Liquid Pool',
				'Marquee Day Club',
				'Moorea',
				'Palms Pool Day Club',
				'Rehab Beach Club',
				'TAO Beach Club',
				'Wet Republic'
			]
		}

		function nightClubList() {

			return [
				'1OAK',
				'Chateau',
				'Embassy',
				'Foundation Room',
				'Foxtail',
				'Hakkasan',
				'Hyde',
				'Lavo',
				'LAX',
				'Light',
				'Marquee',
				'Omnia',
				'Sayers Club',
				'Surrender',
				'Tao',
				'The Bank',
				'XS'
			];
		}
	}
})();

angular
	.module('tablesTonight', [
		'tablesTonight.routes',
		'tablesTonight.home',
		'tablesTonight.locations',
		'tablesTonight.hosts',
		'tablesTonight.host-detail',
		'app.data'
	]);

(function() {
	angular
		.module('tablesTonight.routes', ['ionic', 'ngCordova'])
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
	    url: '/:type/:name',
			templateUrl: 'app/hosts/hosts.html',
			controller: 'HostsCtrl'
	  })
	  .state('host-detail', {
	    url: '/host',
			templateUrl: 'app/host-detail/host-detail.html',
			controller: 'HostDetailCtrl'
	  });
	  $urlRouterProvider.otherwise('/home');
	}
})();

(function() {
	angular
		.module('tablesTonight.home.controller', [])
		.controller('HomeCtrl', HomeCtrl);

	function HomeCtrl($scope, $ionicModal, $state, HostService, TablesTonightService) {

		$scope.credentials       = {};
		$scope.updateInformation = false;
		$scope.login             = login;
		$scope.navigate          = navigate;
		$scope.openModal         = openModal;
		$scope.closeModal        = closeModal;
		init();

		///////////////////////////////////////////////////////////////////////////

		function login() {
			HostService.login($scope.credentials)
				.then(function(host) {
					if (!host.error) {
						$scope.updateInformation = 'step1';
					}
				});
			// closeModal();
		}

		function navigate(location) {
			TablesTonightService.saveLocation(location);
			$state.go('locations');
		}

		function openModal() {
			$scope.modal.show();
	  }

		function closeModal() {
			if (HostService.getHostInfo()) {
				$scope.updateInformation = 'step1';
			}
	    $scope.modal.remove();
			delete $scope.modal;
			init();
	  }

		function init() {
			$ionicModal.fromTemplateUrl('app/home/my-modal.html', {
		    scope: $scope,
		    animation: 'slide-in-up'
		  }).then(function(modal) {
		    $scope.modal = modal;
		  });

			configureListeners();

			function configureListeners() {
				$scope.$on('$destroy', function() {
			    $scope.modal.remove();
			  });
			  // Execute action on hide modal
			  $scope.$on('modal.hidden', function() {
			    // Execute action
			  });
			  // Execute action on remove modal
			  $scope.$on('modal.removed', function() {
			    // Execute action
			  });
			}
		}
	}
})();

angular
	.module('tablesTonight.home', [
		'tablesTonight.home.controller',
		'app.home.host',
		'app.home.update-information'
	]);

(function() {
	angular
		.module('app.home.host', [])
		.factory('HostService', function($http, TablesTonightService) {

			var svc                   = {};

			var hostInfo              = null;
			svc.login                 = login;
			svc.getHostInfo           = getHostInfo;
			svc.updateHostInformation = updateHostInformation
			svc.dayClubList           = TablesTonightService.dayClubList;
			svc.nightClubList         = TablesTonightService.nightClubList;

			return svc;

			function login(credentials) {
				return $http.post('http://localhost:1337/host/login', credentials)
					.then(function(response) {
						if (!response.data.error) {
							hostInfo = response.data;
						}
						return response.data;
					});
			}

			function getHostInfo() {
				return hostInfo;
			}

			function updateHostInformation() {
				return $http.post('http://localhost:1337/host/update', hostInfo)
					.then(function(response) {
						if (!response.data.error) {
							hostInfo = response.data;
						}
						return response.data;
					});
			}
		});
})();

(function() {
	angular
		.module('tablesTonight.host-detail.controller', [])
		.controller('HostDetailCtrl', HostDetailCtrl);

	function HostDetailCtrl($scope, HostsService, $stateParams) {
	  $scope.$on("$ionicView.beforeEnter", function() {
	    $scope.host = HostsService.getHost();
	  });
	}
})();

angular
	.module('tablesTonight.host-detail', [
		'tablesTonight.host-detail.controller'
	]);

(function() {
	angular
		.module('tablesTonight.hosts.controller', [])
		.controller('HostsCtrl', HostsCtrl);

	function HostsCtrl($scope, $stateParams, HostsService) {
	  $scope.$on("$ionicView.beforeEnter", function(HostDetailCtrl) {
			var name = $stateParams.name;
			var type = $stateParams.type;
			getHosts(name)
				.then(function(hosts) {
					$scope.hosts = hosts;
				});
	  });

		$scope.saveHost = saveHost;

		function saveHost(index) {
			HostsService.saveHost($scope.hosts[index]);
		}

		function getHosts(club) {
			if ($stateParams.type === 'day') {
				return HostsService.getDayClubHosts(club);
			}
			return HostsService.getNightClubHosts(club);
		}
	}
})();

(function() {
	angular
		.module('tablesTonight.hosts.data', [])
		.factory('HostsService', HostsService);

	function HostsService($http) {
		var svc = {};
		svc.getNightClubHosts = getNightClubHosts;
		svc.getDayClubHosts   = getDayClubHosts;
		svc.saveHost          = saveHost;
		svc.getHost           = getHost;
		return svc;

		function getNightClubHosts(nightclub) {
			return $http.get('http://localhost:1337/nightclub/'+nightclub)
				.then(function(response) {
					return response.data;
				});
		}

		function getDayClubHosts(dayclub) {
			return $http.get('http://localhost:1337/dayclub/'+dayclub)
				.then(function(response) {
					return response.data;
				});
		}

		function saveHost(host) {
			currentHost = host;
		}

		function getHost() {
			return currentHost;
		}
	}
})();

angular
	.module('tablesTonight.hosts', [
		'tablesTonight.hosts.controller',
		'tablesTonight.hosts.data'
	]);

(function() {
	angular
		.module('tablesTonight.locations.controller', [])
		.controller('LocationsCtrl', LocationsCtrl);

	function LocationsCtrl($scope, TablesTonightService) {
		$scope.$on("$ionicView.beforeEnter", function() {
			if ($scope.type !== TablesTonightService.currentLocation()) {
				$scope.type = TablesTonightService.currentLocation();
				$scope.locations = TablesTonightService.nightClubList;
				$scope.title = 'Night Clubs';
				if ($scope.type === 'day') {
					$scope.locations = TablesTonightService.dayClubList;
					$scope.title = 'Day Clubs';
				}
			}
		});
	}
})();

angular
	.module('tablesTonight.locations', [
		'tablesTonight.locations.controller',
	]);

(function() {
	angular
		.module('app.home.update-information.steps', [])
		.directive('updateInformationSteps', function(HostService) {
			var directive = {
					scope: {
						step: '=',
						close: '='
					},
					restrict: 'AE',
					link: link,
					templateUrl: './app/home/update-information/update-information.html'
			};

			return directive;

			///////////////////////////////////////////////////////////////////////////

			function link(scope, element, attrs) {
				scope.step = 'step1';
				scope.next = next;
				scope.finish = finish;

				function next() {
					scope.step = 'step2';
				}

				function finish() {
					HostService.updateHostInformation()
						.then(function(host) {
							if (!host.error) {
								scope.close();
							}
						});
				}
			}

		});
})();

angular
	.module('app.home.update-information', [
		'app.home.update-information.steps',
		'app.home.update-information.step1',
		'app.home.update-information.step2'
	]);

(function() {
	angular
		.module('app.home.update-information.step1', [])
		.directive('updateInformationStepOne', function(HostService) {
			var directive = {
					scope: {
						step: '=',
						next: '='
					},
					restrict: 'AE',
					link: link,
					templateUrl: './app/home/update-information/step1/step1.html'
			};

			return directive;

			///////////////////////////////////////////////////////////////////////////

			function link(scope, element, attrs) {
				scope.host = HostService.getHostInfo();
				scope.nightClubList = HostService.nightClubList;
				scope.getPicture = function() {
					// navigator.camera.getPicture(function(imageURI) {
					//
				  //   // imageURI is the URL of the image that we can use for
				  //   // an <img> element or backgroundImage.
					//
				  // }, function(err) {
					//
				  //   // Ruh-roh, something bad happened
					//
				  // }, cameraOptions);
				};
			}

		});
})();

(function() {
	angular
		.module('app.home.update-information.step2', [])
		.directive('updateInformationStepTwo', function(HostService) {
			var directive = {
					scope: {
						step: '=',
						finish: '='
					},
					restrict: 'AE',
					link: link,
					templateUrl: './app/home/update-information/step2/step2.html'
			};

			return directive;

			///////////////////////////////////////////////////////////////////////////

			function link(scope, element, attrs) {
				scope.host = HostService.getHostInfo();
				scope.dayClubList = HostService.dayClubList;
			}

		});
})();
