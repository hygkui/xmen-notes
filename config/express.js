'use strict';

/**
 * Module dependencies.
 */
var fs = require('fs'),
	http = require('http'),
	https = require('https'),
	express = require('express'),
	morgan = require('morgan'),
	bodyParser = require('body-parser'),
	session = require('express-session'),
	compress = require('compression'),
	methodOverride = require('method-override'),
	cookieParser = require('cookie-parser'),
	helmet = require('helmet'),
	passport = require('passport'),
	mongoStore = require('connect-mongo')({
		session: session
	}),
	flash = require('connect-flash'),
	config = require('./config'),
	consolidate = require('consolidate'),
	path = require('path');

module.exports = function(db) {
	// Initialize express app
	var app = express();

	// Globbing model files
	config.getGlobbedFiles('./app/models/**/*.js').forEach(function(modelPath) {
		require(path.resolve(modelPath));
	});

	// Setting application local variables
	app.locals.title = config.app.title;
	app.locals.description = config.app.description;
	app.locals.keywords = config.app.keywords;
	app.locals.facebookAppId = config.facebook.clientID;
	app.locals.jsFiles = config.getJavaScriptAssets();  // 在主页需要载入的js文件，只要放到这个目录就可以自动加入 layout.server.view.html中。
	app.locals.cssFiles = config.getCSSAssets(); // 同上，css文件。

	// app.use(function () { ...}) 是注册方法到app中，
	// app.set(key,value) 是设置app类中的属性
	// app.locals.xxx = yyy 是设置app类中的属性
	// Passing the request url to environment locals
	app.use(function(req, res, next) {
		res.locals.url = req.protocol + '://' + req.headers.host + req.url;
		next();
	});

	// Should be placed before express.static
	app.use(compress({  // TODO：返回压缩的静态文件？？？
		filter: function(req, res) {
			return (/json|text|javascript|css/).test(res.getHeader('Content-Type'));
		},
		level: 9
	}));

	// Showing stack errors
	app.set('showStackError', true);

	// Set swig as the template engine  TODO: 不理解这里。 
    // engine(ext, callback)  server.view.html是扩展名。比如 render('index', { }) means index.server.view.html under the dir app/views/.
    // config.templateEngine是 swig. 而consolidate是一个包括多种模版引擎的包。可以方便地在config/env/中更改系统全部的模版引擎。
    // app.engine('abc' , callback) 可以理解为自定义一个引擎的名字，其引擎的模版替换机制在callback中。
    // 这样就可以在app.set()中对 view engine 设置为自己定义的引擎名字了，否则express默认的识别不了。
	app.engine('server.view.html', consolidate[config.templateEngine]);


	// Set views path and view engine
	// "view engine" The default engine extension to use when omitted.第二个参数是后缀名字
	app.set('view engine', 'server.view.html');
	app.set('views', './app/views');

	// Environment dependent middleware
	if (process.env.NODE_ENV === 'development') {
		// Enable logger (morgan)
		app.use(morgan('dev'));

		// Disable views cache
		app.set('view cache', false);
	} else if (process.env.NODE_ENV === 'production') {
		app.locals.cache = 'memory'; // 缓存到内存中
	}

	// Request body parsing middleware should be above methodOverride
	app.use(bodyParser.urlencoded({
		extended: true
	}));
	app.use(bodyParser.json());
	app.use(methodOverride());

	// CookieParser should be above session
	app.use(cookieParser());

	// Express MongoDB session storage
	app.use(session({
		saveUninitialized: true,
		resave: true,
		secret: config.sessionSecret,
		store: new mongoStore({  // 保存session到数据库中
			db: db.connection.db,
			collection: config.sessionCollection
		})
	}));

	// use passport session
	app.use(passport.initialize());
	app.use(passport.session());

	// connect flash for flash messages
	app.use(flash());

	// Use helmet to secure Express headers
	app.use(helmet.xframe());
	app.use(helmet.xssFilter());  // 过滤 xss 跨站攻击
	app.use(helmet.nosniff());  // 过滤 监听
	app.use(helmet.ienoopen()); 
	app.disable('x-powered-by');

	// Setting the app router and static folder
	app.use(express.static(path.resolve('./public')));  // path.resolve 输入相对路径，返回绝对路径

	// Globbing routing files  加载所有的路由文件，因为路由文件是 module.exports = function (app) { ... }
	// 所以是 require(...)(app). path.resolve(routePath)是转换相对路径到绝对路径。
	config.getGlobbedFiles('./app/routes/**/*.js').forEach(function(routePath) {
		require(path.resolve(routePath))(app);
	});

	// Assume 'not found' in the error msgs is a 404. 
	// this is somewhat silly, but valid, you can do 
	// whatever you like, set properties, use instance of etc.
	// 针对四个参数的接口的匿名回调函数。
	app.use(function(err, req, res, next) {
		// If the error object doesn't exists
		if (!err) return next();

		// Log it
		console.error(err.stack);

		// Error page
		res.status(500).render('500', {
			error: err.stack
		});
	});

	// Assume 404 since no middleware responded
	// 针对两个参数的匿名回调函数，该回调中没有嵌套的回调，
	// 也就是说没有中间件回应，因此可以处理为错误，返回404。
	app.use(function(req, res) {
		res.status(404).render('404', {
			url: req.originalUrl,
			error: 'Not Found'
		});
	});

	// 如果是运行在secure的环境，则需要设置秘钥和安全证书
	// 并加载https模块，通过它创建http server。
	if (process.env.NODE_ENV === 'secure') {  // TLS/SSL 安全套接字 https 默认端口 443
		// Log SSL usage
		console.log('Securely using https protocol');

		// Load SSL key and certificate
		var privateKey = fs.readFileSync('./config/sslcerts/key.pem', 'utf8');   // 私钥文件
		var certificate = fs.readFileSync('./config/sslcerts/cert.pem', 'utf8');  // CA安全证书，实际上时服务器自己颁发给自己的。

		// Create HTTPS Server
		var httpsServer = https.createServer({
			key: privateKey,
			cert: certificate
		}, app);

		// Return HTTPS server instance
		return httpsServer;
	}

	// Return Express server instance
	return app;
};
