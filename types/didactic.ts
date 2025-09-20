// Enhanced Didactic Types for Adaptive Language Learning Platform
// Comprehensive type definitions for didactic features, SRS, and personalization

// CEFR Levels
export type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

// Learning Goals
export type LearningGoal = 'vocabulary' | 'speaking' | 'listening' | 'grammar' | 'fluency' | 'travel' | 'business' | 'culture';

// Practice Modes
export type PracticeMode = 'flashcards' | 'dictation' | 'dialogues' | 'speaking' | 'listening' | 'grammar' | 'survival';

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

// Exercise with Adaptive Features
export interface AdaptiveExercise {
  id: string;
  type: string;
  cefrLevel: CEFRLevel;
  difficulty: DifficultyLevel;
  
  // Content
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation?: string;
  
  // Media
  audioUrl?: string;
  imageUrl?: string;
  
  // Adaptive features
  adaptiveDifficulty: number; // 0-1, dynamically adjusted
  prerequisites: string[]; // word/skill IDs
  
  // Performance tracking
  averageAccuracy: number;
  averageTime: number;
  
  // Metadata
  tags: string[];
  category: string;
  estimatedTime: number; // seconds
}

// Micro-Conversation with Branching
export interface MicroConversation {
  id: string;
  title: string;
  scenario: string; // "Ordering coffee", "Asking directions"
  cefrLevel: CEFRLevel;
  
  // Conversation flow
  messages: ConversationMessage[];
  
  // Adaptive features
  difficulty: DifficultyLevel;
  culturalContext: string;
  
  // Performance tracking
  completionRate: number;
  averageAccuracy: number;
}

export interface ConversationMessage {
  id: string;
  speaker: 'user' | 'npc';
  text: string;
  audioUrl?: string;
  
  // Branching options for user responses
  options?: {
    id: string;
    text: string;
    isCorrect: boolean;
    feedback: string;
    nextMessageId?: string;
  }[];
  
  // Auto-correction hints
  hints?: string[];
  
  // Cultural notes
  culturalNote?: string;
}

// Learning Path with Personalization
export interface LearningPath {
  id: string;
  name: string;
  type: LearningPathType;
  description: string;
  
  // Structure
  modules: LearningModule[];
  
  // Personalization
  recommendedFor: {
    goals: LearningGoal[];
    levels: CEFRLevel[];
    timeCommitment: number; // minutes per day
  };
  
  // Progress tracking
  estimatedDuration: number; // days
  completionRate: number;
}

export interface LearningModule {
  id: string;
  name: string;
  description: string;
  
  // Content
  lessons: AdaptiveLesson[];
  
  // Requirements
  prerequisites: string[]; // module IDs
  cefrLevel: CEFRLevel;
  
  // Adaptive features
  adaptiveOrder: boolean; // reorder based on performance
  
  // Cultural content
  culturalContent?: CulturalContent[];
}

export interface AdaptiveLesson {
  id: string;
  title: string;
  description: string;
  
  // Content
  exercises: AdaptiveExercise[];
  vocabulary: WordSRS[];
  conversations?: MicroConversation[];
  
  // Adaptive features
  difficulty: DifficultyLevel;
  adaptiveDifficulty: number; // 0-1
  
  // Requirements
  prerequisites: string[];
  cefrLevel: CEFRLevel;
  
  // Rewards
  xpReward: number;
  coinReward: number;
  
  // Performance tracking
  averageAccuracy: number;
  averageCompletionTime: number;
  
  // Survival mode features
  survivalMode?: {
    timeLimit: number; // seconds
    bonusMultiplier: number;
    scenario: string;
  };
}

// Cultural Content for Immersion
export interface CulturalContent {
  id: string;
  type: 'phrase' | 'song' | 'video' | 'tradition' | 'etiquette';
  title: string;
  content: string;
  
  // Media
  audioUrl?: string;
  videoUrl?: string;
  imageUrl?: string;
  
  // Unlock conditions
  requiredLevel: CEFRLevel;
  requiredXP: number;
  
  // Educational value
  culturalNotes: string;
  practicalUse: string;
}

// User Performance Analytics
export interface UserPerformanceAnalytics {
  userId: string;
  
  // Overall metrics
  currentCEFRLevel: CEFRLevel;
  estimatedCEFRLevel: CEFRLevel; // AI-estimated based on performance
  
  // Strengths and weaknesses
  strengths: {
    skill: string;
    confidence: number; // 0-1
  }[];
  
  weaknesses: {
    skill: string;
    difficulty: number; // 0-1
    recommendedPractice: PracticeMode[];
  }[];
  
