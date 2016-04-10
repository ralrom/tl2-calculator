const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');
const CleanPlugin = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const PATHS = {
    src: path.join(__dirname, 'src'),
    dist: path.join(__dirname, 'dist'),
    js: path.join(__dirname, 'src', 'js'),
    sass: path.join(__dirname, 'src', 'sass'),
    chars: path.join(__dirname, 'src', 'characters')
}

module.exports = {
    entry: {
        app: path.join(PATHS.js, 'Calculator.jsx')
    },
    output: {
        path: PATHS.dist,
        filename: '[name].[hash].js'
    },
    resolve: {
        extensions: ['', '.js', '.jsx'],
    },
    module: {
        loaders: [{
            test: /\.scss$/,
            loaders: ['style', 'css', 'sass'],
            include: PATHS.sass
        }, {
            test: /\.jsx?$/,
            loader: ['babel'],
            query: {
                cacheDirectory: true,
                presets: ['react', 'es2015']
            },
            include: PATHS.js
        }, {
            test: /\.png$/,
            loader: 'file'
        }]
    },
    devTool: 'source-map',
    plugins: [
        new HtmlWebpackPlugin({
            title: 'TL2 Calculator',
            template: path.join(PATHS.src, 'index.html')
        }),
        new webpack.DefinePlugin({
            "process.env": {
                NODE_ENV: JSON.stringify("production")
            }
        }),
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                warnings: false
            }
        }),
        new CleanPlugin([PATHS.dist]),
        new CopyWebpackPlugin([{from: PATHS.chars, to: 'characters'}])
    ]
};