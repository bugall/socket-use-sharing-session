'use strick';
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CommonsChunkPlugin = webpack.optimize.CommonsChunkPlugin;
const CleanWebpackPlugin = require('clean-webpack-plugin');

const pathsToClean = [
    'dist',
];
const cleanOptions = {
    root: __dirname + '/public',
    exclude: ['*.js'],
    verbose: true,
    dry: false
};
module.exports = {
    entry: __dirname + '/public/javascripts/index/index.js',
    output: {
        path: __dirname + '/public/dist',
        filename: '[name].[hash:8].js',
        sourceMapFilename: '[name].[hash:8].map',
        chunkFilename: '[id].[hash:8].js'
    },
    plugins: [new HtmlWebpackPlugin({
        template: `ejs-render-loader!${__dirname}/views/index/index.ejs`,
        inject: 'body'
    }), new CommonsChunkPlugin({
        name: 'vendor',
        minChunks: Infinity
    }), new CleanWebpackPlugin(pathsToClean, cleanOptions)],
    node: {
        fs: 'empty'
    }
};