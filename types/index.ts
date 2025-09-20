// Enhanced Types for Adaptive Language Learning Platform
// Comprehensive type definitions for didactic features, SRS, and personalization

// CEFR Levels
export type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

// Learning Goals
export type LearningGoal = 'vocabulary' | 'speaking' | 'listening' | 'grammar' | 'fluency' | 'travel' | 'business' | 'culture';

// Practice Modes
export type PracticeMode = 'flashcards' | 'dictation' | 'dialogues' | 'speaking' | 'listening' | 'grammar' | 'survival';

// Exercise Types
export type ExerciseType = 
  | 'flashcard'
  | 'fill_blank'
  | 'multiple_choice'
  | 'dictation' 
  | 'pronunciation'
  | 'dialogue'
  | 'listening'
  | 'cloze'
  | 'matching'
  | 'match_pairs'
  | 'survival_scenario'
  | 'conversation'
  | 'match' 
  | 'translate' 
  | 'fillBlank' 
  | 'multipleChoice' 
  | 'speaking' 
  | 'reading' 
  | 'writing' 
  | 'dragDrop' 
  | 'comprehension' 
  | 'wordOrder' 
  | 'conjugation';

// Lesson Types
export type LessonType = 
  | 'vocabulary' 
  | 'grammar' 
  | 'conversation' 
  | 'listening' 
  | 'reading' 
  | 'writing'
  | 'pronunciation' 
  | 'culture' 
  | 'business' 
  | 'academic' 
  | 'survival'
  | 'mixed';

// Skill Categories
export type SkillCategory = 
  | 'vocabulary' 
  | 'grammar' 
  | 'listening' 
  | 'speaking' 
  | 'reading' 
  | 'writing'
  | 'pronunciation' 
  | 'conversation' 
  | 'culture' 
  | 'business' 
  | 'academic'
  | 'basics'
  | 'family';

// Adaptive Difficulty Interface
export interface AdaptiveDifficulty {
  currentDifficulty: number; // 1-5 scale
  performanceHistory: number[]; // Array of recent performance scores (0-100)
  lastAdjustment: string; // ISO date string
  adjustmentFrequency: number; // How often to adjust (in lessons)
  minDifficulty: number; // Minimum difficulty level
  maxDifficulty: number; // Maximum difficulty level
  confidenceLevel: number; // 0-1, how confident we are in the current difficulty
}

// Difficulty Levels
export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';

// Learning Path Types
export type LearningPathType = 'guided' | 'thematic' | 'survival' | 'cultural' | 'business';

// SRS Intervals (in days)
export type SRSInterval = 1 | 3 | 7 | 14 | 30 | 90 | 180 | 365;

// Word Difficulty based on user performance
export type WordDifficulty = 'easy' | 'medium' | 'hard' | 'very_hard';

// Pronunciation Feedback Types
export interface PronunciationFeedback {
  accuracy: number; // 0-100
  phonemes: {
    phoneme: string;
    accuracy: number;
    feedback: string;
  }[];
  overallFeedback: string;
  suggestions: string[];
}

// User Onboarding Profile
export interface OnboardingProfile {
  languageLevel: DifficultyLevel;
  dailyCommitment: number; // minutes per day
  weeklyCommitment: number; // days per week
  learningGoals: LearningGoal[];
  preferredModes: PracticeMode[];
  availableTime: 'morning' | 'afternoon' | 'evening' | 'flexible';
  motivation: 'exam' | 'travel' | 'career' | 'hobby' | 'migration';
  hasCompletedTest: boolean;
  initialCEFRLevel?: CEFRLevel;
}

// Word with SRS Data
export interface WordSRS {
  id: string;
  word: string;
  translation: string;
  phonetic?: string;
  audioUrl?: string;
  exampleSentence: string;
  exampleTranslation: string;
  cefrLevel: CEFRLevel;
  difficulty: WordDifficulty;
  
  // SRS specific data
  interval: SRSInterval;
  repetitions: number;
  easeFactor: number; // 1.3 - 2.5
  nextReview: string; // ISO date
  lastReviewed?: string;
  
  // Performance tracking
  correctCount: number;
  incorrectCount: number;
  averageResponseTime: number;
  
  // Contextual data
  tags: string[];
  category: string;
  imageUrl?: string;
}

export type AuthProvider = 'email' | 'google' | 'github' | 'apple';

