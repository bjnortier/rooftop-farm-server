module.exports = {
  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /(node_modules)/,
        loader: 'babel'
      }
    ]
  },
  entry: {
    dashboard: './src/apps/dashboard.js',
  },
  output: {
    path: 'bundles/',
    filename: "[name].bundle.js",
  },
  devtool: '#source-map', // way faster than inline-source-map during page load
  node: {
    net: 'empty',
    dns: 'empty',
  }
};
