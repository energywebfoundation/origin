const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const webpack = require('webpack');
const path = require('path');

module.exports = {
    entry: './src/index.tsx',
    output: {
        filename: 'bundle.js',
        path: path.join(__dirname, '/../dist')
    },

    resolve: {
        // Add '.ts' and '.tsx' as resolvable extensions.
        extensions: ['.ts', '.tsx', '.js', '.json'],
        alias: {
            '@material-ui/styles': require.resolve('../node_modules/@material-ui/styles'),
            'react-redux': require.resolve('react-redux')
        },
        fallback: {
            stream: require.resolve('stream-browserify'),
            url: require.resolve('url/'),
            os: require.resolve('os-browserify/browser'),
            crypto: require.resolve('crypto-browserify'),
            path: require.resolve('path-browserify'),
            zlib: require.resolve('zlib-browserify'),
            http: require.resolve('stream-http'),
            https: require.resolve('https-browserify'),
            vm: require.resolve('vm-browserify'),
            fs: false
        }
    },

    target: 'web',
    devServer: {
        port: 3000,
        compress: true,
        historyApiFallback: true,
        transportMode: 'ws', 
        injectClient: false,
        hot: true,
        inline: true,
        watchOptions: {
            ignored: [
                path.resolve(__dirname, '../cypress')
            ]
        }
    },

    plugins: [
        new MiniCssExtractPlugin({ filename: 'styles.css' }),
        new CopyWebpackPlugin({
            patterns: [{ from: 'env-config.json', to: 'env-config.json' }]
        }),
        new webpack.ProvidePlugin({
            process: 'process/browser',
            Buffer: ['buffer', 'Buffer']
        })
    ],
    module: {
        rules: [
            {
                test: /\.(scss|css)$/,
                use: [
                    {
                        loader: 'style-loader' // creates style nodes from JS strings
                    },
                    {
                        loader: 'css-loader', // translates CSS into CommonJS
                        options: {
                            modules: 'global'
                        }
                    },
                    {
                        loader: 'resolve-url-loader'
                    },
                    {
                        loader: 'sass-loader', // compiles Sass to CSS
                        options: {
                            sourceMap: true
                        }
                    }
                ]
            },
            {
                test: /\.svg$/,
                use: [
                    '@svgr/webpack',
                    {
                        loader: 'url-loader',
                        options: {
                            limit: 8192
                        }
                    }
                ],
            },
            {
                test: /\.(png|jpg|gif)$/,
                use: [
                    {
                        loader: 'url-loader',
                        options: {
                            limit: 8192
                        }
                    }
                ]
            },
            {
                test: /\.m?js/,
                resolve: {
                    fullySpecified: false
                }
            },

            // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
            { enforce: 'pre', test: /\.js\.map$/, loader: 'source-map-loader' }
        ]
    },

    externals: [
        {
            xmlhttprequest: '{XMLHttpRequest:XMLHttpRequest}'
        }
    ]
};
