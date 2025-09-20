// Greetings Module Hook - Comprehensive State Management
// Integrates SRS, gamification, progress tracking, and adaptive learning

import { useState, useCallback, useEffect, useMemo } from 'react';
import createContextHook from '@nkzw/create-context-hook';
import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  GreetingsModule,
  GreetingMiniLesson,
  GreetingExercise,
  GreetingExerciseResult,
  GreetingsProgress,
  GreetingPronunciationFeedback,
  GreetingsAdaptiveSession,
  GreetingsGamification,
} from '@/types/greetings';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';
import useEnhancedGamification from "@/hooks/useEnhancedGamification";
import { useDidactic } from '@/hooks/useDidactic';
import { EnhancedSRSService } from '@/services/learning/enhancedSRS';
import { basicGreetingsModule, croatianGreetings } from '@/data/greetingsModule';
import { useUniversalAudio } from '@/hooks/useUniversalAudio';

// Storage keys
const GREETINGS_PROGRESS_KEY = 'linguapp_greetings_progress';
const GREETINGS_SESSION_KEY = 'linguapp_greetings_session';

interface GreetingsState {
  module: GreetingsModule;
  progress: GreetingsProgress | null;
  currentLesson: GreetingMiniLesson | null;
  currentExercise: GreetingExercise | null;
  exerciseIndex: number;
  sessionActive: boolean;
  sessionStartTime: number;
  exerciseResults: GreetingExerciseResult[];
  adaptiveSession: GreetingsAdaptiveSession | null;
  gamification: GreetingsGamification;
  isLoading: boolean;
  error: string | null;
  pronunciationFeedback: GreetingPronunciationFeedback | null;
  streakData: {
    currentStreak: number;
    longestStreak: number;
    lastPracticeDate: string;
  };
}

interface GreetingsActions {
  // Lesson Management
  startLesson: (lessonId: string) => Promise<void>;
  completeLesson: () => Promise<void>;
  
  // Exercise Management
  startExercise: (exerciseId: string) => void;
  submitExerciseResult: (result: Omit<GreetingExerciseResult, 'timestamp' | 'xpEarned'>) => Promise<void>;
  nextExercise: () => void;
  
  // Adaptive Learning
  generateAdaptiveSession: (sessionType?: 'review' | 'new_content' | 'mixed' | 'pronunciation_focus') => Promise<void>;
  
  // Pronunciation
  analyzePronunciation: (audioBlob: Blob, greetingId: string) => Promise<GreetingPronunciationFeedback>;
  
  // Progress Management
  refreshProgress: () => Promise<void>;
  resetProgress: () => Promise<void>;
  
  // Utility
  getUIText: (key: string) => string;
  playAudio: (audioUrl: string, fallbackText?: string) => Promise<void>;
}

type GreetingsContextType = GreetingsState & GreetingsActions;

