const path = require('path');
const TsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

/**
 * @type {import('webpack').Configuration}
 **/
const webpackConfig = env => ({
  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
    alias: {
      src: path.resolve(__dirname, '../src/'),
    },
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        options: {
          presets: [['@babel/preset-react', { runtime: 'automatic' }], '@babel/preset-typescript'],
        },
      },
      {
        test: /\.js$/,
        enforce: 'pre',
        use: ['source-map-loader'],
      },
      {
        test: /\.(scss|css)?$/,
        oneOf: [
          {
            use: [
              {
                loader: 'style-loader',
              },
              {
                loader: 'css-loader',
                options: {
                  importLoaders: 1,
                  sourceMap: true,
                },
              },
              {
                loader: 'postcss-loader',
                options: {
                  postcssOptions: {
                    plugins: [['autoprefixer', {}]],
                  },
                },
              },
              {
                loader: 'resolve-url-loader',
              },
              {
                loader: 'sass-loader',
                options: {
                  sourceMap: true,
                },
              },
            ],
          },
        ],
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)?$/,
        // use: assetProcessing('fonts'),
        type: 'asset/resource',
        generator: {
          filename: './fonts/[name][ext]',
        },
      },
    ],
  },
  plugins: [new TsCheckerWebpackPlugin()],
});

module.exports = webpackConfig;
