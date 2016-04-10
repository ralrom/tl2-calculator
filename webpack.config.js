const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const PATHS = {
    src: path.join(__dirname, 'src'),
    dist: path.join(__dirname, 'dist'),
    js: path.join(__dirname, 'src', 'js'),
    sass: path.join(__dirname, 'src', 'sass'),
    chars: path.join(__dirname, 'src', 'characters')
}

module.exports = {
    entry: path.join(PATHS.js, 'Calculator.jsx'),
    output: {
        path: PATHS.dist,
        filename: 'bundle.js'
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
            loader: 'babel',
            query: {
                cacheDirectory: true,
                presets: ['react', 'es2015', 'react-hmre']
            },
            include: PATHS.js
        }, {
            test: [/\.jpg$/],
            loader: 'file'
        }]
    },
    devServer: {
        historyApiFallback: true,
        hot: true,
        inline: true,
        progress: true,
        contentBase: PATHS.dist,
        host: '0.0.0.0',
        port: process.env.PORT
    },
    plugins: [
        new HtmlWebpackPlugin({
            title: 'TL2 Calculator',
            template: path.join(PATHS.src, 'index.html')
        }),
        new webpack.HotModuleReplacementPlugin(),
        new CopyWebpackPlugin([{from: PATHS.chars, to: 'characters'}])
    ]
};