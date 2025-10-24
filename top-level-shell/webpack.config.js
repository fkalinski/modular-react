const HtmlWebpackPlugin = require('html-webpack-plugin');
const { ModuleFederationPlugin } = require('@module-federation/enhanced/webpack');
const path = require('path');

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';

  // Get remote URLs from environment variables or use defaults
  const getRemoteUrl = (name, defaultUrl) => {
    const envVar = `REMOTE_${name.toUpperCase()}_URL`;
    return process.env[envVar] || defaultUrl;
  };

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
      path: path.resolve(__dirname, 'dist'),
    },
    watchOptions: {
      ignored: ['**/node_modules/**', '**/@mf-types/**'],
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
        // Use dynamic remotes to enable runtime URL resolution
        // This allows cookie/localStorage/URL param overrides
        remotes: {
          shared_components: 'shared_components@dynamic',
          shared_data: 'shared_data@dynamic',
          content_shell: 'content_shell@dynamic',
          reports_tab: 'reports_tab@dynamic',
          user_tab: 'user_tab@dynamic',
        },
        shared: {
          react: { singleton: true, requiredVersion: '^18.0.0', strictVersion: false },
          'react-dom': { singleton: true, requiredVersion: '^18.0.0', strictVersion: false },
          '@reduxjs/toolkit': { singleton: true, requiredVersion: '^2.0.0', strictVersion: false },
          'react-redux': { singleton: true, requiredVersion: '^9.0.0', strictVersion: false },
        },
        shareStrategy: 'version-first',
        dts: {
          consumeTypes: true,
        },
      }),
      new HtmlWebpackPlugin({
        template: './public/index.html',
        title: 'Modular Platform',
      }),
    ],
  };
};
