(function() {
	angular
		.module('tablesTonight.locations.controller', [])
		.controller('LocationsCtrl', LocationsCtrl);

	function LocationsCtrl($scope, LocationsService) {
		$scope.locations = LocationsService.all();
	}
})();
