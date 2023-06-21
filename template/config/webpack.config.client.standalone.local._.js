const baseconfig = require('./webpack.config.client.standalone._');
const { EnvironmentPlugin } = require('webpack');
const { merge } = require('webpack-merge');

/**
 * @type {import('webpack').Configuration}
 **/
const webpackConfig = {
  devtool: 'source-map',
  plugins: [
    new EnvironmentPlugin({
      wpPlatform: {
        publicPath: '/',
      },
    }),
  ],
};

module.exports = merge(baseconfig, webpackConfig);
