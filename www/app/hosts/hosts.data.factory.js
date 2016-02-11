(function() {
	angular
		.module('tablesTonight.hosts.data', [])
		.factory('HostsService', HostsService);

	function HostsService() {
		var chats = [{
	    id: 0,
	    name: 'Ben Sparrow',
	    phoneNumber: '(111) 111-1111',
	    face: 'img/ben.png'
	  }, {
	    id: 1,
	    name: 'Max Lynx',
	    phoneNumber: '(222) 222-2222',
	    face: 'img/max.png'
	  }, {
	    id: 2,
	    name: 'Adam Bradleyson',
	    phoneNumber: '(333) 333-3333',
	    face: 'img/adam.jpg'
	  }, {
	    id: 3,
	    name: 'Perry Governor',
	    phoneNumber: '(444) 444-4444',
	    face: 'img/perry.png'
	  }, {
	    id: 4,
	    name: 'Mike Harrington',
	    phoneNumber: '(555) 555-5555',
	    face: 'img/mike.png'
	  }];

		var svc = {};

		svc.all = function() {
			return chats;
		}

		svc.get = function(index) {
			return chats[index];
		}

		return svc;
	}
})();
