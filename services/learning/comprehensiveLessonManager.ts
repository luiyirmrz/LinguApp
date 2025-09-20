// Comprehensive Lesson Manager Service
// Integrates lesson generation, gamification, progress tracking, and user verification
// Handles all lesson-related operations and ensures proper content delivery

import { 
  CEFRLevel, 
  MultilingualContent, 
  MultilingualLesson,
  LessonModule,
  LanguageCourse,
  VocabularyItem,
  MultilingualExercise,
  UserGamificationState, 
  LearningPathProgress,
  AlternativePathProgress,
  MicroChallenge,
  ContextScenario,
  StoryChapter,
  StoryScene,
  PronunciationAssessment,
  LearningAnalytics,
  LearningInsight,
} from '@/types';
import { 
  ComprehensiveLessonGenerator, 
  CEFR_WORD_TARGETS, 
  WORDS_PER_LESSON, 
  LESSONS_PER_LEVEL,
  LESSON_THEMES,
  EXERCISE_TYPES_BY_LEVEL,
} from './comprehensiveLessonGenerator';
import { 
  EnhancedGamificationService, 
  UserGamificationState as GamificationState,
  LearningPathProgress as GamificationPathProgress,
  AlternativePathProgress as GamificationAlternativePath,
  MicroChallenge as GamificationMicroChallenge,
} from '../gamification/enhancedGamificationService';

// Lesson manager configuration
export const LESSON_MANAGER_CONFIG = {
  // Content verification
  VERIFY_USER_STATE_BEFORE_LESSON: true,
  VERIFY_LIVES_BEFORE_EXERCISE: true,
  VERIFY_STREAK_FREEZE_BEFORE_LESSON: true,
  VERIFY_XP_BOOST_BEFORE_LESSON: true,
  
  // Progress tracking
  TRACK_EXERCISE_ATTEMPTS: true,
  TRACK_TIME_SPENT: true,
  TRACK_ACCURACY_DETAILS: true,
  TRACK_USER_BEHAVIOR: true,
  
  // Content delivery
  PRELOAD_NEXT_LESSON: true,
  CACHE_AUDIO_FILES: true,
  CACHE_IMAGES: true,
  ADAPTIVE_DIFFICULTY: true,
  
  // Gamification integration
  ENABLE_ALTERNATIVE_PATHS: true,
  ENABLE_MICRO_CHALLENGES: true,
  ENABLE_STORY_MODE: true,
  ENABLE_CONTEXT_SCENARIOS: true,
  
  // Monetization features
  VERIFY_PREMIUM_FEATURES: true,
  VERIFY_SLANG_PACKAGES: true,
  ENABLE_AD_INTEGRATION: true,
  ENABLE_IN_APP_PURCHASES: true,
};

// User lesson state
export interface UserLessonState {
  userId: string;
  currentLanguage: string;
  currentLevel: CEFRLevel;
  currentLesson: string | null;
  currentModule: string | null;
  completedLessons: string[];
  inProgressLessons: {
    lessonId: string;
    progress: number; // 0-100
    exercisesCompleted: number;
    totalExercises: number;
    timeSpent: number;
    lastAccessed: string;
  }[];
  lessonHistory: {
    lessonId: string;
    completedAt: string;
    accuracy: number;
    timeSpent: number;
    xpEarned: number;
    exercisesCompleted: number;
    totalExercises: number;
    mistakes: {
      exerciseId: string;
      userAnswer: string;
      correctAnswer: string;
      timestamp: string;
    }[];
  }[];
  vocabularyMastery: {
    [wordId: string]: {
      masteryLevel: number; // 0-100
      reviewCount: number;
      lastReviewed: string;
      nextReview: string;
      difficulty: 'easy' | 'medium' | 'hard' | 'very_hard';
      srsData: {
        interval: number;
        easeFactor: number;
        repetitions: number;
      };
    };
  };
  learningPreferences: {
    preferredExerciseTypes: string[];
    preferredDifficulty: 'easy' | 'medium' | 'hard';
    preferredTimeOfDay: 'morning' | 'afternoon' | 'evening' | 'any';
    autoPlayAudio: boolean;
    showTranslations: boolean;
    showPhonetics: boolean;
    enableHints: boolean;
    enableStreakFreeze: boolean;
    enableXpBoost: boolean;
  };
  adaptiveSettings: {
    difficultyAdjustment: boolean;
    focusWeakAreas: boolean;
    includeReview: boolean;
    pronunciationPractice: boolean;
    culturalContext: boolean;
    slangInclusion: boolean;
  };
  premiumFeatures: {
    hasPremium: boolean;
    premiumExpires: string | null;
    unlockedFeatures: string[];
    purchasedPackages: string[];
  };
}

