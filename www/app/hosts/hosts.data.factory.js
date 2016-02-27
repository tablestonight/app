(function() {
	angular
		.module('tablesTonight.hosts.data', [])
		.factory('HostsService', HostsService);

	function HostsService($http, TablesTonightService) {
		var svc = {};
		svc.getNightClubHosts = getNightClubHosts;
		svc.getDayClubHosts   = getDayClubHosts;
		svc.saveHost          = saveHost;
		svc.getHost           = getHost;
		return svc;

		function getNightClubHosts(nightclub) {
			return $http.get(TablesTonightService.getUrl() + 'nightclub/' + nightclub)
				.then(function(response) {
					return response.data;
				});
		}

		function getDayClubHosts(dayclub) {
			return $http.get(TablesTonightService.getUrl() + 'dayclub/' + dayclub)
				.then(function(response) {
					return response.data;
				});
		}

		function saveHost(host) {
			currentHost = host;
		}

		function getHost() {
			return currentHost;
		}
	}
})();
