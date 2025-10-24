const HtmlWebpackPlugin = require('html-webpack-plugin');
const { ModuleFederationPlugin } = require('@module-federation/enhanced/webpack');
const path = require('path');
const packageJson = require('./package.json');

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';

  return {
    entry: './src/demo.tsx',
    mode: argv.mode || 'development',
    devServer: {
      port: 3002,
      hot: true,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
    },
    output: {
      publicPath: isProduction
        ? 'auto'
        : 'http://localhost:3002/',
      clean: true,
    },
    watchOptions: {
      ignored: ['**/node_modules/**', '**/@mf-types/**'],
    },
    resolve: {
      extensions: ['.ts', '.tsx', '.js', '.jsx'],
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
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
        name: 'shared_data',
        filename: 'remoteEntry.js',
        exposes: {
          './store': './src/store',
          './graphql': './src/graphql',
          './context': './src/context',
          './events': './src/events',
          './utils': './src/utils/loadDynamicRemote',
          './mfDevTools': './src/utils/mfDevTools',
        },
        shared: {
          react: {
            singleton: true,
            requiredVersion: packageJson.dependencies.react,
            strictVersion: false,
          },
          'react-dom': {
            singleton: true,
            requiredVersion: packageJson.dependencies['react-dom'],
            strictVersion: false,
          },
          '@reduxjs/toolkit': {
            singleton: true,
            requiredVersion: packageJson.dependencies['@reduxjs/toolkit'],
            strictVersion: false,
          },
          'react-redux': {
            singleton: true,
            requiredVersion: packageJson.dependencies['react-redux'],
            strictVersion: false,
          },
          '@apollo/client': {
            singleton: true,
            requiredVersion: packageJson.dependencies['@apollo/client'],
            strictVersion: false,
          },
          'graphql': {
            singleton: true,
            requiredVersion: packageJson.dependencies.graphql,
            strictVersion: false,
          },
        },
        shareStrategy: 'version-first',
        dts: {
          generateTypes: true,
        },
      }),
      new HtmlWebpackPlugin({
        template: './public/index.html',
        title: 'Shared Data Layer',
      }),
    ],
  };
};
