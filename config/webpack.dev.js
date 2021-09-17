var webpackMerge = require("webpack-merge");
var ExtractTextPlugin = require("extract-text-webpack-plugin");
var HtmlWebpackPlugin = require("html-webpack-plugin");
var webpack = require("webpack");
var commonConfig = require("./webpack.common.js");
var helpers = require("./helpers");

module.exports = webpackMerge(commonConfig, {
  mode: "development",

  devtool: "source-map",

  watch: true,

  output: {
    path: helpers.root("dist"),
    publicPath: "http://localhost:4200",
    filename: "[name].js",
    chunkFilename: "[id].chunk.js",
  },

  plugins: [
    new ExtractTextPlugin({
      filename: "styles.css",
      allChunks: true,
    }),
    new HtmlWebpackPlugin({
      template: "src/angular/index.html",
      devServer: "http://localhost:4200",
    }),
    new webpack.HotModuleReplacementPlugin(),
  ],

  devServer: {
    historyApiFallback: true,
    stats: true,
    port: 4200,
    inline: true,
    hot: true,
  },
});
