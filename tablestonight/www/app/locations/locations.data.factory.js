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
	      name: 'King James',
	      id: 3
	    }
	  ];

	  var svc = {};

	  svc.all = function() {
	    return locations;
	  }

	  return svc;
	}
})();
