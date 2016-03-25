(function() {
	angular
		.module('app.home.update-information.step2', [])
		.directive('updateInformationStepTwo', function(HostService) {
			var directive = {
					scope: {
						step: '=',
						finish: '='
					},
					restrict: 'AE',
					link: link,
					templateUrl: './app/home/update-information/step2/step2.html'
			};

			return directive;

			///////////////////////////////////////////////////////////////////////////

			function link(scope, element, attrs) {
				scope.host = HostService.getHostInfo();
				scope.dayClubList = HostService.dayClubList;

				scope.completeUpdate = completeUpdate;

				function completeUpdate() {
					scope.loading = true;
					scope.finish();
				}
			}

		});
})();
