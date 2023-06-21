const path = require('path');
const webpack = require('webpack');
const CopyPlugin = require('copy-webpack-plugin');

/**
 * @type {import('webpack').Configuration}
 **/
const webpackConfig = {
  entry: path.resolve(__dirname, '../src/template-builder'),
  mode: 'production',
  target: 'node',
  output: {
    path: path.resolve(__dirname, '../dist'),
    filename: 'template-builder.js',
    libraryTarget: 'commonjs2',
  },
  externalsType: 'node-commonjs',
  resolve: {
    extensions: ['.ts', '.js', '.json'],
    alias: {
      src: path.resolve(__dirname, '../src/'),
    },
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
      },
    ],
  },
  plugins: [
    new webpack.BannerPlugin({
      banner: '#!/usr/bin/env node',
      raw: true,
    }),
    new CopyPlugin({
      patterns: [
        {
          from: 'template',
          to: 'template',
        },
      ],
    }),
  ],
};

module.exports = webpackConfig;
