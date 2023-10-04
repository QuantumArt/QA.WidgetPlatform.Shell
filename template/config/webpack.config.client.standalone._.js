const path = require('path');
const fs = require('fs');
const _ = require('lodash');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const baseconfig = require('./webpack.config.client._');
const CopyPlugin = require('copy-webpack-plugin');
const { merge } = require('webpack-merge');

class GenerateFilePlugin {
  apply(compiler) {
    const pluginName = GenerateFilePlugin.name;
    const { webpack } = compiler;
    const { Compilation } = webpack;
    const { RawSource } = webpack.sources;

    compiler.hooks.thisCompilation.tap(pluginName, compilation => {
      compilation.hooks.processAssets.tap(
        {
          name: pluginName,
          stage: Compilation.PROCESS_ASSETS_STAGE_SUMMARIZE,
        },
        () => {
          const settingsFolder = path.resolve(__dirname, '../src/app-settings-shell');
          const baseSettings = JSON.parse(
            fs.readFileSync(path.resolve(settingsFolder, 'base-settings.json'), 'utf-8'),
          );
          const clientSettings = JSON.parse(
            fs.readFileSync(path.resolve(settingsFolder, 'client-settings.json'), 'utf-8'),
          );
          compilation.emitAsset(
            'settings.json',
            new RawSource(JSON.stringify(_.merge(baseSettings, clientSettings))),
          );
        },
      );
    });
  }
}

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
      ],
    }),
    new GenerateFilePlugin(),
  ],
});

module.exports = env => merge(baseconfig(env), webpackConfig(env));
