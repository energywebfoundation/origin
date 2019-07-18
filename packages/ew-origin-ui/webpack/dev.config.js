const baseConfig = require('./base.config');
const merge = require('webpack-merge');
const Dotenv = require('dotenv-webpack');

module.exports = merge(baseConfig, {
    mode: 'development',

    // Enable sourcemaps for debugging webpack's output.
    devtool: "source-map",

    plugins: [
        new Dotenv({
          path: '.env.dev'
        })
    ]
});