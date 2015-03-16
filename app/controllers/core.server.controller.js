'use strict';

/**
 * Module dependencies.
 */
exports.index = function(req, res) {
	res.render('index', {
		user: req.user || null,
		request: req
	});
};

// exports.indexMe = function (req, res) {
// 	res.render('indexMe', {
// 		user: req.user || null,
// 		request: req
// 	});
// };
// 在控制模块中，基本上是把对应不同函数接口的
// 模版和数据进行导入替换渲染，合并成最终返回的
// html页面。这里需要指定两个参数：一个是模版文件
// 一个是要装载的数据（json格式。）

// 或者设定res返回什么，或者对req和res进行操作

// CRUD操作。
