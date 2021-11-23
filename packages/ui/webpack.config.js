const nrwlConfig = require('@nrwl/react/plugins/webpack');
const webpack = require('webpack');
/* Enable when needed */
// const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

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
      /* Enable when needed. If enabled - starts the server on each build.

      Currently generated stats.json file is incomplete, thus disallowing the usage of
      { "analyzerMode": "disabled" } and serving it later via "bundle-report" script.

      */

      // new BundleAnalyzerPlugin({
      //   analyzerMode: 'server',
      //   generateStatsFile: true,
      //   statsOptions: { source: false },
      // }),
    ],
  };
};
