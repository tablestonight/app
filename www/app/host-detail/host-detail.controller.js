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
