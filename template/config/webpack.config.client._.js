const path = require('path');
const moduleFederationPlugin = require('./module-federation');
const baseconfig = require('./webpack.config._');
const { merge } = require('webpack-merge');

/**
 * @type {import('webpack').Configuration}
 **/
const webpackConfig = env => ({
  entry: path.resolve(__dirname, '../src/client/index'),
  mode: 'production',
  output: {
    publicPath: '/',
    chunkFilename: '[name].[contenthash].js',
    filename: 'main.[contenthash].js',
  },
  resolve: {
    fallback: {
      stream: require.resolve('stream-browserify'),
    },
  },
  plugins: [moduleFederationPlugin(env).client],
});

module.exports = env => merge(baseconfig(env), webpackConfig(env));
