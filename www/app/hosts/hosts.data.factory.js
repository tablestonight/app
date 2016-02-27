(function() {
	angular
		.module('tablesTonight.hosts.data', [])
		.factory('HostsService', HostsService);

	function HostsService($http) {
		var svc = {};
		svc.getNightClubHosts = getNightClubHosts;
		svc.getDayClubHosts   = getDayClubHosts;
		svc.saveHost          = saveHost;
		svc.getHost           = getHost;
		return svc;

		function getNightClubHosts(nightclub) {
			return $http.get('http://localhost:1337/nightclub/'+nightclub)
				.then(function(response) {
					return response.data;
				});
		}

		function getDayClubHosts(dayclub) {
			return $http.get('http://localhost:1337/dayclub/'+dayclub)
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