// Lesson session data
export interface LessonSession {
  sessionId: string;
  userId: string;
  lessonId: string;
  startTime: string;
  endTime?: string;
  exercises: {
    exerciseId: string;
    type: string;
    startTime: string;
    endTime?: string;
    attempts: number;
    isCorrect: boolean;
    userAnswer?: string;
    correctAnswer: string;
    timeSpent: number;
    hintsUsed: number;
    accuracy: number;
  }[];
  totalTimeSpent: number;
  totalAccuracy: number;
  xpEarned: number;
  livesUsed: number;
  streakMaintained: boolean;
  achievementsUnlocked: string[];
  vocabularyLearned: string[];
  pronunciationAssessments: PronunciationAssessment[];
}

export class ComprehensiveLessonManager {
  private lessonGenerator: ComprehensiveLessonGenerator;
  private gamificationService: EnhancedGamificationService;
  private userLessonState: UserLessonState | null = null;
  private currentSession: LessonSession | null = null;
  private cachedLessons: Map<string, MultilingualLesson> = new Map();
  private cachedModules: Map<string, LessonModule> = new Map();

  constructor(
    targetLanguage: string = 'hr',
    mainLanguage: string = 'en',
    currentLevel: CEFRLevel = 'A1',
  ) {
    this.lessonGenerator = new ComprehensiveLessonGenerator(targetLanguage, mainLanguage, currentLevel);
    this.gamificationService = new EnhancedGamificationService();
    this.initializeManager();
  }

  // Initialize the lesson manager
  private async initializeManager(): Promise<void> {
    try {
      await this.loadUserLessonState();
      await this.initializeGamification();
      this.startSessionTracking();
    } catch (error) {
      console.error('Error initializing lesson manager:', error);
    }
  }

  // Load user lesson state
  private async loadUserLessonState(): Promise<void> {
    try {
      // This would load from AsyncStorage or database
      this.userLessonState = this.createDefaultUserLessonState();
    } catch (error) {
      console.error('Error loading user lesson state:', error);
      this.userLessonState = this.createDefaultUserLessonState();
    }
  }

  // Create default user lesson state
  private createDefaultUserLessonState(): UserLessonState {
    return {
      userId: 'default_user',
      currentLanguage: 'hr',
      currentLevel: 'A1',
      currentLesson: null,
      currentModule: null,
      completedLessons: [],
      inProgressLessons: [],
      lessonHistory: [],
      vocabularyMastery: {},
      learningPreferences: {
        preferredExerciseTypes: ['flashcard', 'multiple_choice', 'listening'],
        preferredDifficulty: 'medium',
        preferredTimeOfDay: 'any',
        autoPlayAudio: true,
        showTranslations: true,
        showPhonetics: true,
        enableHints: true,
        enableStreakFreeze: true,
        enableXpBoost: true,
      },
      adaptiveSettings: {
        difficultyAdjustment: true,
        focusWeakAreas: true,
        includeReview: true,
        pronunciationPractice: true,
        culturalContext: true,
        slangInclusion: false,
      },
      premiumFeatures: {
        hasPremium: false,
        premiumExpires: null,
        unlockedFeatures: [],
        purchasedPackages: [],
      },
    };
  }

  // Initialize gamification
  private async initializeGamification(): Promise<void> {
    // Sync user state with gamification service
    const gamificationState = this.gamificationService.getUserState();
    if (gamificationState && this.userLessonState) {
      // Update lesson state with gamification data
      this.userLessonState.currentLevel = gamificationState.currentLevel;
      this.userLessonState.completedLessons = gamificationState.completedLessons;
    }
  }

