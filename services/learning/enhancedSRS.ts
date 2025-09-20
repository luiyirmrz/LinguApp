// Enhanced Spaced Repetition System (SRS) Service - Phase 1: Word System + SRS
// Implements advanced SRS algorithm with weighted intervals for difficult words
// Tracks performance and adapts review scheduling based on user behavior

import AsyncStorage from '@react-native-async-storage/async-storage';
import { WordSRS, SRSInterval, WordDifficulty, CEFRLevel } from '@/types/didactic';

// Storage keys
const SRS_ITEMS_KEY = 'linguapp_srs_items';
const SRS_STATS_KEY = 'linguapp_srs_stats';

// SRS Algorithm constants (based on SuperMemo SM-2)
const DEFAULT_EASE_FACTOR = 2.5;
const MIN_EASE_FACTOR = 1.3;
const MAX_EASE_FACTOR = 3.0;
const EASE_FACTOR_ADJUSTMENT = 0.1;

// Interval multipliers for different difficulty levels
const DIFFICULTY_MULTIPLIERS = {
  easy: 1.3,
  medium: 1.0,
  hard: 0.7,
  very_hard: 0.5,
};

// CEFR-ordered vocabulary database (sample)
const CEFR_VOCABULARY: { [level in CEFRLevel]: WordSRS[] } = {
  A1: [
    {
      id: 'hr_a1_dobar_dan',
      word: 'dobar dan',
      translation: 'good afternoon',
      phonetic: 'ˈdɔbar ˈdan',
      audioUrl: 'https://example.com/audio/dobar_dan.mp3',
      exampleSentence: 'Dobar dan, kako ste?',
      exampleTranslation: 'Good afternoon, how are you?',
      cefrLevel: 'A1',
      difficulty: 'easy',
      interval: 1,
      repetitions: 0,
      easeFactor: DEFAULT_EASE_FACTOR,
      nextReview: new Date().toISOString(),
      correctCount: 0,
      incorrectCount: 0,
      averageResponseTime: 0,
      tags: ['greeting', 'basic', 'polite'],
      category: 'greetings',
      imageUrl: 'https://example.com/images/greeting.jpg',
    },
    {
      id: 'hr_a1_hvala',
      word: 'hvala',
      translation: 'thank you',
      phonetic: 'ˈxvala',
      audioUrl: 'https://example.com/audio/hvala.mp3',
      exampleSentence: 'Hvala vam puno!',
      exampleTranslation: 'Thank you very much!',
      cefrLevel: 'A1',
      difficulty: 'easy',
      interval: 1,
      repetitions: 0,
      easeFactor: DEFAULT_EASE_FACTOR,
      nextReview: new Date().toISOString(),
      correctCount: 0,
      incorrectCount: 0,
      averageResponseTime: 0,
      tags: ['gratitude', 'basic', 'polite'],
      category: 'expressions',
      imageUrl: 'https://example.com/images/thank_you.jpg',
    },
  ],
  A2: [
    {
      id: 'hr_a2_obitelj',
      word: 'obitelj',
      translation: 'family',
      phonetic: 'ˈɔbitɛʎ',
      audioUrl: 'https://example.com/audio/obitelj.mp3',
      exampleSentence: 'Moja obitelj je velika.',
      exampleTranslation: 'My family is big.',
      cefrLevel: 'A2',
      difficulty: 'medium',
      interval: 1,
      repetitions: 0,
      easeFactor: DEFAULT_EASE_FACTOR,
      nextReview: new Date().toISOString(),
      correctCount: 0,
      incorrectCount: 0,
      averageResponseTime: 0,
      tags: ['family', 'relationships', 'noun'],
      category: 'family',
      imageUrl: 'https://example.com/images/family.jpg',
    },
  ],
  B1: [
    {
      id: 'hr_b1_obrazovanje',
      word: 'obrazovanje',
      translation: 'education',
      phonetic: 'ɔbraˈzɔvaɲɛ',
      audioUrl: 'https://example.com/audio/obrazovanje.mp3',
      exampleSentence: 'Obrazovanje je vrlo važno.',
      exampleTranslation: 'Education is very important.',
      cefrLevel: 'B1',
      difficulty: 'medium',
      interval: 1,
      repetitions: 0,
      easeFactor: DEFAULT_EASE_FACTOR,
      nextReview: new Date().toISOString(),
      correctCount: 0,
      incorrectCount: 0,
      averageResponseTime: 0,
      tags: ['education', 'abstract', 'noun'],
      category: 'education',
      imageUrl: 'https://example.com/images/education.jpg',
    },
  ],
  B2: [],
  C1: [],
  C2: [],
};

