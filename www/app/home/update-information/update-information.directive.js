(function() {
	angular
		.module('app.home.update-information.steps', [])
		.directive('updateInformationSteps', function(HostService) {
			var directive = {
					scope: {
						step: '=',
						close: '='
					},
					restrict: 'AE',
					link: link,
					templateUrl: './app/home/update-information/update-information.html'
			};

			return directive;

			///////////////////////////////////////////////////////////////////////////

			function link(scope, element, attrs) {
				scope.step = 'step1';
				scope.next = next;
				scope.finish = finish;

				function next() {
					scope.step = 'step2';
				}

				function finish() {
					HostService.updateHostInformation()
						.then(function(host) {
							if (!host.error) {
								scope.close();
							}
						});
				}
			}

		});
})();
