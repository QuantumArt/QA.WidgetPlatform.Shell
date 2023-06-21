const path = require('path');
const moduleFederationPlugin = require('./module-federation');
const baseconfig = require('./webpack.config._');
const CopyPlugin = require('copy-webpack-plugin');
const nodeExternals = require('webpack-node-externals');
const { merge } = require('webpack-merge');

/**
 * @type {import('webpack').Configuration}
 **/
const webpackConfig = {
  entry: path.resolve(__dirname, '../src/server/index'),
  mode: 'production',
  target: 'node',
  output: {
    path: path.resolve(__dirname, '../dist/server'),
    chunkFilename: '[name].[contenthash].js',
    filename: 'main.js',
  },
  externalsType: 'node-commonjs',
  plugins: [
    ...moduleFederationPlugin.server,
    new CopyPlugin({
      patterns: [
        { context: 'src/server', from: 'views', to: 'views' },
        {
          context: 'src/app-settings-shell',
          from: 'settings.json',
          to: 'settings.json',
        },
      ],
    }),
  ],
};

module.exports = merge(baseconfig, webpackConfig);
