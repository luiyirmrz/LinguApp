/**
 * MSW Server Setup for API Mocking
 * Provides mock handlers for all API endpoints used in tests
 */

import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';

// Mock API responses
const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  name: 'Test User',
  mainLanguage: { code: 'en', name: 'English', flag: '🇺🇸' },
  currentLanguage: { code: 'hr', name: 'Croatian', flag: '🇭🇷' },
  preferences: {
    theme: 'system',
    notifications: true,
    soundEnabled: true,
    autoPlay: true,
  },
  onboardingCompleted: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const mockLessons = [
  {
    id: 'lesson-1',
    title: 'Basic Greetings',
    description: 'Learn basic greetings in Croatian',
    level: 'A1',
    category: 'greetings',
    exercises: ['exercise-1', 'exercise-2'],
    estimatedTime: 10,
    xpReward: 50,
    completed: false,
  },
  {
    id: 'lesson-2',
    title: 'Numbers 1-10',
    description: 'Learn numbers from 1 to 10',
    level: 'A1',
    category: 'numbers',
    exercises: ['exercise-3', 'exercise-4'],
    estimatedTime: 15,
    xpReward: 75,
    completed: true,
  },
];

const mockExercises = [
  {
    id: 'exercise-1',
    type: 'multiple-choice',
    question: 'How do you say "Hello" in Croatian?',
    options: ['Zdravo', 'Hvala', 'Molim', 'Doviđenja'],
    correctAnswer: 0,
    explanation: 'Zdravo is the most common way to say hello in Croatian.',
  },
  {
    id: 'exercise-2',
    type: 'translation',
    question: 'Translate "Good morning" to Croatian',
    answer: 'Dobro jutro',
    hints: ['Dobro = good', 'jutro = morning'],
  },
];

const mockProgress = {
  userId: 'test-user-id',
  totalXP: 1250,
  level: 5,
  streak: 7,
  lessonsCompleted: 12,
  wordsLearned: 150,
  accuracy: 0.85,
  timeSpent: 3600, // seconds
  achievements: ['first-lesson', 'week-streak'],
};

// API handlers
export const handlers = [
  // Auth endpoints
  http.post('/api/auth/signin', () => {
    return HttpResponse.json({
      success: true,
      user: mockUser,
      token: 'mock-jwt-token',
    });
  }),

  http.post('/api/auth/signup', () => {
    return HttpResponse.json({
      success: true,
      user: mockUser,
      token: 'mock-jwt-token',
    });
  }),

  http.post('/api/auth/signout', () => {
    return HttpResponse.json({
      success: true,
    });
  }),

  // User endpoints
  http.get('/api/user/profile', () => {
    return HttpResponse.json({
      success: true,
      user: mockUser,
    });
  }),

  http.put('/api/user/profile', () => {
    return HttpResponse.json({
      success: true,
      user: { ...mockUser, updatedAt: new Date().toISOString() },
    });
  }),

  http.get('/api/user/preferences', () => {
    return HttpResponse.json({
      success: true,
      preferences: mockUser.preferences,
    });
  }),

  http.put('/api/user/preferences', () => {
    return HttpResponse.json({
      success: true,
      preferences: mockUser.preferences,
    });
  }),

  // Lessons endpoints
  http.get('/api/lessons', () => {
    return HttpResponse.json({
      success: true,
      lessons: mockLessons,
    });
  }),

  http.get('/api/lessons/:id', ({ params }) => {
    const lesson = mockLessons.find(l => l.id === params.id);
    if (!lesson) {
      return HttpResponse.json(
        { success: false, error: 'Lesson not found' },
        { status: 404 },
      );
    }
    return HttpResponse.json({
      success: true,
      lesson,
    });
  }),

  http.post('/api/lessons/:id/complete', () => {
    return HttpResponse.json({
      success: true,
      xpEarned: 50,
      levelUp: false,
    });
  }),

  // Exercises endpoints
  http.get('/api/exercises/:id', ({ params }) => {
    const exercise = mockExercises.find(e => e.id === params.id);
    if (!exercise) {
      return HttpResponse.json(
        { success: false, error: 'Exercise not found' },
        { status: 404 },
      );
    }
    return HttpResponse.json({
      success: true,
      exercise,
    });
  }),

  http.post('/api/exercises/:id/submit', () => {
    return HttpResponse.json({
      success: true,
      correct: true,
      xpEarned: 10,
      feedback: 'Great job!',
    });
  }),

  // Progress endpoints
  http.get('/api/progress', () => {
    return HttpResponse.json({
      success: true,
      progress: mockProgress,
    });
  }),

  http.post('/api/progress/update', () => {
    return HttpResponse.json({
      success: true,
      progress: { ...mockProgress, totalXP: mockProgress.totalXP + 10 },
    });
  }),

  // Gamification endpoints
  http.get('/api/gamification/achievements', () => {
    return HttpResponse.json({
      success: true,
      achievements: [
        {
          id: 'first-lesson',
          title: 'First Steps',
          description: 'Complete your first lesson',
          icon: '🎯',
          unlocked: true,
          unlockedAt: new Date().toISOString(),
        },
        {
          id: 'week-streak',
          title: 'Week Warrior',
          description: 'Maintain a 7-day streak',
          icon: '🔥',
          unlocked: true,
          unlockedAt: new Date().toISOString(),
        },
      ],
    });
  }),

  http.get('/api/gamification/leaderboard', () => {
    return HttpResponse.json({
      success: true,
      leaderboard: [
        { userId: 'user-1', name: 'Alice', xp: 2500, rank: 1 },
        { userId: 'user-2', name: 'Bob', xp: 2000, rank: 2 },
        { userId: 'test-user-id', name: 'Test User', xp: 1250, rank: 3 },
      ],
    });
  }),

  // Language endpoints
  http.get('/api/languages', () => {
    return HttpResponse.json({
      success: true,
      languages: [
        { code: 'en', name: 'English', flag: '🇺🇸' },
        { code: 'es', name: 'Spanish', flag: '🇪🇸' },
        { code: 'hr', name: 'Croatian', flag: '🇭🇷' },
        { code: 'fr', name: 'French', flag: '🇫🇷' },
        { code: 'de', name: 'German', flag: '🇩🇪' },
      ],
    });
  }),

  // SRS endpoints
  http.get('/api/srs/reviews', () => {
    return HttpResponse.json({
      success: true,
      reviews: [
        {
          id: 'review-1',
          word: 'Zdravo',
          translation: 'Hello',
          nextReview: new Date(Date.now() + 86400000).toISOString(),
          interval: 1,
          easeFactor: 2.5,
        },
      ],
    });
  }),

  http.post('/api/srs/review/:id', () => {
    return HttpResponse.json({
      success: true,
      nextReview: new Date(Date.now() + 172800000).toISOString(),
      interval: 2,
    });
  }),

  // Error handlers
  http.all('*', () => {
    return HttpResponse.json(
      { success: false, error: 'API endpoint not found' },
      { status: 404 },
    );
  }),
];

// Create and export the server
export const server = setupServer(...handlers);
