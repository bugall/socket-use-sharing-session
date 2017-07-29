'use strick';
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    entry: __dirname + '/public/javascripts/index.js',
    output: {
        path: __dirname + '/public/dist',
        filename: 'bundle.js'
    },
    plugins: [new HtmlWebpackPlugin({
        template: __dirname + '/views/index.ejs',
        inject: 'body'
    })],
    node: {
        fs: 'empty'
    }
};