const baseConfig = require('./base.config');
const merge = require('webpack-merge');
const Dotenv = require('dotenv-webpack');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

module.exports = merge(baseConfig, {
    mode: 'development',

    // Enable sourcemaps for debugging webpack's output.
    devtool: 'source-map',

    plugins: [
        new Dotenv({
          path: '.env.dev'
        }),
        new ForkTsCheckerWebpackPlugin()
    ],

    module: {
      rules: [
        {
          test: /\.tsx?$/,
          loader: 'ts-loader',
          options: {
              configFile: '../tsconfig.build.json',
              projectReferences: true,
              transpileOnly: true
          }
        }
      ]
    }
});