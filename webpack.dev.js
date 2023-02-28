const path = require("path");
const common = require("./webpack.common");
const { merge } = require("webpack-merge");

module.exports = merge(common, {
    mode: "development",
    devtool: 'inline-source-map',
    output: {
        filename: "main.bundle.js",
        path: path.resolve(__dirname, "dist"),
        assetModuleFilename: "assets/images/[name][ext]",
    },
    module: {
        rules: [
            {
                test: /\.css$/i,
                use: [
                    "style-loader", 
                    "css-loader"
                ],
            }
        ]
    }
});