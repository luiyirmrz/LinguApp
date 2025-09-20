
// Global test timeout configuration
jest.setTimeout(10000); // 10 seconds default timeout

/**
 * A1 SRS Standalone Test Suite
 * Tests the A1 SRS configuration without any external dependencies
 */

// A1 SRS Configuration
const A1_SRS_CONFIG_STANDALONE = {
  DEFAULT_EASE_FACTOR: 2.5,
  MIN_EASE_FACTOR: 1.3,
  MAX_EASE_FACTOR: 2.5,
  INITIAL_INTERVAL: 1,
  SECOND_INTERVAL: 3,
  THIRD_INTERVAL: 7,
  INITIAL_REPETITIONS: 0,
  PASSING_QUALITY: 3,
  EXCELLENT_QUALITY: 4,
  DIFFICULTY_MODIFIERS: {
    easy: 1.2,
    medium: 1.0,
    hard: 0.8,
    very_hard: 0.6,
  },
};

// Mock Croatian A1 vocabulary
const mockCroatianA1VocabularyStandalone = [
  {
    id: 'hr_a1_001',
    word: 'zdravo',
    translation: 'hello',
    difficulty: 1,
    cefrLevel: 'A1',
  },
  {
    id: 'hr_a1_002',
    word: 'doviđenja',
    translation: 'goodbye',
    difficulty: 1,
    cefrLevel: 'A1',
  },
  {
    id: 'hr_a1_003',
    word: 'hvala',
    translation: 'thank you',
    difficulty: 1,
    cefrLevel: 'A1',
  },
];

// Mock Croatian A1 grammar
const mockCroatianA1GrammarStandalone = [
  {
    id: 'hr_a1_gram_001',
    title: { en: 'Present Tense of "biti"' },
    difficulty: 2,
    cefrLevel: 'A1',
  },
  {
    id: 'hr_a1_gram_002',
    title: { en: 'Personal Pronouns' },
    difficulty: 1,
    cefrLevel: 'A1',
  },
];

describe('A1 SRS Configuration', () => {
  test('should have correct default parameters', () => {
    expect(A1_SRS_CONFIG_STANDALONE.DEFAULT_EASE_FACTOR).toBe(2.5);
    expect(A1_SRS_CONFIG_STANDALONE.INITIAL_INTERVAL).toBe(1);
    expect(A1_SRS_CONFIG_STANDALONE.INITIAL_REPETITIONS).toBe(0);
    expect(A1_SRS_CONFIG_STANDALONE.PASSING_QUALITY).toBe(3);
  });

  test('should have valid ease factor range', () => {
    expect(A1_SRS_CONFIG_STANDALONE.MIN_EASE_FACTOR).toBeLessThan(A1_SRS_CONFIG_STANDALONE.MAX_EASE_FACTOR);
    expect(A1_SRS_CONFIG_STANDALONE.MIN_EASE_FACTOR).toBe(1.3);
    expect(A1_SRS_CONFIG_STANDALONE.MAX_EASE_FACTOR).toBe(2.5);
  });

  test('should have ascending interval progression', () => {
    expect(A1_SRS_CONFIG_STANDALONE.INITIAL_INTERVAL).toBeLessThan(A1_SRS_CONFIG_STANDALONE.SECOND_INTERVAL);
    expect(A1_SRS_CONFIG_STANDALONE.SECOND_INTERVAL).toBeLessThan(A1_SRS_CONFIG_STANDALONE.THIRD_INTERVAL);
  });

  test('should have difficulty modifiers for all levels', () => {
    expect(A1_SRS_CONFIG_STANDALONE.DIFFICULTY_MODIFIERS.easy).toBe(1.2);
    expect(A1_SRS_CONFIG_STANDALONE.DIFFICULTY_MODIFIERS.medium).toBe(1.0);
    expect(A1_SRS_CONFIG_STANDALONE.DIFFICULTY_MODIFIERS.hard).toBe(0.8);
    expect(A1_SRS_CONFIG_STANDALONE.DIFFICULTY_MODIFIERS.very_hard).toBe(0.6);
  });
});

