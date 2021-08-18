var webpack = require("webpack");


var HtmlWebpackPlugin = require('html-webpack-plugin');
var webpackMerge = require('webpack-merge');
const AotPlugin = require('@ngtools/webpack').AotPlugin;
var commonConfig = require('./webpack.common.js');
var helpers = require('./helpers');

var aotPlugin = new AotPlugin({
    tsConfigPath: 'tsconfig.aot.json',
    entryModule: helpers.root('src/angular/app/app.module#AppModule')
});

module.exports = webpackMerge(commonConfig, {
    devtool: "source-map",

    entry: {
        'app': './src/angular/main.aot.ts',
        'vendor': './src/angular/vendor.aot.ts'
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
                loaders: ['@ngtools/webpack']
            }
        ]
    },

    plugins: [
        aotPlugin,
        new HtmlWebpackPlugin({
            template: 'src/main/resources/webapp/webapp.ejs',
            filename: '../webapp/webapp.html',
            inject: false,
        }),
        new webpack.optimize.UglifyJsPlugin({
            minimize: true,
            compress: {
                warnings: false
            }
        })
    ]
});

// Fix for AotPlugin Error: Cannot read property 'getSourceFile' of undefined
// https://github.com/angular/angular-cli/issues/5329?platform=hootsuite
/*aotPlugin._compilerHost._resolve = function (path_to_resolve) {
    path_1 = require("path");
    path_to_resolve = aotPlugin._compilerHost._normalizePath(path_to_resolve);
    if (path_to_resolve[0] == '.') {
        return aotPlugin._compilerHost._normalizePath(path_1.join(aotPlugin._compilerHost.getCurrentDirectory(), path_to_resolve));
    }
    else if (path_to_resolve[0] == '/' || path_to_resolve.match(/^\w:\//)) {
        return path_to_resolve;
    }
    else {
        return aotPlugin._compilerHost._normalizePath(path_1.join(aotPlugin._compilerHost._basePath, path_to_resolve));
    }
};*/
