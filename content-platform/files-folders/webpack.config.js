const HtmlWebpackPlugin = require('html-webpack-plugin');
const { ModuleFederationPlugin } = require('@module-federation/enhanced/webpack');
const path = require('path');

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';

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
            ? 'shared_components@https://cdn.example.com/shared-components/remoteEntry.js'
            : 'shared_components@http://localhost:3001/remoteEntry.js',
        },
        shared: {
          react: { singleton: true, requiredVersion: '^18.0.0' },
          'react-dom': { singleton: true, requiredVersion: '^18.0.0' },
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
