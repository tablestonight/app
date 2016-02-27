(function() {
	angular
		.module('app.home.host', [])
		.factory('HostService', function($http, TablesTonightService) {

			var svc                   = {};

			var hostInfo              = null;
			svc.login                 = login;
			svc.getHostInfo           = getHostInfo;
			svc.updateHostInformation = updateHostInformation
			svc.dayClubList           = TablesTonightService.dayClubList;
			svc.nightClubList         = TablesTonightService.nightClubList;

			return svc;

			function login(credentials) {
				return $http.post('http://localhost:1337/host/login', credentials)
					.then(function(response) {
						if (!response.data.error) {
							hostInfo = response.data;
						}
						return response.data;
					});
			}

			function getHostInfo() {
				return hostInfo;
			}

			function updateHostInformation() {
				return $http.post('http://localhost:1337/host/update', hostInfo)
					.then(function(response) {
						if (!response.data.error) {
							hostInfo = response.data;
						}
						return response.data;
					});
			}
		});
})();
