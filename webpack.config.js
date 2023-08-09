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
            {
                test: /\.css$/i,
                use: ['style-loader', 'css-loader'],
            }
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

    if (!env.fullBundle) {
        config.externals = {
            'ace-code': 'ace-code',
            xterm: 'xterm',
            'xterm-addon-attach': 'xterm-addon-attach',
            'xterm-addon-fit': 'xterm-addon-fit',
        };
    }

    if (env.example) {
        [
            'cubecell.html',
            'esp32.html',
            'index.html',
            'repo.html',
        ].forEach((filename) => {
            config.plugins.push(new HtmlWebpackPlugin({
                title: 'docslab',
                filename: filename,
                template: 'examples/' + filename,
            }));
        });
    }

    return config;
}
