var webpack = require('webpack');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var CopyWebpackPlugin = require('copy-webpack-plugin');
var helpers = require('./helpers');

// https://angular.io/docs/ts/latest/guide/webpack.html
module.exports = {
    
    entry: {
        'polyfills': './src/angular/polyfills.ts',
        'vendor': './src/angular/vendor.ts',
        'app': './src/angular/main.ts'
    },

    resolve: {
        extensions: ['.ts', '.js', 'less']
    },

    module: {
        rules: [
            {
                test: /\.ts$/,
                loaders: [
                    {
                        loader: 'awesome-typescript-loader',
                        options: {configFileName: helpers.root('tsconfig.json')}
                    },
                    'angular2-template-loader',
                    // https://medium.com/@daviddentoom/angular-2-lazy-loading-with-webpack-d25fe71c29c1#.2l9gygqbr
                    'angular2-router-loader'
                ]
            },
            {
                test: /\.html$/,
                exclude: /node_modules/,
                loader: 'html-loader'
            },
            {
                test: /\.(png|jpe?g|gif|svg|woff|woff2|ttf|eot|ico)$/,
                exclude: /node_modules/,
                loader: 'file-loader?name=assets/[name].[hash].[ext]'
            },
            {
                test: /\.(less|css)$/,
                include: helpers.root('src', 'angular'),
                exclude: helpers.root('src', 'angular', 'app'),
                loader: ExtractTextPlugin.extract({
                    fallback: 'style-loader',
                    use: 'css-loader!less-loader'
                })
            },
            {
                test: /\.(less|css)$/,
                include: helpers.root('src', 'angular', 'app'),
                loader: 'to-string-loader!css-loader!less-loader'
            }
        ]
    },

    plugins: [
        // Workaround for angular/angular#11580
        new webpack.ContextReplacementPlugin(
            // The (\\|\/) piece accounts for path separators in *nix and Windows
            /angular(\\|\/)core(\\|\/)(esm(\\|\/)src|src)(\\|\/)linker/,
            helpers.root('./src'), // location of your src
            {} // a map of your routes
        ),
        new webpack.optimize.CommonsChunkPlugin({
            name: ['app', 'vendor', 'polyfills']
        }),
        new webpack.ProvidePlugin({
            $: "jquery",
            jQuery: "jquery",
            "window.jQuery": "jquery"
        }),
        new CopyWebpackPlugin([
            {from: './src/angular/assets'}
        ])
    ]
};