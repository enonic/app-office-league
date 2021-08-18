var webpack = require('webpack');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var CopyWebpackPlugin = require('copy-webpack-plugin');
var path = require('path');
var helpers = require('./helpers');

// https://angular.io/docs/ts/latest/guide/webpack.html
module.exports = {
    // Configure the console output
    stats: {
        warnings: true,
        errors: true,
        errorDetails: true,
        colors: true,
        reasons: true,
        timings: true,
        children: true,
        modules: true,
        assets: false,
        chunkModules: true,
        chunks: true,
        source: true,
        entrypoints: true,
        depth: 2
    },

    entry: {
        'polyfills': './src/angular/polyfills.ts',
        'vendor': './src/angular/vendor.ts',
        'app': './src/angular/main.ts',
        'styles': './src/angular/styles.less',
    },

    resolve: {
        extensions: ['.ts', '.js', 'less', '.css']
    },

    module: {
        rules: [
            {
                test: /\.html$/,
                exclude: /node_modules/,
                loader: 'html-loader'
            },
            {   // load all flags to corresponding folder
                test: /\.(png|jpe?g|gif|ico|svg)$/,
                include: helpers.root('src', 'angular', 'assets', 'img', 'flags'),
                loader: 'file-loader?name=img/flags/[name].[hash].[ext]'
            },
            {   // copy all the images (except flags)
                test: /\.(png|jpe?g|gif|ico|svg)$/,
                exclude: helpers.root('src', 'angular', 'assets', 'img', 'flags'),
                loader: 'file-loader?name=img/[name].[hash].[ext]'
            },
            {   // load all woff fonts to corresponding folder
                test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
                loader: "url-loader",
                options: {
                    limit: 10000,
                    mimetype: 'application/font-woff',
                    name: 'fonts/[name].[hash].[ext]'
                }
            },
            {   // load all other fonts to the same folder
                test: /\.(ttf|eot)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
                loader: 'file-loader?name=fonts/[name].[hash].[ext]'
            },
            {
                // load app wide styles
                test: /\.(less|css)$/,
                include: [helpers.root('src', 'angular')],
                exclude: helpers.root('src', 'angular', 'app'),
                loader: ExtractTextPlugin.extract({
                    fallback: 'style-loader',
                    publicPath: '../',
                    use: 'css-loader!less-loader'
                })
            },
            {   // load angular component styles
                test: /\.(less|css)$/,
                include: helpers.root('src', 'angular', 'app'),
                loader: 'to-string-loader!css-loader?url=false!less-loader'
            }
        ]
    },

    plugins: [
        // Workaround for angular/angular#11580
        new webpack.ContextReplacementPlugin(
            // The (\\|\/) piece accounts for path separators in *nix and Windows
            /angular(\\|\/)core(\\|\/)(esm(\\|\/)src|src)(\\|\/)linker/,
            helpers.root('./src'), // location of your src
            {} // a map of your routes
        ),
        new ExtractTextPlugin({
            filename: 'css/[name].css',
            allChunks: true
        }),
        new webpack.optimize.CommonsChunkPlugin({
            name: 'common'
        }),
        new CopyWebpackPlugin([
            {from: './src/angular/assets', ignore: 'img/flags/**', debug: 'warning'}  // don't copy flags as they are referenced from css file
        ]),
        new webpack.ProvidePlugin({
            $: "jquery",
            jQuery: "jquery",
            "window.jQuery": "jquery",
            Crypto: 'crypto-js'
        })
    ]
};