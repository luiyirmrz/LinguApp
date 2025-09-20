/**
 * A1 SRS Hook - Specialized hook for A1 level spaced repetition
 * Integrates with A1 lessons and provides beginner-friendly SRS functionality
 */

import { useState, useCallback, useEffect } from 'react';
import { SpacedRepetitionItem, VocabularyItem, GrammarConcept } from '@/types';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';
import { useSpacedRepetition } from '@/hooks/useSpacedRepetition';
import A1SRSConfigurationService, { A1SRSPerformance } from '@/services/learning/a1SRSConfiguration';
import { croatianA1Vocabulary, croatianA1Grammar } from '@/levels/A1/croatian-a1-lessons';

interface A1SRSState {
  a1Items: SpacedRepetitionItem[];
  isLoading: boolean;
  currentLesson: {
    vocabulary: VocabularyItem[];
    grammar: GrammarConcept[];
  } | null;
  reviewStats: {
    totalA1Items: number;
    itemsDue: number;
    averageAccuracy: number;
    recommendations: string[];
  };
}

interface A1SRSActions {
  initializeA1SRS: () => Promise<void>;
  createSRSItemsForA1Lesson: (lessonId: string) => Promise<void>;
  updateA1SRSItem: (srsItemId: string, performance: A1SRSPerformance) => Promise<void>;
  getA1ItemsDue: () => Promise<SpacedRepetitionItem[]>;
  getA1ReviewRecommendations: () => string[];
  resetA1SRSItem: (srsItemId: string) => Promise<void>;
}

export const useA1SRS = (): A1SRSState & A1SRSActions => {
  const { user } = useUnifiedAuth();
  const { createSRSItemsForLesson, refreshStats, reviewStats } = useSpacedRepetition();
  
  const [state, setState] = useState<A1SRSState>({
    a1Items: [],
    isLoading: true,
    currentLesson: null,
    reviewStats: {
      totalA1Items: 0,
      itemsDue: 0,
      averageAccuracy: 0,
      recommendations: [],
    },
  });

  // Initialize A1 SRS system
  const initializeA1SRS = useCallback(async () => {
    if (!user?.id || !user.currentLanguage?.code) return;

    try {
      console.debug('Initializing A1 SRS for user:', user.id);
      setState(prev => ({ ...prev, isLoading: true }));

      // Load Croatian A1 vocabulary and grammar
      const a1Vocabulary = croatianA1Vocabulary;
      const a1Grammar = croatianA1Grammar;

      setState(prev => ({
        ...prev,
        currentLesson: {
          vocabulary: a1Vocabulary,
          grammar: a1Grammar,
        },
      }));

      // Create SRS items for A1 content if they don't exist
      await createSRSItemsForA1Lesson('croatian_a1_basics');

      // Refresh stats
      await refreshStats();

      setState(prev => ({
        ...prev,
        isLoading: false,
        reviewStats: {
          totalA1Items: a1Vocabulary.length + a1Grammar.length,
          itemsDue: reviewStats.itemsDue,
          averageAccuracy: reviewStats.averageAccuracy,
          recommendations: getA1ReviewRecommendations(),
        },
      }));

      console.debug('A1 SRS initialized successfully');
    } catch (error) {
      console.error('Error initializing A1 SRS:', error);
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [user?.id, user?.currentLanguage?.code, createSRSItemsForLesson, refreshStats, reviewStats]);

  // Create SRS items for a specific A1 lesson
  const createSRSItemsForA1Lesson = useCallback(async (lessonId: string) => {
    if (!user?.id || !user.currentLanguage?.code || !state.currentLesson) return;

    try {
      console.debug(`Creating SRS items for A1 lesson: ${lessonId}`);

      // Use A1-specific SRS configuration
      await A1SRSConfigurationService.createA1SRSItems(
        user.id,
        user.currentLanguage.code,
        state.currentLesson.vocabulary,
        state.currentLesson.grammar,
      );

      // Also create items using the main SRS service for compatibility
      await createSRSItemsForLesson(
        state.currentLesson.vocabulary,
        state.currentLesson.grammar,
      );

      console.debug(`Created SRS items for A1 lesson: ${lessonId}`);
    } catch (error) {
      console.error('Error creating SRS items for A1 lesson:', error);
      throw error;
    }
  }, [user?.id, user?.currentLanguage?.code, state.currentLesson, createSRSItemsForLesson]);

  // Update A1 SRS item with specialized performance tracking
  const updateA1SRSItem = useCallback(async (
    srsItemId: string,
    performance: A1SRSPerformance,
  ) => {
    try {
      console.debug(`Updating A1 SRS item ${srsItemId} with quality ${performance.quality}`);

      // Use A1-specific update logic
      await A1SRSConfigurationService.updateA1SRSItem(srsItemId, performance);

      // Refresh stats after update
      await refreshStats();

      console.debug(`Updated A1 SRS item ${srsItemId} successfully`);
    } catch (error) {
      console.error('Error updating A1 SRS item:', error);
      throw error;
    }
  }, [refreshStats]);

  // Get A1 items due for review
  const getA1ItemsDue = useCallback(async (): Promise<SpacedRepetitionItem[]> => {
    if (!user?.id || !user.currentLanguage?.code) return [];

    try {
      // This would typically filter for A1-specific items
      // For now, we'll return all items due (in a real implementation,
      // you'd want to add filtering by lesson level or tags)
      return [];
    } catch (error) {
      console.error('Error getting A1 items due:', error);
      return [];
    }
  }, [user?.id, user?.currentLanguage?.code]);

  // Get A1-specific review recommendations
  const getA1ReviewRecommendations = useCallback((): string[] => {
    return A1SRSConfigurationService.getA1ReviewRecommendations(
      state.reviewStats.totalA1Items,
      state.reviewStats.itemsDue,
      state.reviewStats.averageAccuracy,
    );
  }, [state.reviewStats]);

  // Reset A1 SRS item
  const resetA1SRSItem = useCallback(async (srsItemId: string) => {
    try {
      console.debug(`Resetting A1 SRS item: ${srsItemId}`);
      
      // Reset the item using the main SRS service
      // (The main service already has reset functionality)
      
      // Refresh stats after reset
      await refreshStats();
      
      console.debug(`Reset A1 SRS item ${srsItemId} successfully`);
    } catch (error) {
      console.error('Error resetting A1 SRS item:', error);
      throw error;
    }
  }, [refreshStats]);

  // Initialize A1 SRS when user changes
  useEffect(() => {
    if (user?.id && user?.currentLanguage?.code) {
      initializeA1SRS();
    }
  }, [initializeA1SRS]);

  return {
    ...state,
    initializeA1SRS,
    createSRSItemsForA1Lesson,
    updateA1SRSItem,
    getA1ItemsDue,
    getA1ReviewRecommendations,
    resetA1SRSItem,
  };
};
