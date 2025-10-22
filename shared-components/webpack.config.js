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
      port: 3001,
      hot: true,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
    },
    output: {
      publicPath: isProduction
        ? 'auto'
        : 'http://localhost:3001/',
      clean: true,
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
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader'],
        },
      ],
    },
    plugins: [
      new ModuleFederationPlugin({
        name: 'shared_components',
        filename: 'remoteEntry.js',
        exposes: {
          './Button': './src/components/Button',
          './Input': './src/components/Input',
          './Table': './src/components/Table',
          './Tree': './src/components/Tree',
          './Layout': './src/components/Layout',
          './Theme': './src/theme/ThemeProvider',
          './Sidebar': './src/components/Sidebar',
          './TopBar': './src/components/TopBar',
          './SearchBar': './src/components/SearchBar',
          './FileIcon': './src/components/FileIcon',
          './ReactSingletonTest': './src/components/ReactSingletonTest',
          './ContentPicker': './src/components/ContentPicker',
          './Breadcrumbs': './src/components/Breadcrumbs',
          './NavigationService': './src/services/NavigationService',
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
        },
        // Module Federation 2.0 features
        shareStrategy: 'version-first',
        dts: false, // We'll generate types separately
      }),
      new HtmlWebpackPlugin({
        template: './public/index.html',
        title: 'Shared Components Library',
      }),
    ],
  };
};