// User types
export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  avatar?: string;
  photoURL?: string;
  role?: 'user' | 'admin' | 'moderator';
  preferences?: UserPreferences;
  
  // Gamification properties
  streak?: number;
  longestStreak?: number;
  lastPracticeDate?: string;
  hearts?: number;
  maxHearts?: number;
  lastHeartLoss?: string;
  gems?: number;
  points?: number;
  level?: number;
  totalXP?: number;
  weeklyXP?: number;
  lives?: number;
  maxLives?: number;
  lifeRefillTime?: string;
  lastLifeLoss?: string;
  coins?: number;
  
  // Language properties
  mainLanguage?: Language;
  currentLanguage?: Language;
  nativeLanguage?: Language;
  
  // Social properties
  friends?: string[];
  socialStats?: SocialStats;
  friendRequests?: any[];
  
  // Learning properties
  totalLessonsCompleted?: number;
  achievements?: any[];
  currentLeague?: string;
  onboardingCompleted?: boolean;
  onboardingData?: OnboardingData;
  lastLoginAt?: string;
  isNewUser?: boolean; // Flag to indicate if this is a new user from OAuth
  password?: string; // For local authentication
  provider?: string;
  lastStudyDate?: string;
  unlockedSkills?: string[];
  languageProgress?: any[];
  emailVerified?: boolean;
  socialConnections?: {
    friends: string[];
    following: string[];
    followers: string[];
  };
  statistics?: {
    totalLessonsCompleted: number;
    totalTimeSpent: number;
    averageAccuracy: number;
    longestStreak: number;
    wordsLearned: number;
  };
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  notifications: boolean;
  soundEnabled: boolean;
  autoPlay: boolean;
  timezone?: string;
  weeklyGoal?: number;
  studyDays?: string[];
  immersionMode?: boolean;
  hapticEnabled?: boolean;
  soundEffects?: boolean;
  dailyReminder?: boolean;
  notificationsEnabled?: boolean;
  reminderTime?: string;
}

export interface SocialStats {
  totalFriends: number;
  friendsCount: number;
  challengesWon: number;
  challengesLost: number;
  helpfulVotes: number;
  communityRank: number;
  helpGiven: number;
  helpReceived: number;
  groupsJoined: string[];
}

export interface OnboardingData {
  // Step 1: Basic Info
  nativeLanguage: Language;
  targetLanguages: Language[];
  
  // Step 2: Learning Assessment
  startingCEFRLevel: CEFRLevel;
  hasCompletedTest: boolean;
  
  // Step 3: Goals & Preferences
  learningGoals: LearningGoal[];
  dailyGoalXP: number;
  studyTimePreference: 'morning' | 'afternoon' | 'evening' | 'flexible';
  weeklyCommitment: number; // days per week
  
  // Step 4: Notifications & Settings
  notifTime: string; // HH:MM format
  pushConsent: boolean;
  emailConsent: boolean;
  
  // Step 5: Legal & Privacy
  tosAccepted: boolean;
  privacyAccepted: boolean;
  dataProcessingConsent: boolean;
  
  // Completion metadata
  completedAt: string;
  onboardingVersion: string;
}

// Language types
export interface Language {
  id: string;
  name: string;
  nativeName?: string;
  code: string;
  flag: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  isNative?: boolean;
  isTarget?: boolean;
  rtl?: boolean;
  difficulty?: number;
  family?: string;
  speakers?: number;
  countries?: string[];
  writingSystem?: string;
  hasGender?: boolean;
  hasCases?: boolean;
  wordOrder?: string;
}

// Lesson types
export interface Lesson {
  id: string;
  title: string;
  description: string;
  type: LessonType;
  xpReward: number;
  difficulty: number;
  language: string;
  completed: boolean;
  score: number;
  lastAttempted?: string;
  exercises: Exercise[];
  vocabulary: VocabularyItem[];
  estimatedTime?: number;
}

export interface Exercise {
  id: string;
  type: 'multiple-choice' | 'fill-blank' | 'translation' | 'pronunciation' | 'match' | 'translate' | 'multipleChoice';
  question: string;
  options?: string[];
  correctAnswer: string | string[];
  explanation?: string;
  audioUrl?: string;
  difficulty: number;
  xpReward: number;
}

