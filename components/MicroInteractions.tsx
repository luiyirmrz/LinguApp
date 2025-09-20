/**
 * Micro-Interaction Animations
 * Provides await lazyLoadLottie()-based animations for user feedback and engagement
 */

import React, { useRef, useEffect, useState, memo } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  Animated,
  Easing,
  Platform,
  ViewStyle,
} from 'react-native';
// Lazy loaded: lottie-react-native
import { useAdaptiveTheme } from '@/contexts/AdaptiveThemeContext';
// import { lazyLoadLottie } from '@/services/LazyDependencies';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Animation types
export type AnimationType = 
  | 'confetti'
  | 'fire'
  | 'sparkles'
  | 'success'
  | 'celebration'
  | 'progress'
  | 'loading'
  | 'error'
  | 'heart'
  | 'star';

// Animation configuration
export interface AnimationConfig {
  type: AnimationType;
  duration?: number;
  loop?: boolean;
  autoPlay?: boolean;
  size?: 'small' | 'medium' | 'large' | 'fullscreen';
  position?: 'center' | 'top' | 'bottom' | 'custom';
  customPosition?: { x: number; y: number };
  onComplete?: () => void;
  onLoopComplete?: () => void;
}

// Default animation configurations
const defaultConfigs: Record<AnimationType, Partial<AnimationConfig>> = {
  confetti: {
    duration: 3000,
    loop: false,
    autoPlay: true,
    size: 'fullscreen',
    position: 'center',
  },
  fire: {
    duration: 2000,
    loop: true,
    autoPlay: true,
    size: 'medium',
    position: 'center',
  },
  sparkles: {
    duration: 1500,
    loop: false,
    autoPlay: true,
    size: 'small',
    position: 'center',
  },
  success: {
    duration: 2000,
    loop: false,
    autoPlay: true,
    size: 'medium',
    position: 'center',
  },
  celebration: {
    duration: 4000,
    loop: false,
    autoPlay: true,
    size: 'large',
    position: 'center',
  },
  progress: {
    duration: 1000,
    loop: true,
    autoPlay: true,
    size: 'small',
    position: 'center',
  },
  loading: {
    duration: 1000,
    loop: true,
    autoPlay: true,
    size: 'medium',
    position: 'center',
  },
  error: {
    duration: 1500,
    loop: false,
    autoPlay: true,
    size: 'medium',
    position: 'center',
  },
  heart: {
    duration: 1000,
    loop: false,
    autoPlay: true,
    size: 'small',
    position: 'center',
  },
  star: {
    duration: 1200,
    loop: false,
    autoPlay: true,
    size: 'small',
    position: 'center',
  },
};

// Get animation source based on type
const getAnimationSource = (type: AnimationType): any => {
  // For now, we'll use placeholder sources
  // In a real implementation, these would be actual await lazyLoadLottie() JSON files
  const animationSources: Record<AnimationType, any> = {
    confetti: require('../assets/animations/confetti.json'),
    fire: require('../assets/animations/fire.json'),
    sparkles: require('../assets/animations/sparkles.json'),
    success: require('../assets/animations/success.json'),
    celebration: require('../assets/animations/celebration.json'),
    progress: require('../assets/animations/progress.json'),
    loading: require('../assets/animations/loading.json'),
    error: require('../assets/animations/error.json'),
    heart: require('../assets/animations/heart.json'),
    star: require('../assets/animations/star.json'),
  };

  return animationSources[type];
};

// Get size dimensions
const getSizeDimensions = (size: string) => {
  switch (size) {
    case 'small':
      return { width: 60, height: 60 };
    case 'medium':
      return { width: 120, height: 120 };
    case 'large':
      return { width: 200, height: 200 };
    case 'fullscreen':
      return { width: screenWidth, height: screenHeight };
    default:
      return { width: 120, height: 120 };
  }
};

