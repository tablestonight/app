(function() {
	angular
		.module('app.data', [])
		.factory('TablesTonightService', TablesTonightService);

	function TablesTonightService($http) {

		var svc = {};
		var location = null;
		var url = 'http://tablesTonight.herokuapp.com/';

		svc.currentLocation = currentLocation;
		svc.saveLocation = saveLocation;
		svc.dayClubList   = dayClubList();
		svc.nightClubList = nightClubList();
		svc.getUrl = getUrl;
		init();

		return svc;

		function init() {
			$http.get('http://localhost:1337/origin')
				.then(function(response) {
					if (response.data) {
						url = response.data;
					}
				});
		}

		function getUrl() {
			return url;
		}

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
				'Drais Beach Club',
				'Encore Beach Club',
				'Foxtail Pool Club',
				'Lavo Brunch',
				'Liquid Pool',
				'Marquee Day Club',
				'Moorea Beach Club',
				'Ditch Fridays',
				'Rehab Beach Club',
				'TAO Beach',
				'Wet Republic'
			]
		}

		function nightClubList() {

			return [
				'1OAK',
				'Drais',
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

	function HomeCtrl($scope, $ionicModal, $state, $timeout, HostService, TablesTonightService) {

		$scope.credentials       = {};
		$scope.updateInformation = false;
		$scope.login             = login;
		$scope.navigate          = navigate;
		$scope.openModal         = openModal;
		$scope.closeModal        = closeModal;
		$scope.signUp            = signUp;
		init();

		///////////////////////////////////////////////////////////////////////////

		function signUp() {
			$scope.updateInformation = 'step0';
		}

		function login() {
			HostService.login($scope.credentials)
				.then(function(host) {
					if (host.error) {
						return $scope.message = host.error;
					}
					$scope.updateInformation = 'step1';
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

		function closeModal(exitEarly) {
			if ($scope.updateInformation === 'step0' && !exitEarly) {
				$scope.message = "Thanks for signing up. You'll be receiving an e-mail with next steps shortly.";
				$timeout(function() {
					delete $scope.message;
				}, 5000);
				return $scope.updateInformation = false;
			}
			if (HostService.getHostInfo()) {
				$scope.updateInformation = 'step1';
			}
	    $scope.modal.remove();
			delete $scope.modal;
			init();
	  }

		function init() {
			$ionicModal.fromTemplateUrl('app/home/host-information.html', {
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

				$scope.$on('modal.removed', function() {
					if ($scope.updateInformation !== 'step1') {
						$timeout(function() {
							$scope.updateInformation = false;
						}, 500);
					}
			  });
			}
		}
	}
})();

angular
	.module('tablesTonight.home', [
		'app.home.host',
		'app.home.update-information',
		'tablesTonight.home.controller'
	]);

(function() {
	angular
		.module('app.home.host', [])
		.factory('HostService', function($http, TablesTonightService) {

			var svc                   = {};

			var hostInfo              = null;
			svc.create                = create;
			svc.login                 = login;
			svc.getHostInfo           = getHostInfo;
			svc.updateHostInformation = updateHostInformation
			svc.dayClubList           = TablesTonightService.dayClubList;
			svc.nightClubList         = TablesTonightService.nightClubList;

			return svc;

			function create(newUser) {
				return $http.post(TablesTonightService.getUrl() + 'host/create', newUser)
					.then(function(response) {
						if (!response.data.error) {
							return true;
						}
						return false;
					});
			}

			function login(credentials) {
				return $http.post(TablesTonightService.getUrl() + 'host/login', credentials)
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
				return $http.post(TablesTonightService.getUrl() + 'host/update', hostInfo)
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
			$scope.name = $stateParams.name;
			var type = $stateParams.type;
			getHosts($scope.name)
				.then(function(clubInfo) {
					console.log(clubInfo);
					$scope.info = clubInfo.info;
					$scope.hosts = clubInfo.hosts;
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

	function HostsService($http, TablesTonightService) {
		var svc = {};
		svc.getNightClubHosts = getNightClubHosts;
		svc.getDayClubHosts   = getDayClubHosts;
		svc.saveHost          = saveHost;
		svc.getHost           = getHost;
		return svc;

		function getNightClubHosts(nightclub) {
			return $http.get(TablesTonightService.getUrl() + 'nightclub/' + nightclub)
				.then(function(response) {
					return response.data;
				});
		}

		function getDayClubHosts(dayclub) {
			return $http.get(TablesTonightService.getUrl() + 'dayclub/' + dayclub)
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
				scope.create = create;
				scope.next   = next;
				scope.finish = finish;

				function create(newUser) {
					HostService.create(newUser)
						.then(function(hostCreated) {
							scope.close();
						});
				}

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
		'app.home.update-information.step0',
		'app.home.update-information.step1',
		'app.home.update-information.step2'
	]);

(function() {
	angular
		.module('app.home.update-information.step0', [])
		.directive('updateInformationStepZero', function(HostService) {
			var directive = {
					scope: {
						step: '=',
						create: '='
					},
					restrict: 'AE',
					link: link,
					templateUrl: './app/home/update-information/step0/step0.html'
			};

			return directive;

			///////////////////////////////////////////////////////////////////////////

			function link(scope, element, attrs) {
				scope.newEntry = {};
				scope.submitEmail = submitEmail;

				function submitEmail() {
					scope.create(scope.newEntry);
					delete scope.newEntry;
				}
			}

		});
})();

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

	function TablesTonightService($http) {

		var svc = {};
		var location = null;
		var url = 'http://tablesTonight.herokuapp.com/';

		svc.currentLocation = currentLocation;
		svc.saveLocation = saveLocation;
		svc.dayClubList   = dayClubList();
		svc.nightClubList = nightClubList();
		svc.getUrl = getUrl;
		init();

		return svc;

		function init() {
			$http.get('http://localhost:1337/origin')
				.then(function(response) {
					if (response.data) {
						url = response.data;
					}
				});
		}

		function getUrl() {
			return url;
		}

		function currentLocation() {
			return location;
		}

		function saveLocation(newLocation) {
			location = newLocation;
		}

		function dayClubList() {
			return [
				{ name: 'Azure',
					fileName: '1oak'
				},
				{ name: 'Bare',
					fileName: '1oak'
				},
				{ name: 'Daylight',
					fileName: '1oak'
				},
				{ name: 'Drais Beach Club',
					fileName: '1oak'
				},
				{ name: 'Encore Beach Club',
					fileName: '1oak'
				},
				{ name: 'Foxtail Pool Club',
					fileName: '1oak'
				},
				{ name: 'Lavo Brunch',
					fileName: '1oak'
				},
				{ name: 'Liquid Pool',
					fileName: '1oak'
				},
				{ name: 'Marquee Day Club',
					fileName: '1oak'
				},
				{ name: 'Moorea Beach Club',
					fileName: '1oak'
				},
				{ name: 'Ditch Fridays',
					fileName: '1oak'
				},
				{ name: 'Rehab Beach Club',
					fileName: '1oak'
				},
				{ name: 'TAO Beach',
					fileName: '1oak'
				},
				{ name: 'Wet Republic',
					fileName: '1oak'
				}
			];
		}

		function nightClubList() {

			return [
				{ name: '1OAK',
					fileName: '1oak'
				},
				{ name: 'Drais',
					fileName: '1oak'
				},
				{ name: 'Foundation Room',
					fileName: '1oak'
				},
				{ name: 'Foxtail',
					fileName: '1oak'
				},
				{ name: 'Hakkasan',
					fileName: '1oak'
				},
				{ name: 'Hyde',
					fileName: '1oak'
				},
				{ name: 'Lavo',
					fileName: '1oak'
				},
				{ name: 'LAX',
					fileName: '1oak'
				},
				{ name: 'Light',
					fileName: '1oak'
				},
				{ name: 'Marquee',
					fileName: '1oak'
				},
				{ name: 'Omnia',
					fileName: '1oak'
				},
				{ name: 'Sayers Club',
					fileName: '1oak'
				},
				{ name: 'Surrender',
					fileName: '1oak'
				},
				{ name: 'Tao',
					fileName: '1oak'
				},
				{ name: 'The Bank',
					fileName: '1oak'
				},
				{ name: 'XS',
					fileName: '1oak'
				}
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

	function HomeCtrl($scope, $ionicModal, $state, $timeout, HostService, TablesTonightService) {

		$scope.credentials       = {};
		$scope.updateInformation = false;
		$scope.login             = login;
		$scope.navigate          = navigate;
		$scope.openModal         = openModal;
		$scope.closeModal        = closeModal;
		$scope.signUp            = signUp;
		init();

		///////////////////////////////////////////////////////////////////////////

		function signUp() {
			$scope.updateInformation = 'step0';
		}

		function login() {
			HostService.login($scope.credentials)
				.then(function(host) {
					if (host.error) {
						return $scope.message = host.error;
					}
					$scope.updateInformation = 'step1';
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

		function closeModal(exitEarly) {
			if ($scope.updateInformation === 'step0' && !exitEarly) {
				$scope.message = "Thanks for signing up. You'll be receiving an e-mail with next steps shortly.";
				$timeout(function() {
					delete $scope.message;
				}, 5000);
				return $scope.updateInformation = false;
			}
			if (HostService.getHostInfo()) {
				$scope.updateInformation = 'step1';
			}
	    $scope.modal.remove();
			delete $scope.modal;
			init();
	  }

		function init() {
			$ionicModal.fromTemplateUrl('app/home/host-information.html', {
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

				$scope.$on('modal.removed', function() {
					if ($scope.updateInformation !== 'step1') {
						$timeout(function() {
							$scope.updateInformation = false;
						}, 500);
					}
			  });
			}
		}
	}
})();

angular
	.module('tablesTonight.home', [
		'app.home.host',
		'app.home.update-information',
		'tablesTonight.home.controller'
	]);

(function() {
	angular
		.module('app.home.host', [])
		.factory('HostService', function($http, TablesTonightService) {

			var svc                   = {};

			var hostInfo              = null;
			svc.create                = create;
			svc.login                 = login;
			svc.getHostInfo           = getHostInfo;
			svc.updateHostInformation = updateHostInformation
			svc.dayClubList           = TablesTonightService.dayClubList;
			svc.nightClubList         = TablesTonightService.nightClubList;

			return svc;

			function create(newUser) {
				return $http.post(TablesTonightService.getUrl() + 'host/create', newUser)
					.then(function(response) {
						if (!response.data.error) {
							return true;
						}
						return false;
					});
			}

			function login(credentials) {
				return $http.post(TablesTonightService.getUrl() + 'host/login', credentials)
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
				return $http.post(TablesTonightService.getUrl() + 'host/update', hostInfo)
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
			$scope.name = $stateParams.name;
			var type = $stateParams.type;
			getHosts($scope.name)
				.then(function(clubInfo) {
					console.log(clubInfo);
					$scope.info = clubInfo.info;
					$scope.hosts = clubInfo.hosts;
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

	function HostsService($http, TablesTonightService) {
		var svc = {};
		svc.getNightClubHosts = getNightClubHosts;
		svc.getDayClubHosts   = getDayClubHosts;
		svc.saveHost          = saveHost;
		svc.getHost           = getHost;
		return svc;

		function getNightClubHosts(nightclub) {
			return $http.get(TablesTonightService.getUrl() + 'nightclub/' + nightclub)
				.then(function(response) {
					return response.data;
				});
		}

		function getDayClubHosts(dayclub) {
			return $http.get(TablesTonightService.getUrl() + 'dayclub/' + dayclub)
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
				scope.create = create;
				scope.next   = next;
				scope.finish = finish;

				function create(newUser) {
					HostService.create(newUser)
						.then(function(hostCreated) {
							scope.close();
						});
				}

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
		'app.home.update-information.step0',
		'app.home.update-information.step1',
		'app.home.update-information.step2'
	]);

(function() {
	angular
		.module('app.home.update-information.step0', [])
		.directive('updateInformationStepZero', function(HostService) {
			var directive = {
					scope: {
						step: '=',
						create: '='
					},
					restrict: 'AE',
					link: link,
					templateUrl: './app/home/update-information/step0/step0.html'
			};

			return directive;

			///////////////////////////////////////////////////////////////////////////

			function link(scope, element, attrs) {
				scope.newEntry = {};
				scope.submitEmail = submitEmail;

				function submitEmail() {
					scope.create(scope.newEntry);
					delete scope.newEntry;
				}
			}

		});
})();

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

	function TablesTonightService($http) {

		var svc = {};
		var location = null;
		var url = 'http://tablesTonight.herokuapp.com/';

		svc.currentLocation = currentLocation;
		svc.saveLocation = saveLocation;
		svc.dayClubList   = dayClubList();
		svc.nightClubList = nightClubList();
		svc.getUrl = getUrl;
		init();

		return svc;

		function init() {
			$http.get('http://localhost:1337/origin')
				.then(function(response) {
					if (response.data) {
						url = response.data;
					}
				});
		}

		function getUrl() {
			return url;
		}

		function currentLocation() {
			return location;
		}

		function saveLocation(newLocation) {
			location = newLocation;
		}

		function dayClubList() {
			return [
				{ name: 'Azure',
					fileName: '1oak'
				},
				{ name: 'Bare',
					fileName: '1oak'
				},
				{ name: 'Daylight',
					fileName: '1oak'
				},
				{ name: 'Drais Beach Club',
					fileName: '1oak'
				},
				{ name: 'Encore Beach Club',
					fileName: '1oak'
				},
				{ name: 'Foxtail Pool Club',
					fileName: '1oak'
				},
				{ name: 'Lavo Brunch',
					fileName: '1oak'
				},
				{ name: 'Liquid Pool',
					fileName: '1oak'
				},
				{ name: 'Marquee Day Club',
					fileName: '1oak'
				},
				{ name: 'Moorea Beach Club',
					fileName: '1oak'
				},
				{ name: 'Ditch Fridays',
					fileName: '1oak'
				},
				{ name: 'Rehab Beach Club',
					fileName: '1oak'
				},
				{ name: 'TAO Beach',
					fileName: '1oak'
				},
				{ name: 'Wet Republic',
					fileName: '1oak'
				}
			];
		}

		function nightClubList() {

			return [
				{ name: '1OAK',
					fileName: '1oak'
				},
				{ name: 'Drais',
					fileName: '1oak'
				},
				{ name: 'Foundation Room',
					fileName: '1oak'
				},
				{ name: 'Foxtail',
					fileName: '1oak'
				},
				{ name: 'Hakkasan',
					fileName: '1oak'
				},
				{ name: 'Hyde',
					fileName: '1oak'
				},
				{ name: 'Lavo',
					fileName: '1oak'
				},
				{ name: 'LAX',
					fileName: '1oak'
				},
				{ name: 'Light',
					fileName: '1oak'
				},
				{ name: 'Marquee',
					fileName: '1oak'
				},
				{ name: 'Omnia',
					fileName: '1oak'
				},
				{ name: 'Sayers Club',
					fileName: 'sayers'
				},
				{ name: 'Surrender',
					fileName: '1oak'
				},
				{ name: 'Tao',
					fileName: '1oak'
				},
				{ name: 'The Bank',
					fileName: '1oak'
				},
				{ name: 'XS',
					fileName: '1oak'
				}
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

	function HomeCtrl($scope, $ionicModal, $state, $timeout, HostService, TablesTonightService) {

		$scope.credentials       = {};
		$scope.updateInformation = false;
		$scope.login             = login;
		$scope.navigate          = navigate;
		$scope.openModal         = openModal;
		$scope.closeModal        = closeModal;
		$scope.signUp            = signUp;
		init();

		///////////////////////////////////////////////////////////////////////////

		function signUp() {
			$scope.updateInformation = 'step0';
		}

		function login() {
			HostService.login($scope.credentials)
				.then(function(host) {
					if (host.error) {
						return $scope.message = host.error;
					}
					$scope.updateInformation = 'step1';
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

		function closeModal(exitEarly) {
			if ($scope.updateInformation === 'step0' && !exitEarly) {
				$scope.message = "Thanks for signing up. You'll be receiving an e-mail with next steps shortly.";
				$timeout(function() {
					delete $scope.message;
				}, 5000);
				return $scope.updateInformation = false;
			}
			if (HostService.getHostInfo()) {
				$scope.updateInformation = 'step1';
			}
	    $scope.modal.remove();
			delete $scope.modal;
			init();
	  }

		function init() {
			$ionicModal.fromTemplateUrl('app/home/host-information.html', {
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

				$scope.$on('modal.removed', function() {
					if ($scope.updateInformation !== 'step1') {
						$timeout(function() {
							$scope.updateInformation = false;
						}, 500);
					}
			  });
			}
		}
	}
})();

angular
	.module('tablesTonight.home', [
		'app.home.host',
		'app.home.update-information',
		'tablesTonight.home.controller'
	]);

(function() {
	angular
		.module('app.home.host', [])
		.factory('HostService', function($http, TablesTonightService) {

			var svc                   = {};

			var hostInfo              = null;
			svc.create                = create;
			svc.login                 = login;
			svc.getHostInfo           = getHostInfo;
			svc.updateHostInformation = updateHostInformation
			svc.dayClubList           = TablesTonightService.dayClubList;
			svc.nightClubList         = TablesTonightService.nightClubList;

			return svc;

			function create(newUser) {
				return $http.post(TablesTonightService.getUrl() + 'host/create', newUser)
					.then(function(response) {
						if (!response.data.error) {
							return true;
						}
						return false;
					});
			}

			function login(credentials) {
				return $http.post(TablesTonightService.getUrl() + 'host/login', credentials)
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
				return $http.post(TablesTonightService.getUrl() + 'host/update', hostInfo)
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
			$scope.name = $stateParams.name;
			var type = $stateParams.type;
			getHosts($scope.name)
				.then(function(clubInfo) {
					console.log(clubInfo);
					$scope.info = clubInfo.info;
					$scope.hosts = clubInfo.hosts;
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

	function HostsService($http, TablesTonightService) {
		var svc = {};
		svc.getNightClubHosts = getNightClubHosts;
		svc.getDayClubHosts   = getDayClubHosts;
		svc.saveHost          = saveHost;
		svc.getHost           = getHost;
		return svc;

		function getNightClubHosts(nightclub) {
			return $http.get(TablesTonightService.getUrl() + 'nightclub/' + nightclub)
				.then(function(response) {
					return response.data;
				});
		}

		function getDayClubHosts(dayclub) {
			return $http.get(TablesTonightService.getUrl() + 'dayclub/' + dayclub)
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
				scope.create = create;
				scope.next   = next;
				scope.finish = finish;

				function create(newUser) {
					HostService.create(newUser)
						.then(function(hostCreated) {
							scope.close();
						});
				}

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
		'app.home.update-information.step0',
		'app.home.update-information.step1',
		'app.home.update-information.step2'
	]);

(function() {
	angular
		.module('app.home.update-information.step0', [])
		.directive('updateInformationStepZero', function(HostService) {
			var directive = {
					scope: {
						step: '=',
						create: '='
					},
					restrict: 'AE',
					link: link,
					templateUrl: './app/home/update-information/step0/step0.html'
			};

			return directive;

			///////////////////////////////////////////////////////////////////////////

			function link(scope, element, attrs) {
				scope.newEntry = {};
				scope.submitEmail = submitEmail;

				function submitEmail() {
					scope.create(scope.newEntry);
					delete scope.newEntry;
				}
			}

		});
})();

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

	function TablesTonightService($http) {

		var svc = {};
		var location = null;
		var url = 'http://tablesTonight.herokuapp.com/';

		svc.currentLocation = currentLocation;
		svc.saveLocation = saveLocation;
		svc.dayClubList   = dayClubList();
		svc.nightClubList = nightClubList();
		svc.getUrl = getUrl;
		init();

		return svc;

		function init() {
			$http.get('http://localhost:1337/origin')
				.then(function(response) {
					if (response.data) {
						url = response.data;
					}
				});
		}

		function getUrl() {
			return url;
		}

		function currentLocation() {
			return location;
		}

		function saveLocation(newLocation) {
			location = newLocation;
		}

		function dayClubList() {
			return [
				{ name: 'Azure',
					fileName: '1oak'
				},
				{ name: 'Bare',
					fileName: '1oak'
				},
				{ name: 'Daylight',
					fileName: '1oak'
				},
				{ name: 'Drais Beach Club',
					fileName: '1oak'
				},
				{ name: 'Encore Beach Club',
					fileName: '1oak'
				},
				{ name: 'Foxtail Pool Club',
					fileName: '1oak'
				},
				{ name: 'Lavo Brunch',
					fileName: '1oak'
				},
				{ name: 'Liquid Pool',
					fileName: '1oak'
				},
				{ name: 'Marquee Day Club',
					fileName: '1oak'
				},
				{ name: 'Moorea Beach Club',
					fileName: '1oak'
				},
				{ name: 'Ditch Fridays',
					fileName: '1oak'
				},
				{ name: 'Rehab Beach Club',
					fileName: '1oak'
				},
				{ name: 'TAO Beach',
					fileName: '1oak'
				},
				{ name: 'Wet Republic',
					fileName: '1oak'
				}
			];
		}

		function nightClubList() {

			return [
				{ name: '1OAK',
					fileName: '1oak'
				},
				{ name: 'Drais',
					fileName: 'drais'
				},
				{ name: 'Foundation Room',
					fileName: '1oak'
				},
				{ name: 'Foxtail',
					fileName: '1oak'
				},
				{ name: 'Hakkasan',
					fileName: '1oak'
				},
				{ name: 'Hyde',
					fileName: '1oak'
				},
				{ name: 'Lavo',
					fileName: '1oak'
				},
				{ name: 'LAX',
					fileName: '1oak'
				},
				{ name: 'Light',
					fileName: '1oak'
				},
				{ name: 'Marquee',
					fileName: '1oak'
				},
				{ name: 'Omnia',
					fileName: '1oak'
				},
				{ name: 'Sayers Club',
					fileName: 'sayers'
				},
				{ name: 'Surrender',
					fileName: '1oak'
				},
				{ name: 'Tao',
					fileName: '1oak'
				},
				{ name: 'The Bank',
					fileName: '1oak'
				},
				{ name: 'XS',
					fileName: '1oak'
				}
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

	function HomeCtrl($scope, $ionicModal, $state, $timeout, HostService, TablesTonightService) {

		$scope.credentials       = {};
		$scope.updateInformation = false;
		$scope.login             = login;
		$scope.navigate          = navigate;
		$scope.openModal         = openModal;
		$scope.closeModal        = closeModal;
		$scope.signUp            = signUp;
		init();

		///////////////////////////////////////////////////////////////////////////

		function signUp() {
			$scope.updateInformation = 'step0';
		}

		function login() {
			HostService.login($scope.credentials)
				.then(function(host) {
					if (host.error) {
						return $scope.message = host.error;
					}
					$scope.updateInformation = 'step1';
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

		function closeModal(exitEarly) {
			if ($scope.updateInformation === 'step0' && !exitEarly) {
				$scope.message = "Thanks for signing up. You'll be receiving an e-mail with next steps shortly.";
				$timeout(function() {
					delete $scope.message;
				}, 5000);
				return $scope.updateInformation = false;
			}
			if (HostService.getHostInfo()) {
				$scope.updateInformation = 'step1';
			}
	    $scope.modal.remove();
			delete $scope.modal;
			init();
	  }

		function init() {
			$ionicModal.fromTemplateUrl('app/home/host-information.html', {
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

				$scope.$on('modal.removed', function() {
					if ($scope.updateInformation !== 'step1') {
						$timeout(function() {
							$scope.updateInformation = false;
						}, 500);
					}
			  });
			}
		}
	}
})();

angular
	.module('tablesTonight.home', [
		'app.home.host',
		'app.home.update-information',
		'tablesTonight.home.controller'
	]);

(function() {
	angular
		.module('app.home.host', [])
		.factory('HostService', function($http, TablesTonightService) {

			var svc                   = {};

			var hostInfo              = null;
			svc.create                = create;
			svc.login                 = login;
			svc.getHostInfo           = getHostInfo;
			svc.updateHostInformation = updateHostInformation
			svc.dayClubList           = TablesTonightService.dayClubList;
			svc.nightClubList         = TablesTonightService.nightClubList;

			return svc;

			function create(newUser) {
				return $http.post(TablesTonightService.getUrl() + 'host/create', newUser)
					.then(function(response) {
						if (!response.data.error) {
							return true;
						}
						return false;
					});
			}

			function login(credentials) {
				return $http.post(TablesTonightService.getUrl() + 'host/login', credentials)
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
				return $http.post(TablesTonightService.getUrl() + 'host/update', hostInfo)
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
			$scope.name = $stateParams.name;
			var type = $stateParams.type;
			getHosts($scope.name)
				.then(function(clubInfo) {
					console.log(clubInfo);
					$scope.info = clubInfo.info;
					$scope.hosts = clubInfo.hosts;
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

	function HostsService($http, TablesTonightService) {
		var svc = {};
		svc.getNightClubHosts = getNightClubHosts;
		svc.getDayClubHosts   = getDayClubHosts;
		svc.saveHost          = saveHost;
		svc.getHost           = getHost;
		return svc;

		function getNightClubHosts(nightclub) {
			return $http.get(TablesTonightService.getUrl() + 'nightclub/' + nightclub)
				.then(function(response) {
					return response.data;
				});
		}

		function getDayClubHosts(dayclub) {
			return $http.get(TablesTonightService.getUrl() + 'dayclub/' + dayclub)
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
				scope.create = create;
				scope.next   = next;
				scope.finish = finish;

				function create(newUser) {
					HostService.create(newUser)
						.then(function(hostCreated) {
							scope.close();
						});
				}

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
		'app.home.update-information.step0',
		'app.home.update-information.step1',
		'app.home.update-information.step2'
	]);

(function() {
	angular
		.module('app.home.update-information.step0', [])
		.directive('updateInformationStepZero', function(HostService) {
			var directive = {
					scope: {
						step: '=',
						create: '='
					},
					restrict: 'AE',
					link: link,
					templateUrl: './app/home/update-information/step0/step0.html'
			};

			return directive;

			///////////////////////////////////////////////////////////////////////////

			function link(scope, element, attrs) {
				scope.newEntry = {};
				scope.submitEmail = submitEmail;

				function submitEmail() {
					scope.create(scope.newEntry);
					delete scope.newEntry;
				}
			}

		});
})();

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

	function TablesTonightService($http) {

		var svc = {};
		var location = null;
		var url = 'http://tablesTonight.herokuapp.com/';

		svc.currentLocation = currentLocation;
		svc.saveLocation = saveLocation;
		svc.dayClubList   = dayClubList();
		svc.nightClubList = nightClubList();
		svc.getUrl = getUrl;
		init();

		return svc;

		function init() {
			$http.get('http://localhost:1337/origin')
				.then(function(response) {
					if (response.data) {
						url = response.data;
					}
				});
		}

		function getUrl() {
			return url;
		}

		function currentLocation() {
			return location;
		}

		function saveLocation(newLocation) {
			location = newLocation;
		}

		function dayClubList() {
			return [
				{ name: 'Azure',
					fileName: '1oak'
				},
				{ name: 'Bare',
					fileName: '1oak'
				},
				{ name: 'Daylight',
					fileName: '1oak'
				},
				{ name: 'Drais Beach Club',
					fileName: '1oak'
				},
				{ name: 'Encore Beach Club',
					fileName: '1oak'
				},
				{ name: 'Foxtail Pool Club',
					fileName: '1oak'
				},
				{ name: 'Lavo Brunch',
					fileName: '1oak'
				},
				{ name: 'Liquid Pool',
					fileName: '1oak'
				},
				{ name: 'Marquee Day Club',
					fileName: '1oak'
				},
				{ name: 'Moorea Beach Club',
					fileName: '1oak'
				},
				{ name: 'Ditch Fridays',
					fileName: '1oak'
				},
				{ name: 'Rehab Beach Club',
					fileName: '1oak'
				},
				{ name: 'TAO Beach',
					fileName: '1oak'
				},
				{ name: 'Wet Republic',
					fileName: '1oak'
				}
			];
		}

		function nightClubList() {

			return [
				{ name: '1OAK',
					fileName: '1oak'
				},
				{ name: 'Drais',
					fileName: 'drais'
				},
				{ name: 'Foundation Room',
					fileName: 'foundation'
				},
				{ name: 'Foxtail',
					fileName: '1oak'
				},
				{ name: 'Hakkasan',
					fileName: '1oak'
				},
				{ name: 'Hyde',
					fileName: '1oak'
				},
				{ name: 'Lavo',
					fileName: '1oak'
				},
				{ name: 'LAX',
					fileName: '1oak'
				},
				{ name: 'Light',
					fileName: '1oak'
				},
				{ name: 'Marquee',
					fileName: '1oak'
				},
				{ name: 'Omnia',
					fileName: '1oak'
				},
				{ name: 'Sayers Club',
					fileName: 'sayers'
				},
				{ name: 'Surrender',
					fileName: '1oak'
				},
				{ name: 'Tao',
					fileName: '1oak'
				},
				{ name: 'The Bank',
					fileName: '1oak'
				},
				{ name: 'XS',
					fileName: '1oak'
				}
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

	function HomeCtrl($scope, $ionicModal, $state, $timeout, HostService, TablesTonightService) {

		$scope.credentials       = {};
		$scope.updateInformation = false;
		$scope.login             = login;
		$scope.navigate          = navigate;
		$scope.openModal         = openModal;
		$scope.closeModal        = closeModal;
		$scope.signUp            = signUp;
		init();

		///////////////////////////////////////////////////////////////////////////

		function signUp() {
			$scope.updateInformation = 'step0';
		}

		function login() {
			HostService.login($scope.credentials)
				.then(function(host) {
					if (host.error) {
						return $scope.message = host.error;
					}
					$scope.updateInformation = 'step1';
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

		function closeModal(exitEarly) {
			if ($scope.updateInformation === 'step0' && !exitEarly) {
				$scope.message = "Thanks for signing up. You'll be receiving an e-mail with next steps shortly.";
				$timeout(function() {
					delete $scope.message;
				}, 5000);
				return $scope.updateInformation = false;
			}
			if (HostService.getHostInfo()) {
				$scope.updateInformation = 'step1';
			}
	    $scope.modal.remove();
			delete $scope.modal;
			init();
	  }

		function init() {
			$ionicModal.fromTemplateUrl('app/home/host-information.html', {
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

				$scope.$on('modal.removed', function() {
					if ($scope.updateInformation !== 'step1') {
						$timeout(function() {
							$scope.updateInformation = false;
						}, 500);
					}
			  });
			}
		}
	}
})();

angular
	.module('tablesTonight.home', [
		'app.home.host',
		'app.home.update-information',
		'tablesTonight.home.controller'
	]);

(function() {
	angular
		.module('app.home.host', [])
		.factory('HostService', function($http, TablesTonightService) {

			var svc                   = {};

			var hostInfo              = null;
			svc.create                = create;
			svc.login                 = login;
			svc.getHostInfo           = getHostInfo;
			svc.updateHostInformation = updateHostInformation
			svc.dayClubList           = TablesTonightService.dayClubList;
			svc.nightClubList         = TablesTonightService.nightClubList;

			return svc;

			function create(newUser) {
				return $http.post(TablesTonightService.getUrl() + 'host/create', newUser)
					.then(function(response) {
						if (!response.data.error) {
							return true;
						}
						return false;
					});
			}

			function login(credentials) {
				return $http.post(TablesTonightService.getUrl() + 'host/login', credentials)
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
				return $http.post(TablesTonightService.getUrl() + 'host/update', hostInfo)
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
			$scope.name = $stateParams.name;
			var type = $stateParams.type;
			getHosts($scope.name)
				.then(function(clubInfo) {
					console.log(clubInfo);
					$scope.info = clubInfo.info;
					$scope.hosts = clubInfo.hosts;
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

	function HostsService($http, TablesTonightService) {
		var svc = {};
		svc.getNightClubHosts = getNightClubHosts;
		svc.getDayClubHosts   = getDayClubHosts;
		svc.saveHost          = saveHost;
		svc.getHost           = getHost;
		return svc;

		function getNightClubHosts(nightclub) {
			return $http.get(TablesTonightService.getUrl() + 'nightclub/' + nightclub)
				.then(function(response) {
					return response.data;
				});
		}

		function getDayClubHosts(dayclub) {
			return $http.get(TablesTonightService.getUrl() + 'dayclub/' + dayclub)
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
				scope.create = create;
				scope.next   = next;
				scope.finish = finish;

				function create(newUser) {
					HostService.create(newUser)
						.then(function(hostCreated) {
							scope.close();
						});
				}

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
		'app.home.update-information.step0',
		'app.home.update-information.step1',
		'app.home.update-information.step2'
	]);

(function() {
	angular
		.module('app.home.update-information.step0', [])
		.directive('updateInformationStepZero', function(HostService) {
			var directive = {
					scope: {
						step: '=',
						create: '='
					},
					restrict: 'AE',
					link: link,
					templateUrl: './app/home/update-information/step0/step0.html'
			};

			return directive;

			///////////////////////////////////////////////////////////////////////////

			function link(scope, element, attrs) {
				scope.newEntry = {};
				scope.submitEmail = submitEmail;

				function submitEmail() {
					scope.create(scope.newEntry);
					delete scope.newEntry;
				}
			}

		});
})();

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

	function TablesTonightService($http) {

		var svc = {};
		var location = null;
		var url = 'http://tablesTonight.herokuapp.com/';

		svc.currentLocation = currentLocation;
		svc.saveLocation = saveLocation;
		svc.dayClubList   = dayClubList();
		svc.nightClubList = nightClubList();
		svc.getUrl = getUrl;
		init();

		return svc;

		function init() {
			$http.get('http://localhost:1337/origin')
				.then(function(response) {
					if (response.data) {
						url = response.data;
					}
				});
		}

		function getUrl() {
			return url;
		}

		function currentLocation() {
			return location;
		}

		function saveLocation(newLocation) {
			location = newLocation;
		}

		function dayClubList() {
			return [
				{ name: 'Azure',
					fileName: '1oak'
				},
				{ name: 'Bare',
					fileName: '1oak'
				},
				{ name: 'Daylight',
					fileName: '1oak'
				},
				{ name: 'Drais Beach Club',
					fileName: '1oak'
				},
				{ name: 'Encore Beach Club',
					fileName: '1oak'
				},
				{ name: 'Foxtail Pool Club',
					fileName: '1oak'
				},
				{ name: 'Lavo Brunch',
					fileName: '1oak'
				},
				{ name: 'Liquid Pool',
					fileName: '1oak'
				},
				{ name: 'Marquee Day Club',
					fileName: '1oak'
				},
				{ name: 'Moorea Beach Club',
					fileName: '1oak'
				},
				{ name: 'Ditch Fridays',
					fileName: '1oak'
				},
				{ name: 'Rehab Beach Club',
					fileName: '1oak'
				},
				{ name: 'TAO Beach',
					fileName: '1oak'
				},
				{ name: 'Wet Republic',
					fileName: '1oak'
				}
			];
		}

		function nightClubList() {

			return [
				{ name: '1OAK',
					fileName: '1oak'
				},
				{ name: 'Drais',
					fileName: 'drais'
				},
				{ name: 'Foundation Room',
					fileName: 'foundation'
				},
				{ name: 'Foxtail',
					fileName: 'foxtail'
				},
				{ name: 'Hakkasan',
					fileName: '1oak'
				},
				{ name: 'Hyde',
					fileName: '1oak'
				},
				{ name: 'Lavo',
					fileName: '1oak'
				},
				{ name: 'LAX',
					fileName: '1oak'
				},
				{ name: 'Light',
					fileName: '1oak'
				},
				{ name: 'Marquee',
					fileName: '1oak'
				},
				{ name: 'Omnia',
					fileName: '1oak'
				},
				{ name: 'Sayers Club',
					fileName: 'sayers'
				},
				{ name: 'Surrender',
					fileName: '1oak'
				},
				{ name: 'Tao',
					fileName: '1oak'
				},
				{ name: 'The Bank',
					fileName: '1oak'
				},
				{ name: 'XS',
					fileName: '1oak'
				}
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

	function HomeCtrl($scope, $ionicModal, $state, $timeout, HostService, TablesTonightService) {

		$scope.credentials       = {};
		$scope.updateInformation = false;
		$scope.login             = login;
		$scope.navigate          = navigate;
		$scope.openModal         = openModal;
		$scope.closeModal        = closeModal;
		$scope.signUp            = signUp;
		init();

		///////////////////////////////////////////////////////////////////////////

		function signUp() {
			$scope.updateInformation = 'step0';
		}

		function login() {
			HostService.login($scope.credentials)
				.then(function(host) {
					if (host.error) {
						return $scope.message = host.error;
					}
					$scope.updateInformation = 'step1';
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

		function closeModal(exitEarly) {
			if ($scope.updateInformation === 'step0' && !exitEarly) {
				$scope.message = "Thanks for signing up. You'll be receiving an e-mail with next steps shortly.";
				$timeout(function() {
					delete $scope.message;
				}, 5000);
				return $scope.updateInformation = false;
			}
			if (HostService.getHostInfo()) {
				$scope.updateInformation = 'step1';
			}
	    $scope.modal.remove();
			delete $scope.modal;
			init();
	  }

		function init() {
			$ionicModal.fromTemplateUrl('app/home/host-information.html', {
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

				$scope.$on('modal.removed', function() {
					if ($scope.updateInformation !== 'step1') {
						$timeout(function() {
							$scope.updateInformation = false;
						}, 500);
					}
			  });
			}
		}
	}
})();

angular
	.module('tablesTonight.home', [
		'app.home.host',
		'app.home.update-information',
		'tablesTonight.home.controller'
	]);

(function() {
	angular
		.module('app.home.host', [])
		.factory('HostService', function($http, TablesTonightService) {

			var svc                   = {};

			var hostInfo              = null;
			svc.create                = create;
			svc.login                 = login;
			svc.getHostInfo           = getHostInfo;
			svc.updateHostInformation = updateHostInformation
			svc.dayClubList           = TablesTonightService.dayClubList;
			svc.nightClubList         = TablesTonightService.nightClubList;

			return svc;

			function create(newUser) {
				return $http.post(TablesTonightService.getUrl() + 'host/create', newUser)
					.then(function(response) {
						if (!response.data.error) {
							return true;
						}
						return false;
					});
			}

			function login(credentials) {
				return $http.post(TablesTonightService.getUrl() + 'host/login', credentials)
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
				return $http.post(TablesTonightService.getUrl() + 'host/update', hostInfo)
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
			$scope.name = $stateParams.name;
			var type = $stateParams.type;
			getHosts($scope.name)
				.then(function(clubInfo) {
					console.log(clubInfo);
					$scope.info = clubInfo.info;
					$scope.hosts = clubInfo.hosts;
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

	function HostsService($http, TablesTonightService) {
		var svc = {};
		svc.getNightClubHosts = getNightClubHosts;
		svc.getDayClubHosts   = getDayClubHosts;
		svc.saveHost          = saveHost;
		svc.getHost           = getHost;
		return svc;

		function getNightClubHosts(nightclub) {
			return $http.get(TablesTonightService.getUrl() + 'nightclub/' + nightclub)
				.then(function(response) {
					return response.data;
				});
		}

		function getDayClubHosts(dayclub) {
			return $http.get(TablesTonightService.getUrl() + 'dayclub/' + dayclub)
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
				scope.create = create;
				scope.next   = next;
				scope.finish = finish;

				function create(newUser) {
					HostService.create(newUser)
						.then(function(hostCreated) {
							scope.close();
						});
				}

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
		'app.home.update-information.step0',
		'app.home.update-information.step1',
		'app.home.update-information.step2'
	]);

(function() {
	angular
		.module('app.home.update-information.step0', [])
		.directive('updateInformationStepZero', function(HostService) {
			var directive = {
					scope: {
						step: '=',
						create: '='
					},
					restrict: 'AE',
					link: link,
					templateUrl: './app/home/update-information/step0/step0.html'
			};

			return directive;

			///////////////////////////////////////////////////////////////////////////

			function link(scope, element, attrs) {
				scope.newEntry = {};
				scope.submitEmail = submitEmail;

				function submitEmail() {
					scope.create(scope.newEntry);
					delete scope.newEntry;
				}
			}

		});
})();

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

	function TablesTonightService($http) {

		var svc = {};
		var location = null;
		var url = 'http://tablesTonight.herokuapp.com/';

		svc.currentLocation = currentLocation;
		svc.saveLocation = saveLocation;
		svc.dayClubList   = dayClubList();
		svc.nightClubList = nightClubList();
		svc.getUrl = getUrl;
		init();

		return svc;

		function init() {
			$http.get('http://localhost:1337/origin')
				.then(function(response) {
					if (response.data) {
						url = response.data;
					}
				});
		}

		function getUrl() {
			return url;
		}

		function currentLocation() {
			return location;
		}

		function saveLocation(newLocation) {
			location = newLocation;
		}

		function dayClubList() {
			return [
				{ name: 'Azure',
					fileName: '1oak'
				},
				{ name: 'Bare',
					fileName: '1oak'
				},
				{ name: 'Daylight',
					fileName: '1oak'
				},
				{ name: 'Drais Beach Club',
					fileName: '1oak'
				},
				{ name: 'Encore Beach Club',
					fileName: '1oak'
				},
				{ name: 'Foxtail Pool Club',
					fileName: '1oak'
				},
				{ name: 'Lavo Brunch',
					fileName: '1oak'
				},
				{ name: 'Liquid Pool',
					fileName: '1oak'
				},
				{ name: 'Marquee Day Club',
					fileName: '1oak'
				},
				{ name: 'Moorea Beach Club',
					fileName: '1oak'
				},
				{ name: 'Ditch Fridays',
					fileName: '1oak'
				},
				{ name: 'Rehab Beach Club',
					fileName: '1oak'
				},
				{ name: 'TAO Beach',
					fileName: '1oak'
				},
				{ name: 'Wet Republic',
					fileName: '1oak'
				}
			];
		}

		function nightClubList() {

			return [
				{ name: '1OAK',
					fileName: '1oak'
				},
				{ name: 'Drais',
					fileName: 'drais'
				},
				{ name: 'Foundation Room',
					fileName: 'foundation'
				},
				{ name: 'Foxtail',
					fileName: 'foxtail'
				},
				{ name: 'Hakkasan',
					fileName: 'hakkasan'
				},
				{ name: 'Hyde',
					fileName: '1oak'
				},
				{ name: 'Lavo',
					fileName: '1oak'
				},
				{ name: 'LAX',
					fileName: '1oak'
				},
				{ name: 'Light',
					fileName: '1oak'
				},
				{ name: 'Marquee',
					fileName: '1oak'
				},
				{ name: 'Omnia',
					fileName: '1oak'
				},
				{ name: 'Sayers Club',
					fileName: 'sayers'
				},
				{ name: 'Surrender',
					fileName: '1oak'
				},
				{ name: 'Tao',
					fileName: '1oak'
				},
				{ name: 'The Bank',
					fileName: '1oak'
				},
				{ name: 'XS',
					fileName: '1oak'
				}
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

	function HomeCtrl($scope, $ionicModal, $state, $timeout, HostService, TablesTonightService) {

		$scope.credentials       = {};
		$scope.updateInformation = false;
		$scope.login             = login;
		$scope.navigate          = navigate;
		$scope.openModal         = openModal;
		$scope.closeModal        = closeModal;
		$scope.signUp            = signUp;
		init();

		///////////////////////////////////////////////////////////////////////////

		function signUp() {
			$scope.updateInformation = 'step0';
		}

		function login() {
			HostService.login($scope.credentials)
				.then(function(host) {
					if (host.error) {
						return $scope.message = host.error;
					}
					$scope.updateInformation = 'step1';
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

		function closeModal(exitEarly) {
			if ($scope.updateInformation === 'step0' && !exitEarly) {
				$scope.message = "Thanks for signing up. You'll be receiving an e-mail with next steps shortly.";
				$timeout(function() {
					delete $scope.message;
				}, 5000);
				return $scope.updateInformation = false;
			}
			if (HostService.getHostInfo()) {
				$scope.updateInformation = 'step1';
			}
	    $scope.modal.remove();
			delete $scope.modal;
			init();
	  }

		function init() {
			$ionicModal.fromTemplateUrl('app/home/host-information.html', {
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

				$scope.$on('modal.removed', function() {
					if ($scope.updateInformation !== 'step1') {
						$timeout(function() {
							$scope.updateInformation = false;
						}, 500);
					}
			  });
			}
		}
	}
})();

angular
	.module('tablesTonight.home', [
		'app.home.host',
		'app.home.update-information',
		'tablesTonight.home.controller'
	]);

(function() {
	angular
		.module('app.home.host', [])
		.factory('HostService', function($http, TablesTonightService) {

			var svc                   = {};

			var hostInfo              = null;
			svc.create                = create;
			svc.login                 = login;
			svc.getHostInfo           = getHostInfo;
			svc.updateHostInformation = updateHostInformation
			svc.dayClubList           = TablesTonightService.dayClubList;
			svc.nightClubList         = TablesTonightService.nightClubList;

			return svc;

			function create(newUser) {
				return $http.post(TablesTonightService.getUrl() + 'host/create', newUser)
					.then(function(response) {
						if (!response.data.error) {
							return true;
						}
						return false;
					});
			}

			function login(credentials) {
				return $http.post(TablesTonightService.getUrl() + 'host/login', credentials)
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
				return $http.post(TablesTonightService.getUrl() + 'host/update', hostInfo)
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
			$scope.name = $stateParams.name;
			var type = $stateParams.type;
			getHosts($scope.name)
				.then(function(clubInfo) {
					console.log(clubInfo);
					$scope.info = clubInfo.info;
					$scope.hosts = clubInfo.hosts;
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

	function HostsService($http, TablesTonightService) {
		var svc = {};
		svc.getNightClubHosts = getNightClubHosts;
		svc.getDayClubHosts   = getDayClubHosts;
		svc.saveHost          = saveHost;
		svc.getHost           = getHost;
		return svc;

		function getNightClubHosts(nightclub) {
			return $http.get(TablesTonightService.getUrl() + 'nightclub/' + nightclub)
				.then(function(response) {
					return response.data;
				});
		}

		function getDayClubHosts(dayclub) {
			return $http.get(TablesTonightService.getUrl() + 'dayclub/' + dayclub)
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
				scope.create = create;
				scope.next   = next;
				scope.finish = finish;

				function create(newUser) {
					HostService.create(newUser)
						.then(function(hostCreated) {
							scope.close();
						});
				}

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
		'app.home.update-information.step0',
		'app.home.update-information.step1',
		'app.home.update-information.step2'
	]);

(function() {
	angular
		.module('app.home.update-information.step0', [])
		.directive('updateInformationStepZero', function(HostService) {
			var directive = {
					scope: {
						step: '=',
						create: '='
					},
					restrict: 'AE',
					link: link,
					templateUrl: './app/home/update-information/step0/step0.html'
			};

			return directive;

			///////////////////////////////////////////////////////////////////////////

			function link(scope, element, attrs) {
				scope.newEntry = {};
				scope.submitEmail = submitEmail;

				function submitEmail() {
					scope.create(scope.newEntry);
					delete scope.newEntry;
				}
			}

		});
})();

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

	function TablesTonightService($http) {

		var svc = {};
		var location = null;
		var url = 'http://tablesTonight.herokuapp.com/';

		svc.currentLocation = currentLocation;
		svc.saveLocation = saveLocation;
		svc.dayClubList   = dayClubList();
		svc.nightClubList = nightClubList();
		svc.getUrl = getUrl;
		init();

		return svc;

		function init() {
			$http.get('http://localhost:1337/origin')
				.then(function(response) {
					if (response.data) {
						url = response.data;
					}
				});
		}

		function getUrl() {
			return url;
		}

		function currentLocation() {
			return location;
		}

		function saveLocation(newLocation) {
			location = newLocation;
		}

		function dayClubList() {
			return [
				{ name: 'Azure',
					fileName: '1oak'
				},
				{ name: 'Bare',
					fileName: '1oak'
				},
				{ name: 'Daylight',
					fileName: '1oak'
				},
				{ name: 'Drais Beach Club',
					fileName: '1oak'
				},
				{ name: 'Encore Beach Club',
					fileName: '1oak'
				},
				{ name: 'Foxtail Pool Club',
					fileName: '1oak'
				},
				{ name: 'Lavo Brunch',
					fileName: '1oak'
				},
				{ name: 'Liquid Pool',
					fileName: '1oak'
				},
				{ name: 'Marquee Day Club',
					fileName: '1oak'
				},
				{ name: 'Moorea Beach Club',
					fileName: '1oak'
				},
				{ name: 'Ditch Fridays',
					fileName: '1oak'
				},
				{ name: 'Rehab Beach Club',
					fileName: '1oak'
				},
				{ name: 'TAO Beach',
					fileName: '1oak'
				},
				{ name: 'Wet Republic',
					fileName: '1oak'
				}
			];
		}

		function nightClubList() {

			return [
				{ name: '1OAK',
					fileName: '1oak'
				},
				{ name: 'Drais',
					fileName: 'drais'
				},
				{ name: 'Foundation Room',
					fileName: 'foundation'
				},
				{ name: 'Foxtail',
					fileName: 'foxtail'
				},
				{ name: 'Hakkasan',
					fileName: 'hakkasan'
				},
				{ name: 'Hyde',
					fileName: 'hyde'
				},
				{ name: 'Lavo',
					fileName: '1oak'
				},
				{ name: 'LAX',
					fileName: '1oak'
				},
				{ name: 'Light',
					fileName: '1oak'
				},
				{ name: 'Marquee',
					fileName: '1oak'
				},
				{ name: 'Omnia',
					fileName: '1oak'
				},
				{ name: 'Sayers Club',
					fileName: 'sayers'
				},
				{ name: 'Surrender',
					fileName: '1oak'
				},
				{ name: 'Tao',
					fileName: '1oak'
				},
				{ name: 'The Bank',
					fileName: '1oak'
				},
				{ name: 'XS',
					fileName: '1oak'
				}
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

	function HomeCtrl($scope, $ionicModal, $state, $timeout, HostService, TablesTonightService) {

		$scope.credentials       = {};
		$scope.updateInformation = false;
		$scope.login             = login;
		$scope.navigate          = navigate;
		$scope.openModal         = openModal;
		$scope.closeModal        = closeModal;
		$scope.signUp            = signUp;
		init();

		///////////////////////////////////////////////////////////////////////////

		function signUp() {
			$scope.updateInformation = 'step0';
		}

		function login() {
			HostService.login($scope.credentials)
				.then(function(host) {
					if (host.error) {
						return $scope.message = host.error;
					}
					$scope.updateInformation = 'step1';
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

		function closeModal(exitEarly) {
			if ($scope.updateInformation === 'step0' && !exitEarly) {
				$scope.message = "Thanks for signing up. You'll be receiving an e-mail with next steps shortly.";
				$timeout(function() {
					delete $scope.message;
				}, 5000);
				return $scope.updateInformation = false;
			}
			if (HostService.getHostInfo()) {
				$scope.updateInformation = 'step1';
			}
	    $scope.modal.remove();
			delete $scope.modal;
			init();
	  }

		function init() {
			$ionicModal.fromTemplateUrl('app/home/host-information.html', {
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

				$scope.$on('modal.removed', function() {
					if ($scope.updateInformation !== 'step1') {
						$timeout(function() {
							$scope.updateInformation = false;
						}, 500);
					}
			  });
			}
		}
	}
})();

angular
	.module('tablesTonight.home', [
		'app.home.host',
		'app.home.update-information',
		'tablesTonight.home.controller'
	]);

(function() {
	angular
		.module('app.home.host', [])
		.factory('HostService', function($http, TablesTonightService) {

			var svc                   = {};

			var hostInfo              = null;
			svc.create                = create;
			svc.login                 = login;
			svc.getHostInfo           = getHostInfo;
			svc.updateHostInformation = updateHostInformation
			svc.dayClubList           = TablesTonightService.dayClubList;
			svc.nightClubList         = TablesTonightService.nightClubList;

			return svc;

			function create(newUser) {
				return $http.post(TablesTonightService.getUrl() + 'host/create', newUser)
					.then(function(response) {
						if (!response.data.error) {
							return true;
						}
						return false;
					});
			}

			function login(credentials) {
				return $http.post(TablesTonightService.getUrl() + 'host/login', credentials)
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
				return $http.post(TablesTonightService.getUrl() + 'host/update', hostInfo)
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
			$scope.name = $stateParams.name;
			var type = $stateParams.type;
			getHosts($scope.name)
				.then(function(clubInfo) {
					console.log(clubInfo);
					$scope.info = clubInfo.info;
					$scope.hosts = clubInfo.hosts;
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

	function HostsService($http, TablesTonightService) {
		var svc = {};
		svc.getNightClubHosts = getNightClubHosts;
		svc.getDayClubHosts   = getDayClubHosts;
		svc.saveHost          = saveHost;
		svc.getHost           = getHost;
		return svc;

		function getNightClubHosts(nightclub) {
			return $http.get(TablesTonightService.getUrl() + 'nightclub/' + nightclub)
				.then(function(response) {
					return response.data;
				});
		}

		function getDayClubHosts(dayclub) {
			return $http.get(TablesTonightService.getUrl() + 'dayclub/' + dayclub)
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
				scope.create = create;
				scope.next   = next;
				scope.finish = finish;

				function create(newUser) {
					HostService.create(newUser)
						.then(function(hostCreated) {
							scope.close();
						});
				}

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
		'app.home.update-information.step0',
		'app.home.update-information.step1',
		'app.home.update-information.step2'
	]);

(function() {
	angular
		.module('app.home.update-information.step0', [])
		.directive('updateInformationStepZero', function(HostService) {
			var directive = {
					scope: {
						step: '=',
						create: '='
					},
					restrict: 'AE',
					link: link,
					templateUrl: './app/home/update-information/step0/step0.html'
			};

			return directive;

			///////////////////////////////////////////////////////////////////////////

			function link(scope, element, attrs) {
				scope.newEntry = {};
				scope.submitEmail = submitEmail;

				function submitEmail() {
					scope.create(scope.newEntry);
					delete scope.newEntry;
				}
			}

		});
})();

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

	function TablesTonightService($http) {

		var svc = {};
		var location = null;
		var url = 'http://tablesTonight.herokuapp.com/';

		svc.currentLocation = currentLocation;
		svc.saveLocation = saveLocation;
		svc.dayClubList   = dayClubList();
		svc.nightClubList = nightClubList();
		svc.getUrl = getUrl;
		init();

		return svc;

		function init() {
			$http.get('http://localhost:1337/origin')
				.then(function(response) {
					if (response.data) {
						url = response.data;
					}
				});
		}

		function getUrl() {
			return url;
		}

		function currentLocation() {
			return location;
		}

		function saveLocation(newLocation) {
			location = newLocation;
		}

		function dayClubList() {
			return [
				{ name: 'Azure',
					fileName: '1oak'
				},
				{ name: 'Bare',
					fileName: '1oak'
				},
				{ name: 'Daylight',
					fileName: '1oak'
				},
				{ name: 'Drais Beach Club',
					fileName: '1oak'
				},
				{ name: 'Encore Beach Club',
					fileName: '1oak'
				},
				{ name: 'Foxtail Pool Club',
					fileName: '1oak'
				},
				{ name: 'Lavo Brunch',
					fileName: '1oak'
				},
				{ name: 'Liquid Pool',
					fileName: '1oak'
				},
				{ name: 'Marquee Day Club',
					fileName: '1oak'
				},
				{ name: 'Moorea Beach Club',
					fileName: '1oak'
				},
				{ name: 'Ditch Fridays',
					fileName: '1oak'
				},
				{ name: 'Rehab Beach Club',
					fileName: '1oak'
				},
				{ name: 'TAO Beach',
					fileName: '1oak'
				},
				{ name: 'Wet Republic',
					fileName: '1oak'
				}
			];
		}

		function nightClubList() {

			return [
				{ name: '1OAK',
					fileName: '1oak'
				},
				{ name: 'Drais',
					fileName: 'drais'
				},
				{ name: 'Foundation Room',
					fileName: 'foundation'
				},
				{ name: 'Foxtail',
					fileName: 'foxtail'
				},
				{ name: 'Hakkasan',
					fileName: 'hakkasan'
				},
				{ name: 'Hyde',
					fileName: 'hyde'
				},
				{ name: 'Lavo',
					fileName: 'lavo'
				},
				{ name: 'LAX',
					fileName: '1oak'
				},
				{ name: 'Light',
					fileName: '1oak'
				},
				{ name: 'Marquee',
					fileName: '1oak'
				},
				{ name: 'Omnia',
					fileName: '1oak'
				},
				{ name: 'Sayers Club',
					fileName: 'sayers'
				},
				{ name: 'Surrender',
					fileName: '1oak'
				},
				{ name: 'Tao',
					fileName: '1oak'
				},
				{ name: 'The Bank',
					fileName: '1oak'
				},
				{ name: 'XS',
					fileName: '1oak'
				}
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

	function HomeCtrl($scope, $ionicModal, $state, $timeout, HostService, TablesTonightService) {

		$scope.credentials       = {};
		$scope.updateInformation = false;
		$scope.login             = login;
		$scope.navigate          = navigate;
		$scope.openModal         = openModal;
		$scope.closeModal        = closeModal;
		$scope.signUp            = signUp;
		init();

		///////////////////////////////////////////////////////////////////////////

		function signUp() {
			$scope.updateInformation = 'step0';
		}

		function login() {
			HostService.login($scope.credentials)
				.then(function(host) {
					if (host.error) {
						return $scope.message = host.error;
					}
					$scope.updateInformation = 'step1';
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

		function closeModal(exitEarly) {
			if ($scope.updateInformation === 'step0' && !exitEarly) {
				$scope.message = "Thanks for signing up. You'll be receiving an e-mail with next steps shortly.";
				$timeout(function() {
					delete $scope.message;
				}, 5000);
				return $scope.updateInformation = false;
			}
			if (HostService.getHostInfo()) {
				$scope.updateInformation = 'step1';
			}
	    $scope.modal.remove();
			delete $scope.modal;
			init();
	  }

		function init() {
			$ionicModal.fromTemplateUrl('app/home/host-information.html', {
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

				$scope.$on('modal.removed', function() {
					if ($scope.updateInformation !== 'step1') {
						$timeout(function() {
							$scope.updateInformation = false;
						}, 500);
					}
			  });
			}
		}
	}
})();

angular
	.module('tablesTonight.home', [
		'app.home.host',
		'app.home.update-information',
		'tablesTonight.home.controller'
	]);

(function() {
	angular
		.module('app.home.host', [])
		.factory('HostService', function($http, TablesTonightService) {

			var svc                   = {};

			var hostInfo              = null;
			svc.create                = create;
			svc.login                 = login;
			svc.getHostInfo           = getHostInfo;
			svc.updateHostInformation = updateHostInformation
			svc.dayClubList           = TablesTonightService.dayClubList;
			svc.nightClubList         = TablesTonightService.nightClubList;

			return svc;

			function create(newUser) {
				return $http.post(TablesTonightService.getUrl() + 'host/create', newUser)
					.then(function(response) {
						if (!response.data.error) {
							return true;
						}
						return false;
					});
			}

			function login(credentials) {
				return $http.post(TablesTonightService.getUrl() + 'host/login', credentials)
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
				return $http.post(TablesTonightService.getUrl() + 'host/update', hostInfo)
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
			$scope.name = $stateParams.name;
			var type = $stateParams.type;
			getHosts($scope.name)
				.then(function(clubInfo) {
					console.log(clubInfo);
					$scope.info = clubInfo.info;
					$scope.hosts = clubInfo.hosts;
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

	function HostsService($http, TablesTonightService) {
		var svc = {};
		svc.getNightClubHosts = getNightClubHosts;
		svc.getDayClubHosts   = getDayClubHosts;
		svc.saveHost          = saveHost;
		svc.getHost           = getHost;
		return svc;

		function getNightClubHosts(nightclub) {
			return $http.get(TablesTonightService.getUrl() + 'nightclub/' + nightclub)
				.then(function(response) {
					return response.data;
				});
		}

		function getDayClubHosts(dayclub) {
			return $http.get(TablesTonightService.getUrl() + 'dayclub/' + dayclub)
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
				scope.create = create;
				scope.next   = next;
				scope.finish = finish;

				function create(newUser) {
					HostService.create(newUser)
						.then(function(hostCreated) {
							scope.close();
						});
				}

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
		'app.home.update-information.step0',
		'app.home.update-information.step1',
		'app.home.update-information.step2'
	]);

(function() {
	angular
		.module('app.home.update-information.step0', [])
		.directive('updateInformationStepZero', function(HostService) {
			var directive = {
					scope: {
						step: '=',
						create: '='
					},
					restrict: 'AE',
					link: link,
					templateUrl: './app/home/update-information/step0/step0.html'
			};

			return directive;

			///////////////////////////////////////////////////////////////////////////

			function link(scope, element, attrs) {
				scope.newEntry = {};
				scope.submitEmail = submitEmail;

				function submitEmail() {
					scope.create(scope.newEntry);
					delete scope.newEntry;
				}
			}

		});
})();

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

	function TablesTonightService($http) {

		var svc = {};
		var location = null;
		var url = 'http://tablesTonight.herokuapp.com/';

		svc.currentLocation = currentLocation;
		svc.saveLocation = saveLocation;
		svc.dayClubList   = dayClubList();
		svc.nightClubList = nightClubList();
		svc.getUrl = getUrl;
		init();

		return svc;

		function init() {
			$http.get('http://localhost:1337/origin')
				.then(function(response) {
					if (response.data) {
						url = response.data;
					}
				});
		}

		function getUrl() {
			return url;
		}

		function currentLocation() {
			return location;
		}

		function saveLocation(newLocation) {
			location = newLocation;
		}

		function dayClubList() {
			return [
				{ name: 'Azure',
					fileName: '1oak'
				},
				{ name: 'Bare',
					fileName: '1oak'
				},
				{ name: 'Daylight',
					fileName: '1oak'
				},
				{ name: 'Drais Beach Club',
					fileName: '1oak'
				},
				{ name: 'Encore Beach Club',
					fileName: '1oak'
				},
				{ name: 'Foxtail Pool Club',
					fileName: '1oak'
				},
				{ name: 'Lavo Brunch',
					fileName: '1oak'
				},
				{ name: 'Liquid Pool',
					fileName: '1oak'
				},
				{ name: 'Marquee Day Club',
					fileName: '1oak'
				},
				{ name: 'Moorea Beach Club',
					fileName: '1oak'
				},
				{ name: 'Ditch Fridays',
					fileName: '1oak'
				},
				{ name: 'Rehab Beach Club',
					fileName: '1oak'
				},
				{ name: 'TAO Beach',
					fileName: '1oak'
				},
				{ name: 'Wet Republic',
					fileName: '1oak'
				}
			];
		}

		function nightClubList() {

			return [
				{ name: '1OAK',
					fileName: '1oak'
				},
				{ name: 'Drais',
					fileName: 'drais'
				},
				{ name: 'Foundation Room',
					fileName: 'foundation'
				},
				{ name: 'Foxtail',
					fileName: 'foxtail'
				},
				{ name: 'Hakkasan',
					fileName: 'hakkasan'
				},
				{ name: 'Hyde',
					fileName: 'hyde'
				},
				{ name: 'Lavo',
					fileName: 'lavo'
				},
				{ name: 'LAX',
					fileName: '1oak'
				},
				{ name: 'Light',
					fileName: '1oak'
				},
				{ name: 'Marquee',
					fileName: '1oak'
				},
				{ name: 'Omnia',
					fileName: '1oak'
				},
				{ name: 'Sayers Club',
					fileName: 'sayers'
				},
				{ name: 'Surrender',
					fileName: '1oak'
				},
				{ name: 'Tao',
					fileName: '1oak'
				},
				{ name: 'The Bank',
					fileName: '1oak'
				},
				{ name: 'XS',
					fileName: '1oak'
				}
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

	function HomeCtrl($scope, $ionicModal, $state, $timeout, HostService, TablesTonightService) {

		$scope.credentials       = {};
		$scope.updateInformation = false;
		$scope.login             = login;
		$scope.navigate          = navigate;
		$scope.openModal         = openModal;
		$scope.closeModal        = closeModal;
		$scope.signUp            = signUp;
		init();

		///////////////////////////////////////////////////////////////////////////

		function signUp() {
			$scope.updateInformation = 'step0';
		}

		function login() {
			HostService.login($scope.credentials)
				.then(function(host) {
					if (host.error) {
						return $scope.message = host.error;
					}
					$scope.updateInformation = 'step1';
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

		function closeModal(exitEarly) {
			if ($scope.updateInformation === 'step0' && !exitEarly) {
				$scope.message = "Thanks for signing up. You'll be receiving an e-mail with next steps shortly.";
				$timeout(function() {
					delete $scope.message;
				}, 5000);
				return $scope.updateInformation = false;
			}
			if (HostService.getHostInfo()) {
				$scope.updateInformation = 'step1';
			}
	    $scope.modal.remove();
			delete $scope.modal;
			init();
	  }

		function init() {
			$ionicModal.fromTemplateUrl('app/home/host-information.html', {
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

				$scope.$on('modal.removed', function() {
					if ($scope.updateInformation !== 'step1') {
						$timeout(function() {
							$scope.updateInformation = false;
						}, 500);
					}
			  });
			}
		}
	}
})();

angular
	.module('tablesTonight.home', [
		'app.home.host',
		'app.home.update-information',
		'tablesTonight.home.controller'
	]);

(function() {
	angular
		.module('app.home.host', [])
		.factory('HostService', function($http, TablesTonightService) {

			var svc                   = {};

			var hostInfo              = null;
			svc.create                = create;
			svc.login                 = login;
			svc.getHostInfo           = getHostInfo;
			svc.updateHostInformation = updateHostInformation
			svc.dayClubList           = TablesTonightService.dayClubList;
			svc.nightClubList         = TablesTonightService.nightClubList;

			return svc;

			function create(newUser) {
				return $http.post(TablesTonightService.getUrl() + 'host/create', newUser)
					.then(function(response) {
						if (!response.data.error) {
							return true;
						}
						return false;
					});
			}

			function login(credentials) {
				return $http.post(TablesTonightService.getUrl() + 'host/login', credentials)
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
				return $http.post(TablesTonightService.getUrl() + 'host/update', hostInfo)
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
			$scope.name = $stateParams.name;
			var type = $stateParams.type;
			getHosts($scope.name)
				.then(function(clubInfo) {
					$scope.info = clubInfo.info;
					$scope.hosts = clubInfo.hosts;
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

	function HostsService($http, TablesTonightService) {
		var svc = {};
		svc.getNightClubHosts = getNightClubHosts;
		svc.getDayClubHosts   = getDayClubHosts;
		svc.saveHost          = saveHost;
		svc.getHost           = getHost;
		return svc;

		function getNightClubHosts(nightclub) {
			return $http.get(TablesTonightService.getUrl() + 'nightclub/' + nightclub)
				.then(function(response) {
					return response.data;
				});
		}

		function getDayClubHosts(dayclub) {
			return $http.get(TablesTonightService.getUrl() + 'dayclub/' + dayclub)
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
				scope.create = create;
				scope.next   = next;
				scope.finish = finish;

				function create(newUser) {
					HostService.create(newUser)
						.then(function(hostCreated) {
							scope.close();
						});
				}

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
		'app.home.update-information.step0',
		'app.home.update-information.step1',
		'app.home.update-information.step2'
	]);

(function() {
	angular
		.module('app.home.update-information.step0', [])
		.directive('updateInformationStepZero', function(HostService) {
			var directive = {
					scope: {
						step: '=',
						create: '='
					},
					restrict: 'AE',
					link: link,
					templateUrl: './app/home/update-information/step0/step0.html'
			};

			return directive;

			///////////////////////////////////////////////////////////////////////////

			function link(scope, element, attrs) {
				scope.newEntry = {};
				scope.submitEmail = submitEmail;

				function submitEmail() {
					scope.create(scope.newEntry);
					delete scope.newEntry;
				}
			}

		});
})();

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

	function TablesTonightService($http) {

		var svc = {};
		var location = null;
		var url = 'http://tablesTonight.herokuapp.com/';

		svc.currentLocation = currentLocation;
		svc.saveLocation = saveLocation;
		svc.dayClubList   = dayClubList();
		svc.nightClubList = nightClubList();
		svc.getUrl = getUrl;
		init();

		return svc;

		function init() {
			$http.get('http://localhost:1337/origin')
				.then(function(response) {
					if (response.data) {
						url = response.data;
					}
				});
		}

		function getUrl() {
			return url;
		}

		function currentLocation() {
			return location;
		}

		function saveLocation(newLocation) {
			location = newLocation;
		}

		function dayClubList() {
			return [
				{ name: 'Azure',
					fileName: '1oak'
				},
				{ name: 'Bare',
					fileName: '1oak'
				},
				{ name: 'Daylight',
					fileName: '1oak'
				},
				{ name: 'Drais Beach Club',
					fileName: '1oak'
				},
				{ name: 'Encore Beach Club',
					fileName: '1oak'
				},
				{ name: 'Foxtail Pool Club',
					fileName: '1oak'
				},
				{ name: 'Lavo Brunch',
					fileName: '1oak'
				},
				{ name: 'Liquid Pool',
					fileName: '1oak'
				},
				{ name: 'Marquee Day Club',
					fileName: '1oak'
				},
				{ name: 'Moorea Beach Club',
					fileName: '1oak'
				},
				{ name: 'Ditch Fridays',
					fileName: '1oak'
				},
				{ name: 'Rehab Beach Club',
					fileName: '1oak'
				},
				{ name: 'TAO Beach',
					fileName: '1oak'
				},
				{ name: 'Wet Republic',
					fileName: '1oak'
				}
			];
		}

		function nightClubList() {

			return [
				{ name: '1OAK',
					fileName: '1oak'
				},
				{ name: 'Drais',
					fileName: 'drais'
				},
				{ name: 'Foundation Room',
					fileName: 'foundation'
				},
				{ name: 'Foxtail',
					fileName: 'foxtail'
				},
				{ name: 'Hakkasan',
					fileName: 'hakkasan'
				},
				{ name: 'Hyde',
					fileName: 'hyde'
				},
				{ name: 'Lavo',
					fileName: 'lavo'
				},
				{ name: 'LAX',
					fileName: '1oak'
				},
				{ name: 'Light',
					fileName: '1oak'
				},
				{ name: 'Marquee',
					fileName: '1oak'
				},
				{ name: 'Omnia',
					fileName: '1oak'
				},
				{ name: 'Sayers Club',
					fileName: 'sayers'
				},
				{ name: 'Surrender',
					fileName: '1oak'
				},
				{ name: 'Tao',
					fileName: '1oak'
				},
				{ name: 'The Bank',
					fileName: '1oak'
				},
				{ name: 'XS',
					fileName: '1oak'
				}
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

	function HomeCtrl($scope, $ionicModal, $state, $timeout, HostService, TablesTonightService) {

		$scope.credentials       = {};
		$scope.updateInformation = false;
		$scope.login             = login;
		$scope.navigate          = navigate;
		$scope.openModal         = openModal;
		$scope.closeModal        = closeModal;
		$scope.signUp            = signUp;
		init();

		///////////////////////////////////////////////////////////////////////////

		function signUp() {
			$scope.updateInformation = 'step0';
		}

		function login() {
			HostService.login($scope.credentials)
				.then(function(host) {
					if (host.error) {
						return $scope.message = host.error;
					}
					$scope.updateInformation = 'step1';
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

		function closeModal(exitEarly) {
			if ($scope.updateInformation === 'step0' && !exitEarly) {
				$scope.message = "Thanks for signing up. You'll be receiving an e-mail with next steps shortly.";
				$timeout(function() {
					delete $scope.message;
				}, 5000);
				return $scope.updateInformation = false;
			}
			if (HostService.getHostInfo()) {
				$scope.updateInformation = 'step1';
			}
	    $scope.modal.remove();
			delete $scope.modal;
			init();
	  }

		function init() {
			$ionicModal.fromTemplateUrl('app/home/host-information.html', {
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

				$scope.$on('modal.removed', function() {
					if ($scope.updateInformation !== 'step1') {
						$timeout(function() {
							$scope.updateInformation = false;
						}, 500);
					}
			  });
			}
		}
	}
})();

angular
	.module('tablesTonight.home', [
		'app.home.host',
		'app.home.update-information',
		'tablesTonight.home.controller'
	]);

(function() {
	angular
		.module('app.home.host', [])
		.factory('HostService', function($http, TablesTonightService) {

			var svc                   = {};

			var hostInfo              = null;
			svc.create                = create;
			svc.login                 = login;
			svc.getHostInfo           = getHostInfo;
			svc.updateHostInformation = updateHostInformation
			svc.dayClubList           = TablesTonightService.dayClubList;
			svc.nightClubList         = TablesTonightService.nightClubList;

			return svc;

			function create(newUser) {
				return $http.post(TablesTonightService.getUrl() + 'host/create', newUser)
					.then(function(response) {
						if (!response.data.error) {
							return true;
						}
						return false;
					});
			}

			function login(credentials) {
				return $http.post(TablesTonightService.getUrl() + 'host/login', credentials)
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
				return $http.post(TablesTonightService.getUrl() + 'host/update', hostInfo)
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
			$scope.name = $stateParams.name;
			var type = $stateParams.type;
			getHosts($scope.name)
				.then(function(clubInfo) {
					$scope.info = clubInfo.info;
					$scope.hosts = clubInfo.hosts;
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

	function HostsService($http, TablesTonightService) {
		var svc = {};
		svc.getNightClubHosts = getNightClubHosts;
		svc.getDayClubHosts   = getDayClubHosts;
		svc.saveHost          = saveHost;
		svc.getHost           = getHost;
		return svc;

		function getNightClubHosts(nightclub) {
			return $http.get(TablesTonightService.getUrl() + 'nightclub/' + nightclub)
				.then(function(response) {
					return response.data;
				});
		}

		function getDayClubHosts(dayclub) {
			return $http.get(TablesTonightService.getUrl() + 'dayclub/' + dayclub)
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
				scope.create = create;
				scope.next   = next;
				scope.finish = finish;

				function create(newUser) {
					HostService.create(newUser)
						.then(function(hostCreated) {
							scope.close();
						});
				}

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
		'app.home.update-information.step0',
		'app.home.update-information.step1',
		'app.home.update-information.step2'
	]);

(function() {
	angular
		.module('app.home.update-information.step0', [])
		.directive('updateInformationStepZero', function(HostService) {
			var directive = {
					scope: {
						step: '=',
						create: '='
					},
					restrict: 'AE',
					link: link,
					templateUrl: './app/home/update-information/step0/step0.html'
			};

			return directive;

			///////////////////////////////////////////////////////////////////////////

			function link(scope, element, attrs) {
				scope.newEntry = {};
				scope.submitEmail = submitEmail;

				function submitEmail() {
					scope.create(scope.newEntry);
					delete scope.newEntry;
				}
			}

		});
})();

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

	function TablesTonightService($http) {

		var svc = {};
		var location = null;
		var url = 'http://tablesTonight.herokuapp.com/';

		svc.currentLocation = currentLocation;
		svc.saveLocation = saveLocation;
		svc.dayClubList   = dayClubList();
		svc.nightClubList = nightClubList();
		svc.getUrl = getUrl;
		init();

		return svc;

		function init() {
			$http.get('http://localhost:1337/origin')
				.then(function(response) {
					if (response.data) {
						url = response.data;
					}
				});
		}

		function getUrl() {
			return url;
		}

		function currentLocation() {
			return location;
		}

		function saveLocation(newLocation) {
			location = newLocation;
		}

		function dayClubList() {
			return [
				{ name: 'Azure',
					fileName: '1oak'
				},
				{ name: 'Bare',
					fileName: '1oak'
				},
				{ name: 'Daylight',
					fileName: '1oak'
				},
				{ name: 'Drais Beach Club',
					fileName: '1oak'
				},
				{ name: 'Encore Beach Club',
					fileName: '1oak'
				},
				{ name: 'Foxtail Pool Club',
					fileName: '1oak'
				},
				{ name: 'Lavo Brunch',
					fileName: '1oak'
				},
				{ name: 'Liquid Pool',
					fileName: '1oak'
				},
				{ name: 'Marquee Day Club',
					fileName: '1oak'
				},
				{ name: 'Moorea Beach Club',
					fileName: '1oak'
				},
				{ name: 'Ditch Fridays',
					fileName: '1oak'
				},
				{ name: 'Rehab Beach Club',
					fileName: '1oak'
				},
				{ name: 'TAO Beach',
					fileName: '1oak'
				},
				{ name: 'Wet Republic',
					fileName: '1oak'
				}
			];
		}

		function nightClubList() {

			return [
				{ name: '1OAK',
					fileName: '1oak'
				},
				{ name: 'Drais',
					fileName: 'drais'
				},
				{ name: 'Foundation Room',
					fileName: 'foundation'
				},
				{ name: 'Foxtail',
					fileName: 'foxtail'
				},
				{ name: 'Hakkasan',
					fileName: 'hakkasan'
				},
				{ name: 'Hyde',
					fileName: 'hyde'
				},
				{ name: 'Lavo',
					fileName: 'lavo'
				},
				{ name: 'LAX',
					fileName: '1oak'
				},
				{ name: 'Light',
					fileName: '1oak'
				},
				{ name: 'Marquee',
					fileName: '1oak'
				},
				{ name: 'Omnia',
					fileName: '1oak'
				},
				{ name: 'Sayers Club',
					fileName: 'sayers'
				},
				{ name: 'Surrender',
					fileName: '1oak'
				},
				{ name: 'Tao',
					fileName: '1oak'
				},
				{ name: 'The Bank',
					fileName: '1oak'
				},
				{ name: 'XS',
					fileName: '1oak'
				}
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

	function HomeCtrl($scope, $ionicModal, $state, $timeout, HostService, TablesTonightService) {

		$scope.credentials       = {};
		$scope.updateInformation = false;
		$scope.login             = login;
		$scope.navigate          = navigate;
		$scope.openModal         = openModal;
		$scope.closeModal        = closeModal;
		$scope.signUp            = signUp;
		init();

		///////////////////////////////////////////////////////////////////////////

		function signUp() {
			$scope.updateInformation = 'step0';
		}

		function login() {
			HostService.login($scope.credentials)
				.then(function(host) {
					if (host.error) {
						return $scope.message = host.error;
					}
					$scope.updateInformation = 'step1';
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

		function closeModal(exitEarly) {
			if ($scope.updateInformation === 'step0' && !exitEarly) {
				$scope.message = "Thanks for signing up. You'll be receiving an e-mail with next steps shortly.";
				$timeout(function() {
					delete $scope.message;
				}, 5000);
				return $scope.updateInformation = false;
			}
			if (HostService.getHostInfo()) {
				$scope.updateInformation = 'step1';
			}
	    $scope.modal.remove();
			delete $scope.modal;
			init();
	  }

		function init() {
			$ionicModal.fromTemplateUrl('app/home/host-information.html', {
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

				$scope.$on('modal.removed', function() {
					if ($scope.updateInformation !== 'step1') {
						$timeout(function() {
							$scope.updateInformation = false;
						}, 500);
					}
			  });
			}
		}
	}
})();

angular
	.module('tablesTonight.home', [
		'app.home.host',
		'app.home.update-information',
		'tablesTonight.home.controller'
	]);

(function() {
	angular
		.module('app.home.host', [])
		.factory('HostService', function($http, TablesTonightService) {

			var svc                   = {};

			var hostInfo              = null;
			svc.create                = create;
			svc.login                 = login;
			svc.getHostInfo           = getHostInfo;
			svc.updateHostInformation = updateHostInformation
			svc.dayClubList           = TablesTonightService.dayClubList;
			svc.nightClubList         = TablesTonightService.nightClubList;

			return svc;

			function create(newUser) {
				return $http.post(TablesTonightService.getUrl() + 'host/create', newUser)
					.then(function(response) {
						if (!response.data.error) {
							return true;
						}
						return false;
					});
			}

			function login(credentials) {
				return $http.post(TablesTonightService.getUrl() + 'host/login', credentials)
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
				return $http.post(TablesTonightService.getUrl() + 'host/update', hostInfo)
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
			$scope.loading = true;
			$scope.name = $stateParams.name;
			var type = $stateParams.type;
			getHosts($scope.name)
				.then(function(clubInfo) {
					$scope.loading = false;
					$scope.info = clubInfo.info;
					$scope.hosts = clubInfo.hosts;
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

	function HostsService($http, TablesTonightService) {
		var svc = {};
		svc.getNightClubHosts = getNightClubHosts;
		svc.getDayClubHosts   = getDayClubHosts;
		svc.saveHost          = saveHost;
		svc.getHost           = getHost;
		return svc;

		function getNightClubHosts(nightclub) {
			return $http.get(TablesTonightService.getUrl() + 'nightclub/' + nightclub)
				.then(function(response) {
					return response.data;
				});
		}

		function getDayClubHosts(dayclub) {
			return $http.get(TablesTonightService.getUrl() + 'dayclub/' + dayclub)
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
				scope.create = create;
				scope.next   = next;
				scope.finish = finish;

				function create(newUser) {
					HostService.create(newUser)
						.then(function(hostCreated) {
							scope.close();
						});
				}

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
		'app.home.update-information.step0',
		'app.home.update-information.step1',
		'app.home.update-information.step2'
	]);

(function() {
	angular
		.module('app.home.update-information.step0', [])
		.directive('updateInformationStepZero', function(HostService) {
			var directive = {
					scope: {
						step: '=',
						create: '='
					},
					restrict: 'AE',
					link: link,
					templateUrl: './app/home/update-information/step0/step0.html'
			};

			return directive;

			///////////////////////////////////////////////////////////////////////////

			function link(scope, element, attrs) {
				scope.newEntry = {};
				scope.submitEmail = submitEmail;

				function submitEmail() {
					scope.create(scope.newEntry);
					delete scope.newEntry;
				}
			}

		});
})();

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

	function TablesTonightService($http) {

		var svc = {};
		var location = null;
		var url = 'http://tablesTonight.herokuapp.com/';

		svc.currentLocation = currentLocation;
		svc.saveLocation = saveLocation;
		svc.dayClubList   = dayClubList();
		svc.nightClubList = nightClubList();
		svc.getUrl = getUrl;
		init();

		return svc;

		function init() {
			$http.get('http://localhost:1337/origin')
				.then(function(response) {
					if (response.data) {
						url = response.data;
					}
				});
		}

		function getUrl() {
			return url;
		}

		function currentLocation() {
			return location;
		}

		function saveLocation(newLocation) {
			location = newLocation;
		}

		function dayClubList() {
			return [
				{ name: 'Azure',
					fileName: '1oak'
				},
				{ name: 'Bare',
					fileName: '1oak'
				},
				{ name: 'Daylight',
					fileName: '1oak'
				},
				{ name: 'Drais Beach Club',
					fileName: '1oak'
				},
				{ name: 'Encore Beach Club',
					fileName: '1oak'
				},
				{ name: 'Foxtail Pool Club',
					fileName: '1oak'
				},
				{ name: 'Lavo Brunch',
					fileName: '1oak'
				},
				{ name: 'Liquid Pool',
					fileName: '1oak'
				},
				{ name: 'Marquee Day Club',
					fileName: '1oak'
				},
				{ name: 'Moorea Beach Club',
					fileName: '1oak'
				},
				{ name: 'Ditch Fridays',
					fileName: '1oak'
				},
				{ name: 'Rehab Beach Club',
					fileName: '1oak'
				},
				{ name: 'TAO Beach',
					fileName: '1oak'
				},
				{ name: 'Wet Republic',
					fileName: '1oak'
				}
			];
		}

		function nightClubList() {

			return [
				{ name: '1OAK',
					fileName: '1oak'
				},
				{ name: 'Drais',
					fileName: 'drais'
				},
				{ name: 'Foundation Room',
					fileName: 'foundation'
				},
				{ name: 'Foxtail',
					fileName: 'foxtail'
				},
				{ name: 'Hakkasan',
					fileName: 'hakkasan'
				},
				{ name: 'Hyde',
					fileName: 'hyde'
				},
				{ name: 'Lavo',
					fileName: 'lavo'
				},
				{ name: 'LAX',
					fileName: '1oak'
				},
				{ name: 'Light',
					fileName: '1oak'
				},
				{ name: 'Marquee',
					fileName: '1oak'
				},
				{ name: 'Omnia',
					fileName: '1oak'
				},
				{ name: 'Sayers Club',
					fileName: 'sayers'
				},
				{ name: 'Surrender',
					fileName: '1oak'
				},
				{ name: 'Tao',
					fileName: '1oak'
				},
				{ name: 'The Bank',
					fileName: '1oak'
				},
				{ name: 'XS',
					fileName: '1oak'
				}
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

	function HomeCtrl($scope, $ionicModal, $state, $timeout, HostService, TablesTonightService) {

		$scope.credentials       = {};
		$scope.updateInformation = false;
		$scope.login             = login;
		$scope.navigate          = navigate;
		$scope.openModal         = openModal;
		$scope.closeModal        = closeModal;
		$scope.signUp            = signUp;
		init();

		///////////////////////////////////////////////////////////////////////////

		function signUp() {
			$scope.updateInformation = 'step0';
		}

		function login() {
			HostService.login($scope.credentials)
				.then(function(host) {
					if (host.error) {
						return $scope.message = host.error;
					}
					$scope.updateInformation = 'step1';
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

		function closeModal(exitEarly) {
			if ($scope.updateInformation === 'step0' && !exitEarly) {
				$scope.message = "Thanks for signing up. You'll be receiving an e-mail with next steps shortly.";
				$timeout(function() {
					delete $scope.message;
				}, 5000);
				return $scope.updateInformation = false;
			}
			if (HostService.getHostInfo()) {
				$scope.updateInformation = 'step1';
			}
	    $scope.modal.remove();
			delete $scope.modal;
			init();
	  }

		function init() {
			$ionicModal.fromTemplateUrl('app/home/host-information.html', {
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

				$scope.$on('modal.removed', function() {
					if ($scope.updateInformation !== 'step1') {
						$timeout(function() {
							$scope.updateInformation = false;
						}, 500);
					}
			  });
			}
		}
	}
})();

angular
	.module('tablesTonight.home', [
		'app.home.host',
		'app.home.update-information',
		'tablesTonight.home.controller'
	]);

(function() {
	angular
		.module('app.home.host', [])
		.factory('HostService', function($http, TablesTonightService) {

			var svc                   = {};

			var hostInfo              = null;
			svc.create                = create;
			svc.login                 = login;
			svc.getHostInfo           = getHostInfo;
			svc.updateHostInformation = updateHostInformation
			svc.dayClubList           = TablesTonightService.dayClubList;
			svc.nightClubList         = TablesTonightService.nightClubList;

			return svc;

			function create(newUser) {
				return $http.post(TablesTonightService.getUrl() + 'host/create', newUser)
					.then(function(response) {
						if (!response.data.error) {
							return true;
						}
						return false;
					});
			}

			function login(credentials) {
				return $http.post(TablesTonightService.getUrl() + 'host/login', credentials)
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
				return $http.post(TablesTonightService.getUrl() + 'host/update', hostInfo)
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
			$scope.loading = true;
			$scope.name = $stateParams.name;
			var type = $stateParams.type;
			getHosts($scope.name)
				.then(function(clubInfo) {
					$scope.loading = false;
					$scope.info = clubInfo.info;
					$scope.hosts = clubInfo.hosts;
				});
	  });

		$scope.$on("$ionicView.afterLeave", function(HostDetailCtrl) {
			delete $scope.info;
			delete $scope.hosts;
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

	function HostsService($http, TablesTonightService) {
		var svc = {};
		svc.getNightClubHosts = getNightClubHosts;
		svc.getDayClubHosts   = getDayClubHosts;
		svc.saveHost          = saveHost;
		svc.getHost           = getHost;
		return svc;

		function getNightClubHosts(nightclub) {
			return $http.get(TablesTonightService.getUrl() + 'nightclub/' + nightclub)
				.then(function(response) {
					return response.data;
				});
		}

		function getDayClubHosts(dayclub) {
			return $http.get(TablesTonightService.getUrl() + 'dayclub/' + dayclub)
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
				scope.create = create;
				scope.next   = next;
				scope.finish = finish;

				function create(newUser) {
					HostService.create(newUser)
						.then(function(hostCreated) {
							scope.close();
						});
				}

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
		'app.home.update-information.step0',
		'app.home.update-information.step1',
		'app.home.update-information.step2'
	]);

(function() {
	angular
		.module('app.home.update-information.step0', [])
		.directive('updateInformationStepZero', function(HostService) {
			var directive = {
					scope: {
						step: '=',
						create: '='
					},
					restrict: 'AE',
					link: link,
					templateUrl: './app/home/update-information/step0/step0.html'
			};

			return directive;

			///////////////////////////////////////////////////////////////////////////

			function link(scope, element, attrs) {
				scope.newEntry = {};
				scope.submitEmail = submitEmail;

				function submitEmail() {
					scope.create(scope.newEntry);
					delete scope.newEntry;
				}
			}

		});
})();

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

	function TablesTonightService($http) {

		var svc = {};
		var location = null;
		var url = 'http://tablesTonight.herokuapp.com/';

		svc.currentLocation = currentLocation;
		svc.saveLocation = saveLocation;
		svc.dayClubList   = dayClubList();
		svc.nightClubList = nightClubList();
		svc.getUrl = getUrl;
		init();

		return svc;

		function init() {
			$http.get('http://localhost:1337/origin')
				.then(function(response) {
					if (response.data) {
						url = response.data;
					}
				});
		}

		function getUrl() {
			return url;
		}

		function currentLocation() {
			return location;
		}

		function saveLocation(newLocation) {
			location = newLocation;
		}

		function dayClubList() {
			return [
				{ name: 'Azure',
					fileName: '1oak'
				},
				{ name: 'Bare',
					fileName: '1oak'
				},
				{ name: 'Daylight',
					fileName: '1oak'
				},
				{ name: 'Drais Beach Club',
					fileName: '1oak'
				},
				{ name: 'Encore Beach Club',
					fileName: '1oak'
				},
				{ name: 'Foxtail Pool Club',
					fileName: '1oak'
				},
				{ name: 'Lavo Brunch',
					fileName: '1oak'
				},
				{ name: 'Liquid Pool',
					fileName: '1oak'
				},
				{ name: 'Marquee Day Club',
					fileName: '1oak'
				},
				{ name: 'Moorea Beach Club',
					fileName: '1oak'
				},
				{ name: 'Ditch Fridays',
					fileName: '1oak'
				},
				{ name: 'Rehab Beach Club',
					fileName: '1oak'
				},
				{ name: 'TAO Beach',
					fileName: '1oak'
				},
				{ name: 'Wet Republic',
					fileName: '1oak'
				}
			];
		}

		function nightClubList() {

			return [
				{ name: '1OAK',
					fileName: '1oak'
				},
				{ name: 'Drais',
					fileName: 'drais'
				},
				{ name: 'Foundation Room',
					fileName: 'foundation'
				},
				{ name: 'Foxtail',
					fileName: 'foxtail'
				},
				{ name: 'Hakkasan',
					fileName: 'hakkasan'
				},
				{ name: 'Hyde',
					fileName: 'hyde'
				},
				{ name: 'Lavo',
					fileName: 'lavo'
				},
				{ name: 'LAX',
					fileName: '1oak'
				},
				{ name: 'Light',
					fileName: '1oak'
				},
				{ name: 'Marquee',
					fileName: '1oak'
				},
				{ name: 'Omnia',
					fileName: '1oak'
				},
				{ name: 'Sayers Club',
					fileName: 'sayers'
				},
				{ name: 'Surrender',
					fileName: '1oak'
				},
				{ name: 'Tao',
					fileName: '1oak'
				},
				{ name: 'The Bank',
					fileName: '1oak'
				},
				{ name: 'XS',
					fileName: '1oak'
				}
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

	function HomeCtrl($scope, $ionicModal, $state, $timeout, HostService, TablesTonightService) {

		$scope.credentials       = {};
		$scope.updateInformation = false;
		$scope.login             = login;
		$scope.navigate          = navigate;
		$scope.openModal         = openModal;
		$scope.closeModal        = closeModal;
		$scope.signUp            = signUp;
		init();

		///////////////////////////////////////////////////////////////////////////

		function signUp() {
			$scope.updateInformation = 'step0';
		}

		function login() {
			HostService.login($scope.credentials)
				.then(function(host) {
					if (host.error) {
						return $scope.message = host.error;
					}
					$scope.updateInformation = 'step1';
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

		function closeModal(exitEarly) {
			if ($scope.updateInformation === 'step0' && !exitEarly) {
				$scope.message = "Thanks for signing up. You'll be receiving an e-mail with next steps shortly.";
				$timeout(function() {
					delete $scope.message;
				}, 5000);
				return $scope.updateInformation = false;
			}
			if (HostService.getHostInfo()) {
				$scope.updateInformation = 'step1';
			}
	    $scope.modal.remove();
			delete $scope.modal;
			init();
	  }

		function init() {
			$ionicModal.fromTemplateUrl('app/home/host-information.html', {
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

				$scope.$on('modal.removed', function() {
					if ($scope.updateInformation !== 'step1') {
						$timeout(function() {
							$scope.updateInformation = false;
						}, 500);
					}
			  });
			}
		}
	}
})();

angular
	.module('tablesTonight.home', [
		'app.home.host',
		'app.home.update-information',
		'tablesTonight.home.controller'
	]);

(function() {
	angular
		.module('app.home.host', [])
		.factory('HostService', function($http, TablesTonightService) {

			var svc                   = {};

			var hostInfo              = null;
			svc.create                = create;
			svc.login                 = login;
			svc.getHostInfo           = getHostInfo;
			svc.updateHostInformation = updateHostInformation
			svc.dayClubList           = TablesTonightService.dayClubList;
			svc.nightClubList         = TablesTonightService.nightClubList;

			return svc;

			function create(newUser) {
				return $http.post(TablesTonightService.getUrl() + 'host/create', newUser)
					.then(function(response) {
						if (!response.data.error) {
							return true;
						}
						return false;
					});
			}

			function login(credentials) {
				return $http.post(TablesTonightService.getUrl() + 'host/login', credentials)
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
				return $http.post(TablesTonightService.getUrl() + 'host/update', hostInfo)
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
			$scope.loading = true;
			$scope.name = $stateParams.name;
			var type = $stateParams.type;
			getHosts($scope.name)
				.then(function(clubInfo) {
					console.log("finished");
					$scope.loading = false;
					$scope.info = clubInfo.info;
					$scope.hosts = clubInfo.hosts;
				});
	  });

		$scope.$on("$ionicView.afterLeave", function(HostDetailCtrl) {
			delete $scope.info;
			delete $scope.hosts;
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

	function HostsService($http, TablesTonightService) {
		var svc = {};
		svc.getNightClubHosts = getNightClubHosts;
		svc.getDayClubHosts   = getDayClubHosts;
		svc.saveHost          = saveHost;
		svc.getHost           = getHost;
		return svc;

		function getNightClubHosts(nightclub) {
			return $http.get(TablesTonightService.getUrl() + 'nightclub/' + nightclub)
				.then(function(response) {
					return response.data;
				});
		}

		function getDayClubHosts(dayclub) {
			return $http.get(TablesTonightService.getUrl() + 'dayclub/' + dayclub)
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
				scope.create = create;
				scope.next   = next;
				scope.finish = finish;

				function create(newUser) {
					HostService.create(newUser)
						.then(function(hostCreated) {
							scope.close();
						});
				}

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
		'app.home.update-information.step0',
		'app.home.update-information.step1',
		'app.home.update-information.step2'
	]);

(function() {
	angular
		.module('app.home.update-information.step0', [])
		.directive('updateInformationStepZero', function(HostService) {
			var directive = {
					scope: {
						step: '=',
						create: '='
					},
					restrict: 'AE',
					link: link,
					templateUrl: './app/home/update-information/step0/step0.html'
			};

			return directive;

			///////////////////////////////////////////////////////////////////////////

			function link(scope, element, attrs) {
				scope.newEntry = {};
				scope.submitEmail = submitEmail;

				function submitEmail() {
					scope.create(scope.newEntry);
					delete scope.newEntry;
				}
			}

		});
})();

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

	function TablesTonightService($http) {

		var svc = {};
		var location = null;
		var url = 'http://tablesTonight.herokuapp.com/';

		svc.currentLocation = currentLocation;
		svc.saveLocation = saveLocation;
		svc.dayClubList   = dayClubList();
		svc.nightClubList = nightClubList();
		svc.getUrl = getUrl;
		init();

		return svc;

		function init() {
			$http.get('http://localhost:1337/origin')
				.then(function(response) {
					if (response.data) {
						url = response.data;
					}
				});
		}

		function getUrl() {
			return url;
		}

		function currentLocation() {
			return location;
		}

		function saveLocation(newLocation) {
			location = newLocation;
		}

		function dayClubList() {
			return [
				{ name: 'Azure',
					fileName: '1oak'
				},
				{ name: 'Bare',
					fileName: '1oak'
				},
				{ name: 'Daylight',
					fileName: '1oak'
				},
				{ name: 'Drais Beach Club',
					fileName: '1oak'
				},
				{ name: 'Encore Beach Club',
					fileName: '1oak'
				},
				{ name: 'Foxtail Pool Club',
					fileName: '1oak'
				},
				{ name: 'Lavo Brunch',
					fileName: '1oak'
				},
				{ name: 'Liquid Pool',
					fileName: '1oak'
				},
				{ name: 'Marquee Day Club',
					fileName: '1oak'
				},
				{ name: 'Moorea Beach Club',
					fileName: '1oak'
				},
				{ name: 'Ditch Fridays',
					fileName: '1oak'
				},
				{ name: 'Rehab Beach Club',
					fileName: '1oak'
				},
				{ name: 'TAO Beach',
					fileName: '1oak'
				},
				{ name: 'Wet Republic',
					fileName: '1oak'
				}
			];
		}

		function nightClubList() {

			return [
				{ name: '1OAK',
					fileName: '1oak'
				},
				{ name: 'Drais',
					fileName: 'drais'
				},
				{ name: 'Foundation Room',
					fileName: 'foundation'
				},
				{ name: 'Foxtail',
					fileName: 'foxtail'
				},
				{ name: 'Hakkasan',
					fileName: 'hakkasan'
				},
				{ name: 'Hyde',
					fileName: 'hyde'
				},
				{ name: 'Lavo',
					fileName: 'lavo'
				},
				{ name: 'LAX',
					fileName: '1oak'
				},
				{ name: 'Light',
					fileName: '1oak'
				},
				{ name: 'Marquee',
					fileName: '1oak'
				},
				{ name: 'Omnia',
					fileName: '1oak'
				},
				{ name: 'Sayers Club',
					fileName: 'sayers'
				},
				{ name: 'Surrender',
					fileName: '1oak'
				},
				{ name: 'Tao',
					fileName: '1oak'
				},
				{ name: 'The Bank',
					fileName: '1oak'
				},
				{ name: 'XS',
					fileName: '1oak'
				}
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

	function HomeCtrl($scope, $ionicModal, $state, $timeout, HostService, TablesTonightService) {

		$scope.credentials       = {};
		$scope.updateInformation = false;
		$scope.login             = login;
		$scope.navigate          = navigate;
		$scope.openModal         = openModal;
		$scope.closeModal        = closeModal;
		$scope.signUp            = signUp;
		init();

		///////////////////////////////////////////////////////////////////////////

		function signUp() {
			$scope.updateInformation = 'step0';
		}

		function login() {
			HostService.login($scope.credentials)
				.then(function(host) {
					if (host.error) {
						return $scope.message = host.error;
					}
					$scope.updateInformation = 'step1';
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

		function closeModal(exitEarly) {
			if ($scope.updateInformation === 'step0' && !exitEarly) {
				$scope.message = "Thanks for signing up. You'll be receiving an e-mail with next steps shortly.";
				$timeout(function() {
					delete $scope.message;
				}, 5000);
				return $scope.updateInformation = false;
			}
			if (HostService.getHostInfo()) {
				$scope.updateInformation = 'step1';
			}
	    $scope.modal.remove();
			delete $scope.modal;
			init();
	  }

		function init() {
			$ionicModal.fromTemplateUrl('app/home/host-information.html', {
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

				$scope.$on('modal.removed', function() {
					if ($scope.updateInformation !== 'step1') {
						$timeout(function() {
							$scope.updateInformation = false;
						}, 500);
					}
			  });
			}
		}
	}
})();

angular
	.module('tablesTonight.home', [
		'app.home.host',
		'app.home.update-information',
		'tablesTonight.home.controller'
	]);

(function() {
	angular
		.module('app.home.host', [])
		.factory('HostService', function($http, TablesTonightService) {

			var svc                   = {};

			var hostInfo              = null;
			svc.create                = create;
			svc.login                 = login;
			svc.getHostInfo           = getHostInfo;
			svc.updateHostInformation = updateHostInformation
			svc.dayClubList           = TablesTonightService.dayClubList;
			svc.nightClubList         = TablesTonightService.nightClubList;

			return svc;

			function create(newUser) {
				return $http.post(TablesTonightService.getUrl() + 'host/create', newUser)
					.then(function(response) {
						if (!response.data.error) {
							return true;
						}
						return false;
					});
			}

			function login(credentials) {
				return $http.post(TablesTonightService.getUrl() + 'host/login', credentials)
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
				return $http.post(TablesTonightService.getUrl() + 'host/update', hostInfo)
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
			$scope.loading = true;
			$scope.name = $stateParams.name;
			var type = $stateParams.type;
			getHosts($scope.name)
				.then(function(clubInfo) {
					console.log("finished");
					$scope.loading = false;
					$scope.info = clubInfo.info;
					$scope.hosts = clubInfo.hosts;
				});
	  });

		$scope.$on("$ionicView.afterLeave", function(HostDetailCtrl) {
			delete $scope.info;
			delete $scope.hosts;
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

	function HostsService($http, TablesTonightService) {
		var svc = {};
		svc.getNightClubHosts = getNightClubHosts;
		svc.getDayClubHosts   = getDayClubHosts;
		svc.saveHost          = saveHost;
		svc.getHost           = getHost;
		return svc;

		function getNightClubHosts(nightclub) {
			return $http.get(TablesTonightService.getUrl() + 'nightclub/' + nightclub)
				.then(function(response) {
					return response.data;
				});
		}

		function getDayClubHosts(dayclub) {
			return $http.get(TablesTonightService.getUrl() + 'dayclub/' + dayclub)
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
				scope.create = create;
				scope.next   = next;
				scope.finish = finish;

				function create(newUser) {
					HostService.create(newUser)
						.then(function(hostCreated) {
							scope.close();
						});
				}

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
		'app.home.update-information.step0',
		'app.home.update-information.step1',
		'app.home.update-information.step2'
	]);

(function() {
	angular
		.module('app.home.update-information.step0', [])
		.directive('updateInformationStepZero', function(HostService) {
			var directive = {
					scope: {
						step: '=',
						create: '='
					},
					restrict: 'AE',
					link: link,
					templateUrl: './app/home/update-information/step0/step0.html'
			};

			return directive;

			///////////////////////////////////////////////////////////////////////////

			function link(scope, element, attrs) {
				scope.newEntry = {};
				scope.submitEmail = submitEmail;

				function submitEmail() {
					scope.create(scope.newEntry);
					delete scope.newEntry;
				}
			}

		});
})();

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

	function TablesTonightService($http) {

		var svc = {};
		var location = null;
		var url = 'http://tablesTonight.herokuapp.com/';

		svc.currentLocation = currentLocation;
		svc.saveLocation = saveLocation;
		svc.dayClubList   = dayClubList();
		svc.nightClubList = nightClubList();
		svc.getUrl = getUrl;
		init();

		return svc;

		function init() {
			$http.get('http://localhost:1337/origin')
				.then(function(response) {
					if (response.data) {
						url = response.data;
					}
				});
		}

		function getUrl() {
			return url;
		}

		function currentLocation() {
			return location;
		}

		function saveLocation(newLocation) {
			location = newLocation;
		}

		function dayClubList() {
			return [
				{ name: 'Azure',
					fileName: '1oak'
				},
				{ name: 'Bare',
					fileName: '1oak'
				},
				{ name: 'Daylight',
					fileName: '1oak'
				},
				{ name: 'Drais Beach Club',
					fileName: '1oak'
				},
				{ name: 'Encore Beach Club',
					fileName: '1oak'
				},
				{ name: 'Foxtail Pool Club',
					fileName: '1oak'
				},
				{ name: 'Lavo Brunch',
					fileName: '1oak'
				},
				{ name: 'Liquid Pool',
					fileName: '1oak'
				},
				{ name: 'Marquee Day Club',
					fileName: '1oak'
				},
				{ name: 'Moorea Beach Club',
					fileName: '1oak'
				},
				{ name: 'Ditch Fridays',
					fileName: '1oak'
				},
				{ name: 'Rehab Beach Club',
					fileName: '1oak'
				},
				{ name: 'TAO Beach',
					fileName: '1oak'
				},
				{ name: 'Wet Republic',
					fileName: '1oak'
				}
			];
		}

		function nightClubList() {

			return [
				{ name: '1OAK',
					fileName: '1oak'
				},
				{ name: 'Drais',
					fileName: 'drais'
				},
				{ name: 'Foundation Room',
					fileName: 'foundation'
				},
				{ name: 'Foxtail',
					fileName: 'foxtail'
				},
				{ name: 'Hakkasan',
					fileName: 'hakkasan'
				},
				{ name: 'Hyde',
					fileName: 'hyde'
				},
				{ name: 'Lavo',
					fileName: 'lavo'
				},
				{ name: 'LAX',
					fileName: 'lax'
				},
				{ name: 'Light',
					fileName: '1oak'
				},
				{ name: 'Marquee',
					fileName: '1oak'
				},
				{ name: 'Omnia',
					fileName: '1oak'
				},
				{ name: 'Sayers Club',
					fileName: 'sayers'
				},
				{ name: 'Surrender',
					fileName: '1oak'
				},
				{ name: 'Tao',
					fileName: '1oak'
				},
				{ name: 'The Bank',
					fileName: '1oak'
				},
				{ name: 'XS',
					fileName: '1oak'
				}
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

	function HomeCtrl($scope, $ionicModal, $state, $timeout, HostService, TablesTonightService) {

		$scope.credentials       = {};
		$scope.updateInformation = false;
		$scope.login             = login;
		$scope.navigate          = navigate;
		$scope.openModal         = openModal;
		$scope.closeModal        = closeModal;
		$scope.signUp            = signUp;
		init();

		///////////////////////////////////////////////////////////////////////////

		function signUp() {
			$scope.updateInformation = 'step0';
		}

		function login() {
			HostService.login($scope.credentials)
				.then(function(host) {
					if (host.error) {
						return $scope.message = host.error;
					}
					$scope.updateInformation = 'step1';
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

		function closeModal(exitEarly) {
			if ($scope.updateInformation === 'step0' && !exitEarly) {
				$scope.message = "Thanks for signing up. You'll be receiving an e-mail with next steps shortly.";
				$timeout(function() {
					delete $scope.message;
				}, 5000);
				return $scope.updateInformation = false;
			}
			if (HostService.getHostInfo()) {
				$scope.updateInformation = 'step1';
			}
	    $scope.modal.remove();
			delete $scope.modal;
			init();
	  }

		function init() {
			$ionicModal.fromTemplateUrl('app/home/host-information.html', {
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

				$scope.$on('modal.removed', function() {
					if ($scope.updateInformation !== 'step1') {
						$timeout(function() {
							$scope.updateInformation = false;
						}, 500);
					}
			  });
			}
		}
	}
})();

angular
	.module('tablesTonight.home', [
		'app.home.host',
		'app.home.update-information',
		'tablesTonight.home.controller'
	]);

(function() {
	angular
		.module('app.home.host', [])
		.factory('HostService', function($http, TablesTonightService) {

			var svc                   = {};

			var hostInfo              = null;
			svc.create                = create;
			svc.login                 = login;
			svc.getHostInfo           = getHostInfo;
			svc.updateHostInformation = updateHostInformation
			svc.dayClubList           = TablesTonightService.dayClubList;
			svc.nightClubList         = TablesTonightService.nightClubList;

			return svc;

			function create(newUser) {
				return $http.post(TablesTonightService.getUrl() + 'host/create', newUser)
					.then(function(response) {
						if (!response.data.error) {
							return true;
						}
						return false;
					});
			}

			function login(credentials) {
				return $http.post(TablesTonightService.getUrl() + 'host/login', credentials)
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
				return $http.post(TablesTonightService.getUrl() + 'host/update', hostInfo)
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
			$scope.loading = true;
			$scope.name = $stateParams.name;
			var type = $stateParams.type;
			getHosts($scope.name)
				.then(function(clubInfo) {
					console.log("finished");
					$scope.loading = false;
					$scope.info = clubInfo.info;
					$scope.hosts = clubInfo.hosts;
				});
	  });

		$scope.$on("$ionicView.afterLeave", function(HostDetailCtrl) {
			delete $scope.info;
			delete $scope.hosts;
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

	function HostsService($http, TablesTonightService) {
		var svc = {};
		svc.getNightClubHosts = getNightClubHosts;
		svc.getDayClubHosts   = getDayClubHosts;
		svc.saveHost          = saveHost;
		svc.getHost           = getHost;
		return svc;

		function getNightClubHosts(nightclub) {
			return $http.get(TablesTonightService.getUrl() + 'nightclub/' + nightclub)
				.then(function(response) {
					return response.data;
				});
		}

		function getDayClubHosts(dayclub) {
			return $http.get(TablesTonightService.getUrl() + 'dayclub/' + dayclub)
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
				scope.create = create;
				scope.next   = next;
				scope.finish = finish;

				function create(newUser) {
					HostService.create(newUser)
						.then(function(hostCreated) {
							scope.close();
						});
				}

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
		'app.home.update-information.step0',
		'app.home.update-information.step1',
		'app.home.update-information.step2'
	]);

(function() {
	angular
		.module('app.home.update-information.step0', [])
		.directive('updateInformationStepZero', function(HostService) {
			var directive = {
					scope: {
						step: '=',
						create: '='
					},
					restrict: 'AE',
					link: link,
					templateUrl: './app/home/update-information/step0/step0.html'
			};

			return directive;

			///////////////////////////////////////////////////////////////////////////

			function link(scope, element, attrs) {
				scope.newEntry = {};
				scope.submitEmail = submitEmail;

				function submitEmail() {
					scope.create(scope.newEntry);
					delete scope.newEntry;
				}
			}

		});
})();

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

	function TablesTonightService($http) {

		var svc = {};
		var location = null;
		var url = 'http://tablesTonight.herokuapp.com/';

		svc.currentLocation = currentLocation;
		svc.saveLocation = saveLocation;
		svc.dayClubList   = dayClubList();
		svc.nightClubList = nightClubList();
		svc.getUrl = getUrl;
		init();

		return svc;

		function init() {
			$http.get('http://localhost:1337/origin')
				.then(function(response) {
					if (response.data) {
						url = response.data;
					}
				});
		}

		function getUrl() {
			return url;
		}

		function currentLocation() {
			return location;
		}

		function saveLocation(newLocation) {
			location = newLocation;
		}

		function dayClubList() {
			return [
				{ name: 'Azure',
					fileName: '1oak'
				},
				{ name: 'Bare',
					fileName: '1oak'
				},
				{ name: 'Daylight',
					fileName: '1oak'
				},
				{ name: 'Drais Beach Club',
					fileName: '1oak'
				},
				{ name: 'Encore Beach Club',
					fileName: '1oak'
				},
				{ name: 'Foxtail Pool Club',
					fileName: '1oak'
				},
				{ name: 'Lavo Brunch',
					fileName: '1oak'
				},
				{ name: 'Liquid Pool',
					fileName: '1oak'
				},
				{ name: 'Marquee Day Club',
					fileName: '1oak'
				},
				{ name: 'Moorea Beach Club',
					fileName: '1oak'
				},
				{ name: 'Ditch Fridays',
					fileName: '1oak'
				},
				{ name: 'Rehab Beach Club',
					fileName: '1oak'
				},
				{ name: 'TAO Beach',
					fileName: '1oak'
				},
				{ name: 'Wet Republic',
					fileName: '1oak'
				}
			];
		}

		function nightClubList() {

			return [
				{ name: '1OAK',
					fileName: '1oak'
				},
				{ name: 'Drais',
					fileName: 'drais'
				},
				{ name: 'Foundation Room',
					fileName: 'foundation'
				},
				{ name: 'Foxtail',
					fileName: 'foxtail'
				},
				{ name: 'Hakkasan',
					fileName: 'hakkasan'
				},
				{ name: 'Hyde',
					fileName: 'hyde'
				},
				{ name: 'Lavo',
					fileName: 'lavo'
				},
				{ name: 'LAX',
					fileName: 'lax'
				},
				{ name: 'Light',
					fileName: 'light'
				},
				{ name: 'Marquee',
					fileName: 'marquee'
				},
				{ name: 'Omnia',
					fileName: 'omnia'
				},
				{ name: 'Sayers Club',
					fileName: 'sayers'
				},
				{ name: 'Surrender',
					fileName: 'surrender'
				},
				{ name: 'Tao',
					fileName: '1oak'
				},
				{ name: 'The Bank',
					fileName: '1oak'
				},
				{ name: 'XS',
					fileName: '1oak'
				}
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

	function HomeCtrl($scope, $ionicModal, $state, $timeout, HostService, TablesTonightService) {

		$scope.credentials       = {};
		$scope.updateInformation = false;
		$scope.login             = login;
		$scope.navigate          = navigate;
		$scope.openModal         = openModal;
		$scope.closeModal        = closeModal;
		$scope.signUp            = signUp;
		init();

		///////////////////////////////////////////////////////////////////////////

		function signUp() {
			$scope.updateInformation = 'step0';
		}

		function login() {
			HostService.login($scope.credentials)
				.then(function(host) {
					if (host.error) {
						return $scope.message = host.error;
					}
					$scope.updateInformation = 'step1';
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

		function closeModal(exitEarly) {
			if ($scope.updateInformation === 'step0' && !exitEarly) {
				$scope.message = "Thanks for signing up. You'll be receiving an e-mail with next steps shortly.";
				$timeout(function() {
					delete $scope.message;
				}, 5000);
				return $scope.updateInformation = false;
			}
			if (HostService.getHostInfo()) {
				$scope.updateInformation = 'step1';
			}
	    $scope.modal.remove();
			delete $scope.modal;
			init();
	  }

		function init() {
			$ionicModal.fromTemplateUrl('app/home/host-information.html', {
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

				$scope.$on('modal.removed', function() {
					if ($scope.updateInformation !== 'step1') {
						$timeout(function() {
							$scope.updateInformation = false;
						}, 500);
					}
			  });
			}
		}
	}
})();

angular
	.module('tablesTonight.home', [
		'app.home.host',
		'app.home.update-information',
		'tablesTonight.home.controller'
	]);

(function() {
	angular
		.module('app.home.host', [])
		.factory('HostService', function($http, TablesTonightService) {

			var svc                   = {};

			var hostInfo              = null;
			svc.create                = create;
			svc.login                 = login;
			svc.getHostInfo           = getHostInfo;
			svc.updateHostInformation = updateHostInformation
			svc.dayClubList           = TablesTonightService.dayClubList;
			svc.nightClubList         = TablesTonightService.nightClubList;

			return svc;

			function create(newUser) {
				return $http.post(TablesTonightService.getUrl() + 'host/create', newUser)
					.then(function(response) {
						if (!response.data.error) {
							return true;
						}
						return false;
					});
			}

			function login(credentials) {
				return $http.post(TablesTonightService.getUrl() + 'host/login', credentials)
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
				return $http.post(TablesTonightService.getUrl() + 'host/update', hostInfo)
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
			$scope.loading = true;
			$scope.name = $stateParams.name;
			var type = $stateParams.type;
			getHosts($scope.name)
				.then(function(clubInfo) {
					console.log("finished");
					$scope.loading = false;
					$scope.info = clubInfo.info;
					$scope.hosts = clubInfo.hosts;
				});
	  });

		$scope.$on("$ionicView.afterLeave", function(HostDetailCtrl) {
			delete $scope.info;
			delete $scope.hosts;
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

	function HostsService($http, TablesTonightService) {
		var svc = {};
		svc.getNightClubHosts = getNightClubHosts;
		svc.getDayClubHosts   = getDayClubHosts;
		svc.saveHost          = saveHost;
		svc.getHost           = getHost;
		return svc;

		function getNightClubHosts(nightclub) {
			return $http.get(TablesTonightService.getUrl() + 'nightclub/' + nightclub)
				.then(function(response) {
					return response.data;
				});
		}

		function getDayClubHosts(dayclub) {
			return $http.get(TablesTonightService.getUrl() + 'dayclub/' + dayclub)
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
				scope.create = create;
				scope.next   = next;
				scope.finish = finish;

				function create(newUser) {
					HostService.create(newUser)
						.then(function(hostCreated) {
							scope.close();
						});
				}

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
		'app.home.update-information.step0',
		'app.home.update-information.step1',
		'app.home.update-information.step2'
	]);

(function() {
	angular
		.module('app.home.update-information.step0', [])
		.directive('updateInformationStepZero', function(HostService) {
			var directive = {
					scope: {
						step: '=',
						create: '='
					},
					restrict: 'AE',
					link: link,
					templateUrl: './app/home/update-information/step0/step0.html'
			};

			return directive;

			///////////////////////////////////////////////////////////////////////////

			function link(scope, element, attrs) {
				scope.newEntry = {};
				scope.submitEmail = submitEmail;

				function submitEmail() {
					scope.create(scope.newEntry);
					delete scope.newEntry;
				}
			}

		});
})();

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

	function TablesTonightService($http) {

		var svc = {};
		var location = null;
		var url = 'http://tablesTonight.herokuapp.com/';

		svc.currentLocation = currentLocation;
		svc.saveLocation = saveLocation;
		svc.dayClubList   = dayClubList();
		svc.nightClubList = nightClubList();
		svc.getUrl = getUrl;
		init();

		return svc;

		function init() {
			$http.get('http://localhost:1337/origin')
				.then(function(response) {
					if (response.data) {
						url = response.data;
					}
				});
		}

		function getUrl() {
			return url;
		}

		function currentLocation() {
			return location;
		}

		function saveLocation(newLocation) {
			location = newLocation;
		}

		function dayClubList() {
			return [
				{ name: 'Azure',
					fileName: '1oak'
				},
				{ name: 'Bare',
					fileName: '1oak'
				},
				{ name: 'Daylight',
					fileName: '1oak'
				},
				{ name: 'Drais Beach Club',
					fileName: '1oak'
				},
				{ name: 'Encore Beach Club',
					fileName: '1oak'
				},
				{ name: 'Foxtail Pool Club',
					fileName: '1oak'
				},
				{ name: 'Lavo Brunch',
					fileName: '1oak'
				},
				{ name: 'Liquid Pool',
					fileName: '1oak'
				},
				{ name: 'Marquee Day Club',
					fileName: '1oak'
				},
				{ name: 'Moorea Beach Club',
					fileName: '1oak'
				},
				{ name: 'Ditch Fridays',
					fileName: '1oak'
				},
				{ name: 'Rehab Beach Club',
					fileName: '1oak'
				},
				{ name: 'TAO Beach',
					fileName: '1oak'
				},
				{ name: 'Wet Republic',
					fileName: '1oak'
				}
			];
		}

		function nightClubList() {

			return [
				{ name: '1OAK',
					fileName: '1oak'
				},
				{ name: 'Drais',
					fileName: 'drais'
				},
				{ name: 'Foundation Room',
					fileName: 'foundation'
				},
				{ name: 'Foxtail',
					fileName: 'foxtail'
				},
				{ name: 'Hakkasan',
					fileName: 'hakkasan'
				},
				{ name: 'Hyde',
					fileName: 'hyde'
				},
				{ name: 'Lavo',
					fileName: 'lavo'
				},
				{ name: 'LAX',
					fileName: 'lax'
				},
				{ name: 'Light',
					fileName: 'light'
				},
				{ name: 'Marquee',
					fileName: 'marquee'
				},
				{ name: 'Omnia',
					fileName: 'omnia'
				},
				{ name: 'Sayers Club',
					fileName: 'sayers'
				},
				{ name: 'Surrender',
					fileName: 'surrender'
				},
				{ name: 'Tao',
					fileName: 'tao'
				},
				{ name: 'The Bank',
					fileName: 'bank'
				},
				{ name: 'XS',
					fileName: 'xs'
				}
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

	function HomeCtrl($scope, $ionicModal, $state, $timeout, HostService, TablesTonightService) {

		$scope.credentials       = {};
		$scope.updateInformation = false;
		$scope.login             = login;
		$scope.navigate          = navigate;
		$scope.openModal         = openModal;
		$scope.closeModal        = closeModal;
		$scope.signUp            = signUp;
		init();

		///////////////////////////////////////////////////////////////////////////

		function signUp() {
			$scope.updateInformation = 'step0';
		}

		function login() {
			HostService.login($scope.credentials)
				.then(function(host) {
					if (host.error) {
						return $scope.message = host.error;
					}
					$scope.updateInformation = 'step1';
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

		function closeModal(exitEarly) {
			if ($scope.updateInformation === 'step0' && !exitEarly) {
				$scope.message = "Thanks for signing up. You'll be receiving an e-mail with next steps shortly.";
				$timeout(function() {
					delete $scope.message;
				}, 5000);
				return $scope.updateInformation = false;
			}
			if (HostService.getHostInfo()) {
				$scope.updateInformation = 'step1';
			}
	    $scope.modal.remove();
			delete $scope.modal;
			init();
	  }

		function init() {
			$ionicModal.fromTemplateUrl('app/home/host-information.html', {
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

				$scope.$on('modal.removed', function() {
					if ($scope.updateInformation !== 'step1') {
						$timeout(function() {
							$scope.updateInformation = false;
						}, 500);
					}
			  });
			}
		}
	}
})();

angular
	.module('tablesTonight.home', [
		'app.home.host',
		'app.home.update-information',
		'tablesTonight.home.controller'
	]);

(function() {
	angular
		.module('app.home.host', [])
		.factory('HostService', function($http, TablesTonightService) {

			var svc                   = {};

			var hostInfo              = null;
			svc.create                = create;
			svc.login                 = login;
			svc.getHostInfo           = getHostInfo;
			svc.updateHostInformation = updateHostInformation
			svc.dayClubList           = TablesTonightService.dayClubList;
			svc.nightClubList         = TablesTonightService.nightClubList;

			return svc;

			function create(newUser) {
				return $http.post(TablesTonightService.getUrl() + 'host/create', newUser)
					.then(function(response) {
						if (!response.data.error) {
							return true;
						}
						return false;
					});
			}

			function login(credentials) {
				return $http.post(TablesTonightService.getUrl() + 'host/login', credentials)
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
				return $http.post(TablesTonightService.getUrl() + 'host/update', hostInfo)
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
			$scope.loading = true;
			$scope.name = $stateParams.name;
			var type = $stateParams.type;
			getHosts($scope.name)
				.then(function(clubInfo) {
					console.log("finished");
					$scope.loading = false;
					$scope.info = clubInfo.info;
					$scope.hosts = clubInfo.hosts;
				});
	  });

		$scope.$on("$ionicView.afterLeave", function(HostDetailCtrl) {
			delete $scope.info;
			delete $scope.hosts;
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

	function HostsService($http, TablesTonightService) {
		var svc = {};
		svc.getNightClubHosts = getNightClubHosts;
		svc.getDayClubHosts   = getDayClubHosts;
		svc.saveHost          = saveHost;
		svc.getHost           = getHost;
		return svc;

		function getNightClubHosts(nightclub) {
			return $http.get(TablesTonightService.getUrl() + 'nightclub/' + nightclub)
				.then(function(response) {
					return response.data;
				});
		}

		function getDayClubHosts(dayclub) {
			return $http.get(TablesTonightService.getUrl() + 'dayclub/' + dayclub)
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
				scope.create = create;
				scope.next   = next;
				scope.finish = finish;

				function create(newUser) {
					HostService.create(newUser)
						.then(function(hostCreated) {
							scope.close();
						});
				}

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
		'app.home.update-information.step0',
		'app.home.update-information.step1',
		'app.home.update-information.step2'
	]);

(function() {
	angular
		.module('app.home.update-information.step0', [])
		.directive('updateInformationStepZero', function(HostService) {
			var directive = {
					scope: {
						step: '=',
						create: '='
					},
					restrict: 'AE',
					link: link,
					templateUrl: './app/home/update-information/step0/step0.html'
			};

			return directive;

			///////////////////////////////////////////////////////////////////////////

			function link(scope, element, attrs) {
				scope.newEntry = {};
				scope.submitEmail = submitEmail;

				function submitEmail() {
					scope.create(scope.newEntry);
					delete scope.newEntry;
				}
			}

		});
})();

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

	function TablesTonightService($http) {

		var svc = {};
		var location = null;
		var url = 'http://tablesTonight.herokuapp.com/';

		svc.currentLocation = currentLocation;
		svc.saveLocation = saveLocation;
		svc.dayClubList   = dayClubList();
		svc.nightClubList = nightClubList();
		svc.getUrl = getUrl;
		init();

		return svc;

		function init() {
			$http.get('http://localhost:1337/origin')
				.then(function(response) {
					if (response.data) {
						url = response.data;
					}
				});
		}

		function getUrl() {
			return url;
		}

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
 				'Drais Beach Club',
 				'Encore Beach Club',
 				'Foxtail Pool Club',
 				'Lavo Brunch',
 				'Liquid Pool',
 				'Marquee Day Club',
 				'Moorea Beach Club',
 				'Ditch Fridays',
 				'Rehab Beach Club',
 				'TAO Beach',
 				'Wet Republic'
 			]
		}

		function nightClubList() {

			return [
				'1OAK',
 				'Drais',
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

	function HomeCtrl($scope, $ionicModal, $state, $timeout, HostService, TablesTonightService) {

		$scope.credentials       = {};
		$scope.updateInformation = false;
		$scope.login             = login;
		$scope.navigate          = navigate;
		$scope.openModal         = openModal;
		$scope.closeModal        = closeModal;
		$scope.signUp            = signUp;
		init();

		///////////////////////////////////////////////////////////////////////////

		function signUp() {
			$scope.updateInformation = 'step0';
		}

		function login() {
			HostService.login($scope.credentials)
				.then(function(host) {
					if (host.error) {
						return $scope.message = host.error;
					}
					$scope.updateInformation = 'step1';
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

		function closeModal(exitEarly) {
			if ($scope.updateInformation === 'step0' && !exitEarly) {
				$scope.message = "Thanks for signing up. You'll be receiving an e-mail with next steps shortly.";
				$timeout(function() {
					delete $scope.message;
				}, 5000);
				return $scope.updateInformation = false;
			}
			if (HostService.getHostInfo()) {
				$scope.updateInformation = 'step1';
			}
	    $scope.modal.remove();
			delete $scope.modal;
			init();
	  }

		function init() {
			$ionicModal.fromTemplateUrl('app/home/host-information.html', {
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

				$scope.$on('modal.removed', function() {
					if ($scope.updateInformation !== 'step1') {
						$timeout(function() {
							$scope.updateInformation = false;
						}, 500);
					}
			  });
			}
		}
	}
})();

angular
	.module('tablesTonight.home', [
		'app.home.host',
		'app.home.update-information',
		'tablesTonight.home.controller'
	]);

(function() {
	angular
		.module('app.home.host', [])
		.factory('HostService', function($http, TablesTonightService) {

			var svc                   = {};

			var hostInfo              = null;
			svc.create                = create;
			svc.login                 = login;
			svc.getHostInfo           = getHostInfo;
			svc.updateHostInformation = updateHostInformation
			svc.dayClubList           = TablesTonightService.dayClubList;
			svc.nightClubList         = TablesTonightService.nightClubList;

			return svc;

			function create(newUser) {
				return $http.post(TablesTonightService.getUrl() + 'host/create', newUser)
					.then(function(response) {
						if (!response.data.error) {
							return true;
						}
						return false;
					});
			}

			function login(credentials) {
				return $http.post(TablesTonightService.getUrl() + 'host/login', credentials)
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
				return $http.post(TablesTonightService.getUrl() + 'host/update', hostInfo)
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
			$scope.loading = true;
			$scope.name = $stateParams.name;
			var type = $stateParams.type;
			getHosts($scope.name)
				.then(function(clubInfo) {
					$scope.loading = false;
					$scope.info = clubInfo.info;
					$scope.hosts = clubInfo.hosts;
				});
	  });

		$scope.$on("$ionicView.afterLeave", function(HostDetailCtrl) {
			delete $scope.info;
			delete $scope.hosts;
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

	function HostsService($http, TablesTonightService) {
		var svc = {};
		svc.getNightClubHosts = getNightClubHosts;
		svc.getDayClubHosts   = getDayClubHosts;
		svc.saveHost          = saveHost;
		svc.getHost           = getHost;
		return svc;

		function getNightClubHosts(nightclub) {
			return $http.get(TablesTonightService.getUrl() + 'nightclub/' + nightclub)
				.then(function(response) {
					return response.data;
				});
		}

		function getDayClubHosts(dayclub) {
			return $http.get(TablesTonightService.getUrl() + 'dayclub/' + dayclub)
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
				scope.create = create;
				scope.next   = next;
				scope.finish = finish;

				function create(newUser) {
					HostService.create(newUser)
						.then(function(hostCreated) {
							scope.close();
						});
				}

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
		'app.home.update-information.step0',
		'app.home.update-information.step1',
		'app.home.update-information.step2'
	]);

(function() {
	angular
		.module('app.home.update-information.step0', [])
		.directive('updateInformationStepZero', function(HostService) {
			var directive = {
					scope: {
						step: '=',
						create: '='
					},
					restrict: 'AE',
					link: link,
					templateUrl: './app/home/update-information/step0/step0.html'
			};

			return directive;

			///////////////////////////////////////////////////////////////////////////

			function link(scope, element, attrs) {
				scope.newEntry = {};
				scope.submitEmail = submitEmail;

				function submitEmail() {
					scope.create(scope.newEntry);
					delete scope.newEntry;
				}
			}

		});
})();

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

	function TablesTonightService($http) {

		var svc = {};
		var location = null;
		var url = 'http://tablesTonight.herokuapp.com/';

		svc.currentLocation = currentLocation;
		svc.saveLocation = saveLocation;
		svc.dayClubList   = dayClubList();
		svc.nightClubList = nightClubList();
		svc.getUrl = getUrl;
		init();

		return svc;

		function init() {
			$http.get('http://localhost:1337/origin')
				.then(function(response) {
					if (response.data) {
						url = response.data;
					}
				});
		}

		function getUrl() {
			return url;
		}

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
 				'Drais Beach Club',
 				'Encore Beach Club',
 				'Foxtail Pool Club',
 				'Lavo Brunch',
 				'Liquid Pool',
 				'Marquee Day Club',
 				'Moorea Beach Club',
 				'Ditch Fridays',
 				'Rehab Beach Club',
 				'TAO Beach',
 				'Wet Republic'
 			]
		}

		function nightClubList() {

			return [
				'1OAK',
 				'Drais',
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

	function HomeCtrl($scope, $ionicModal, $state, $timeout, HostService, TablesTonightService) {

		$scope.credentials       = {};
		$scope.updateInformation = false;
		$scope.login             = login;
		$scope.navigate          = navigate;
		$scope.openModal         = openModal;
		$scope.closeModal        = closeModal;
		$scope.signUp            = signUp;
		init();

		///////////////////////////////////////////////////////////////////////////

		function signUp() {
			$scope.updateInformation = 'step0';
		}

		function login() {
			HostService.login($scope.credentials)
				.then(function(host) {
					if (host.error) {
						return $scope.message = host.error;
					}
					$scope.updateInformation = 'step1';
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

		function closeModal(exitEarly) {
			if ($scope.updateInformation === 'step0' && !exitEarly) {
				$scope.message = "Thanks for signing up. You'll be receiving an e-mail with next steps shortly.";
				$timeout(function() {
					delete $scope.message;
				}, 5000);
				return $scope.updateInformation = false;
			}
			if (HostService.getHostInfo()) {
				$scope.updateInformation = 'step1';
			}
	    $scope.modal.remove();
			delete $scope.modal;
			init();
	  }

		function init() {
			$ionicModal.fromTemplateUrl('app/home/host-information.html', {
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

				$scope.$on('modal.removed', function() {
					if ($scope.updateInformation !== 'step1') {
						$timeout(function() {
							$scope.updateInformation = false;
						}, 500);
					}
			  });
			}
		}
	}
})();

angular
	.module('tablesTonight.home', [
		'app.home.host',
		'app.home.update-information',
		'tablesTonight.home.controller'
	]);

(function() {
	angular
		.module('app.home.host', [])
		.factory('HostService', function($http, TablesTonightService) {

			var svc                   = {};

			var hostInfo              = null;
			svc.create                = create;
			svc.login                 = login;
			svc.getHostInfo           = getHostInfo;
			svc.updateHostInformation = updateHostInformation
			svc.dayClubList           = TablesTonightService.dayClubList;
			svc.nightClubList         = TablesTonightService.nightClubList;

			return svc;

			function create(newUser) {
				return $http.post(TablesTonightService.getUrl() + 'host/create', newUser)
					.then(function(response) {
						if (!response.data.error) {
							return true;
						}
						return false;
					});
			}

			function login(credentials) {
				return $http.post(TablesTonightService.getUrl() + 'host/login', credentials)
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
				return $http.post(TablesTonightService.getUrl() + 'host/update', hostInfo)
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
			$scope.loading = true;
			$scope.name = $stateParams.name;
			var type = $stateParams.type;
			getHosts($scope.name)
				.then(function(clubInfo) {
					$scope.loading = false;
					$scope.info = clubInfo.info;
					$scope.hosts = clubInfo.hosts;
				});
	  });

		$scope.$on("$ionicView.afterLeave", function(HostDetailCtrl) {
			delete $scope.info;
			delete $scope.hosts;
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

	function HostsService($http, TablesTonightService) {
		var svc = {};
		svc.getNightClubHosts = getNightClubHosts;
		svc.getDayClubHosts   = getDayClubHosts;
		svc.saveHost          = saveHost;
		svc.getHost           = getHost;
		return svc;

		function getNightClubHosts(nightclub) {
			return $http.get(TablesTonightService.getUrl() + 'nightclub/' + nightclub)
				.then(function(response) {
					return response.data;
				});
		}

		function getDayClubHosts(dayclub) {
			return $http.get(TablesTonightService.getUrl() + 'dayclub/' + dayclub)
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
				scope.create = create;
				scope.next   = next;
				scope.finish = finish;

				function create(newUser) {
					HostService.create(newUser)
						.then(function(hostCreated) {
							scope.close();
						});
				}

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
		'app.home.update-information.step0',
		'app.home.update-information.step1',
		'app.home.update-information.step2'
	]);

(function() {
	angular
		.module('app.home.update-information.step0', [])
		.directive('updateInformationStepZero', function(HostService) {
			var directive = {
					scope: {
						step: '=',
						create: '='
					},
					restrict: 'AE',
					link: link,
					templateUrl: './app/home/update-information/step0/step0.html'
			};

			return directive;

			///////////////////////////////////////////////////////////////////////////

			function link(scope, element, attrs) {
				scope.newEntry = {};
				scope.submitEmail = submitEmail;

				function submitEmail() {
					scope.create(scope.newEntry);
					delete scope.newEntry;
				}
			}

		});
})();

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

	function TablesTonightService($http) {

		var svc = {};
		var location = null;
		var url = 'http://tablesTonight.herokuapp.com/';

		svc.currentLocation = currentLocation;
		svc.saveLocation = saveLocation;
		svc.dayClubList   = dayClubList();
		svc.nightClubList = nightClubList();
		svc.getUrl = getUrl;
		init();

		return svc;

		function init() {
			$http.get('http://localhost:1337/origin')
				.then(function(response) {
					if (response.data) {
						url = response.data;
					}
				});
		}

		function getUrl() {
			return url;
		}

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
 				'Drais Beach Club',
 				'Encore Beach Club',
 				'Foxtail Pool Club',
 				'Lavo Brunch',
 				'Liquid Pool',
 				'Marquee Day Club',
 				'Moorea Beach Club',
 				'Ditch Fridays',
 				'Rehab Beach Club',
 				'TAO Beach',
 				'Wet Republic'
 			]
		}

		function nightClubList() {

			return [
				'1OAK',
 				'Drais',
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

	function HomeCtrl($scope, $ionicModal, $state, $timeout, HostService, TablesTonightService) {

		$scope.credentials       = {};
		$scope.updateInformation = false;
		$scope.login             = login;
		$scope.navigate          = navigate;
		$scope.openModal         = openModal;
		$scope.closeModal        = closeModal;
		$scope.signUp            = signUp;
		init();

		///////////////////////////////////////////////////////////////////////////

		function signUp() {
			$scope.updateInformation = 'step0';
		}

		function login() {
			HostService.login($scope.credentials)
				.then(function(host) {
					if (host.error) {
						return $scope.message = host.error;
					}
					$scope.updateInformation = 'step1';
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

		function closeModal(exitEarly) {
			if ($scope.updateInformation === 'step0' && !exitEarly) {
				$scope.message = "Thanks for signing up. You'll be receiving an e-mail with next steps shortly.";
				$timeout(function() {
					delete $scope.message;
				}, 5000);
				return $scope.updateInformation = false;
			}
			if (HostService.getHostInfo()) {
				$scope.updateInformation = 'step1';
			}
	    $scope.modal.remove();
			delete $scope.modal;
			init();
	  }

		function init() {
			$ionicModal.fromTemplateUrl('app/home/host-information.html', {
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

				$scope.$on('modal.removed', function() {
					if ($scope.updateInformation !== 'step1') {
						$timeout(function() {
							$scope.updateInformation = false;
						}, 500);
					}
			  });
			}
		}
	}
})();

angular
	.module('tablesTonight.home', [
		'app.home.host',
		'app.home.update-information',
		'tablesTonight.home.controller'
	]);

(function() {
	angular
		.module('app.home.host', [])
		.factory('HostService', function($http, TablesTonightService) {

			var svc                   = {};

			var hostInfo              = null;
			svc.create                = create;
			svc.login                 = login;
			svc.getHostInfo           = getHostInfo;
			svc.updateHostInformation = updateHostInformation
			svc.dayClubList           = TablesTonightService.dayClubList;
			svc.nightClubList         = TablesTonightService.nightClubList;

			return svc;

			function create(newUser) {
				return $http.post(TablesTonightService.getUrl() + 'host/create', newUser)
					.then(function(response) {
						if (!response.data.error) {
							return true;
						}
						return false;
					});
			}

			function login(credentials) {
				return $http.post(TablesTonightService.getUrl() + 'host/login', credentials)
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
				return $http.post(TablesTonightService.getUrl() + 'host/update', hostInfo)
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
			$scope.loading = true;
			$scope.name = $stateParams.name;
			var type = $stateParams.type;
			getHosts($scope.name)
				.then(function(clubInfo) {
					$scope.loading = false;
					$scope.info = clubInfo.info;
					$scope.hosts = clubInfo.hosts;
				});
	  });

		$scope.$on("$ionicView.afterLeave", function(HostDetailCtrl) {
			delete $scope.info;
			delete $scope.hosts;
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

	function HostsService($http, TablesTonightService) {
		var svc = {};
		svc.getNightClubHosts = getNightClubHosts;
		svc.getDayClubHosts   = getDayClubHosts;
		svc.saveHost          = saveHost;
		svc.getHost           = getHost;
		return svc;

		function getNightClubHosts(nightclub) {
			return $http.get(TablesTonightService.getUrl() + 'nightclub/' + nightclub)
				.then(function(response) {
					return response.data;
				});
		}

		function getDayClubHosts(dayclub) {
			return $http.get(TablesTonightService.getUrl() + 'dayclub/' + dayclub)
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
				scope.create = create;
				scope.next   = next;
				scope.finish = finish;

				function create(newUser) {
					HostService.create(newUser)
						.then(function(hostCreated) {
							scope.close();
						});
				}

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
		'app.home.update-information.step0',
		'app.home.update-information.step1',
		'app.home.update-information.step2'
	]);

(function() {
	angular
		.module('app.home.update-information.step0', [])
		.directive('updateInformationStepZero', function(HostService) {
			var directive = {
					scope: {
						step: '=',
						create: '='
					},
					restrict: 'AE',
					link: link,
					templateUrl: './app/home/update-information/step0/step0.html'
			};

			return directive;

			///////////////////////////////////////////////////////////////////////////

			function link(scope, element, attrs) {
				scope.newEntry = {};
				scope.submitEmail = submitEmail;

				function submitEmail() {
					scope.loading = true;
					scope.create(scope.newEntry);
					delete scope.newEntry;
				}
			}

		});
})();

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

	function TablesTonightService($http) {

		var svc = {};
		var location = null;
		var url = 'http://tablesTonight.herokuapp.com/';

		svc.currentLocation = currentLocation;
		svc.saveLocation = saveLocation;
		svc.dayClubList   = dayClubList();
		svc.nightClubList = nightClubList();
		svc.getUrl = getUrl;
		init();

		return svc;

		function init() {
			$http.get('http://localhost:1337/origin')
				.then(function(response) {
					if (response.data) {
						url = response.data;
					}
				});
		}

		function getUrl() {
			return url;
		}

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
 				'Drais Beach Club',
 				'Encore Beach Club',
 				'Foxtail Pool Club',
 				'Lavo Brunch',
 				'Liquid Pool',
 				'Marquee Day Club',
 				'Moorea Beach Club',
 				'Ditch Fridays',
 				'Rehab Beach Club',
 				'TAO Beach',
 				'Wet Republic'
 			]
		}

		function nightClubList() {

			return [
				'1OAK',
 				'Drais',
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

	function HomeCtrl($scope, $ionicModal, $state, $timeout, HostService, TablesTonightService) {

		$scope.credentials       = {};
		$scope.updateInformation = false;
		$scope.login             = login;
		$scope.navigate          = navigate;
		$scope.openModal         = openModal;
		$scope.closeModal        = closeModal;
		$scope.signUp            = signUp;
		init();

		///////////////////////////////////////////////////////////////////////////

		function signUp() {
			$scope.updateInformation = 'step0';
		}

		function login() {
			HostService.login($scope.credentials)
				.then(function(host) {
					if (host.error) {
						return $scope.message = host.error;
					}
					$scope.updateInformation = 'step1';
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

		function closeModal(exitEarly) {
			if ($scope.updateInformation === 'step0' && !exitEarly) {
				$scope.message = "Thanks for signing up. You'll be receiving an e-mail with next steps shortly.";
				$timeout(function() {
					delete $scope.message;
				}, 5000);
				return $scope.updateInformation = false;
			}
			if (HostService.getHostInfo()) {
				$scope.updateInformation = 'step1';
			}
	    $scope.modal.remove();
			delete $scope.modal;
			init();
	  }

		function init() {
			$ionicModal.fromTemplateUrl('app/home/host-information.html', {
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

				$scope.$on('modal.removed', function() {
					if ($scope.updateInformation !== 'step1') {
						$timeout(function() {
							$scope.updateInformation = false;
						}, 500);
					}
			  });
			}
		}
	}
})();

angular
	.module('tablesTonight.home', [
		'app.home.host',
		'app.home.update-information',
		'tablesTonight.home.controller'
	]);

(function() {
	angular
		.module('app.home.host', [])
		.factory('HostService', function($http, TablesTonightService) {

			var svc                   = {};

			var hostInfo              = null;
			svc.create                = create;
			svc.login                 = login;
			svc.getHostInfo           = getHostInfo;
			svc.updateHostInformation = updateHostInformation
			svc.dayClubList           = TablesTonightService.dayClubList;
			svc.nightClubList         = TablesTonightService.nightClubList;

			return svc;

			function create(newUser) {
				return $http.post(TablesTonightService.getUrl() + 'host/create', newUser)
					.then(function(response) {
						if (!response.data.error) {
							return true;
						}
						return false;
					});
			}

			function login(credentials) {
				return $http.post(TablesTonightService.getUrl() + 'host/login', credentials)
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
				return $http.post(TablesTonightService.getUrl() + 'host/update', hostInfo)
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
			$scope.loading = true;
			$scope.name = $stateParams.name;
			var type = $stateParams.type;
			getHosts($scope.name)
				.then(function(clubInfo) {
					$scope.loading = false;
					$scope.info = clubInfo.info;
					$scope.hosts = clubInfo.hosts;
				});
	  });

		$scope.$on("$ionicView.afterLeave", function(HostDetailCtrl) {
			delete $scope.info;
			delete $scope.hosts;
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

	function HostsService($http, TablesTonightService) {
		var svc = {};
		svc.getNightClubHosts = getNightClubHosts;
		svc.getDayClubHosts   = getDayClubHosts;
		svc.saveHost          = saveHost;
		svc.getHost           = getHost;
		return svc;

		function getNightClubHosts(nightclub) {
			return $http.get(TablesTonightService.getUrl() + 'nightclub/' + nightclub)
				.then(function(response) {
					return response.data;
				});
		}

		function getDayClubHosts(dayclub) {
			return $http.get(TablesTonightService.getUrl() + 'dayclub/' + dayclub)
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
				scope.create = create;
				scope.next   = next;
				scope.finish = finish;

				function create(newUser) {
					HostService.create(newUser)
						.then(function(hostCreated) {
							scope.close();
						});
				}

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
		'app.home.update-information.step0',
		'app.home.update-information.step1',
		'app.home.update-information.step2'
	]);

(function() {
	angular
		.module('app.home.update-information.step0', [])
		.directive('updateInformationStepZero', function(HostService) {
			var directive = {
					scope: {
						step: '=',
						create: '='
					},
					restrict: 'AE',
					link: link,
					templateUrl: './app/home/update-information/step0/step0.html'
			};

			return directive;

			///////////////////////////////////////////////////////////////////////////

			function link(scope, element, attrs) {
				scope.newEntry = {};
				scope.submitEmail = submitEmail;

				function submitEmail() {
					scope.loading = true;
					scope.create(scope.newEntry);
					delete scope.newEntry;
				}
			}

		});
})();

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

				scope.completeUpdate = completeUpdate;

				function completeUpdate() {
					scope.loading = true;
					scope.finish();
				}
			}

		});
})();

(function() {
	angular
		.module('app.data', [])
		.factory('TablesTonightService', TablesTonightService);

	function TablesTonightService($http) {

		var svc = {};
		var location = null;
		var url = 'http://tablesTonight.herokuapp.com/';

		svc.currentLocation = currentLocation;
		svc.saveLocation = saveLocation;
		svc.dayClubList   = dayClubList();
		svc.nightClubList = nightClubList();
		svc.getUrl = getUrl;
		init();

		return svc;

		function init() {
			$http.get('http://localhost:1337/origin')
				.then(function(response) {
					if (response.data) {
						url = response.data;
					}
				});
		}

		function getUrl() {
			return url;
		}

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
 				'Drais Beach Club',
 				'Encore Beach Club',
 				'Foxtail Pool Club',
 				'Lavo Brunch',
 				'Liquid Pool',
 				'Marquee Day Club',
 				'Moorea Beach Club',
 				'Ditch Fridays',
 				'Rehab Beach Club',
 				'TAO Beach',
 				'Wet Republic'
 			]
		}

		function nightClubList() {

			return [
				'1OAK',
 				'Drais',
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

	function HomeCtrl($scope, $ionicModal, $state, $timeout, HostService, TablesTonightService) {

		$scope.credentials       = {};
		$scope.updateInformation = false;
		$scope.login             = login;
		$scope.navigate          = navigate;
		$scope.openModal         = openModal;
		$scope.closeModal        = closeModal;
		$scope.signUp            = signUp;
		init();

		///////////////////////////////////////////////////////////////////////////

		function signUp() {
			$scope.updateInformation = 'step0';
		}

		function login() {
			scope.loading = true;
			HostService.login($scope.credentials)
				.then(function(host) {
					scope.loading = false;
					if (host.error) {
						return $scope.message = host.error;
					}
					$scope.updateInformation = 'step1';
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

		function closeModal(exitEarly) {
			if ($scope.updateInformation === 'step0' && !exitEarly) {
				$scope.message = "Thanks for signing up. You'll be receiving an e-mail with next steps shortly.";
				$timeout(function() {
					delete $scope.message;
				}, 5000);
				return $scope.updateInformation = false;
			}
			if (HostService.getHostInfo()) {
				$scope.updateInformation = 'step1';
			}
	    $scope.modal.remove();
			delete $scope.modal;
			init();
	  }

		function init() {
			$ionicModal.fromTemplateUrl('app/home/host-information.html', {
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

				$scope.$on('modal.removed', function() {
					if ($scope.updateInformation !== 'step1') {
						$timeout(function() {
							$scope.updateInformation = false;
						}, 500);
					}
			  });
			}
		}
	}
})();

angular
	.module('tablesTonight.home', [
		'app.home.host',
		'app.home.update-information',
		'tablesTonight.home.controller'
	]);

(function() {
	angular
		.module('app.home.host', [])
		.factory('HostService', function($http, TablesTonightService) {

			var svc                   = {};

			var hostInfo              = null;
			svc.create                = create;
			svc.login                 = login;
			svc.getHostInfo           = getHostInfo;
			svc.updateHostInformation = updateHostInformation
			svc.dayClubList           = TablesTonightService.dayClubList;
			svc.nightClubList         = TablesTonightService.nightClubList;

			return svc;

			function create(newUser) {
				return $http.post(TablesTonightService.getUrl() + 'host/create', newUser)
					.then(function(response) {
						if (!response.data.error) {
							return true;
						}
						return false;
					});
			}

			function login(credentials) {
				return $http.post(TablesTonightService.getUrl() + 'host/login', credentials)
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
				return $http.post(TablesTonightService.getUrl() + 'host/update', hostInfo)
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
			$scope.loading = true;
			$scope.name = $stateParams.name;
			var type = $stateParams.type;
			getHosts($scope.name)
				.then(function(clubInfo) {
					$scope.loading = false;
					$scope.info = clubInfo.info;
					$scope.hosts = clubInfo.hosts;
				});
	  });

		$scope.$on("$ionicView.afterLeave", function(HostDetailCtrl) {
			delete $scope.info;
			delete $scope.hosts;
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

	function HostsService($http, TablesTonightService) {
		var svc = {};
		svc.getNightClubHosts = getNightClubHosts;
		svc.getDayClubHosts   = getDayClubHosts;
		svc.saveHost          = saveHost;
		svc.getHost           = getHost;
		return svc;

		function getNightClubHosts(nightclub) {
			return $http.get(TablesTonightService.getUrl() + 'nightclub/' + nightclub)
				.then(function(response) {
					return response.data;
				});
		}

		function getDayClubHosts(dayclub) {
			return $http.get(TablesTonightService.getUrl() + 'dayclub/' + dayclub)
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
				scope.create = create;
				scope.next   = next;
				scope.finish = finish;

				function create(newUser) {
					HostService.create(newUser)
						.then(function(hostCreated) {
							scope.close();
						});
				}

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
		'app.home.update-information.step0',
		'app.home.update-information.step1',
		'app.home.update-information.step2'
	]);

(function() {
	angular
		.module('app.home.update-information.step0', [])
		.directive('updateInformationStepZero', function(HostService) {
			var directive = {
					scope: {
						step: '=',
						create: '='
					},
					restrict: 'AE',
					link: link,
					templateUrl: './app/home/update-information/step0/step0.html'
			};

			return directive;

			///////////////////////////////////////////////////////////////////////////

			function link(scope, element, attrs) {
				scope.newEntry = {};
				scope.submitEmail = submitEmail;

				function submitEmail() {
					scope.loading = true;
					scope.create(scope.newEntry);
					delete scope.newEntry;
				}
			}

		});
})();

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

				scope.completeUpdate = completeUpdate;

				function completeUpdate() {
					scope.loading = true;
					scope.finish();
				}
			}

		});
})();

(function() {
	angular
		.module('app.data', [])
		.factory('TablesTonightService', TablesTonightService);

	function TablesTonightService($http) {

		var svc = {};
		var location = null;
		var url = 'http://tablesTonight.herokuapp.com/';

		svc.currentLocation = currentLocation;
		svc.saveLocation = saveLocation;
		svc.dayClubList   = dayClubList();
		svc.nightClubList = nightClubList();
		svc.getUrl = getUrl;
		init();

		return svc;

		function init() {
			$http.get('http://localhost:1337/origin')
				.then(function(response) {
					if (response.data) {
						url = response.data;
					}
				});
		}

		function getUrl() {
			return url;
		}

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
 				'Drais Beach Club',
 				'Encore Beach Club',
 				'Foxtail Pool Club',
 				'Lavo Brunch',
 				'Liquid Pool',
 				'Marquee Day Club',
 				'Moorea Beach Club',
 				'Ditch Fridays',
 				'Rehab Beach Club',
 				'TAO Beach',
 				'Wet Republic'
 			]
		}

		function nightClubList() {

			return [
				'1OAK',
 				'Drais',
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

	function HomeCtrl($scope, $ionicModal, $state, $timeout, HostService, TablesTonightService) {

		$scope.credentials       = {};
		$scope.updateInformation = false;
		$scope.login             = login;
		$scope.navigate          = navigate;
		$scope.openModal         = openModal;
		$scope.closeModal        = closeModal;
		$scope.signUp            = signUp;
		init();

		///////////////////////////////////////////////////////////////////////////

		function signUp() {
			$scope.updateInformation = 'step0';
		}

		function login() {
			$scope.loading = true;
			HostService.login($scope.credentials)
				.then(function(host) {
					$scope.loading = false;
					if (host.error) {
						return $scope.message = host.error;
					}
					$scope.updateInformation = 'step1';
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

		function closeModal(exitEarly) {
			if ($scope.updateInformation === 'step0' && !exitEarly) {
				$scope.message = "Thanks for signing up. You'll be receiving an e-mail with next steps shortly.";
				$timeout(function() {
					delete $scope.message;
				}, 5000);
				return $scope.updateInformation = false;
			}
			if (HostService.getHostInfo()) {
				$scope.updateInformation = 'step1';
			}
	    $scope.modal.remove();
			delete $scope.modal;
			init();
	  }

		function init() {
			$ionicModal.fromTemplateUrl('app/home/host-information.html', {
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

				$scope.$on('modal.removed', function() {
					if ($scope.updateInformation !== 'step1') {
						$timeout(function() {
							$scope.updateInformation = false;
						}, 500);
					}
			  });
			}
		}
	}
})();

angular
	.module('tablesTonight.home', [
		'app.home.host',
		'app.home.update-information',
		'tablesTonight.home.controller'
	]);

(function() {
	angular
		.module('app.home.host', [])
		.factory('HostService', function($http, TablesTonightService) {

			var svc                   = {};

			var hostInfo              = null;
			svc.create                = create;
			svc.login                 = login;
			svc.getHostInfo           = getHostInfo;
			svc.updateHostInformation = updateHostInformation
			svc.dayClubList           = TablesTonightService.dayClubList;
			svc.nightClubList         = TablesTonightService.nightClubList;

			return svc;

			function create(newUser) {
				return $http.post(TablesTonightService.getUrl() + 'host/create', newUser)
					.then(function(response) {
						if (!response.data.error) {
							return true;
						}
						return false;
					});
			}

			function login(credentials) {
				return $http.post(TablesTonightService.getUrl() + 'host/login', credentials)
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
				return $http.post(TablesTonightService.getUrl() + 'host/update', hostInfo)
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
			$scope.loading = true;
			$scope.name = $stateParams.name;
			var type = $stateParams.type;
			getHosts($scope.name)
				.then(function(clubInfo) {
					$scope.loading = false;
					$scope.info = clubInfo.info;
					$scope.hosts = clubInfo.hosts;
				});
	  });

		$scope.$on("$ionicView.afterLeave", function(HostDetailCtrl) {
			delete $scope.info;
			delete $scope.hosts;
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

	function HostsService($http, TablesTonightService) {
		var svc = {};
		svc.getNightClubHosts = getNightClubHosts;
		svc.getDayClubHosts   = getDayClubHosts;
		svc.saveHost          = saveHost;
		svc.getHost           = getHost;
		return svc;

		function getNightClubHosts(nightclub) {
			return $http.get(TablesTonightService.getUrl() + 'nightclub/' + nightclub)
				.then(function(response) {
					return response.data;
				});
		}

		function getDayClubHosts(dayclub) {
			return $http.get(TablesTonightService.getUrl() + 'dayclub/' + dayclub)
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
				scope.create = create;
				scope.next   = next;
				scope.finish = finish;

				function create(newUser) {
					HostService.create(newUser)
						.then(function(hostCreated) {
							scope.close();
						});
				}

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
		'app.home.update-information.step0',
		'app.home.update-information.step1',
		'app.home.update-information.step2'
	]);

(function() {
	angular
		.module('app.home.update-information.step0', [])
		.directive('updateInformationStepZero', function(HostService) {
			var directive = {
					scope: {
						step: '=',
						create: '='
					},
					restrict: 'AE',
					link: link,
					templateUrl: './app/home/update-information/step0/step0.html'
			};

			return directive;

			///////////////////////////////////////////////////////////////////////////

			function link(scope, element, attrs) {
				scope.newEntry = {};
				scope.submitEmail = submitEmail;

				function submitEmail() {
					scope.loading = true;
					scope.create(scope.newEntry);
					delete scope.newEntry;
				}
			}

		});
})();

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

				scope.completeUpdate = completeUpdate;

				function completeUpdate() {
					scope.loading = true;
					scope.finish();
				}
			}

		});
})();

(function() {
	angular
		.module('app.data', [])
		.factory('TablesTonightService', TablesTonightService);

	function TablesTonightService($http) {

		var svc = {};
		var location = null;
		var url = 'http://tablesTonight.herokuapp.com/';

		svc.currentLocation = currentLocation;
		svc.saveLocation = saveLocation;
		svc.dayClubList   = dayClubList();
		svc.nightClubList = nightClubList();
		svc.getUrl = getUrl;
		init();

		return svc;

		function init() {
			$http.get('http://localhost:1337/origin')
				.then(function(response) {
					if (response.data) {
						url = response.data;
					}
				});
		}

		function getUrl() {
			return url;
		}

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
 				'Drais Beach Club',
 				'Encore Beach Club',
 				'Foxtail Pool Club',
 				'Lavo Brunch',
 				'Liquid Pool',
 				'Marquee Day Club',
 				'Moorea Beach Club',
 				'Ditch Fridays',
 				'Rehab Beach Club',
 				'TAO Beach',
 				'Wet Republic'
 			]
		}

		function nightClubList() {

			return [
				'1OAK',
 				'Drais',
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

	function HomeCtrl($scope, $ionicModal, $state, $timeout, HostService, TablesTonightService) {

		$scope.credentials       = {};
		$scope.updateInformation = false;
		$scope.login             = login;
		$scope.navigate          = navigate;
		$scope.openModal         = openModal;
		$scope.closeModal        = closeModal;
		$scope.signUp            = signUp;
		init();

		///////////////////////////////////////////////////////////////////////////

		function signUp() {
			$scope.updateInformation = 'step0';
		}

		function login() {
			$scope.message = '';
			$scope.loading = true;
			HostService.login($scope.credentials)
				.then(function(host) {
					$scope.loading = false;
					if (host.error) {
						return $scope.message = host.error;
					}
					$scope.updateInformation = 'step1';
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

		function closeModal(exitEarly) {
			if ($scope.updateInformation === 'step0' && !exitEarly) {
				$scope.message = "Thanks for signing up. You'll be receiving an e-mail with next steps shortly.";
				$timeout(function() {
					delete $scope.message;
				}, 5000);
				return $scope.updateInformation = false;
			}
			if (HostService.getHostInfo()) {
				$scope.updateInformation = 'step1';
			}
	    $scope.modal.remove();
			delete $scope.modal;
			init();
	  }

		function init() {
			$ionicModal.fromTemplateUrl('app/home/host-information.html', {
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

				$scope.$on('modal.removed', function() {
					if ($scope.updateInformation !== 'step1') {
						$timeout(function() {
							$scope.updateInformation = false;
						}, 500);
					}
			  });
			}
		}
	}
})();

angular
	.module('tablesTonight.home', [
		'app.home.host',
		'app.home.update-information',
		'tablesTonight.home.controller'
	]);

(function() {
	angular
		.module('app.home.host', [])
		.factory('HostService', function($http, TablesTonightService) {

			var svc                   = {};

			var hostInfo              = null;
			svc.create                = create;
			svc.login                 = login;
			svc.getHostInfo           = getHostInfo;
			svc.updateHostInformation = updateHostInformation
			svc.dayClubList           = TablesTonightService.dayClubList;
			svc.nightClubList         = TablesTonightService.nightClubList;

			return svc;

			function create(newUser) {
				return $http.post(TablesTonightService.getUrl() + 'host/create', newUser)
					.then(function(response) {
						if (!response.data.error) {
							return true;
						}
						return false;
					});
			}

			function login(credentials) {
				return $http.post(TablesTonightService.getUrl() + 'host/login', credentials)
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
				return $http.post(TablesTonightService.getUrl() + 'host/update', hostInfo)
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
			$scope.loading = true;
			$scope.name = $stateParams.name;
			var type = $stateParams.type;
			getHosts($scope.name)
				.then(function(clubInfo) {
					$scope.loading = false;
					$scope.info = clubInfo.info;
					$scope.hosts = clubInfo.hosts;
				});
	  });

		$scope.$on("$ionicView.afterLeave", function(HostDetailCtrl) {
			delete $scope.info;
			delete $scope.hosts;
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

	function HostsService($http, TablesTonightService) {
		var svc = {};
		svc.getNightClubHosts = getNightClubHosts;
		svc.getDayClubHosts   = getDayClubHosts;
		svc.saveHost          = saveHost;
		svc.getHost           = getHost;
		return svc;

		function getNightClubHosts(nightclub) {
			return $http.get(TablesTonightService.getUrl() + 'nightclub/' + nightclub)
				.then(function(response) {
					return response.data;
				});
		}

		function getDayClubHosts(dayclub) {
			return $http.get(TablesTonightService.getUrl() + 'dayclub/' + dayclub)
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
				scope.create = create;
				scope.next   = next;
				scope.finish = finish;

				function create(newUser) {
					HostService.create(newUser)
						.then(function(hostCreated) {
							scope.close();
						});
				}

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
		'app.home.update-information.step0',
		'app.home.update-information.step1',
		'app.home.update-information.step2'
	]);

(function() {
	angular
		.module('app.home.update-information.step0', [])
		.directive('updateInformationStepZero', function(HostService) {
			var directive = {
					scope: {
						step: '=',
						create: '='
					},
					restrict: 'AE',
					link: link,
					templateUrl: './app/home/update-information/step0/step0.html'
			};

			return directive;

			///////////////////////////////////////////////////////////////////////////

			function link(scope, element, attrs) {
				scope.newEntry = {};
				scope.submitEmail = submitEmail;

				function submitEmail() {
					scope.loading = true;
					scope.create(scope.newEntry);
					delete scope.newEntry;
				}
			}

		});
})();

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

				scope.completeUpdate = completeUpdate;

				function completeUpdate() {
					scope.loading = true;
					scope.finish();
				}
			}

		});
})();

(function() {
	angular
		.module('app.data', [])
		.factory('TablesTonightService', TablesTonightService);

	function TablesTonightService($http) {

		var svc = {};
		var location = null;
		var url = 'http://tablesTonight.herokuapp.com/';

		svc.currentLocation = currentLocation;
		svc.saveLocation = saveLocation;
		svc.dayClubList   = dayClubList();
		svc.nightClubList = nightClubList();
		svc.getUrl = getUrl;
		init();

		return svc;

		function init() {
			$http.get('http://localhost:1337/origin')
				.then(function(response) {
					if (response.data) {
						url = response.data;
					}
				});
		}

		function getUrl() {
			return url;
		}

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
 				'Drais Beach Club',
 				'Encore Beach Club',
 				'Foxtail Pool Club',
 				'Lavo Brunch',
 				'Liquid Pool',
 				'Marquee Day Club',
 				'Moorea Beach Club',
 				'Ditch Fridays',
 				'Rehab Beach Club',
 				'TAO Beach',
 				'Wet Republic'
 			]
		}

		function nightClubList() {

			return [
				'1OAK',
 				'Drais',
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

	function HomeCtrl($scope, $ionicModal, $state, $timeout, HostService, TablesTonightService) {

		$scope.credentials       = {};
		$scope.updateInformation = false;
		$scope.login             = login;
		$scope.navigate          = navigate;
		$scope.openModal         = openModal;
		$scope.closeModal        = closeModal;
		$scope.signUp            = signUp;
		init();

		///////////////////////////////////////////////////////////////////////////

		function signUp() {
			$scope.updateInformation = 'step0';
		}

		function login() {
			$scope.message = '';
			$scope.loading = true;
			HostService.login($scope.credentials)
				.then(function(host) {
					$scope.loading = false;
					if (host.error) {
						return $scope.message = host.error;
					}
					$scope.updateInformation = 'step1';
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

		function closeModal(exitEarly) {
			if ($scope.updateInformation === 'step0' && !exitEarly) {
				$scope.message = "Thanks for signing up. You'll be receiving an e-mail with next steps shortly.";
				$timeout(function() {
					delete $scope.message;
				}, 5000);
				return $scope.updateInformation = false;
			}
			if (HostService.getHostInfo()) {
				$scope.updateInformation = 'step1';
			}
	    $scope.modal.remove();
			delete $scope.modal;
			init();
	  }

		function init() {
			$ionicModal.fromTemplateUrl('app/home/host-information.html', {
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

				$scope.$on('modal.removed', function() {
					if ($scope.updateInformation !== 'step1') {
						$timeout(function() {
							$scope.updateInformation = false;
						}, 500);
					}
			  });
			}
		}
	}
})();

angular
	.module('tablesTonight.home', [
		'app.home.host',
		'app.home.update-information',
		'tablesTonight.home.controller'
	]);

(function() {
	angular
		.module('app.home.host', [])
		.factory('HostService', function($http, TablesTonightService) {

			var svc                   = {};

			var hostInfo              = null;
			svc.create                = create;
			svc.login                 = login;
			svc.getHostInfo           = getHostInfo;
			svc.updateHostInformation = updateHostInformation
			svc.dayClubList           = TablesTonightService.dayClubList;
			svc.nightClubList         = TablesTonightService.nightClubList;

			return svc;

			function create(newUser) {
				return $http.post(TablesTonightService.getUrl() + 'host/create', newUser)
					.then(function(response) {
						if (!response.data.error) {
							return true;
						}
						return false;
					});
			}

			function login(credentials) {
				return $http.post(TablesTonightService.getUrl() + 'host/login', credentials)
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
				return $http.post(TablesTonightService.getUrl() + 'host/update', hostInfo)
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
			$scope.loading = true;
			$scope.name = $stateParams.name;
			var type = $stateParams.type;
			getHosts($scope.name)
				.then(function(clubInfo) {
					$scope.loading = false;
					$scope.info = clubInfo.info;
					$scope.hosts = clubInfo.hosts;
				});
	  });

		$scope.$on("$ionicView.afterLeave", function(HostDetailCtrl) {
			delete $scope.info;
			delete $scope.hosts;
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

	function HostsService($http, TablesTonightService) {
		var svc = {};
		svc.getNightClubHosts = getNightClubHosts;
		svc.getDayClubHosts   = getDayClubHosts;
		svc.saveHost          = saveHost;
		svc.getHost           = getHost;
		return svc;

		function getNightClubHosts(nightclub) {
			return $http.get(TablesTonightService.getUrl() + 'nightclub/' + nightclub)
				.then(function(response) {
					return response.data;
				});
		}

		function getDayClubHosts(dayclub) {
			return $http.get(TablesTonightService.getUrl() + 'dayclub/' + dayclub)
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
				scope.create = create;
				scope.next   = next;
				scope.finish = finish;

				function create(newUser) {
					HostService.create(newUser)
						.then(function(hostCreated) {
							scope.close();
						});
				}

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
		'app.home.update-information.step0',
		'app.home.update-information.step1',
		'app.home.update-information.step2'
	]);

(function() {
	angular
		.module('app.home.update-information.step0', [])
		.directive('updateInformationStepZero', function(HostService) {
			var directive = {
					scope: {
						step: '=',
						create: '='
					},
					restrict: 'AE',
					link: link,
					templateUrl: './app/home/update-information/step0/step0.html'
			};

			return directive;

			///////////////////////////////////////////////////////////////////////////

			function link(scope, element, attrs) {
				scope.newEntry = {};
				scope.submitEmail = submitEmail;

				function submitEmail() {
					scope.loading = true;
					scope.create(scope.newEntry);
					delete scope.newEntry;
				}
			}

		});
})();

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

				scope.completeUpdate = completeUpdate;

				function completeUpdate() {
					scope.loading = true;
					scope.finish();
				}
			}

		});
})();

(function() {
	angular
		.module('app.data', [])
		.factory('TablesTonightService', TablesTonightService);

	function TablesTonightService($http) {

		var svc = {};
		var location = null;
		var url = 'http://tablesTonight.herokuapp.com/';

		svc.currentLocation = currentLocation;
		svc.saveLocation = saveLocation;
		svc.dayClubList   = dayClubList();
		svc.nightClubList = nightClubList();
		svc.getUrl = getUrl;
		init();

		return svc;

		function init() {
			$http.get('http://localhost:1337/origin')
				.then(function(response) {
					if (response.data) {
						url = response.data;
					}
				});
		}

		function getUrl() {
			return url;
		}

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
 				'Drais Beach Club',
 				'Encore Beach Club',
 				'Foxtail Pool Club',
 				'Lavo Brunch',
 				'Liquid Pool',
 				'Marquee Day Club',
 				'Moorea Beach Club',
 				'Ditch Fridays',
 				'Rehab Beach Club',
 				'TAO Beach',
 				'Wet Republic'
 			]
		}

		function nightClubList() {

			return [
				'1OAK',
 				'Drais',
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

	function HomeCtrl($scope, $ionicModal, $state, $timeout, HostService, TablesTonightService) {

		$scope.credentials       = {};
		$scope.updateInformation = false;
		$scope.login             = login;
		$scope.navigate          = navigate;
		$scope.openModal         = openModal;
		$scope.closeModal        = closeModal;
		$scope.signUp            = signUp;
		init();

		///////////////////////////////////////////////////////////////////////////

		function signUp() {
			$scope.updateInformation = 'step0';
		}

		function login() {
			$scope.message = '';
			$scope.loading = true;
			HostService.login($scope.credentials)
				.then(function(host) {
					$scope.loading = false;
					if (host.error) {
						return $scope.message = host.error;
					}
					$scope.updateInformation = 'step1';
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

		function closeModal(exitEarly) {
			if ($scope.updateInformation === 'step0' && !exitEarly) {
				$scope.message = "Thanks for signing up. You'll be receiving an e-mail with next steps shortly.";
				$timeout(function() {
					delete $scope.message;
				}, 5000);
				return $scope.updateInformation = false;
			}
			if (HostService.getHostInfo()) {
				$scope.updateInformation = 'step1';
			}
	    $scope.modal.remove();
			delete $scope.modal;
			init();
	  }

		function init() {
			$ionicModal.fromTemplateUrl('app/home/host-information.html', {
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

				$scope.$on('modal.removed', function() {
					if ($scope.updateInformation !== 'step1') {
						$timeout(function() {
							$scope.updateInformation = false;
						}, 500);
					}
			  });
			}
		}
	}
})();

angular
	.module('tablesTonight.home', [
		'app.home.host',
		'app.home.update-information',
		'tablesTonight.home.controller'
	]);

(function() {
	angular
		.module('app.home.host', [])
		.factory('HostService', function($http, TablesTonightService) {

			var svc                   = {};

			var hostInfo              = null;
			svc.create                = create;
			svc.login                 = login;
			svc.getHostInfo           = getHostInfo;
			svc.updateHostInformation = updateHostInformation
			svc.dayClubList           = TablesTonightService.dayClubList;
			svc.nightClubList         = TablesTonightService.nightClubList;

			return svc;

			function create(newUser) {
				return $http.post(TablesTonightService.getUrl() + 'host/create', newUser)
					.then(function(response) {
						if (!response.data.error) {
							return true;
						}
						return false;
					});
			}

			function login(credentials) {
				return $http.post(TablesTonightService.getUrl() + 'host/login', credentials)
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
				return $http.post(TablesTonightService.getUrl() + 'host/update', hostInfo)
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
			$scope.textMessageBody = 'Hey ' + $scope.host.firstName + '. I found your contact information on Connect Vegas! Can you help me out?';
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
			$scope.loading = true;
			$scope.name = $stateParams.name;
			var type = $stateParams.type;
			getHosts($scope.name)
				.then(function(clubInfo) {
					$scope.loading = false;
					$scope.info = clubInfo.info;
					$scope.hosts = clubInfo.hosts;
				});
	  });

		$scope.$on("$ionicView.afterLeave", function(HostDetailCtrl) {
			delete $scope.info;
			delete $scope.hosts;
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

	function HostsService($http, TablesTonightService) {
		var svc = {};
		svc.getNightClubHosts = getNightClubHosts;
		svc.getDayClubHosts   = getDayClubHosts;
		svc.saveHost          = saveHost;
		svc.getHost           = getHost;
		return svc;

		function getNightClubHosts(nightclub) {
			return $http.get(TablesTonightService.getUrl() + 'nightclub/' + nightclub)
				.then(function(response) {
					return response.data;
				});
		}

		function getDayClubHosts(dayclub) {
			return $http.get(TablesTonightService.getUrl() + 'dayclub/' + dayclub)
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
				scope.create = create;
				scope.next   = next;
				scope.finish = finish;

				function create(newUser) {
					HostService.create(newUser)
						.then(function(hostCreated) {
							scope.close();
						});
				}

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
		'app.home.update-information.step0',
		'app.home.update-information.step1',
		'app.home.update-information.step2'
	]);

(function() {
	angular
		.module('app.home.update-information.step0', [])
		.directive('updateInformationStepZero', function(HostService) {
			var directive = {
					scope: {
						step: '=',
						create: '='
					},
					restrict: 'AE',
					link: link,
					templateUrl: './app/home/update-information/step0/step0.html'
			};

			return directive;

			///////////////////////////////////////////////////////////////////////////

			function link(scope, element, attrs) {
				scope.newEntry = {};
				scope.submitEmail = submitEmail;

				function submitEmail() {
					scope.loading = true;
					scope.create(scope.newEntry);
					delete scope.newEntry;
				}
			}

		});
})();

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

				scope.completeUpdate = completeUpdate;

				function completeUpdate() {
					scope.loading = true;
					scope.finish();
				}
			}

		});
})();

(function() {
	angular
		.module('app.data', [])
		.factory('TablesTonightService', TablesTonightService);

	function TablesTonightService($http) {

		var svc = {};
		var location = null;
		var url = 'http://tablesTonight.herokuapp.com/';

		svc.currentLocation = currentLocation;
		svc.saveLocation = saveLocation;
		svc.dayClubList   = dayClubList();
		svc.nightClubList = nightClubList();
		svc.getUrl = getUrl;
		init();

		return svc;

		function init() {
			$http.get('http://localhost:1337/origin')
				.then(function(response) {
					if (response.data) {
						url = response.data;
					}
				});
		}

		function getUrl() {
			return url;
		}

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
 				'Drais Beach Club',
 				'Encore Beach Club',
 				'Foxtail Pool Club',
 				'Lavo Brunch',
 				'Liquid Pool',
 				'Marquee Day Club',
 				'Moorea Beach Club',
 				'Ditch Fridays',
 				'Rehab Beach Club',
 				'TAO Beach',
 				'Wet Republic'
 			]
		}

		function nightClubList() {

			return [
				'1OAK',
 				'Drais',
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
		'app.data',
		'ngCordova'
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

	function HomeCtrl($scope, $ionicModal, $state, $timeout, HostService, TablesTonightService) {

		$scope.credentials       = {};
		$scope.updateInformation = false;
		$scope.login             = login;
		$scope.navigate          = navigate;
		$scope.openModal         = openModal;
		$scope.closeModal        = closeModal;
		$scope.signUp            = signUp;
		init();

		///////////////////////////////////////////////////////////////////////////

		function signUp() {
			$scope.updateInformation = 'step0';
		}

		function login() {
			$scope.message = '';
			$scope.loading = true;
			HostService.login($scope.credentials)
				.then(function(host) {
					$scope.loading = false;
					if (host.error) {
						return $scope.message = host.error;
					}
					$scope.updateInformation = 'step1';
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

		function closeModal(exitEarly) {
			if ($scope.updateInformation === 'step0' && !exitEarly) {
				$scope.message = "Thanks for signing up. You'll be receiving an e-mail with next steps shortly.";
				$timeout(function() {
					delete $scope.message;
				}, 5000);
				return $scope.updateInformation = false;
			}
			if (HostService.getHostInfo()) {
				$scope.updateInformation = 'step1';
			}
	    $scope.modal.remove();
			delete $scope.modal;
			init();
	  }

		function init() {
			$ionicModal.fromTemplateUrl('app/home/host-information.html', {
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

				$scope.$on('modal.removed', function() {
					if ($scope.updateInformation !== 'step1') {
						$timeout(function() {
							$scope.updateInformation = false;
						}, 500);
					}
			  });
			}
		}
	}
})();

angular
	.module('tablesTonight.home', [
		'app.home.host',
		'app.home.update-information',
		'tablesTonight.home.controller'
	]);

(function() {
	angular
		.module('app.home.host', [])
		.factory('HostService', function($http, TablesTonightService) {

			var svc                   = {};

			var hostInfo              = null;
			svc.create                = create;
			svc.login                 = login;
			svc.getHostInfo           = getHostInfo;
			svc.updateHostInformation = updateHostInformation
			svc.dayClubList           = TablesTonightService.dayClubList;
			svc.nightClubList         = TablesTonightService.nightClubList;

			return svc;

			function create(newUser) {
				return $http.post(TablesTonightService.getUrl() + 'host/create', newUser)
					.then(function(response) {
						if (!response.data.error) {
							return true;
						}
						return false;
					});
			}

			function login(credentials) {
				return $http.post(TablesTonightService.getUrl() + 'host/login', credentials)
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
				return $http.post(TablesTonightService.getUrl() + 'host/update', hostInfo)
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

	function HostDetailCtrl($scope, HostsService, $stateParams, $cordovaCamera) {
	  $scope.$on("$ionicView.beforeEnter", function() {
	    $scope.host = HostsService.getHost();
			$scope.textMessageBody = 'Hey ' + $scope.host.firstName + '. I found your contact information on Connect Vegas! Can you help me out?';
	  });

		document.addEventListener("deviceready", function () {

			var options = {
	      quality: 50,
	      destinationType: Camera.DestinationType.DATA_URL,
	      sourceType: Camera.PictureSourceType.CAMERA,
	      allowEdit: true,
	      encodingType: Camera.EncodingType.JPEG,
	      targetWidth: 100,
	      targetHeight: 100,
	      popoverOptions: CameraPopoverOptions,
	      saveToPhotoAlbum: false,
		  correctOrientation:true
	    };

	    $cordovaCamera.getPicture(options).then(function(imageData) {
	      var image = document.getElementById('myImage');
	      image.src = "data:image/jpeg;base64," + imageData;
	    }, function(err) {
	      // error
	    });

		}, false);
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
			$scope.loading = true;
			$scope.name = $stateParams.name;
			var type = $stateParams.type;
			getHosts($scope.name)
				.then(function(clubInfo) {
					$scope.loading = false;
					$scope.info = clubInfo.info;
					$scope.hosts = clubInfo.hosts;
				});
	  });

		$scope.$on("$ionicView.afterLeave", function(HostDetailCtrl) {
			delete $scope.info;
			delete $scope.hosts;
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

	function HostsService($http, TablesTonightService) {
		var svc = {};
		svc.getNightClubHosts = getNightClubHosts;
		svc.getDayClubHosts   = getDayClubHosts;
		svc.saveHost          = saveHost;
		svc.getHost           = getHost;
		return svc;

		function getNightClubHosts(nightclub) {
			return $http.get(TablesTonightService.getUrl() + 'nightclub/' + nightclub)
				.then(function(response) {
					return response.data;
				});
		}

		function getDayClubHosts(dayclub) {
			return $http.get(TablesTonightService.getUrl() + 'dayclub/' + dayclub)
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
				scope.create = create;
				scope.next   = next;
				scope.finish = finish;

				function create(newUser) {
					HostService.create(newUser)
						.then(function(hostCreated) {
							scope.close();
						});
				}

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
		'app.home.update-information.step0',
		'app.home.update-information.step1',
		'app.home.update-information.step2'
	]);

(function() {
	angular
		.module('app.home.update-information.step0', [])
		.directive('updateInformationStepZero', function(HostService) {
			var directive = {
					scope: {
						step: '=',
						create: '='
					},
					restrict: 'AE',
					link: link,
					templateUrl: './app/home/update-information/step0/step0.html'
			};

			return directive;

			///////////////////////////////////////////////////////////////////////////

			function link(scope, element, attrs) {
				scope.newEntry = {};
				scope.submitEmail = submitEmail;

				function submitEmail() {
					scope.loading = true;
					scope.create(scope.newEntry);
					delete scope.newEntry;
				}
			}

		});
})();

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

				scope.completeUpdate = completeUpdate;

				function completeUpdate() {
					scope.loading = true;
					scope.finish();
				}
			}

		});
})();

(function() {
	angular
		.module('app.data', [])
		.factory('TablesTonightService', TablesTonightService);

	function TablesTonightService($http) {

		var svc = {};
		var location = null;
		var url = 'http://tablesTonight.herokuapp.com/';

		svc.currentLocation = currentLocation;
		svc.saveLocation = saveLocation;
		svc.dayClubList   = dayClubList();
		svc.nightClubList = nightClubList();
		svc.getUrl = getUrl;
		init();

		return svc;

		function init() {
			$http.get('http://localhost:1337/origin')
				.then(function(response) {
					if (response.data) {
						url = response.data;
					}
				});
		}

		function getUrl() {
			return url;
		}

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
 				'Drais Beach Club',
 				'Encore Beach Club',
 				'Foxtail Pool Club',
 				'Lavo Brunch',
 				'Liquid Pool',
 				'Marquee Day Club',
 				'Moorea Beach Club',
 				'Ditch Fridays',
 				'Rehab Beach Club',
 				'TAO Beach',
 				'Wet Republic'
 			]
		}

		function nightClubList() {

			return [
				'1OAK',
 				'Drais',
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
		'app.data',
		'ngCordova'
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

	function HomeCtrl($scope, $ionicModal, $state, $timeout, HostService, TablesTonightService) {

		$scope.credentials       = {};
		$scope.updateInformation = false;
		$scope.login             = login;
		$scope.navigate          = navigate;
		$scope.openModal         = openModal;
		$scope.closeModal        = closeModal;
		$scope.signUp            = signUp;
		init();

		///////////////////////////////////////////////////////////////////////////

		function signUp() {
			$scope.updateInformation = 'step0';
		}

		function login() {
			$scope.message = '';
			$scope.loading = true;
			HostService.login($scope.credentials)
				.then(function(host) {
					$scope.loading = false;
					if (host.error) {
						return $scope.message = host.error;
					}
					$scope.updateInformation = 'step1';
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

		function closeModal(exitEarly) {
			if ($scope.updateInformation === 'step0' && !exitEarly) {
				$scope.message = "Thanks for signing up. You'll be receiving an e-mail with next steps shortly.";
				$timeout(function() {
					delete $scope.message;
				}, 5000);
				return $scope.updateInformation = false;
			}
			if (HostService.getHostInfo()) {
				$scope.updateInformation = 'step1';
			}
	    $scope.modal.remove();
			delete $scope.modal;
			init();
	  }

		function init() {
			$ionicModal.fromTemplateUrl('app/home/host-information.html', {
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

				$scope.$on('modal.removed', function() {
					if ($scope.updateInformation !== 'step1') {
						$timeout(function() {
							$scope.updateInformation = false;
						}, 500);
					}
			  });
			}
		}
	}
})();

angular
	.module('tablesTonight.home', [
		'app.home.host',
		'app.home.update-information',
		'tablesTonight.home.controller'
	]);

(function() {
	angular
		.module('app.home.host', [])
		.factory('HostService', function($http, TablesTonightService) {

			var svc                   = {};

			var hostInfo              = null;
			svc.create                = create;
			svc.login                 = login;
			svc.getHostInfo           = getHostInfo;
			svc.updateHostInformation = updateHostInformation
			svc.dayClubList           = TablesTonightService.dayClubList;
			svc.nightClubList         = TablesTonightService.nightClubList;

			return svc;

			function create(newUser) {
				return $http.post(TablesTonightService.getUrl() + 'host/create', newUser)
					.then(function(response) {
						if (!response.data.error) {
							return true;
						}
						return false;
					});
			}

			function login(credentials) {
				return $http.post(TablesTonightService.getUrl() + 'host/login', credentials)
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
				return $http.post(TablesTonightService.getUrl() + 'host/update', hostInfo)
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
			$scope.textMessageBody = 'Hey ' + $scope.host.firstName + '. I found your contact information on Connect Vegas! Can you help me out?';
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
			$scope.loading = true;
			$scope.name = $stateParams.name;
			var type = $stateParams.type;
			getHosts($scope.name)
				.then(function(clubInfo) {
					$scope.loading = false;
					$scope.info = clubInfo.info;
					$scope.hosts = clubInfo.hosts;
				});
	  });

		$scope.$on("$ionicView.afterLeave", function(HostDetailCtrl) {
			delete $scope.info;
			delete $scope.hosts;
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

	function HostsService($http, TablesTonightService) {
		var svc = {};
		svc.getNightClubHosts = getNightClubHosts;
		svc.getDayClubHosts   = getDayClubHosts;
		svc.saveHost          = saveHost;
		svc.getHost           = getHost;
		return svc;

		function getNightClubHosts(nightclub) {
			return $http.get(TablesTonightService.getUrl() + 'nightclub/' + nightclub)
				.then(function(response) {
					return response.data;
				});
		}

		function getDayClubHosts(dayclub) {
			return $http.get(TablesTonightService.getUrl() + 'dayclub/' + dayclub)
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
				scope.create = create;
				scope.next   = next;
				scope.finish = finish;

				function create(newUser) {
					HostService.create(newUser)
						.then(function(hostCreated) {
							scope.close();
						});
				}

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
		'app.home.update-information.step0',
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

				document.addEventListener("deviceready", function () {
					scope.startCamera = startCamera;
			  }, false);

				function startCamera() {

					var options = {
			      quality: 50,
			      destinationType: Camera.DestinationType.DATA_URL,
			      sourceType: Camera.PictureSourceType.CAMERA,
			      allowEdit: true,
			      encodingType: Camera.EncodingType.JPEG,
			      targetWidth: 100,
			      targetHeight: 100,
			      popoverOptions: CameraPopoverOptions,
			      saveToPhotoAlbum: false,
					  correctOrientation:true
			    };

					$cordovaCamera.getPicture(options).then(function(imageData) {
			      var image = document.getElementById('myImage');
			      scope.hostImageSource = "data:image/jpeg;base64," + imageData;
			    }, function(err) {
			      // error
			    });
				}

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

				scope.completeUpdate = completeUpdate;

				function completeUpdate() {
					scope.loading = true;
					scope.finish();
				}
			}

		});
})();

(function() {
	angular
		.module('app.home.update-information.step0', [])
		.directive('updateInformationStepZero', function(HostService) {
			var directive = {
					scope: {
						step: '=',
						create: '='
					},
					restrict: 'AE',
					link: link,
					templateUrl: './app/home/update-information/step0/step0.html'
			};

			return directive;

			///////////////////////////////////////////////////////////////////////////

			function link(scope, element, attrs) {
				scope.newEntry = {};
				scope.submitEmail = submitEmail;

				function submitEmail() {
					scope.loading = true;
					scope.create(scope.newEntry);
					delete scope.newEntry;
				}
			}

		});
})();

(function() {
	angular
		.module('app.data', [])
		.factory('TablesTonightService', TablesTonightService);

	function TablesTonightService($http) {

		var svc = {};
		var location = null;
		var url = 'http://tablesTonight.herokuapp.com/';

		svc.currentLocation = currentLocation;
		svc.saveLocation = saveLocation;
		svc.dayClubList   = dayClubList();
		svc.nightClubList = nightClubList();
		svc.getUrl = getUrl;
		init();

		return svc;

		function init() {
			$http.get('http://localhost:1337/origin')
				.then(function(response) {
					if (response.data) {
						url = response.data;
					}
				});
		}

		function getUrl() {
			return url;
		}

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
 				'Drais Beach Club',
 				'Encore Beach Club',
 				'Foxtail Pool Club',
 				'Lavo Brunch',
 				'Liquid Pool',
 				'Marquee Day Club',
 				'Moorea Beach Club',
 				'Ditch Fridays',
 				'Rehab Beach Club',
 				'TAO Beach',
 				'Wet Republic'
 			]
		}

		function nightClubList() {

			return [
				'1OAK',
 				'Drais',
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
		'app.data',
		'ngCordova'
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

	function HomeCtrl($scope, $ionicModal, $state, $timeout, HostService, TablesTonightService) {

		$scope.credentials       = {};
		$scope.updateInformation = false;
		$scope.login             = login;
		$scope.navigate          = navigate;
		$scope.openModal         = openModal;
		$scope.closeModal        = closeModal;
		$scope.signUp            = signUp;
		init();

		///////////////////////////////////////////////////////////////////////////

		function signUp() {
			$scope.updateInformation = 'step0';
		}

		function login() {
			$scope.message = '';
			$scope.loading = true;
			HostService.login($scope.credentials)
				.then(function(host) {
					$scope.loading = false;
					if (host.error) {
						return $scope.message = host.error;
					}
					$scope.updateInformation = 'step1';
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

		function closeModal(exitEarly) {
			if ($scope.updateInformation === 'step0' && !exitEarly) {
				$scope.message = "Thanks for signing up. You'll be receiving an e-mail with next steps shortly.";
				$timeout(function() {
					delete $scope.message;
				}, 5000);
				return $scope.updateInformation = false;
			}
			if (HostService.getHostInfo()) {
				$scope.updateInformation = 'step1';
			}
	    $scope.modal.remove();
			delete $scope.modal;
			init();
	  }

		function init() {
			$ionicModal.fromTemplateUrl('app/home/host-information.html', {
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

				$scope.$on('modal.removed', function() {
					if ($scope.updateInformation !== 'step1') {
						$timeout(function() {
							$scope.updateInformation = false;
						}, 500);
					}
			  });
			}
		}
	}
})();

angular
	.module('tablesTonight.home', [
		'app.home.host',
		'app.home.update-information',
		'tablesTonight.home.controller'
	]);

(function() {
	angular
		.module('app.home.host', [])
		.factory('HostService', function($http, TablesTonightService) {

			var svc                   = {};

			var hostInfo              = null;
			svc.create                = create;
			svc.login                 = login;
			svc.getHostInfo           = getHostInfo;
			svc.updateHostInformation = updateHostInformation
			svc.dayClubList           = TablesTonightService.dayClubList;
			svc.nightClubList         = TablesTonightService.nightClubList;

			return svc;

			function create(newUser) {
				return $http.post(TablesTonightService.getUrl() + 'host/create', newUser)
					.then(function(response) {
						if (!response.data.error) {
							return true;
						}
						return false;
					});
			}

			function login(credentials) {
				return $http.post(TablesTonightService.getUrl() + 'host/login', credentials)
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
				return $http.post(TablesTonightService.getUrl() + 'host/update', hostInfo)
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
			$scope.textMessageBody = 'Hey ' + $scope.host.firstName + '. I found your contact information on Connect Vegas! Can you help me out?';
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
			$scope.loading = true;
			$scope.name = $stateParams.name;
			var type = $stateParams.type;
			getHosts($scope.name)
				.then(function(clubInfo) {
					$scope.loading = false;
					$scope.info = clubInfo.info;
					$scope.hosts = clubInfo.hosts;
				});
	  });

		$scope.$on("$ionicView.afterLeave", function(HostDetailCtrl) {
			delete $scope.info;
			delete $scope.hosts;
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

	function HostsService($http, TablesTonightService) {
		var svc = {};
		svc.getNightClubHosts = getNightClubHosts;
		svc.getDayClubHosts   = getDayClubHosts;
		svc.saveHost          = saveHost;
		svc.getHost           = getHost;
		return svc;

		function getNightClubHosts(nightclub) {
			return $http.get(TablesTonightService.getUrl() + 'nightclub/' + nightclub)
				.then(function(response) {
					return response.data;
				});
		}

		function getDayClubHosts(dayclub) {
			return $http.get(TablesTonightService.getUrl() + 'dayclub/' + dayclub)
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
				scope.create = create;
				scope.next   = next;
				scope.finish = finish;

				function create(newUser) {
					HostService.create(newUser)
						.then(function(hostCreated) {
							scope.close();
						});
				}

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
		'app.home.update-information.step0',
		'app.home.update-information.step1',
		'app.home.update-information.step2'
	]);

(function() {
	angular
		.module('app.home.update-information.step0', [])
		.directive('updateInformationStepZero', function(HostService) {
			var directive = {
					scope: {
						step: '=',
						create: '='
					},
					restrict: 'AE',
					link: link,
					templateUrl: './app/home/update-information/step0/step0.html'
			};

			return directive;

			///////////////////////////////////////////////////////////////////////////

			function link(scope, element, attrs) {
				scope.newEntry = {};
				scope.submitEmail = submitEmail;

				function submitEmail() {
					scope.loading = true;
					scope.create(scope.newEntry);
					delete scope.newEntry;
				}
			}

		});
})();

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

				document.addEventListener("deviceready", function () {
					scope.startCamera = startCamera;
			  }, false);

				function startCamera() {

					var options = {
			      quality: 50,
			      destinationType: Camera.DestinationType.DATA_URL,
			      sourceType: Camera.PictureSourceType.CAMERA,
			      allowEdit: true,
			      encodingType: Camera.EncodingType.JPEG,
			      targetWidth: 200,
			      targetHeight: 200,
			      popoverOptions: CameraPopoverOptions,
			      saveToPhotoAlbum: false,
					  correctOrientation:true
			    };

					$cordovaCamera.getPicture(options).then(function(imageData) {
			      var image = document.getElementById('myImage');
			      scope.hostImageSource = "data:image/jpeg;base64," + imageData;
			    }, function(err) {
			      // error
			    });
				}

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

				scope.completeUpdate = completeUpdate;

				function completeUpdate() {
					scope.loading = true;
					scope.finish();
				}
			}

		});
})();

(function() {
	angular
		.module('app.data', [])
		.factory('TablesTonightService', TablesTonightService);

	function TablesTonightService($http) {

		var svc = {};
		var location = null;
		var url = 'http://tablesTonight.herokuapp.com/';

		svc.currentLocation = currentLocation;
		svc.saveLocation = saveLocation;
		svc.dayClubList   = dayClubList();
		svc.nightClubList = nightClubList();
		svc.getUrl = getUrl;
		init();

		return svc;

		function init() {
			$http.get('http://localhost:1337/origin')
				.then(function(response) {
					if (response.data) {
						url = response.data;
					}
				});
		}

		function getUrl() {
			return url;
		}

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
 				'Drais Beach Club',
 				'Encore Beach Club',
 				'Foxtail Pool Club',
 				'Lavo Brunch',
 				'Liquid Pool',
 				'Marquee Day Club',
 				'Moorea Beach Club',
 				'Ditch Fridays',
 				'Rehab Beach Club',
 				'TAO Beach',
 				'Wet Republic'
 			]
		}

		function nightClubList() {

			return [
				'1OAK',
 				'Drais',
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
		'app.data',
		'ngCordova'
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

	function HomeCtrl($scope, $ionicModal, $state, $timeout, HostService, TablesTonightService) {

		$scope.credentials       = {};
		$scope.updateInformation = false;
		$scope.login             = login;
		$scope.navigate          = navigate;
		$scope.openModal         = openModal;
		$scope.closeModal        = closeModal;
		$scope.signUp            = signUp;
		init();

		///////////////////////////////////////////////////////////////////////////

		function signUp() {
			$scope.updateInformation = 'step0';
		}

		function login() {
			$scope.message = '';
			$scope.loading = true;
			HostService.login($scope.credentials)
				.then(function(host) {
					$scope.loading = false;
					if (host.error) {
						return $scope.message = host.error;
					}
					$scope.updateInformation = 'step1';
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

		function closeModal(exitEarly) {
			if ($scope.updateInformation === 'step0' && !exitEarly) {
				$scope.message = "Thanks for signing up. You'll be receiving an e-mail with next steps shortly.";
				$timeout(function() {
					delete $scope.message;
				}, 5000);
				return $scope.updateInformation = false;
			}
			if (HostService.getHostInfo()) {
				$scope.updateInformation = 'step1';
			}
	    $scope.modal.remove();
			delete $scope.modal;
			init();
	  }

		function init() {
			$ionicModal.fromTemplateUrl('app/home/host-information.html', {
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

				$scope.$on('modal.removed', function() {
					if ($scope.updateInformation !== 'step1') {
						$timeout(function() {
							$scope.updateInformation = false;
						}, 500);
					}
			  });
			}
		}
	}
})();

angular
	.module('tablesTonight.home', [
		'app.home.host',
		'app.home.update-information',
		'tablesTonight.home.controller'
	]);

(function() {
	angular
		.module('app.home.host', [])
		.factory('HostService', function($http, TablesTonightService) {

			var svc                   = {};

			var hostInfo              = null;
			svc.create                = create;
			svc.login                 = login;
			svc.getHostInfo           = getHostInfo;
			svc.updateHostInformation = updateHostInformation
			svc.dayClubList           = TablesTonightService.dayClubList;
			svc.nightClubList         = TablesTonightService.nightClubList;

			return svc;

			function create(newUser) {
				return $http.post(TablesTonightService.getUrl() + 'host/create', newUser)
					.then(function(response) {
						if (!response.data.error) {
							return true;
						}
						return false;
					});
			}

			function login(credentials) {
				return $http.post(TablesTonightService.getUrl() + 'host/login', credentials)
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
				return $http.post(TablesTonightService.getUrl() + 'host/update', hostInfo)
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
			$scope.textMessageBody = 'Hey ' + $scope.host.firstName + '. I found your contact information on Connect Vegas! Can you help me out?';
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
			$scope.loading = true;
			$scope.name = $stateParams.name;
			var type = $stateParams.type;
			getHosts($scope.name)
				.then(function(clubInfo) {
					$scope.loading = false;
					$scope.info = clubInfo.info;
					$scope.hosts = clubInfo.hosts;
				});
	  });

		$scope.$on("$ionicView.afterLeave", function(HostDetailCtrl) {
			delete $scope.info;
			delete $scope.hosts;
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

	function HostsService($http, TablesTonightService) {
		var svc = {};
		svc.getNightClubHosts = getNightClubHosts;
		svc.getDayClubHosts   = getDayClubHosts;
		svc.saveHost          = saveHost;
		svc.getHost           = getHost;
		return svc;

		function getNightClubHosts(nightclub) {
			return $http.get(TablesTonightService.getUrl() + 'nightclub/' + nightclub)
				.then(function(response) {
					return response.data;
				});
		}

		function getDayClubHosts(dayclub) {
			return $http.get(TablesTonightService.getUrl() + 'dayclub/' + dayclub)
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
				scope.create = create;
				scope.next   = next;
				scope.finish = finish;

				function create(newUser) {
					HostService.create(newUser)
						.then(function(hostCreated) {
							scope.close();
						});
				}

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
		'app.home.update-information.step0',
		'app.home.update-information.step1',
		'app.home.update-information.step2'
	]);

(function() {
	angular
		.module('app.home.update-information.step0', [])
		.directive('updateInformationStepZero', function(HostService) {
			var directive = {
					scope: {
						step: '=',
						create: '='
					},
					restrict: 'AE',
					link: link,
					templateUrl: './app/home/update-information/step0/step0.html'
			};

			return directive;

			///////////////////////////////////////////////////////////////////////////

			function link(scope, element, attrs) {
				scope.newEntry = {};
				scope.submitEmail = submitEmail;

				function submitEmail() {
					scope.loading = true;
					scope.create(scope.newEntry);
					delete scope.newEntry;
				}
			}

		});
})();

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

				document.addEventListener("deviceready", function () {
					scope.startCamera = startCamera;
			  }, false);

				function startCamera() {

					var options = {
			      quality: 50,
			      destinationType: Camera.DestinationType.DATA_URL,
			      sourceType: Camera.PictureSourceType.CAMERA,
			      allowEdit: true,
			      encodingType: Camera.EncodingType.JPEG,
			      targetWidth: 200,
			      targetHeight: 200,
			      popoverOptions: CameraPopoverOptions,
			      saveToPhotoAlbum: false,
					  correctOrientation:true
			    };

					$cordovaCamera.getPicture(options).then(function(imageData) {
			      var image = document.getElementById('myImage');
			      scope.host.photoInfo = "data:image/jpeg;base64," + imageData;
			    }, function(err) {
			      // error
			    });
				}

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

				scope.completeUpdate = completeUpdate;

				function completeUpdate() {
					scope.loading = true;
					scope.finish();
				}
			}

		});
})();

(function() {
	angular
		.module('app.data', [])
		.factory('TablesTonightService', TablesTonightService);

	function TablesTonightService($http) {

		var svc = {};
		var location = null;
		var url = 'http://tablesTonight.herokuapp.com/';

		svc.currentLocation = currentLocation;
		svc.saveLocation = saveLocation;
		svc.dayClubList   = dayClubList();
		svc.nightClubList = nightClubList();
		svc.getUrl = getUrl;
		init();

		return svc;

		function init() {
			$http.get('http://localhost:1337/origin')
				.then(function(response) {
					if (response.data) {
						url = response.data;
					}
				});
		}

		function getUrl() {
			return url;
		}

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
 				'Drais Beach Club',
 				'Encore Beach Club',
 				'Foxtail Pool Club',
 				'Lavo Brunch',
 				'Liquid Pool',
 				'Marquee Day Club',
 				'Moorea Beach Club',
 				'Ditch Fridays',
 				'Rehab Beach Club',
 				'TAO Beach',
 				'Wet Republic'
 			]
		}

		function nightClubList() {

			return [
				'1OAK',
 				'Drais',
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
		'app.data',
		'ngCordova'
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

	function HomeCtrl($scope, $ionicModal, $state, $timeout, HostService, TablesTonightService) {

		$scope.credentials       = {};
		$scope.updateInformation = false;
		$scope.login             = login;
		$scope.navigate          = navigate;
		$scope.openModal         = openModal;
		$scope.closeModal        = closeModal;
		$scope.signUp            = signUp;
		init();

		///////////////////////////////////////////////////////////////////////////

		function signUp() {
			$scope.updateInformation = 'step0';
		}

		function login() {
			$scope.message = '';
			$scope.loading = true;
			HostService.login($scope.credentials)
				.then(function(host) {
					$scope.loading = false;
					if (host.error) {
						return $scope.message = host.error;
					}
					$scope.updateInformation = 'step1';
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

		function closeModal(exitEarly) {
			if ($scope.updateInformation === 'step0' && !exitEarly) {
				$scope.message = "Thanks for signing up. You'll be receiving an e-mail with next steps shortly.";
				$timeout(function() {
					delete $scope.message;
				}, 5000);
				return $scope.updateInformation = false;
			}
			if (HostService.getHostInfo()) {
				$scope.updateInformation = 'step1';
			}
	    $scope.modal.remove();
			delete $scope.modal;
			init();
	  }

		function init() {
			$ionicModal.fromTemplateUrl('app/home/host-information.html', {
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

				$scope.$on('modal.removed', function() {
					if ($scope.updateInformation !== 'step1') {
						$timeout(function() {
							$scope.updateInformation = false;
						}, 500);
					}
			  });
			}
		}
	}
})();

angular
	.module('tablesTonight.home', [
		'app.home.host',
		'app.home.update-information',
		'tablesTonight.home.controller'
	]);

(function() {
	angular
		.module('app.home.host', [])
		.factory('HostService', function($http, TablesTonightService) {

			var svc                   = {};

			var hostInfo              = null;
			svc.create                = create;
			svc.login                 = login;
			svc.getHostInfo           = getHostInfo;
			svc.updateHostInformation = updateHostInformation
			svc.dayClubList           = TablesTonightService.dayClubList;
			svc.nightClubList         = TablesTonightService.nightClubList;

			return svc;

			function create(newUser) {
				return $http.post(TablesTonightService.getUrl() + 'host/create', newUser)
					.then(function(response) {
						if (!response.data.error) {
							return true;
						}
						return false;
					});
			}

			function login(credentials) {
				return $http.post(TablesTonightService.getUrl() + 'host/login', credentials)
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
				return $http.post(TablesTonightService.getUrl() + 'host/update', hostInfo)
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
			$scope.textMessageBody = 'Hey ' + $scope.host.firstName + '. I found your contact information on Connect Vegas! Can you help me out?';
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
			$scope.loading = true;
			$scope.name = $stateParams.name;
			var type = $stateParams.type;
			getHosts($scope.name)
				.then(function(clubInfo) {
					$scope.loading = false;
					$scope.info = clubInfo.info;
					$scope.hosts = clubInfo.hosts;
				});
	  });

		$scope.$on("$ionicView.afterLeave", function(HostDetailCtrl) {
			delete $scope.info;
			delete $scope.hosts;
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

	function HostsService($http, TablesTonightService) {
		var svc = {};
		svc.getNightClubHosts = getNightClubHosts;
		svc.getDayClubHosts   = getDayClubHosts;
		svc.saveHost          = saveHost;
		svc.getHost           = getHost;
		return svc;

		function getNightClubHosts(nightclub) {
			return $http.get(TablesTonightService.getUrl() + 'nightclub/' + nightclub)
				.then(function(response) {
					return response.data;
				});
		}

		function getDayClubHosts(dayclub) {
			return $http.get(TablesTonightService.getUrl() + 'dayclub/' + dayclub)
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
				scope.create = create;
				scope.next   = next;
				scope.finish = finish;

				function create(newUser) {
					HostService.create(newUser)
						.then(function(hostCreated) {
							scope.close();
						});
				}

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
		'app.home.update-information.step0',
		'app.home.update-information.step1',
		'app.home.update-information.step2'
	]);

(function() {
	angular
		.module('app.home.update-information.step0', [])
		.directive('updateInformationStepZero', function(HostService) {
			var directive = {
					scope: {
						step: '=',
						create: '='
					},
					restrict: 'AE',
					link: link,
					templateUrl: './app/home/update-information/step0/step0.html'
			};

			return directive;

			///////////////////////////////////////////////////////////////////////////

			function link(scope, element, attrs) {
				scope.newEntry = {};
				scope.submitEmail = submitEmail;

				function submitEmail() {
					scope.loading = true;
					scope.create(scope.newEntry);
					delete scope.newEntry;
				}
			}

		});
})();

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

				document.addEventListener("deviceready", function () {
					scope.startCamera = startCamera;
			  }, false);

				function startCamera() {

					var options = {
			      quality: 50,
			      destinationType: Camera.DestinationType.DATA_URL,
			      sourceType: Camera.PictureSourceType.CAMERA,
			      allowEdit: true,
			      encodingType: Camera.EncodingType.JPEG,
			      targetWidth: 200,
			      targetHeight: 200,
			      popoverOptions: CameraPopoverOptions,
			      saveToPhotoAlbum: false,
					  correctOrientation:true
			    };

					$cordovaCamera.getPicture(options).then(function(imageData) {
			      var image = document.getElementById('myImage');
			      scope.host.photoInfo = "data:image/jpeg;base64," + imageData;
			    }, function(err) {
			      // error
			    });
				}

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

				scope.completeUpdate = completeUpdate;

				function completeUpdate() {
					scope.loading = true;
					scope.finish();
				}
			}

		});
})();

(function() {
	angular
		.module('app.data', [])
		.factory('TablesTonightService', TablesTonightService);

	function TablesTonightService($http) {

		var svc = {};
		var location = null;
		var url = 'http://tablesTonight.herokuapp.com/';

		svc.currentLocation = currentLocation;
		svc.saveLocation = saveLocation;
		svc.dayClubList   = dayClubList();
		svc.nightClubList = nightClubList();
		svc.getUrl = getUrl;
		init();

		return svc;

		function init() {
			$http.get('http://localhost:1337/origin')
				.then(function(response) {
					if (response.data) {
						url = response.data;
					}
				});
		}

		function getUrl() {
			return url;
		}

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
 				'Drais Beach Club',
 				'Encore Beach Club',
 				'Foxtail Pool Club',
 				'Lavo Brunch',
 				'Liquid Pool',
 				'Marquee Day Club',
 				'Moorea Beach Club',
 				'Ditch Fridays',
 				'Rehab Beach Club',
 				'TAO Beach',
 				'Wet Republic'
 			]
		}

		function nightClubList() {

			return [
				'1OAK',
 				'Drais',
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
		'app.data',
		'ngCordova'
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

	function HomeCtrl($scope, $ionicModal, $state, $timeout, HostService, TablesTonightService) {

		$scope.credentials       = {};
		$scope.updateInformation = false;
		$scope.login             = login;
		$scope.navigate          = navigate;
		$scope.openModal         = openModal;
		$scope.closeModal        = closeModal;
		$scope.signUp            = signUp;
		init();

		///////////////////////////////////////////////////////////////////////////

		function signUp() {
			$scope.updateInformation = 'step0';
		}

		function login() {
			$scope.message = '';
			$scope.loading = true;
			HostService.login($scope.credentials)
				.then(function(host) {
					$scope.loading = false;
					if (host.error) {
						return $scope.message = host.error;
					}
					$scope.updateInformation = 'step1';
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

		function closeModal(exitEarly) {
			if ($scope.updateInformation === 'step0' && !exitEarly) {
				$scope.message = "Thanks for signing up. You'll be receiving an e-mail with next steps shortly.";
				$timeout(function() {
					delete $scope.message;
				}, 5000);
				return $scope.updateInformation = false;
			}
			if (HostService.getHostInfo()) {
				$scope.updateInformation = 'step1';
			}
	    $scope.modal.remove();
			delete $scope.modal;
			init();
	  }

		function init() {
			$ionicModal.fromTemplateUrl('app/home/host-information.html', {
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

				$scope.$on('modal.removed', function() {
					if ($scope.updateInformation !== 'step1') {
						$timeout(function() {
							$scope.updateInformation = false;
						}, 500);
					}
			  });
			}
		}
	}
})();

angular
	.module('tablesTonight.home', [
		'app.home.host',
		'app.home.update-information',
		'tablesTonight.home.controller'
	]);

(function() {
	angular
		.module('app.home.host', [])
		.factory('HostService', function($http, TablesTonightService) {

			var svc                   = {};

			var hostInfo              = null;
			svc.create                = create;
			svc.login                 = login;
			svc.getHostInfo           = getHostInfo;
			svc.updateHostInformation = updateHostInformation
			svc.dayClubList           = TablesTonightService.dayClubList;
			svc.nightClubList         = TablesTonightService.nightClubList;

			return svc;

			function create(newUser) {
				return $http.post(TablesTonightService.getUrl() + 'host/create', newUser)
					.then(function(response) {
						if (!response.data.error) {
							return true;
						}
						return false;
					});
			}

			function login(credentials) {
				return $http.post(TablesTonightService.getUrl() + 'host/login', credentials)
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
				return $http.post(TablesTonightService.getUrl() + 'host/update', hostInfo)
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
			$scope.messageBody = 'Hey ' + $scope.host.firstName + '. I found your contact information on Connect Vegas! Can you help me out?';
			$scope.emailSubject = 'Connect Vegas client needs help!';
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
			$scope.loading = true;
			$scope.name = $stateParams.name;
			var type = $stateParams.type;
			getHosts($scope.name)
				.then(function(clubInfo) {
					$scope.loading = false;
					$scope.info = clubInfo.info;
					$scope.hosts = clubInfo.hosts;
				});
	  });

		$scope.$on("$ionicView.afterLeave", function(HostDetailCtrl) {
			delete $scope.info;
			delete $scope.hosts;
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

	function HostsService($http, TablesTonightService) {
		var svc = {};
		svc.getNightClubHosts = getNightClubHosts;
		svc.getDayClubHosts   = getDayClubHosts;
		svc.saveHost          = saveHost;
		svc.getHost           = getHost;
		return svc;

		function getNightClubHosts(nightclub) {
			return $http.get(TablesTonightService.getUrl() + 'nightclub/' + nightclub)
				.then(function(response) {
					return response.data;
				});
		}

		function getDayClubHosts(dayclub) {
			return $http.get(TablesTonightService.getUrl() + 'dayclub/' + dayclub)
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
				scope.create = create;
				scope.next   = next;
				scope.finish = finish;

				function create(newUser) {
					HostService.create(newUser)
						.then(function(hostCreated) {
							scope.close();
						});
				}

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
		'app.home.update-information.step0',
		'app.home.update-information.step1',
		'app.home.update-information.step2'
	]);

(function() {
	angular
		.module('app.home.update-information.step0', [])
		.directive('updateInformationStepZero', function(HostService) {
			var directive = {
					scope: {
						step: '=',
						create: '='
					},
					restrict: 'AE',
					link: link,
					templateUrl: './app/home/update-information/step0/step0.html'
			};

			return directive;

			///////////////////////////////////////////////////////////////////////////

			function link(scope, element, attrs) {
				scope.newEntry = {};
				scope.submitEmail = submitEmail;

				function submitEmail() {
					scope.loading = true;
					scope.create(scope.newEntry);
					delete scope.newEntry;
				}
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

				scope.completeUpdate = completeUpdate;

				function completeUpdate() {
					scope.loading = true;
					scope.finish();
				}
			}

		});
})();

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

				document.addEventListener("deviceready", function () {
					scope.startCamera = startCamera;
			  }, false);

				function startCamera() {

					var options = {
			      quality: 50,
			      destinationType: Camera.DestinationType.DATA_URL,
			      sourceType: Camera.PictureSourceType.CAMERA,
			      allowEdit: true,
			      encodingType: Camera.EncodingType.JPEG,
			      targetWidth: 200,
			      targetHeight: 200,
			      popoverOptions: CameraPopoverOptions,
			      saveToPhotoAlbum: false,
					  correctOrientation:true
			    };

					$cordovaCamera.getPicture(options).then(function(imageData) {
			      var image = document.getElementById('myImage');
			      scope.host.photoInfo = "data:image/jpeg;base64," + imageData;
			    }, function(err) {
			      // error
			    });
				}

			}

		});
})();

(function() {
	angular
		.module('app.data', [])
		.factory('TablesTonightService', TablesTonightService);

	function TablesTonightService($http) {

		var svc = {};
		var location = null;
		var url = 'http://tablesTonight.herokuapp.com/';

		svc.currentLocation = currentLocation;
		svc.saveLocation = saveLocation;
		svc.dayClubList   = dayClubList();
		svc.nightClubList = nightClubList();
		svc.getUrl = getUrl;
		init();

		return svc;

		function init() {
			$http.get('http://localhost:1337/origin')
				.then(function(response) {
					if (response.data) {
						url = response.data;
					}
				});
		}

		function getUrl() {
			return url;
		}

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
 				'Drais Beach Club',
 				'Encore Beach Club',
 				'Foxtail Pool Club',
 				'Lavo Brunch',
 				'Liquid Pool',
 				'Marquee Day Club',
 				'Moorea Beach Club',
 				'Ditch Fridays',
 				'Rehab Beach Club',
 				'TAO Beach',
 				'Wet Republic'
 			]
		}

		function nightClubList() {

			return [
				'1OAK',
 				'Drais',
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
		'app.data',
		'ngCordova'
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

	function HomeCtrl($scope, $ionicModal, $state, $timeout, HostService, TablesTonightService) {

		$scope.credentials       = {};
		$scope.updateInformation = false;
		$scope.login             = login;
		$scope.navigate          = navigate;
		$scope.openModal         = openModal;
		$scope.closeModal        = closeModal;
		$scope.signUp            = signUp;
		init();

		///////////////////////////////////////////////////////////////////////////

		function signUp() {
			$scope.updateInformation = 'step0';
		}

		function login() {
			$scope.message = '';
			$scope.loading = true;
			HostService.login($scope.credentials)
				.then(function(host) {
					$scope.loading = false;
					if (host.error) {
						return $scope.message = host.error;
					}
					$scope.updateInformation = 'step1';
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

		function closeModal(exitEarly) {
			if ($scope.updateInformation === 'step0' && !exitEarly) {
				$scope.message = "Thanks for signing up. You'll be receiving an e-mail with next steps shortly.";
				$timeout(function() {
					delete $scope.message;
				}, 5000);
				return $scope.updateInformation = false;
			}
			if (HostService.getHostInfo()) {
				$scope.updateInformation = 'step1';
			}
	    $scope.modal.remove();
			delete $scope.modal;
			init();
	  }

		function init() {
			$ionicModal.fromTemplateUrl('app/home/host-information.html', {
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

				$scope.$on('modal.removed', function() {
					if ($scope.updateInformation !== 'step1') {
						$timeout(function() {
							$scope.updateInformation = false;
						}, 500);
					}
			  });
			}
		}
	}
})();

angular
	.module('tablesTonight.home', [
		'app.home.host',
		'app.home.update-information',
		'tablesTonight.home.controller'
	]);

(function() {
	angular
		.module('app.home.host', [])
		.factory('HostService', function($http, TablesTonightService) {

			var svc                   = {};

			var hostInfo              = null;
			svc.create                = create;
			svc.login                 = login;
			svc.getHostInfo           = getHostInfo;
			svc.updateHostInformation = updateHostInformation
			svc.dayClubList           = TablesTonightService.dayClubList;
			svc.nightClubList         = TablesTonightService.nightClubList;

			return svc;

			function create(newUser) {
				return $http.post(TablesTonightService.getUrl() + 'host/create', newUser)
					.then(function(response) {
						if (!response.data.error) {
							return true;
						}
						return false;
					});
			}

			function login(credentials) {
				return $http.post(TablesTonightService.getUrl() + 'host/login', credentials)
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
				return $http.post(TablesTonightService.getUrl() + 'host/update', hostInfo)
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
			$scope.messageBody = 'Hey ' + $scope.host.firstName + '. I found your contact information on Connect Vegas! Can you help me out?';
			$scope.emailSubject = 'Connect Vegas client needs help!';
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
			$scope.loading = true;
			$scope.name = $stateParams.name;
			var type = $stateParams.type;
			getHosts($scope.name)
				.then(function(clubInfo) {
					$scope.loading = false;
					$scope.info = clubInfo.info;
					$scope.hosts = clubInfo.hosts;
				});
	  });

		$scope.$on("$ionicView.afterLeave", function(HostDetailCtrl) {
			delete $scope.info;
			delete $scope.hosts;
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

	function HostsService($http, TablesTonightService) {
		var svc = {};
		svc.getNightClubHosts = getNightClubHosts;
		svc.getDayClubHosts   = getDayClubHosts;
		svc.saveHost          = saveHost;
		svc.getHost           = getHost;
		return svc;

		function getNightClubHosts(nightclub) {
			return $http.get(TablesTonightService.getUrl() + 'nightclub/' + nightclub)
				.then(function(response) {
					return response.data;
				});
		}

		function getDayClubHosts(dayclub) {
			return $http.get(TablesTonightService.getUrl() + 'dayclub/' + dayclub)
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
				scope.create = create;
				scope.next   = next;
				scope.finish = finish;

				function create(newUser) {
					HostService.create(newUser)
						.then(function(hostCreated) {
							scope.close();
						});
				}

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
		'app.home.update-information.step0',
		'app.home.update-information.step1',
		'app.home.update-information.step2'
	]);

(function() {
	angular
		.module('app.home.update-information.step0', [])
		.directive('updateInformationStepZero', function(HostService) {
			var directive = {
					scope: {
						step: '=',
						create: '='
					},
					restrict: 'AE',
					link: link,
					templateUrl: './app/home/update-information/step0/step0.html'
			};

			return directive;

			///////////////////////////////////////////////////////////////////////////

			function link(scope, element, attrs) {
				scope.newEntry = {};
				scope.submitEmail = submitEmail;

				function submitEmail() {
					scope.loading = true;
					scope.create(scope.newEntry);
					delete scope.newEntry;
				}
			}

		});
})();

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

				document.addEventListener("deviceready", function () {
					scope.startCamera = startCamera;
			  }, false);

				function startCamera() {

					var options = {
			      quality: 50,
			      destinationType: Camera.DestinationType.DATA_URL,
			      sourceType: Camera.PictureSourceType.CAMERA,
			      allowEdit: true,
			      encodingType: Camera.EncodingType.JPEG,
			      targetWidth: 200,
			      targetHeight: 200,
			      popoverOptions: CameraPopoverOptions,
			      saveToPhotoAlbum: false,
					  correctOrientation:true
			    };

					$cordovaCamera.getPicture(options).then(function(imageData) {
			      var image = document.getElementById('myImage');
			      scope.host.photoInfo = "data:image/jpeg;base64," + imageData;
			    }, function(err) {
			      // error
			    });
				}

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

				scope.completeUpdate = completeUpdate;

				function completeUpdate() {
					scope.loading = true;
					scope.finish();
				}
			}

		});
})();