export interface VocabularyItem {
  id: string;
  word: string;
  translation: string;
  pronunciation: string;
  phonetic?: string;
  partOfSpeech: 'noun' | 'verb' | 'adjective' | 'adverb' | 'preposition' | 'conjunction' | 'interjection' | 'pronoun';
  difficulty: number;
  frequency: number; // How common the word is (1-10)
  imageUrl?: string;
  audioUrl?: string;
  exampleSentences: {
    original: string;
    translation: string;
    audioUrl?: string;
  }[];
  tags: string[]; // e.g., ['family', 'basic', 'formal']
  cefrLevel: CEFRLevel;
  mastered: boolean;
  lastReviewed?: string;
}

// Game state types
export interface GameState {
  currentLevel: number;
  lives: number;
  streak: number;
  isPlaying: boolean;
  currentExercise: string | null;
  completedExercises: string[];
  score: number;
}

// Achievement types
export interface Achievement {
  id: string;
  name: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
  points: number;
  rarity?: 'common' | 'rare' | 'epic' | 'legendary';
  category?: string;
  xpReward?: number;
}

// Progress types
export interface Progress {
  lessonsCompleted: number;
  totalLessons: number;
  averageScore: number;
  timeSpent: number; // in minutes
  lastStudyDate?: string;
}

// UI state types
export type Theme = 'light' | 'dark' | 'system';

export interface UIState {
  theme: Theme;
  isLoading: boolean;
  isModalOpen: boolean;
  activeTab: string;
  sidebarOpen: boolean;
  notifications: Notification[];
}

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

// Store types
export interface AuthSlice {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (email: string, password: string, name: string) => Promise<void>;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export interface LanguageSlice {
  currentLanguage: Language | null;
  availableLanguages: Language[];
  targetLanguages: Language[];
  nativeLanguage: Language | null;
  setLanguage: (language: Language) => void;
  addLanguage: (language: Language) => void;
  setNativeLanguage: (language: Language) => void;
  removeLanguage: (languageId: string) => void;
}

export interface GameStateSlice {
  gameState: GameState;
  updateGameState: (updates: Partial<GameState>) => void;
  resetGameState: () => void;
  addLife: () => void;
  removeLife: () => void;
  incrementStreak: () => void;
  resetStreak: () => void;
  completeExercise: (exerciseId: string) => void;
  addScore: (points: number) => void;
}

export interface GamificationSlice {
  points: number;
  level: number;
  experience: number;
  achievements: Achievement[];
  dailyStreak: number;
  lastLoginDate: string | null;
  addPoints: (points: number) => void;
  unlockAchievement: (achievementId: string) => void;
  incrementDailyStreak: () => void;
  resetDailyStreak: () => void;
  calculateLevel: () => number;
  getExperienceToNextLevel: () => number;
}

export interface LearningSlice {
  progress: Progress;
  currentLesson: Lesson | null;
  lessons: Lesson[];
  vocabulary: Record<string, VocabularyItem[]>;
  updateProgress: (updates: Partial<Progress>) => void;
  setCurrentLesson: (lesson: Lesson | null) => void;
  completeLesson: (lessonId: string, score: number) => void;
  addVocabulary: (language: string, words: VocabularyItem[]) => void;
  getProgressPercentage: () => number;
  getStreakDays: () => number;
}

export interface UIStateSlice {
  theme: Theme;
  isLoading: boolean;
  isModalOpen: boolean;
  activeTab: string;
  sidebarOpen: boolean;
  notifications: Notification[];
  setTheme: (theme: Theme) => void;
  setLoading: (loading: boolean) => void;
  setModalOpen: (open: boolean) => void;
  setActiveTab: (tab: string) => void;
  setSidebarOpen: (open: boolean) => void;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}

// Combined store type
export type AppStore = AuthSlice &
  LanguageSlice &
  GameStateSlice &
  GamificationSlice &
  LearningSlice &
  UIStateSlice;

// API types
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// Component props types
export interface BaseComponentProps {
  className?: string;
  style?: any;
  testID?: string;
}

export interface ButtonProps extends BaseComponentProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  icon?: string;
}

export interface CardProps extends BaseComponentProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  onPress?: () => void;
  variant?: 'default' | 'elevated' | 'outlined';
}

export interface InputProps extends BaseComponentProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  type?: 'text' | 'email' | 'password' | 'number';
  disabled?: boolean;
  required?: boolean;
}

// Performance types
export interface PerformanceMetrics {
  renderTime: number;
  memoryUsage: number;
  bundleSize: number;
  loadTime: number;
}

export interface BundleAnalysis {
  totalSize: number;
  fileSizes: Record<string, number>;
  recommendations: string[];
  timestamp: string;
}