// Get position styles
const getPositionStyles = (position: string, customPosition?: { x: number; y: number }): ViewStyle => {
  switch (position) {
    case 'top':
      return { top: 50, alignSelf: 'center' as const };
    case 'bottom':
      return { bottom: 50, alignSelf: 'center' as const };
    case 'center':
      return { alignSelf: 'center' as const, justifyContent: 'center' as const };
    case 'custom':
      return customPosition ? { 
        position: 'absolute' as const, 
        left: customPosition.x, 
        top: customPosition.y, 
      } : { alignSelf: 'center' as const };
    default:
      return { alignSelf: 'center' as const };
  }
};

// Main MicroInteraction component
export const MicroInteraction: React.FC<AnimationConfig> = ({
  type,
  duration,
  loop = false,
  autoPlay = true,
  size = 'medium',
  position = 'center',
  customPosition,
  onComplete,
  onLoopComplete,
}) => {
  const { theme } = useAdaptiveTheme();
  const lottieRef = useRef<any>(null);
  const [isVisible, setIsVisible] = useState(true);
  
  const config = { ...defaultConfigs[type], duration, loop, autoPlay, size, position };
  const dimensions = getSizeDimensions(config.size!);
  const positionStyles = getPositionStyles(config.position!, customPosition);

  useEffect(() => {
    if (autoPlay && lottieRef.current) {
      lottieRef.current.play();
    }
  }, [autoPlay]);

  const handleAnimationFinish = () => {
    if (onComplete) {
      onComplete();
    }
    if (!loop) {
      setIsVisible(false);
    }
  };

  const handleLoopComplete = () => {
    if (onLoopComplete) {
      onLoopComplete();
    }
  };

  if (!isVisible) {
    return null;
  }

  return (
    <View style={[styles.container, positionStyles]}>
      <View
        ref={lottieRef}
        style={[dimensions]}
      />
    </View>
  );
};

// Confetti Animation Component
export const ConfettiAnimation: React.FC<{
  onComplete?: () => void;
  size?: 'small' | 'medium' | 'large' | 'fullscreen';
}> = ({ onComplete, size = 'fullscreen' }) => {
  return (
    <MicroInteraction
      type="confetti"
      size={size}
      onComplete={onComplete}
    />
  );
};

// Fire Animation Component (for streaks)
export const FireAnimation: React.FC<{
  active?: boolean;
  size?: 'small' | 'medium' | 'large';
  position?: 'center' | 'top' | 'bottom' | 'custom';
  customPosition?: { x: number; y: number };
}> = ({ active = true, size = 'medium', position = 'center', customPosition }) => {
  if (!active) return null;

  return (
    <MicroInteraction
      type="fire"
      size={size}
      position={position}
      customPosition={customPosition}
      loop={true}
    />
  );
};

// Sparkles Animation Component
export const SparklesAnimation: React.FC<{
  onComplete?: () => void;
  size?: 'small' | 'medium' | 'large';
}> = ({ onComplete, size = 'small' }) => {
  return (
    <MicroInteraction
      type="sparkles"
      size={size}
      onComplete={onComplete}
    />
  );
};

// Success Animation Component
export const SuccessAnimation: React.FC<{
  onComplete?: () => void;
  size?: 'small' | 'medium' | 'large';
}> = ({ onComplete, size = 'medium' }) => {
  return (
    <MicroInteraction
      type="success"
      size={size}
      onComplete={onComplete}
    />
  );
};

// Celebration Animation Component
export const CelebrationAnimation: React.FC<{
  onComplete?: () => void;
  size?: 'medium' | 'large' | 'fullscreen';
}> = ({ onComplete, size = 'large' }) => {
  return (
    <MicroInteraction
      type="celebration"
      size={size}
      onComplete={onComplete}
    />
  );
};

// Progress Animation Component
export const ProgressAnimation: React.FC<{
  active?: boolean;
  size?: 'small' | 'medium' | 'large';
}> = ({ active = true, size = 'small' }) => {
  if (!active) return null;

  return (
    <MicroInteraction
      type="progress"
      size={size}
      loop={true}
    />
  );
};

// Loading Animation Component
export const LoadingAnimation: React.FC<{
  active?: boolean;
  size?: 'small' | 'medium' | 'large';
}> = ({ active = true, size = 'medium' }) => {
  if (!active) return null;

  return (
    <MicroInteraction
      type="loading"
      size={size}
      loop={true}
    />
  );
};

