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
				scope.getPicture = function() {
					// navigator.camera.getPicture(function(imageURI) {
					//
				  //   // imageURI is the URL of the image that we can use for
				  //   // an <img> element or backgroundImage.
					//
				  // }, function(err) {
					//
				  //   // Ruh-roh, something bad happened
					//
				  // }, cameraOptions);
				};
			}

		});
})();
