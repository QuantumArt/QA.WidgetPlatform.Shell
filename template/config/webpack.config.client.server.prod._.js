const path = require('path');
const baseconfig = require('./webpack.config.client.server._');
const { EnvironmentPlugin } = require('webpack');
const { merge } = require('webpack-merge');

/**
 * @type {import('webpack').Configuration}
 **/
const webpackConfig = env => ({
  plugins: [
    new EnvironmentPlugin({
      wpPlatform: {
        publicPath: '/',
      },
    }),
  ],
});

module.exports = env => merge(baseconfig(env), webpackConfig(env));
