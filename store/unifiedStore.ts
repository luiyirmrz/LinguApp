/**
 * UNIFIED STATE MANAGEMENT ARCHITECTURE
 * 
 * This file consolidates all state management patterns into a single, consistent approach:
 * - Eliminates mixing of Context API, Zustand, and custom hooks
 * - Provides clear separation of concerns
 * - Uses consistent TypeScript types
 * - Implements proper error handling and loading states
 * - Supports real-time updates and offline functionality
 */

import { create } from 'zustand';
import { devtools, persist, subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
// import { shallow } from 'zustand/shallow';
import { User, Language, Theme, LearningGoal, PracticeMode } from '@/types';
import { handleAuthError, handleDatabaseError } from '@/services/monitoring/centralizedErrorService';

// ============================================================================
// CORE STATE INTERFACES
// ============================================================================

export interface AuthState {
  // User data
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Authentication methods
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithGitHub: () => Promise<void>;
  signInWithApple: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  
  // User management
  updateUser: (updates: Partial<User>) => Promise<void>;
  clearError: () => void;
}

export interface LanguageState {
  // Language settings
  mainLanguage: Language | null; // UI language
  targetLanguage: Language | null; // Language being learned
  availableLanguages: Language[];
  
  // Language management
  setMainLanguage: (language: Language) => void;
  setTargetLanguage: (language: Language) => void;
  addLanguage: (language: Language) => void;
  removeLanguage: (languageId: string) => void;
}

export interface LearningState {
  // Current learning session
  currentLesson: string | null;
  currentExercise: string | null;
  isLessonActive: boolean;
  
  // Progress tracking
  progress: {
    lessonsCompleted: number;
    totalLessons: number;
    averageScore: number;
    timeSpent: number; // minutes
    lastStudyDate?: string;
    currentStreak: number;
    longestStreak: number;
  };
  
  // Learning preferences
  preferences: {
    dailyCommitment: number; // minutes
    weeklyGoal: number; // XP target
    learningGoals: LearningGoal[];
    preferredModes: PracticeMode[];
    studyDays: string[];
    reminderTime: string;
    immersionMode: boolean;
  };
  
  // Learning methods
  startLesson: (lessonId: string) => void;
  completeLesson: (lessonId: string, score: number) => void;
  updateProgress: (updates: Partial<LearningState['progress']>) => void;
  updatePreferences: (updates: Partial<LearningState['preferences']>) => void;
}

export interface GamificationState {
  // Points and levels
  points: number;
  level: number;
  experience: number;
  gems: number;
  hearts: number;
  
  // Achievements and rewards
  achievements: string[]; // Achievement IDs
  unlockedRewards: string[]; // Reward IDs
  
  // Gamification methods
  addPoints: (points: number) => Promise<void>;
  addGems: (gems: number) => Promise<void>;
  useHearts: (amount: number) => Promise<boolean>;
  spendGems: (amount: number) => Promise<boolean>;
  unlockAchievement: (achievementId: string) => void;
  updateStreak: () => Promise<void>;
}

export interface UIState {
  // Theme and appearance
  theme: Theme;
  isDarkMode: boolean;
  
  // Loading and error states
  isLoading: boolean;
  globalError: string | null;
  
  // Navigation and modals
  activeTab: string;
  isModalOpen: boolean;
  sidebarOpen: boolean;
  
  // Notifications
  notifications: Array<{
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
    timestamp: string;
    read: boolean;
  }>;
  
  // UI methods
  setTheme: (theme: Theme) => void;
  setLoading: (loading: boolean) => void;
  setGlobalError: (error: string | null) => void;
  setActiveTab: (tab: string) => void;
  setModalOpen: (open: boolean) => void;
  setSidebarOpen: (open: boolean) => void;
  addNotification: (notification: Omit<UIState['notifications'][0], 'id' | 'timestamp' | 'read'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}

// ============================================================================
// UNIFIED STORE TYPE
// ============================================================================

export type UnifiedStore = AuthState & LanguageState & LearningState & GamificationState & UIState;

// ============================================================================
// STORE IMPLEMENTATION
// ============================================================================

export const useUnifiedStore = create<UnifiedStore>()(
  devtools(
    persist(
      subscribeWithSelector(
        immer((set, get) => ({
          // ========================================================================
          // AUTH STATE
          // ========================================================================
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
          
          signIn: async (email: string, password: string) => {
            set((state) => {
              state.isLoading = true;
              state.error = null;
            });
            
            try {
              // Import auth service dynamically to avoid circular dependencies
              const { enhancedAuthService } = await import('@/services/auth/enhancedAuthService');
        const AuthService = enhancedAuthService;
              const user = await AuthService.signInWithEmail(email, password);
              
              set((state) => {
                state.user = user?.user || null;
                state.isAuthenticated = true;
                state.isLoading = false;
              });
            } catch (error: any) {
              // Use centralized error handling
              const { userMessage, shouldRetry } = await handleAuthError(error, { email });
              
              set((state) => {
                state.error = userMessage;
                state.isLoading = false;
              });
              
              // If retry is recommended, we could implement retry logic here
              if (shouldRetry) {
                // Could implement retry mechanism
                console.log('Auth error is retryable');
              }
              
              throw error;
            }
          },
          
          signUp: async (name: string, email: string, password: string) => {
            set((state) => {
              state.isLoading = true;
              state.error = null;
            });
            
            try {
              const { enhancedAuthService } = await import('@/services/auth/enhancedAuthService');
        const AuthService = enhancedAuthService;
              const user = await AuthService.signUpWithEmail(name, email, password);
              
              set((state) => {
                state.user = user?.user || null;
                state.isAuthenticated = true;
                state.isLoading = false;
              });
            } catch (error: any) {
              // Use centralized error handling
              const { userMessage, shouldRetry } = await handleAuthError(error, { email });
              
              set((state) => {
                state.error = userMessage;
                state.isLoading = false;
              });
              
              if (shouldRetry) {
                console.log('Auth error is retryable');
              }
              
              throw error;
            }
          },
          
          signOut: async () => {
            set((state) => {
              state.isLoading = true;
              state.error = null;
            });
            
            try {
              const { enhancedAuthService } = await import('@/services/auth/enhancedAuthService');
        const AuthService = enhancedAuthService;
              await AuthService.signOut();
              
              set((state) => {
                state.user = null;
                state.isAuthenticated = false;
                state.isLoading = false;
              });
            } catch (error: any) {
              set((state) => {
                state.error = error.message;
                state.isLoading = false;
              });
              throw error;
            }
          },
          
          signInWithGoogle: async () => {
            set((state) => {
              state.isLoading = true;
              state.error = null;
            });
            
            try {
              const { enhancedAuthService } = await import('@/services/auth/enhancedAuthService');
        const AuthService = enhancedAuthService;
              const user = await AuthService.signInWithGoogle();
              
              set((state) => {
                state.user = user?.user || null;
                state.isAuthenticated = true;
                state.isLoading = false;
              });
            } catch (error: any) {
              set((state) => {
                state.error = error.message;
                state.isLoading = false;
              });
              throw error;
            }
          },
          
          signInWithGitHub: async () => {
            set((state) => {
              state.isLoading = true;
              state.error = null;
            });
            
            try {
              const { enhancedAuthService } = await import('@/services/auth/enhancedAuthService');
        const AuthService = enhancedAuthService;
              const user = await AuthService.signInWithGitHub();
              
              set((state) => {
                state.user = user?.user || null;
                state.isAuthenticated = true;
                state.isLoading = false;
              });
            } catch (error: any) {
              set((state) => {
                state.error = error.message;
                state.isLoading = false;
              });
              throw error;
            }
          },
          
          signInWithApple: async () => {
            set((state) => {
              state.isLoading = true;
              state.error = null;
            });
            
            try {
              const { enhancedAuthService } = await import('@/services/auth/enhancedAuthService');
        const AuthService = enhancedAuthService;
              const user = await AuthService.signInWithApple();
              
              set((state) => {
                state.user = user?.user || null;
                state.isAuthenticated = true;
                state.isLoading = false;
              });
            } catch (error: any) {
              set((state) => {
                state.error = error.message;
                state.isLoading = false;
              });
              throw error;
            }
          },
          
          resetPassword: async (email: string) => {
            set((state) => {
              state.error = null;
            });
            
            try {
              const { enhancedAuthService } = await import('@/services/auth/enhancedAuthService');
        const AuthService = enhancedAuthService;
              await AuthService.resetPassword(email);
            } catch (error: any) {
              set((state) => {
                state.error = error.message;
              });
              throw error;
            }
          },
          
          updateUser: async (updates: Partial<User>) => {
            const { user } = get();
            if (!user) {
              throw new Error('No user logged in');
            }
            
            try {
              const { firestoreService } = await import('@/services/database/firestoreService');
              await firestoreService.updateUser(user.id, updates);
              
              set((state) => {
                if (state.user) {
                  state.user = { ...state.user, ...updates };
                }
              });
            } catch (error: any) {
              // Use centralized error handling for database operations
              const { userMessage, shouldUseFallback } = await handleDatabaseError(error, 'write', {
                table: 'users',
                retryCount: 0,
              });
              
              set((state) => {
                state.error = userMessage;
              });
              
              // If fallback is recommended, we could implement fallback logic here
              if (shouldUseFallback) {
                console.log('Database error suggests using fallback storage');
              }
              
              throw error;
            }
          },
          
          clearError: () => {
            set((state) => {
              state.error = null;
            });
          },
          
          // ========================================================================
          // LANGUAGE STATE
          // ========================================================================
          mainLanguage: null,
          targetLanguage: null,
          availableLanguages: [],
          
          setMainLanguage: (language: Language) => {
            set((state) => {
              state.mainLanguage = language;
            });
          },
          
          setTargetLanguage: (language: Language) => {
            set((state) => {
              state.targetLanguage = language;
            });
          },
          
          addLanguage: (language: Language) => {
            set((state) => {
              if (!state.availableLanguages.find(l => l.id === language.id)) {
                state.availableLanguages.push(language);
              }
            });
          },
          
          removeLanguage: (languageId: string) => {
            set((state) => {
              state.availableLanguages = state.availableLanguages.filter(l => l.id !== languageId);
            });
          },
          
          // ========================================================================
          // LEARNING STATE
          // ========================================================================
          currentLesson: null,
          currentExercise: null,
          isLessonActive: false,
          
          progress: {
            lessonsCompleted: 0,
            totalLessons: 0,
            averageScore: 0,
            timeSpent: 0,
            currentStreak: 0,
            longestStreak: 0,
          },
          
          preferences: {
            dailyCommitment: 15,
            weeklyGoal: 1000,
            learningGoals: [],
            preferredModes: [],
            studyDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
            reminderTime: '19:00',
            immersionMode: false,
          },
          
          startLesson: (lessonId: string) => {
            set((state) => {
              state.currentLesson = lessonId;
              state.isLessonActive = true;
            });
          },
          
          completeLesson: (lessonId: string, score: number) => {
            set((state) => {
              state.currentLesson = null;
              state.isLessonActive = false;
              state.progress.lessonsCompleted += 1;
              state.progress.averageScore = 
                (state.progress.averageScore * (state.progress.lessonsCompleted - 1) + score) / 
                state.progress.lessonsCompleted;
            });
          },
          
          updateProgress: (updates) => {
            set((state) => {
              state.progress = { ...state.progress, ...updates };
            });
          },
          
          updatePreferences: (updates) => {
            set((state) => {
              state.preferences = { ...state.preferences, ...updates };
            });
          },
          
          // ========================================================================
          // GAMIFICATION STATE
          // ========================================================================
          points: 0,
          level: 1,
          experience: 0,
          gems: 0,
          hearts: 5,
          achievements: [],
          unlockedRewards: [],
          
          addPoints: async (points: number) => {
            const { user } = get();
            if (!user) return;
            
            try {
              const { firestoreService } = await import('@/services/database/firestoreService');
              await firestoreService.updateUser(user.id, {
                points: (user.points || 0) + points,
              });
              
              set((state) => {
                state.points += points;
              });
            } catch (error) {
              console.error('Error adding points:', error);
            }
          },
          
          addGems: async (gems: number) => {
            const { user } = get();
            if (!user) return;
            
            try {
              const { firestoreService } = await import('@/services/database/firestoreService');
              await firestoreService.updateUser(user.id, {
                gems: (user.gems || 0) + gems,
              });
              
              set((state) => {
                state.gems += gems;
              });
            } catch (error) {
              console.error('Error adding gems:', error);
            }
          },
          
          useHearts: async (amount: number) => {
            const { hearts } = get();
            const newHearts = Math.max(0, hearts - amount);
            const canContinue = newHearts > 0;
            
            set((state) => {
              state.hearts = newHearts;
            });
            
            return canContinue;
          },
          
          spendGems: async (amount: number) => {
            const { gems } = get();
            if (gems < amount) return false;
            
            set((state) => {
              state.gems -= amount;
            });
            
            return true;
          },
          
          unlockAchievement: (achievementId: string) => {
            set((state) => {
              if (!state.achievements.includes(achievementId)) {
                state.achievements.push(achievementId);
              }
            });
          },
          
          updateStreak: async () => {
            const { user } = get();
            if (!user) return;
            
            const today = new Date().toDateString();
            const lastPractice = user.lastPracticeDate ? new Date(user.lastPracticeDate).toDateString() : null;
            
            if (lastPractice !== today) {
              const yesterday = new Date();
              yesterday.setDate(yesterday.getDate() - 1);
              
              const newStreak = lastPractice === yesterday.toDateString() ? 
                (user.streak || 0) + 1 : 1;
              const newLongestStreak = Math.max(user.longestStreak || 0, newStreak);
              
              try {
                const { firestoreService } = await import('@/services/database/firestoreService');
                await firestoreService.updateStreak(user.id, newStreak);
                
                set((state) => {
                  state.progress.currentStreak = newStreak;
                  state.progress.longestStreak = newLongestStreak;
                });
              } catch (error) {
                console.error('Error updating streak:', error);
              }
            }
          },
          
          // ========================================================================
          // UI STATE
          // ========================================================================
          theme: 'system',
          isDarkMode: false,
          globalError: null,
          activeTab: 'home',
          isModalOpen: false,
          sidebarOpen: false,
          notifications: [],
          
          setTheme: (theme: Theme) => {
            set((state) => {
              state.theme = theme;
            });
          },
          
          setLoading: (loading: boolean) => {
            set((state) => {
              state.isLoading = loading;
            });
          },
          
          setGlobalError: (error: string | null) => {
            set((state) => {
              state.globalError = error;
            });
          },
          
          setActiveTab: (tab: string) => {
            set((state) => {
              state.activeTab = tab;
            });
          },
          
          setModalOpen: (open: boolean) => {
            set((state) => {
              state.isModalOpen = open;
            });
          },
          
          setSidebarOpen: (open: boolean) => {
            set((state) => {
              state.sidebarOpen = open;
            });
          },
          
          addNotification: (notification) => {
            set((state) => {
              state.notifications.push({
                ...notification,
                id: Date.now().toString(),
                timestamp: new Date().toISOString(),
                read: false,
              });
            });
          },
          
          removeNotification: (id: string) => {
            set((state) => {
              state.notifications = state.notifications.filter(n => n.id !== id);
            });
          },
          
          clearNotifications: () => {
            set((state) => {
              state.notifications = [];
            });
          },
        })),
      ),
      {
        name: 'linguapp-unified-store',
        partialize: (state) => ({
          // Only persist essential data
          user: state.user,
          mainLanguage: state.mainLanguage,
          targetLanguage: state.targetLanguage,
          progress: state.progress,
          preferences: state.preferences,
          points: state.points,
          level: state.level,
          gems: state.gems,
          hearts: state.hearts,
          theme: state.theme,
        }),
      },
    ),
    {
      name: 'linguapp-unified-store',
    },
  ),
);

// ============================================================================
// SELECTOR HOOKS FOR BETTER PERFORMANCE
// ============================================================================

// Auth selectors - simplified to prevent infinite loops
export const useAuth = () => useUnifiedStore((state) => ({
  user: state.user,
  isAuthenticated: state.isAuthenticated,
  isLoading: state.isLoading,
  error: state.error,
  signIn: state.signIn,
  signUp: state.signUp,
  signOut: state.signOut,
  signInWithGoogle: state.signInWithGoogle,
  signInWithGitHub: state.signInWithGitHub,
  signInWithApple: state.signInWithApple,
  resetPassword: state.resetPassword,
  updateUser: state.updateUser,
  clearError: state.clearError,
}));

// Language selectors - simplified to prevent infinite loops
export const useLanguage = () => useUnifiedStore((state) => ({
  mainLanguage: state.mainLanguage,
  targetLanguage: state.targetLanguage,
  availableLanguages: state.availableLanguages,
  setMainLanguage: state.setMainLanguage,
  setTargetLanguage: state.setTargetLanguage,
  addLanguage: state.addLanguage,
  removeLanguage: state.removeLanguage,
}));

// Learning selectors
export const useLearning = () => useUnifiedStore((state) => ({
  currentLesson: state.currentLesson,
  currentExercise: state.currentExercise,
  isLessonActive: state.isLessonActive,
  progress: state.progress,
  preferences: state.preferences,
  startLesson: state.startLesson,
  completeLesson: state.completeLesson,
  updateProgress: state.updateProgress,
  updatePreferences: state.updatePreferences,
}));

// Gamification selectors
export const useGamification = () => useUnifiedStore((state) => ({
  points: state.points,
  level: state.level,
  experience: state.experience,
  gems: state.gems,
  hearts: state.hearts,
  achievements: state.achievements,
  unlockedRewards: state.unlockedRewards,
  addPoints: state.addPoints,
  addGems: state.addGems,
  useHearts: state.useHearts,
  spendGems: state.spendGems,
  unlockAchievement: state.unlockAchievement,
  updateStreak: state.updateStreak,
}));

// UI selectors
export const useUI = () => useUnifiedStore((state) => ({
  theme: state.theme,
  isDarkMode: state.isDarkMode,
  isLoading: state.isLoading,
  globalError: state.globalError,
  activeTab: state.activeTab,
  isModalOpen: state.isModalOpen,
  sidebarOpen: state.sidebarOpen,
  notifications: state.notifications,
  setTheme: state.setTheme,
  setLoading: state.setLoading,
  setGlobalError: state.setGlobalError,
  setActiveTab: state.setActiveTab,
  setModalOpen: state.setModalOpen,
  setSidebarOpen: state.setSidebarOpen,
  addNotification: state.addNotification,
  removeNotification: state.removeNotification,
  clearNotifications: state.clearNotifications,
}));

// ============================================================================
// HELPER HOOKS FOR COMMON USE CASES
// ============================================================================

// Authentication status - simplified to prevent infinite loops
export const useAuthStatus = () => {
  return useUnifiedStore((state) => ({
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
  }));
};

// User profile - optimized to prevent infinite loops
export const useUserProfile = () => {
  return useUnifiedStore((state) => state.user);
};

// User languages - simplified to prevent infinite loops
export const useUserLanguages = () => {
  return useUnifiedStore((state) => ({
    mainLanguage: state.mainLanguage,
    targetLanguage: state.targetLanguage,
  }));
};

// Learning progress
export const useLearningProgress = () => {
  const { progress } = useLearning();
  return progress;
};

// Game state
export const useGameState = () => {
  // Mock implementation for now
  return { points: 0, level: 1, gems: 0, hearts: 5, achievements: [] };
};

// UI theme
export const useTheme = () => {
  const { theme, setTheme } = useUI();
  return { theme, setTheme };
};

// Notifications
export const useNotifications = () => {
  const { notifications, addNotification, removeNotification, clearNotifications } = useUI();
  return { notifications, addNotification, removeNotification, clearNotifications };
};