// Error Animation Component
export const ErrorAnimation: React.FC<{
  onComplete?: () => void;
  size?: 'small' | 'medium' | 'large';
}> = ({ onComplete, size = 'medium' }) => {
  return (
    <MicroInteraction
      type="error"
      size={size}
      onComplete={onComplete}
    />
  );
};

// Heart Animation Component
export const HeartAnimation: React.FC<{
  onComplete?: () => void;
  size?: 'small' | 'medium' | 'large';
}> = ({ onComplete, size = 'small' }) => {
  return (
    <MicroInteraction
      type="heart"
      size={size}
      onComplete={onComplete}
    />
  );
};

// Star Animation Component
export const StarAnimation: React.FC<{
  onComplete?: () => void;
  size?: 'small' | 'medium' | 'large';
}> = ({ onComplete, size = 'small' }) => {
  return (
    <MicroInteraction
      type="star"
      size={size}
      onComplete={onComplete}
    />
  );
};

// Animated Progress Bar Component
export const AnimatedProgressBar: React.FC<{
  progress: number; // 0-100
  duration?: number;
  color?: string;
  backgroundColor?: string;
  height?: number;
  borderRadius?: number;
  showAnimation?: boolean;
}> = ({
  progress,
  duration = 1000,
  color,
  backgroundColor,
  height = 8,
  borderRadius = 4,
  showAnimation = true,
}) => {
  const { theme } = useAdaptiveTheme();
  const animatedWidth = useRef(new Animated.Value(0)).current;
  
  const progressColor = color || theme.colors.primary;
  const bgColor = backgroundColor || theme.colors.surface;

  useEffect(() => {
    if (showAnimation) {
      Animated.timing(animatedWidth, {
        toValue: progress,
        duration,
        easing: Easing.out(Easing.ease),
        useNativeDriver: false,
      }).start();
    } else {
      animatedWidth.setValue(progress);
    }
  }, [progress, duration, showAnimation, animatedWidth]);

  return (
    <View style={[
      styles.progressBarContainer,
      {
        height,
        backgroundColor: bgColor,
        borderRadius,
      },
    ]}>
      <Animated.View
        style={[
          styles.progressBarFill,
          {
            width: animatedWidth.interpolate({
              inputRange: [0, 100],
              outputRange: ['0%', '100%'],
              extrapolate: 'clamp',
            }),
            backgroundColor: progressColor,
            borderRadius,
          },
        ]}
      />
    </View>
  );
};

// Animated Counter Component
export const AnimatedCounter: React.FC<{
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  style?: any;
}> = ({ value, duration = 1000, prefix = '', suffix = '', style }) => {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: value,
      duration,
      easing: Easing.out(Easing.ease),
      useNativeDriver: false,
    }).start();

    const listener = animatedValue.addListener(({ value: animatedVal }) => {
      setDisplayValue(Math.round(animatedVal));
    });

    return () => {
      animatedValue.removeListener(listener);
    };
  }, [value, duration, animatedValue]);

  return (
    <Animated.Text style={style}>
      {prefix}{displayValue}{suffix}
    </Animated.Text>
  );
};

// Micro-Interaction Manager
export const MicroInteractionManager: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [animations, setAnimations] = useState<AnimationConfig[]>([]);

  const addAnimation = (config: AnimationConfig) => {
    setAnimations(prev => [...prev, config]);
  };

  const removeAnimation = (index: number) => {
    setAnimations(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <View style={styles.managerContainer}>
      {children}
      {animations.map((config, index) => (
        <MicroInteraction
          key={index}
          {...config}
          onComplete={() => removeAnimation(index)}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    zIndex: 1000,
    pointerEvents: 'none',
  },
  progressBarContainer: {
    width: '100%',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
  },
  managerContainer: {
    flex: 1,
  },
});

export default {
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
  MicroInteractionManager,
};


// MicroInteractions.displayName = 'MicroInteractions';
