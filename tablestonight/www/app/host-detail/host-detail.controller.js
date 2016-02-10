(function() {
	angular
		.module('tablesTonight.host-detail.controller', [])
		.controller('HostDetailCtrl', HostDetailCtrl);

	function HostDetailCtrl($scope, HostsService, $stateParams) {
		$scope.host = HostsService.get($stateParams.hostId);
		console.log($scope.host);
	  $scope.$on("$ionicView.enter", function() {
	    $scope.$emit('hide');
	  });
	}
})();
