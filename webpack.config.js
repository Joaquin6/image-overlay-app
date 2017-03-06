"use strict";
const path = require('path');
const webpack = require("webpack");

const contextPath = path.join(__dirname, "app");
const outputPath = path.join(__dirname, 'release');
const nodeModulesPath = path.join(__dirname, 'node_modules');
const mainPath = path.join(__dirname, 'app', 'js', 'app.js');

const environment = readEnvironment();

const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlWebpackPugPlugin = require('html-webpack-pug-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const StatsPlugin = require('stats-webpack-plugin');
const WebpackOnBuildPlugin = require('on-build-webpack');
const DirectoryNamedWebpackPlugin = require("directory-named-webpack-plugin");

// Create multiple instances
const ExtractCSS = new ExtractTextPlugin('css/[name].css');
const ExtractSass = new ExtractTextPlugin("./css/[name].css");

const isProd = environment === 'production';

module.exports = {
	context: contextPath,
	devtool: getDevTools(),
	devServer: getDevServer(),
	entry: getEntry(),
    stats: {
        colors: {
            green: '\u001b[32m'
        }
    },
	resolve: getResolve(),
	output: getOutput(),
	watch: getWatchMode(),
	module: getModule(),
	plugins: getPlugins(),
    performance: isProd && {
        maxAssetSize: 100,
        maxEntrypointSize: 300,
        hints: 'warning'
    }
};

function readEnvironment() {
	var environment = process.env.NODE_ENV || "development";
	console.log('*** Webpack: Running Environment: ' + environment);
	return environment;
}

function getDevTools() {
	if (!environment)
		var environment = readEnvironment();
	var devtool = "source-map";
	if (environment === 'development') {
		console.log('*** Webpack: Assigning Development Tools');
		devtool = "eval";
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
            contentBase: './app',
            historyApiFallback: true,
            port: 8080,
            compress: isProd,
            inline: !isProd,
            hot: !isProd,
            stats: {
                assets: true,
                children: false,
                chunks: false,
                hash: false,
                modules: false,
                publicPath: false,
                timings: true,
                version: false,
                warnings: true,
                colors: {
                    green: '\u001b[32m'
                }
            },
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
	var entry = {
        app: './js/app.js'
    };
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
		output.publicPath = '/release/';
	} else
		output.filename = 'build/bundle-[hash].js';
	return output;
}

function getResolve() {
	console.log('*** Webpack: Assigning ' + environment + ' Resolve Options');
	var appStyles = 'styles.css';
	var appStylesPath = 'css';
	var appStylesLoader = 'postcss-loader';
	// If env is development, bring in SASS instead
	if (environment === 'development') {
		appStyles = 'styles.scss';
		appStylesPath = 'sass';
		appStylesLoader = 'sass-loader';
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
			appstyles: appStylesPath + '/' + appStyles
		},
        extensions: ['.webpack-loader.js', '.web-loader.js', '.loader.js', '.js', '.jsx', '.css', '.scss'],
		modules: [contextPath, path.resolve(__dirname, 'node_modules')],
		mainFiles: ["index", "app", "styles"],
		plugins: [
			new DirectoryNamedWebpackPlugin({
				transformFn: function(dirName) {
					console.log(dirName);
					// use this function to provide custom transforms of resolving directory name
					// return desired filename or array of filenames which will be used
					// one by one (honoring order) in attempts to resolve module
					return dirName; // default
				}
			})
		]
	};
	console.log('*** Webpack: Serving Stylesheets ' + appStyles);
	return resolve;
}

function getModule() {
	var module = {
		noParse: /jquery|fs|net/,
		rules: getModuleLoaders()
	};
	return module;
}

function getModuleLoaders() {
	var styleloaders = [{
		loader: 'css-loader',
		options: {
			modules: true,
            sourceMap: true
		}
	}, {
		loader: 'postcss-loader'
	}, {
		loader: 'sass-loader',
        options: {
            includePaths: [path.join(contextPath, 'sass')],
            sourceMap: true
        }
	}];
	var loaders = [{
		test: /\.scss$/,
		use: ExtractSass.extract({
            fallback: 'style-loader',
            use: styleloaders
        })
	}, {
		test: /\.css$/,
		use: ExtractTextPlugin.extract({
			fallback: 'style-loader',
			use: styleloaders
		})
	}, {
		test: /\.pug$/,
		use: ['pug-html-loader']
	}, {
		test: /\.html$/,
        exclude: /node_modules/,
		use: [
        'raw-loader',
        {
            loader: 'file-loader',
            query: {
                name: '[name].[ext]'
            }
        }]
	}, {
		test: /\.json$/,
		use: ['json-loader']
	}, {
		test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: ['babel-loader']
	}, {
		test: /\.woff2(\?v=\d+\.\d+\.\d+)?$/,
		use: 'file-loader?/[path][name].[ext]?[hash]?limit=8192&mimetype=application/font-woff2'
	}, {
		test: /\.woff(\?v=\d+\.\d+\.\d+)?$/,
		use: 'file-loader?/[path][name].[ext]?[hash]?limit=8192&mimetype=application/font-woff'
	}, {
		test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
        use: [{
            loader: "file-loader",
            query: {
                name: "[path][name].[ext]",
                hash: "[hash]",
                limit: "8192",
                mimetype: "application/octet-stream"
            }
        }]
	}, {
		test: /\.(jpe?g|png|gif)$/i,
		use: 'file-loader?[path][name].[ext]'
	}, {
		test: /\.svg/,
		use: "svg-url-loader"
	}];
	if (environment === 'development') {
		loaders.push({
			test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
			use: 'file-loader'
		}, {
			test: /\.md$/,
			use: ['html-loader', 'markdown-loader']
		});
	} else {
		loaders.push({
			test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
			use: 'file-loader'
		});
	}
	return loaders;
}

function getPlugins() {
	var plugins = [
        ExtractSass,
		new ExtractTextPlugin('css/[name]-[hash].css'),
		// We have to manually add the jquery global context due to MAC/Linux intergration env
		new webpack.ProvidePlugin({
			$: "jquery",
			jQuery: "jquery",
			"window.jQuery": "jquery"
		}),
		new webpack.LoaderOptionsPlugin({
			debug: getDebugMode()
		}),
        new webpack.optimize.CommonsChunkPlugin({
            name: 'vendor',
            minChunks: Infinity,
            filename: 'vendor.bundle.js'
        }),
        new webpack.EnvironmentPlugin({
            NODE_ENV: environment,
        }),
        new webpack.NamedModulesPlugin()
	];
	if (environment === 'development') {
		plugins.push(
			new webpack.HotModuleReplacementPlugin()
		);
	} else {
		plugins.push(
			new webpack.LoaderOptionsPlugin({
				minimize: true,
				debug: false
			}),
			new HtmlWebpackPlugin({
				template: 'views/index.pug',
				filename: 'index.html',
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
				compress: {
                    warnings: false,
                    screw_ie8: true,
                    conditionals: true,
                    unused: true,
                    comparisons: true,
                    sequences: true,
                    dead_code: true,
                    evaluate: true,
                    if_return: true,
                    join_vars: true
                },
				output: {
					comments: false
				}
			}),
			new StatsPlugin('webpack.stats.json', {
				source: false,
				modules: false
			})
		);
	}
	return plugins;
}