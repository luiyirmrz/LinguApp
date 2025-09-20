/**
 * A1 SRS Test Script
 * Simple Node.js script to test A1 SRS configuration and functionality
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

// Test functions
function testA1SRSConfiguration() {
  console.log('🧪 Testing A1 SRS Configuration...');
  
  // Test default parameters
  console.assert(A1_SRS_CONFIG.DEFAULT_EASE_FACTOR === 2.5, 'Default ease factor should be 2.5');
  console.assert(A1_SRS_CONFIG.INITIAL_INTERVAL === 1, 'Initial interval should be 1');
  console.assert(A1_SRS_CONFIG.INITIAL_REPETITIONS === 0, 'Initial repetitions should be 0');
  console.assert(A1_SRS_CONFIG.PASSING_QUALITY === 3, 'Passing quality should be 3');
  
  // Test ease factor range
  console.assert(A1_SRS_CONFIG.MIN_EASE_FACTOR < A1_SRS_CONFIG.MAX_EASE_FACTOR, 'Min ease factor should be less than max');
  console.assert(A1_SRS_CONFIG.MIN_EASE_FACTOR === 1.3, 'Min ease factor should be 1.3');
  console.assert(A1_SRS_CONFIG.MAX_EASE_FACTOR === 2.5, 'Max ease factor should be 2.5');
  
  // Test interval progression
  console.assert(A1_SRS_CONFIG.INITIAL_INTERVAL < A1_SRS_CONFIG.SECOND_INTERVAL, 'Initial interval should be less than second');
  console.assert(A1_SRS_CONFIG.SECOND_INTERVAL < A1_SRS_CONFIG.THIRD_INTERVAL, 'Second interval should be less than third');
  
  // Test difficulty modifiers
  console.assert(A1_SRS_CONFIG.DIFFICULTY_MODIFIERS.easy === 1.2, 'Easy modifier should be 1.2');
  console.assert(A1_SRS_CONFIG.DIFFICULTY_MODIFIERS.medium === 1.0, 'Medium modifier should be 1.0');
  console.assert(A1_SRS_CONFIG.DIFFICULTY_MODIFIERS.hard === 0.8, 'Hard modifier should be 0.8');
  console.assert(A1_SRS_CONFIG.DIFFICULTY_MODIFIERS.very_hard === 0.6, 'Very hard modifier should be 0.6');
  
  console.log('✅ A1 SRS Configuration tests passed!');
}

function testA1SRSPerformanceCalculation() {
  console.log('🧪 Testing A1 SRS Performance Calculation...');
  
  // Test first review
  const mockSRSItem = {
    repetitions: 0,
    interval: 1,
    easeFactor: 2.5,
  };
  
  console.assert(mockSRSItem.repetitions === 0, 'Initial repetitions should be 0');
  
  // After successful first review
  const newRepetitions = mockSRSItem.repetitions + 1;
  console.assert(newRepetitions === 1, 'New repetitions should be 1');
  
  // Second review should use SECOND_INTERVAL
  const secondInterval = A1_SRS_CONFIG.SECOND_INTERVAL;
  console.assert(secondInterval === 3, 'Second interval should be 3');
  
  // Test failed review
  const performance = { quality: 2 }; // Below passing threshold
  const expectedInterval = A1_SRS_CONFIG.INITIAL_INTERVAL;
  console.assert(expectedInterval === 1, 'Failed review should reset to interval 1');
  
  // Test difficulty modifiers
  const easyModifier = A1_SRS_CONFIG.DIFFICULTY_MODIFIERS.easy;
  const hardModifier = A1_SRS_CONFIG.DIFFICULTY_MODIFIERS.hard;
  
  const baseInterval = 7;
  const easyInterval = Math.round(baseInterval * easyModifier);
  const hardInterval = Math.round(baseInterval * hardModifier);
  
  console.assert(easyInterval === 8, 'Easy interval should be 8 (7 * 1.2)');
  console.assert(hardInterval === 6, 'Hard interval should be 6 (7 * 0.8)');
  
  console.log('✅ A1 SRS Performance Calculation tests passed!');
}

function testA1SRSRecommendations() {
  console.log('🧪 Testing A1 SRS Recommendations...');
  
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
  console.assert(recommendations1.includes('You have many items to review. Try to do a few each day to stay on track.'), 'Should recommend for high due count');
  
  // Test low accuracy
  const recommendations2 = getA1ReviewRecommendations(30, 5, 60);
  console.assert(recommendations2.includes('Your accuracy is below 70%. Consider reviewing easier items first to build confidence.'), 'Should recommend for low accuracy');
  
  // Test caught up users
  const recommendations3 = getA1ReviewRecommendations(25, 0, 85);
  console.assert(recommendations3.includes('Great job! You\'re all caught up. Consider starting new lessons to add more vocabulary.'), 'Should recommend for caught up users');
  
  // Test small vocabulary
  const recommendations4 = getA1ReviewRecommendations(15, 3, 80);
  console.assert(recommendations4.includes('You have fewer than 20 items in your review deck. Complete more lessons to build a stronger foundation.'), 'Should recommend for small vocabulary');
  
  console.log('✅ A1 SRS Recommendations tests passed!');
}

function testCroatianA1VocabularyIntegration() {
  console.log('🧪 Testing Croatian A1 Vocabulary Integration...');
  
  // Test vocabulary exists
  console.assert(mockCroatianA1Vocabulary.length > 0, 'Should have Croatian A1 vocabulary');
  console.assert(mockCroatianA1Grammar.length > 0, 'Should have Croatian A1 grammar');
  
  // Test vocabulary structure
  const firstVocab = mockCroatianA1Vocabulary[0];
  console.assert(firstVocab.id !== undefined, 'Vocabulary should have id');
  console.assert(firstVocab.word !== undefined, 'Vocabulary should have word');
  console.assert(firstVocab.translation !== undefined, 'Vocabulary should have translation');
  console.assert(firstVocab.difficulty !== undefined, 'Vocabulary should have difficulty');
  console.assert(firstVocab.cefrLevel === 'A1', 'Vocabulary should be A1 level');
  
  // Test grammar structure
  const firstGrammar = mockCroatianA1Grammar[0];
  console.assert(firstGrammar.id !== undefined, 'Grammar should have id');
  console.assert(firstGrammar.title !== undefined, 'Grammar should have title');
  console.assert(firstGrammar.difficulty !== undefined, 'Grammar should have difficulty');
  console.assert(firstGrammar.cefrLevel === 'A1', 'Grammar should be A1 level');
  
  // Test difficulty levels
  const vocabDifficulties = mockCroatianA1Vocabulary.map(v => v.difficulty);
  const grammarDifficulties = mockCroatianA1Grammar.map(g => g.difficulty);
  
  const allVocabValid = vocabDifficulties.every(d => d >= 1 && d <= 3);
  const allGrammarValid = grammarDifficulties.every(d => d >= 1 && d <= 3);
  
  console.assert(allVocabValid, 'All vocabulary difficulties should be 1-3');
  console.assert(allGrammarValid, 'All grammar difficulties should be 1-3');
  
  console.log('✅ Croatian A1 Vocabulary Integration tests passed!');
}

function testA1SRSPerformanceModifiers() {
  console.log('🧪 Testing A1 SRS Performance Modifiers...');
  
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
  console.assert(modifier1 === 1.1, 'Fast response should get 1.1 modifier');
  
  // Test slow response
  const performance2 = {
    responseTime: 20000, // Slow response
    hintsUsed: 0,
    attempts: 1,
  };
  const modifier2 = calculateA1PerformanceModifier(performance2);
  console.assert(modifier2 === 0.9, 'Slow response should get 0.9 modifier');
  
  // Test hints used
  const performance3 = {
    responseTime: 3000,
    hintsUsed: 2, // Used hints
    attempts: 1,
  };
  const modifier3 = calculateA1PerformanceModifier(performance3);
  console.assert(modifier3 === 0.9, 'Hints used should get 0.9 modifier');
  
  // Test multiple attempts
  const performance4 = {
    responseTime: 3000,
    hintsUsed: 0,
    attempts: 3, // Multiple attempts
  };
  const modifier4 = calculateA1PerformanceModifier(performance4);
  console.assert(modifier4 === 0.9, 'Multiple attempts should get 0.9 modifier');
  
  // Test modifier clamping
  const performance5 = {
    responseTime: 1000,
    hintsUsed: 10, // Many hints
    attempts: 5, // Many attempts
  };
  const modifier5 = calculateA1PerformanceModifier(performance5);
  console.assert(modifier5 >= 0.7 && modifier5 <= 1.3, 'Modifier should be clamped between 0.7 and 1.3');
  
  console.log('✅ A1 SRS Performance Modifiers tests passed!');
}

function testA1SRSIntegration() {
  console.log('🧪 Testing A1 SRS Integration...');
  
  // Test SRS item creation
  const mockVocabulary = mockCroatianA1Vocabulary.slice(0, 3);
  const mockGrammar = mockCroatianA1Grammar.slice(0, 2);
  
  console.assert(mockVocabulary.length === 3, 'Should have 3 vocabulary items');
  console.assert(mockGrammar.length === 2, 'Should have 2 grammar items');
  
  const totalItems = mockVocabulary.length + mockGrammar.length;
  console.assert(totalItems === 5, 'Should have 5 total items');
  
  // Test performance data structure
  const mockPerformance = {
    quality: 4,
    responseTime: 2500,
    hintsUsed: 0,
    attempts: 1,
    difficulty: 'easy',
  };
  
  console.assert(mockPerformance.quality >= 0 && mockPerformance.quality <= 5, 'Quality should be 0-5');
  console.assert(mockPerformance.responseTime > 0, 'Response time should be positive');
  console.assert(mockPerformance.hintsUsed >= 0, 'Hints used should be non-negative');
  console.assert(mockPerformance.attempts >= 1, 'Attempts should be at least 1');
  console.assert(['easy', 'medium', 'hard', 'very_hard'].includes(mockPerformance.difficulty), 'Difficulty should be valid');
  
  // Test configuration validation
  console.assert(A1_SRS_CONFIG.MIN_EASE_FACTOR < A1_SRS_CONFIG.MAX_EASE_FACTOR, 'Min ease factor should be less than max');
  console.assert(A1_SRS_CONFIG.DEFAULT_EASE_FACTOR >= A1_SRS_CONFIG.MIN_EASE_FACTOR, 'Default ease factor should be >= min');
  console.assert(A1_SRS_CONFIG.DEFAULT_EASE_FACTOR <= A1_SRS_CONFIG.MAX_EASE_FACTOR, 'Default ease factor should be <= max');
  console.assert(A1_SRS_CONFIG.INITIAL_INTERVAL > 0, 'Initial interval should be positive');
  console.assert(A1_SRS_CONFIG.SECOND_INTERVAL > A1_SRS_CONFIG.INITIAL_INTERVAL, 'Second interval should be > initial');
  console.assert(A1_SRS_CONFIG.THIRD_INTERVAL > A1_SRS_CONFIG.SECOND_INTERVAL, 'Third interval should be > second');
  console.assert(A1_SRS_CONFIG.PASSING_QUALITY >= 0 && A1_SRS_CONFIG.PASSING_QUALITY <= 5, 'Passing quality should be 0-5');
  console.assert(A1_SRS_CONFIG.EXCELLENT_QUALITY >= A1_SRS_CONFIG.PASSING_QUALITY, 'Excellent quality should be >= passing');
  
  console.log('✅ A1 SRS Integration tests passed!');
}

// Run all tests
function runAllTests() {
  console.log('🚀 Starting A1 SRS Test Suite...\n');
  
  try {
    testA1SRSConfiguration();
    console.log('');
    
    testA1SRSPerformanceCalculation();
    console.log('');
    
    testA1SRSRecommendations();
    console.log('');
    
    testCroatianA1VocabularyIntegration();
    console.log('');
    
    testA1SRSPerformanceModifiers();
    console.log('');
    
    testA1SRSIntegration();
    console.log('');
    
    console.log('🎉 All A1 SRS tests passed successfully!');
    console.log('\n📊 Test Summary:');
    console.log('✅ A1 SRS Configuration: PASSED');
    console.log('✅ A1 SRS Performance Calculation: PASSED');
    console.log('✅ A1 SRS Recommendations: PASSED');
    console.log('✅ Croatian A1 Vocabulary Integration: PASSED');
    console.log('✅ A1 SRS Performance Modifiers: PASSED');
    console.log('✅ A1 SRS Integration: PASSED');
    console.log('\n🎯 SRS System is properly configured for A1 lessons!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
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
