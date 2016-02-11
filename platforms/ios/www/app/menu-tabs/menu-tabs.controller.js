(function() {
	angular
		.module('tablesTonight.menu-tabs.controller', [])
		.controller('MenuTabsCtrl', MenuTabsCtrl);

	function MenuTabsCtrl($scope) {
	  $scope.$on('hide', function() {
	    $scope.hiding = true;
	  });

	  $scope.$on('show', function() {
	    $scope.hiding = false;
	  });
	}
})();
