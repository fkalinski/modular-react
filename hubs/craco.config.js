const { ModuleFederationPlugin } = require("webpack").container;

module.exports = {
  webpack: {
    plugins: {
      add: [
        new ModuleFederationPlugin({
          name: "hubs",
          filename: "remoteEntry.js",
          exposes: {
            "./App": "./src/App",
          },
          remotes: {
            content: "content@http://localhost:3001/remoteEntry.js",
          },
          shared: {
            react: { singleton: true, eager: true, requiredVersion: false },
            "react-dom": { singleton: true, eager: true, requiredVersion: false },
          },
        }),
      ],
    },
    configure: (webpackConfig) => {
      webpackConfig.output.publicPath = "auto";
      return webpackConfig;
    },
  },
};
