/**
 * Enhanced Spaced Repetition Hook - Advanced SRS with performance tracking
 * Integrates with gamification and provides adaptive learning features
 */

import createContextHook from '@nkzw/create-context-hook';
import { useState, useCallback, useEffect, useMemo } from 'react';
import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import {
  SpacedRepetitionItem, 
  VocabularyItem,
  GrammarConcept,
  MultilingualContent,
} from '@/types';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';
import useEnhancedGamification from "@/hooks/useEnhancedGamification";
import { EnhancedSRSService } from '@/services/learning/enhancedSRS';

// Create service instance
const enhancedSRS = new EnhancedSRSService();

interface SRSPerformance {
  quality: number; // 0-5 rating of user performance
  responseTime: number; // milliseconds
  hintsUsed: number;
  attempts: number;
}

interface SRSState {
  itemsDue: SpacedRepetitionItem[];
  reviewStats: {
    totalItems: number;
    itemsDue: number;
    averageAccuracy: number;
    streakDays: number;
    nextReviewTime?: Date;
  };
  currentReviewSession: {
    items: SpacedRepetitionItem[];
    currentIndex: number;
    sessionStartTime: number;
    correctAnswers: number;
    totalAnswers: number;
  } | null;
  isLoading: boolean;
  insights: {
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
  };
}

interface SRSActions {
  startReviewSession: (difficulty?: 'easy' | 'medium' | 'hard', maxItems?: number) => Promise<void>;
  submitAnswer: (performance: SRSPerformance) => Promise<{
    correct: boolean;
    xpGained: number;
    nextItem?: SpacedRepetitionItem;
    sessionComplete?: boolean;
  }>;
  skipItem: () => Promise<void>;
  endSession: () => Promise<{
    totalXP: number;
    accuracy: number;
    itemsReviewed: number;
  }>;
  refreshStats: () => Promise<void>;
  createSRSItemsForLesson: (vocabularyItems: VocabularyItem[], grammarConcepts: GrammarConcept[]) => Promise<void>;
  getUIText: (key: string) => string;
}

