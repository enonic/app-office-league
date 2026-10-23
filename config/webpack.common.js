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
        // Angular packages are shipped partially compiled; the Ivy linker finishes them (required outside the Angular CLI)
        test: /\.m?js$/,
        resolve: {fullySpecified: false},
        use: {
          loader: 'babel-loader',
          options: {
            cacheDirectory: true,
            compact: false,
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
      Crypto: 'crypto-js'
    }),
  ],
};
