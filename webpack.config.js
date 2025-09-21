import createExpoWebpackConfigAsync from '@expo/webpack-config';
import path from 'path';

export default async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(env, argv);
  
  // Fix for Expo Router history issues
  config.resolve.fallback = {
    ...config.resolve.fallback,
    "crypto": false,
    "stream": false,
    "util": false,
  };

  // Add web-specific optimizations
  config.optimization = {
    ...config.optimization,
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
        },
      },
    },
  };

  // Add CSS handling for web styles
  config.module.rules.push({
    test: /\.css$/,
    use: ['style-loader', 'css-loader'],
  });

  // Copy web-styles.css to public directory
  const CopyWebpackPlugin = require('copy-webpack-plugin');
  config.plugins.push(
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, 'web-styles.css'),
          to: path.resolve(__dirname, 'dist/web-styles.css'),
        },
        {
          from: path.resolve(__dirname, 'public'),
          to: path.resolve(__dirname, 'dist'),
        },
      ],
    })
  );

  // Add security headers
  if (config.devServer) {
    config.devServer.headers = {
      ...config.devServer.headers,
      'Cross-Origin-Embedder-Policy': 'unsafe-none',
      'Cross-Origin-Opener-Policy': 'unsafe-none',
    };
  }

  return config;
}
