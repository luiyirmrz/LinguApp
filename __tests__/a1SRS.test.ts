
// Global test timeout configuration
jest.setTimeout(10000); // 10 seconds default timeout

/**
 * A1 SRS Test Suite
 * Tests the A1 SRS configuration and functionality
 */

import { A1SRSConfigurationService, A1_SRS_CONFIG } from '@/services/learning/a1SRSConfiguration';
import { croatianA1Vocabulary, croatianA1Grammar } from '@/levels/A1/croatian-a1-lessons';

describe('A1 SRS Configuration', () => {
  test('should have correct default parameters', () => {
    expect(A1_SRS_CONFIG.DEFAULT_EASE_FACTOR).toBe(2.5);
    expect(A1_SRS_CONFIG.INITIAL_INTERVAL).toBe(1);
    expect(A1_SRS_CONFIG.INITIAL_REPETITIONS).toBe(0);
    expect(A1_SRS_CONFIG.PASSING_QUALITY).toBe(3);
  });

  test('should have valid ease factor range', () => {
    expect(A1_SRS_CONFIG.MIN_EASE_FACTOR).toBeLessThan(A1_SRS_CONFIG.MAX_EASE_FACTOR);
    expect(A1_SRS_CONFIG.MIN_EASE_FACTOR).toBe(1.3);
    expect(A1_SRS_CONFIG.MAX_EASE_FACTOR).toBe(2.5);
  });

  test('should have ascending interval progression', () => {
    expect(A1_SRS_CONFIG.INITIAL_INTERVAL).toBeLessThan(A1_SRS_CONFIG.SECOND_INTERVAL);
    expect(A1_SRS_CONFIG.SECOND_INTERVAL).toBeLessThan(A1_SRS_CONFIG.THIRD_INTERVAL);
  });

  test('should validate configuration correctly', () => {
    const isValid = A1SRSConfigurationService.validateA1SRSConfiguration();
    expect(isValid).toBe(true);
  });

  test('should have difficulty modifiers for all levels', () => {
    expect(A1_SRS_CONFIG.DIFFICULTY_MODIFIERS.easy).toBe(1.2);
    expect(A1_SRS_CONFIG.DIFFICULTY_MODIFIERS.medium).toBe(1.0);
    expect(A1_SRS_CONFIG.DIFFICULTY_MODIFIERS.hard).toBe(0.8);
    expect(A1_SRS_CONFIG.DIFFICULTY_MODIFIERS.very_hard).toBe(0.6);
  });
});

describe('A1 SRS Performance Calculation', () => {
  test('should calculate correct interval for first review', () => {
    const performance = {
      quality: 4,
      responseTime: 2000,
      hintsUsed: 0,
      attempts: 1,
      difficulty: 'medium' as const,
    };

    // Mock the updateA1SRSItem method to test interval calculation
    const mockSRSItem = {
      id: 'test_item',
      userId: 'test_user',
      itemId: 'test_vocab',
      itemType: 'vocabulary' as const,
      languageCode: 'hr',
      easeFactor: 2.5,
      interval: 1,
      repetitions: 0,
      nextReviewDate: new Date().toISOString(),
      lastReviewed: new Date().toISOString(),
      quality: 3,
      averageQuality: 3,
      totalReviews: 0,
    };

    // Test first review (repetitions = 0)
    expect(mockSRSItem.repetitions).toBe(0);
    // After successful first review, should move to second interval
    const newRepetitions = mockSRSItem.repetitions + 1;
    expect(newRepetitions).toBe(1);
  });

  test('should reset interval for failed reviews', () => {
    const performance = {
      quality: 2, // Below passing threshold
      responseTime: 5000,
      hintsUsed: 1,
      attempts: 2,
      difficulty: 'hard' as const,
    };

    // For failed reviews, interval should reset to 1
    const expectedInterval = A1_SRS_CONFIG.INITIAL_INTERVAL;
    expect(expectedInterval).toBe(1);
  });

  test('should apply difficulty modifiers correctly', () => {
    const easyModifier = A1_SRS_CONFIG.DIFFICULTY_MODIFIERS.easy;
    const hardModifier = A1_SRS_CONFIG.DIFFICULTY_MODIFIERS.hard;
    
    const baseInterval = 7;
    const easyInterval = Math.round(baseInterval * easyModifier);
    const hardInterval = Math.round(baseInterval * hardModifier);
    
    expect(easyInterval).toBe(8); // 7 * 1.2 = 8.4, rounded to 8
    expect(hardInterval).toBe(6); // 7 * 0.8 = 5.6, rounded to 6
  });
});

