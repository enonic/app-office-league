const { merge } = require('webpack-merge');
const path = require("path");
const { AngularWebpackPlugin } = require('@ngtools/webpack');
var HtmlWebpackPlugin = require("html-webpack-plugin");
var webpack = require("webpack");
var commonConfig = require("./webpack.common.js");
var helpers = require("./helpers");

module.exports = merge(commonConfig, {
  mode: "development",

  devtool: "source-map",
  target: 'web',

  watch: true,
  
  output: {
    path: helpers.root("dist"),
    publicPath: "http://localhost:4200/",
    filename: "[name].js",
    chunkFilename: "[id].chunk.js",
  },

  module: {
    rules: [
      // all files with a `.ts` or `.tsx` extension will be handled by `ts-loader`
      {
        test: /\.tsx?$/,
        loader: '@ngtools/webpack'
      }
    ]
  },

  plugins: [
    new AngularWebpackPlugin({
      jitMode: true, // false=AOT by default
    }),
    new HtmlWebpackPlugin({
      template: "src/angular/index.html",
      devServer: "http://localhost:4200/",
    }),
    new webpack.HotModuleReplacementPlugin(),
  ],

  devServer: {
    historyApiFallback: true,
    port: 4200,
    hot: true,
  },
});
