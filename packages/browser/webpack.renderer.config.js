const path = require('path');
const rules = require('./webpack.rules');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');

const isDevelopment = process.env.NODE_ENV !== 'production';

rules.push(
    {
        test: /\.jsx?$/,
        exclude: [path.join(__dirname, './node_modules/')],
        use: {
            loader: 'babel-loader',
            options: {
                cacheDirectory: true,
                cacheCompression: false,
                plugins: [
                    isDevelopment && require.resolve('react-refresh/babel'),
                ].filter(Boolean),
            },
        },
    },
    {
        test: /\.css$/i,
        use: [
            'style-loader',
            {
                loader: 'css-loader',
                options: {
                    sourceMap: true,
                    modules: {
                        localIdentName: '[name]__[local]--[hash:base64:5]',
                    },
                },
            },
        ],
    },
    {
        test: /\.(png|jpe?g|gif|svg)$/i,
        type: 'asset/resource',
    }
);

module.exports = {
    module: {
        rules,
    },
    mode: isDevelopment ? 'development' : 'production',
    devServer: {
        hot: true,
    },
    plugins: [isDevelopment && new ReactRefreshWebpackPlugin()].filter(Boolean),
};
