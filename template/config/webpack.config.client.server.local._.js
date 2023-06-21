const path = require('path');
const baseconfig = require('./webpack.config.client.server._');
const { EnvironmentPlugin } = require('webpack');
const { merge } = require('webpack-merge');

/**
 * @type {import('webpack').Configuration}
 **/
const webpackConfig = {
  plugins: [
    new EnvironmentPlugin({
      wpPlatform: {
        publicPath: '/',
      },
    }),
  ],
};

module.exports = merge(baseconfig, webpackConfig);
