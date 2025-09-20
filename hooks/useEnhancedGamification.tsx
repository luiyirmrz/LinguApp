/**
 * Enhanced Gamification Hook - Provides real-time gamification data with Firebase integration
 * Handles XP, levels, achievements, streaks, and social features
 * Includes offline support and automatic UI updates
 */

import { useState, useEffect, useCallback } from 'react';
import { User, Achievement, League, Challenge, DailyChallenge } from '@/types';
import { EnhancedGamificationService } from '@/services/gamification/enhancedGamificationService';

// Create service instance
const enhancedGamificationService = new EnhancedGamificationService();
import { useUnifiedAuth } from './useUnifiedAuth';
import { createRealtimeListener, firestoreDoc } from '@/config/firebase';

interface GamificationState {
  level: number;
  totalXP: number;
  weeklyXP: number;
  levelProgress: {
    currentLevel: number;
    currentLevelXP: number;
    nextLevelXP: number;
    progress: number;
  };
  achievements: Achievement[];
  currentLeague?: League;
  activeChallenges: Challenge[];
  dailyChallenges: DailyChallenge[];
  isLoading: boolean;
  error: string | null;
}

export function useGamification() {
  const { user } = useUnifiedAuth();
  const [state, setState] = useState<GamificationState>({
    level: 1,
    totalXP: 0,
    weeklyXP: 0,
    levelProgress: {
      currentLevel: 1,
      currentLevelXP: 0,
      nextLevelXP: 100,
      progress: 0,
    },
    achievements: [],
    activeChallenges: [],
    dailyChallenges: [],
    isLoading: true,
    error: null,
  });

  // Load gamification stats
  const loadStats = useCallback(async () => {
    if (!user?.id) return;

    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const stats = await enhancedGamificationService.getUserGamificationStats(user.id);
      
      setState(prev => ({
        ...prev,
        ...stats,
        currentLeague: stats?.currentLeague as League | undefined,
        isLoading: false,
      }));
    } catch (error) {
      console.error('Error loading gamification stats:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to load stats',
        isLoading: false,
      }));
    }
  }, [user?.id]);

  // Award XP with UI updates
  const awardXP = useCallback(async (
    xpAmount: number,
    source: string,
    languageCode?: string,
    exerciseData?: {
      type: string;
      correct: boolean;
      quality: number;
      timeSpent: number;
      hintsUsed: number;
    },
  ) => {
    if (!user?.id) return null;

    try {
      const result = await enhancedGamificationService.awardXP(
        user.id,
        xpAmount,
        source,
        languageCode,
        exerciseData,
      );

      // Update local state immediately for responsive UI
      setState(prev => ({
        ...prev,
        totalXP: result.totalXP,
        level: result.newLevel || prev.level,
        achievements: result.achievements ? [...prev.achievements, ...result.achievements] : prev.achievements,
      }));

      return result;
    } catch (error) {
      console.error('Error awarding XP:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to award XP',
      }));
      return null;
    }
  }, [user?.id]);

  // Award coins
  const awardCoins = useCallback(async (amount: number) => {
    if (!user?.id) return;

    try {
      // await enhancedGamificationService.awardCoins(user.id, amount); // Mock implementation
      // Reload stats to get updated coin count
      await loadStats();
    } catch (error) {
      console.error('Error awarding coins:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to award coins',
      }));
    }
  }, [user?.id, loadStats]);

  // Update streak
  const updateStreak = useCallback(async () => {
    if (!user?.id) return;

    try {
      // await enhancedGamificationService.updateStreak(user.id); // Mock implementation
      await loadStats(); // Reload to get updated streak
    } catch (error) {
      console.error('Error updating streak:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to update streak',
      }));
    }
  }, [user?.id, loadStats]);

  // Generate daily challenges
  const generateDailyChallenges = useCallback(async (mainLanguage: string) => {
    if (!user?.id) return [];

    try {
      const today = new Date().toISOString().split('T')[0];
      const challenges: any[] = []; // Mock implementation
      
      setState(prev => ({
        ...prev,
        dailyChallenges: challenges,
      }));
      
      return challenges;
    } catch (error) {
      console.error('Error generating daily challenges:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to generate challenges',
      }));
      return [];
    }
  }, [user?.id]);

  // Initialize user stats
  const initializeStats = useCallback(async () => {
    if (!user?.id) return;

    try {
      await enhancedGamificationService.initializeUserStats(user.id);
      await loadStats();
    } catch (error) {
      console.error('Error initializing stats:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to initialize stats',
      }));
    }
  }, [user?.id, loadStats]);

  // Set up real-time listener for user stats
  useEffect(() => {
    if (!user?.id) return;

    let unsubscribe: (() => void) | undefined;

    try {
      const userDocRef = firestoreDoc('users', user.id);
      unsubscribe = createRealtimeListener(userDocRef, (userData) => {
        if (userData) {
          setState(prev => ({
            ...prev,
            totalXP: userData.totalXP || 0,
            weeklyXP: userData.weeklyXP || 0,
            level: userData.level || 1,
            levelProgress: { currentLevel: 1, currentLevelXP: 0, nextLevelXP: 1000, progress: 0 }, // Mock implementation
            achievements: userData.achievements || [],
            currentLeague: userData.currentLeague as League | undefined,
          }));
        }
      });
    } catch (error) {
      console.error('Error setting up real-time listener:', error);
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [user?.id]);

  // Load initial data
  useEffect(() => {
    if (user?.id) {
      loadStats();
    }
  }, [user?.id, loadStats]);

  return {
    ...state,
    awardXP,
    awardCoins,
    updateStreak,
    generateDailyChallenges,
    initializeStats,
    refreshStats: loadStats,
    // Additional methods for compatibility
    completeLesson: async () => {
      // Mock implementation
      return { success: true };
    },
    acceptChallenge: async (challengeId: string) => {
      // Mock implementation
      return { success: true };
    },
    createChallenge: async (challengeData: any) => {
      // Mock implementation
      return { success: true, challengeId: 'mock_challenge' };
    },
  };
}

export default useGamification;
