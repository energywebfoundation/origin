const baseConfig = require('./base.config');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const merge = require('webpack-merge');

module.exports = merge(baseConfig, {
    mode: 'production',

    plugins: [
        new HtmlWebpackPlugin({
            title: 'Origin',
            favicon: 'favicon.ico',
            template: './src/index.ejs',
            meta: {
                viewport: 'width=device-width, initial-scale=1, shrink-to-fit=no'
            }
        })
    ],

    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loader: 'ts-loader',
                options: {
                    configFile: '../tsconfig.json',
                    projectReferences: true,
                    transpileOnly: false
                }
            }
        ]
    }
});
