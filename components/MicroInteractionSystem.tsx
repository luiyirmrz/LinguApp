/**
 * Micro-Interaction System
 * Comprehensive system for managing micro-interactions throughout the app
 */

import React, { createContext, useContext, useState, useCallback, ReactNode, memo } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { 
  MicroInteraction, 
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
  AnimationType,
  AnimationConfig,
} from './MicroInteractions';
import { useAdaptiveTheme } from '@/contexts/AdaptiveThemeContext';

// Extended animation config with id for tracking
interface AnimationConfigWithId extends AnimationConfig {
  id: number;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Micro-interaction context
interface MicroInteractionContextType {
  // Animation triggers
  triggerConfetti: (options?: Partial<AnimationConfig>) => void;
  triggerFire: (options?: Partial<AnimationConfig>) => void;
  triggerSparkles: (options?: Partial<AnimationConfig>) => void;
  triggerSuccess: (options?: Partial<AnimationConfig>) => void;
  triggerCelebration: (options?: Partial<AnimationConfig>) => void;
  triggerError: (options?: Partial<AnimationConfig>) => void;
  triggerHeart: (options?: Partial<AnimationConfig>) => void;
  triggerStar: (options?: Partial<AnimationConfig>) => void;
  
  // Progress and loading
  showProgress: (active: boolean, options?: Partial<AnimationConfig>) => void;
  showLoading: (active: boolean, options?: Partial<AnimationConfig>) => void;
  
  // Custom animations
  triggerCustomAnimation: (type: AnimationType, options?: Partial<AnimationConfig>) => void;
  
  // State
  isProgressVisible: boolean;
  isLoadingVisible: boolean;
  activeAnimations: AnimationConfigWithId[];
}

const MicroInteractionContext = createContext<MicroInteractionContextType | undefined>(undefined);

// Provider component
export const MicroInteractionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { theme } = useAdaptiveTheme();
  const [activeAnimations, setActiveAnimations] = useState<AnimationConfigWithId[]>([]);
  const [isProgressVisible, setIsProgressVisible] = useState(false);
  const [isLoadingVisible, setIsLoadingVisible] = useState(false);

  // Add animation to active list
  const addAnimation = useCallback((config: AnimationConfig): AnimationConfigWithId => {
    const animationId = Date.now() + Math.random();
    const animationWithId = { ...config, id: animationId };
    
    setActiveAnimations(prev => [...prev, animationWithId]);
    
    // Auto-remove after duration if not looping
    if (!config.loop && config.duration) {
      setTimeout(() => {
        removeAnimation(animationId);
      }, config.duration);
    }
    
    return animationWithId;
  }, []);

  // Remove animation from active list
  const removeAnimation = useCallback((id: number) => {
    setActiveAnimations(prev => prev.filter(anim => anim.id !== id));
  }, []);

  // Animation triggers
  const triggerConfetti = useCallback((options: Partial<AnimationConfig> = {}) => {
    addAnimation({
      type: 'confetti',
      duration: 3000,
      loop: false,
      autoPlay: true,
      size: 'fullscreen',
      position: 'center',
      ...options,
    });
  }, [addAnimation]);

  const triggerFire = useCallback((options: Partial<AnimationConfig> = {}) => {
    addAnimation({
      type: 'fire',
      duration: 2000,
      loop: true,
      autoPlay: true,
      size: 'medium',
      position: 'center',
      ...options,
    });
  }, [addAnimation]);

  const triggerSparkles = useCallback((options: Partial<AnimationConfig> = {}) => {
    addAnimation({
      type: 'sparkles',
      duration: 1500,
      loop: false,
      autoPlay: true,
      size: 'small',
      position: 'center',
      ...options,
    });
  }, [addAnimation]);

  const triggerSuccess = useCallback((options: Partial<AnimationConfig> = {}) => {
    addAnimation({
      type: 'success',
      duration: 2000,
      loop: false,
      autoPlay: true,
      size: 'medium',
      position: 'center',
      ...options,
    });
  }, [addAnimation]);

