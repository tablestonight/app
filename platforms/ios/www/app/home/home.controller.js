(function() {
	angular
		.module('tablesTonight.home.controller', [])
		.controller('HomeCtrl', HomeCtrl);

	function HomeCtrl($scope) {
	  $scope.$on("$ionicView.enter", function() {
	    $scope.$emit('show');
	  });
	}
})();
