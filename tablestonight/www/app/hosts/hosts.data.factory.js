(function() {
	angular
		.module('tablesTonight.hosts.data', [])
		.factory('HostsService', HostsService);

	function HostsService() {
		var chats = [{
	    id: 0,
	    name: 'Ben Sparrow',
	    lastText: 'You on your way?',
	    face: 'img/ben.png'
	  }, {
	    id: 1,
	    name: 'Max Lynx',
	    lastText: 'Hey, it\'s me',
	    face: 'img/max.png'
	  }, {
	    id: 2,
	    name: 'Adam Bradleyson',
	    lastText: 'I should buy a boat',
	    face: 'img/adam.jpg'
	  }, {
	    id: 3,
	    name: 'Perry Governor',
	    lastText: 'Look at my mukluks!',
	    face: 'img/perry.png'
	  }, {
	    id: 4,
	    name: 'Mike Harrington',
	    lastText: 'This is wicked good ice cream.',
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
