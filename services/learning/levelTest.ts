// Level Test Service - Phase 1: Initial CEFR Level Assessment
// Provides adaptive level testing to determine user's starting CEFR level
// Includes vocabulary, grammar, listening, and reading assessments

import AsyncStorage from '@react-native-async-storage/async-storage';
import { CEFRLevel, LevelTestQuestion, LevelTestResult, DifficultyLevel } from '@/types/didactic';

// Storage keys
const LEVEL_TEST_RESULTS_KEY = 'linguapp_level_test_results';
const LEVEL_TEST_QUESTIONS_KEY = 'linguapp_level_test_questions';

// CEFR Level scoring thresholds
const CEFR_THRESHOLDS = {
  A1: { min: 0, max: 30 },
  A2: { min: 31, max: 50 },
  B1: { min: 51, max: 70 },
  B2: { min: 71, max: 85 },
  C1: { min: 86, max: 95 },
  C2: { min: 96, max: 100 },
};

// Sample level test questions for different languages
const SAMPLE_QUESTIONS: { [languageCode: string]: LevelTestQuestion[] } = {
  hr: [ // Croatian
    {
      id: 'hr_vocab_a1_1',
      cefrLevel: 'A1',
      type: 'vocabulary',
      question: 'What does "Dobar dan" mean?',
      options: ['Good morning', 'Good afternoon', 'Good evening', 'Good night'],
      correctAnswer: 'Good afternoon',
      explanation: '"Dobar dan" is the standard Croatian greeting used during the day.',
      difficulty: 2,
      weight: 1,
    },
    {
      id: 'hr_vocab_a1_2',
      cefrLevel: 'A1',
      type: 'vocabulary',
      question: 'How do you say "thank you" in Croatian?',
      options: ['Molim', 'Hvala', 'Izvinite', 'Doviđenja'],
      correctAnswer: 'Hvala',
      explanation: '"Hvala" means "thank you" in Croatian.',
      difficulty: 1,
      weight: 1,
    },
    {
      id: 'hr_grammar_a2_1',
      cefrLevel: 'A2',
      type: 'grammar',
      question: 'Complete: "Ja _____ student." (I am a student)',
      options: ['sam', 'si', 'je', 'smo'],
      correctAnswer: 'sam',
      explanation: '"Sam" is the first person singular form of the verb "biti" (to be).',
      difficulty: 3,
      weight: 1.2,
    },
    {
      id: 'hr_vocab_b1_1',
      cefrLevel: 'B1',
      type: 'vocabulary',
      question: 'What does "obrazovanje" mean?',
      options: ['Education', 'Employment', 'Entertainment', 'Environment'],
      correctAnswer: 'Education',
      explanation: '"Obrazovanje" means education or schooling.',
      difficulty: 5,
      weight: 1.5,
    },
    {
      id: 'hr_grammar_b2_1',
      cefrLevel: 'B2',
      type: 'grammar',
      question: 'Choose the correct conditional form: "Da sam imao vremena, _____ došao."',
      options: ['bih', 'bi', 'bio bih', 'budem'],
      correctAnswer: 'bio bih',
      explanation: 'This is the conditional perfect form in Croatian.',
      difficulty: 7,
      weight: 2,
    },
  ],
  es: [ // Spanish
    {
      id: 'es_vocab_a1_1',
      cefrLevel: 'A1',
      type: 'vocabulary',
      question: 'What does "Hola" mean?',
      options: ['Goodbye', 'Hello', 'Please', 'Thank you'],
      correctAnswer: 'Hello',
      explanation: '"Hola" is the most common Spanish greeting.',
      difficulty: 1,
      weight: 1,
    },
    {
      id: 'es_grammar_a2_1',
      cefrLevel: 'A2',
      type: 'grammar',
      question: 'Complete: "Yo _____ español." (I speak Spanish)',
      options: ['hablo', 'hablas', 'habla', 'hablamos'],
      correctAnswer: 'hablo',
      explanation: '"Hablo" is the first person singular form of "hablar" (to speak).',
      difficulty: 3,
      weight: 1.2,
    },
  ],
  fr: [ // French
    {
      id: 'fr_vocab_a1_1',
      cefrLevel: 'A1',
      type: 'vocabulary',
      question: 'What does "Bonjour" mean?',
      options: ['Good evening', 'Hello/Good morning', 'Goodbye', 'Good night'],
      correctAnswer: 'Hello/Good morning',
      explanation: '"Bonjour" is used to greet someone during the day.',
      difficulty: 1,
      weight: 1,
    },
  ],
};

class LevelTestService {
  
