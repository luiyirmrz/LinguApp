/**
 * Jest Test Setup Configuration
 * Configures testing environment, mocks, and global test utilities
 */

import '@testing-library/jest-native/extend-expect';
import 'jest-extended';
// import { server } from './mocks/server'; // Temporarily disabled for SRS tests

// Mock Expo modules
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    canGoBack: jest.fn(() => true),
    canGoForward: jest.fn(() => false),
  }),
  useLocalSearchParams: () => ({}),
  useGlobalSearchParams: () => ({}),
  useSegments: () => [],
  useRootNavigationState: () => ({ key: 'test' }),
  useRootNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
    canGoBack: jest.fn(() => true),
  }),
}));

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  selectionAsync: jest.fn(),
}));

jest.mock('expo-linear-gradient', () => 'LinearGradient');

jest.mock('expo-constants', () => ({
  expoConfig: {
    extra: {
      apiUrl: 'http://localhost:3000',
    },
  },
}));

jest.mock('expo-device', () => ({
  isDevice: true,
  brand: 'test',
  manufacturer: 'test',
  modelName: 'test',
  modelId: 'test',
  designName: 'test',
  productName: 'test',
  deviceYearClass: 2020,
  totalMemory: 4096,
  supportedCpuArchitectures: ['arm64'],
  osName: 'iOS',
  osVersion: '15.0',
  osBuildId: 'test',
  osInternalBuildId: 'test',
  deviceName: 'test',
  deviceType: 1,
}));

jest.mock('expo-notifications', () => ({
  scheduleNotificationAsync: jest.fn(),
  cancelScheduledNotificationAsync: jest.fn(),
  getPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
  requestPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
  addNotificationReceivedListener: jest.fn(),
  addNotificationResponseReceivedListener: jest.fn(),
}));

jest.mock('expo-speech', () => ({
  speak: jest.fn(),
  stop: jest.fn(),
  pause: jest.fn(),
  resume: jest.fn(),
  isSpeakingAsync: jest.fn(() => Promise.resolve(false)),
  getAvailableVoicesAsync: jest.fn(() => Promise.resolve([])),
}));

jest.mock('expo-audio', () => ({
  Audio: {
    Sound: jest.fn().mockImplementation(() => ({
      loadAsync: jest.fn(),
      playAsync: jest.fn(),
      stopAsync: jest.fn(),
      unloadAsync: jest.fn(),
      setStatusAsync: jest.fn(),
      getStatusAsync: jest.fn(() => Promise.resolve({ isLoaded: true, isPlaying: false })),
    })),
    setAudioModeAsync: jest.fn(),
  },
}));

jest.mock('expo-file-system', () => ({
  documentDirectory: '/test/documents/',
  cacheDirectory: '/test/cache/',
  readAsStringAsync: jest.fn(),
  writeAsStringAsync: jest.fn(),
  deleteAsync: jest.fn(),
  moveAsync: jest.fn(),
  copyAsync: jest.fn(),
  makeDirectoryAsync: jest.fn(),
  readDirectoryAsync: jest.fn(),
  getInfoAsync: jest.fn(),
}));

jest.mock('expo-sqlite', () => ({
  openDatabase: jest.fn(() => ({
    transaction: jest.fn(),
    exec: jest.fn(),
    closeAsync: jest.fn(),
  })),
}));

jest.mock('expo-crypto', () => ({
  digestStringAsync: jest.fn(() => Promise.resolve('test-hash')),
  randomUUID: jest.fn(() => 'test-uuid'),
}));

jest.mock('expo-linking', () => ({
  createURL: jest.fn(),
  openURL: jest.fn(),
  canOpenURL: jest.fn(() => Promise.resolve(true)),
  getInitialURL: jest.fn(() => Promise.resolve(null)),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
}));

jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
  getCurrentPositionAsync: jest.fn(() => Promise.resolve({
    coords: { latitude: 0, longitude: 0, altitude: 0, accuracy: 0, altitudeAccuracy: 0, heading: 0, speed: 0 },
    timestamp: Date.now(),
  })),
  watchPositionAsync: jest.fn(),
}));

