var webpack             = require('webpack');
var webpackDevServer    = require('webpack-dev-server');
var webpackConfig       = require('../webpack.config.js');
var path                = require('path');
var fs                  = require('fs');

module.exports = function(settings) {
    // First we fire up webpack and pass in the configuration we created
    var bundleStart = null;
    var compiler = webpack(webpackConfig);
    // We give notice in the terminal when it starts bundling and
    // set the time it started
    compiler.plugin('compile', function() {
        console.log('--- Webpack Bundler: Bundling Project Now...');
        bundleStart = Date.now();
    });
    // The Compiler is in watch mode and a compilation has failed hard.
    compiler.plugin('failed', function(err) {
        console.log('--- Webpack Bundler: ' + 'The Compiler Failed');
        console.log('--- Webpack Bundler: ' + JSON.stringify(err));
        console.log('--- Webpack Bundler: ' + 'Failue due to "' + err.message + '". Error Code is "' + err.code + '". Error #: "' + err.errno + '". Error Path: "' + err.path + '"');
        console.log('--- Webpack Bundler: ' + 'Compiler Failed at ' + (Date.now() - bundleStart) + ' Milliseconds into the Compilation!');
    });
    // We also give notice when it is done compiling, including the
    // time it took. Nice to have
    compiler.plugin('done', function(stats) {
        console.log('--- Webpack Bundler: Project Bundled in ' + (Date.now() - bundleStart) + ' Milliseconds!');
    });

    var bundler = new webpackDevServer(compiler, settings.webpackDevServer);
    var bundlerOpts = settings.webpackBundler;
    // We fire up the development server and give notice in the terminal
    // that we are starting the initial bundle
    bundler.listen(bundlerOpts.port, bundlerOpts.host, function() {
        console.log('--- Webpack Bundler: Bundling Project, Please Wait...');
    });
};