  // Generate adaptive level test based on target language
  static async generateLevelTest(targetLanguage: string, maxQuestions: number = 20): Promise<LevelTestQuestion[]> {
    try {
      console.debug(`Generating level test for ${targetLanguage} with ${maxQuestions} questions`);
      
      const questions = SAMPLE_QUESTIONS[targetLanguage] || SAMPLE_QUESTIONS['hr'];
      
      // Sort questions by difficulty and CEFR level
      const sortedQuestions = [...questions].sort((a, b) => {
        const levelOrder = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
        const aLevelIndex = levelOrder.indexOf(a.cefrLevel);
        const bLevelIndex = levelOrder.indexOf(b.cefrLevel);
        
        if (aLevelIndex !== bLevelIndex) {
          return aLevelIndex - bLevelIndex;
        }
        
        return a.difficulty - b.difficulty;
      });
      
      // Select questions adaptively (start easy, increase difficulty)
      const selectedQuestions = sortedQuestions.slice(0, Math.min(maxQuestions, sortedQuestions.length));
      
      // Store questions for later reference
      await AsyncStorage.setItem(
        `${LEVEL_TEST_QUESTIONS_KEY}_${targetLanguage}`,
        JSON.stringify(selectedQuestions),
      );
      
      return selectedQuestions;
    } catch (error) {
      console.error('Error generating level test:', error);
      throw new Error('Failed to generate level test');
    }
  }
  
  // Calculate CEFR level based on test results
  static calculateCEFRLevel(answers: { questionId: string; userAnswer: string; isCorrect: boolean; timeSpent: number }[]): LevelTestResult {
    console.debug('Calculating CEFR level from test results');
    
    // Calculate scores by skill type
    const skillScores: { [skill: string]: { correct: number; total: number; weightedScore: number } } = {
      vocabulary: { correct: 0, total: 0, weightedScore: 0 },
      grammar: { correct: 0, total: 0, weightedScore: 0 },
      listening: { correct: 0, total: 0, weightedScore: 0 },
      reading: { correct: 0, total: 0, weightedScore: 0 },
    };
    
    let totalWeightedScore = 0;
    let totalWeight = 0;
    
    // Process each answer
    answers.forEach(answer => {
      // Find the question (in a real app, this would come from the stored questions)
      const questionId = answer.questionId;
      const skill = questionId.includes('vocab') ? 'vocabulary' : 
                   questionId.includes('grammar') ? 'grammar' :
                   questionId.includes('listening') ? 'listening' : 'reading';
      
      // Estimate question weight and difficulty from ID
      const weight = questionId.includes('a1') ? 1 :
                    questionId.includes('a2') ? 1.2 :
                    questionId.includes('b1') ? 1.5 :
                    questionId.includes('b2') ? 2 :
                    questionId.includes('c1') ? 2.5 : 3;
      
      skillScores[skill].total += 1;
      totalWeight += weight;
      
      if (answer.isCorrect) {
        skillScores[skill].correct += 1;
        skillScores[skill].weightedScore += weight;
        totalWeightedScore += weight;
      }
    });
    
    // Calculate percentage scores
    const vocabularyScore = skillScores.vocabulary.total > 0 ? 
      (skillScores.vocabulary.correct / skillScores.vocabulary.total) * 100 : 0;
    const grammarScore = skillScores.grammar.total > 0 ? 
      (skillScores.grammar.correct / skillScores.grammar.total) * 100 : 0;
    const listeningScore = skillScores.listening.total > 0 ? 
      (skillScores.listening.correct / skillScores.listening.total) * 100 : 0;
    const readingScore = skillScores.reading.total > 0 ? 
      (skillScores.reading.correct / skillScores.reading.total) * 100 : 0;
    
    // Calculate overall weighted score
    const overallScore = totalWeight > 0 ? (totalWeightedScore / totalWeight) * 100 : 0;
    
    // Determine CEFR level
    let estimatedLevel: CEFRLevel = 'A1';
    let confidence = 0.5;
    
    for (const [level, threshold] of Object.entries(CEFR_THRESHOLDS)) {
      if (overallScore >= threshold.min && overallScore <= threshold.max) {
        estimatedLevel = level as CEFRLevel;
        // Higher confidence for scores in the middle of the range
        const rangeSize = threshold.max - threshold.min;
        const distanceFromCenter = Math.abs(overallScore - (threshold.min + rangeSize / 2));
        confidence = Math.max(0.3, 1 - (distanceFromCenter / (rangeSize / 2)) * 0.4);
        break;
      }
    }
    
    // Analyze strengths and weaknesses
    const skillAnalysis = [
      {
        skill: 'vocabulary',
        level: this.scoreToLevel(vocabularyScore),
        strengths: vocabularyScore >= 70 ? ['Word recognition', 'Basic vocabulary'] : [],
        weaknesses: vocabularyScore < 50 ? ['Limited vocabulary', 'Word meaning'] : [],
      },
      {
        skill: 'grammar',
        level: this.scoreToLevel(grammarScore),
        strengths: grammarScore >= 70 ? ['Sentence structure', 'Grammar rules'] : [],
        weaknesses: grammarScore < 50 ? ['Grammar patterns', 'Verb conjugation'] : [],
      },
      {
        skill: 'listening',
        level: this.scoreToLevel(listeningScore),
        strengths: listeningScore >= 70 ? ['Audio comprehension'] : [],
        weaknesses: listeningScore < 50 ? ['Listening skills', 'Audio processing'] : [],
      },
      {
        skill: 'reading',
        level: this.scoreToLevel(readingScore),
        strengths: readingScore >= 70 ? ['Text comprehension'] : [],
        weaknesses: readingScore < 50 ? ['Reading comprehension', 'Text analysis'] : [],
      },
    ];
    
    // Generate recommendations
    const suggestedFocusAreas: string[] = [];
    if (vocabularyScore < 60) suggestedFocusAreas.push('vocabulary');
    if (grammarScore < 60) suggestedFocusAreas.push('grammar');
    if (listeningScore < 60) suggestedFocusAreas.push('listening');
    if (readingScore < 60) suggestedFocusAreas.push('reading');
    
    // Recommend starting level (slightly below estimated for confidence)
    const levelOrder: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
    const estimatedIndex = levelOrder.indexOf(estimatedLevel);
    const recommendedStartingLevel = estimatedIndex > 0 && confidence < 0.7 ? 
      levelOrder[estimatedIndex - 1] : estimatedLevel;
    
    const result: LevelTestResult = {
      userId: 'current_user', // Will be set by caller
      testId: `test_${Date.now()}`,
      vocabularyScore,
      grammarScore,
      listeningScore,
      readingScore,
      overallScore,
      estimatedLevel,
      confidence,
      skillAnalysis,
      recommendedStartingLevel,
      suggestedFocusAreas,
      completedAt: new Date().toISOString(),
      duration: 0, // Will be calculated by caller
      questionsAnswered: answers.length,
      totalQuestions: answers.length,
    };
    
    console.debug('Level test result:', {
      estimatedLevel,
      confidence,
      overallScore,
      recommendedStartingLevel,
    });
    
    return result;
  }
  
