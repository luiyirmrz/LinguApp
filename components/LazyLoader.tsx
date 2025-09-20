import React, { Suspense, ComponentType, memo } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { LoadingSpinner } from './LoadingStates';

interface LazyLoaderProps {
  component: () => Promise<{ default: ComponentType<any> }>;
  fallback?: React.ReactNode;
  props?: any;
}

export const LazyLoader: React.FC<LazyLoaderProps> = ({ 
  component, 
  fallback, 
  props = {}, 
}) => {
  const LazyComponent = React.lazy(component);
  
  const defaultFallback = (
    <View className="flex-1 justify-center items-center">
      <LoadingSpinner />
    </View>
  );

  return (
    <Suspense fallback={fallback || defaultFallback}>
      <LazyComponent {...props} />
    </Suspense>
  );
};

// Predefined lazy components for common use cases
export const LazyComponents = {
  Dashboard: () => import('./Dashboard'),
  GreetingsModule: () => import('./GreetingsModuleScreen'),
  GreetingsLesson: () => import('./GreetingsLessonScreen'),
  GreetingsExercises: () => import('./GreetingsExercises'),
  SRSFlashcards: () => import('./SRSFlashcardComponent'),
  PronunciationFeedback: () => import('./PronunciationFeedback'),
  LevelTest: () => import('./LevelTestComponent'),
  ImmersiveMode: () => import('./ImmersiveMode'),
  SocialFeatures: () => import('./SocialFeatures'),
  STTExample: () => import('./STTExample'),
  EnhancedOnboarding: () => import('./EnhancedOnboardingComponent'),
};


LazyLoader.displayName = 'LazyLoader';