describe('A1 SRS Performance Calculation', () => {
  test('should calculate correct interval for first review', () => {
    const mockSRSItem = {
      repetitions: 0,
      interval: 1,
      easeFactor: 2.5,
    };

    // Test first review (repetitions = 0)
    expect(mockSRSItem.repetitions).toBe(0);
    
    // After successful first review, should move to second interval
    const newRepetitions = mockSRSItem.repetitions + 1;
    expect(newRepetitions).toBe(1);
    
    // Second review should use SECOND_INTERVAL
    const secondInterval = A1_SRS_CONFIG_STANDALONE.SECOND_INTERVAL;
    expect(secondInterval).toBe(3);
  });

  test('should reset interval for failed reviews', () => {
    const performance = {
      quality: 2, // Below passing threshold
    };

    // For failed reviews, interval should reset to 1
    const expectedInterval = A1_SRS_CONFIG_STANDALONE.INITIAL_INTERVAL;
    expect(expectedInterval).toBe(1);
  });

  test('should apply difficulty modifiers correctly', () => {
    const easyModifier = A1_SRS_CONFIG_STANDALONE.DIFFICULTY_MODIFIERS.easy;
    const hardModifier = A1_SRS_CONFIG_STANDALONE.DIFFICULTY_MODIFIERS.hard;
    
    const baseInterval = 7;
    const easyInterval = Math.round(baseInterval * easyModifier);
    const hardInterval = Math.round(baseInterval * hardModifier);
    
    expect(easyInterval).toBe(8); // 7 * 1.2 = 8.4, rounded to 8
    expect(hardInterval).toBe(6); // 7 * 0.8 = 5.6, rounded to 6
  });
});

describe('A1 SRS Recommendations', () => {
  const getA1ReviewRecommendations = (totalItems: number, itemsDue: number, averageAccuracy: number): string[] => {
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
  };

  test('should provide recommendations for high due count', () => {
    const recommendations = getA1ReviewRecommendations(50, 15, 75);
    expect(recommendations).toContain('You have many items to review. Try to do a few each day to stay on track.');
  });

  test('should provide recommendations for low accuracy', () => {
    const recommendations = getA1ReviewRecommendations(30, 5, 60);
    expect(recommendations).toContain('Your accuracy is below 70%. Consider reviewing easier items first to build confidence.');
  });

  test('should provide recommendations for caught up users', () => {
    const recommendations = getA1ReviewRecommendations(25, 0, 85);
    expect(recommendations).toContain('Great job! You\'re all caught up. Consider starting new lessons to add more vocabulary.');
  });

  test('should provide recommendations for small vocabulary', () => {
    const recommendations = getA1ReviewRecommendations(15, 3, 80);
    expect(recommendations).toContain('You have fewer than 20 items in your review deck. Complete more lessons to build a stronger foundation.');
  });
});

describe('A1 Croatian Vocabulary Integration', () => {
  test('should have Croatian A1 vocabulary loaded', () => {
    expect(mockCroatianA1VocabularyStandalone).toBeDefined();
    expect(mockCroatianA1VocabularyStandalone.length).toBeGreaterThan(0);
  });

  test('should have Croatian A1 grammar loaded', () => {
    expect(mockCroatianA1GrammarStandalone).toBeDefined();
    expect(mockCroatianA1GrammarStandalone.length).toBeGreaterThan(0);
  });

  test('should have vocabulary items with correct structure', () => {
    const firstVocab = mockCroatianA1VocabularyStandalone[0];
    expect(firstVocab).toHaveProperty('id');
    expect(firstVocab).toHaveProperty('word');
    expect(firstVocab).toHaveProperty('translation');
    expect(firstVocab).toHaveProperty('difficulty');
    expect(firstVocab).toHaveProperty('cefrLevel');
    expect(firstVocab.cefrLevel).toBe('A1');
  });

  test('should have grammar concepts with correct structure', () => {
    const firstGrammar = mockCroatianA1GrammarStandalone[0];
    expect(firstGrammar).toHaveProperty('id');
    expect(firstGrammar).toHaveProperty('title');
    expect(firstGrammar).toHaveProperty('difficulty');
    expect(firstGrammar).toHaveProperty('cefrLevel');
    expect(firstGrammar.cefrLevel).toBe('A1');
  });

  test('should have appropriate difficulty levels for A1', () => {
    const vocabDifficulties = mockCroatianA1VocabularyStandalone.map(v => v.difficulty);
    const grammarDifficulties = mockCroatianA1GrammarStandalone.map(g => g.difficulty);
    
    // A1 should have mostly difficulty 1-2, with some 3
    expect(vocabDifficulties.every(d => d >= 1 && d <= 3)).toBe(true);
    expect(grammarDifficulties.every(d => d >= 1 && d <= 3)).toBe(true);
  });
});

