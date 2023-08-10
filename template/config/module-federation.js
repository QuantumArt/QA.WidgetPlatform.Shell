const {
  container: { ModuleFederationPlugin },
} = require('webpack');
const { NodeFederationPlugin, StreamingTargetPlugin } = require('@module-federation/node');
const pkg = require('../package.json');

const remotesLocal = {
  qp_widgets_platform_modules: 'qp_widgets_platform_modules@http://localhost:3201/',
};

const remotesProd = {
  qp_widgets_platform_modules: 'qp_widgets_platform_modules@||***qp_widgets_platform_modules***||/',
};

const getRemotes = (remotes, postfix) =>
  Object.keys(remotes).reduce(
    (acc, key) => ({
      ...acc,
      [key]: `${remotes[key]}${postfix}`,
    }),
    {},
  );

const shared = {
  ...pkg.dependencies,
  react: {
    singleton: true,
    requiredVersion: pkg.dependencies.react,
  },
  'react-dom': {
    singleton: true,
    requiredVersion: pkg.dependencies['react-dom'],
  },
  'react-router-dom': {
    singleton: true,
  },
  '@quantumart/qp8-widget-platform-bridge': {
    singleton: true,
  },
};

module.exports = env => ({
  client: new ModuleFederationPlugin({
    name: 'qp_widgets_platform_shell',
    filename: 'remoteEntry.js',
    remotes: getRemotes(
      env.prodstate ? remotesProd : remotesLocal,
      env.nodeserver ? 'static/client/remoteEntry.js' : 'remoteEntry.js',
    ),
    shared: shared,
  }),
  server: [
    new NodeFederationPlugin({
      name: 'qp_widgets_platform_shell',
      library: { type: 'commonjs-module' },
      remotes: getRemotes(
        env.prodstate ? remotesProd : remotesLocal,
        env.nodeserver ? 'static/server/remoteEntry.js' : 'remoteEntry.js',
      ),
      shared: shared,
      filename: 'remoteEntry.js',
    }),
    new StreamingTargetPlugin({
      name: 'qp_widgets_platform_shell',
      library: { type: 'commonjs-module' },
      remotes: getRemotes(
        env.prodstate ? remotesProd : remotesLocal,
        env.nodeserver ? 'static/server/remoteEntry.js' : 'remoteEntry.js',
      ),
    }),
  ],
});
