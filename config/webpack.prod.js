import { merge } from 'webpack-merge';
import webpack from 'webpack';
import { AngularWebpackPlugin } from '@ngtools/webpack';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import commonConfig from './webpack.common.js';

import { root } from "./helpers.js";

const angularWebpackPlugin = new AngularWebpackPlugin({
  jitMode: true, // false=AOT by default
});

const htmlWebpackPlugin = new HtmlWebpackPlugin({
  template: "src/angular/index.html",
  devServer: "http://localhost:4200/",
});

const hotModuleReplacementPlugin = new webpack.HotModuleReplacementPlugin();

export default merge(commonConfig, {
  mode: "development",

  devtool: "source-map",
  target: 'web',

  watch: true,
  
  output: {
    path: root("dist"),
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

  plugins: [ angularWebpackPlugin, htmlWebpackPlugin, hotModuleReplacementPlugin ],
  
  devServer: {
    historyApiFallback: true,
    port: 4200,
    hot: true,
  },
});