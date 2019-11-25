module.exports = {
  entry: {
    src: './src/main.js',
  },
  mode: 'development',
  output: {
    filename: 'src.js',
  },
  resolve: {
    extensions: ['.js'],
  },
  module: {
    rules: [{
      test: /\.glsl$/,
      loader: 'webpack-glsl-loader',
    }],
  },
};
