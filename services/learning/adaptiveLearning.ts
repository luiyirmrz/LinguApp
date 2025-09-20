// Adaptive Learning Service - Phase 2: Active Learning with Personalization
// Combines level testing, SRS, and user performance to create adaptive learning experiences
// Implements micro-conversations, multisensory exercises, and pronunciation feedback

import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  AdaptiveExercise, 
  MicroConversation, 
  UserPerformanceAnalytics, 
  CEFRLevel, 
  DifficultyLevel,
  LearningGoal,
  PracticeMode,
  OnboardingProfile,
  WordSRS,
  PronunciationFeedback,
} from '@/types/didactic';
import { LevelTestService } from './levelTest';
import { EnhancedSRSService } from './enhancedSRS';

// Storage keys
const ADAPTIVE_PROFILE_KEY = 'linguapp_adaptive_profile';
const PERFORMANCE_ANALYTICS_KEY = 'linguapp_performance_analytics';
const EXERCISE_HISTORY_KEY = 'linguapp_exercise_history';

// Exercise difficulty adjustment constants
const DIFFICULTY_ADJUSTMENT_THRESHOLD = 0.1;
const MIN_EXERCISES_FOR_ADJUSTMENT = 5;
const TARGET_ACCURACY = 0.75;

// Sample micro-conversations for different scenarios
const MICRO_CONVERSATIONS: { [scenario: string]: MicroConversation[] } = {
  'ordering_coffee': [
    {
      id: 'coffee_basic_a1',
      title: 'Ordering Coffee - Basic',
      scenario: 'You want to order a simple coffee at a café',
      cefrLevel: 'A1',
      difficulty: 'beginner',
      culturalContext: 'In Croatia, coffee culture is very important. People often sit and enjoy their coffee slowly.',
      completionRate: 0,
      averageAccuracy: 0,
      messages: [
        {
          id: 'msg_1',
          speaker: 'npc',
          text: 'Dobar dan! Što želite?',
          audioUrl: 'https://example.com/audio/dobar_dan_sto_zelite.mp3',
          culturalNote: 'Waiters in Croatia are usually polite and patient with tourists.',
        },
        {
          id: 'msg_2',
          speaker: 'user',
          text: '',
          options: [
            {
              id: 'opt_1',
              text: 'Jednu kavu, molim.',
              isCorrect: true,
              feedback: 'Perfect! This is the most common way to order coffee.',
              nextMessageId: 'msg_3',
            },
            {
              id: 'opt_2',
              text: 'Kava jedan, molim.',
              isCorrect: false,
              feedback: 'Close, but the correct order is "Jednu kavu, molim." - feminine noun comes first.',
              nextMessageId: 'msg_3',
            },
            {
              id: 'opt_3',
              text: 'Ja hoću kava.',
              isCorrect: false,
              feedback: 'This is too direct. Use "molim" (please) to be polite.',
              nextMessageId: 'msg_3',
            },
          ],
          hints: ['Use "molim" to be polite', 'Coffee is feminine in Croatian (kava)'],
        },
        {
          id: 'msg_3',
          speaker: 'npc',
          text: 'Izvrsno! Odmah dolazi.',
          audioUrl: 'https://example.com/audio/izvrsno_odmah_dolazi.mp3',
        },
      ],
    },
  ],
};

