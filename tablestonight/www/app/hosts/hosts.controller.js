(function() {
	angular
		.module('tablesTonight.hosts.controller', [])
		.controller('HostsCtrl', HostsCtrl);

	function HostsCtrl($scope, HostsService) {
		$scope.chats = HostsService.all();
		console.log($scope.chats);
	  $scope.$on("$ionicView.enter", function() {
	    $scope.$emit('show');
	  });
	}
})();
