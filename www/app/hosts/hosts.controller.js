(function() {
	angular
		.module('tablesTonight.hosts.controller', [])
		.controller('HostsCtrl', HostsCtrl);

	function HostsCtrl($scope, $stateParams, HostsService) {
	  $scope.$on("$ionicView.beforeEnter", function(HostDetailCtrl) {
			$scope.name = $stateParams.name;
			var type = $stateParams.type;
			getHosts($scope.name)
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
