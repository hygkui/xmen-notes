'use strict';

angular.module('gallerys').run(['Menus', 
	function (Menus) {
		// Set top bar menu items
		Menus.addMenuItem('topbar', 'Gallerys', 'gallerys', 'item', '/gallerys');
	
	}
]);