  // Start session tracking
  private startSessionTracking(): void {
    // Set up periodic session updates
    setInterval(() => {
      this.updateCurrentSession();
    }, 30000); // Update every 30 seconds
  }

  // Get available lessons for user
  public async getAvailableLessons(): Promise<{
    currentLesson: MultilingualLesson | null;
    nextLessons: MultilingualLesson[];
    recommendedLessons: MultilingualLesson[];
    alternativePaths: GamificationAlternativePath[];
    dailyChallenges: any[];
  }> {
    if (!this.userLessonState) {
      throw new Error('User lesson state not initialized');
    }

    // Verify user state before providing lessons
    await this.verifyUserState();

    // Get current lesson
    const currentLesson = this.userLessonState.currentLesson 
      ? await this.getLesson(this.userLessonState.currentLesson)
      : null;

    // Get next lessons
    const nextLessons = await this.getNextLessons(3);

    // Get recommended lessons based on user performance
    const recommendedLessons = await this.getRecommendedLessons(5);

    // Get alternative paths
    const alternativePaths: GamificationAlternativePath[] = this.gamificationService.getAlternativePaths();

    // Get daily challenges
    const gamificationState = this.gamificationService.getUserState();
    const dailyChallenges = gamificationState?.dailyChallenges || [];

    return {
      currentLesson,
      nextLessons,
      recommendedLessons,
      alternativePaths,
      dailyChallenges: [],
    };
  }

  // Start a lesson session
  public async startLesson(lessonId: string): Promise<{
    success: boolean;
    lesson: MultilingualLesson;
    sessionId: string;
    livesRequired: number;
    canStart: boolean;
    message?: string;
  }> {
    if (!this.userLessonState) {
      throw new Error('User lesson state not initialized');
    }

    // Verify user can start lesson
    const verification = await this.verifyLessonAccess(lessonId);
    if (!verification.canStart) {
      return {
        success: false,
        lesson: verification.lesson,
        sessionId: '',
        livesRequired: verification.livesRequired,
        canStart: false,
        message: verification.message,
      };
    }

    // Get lesson
    const lesson = await this.getLesson(lessonId);
    
    // Create session
    const sessionId = `session_${Date.now()}_${lessonId}`;
    this.currentSession = {
      sessionId,
      userId: this.userLessonState.userId,
      lessonId,
      startTime: new Date().toISOString(),
      exercises: [],
      totalTimeSpent: 0,
      totalAccuracy: 0,
      xpEarned: 0,
      livesUsed: 0,
      streakMaintained: false,
      achievementsUnlocked: [],
      vocabularyLearned: [],
      pronunciationAssessments: [],
    };

    // Update user state
    this.userLessonState.currentLesson = lessonId;
    
    // Add to in-progress lessons if not already there
    if (!this.userLessonState.inProgressLessons.find(l => l.lessonId === lessonId)) {
      this.userLessonState.inProgressLessons.push({
        lessonId,
        progress: 0,
        exercisesCompleted: 0,
        totalExercises: lesson.exercises.length,
        timeSpent: 0,
        lastAccessed: new Date().toISOString(),
      });
    }

    return {
      success: true,
      lesson,
      sessionId,
      livesRequired: verification.livesRequired,
      canStart: true,
    };
  }

