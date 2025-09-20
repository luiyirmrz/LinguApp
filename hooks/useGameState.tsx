import createContextHook from '@nkzw/create-context-hook';
import { useMemo, useCallback } from 'react';
import { useMultilingualLearning } from '@/hooks/useMultilingualLearning';

export const [GameStateProvider, useGameState] = createContextHook(() => {
  // Safely get multilingual learning context with fallback
  let multilingualLearning: any = null;
  
  try {
    multilingualLearning = useMultilingualLearning();
  } catch (error) {
    console.warn('useMultilingualLearning not available in useGameState:', error);
  }

  const completeLesson = useCallback(async (skillId: string, lessonId: string, earnedPoints: number) => {
    if (!multilingualLearning?.completeLesson) {
      console.warn('Multilingual learning not initialized yet');
      return { xpEarned: 0, levelUp: false };
    }
    
    // Convert old interface to new interface
    const performance = {
      correctAnswers: Math.floor(earnedPoints / 5), // Estimate based on points
      totalAnswers: Math.floor(earnedPoints / 3), // Estimate
      timeSpent: 60, // Default 1 minute
    };
    
    return await multilingualLearning.completeLesson(lessonId, performance);
  }, [multilingualLearning?.completeLesson]);

  return useMemo(() => ({
    skills: multilingualLearning?.availableSkills || [],
    completeLesson,
    switchLanguage: multilingualLearning?.switchTargetLanguage || (() => Promise.resolve()),
    getRecommendedLesson: multilingualLearning?.getRecommendedLesson || (() => null),
    getLanguageStats: multilingualLearning?.getLanguageStats || (() => null),
    getUserProgress: (userId?: string) => multilingualLearning?.currentLanguageProgress || null,
    updateStreak: () => Promise.resolve(), // Not implemented in multilingual learning yet
    currentLanguageProgress: multilingualLearning?.currentLanguageProgress || null,
    isLoading: multilingualLearning?.isLoading ?? true,
  }), [
    multilingualLearning?.availableSkills,
    multilingualLearning?.switchTargetLanguage,
    multilingualLearning?.getRecommendedLesson,
    multilingualLearning?.getLanguageStats,
    multilingualLearning?.currentLanguageProgress,
    multilingualLearning?.isLoading,
    completeLesson,
  ]);
});
