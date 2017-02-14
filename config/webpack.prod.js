var webpack = require("webpack");
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var CopyWebpackPlugin = require('copy-webpack-plugin');
var webpackMerge = require('webpack-merge');
var commonConfig = require('./webpack.common.js');
var helpers = require('./helpers');

module.exports = webpackMerge(commonConfig, {

    entry: {
        // 'xp': './src/main/resources/assets/js/main.js',
        'app': './src/angular/main.ts'
    },

    output: {
        path: helpers.root('build/resources/main/assets'),
        publicPath: '',
        filename: 'js/[name].js',
        chunkFilename: 'js/[id].chunk.js'
    },

    plugins: [
        new ExtractTextPlugin({
            filename: 'css/styles.css',
            allChunks: true
        }),
        new HtmlWebpackPlugin({
            template: 'src/main/resources/site/pages/pwa/pwa.ejs',
            filename: '../site/pages/pwa/pwa.html',
            inject: false
        }),
        new webpack.ProvidePlugin({
            $: "jquery",
            jQuery: "jquery",
            "window.jQuery": "jquery"
        }),
        new webpack.optimize.UglifyJsPlugin({
            minimize: true,
            compress: {
                warnings: false
            }
        }),
        new CopyWebpackPlugin([
            {from: './src/angular/assets'}
        ])
    ]
});