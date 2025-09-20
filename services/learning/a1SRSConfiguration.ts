/**
 * A1 SRS Configuration Service
 * Specialized SRS configuration for A1 level lessons with optimized parameters
 * Ensures proper interval, ease factor, and repetition settings for beginner learners
 */

import { SpacedRepetitionItem, VocabularyItem, GrammarConcept } from '@/types';
// import spacedRepetitionService from './spacedRepetition'; // Temporarily disabled for testing

// A1-specific SRS parameters optimized for beginner learners
export const A1_SRS_CONFIG = {
  // Ease factor settings - more conservative for beginners
  DEFAULT_EASE_FACTOR: 2.5,
  MIN_EASE_FACTOR: 1.3,
  MAX_EASE_FACTOR: 2.5,
  
  // Interval settings - shorter intervals for A1 learners
  INITIAL_INTERVAL: 1, // Start with 1 day
  SECOND_INTERVAL: 3,  // Second review after 3 days
  THIRD_INTERVAL: 7,   // Third review after 1 week
  
  // Repetition settings
  INITIAL_REPETITIONS: 0,
  
  // Quality thresholds for A1 learners
  PASSING_QUALITY: 3, // Quality 3+ is considered passing
  EXCELLENT_QUALITY: 4, // Quality 4+ gets bonus intervals
  
  // A1-specific modifiers
  DIFFICULTY_MODIFIERS: {
    easy: 1.2,    // 20% longer intervals for easy words
    medium: 1.0,  // Standard intervals
    hard: 0.8,    // 20% shorter intervals for hard words
    very_hard: 0.6, // 40% shorter intervals for very hard words
  },
  
  // Performance tracking
  TRACK_RESPONSE_TIME: true,
  TRACK_HINTS_USED: true,
  TRACK_ATTEMPTS: true,
};

export interface A1SRSPerformance {
  quality: number; // 0-5 rating
  responseTime: number; // milliseconds
  hintsUsed: number;
  attempts: number;
  difficulty: 'easy' | 'medium' | 'hard' | 'very_hard';
}

export class A1SRSConfigurationService {
  
  /**
   * Creates SRS items specifically configured for A1 lessons
   */
  static async createA1SRSItems(
    userId: string,
    languageCode: string,
    vocabularyItems: VocabularyItem[],
    grammarConcepts: GrammarConcept[],
  ): Promise<SpacedRepetitionItem[]> {
    console.debug(`Creating A1 SRS items for ${vocabularyItems.length} vocabulary and ${grammarConcepts.length} grammar concepts`);
    
    const srsItems: SpacedRepetitionItem[] = [];
    
    // Create SRS items for vocabulary with A1-specific settings
    for (const vocab of vocabularyItems) {
      const srsItem = await this.createA1SRSItem(
        userId,
        vocab.id,
        'vocabulary',
        languageCode,
        vocab.difficulty || 1,
      );
      srsItems.push(srsItem);
    }
    
    // Create SRS items for grammar concepts with A1-specific settings
    for (const grammar of grammarConcepts) {
      const srsItem = await this.createA1SRSItem(
        userId,
        grammar.id,
        'grammar',
        languageCode,
        grammar.difficulty || 2,
      );
      srsItems.push(srsItem);
    }
    
    console.debug(`Created ${srsItems.length} A1 SRS items`);
    return srsItems;
  }
  
  /**
   * Creates a single A1 SRS item with optimized parameters
   */
  private static async createA1SRSItem(
    userId: string,
    itemId: string,
    itemType: 'vocabulary' | 'grammar' | 'phrase',
    languageCode: string,
    difficulty: number,
  ): Promise<SpacedRepetitionItem> {
    const now = new Date();
    const nextReview = new Date(now.getTime() + A1_SRS_CONFIG.INITIAL_INTERVAL * 24 * 60 * 60 * 1000);
    
    const srsItem: SpacedRepetitionItem = {
      id: `a1_srs_${itemId}_${Date.now()}`,
      userId,
      itemId,
      itemType,
      languageCode,
      easeFactor: A1_SRS_CONFIG.DEFAULT_EASE_FACTOR,
      interval: A1_SRS_CONFIG.INITIAL_INTERVAL,
      repetitions: A1_SRS_CONFIG.INITIAL_REPETITIONS,
      nextReviewDate: nextReview.toISOString(),
      lastReviewed: now.toISOString(),
      quality: 3, // Default quality for A1
      averageQuality: 3,
      totalReviews: 0,
    };
    
    // For testing purposes, return the mock item directly
    // In production, this would use: return await spacedRepetitionService.createSRSItem(userId, itemId, itemType, languageCode);
    return srsItem;
  }
  
