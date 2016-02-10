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