// Sample adaptive exercises
const ADAPTIVE_EXERCISES: { [category: string]: AdaptiveExercise[] } = {
  vocabulary: [
    {
      id: 'vocab_flashcard_a1_1',
      type: 'flashcard',
      cefrLevel: 'A1',
      difficulty: 'beginner',
      question: 'What does "hvala" mean?',
      options: ['Hello', 'Goodbye', 'Thank you', 'Please'],
      correctAnswer: 'Thank you',
      explanation: '"Hvala" is the most common way to say thank you in Croatian.',
      audioUrl: 'https://example.com/audio/hvala.mp3',
      imageUrl: 'https://example.com/images/thank_you.jpg',
      adaptiveDifficulty: 0.3,
      prerequisites: [],
      averageAccuracy: 0,
      averageTime: 0,
      tags: ['basic', 'politeness', 'expressions'],
      category: 'vocabulary',
      estimatedTime: 10,
    },
  ],
  pronunciation: [
    {
      id: 'pronunciation_a1_1',
      type: 'pronunciation',
      cefrLevel: 'A1',
      difficulty: 'beginner',
      question: 'Pronounce: "Dobar dan"',
      correctAnswer: 'dobar dan',
      explanation: 'Focus on the rolled "r" sound and clear vowels.',
      audioUrl: 'https://example.com/audio/dobar_dan.mp3',
      adaptiveDifficulty: 0.4,
      prerequisites: [],
      averageAccuracy: 0,
      averageTime: 0,
      tags: ['pronunciation', 'greetings'],
      category: 'pronunciation',
      estimatedTime: 15,
    },
  ],
};

interface ExerciseResult {
  exerciseId: string;
  userId: string;
  isCorrect: boolean;
  responseTime: number;
  accuracy: number;
  difficulty: number;
  timestamp: string;
  hints_used: number;
}

class AdaptiveLearningService {
  
  // Initialize adaptive learning profile based on onboarding
  static async initializeAdaptiveProfile(
    userId: string, 
    onboardingProfile: OnboardingProfile,
  ): Promise<void> {
    try {
      console.debug('Initializing adaptive learning profile for user:', userId);
      
      // Determine starting CEFR level
      let startingLevel: CEFRLevel;
      
      if (onboardingProfile.hasCompletedTest && onboardingProfile.initialCEFRLevel) {
        startingLevel = onboardingProfile.initialCEFRLevel;
      } else {
        // Convert difficulty level to CEFR level
        startingLevel = LevelTestService.difficultyToLevel(onboardingProfile.languageLevel);
      }
      
      // Initialize SRS with appropriate vocabulary
      await EnhancedSRSService.initializeSRS(userId, startingLevel);
      
      // Create initial performance analytics
      const initialAnalytics: UserPerformanceAnalytics = {
        userId,
        currentCEFRLevel: startingLevel,
        estimatedCEFRLevel: startingLevel,
        strengths: [],
        weaknesses: [],
        skillBreakdown: {
          vocabulary: 50,
          grammar: 50,
          listening: 50,
          speaking: 50,
          reading: 50,
          writing: 50,
        },
        optimalStudyTime: onboardingProfile.availableTime,
        averageSessionLength: onboardingProfile.dailyCommitment,
        preferredExerciseTypes: this.mapPracticeModesToExerciseTypes(onboardingProfile.preferredModes),
        wordsLearned: 0,
        wordsReviewed: 0,
        lessonsCompleted: 0,
        streakDays: 0,
        nextLevelETA: this.calculateNextLevelETA(startingLevel, onboardingProfile.dailyCommitment),
        recommendedDailyGoal: LevelTestService.getRecommendedDailyXP(startingLevel, onboardingProfile.dailyCommitment),
      };
      
      // Save adaptive profile
      await AsyncStorage.setItem(
        `${ADAPTIVE_PROFILE_KEY}_${userId}`,
        JSON.stringify(onboardingProfile),
      );
      
      // Save performance analytics
      await AsyncStorage.setItem(
        `${PERFORMANCE_ANALYTICS_KEY}_${userId}`,
        JSON.stringify(initialAnalytics),
      );
      
      console.debug('Adaptive learning profile initialized successfully');
    } catch (error) {
      console.error('Error initializing adaptive profile:', error);
      throw new Error('Failed to initialize adaptive learning profile');
    }
  }
  
