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
