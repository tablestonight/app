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
