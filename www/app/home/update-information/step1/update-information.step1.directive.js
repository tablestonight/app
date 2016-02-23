(function() {
	angular
		.module('app.home.update-information.step1', [])
		.directive('updateInformationStepOne', function(HostService) {
			var directive = {
					scope: {
						step: '=',
						next: '='
					},
					restrict: 'AE',
					link: link,
					templateUrl: './app/home/update-information/step1/step1.html'
			};

			return directive;

			///////////////////////////////////////////////////////////////////////////

			function link(scope, element, attrs) {
				scope.host = HostService.getHostInfo();
				scope.nightClubList = HostService.nightClubList;
			}

		});
})();
