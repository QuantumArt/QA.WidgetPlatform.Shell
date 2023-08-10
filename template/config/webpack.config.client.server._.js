const path = require('path');
const baseconfig = require('./webpack.config.client._');
const LoadablePlugin = require('@loadable/webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const { merge } = require('webpack-merge');

/**
 * @type {import('webpack').Configuration}
 **/
const webpackConfig = env => ({
  output: {
    path: path.resolve(__dirname, '../dist/static/client'),
  },
  plugins: [
    new LoadablePlugin({
      filename: 'loadable-stats.json',
      writeToDisk: true,
    }),
    new CopyPlugin({
      patterns: [
        {
          context: 'src/client/public',
          from: 'favicon.ico',
          to: 'favicon.ico',
        },
      ],
    }),
  ],
});

module.exports = env => merge(baseconfig(env), webpackConfig(env));
