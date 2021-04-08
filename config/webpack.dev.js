var webpackMerge = require('webpack-merge');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var webpack = require('webpack');
var commonConfig = require('./webpack.common.js');
var helpers = require('./helpers');
const ProvidePlugin = require('webpack/lib/ProvidePlugin');

module.exports = webpackMerge(commonConfig, {
    devtool: 'source-map',

    watch: true,

    output: {
        path: helpers.root('dist'),
        publicPath: 'http://localhost:4200',
        filename: '[name].js',
        chunkFilename: '[id].chunk.js'
    },
    plugins: [
        new ProvidePlugin({
            $: 'jquery',
            jQuery: 'jquery',
            'window.jQuery': 'jquery'
        }),
        new ExtractTextPlugin({
            filename: 'styles.css',
            allChunks: true
        }),
        new HtmlWebpackPlugin({
            template: 'src/angular/index.html',
            devServer: 'http://localhost:4200'
        }),
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NoEmitOnErrorsPlugin()
    ],

    devServer: {
        historyApiFallback: true,
        stats: 'minimal',
        port: 4200,
        inline: true,
        hot: true
    }
});