// Enhanced Multilingual Lesson Framework Types
export interface MultilingualContent {
  [languageCode: string]: string;
}

// Vocabulary Management
// export interface VocabularyItem {
//   id: string;
//   word: string;
//   translation: string;
//   pronunciation: string;
//   phonetic?: string;
//   partOfSpeech: 'noun' | 'verb' | 'adjective' | 'adverb' | 'preposition' | 'conjunction' | 'interjection' | 'pronoun';
//   difficulty: number;
//   frequency: number; // How common the word is (1-10)
//   imageUrl?: string;
//   audioUrl?: string;
//   exampleSentences: {
//     original: string;
//     translation: string;
//     audioUrl?: string;
//   }[];
//   tags: string[]; // e.g., ['family', 'basic', 'formal']
//   cefrLevel: CEFRLevel;
//   mastered: boolean;
//   lastReviewed?: string;

// Enhanced Exercise Types
export interface MultilingualExercise {
  id: string;
  type: ExerciseType;
  instruction: MultilingualContent;
  question: MultilingualContent;
  options?: MultilingualContent[];
  correctAnswer: string | string[];
  image?: string;
  audio?: string;
  video?: string;
  explanation?: MultilingualContent;
  hints?: MultilingualContent[];
  difficulty: number;
  xpReward: number;
  timeLimit?: number;
  targetLanguage: string;
  mainLanguage: string;
  vocabularyItems?: string[]; // IDs of vocabulary items used
  grammarPoints?: string[]; // Grammar concepts covered
  skills: string[]; // Skills practiced (listening, speaking, etc.)
  gameContent?: Record<string, any>; // Game-specific content
}

// Enhanced Lesson Structure
export interface MultilingualLesson {
  id: string;
  title: MultilingualContent;
  type: LessonType;
  completed: boolean;
  exercises: MultilingualExercise[];
  xpReward: number;
  difficulty: number;
  estimatedTime: number;
  description: MultilingualContent;
  prerequisites?: string[];
  targetLanguage: string;
  mainLanguage: string;
  vocabularyIntroduced: VocabularyItem[]; // New words in this lesson
  vocabularyReviewed: string[]; // IDs of words being reviewed
  grammarConcepts: GrammarConcept[];
  learningObjectives: MultilingualContent[];
  completionCriteria: {
    minimumAccuracy: number;
    requiredExercises: string[];
  };
}

// Grammar Concepts
export interface GrammarConcept {
  id: string;
  title: MultilingualContent;
  description: MultilingualContent;
  examples: {
    original: string;
    translation: string;
    explanation: MultilingualContent;
  }[];
  difficulty: number;
  cefrLevel: CEFRLevel;
  category: 'tense' | 'case' | 'gender' | 'number' | 'syntax' | 'phonetics' | 'other';
}

// Basic Skill Structure (for backward compatibility)
export interface Skill {
  id: string;
  title: string;
  icon: string;
  level: number;
  totalLevels: number;
  lessons: Lesson[];
  locked: boolean;
  color: string;
  cefrLevel: CEFRLevel;
  category: SkillCategory;
  xpRequired: number;
  description: string;
}

// Enhanced Skill Structure
export interface MultilingualSkill {
  id: string;
  title: MultilingualContent;
  icon: string;
  level: number;
  totalLevels: number;
  lessons: MultilingualLesson[];
  locked: boolean;
  color: string;
  cefrLevel: CEFRLevel;
  category: SkillCategory;
  xpRequired: number;
  description: MultilingualContent;
  targetLanguage: string;
  mainLanguage: string;
  vocabularyCount: number; // Total new words in this skill
  estimatedCompletionTime: number; // in minutes
  prerequisites: string[]; // Skill IDs that must be completed first
}

// Module Structure with Vocabulary Targets
export interface LessonModule {
  id: string;
  title: MultilingualContent;
  description: MultilingualContent;
  skills: MultilingualSkill[];
  cefrLevel: CEFRLevel;
  targetLanguage: string;
  mainLanguage: string;
  moduleNumber: number;
  totalModules: number;
  vocabularyTarget: {
    newWords: number;
    reviewWords: number;
    totalWords: number;
  };
  grammarConcepts: string[]; // Grammar concept IDs covered
  unlockRequirement: {
    previousModuleId?: string;
    minimumXP?: number;
    completedSkills?: string[];
    minimumAccuracy?: number;
  };
  estimatedHours: number;
}

