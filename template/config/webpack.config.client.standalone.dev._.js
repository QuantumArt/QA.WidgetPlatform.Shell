const path = require('path');
const baseconfig = require('./webpack.config.client.standalone._');
const { EnvironmentPlugin } = require('webpack');
const { merge } = require('webpack-merge');

/**
 * @type {import('webpack').Configuration}
 **/
const webpackConfig = env => ({
  devtool: 'eval',
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
    hot: false,
  },
  plugins: [
    new EnvironmentPlugin({
      wpPlatform: {
        standalone: !env.nodeserver,
        publicPath: '/',
      },
    }),
  ],
});

module.exports = env => merge(baseconfig(env), webpackConfig(env));
