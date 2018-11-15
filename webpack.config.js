const path = require('path');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

const env = process.env.NODE_ENV || 'development';
const isProduction = env === 'production';
const filename = 'browser-module-sandbox';

module.exports = {
  mode: isProduction ? 'production' : 'development',

  devtool: 'eval',

  target: 'web',

  entry: './src/index.js',

  output: {
    path: path.join(__dirname, '/dist/'),
    filename: isProduction ? `${filename}.min.js` : `${filename}.js`,
    library: 'Sandbox',
    libraryTarget: 'umd'
  },

  optimization: {
    minimizer: [
      new UglifyJsPlugin({
        parallel: true
      })
    ]
  },
}