interface SRSStats {
  userId: string;
  totalWords: number;
  wordsLearned: number;
  wordsReviewed: number;
  averageAccuracy: number;
  totalReviewTime: number;
  streakDays: number;
  lastReviewDate: string;
  dailyGoal: number;
  weeklyGoal: number;
}

class EnhancedSRSService {
  
  // Initialize SRS for a user with CEFR-ordered vocabulary
  static async initializeSRS(userId: string, startingLevel: CEFRLevel): Promise<void> {
    try {
      console.debug(`Initializing SRS for user ${userId} at level ${startingLevel}`);
      
      // Get vocabulary for starting level and below
      const levelOrder: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
      const startingIndex = levelOrder.indexOf(startingLevel);
      
      let initialVocabulary: WordSRS[] = [];
      
      // Add vocabulary from current level and previous levels
      for (let i = 0; i <= startingIndex; i++) {
        const levelVocab = CEFR_VOCABULARY[levelOrder[i]] || [];
        initialVocabulary = [...initialVocabulary, ...levelVocab];
      }
      
      // Initialize each word with user-specific data
      const userSRSItems = initialVocabulary.map(word => ({
        ...word,
        nextReview: new Date().toISOString(), // Available immediately
        lastReviewed: undefined,
      }));
      
      // Save to storage
      await AsyncStorage.setItem(
        `${SRS_ITEMS_KEY}_${userId}`,
        JSON.stringify(userSRSItems),
      );
      
      // Initialize stats
      const initialStats: SRSStats = {
        userId,
        totalWords: userSRSItems.length,
        wordsLearned: 0,
        wordsReviewed: 0,
        averageAccuracy: 0,
        totalReviewTime: 0,
        streakDays: 0,
        lastReviewDate: '',
        dailyGoal: 20, // words per day
        weeklyGoal: 100, // words per week
      };
      
      await AsyncStorage.setItem(
        `${SRS_STATS_KEY}_${userId}`,
        JSON.stringify(initialStats),
      );
      
      console.debug(`SRS initialized with ${userSRSItems.length} words`);
    } catch (error) {
      console.error('Error initializing SRS:', error);
      throw new Error('Failed to initialize SRS');
    }
  }
  
  // Get words due for review
  static async getWordsForReview(userId: string, limit: number = 20): Promise<WordSRS[]> {
    try {
      const srsItems = await this.getSRSItems(userId);
      const now = new Date();
      
      // Filter words due for review
      const dueWords = srsItems.filter(word => {
        const reviewDate = new Date(word.nextReview);
        return reviewDate <= now;
      });
      
      // Sort by priority: overdue first, then by difficulty, then by ease factor
      const sortedWords = dueWords.sort((a, b) => {
        const aOverdue = now.getTime() - new Date(a.nextReview).getTime();
        const bOverdue = now.getTime() - new Date(b.nextReview).getTime();
        
        // Prioritize overdue words
        if (aOverdue !== bOverdue) {
          return bOverdue - aOverdue; // More overdue first
        }
        
        // Then prioritize difficult words
        const difficultyOrder = { very_hard: 4, hard: 3, medium: 2, easy: 1 };
        const aDifficultyScore = difficultyOrder[a.difficulty];
        const bDifficultyScore = difficultyOrder[b.difficulty];
        
        if (aDifficultyScore !== bDifficultyScore) {
          return bDifficultyScore - aDifficultyScore;
        }
        
        // Finally, prioritize words with lower ease factor (more difficult)
        return a.easeFactor - b.easeFactor;
      });
      
      console.debug(`Found ${dueWords.length} words due for review, returning ${Math.min(limit, sortedWords.length)}`);
      
      return sortedWords.slice(0, limit);
    } catch (error) {
      console.error('Error getting words for review:', error);
      return [];
    }
  }
  
