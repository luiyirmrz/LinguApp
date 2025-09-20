import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect, Suspense, memo, useMemo, lazy } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Platform, View, Text, ActivityIndicator } from 'react-native';
import { LoadingSpinner } from '@/components';
import { UnifiedAuthProvider } from '@/hooks/useUnifiedAuth';
import { AccessibilityProvider } from '@/components/AccessibilityProvider';
import { EnhancedErrorBoundary } from '@/components/EnhancedErrorBoundary';
import AuthWrapper from '@/components/AuthWrapper';
import { FeedbackContainer } from '@/components/EnhancedUserFeedback';
import ToastItem from '@/components/Toast';
import { AdaptiveThemeProvider } from '@/contexts/AdaptiveThemeContext';
import { LanguageProvider } from '@/hooks/useLanguage';
// import { AuthProvider } from '@/hooks/useAuth'; // Removed during consolidation
import { preloadCriticalDependencies } from '@/services/optimization/LazyDependencies';
import { GreetingsProvider } from '@/hooks/useGreetings';
// import { GamificationProvider } from '@/hooks/useGamification'; // Removed during consolidation
import { SRSProvider } from '@/hooks/useSpacedRepetition';
import { MultilingualLearningProvider } from '@/hooks/useMultilingualLearning';
import { DidacticProvider } from '@/hooks/useDidactic';

SplashScreen.preventAutoHideAsync();

// Optimized QueryClient configuration for better performance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 10 * 60 * 1000, // 10 minutes - increased for better performance
      gcTime: 30 * 60 * 1000, // 30 minutes - increased cache time
      retry: 1, // Reduced retries for faster failure handling
      refetchOnWindowFocus: false,
      refetchOnMount: false, // Don't refetch on mount if data is fresh
      refetchOnReconnect: false, // Don't refetch on reconnect
      networkMode: 'online', // Only run queries when online
    },
    mutations: {
      retry: 1, // Reduced retries for mutations
      networkMode: 'online',
    },
  },
});

// Simplified navigation component to avoid LinkingContext issues
const RootLayoutNav = memo(() => {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="lesson" />
      <Stack.Screen name="greetings" />
      <Stack.Screen name="greetings-lesson" />
    </Stack>
  );
});

RootLayoutNav.displayName = 'RootLayoutNav';

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
    
    // Preload critical dependencies for better performance
    preloadCriticalDependencies().catch(console.warn);
    
    // Fix for Expo Router "operation is insecure" error on web
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      // Override history methods to handle security issues
      const originalReplaceState = window.history.replaceState;
      const originalPushState = window.history.pushState;
      
      window.history.replaceState = function(state, title, url) {
        try {
          return originalReplaceState.call(this, state, title, url);
        } catch (error) {
          console.warn('History replaceState failed, using fallback:', error);
          // Fallback: try with relative URL
          if (url && typeof url === 'string' && url.startsWith('http')) {
            const relativeUrl = url.replace(window.location.origin, '');
            return originalReplaceState.call(this, state, title, relativeUrl);
          }
          return originalReplaceState.call(this, state, title, url);
        }
      };
      
      window.history.pushState = function(state, title, url) {
        try {
          return originalPushState.call(this, state, title, url);
        } catch (error) {
          console.warn('History pushState failed, using fallback:', error);
          // Fallback: try with relative URL
          if (url && typeof url === 'string' && url.startsWith('http')) {
            const relativeUrl = url.replace(window.location.origin, '');
            return originalPushState.call(this, state, title, relativeUrl);
          }
          return originalPushState.call(this, state, title, url);
        }
      };
    }
  }, []);

  return (
    <EnhancedErrorBoundary
      category="unknown"
      severity="high"
      showRetryButton={true}
      showReportButton={true}
      resetOnPropsChange={false}
    >
      <QueryClientProvider client={queryClient}>
        <LanguageProvider>
          <AdaptiveThemeProvider>
            {/* TEMPORARILY DISABLED: AuthProvider to prevent infinite loops */}
            {/* <AuthProvider> */}
              <UnifiedAuthProvider>
                {/* <GamificationProvider> */}
                  <SRSProvider>
                    <MultilingualLearningProvider>
                      <DidacticProvider>
                        <GreetingsProvider>
                          <AccessibilityProvider>
                            <AuthWrapper>
                              <GestureHandlerRootView style={{ flex: 1 }}>
                                <Suspense fallback={<LoadingSpinner />}>
                                  <RootLayoutNav />
                                </Suspense>
                              </GestureHandlerRootView>
                            </AuthWrapper>
                            <FeedbackContainer />
                          </AccessibilityProvider>
                        </GreetingsProvider>
                      </DidacticProvider>
                    </MultilingualLearningProvider>
                  </SRSProvider>
                {/* </GamificationProvider> */}
              </UnifiedAuthProvider>
            {/* </AuthProvider> */}
          </AdaptiveThemeProvider>
        </LanguageProvider>
      </QueryClientProvider>
    </EnhancedErrorBoundary>
  );
}