jest.mock('expo-image-picker', () => ({
  launchImageLibraryAsync: jest.fn(() => Promise.resolve({ canceled: false, assets: [] })),
  launchCameraAsync: jest.fn(() => Promise.resolve({ canceled: false, assets: [] })),
  MediaTypeOptions: { All: 'all', Videos: 'videos', Images: 'images' },
  ImagePickerResult: { Canceled: 'canceled' },
}));

jest.mock('expo-web-browser', () => ({
  openAuthSessionAsync: jest.fn(),
  openBrowserAsync: jest.fn(),
  dismissBrowser: jest.fn(),
}));

jest.mock('expo-auth-session', () => ({
  makeRedirectUri: jest.fn(() => 'test://redirect'),
  useAuthRequest: jest.fn(() => [null, null, jest.fn()]),
  useAutoDiscovery: jest.fn(() => ({})),
}));

jest.mock('expo-font', () => ({
  loadAsync: jest.fn(() => Promise.resolve()),
  isLoaded: jest.fn(() => true),
}));

jest.mock('expo-splash-screen', () => ({
  preventAutoHideAsync: jest.fn(),
  hideAsync: jest.fn(),
  onLayoutRootView: jest.fn(),
}));

jest.mock('expo-status-bar', () => ({
  StatusBar: 'StatusBar',
}));

jest.mock('expo-system-ui', () => ({
  setBackgroundColorAsync: jest.fn(),
  setButtonStyleAsync: jest.fn(),
}));

jest.mock('expo-blur', () => ({
  BlurView: 'BlurView',
}));

jest.mock('expo-image', () => ({
  Image: 'Image',
}));

jest.mock('expo-symbols', () => ({
  Symbol: 'Symbol',
}));

// Mock Firebase
jest.mock('firebase/app', () => ({
  initializeApp: jest.fn(() => ({})),
  getApps: jest.fn(() => []),
  getApp: jest.fn(() => ({})),
}));

jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(() => ({
    currentUser: null,
    onAuthStateChanged: jest.fn(),
    signInWithEmailAndPassword: jest.fn(),
    createUserWithEmailAndPassword: jest.fn(),
    signOut: jest.fn(),
    updateProfile: jest.fn(),
  })),
  signInWithEmailAndPassword: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
  updateProfile: jest.fn(),
  onAuthStateChanged: jest.fn(),
}));

jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(() => ({})),
  collection: jest.fn(),
  doc: jest.fn(),
  getDoc: jest.fn(),
  getDocs: jest.fn(),
  setDoc: jest.fn(),
  updateDoc: jest.fn(),
  addDoc: jest.fn(),
  deleteDoc: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  orderBy: jest.fn(),
  limit: jest.fn(),
  onSnapshot: jest.fn(),
}));

jest.mock('firebase/storage', () => ({
  getStorage: jest.fn(() => ({})),
  ref: jest.fn(),
  uploadBytes: jest.fn(),
  getDownloadURL: jest.fn(),
  deleteObject: jest.fn(),
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve()),
  clear: jest.fn(() => Promise.resolve()),
  getAllKeys: jest.fn(() => Promise.resolve([])),
  multiGet: jest.fn(() => Promise.resolve([])),
  multiSet: jest.fn(() => Promise.resolve()),
  multiRemove: jest.fn(() => Promise.resolve()),
}));

// Mock React Native modules - removed problematic mocks that don't exist in current RN version

jest.mock('react-native/Libraries/LogBox/LogBox', () => ({
  ignoreLogs: jest.fn(),
}));

// Mock react-native-gesture-handler
jest.mock('react-native-gesture-handler', () => {
  const View = require('react-native/Libraries/Components/View/View');
  const Text = require('react-native/Libraries/Text/Text/Text');
  const ScrollView = require('react-native/Libraries/Components/ScrollView/ScrollView');
  const TouchableOpacity = require('react-native/Libraries/Components/Touchable/TouchableOpacity');

  return {
    Swipeable: View,
    DrawerLayout: View,
    State: {},
    ScrollView,
    Slider: View,
    Switch: View,
    TextInput: View,
    ToolbarAndroid: View,
    ViewPagerAndroid: View,
    DrawerLayoutAndroid: View,
    WebView: View,
    NativeViewGestureHandler: View,
    TapGestureHandler: View,
    FlingGestureHandler: View,
    ForceTouchGestureHandler: View,
    LongPressGestureHandler: View,
    PanGestureHandler: View,
    PinchGestureHandler: View,
    RotationGestureHandler: View,
    Directions: {},
    gestureHandlerRootHOC: jest.fn((component) => component),
    TouchableHighlight: TouchableOpacity,
    TouchableNativeFeedback: TouchableOpacity,
    TouchableOpacity,
    TouchableWithoutFeedback: TouchableOpacity,
  };
});

