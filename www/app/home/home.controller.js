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
