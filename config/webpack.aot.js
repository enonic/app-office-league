//var webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const webpackMerge = require("webpack-merge");
const AngularCompilerPlugin = require("@ngtools/webpack").AngularCompilerPlugin;
const commonConfig = require("./webpack.common.js");
const helpers = require("./helpers");

/* var aotPlugin = new AotPlugin({
    tsConfigPath: 'tsconfig.aot.json',
    entryModule: helpers.root('src/angular/app/app.module#AppModule')
}); */

module.exports = webpackMerge(commonConfig, {
    mode: "development",

    entry: {
        app: "./src/angular/main.aot.ts",
        vendor: "./src/angular/vendor.aot.ts",
    },

    output: {
        path: helpers.root("build/resources/main/assets"),
        publicPath: "assets/",
        filename: "js/[name].js",
        //chunkFilename: 'js/[id].chunk.js'
    },

    module: {
        rules: [
            {
                test: /\.ts$/,
                loader: "@ngtools/webpack",
            },
        ],
    },

    plugins: [
        new AngularCompilerPlugin({
            tsConfigPath: "tsconfig.aot.json",
            entryModule: helpers.root("src/angular/app/app.module#AppModule"),
        }),
        new HtmlWebpackPlugin({
            template: "src/main/resources/site/pages/pwa/pwa.ejs",
            filename: "../site/pages/pwa/pwa.html",
            inject: false,
        }),
        /* new webpack.optimize.UglifyJsPlugin({
            minimize: true,
            compress: {
                warnings: false
            }
        }) */
    ],
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
