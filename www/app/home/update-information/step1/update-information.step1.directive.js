(function() {
	angular
		.module('app.home.update-information.step1', [])
		.directive('updateInformationStepOne', function(HostService, $cordovaCamera) {
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

				document.addEventListener("deviceready", function () {
					scope.startCamera = startCamera;
			  }, false);

				function startCamera() {

					var options = {
			      quality: 50,
			      destinationType: Camera.DestinationType.DATA_URL,
			      sourceType: Camera.PictureSourceType.CAMERA,
			      allowEdit: true,
			      encodingType: Camera.EncodingType.JPEG,
			      targetWidth: 200,
			      targetHeight: 200,
			      popoverOptions: CameraPopoverOptions,
			      saveToPhotoAlbum: false,
					  correctOrientation:true
			    };

					$cordovaCamera.getPicture(options).then(function(imageData) {
			      var image = document.getElementById('myImage');
			      scope.host.photoInfo = "data:image/jpeg;base64," + imageData;
			    }, function(err) {
			      // error
			    });
				}

			}

		});
})();
