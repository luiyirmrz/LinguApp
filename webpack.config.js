import createExpoWebpackConfigAsync from '@expo/webpack-config';

export default async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(env, argv);
  
  // Fix for Expo Router history issues
  config.resolve.fallback = {
    ...config.resolve.fallback,
    "crypto": false,
    "stream": false,
    "util": false,
  };

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
