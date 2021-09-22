const {AngularWebpackPlugin} = require('@ngtools/webpack');
const HtmlWebpackPlugin = require("html-webpack-plugin");

const { merge } = require('webpack-merge');
const commonConfig = require("./webpack.common.js");
const helpers = require("./helpers");

module.exports = merge(commonConfig, {
  mode: "production",

  entry: {
    app: "./src/angular/main.ts",
  },

  output: {
    path: helpers.root("build/resources/main/assets"),
    publicPath: "assets/",
    filename: "js/[name].js",
    chunkFilename: "js/[id].chunk.js",
  },

  module: {
    rules: [
      {
          test: /\.ts$/,
          use: [
              {
                  loader: "@ngtools/webpack",
              }
          ]
        }
    ],
  },

  plugins: [
    new AngularWebpackPlugin(),
    new HtmlWebpackPlugin({
      template: "src/angular/index.html",
      filename: "index.html",
      inject: false,
    }),
  ],
});
