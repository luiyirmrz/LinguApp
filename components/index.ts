// Core UI Components
export * from './Button';
export * from './Card';
export * from './Input';
export * from './Modal';
export * from './Toast';
export * from './Header';
export * from './Icon';
export * from './ProgressBar';

// Loading and Error States
export * from './LoadingStates';
export * from './EmptyStates';
export * from './ErrorBoundary';
export * from './EnhancedErrorBoundary';
export { 
  LoadingSpinner,
  Skeleton,
  SkeletonCard,
  SkeletonList,
  LoadingOverlay,
  ErrorState,
  NetworkErrorState,
  EnhancedEmptyState,
  type LoadingSpinnerProps,
  type SkeletonProps,
  type SkeletonCardProps,
  type SkeletonListProps,
  type LoadingOverlayProps,
  type ErrorStateProps,
  type NetworkErrorStateProps,
  type EnhancedEmptyStateProps,
} from './EnhancedLoadingStates';
export * from './EnhancedUserFeedback';
export * from './AuthErrorFeedback';
export * from './AuthWrapper';

// Language Learning Components
export * from './LanguageSelector';
export * from './MainLanguageSelector';
export * from './EnhancedLanguageSelector';

// Lazy Loading
export { LazyLoader, LazyComponents } from './LazyLoader';

// Animations
export * from './Animations';

// Cultural and Adaptive Design Components
export * from './CulturalBackground';
export * from './CulturalHeader';

// Micro-Interaction Animation Components
export { 
  MicroInteraction,
  MicroInteractionManager,
  ConfettiAnimation,
  FireAnimation,
  SparklesAnimation,
  SuccessAnimation,
  CelebrationAnimation,
  ProgressAnimation,
  LoadingAnimation,
  ErrorAnimation,
  HeartAnimation,
  StarAnimation,
  AnimatedProgressBar,
  AnimatedCounter,
  type AnimationType,
  type AnimationConfig as MicroAnimationConfig,
} from './MicroInteractions';
export * from './MicroInteractionSystem';

// Feature Components (Lazy loaded)
export const Dashboard = () => import('./Dashboard');
export const GreetingsModule = () => import('./GreetingsModuleScreen');
export const GreetingsLesson = () => import('./GreetingsLessonScreen');
export const GreetingsExercises = () => import('./GreetingsExercises');
export const SRSFlashcards = () => import('./SRSFlashcardComponent');
export const PronunciationFeedback = () => import('./PronunciationFeedback');
export const LevelTest = () => import('./LevelTestComponent');
export const ImmersiveMode = () => import('./ImmersiveMode');
export const SocialFeatures = () => import('./SocialFeatures');
export const STTExample = () => import('./STTExample');
export const EnhancedOnboarding = () => import('./EnhancedOnboardingComponent');

// Exercise Components
export * from './exercises';
