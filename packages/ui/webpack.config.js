const nrwlConfig = require('@nrwl/react/plugins/webpack');
const webpack = require('webpack');

module.exports = (config) => {
  nrwlConfig(config);
  return {
    ...config,
    resolve: {
      ...config.resolve,
      fallback: {
        ...config.resolve.fallback,
        stream: require.resolve('stream-browserify'),
        os: require.resolve('os-browserify/browser'),
        crypto: require.resolve('crypto-browserify'),
        buffer: require.resolve('buffer/'),
      },
    },
    plugins: [
      ...config.plugins,
      new webpack.ProvidePlugin({
        Buffer: ['buffer', 'Buffer'],
      }),
      new webpack.ProvidePlugin({
        process: 'process/browser',
      }),
    ],
  };
};
