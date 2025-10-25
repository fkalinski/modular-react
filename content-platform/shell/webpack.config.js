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
        // Use dynamic remotes to enable runtime URL resolution
        // This allows cookie/localStorage/URL param overrides
        remotes: {
          shared_components: 'shared_components@dynamic',
          shared_data: 'shared_data@dynamic',
          files_tab: 'files_tab@dynamic',
          hubs_tab: 'hubs_tab@dynamic',
          archives_tab: 'archives_tab@dynamic',
          search_results_tab: 'search_results_tab@dynamic',
        },
        shared: {
          react: { singleton: true, requiredVersion: packageJson.dependencies.react, strictVersion: false },
          'react-dom': { singleton: true, requiredVersion: packageJson.dependencies['react-dom'], strictVersion: false },
          '@reduxjs/toolkit': { singleton: true, requiredVersion: packageJson.dependencies['@reduxjs/toolkit'], strictVersion: false },
          'react-redux': { singleton: true, requiredVersion: packageJson.dependencies['react-redux'], strictVersion: false },
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
