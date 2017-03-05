module.exports = {
	port: 8080,
	webpackDevServer: {
        proxy: {
            "*": "http://localhost:8080"
        },
        filename: "bundle.js",
        // We need to tell webpack to serve our bundled application
        // from the build path. When proxying:
        // http://localhost:1919/build -> http://localhost:8080/build
        publicPath: '/build/',
        // Configure hot replacement
        hot: true,
        // The rest is terminal configurations
        quiet: false,
        noInfo: true,
        stats: {
            colors: true
        },
        watchOptions: {
            aggregateTimeout: 300,
            poll: 1000
        }
    },
    webpackBundler: {
        port: 1919,
        host: "localhost"
    }
};