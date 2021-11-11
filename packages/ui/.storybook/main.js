const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const webpack = require('webpack');

module.exports = {
  stories: [],
  addons: [
    '@storybook/addon-docs',
    {
      name: '@storybook/addon-essentials',
      options: {
        actions: false,
      },
    },
  ],
  // uncomment the property below if you want to apply some webpack config globally
  webpackFinal: async (config) => {
    // Make whatever fine-grained changes you need that should apply to all storybook configs

    const adjustedConfig = {
      ...config,
      resolve: {
        ...config.resolve,
        fallback: {
          ...config.resolve.fallback,
          stream: require.resolve('stream-browserify'),
          buffer: require.resolve('buffer/'),
        },
        plugins: [
          ...config.resolve.plugins,
          new TsconfigPathsPlugin({
            configFile: './tsconfig.base.json',
          }),
        ],
      },
      plugins: [
        ...config.plugins,
        new webpack.ProvidePlugin({
          process: 'process/browser',
        }),
        new webpack.ProvidePlugin({
          Buffer: ['buffer', 'Buffer'],
        }),
      ],
      module: {
        ...config.module,
        rules: [
          ...config.module.rules,
          {
            test: /\.(png|jpe?g|gif|webp)$/,
            type: 'asset',
          },
          {
            test: /\.svg?$/,
            oneOf: [
              {
                use: [
                  {
                    loader: '@svgr/webpack',
                    options: {
                      prettier: false,
                      svgo: true,
                      svgoConfig: {
                        plugins: [{ removeViewBox: false }],
                      },
                      titleProp: true,
                    },
                  },
                ],
                issuer: {
                  and: [/\.(ts|tsx|js|jsx|md|mdx)$/],
                },
              },
            ],
          },
        ],
      },
    };

    // Return the adjusted config
    return adjustedConfig;
  },
};
