// Basic Greetings Module Types
// Comprehensive type definitions for the greetings learning module

import { CEFRLevel, ExerciseType, MultilingualContent } from './index';

// Greeting Item with comprehensive data
export interface GreetingItem {
  id: string;
  greeting: string;
  translation: string;
  phonetic?: string;
  audioUrl?: string;
  imageUrl?: string;
  context: 'formal' | 'informal' | 'neutral';
  timeOfDay?: 'morning' | 'afternoon' | 'evening' | 'any';
  culturalNotes?: MultilingualContent;
  difficulty: 1 | 2 | 3 | 4 | 5;
  cefrLevel: CEFRLevel;
  tags: string[];
  exampleSentences: {
    original: string;
    translation: string;
    audioUrl?: string;
  }[];
}

// Greeting Exercise with adaptive difficulty
export interface GreetingExercise {
  id: string;
  type: ExerciseType;
  greetingId: string;
  instruction: MultilingualContent;
  question: MultilingualContent;
  options?: string[];
  correctAnswer: string | string[];
  audioUrl?: string;
  imageUrl?: string;
  hints?: MultilingualContent[];
  explanation?: MultilingualContent;
  timeLimit?: number;
  xpReward: number;
  difficulty: number;
  adaptiveSettings: {
    minAccuracy: number;
    maxAttempts: number;
    hintsAllowed: number;
  };
}

// Mini-lesson structure (1-2 minutes)
export interface GreetingMiniLesson {
  id: string;
  title: MultilingualContent;
  description: MultilingualContent;
  greetings: GreetingItem[];
  exercises: GreetingExercise[];
  estimatedTime: number; // in seconds
  xpReward: number;
  completionCriteria: {
    minimumAccuracy: number;
    requiredExercises: string[];
  };
  unlockRequirements?: {
    previousLessons?: string[];
    minimumXP?: number;
  };
}

// Complete Greetings Module
export interface GreetingsModule {
  id: string;
  title: MultilingualContent;
  description: MultilingualContent;
  miniLessons: GreetingMiniLesson[];
  totalEstimatedTime: number;
  totalXPReward: number;
  completionReward: {
    xp: number;
    achievement?: string;
    unlocksNext?: string; // Next module ID
  };
  progressTracking: {
    lessonsCompleted: number;
    totalLessons: number;
    accuracy: number;
    timeSpent: number;
    streakDays: number;
  };
}

// User progress for greetings module
export interface GreetingsProgress {
  userId: string;
  moduleId: string;
  completedLessons: string[];
  currentLesson?: string;
  exerciseResults: {
    exerciseId: string;
    attempts: number;
    bestAccuracy: number;
    averageTime: number;
    lastAttempt: string;
    srsData?: {
      interval: number;
      easeFactor: number;
      nextReview: string;
    };
  }[];
  overallStats: {
    totalXP: number;
    averageAccuracy: number;
    totalTimeSpent: number;
    streakDays: number;
    difficultGreetings: string[]; // IDs of greetings that need more practice
  };
  achievements: string[];
  lastPracticeDate: string;
}

// Pronunciation feedback specific to greetings
export interface GreetingPronunciationFeedback {
  greetingId: string;
  accuracy: number;
  phonemeAnalysis: {
    phoneme: string;
    expected: string;
    actual: string;
    accuracy: number;
    feedback: MultilingualContent;
  }[];
  overallFeedback: MultilingualContent;
  suggestions: MultilingualContent[];
  culturalTips?: MultilingualContent[];
}

// Exercise result with comprehensive tracking
export interface GreetingExerciseResult {
  exerciseId: string;
  greetingId: string;
  userId: string;
  isCorrect: boolean;
  accuracy: number;
  responseTime: number;
  hintsUsed: number;
  attempts: number;
  userAnswer: string | string[];
  correctAnswer: string | string[];
  timestamp: string;
  xpEarned: number;
  pronunciationFeedback?: GreetingPronunciationFeedback;
}

// Adaptive session for greetings practice
export interface GreetingsAdaptiveSession {
  id: string;
  userId: string;
  sessionType: 'review' | 'new_content' | 'mixed' | 'pronunciation_focus';
  exercises: GreetingExercise[];
  estimatedTime: number;
  targetAccuracy: number;
  adaptiveSettings: {
    difficultyAdjustment: boolean;
    focusWeakAreas: boolean;
    includeReview: boolean;
    pronunciationPractice: boolean;
  };
  sessionGoals: MultilingualContent[];
  createdAt: string;
}

// Gamification elements specific to greetings
export interface GreetingsGamification {
  streakBonus: {
    days: number;
    multiplier: number;
    description: MultilingualContent;
  };
  completionMedallion: {
    id: string;
    title: MultilingualContent;
    description: MultilingualContent;
    imageUrl: string;
    unlockedAt?: string;
  };
  milestones: {
    id: string;
    requirement: {
      type: 'lessons_completed' | 'accuracy_achieved' | 'streak_maintained' | 'time_spent';
      value: number;
    };
    reward: {
      xp: number;
      title: MultilingualContent;
      description: MultilingualContent;
    };
    unlocked: boolean;
  }[];
}
