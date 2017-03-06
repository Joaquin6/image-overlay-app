var express = require('express');
var compression = require('compression');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var http = require('http');
var config = require('./config');
var api = require('./routes/api');
var app = express();

var clientRootPath = path.resolve(__dirname, '..', 'client');

readEnvironment();
setupEnvironment();
listen();

function readEnvironment() {
	var myArgs = process.argv.slice(2);
	for (var i = 0; i < myArgs.length; i++) {
		if (myArgs[i].indexOf('e') > 0) {
			config.environment = myArgs[++i];
		}
	}
	console.info("Environment: " + config.environment);
	global.config = config;
}

function setupEnvironment() {
	var rootPath = '../client';
	var port = 8080;
	// Enable CORS
	app.use(function(req, res, next) {
		res.header('Access-Control-Allow-Origin', '*');
		res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
		res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
		next();
	});
	app.set('port', process.env.PORT || port);
	app.use(compression());
	app.use(bodyParser.json());
	app.use(bodyParser.urlencoded({
		extended : false
	}));
	app.use(methodOverride());
	app.use(express.static(path.join(__dirname, rootPath)));
	api.route(app);
	app.use(function(req, res) {
		var newUrl = 'http://' + req.get('Host') + '/#' + req.url;
		return res.redirect(newUrl);
	});
	process.on('uncaughtException', function(err) {
		console.error('Caught exception: ' + err);
	});
}

function listen() {
	var server = http.createServer(app);
	server.listen(app.get('port'));
	console.log('node started on port: ' + app.get('port'));
}