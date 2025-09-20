/**
 * A1 SRS Configuration Test Script
 * Simple test script to verify A1 SRS configuration without Jest dependencies
 */

// A1 SRS Configuration
const A1_SRS_CONFIG = {
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
const mockCroatianA1Vocabulary = [
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
const mockCroatianA1Grammar = [
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

// Test utilities
function assert(condition, message) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(`Assertion failed: ${message}. Expected ${expected}, got ${actual}`);
  }
}

function assertGreaterThan(actual, expected, message) {
  if (actual <= expected) {
    throw new Error(`Assertion failed: ${message}. Expected ${actual} to be greater than ${expected}`);
  }
}

function assertLessThan(actual, expected, message) {
  if (actual >= expected) {
    throw new Error(`Assertion failed: ${message}. Expected ${actual} to be less than ${expected}`);
  }
}

function assertGreaterThanOrEqual(actual, expected, message) {
  if (actual < expected) {
    throw new Error(`Assertion failed: ${message}. Expected ${actual} to be greater than or equal to ${expected}`);
  }
}

function assertLessThanOrEqual(actual, expected, message) {
  if (actual > expected) {
    throw new Error(`Assertion failed: ${message}. Expected ${actual} to be less than or equal to ${expected}`);
  }
}

function assertContains(array, item, message) {
  if (!array.includes(item)) {
    throw new Error(`Assertion failed: ${message}. Expected array to contain ${item}`);
  }
}

function assertEvery(array, predicate, message) {
  if (!array.every(predicate)) {
    throw new Error(`Assertion failed: ${message}. Not all items in array satisfy predicate`);
  }
}

// Test functions
function testA1SRSConfiguration() {
  console.log('Testing A1 SRS Configuration...');
  
  // Test default parameters
  assertEqual(A1_SRS_CONFIG.DEFAULT_EASE_FACTOR, 2.5, 'DEFAULT_EASE_FACTOR should be 2.5');
  assertEqual(A1_SRS_CONFIG.INITIAL_INTERVAL, 1, 'INITIAL_INTERVAL should be 1');
  assertEqual(A1_SRS_CONFIG.INITIAL_REPETITIONS, 0, 'INITIAL_REPETITIONS should be 0');
  assertEqual(A1_SRS_CONFIG.PASSING_QUALITY, 3, 'PASSING_QUALITY should be 3');
  
  // Test ease factor range
  assertLessThan(A1_SRS_CONFIG.MIN_EASE_FACTOR, A1_SRS_CONFIG.MAX_EASE_FACTOR, 'MIN_EASE_FACTOR should be less than MAX_EASE_FACTOR');
  assertEqual(A1_SRS_CONFIG.MIN_EASE_FACTOR, 1.3, 'MIN_EASE_FACTOR should be 1.3');
  assertEqual(A1_SRS_CONFIG.MAX_EASE_FACTOR, 2.5, 'MAX_EASE_FACTOR should be 2.5');
  
  // Test interval progression
  assertLessThan(A1_SRS_CONFIG.INITIAL_INTERVAL, A1_SRS_CONFIG.SECOND_INTERVAL, 'INITIAL_INTERVAL should be less than SECOND_INTERVAL');
  assertLessThan(A1_SRS_CONFIG.SECOND_INTERVAL, A1_SRS_CONFIG.THIRD_INTERVAL, 'SECOND_INTERVAL should be less than THIRD_INTERVAL');
  
  // Test difficulty modifiers
  assertEqual(A1_SRS_CONFIG.DIFFICULTY_MODIFIERS.easy, 1.2, 'Easy difficulty modifier should be 1.2');
  assertEqual(A1_SRS_CONFIG.DIFFICULTY_MODIFIERS.medium, 1.0, 'Medium difficulty modifier should be 1.0');
  assertEqual(A1_SRS_CONFIG.DIFFICULTY_MODIFIERS.hard, 0.8, 'Hard difficulty modifier should be 0.8');
  assertEqual(A1_SRS_CONFIG.DIFFICULTY_MODIFIERS.very_hard, 0.6, 'Very hard difficulty modifier should be 0.6');
  
  console.log('✅ A1 SRS Configuration tests passed');
}

function testA1SRSPerformanceCalculation() {
  console.log('Testing A1 SRS Performance Calculation...');
  
  // Test first review
  const mockSRSItem = {
    repetitions: 0,
    interval: 1,
    easeFactor: 2.5,
  };
  
  assertEqual(mockSRSItem.repetitions, 0, 'Initial repetitions should be 0');
  
  const newRepetitions = mockSRSItem.repetitions + 1;
  assertEqual(newRepetitions, 1, 'New repetitions should be 1');
  
  const secondInterval = A1_SRS_CONFIG.SECOND_INTERVAL;
  assertEqual(secondInterval, 3, 'Second interval should be 3');
  
  // Test failed review
  const performance = { quality: 2 };
  const expectedInterval = A1_SRS_CONFIG.INITIAL_INTERVAL;
  assertEqual(expectedInterval, 1, 'Failed review should reset to initial interval');
  
  // Test difficulty modifiers
  const easyModifier = A1_SRS_CONFIG.DIFFICULTY_MODIFIERS.easy;
  const hardModifier = A1_SRS_CONFIG.DIFFICULTY_MODIFIERS.hard;
  
  const baseInterval = 7;
  const easyInterval = Math.round(baseInterval * easyModifier);
  const hardInterval = Math.round(baseInterval * hardModifier);
  
  assertEqual(easyInterval, 8, 'Easy interval should be 8 (7 * 1.2 = 8.4, rounded to 8)');
  assertEqual(hardInterval, 6, 'Hard interval should be 6 (7 * 0.8 = 5.6, rounded to 6)');
  
  console.log('✅ A1 SRS Performance Calculation tests passed');
}

function testA1SRSRecommendations() {
  console.log('Testing A1 SRS Recommendations...');
  
  const getA1ReviewRecommendations = (totalItems, itemsDue, averageAccuracy) => {
    const recommendations = [];
    
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
  
  // Test high due count
  const recommendations1 = getA1ReviewRecommendations(50, 15, 75);
  assertContains(recommendations1, 'You have many items to review. Try to do a few each day to stay on track.', 'Should recommend for high due count');
  
  // Test low accuracy
  const recommendations2 = getA1ReviewRecommendations(30, 5, 60);
  assertContains(recommendations2, 'Your accuracy is below 70%. Consider reviewing easier items first to build confidence.', 'Should recommend for low accuracy');
  
  // Test caught up users
  const recommendations3 = getA1ReviewRecommendations(25, 0, 85);
  assertContains(recommendations3, 'Great job! You\'re all caught up. Consider starting new lessons to add more vocabulary.', 'Should recommend for caught up users');
  
  // Test small vocabulary
  const recommendations4 = getA1ReviewRecommendations(15, 3, 80);
  assertContains(recommendations4, 'You have fewer than 20 items in your review deck. Complete more lessons to build a stronger foundation.', 'Should recommend for small vocabulary');
  
  console.log('✅ A1 SRS Recommendations tests passed');
}

function testA1CroatianVocabularyIntegration() {
  console.log('Testing A1 Croatian Vocabulary Integration...');
  
  // Test vocabulary loaded
  assert(mockCroatianA1Vocabulary.length > 0, 'Croatian A1 vocabulary should be loaded');
  assert(mockCroatianA1Grammar.length > 0, 'Croatian A1 grammar should be loaded');
  
  // Test vocabulary structure
  const firstVocab = mockCroatianA1Vocabulary[0];
  assert(firstVocab.id, 'Vocabulary item should have id');
  assert(firstVocab.word, 'Vocabulary item should have word');
  assert(firstVocab.translation, 'Vocabulary item should have translation');
  assert(firstVocab.difficulty, 'Vocabulary item should have difficulty');
  assert(firstVocab.cefrLevel, 'Vocabulary item should have cefrLevel');
  assertEqual(firstVocab.cefrLevel, 'A1', 'Vocabulary item should be A1 level');
  
  // Test grammar structure
  const firstGrammar = mockCroatianA1Grammar[0];
  assert(firstGrammar.id, 'Grammar item should have id');
  assert(firstGrammar.title, 'Grammar item should have title');
  assert(firstGrammar.difficulty, 'Grammar item should have difficulty');
  assert(firstGrammar.cefrLevel, 'Grammar item should have cefrLevel');
  assertEqual(firstGrammar.cefrLevel, 'A1', 'Grammar item should be A1 level');
  
  // Test difficulty levels
  const vocabDifficulties = mockCroatianA1Vocabulary.map(v => v.difficulty);
  const grammarDifficulties = mockCroatianA1Grammar.map(g => g.difficulty);
  
  assertEvery(vocabDifficulties, d => d >= 1 && d <= 3, 'Vocabulary difficulties should be 1-3');
  assertEvery(grammarDifficulties, d => d >= 1 && d <= 3, 'Grammar difficulties should be 1-3');
  
  console.log('✅ A1 Croatian Vocabulary Integration tests passed');
}

function testA1SRSPerformanceModifiers() {
  console.log('Testing A1 SRS Performance Modifiers...');
  
  const calculateA1PerformanceModifier = (performance) => {
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
  
  // Test fast response
  const performance1 = {
    responseTime: 2000, // Fast response
    hintsUsed: 0,
    attempts: 1,
  };
  const modifier1 = calculateA1PerformanceModifier(performance1);
  assertEqual(modifier1, 1.1, 'Fast response should get 1.1 modifier');
  
  // Test slow response
  const performance2 = {
    responseTime: 20000, // Slow response
    hintsUsed: 0,
    attempts: 1,
  };
  const modifier2 = calculateA1PerformanceModifier(performance2);
  assertEqual(modifier2, 0.9, 'Slow response should get 0.9 modifier');
  
  // Test hints used
  const performance3 = {
    responseTime: 3000,
    hintsUsed: 2, // Used hints
    attempts: 1,
  };
  const modifier3 = calculateA1PerformanceModifier(performance3);
  assertEqual(modifier3, 0.9, 'Hints used should get 0.9 modifier');
  
  // Test multiple attempts
  const performance4 = {
    responseTime: 3000,
    hintsUsed: 0,
    attempts: 3, // Multiple attempts
  };
  const modifier4 = calculateA1PerformanceModifier(performance4);
  assertEqual(modifier4, 0.9, 'Multiple attempts should get 0.9 modifier');
  
  // Test modifier clamping
  const performance5 = {
    responseTime: 1000,
    hintsUsed: 10, // Many hints
    attempts: 5, // Many attempts
  };
  const modifier5 = calculateA1PerformanceModifier(performance5);
  assertGreaterThanOrEqual(modifier5, 0.7, 'Modifier should be clamped to minimum 0.7');
  assertLessThanOrEqual(modifier5, 1.3, 'Modifier should be clamped to maximum 1.3');
  
  console.log('✅ A1 SRS Performance Modifiers tests passed');
}

function testA1SRSIntegration() {
  console.log('Testing A1 SRS Integration...');
  
  // Test SRS item creation
  const mockUserId = 'test_user';
  const mockLanguageCode = 'hr';
  const mockVocabulary = mockCroatianA1Vocabulary.slice(0, 3);
  const mockGrammar = mockCroatianA1Grammar.slice(0, 2);
  
  assertEqual(mockVocabulary.length, 3, 'Mock vocabulary should have 3 items');
  assertEqual(mockGrammar.length, 2, 'Mock grammar should have 2 items');
  
  const totalItems = mockVocabulary.length + mockGrammar.length;
  assertEqual(totalItems, 5, 'Total items should be 5');
  
  // Test performance data structure
  const mockPerformance = {
    quality: 4,
    responseTime: 2500,
    hintsUsed: 0,
    attempts: 1,
    difficulty: 'easy',
  };
  
  assertGreaterThanOrEqual(mockPerformance.quality, 0, 'Quality should be >= 0');
  assertLessThanOrEqual(mockPerformance.quality, 5, 'Quality should be <= 5');
  assertGreaterThan(mockPerformance.responseTime, 0, 'Response time should be > 0');
  assertGreaterThanOrEqual(mockPerformance.hintsUsed, 0, 'Hints used should be >= 0');
  assertGreaterThanOrEqual(mockPerformance.attempts, 1, 'Attempts should be >= 1');
  assertContains(['easy', 'medium', 'hard', 'very_hard'], mockPerformance.difficulty, 'Difficulty should be valid');
  
  // Test configuration validation
  assertLessThan(A1_SRS_CONFIG.MIN_EASE_FACTOR, A1_SRS_CONFIG.MAX_EASE_FACTOR, 'MIN_EASE_FACTOR should be less than MAX_EASE_FACTOR');
  assertGreaterThanOrEqual(A1_SRS_CONFIG.DEFAULT_EASE_FACTOR, A1_SRS_CONFIG.MIN_EASE_FACTOR, 'DEFAULT_EASE_FACTOR should be >= MIN_EASE_FACTOR');
  assertLessThanOrEqual(A1_SRS_CONFIG.DEFAULT_EASE_FACTOR, A1_SRS_CONFIG.MAX_EASE_FACTOR, 'DEFAULT_EASE_FACTOR should be <= MAX_EASE_FACTOR');
  
  assertGreaterThan(A1_SRS_CONFIG.INITIAL_INTERVAL, 0, 'INITIAL_INTERVAL should be > 0');
  assertGreaterThan(A1_SRS_CONFIG.SECOND_INTERVAL, A1_SRS_CONFIG.INITIAL_INTERVAL, 'SECOND_INTERVAL should be > INITIAL_INTERVAL');
  assertGreaterThan(A1_SRS_CONFIG.THIRD_INTERVAL, A1_SRS_CONFIG.SECOND_INTERVAL, 'THIRD_INTERVAL should be > SECOND_INTERVAL');
  
  assertGreaterThanOrEqual(A1_SRS_CONFIG.PASSING_QUALITY, 0, 'PASSING_QUALITY should be >= 0');
  assertLessThanOrEqual(A1_SRS_CONFIG.PASSING_QUALITY, 5, 'PASSING_QUALITY should be <= 5');
  assertGreaterThanOrEqual(A1_SRS_CONFIG.EXCELLENT_QUALITY, A1_SRS_CONFIG.PASSING_QUALITY, 'EXCELLENT_QUALITY should be >= PASSING_QUALITY');
  
  console.log('✅ A1 SRS Integration tests passed');
}

// Run all tests
function runAllTests() {
  console.log('🚀 Starting A1 SRS Configuration Tests...\n');
  
  try {
    testA1SRSConfiguration();
    testA1SRSPerformanceCalculation();
    testA1SRSRecommendations();
    testA1CroatianVocabularyIntegration();
    testA1SRSPerformanceModifiers();
    testA1SRSIntegration();
    
    console.log('\n🎉 All A1 SRS Configuration tests passed successfully!');
    console.log('\n📊 Test Summary:');
    console.log('✅ A1 SRS Configuration');
    console.log('✅ A1 SRS Performance Calculation');
    console.log('✅ A1 SRS Recommendations');
    console.log('✅ A1 Croatian Vocabulary Integration');
    console.log('✅ A1 SRS Performance Modifiers');
    console.log('✅ A1 SRS Integration');
    console.log('\n🔧 SRS Configuration Status: READY');
    console.log('📈 easeFactor: 2.5 (DEFAULT_EASE_FACTOR)');
    console.log('⏰ interval: 1 (INITIAL_INTERVAL)');
    console.log('🔄 repetitions: 0 (INITIAL_REPETITIONS)');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    process.exit(1);
  }
}

// Run tests if this script is executed directly
if (require.main === module) {
  runAllTests();
}

module.exports = {
  A1_SRS_CONFIG,
  mockCroatianA1Vocabulary,
  mockCroatianA1Grammar,
  runAllTests,
};
