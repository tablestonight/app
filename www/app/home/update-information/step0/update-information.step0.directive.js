(function() {
	angular
		.module('app.home.update-information.step0', [])
		.directive('updateInformationStepZero', function(HostService) {
			var directive = {
					scope: {
						step: '=',
						create: '='
					},
					restrict: 'AE',
					link: link,
					templateUrl: './app/home/update-information/step0/step0.html'
			};

			return directive;

			///////////////////////////////////////////////////////////////////////////

			function link(scope, element, attrs) {
				scope.newEntry = {};
				scope.submitEmail = submitEmail;

				function submitEmail() {
					scope.loading = true;
					scope.create(scope.newEntry);
					delete scope.newEntry;
				}
			}

		});
})();
