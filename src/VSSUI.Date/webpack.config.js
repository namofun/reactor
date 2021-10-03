const path = require('path');
const NODE_ENV = process.env.NODE_ENV;
const isProd = NODE_ENV === 'production';
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const nodeExternals = require('webpack-node-externals');

module.exports = {
  mode: isProd ? 'production' : 'development',
  entry: isProd ? './src/index.ts' : './src/app.tsx',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, './dist'),
    // libraryTarget: isProd ? 'commonjs2' : undefined,
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.css', '.js']
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: "ts-loader"
      },
      {
        test: /\.scss$/,
        use: ["style-loader", "css-loader", "azure-devops-ui/buildScripts/css-variables-loader", "sass-loader"]
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      },
    ]
  },
  devServer: {
    static: './dist'
  },
  externals: isProd ? [nodeExternals()] : [],
  plugins: isProd ? [
    new CleanWebpackPlugin()
  ] : [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      template: 'public/index.html'
    }),
  ],
};