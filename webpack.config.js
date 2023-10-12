const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

const webpack = require('webpack');


var config = {
    entry: './src/index.ts',
    devServer: {
        static: path.resolve(__dirname, 'lib'),
    },
    output: {
        filename: 'index.js',
        path: path.resolve(__dirname, 'lib'),
        clean: true,
        library: {
            name: 'docslab',
            type: 'umd',
        },
        globalObject: 'this',
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
                use: [
                    MiniCssExtractPlugin.loader,
                    'css-loader',
                ],
            }
        ],
    },
    plugins: [
        new MiniCssExtractPlugin(),
    ],
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
        const examples = [
            'cubecell.html',
            'esp32.html',
            'repo.html',
            'wisblock.html',
        ];
        examples.forEach((filename) => {
            config.plugins.push(new HtmlWebpackPlugin({
                title: 'docslab',
                filename: filename,
                template: 'examples/' + filename,
            }));
        });
        config.plugins.push(new HtmlWebpackPlugin({
            title: 'docslab',
            filename: 'index.html',
            template: 'examples/index.ejs',
            templateParameters: {
                examples: examples,
            }
        }));
    }

    return config;
}