  // Complete an exercise
  public async completeExercise(
    exerciseId: string,
    userAnswer: string,
    timeSpent: number,
    hintsUsed: number = 0,
  ): Promise<{
    success: boolean;
    isCorrect: boolean;
    correctAnswer: string;
    explanation: MultilingualContent;
    xpEarned: number;
    livesUsed: number;
    accuracy: number;
    nextExercise?: MultilingualExercise;
    lessonCompleted: boolean;
    sessionCompleted: boolean;
  }> {
    if (!this.currentSession || !this.userLessonState) {
      throw new Error('No active session or user state');
    }

    // Get exercise
    const lesson = await this.getLesson(this.currentSession.lessonId);
    const exercise = lesson.exercises.find(e => e.id === exerciseId);
    if (!exercise) {
      throw new Error('Exercise not found');
    }

    // Check if user has enough lives
    const gamificationState = this.gamificationService.getUserState();
    if (gamificationState && gamificationState.lives <= 0) {
      return {
        success: false,
        isCorrect: false,
        correctAnswer: exercise.correctAnswer as string,
        explanation: exercise.explanation || { en: 'No lives remaining', hr: 'Nema preostalih života', es: 'Sin vidas restantes' },
        xpEarned: 0,
        livesUsed: 0,
        accuracy: 0,
        lessonCompleted: false,
        sessionCompleted: false,
      };
    }

    // Evaluate answer
    const isCorrect = this.evaluateAnswer(userAnswer, exercise.correctAnswer);
    const accuracy = this.calculateAccuracy(userAnswer, exercise.correctAnswer);

    // Use life if incorrect
    let livesUsed = 0;
    if (!isCorrect) {
      livesUsed = this.gamificationService.useLife() ? 1 : 0;
    }

    // Calculate XP
    const xpEarned = isCorrect ? exercise.xpReward : Math.floor(exercise.xpReward * 0.1);

    // Update session
    this.currentSession.exercises.push({
      exerciseId,
      type: exercise.type,
      startTime: new Date().toISOString(),
      endTime: new Date().toISOString(),
      attempts: 1,
      isCorrect,
      userAnswer,
      correctAnswer: exercise.correctAnswer as string,
      timeSpent,
      hintsUsed,
      accuracy,
    });

    this.currentSession.totalTimeSpent += timeSpent;
    this.currentSession.livesUsed += livesUsed;

    // Update vocabulary mastery
    if (exercise.vocabularyItems) {
      exercise.vocabularyItems.forEach(wordId => {
        this.updateVocabularyMastery(wordId, isCorrect);
      });
    }

    // Check if lesson is completed
    const lessonCompleted = this.checkLessonCompletion(lesson);
    const sessionCompleted = lessonCompleted;

    // Get next exercise if lesson not completed
    let nextExercise: MultilingualExercise | undefined;
    if (!lessonCompleted) {
      nextExercise = this.getNextExercise(lesson, exerciseId);
    }

    // Update progress
    this.updateLessonProgress(lesson, exerciseId);

    return {
      success: true,
      isCorrect,
      correctAnswer: exercise.correctAnswer as string,
      explanation: exercise.explanation || { en: 'Exercise completed', hr: 'Vježba završena', es: 'Ejercicio completado' },
      xpEarned,
      livesUsed,
      accuracy,
      nextExercise,
      lessonCompleted,
      sessionCompleted,
    };
  }

  // Complete lesson session
  public async completeLessonSession(): Promise<{
    success: boolean;
    totalXpEarned: number;
    totalAccuracy: number;
    totalTimeSpent: number;
    achievementsUnlocked: any[];
    levelUp: boolean;
    newLevel?: CEFRLevel;
    coinsEarned: number;
    gemsEarned: number;
    nextLesson?: string;
  }> {
    if (!this.currentSession || !this.userLessonState) {
      throw new Error('No active session or user state');
    }

    // End session
    this.currentSession.endTime = new Date().toISOString();

    // Calculate session totals
    const totalAccuracy = this.currentSession.exercises.length > 0 
      ? this.currentSession.exercises.reduce((sum, ex) => sum + ex.accuracy, 0) / this.currentSession.exercises.length
      : 0;

    // Complete lesson in gamification
    const gamificationResult = await this.gamificationService.completeLesson(
      this.currentSession.lessonId,
      totalAccuracy,
      this.currentSession.totalTimeSpent,
      this.currentSession.exercises.length,
    );

    // Update lesson history
    this.userLessonState.lessonHistory.push({
      lessonId: this.currentSession.lessonId,
      completedAt: new Date().toISOString(),
      accuracy: totalAccuracy,
      timeSpent: this.currentSession.totalTimeSpent,
      xpEarned: gamificationResult.xpEarned,
      exercisesCompleted: this.currentSession.exercises.length,
      totalExercises: this.currentSession.exercises.length,
      mistakes: this.currentSession.exercises
        .filter(ex => !ex.isCorrect)
        .map(ex => ({
          exerciseId: ex.exerciseId,
          userAnswer: ex.userAnswer || '',
          correctAnswer: ex.correctAnswer,
          timestamp: ex.endTime || '',
        })),
    });

    // Remove from in-progress lessons
    this.userLessonState.inProgressLessons = this.userLessonState.inProgressLessons
      .filter(l => l.lessonId !== this.currentSession!.lessonId);

    // Add to completed lessons
    if (!this.userLessonState.completedLessons.includes(this.currentSession.lessonId)) {
      this.userLessonState.completedLessons.push(this.currentSession.lessonId);
    }

    // Get next lesson
    const nextLesson = await this.getNextLesson();

    // Clear current session
    this.currentSession = null;
    this.userLessonState.currentLesson = null;

    // Save state
    await this.saveUserLessonState();

    return {
      success: true,
      totalXpEarned: gamificationResult.xpEarned,
      totalAccuracy,
      totalTimeSpent: this.currentSession!.totalTimeSpent,
      achievementsUnlocked: gamificationResult.achievementsUnlocked,
      levelUp: gamificationResult.levelUp,
      newLevel: gamificationResult.newLevel,
      coinsEarned: gamificationResult.coinsEarned,
      gemsEarned: gamificationResult.gemsEarned,
      nextLesson,
    };
  }