  // Generate personalized exercise session
  static async generatePersonalizedSession(
    userId: string,
    sessionLength: number = 20, // minutes
    focusAreas?: string[],
  ): Promise<{
    exercises: AdaptiveExercise[];
    conversations: MicroConversation[];
    srsWords: WordSRS[];
    estimatedTime: number;
    sessionGoals: string[];
  }> {
    try {
      console.debug(`Generating personalized session for user ${userId}`);
      
      const profile = await this.getAdaptiveProfile(userId);
      const analytics = await this.getPerformanceAnalytics(userId);
      
      if (!profile || !analytics) {
        throw new Error('User profile or analytics not found');
      }
      
      // Get SRS words due for review
      const srsWords = await EnhancedSRSService.getWordsForReview(userId, 10);
      
      // Determine focus areas based on weaknesses or user preference
      const targetAreas = focusAreas || this.identifyWeakAreas(analytics);
      
      // Generate exercises based on preferences and weaknesses
      const exercises = await this.generateAdaptiveExercises(
        userId,
        targetAreas,
        analytics.currentCEFRLevel,
        profile.preferredModes,
      );
      
      // Select appropriate micro-conversations
      const conversations = this.selectMicroConversations(
        analytics.currentCEFRLevel,
        profile.learningGoals,
      );
      
      // Calculate session goals
      const sessionGoals = this.generateSessionGoals(
        targetAreas,
        srsWords.length,
        exercises.length,
      );
      
      // Estimate total time
      const estimatedTime = this.calculateSessionTime(exercises, conversations, srsWords);
      
      console.debug(`Generated session with ${exercises.length} exercises, ${conversations.length} conversations, ${srsWords.length} SRS words`);
      
      return {
        exercises,
        conversations,
        srsWords,
        estimatedTime,
        sessionGoals,
      };
    } catch (error) {
      console.error('Error generating personalized session:', error);
      throw new Error('Failed to generate personalized session');
    }
  }
  
  // Process exercise result and update adaptive difficulty
  static async processExerciseResult(
    userId: string,
    exerciseResult: ExerciseResult,
  ): Promise<void> {
    try {
      console.debug(`Processing exercise result for user ${userId}`);
      
      // Save exercise result to history
      await this.saveExerciseResult(userId, exerciseResult);
      
      // Update performance analytics
      await this.updatePerformanceAnalytics(userId, exerciseResult);
      
      console.debug('Exercise result processed successfully');
    } catch (error) {
      console.error('Error processing exercise result:', error);
      throw new Error('Failed to process exercise result');
    }
  }
  
  // Analyze pronunciation and provide feedback
  static async analyzePronunciation(
    userId: string,
    targetPhrase: string,
    audioBlob: Blob,
  ): Promise<PronunciationFeedback> {
    try {
      console.debug(`Analyzing pronunciation for phrase: ${targetPhrase}`);
      
      // In a real implementation, this would use speech recognition API
      // For now, we'll simulate the analysis
      
      // Simulate pronunciation analysis (in real app, use speech recognition service)
      const mockAnalysis = this.simulatePronunciationAnalysis(targetPhrase);
      
      return mockAnalysis;
    } catch (error) {
      console.error('Error analyzing pronunciation:', error);
      throw new Error('Failed to analyze pronunciation');
    }
  }
  
  // Get weakness detection report
  static async getWeaknessReport(userId: string): Promise<{
    weakAreas: { skill: string; severity: number; recommendations: string[] }[];
    strengths: { skill: string; confidence: number }[];
    overallProgress: number;
    recommendations: string[];
  }> {
    try {
      const analytics = await this.getPerformanceAnalytics(userId);
      const exerciseHistory = await this.getExerciseHistory(userId);
      
      if (!analytics) {
        throw new Error('Performance analytics not found');
      }
      
      // Analyze exercise history to identify patterns
      const skillPerformance = this.analyzeSkillPerformance(exerciseHistory);
      
      // Identify weak areas
      const weakAreas = Object.entries(skillPerformance)
        .filter(([_, performance]) => performance.accuracy < 0.6)
        .map(([skill, performance]) => ({
          skill,
          severity: 1 - performance.accuracy,
          recommendations: this.getSkillRecommendations(skill, performance),
        }))
        .sort((a, b) => b.severity - a.severity);
      
      // Identify strengths
      const strengths = Object.entries(skillPerformance)
        .filter(([_, performance]) => performance.accuracy >= 0.8)
        .map(([skill, performance]) => ({
          skill,
          confidence: performance.accuracy,
        }))
        .sort((a, b) => b.confidence - a.confidence);
      
      // Calculate overall progress
      const overallProgress = Object.values(skillPerformance)
        .reduce((sum, perf) => sum + perf.accuracy, 0) / Object.keys(skillPerformance).length;
      
      // Generate general recommendations
      const recommendations = this.generateGeneralRecommendations(weakAreas, analytics);
      
      return {
        weakAreas,
        strengths,
        overallProgress,
        recommendations,
      };
    } catch (error) {
      console.error('Error getting weakness report:', error);
      throw new Error('Failed to generate weakness report');
    }
  }
  
