/**
 * Webpack Configuration for MoMech
 * Development and production build configuration
 */

const path = require('path');

module.exports = (env, argv) => {
  const isDevelopment = argv.mode === 'development';

  return {
    entry: {
      main: './src/app.js'
    },
    
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: isDevelopment ? '[name].js' : '[name].[contenthash].js',
      clean: true,
      publicPath: '/dist/'
    },

    mode: isDevelopment ? 'development' : 'production',
    
    devtool: isDevelopment ? 'eval-source-map' : 'source-map',

    resolve: {
      extensions: ['.js', '.json'],
      alias: {
        '@': path.resolve(__dirname, 'src'),
        '@components': path.resolve(__dirname, 'src/components'),
        '@services': path.resolve(__dirname, 'src/services'),
        '@utils': path.resolve(__dirname, 'src/utils'),
        '@config': path.resolve(__dirname, 'src/config')
      }
    },

    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: [
                ['@babel/preset-env', {
                  targets: {
                    browsers: ['> 1%', 'last 2 versions', 'not ie <= 8']
                  },
                  useBuiltIns: 'usage',
                  corejs: 3
                }]
              ],
              plugins: [
                '@babel/plugin-proposal-class-properties',
                '@babel/plugin-proposal-object-rest-spread'
              ]
            }
          }
        },
        {
          test: /\.css$/,
          use: [
            'style-loader',
            'css-loader',
            'postcss-loader'
          ]
        },
        {
          test: /\.(png|jpg|jpeg|gif|svg)$/,
          type: 'asset/resource',
          generator: {
            filename: 'images/[name].[hash][ext]'
          }
        },
        {
          test: /\.(woff|woff2|eot|ttf|otf)$/,
          type: 'asset/resource',
          generator: {
            filename: 'fonts/[name].[hash][ext]'
          }
        }
      ]
    },

    plugins: [
      // Add plugins as needed
    ],

    optimization: {
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all'
          }
        }
      },
      ...(isDevelopment ? {} : {
        minimize: true,
        sideEffects: false
      })
    },

    devServer: {
      contentBase: path.join(__dirname),
      compress: true,
      port: 3000,
      hot: true,
      open: true,
      historyApiFallback: {
        rewrites: [
          { from: /^\/api\//, to: function(context) {
            return context.parsedUrl.pathname;
          }},
          { from: /./, to: '/index.html' }
        ]
      },
      proxy: {
        '/api': {
          target: 'http://localhost:3001',
          changeOrigin: true,
          secure: false
        }
      }
    },

    performance: {
      maxEntrypointSize: 500000,
      maxAssetSize: 500000,
      hints: isDevelopment ? false : 'warning'
    }
  };
};