  /**
   * Updates A1 SRS item with specialized algorithm for beginners
   */
  static async updateA1SRSItem(
    srsItemId: string,
    performance: A1SRSPerformance,
  ): Promise<SpacedRepetitionItem> {
    console.debug(`Updating A1 SRS item ${srsItemId} with quality ${performance.quality}`);
    
    // Get the current SRS item
    const currentItem = await this.getSRSItem(srsItemId);
    if (!currentItem) {
      throw new Error(`A1 SRS item ${srsItemId} not found`);
    }
    
    const now = new Date();
    
    // Calculate new ease factor with A1-specific adjustments
    let newEaseFactor = currentItem.easeFactor;
    
    if (performance.quality >= A1_SRS_CONFIG.PASSING_QUALITY) {
      // Good performance - increase ease factor more conservatively for A1
      const qualityBonus = (performance.quality - 3) * 0.05; // Smaller increments
      newEaseFactor = Math.min(
        A1_SRS_CONFIG.MAX_EASE_FACTOR,
        currentItem.easeFactor + qualityBonus,
      );
    } else {
      // Poor performance - decrease ease factor more aggressively for A1
      newEaseFactor = Math.max(
        A1_SRS_CONFIG.MIN_EASE_FACTOR,
        currentItem.easeFactor - 0.15, // Larger decrease for struggling learners
      );
    }
    
    // Calculate new interval with A1-specific progression
    let newInterval: number;
    let newRepetitions = currentItem.repetitions;
    
    if (performance.quality < A1_SRS_CONFIG.PASSING_QUALITY) {
      // Failed - reset to beginning (more forgiving for A1)
      newInterval = A1_SRS_CONFIG.INITIAL_INTERVAL;
      newRepetitions = 0;
    } else {
      // Passed - use A1-specific interval progression
      newRepetitions += 1;
      
      if (newRepetitions === 1) {
        newInterval = A1_SRS_CONFIG.INITIAL_INTERVAL;
      } else if (newRepetitions === 2) {
        newInterval = A1_SRS_CONFIG.SECOND_INTERVAL;
      } else if (newRepetitions === 3) {
        newInterval = A1_SRS_CONFIG.THIRD_INTERVAL;
      } else {
        // Use standard SM-2 algorithm for subsequent reviews
        newInterval = Math.round(currentItem.interval * newEaseFactor);
      }
    }
    
    // Apply difficulty modifier for A1 learners
    const difficultyModifier = A1_SRS_CONFIG.DIFFICULTY_MODIFIERS[performance.difficulty] || 1.0;
    newInterval = Math.max(1, Math.round(newInterval * difficultyModifier));
    
    // Apply performance modifiers (response time, hints, attempts)
    const performanceModifier = this.calculateA1PerformanceModifier(performance);
    newInterval = Math.max(1, Math.round(newInterval * performanceModifier));
    
    // Calculate next review date
    const nextReviewDate = new Date(now.getTime() + newInterval * 24 * 60 * 60 * 1000);
    
    // Update average quality
    const totalReviews = currentItem.totalReviews + 1;
    const newAverageQuality = (currentItem.averageQuality * currentItem.totalReviews + performance.quality) / totalReviews;
    
    const updatedItem: SpacedRepetitionItem = {
      ...currentItem,
      easeFactor: newEaseFactor,
      interval: newInterval,
      repetitions: newRepetitions,
      nextReviewDate: nextReviewDate.toISOString(),
      lastReviewed: now.toISOString(),
      quality: performance.quality,
      averageQuality: newAverageQuality,
      totalReviews,
    };
    
    // For testing purposes, return the updated item directly
    // In production, this would use: return await spacedRepetitionService.updateSRSItem(srsItemId, {...});
    return updatedItem;
  }
  