  // Helper methods
  
  private static mapPracticeModesToExerciseTypes(modes: PracticeMode[]): string[] {
    const mapping: { [key in PracticeMode]: string[] } = {
      flashcards: ['flashcard', 'multiple_choice'],
      dictation: ['dictation', 'fill_blank'],
      dialogues: ['dialogue', 'conversation'],
      speaking: ['pronunciation', 'speaking'],
      listening: ['listening', 'multiple_choice'],
      grammar: ['fill_blank', 'multiple_choice'],
      survival: ['survival_scenario', 'conversation'],
    };
    
    return modes.flatMap(mode => mapping[mode] || []);
  }
  
  private static calculateNextLevelETA(currentLevel: CEFRLevel, dailyCommitment: number): string {
    const levelXPRequirements = {
      A1: 1000, A2: 2000, B1: 3500, B2: 5000, C1: 7000, C2: 10000,
    };
    
    const levelOrder: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
    const currentIndex = levelOrder.indexOf(currentLevel);
    
    if (currentIndex === levelOrder.length - 1) {
      return 'Already at highest level';
    }
    
    const nextLevel = levelOrder[currentIndex + 1];
    const xpNeeded = levelXPRequirements[nextLevel];
    const dailyXP = LevelTestService.getRecommendedDailyXP(currentLevel, dailyCommitment);
    
    const daysNeeded = Math.ceil(xpNeeded / dailyXP);
    const etaDate = new Date();
    etaDate.setDate(etaDate.getDate() + daysNeeded);
    
    return etaDate.toISOString();
  }
  
  private static identifyWeakAreas(analytics: UserPerformanceAnalytics): string[] {
    const threshold = 60; // Below 60% is considered weak
    
    return Object.entries(analytics.skillBreakdown)
      .filter(([_, score]) => score < threshold)
      .map(([skill, _]) => skill)
      .sort((a, b) => analytics.skillBreakdown[a as keyof typeof analytics.skillBreakdown] - 
                     analytics.skillBreakdown[b as keyof typeof analytics.skillBreakdown]);
  }
  
  private static async generateAdaptiveExercises(
    userId: string,
    targetAreas: string[],
    cefrLevel: CEFRLevel,
    preferredModes: PracticeMode[],
  ): Promise<AdaptiveExercise[]> {
    // Get user's exercise history to determine difficulty
    const history = await this.getExerciseHistory(userId);
    
    // Select exercises based on target areas and preferences
    const availableExercises = Object.values(ADAPTIVE_EXERCISES).flat()
      .filter(exercise => 
        exercise.cefrLevel === cefrLevel &&
        (targetAreas.length === 0 || targetAreas.includes(exercise.category)),
      );
    
    // Adjust difficulty based on recent performance
    return availableExercises.slice(0, 5).map(exercise => {
      const recentPerformance = this.getRecentPerformanceForCategory(history, exercise.category);
      const adjustedDifficulty = this.calculateAdaptiveDifficulty(exercise.adaptiveDifficulty, recentPerformance);
      
      return {
        ...exercise,
        adaptiveDifficulty: adjustedDifficulty,
      };
    });
  }
  
  private static selectMicroConversations(
    cefrLevel: CEFRLevel,
    learningGoals: LearningGoal[],
  ): MicroConversation[] {
    // Select conversations based on CEFR level and learning goals
    const allConversations = Object.values(MICRO_CONVERSATIONS).flat();
    
    return allConversations
      .filter(conv => conv.cefrLevel === cefrLevel)
      .slice(0, 2); // Limit to 2 conversations per session
  }
  