export const [SRSProvider, useSpacedRepetition] = createContextHook(() => {
  const { user } = useUnifiedAuth();
  const { awardXP, completeLesson, acceptChallenge, createChallenge, generateDailyChallenges, refreshStats: refreshGamificationStats } = useEnhancedGamification();
  
  const [state, setState] = useState<SRSState>({
    itemsDue: [],
    reviewStats: {
      totalItems: 0,
      itemsDue: 0,
      averageAccuracy: 0,
      streakDays: 0,
    },
    currentReviewSession: null,
    isLoading: true,
    insights: {
      strengths: [],
      weaknesses: [],
      recommendations: [],
    },
  });

  // Initialize SRS data
  const initializeSRS = useCallback(async () => {
    if (!user?.id || !user.currentLanguage?.code) return;

    try {
      console.debug('Initializing SRS for user:', user.id);
      
      // Get items due for review
      const itemsDue: any[] = []; // Mock implementation
      // const itemsDue = await enhancedSRS.getItemsDue(
      //   user.id,
      //   user.currentLanguage.code,
      //   50,
      // );

      // Get review statistics
      const reviewStats = null; // Mock implementation
      // const reviewStats = await enhancedSRS.getReviewStats(
      //   user.id,
      //   user.currentLanguage.code,
      // );

      // Get learning insights
      const insights = null; // Mock implementation
      // const insights = await enhancedSRS.getLearningInsights(
      //   user.id,
      //   user.currentLanguage.code,
      // );

      setState({
        itemsDue,
        reviewStats: reviewStats || { totalItems: 0, itemsDue: 0, averageAccuracy: 0, streakDays: 0 },
        currentReviewSession: null,
        isLoading: false,
        insights: insights || { strengths: [], weaknesses: [], recommendations: [] },
      });

      console.debug(`Loaded ${itemsDue.length} items due for review`);
    } catch (error) {
      console.error('Error initializing SRS:', error);
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [user?.id, user?.currentLanguage?.code]);

  useEffect(() => {
    if (user?.id && user?.currentLanguage?.code) {
      initializeSRS();
    }
  }, [user?.id, user?.currentLanguage?.code]); // Use specific dependencies instead of callback

  // Start a new review session
  const startReviewSession = useCallback(async (
    difficulty?: 'easy' | 'medium' | 'hard',
    maxItems: number = 20,
  ) => {
    if (!user?.id || !user.currentLanguage?.code) return;

    try {
      let sessionItems: SpacedRepetitionItem[];

      if (difficulty) {
        // Get items by specific difficulty
        sessionItems = []; // Mock implementation
        // sessionItems = await enhancedSRS.getItemsByDifficulty(
        //   user.id,
        //   user.currentLanguage.code,
        //   difficulty,
        //   maxItems,
        // );
      } else {
        // Get regular due items
        sessionItems = []; // Mock implementation
        // sessionItems = await enhancedSRS.getItemsDue(
        //   user.id,
        //   user.currentLanguage.code,
        //   maxItems,
        // );
      }

      if (sessionItems.length === 0) {
        console.debug('No items available for review session');
        return;
      }

      // Shuffle items for variety
      const shuffledItems = [...sessionItems].sort(() => Math.random() - 0.5);

      setState(prev => ({
        ...prev,
        currentReviewSession: {
          items: shuffledItems,
          currentIndex: 0,
          sessionStartTime: Date.now(),
          correctAnswers: 0,
          totalAnswers: 0,
        },
      }));

      console.debug(`Started review session with ${shuffledItems.length} items`);
    } catch (error) {
      console.error('Error starting review session:', error);
      throw error;
    }
  }, [user?.id, user?.currentLanguage?.code]);

  // Submit an answer for the current item
  const submitAnswer = useCallback(async (performance: SRSPerformance) => {
    if (!state.currentReviewSession || !user?.id) {
      throw new Error('No active review session');
    }

    try {
      const session = state.currentReviewSession;
      const currentItem = session.items[session.currentIndex];
      
      if (!currentItem) {
        throw new Error('No current item in session');
      }

      // Update SRS item based on performance
      // await enhancedSRS.updateSRSItem(currentItem.id, performance); // Mock implementation

      const correct = performance.quality >= 3;
      const newCorrectAnswers = session.correctAnswers + (correct ? 1 : 0);
      const newTotalAnswers = session.totalAnswers + 1;

      // Calculate XP reward based on performance
      let xpGained = 0;
      if (correct) {
        const baseXP = 5;
        const qualityBonus = Math.floor((performance.quality - 3) * 2); // 0-4 bonus XP
        const speedBonus = performance.responseTime < 3000 ? 2 : 0;
        const hintsePenalty = performance.hintsUsed * 1;
        
        xpGained = Math.max(1, baseXP + qualityBonus + speedBonus - hintsePenalty);
        
        // Award XP through gamification system
        await awardXP(xpGained, 'srs_review', user.currentLanguage?.code);
      }

      // Haptic feedback
      if (Platform.OS !== 'web' && user.preferences?.hapticEnabled !== false) {
        if (correct) {
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } else {
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        }
      }

      // Move to next item or end session
      const nextIndex = session.currentIndex + 1;
      const sessionComplete = nextIndex >= session.items.length;

      if (sessionComplete) {
        // Session completed
        setState(prev => ({
          ...prev,
          currentReviewSession: null,
        }));

        // Refresh stats after session
        await initializeSRS();

        return {
          correct,
          xpGained,
          sessionComplete: true,
        };
      } else {
        // Move to next item
        const nextItem = session.items[nextIndex];
        
        setState(prev => ({
          ...prev,
          currentReviewSession: {
            ...session,
            currentIndex: nextIndex,
            correctAnswers: newCorrectAnswers,
            totalAnswers: newTotalAnswers,
          },
        }));

        return {
          correct,
          xpGained,
          nextItem,
          sessionComplete: false,
        };
      }
    } catch (error) {
      console.error('Error submitting answer:', error);
      throw error;
    }
  }, [state.currentReviewSession, user, awardXP, initializeSRS]);

  // Skip current item (counts as incorrect)
  const skipItem = useCallback(async () => {
    if (!state.currentReviewSession) return;

    const skipPerformance: SRSPerformance = {
      quality: 0, // Lowest quality for skipped items
      responseTime: 0,
      hintsUsed: 0,
      attempts: 1,
    };

    await submitAnswer(skipPerformance);
  }, [state.currentReviewSession, submitAnswer]);

  // End current session early
  const endSession = useCallback(async () => {
    if (!state.currentReviewSession) {
      return { totalXP: 0, accuracy: 0, itemsReviewed: 0 };
    }

    const session = state.currentReviewSession;
    const accuracy = session.totalAnswers > 0 ? (session.correctAnswers / session.totalAnswers) * 100 : 0;
    const sessionDuration = Date.now() - session.sessionStartTime;
    
    // Calculate session XP bonus
    let bonusXP = 0;
    if (session.totalAnswers >= 5) {
      bonusXP = Math.floor(accuracy / 10); // 1 XP per 10% accuracy, minimum 5 items
    }

    if (bonusXP > 0) {
      await awardXP(bonusXP, 'srs_session_bonus', user?.currentLanguage?.code);
    }

    setState(prev => ({
      ...prev,
      currentReviewSession: null,
    }));

    // Refresh stats
    await initializeSRS();

    console.debug(`Session ended: ${session.totalAnswers} items, ${accuracy.toFixed(1)}% accuracy, ${Math.round(sessionDuration / 1000)}s duration`);

    return {
      totalXP: bonusXP,
      accuracy,
      itemsReviewed: session.totalAnswers,
    };
  }, [state.currentReviewSession, awardXP, user?.currentLanguage?.code, initializeSRS]);

  // Refresh SRS statistics
  const refreshStats = useCallback(async () => {
    if (!user?.id) return;

    try {
      setState(prev => ({ ...prev, isLoading: true }));
      await initializeSRS();
    } catch (error) {
      console.error('Error refreshing SRS stats:', error);
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [initializeSRS]);

  // Create SRS items for a completed lesson
  const createSRSItemsForLesson = useCallback(async (
    vocabularyItems: VocabularyItem[],
    grammarConcepts: GrammarConcept[],
  ) => {
    if (!user?.id || !user.currentLanguage?.code) return;

    try {
      // await enhancedSRS.createSRSItemsForLesson( // Mock implementation
      //   user.id,
      //   user.currentLanguage.code,
      //   vocabularyItems,
      //   grammarConcepts,
      // );

      // Refresh stats to include new items
      await initializeSRS();

      console.debug(`Created SRS items for ${vocabularyItems.length} vocabulary and ${grammarConcepts.length} grammar concepts`);
    } catch (error) {
      console.error('Error creating SRS items for lesson:', error);
      throw error;
    }
  }, [user?.id, user?.currentLanguage?.code, initializeSRS]);

  // Get UI text in user's main language
  const getUIText = useCallback((key: string): string => {
    const mainLanguage = user?.mainLanguage?.code || 'en';
    
    const uiTexts: { [key: string]: MultilingualContent } = {
      'srs.review': {
        en: 'Review',
        es: 'Repasar',
        hr: 'Pregled',
      },
      'srs.items_due': {
        en: 'Items Due',
        es: 'Elementos Pendientes',
        hr: 'Stavke za Pregled',
      },
      'srs.start_session': {
        en: 'Start Review',
        es: 'Comenzar Repaso',
        hr: 'Počni Pregled',
      },
      'srs.session_complete': {
        en: 'Session Complete!',
        es: '¡Sesión Completada!',
        hr: 'Sesija Završena!',
      },
      'srs.correct': {
        en: 'Correct!',
        es: '¡Correcto!',
        hr: 'Točno!',
      },
      'srs.incorrect': {
        en: 'Incorrect',
        es: 'Incorrecto',
        hr: 'Netočno',
      },
      'srs.skip': {
        en: 'Skip',
        es: 'Saltar',
        hr: 'Preskoči',
      },
      'srs.next': {
        en: 'Next',
        es: 'Siguiente',
        hr: 'Sljedeće',
      },
      'srs.accuracy': {
        en: 'Accuracy',
        es: 'Precisión',
        hr: 'Točnost',
      },
      'srs.streak': {
        en: 'Streak',
        es: 'Racha',
        hr: 'Niz',
      },
      'srs.insights.strengths': {
        en: 'Strengths',
        es: 'Fortalezas',
        hr: 'Snage',
      },
      'srs.insights.weaknesses': {
        en: 'Areas to Improve',
        es: 'Áreas a Mejorar',
        hr: 'Područja za Poboljšanje',
      },
      'srs.insights.recommendations': {
        en: 'Recommendations',
        es: 'Recomendaciones',
        hr: 'Preporuke',
      },
    };

    const text = uiTexts[key];
    return text?.[mainLanguage] || text?.['en'] || key;
  }, [user?.mainLanguage?.code]);

  const actions: SRSActions = useMemo(() => ({
    startReviewSession,
    submitAnswer,
    skipItem,
    endSession,
    refreshStats,
    createSRSItemsForLesson,
    getUIText,
  }), [
    startReviewSession,
    submitAnswer,
    skipItem,
    endSession,
    refreshStats,
    createSRSItemsForLesson,
    getUIText,
  ]);

  return useMemo(() => ({
    ...state,
    ...actions,
  }), [state, actions]);
});
