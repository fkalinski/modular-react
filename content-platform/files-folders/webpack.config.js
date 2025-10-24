const HtmlWebpackPlugin = require('html-webpack-plugin');
const { ModuleFederationPlugin } = require('@module-federation/enhanced/webpack');
const path = require('path');
const packageJson = require('./package.json');

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
      port: 3004,
      hot: true,
      headers: { 'Access-Control-Allow-Origin': '*' },
    },
    output: {
      publicPath: isProduction ? 'auto' : 'http://localhost:3004/',
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
        name: 'files_tab',
        filename: 'remoteEntry.js',
        exposes: {
          './Plugin': './src/plugin',
        },
        remotes: {
          shared_components: isProduction
            ? `shared_components@${getRemoteUrl('shared_components', 'https://shared-components.vercel.app')}/remoteEntry.js`
            : 'shared_components@http://localhost:3001/remoteEntry.js',
          shared_data: isProduction
            ? `shared_data@${getRemoteUrl('shared_data', 'https://shared-data.vercel.app')}/remoteEntry.js`
            : 'shared_data@http://localhost:3002/remoteEntry.js',
        },
        shared: {
          react: { singleton: true, requiredVersion: packageJson.dependencies.react, strictVersion: false },
          'react-dom': { singleton: true, requiredVersion: packageJson.dependencies['react-dom'], strictVersion: false },
          '@reduxjs/toolkit': { singleton: true, requiredVersion: '^2.0.0', strictVersion: false },
          'react-redux': { singleton: true, requiredVersion: '^9.0.0', strictVersion: false },
        },
        shareStrategy: 'version-first',
        dts: {
          generateTypes: true,
          consumeTypes: true,
        },
      }),
      new HtmlWebpackPlugin({
        template: './public/index.html',
      }),
    ],
  };
};
