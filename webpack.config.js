const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

const webpack = require('webpack');


var config = {
    entry: './src/index.ts',
    devServer: {
        static: path.resolve(__dirname, 'dist'),
    },
    output: {
        filename: 'docslab.js',
        path: path.resolve(__dirname, 'dist'),
        clean: true,
        library: {
            name: 'docslab',
            type: 'umd',
        },
    },
    resolve: {
        extensions: ['.ts', '.js'],
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
        ],
    },
    plugins: [],
};

module.exports = (env, argv) => {
    config.mode = argv.mode || 'development';
    if (config.mode === 'development') {
        config.devtool = 'eval-source-map';
    }

    if (env.example || env.autoload) {
        config.entry = './src/indexAutoload.ts';
    }

    if (env.example) {
        config.plugins.push(new HtmlWebpackPlugin({
            title: 'docslab',
            template: 'examples/index.html',
        }));
    }

    return config;
}
