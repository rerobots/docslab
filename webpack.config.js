const path = require('path');

const webpack = require('webpack');


module.exports = {
    mode: 'development',
    output: {
        filename: 'docslab.js',
        path: path.resolve(__dirname, 'dist'),
    },
    resolve: {
        extensions: ['.ts'],
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
};
