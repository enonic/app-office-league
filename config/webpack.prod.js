var webpack = require("webpack");
var HtmlWebpackPlugin = require('html-webpack-plugin');
var webpackMerge = require('webpack-merge');
var commonConfig = require('./webpack.common.js');
var helpers = require('./helpers');

module.exports = webpackMerge(commonConfig, {

    entry: {
        'app': './src/angular/main.ts'
    },

    output: {
        path: helpers.root('build/resources/main/assets'),
        publicPath: 'assets/',
        filename: 'js/[name].js',
        chunkFilename: 'js/[id].chunk.js'
    },

    module: {
        rules: [
            {
                test: /\.ts$/,
                loaders: [
                    {
                        loader: 'awesome-typescript-loader',
                        options: {configFileName: helpers.root('tsconfig.json')}
                    },
                    //'angular2-template-loader',
                    // https://medium.com/@daviddentoom/angular-2-lazy-loading-with-webpack-d25fe71c29c1#.2l9gygqbr
                    //'angular2-router-loader'
                ]
            }
        ]
    },

    plugins: [
        new HtmlWebpackPlugin({
            template: 'src/main/resources/site/pages/pwa/pwa.html',
            filename: '../site/pages/pwa/pwa.html',
            inject: false
        })
    ]
});