const path = require('path');
const baseconfig = require('./webpack.config.client.standalone._');
const { EnvironmentPlugin } = require('webpack');
const { merge } = require('webpack-merge');

/**
 * @type {import('webpack').Configuration}
 **/
const webpackConfig = {
  devtool: 'source-map',
  mode: 'development',
  devServer: {
    static: {
      directory: path.join(__dirname, 'dist'),
    },
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization',
    },
    port: 3200,
    historyApiFallback: true,
  },
  plugins: [
    new EnvironmentPlugin({
      wpPlatform: {
        publicPath: '/',
      },
    }),
  ],
};

module.exports = merge(baseconfig, webpackConfig);