  const triggerCelebration = useCallback((options: Partial<AnimationConfig> = {}) => {
    addAnimation({
      type: 'celebration',
      duration: 4000,
      loop: false,
      autoPlay: true,
      size: 'large',
      position: 'center',
      ...options,
    });
  }, [addAnimation]);

  const triggerError = useCallback((options: Partial<AnimationConfig> = {}) => {
    addAnimation({
      type: 'error',
      duration: 1500,
      loop: false,
      autoPlay: true,
      size: 'medium',
      position: 'center',
      ...options,
    });
  }, [addAnimation]);

  const triggerHeart = useCallback((options: Partial<AnimationConfig> = {}) => {
    addAnimation({
      type: 'heart',
      duration: 1000,
      loop: false,
      autoPlay: true,
      size: 'small',
      position: 'center',
      ...options,
    });
  }, [addAnimation]);

  const triggerStar = useCallback((options: Partial<AnimationConfig> = {}) => {
    addAnimation({
      type: 'star',
      duration: 1200,
      loop: false,
      autoPlay: true,
      size: 'small',
      position: 'center',
      ...options,
    });
  }, [addAnimation]);

  const showProgress = useCallback((active: boolean, options: Partial<AnimationConfig> = {}) => {
    setIsProgressVisible(active);
    if (active) {
      addAnimation({
        type: 'progress',
        duration: 1000,
        loop: true,
        autoPlay: true,
        size: 'small',
        position: 'center',
        ...options,
      });
    }
  }, [addAnimation]);

  const showLoading = useCallback((active: boolean, options: Partial<AnimationConfig> = {}) => {
    setIsLoadingVisible(active);
    if (active) {
      addAnimation({
        type: 'loading',
        duration: 1000,
        loop: true,
        autoPlay: true,
        size: 'medium',
        position: 'center',
        ...options,
      });
    }
  }, [addAnimation]);

  const triggerCustomAnimation = useCallback((type: AnimationType, options: Partial<AnimationConfig> = {}) => {
    addAnimation({
      type,
      ...options,
    });
  }, [addAnimation]);

  const contextValue: MicroInteractionContextType = {
    triggerConfetti,
    triggerFire,
    triggerSparkles,
    triggerSuccess,
    triggerCelebration,
    triggerError,
    triggerHeart,
    triggerStar,
    showProgress,
    showLoading,
    triggerCustomAnimation,
    isProgressVisible,
    isLoadingVisible,
    activeAnimations,
  };

  return (
    <MicroInteractionContext.Provider value={contextValue}>
      {children}
      {/* Render active animations */}
      {activeAnimations.map((animation, index) => (
        <MicroInteraction
          key={animation.id || index}
          {...animation}
          onComplete={() => animation.id && removeAnimation(animation.id)}
        />
      ))}
    </MicroInteractionContext.Provider>
  );
};

// Hook to use micro-interactions
export const useMicroInteractions = (): MicroInteractionContextType => {
  const context = useContext(MicroInteractionContext);
  if (context === undefined) {
    throw new Error('useMicroInteractions must be used within a MicroInteractionProvider');
  }
  return context;
};

// Lesson completion animation component
export const LessonCompletionAnimation: React.FC<{
  onComplete?: () => void;
  showConfetti?: boolean;
  showCelebration?: boolean;
  showSparkles?: boolean;
}> = ({ 
  onComplete, 
  showConfetti = true, 
  showCelebration = true, 
  showSparkles = true, 
}) => {
  const { triggerConfetti, triggerCelebration, triggerSparkles } = useMicroInteractions();

  React.useEffect(() => {
    if (showConfetti) {
      triggerConfetti({
        onComplete: () => {
          if (showCelebration) {
            triggerCelebration({
              onComplete: () => {
                if (showSparkles) {
                  triggerSparkles({
                    onComplete,
                  });
                } else if (onComplete) {
                  onComplete();
                }
              },
            });
          } else if (onComplete) {
            onComplete();
          }
        },
      });
    } else if (onComplete) {
      onComplete();
    }
  }, [showConfetti, showCelebration, showSparkles, triggerConfetti, triggerCelebration, triggerSparkles, onComplete]);

  return null;
};