  // Detailed analytics
  skillBreakdown: {
    vocabulary: number; // 0-100
    grammar: number;
    listening: number;
    speaking: number;
    reading: number;
    writing: number;
  };
  
  // Learning patterns
  optimalStudyTime: string; // time of day
  averageSessionLength: number; // minutes
  preferredExerciseTypes: string[];
  
  // Progress tracking
  wordsLearned: number;
  wordsReviewed: number;
  lessonsCompleted: number;
  streakDays: number;
  
  // Predictions
  nextLevelETA: string; // estimated date
  recommendedDailyGoal: number; // XP
}

// Survival Mode Scenario
export interface SurvivalScenario {
  id: string;
  title: string;
  description: string;
  scenario: string; // "You're lost in a foreign city"
  
  // Difficulty and timing
  cefrLevel: CEFRLevel;
  timeLimit: number; // seconds
  
  // Challenges
  challenges: SurvivalChallenge[];
  
  // Rewards
  baseXP: number;
  bonusMultiplier: number;
  
  // Real-world context
  realWorldTips: string[];
  culturalContext: string;
}

export interface SurvivalChallenge {
  id: string;
  type: 'quick_response' | 'pronunciation' | 'comprehension' | 'translation';
  question: string;
  correctAnswer: string;
  timeLimit: number; // seconds
  
  // Feedback
  successMessage: string;
  failureMessage: string;
  hint?: string;
  
  // Points
  basePoints: number;
  timeBonus: boolean;
}

// Pronunciation Analysis
export interface PronunciationAnalysis {
  wordId: string;
  userId: string;
  
  // Audio data
  recordingUrl: string;
  duration: number;
  
  // Analysis results
  overallScore: number; // 0-100
  phonemeScores: {
    phoneme: string;
    expected: string;
    actual: string;
    score: number;
    feedback: string;
  }[];
  
  // Recommendations
  improvements: {
    phoneme: string;
    tip: string;
    practiceExercises: string[];
  }[];
  
  // Progress tracking
  previousScore?: number;
  improvement: number;
  
  // Metadata
  timestamp: string;
  deviceInfo: string;
}

// Social Learning Features
export interface SocialChallenge {
  id: string;
  type: 'vocabulary_duel' | 'pronunciation_battle' | 'conversation_practice';
  
  // Participants
  challenger: string; // user ID
  opponent: string; // user ID
  
  // Challenge details
  exercises: AdaptiveExercise[];
  timeLimit: number;
  
  // Results
  status: 'pending' | 'active' | 'completed' | 'expired';
  winner?: string;
  scores: {
    userId: string;
    score: number;
    accuracy: number;
    timeSpent: number;
  }[];
  
  // Rewards
  xpReward: number;
  coinReward: number;
  
  // Metadata
  createdAt: string;
  completedAt?: string;
}

// Advanced CEFR Evaluation
export interface CEFRAssessment {
  id: string;
  userId: string;
  
  // Test structure
  sections: {
    skill: 'vocabulary' | 'grammar' | 'listening' | 'reading';
    exercises: AdaptiveExercise[];
    weight: number; // importance in final score
  }[];
  
  // Results
  overallLevel: CEFRLevel;
  skillLevels: {
    vocabulary: CEFRLevel;
    grammar: CEFRLevel;
    listening: CEFRLevel;
    reading: CEFRLevel;
  };
  
  // Detailed analysis
  strengths: string[];
  weaknesses: string[];
  recommendations: {
    skill: string;
    suggestion: string;
    resources: string[];
  }[];
  
  // Confidence intervals
  confidence: number; // 0-1
  
  // Metadata
  completedAt: string;
  duration: number; // minutes
  accuracy: number;
}

// Level Test Question
export interface LevelTestQuestion {
  id: string;
  cefrLevel: CEFRLevel;
  type: 'vocabulary' | 'grammar' | 'listening' | 'reading';
  question: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
  audioUrl?: string;
  imageUrl?: string;
  difficulty: number; // 1-10
  weight: number; // importance in scoring
}

// Level Test Result
export interface LevelTestResult {
  userId: string;
  testId: string;
  
  // Scores by skill
  vocabularyScore: number; // 0-100
  grammarScore: number;
  listeningScore: number;
  readingScore: number;
  overallScore: number;
  
  // Determined level
  estimatedLevel: CEFRLevel;
  confidence: number; // 0-1
  
  // Detailed breakdown
  skillAnalysis: {
    skill: string;
    level: CEFRLevel;
    strengths: string[];
    weaknesses: string[];
  }[];
  
  // Recommendations
  recommendedStartingLevel: CEFRLevel;
  suggestedFocusAreas: string[];
  
  // Metadata
  completedAt: string;
  duration: number; // minutes
  questionsAnswered: number;
  totalQuestions: number;
}