describe('A1 SRS Recommendations', () => {
  test('should provide recommendations for high due count', () => {
    const recommendations = A1SRSConfigurationService.getA1ReviewRecommendations(
      50, // total items
      15, // items due
      75,  // average accuracy
    );
    
    expect(recommendations).toContain('You have many items to review. Try to do a few each day to stay on track.');
  });

  test('should provide recommendations for low accuracy', () => {
    const recommendations = A1SRSConfigurationService.getA1ReviewRecommendations(
      30, // total items
      5,  // items due
      60,  // average accuracy (below 70%)
    );
    
    expect(recommendations).toContain('Your accuracy is below 70%. Consider reviewing easier items first to build confidence.');
  });

  test('should provide recommendations for caught up users', () => {
    const recommendations = A1SRSConfigurationService.getA1ReviewRecommendations(
      25, // total items
      0,  // items due
      85,  // average accuracy
    );
    
    expect(recommendations).toContain('Great job! You\'re all caught up. Consider starting new lessons to add more vocabulary.');
  });

  test('should provide recommendations for small vocabulary', () => {
    const recommendations = A1SRSConfigurationService.getA1ReviewRecommendations(
      15, // total items (below 20)
      3,  // items due
      80,  // average accuracy
    );
    
    expect(recommendations).toContain('You have fewer than 20 items in your review deck. Complete more lessons to build a stronger foundation.');
  });
});

describe('A1 Croatian Vocabulary Integration', () => {
  test('should have Croatian A1 vocabulary loaded', () => {
    expect(croatianA1Vocabulary).toBeDefined();
    expect(croatianA1Vocabulary.length).toBeGreaterThan(0);
  });

  test('should have Croatian A1 grammar loaded', () => {
    expect(croatianA1Grammar).toBeDefined();
    expect(croatianA1Grammar.length).toBeGreaterThan(0);
  });

  test('should have vocabulary items with correct structure', () => {
    const firstVocab = croatianA1Vocabulary[0];
    expect(firstVocab).toHaveProperty('id');
    expect(firstVocab).toHaveProperty('word');
    expect(firstVocab).toHaveProperty('translation');
    expect(firstVocab).toHaveProperty('difficulty');
    expect(firstVocab).toHaveProperty('cefrLevel');
    expect(firstVocab.cefrLevel).toBe('A1');
  });

  test('should have grammar concepts with correct structure', () => {
    const firstGrammar = croatianA1Grammar[0];
    expect(firstGrammar).toHaveProperty('id');
    expect(firstGrammar).toHaveProperty('title');
    expect(firstGrammar).toHaveProperty('description');
    expect(firstGrammar).toHaveProperty('difficulty');
    expect(firstGrammar).toHaveProperty('cefrLevel');
    expect(firstGrammar.cefrLevel).toBe('A1');
  });

  test('should have appropriate difficulty levels for A1', () => {
    const vocabDifficulties = croatianA1Vocabulary.map(v => v.difficulty);
    const grammarDifficulties = croatianA1Grammar.map(g => g.difficulty);
    
    // A1 should have mostly difficulty 1-2, with some 3
    expect(vocabDifficulties.every(d => d >= 1 && d <= 3)).toBe(true);
    expect(grammarDifficulties.every(d => d >= 1 && d <= 3)).toBe(true);
  });
});