// Mock react-native-safe-area-context
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaProvider: ({ children }: { children: React.ReactNode }) => children,
  SafeAreaView: ({ children }: { children: React.ReactNode }) => children,
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
  useSafeAreaFrame: () => ({ x: 0, y: 0, width: 390, height: 844 }),
}));

// Mock react-native-screens
jest.mock('react-native-screens', () => ({
  enableScreens: jest.fn(),
  Screen: ({ children }: { children: React.ReactNode }) => children,
  ScreenContainer: ({ children }: { children: React.ReactNode }) => children,
  ScreenStack: ({ children }: { children: React.ReactNode }) => children,
  ScreenStackHeaderConfig: () => null,
}));

// Mock react-native-svg
jest.mock('react-native-svg', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    Svg: View,
    Circle: View,
    Ellipse: View,
    G: View,
    Text: View,
    TSpan: View,
    TextPath: View,
    Path: View,
    Polygon: View,
    Polyline: View,
    Line: View,
    Rect: View,
    Use: View,
    Image: View,
    Symbol: View,
    Defs: View,
    LinearGradient: View,
    RadialGradient: View,
    Stop: View,
    ClipPath: View,
    Mask: View,
    Pattern: View,
    Marker: View,
    Title: View,
    Desc: View,
  };
});

// Mock react-native-chart-kit
jest.mock('react-native-chart-kit', () => ({
  LineChart: 'LineChart',
  BarChart: 'BarChart',
  PieChart: 'PieChart',
  ProgressChart: 'ProgressChart',
  ContributionGraph: 'ContributionGraph',
  AbstractChart: 'AbstractChart',
}));

// Mock @expo/vector-icons (replacing lucide-react-native)
jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
  MaterialIcons: 'MaterialIcons',
  MaterialCommunityIcons: 'MaterialCommunityIcons',
  Feather: 'Feather',
  AntDesign: 'AntDesign',
  FontAwesome5: 'FontAwesome5',
  Entypo: 'Entypo',
}));

// Mock the LucideReplacement component
jest.mock('@/components/icons/LucideReplacement', () => ({
  Home: 'Home',
  User: 'User',
  Settings: 'Settings',
  ChevronRight: 'ChevronRight',
  ChevronLeft: 'ChevronLeft',
  Plus: 'Plus',
  Minus: 'Minus',
  X: 'X',
  Check: 'Check',
  AlertCircle: 'AlertCircle',
  Info: 'Info',
  Star: 'Star',
  Heart: 'Heart',
  BookOpen: 'BookOpen',
  Mic: 'Mic',
  Volume2: 'Volume2',
  Play: 'Play',
  Pause: 'Pause',
  SkipBack: 'SkipBack',
  SkipForward: 'SkipForward',
  RotateCcw: 'RotateCcw',
  RotateCw: 'RotateCw',
  Shuffle: 'Shuffle',
  Repeat: 'Repeat',
  VolumeX: 'VolumeX',
  Volume1: 'Volume1',
  Volume: 'Volume',
  Maximize: 'Maximize',
  Minimize: 'Minimize',
  Fullscreen: 'Fullscreen',
  FullscreenExit: 'FullscreenExit',
  Download: 'Download',
  Upload: 'Upload',
  Share: 'Share',
  Copy: 'Copy',
  Edit: 'Edit',
  Trash: 'Trash',
  Search: 'Search',
  Filter: 'Filter',
  SortAsc: 'SortAsc',
  SortDesc: 'SortDesc',
  Calendar: 'Calendar',
  Clock: 'Clock',
  MapPin: 'MapPin',
  Phone: 'Phone',
  Mail: 'Mail',
  MessageCircle: 'MessageCircle',
  MessageSquare: 'MessageSquare',
  Bell: 'Bell',
  Lock: 'Lock',
  Unlock: 'Unlock',
  Eye: 'Eye',
  EyeOff: 'EyeOff',
  Camera: 'Camera',
  Image: 'Image',
  Video: 'Video',
  Music: 'Music',
  File: 'File',
  Folder: 'Folder',
  Database: 'Database',
  Server: 'Server',
  Globe: 'Globe',
  Wifi: 'Wifi',
  WifiOff: 'WifiOff',
  Battery: 'Battery',
  BatteryCharging: 'BatteryCharging',
  Zap: 'Zap',
  ZapOff: 'ZapOff',
  Sun: 'Sun',
  Moon: 'Moon',
  Cloud: 'Cloud',
  CloudRain: 'CloudRain',
  CloudSnow: 'CloudSnow',
  Wind: 'Wind',
  Thermometer: 'Thermometer',
  Umbrella: 'Umbrella',
  Droplets: 'Droplets',
  Snowflake: 'Snowflake',
  CloudLightning: 'CloudLightning',
  CloudFog: 'CloudFog',
  Sunrise: 'Sunrise',
  Sunset: 'Sunset',
}));