// Complete Language Course
export interface LanguageCourse {
  targetLanguage: string;
  mainLanguage: string;
  modules: LessonModule[];
  totalLessons: number;
  estimatedHours: number;
  description: MultilingualContent;
  vocabularyProgression: {
    [level in CEFRLevel]: {
      targetWords: number;
      cumulativeWords: number;
      keyTopics: string[];
    };
  };
  grammarProgression: {
    [level in CEFRLevel]: string[]; // Grammar concept IDs
  };
}

// Enhanced Game Types for Different Exercise Types
export interface WordImageMatchGame {
  type: 'wordImageMatch';
  words: {
    id: string;
    word: string;
    translation: string;
    imageUrl: string;
    audioUrl?: string;
    difficulty: number;
  }[];
  timeLimit: number;
  maxAttempts: number;
  showTranslations: boolean;
}

export interface SentenceBuildingGame {
  type: 'sentenceBuilding';
  targetSentence: string;
  translation: string;
  words: string[];
  distractorWords: string[];
  audioUrl?: string;
  hints: MultilingualContent[];
  grammarFocus?: string; // Grammar concept being practiced
}

export interface FillBlankGame {
  type: 'fillBlank';
  sentence: string;
  translation: string;
  blanks: {
    position: number;
    correctAnswer: string;
    options: string[];
    grammarHint?: MultilingualContent;
  }[];
  audioUrl?: string;
  context?: MultilingualContent;
}

export interface ListeningChallengeGame {
  type: 'listeningChallenge';
  audioUrl: string;
  transcript: string;
  translation: string;
  playbackSpeed: number; // 0.5 to 1.5
  questions: {
    id: string;
    question: MultilingualContent;
    options: MultilingualContent[];
    correctAnswer: string;
    timeInAudio?: number; // When in audio this question refers to
  }[];
  allowReplay: boolean;
  maxReplays: number;
}

export interface SpeakingChallengeGame {
  type: 'speakingChallenge';
  targetPhrase: string;
  translation: string;
  phonetic?: string;
  audioUrl: string;
  acceptableVariations: string[];
  pronunciationTips: MultilingualContent[];
  recordingTimeLimit: number;
  allowRetry: boolean;
}

export interface FlashcardGame {
  type: 'flashcard';
  cards: {
    id: string;
    front: string;
    back: string;
    imageUrl?: string;
    audioUrl?: string;
    difficulty: number;
    lastReviewed?: string;
    reviewCount: number;
    successRate: number;
  }[];
  reviewAlgorithm: 'spaced' | 'random' | 'difficulty';
  sessionLength: number;
  showProgress: boolean;
}

export interface AdaptiveReviewGame {
  type: 'adaptiveReview';
  reviewItems: {
    itemId: string;
    itemType: 'vocabulary' | 'grammar' | 'phrase';
    content: string;
    translation: string;
    lastReviewed: string;
    difficulty: number;
    successRate: number;
    nextReviewDate: string;
    reviewInterval: number; // days
    easeFactor: number; // for spaced repetition
  }[];
  maxItems: number;
  focusWeakAreas: boolean;
}

export interface ConversationGame {
  type: 'conversation';
  scenario: MultilingualContent;
  dialogue: {
    speaker: 'user' | 'ai';
    text: string;
    translation: string;
    audioUrl?: string;
    options?: string[]; // For multiple choice responses
  }[];
  objectives: MultilingualContent[];
  vocabulary: string[]; // Vocabulary IDs to practice
}

export type GameContent = 
  | WordImageMatchGame 
  | SentenceBuildingGame 
  | FillBlankGame 
  | ListeningChallengeGame 
  | SpeakingChallengeGame 
  | FlashcardGame 
  | AdaptiveReviewGame
  | ConversationGame;

// Enhanced Lesson Content Schema
export interface LessonContentSchema {
  lessonId: string;
  mainLanguage: string;
  targetLanguage: string;
  level: CEFRLevel;
  module: number;
  lesson: number;
  exerciseType: ExerciseType;
  content: {
    instruction: MultilingualContent;
    question: MultilingualContent;
    options?: MultilingualContent[];
    correctAnswer: string | string[];
    explanation: MultilingualContent;
    hints?: MultilingualContent[];
    context?: MultilingualContent; // Additional context for the exercise
  };
  gameContent?: GameContent;
  media: {
    images?: string[];
    audio?: string[];
    video?: string[];
  };
  metadata: {
    difficulty: number;
    xpReward: number;
    estimatedTime: number;
    skills: string[]; // listening, speaking, reading, writing
    topics: string[]; // family, food, travel, etc.
    vocabularyIds: string[]; // Vocabulary items used
    grammarIds: string[]; // Grammar concepts covered
    prerequisites: string[]; // Required lesson/skill IDs
  };
  adaptiveSettings: {
    minAccuracy: number; // Minimum accuracy to pass
    maxAttempts: number;
    timeLimit?: number;
    hintsAllowed: number;
  };
}

