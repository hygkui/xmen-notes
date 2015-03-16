'use strict';

/***
解决node env 运行环境的问题。
**/


/**
 * Module dependencies.
 */
var glob = require('glob'),  // 大概是设置全局变量
	chalk = require('chalk'); //控制输出日志中文体颜色

/**
 * Module init function.
 */
module.exports = function() {
	/**
	 * Before we begin, lets set the environment variable
	 * We'll Look for a valid NODE_ENV variable and if one cannot be found load the development NODE_ENV
	 */
	glob('./config/env/' + process.env.NODE_ENV + '.js', {
		sync: true
	}, function(err, environmentFiles) {
		if (!environmentFiles.length) {  // 如果不存在这个配置文件
			if (process.env.NODE_ENV) {
				console.error(chalk.red('No configuration file found for "' + process.env.NODE_ENV + '" environment using development instead'));
			} else {
				console.error(chalk.red('NODE_ENV is not defined! Using default development environment')); //没有环境变量。
			}

			process.env.NODE_ENV = 'development'; // 默认选development
		} else {
			console.log(chalk.black.bgWhite('Application loaded using the "' + process.env.NODE_ENV + '" environment configuration'));
		}
	});

};
