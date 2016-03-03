module.exports = {
  module: {
    loaders: [
      {
        test: /\.js$/,
        include: /(lib|test|node_modules\/trip.core\/lib|node_modules\/trip.dom\/lib)/,
        loader: 'babel',
        query: {
          presets: [
            require.resolve('babel-preset-es2015'),
          ]
        }
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
    crypto: 'empty',
  }
};
