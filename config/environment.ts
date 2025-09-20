/**
 * Environment Configuration
 * Centralized configuration management for different environments
 */

export interface EnvironmentConfig {
  // API Configuration
  apiBaseUrl: string;
  apiTimeout: number;
  
  // Feature Flags
  enableAnalytics: boolean;
  enableCrashReporting: boolean;
  enablePushNotifications: boolean;
  enableAdvancedAnalytics: boolean;
  enableABTesting: boolean;
  enablePredictiveAnalytics: boolean;
  enableSocialFeatures: boolean;
  enableGamification: boolean;
  enableElevenLabs: boolean;
  enableTesting: boolean;
  
  // Development Settings
  enableDebugMode: boolean;
  enableMockData: boolean;
  enableTestMode: boolean;
  
  // External Services
  firebaseConfig: {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
  };
  
  // ElevenLabs Configuration
  elevenLabsConfig: {
    apiKey: string;
    baseUrl: string;
    enableTTS: boolean;
    enableSTT: boolean;
    enableVoiceCloning: boolean;
    defaultModel: string;
    maxConcurrentRequests: number;
  };
  
  // Testing Configuration
  testingConfig: {
    enableUnitTests: boolean;
    enableIntegrationTests: boolean;
    enableE2ETests: boolean;
    enablePerformanceTests: boolean;
    enableAccessibilityTests: boolean;
    testTimeout: number;
    coverageThreshold: number;
  };
  
  // Analytics Configuration
  analyticsConfig: {
    enableRealTimeTracking: boolean;
    enablePredictiveInsights: boolean;
    enableABTesting: boolean;
    enableCohortAnalysis: boolean;
    enableRetentionAnalysis: boolean;
    enableEngagementMetrics: boolean;
    dataRetentionDays: number;
  };
  
  // Social Features Configuration
  socialConfig: {
    enableFriendSystem: boolean;
    enableLeaderboards: boolean;
    enableChallenges: boolean;
    enableGroups: boolean;
    enableMessaging: boolean;
    maxFriendsPerUser: number;
    maxGroupSize: number;
  };
  
  // Gamification Configuration
  gamificationConfig: {
    enableXP: boolean;
    enableLevels: boolean;
    enableAchievements: boolean;
    enableStreaks: boolean;
    enableLeagues: boolean;
    enableDailyChallenges: boolean;
    enableRewards: boolean;
    maxLevel: number;
    xpMultiplier: number;
  };
}

// Development environment configuration
const developmentConfig: EnvironmentConfig = {
  apiBaseUrl: process.env.EXPO_PUBLIC_RORK_API_BASE_URL || 'http://localhost:3000',
  apiTimeout: 10000,
  enableAnalytics: true,
  enableCrashReporting: false,
  enablePushNotifications: true,
  enableAdvancedAnalytics: true,
  enableABTesting: true,
  enablePredictiveAnalytics: true,
  enableSocialFeatures: true,
  enableGamification: true,
  enableElevenLabs: true,
  enableTesting: true,
  enableDebugMode: true,
  enableMockData: true,
  enableTestMode: true,
  firebaseConfig: {
    apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || '',
    authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
    projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || '',
    storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
    messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
    appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || '',
  },
  elevenLabsConfig: {
    apiKey: process.env.EXPO_PUBLIC_ELEVENLABS_API_KEY || '',
    baseUrl: 'https://api.elevenlabs.io/v1',
    enableTTS: true,
    enableSTT: true,
    enableVoiceCloning: false,
    defaultModel: 'eleven_multilingual_v2',
    maxConcurrentRequests: 5,
  },
  testingConfig: {
    enableUnitTests: true,
    enableIntegrationTests: true,
    enableE2ETests: true,
    enablePerformanceTests: false,
    enableAccessibilityTests: true,
    testTimeout: 30000,
    coverageThreshold: 80,
  },
  analyticsConfig: {
    enableRealTimeTracking: true,
    enablePredictiveInsights: true,
    enableABTesting: true,
    enableCohortAnalysis: true,
    enableRetentionAnalysis: true,
    enableEngagementMetrics: true,
    dataRetentionDays: 365,
  },
  socialConfig: {
    enableFriendSystem: true,
    enableLeaderboards: true,
    enableChallenges: true,
    enableGroups: true,
    enableMessaging: false,
    maxFriendsPerUser: 1000,
    maxGroupSize: 50,
  },
  gamificationConfig: {
    enableXP: true,
    enableLevels: true,
    enableAchievements: true,
    enableStreaks: true,
    enableLeagues: true,
    enableDailyChallenges: true,
    enableRewards: true,
    maxLevel: 100,
    xpMultiplier: 1.2,
  },
};

