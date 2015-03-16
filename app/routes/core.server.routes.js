'use strict';

module.exports = function(app) {
	// Root routing
	var core = require('../../app/controllers/core.server.controller');
	
	// 路由是 / 时，进行get操作，函数是core的index方法。
	app.route('/').get(core.index);  
	//app.route('/me').get(core.indexMe);
};
