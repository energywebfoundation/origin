const baseConfig = require('./base.config');
const merge = require('webpack-merge');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

module.exports = merge(baseConfig, {
    mode: 'development',

    // Enable sourcemaps for debugging webpack's output.
    devtool: 'source-map',

    plugins: [new ForkTsCheckerWebpackPlugin()],

    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loader: 'ts-loader',
                options: {
                    configFile: '../tsconfig.json',
                    projectReferences: true,
                    transpileOnly: true
                }
            }
        ]
    }
});
