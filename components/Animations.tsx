import React, { useEffect, useRef, memo } from 'react';
import {
  Animated,
  ViewStyle,
  Easing,
  Dimensions,
} from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Animation configurations
export const AnimationConfig = {
  // Timing configurations
  fast: 150,
  normal: 300,
  slow: 500,
  
  // Easing functions
  easeInOut: Easing.inOut(Easing.ease),
  easeOut: Easing.out(Easing.ease),
  easeIn: Easing.in(Easing.ease),
  bounce: Easing.bounce,
  elastic: Easing.elastic(1),
  
  // Spring configurations
  spring: {
    tension: 100,
    friction: 8,
  },
  springBouncy: {
    tension: 50,
    friction: 6,
  },
  springStiff: {
    tension: 200,
    friction: 10,
  },
};

// Fade animations
export const useFadeAnimation = (visible: boolean, duration: number = AnimationConfig.normal) => {
  const fadeAnim = useRef(new Animated.Value(visible ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: visible ? 1 : 0,
      duration,
      easing: AnimationConfig.easeInOut,
      useNativeDriver: true,
    }).start();
  }, [visible, fadeAnim, duration]);

  return fadeAnim;
};

// Scale animations
export const useScaleAnimation = (visible: boolean, duration: number = AnimationConfig.normal) => {
  const scaleAnim = useRef(new Animated.Value(visible ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: visible ? 1 : 0,
      ...AnimationConfig.spring,
      useNativeDriver: true,
    }).start();
  }, [visible, scaleAnim, duration]);

  return scaleAnim;
};

// Slide animations
export const useSlideAnimation = (
  visible: boolean,
  direction: 'up' | 'down' | 'left' | 'right' = 'up',
  distance: number = 50,
) => {
  const slideAnim = useRef(new Animated.Value(visible ? 0 : distance)).current;

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: visible ? 0 : distance,
      ...AnimationConfig.spring,
      useNativeDriver: true,
    }).start();
  }, [visible, slideAnim, distance]);

  const getTransform = () => {
    switch (direction) {
      case 'up':
        return [{ translateY: slideAnim }];
      case 'down':
        return [{ translateY: Animated.multiply(slideAnim, -1) }];
      case 'left':
        return [{ translateX: slideAnim }];
      case 'right':
        return [{ translateX: Animated.multiply(slideAnim, -1) }];
      default:
        return [{ translateY: slideAnim }];
    }
  };

  return getTransform();
};

// Shake animation
export const useShakeAnimation = (trigger: boolean) => {
  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (trigger) {
      Animated.sequence([
        Animated.timing(shakeAnim, {
          toValue: 10,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: -10,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: 10,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: 0,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [trigger, shakeAnim]);

  return shakeAnim;
};

// Pulse animation
export const usePulseAnimation = (active: boolean, duration: number = 1000) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (active) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: duration / 2,
            easing: AnimationConfig.easeInOut,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: duration / 2,
            easing: AnimationConfig.easeInOut,
            useNativeDriver: true,
          }),
        ]),
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [active, pulseAnim, duration]);

  return pulseAnim;
};

// Rotate animation
export const useRotateAnimation = (active: boolean, duration: number = 1000) => {
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (active) {
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration,
          easing: AnimationConfig.easeInOut,
          useNativeDriver: true,
        }),
      ).start();
    } else {
      rotateAnim.setValue(0);
    }
  }, [active, rotateAnim, duration]);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return spin;
};

// Bounce animation
export const useBounceAnimation = (trigger: boolean) => {
  const bounceAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (trigger) {
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: 1.2,
          duration: 150,
          easing: AnimationConfig.bounce,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 1,
          duration: 150,
          easing: AnimationConfig.bounce,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [trigger, bounceAnim]);

  return bounceAnim;
};

// Page transition animations
export const usePageTransition = (direction: 'forward' | 'backward' = 'forward') => {
  const slideAnim = useRef(new Animated.Value(direction === 'forward' ? screenWidth : -screenWidth)).current;

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: AnimationConfig.normal,
      easing: AnimationConfig.easeInOut,
      useNativeDriver: true,
    }).start();
  }, [slideAnim]);

  return slideAnim;
};

// Stagger animations for lists
export const useStaggerAnimation = (items: any[], delay: number = 50) => {
  const animations = items.map(() => new Animated.Value(0));

  useEffect(() => {
    const animations = items.map((_, index) => {
      const anim = new Animated.Value(0);
      Animated.timing(anim, {
        toValue: 1,
        duration: AnimationConfig.normal,
        delay: index * delay,
        easing: AnimationConfig.easeOut,
        useNativeDriver: true,
      }).start();
      return anim;
    });
  }, [items, delay]);

  return animations;
};

// Loading spinner animation
export const useLoadingSpinner = (active: boolean) => {
  const spinValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (active) {
      Animated.loop(
        Animated.timing(spinValue, {
          toValue: 1,
          duration: 1000,
          easing: AnimationConfig.easeInOut,
          useNativeDriver: true,
        }),
      ).start();
    } else {
      spinValue.setValue(0);
    }
  }, [active, spinValue]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return spin;
};

// Success animation
export const useSuccessAnimation = (trigger: boolean) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (trigger) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          ...AnimationConfig.springBouncy,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: AnimationConfig.fast,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      scaleAnim.setValue(0);
      opacityAnim.setValue(0);
    }
  }, [trigger, scaleAnim, opacityAnim]);

  return { scale: scaleAnim, opacity: opacityAnim };
};

// Error animation
export const useErrorAnimation = (trigger: boolean) => {
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (trigger) {
      Animated.parallel([
        Animated.sequence([
          Animated.timing(shakeAnim, {
            toValue: 10,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.timing(shakeAnim, {
            toValue: -10,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.timing(shakeAnim, {
            toValue: 0,
            duration: 100,
            useNativeDriver: true,
          }),
        ]),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: AnimationConfig.fast,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      shakeAnim.setValue(0);
      opacityAnim.setValue(0);
    }
  }, [trigger, shakeAnim, opacityAnim]);

  return { shake: shakeAnim, opacity: opacityAnim };
};

// Animated View wrapper
export interface AnimatedViewProps {
  children: React.ReactNode;
  style?: ViewStyle;
  animation?: Animated.Value | Animated.AnimatedInterpolation<string | number>;
  transform?: any[];
}

export const AnimatedView: React.FC<AnimatedViewProps> = ({
  children,
  style,
  animation,
  transform,
}) => {
  const animatedStyle: any = { ...style };

  if (animation) {
    animatedStyle.opacity = animation;
  }

  if (transform) {
    animatedStyle.transform = transform;
  }

  return <Animated.View style={animatedStyle}>{children}</Animated.View>;
};


// Main Animations component that exports all animation utilities
const Animations = {
  AnimationConfig,
  useFadeAnimation,
  useSlideAnimation,
  useScaleAnimation,
  useBounceAnimation,
  useShakeAnimation,
  usePulseAnimation,
  useStaggerAnimation,
};

// Animations.displayName = 'Animations';

export default Animations;
