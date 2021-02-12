const path = require('path');

module.exports = {
    stories: ['../src/components/**/*.stories.tsx'],
    addons: [
        '@storybook/addon-knobs',
        '@storybook/addon-storysource',
        '@storybook/addon-backgrounds',
        {
            name: '@storybook/preset-typescript',
            options: {
                tsLoaderOptions: {
                    configFile: path.resolve(__dirname, '../tsconfig.json'),
                },
                tsDocgenLoaderOptions: {
                    tsconfigPath: path.resolve(__dirname, '../tsconfig.json'),
                },
                forkTsCheckerWebpackPluginOptions: {
                    colors: false, // disables built-in colors in logger messages
                },
                include: [path.resolve(__dirname, '../src')],
            },
        },
        '@storybook/preset-scss',
        '@storybook/addon-actions/register'
    ],
    webpackFinal: (config) => ({
        ...config,
        externals: [
            {
                xmlhttprequest: '{XMLHttpRequest:XMLHttpRequest}'
            }
        ]
    })
}