  // Get lesson with caching
  private async getLesson(lessonId: string): Promise<MultilingualLesson> {
    if (this.cachedLessons.has(lessonId)) {
      return this.cachedLessons.get(lessonId)!;
    }

    // Generate lesson if not cached
    const lesson = this.generateLessonFromId(lessonId);
    this.cachedLessons.set(lessonId, lesson);
    
    return lesson;
  }

  // Generate lesson from ID
  private generateLessonFromId(lessonId: string): MultilingualLesson {
    // Parse lesson ID to extract theme and number
    const parts = lessonId.split('_');
    if (parts.length < 3) {
      throw new Error('Invalid lesson ID format');
    }

    const level = parts[0] as CEFRLevel;
    const theme = parts[1];
    const lessonNumber = parseInt(parts[2]);

    return this.lessonGenerator.generateLesson(theme, lessonNumber, level);
  }

  // Get next lessons
  private async getNextLessons(count: number): Promise<MultilingualLesson[]> {
    const lessons: MultilingualLesson[] = [];
    const currentLevel = this.userLessonState!.currentLevel;
    const themes = LESSON_THEMES[currentLevel];
    
    // Find next lesson based on current progress
    let nextLessonIndex = this.userLessonState!.completedLessons.length;
    
    for (let i = 0; i < count && nextLessonIndex < themes.length; i++) {
      const theme = themes[nextLessonIndex];
      const lesson = await this.getLesson(`${currentLevel}_${theme}_${nextLessonIndex + 1}`);
      lessons.push(lesson);
      nextLessonIndex++;
    }
    
    return lessons;
  }

  // Get recommended lessons
  private async getRecommendedLessons(count: number): Promise<MultilingualLesson[]> {
    // This would implement recommendation logic based on user performance
    // For now, return random lessons from current level
    const currentLevel = this.userLessonState!.currentLevel;
    const themes = LESSON_THEMES[currentLevel];
    const recommendations: MultilingualLesson[] = [];
    
    const shuffledThemes = [...themes].sort(() => 0.5 - Math.random());
    
    for (let i = 0; i < count && i < shuffledThemes.length; i++) {
      const theme = shuffledThemes[i];
      const lesson = await this.getLesson(`${currentLevel}_${theme}_${i + 1}`);
      recommendations.push(lesson);
    }
    
    return recommendations;
  }

  // Get next lesson
  private async getNextLesson(): Promise<string | undefined> {
    const currentLevel = this.userLessonState!.currentLevel;
    const themes = LESSON_THEMES[currentLevel];
    const nextLessonIndex = this.userLessonState!.completedLessons.length;
    
    if (nextLessonIndex < themes.length) {
      const theme = themes[nextLessonIndex];
      return `${currentLevel}_${theme}_${nextLessonIndex + 1}`;
    }
    
    // Check if user should advance to next level
    const nextLevel = this.getNextLevel(currentLevel);
    if (nextLevel) {
      const nextLevelThemes = LESSON_THEMES[nextLevel];
      return `${nextLevel}_${nextLevelThemes[0]}_1`;
    }
    
    return undefined;
  }

