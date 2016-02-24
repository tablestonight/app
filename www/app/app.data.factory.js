(function() {
	angular
		.module('app.data', [])
		.factory('TablesTonightService', TablesTonightService);

	function TablesTonightService() {

		var svc = {};
		var location = null;

		svc.currentLocation = currentLocation;
		svc.saveLocation = saveLocation;
		svc.dayClubList   = dayClubList();
		svc.nightClubList = nightClubList();

		return svc;

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