// Global test utilities
global.console = {
  ...console,
  // Uncomment to ignore a specific log level
  // log: jest.fn(),
  // debug: jest.fn(),
  // info: jest.fn(),
  // warn: jest.fn(),
  // error: jest.fn(),
};

// Setup MSW - temporarily disabled for SRS tests
// beforeAll(() => server.listen());
// afterEach(() => server.resetHandlers());
// afterAll(() => server.close());

// Global test timeout
jest.setTimeout(10000);

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock window.location
Object.defineProperty(window, 'location', {
  value: {
    href: 'http://localhost:3000',
    origin: 'http://localhost:3000',
    protocol: 'http:',
    host: 'localhost:3000',
    hostname: 'localhost',
    port: '3000',
    pathname: '/',
    search: '',
    hash: '',
  },
  writable: true,
});

// Mock window.navigator
Object.defineProperty(window, 'navigator', {
  value: {
    userAgent: 'jest',
    language: 'en-US',
    languages: ['en-US', 'en'],
    onLine: true,
    geolocation: {
      getCurrentPosition: jest.fn(),
      watchPosition: jest.fn(),
      clearWatch: jest.fn(),
    },
  },
  writable: true,
});

// Mock window.localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

// Mock window.sessionStorage
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock,
  writable: true,
});

// Mock fetch
global.fetch = jest.fn();

// Mock URL.createObjectURL
global.URL.createObjectURL = jest.fn(() => 'mock-url');

// Mock URL.revokeObjectURL
global.URL.revokeObjectURL = jest.fn();

// Mock requestAnimationFrame
global.requestAnimationFrame = jest.fn(callback => setTimeout(callback, 0));

// Mock cancelAnimationFrame
global.cancelAnimationFrame = jest.fn();

// Mock performance
global.performance = {
  now: jest.fn(() => Date.now()),
  mark: jest.fn(),
  measure: jest.fn(),
  getEntriesByType: jest.fn(() => []),
  getEntriesByName: jest.fn(() => []),
  clearMarks: jest.fn(),
  clearMeasures: jest.fn(),
  timeOrigin: Date.now(),
} as any;

// Mock crypto
global.crypto = {
  getRandomValues: jest.fn((arr) => {
    for (let i = 0; i < arr.length; i++) {
      arr[i] = Math.floor(Math.random() * 256);
    }
    return arr;
  }),
  subtle: {
    digest: jest.fn(),
    generateKey: jest.fn(),
    sign: jest.fn(),
    verify: jest.fn(),
    encrypt: jest.fn(),
    decrypt: jest.fn(),
    deriveKey: jest.fn(),
    deriveBits: jest.fn(),
    importKey: jest.fn(),
    exportKey: jest.fn(),
    wrapKey: jest.fn(),
    unwrapKey: jest.fn(),
  },
} as any;