export const [GreetingsProvider, useGreetings] = createContextHook<GreetingsContextType>(() => {
  const { user } = useUnifiedAuth();
  const { awardXP, completeLesson: completeGamificationLesson, acceptChallenge, createChallenge, generateDailyChallenges, refreshStats } = useEnhancedGamification();
  const { analyzePronunciation: analyzeDidacticPronunciation } = useDidactic();
  const { playGreeting, playText } = useUniversalAudio({
    defaultLanguage: 'hr', // Croatian for greetings
    quality: 'premium',
    enableHapticFeedback: true,
  });
  
  // State
  const [state, setState] = useState<GreetingsState>({
    module: basicGreetingsModule,
    progress: null,
    currentLesson: null,
    currentExercise: null,
    exerciseIndex: 0,
    sessionActive: false,
    sessionStartTime: 0,
    exerciseResults: [],
    adaptiveSession: null,
    gamification: {
      streakBonus: {
        days: 0,
        multiplier: 1.0,
        description: {
          en: 'No streak bonus yet',
          hr: 'Još nema bonus za niz',
          es: 'Aún no hay bono de racha',
        },
      },
      completionMedallion: {
        id: 'greetings_master',
        title: {
          en: 'Greetings Master',
          hr: 'Majstor pozdrava',
          es: 'Maestro de saludos',
        },
        description: {
          en: 'Completed all basic greetings lessons',
          hr: 'Završio sve osnovne lekcije pozdrava',
          es: 'Completó todas las lecciones básicas de saludos',
        },
        imageUrl: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=200&h=200&fit=crop',
      },
      milestones: [
        {
          id: 'first_lesson',
          requirement: { type: 'lessons_completed', value: 1 },
          reward: {
            xp: 25,
            title: { en: 'First Steps', hr: 'Prvi koraci', es: 'Primeros pasos' },
            description: { en: 'Completed your first greetings lesson', hr: 'Završili ste svoju prvú lekciju pozdrava', es: 'Completaste tu primera lección de saludos' },
          },
          unlocked: false,
        },
        {
          id: 'accuracy_master',
          requirement: { type: 'accuracy_achieved', value: 90 },
          reward: {
            xp: 50,
            title: { en: 'Accuracy Master', hr: 'Majstor točnosti', es: 'Maestro de precisión' },
            description: { en: 'Achieved 90% accuracy in greetings', hr: 'Postigli ste 90% točnosti u pozdravima', es: 'Lograste 90% de precisión en saludos' },
          },
          unlocked: false,
        },
      ],
    },
    isLoading: false,
    error: null,
    pronunciationFeedback: null,
    streakData: {
      currentStreak: 0,
      longestStreak: 0,
      lastPracticeDate: '',
    },
  });
  
  // Load user progress from storage
  const loadProgress = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      
      const progressData = await AsyncStorage.getItem(`${GREETINGS_PROGRESS_KEY}_${user.id}`);
      const progress: GreetingsProgress = progressData ? JSON.parse(progressData) : {
        userId: user.id,
        moduleId: basicGreetingsModule.id,
        completedLessons: [],
        exerciseResults: [],
        overallStats: {
          totalXP: 0,
          averageAccuracy: 0,
          totalTimeSpent: 0,
          streakDays: 0,
          difficultGreetings: [],
        },
        achievements: [],
        lastPracticeDate: '',
      };
      
      setState(prev => ({
        ...prev,
        progress,
        isLoading: false,
      }));
      
      console.debug('Greetings progress loaded:', progress);
    } catch (error) {
      console.error('Error loading greetings progress:', error);
      setState(prev => ({ ...prev, error: 'Failed to load progress', isLoading: false }));
    }
  }, [user?.id]);
  
  // Initialize progress when user changes
  useEffect(() => {
    if (user?.id) {
      loadProgress();
    }
  }, [user?.id, loadProgress]);
  
  // Save progress to storage
  const saveProgress = useCallback(async (progress: GreetingsProgress) => {
    if (!user?.id) return;
    
    try {
      await AsyncStorage.setItem(`${GREETINGS_PROGRESS_KEY}_${user.id}`, JSON.stringify(progress));
      console.debug('Greetings progress saved');
    } catch (error) {
      console.error('Error saving greetings progress:', error);
    }
  }, [user?.id]);
  
  // Start a lesson
  const startLesson = useCallback(async (lessonId: string) => {
    const lesson = state.module.miniLessons.find(l => l.id === lessonId);
    if (!lesson) {
      throw new Error(`Lesson ${lessonId} not found`);
    }
    
    setState(prev => ({
      ...prev,
      currentLesson: lesson,
      currentExercise: lesson.exercises[0] || null,
      exerciseIndex: 0,
      sessionActive: true,
      sessionStartTime: Date.now(),
      exerciseResults: [],
      error: null,
    }));
    
    console.debug(`Started lesson: ${lesson.title.en}`);
    
    // Haptic feedback
    if (Platform.OS !== 'web') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, [state.module.miniLessons]);
  
  // Start an exercise
  const startExercise = useCallback((exerciseId: string) => {
    if (!state.currentLesson) return;
    
    const exercise = state.currentLesson.exercises.find(e => e.id === exerciseId);
    if (!exercise) {
      console.error(`Exercise ${exerciseId} not found`);
      return;
    }
    
    const exerciseIndex = state.currentLesson.exercises.findIndex(e => e.id === exerciseId);
    
    setState(prev => ({
      ...prev,
      currentExercise: exercise,
      exerciseIndex,
    }));
    
    console.debug(`Started exercise: ${exercise.type} for greeting ${exercise.greetingId}`);
  }, [state.currentLesson]);
  
  // Submit exercise result
  const submitExerciseResult = useCallback(async (result: Omit<GreetingExerciseResult, 'timestamp' | 'xpEarned'>) => {
    if (!user?.id || !state.currentExercise) return;
    
    try {
      // Calculate XP based on performance
      let xpEarned = state.currentExercise.xpReward;
      
      // Accuracy bonus
      if (result.accuracy >= 90) xpEarned += 10;
      else if (result.accuracy >= 80) xpEarned += 5;
      
      // Speed bonus (under 10 seconds)
      if (result.responseTime < 10000) xpEarned += 5;
      
      // Hints penalty
      xpEarned -= result.hintsUsed * 2;
      
      xpEarned = Math.max(5, xpEarned); // Minimum 5 XP
      
      const completeResult: GreetingExerciseResult = {
        ...result,
        timestamp: new Date().toISOString(),
        xpEarned,
      };
      
      // Update state
      setState(prev => ({
        ...prev,
        exerciseResults: [...prev.exerciseResults, completeResult],
      }));
      
      // Award XP through gamification system
      await awardXP(xpEarned, 'greetings_exercise', user.currentLanguage?.code);
      
      // Haptic feedback
      if (Platform.OS !== 'web') {
        if (result.isCorrect) {
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } else {
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        }
      }
      
      console.debug(`Exercise result submitted: ${result.isCorrect ? 'correct' : 'incorrect'}, XP: ${xpEarned}`);
    } catch (error) {
      console.error('Error submitting exercise result:', error);
      setState(prev => ({ ...prev, error: 'Failed to submit result' }));
    }
  }, [user, state.currentExercise, awardXP]);
  
  // Move to next exercise
  const nextExercise = useCallback(() => {
    if (!state.currentLesson) return;
    
    const nextIndex = state.exerciseIndex + 1;
    if (nextIndex < state.currentLesson.exercises.length) {
      setState(prev => ({
        ...prev,
        currentExercise: state.currentLesson!.exercises[nextIndex],
        exerciseIndex: nextIndex,
      }));
    } else {
      // No more exercises, lesson complete
      setState(prev => ({
        ...prev,
        currentExercise: null,
        exerciseIndex: 0,
      }));
    }
  }, [state.currentLesson, state.exerciseIndex]);
  
  // Complete lesson
  const completeLesson = useCallback(async () => {
    if (!user?.id || !state.currentLesson || !state.progress) return;
    
    try {
      // Calculate session metrics for potential future use
      // const sessionTime = Date.now() - state.sessionStartTime;
      // const sessionAccuracy = state.exerciseResults.length > 0 
      //   ? state.exerciseResults.reduce((sum, r) => sum + r.accuracy, 0) / state.exerciseResults.length
      //   : 0;
      
      // Update progress
      const updatedProgress = { ...state.progress };
      
      if (!updatedProgress.completedLessons.includes(state.currentLesson.id)) {
        updatedProgress.completedLessons.push(state.currentLesson.id);
      }
      
      setState(prev => ({
        ...prev,
        progress: updatedProgress,
        currentLesson: null,
        sessionActive: false,
      }));
      
      await saveProgress(updatedProgress);
      
      // Award lesson completion XP
      await awardXP(state.currentLesson.xpReward, 'lesson_completion', user.currentLanguage?.code);
      
      console.debug(`Lesson completed: ${state.currentLesson.title.en}`);
      
      // Celebration haptic
      if (Platform.OS !== 'web') {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (error) {
      console.error('Error completing lesson:', error);
      setState(prev => ({ ...prev, error: 'Failed to complete lesson' }));
    }
  }, [user, state.currentLesson, state.progress, saveProgress, awardXP]);
  
  // Generate adaptive session
  const generateAdaptiveSession = useCallback(async (sessionType: 'review' | 'new_content' | 'mixed' | 'pronunciation_focus' = 'mixed') => {
    if (!user?.id || !state.progress) return;
    
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      
      const session: GreetingsAdaptiveSession = {
        id: `session_${Date.now()}`,
        userId: user.id,
        sessionType,
        exercises: [],
        estimatedTime: 120, // 2 minutes
        targetAccuracy: 75,
        adaptiveSettings: {
          difficultyAdjustment: true,
          focusWeakAreas: sessionType === 'review',
          includeReview: sessionType !== 'new_content',
          pronunciationPractice: sessionType === 'pronunciation_focus',
        },
        sessionGoals: [
          {
            en: `Practice ${sessionType.replace('_', ' ')} exercises`,
            hr: `Vježbajte ${sessionType === 'review' ? 'ponavljanje' : 'nove'} vježbe`,
            es: `Practica ejercicios de ${sessionType === 'review' ? 'repaso' : 'nuevo contenido'}`,
          },
          {
            en: 'Improve accuracy',
            hr: 'Poboljšajte točnost',
            es: 'Mejora la precisión',
          },
        ],
        createdAt: new Date().toISOString(),
      };
      
      // Select exercises based on session type
      let availableExercises: GreetingExercise[] = [];
      
      if (sessionType === 'pronunciation_focus') {
        // Focus on speaking exercises
        availableExercises = state.module.miniLessons
          .flatMap(lesson => lesson.exercises)
          .filter(ex => ex.type === 'pronunciation');
      } else {
        // Include exercises from all lessons
        availableExercises = state.module.miniLessons
          .flatMap(lesson => lesson.exercises);
      }
      
      // Limit to 5-8 exercises for a good session length
      session.exercises = availableExercises.slice(0, Math.min(8, availableExercises.length));
      
      setState(prev => ({
        ...prev,
        adaptiveSession: session,
        isLoading: false,
      }));
      
      console.debug(`Generated adaptive session: ${sessionType} with ${session.exercises.length} exercises`);
    } catch (error) {
      console.error('Error generating adaptive session:', error);
      setState(prev => ({ ...prev, error: 'Failed to generate session', isLoading: false }));
    }
  }, [user?.id, state.progress, state.module]);
  
  // Analyze pronunciation
  const analyzePronunciation = useCallback(async (audioBlob: Blob, greetingId: string): Promise<GreetingPronunciationFeedback> => {
    try {
      const greeting = croatianGreetings.find(g => g.id === greetingId);
      if (!greeting) {
        throw new Error('Greeting not found');
      }
      
      // Use didactic pronunciation analysis
      const feedback = await analyzeDidacticPronunciation(audioBlob, greeting.greeting);
      
      // Convert to greeting-specific feedback
      const greetingFeedback: GreetingPronunciationFeedback = {
        greetingId,
        accuracy: feedback.accuracy,
        phonemeAnalysis: feedback.phonemes.map(p => ({
          phoneme: p.phoneme,
          expected: p.phoneme,
          actual: p.phoneme,
          accuracy: p.accuracy,
          feedback: {
            en: p.feedback,
            hr: p.feedback,
            es: p.feedback,
          },
        })),
        overallFeedback: {
          en: feedback.overallFeedback,
          hr: feedback.overallFeedback,
          es: feedback.overallFeedback,
        },
        suggestions: feedback.suggestions.map(s => ({
          en: s,
          hr: s,
          es: s,
        })),
        culturalTips: greeting.culturalNotes ? [greeting.culturalNotes] : undefined,
      };
      
      setState(prev => ({ ...prev, pronunciationFeedback: greetingFeedback }));
      
      return greetingFeedback;
    } catch (error) {
      console.error('Error analyzing pronunciation:', error);
      throw error;
    }
  }, [analyzeDidacticPronunciation]);
  
  // Refresh progress
  const refreshProgress = useCallback(async () => {
    await loadProgress();
  }, [loadProgress]);
  
  // Reset progress
  const resetProgress = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      await AsyncStorage.removeItem(`${GREETINGS_PROGRESS_KEY}_${user.id}`);
      setState(prev => ({
        ...prev,
        progress: null,
        currentLesson: null,
        currentExercise: null,
        sessionActive: false,
        exerciseResults: [],
        adaptiveSession: null,
      }));
      
      await loadProgress();
      console.debug('Greetings progress reset');
    } catch (error) {
      console.error('Error resetting progress:', error);
    }
  }, [user?.id, loadProgress]);
  
  // Get UI text in user's language
  const getUIText = useCallback((key: string): string => {
    const mainLanguage = user?.mainLanguage?.code || 'en';
    
    const uiTexts: { [key: string]: { [lang: string]: string } } = {
      'greetings.module_title': {
        en: 'Basic Greetings',
        hr: 'Osnovni pozdravi',
        es: 'Saludos básicos',
      },
      'greetings.start_lesson': {
        en: 'Start Lesson',
        hr: 'Počni lekciju',
        es: 'Comenzar lección',
      },
    };
    
    const text = uiTexts[key];
    return text?.[mainLanguage] || text?.['en'] || key;
  }, [user?.mainLanguage?.code]);
  
  // Play audio for greetings with professional TTS
  const playAudio = useCallback(async (audioUrl: string, fallbackText?: string) => {
    try {
      // The audioUrl is often a placeholder. The fallbackText (the question text) is more reliable.
      console.debug('Playing greeting audio. Fallback text:', fallbackText);

      // We need to find the correct greeting data to get the Croatian text.
      // Let's use the English fallback text to find the corresponding greeting object.
      const greeting = croatianGreetings.find(g => g.translation === fallbackText);
      
      let textToSpeak = 'Dobar dan'; // Default greeting
      const targetLanguage = 'hr'; // Greetings are always in Croatian in this module

      if (greeting) {
        // Use the actual Croatian greeting from the found object
        textToSpeak = greeting.greeting;
        console.debug(`[TTS] Found Croatian greeting for "${fallbackText}": "${textToSpeak}"`);
      } else {
        console.warn(`[TTS] Could not find a specific greeting for "${fallbackText}". Using default.`);
      }
      
      // Use the universal audio hook for professional TTS
      const result = await playGreeting(textToSpeak, targetLanguage);
      
      if (result.success) {
        console.debug(`[TTS] Greeting audio played successfully using ${result.method}: "${textToSpeak}"`);
      } else {
        console.error(`[TTS] Greeting audio failed for "${textToSpeak}":`, (result as any).error || 'Unknown error');
        // We removed the fallback to playText to expose the root error.
      }
      
    } catch (error) {
      console.error('[TTS] A critical error occurred in playAudio:', error);
    }
  }, [playGreeting]);
  
  const actions: GreetingsActions = useMemo(() => ({
    startLesson,
    completeLesson,
    startExercise,
    submitExerciseResult,
    nextExercise,
    generateAdaptiveSession,
    analyzePronunciation,
    refreshProgress,
    resetProgress,
    getUIText,
    playAudio,
  }), [
    startLesson,
    completeLesson,
    startExercise,
    submitExerciseResult,
    nextExercise,
    generateAdaptiveSession,
    analyzePronunciation,
    refreshProgress,
    resetProgress,
    getUIText,
    playAudio,
  ]);
  
  return useMemo(() => ({
    ...state,
    ...actions,
  }), [state, actions]);
});
