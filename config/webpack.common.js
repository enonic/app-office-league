import webpack from "webpack";
import CopyWebpackPlugin from "copy-webpack-plugin";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import linkerPlugin from '@angular/compiler-cli/linker/babel';

import { root } from "./helpers.js";

// https://angular.io/docs/ts/latest/guide/webpack.html
export default {
  mode: "none",
  // Configure the console output
  stats: {
    warnings: true,
    errors: true,
    errorDetails: true,
    colors: true,
    reasons: true,
    timings: true,
    children: true,
    modules: true,
    assets: false,
    chunkModules: true,
    chunks: true,
    source: true,
    entrypoints: true,
    depth: true,
  },

  entry: {
    polyfills: "./src/angular/polyfills.ts",
    vendor: "./src/angular/vendor.ts",
    app: "./src/angular/main.ts",
    styles: "./src/angular/styles.less",
  },

  resolve: {
    extensions: [".ts", ".js", ".less", ".css"],
  },

  optimization: {
    runtimeChunk: {
      name: "common",
    },
  },

  module: {
    rules: [
      {
        test: /\.m?js$/,
        resolve: {fullySpecified: false},
        use: {
          loader: 'babel-loader',
          options: {
            plugins: [ linkerPlugin ],
          }
        }
      },
      {
        test: /\.html$/,
        exclude: /node_modules/,
        loader: "html-loader",
      },
      {
        // load all flags to corresponding folder
        type: 'asset/resource',
        test: /\.(png|jpe?g|gif|ico|svg)$/,
        include: [root("src", "angular", "assets", "img", "flags")],
        generator: {
          filename: 'img/flags/[name].[hash][ext]'
        }
      },
      {
        // copy all the images (except flags)
        type: 'asset/resource',
        test: /\.(png|jpe?g|gif|ico|svg)$/,
        exclude: [root("src", "angular", "assets", "img", "flags")],
        generator: {
          filename: 'img/[name].[hash][ext]'
        },
      },
      {
        // load all other fonts to the same folder
        type: 'asset/resource',
        test: /\.(ttf|eot|woff|woff2)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        generator: {
          filename: 'fonts/[name].[hash][ext]'
        },
      },
      {
        // load app wide styles
        test: /\.(less|css)$/,
        include: [root("src", "angular")],
        exclude: [root("src", "angular", "app")],
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              publicPath: '../',  // /webapp/com.enonic.app.officeleague/
            },
          },
          "css-loader",
          'less-loader'
        ]
      },
      {
        test: /\.(less)$/,
        include: [root("src", "angular", "app")],
        use: [
            { loader: 'to-string-loader' },
            { loader: 'css-loader',
              options: {
                esModule: false,
              }
            },
            { loader: 'less-loader' }
        ]
      }
    ],
  },

  plugins: [
    // Workaround for angular/angular#11580
    new webpack.ContextReplacementPlugin(
      // The (\\|\/) piece accounts for path separators in *nix and Windows
      /angular(\\|\/)core(\\|\/)(esm(\\|\/)src|src)(\\|\/)linker/,
      root("./src"), // location of your src
      {} // a map of your routes
    ),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: "./src/angular/assets",
          noErrorOnMissing: true,
          globOptions: {
            ignore: ["**/img/flags/**"]
          },
        }, // don't copy flags as they are referenced from css file
      ],
    }),
    new MiniCssExtractPlugin({
      filename: "./css/[name].css",
    }),
    new webpack.ProvidePlugin({
      $: "jquery",
      jQuery: "jquery",
      "window.jQuery": "jquery",
      Crypto: 'crypto-js'
    }),
  ],
};