// Enhanced User Settings for Multilingual Support
export interface UserLanguageSettings {
  mainLanguage: string; // UI language
  targetLanguage: string; // Language being learned
  previousTargetLanguages: string[]; // History of languages learned
  interfacePreferences: {
    showTranslations: boolean;
    showPhonetics: boolean;
    audioAutoplay: boolean;
    playbackSpeed: number; // 0.5 to 1.5
    difficultyLevel: 'beginner' | 'intermediate' | 'advanced';
    reviewFrequency: 'daily' | 'weekly' | 'custom';
    notificationsEnabled: boolean;
    darkMode: boolean;
  };
  learningGoals: {
    dailyXPTarget: number;
    weeklyLessonTarget: number;
    targetLevel: CEFRLevel;
    completionDate?: string;
  };
}

// Enhanced Progress Tracking for Multiple Languages
export interface MultilingualProgress {
  userId: string;
  languageProgresses: {
    [languageCode: string]: {
      currentLevel: CEFRLevel;
      totalXP: number;
      completedModules: string[];
      completedSkills: string[];
      completedLessons: string[];
      currentStreak: number;
      longestStreak: number;
      lastPracticeDate: string;
      weakAreas: string[];
      strongAreas: string[];
      timeSpent: number; // in minutes
      achievements: Achievement[];
      adaptiveDifficulty: AdaptiveDifficulty;
      vocabularyMastered: string[]; // Vocabulary item IDs
      grammarMastered: string[]; // Grammar concept IDs
      skillLevels: {
        listening: number; // 1-10
        speaking: number;
        reading: number;
        writing: number;
        vocabulary: number;
        grammar: number;
      };
      weeklyProgress: {
        week: string; // ISO week string
        xpEarned: number;
        lessonsCompleted: number;
        timeSpent: number;
        accuracy: number;
      }[];
    };
  };
  overallStats: {
    totalLanguagesStarted: number;
    totalLanguagesCompleted: number;
    totalXPAllLanguages: number;
    totalTimeSpent: number;
    favoriteLanguage: string;
    averageAccuracy: number;
    totalWordsLearned: number;
    joinDate: string;
  };
}

// Spaced Repetition System
export interface SpacedRepetitionItem {
  id: string;
  userId: string;
  itemId: string; // vocabulary or grammar concept ID
  itemType: 'vocabulary' | 'grammar' | 'phrase';
  languageCode: string;
  easeFactor: number; // 1.3 to 2.5
  interval: number; // days until next review
  repetitions: number;
  nextReviewDate: string;
  lastReviewed: string;
  quality: number; // 0-5, last performance
  averageQuality: number;
  totalReviews: number;
}

// Learning Analytics
export interface LearningAnalytics {
  userId: string;
  languageCode: string;
  period: 'daily' | 'weekly' | 'monthly';
  date: string;
  metrics: {
    lessonsCompleted: number;
    xpEarned: number;
    timeSpent: number; // minutes
    accuracy: number; // percentage
    streakMaintained: boolean;
    newWordsLearned: number;
    wordsReviewed: number;
    skillsImproved: string[];
    weakAreasIdentified: string[];
    strongAreasReinforced: string[];
  };
  recommendations: {
    focusAreas: string[];
    suggestedLessons: string[];
    reviewItems: string[];
    difficultyAdjustment: 'increase' | 'decrease' | 'maintain';
  };
}

// Social Features
export interface FriendRequest {
  id: string;
  fromUserId: string;
  fromUserName: string;
  fromUserAvatar?: string;
  toUserId: string;
  toUserName: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: string;
  respondedAt?: string;
  message?: string;
}

// Gamification State
export interface UserGamificationState {
  userId: string;
  level: number;
  totalXP: number;
  weeklyXP: number;
  streak: number;
  longestStreak: number;
  achievements: Achievement[];
  currentLeague?: League;
  activeChallenges: Challenge[];
  dailyChallenges: DailyChallenge[];
  lastStudyDate: string;
  coins: number;
  gems: number;
  hearts: number;
  maxHearts: number;
}

