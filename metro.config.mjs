import { getDefaultConfig } from 'expo/metro-config';

const config = getDefaultConfig(__dirname);

// Fix for missing-asset-registry-path error
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

// Add resolver for missing asset registry
config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];

// Fix asset resolution
config.resolver.assetExts.push(
  'png',
  'jpg',
  'jpeg',
  'gif',
  'webp',
  'svg',
  'ttf',
  'otf',
  'woff',
  'woff2',
  'wasm'
);

// Fix for missing-asset-registry-path
config.transformer.assetRegistryPath = '@react-native/assets-registry/registry';

// Ignore non-existent directories
config.watchFolders = [];
config.resolver.blockList = [
  /.*\/images\/.*/,
];

export default config;
