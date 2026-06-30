/**
 * Webpack Configuration for MoMech
 * Bundles the frontend SPA for production deployment
 */

const path = require('path');

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';

  return {
    entry: './src/app.js',
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: isProduction ? 'app.[contenthash].js' : 'app.js',
      clean: true,
      module: true,
    },
    experiments: {
      outputModule: true,
    },
    mode: isProduction ? 'production' : 'development',
    devtool: isProduction ? 'source-map' : 'eval-source-map',
    resolve: {
      extensions: ['.js'],
    },
    module: {
      rules: [
        {
          test: /\.css$/,
          type: 'asset/resource',
          generator: {
            filename: 'styles/[name][ext]',
          },
        },
      ],
    },
    performance: {
      hints: isProduction ? 'warning' : false,
    },
  };
};
