const HtmlWebpackPlugin = require('html-webpack-plugin');
const { ModuleFederationPlugin } = require('@module-federation/enhanced/webpack');
const path = require('path');

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';

  return {
    entry: './src/index.tsx',
    mode: argv.mode || 'development',
    devServer: {
      port: 3000,
      hot: true,
      historyApiFallback: true,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
    },
    output: {
      publicPath: isProduction ? 'auto' : 'http://localhost:3000/',
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
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader'],
        },
      ],
    },
    plugins: [
      new ModuleFederationPlugin({
        name: 'top_level_shell',
        remotes: {
          shared_components: isProduction
            ? 'shared_components@https://cdn.example.com/shared-components/remoteEntry.js'
            : 'shared_components@http://localhost:3001/remoteEntry.js',
          shared_data: isProduction
            ? 'shared_data@https://cdn.example.com/shared-data/remoteEntry.js'
            : 'shared_data@http://localhost:3002/remoteEntry.js',
          content_shell: isProduction
            ? 'content_shell@https://cdn.example.com/content-shell/remoteEntry.js'
            : 'content_shell@http://localhost:3003/remoteEntry.js',
          reports_tab: isProduction
            ? 'reports_tab@https://cdn.example.com/reports-tab/remoteEntry.js'
            : 'reports_tab@http://localhost:3006/remoteEntry.js',
          user_tab: isProduction
            ? 'user_tab@https://cdn.example.com/user-tab/remoteEntry.js'
            : 'user_tab@http://localhost:3007/remoteEntry.js',
        },
        shared: {
          react: { singleton: true, requiredVersion: '^18.0.0', strictVersion: false },
          'react-dom': { singleton: true, requiredVersion: '^18.0.0', strictVersion: false },
          '@reduxjs/toolkit': { singleton: true, requiredVersion: '^2.0.0', strictVersion: false },
          'react-redux': { singleton: true, requiredVersion: '^9.0.0', strictVersion: false },
        },
        shareStrategy: 'version-first',
      }),
      new HtmlWebpackPlugin({
        template: './public/index.html',
        title: 'Modular Platform',
      }),
    ],
  };
};
