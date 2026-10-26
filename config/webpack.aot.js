import HtmlWebpackPlugin from "html-webpack-plugin";
import { merge } from "webpack-merge";
import { AngularWebpackPlugin } from "@ngtools/webpack";
import commonConfig from "./webpack.common.js";

import { root } from "./helpers.js";

const angularWebpackPlugin = new AngularWebpackPlugin({
  tsconfig: "./tsconfig.json",
  jitMode: false,
});

const htmlWebpackPlugin = new HtmlWebpackPlugin({
  template: "src/main/resources/webapp/webapp.ejs",
  filename: "../webapp/webapp.html",
  inject: false,
});

export default merge(commonConfig, {
  devtool: "source-map",
  target: 'web',

  // order = script order in webapp.ejs: vendor (materialize, global M) must load before app
  entry: {
    polyfills: "./src/angular/polyfills.ts",
    vendor: "./src/angular/vendor.aot.ts",
    app: "./src/angular/main.aot.ts",
    styles: "./src/angular/styles.less",
  },

  output: {
    path: root("build/resources/main/assets"),
    publicPath: "assets/",
    filename: "js/[name].js",
    chunkFilename: "js/[id].chunk.js",
  },

  module: {
    rules: [
      {
        test: /\.ts$/,
        use: {
          loader: "@ngtools/webpack",
        }
      }
    ],
  },

  plugins: [ angularWebpackPlugin, htmlWebpackPlugin],
});
