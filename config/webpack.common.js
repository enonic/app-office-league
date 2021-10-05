var webpack = require("webpack");
var CopyWebpackPlugin = require("copy-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
var path = require("path");
var helpers = require("./helpers");

// https://angular.io/docs/ts/latest/guide/webpack.html
module.exports = {
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
        test: /\.html$/,
        exclude: /node_modules/,
        loader: "html-loader",
      },
      {
        // load all flags to corresponding folder
        test: /\.(png|jpe?g|gif|ico|svg)$/,
        include: [helpers.root("src", "angular", "assets", "img", "flags")],
        use: [
          {
            loader: "file-loader",
            options: {
              name: "img/flags/[name].[hash].[ext]",
            },
          },
        ],
      },
      {
        // copy all the images (except flags)
        test: /\.(png|jpe?g|gif|ico|svg)$/,
        exclude: [helpers.root("src", "angular", "assets", "img", "flags")],
        use: [
          {
            loader: "file-loader",
            options: {
              name: "img/[name].[hash].[ext]",
            },
          },
        ],
      },
      {
        // load all woff fonts to corresponding folder
        test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        use: [
          {
            loader: "url-loader",
            options: {
              limit: 10000,
              mimetype: "application/font-woff",
              name: "fonts/[name].[hash].[ext]",
              esModule: false,
            }
          },
        ],
        type: 'javascript/auto'
      },
      {
        // load all other fonts to the same folder
        test: /\.(ttf|eot)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        use: [
          {
            loader: "file-loader",
            options: {
              name: "fonts/[name].[hash].[ext]",
              esModule: false,
            },
          },
        ],
      },
      {
        // load app wide styles
        test: /\.(less|css)$/,
        include: [helpers.root("src", "angular")],
        exclude: [helpers.root("src", "angular", "app")],
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
        include: [helpers.root("src", "angular", "app")],
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
      helpers.root("./src"), // location of your src
      {} // a map of your routes
    ),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: "./src/angular/assets",
          globOptions: { ignore: "img/flags/**", debug: "warning" },
        }, // don't copy flags as they are referenced from css file
      ],
    }),
    new MiniCssExtractPlugin({
      filename: "./css/[name].css",
    }),
    new webpack.ProvidePlugin({
      "window.jQuery": "jquery",
      Crypto: "crypto-js",
    }),
  ],
};
