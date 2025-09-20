import { create } from 'zustand';
import { devtools, persist, subscribeWithSelector } from 'zustand/middleware';
// import { immer } from 'zustand/middleware/immer';
import { createAuthSlice, AuthSlice } from './slices/authSlice';
import { createLanguageSlice, LanguageSlice } from './slices/languageSlice';
import { createGameStateSlice, GameStateSlice } from './slices/gameStateSlice';
import { createGamificationSlice, GamificationSlice } from './slices/gamificationSlice';
import { createLearningSlice, LearningSlice } from './slices/learningSlice';
import { createUIStateSlice, UIStateSlice } from './slices/uiStateSlice';

// Combined store type
export type AppStore = AuthSlice &
  LanguageSlice &
  GameStateSlice &
  GamificationSlice &
  LearningSlice &
  UIStateSlice;

// Create the main store
export const useAppStore = create<AppStore>()(
  devtools(
    persist(
      subscribeWithSelector(
        (set, get, api) => ({
          ...createAuthSlice(set, get, api),
          ...createLanguageSlice(set, get, api),
          ...createGameStateSlice(set, get, api),
          ...createGamificationSlice(set, get, api),
          ...createLearningSlice(set, get, api),
          ...createUIStateSlice(set, get, api),
        }),
      ),
      {
        name: 'linguapp-store',
        partialize: (state) => ({
          // Only persist essential data
          user: state.user,
          currentLanguage: state.currentLanguage,
          gameState: state.gameState,
          progress: state.progress,
        }),
      },
    ),
    {
      name: 'linguapp-store',
    },
  ),
);

// Selectors for better performance
export const useAuth = () => useAppStore((state) => ({
  user: state.user,
  isAuthenticated: state.isAuthenticated,
  isLoading: state.isLoading,
  login: state.login,
  logout: state.logout,
  register: state.register,
}));

export const useLanguage = () => useAppStore((state) => ({
  currentLanguage: state.currentLanguage,
  availableLanguages: state.availableLanguages,
  setLanguage: state.setLanguage,
  addLanguage: state.addLanguage,
}));

export const useGameState = () => useAppStore((state) => ({
  gameState: state.gameState,
  updateGameState: state.updateGameState,
  resetGameState: state.resetGameState,
}));

export const useGamification = () => useAppStore((state) => ({
  points: state.points,
  level: state.level,
  achievements: state.achievements,
  addPoints: state.addPoints,
  unlockAchievement: state.unlockAchievement,
}));

export const useLearning = () => useAppStore((state) => ({
  progress: state.progress,
  currentLesson: state.currentLesson,
  updateProgress: state.updateProgress,
  setCurrentLesson: state.setCurrentLesson,
}));

export const useUIState = () => useAppStore((state) => ({
  theme: state.theme,
  isLoading: state.isLoading,
  setTheme: state.setTheme,
  setLoading: state.setLoading,
}));
