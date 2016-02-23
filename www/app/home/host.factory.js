(function() {
	angular
		.module('app.home.host', [])
		.factory('HostService', function($http, $q) {

			var svc                   = {};

			var hostInfo              = null;
			svc.login                 = login;
			svc.getHostInfo           = getHostInfo;
			svc.updateHostInformation = updateHostInformation
			svc.dayClubList           = dayClubList();
			svc.nightClubList         = nightClubList();

			return svc;

			function login(credentials) {
				return $http.post('http://tablestonight.herokuapp.com/host/login', credentials)
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
				return $http.post('http://tablestonight.herokuapp.com/host/update', hostInfo)
					.then(function(response) {
						if (!response.data.error) {
							hostInfo = response.data;
						}
						return response.data;
					});
			}

			function dayClubList() {
				return [
					'Azure',
					'Bare',
					'Daylight',
					'Delano Beach Club',
					'Drais Beach Club',
					'Encore Beach Club',
					'Foxtail Beach Club',
					'Lavo Brunch',
					'Liquid Pool',
					'Marquee Day Club',
					'Moorea',
					'Palms Pool Day Club',
					'Rehab Beach Club',
					'TAO Beach Club',
					'Wet Republic'
				]
			}

			function nightClubList() {

				return [
					'1OAK',
					'Chateau',
					'Embassy',
					'Foundation Room',
					'Foxtail',
					'Hakkasan',
					'Hyde',
					'Lavo',
					'LAX',
					'Light',
					'Marquee',
					'Omnia',
					'Sayers Club',
					'Surrender',
					'Tao',
					'The Bank',
					'XS'
				];
			}
		});
})();
