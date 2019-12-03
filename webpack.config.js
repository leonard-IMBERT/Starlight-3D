module.exports = {
  entry: {
    src: './src/main.js',
  },
  mode: 'development',
  output: {
    filename: '[name].js',
  },
  resolve: {
    extensions: ['.js'],
  },
  module: {
    rules: [{
      test: /\.glsl$/,
      loader: 'webpack-glsl-loader',
    }, {
      test: /\.worker\.js$/,
      loader: 'worker-loader',
    }],
  },
};
