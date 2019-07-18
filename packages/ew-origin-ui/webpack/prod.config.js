const baseConfig = require('./base.config');
const merge = require('webpack-merge');
const Dotenv = require('dotenv-webpack');

module.exports = merge(baseConfig, {
    mode: 'production',

    plugins: [
        new Dotenv({
          path: '.env.prod'
        })
    ]
});