  // Process review result and update SRS data
  static async processReviewResult(
    userId: string,
    wordId: string,
    isCorrect: boolean,
    responseTime: number, // in milliseconds
    quality: number = 3, // 0-5 scale (0=blackout, 5=perfect)
  ): Promise<void> {
    try {
      console.debug(`Processing review result for word ${wordId}: ${isCorrect ? 'correct' : 'incorrect'}`);
      
      const srsItems = await this.getSRSItems(userId);
      const wordIndex = srsItems.findIndex(item => item.id === wordId);
      
      if (wordIndex === -1) {
        throw new Error(`Word ${wordId} not found in SRS items`);
      }
      
      const word = srsItems[wordIndex];
      
      // Update performance tracking
      if (isCorrect) {
        word.correctCount += 1;
      } else {
        word.incorrectCount += 1;
      }
      
      // Update average response time
      const totalAttempts = word.correctCount + word.incorrectCount;
      word.averageResponseTime = (
        (word.averageResponseTime * (totalAttempts - 1) + responseTime) / totalAttempts
      );
      
      // Calculate new interval and ease factor using SM-2 algorithm
      const { newInterval, newEaseFactor, newRepetitions } = this.calculateSRSParameters(
        word.interval,
        word.easeFactor,
        word.repetitions,
        quality,
        word.difficulty,
      );
      
      // Update word data
      word.interval = newInterval;
      word.easeFactor = newEaseFactor;
      word.repetitions = newRepetitions;
      word.lastReviewed = new Date().toISOString();
      
      // Calculate next review date
      const nextReviewDate = new Date();
      nextReviewDate.setDate(nextReviewDate.getDate() + newInterval);
      word.nextReview = nextReviewDate.toISOString();
      
      // Update difficulty based on performance
      word.difficulty = this.updateWordDifficulty(word);
      
      // Save updated items
      await AsyncStorage.setItem(
        `${SRS_ITEMS_KEY}_${userId}`,
        JSON.stringify(srsItems),
      );
      
      // Update stats
      await this.updateSRSStats(userId, isCorrect, responseTime);
      
      console.debug(`Word ${wordId} updated: next review in ${newInterval} days, ease factor: ${newEaseFactor}`);
    } catch (error) {
      console.error('Error processing review result:', error);
      throw new Error('Failed to process review result');
    }
  }
  