// Learning Path Progress
export interface LearningPathProgress {
  userId: string;
  languageCode: string;
  pathId: string;
  completedLessons: string[];
  currentLesson?: string;
  progress: number; // 0-100
  startDate: string;
  lastActivityDate: string;
  estimatedCompletionDate?: string;
}

// Alternative Path Progress
export interface AlternativePathProgress {
  userId: string;
  languageCode: string;
  pathId: string;
  type: 'thematic' | 'survival' | 'cultural' | 'business';
  completedLessons: string[];
  progress: number;
  startDate: string;
  lastActivityDate: string;
}

// Micro Challenge
export interface MicroChallenge {
  id: string;
  userId: string;
  type: 'vocabulary' | 'grammar' | 'pronunciation' | 'listening' | 'speaking';
  target: number;
  current: number;
  reward: number;
  expiresAt: string;
  completed: boolean;
  completedAt?: string;
}

// Shop Item
export interface ShopItem {
  id: string;
  name: string;
  title: string;
  description: string;
  price: number;
  cost: number; // Added missing cost property
  currency: string;
  type: 'premium' | 'booster' | 'cosmetic' | 'feature' | 'hearts' | 'lives' | 'streak_protector' | 'xp_boost' | 'streak_freeze';
  icon: string;
  imageUrl?: string;
  available: boolean;
  purchaseLimit?: number;
  expiresAt?: string;
  rarity?: 'common' | 'rare' | 'epic' | 'legendary';
  effects?: Record<string, any>;
  animated?: boolean;
  glowColor?: string;
}

// Lesson Content
export interface LessonContent {
  id: string;
  title: string;
  description: string;
  level: CEFRLevel;
  languageCode: string;
  cefrLevel: CEFRLevel;
  skills: MultilingualSkill[];
  lessons: MultilingualLesson[];
  exercises: MultilingualExercise[];
}

export interface Friend {
  id: string;
  name: string;
  avatar?: string;
  level: number;
  totalXP: number;
  streak: number;
  lastActive: string;
  isOnline: boolean;
  currentLanguage?: string;
  mutualFriends?: number;
}

// export interface SocialStats {
//   totalFriends: number;
//   friendsCount: number;
//   challengesWon: number;
//   challengesLost: number;
//   helpfulVotes: number;
//   communityRank: number;
//   helpGiven: number;
//   helpReceived: number;
//   groupsJoined: string[];
// }

export interface Challenge {
  id: string;
  type: 'xp_race' | 'lesson_count' | 'streak_battle' | 'vocabulary_duel';
  challengerId: string;
  challengedId: string;
  status: 'pending' | 'active' | 'completed' | 'expired';
  startDate: string;
  endDate: string;
  goal: number;
  challengerProgress: number;
  challengedProgress: number;
  winner?: string;
  reward: {
    xp: number;
    coins: number;
    items?: string[];
  };
}

// Gamification System
export interface League {
  id: string;
  name: string;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond' | 'legendary';
  minXP: number;
  maxXP: number;
  color: string;
  icon: string;
  rewards: {
    promotion: { xp: number; coins: number; items?: string[] };
    demotion: { xp: number; coins: number };
  };
}

export interface WeeklyLeaderboard {
  weekId: string;
  startDate: string;
  endDate: string;
  participants: {
    userId: string;
    name: string;
    avatar?: string;
    weeklyXP: number;
    rank: number;
    league: string;
  }[];
  rewards: {
    [rank: number]: {
      xp: number;
      coins: number;
      items?: string[];
    };
  };
}