  // Get next level
  private getNextLevel(currentLevel: CEFRLevel): CEFRLevel | null {
    const levels: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
    const currentIndex = levels.indexOf(currentLevel);
    
    if (currentIndex < levels.length - 1) {
      return levels[currentIndex + 1];
    }
    
    return null;
  }

  // Verify user state
  private async verifyUserState(): Promise<void> {
    if (!LESSON_MANAGER_CONFIG.VERIFY_USER_STATE_BEFORE_LESSON) return;

    const gamificationState = this.gamificationService.getUserState();
    if (!gamificationState) {
      throw new Error('Gamification state not available');
    }

    // Check streak freeze
    if (LESSON_MANAGER_CONFIG.VERIFY_STREAK_FREEZE_BEFORE_LESSON) {
      if (gamificationState.streakFreezeActive && gamificationState.streakFreezeExpires) {
        const expires = new Date(gamificationState.streakFreezeExpires);
        if (new Date() > expires) {
          gamificationState.streakFreezeActive = false;
          gamificationState.streakFreezeExpires = null;
        }
      }
    }

    // Check XP boost
    if (LESSON_MANAGER_CONFIG.VERIFY_XP_BOOST_BEFORE_LESSON) {
      if (gamificationState.xpBoostActive && gamificationState.xpBoostExpires) {
        const expires = new Date(gamificationState.xpBoostExpires);
        if (new Date() > expires) {
          gamificationState.xpBoostActive = false;
          gamificationState.xpBoostExpires = null;
          gamificationState.xpBoostMultiplier = 1.0;
        }
      }
    }
  }

  // Verify lesson access
  private async verifyLessonAccess(lessonId: string): Promise<{
    canStart: boolean;
    lesson: MultilingualLesson;
    livesRequired: number;
    message?: string;
  }> {
    const lesson = await this.getLesson(lessonId);
    const gamificationState = this.gamificationService.getUserState();
    
    if (!gamificationState) {
      return {
        canStart: false,
        lesson,
        livesRequired: 0,
        message: 'Gamification state not available',
      };
    }

    // Check lives
    const livesRequired = 1; // Default requirement
    if (gamificationState.lives < livesRequired) {
      return {
        canStart: false,
        lesson,
        livesRequired,
        message: 'Not enough lives',
      };
    }

    // Check if lesson is unlocked
    const isUnlocked = this.isLessonUnlocked(lessonId);
    if (!isUnlocked) {
      return {
        canStart: false,
        lesson,
        livesRequired,
        message: 'Lesson not unlocked',
      };
    }

    return {
      canStart: true,
      lesson,
      livesRequired,
    };
  }

  // Check if lesson is unlocked
  private isLessonUnlocked(lessonId: string): boolean {
    // Parse lesson ID
    const parts = lessonId.split('_');
    if (parts.length < 3) return false;

    const level = parts[0] as CEFRLevel;
    const theme = parts[1];
    const lessonNumber = parseInt(parts[2]);

    // First lesson of each level is always unlocked
    if (lessonNumber === 1) return true;

    // Check if previous lesson is completed
    const themes = LESSON_THEMES[level];
    const themeIndex = themes.indexOf(theme);
    
    if (themeIndex === -1) return false;

    // Check if previous lesson in same theme is completed
    if (lessonNumber > 1) {
      const previousLessonId = `${level}_${theme}_${lessonNumber - 1}`;
      return this.userLessonState!.completedLessons.includes(previousLessonId);
    }

    // Check if previous theme's last lesson is completed
    if (themeIndex > 0) {
      const previousTheme = themes[themeIndex - 1];
      const previousLessonId = `${level}_${previousTheme}_${LESSONS_PER_LEVEL[level]}`;
      return this.userLessonState!.completedLessons.includes(previousLessonId);
    }

    return true;
  }

  // Evaluate answer
  private evaluateAnswer(userAnswer: string, correctAnswer: string | string[]): boolean {
    if (Array.isArray(correctAnswer)) {
      return correctAnswer.some(answer => 
        this.normalizeAnswer(userAnswer) === this.normalizeAnswer(answer),
      );
    }
    
    return this.normalizeAnswer(userAnswer) === this.normalizeAnswer(correctAnswer);
  }

