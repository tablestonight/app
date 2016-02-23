(function() {
	angular
		.module('home.host', [])
		.factory('HostService', function($http) {
			var svc = {};
			svc.login = login;
			return svc;

			function login(credentials) {
				return $http.post('http://localhost:1337/host/login', credentials)
					.then(function(response) {
						return response.data;
					});
			}
		});
})();
