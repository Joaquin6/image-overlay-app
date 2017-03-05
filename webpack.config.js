"use strict";
const path = require('path');
const webpack = require("webpack");

const contextPath       = path.resolve(__dirname, "app");
const outputPath        = path.resolve(__dirname, 'release');
const nodeModulesPath   = path.resolve(__dirname, 'node_modules');
const mainPath          = path.resolve(__dirname, 'app', 'js', 'app.js');

const environment = readEnvironment();

const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlWebpackPugPlugin = require('html-webpack-pug-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const StatsPlugin = require('stats-webpack-plugin');
const WebpackOnBuildPlugin = require('on-build-webpack');

// Create multiple instances
const ExtractCSS = new ExtractTextPlugin('stylesheets/[name].css');
const ExtractSass = new ExtractTextPlugin("./stylesheets/[name].css");

module.exports = {
	context: contextPath,
    devtool: getDevTools(),
    devServer: getDevServer(),
	entry: getEntry(),
    resolve: getResolve(),
	output: getOutput(),
    watch: getWatchMode(),
	module: getModule(),
	plugins: getPlugins()
};

function readEnvironment() {
    var environment = process.env.NODE_ENV || "development";
    console.log('*** Webpack: Running Environment: ' + environment);
    return environment;
}

function getDevTools() {
    if (!environment)
        var environment = readEnvironment();
    var devtool = null;
    if (environment === 'development') {
        console.log('*** Webpack: Assigning Development Tools');
        devtool = "source-map";
    } else
        console.log('*** Webpack: No Development Tools Required for ' + environment);
    return devtool;
}

function getDebugMode() {
    if (environment && environment === 'development')
        return true;
    return false;
}

function getDevServer() {
    var devServer = null;
    if (environment && environment === 'development') {
        console.log('*** Webpack: Assigning Dev Server Option');
        devServer = {
            headers: {
                "Access-Control-Allow-Origin": "http://localhost:8080",
                "Access-Control-Allow-Methods": "GET,PUT,POST,DELETE,OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, Authorization, Content-Length, X-Requested-With",
                "Access-Control-Allow-Credentials": "true"
            }
        };
    } else
        console.log('*** Webpack: No Dev Server Option Required for ' + environment);
    return devServer;
}

function getWatchMode() {
    if (environment && environment === 'development')
        return true;
    return false;
}

function getEntry() {
    console.log('*** Webpack: Assigning ' + environment + ' Entry Points');
    var entry = [mainPath];
    if (environment === 'development') {
        entry.push(
            /** For hot style updates */
            'webpack/hot/dev-server',
            /** @type {String} The script refreshing the browser on none hot updates */
            'webpack-dev-server/client?http://localhost:1919'
        );
    }
    return entry;
}

function getOutput() {
    console.log('*** Webpack: Assigning ' + environment + ' Output Options');
    var output = {
        /**
         * We need to give Webpack a path. It does not actually need it,
         * because files are kept in memory in webpack-dev-server, but an
         * error will occur if nothing is specified. We use the outputPath
         * as that points to where the files will eventually be bundled
         * in production
         * @type {String}
         */
        path: outputPath,
        sourceMapFilename: "[file].map"
    };
    if (environment === 'development') {
        output.filename = 'bundle.js';
        /**
         * Everything related to Webpack should go through a build path,
         * localhost:3000/build. That makes proxying easier to handle
         * @type {String}
         */
        output.publicPath = '/build/';
    } else
        output.filename = 'build/bundle-[hash].js';
    return output;
}

function getResolve() {
    console.log('*** Webpack: Assigning ' + environment + ' Resolve Options');
    var fsStyles = 'styles.css';
    var fsStylesPath = 'css';
    var fsJSPath = 'js';
    // If env is development, bring in SASS instead
    if (environment === 'development') {
        fsStyles = 'styles.scss';
        fsStylesPath = 'sass';
    }
    // Build up the Resolve object settings based on the env and site
    var resolve = {
        alias: {
            'jquery-ui-widgets': 'jquery-ui/ui/widgets',
            'jquery-ui-css': 'jquery-ui/themes/base/all.css',
            'jquery-ui-dialog': 'jquery-ui-widgets/dialog.js',
            'jquery-ui-resizable': 'jquery-ui-widgets/resizable.js',
            // Alias Cookie to js-cookie to enable ie11 compatibility.
            cookies: 'js-cookie/src/js.cookie.js',
            // This allows us to bring in either CSS for deployment or SASS for development
            fsstyles: fsStyles
        }
    };
    console.log('*** Webpack: Serving Stylesheets ' + fsStyles);
    return resolve;
}

function getModule() {
    var module = {
        loaders: getModuleLoaders()
    };
    return module;
}

function getModuleLoaders() {
    var loaders = [
        {test: /\.pug$/, use: 'pug-html-loader'},
        {test: /\.html$/,use: 'raw-loader', exclude: [nodeModulesPath]},
        {test: /\.json$/, use: 'json-loader'},
        {test: /\.js$/, use: {loader: 'babel-loader', query: {"presets": ["es2015"]}}, exclude: [nodeModulesPath]},
        {test: /\.css$/, use: ExtractTextPlugin.extract({fallback: 'style-loader', use: {loader:'postcss-loader', options: {sourceMap: true}},publicPath: "../"})},
        {test: /\.scss$/, use: ExtractTextPlugin.extract({fallback: 'style-loader', use: 'sass-loader'})},
        {test: /\.woff2(\?v=\d+\.\d+\.\d+)?$/, use: 'file-loader?/[path][name].[ext]?[hash]?limit=8192&mimetype=application/font-woff2'},
        {test: /\.woff(\?v=\d+\.\d+\.\d+)?$/, use: 'file-loader?/[path][name].[ext]?[hash]?limit=8192&mimetype=application/font-woff'},
        {test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/, use: 'file-loader?/[path][name].[ext]?[hash]?limit=8192&mimetype=application/octet-stream'},
        {test: /\.(jpe?g|png|gif)$/i, use: 'file-loader?name=img/${ entry.name }/[name].[ext]'},
        {test: /\.svg/, use: "svg-url-loader"}
    ];
    if (environment === 'development') {
        loaders.push(
            {test: /\.eot(\?v=\d+\.\d+\.\d+)?$/, use: 'file-loader'},
            {test: /\.md$/, use: ['html-loader', 'markdown-loader']}
        );
    } else {
        loaders.push(
            {test: /\.eot(\?v=\d+\.\d+\.\d+)?$/, use: 'file-loader'}
        );
    }
    return loaders;
}

function getPlugins() {
    var plugins = [
        // We have to manually add the jquery global context due to MAC/Linux intergration env
        new webpack.ProvidePlugin({
            $: "jquery",
            jQuery: "jquery",
            "window.jQuery": "jquery"
        }),
        new webpack.LoaderOptionsPlugin({
           debug: getDebugMode()
         })
    ];
    if (environment === 'development') {
        plugins.push(
            new webpack.HotModuleReplacementPlugin(),
            new webpack.NoEmitOnErrorsPlugin()
        );
    } else {
        plugins.push(
            new webpack.optimize.OccurenceOrderPlugin(),
            new HtmlWebpackPlugin({
                template: 'views/index.pug',
                filename: 'index.pug',
                filetype: 'pug'
            }),
            new HtmlWebpackPugPlugin(),
            // new HtmlWebpackPlugin({
            //     title: 'The Firestarter Network | Firestarter',
            //     template: 'views/index.pug',
            //     inject: 'head',
            //     favicon: 'images/generic/favicon.ico',
            //     filename: 'index.html',
            //     hash: true
            // }),
            new webpack.optimize.UglifyJsPlugin({
                compressor: {
                    warnings: false,
                    screw_ie8: true
                },
                output: {
                    comments: false
                }
            }),
            new StatsPlugin('webpack.stats.json', {
                source: false,
                modules: false
            }),
            new webpack.DefinePlugin({
                'process.env.NODE_ENV': environment
            }),
            new ExtractTextPlugin("css/[name]-[hash].css")
        );
    }
    return plugins;
}