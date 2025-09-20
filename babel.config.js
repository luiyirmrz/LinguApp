export default function (api) {
  api.cache(true);
  return {
    presets: [
      ['babel-preset-expo', {
        unstable_transformImportMeta: true
      }]
    ],
    plugins: [
      'react-native-worklets/plugin'
    ],
  };
}
