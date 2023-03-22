const path = require("path");
const common = require("./webpack.common");
const { merge } = require("webpack-merge");

module.exports = merge(common, {
    mode: "development",
    devtool: 'inline-source-map',
    devServer: {
        static: './dist',
        headers: {
            'Cache-Control': 'store',
        },
    },
    output: {
        filename: "main.bundle.js",
        path: path.resolve(__dirname, "dist"),
        assetModuleFilename: (pathData) => {
            const filepath = path
                .dirname(pathData.filename)
                .split("/")
                .slice(1)
                .join("/");
            return `${filepath}/[name][ext]`;
        },
        clean: true
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
    },
});