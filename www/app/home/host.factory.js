(function() {
	angular
		.module('app.home.host', [])
		.factory('HostService', function($http, TablesTonightService) {

			var svc                   = {};

			var hostInfo              = null;
			svc.create                = create;
			svc.login                 = login;
			svc.getHostInfo           = getHostInfo;
			svc.updateHostInformation = updateHostInformation
			svc.dayClubList           = TablesTonightService.dayClubList;
			svc.nightClubList         = TablesTonightService.nightClubList;

			return svc;

			function create(newUser) {
				return $http.post(TablesTonightService.getUrl() + 'host/create', newUser);
			}

			function login(credentials) {
				return $http.post(TablesTonightService.getUrl() + 'host/login', credentials)
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
				return $http.post(TablesTonightService.getUrl() + 'host/update', hostInfo)
					.then(function(response) {
						if (!response.data.error) {
							hostInfo = response.data;
						}
						return response.data;
					});
			}
		});
})();
