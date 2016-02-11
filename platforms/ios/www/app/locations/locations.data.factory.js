(function() {
	angular
		.module('tablesTonight.locations.data', [])
		.factory('LocationsService', LocationsService);

	function LocationsService() {
		var locations = [
	    {
	      name: 'Hakkasaan',
	      id: 0
	    },
	    {
	      name: 'XS',
	      id: 1
	    },
	    {
	      name: 'Encore',
	      id: 2
	    },
	    {
	      name: 'Omnia',
	      id: 3
	    },
			{
				name: 'Drais',
				id: 4
			},
			{
				name: 'Light',
				id: 5
			},
			{
				name: 'Marquee',
				id: 6
			}
	  ];

	  var svc = {};

	  svc.all = function() {
	    return locations;
	  }

	  return svc;
	}
})();