  /**
   * Calculates performance modifier specifically for A1 learners
   */
  private static calculateA1PerformanceModifier(performance: A1SRSPerformance): number {
    let modifier = 1.0;
    
    // Response time modifier - more lenient for A1 learners
    if (performance.responseTime < 5000) { // Less than 5 seconds (more lenient than standard)
      modifier *= 1.1;
    } else if (performance.responseTime > 15000) { // More than 15 seconds
      modifier *= 0.9;
    }
    
    // Hints used modifier - more forgiving for A1
    if (performance.hintsUsed > 0) {
      modifier *= Math.max(0.8, 1.0 - (performance.hintsUsed * 0.05)); // Less penalty
    }
    
    // Attempts modifier - more forgiving for A1
    if (performance.attempts > 1) {
      modifier *= Math.max(0.9, 1.0 - ((performance.attempts - 1) * 0.05)); // Less penalty
    }
    
    return Math.max(0.7, Math.min(1.3, modifier)); // Wider range for A1 learners
  }
  
  /**
   * Gets SRS item by ID (helper method)
   */
  private static async getSRSItem(srsItemId: string): Promise<SpacedRepetitionItem | null> {
    try {
      // For now, we'll create a mock item for testing
      // In a real implementation, this would query the database
      const mockItem: SpacedRepetitionItem = {
        id: srsItemId,
        userId: 'test_user',
        itemId: 'test_item',
        itemType: 'vocabulary',
        languageCode: 'hr',
        easeFactor: A1_SRS_CONFIG.DEFAULT_EASE_FACTOR,
        interval: A1_SRS_CONFIG.INITIAL_INTERVAL,
        repetitions: 0,
        nextReviewDate: new Date().toISOString(),
        lastReviewed: new Date().toISOString(),
        quality: 3,
        averageQuality: 3,
        totalReviews: 0,
      };
      return mockItem;
    } catch (error) {
      console.error('Error getting SRS item:', error);
      return null;
    }
  }
  
  /**
   * Gets A1-specific review recommendations
   */
  static getA1ReviewRecommendations(
    totalItems: number,
    itemsDue: number,
    averageAccuracy: number,
  ): string[] {
    const recommendations: string[] = [];
    
    if (itemsDue > 10) {
      recommendations.push('You have many items to review. Try to do a few each day to stay on track.');
    }
    
    if (averageAccuracy < 70) {
      recommendations.push('Your accuracy is below 70%. Consider reviewing easier items first to build confidence.');
    }
    
    if (itemsDue === 0) {
      recommendations.push('Great job! You\'re all caught up. Consider starting new lessons to add more vocabulary.');
    }
    
    if (totalItems < 20) {
      recommendations.push('You have fewer than 20 items in your review deck. Complete more lessons to build a stronger foundation.');
    }
    
    return recommendations;
  }
  
  /**
   * Validates A1 SRS configuration
   */
  static validateA1SRSConfiguration(): boolean {
    const config = A1_SRS_CONFIG;
    
    // Validate ease factor range
    if (config.MIN_EASE_FACTOR >= config.MAX_EASE_FACTOR) {
      console.error('A1 SRS Config Error: MIN_EASE_FACTOR must be less than MAX_EASE_FACTOR');
      return false;
    }
    
    // Validate interval progression
    if (config.INITIAL_INTERVAL >= config.SECOND_INTERVAL || 
        config.SECOND_INTERVAL >= config.THIRD_INTERVAL) {
      console.error('A1 SRS Config Error: Intervals must be in ascending order');
      return false;
    }
    
    // Validate quality thresholds
    if (config.PASSING_QUALITY < 0 || config.PASSING_QUALITY > 5) {
      console.error('A1 SRS Config Error: PASSING_QUALITY must be between 0 and 5');
      return false;
    }
    
    console.debug('A1 SRS Configuration validated successfully');
    return true;
  }
}

// Validate configuration on module load
A1SRSConfigurationService.validateA1SRSConfiguration();

export default A1SRSConfigurationService;