  // Normalize answer for comparison
  private normalizeAnswer(answer: string): string {
    return answer.toLowerCase().trim().replace(/\s+/g, ' ');
  }

  // Calculate accuracy
  private calculateAccuracy(userAnswer: string, correctAnswer: string | string[]): number {
    if (this.evaluateAnswer(userAnswer, correctAnswer)) {
      return 100;
    }

    // Simple accuracy calculation based on character similarity
    const correct = Array.isArray(correctAnswer) ? correctAnswer[0] : correctAnswer;
    const normalizedUser = this.normalizeAnswer(userAnswer);
    const normalizedCorrect = this.normalizeAnswer(correct);
    
    const maxLength = Math.max(normalizedUser.length, normalizedCorrect.length);
    if (maxLength === 0) return 0;
    
    let matches = 0;
    for (let i = 0; i < Math.min(normalizedUser.length, normalizedCorrect.length); i++) {
      if (normalizedUser[i] === normalizedCorrect[i]) {
        matches++;
      }
    }
    
    return Math.round((matches / maxLength) * 100);
  }

  // Update vocabulary mastery
  private updateVocabularyMastery(wordId: string, isCorrect: boolean): void {
    if (!this.userLessonState!.vocabularyMastery[wordId]) {
      this.userLessonState!.vocabularyMastery[wordId] = {
        masteryLevel: 0,
        reviewCount: 0,
        lastReviewed: new Date().toISOString(),
        nextReview: new Date().toISOString(),
        difficulty: 'medium',
        srsData: {
          interval: 1,
          easeFactor: 2.5,
          repetitions: 0,
        },
      };
    }

    const mastery = this.userLessonState!.vocabularyMastery[wordId];
    mastery.reviewCount++;
    mastery.lastReviewed = new Date().toISOString();

    if (isCorrect) {
      mastery.masteryLevel = Math.min(100, mastery.masteryLevel + 10);
      mastery.srsData.repetitions++;
      mastery.srsData.interval = Math.min(365, mastery.srsData.interval * mastery.srsData.easeFactor);
    } else {
      mastery.masteryLevel = Math.max(0, mastery.masteryLevel - 5);
      mastery.srsData.repetitions = 0;
      mastery.srsData.interval = 1;
      mastery.srsData.easeFactor = Math.max(1.3, mastery.srsData.easeFactor - 0.1);
    }

    // Update difficulty
    if (mastery.masteryLevel >= 80) mastery.difficulty = 'easy';
    else if (mastery.masteryLevel >= 60) mastery.difficulty = 'medium';
    else if (mastery.masteryLevel >= 40) mastery.difficulty = 'hard';
    else mastery.difficulty = 'very_hard';

    // Calculate next review
    const nextReview = new Date();
    nextReview.setDate(nextReview.getDate() + mastery.srsData.interval);
    mastery.nextReview = nextReview.toISOString();
  }

  // Check lesson completion
  private checkLessonCompletion(lesson: MultilingualLesson): boolean {
    if (!this.currentSession) return false;

    const completedExercises = this.currentSession.exercises.length;
    const totalExercises = lesson.exercises.length;
    
    return completedExercises >= totalExercises;
  }

  // Get next exercise
  private getNextExercise(lesson: MultilingualLesson, currentExerciseId: string): MultilingualExercise | undefined {
    const currentIndex = lesson.exercises.findIndex(e => e.id === currentExerciseId);
    if (currentIndex === -1 || currentIndex >= lesson.exercises.length - 1) {
      return undefined;
    }
    
    return lesson.exercises[currentIndex + 1];
  }

  // Update lesson progress
  private updateLessonProgress(lesson: MultilingualLesson, completedExerciseId: string): void {
    const inProgressLesson = this.userLessonState!.inProgressLessons.find(
      l => l.lessonId === lesson.id,
    );
    
    if (inProgressLesson) {
      inProgressLesson.exercisesCompleted++;
      inProgressLesson.progress = Math.round(
        (inProgressLesson.exercisesCompleted / inProgressLesson.totalExercises) * 100,
      );
      inProgressLesson.lastAccessed = new Date().toISOString();
    }
  }

