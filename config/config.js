'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'), // 
	glob = require('glob');

/**
 * Load app configurations
 * 设置文件包括 all.js（通用参数） 和 NODE_ENV.js（特定环境参数）
 */
module.exports = _.extend(
	require('./env/all'),
	require('./env/' + process.env.NODE_ENV) || {}
);

/**
 * Get files by glob patterns   通过正则表达式来选定文件
 */
module.exports.getGlobbedFiles = function(globPatterns, removeRoot) {
	// For context switching
	var _this = this;

	// URL paths regex
	var urlRegex = new RegExp('^(?:[a-z]+:)?\/\/', 'i');

	// The output array
	var output = [];  	// 数组，符合规则的文件。

	// If glob pattern is array so we use each pattern in a recursive way, otherwise we use glob 
	if (_.isArray(globPatterns)) { // 文件字符串的数组
		globPatterns.forEach(function(globPattern) {
			output = _.union(output, _this.getGlobbedFiles(globPattern, removeRoot));
		});
	} else if (_.isString(globPatterns)) {  // 单个的文件字符串
		if (urlRegex.test(globPatterns)) {
			output.push(globPatterns);
		} else {
			glob(globPatterns, { // partterns
				sync: true  // 同步搜索 [options]
			}, function(err, files) { // callback function
				if (removeRoot) {
					files = files.map(function(file) { // 类似foreach之类的，但是可以修改item
						return file.replace(removeRoot, '');  // 把Root目录前的前缀去掉，从/开始。
					});
				}

				output = _.union(output, files);
			});
		}
	}

	return output;
};

/**
 * Get the modules JavaScript files
 */
module.exports.getJavaScriptAssets = function(includeTests) {
	// this.assets.lib.js 在all.js中定义。所有需要导入的都放在这里了。
	var output = this.getGlobbedFiles(this.assets.lib.js.concat(this.assets.js), 'public/'); 

	// To include tests
	if (includeTests) {  // includeTests为真则导入tests文件，默认是空，不导入。
		output = _.union(output, this.getGlobbedFiles(this.assets.tests));
	}

	return output;
};

/**
 * Get the modules CSS files
 */
module.exports.getCSSAssets = function() {
	var output = this.getGlobbedFiles(this.assets.lib.css.concat(this.assets.css), 'public/');
	return output;
};
