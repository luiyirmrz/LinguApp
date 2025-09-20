// Authentication Hooks
// Primary authentication hook - use this as the main auth hook
export { UnifiedAuthProvider, useUnifiedAuth, useAuthStatus as useUnifiedAuthStatus, useUserProfile as useUnifiedUserProfile, useUserLanguages as useUnifiedUserLanguages, useSafeAuth as useUnifiedSafeAuth } from './useUnifiedAuth';

// Legacy hooks - removed during consolidation

// Language Learning Hooks
export * from './useLanguage';
export * from './useMultilingualLearning';
export * from './useI18n';

// Gamification Hooks
// Primary gamification hook - use this as the main gamification hook
export { default as useEnhancedGamification } from './useEnhancedGamification';
export * from './useGameState';

// Learning System Hooks
export * from './useDidactic';
export * from './useSpacedRepetition';
export * from './useGreetings';
export * from './usePronunciationFeedback';

// Error Handling and Feedback
export * from './useEnhancedErrorHandling';
