const { ModuleFederationPlugin } = require("webpack").container;

module.exports = {
  webpack: {
    plugins: {
      add: [
        new ModuleFederationPlugin({
          name: "shell",
          remotes: {
            content: "content@http://localhost:3001/remoteEntry.js",
            hubs: "hubs@http://localhost:3002/remoteEntry.js",
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