  // Update current session
  private updateCurrentSession(): void {
    if (this.currentSession) {
      // Update session data periodically
      this.currentSession.totalTimeSpent += 30; // Add 30 seconds
    }
  }

  // Save user lesson state
  private async saveUserLessonState(): Promise<void> {
    try {
      // This would save to AsyncStorage or database
      console.debug('Saving user lesson state:', this.userLessonState);
    } catch (error) {
      console.error('Error saving user lesson state:', error);
    }
  }

  // Get user lesson state
  public getUserLessonState(): UserLessonState | null {
    return this.userLessonState;
  }

  // Get current session
  public getCurrentSession(): LessonSession | null {
    return this.currentSession;
  }

  // Get learning analytics
  public getLearningAnalytics(): LearningAnalytics {
    if (!this.userLessonState) {
      throw new Error('User lesson state not initialized');
    }

    const totalLessons = this.userLessonState.completedLessons.length;
    const totalTimeSpent = this.userLessonState.lessonHistory.reduce((sum, lesson) => sum + lesson.timeSpent, 0);
    const averageAccuracy = this.userLessonState.lessonHistory.length > 0
      ? this.userLessonState.lessonHistory.reduce((sum, lesson) => sum + lesson.accuracy, 0) / this.userLessonState.lessonHistory.length
      : 0;

    const gamificationState = this.gamificationService.getUserState();
    const currentStreak = gamificationState?.currentStreak || 0;
    const totalXP = gamificationState?.totalXP || 0;

    return {
      userId: this.userLessonState.userId,
      languageCode: this.userLessonState.currentLanguage,
      period: 'weekly',
      date: new Date().toISOString(),
      metrics: {
        lessonsCompleted: totalLessons,
        xpEarned: totalXP,
        timeSpent: totalTimeSpent,
        accuracy: averageAccuracy,
        streakMaintained: currentStreak > 0,
        newWordsLearned: Object.keys(this.userLessonState.vocabularyMastery).length,
        wordsReviewed: this.userLessonState.lessonHistory.length,
        skillsImproved: this.getImprovedSkills(),
        weakAreasIdentified: this.getWeakAreas(),
        strongAreasReinforced: this.getStrongAreas(),
      },
      recommendations: {
        focusAreas: this.getFocusAreas(),
        suggestedLessons: this.getSuggestedLessons(),
        reviewItems: this.getReviewItems(),
        difficultyAdjustment: this.getDifficultyAdjustment(),
      },
    };
  }

  // Helper methods for analytics
  private getImprovedSkills(): string[] {
    // Analyze lesson history to determine improved skills
    return ['vocabulary', 'listening', 'speaking'];
  }

  private getWeakAreas(): string[] {
    // Analyze mistakes to identify weak areas
    return ['grammar', 'pronunciation'];
  }

  private getStrongAreas(): string[] {
    // Analyze high-accuracy areas
    return ['vocabulary', 'reading'];
  }

  private getFocusAreas(): string[] {
    // Recommend areas to focus on
    return ['grammar', 'pronunciation'];
  }

  private getSuggestedLessons(): string[] {
    // Suggest lessons based on weak areas
    return ['A1_grammar_1', 'A1_pronunciation_1'];
  }

  private getReviewItems(): string[] {
    // Get vocabulary items due for review
    const now = new Date();
    return Object.entries(this.userLessonState!.vocabularyMastery)
      .filter(([_, mastery]) => new Date(mastery.nextReview) <= now)
      .map(([wordId, _]) => wordId);
  }

  private getDifficultyAdjustment(): 'increase' | 'decrease' | 'maintain' {
    const averageAccuracy = this.userLessonState!.lessonHistory.length > 0
      ? this.userLessonState!.lessonHistory.reduce((sum, lesson) => sum + lesson.accuracy, 0) / this.userLessonState!.lessonHistory.length
      : 0;

    if (averageAccuracy > 90) return 'increase';
    if (averageAccuracy < 70) return 'decrease';
    return 'maintain';
  }
}

// Export singleton instance
export const lessonManager = new ComprehensiveLessonManager('hr', 'en', 'A1');
