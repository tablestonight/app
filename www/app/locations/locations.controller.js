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
