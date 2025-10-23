const HtmlWebpackPlugin = require('html-webpack-plugin');
const { ModuleFederationPlugin } = require('@module-federation/enhanced/webpack');
const path = require('path');

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';

  return {
    entry: './src/index.tsx',
    mode: argv.mode || 'development',
    devServer: {
      port: 3003,
      hot: true,
      headers: { 'Access-Control-Allow-Origin': '*' },
    },
    output: {
      publicPath: isProduction ? 'auto' : 'http://localhost:3003/',
      clean: true,
    },
    watchOptions: {
      ignored: ['**/node_modules/**', '**/@mf-types/**'],
    },
    resolve: {
      extensions: ['.ts', '.tsx', '.js', '.jsx'],
      alias: {
        '@tab-contract': path.resolve(__dirname, '../tab-contract/src'),
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
        name: 'content_shell',
        filename: 'remoteEntry.js',
        exposes: {
          './ContentPlatform': './src/ContentPlatform',
        },
        remotes: {
          shared_components: isProduction
            ? 'shared_components@https://cdn.example.com/shared-components/remoteEntry.js'
            : 'shared_components@http://localhost:3001/remoteEntry.js',
          shared_data: isProduction
            ? 'shared_data@https://cdn.example.com/shared-data/remoteEntry.js'
            : 'shared_data@http://localhost:3002/remoteEntry.js',
          files_tab: isProduction
            ? 'files_tab@https://cdn.example.com/files-tab/remoteEntry.js'
            : 'files_tab@http://localhost:3004/remoteEntry.js',
          hubs_tab: isProduction
            ? 'hubs_tab@https://cdn.example.com/hubs-tab/remoteEntry.js'
            : 'hubs_tab@http://localhost:3005/remoteEntry.js',
        },
        shared: {
          react: { singleton: true, requiredVersion: '^18.0.0' },
          'react-dom': { singleton: true, requiredVersion: '^18.0.0' },
          '@reduxjs/toolkit': { singleton: true, requiredVersion: '^2.0.0' },
          'react-redux': { singleton: true, requiredVersion: '^9.0.0' },
        },
        shareStrategy: 'version-first',
        dts: {
          consumeTypes: true,
        },
      }),
      new HtmlWebpackPlugin({
        template: './public/index.html',
      }),
    ],
  };
};
