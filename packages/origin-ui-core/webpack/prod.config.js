const baseConfig = require('./base.config');
const merge = require('webpack-merge');

module.exports = merge(baseConfig, {
    mode: 'production',

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