  private static generateSessionGoals(
    targetAreas: string[],
    srsWordsCount: number,
    exercisesCount: number,
  ): string[] {
    const goals = [];
    
    if (srsWordsCount > 0) {
      goals.push(`Review ${srsWordsCount} vocabulary words`);
    }
    
    if (exercisesCount > 0) {
      goals.push(`Complete ${exercisesCount} exercises`);
    }
    
    if (targetAreas.length > 0) {
      goals.push(`Focus on improving ${targetAreas.join(', ')}`);
    }
    
    return goals;
  }
  
  private static calculateSessionTime(
    exercises: AdaptiveExercise[],
    conversations: MicroConversation[],
    srsWords: WordSRS[],
  ): number {
    const exerciseTime = exercises.reduce((sum, ex) => sum + ex.estimatedTime, 0);
    const conversationTime = conversations.length * 120; // 2 minutes per conversation
    const srsTime = srsWords.length * 15; // 15 seconds per word
    
    return exerciseTime + conversationTime + srsTime;
  }
  
  private static simulatePronunciationAnalysis(targetPhrase: string): PronunciationFeedback {
    // Simulate pronunciation analysis - in real app, use speech recognition API
    const accuracy = Math.random() * 40 + 60; // 60-100% accuracy
    
    return {
      accuracy,
      phonemes: [
        {
          phoneme: 'd',
          accuracy: accuracy + Math.random() * 10 - 5,
          feedback: 'Good pronunciation of the "d" sound',
        },
        {
          phoneme: 'o',
          accuracy: accuracy + Math.random() * 10 - 5,
          feedback: 'Clear vowel sound',
        },
      ],
      overallFeedback: accuracy > 80 ? 'Excellent pronunciation!' : 
                      accuracy > 60 ? 'Good, but could be clearer' : 
                      'Needs improvement',
      suggestions: [
        'Focus on rolling the "r" sound',
        'Make vowels more distinct',
        'Speak more slowly for clarity',
      ],
    };
  }
  
  // Storage methods
  
  private static async getAdaptiveProfile(userId: string): Promise<OnboardingProfile | null> {
    try {
      const profileData = await AsyncStorage.getItem(`${ADAPTIVE_PROFILE_KEY}_${userId}`);
      return profileData ? JSON.parse(profileData) : null;
    } catch (error) {
      console.error('Error getting adaptive profile:', error);
      return null;
    }
  }
  
  private static async getPerformanceAnalytics(userId: string): Promise<UserPerformanceAnalytics | null> {
    try {
      const analyticsData = await AsyncStorage.getItem(`${PERFORMANCE_ANALYTICS_KEY}_${userId}`);
      return analyticsData ? JSON.parse(analyticsData) : null;
    } catch (error) {
      console.error('Error getting performance analytics:', error);
      return null;
    }
  }
  
  private static async getExerciseHistory(userId: string): Promise<ExerciseResult[]> {
    try {
      const historyData = await AsyncStorage.getItem(`${EXERCISE_HISTORY_KEY}_${userId}`);
      return historyData ? JSON.parse(historyData) : [];
    } catch (error) {
      console.error('Error getting exercise history:', error);
      return [];
    }
  }
  
  private static async saveExerciseResult(userId: string, result: ExerciseResult): Promise<void> {
    try {
      const history = await this.getExerciseHistory(userId);
      history.push(result);
      
      // Keep only last 1000 results to manage storage
      const trimmedHistory = history.slice(-1000);
      
      await AsyncStorage.setItem(
        `${EXERCISE_HISTORY_KEY}_${userId}`,
        JSON.stringify(trimmedHistory),
      );
    } catch (error) {
      console.error('Error saving exercise result:', error);
    }
  }
  
