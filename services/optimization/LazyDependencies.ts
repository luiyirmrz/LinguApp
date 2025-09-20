// Simple lazy dependencies service
export const lazyLoadAudio = async () => {
  return await import('expo-av');
};

export const lazyLoadHaptics = async () => {
  return await import('expo-haptics');
};

export const lazyLoadLinearGradient = async () => {
  return await import('expo-linear-gradient');
};

export const lazyLoadSafeArea = async () => {
  return await import('react-native-safe-area-context');
};

export const lazyLoadLucideIcons = async () => {
  return await import('@expo/vector-icons');
};

export const lazyLoadLottie = async () => {
  return await import('lottie-react-native');
};

export const lazyLoadSpeech = async () => {
  return await import('expo-speech');
};

export const preloadCriticalDependencies = async () => {
  console.debug('Preloading critical dependencies...');
};
