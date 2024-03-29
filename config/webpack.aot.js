import HtmlWebpackPlugin from "html-webpack-plugin";
import { merge } from "webpack-merge";
import { AngularWebpackPlugin as AotPlugin } from "@ngtools/webpack";
import commonConfig from "./webpack.common.js";

import { root } from "./helpers.js";

const aotPlugin = new AotPlugin({
  tsconfig: "./tsconfig.aot.json",
  entryModule: root("src/angular/app/app.module#AppModule"),
});

const htmlWebpackPlugin = new HtmlWebpackPlugin({
  template: "src/main/resources/webapp/webapp.ejs",
  filename: "../webapp/webapp.html",
  inject: false,
});

export default merge(commonConfig, {
  devtool: "source-map",
  target: 'web',

  entry: {
    app: "./src/angular/main.aot.ts",
    vendor: "./src/angular/vendor.aot.ts",
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

  plugins: [ aotPlugin, htmlWebpackPlugin],
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
