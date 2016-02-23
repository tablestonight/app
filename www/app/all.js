angular
	.module('tablesTonight', [
		'tablesTonight.routes',
		'tablesTonight.menu-tabs',
		'tablesTonight.home',
		'tablesTonight.locations',
		'tablesTonight.hosts',
		'tablesTonight.host-detail'
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
	    // views: {
	    //   'home': {
	    //   }
	    // }
	  })
	  .state('tab.locations', {
	    url: '/locations',
	    views: {
	      'locations': {
	        templateUrl: 'app/locations/locations.html',
	        controller: 'LocationsCtrl'
	      }
	    }
	  })
	  .state('tab.hosts', {
	    url: '/hosts',
	    views: {
	      'locations': {
	        templateUrl: 'app/hosts/hosts.html',
	        controller: 'HostsCtrl'
	      }
	    }
	  })
	  .state('tab.host-detail', {
	    url: '/host/:hostId',
	    views: {
	      'locations': {
	        templateUrl: 'app/host-detail/host-detail.html',
	        controller: 'HostDetailCtrl'
	      }
	    }
	  });
	  $urlRouterProvider.otherwise('/home');
	}
})();

(function() {
	angular
		.module('tablesTonight.home.controller', [])
		.controller('HomeCtrl', HomeCtrl);

	function HomeCtrl($scope, $ionicModal, $state, HostService) {

		$scope.credentials       = {};
		$scope.updateInformation = false;
		$scope.login             = login;
		$scope.navigate          = navigate;
		$scope.openModal         = openModal;
		$scope.closeModal        = closeModal;

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

		function navigate() {
			$state.go('tab.locations');
		}

		function openModal() {
			debugger;
			if ($scope.modal) {
				return $scope.modal.show();
			}
			init();
	  }

		function closeModal() {
			$scope.updateInformation = 'step1';
	    $scope.modal.remove();
			delete $scope.modal;
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
		'home.host',
		'app.home.update-information'
	]);

(function() {
	angular
		.module('home.host', [])
		.factory('HostService', function($http, $q) {

			var svc                   = {};

			var hostInfo              = null;
			svc.login                 = login;
			svc.getHostInfo           = getHostInfo;
			svc.updateHostInformation = updateHostInformation
			svc.dayClubList           = dayClubList();
			svc.nightClubList         = nightClubList();

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
		});
})();

(function() {
	angular
		.module('tablesTonight.host-detail.controller', [])
		.controller('HostDetailCtrl', HostDetailCtrl);

	function HostDetailCtrl($scope, HostsService, $stateParams) {
		$scope.host = HostsService.get($stateParams.hostId);
	  $scope.$on("$ionicView.enter", function() {
	    $scope.$emit('hide');
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

	function HostsCtrl($scope, HostsService) {
		$scope.hosts = HostsService.all();
	  $scope.$on("$ionicView.enter", function() {
	    $scope.$emit('show');
	  });
	}
})();

(function() {
	angular
		.module('tablesTonight.hosts.data', [])
		.factory('HostsService', HostsService);

	function HostsService() {
		var chats = [{
	    id: 0,
	    name: 'Ben Sparrow',
	    phoneNumber: '(111) 111-1111',
	    face: 'img/ben.png'
	  }, {
	    id: 1,
	    name: 'Max Lynx',
	    phoneNumber: '(222) 222-2222',
	    face: 'img/max.png'
	  }, {
	    id: 2,
	    name: 'Adam Bradleyson',
	    phoneNumber: '(333) 333-3333',
	    face: 'img/adam.jpg'
	  }, {
	    id: 3,
	    name: 'Perry Governor',
	    phoneNumber: '(444) 444-4444',
	    face: 'img/perry.png'
	  }, {
	    id: 4,
	    name: 'Mike Harrington',
	    phoneNumber: '(555) 555-5555',
	    face: 'img/mike.png'
	  }];

		var svc = {};

		svc.all = function() {
			return chats;
		}

		svc.get = function(index) {
			return chats[index];
		}

		return svc;
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

	function LocationsCtrl($scope, LocationsService) {
		$scope.locations = LocationsService.all();
	}
})();

(function() {
	angular
		.module('tablesTonight.locations.data', [])
		.factory('LocationsService', LocationsService);

	function LocationsService() {
		var locations = [
	    {
	      name: 'Hakkasaan',
	      id: 0
	    },
	    {
	      name: 'XS',
	      id: 1
	    },
	    {
	      name: 'Encore',
	      id: 2
	    },
	    {
	      name: 'Omnia',
	      id: 3
	    },
			{
				name: 'Drais',
				id: 4
			},
			{
				name: 'Light',
				id: 5
			},
			{
				name: 'Marquee',
				id: 6
			}
	  ];

	  var svc = {};

	  svc.all = function() {
	    return locations;
	  }

	  return svc;
	}
})();

angular
	.module('tablesTonight.locations', [
		'tablesTonight.locations.controller',
		'tablesTonight.locations.data'
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

angular
	.module('tablesTonight', [
		'tablesTonight.routes',
		'tablesTonight.menu-tabs',
		'tablesTonight.home',
		'tablesTonight.locations',
		'tablesTonight.hosts',
		'tablesTonight.host-detail'
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
	    // views: {
	    //   'home': {
	    //   }
	    // }
	  })
	  .state('tab.locations', {
	    url: '/locations',
	    views: {
	      'locations': {
	        templateUrl: 'app/locations/locations.html',
	        controller: 'LocationsCtrl'
	      }
	    }
	  })
	  .state('tab.hosts', {
	    url: '/hosts',
	    views: {
	      'locations': {
	        templateUrl: 'app/hosts/hosts.html',
	        controller: 'HostsCtrl'
	      }
	    }
	  })
	  .state('tab.host-detail', {
	    url: '/host/:hostId',
	    views: {
	      'locations': {
	        templateUrl: 'app/host-detail/host-detail.html',
	        controller: 'HostDetailCtrl'
	      }
	    }
	  });
	  $urlRouterProvider.otherwise('/home');
	}
})();

(function() {
	angular
		.module('tablesTonight.home.controller', [])
		.controller('HomeCtrl', HomeCtrl);

	function HomeCtrl($scope, $ionicModal, $state, HostService) {

		$scope.credentials       = {};
		$scope.updateInformation = false;
		$scope.login             = login;
		$scope.navigate          = navigate;
		$scope.openModal         = openModal;
		$scope.closeModal        = closeModal;

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

		function navigate() {
			$state.go('tab.locations');
		}

		function openModal() {
			if ($scope.modal) {
				return $scope.modal.show();
			}
			init();
	  }

		function closeModal() {
			$scope.updateInformation = 'step1';
	    $scope.modal.remove();
			delete $scope.modal;
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
		'home.host',
		'app.home.update-information'
	]);

(function() {
	angular
		.module('home.host', [])
		.factory('HostService', function($http, $q) {

			var svc                   = {};

			var hostInfo              = null;
			svc.login                 = login;
			svc.getHostInfo           = getHostInfo;
			svc.updateHostInformation = updateHostInformation
			svc.dayClubList           = dayClubList();
			svc.nightClubList         = nightClubList();

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
		});
})();

(function() {
	angular
		.module('tablesTonight.host-detail.controller', [])
		.controller('HostDetailCtrl', HostDetailCtrl);

	function HostDetailCtrl($scope, HostsService, $stateParams) {
		$scope.host = HostsService.get($stateParams.hostId);
	  $scope.$on("$ionicView.enter", function() {
	    $scope.$emit('hide');
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

	function HostsCtrl($scope, HostsService) {
		$scope.hosts = HostsService.all();
	  $scope.$on("$ionicView.enter", function() {
	    $scope.$emit('show');
	  });
	}
})();

(function() {
	angular
		.module('tablesTonight.hosts.data', [])
		.factory('HostsService', HostsService);

	function HostsService() {
		var chats = [{
	    id: 0,
	    name: 'Ben Sparrow',
	    phoneNumber: '(111) 111-1111',
	    face: 'img/ben.png'
	  }, {
	    id: 1,
	    name: 'Max Lynx',
	    phoneNumber: '(222) 222-2222',
	    face: 'img/max.png'
	  }, {
	    id: 2,
	    name: 'Adam Bradleyson',
	    phoneNumber: '(333) 333-3333',
	    face: 'img/adam.jpg'
	  }, {
	    id: 3,
	    name: 'Perry Governor',
	    phoneNumber: '(444) 444-4444',
	    face: 'img/perry.png'
	  }, {
	    id: 4,
	    name: 'Mike Harrington',
	    phoneNumber: '(555) 555-5555',
	    face: 'img/mike.png'
	  }];

		var svc = {};

		svc.all = function() {
			return chats;
		}

		svc.get = function(index) {
			return chats[index];
		}

		return svc;
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

	function LocationsCtrl($scope, LocationsService) {
		$scope.locations = LocationsService.all();
	}
})();

(function() {
	angular
		.module('tablesTonight.locations.data', [])
		.factory('LocationsService', LocationsService);

	function LocationsService() {
		var locations = [
	    {
	      name: 'Hakkasaan',
	      id: 0
	    },
	    {
	      name: 'XS',
	      id: 1
	    },
	    {
	      name: 'Encore',
	      id: 2
	    },
	    {
	      name: 'Omnia',
	      id: 3
	    },
			{
				name: 'Drais',
				id: 4
			},
			{
				name: 'Light',
				id: 5
			},
			{
				name: 'Marquee',
				id: 6
			}
	  ];

	  var svc = {};

	  svc.all = function() {
	    return locations;
	  }

	  return svc;
	}
})();

angular
	.module('tablesTonight.locations', [
		'tablesTonight.locations.controller',
		'tablesTonight.locations.data'
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

angular
	.module('tablesTonight', [
		'tablesTonight.routes',
		'tablesTonight.menu-tabs',
		'tablesTonight.home',
		'tablesTonight.locations',
		'tablesTonight.hosts',
		'tablesTonight.host-detail'
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
	    // views: {
	    //   'home': {
	    //   }
	    // }
	  })
	  .state('tab.locations', {
	    url: '/locations',
	    views: {
	      'locations': {
	        templateUrl: 'app/locations/locations.html',
	        controller: 'LocationsCtrl'
	      }
	    }
	  })
	  .state('tab.hosts', {
	    url: '/hosts',
	    views: {
	      'locations': {
	        templateUrl: 'app/hosts/hosts.html',
	        controller: 'HostsCtrl'
	      }
	    }
	  })
	  .state('tab.host-detail', {
	    url: '/host/:hostId',
	    views: {
	      'locations': {
	        templateUrl: 'app/host-detail/host-detail.html',
	        controller: 'HostDetailCtrl'
	      }
	    }
	  });
	  $urlRouterProvider.otherwise('/home');
	}
})();

(function() {
	angular
		.module('tablesTonight.home.controller', [])
		.controller('HomeCtrl', HomeCtrl);

	function HomeCtrl($scope, $ionicModal, $state, HostService) {

		$scope.credentials       = {};
		$scope.updateInformation = false;
		$scope.login             = login;
		$scope.navigate          = navigate;
		$scope.openModal         = openModal;
		$scope.closeModal        = closeModal;

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

		function navigate() {
			$state.go('tab.locations');
		}

		function openModal() {
			if ($scope.modal) {
				return $scope.modal.show();
			}
			debugger;
			init();
	  }

		function closeModal() {
			$scope.updateInformation = 'step1';
	    $scope.modal.remove();
			delete $scope.modal;
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
		'home.host',
		'app.home.update-information'
	]);

(function() {
	angular
		.module('home.host', [])
		.factory('HostService', function($http, $q) {

			var svc                   = {};

			var hostInfo              = null;
			svc.login                 = login;
			svc.getHostInfo           = getHostInfo;
			svc.updateHostInformation = updateHostInformation
			svc.dayClubList           = dayClubList();
			svc.nightClubList         = nightClubList();

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
		});
})();

(function() {
	angular
		.module('tablesTonight.host-detail.controller', [])
		.controller('HostDetailCtrl', HostDetailCtrl);

	function HostDetailCtrl($scope, HostsService, $stateParams) {
		$scope.host = HostsService.get($stateParams.hostId);
	  $scope.$on("$ionicView.enter", function() {
	    $scope.$emit('hide');
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

	function HostsCtrl($scope, HostsService) {
		$scope.hosts = HostsService.all();
	  $scope.$on("$ionicView.enter", function() {
	    $scope.$emit('show');
	  });
	}
})();

(function() {
	angular
		.module('tablesTonight.hosts.data', [])
		.factory('HostsService', HostsService);

	function HostsService() {
		var chats = [{
	    id: 0,
	    name: 'Ben Sparrow',
	    phoneNumber: '(111) 111-1111',
	    face: 'img/ben.png'
	  }, {
	    id: 1,
	    name: 'Max Lynx',
	    phoneNumber: '(222) 222-2222',
	    face: 'img/max.png'
	  }, {
	    id: 2,
	    name: 'Adam Bradleyson',
	    phoneNumber: '(333) 333-3333',
	    face: 'img/adam.jpg'
	  }, {
	    id: 3,
	    name: 'Perry Governor',
	    phoneNumber: '(444) 444-4444',
	    face: 'img/perry.png'
	  }, {
	    id: 4,
	    name: 'Mike Harrington',
	    phoneNumber: '(555) 555-5555',
	    face: 'img/mike.png'
	  }];

		var svc = {};

		svc.all = function() {
			return chats;
		}

		svc.get = function(index) {
			return chats[index];
		}

		return svc;
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

	function LocationsCtrl($scope, LocationsService) {
		$scope.locations = LocationsService.all();
	}
})();

(function() {
	angular
		.module('tablesTonight.locations.data', [])
		.factory('LocationsService', LocationsService);

	function LocationsService() {
		var locations = [
	    {
	      name: 'Hakkasaan',
	      id: 0
	    },
	    {
	      name: 'XS',
	      id: 1
	    },
	    {
	      name: 'Encore',
	      id: 2
	    },
	    {
	      name: 'Omnia',
	      id: 3
	    },
			{
				name: 'Drais',
				id: 4
			},
			{
				name: 'Light',
				id: 5
			},
			{
				name: 'Marquee',
				id: 6
			}
	  ];

	  var svc = {};

	  svc.all = function() {
	    return locations;
	  }

	  return svc;
	}
})();

angular
	.module('tablesTonight.locations', [
		'tablesTonight.locations.controller',
		'tablesTonight.locations.data'
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

angular
	.module('tablesTonight', [
		'tablesTonight.routes',
		'tablesTonight.menu-tabs',
		'tablesTonight.home',
		'tablesTonight.locations',
		'tablesTonight.hosts',
		'tablesTonight.host-detail'
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
	    // views: {
	    //   'home': {
	    //   }
	    // }
	  })
	  .state('tab.locations', {
	    url: '/locations',
	    views: {
	      'locations': {
	        templateUrl: 'app/locations/locations.html',
	        controller: 'LocationsCtrl'
	      }
	    }
	  })
	  .state('tab.hosts', {
	    url: '/hosts',
	    views: {
	      'locations': {
	        templateUrl: 'app/hosts/hosts.html',
	        controller: 'HostsCtrl'
	      }
	    }
	  })
	  .state('tab.host-detail', {
	    url: '/host/:hostId',
	    views: {
	      'locations': {
	        templateUrl: 'app/host-detail/host-detail.html',
	        controller: 'HostDetailCtrl'
	      }
	    }
	  });
	  $urlRouterProvider.otherwise('/home');
	}
})();

(function() {
	angular
		.module('tablesTonight.home.controller', [])
		.controller('HomeCtrl', HomeCtrl);

	function HomeCtrl($scope, $ionicModal, $state, HostService) {

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

		function navigate() {
			$state.go('tab.locations');
		}

		function openModal() {
			if ($scope.modal) {
				return $scope.modal.show();
			}
			init();
	  }

		function closeModal() {
			$scope.updateInformation = 'step1';
	    $scope.modal.remove();
			delete $scope.modal;
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
		'home.host',
		'app.home.update-information'
	]);

(function() {
	angular
		.module('home.host', [])
		.factory('HostService', function($http, $q) {

			var svc                   = {};

			var hostInfo              = null;
			svc.login                 = login;
			svc.getHostInfo           = getHostInfo;
			svc.updateHostInformation = updateHostInformation
			svc.dayClubList           = dayClubList();
			svc.nightClubList         = nightClubList();

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
		});
})();

(function() {
	angular
		.module('tablesTonight.host-detail.controller', [])
		.controller('HostDetailCtrl', HostDetailCtrl);

	function HostDetailCtrl($scope, HostsService, $stateParams) {
		$scope.host = HostsService.get($stateParams.hostId);
	  $scope.$on("$ionicView.enter", function() {
	    $scope.$emit('hide');
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

	function HostsCtrl($scope, HostsService) {
		$scope.hosts = HostsService.all();
	  $scope.$on("$ionicView.enter", function() {
	    $scope.$emit('show');
	  });
	}
})();

(function() {
	angular
		.module('tablesTonight.hosts.data', [])
		.factory('HostsService', HostsService);

	function HostsService() {
		var chats = [{
	    id: 0,
	    name: 'Ben Sparrow',
	    phoneNumber: '(111) 111-1111',
	    face: 'img/ben.png'
	  }, {
	    id: 1,
	    name: 'Max Lynx',
	    phoneNumber: '(222) 222-2222',
	    face: 'img/max.png'
	  }, {
	    id: 2,
	    name: 'Adam Bradleyson',
	    phoneNumber: '(333) 333-3333',
	    face: 'img/adam.jpg'
	  }, {
	    id: 3,
	    name: 'Perry Governor',
	    phoneNumber: '(444) 444-4444',
	    face: 'img/perry.png'
	  }, {
	    id: 4,
	    name: 'Mike Harrington',
	    phoneNumber: '(555) 555-5555',
	    face: 'img/mike.png'
	  }];

		var svc = {};

		svc.all = function() {
			return chats;
		}

		svc.get = function(index) {
			return chats[index];
		}

		return svc;
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

	function LocationsCtrl($scope, LocationsService) {
		$scope.locations = LocationsService.all();
	}
})();

(function() {
	angular
		.module('tablesTonight.locations.data', [])
		.factory('LocationsService', LocationsService);

	function LocationsService() {
		var locations = [
	    {
	      name: 'Hakkasaan',
	      id: 0
	    },
	    {
	      name: 'XS',
	      id: 1
	    },
	    {
	      name: 'Encore',
	      id: 2
	    },
	    {
	      name: 'Omnia',
	      id: 3
	    },
			{
				name: 'Drais',
				id: 4
			},
			{
				name: 'Light',
				id: 5
			},
			{
				name: 'Marquee',
				id: 6
			}
	  ];

	  var svc = {};

	  svc.all = function() {
	    return locations;
	  }

	  return svc;
	}
})();

angular
	.module('tablesTonight.locations', [
		'tablesTonight.locations.controller',
		'tablesTonight.locations.data'
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

angular
	.module('tablesTonight', [
		'tablesTonight.routes',
		'tablesTonight.menu-tabs',
		'tablesTonight.home',
		'tablesTonight.locations',
		'tablesTonight.hosts',
		'tablesTonight.host-detail'
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
	    // views: {
	    //   'home': {
	    //   }
	    // }
	  })
	  .state('tab.locations', {
	    url: '/locations',
	    views: {
	      'locations': {
	        templateUrl: 'app/locations/locations.html',
	        controller: 'LocationsCtrl'
	      }
	    }
	  })
	  .state('tab.hosts', {
	    url: '/hosts',
	    views: {
	      'locations': {
	        templateUrl: 'app/hosts/hosts.html',
	        controller: 'HostsCtrl'
	      }
	    }
	  })
	  .state('tab.host-detail', {
	    url: '/host/:hostId',
	    views: {
	      'locations': {
	        templateUrl: 'app/host-detail/host-detail.html',
	        controller: 'HostDetailCtrl'
	      }
	    }
	  });
	  $urlRouterProvider.otherwise('/home');
	}
})();

(function() {
	angular
		.module('tablesTonight.home.controller', [])
		.controller('HomeCtrl', HomeCtrl);

	function HomeCtrl($scope, $ionicModal, $state, HostService) {

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

		function navigate() {
			$state.go('tab.locations');
		}

		function openModal() {
			$scope.modal.show();
	  }

		function closeModal() {
			$scope.updateInformation = 'step1';
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
		'home.host',
		'app.home.update-information'
	]);

(function() {
	angular
		.module('home.host', [])
		.factory('HostService', function($http, $q) {

			var svc                   = {};

			var hostInfo              = null;
			svc.login                 = login;
			svc.getHostInfo           = getHostInfo;
			svc.updateHostInformation = updateHostInformation
			svc.dayClubList           = dayClubList();
			svc.nightClubList         = nightClubList();

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
		});
})();

(function() {
	angular
		.module('tablesTonight.host-detail.controller', [])
		.controller('HostDetailCtrl', HostDetailCtrl);

	function HostDetailCtrl($scope, HostsService, $stateParams) {
		$scope.host = HostsService.get($stateParams.hostId);
	  $scope.$on("$ionicView.enter", function() {
	    $scope.$emit('hide');
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

	function HostsCtrl($scope, HostsService) {
		$scope.hosts = HostsService.all();
	  $scope.$on("$ionicView.enter", function() {
	    $scope.$emit('show');
	  });
	}
})();

(function() {
	angular
		.module('tablesTonight.hosts.data', [])
		.factory('HostsService', HostsService);

	function HostsService() {
		var chats = [{
	    id: 0,
	    name: 'Ben Sparrow',
	    phoneNumber: '(111) 111-1111',
	    face: 'img/ben.png'
	  }, {
	    id: 1,
	    name: 'Max Lynx',
	    phoneNumber: '(222) 222-2222',
	    face: 'img/max.png'
	  }, {
	    id: 2,
	    name: 'Adam Bradleyson',
	    phoneNumber: '(333) 333-3333',
	    face: 'img/adam.jpg'
	  }, {
	    id: 3,
	    name: 'Perry Governor',
	    phoneNumber: '(444) 444-4444',
	    face: 'img/perry.png'
	  }, {
	    id: 4,
	    name: 'Mike Harrington',
	    phoneNumber: '(555) 555-5555',
	    face: 'img/mike.png'
	  }];

		var svc = {};

		svc.all = function() {
			return chats;
		}

		svc.get = function(index) {
			return chats[index];
		}

		return svc;
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

	function LocationsCtrl($scope, LocationsService) {
		$scope.locations = LocationsService.all();
	}
})();

(function() {
	angular
		.module('tablesTonight.locations.data', [])
		.factory('LocationsService', LocationsService);

	function LocationsService() {
		var locations = [
	    {
	      name: 'Hakkasaan',
	      id: 0
	    },
	    {
	      name: 'XS',
	      id: 1
	    },
	    {
	      name: 'Encore',
	      id: 2
	    },
	    {
	      name: 'Omnia',
	      id: 3
	    },
			{
				name: 'Drais',
				id: 4
			},
			{
				name: 'Light',
				id: 5
			},
			{
				name: 'Marquee',
				id: 6
			}
	  ];

	  var svc = {};

	  svc.all = function() {
	    return locations;
	  }

	  return svc;
	}
})();

angular
	.module('tablesTonight.locations', [
		'tablesTonight.locations.controller',
		'tablesTonight.locations.data'
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
