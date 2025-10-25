const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { ModuleFederationPlugin } = require('@module-federation/enhanced/webpack');

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';

  return {
    entry: './src/index.ts',
    mode: argv.mode || 'development',
    devServer: {
      port: 3009,
      hot: true,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
    },
    output: {
      publicPath: isProduction
        ? 'https://file-requests-tab-v1.vercel.app/'
        : 'http://localhost:3009/',
      clean: true,
    },
    resolve: {
      extensions: ['.ts', '.tsx', '.js', '.jsx'],
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: 'ts-loader',
          exclude: /node_modules/,
        },
      ],
    },
    plugins: [
      new ModuleFederationPlugin({
        name: 'file_requests_tab',
        filename: 'remoteEntry.js',
        exposes: {
          './Plugin': './src/Plugin.tsx',
        },
        shared: {
          react: {
            singleton: true,
            requiredVersion: '^18.2.0',
          },
          'react-dom': {
            singleton: true,
            requiredVersion: '^18.2.0',
          },
          '@apollo/client': {
            singleton: true,
            requiredVersion: '^3.8.0',
          },
        },
      }),
      new HtmlWebpackPlugin({
        template: './public/index.html',
      }),
    ],
  };
};
