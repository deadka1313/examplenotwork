import { CleanWebpackPlugin } from 'clean-webpack-plugin';
import HtmlWebpackHarddiskPlugin from 'html-webpack-harddisk-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import OptimizeCSSAssetsPlugin from 'optimize-css-assets-webpack-plugin';
import path from 'path';
import webpack from 'webpack';

const nodeEnv = (process.env.NODE_ENV as 'development' | 'production' | 'none') || 'development';
const isProd = nodeEnv === 'production';
const pathList = {
  dist: path.resolve(__dirname, 'www/build'),
  public: path.resolve(__dirname, 'www'),
  src: path.resolve(__dirname, 'src'),
};

const getModePlugins = () => {
  return isProd
    ? [
        new CleanWebpackPlugin({
          dry: false,
          verbose: true,
        }),
        new MiniCssExtractPlugin({
          filename: 'styles.[contenthash:5].min.css',
        }),
        new OptimizeCSSAssetsPlugin(),
      ]
    : [new webpack.HotModuleReplacementPlugin()];
};

const config: webpack.Configuration = {
  mode: nodeEnv,

  entry: {
    app: path.resolve('src/'),
    vendor: ['react', 'react-dom'],
  },

  output: {
    filename: '[name].[fullhash:5].min.js',
    path: pathList.dist,
    publicPath: '/build/',
  },

  stats: {
    colors: true,
    hash: false,
    version: false,
    timings: false,
    assets: false,
    chunks: false,
    modules: false,
    reasons: false,
    children: false,
    source: false,
    errors: false,
    errorDetails: false,
    warnings: false,
    publicPath: false,
  },

  resolve: {
    extensions: ['.es', '.js', '.jsx', '.ts', '.tsx'],
    modules: [pathList.src, path.resolve(__dirname, './node_modules')],
  },

  plugins: [
    new HtmlWebpackPlugin({
      alwaysWriteToDisk: true,
      filename: path.resolve(pathList.public, './index.html'),
      inject: true,
      template: path.resolve(pathList.src, './index.htm'),
    }),
    new HtmlWebpackHarddiskPlugin(),
    ...getModePlugins(),
  ],

  optimization: {
    runtimeChunk: 'single',
    splitChunks: {
      cacheGroups: {
        defaultVendors: {
          test: /[\\/]node_modules[\\/]/,
          priority: -10,
          reuseExistingChunk: true,
        },
      },
    },
  },

  module: {
    rules: [
      {
        test: /\.html$/,
        use: {
          loader: 'file-loader',
          options: { name: '[name].[hash:5].[ext]' },
        },
      },
      {
        test: /\.(es|ts|tsx|js|jsx)?$/,
        exclude: /node_modules|lib/,
        use: {
          loader: 'babel-loader',
          options: { cacheDirectory: true },
        },
      },
      {
        test: /\.(es|ts|tsx|js|jsx)?$/,
        enforce: 'pre',
        use: ['source-map-loader'],
      },
      {
        test: /\.css$/,
        include: /node_modules/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.less$/,
        use: [
          isProd ? MiniCssExtractPlugin.loader : 'style-loader',
          'css-loader',
          {
            loader: 'less-loader',
            options: {
              lessOptions: {
                javascriptEnabled: true,
              },
            },
          },
        ],
      },
      {
        test: /\.(ttf|eot|woff|woff2)(\?[a-z0-9]+)?$/,
        use: {
          loader: 'file-loader',
          options: { name: 'fonts/[name].[hash:5].[ext]' },
        },
      },
      {
        test: /\.(jpe?g|png|gif)$/i,
        use: ['url-loader?limit=5000&name=images/build/[name].[ext]'],
      },
      {
        test: /.*\.svg$/i,
        use: [
          '@svgr/webpack',
          {
            loader: 'file-loader',
            options: { name: 'img/[name].[hash:5].[ext]' },
          },
        ],
      },
    ],
  },

  devServer: isProd
    ? {}
    : {
        contentBase: pathList.public,
        disableHostCheck: true,
        historyApiFallback: true,
        host: '0.0.0.0',
        hot: true,
        port: 8000,
      },

  devtool: isProd ? false : 'eval',
};

export default config;
