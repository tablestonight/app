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
				{ name: 'Azure',
					fileName: '1oak'
				},
				{ name: 'Bare',
					fileName: '1oak'
				},
				{ name: 'Daylight',
					fileName: '1oak'
				},
				{ name: 'Drais Beach Club',
					fileName: '1oak'
				},
				{ name: 'Encore Beach Club',
					fileName: '1oak'
				},
				{ name: 'Foxtail Pool Club',
					fileName: '1oak'
				},
				{ name: 'Lavo Brunch',
					fileName: '1oak'
				},
				{ name: 'Liquid Pool',
					fileName: '1oak'
				},
				{ name: 'Marquee Day Club',
					fileName: '1oak'
				},
				{ name: 'Moorea Beach Club',
					fileName: '1oak'
				},
				{ name: 'Ditch Fridays',
					fileName: '1oak'
				},
				{ name: 'Rehab Beach Club',
					fileName: '1oak'
				},
				{ name: 'TAO Beach',
					fileName: '1oak'
				},
				{ name: 'Wet Republic',
					fileName: '1oak'
				}
			];
		}

		function nightClubList() {

			return [
				{ name: '1OAK',
					fileName: '1oak'
				},
				{ name: 'Drais',
					fileName: 'drais'
				},
				{ name: 'Foundation Room',
					fileName: 'foundation'
				},
				{ name: 'Foxtail',
					fileName: 'foxtail'
				},
				{ name: 'Hakkasan',
					fileName: 'hakkasan'
				},
				{ name: 'Hyde',
					fileName: 'hyde'
				},
				{ name: 'Lavo',
					fileName: 'lavo'
				},
				{ name: 'LAX',
					fileName: '1oak'
				},
				{ name: 'Light',
					fileName: '1oak'
				},
				{ name: 'Marquee',
					fileName: '1oak'
				},
				{ name: 'Omnia',
					fileName: '1oak'
				},
				{ name: 'Sayers Club',
					fileName: 'sayers'
				},
				{ name: 'Surrender',
					fileName: '1oak'
				},
				{ name: 'Tao',
					fileName: '1oak'
				},
				{ name: 'The Bank',
					fileName: '1oak'
				},
				{ name: 'XS',
					fileName: '1oak'
				}
			];
		}
	}
})();