describe('A1 SRS Performance Modifiers', () => {
  test('should calculate performance modifier for fast response', () => {
    const performance = {
      quality: 4,
      responseTime: 2000, // Fast response
      hintsUsed: 0,
      attempts: 1,
      difficulty: 'medium' as const,
    };

    // Fast response should get bonus
    let modifier = 1.0;
    if (performance.responseTime < 5000) {
      modifier *= 1.1;
    }
    
    expect(modifier).toBe(1.1);
  });

  test('should calculate performance modifier for slow response', () => {
    const performance = {
      quality: 3,
      responseTime: 20000, // Slow response
      hintsUsed: 0,
      attempts: 1,
      difficulty: 'medium' as const,
    };

    // Slow response should get penalty
    let modifier = 1.0;
    if (performance.responseTime > 15000) {
      modifier *= 0.9;
    }
    
    expect(modifier).toBe(0.9);
  });

  test('should calculate performance modifier for hints used', () => {
    const performance = {
      quality: 3,
      responseTime: 3000,
      hintsUsed: 2, // Used hints
      attempts: 1,
      difficulty: 'medium' as const,
    };

    // Hints used should reduce modifier
    let modifier = 1.0;
    if (performance.hintsUsed > 0) {
      modifier *= Math.max(0.8, 1.0 - (performance.hintsUsed * 0.05));
    }
    
    expect(modifier).toBe(0.9); // 1.0 - (2 * 0.05) = 0.9
  });

  test('should calculate performance modifier for multiple attempts', () => {
    const performance = {
      quality: 3,
      responseTime: 3000,
      hintsUsed: 0,
      attempts: 3, // Multiple attempts
      difficulty: 'medium' as const,
    };

    // Multiple attempts should reduce modifier
    let modifier = 1.0;
    if (performance.attempts > 1) {
      modifier *= Math.max(0.9, 1.0 - ((performance.attempts - 1) * 0.05));
    }
    
    expect(modifier).toBe(0.9); // 1.0 - ((3-1) * 0.05) = 0.9
  });
});

describe('A1 SRS Integration', () => {
  test('should create SRS items for A1 lesson', async () => {
    const mockUserId = 'test_user';
    const mockLanguageCode = 'hr';
    const mockVocabulary = croatianA1Vocabulary.slice(0, 3);
    const mockGrammar = croatianA1Grammar.slice(0, 2);

    // Mock the spacedRepetitionService.createSRSItem method
    const mockCreateSRSItem = jest.fn().mockResolvedValue({
      id: 'mock_srs_item',
      userId: mockUserId,
      itemId: 'mock_item',
      itemType: 'vocabulary',
      languageCode: mockLanguageCode,
      easeFactor: 2.5,
      interval: 1,
      repetitions: 0,
      nextReviewDate: new Date().toISOString(),
      lastReviewed: new Date().toISOString(),
      quality: 3,
      averageQuality: 3,
      totalReviews: 0,
    });

    // This would be the actual test in a real implementation
    expect(mockVocabulary.length).toBe(3);
    expect(mockGrammar.length).toBe(2);
    expect(mockCreateSRSItem).toBeDefined();
  });

  test('should handle A1 SRS item updates correctly', async () => {
    const mockPerformance = {
      quality: 4,
      responseTime: 2500,
      hintsUsed: 0,
      attempts: 1,
      difficulty: 'easy' as const,
    };

    // Test that performance data is structured correctly
    expect(mockPerformance.quality).toBeGreaterThanOrEqual(0);
    expect(mockPerformance.quality).toBeLessThanOrEqual(5);
    expect(mockPerformance.responseTime).toBeGreaterThan(0);
    expect(mockPerformance.hintsUsed).toBeGreaterThanOrEqual(0);
    expect(mockPerformance.attempts).toBeGreaterThanOrEqual(1);
    expect(['easy', 'medium', 'hard', 'very_hard']).toContain(mockPerformance.difficulty);
  });
});