  // Calculate SRS parameters using enhanced SM-2 algorithm
  private static calculateSRSParameters(
    currentInterval: SRSInterval,
    currentEaseFactor: number,
    currentRepetitions: number,
    quality: number,
    difficulty: WordDifficulty,
  ): { newInterval: SRSInterval; newEaseFactor: number; newRepetitions: number } {
    let newEaseFactor = currentEaseFactor;
    let newRepetitions = currentRepetitions;
    let newInterval: SRSInterval;
    
    // Update ease factor based on quality
    if (quality >= 3) {
      // Correct response
      newEaseFactor = Math.min(
        MAX_EASE_FACTOR,
        currentEaseFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)),
      );
      newRepetitions += 1;
    } else {
      // Incorrect response - reset repetitions and decrease ease factor
      newEaseFactor = Math.max(
        MIN_EASE_FACTOR,
        currentEaseFactor - EASE_FACTOR_ADJUSTMENT,
      );
      newRepetitions = 0;
    }
    
    // Calculate new interval
    if (newRepetitions === 0) {
      newInterval = 1; // Review again tomorrow
    } else if (newRepetitions === 1) {
      newInterval = 3; // Review in 3 days
    } else {
      // Use ease factor and difficulty multiplier
      const baseInterval = Math.round(currentInterval * newEaseFactor);
      const difficultyMultiplier = DIFFICULTY_MULTIPLIERS[difficulty];
      const adjustedInterval = Math.round(baseInterval * difficultyMultiplier);
      
      // Ensure interval is within valid range
      const validIntervals: SRSInterval[] = [1, 3, 7, 14, 30, 90, 180, 365];
      newInterval = validIntervals.find(interval => interval >= adjustedInterval) || 365;
    }
    
    return { newInterval, newEaseFactor, newRepetitions };
  }
  
  // Update word difficulty based on performance
  private static updateWordDifficulty(word: WordSRS): WordDifficulty {
    const totalAttempts = word.correctCount + word.incorrectCount;
    
    if (totalAttempts < 3) {
      return word.difficulty; // Not enough data
    }
    
    const accuracy = word.correctCount / totalAttempts;
    const avgResponseTime = word.averageResponseTime;
    
    // Classify difficulty based on accuracy and response time
    if (accuracy >= 0.9 && avgResponseTime < 3000) {
      return 'easy';
    } else if (accuracy >= 0.7 && avgResponseTime < 5000) {
      return 'medium';
    } else if (accuracy >= 0.5) {
      return 'hard';
    } else {
      return 'very_hard';
    }
  }
  
  // Get all SRS items for user
  static async getSRSItems(userId: string): Promise<WordSRS[]> {
    try {
      const itemsData = await AsyncStorage.getItem(`${SRS_ITEMS_KEY}_${userId}`);
      return itemsData ? JSON.parse(itemsData) : [];
    } catch (error) {
      console.error('Error getting SRS items:', error);
      return [];
    }
  }
  
  // Get SRS statistics
  static async getSRSStats(userId: string): Promise<SRSStats | null> {
    try {
      const statsData = await AsyncStorage.getItem(`${SRS_STATS_KEY}_${userId}`);
      return statsData ? JSON.parse(statsData) : null;
    } catch (error) {
      console.error('Error getting SRS stats:', error);
      return null;
    }
  }
  
  // Update SRS statistics
  private static async updateSRSStats(
    userId: string,
    isCorrect: boolean,
    responseTime: number,
  ): Promise<void> {
    try {
      const stats = await this.getSRSStats(userId);
      if (!stats) return;
      
      // Update review count
      stats.wordsReviewed += 1;
      
      // Update accuracy
      const totalReviews = stats.wordsReviewed;
      const previousCorrect = Math.round(stats.averageAccuracy * (totalReviews - 1) / 100);
      const newCorrect = previousCorrect + (isCorrect ? 1 : 0);
      stats.averageAccuracy = (newCorrect / totalReviews) * 100;
      
      // Update total review time
      stats.totalReviewTime += responseTime;
      
      // Update streak
      const today = new Date().toDateString();
      const lastReviewDate = stats.lastReviewDate ? new Date(stats.lastReviewDate).toDateString() : '';
      
      if (lastReviewDate !== today) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        
        if (lastReviewDate === yesterday.toDateString()) {
          stats.streakDays += 1;
        } else if (lastReviewDate !== today) {
          stats.streakDays = 1; // Reset streak
        }
        
        stats.lastReviewDate = new Date().toISOString();
      }
      
      // Save updated stats
      await AsyncStorage.setItem(
        `${SRS_STATS_KEY}_${userId}`,
        JSON.stringify(stats),
      );
    } catch (error) {
      console.error('Error updating SRS stats:', error);
    }
  }
  
  // Get learning progress summary
  static async getProgressSummary(userId: string): Promise<{
    totalWords: number;
    wordsLearned: number;
    wordsReviewed: number;
    averageAccuracy: number;
    streakDays: number;
    dueToday: number;
    overdue: number;
    difficultyBreakdown: { [key in WordDifficulty]: number };
  }> {
    try {
      const srsItems = await this.getSRSItems(userId);
      const stats = await this.getSRSStats(userId);
      const now = new Date();
      
      // Count words due today and overdue
      let dueToday = 0;
      let overdue = 0;
      
      const difficultyBreakdown: { [key in WordDifficulty]: number } = {
        easy: 0,
        medium: 0,
        hard: 0,
        very_hard: 0,
      };
      
      srsItems.forEach(word => {
        const reviewDate = new Date(word.nextReview);
        const today = new Date();
        today.setHours(23, 59, 59, 999); // End of today
        
        if (reviewDate <= today) {
          dueToday += 1;
          
          if (reviewDate < now) {
            overdue += 1;
          }
        }
        
        difficultyBreakdown[word.difficulty] += 1;
      });
      
      // Count words learned (words with at least 2 correct reviews)
      const wordsLearned = srsItems.filter(word => 
        word.correctCount >= 2 && word.repetitions >= 2,
      ).length;
      
      return {
        totalWords: srsItems.length,
        wordsLearned,
        wordsReviewed: stats?.wordsReviewed || 0,
        averageAccuracy: stats?.averageAccuracy || 0,
        streakDays: stats?.streakDays || 0,
        dueToday,
        overdue,
        difficultyBreakdown,
      };
    } catch (error) {
      console.error('Error getting progress summary:', error);
      return {
        totalWords: 0,
        wordsLearned: 0,
        wordsReviewed: 0,
        averageAccuracy: 0,
        streakDays: 0,
        dueToday: 0,
        overdue: 0,
        difficultyBreakdown: { easy: 0, medium: 0, hard: 0, very_hard: 0 },
      };
    }
  }
}

export default EnhancedSRSService;
export { EnhancedSRSService };
