var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var settings = require('./config');
var routes = require('./routes');
var app = express();

var clientRootPath = path.resolve(__dirname, '..', 'app');


if (app.get('env') !== 'development')
    clientRootPath = path.resolve(__dirname, '..', 'release');
// view engine setup
app.set('views', path.join(clientRootPath, 'views'));
app.set('view engine', 'pug');
//Enable CORS
app.use(function(req, res, next) {
	res.header('Access-Control-Allow-Origin', '*');
	res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
	res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
	next();
});
// uncomment after placing your favicon in /public
app.use(bodyParser.raw({
	limit: '1000mb'
}));
//app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '..', 'release')));
app.use('/', routes);
// catch 404 and forward to error handler
app.use(function(req, res, next) {
	var err = new Error('Not Found');
	err.status = 404;
	next(err);
});
// error handlers
// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
	app.use(function(err, req, res, next) {
		res.status(err.status || 500);
		res.render('error', {
			message: err.message,
			error: err
		});
	});
	// We only want to run the workflow when not in production
    console.log('>>> Node Server: Spawing Webpack Development Server');
    // We require the bundler inside the if block because
    // it is only needed in a development environment. Later
    // you will see why this is a good idea
    var bundle = require('./bundle.js');
    bundle(settings);
    // Any requests to localhost:1919/build is proxied
    // to webpack-dev-server
    app.all('/build/*', function(req, res) {
        proxy.web(req, res, {
            target: 'http://localhost:1919'
        });
    });
} else {
	// production error handler
	// no stacktraces leaked to user
	app.use(function(err, req, res, next) {
		res.status(err.status || 500);
		res.render('error', {
			message: err.message,
			error: {}
		});
	});
}

module.exports = app;