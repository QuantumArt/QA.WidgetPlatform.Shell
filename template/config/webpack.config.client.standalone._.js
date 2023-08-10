const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const baseconfig = require('./webpack.config.client._');
const CopyPlugin = require('copy-webpack-plugin');
const { merge } = require('webpack-merge');

/**
 * @type {import('webpack').Configuration}
 **/
const webpackConfig = env => ({
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, '../src/client/public/index.html'),
    }),
    new CopyPlugin({
      patterns: [
        {
          context: 'src/client/public',
          from: 'favicon.ico',
          to: 'favicon.ico',
        },
        {
          context: 'src/app-settings-shell',
          from: 'settings.json',
          to: 'settings.json',
        },
      ],
    }),
  ],
});

module.exports = env => merge(baseconfig(env), webpackConfig(env));