  // Convert score to CEFR level
  private static scoreToLevel(score: number): CEFRLevel {
    if (score >= 96) return 'C2';
    if (score >= 86) return 'C1';
    if (score >= 71) return 'B2';
    if (score >= 51) return 'B1';
    if (score >= 31) return 'A2';
    return 'A1';
  }
  
  // Save level test result
  static async saveLevelTestResult(result: LevelTestResult): Promise<void> {
    try {
      console.debug('Saving level test result');
      
      // Get existing results
      const existingResults = await this.getLevelTestResults(result.userId);
      
      // Add new result
      const updatedResults = [...existingResults, result];
      
      // Save to storage
      await AsyncStorage.setItem(
        `${LEVEL_TEST_RESULTS_KEY}_${result.userId}`,
        JSON.stringify(updatedResults),
      );
      
      console.debug('Level test result saved successfully');
    } catch (error) {
      console.error('Error saving level test result:', error);
      throw new Error('Failed to save level test result');
    }
  }
  
  // Get level test results for user
  static async getLevelTestResults(userId: string): Promise<LevelTestResult[]> {
    try {
      const resultsData = await AsyncStorage.getItem(`${LEVEL_TEST_RESULTS_KEY}_${userId}`);
      return resultsData ? JSON.parse(resultsData) : [];
    } catch (error) {
      console.error('Error getting level test results:', error);
      return [];
    }
  }
  
  // Get latest level test result
  static async getLatestLevelTestResult(userId: string): Promise<LevelTestResult | null> {
    try {
      const results = await this.getLevelTestResults(userId);
      return results.length > 0 ? results[results.length - 1] : null;
    } catch (error) {
      console.error('Error getting latest level test result:', error);
      return null;
    }
  }
  
  // Determine if user needs to take level test
  static async needsLevelTest(userId: string): Promise<boolean> {
    try {
      const latestResult = await this.getLatestLevelTestResult(userId);
      
      if (!latestResult) {
        return true; // No test taken yet
      }
      
      // Check if test is older than 6 months
      const testDate = new Date(latestResult.completedAt);
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      
      return testDate < sixMonthsAgo;
    } catch (error) {
      console.error('Error checking if level test needed:', error);
      return true; // Default to needing test
    }
  }
  
  // Convert difficulty level to CEFR level
  static difficultyToLevel(difficulty: DifficultyLevel): CEFRLevel {
    switch (difficulty) {
      case 'beginner': return 'A1';
      case 'intermediate': return 'B1';
      case 'advanced': return 'C1';
      default: return 'A1';
    }
  }
  
  // Convert CEFR level to difficulty level
  static levelToDifficulty(level: CEFRLevel): DifficultyLevel {
    switch (level) {
      case 'A1':
      case 'A2':
        return 'beginner';
      case 'B1':
      case 'B2':
        return 'intermediate';
      case 'C1':
      case 'C2':
        return 'advanced';
      default:
        return 'beginner';
    }
  }
  
  // Get recommended daily XP based on level and commitment
  static getRecommendedDailyXP(level: CEFRLevel, dailyCommitment: number): number {
    const baseXP = {
      A1: 50,
      A2: 75,
      B1: 100,
      B2: 125,
      C1: 150,
      C2: 175,
    };
    
    // Adjust based on daily commitment (minutes)
    const commitmentMultiplier = Math.max(0.5, Math.min(2, dailyCommitment / 30));
    
    return Math.round(baseXP[level] * commitmentMultiplier);
  }
}

export default LevelTestService;
export { LevelTestService };