  private static async updatePerformanceAnalytics(
    userId: string,
    result: ExerciseResult,
  ): Promise<void> {
    try {
      const analytics = await this.getPerformanceAnalytics(userId);
      if (!analytics) return;
      
      // Update relevant skill based on exercise category
      const exerciseCategory = result.exerciseId.split('_')[0]; // Extract category from ID
      const skillMapping: { [key: string]: keyof typeof analytics.skillBreakdown } = {
        vocab: 'vocabulary',
        grammar: 'grammar',
        listening: 'listening',
        pronunciation: 'speaking',
        reading: 'reading',
        writing: 'writing',
      };
      
      const skill = skillMapping[exerciseCategory];
      if (skill) {
        // Update skill score with weighted average
        const currentScore = analytics.skillBreakdown[skill];
        const newScore = (currentScore * 0.9) + (result.accuracy * 100 * 0.1);
        analytics.skillBreakdown[skill] = Math.round(newScore);
      }
      
      // Update other analytics
      analytics.lessonsCompleted += 1;
      
      // Save updated analytics
      await AsyncStorage.setItem(
        `${PERFORMANCE_ANALYTICS_KEY}_${userId}`,
        JSON.stringify(analytics),
      );
    } catch (error) {
      console.error('Error updating performance analytics:', error);
    }
  }
  
  private static analyzeSkillPerformance(history: ExerciseResult[]): { [skill: string]: { accuracy: number; attempts: number } } {
    const skillPerformance: { [skill: string]: { accuracy: number; attempts: number } } = {};
    
    history.forEach(result => {
      const category = result.exerciseId.split('_')[0];
      
      if (!skillPerformance[category]) {
        skillPerformance[category] = { accuracy: 0, attempts: 0 };
      }
      
      skillPerformance[category].accuracy = 
        (skillPerformance[category].accuracy * skillPerformance[category].attempts + result.accuracy) /
        (skillPerformance[category].attempts + 1);
      
      skillPerformance[category].attempts += 1;
    });
    
    return skillPerformance;
  }
  
  private static getSkillRecommendations(skill: string, performance: { accuracy: number; attempts: number }): string[] {
    const recommendations: { [key: string]: string[] } = {
      vocabulary: [
        'Practice flashcards daily',
        'Use spaced repetition',
        'Learn words in context',
      ],
      grammar: [
        'Focus on sentence structure',
        'Practice verb conjugations',
        'Study grammar rules',
      ],
      pronunciation: [
        'Listen to native speakers',
        'Practice with audio exercises',
        'Record yourself speaking',
      ],
    };
    
    return recommendations[skill] || ['Continue practicing this skill'];
  }
  
  private static generateGeneralRecommendations(
    weakAreas: { skill: string; severity: number }[],
    analytics: UserPerformanceAnalytics,
  ): string[] {
    const recommendations = [];
    
    if (weakAreas.length > 0) {
      recommendations.push(`Focus on improving ${weakAreas[0].skill}`);
    }
    
    if (analytics.averageSessionLength < 15) {
      recommendations.push('Try longer study sessions for better retention');
    }
    
    if (analytics.streakDays === 0) {
      recommendations.push('Build a daily study habit');
    }
    
    return recommendations;
  }
  
  private static getRecentPerformanceForCategory(history: ExerciseResult[], category: string): number {
    const recentResults = history
      .filter(result => result.exerciseId.includes(category))
      .slice(-10); // Last 10 results
    
    if (recentResults.length === 0) return 0.5; // Default difficulty
    
    const averageAccuracy = recentResults.reduce((sum, result) => sum + result.accuracy, 0) / recentResults.length;
    return averageAccuracy;
  }
  
  private static calculateAdaptiveDifficulty(baseDifficulty: number, recentPerformance: number): number {
    // Adjust difficulty based on recent performance
    if (recentPerformance > TARGET_ACCURACY + DIFFICULTY_ADJUSTMENT_THRESHOLD) {
      return Math.min(1.0, baseDifficulty + 0.1); // Increase difficulty
    } else if (recentPerformance < TARGET_ACCURACY - DIFFICULTY_ADJUSTMENT_THRESHOLD) {
      return Math.max(0.1, baseDifficulty - 0.1); // Decrease difficulty
    }
    
    return baseDifficulty; // Keep same difficulty
  }
}

export default AdaptiveLearningService;
export { AdaptiveLearningService };
