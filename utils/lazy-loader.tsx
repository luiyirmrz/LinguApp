/**
 * LAZY LOADING UTILITIES
 * 
 * Provides optimized lazy loading for components with proper loading states,
 * error boundaries, and performance monitoring.
 */

import React, { Suspense, lazy, Component, ReactNode } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { theme } from '@/constants/theme';

// ============================================================================
// LAZY LOADING COMPONENTS
// ============================================================================

// Loading component with skeleton
export const LazyLoadingSkeleton = () => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color={theme.colors.primary} /> 
    <Text style={styles.loadingText}>Loading...</Text>
  </View>
);

// Error boundary for lazy loaded components
interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error) => void;
}

export class LazyErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Lazy loading error:', error, errorInfo);
    this.props.onError?.(error);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Failed to load component</Text>
          <Text style={styles.errorSubtext}>Please try again later</Text>
        </View>
      );
    }

    return this.props.children;
  }
}

// ============================================================================
// LAZY LOADING WRAPPER
// ============================================================================

interface LazyComponentProps {
  fallback?: ReactNode;
  errorFallback?: ReactNode;
  onError?: (error: Error) => void;
}

export function createLazyComponent<T extends object>(
  importFn: () => Promise<{ default: React.ComponentType<T> }>,
  options: LazyComponentProps = {},
) {
  const LazyComponent = lazy(importFn);

  return React.forwardRef<any, T>((props, ref) => (
    <LazyErrorBoundary 
      fallback={options.errorFallback}
      onError={options.onError}
    >
      <Suspense fallback={options.fallback || <LazyLoadingSkeleton />}>
        <LazyComponent {...props} ref={ref} />
      </Suspense>
    </LazyErrorBoundary>
  ));
}

// ============================================================================
// PRE-DEFINED LAZY COMPONENTS
// ============================================================================

// Lazy load heavy components
export const LazyGreetingsModule = createLazyComponent(
  () => import('@/components/GreetingsModuleScreen'),
  {
    fallback: <LazyLoadingSkeleton />,
    onError: (error) => console.error('Failed to load GreetingsModule:', error),
  },
);

export const LazyLessonScreen = createLazyComponent(
  () => import('@/app/lesson'),
  {
    fallback: <LazyLoadingSkeleton />,
    onError: (error) => console.error('Failed to load LessonScreen:', error),
  },
);

export const LazyProfileScreen = createLazyComponent(
  () => import('@/app/(tabs)/profile'),
  {
    fallback: <LazyLoadingSkeleton />,
    onError: (error) => console.error('Failed to load ProfileScreen:', error),
  },
);

export const LazyLeaderboardScreen = createLazyComponent(
  () => import('@/app/(tabs)/leaderboard'),
  {
    fallback: <LazyLoadingSkeleton />,
    onError: (error) => console.error('Failed to load LeaderboardScreen:', error),
  },
);

export const LazyShopScreen = createLazyComponent(
  () => import('@/app/(tabs)/shop'),
  {
    fallback: <LazyLoadingSkeleton />,
    onError: (error) => console.error('Failed to load ShopScreen:', error),
  },
);

// Lazy load heavy utilities
export const LazyAnalytics = () => import('@/services/analytics/analytics').then(module => module.analyticsService);

export const LazySpeechToText = () => import('@/services/audio/speechToText').then(module => module.speechToTextService);

// ============================================================================
// ROUTE-BASED LAZY LOADING
// ============================================================================

// Lazy load routes based on navigation
export const lazyRoutes = {
  greetings: () => import('@/app/greetings'),
  lesson: () => import('@/app/lesson'),
  profile: () => import('@/app/(tabs)/profile'),
  leaderboard: () => import('@/app/(tabs)/leaderboard'),
  shop: () => import('@/app/(tabs)/shop'),
  onboarding: () => import('@/app/(auth)/onboarding'),
  signin: () => import('@/app/(auth)/signin'),
  signup: () => import('@/app/(auth)/signup'),
};

// ============================================================================
// PERFORMANCE MONITORING
// ============================================================================

// Track lazy loading performance
export const useLazyLoadingMonitor = (componentName: string) => {
  const startTime = React.useRef(Date.now());
  const [loadTime, setLoadTime] = React.useState<number | null>(null);

  React.useEffect(() => {
    const endTime = Date.now();
    const duration = endTime - startTime.current;
    setLoadTime(duration);

    if (__DEV__) {
      console.debug(`${componentName} loaded in ${duration}ms`);
    }

    // Log to analytics if load time is too high
    if (duration > 2000) {
      console.warn(`${componentName} took ${duration}ms to load - consider optimization`);
    }
  }, []);

  return loadTime;
};

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  loadingText: {
    marginTop: theme.spacing.md,
    fontSize: theme.fontSize.md,
    color: theme.colors.gray[600],
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  errorText: {
    fontSize: theme.fontSize.lg,
    color: theme.colors.danger,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  errorSubtext: {
    fontSize: theme.fontSize.md,
    color: theme.colors.gray[600],
    textAlign: 'center',
  },
});
