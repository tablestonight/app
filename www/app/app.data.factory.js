(function() {
	angular
		.module('app.data', [])
		.factory('TablesTonightService', TablesTonightService);

	function TablesTonightService($http) {

		var svc = {};
		var location = null;
		var url = 'http://tablesTonight.herokuapp.com/';

		svc.currentLocation = currentLocation;
		svc.saveLocation = saveLocation;
		svc.dayClubList   = dayClubList();
		svc.nightClubList = nightClubList();
		svc.getUrl = getUrl;
		init();

		return svc;

		function init() {
			$http.get('http://localhost:1337/origin')
				.then(function(response) {
					if (response.data) {
						url = response.data;
					}
				});
		}

		function getUrl() {
			return url;
		}

		function currentLocation() {
			return location;
		}

		function saveLocation(newLocation) {
			location = newLocation;
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
	}
})();
