const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');


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

    if (env.fullBundle) {
        config.output.filename = 'index.all.js';
        config.module.rules.push({
            test: /\.css$/i,
            use: [
                'style-loader',
                'css-loader',
            ],
        });
    } else {
        config.externals = {
            'ace-code': 'ace-code',
            xterm: 'xterm',
            'xterm-addon-attach': 'xterm-addon-attach',
            'xterm-addon-fit': 'xterm-addon-fit',
        };
        config.module.rules.push({
            test: /\.css$/i,
            use: [
                MiniCssExtractPlugin.loader,
                'css-loader',
            ],
        });
        config.plugins.push(new MiniCssExtractPlugin());
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
                template: 'examples/html/' + filename,
            }));
        });
        config.plugins.push(new HtmlWebpackPlugin({
            title: 'docslab',
            filename: 'index.html',
            template: 'examples/html/index.ejs',
            templateParameters: {
                examples: examples,
            }
        }));
    }

    return config;
}