// Production environment configuration
const productionConfig: EnvironmentConfig = {
  apiBaseUrl: process.env.EXPO_PUBLIC_RORK_API_BASE_URL || 'https://api.linguapp.com',
  apiTimeout: 15000,
  enableAnalytics: true,
  enableCrashReporting: true,
  enablePushNotifications: true,
  enableAdvancedAnalytics: true,
  enableABTesting: true,
  enablePredictiveAnalytics: true,
  enableSocialFeatures: true,
  enableGamification: true,
  enableElevenLabs: true,
  enableTesting: false,
  enableDebugMode: false,
  enableMockData: false,
  enableTestMode: false,
  firebaseConfig: {
    apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || '',
    authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
    projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || '',
    storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
    messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
    appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || '',
  },
  elevenLabsConfig: {
    apiKey: process.env.EXPO_PUBLIC_ELEVENLABS_API_KEY || '',
    baseUrl: 'https://api.elevenlabs.io/v1',
    enableTTS: true,
    enableSTT: true,
    enableVoiceCloning: false,
    defaultModel: 'eleven_multilingual_v2',
    maxConcurrentRequests: 10,
  },
  testingConfig: {
    enableUnitTests: true,
    enableIntegrationTests: true,
    enableE2ETests: true,
    enablePerformanceTests: true,
    enableAccessibilityTests: true,
    testTimeout: 30000,
    coverageThreshold: 90,
  },
  analyticsConfig: {
    enableRealTimeTracking: true,
    enablePredictiveInsights: true,
    enableABTesting: true,
    enableCohortAnalysis: true,
    enableRetentionAnalysis: true,
    enableEngagementMetrics: true,
    dataRetentionDays: 730,
  },
  socialConfig: {
    enableFriendSystem: true,
    enableLeaderboards: true,
    enableChallenges: true,
    enableGroups: true,
    enableMessaging: true,
    maxFriendsPerUser: 1000,
    maxGroupSize: 100,
  },
  gamificationConfig: {
    enableXP: true,
    enableLevels: true,
    enableAchievements: true,
    enableStreaks: true,
    enableLeagues: true,
    enableDailyChallenges: true,
    enableRewards: true,
    maxLevel: 100,
    xpMultiplier: 1.2,
  },
};

// Get current environment
const getEnvironment = (): 'development' | 'production' => {
  if (__DEV__) {
    return 'development';
  }
  return 'production';
};

// Get configuration for current environment
export const getConfig = (): EnvironmentConfig => {
  const env = getEnvironment();
  return env === 'development' ? developmentConfig : productionConfig;
};

// Export current config
export const config = getConfig();

// Helper functions
export const isDevelopment = (): boolean => __DEV__;
export const isProduction = (): boolean => !__DEV__;

// Feature flag helpers
export const isFeatureEnabled = (feature: keyof EnvironmentConfig): boolean => {
  const config = getConfig();
  return config[feature] as boolean;
};

export const isAnalyticsEnabled = (): boolean => {
  return isFeatureEnabled('enableAnalytics') && isFeatureEnabled('enableAdvancedAnalytics');
};

export const isSocialEnabled = (): boolean => {
  return isFeatureEnabled('enableSocialFeatures');
};

export const isGamificationEnabled = (): boolean => {
  return isFeatureEnabled('enableGamification');
};

export const isElevenLabsEnabled = (): boolean => {
  return isFeatureEnabled('enableElevenLabs');
};

export const isTestingEnabled = (): boolean => {
  return isFeatureEnabled('enableTesting');
};

// Get specific configurations
export const getElevenLabsConfig = () => getConfig().elevenLabsConfig;
export const getTestingConfig = () => getConfig().testingConfig;
export const getAnalyticsConfig = () => getConfig().analyticsConfig;
export const getSocialConfig = () => getConfig().socialConfig;
export const getGamificationConfig = () => getConfig().gamificationConfig;

// Validate required environment variables
export const validateEnvironment = (): void => {
  const requiredVars = [
    'EXPO_PUBLIC_FIREBASE_API_KEY',
    'EXPO_PUBLIC_FIREBASE_PROJECT_ID',
  ];

  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0 && isProduction()) {
    console.warn('Missing required environment variables:', missingVars);
  }
  
  // Validate ElevenLabs configuration
  const elevenLabsConfig = getElevenLabsConfig();
  if (elevenLabsConfig.enableTTS || elevenLabsConfig.enableSTT) {
    if (!elevenLabsConfig.apiKey) {
      console.warn('ElevenLabs API key is required for TTS/STT features');
    }
  }
};

// Initialize environment validation
validateEnvironment();