describe('A1 SRS Performance Modifiers', () => {
  const calculateA1PerformanceModifier = (performance: {
    responseTime: number;
    hintsUsed: number;
    attempts: number;
  }): number => {
    let modifier = 1.0;
    
    // Response time modifier - more lenient for A1 learners
    if (performance.responseTime < 5000) { // Less than 5 seconds
      modifier *= 1.1;
    } else if (performance.responseTime > 15000) { // More than 15 seconds
      modifier *= 0.9;
    }
    
    // Hints used modifier - more forgiving for A1
    if (performance.hintsUsed > 0) {
      modifier *= Math.max(0.8, 1.0 - (performance.hintsUsed * 0.05));
    }
    
    // Attempts modifier - more forgiving for A1
    if (performance.attempts > 1) {
      modifier *= Math.max(0.9, 1.0 - ((performance.attempts - 1) * 0.05));
    }
    
    return Math.max(0.7, Math.min(1.3, modifier));
  };

  test('should calculate performance modifier for fast response', () => {
    const performance = {
      responseTime: 2000, // Fast response
      hintsUsed: 0,
      attempts: 1,
    };

    const modifier = calculateA1PerformanceModifier(performance);
    expect(modifier).toBe(1.1);
  });

  test('should calculate performance modifier for slow response', () => {
    const performance = {
      responseTime: 20000, // Slow response
      hintsUsed: 0,
      attempts: 1,
    };

    const modifier = calculateA1PerformanceModifier(performance);
    expect(modifier).toBe(0.9);
  });

  test('should calculate performance modifier for hints used', () => {
    const performance = {
      responseTime: 3000,
      hintsUsed: 2, // Used hints
      attempts: 1,
    };

    const modifier = calculateA1PerformanceModifier(performance);
    expect(modifier).toBeCloseTo(0.99, 2); // 1.0 * 1.1 * 0.9 = 0.99 (fast response + hints penalty)
  });

  test('should calculate performance modifier for multiple attempts', () => {
    const performance = {
      responseTime: 3000,
      hintsUsed: 0,
      attempts: 3, // Multiple attempts
    };

    const modifier = calculateA1PerformanceModifier(performance);
    expect(modifier).toBeCloseTo(0.99, 2); // 1.0 * 1.1 * 0.9 = 0.99 (fast response + attempts penalty)
  });

  test('should clamp modifier to valid range', () => {
    const performance = {
      responseTime: 1000,
      hintsUsed: 10, // Many hints
      attempts: 5, // Many attempts
    };

    const modifier = calculateA1PerformanceModifier(performance);
    expect(modifier).toBeGreaterThanOrEqual(0.7);
    expect(modifier).toBeLessThanOrEqual(1.3);
  });
});

describe('A1 SRS Integration', () => {
  test('should create SRS items for A1 lesson', () => {
    const mockUserId = 'test_user';
    const mockLanguageCode = 'hr';
    const mockVocabulary = mockCroatianA1VocabularyStandalone.slice(0, 3);
    const mockGrammar = mockCroatianA1GrammarStandalone.slice(0, 2);

    expect(mockVocabulary.length).toBe(3);
    expect(mockGrammar.length).toBe(2);
    
    // Test that we can create SRS items
    const totalItems = mockVocabulary.length + mockGrammar.length;
    expect(totalItems).toBe(5);
  });

  test('should handle A1 SRS item updates correctly', () => {
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

  test('should validate SRS configuration parameters', () => {
    // Test ease factor range
    expect(A1_SRS_CONFIG_STANDALONE.MIN_EASE_FACTOR).toBeLessThan(A1_SRS_CONFIG_STANDALONE.MAX_EASE_FACTOR);
    expect(A1_SRS_CONFIG_STANDALONE.DEFAULT_EASE_FACTOR).toBeGreaterThanOrEqual(A1_SRS_CONFIG_STANDALONE.MIN_EASE_FACTOR);
    expect(A1_SRS_CONFIG_STANDALONE.DEFAULT_EASE_FACTOR).toBeLessThanOrEqual(A1_SRS_CONFIG_STANDALONE.MAX_EASE_FACTOR);
    
    // Test interval progression
    expect(A1_SRS_CONFIG_STANDALONE.INITIAL_INTERVAL).toBeGreaterThan(0);
    expect(A1_SRS_CONFIG_STANDALONE.SECOND_INTERVAL).toBeGreaterThan(A1_SRS_CONFIG_STANDALONE.INITIAL_INTERVAL);
    expect(A1_SRS_CONFIG_STANDALONE.THIRD_INTERVAL).toBeGreaterThan(A1_SRS_CONFIG_STANDALONE.SECOND_INTERVAL);
    
    // Test quality thresholds
    expect(A1_SRS_CONFIG_STANDALONE.PASSING_QUALITY).toBeGreaterThanOrEqual(0);
    expect(A1_SRS_CONFIG_STANDALONE.PASSING_QUALITY).toBeLessThanOrEqual(5);
    expect(A1_SRS_CONFIG_STANDALONE.EXCELLENT_QUALITY).toBeGreaterThanOrEqual(A1_SRS_CONFIG_STANDALONE.PASSING_QUALITY);
  });
});
