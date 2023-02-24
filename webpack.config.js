const path = require("path");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const TerserPlugin = require("terser-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin"); 

module.exports = {
    mode: "development",
    // devtool: false,
    devtool: 'source-map',
    devServer: {
        static: path.join(__dirname, 'dist')
    },
    entry: "./src/index.js",
    output: {
        filename: "main.[contenthash].js",
        path: path.resolve(__dirname, "dist"),
        clean: true
    },
    optimization: {
        minimize: true,
        minimizer: [new TerserPlugin()],
    },
    module: {
        rules: [
            {
                test: /\.css$/i,
                use: ["style-loader", "css-loader"],
            },
            {
                test: /\.(svg|gif|png|jpe?g)$/,
                use: [
                  {
                    loader: 'file-loader',
                    options: {
                      name: '[name].[ext]',
                      outputPath: 'assets/images/'
                    }
                  }
                ]
            },
            {
                test:/\.html$/,
                use: [
                  'html-loader'
                ]
              },
        ],
    },
    plugins: [
        new HtmlWebpackPlugin({
            inject: 'body',
            template: './src/templates/index.html',
            filename: 'index.html',
            // minify: {
            //     removeComments: true,
            //     collapseWhitespace: true
            // }
        }),
        new MiniCssExtractPlugin(),
    ]
};