export interface DailyChallenge {
  id: string;
  date: string;
  type: 'lesson_completion' | 'xp_target' | 'perfect_lesson' | 'streak_maintenance' | 'vocabulary_review';
  title: MultilingualContent;
  description: MultilingualContent;
  goal: number;
  progress: number;
  completed: boolean;
  reward: {
    xp: number;
    coins: number;
    items?: string[];
  };
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface AvatarCustomization {
  head: string;
  body: string;
  outfit: string;
  accessory?: string;
  background: string;
  unlockedItems: string[];
}

// Story Mode & Immersive Features
export interface StoryChapter {
  id: string;
  title: MultilingualContent;
  description: MultilingualContent;
  scenario: MultilingualContent;
  targetLanguage: string;
  mainLanguage: string;
  cefrLevel: CEFRLevel;
  scenes: StoryScene[];
  unlockRequirements: {
    completedLessons?: string[];
    minimumXP?: number;
    completedChapters?: string[];
  };
  rewards: {
    xp: number;
    coins: number;
    achievements?: string[];
  };
}

export interface StoryScene {
  id: string;
  type: 'dialogue' | 'choice' | 'exercise' | 'narrative';
  content: MultilingualContent;
  character?: {
    name: string;
    avatar: string;
    voice?: string;
  };
  choices?: {
    id: string;
    text: MultilingualContent;
    nextSceneId: string;
    consequences?: {
      xp?: number;
      relationship?: { character: string; change: number };
    };
  }[];
  exercise?: MultilingualExercise;
  audioUrl?: string;
  imageUrl?: string;
  videoUrl?: string;
}

// Pronunciation & Speech Features
export interface PronunciationAssessment {
  id: string;
  userId: string;
  targetPhrase: string;
  userRecording: string; // base64 audio
  accuracy: number; // 0-100
  feedback: {
    overallScore: number;
    wordScores: {
      word: string;
      score: number;
      issues?: string[];
    }[];
    suggestions: MultilingualContent[];
  };
  createdAt: string;
}

// Notification System
export interface SmartNotification {
  id: string;
  userId: string;
  type: 'reminder' | 'streak_risk' | 'friend_activity' | 'challenge' | 'achievement' | 'review_due';
  title: MultilingualContent;
  body: MultilingualContent;
  scheduledFor: string;
  sent: boolean;
  opened: boolean;
  data?: {
    lessonId?: string;
    challengeId?: string;
    achievementId?: string;
    friendId?: string;
  };
}

// Analytics & Insights
export interface LearningInsight {
  id: string;
  userId: string;
  type: 'strength' | 'weakness' | 'recommendation' | 'milestone' | 'prediction' | 'improvement' | 'suggestion';
  title: MultilingualContent;
  description: MultilingualContent;
  data: {
    skill?: string;
    accuracy?: number;
    timeSpent?: number;
    comparison?: 'better' | 'worse' | 'average' | 'needs_improvement';
    suggestion?: string;
    pattern?: string | {
      type: 'consistent' | 'sporadic' | 'intensive';
      frequency: number;
      consistency: number;
      trend: 'improving' | 'declining' | 'stable';
    };
    engagementScore?: number;
    skillGaps?: string[];
    suggestions?: string[];
  };
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  dismissed: boolean;
}

// Offline Support
export interface OfflineContent {
  id: string;
  type: 'lesson' | 'vocabulary' | 'audio' | 'image';
  languageCode: string;
  contentId: string;
  data: string; // base64 or JSON string
  size: number; // bytes
  downloadedAt: string;
  lastAccessed: string;
  priority: 'high' | 'medium' | 'low';
}

// Enhanced Shop System
export interface EnhancedShopItem {
  id: string;
  type: 'consumable' | 'permanent' | 'cosmetic' | 'boost';
  category: 'hearts' | 'lives' | 'streaks' | 'xp_boost' | 'avatar' | 'themes' | 'premium';
  title: MultilingualContent;
  description: MultilingualContent;
  icon: string;
  cost: {
    coins?: number;
    gems?: number;
    realMoney?: number;
  };
  effects?: {
    hearts?: number;
    lives?: number;
    streakFreeze?: number;
    xpMultiplier?: number;
    duration?: number; // minutes
  };
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  availability: {
    startDate?: string;
    endDate?: string;
    maxPurchases?: number;
    userLevel?: number;
  };
  owned: boolean;
  quantity?: number;
  animated?: boolean;
  glowColor?: string;
  purchaseCount?: number;
}

// Real-world Context Learning
export interface ContextScenario {
  id: string;
  title: MultilingualContent;
  description: MultilingualContent;
  setting: 'restaurant' | 'airport' | 'hotel' | 'shopping' | 'hospital' | 'office' | 'social';
  targetLanguage: string;
  mainLanguage: string;
  cefrLevel: CEFRLevel;
  dialogues: {
    id: string;
    speaker: 'user' | 'npc';
    text: string;
    translation: string;
    audioUrl?: string;
    options?: string[];
  }[];
  vocabulary: string[]; // Vocabulary IDs
  culturalNotes?: MultilingualContent[];
  completionReward: {
    xp: number;
    coins: number;
  };
}
