const path = require("path");
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    entry: {
        main: "./src/js/index.js"
    },
    module: {
        rules: [
            {
                test:/\.html$/,
                use: [
                  'html-loader'
                ]
            },
            {
                test: /\.(png|svg|jpg|jpeg|gif)$/i,
                type: 'asset/resource',
            } 
        ],
    },
    plugins: [
        new HtmlWebpackPlugin({
            inject: 'body',
            template: './src/templates/index.html',
            filename: 'index.html',
            minify: {
                removeComments: true,
                collapseWhitespace: true
            }
        }),
    ]
};