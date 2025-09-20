import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  Dimensions,
  Platform,
  TouchableOpacity,
} from 'react-native';
import {
  PanGestureHandler,
  State,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import { theme } from '@/constants/theme';
import { useOptimizedAnimation, useHapticFeedback } from '@/services/optimization/uxOptimizationService';

const { width, height } = Dimensions.get('window');

interface EnhancedAnimationsProps {
  onAnimationComplete?: () => void;
  onAnimationStart?: () => void;
}

export default function EnhancedAnimations({
  onAnimationComplete,
  onAnimationStart,
}: EnhancedAnimationsProps) {
  const { getDuration, recordAnimation } = useOptimizedAnimation();
  const { triggerHaptic } = useHapticFeedback();

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const slideAnim = useRef(new Animated.Value(-width)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const shimmerAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const morphAnim = useRef(new Animated.Value(0)).current;

  // State
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationType, setAnimationType] = useState<string>('');

  // Gesture handling
  const panGestureRef = useRef(null);
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Initialize with entrance animation
    startEntranceAnimation();
  }, []);

  const startEntranceAnimation = () => {
    const startTime = performance.now();
    setIsAnimating(true);
    onAnimationStart?.();

    const duration = getDuration(800, 'normal');

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start(() => {
      const endTime = performance.now();
      recordAnimation('entrance', endTime - startTime, true);
      setIsAnimating(false);
      onAnimationComplete?.();
    });
  };

  const startFadeAnimation = () => {
    const startTime = performance.now();
    setAnimationType('fade');
    setIsAnimating(true);

    const duration = getDuration(600, 'fast');

    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: duration / 2,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: duration / 2,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start(() => {
      const endTime = performance.now();
      recordAnimation('fade', endTime - startTime, true);
      setIsAnimating(false);
      setAnimationType('');
    });
  };

  const startScaleAnimation = () => {
    const startTime = performance.now();
    setAnimationType('scale');
    setIsAnimating(true);

    const duration = getDuration(500, 'fast');

    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 1.2,
        tension: 150,
        friction: 6,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start(() => {
      const endTime = performance.now();
      recordAnimation('scale', endTime - startTime, true);
      setIsAnimating(false);
      setAnimationType('');
    });
  };

  const startSlideAnimation = () => {
    const startTime = performance.now();
    setAnimationType('slide');
    setIsAnimating(true);

    const duration = getDuration(700, 'normal');

    Animated.sequence([
      Animated.timing(slideAnim, {
        toValue: width,
        duration: duration / 2,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: duration / 2,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start(() => {
      const endTime = performance.now();
      recordAnimation('slide', endTime - startTime, true);
      setIsAnimating(false);
      setAnimationType('');
    });
  };

  const startRotateAnimation = () => {
    const startTime = performance.now();
    setAnimationType('rotate');
    setIsAnimating(true);

    const duration = getDuration(1000, 'slow');

    Animated.timing(rotateAnim, {
      toValue: 1,
      duration,
      easing: Easing.inOut(Easing.cubic),
      useNativeDriver: true,
    }).start(() => {
      rotateAnim.setValue(0);
      const endTime = performance.now();
      recordAnimation('rotate', endTime - startTime, true);
      setIsAnimating(false);
      setAnimationType('');
    });
  };

  const startBounceAnimation = () => {
    const startTime = performance.now();
    setAnimationType('bounce');
    setIsAnimating(true);

    const duration = getDuration(800, 'normal');

    Animated.sequence([
      Animated.timing(bounceAnim, {
        toValue: -20,
        duration: duration / 4,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(bounceAnim, {
        toValue: 0,
        duration: duration / 4,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(bounceAnim, {
        toValue: -10,
        duration: duration / 4,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(bounceAnim, {
        toValue: 0,
        duration: duration / 4,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start(() => {
      const endTime = performance.now();
      recordAnimation('bounce', endTime - startTime, true);
      setIsAnimating(false);
      setAnimationType('');
    });
  };

  const startShimmerAnimation = () => {
    const startTime = performance.now();
    setAnimationType('shimmer');
    setIsAnimating(true);

    const duration = getDuration(1500, 'slow');

    Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration,
        easing: Easing.inOut(Easing.cubic),
        useNativeDriver: true,
      }),
      { iterations: 3 },
    ).start(() => {
      shimmerAnim.setValue(0);
      const endTime = performance.now();
      recordAnimation('shimmer', endTime - startTime, true);
      setIsAnimating(false);
      setAnimationType('');
    });
  };

  const startProgressAnimation = () => {
    const startTime = performance.now();
    setAnimationType('progress');
    setIsAnimating(true);

    const duration = getDuration(2000, 'slow');

    Animated.timing(progressAnim, {
      toValue: 1,
      duration,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start(() => {
      const endTime = performance.now();
      recordAnimation('progress', endTime - startTime, true);
      setIsAnimating(false);
      setAnimationType('');
    });
  };

  const startMorphAnimation = () => {
    const startTime = performance.now();
    setAnimationType('morph');
    setIsAnimating(true);

    const duration = getDuration(1200, 'normal');

    Animated.sequence([
      Animated.timing(morphAnim, {
        toValue: 1,
        duration: duration / 2,
        easing: Easing.inOut(Easing.cubic),
        useNativeDriver: false,
      }),
      Animated.timing(morphAnim, {
        toValue: 0,
        duration: duration / 2,
        easing: Easing.inOut(Easing.cubic),
        useNativeDriver: false,
      }),
    ]).start(() => {
      const endTime = performance.now();
      recordAnimation('morph', endTime - startTime, true);
      setIsAnimating(false);
      setAnimationType('');
    });
  };

  const handleGestureEvent = Animated.event(
    [{ nativeEvent: { translationX: translateX, translationY: translateY } }],
    { useNativeDriver: true },
  );

  const handleGestureStateChange = (event: any) => {
    if (event.nativeEvent.state === State.END) {
      triggerHaptic('impact', { intensity: 'light' });
      
      Animated.parallel([
        Animated.spring(translateX, {
          toValue: 0,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.spring(translateY, {
          toValue: 0,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    }
  };

  const rotateInterpolate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const shimmerInterpolate = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-width, width],
  });

  const progressInterpolate = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const morphInterpolate = morphAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const animationButtons = [
    { name: 'Fade', action: startFadeAnimation, color: theme.colors.primary },
    { name: 'Scale', action: startScaleAnimation, color: theme.colors.success },
    { name: 'Slide', action: startSlideAnimation, color: theme.colors.warning },
    { name: 'Rotate', action: startRotateAnimation, color: theme.colors.info },
    { name: 'Bounce', action: startBounceAnimation, color: theme.colors.danger },
    { name: 'Shimmer', action: startShimmerAnimation, color: theme.colors.primary },
    { name: 'Progress', action: startProgressAnimation, color: theme.colors.success },
    { name: 'Morph', action: startMorphAnimation, color: theme.colors.warning },
  ];

  return (
    <GestureHandlerRootView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Enhanced Animations</Text>
        <Text style={styles.subtitle}>Optimized animations with haptic feedback</Text>
      </View>

      <View style={styles.animationContainer}>
        <PanGestureHandler
          ref={panGestureRef}
          onGestureEvent={handleGestureEvent}
          onHandlerStateChange={handleGestureStateChange}
        >
          <Animated.View
            style={[
              styles.animatedBox,
              {
                opacity: fadeAnim,
                transform: [
                  { scale: scaleAnim },
                  { translateX: slideAnim },
                  { translateY: bounceAnim },
                  { rotate: rotateInterpolate },
                  { translateX },
                  { translateY },
                ],
              },
            ]}
          >
            <Text style={styles.animationText}>
              {animationType ? `Animating: ${animationType}` : 'Drag me!'}
            </Text>

            {/* Shimmer Effect */}
            {animationType === 'shimmer' && (
              <Animated.View
                style={[
                  styles.shimmerOverlay,
                  {
                    transform: [{ translateX: shimmerInterpolate }],
                  },
                ]}
              />
            )}

            {/* Progress Bar */}
            {animationType === 'progress' && (
              <View style={styles.progressContainer}>
                <Animated.View
                  style={[
                    styles.progressBar,
                    {
                      width: progressInterpolate.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0%', '100%'],
                      }),
                    },
                  ]}
                />
              </View>
            )}

            {/* Morph Effect */}
            {animationType === 'morph' && (
              <Animated.View
                style={[
                  styles.morphOverlay,
                  {
                    opacity: morphInterpolate,
                    transform: [
                      {
                        scale: morphInterpolate.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0.5, 1.5],
                        }),
                      },
                    ],
                  },
                ]}
              />
            )}
          </Animated.View>
        </PanGestureHandler>
      </View>

      <View style={styles.buttonContainer}>
        {animationButtons.map((button, index) => (
          <TouchableOpacity
            key={button.name}
            style={[
              styles.animationButton,
              { backgroundColor: button.color },
              isAnimating && styles.disabledButton,
            ]}
            onPress={() => {
              if (!isAnimating) {
                triggerHaptic('selection');
                button.action();
              }
            }}
            disabled={isAnimating}
          >
            <Text style={styles.buttonText}>{button.name}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.statusContainer}>
        <Text style={styles.statusText}>
          Status: {isAnimating ? `Animating (${animationType})` : 'Ready'}
        </Text>
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.white,
  },
  header: {
    padding: theme.spacing.lg,
    alignItems: 'center',
  },
  title: {
    fontSize: theme.fontSize.xxl,
    fontWeight: 'bold',
    color: theme.colors.black,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    fontSize: theme.fontSize.md,
    color: theme.colors.gray[600],
    textAlign: 'center',
  },
  animationContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  animatedBox: {
    width: 200,
    height: 200,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.xl,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: theme.colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    position: 'relative',
    overflow: 'hidden',
  },
  animationText: {
    fontSize: theme.fontSize.lg,
    fontWeight: '600',
    color: theme.colors.white,
    textAlign: 'center',
  },
  shimmerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    width: 50,
  },
  progressContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: theme.colors.white,
    borderRadius: 2,
  },
  morphOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: theme.borderRadius.xl,
  },
  buttonContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    padding: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  animationButton: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.lg,
    minWidth: 80,
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.5,
  },
  buttonText: {
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
    color: theme.colors.white,
  },
  statusContainer: {
    padding: theme.spacing.lg,
    alignItems: 'center',
  },
  statusText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.gray[600],
    fontWeight: '500',
  },
});