// Streak fire animation component
export const StreakFireAnimation: React.FC<{
  streakCount: number;
  active?: boolean;
  position?: 'center' | 'top' | 'bottom' | 'custom';
  customPosition?: { x: number; y: number };
}> = ({ streakCount, active = true, position = 'center', customPosition }) => {
  const { triggerFire } = useMicroInteractions();

  React.useEffect(() => {
    if (active && streakCount > 0) {
      // Trigger fire animation for streaks
      triggerFire({
        position,
        customPosition,
        loop: true,
      });
    }
  }, [streakCount, active, position, customPosition, triggerFire]);

  return null;
};

// Progress animation component
export const AnimatedProgressComponent: React.FC<{
  progress: number; // 0-100
  showAnimation?: boolean;
  color?: string;
  backgroundColor?: string;
  height?: number;
  borderRadius?: number;
  duration?: number;
}> = ({
  progress,
  showAnimation = true,
  color,
  backgroundColor,
  height = 8,
  borderRadius = 4,
  duration = 1000,
}) => {
  return (
    <AnimatedProgressBar
      progress={progress}
      duration={duration}
      color={color}
      backgroundColor={backgroundColor}
      height={height}
      borderRadius={borderRadius}
      showAnimation={showAnimation}
    />
  );
};

// Animated counter component
export const AnimatedCounterComponent: React.FC<{
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  style?: any;
}> = ({ value, duration = 1000, prefix = '', suffix = '', style }) => {
  return (
    <AnimatedCounter
      value={value}
      duration={duration}
      prefix={prefix}
      suffix={suffix}
      style={style}
    />
  );
};

// Micro-interaction feedback component
export const MicroInteractionFeedback: React.FC<{
  type: 'success' | 'error' | 'warning' | 'info';
  message?: string;
  showAnimation?: boolean;
  onComplete?: () => void;
}> = ({ type, message, showAnimation = true, onComplete }) => {
  const { triggerSuccess, triggerError, triggerSparkles, triggerHeart } = useMicroInteractions();

  React.useEffect(() => {
    if (showAnimation) {
      switch (type) {
        case 'success':
          triggerSuccess({ onComplete });
          break;
        case 'error':
          triggerError({ onComplete });
          break;
        case 'warning':
          triggerSparkles({ onComplete });
          break;
        case 'info':
          triggerHeart({ onComplete });
          break;
      }
    } else if (onComplete) {
      onComplete();
    }
  }, [type, showAnimation, triggerSuccess, triggerError, triggerSparkles, triggerHeart, onComplete]);

  return null;
};

// Loading overlay component
export const LoadingOverlay: React.FC<{
  visible: boolean;
  message?: string;
  showAnimation?: boolean;
}> = ({ visible, message, showAnimation = true }) => {
  const { showLoading } = useMicroInteractions();

  React.useEffect(() => {
    showLoading(visible);
  }, [visible, showLoading]);

  if (!visible) return null;

  return (
    <View style={styles.loadingOverlay}>
      {showAnimation && <LoadingAnimation active={true} size="large" />}
      {message && (
        <View style={styles.loadingMessage}>
          {/* Message would be rendered here */}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  loadingMessage: {
    marginTop: 20,
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 8,
  },
});

export default {
  MicroInteractionProvider,
  useMicroInteractions,
  LessonCompletionAnimation,
  StreakFireAnimation,
  AnimatedProgressComponent,
  AnimatedCounterComponent,
  MicroInteractionFeedback,
  LoadingOverlay,
};


// MicroInteractionSystem.displayName = 'MicroInteractionSystem';
