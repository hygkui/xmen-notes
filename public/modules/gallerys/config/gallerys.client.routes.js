'use strict';

// Setting up route
angular.module('gallerys').config(['$stateProvider',
	function($stateProvider) {
		// Articles state routing
		$stateProvider.
		state('listGallerys', {
			url: '/gallerys',
			templateUrl: 'modules/gallerys/views/list-gallerys.client.view.html'
		});
		
	}
]);
