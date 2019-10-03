const baseConfig = require('./base.config');
const merge = require('webpack-merge');
const Dotenv = require('dotenv-webpack');

module.exports = merge(baseConfig, {
    mode: 'production',

    plugins: [
        new Dotenv({
          path: '../../.env'
        })
    ],

    module: {
      rules: [
        {
          test: /\.tsx?$/,
          loader: 'ts-loader',
          options: {
              configFile: '../tsconfig.build.json',
              projectReferences: true,
              transpileOnly: false
          }
        }
      ]
    }
});