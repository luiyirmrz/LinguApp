/**
 * Performance Optimized Components
 * Centralized collection of optimized React components and hooks
 */

import React, { memo, useMemo, useCallback, useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';
import { useLanguage } from '@/hooks/useLanguage';
import { useGameState } from '@/hooks/useGameState';

// Optimized Error Boundary
export const OptimizedErrorBoundary = memo(({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactNode }) => {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const handleError = () => setHasError(true);
    if (typeof window !== 'undefined' && window.addEventListener) {
      window.addEventListener('error', handleError);
      return () => window.removeEventListener('error', handleError);
    }
  }, []);

  if (hasError) {
    return fallback || (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Something went wrong</Text>
      </View>
    );
  }

  return <>{children}</>;
});

// Optimized Auth Hook
export const useOptimizedAuth = () => {
  const auth = useUnifiedAuth();
  
  return useMemo(() => ({
    user: auth.user,
    isAuthenticated: !!auth.user,
    isLoading: auth.isLoading,
    signIn: auth.signIn,
    signOut: auth.signOut,
    signUp: auth.signUp,
  }), [auth.user, auth.isLoading]);
};

// Optimized Language Hook
export const useOptimizedLanguage = () => {
  const language = useLanguage();
  
  return useMemo(() => ({
    currentLanguage: language.currentLanguage,
    changeUILanguage: language.changeUILanguage,
    isLoading: language.isLoading,
  }), [language.currentLanguage, language.isLoading]);
};

// Optimized Game State Hook
export const useOptimizedGameState = () => {
  const gameState = useGameState();
  
  return useMemo(() => ({
    skills: gameState.skills,
    completeLesson: gameState.completeLesson,
    updateStreak: gameState.updateStreak,
    isLoading: gameState.isLoading,
  }), [gameState.skills, gameState.isLoading]);
};

// Optimized Progress Hook
export const useOptimizedProgress = () => {
  const [progress, setProgress] = useState(0);
  
  const updateProgress = useCallback((newProgress: number) => {
    setProgress(Math.max(0, Math.min(100, newProgress)));
  }, []);
  
  return useMemo(() => ({
    progress,
    updateProgress,
  }), [progress, updateProgress]);
};

// Optimized User Stats Component
export const OptimizedUserStats = memo(({ userId = 'default' }: { userId?: string }) => {
  const { user } = useOptimizedAuth();
  const { skills, completeLesson, updateStreak } = useOptimizedGameState();
  
  return (
    <View style={styles.statsContainer}>
      <Text style={styles.statsText}>Skills: {skills?.length || 0}</Text>
      <Text style={styles.statsText}>User: {user?.name || 'Guest'}</Text>
    </View>
  );
});

// Optimized Skill List Component
export const OptimizedSkillList = memo(({ skills }: { skills: any[] }) => {
  return (
    <View style={styles.skillsContainer}>
      {skills.map((skill, index) => (
        <Text key={index} style={styles.skillText}>{skill}</Text>
      ))}
    </View>
  );
});

// Optimized Loading Component
export const OptimizedLoading = memo(({ message = 'Loading...' }: { message?: string }) => {
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#007AFF" />
      <Text style={styles.loadingText}>{message}</Text>
    </View>
  );
});

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#FF3B30',
    textAlign: 'center',
  },
  statsContainer: {
    padding: 16,
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
    margin: 8,
  },
  statsText: {
    fontSize: 14,
    color: '#000',
    marginBottom: 4,
  },
  skillsContainer: {
    padding: 16,
  },
  skillText: {
    fontSize: 14,
    color: '#000',
    marginBottom: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 12,
    textAlign: 'center',
  },
});

// Set display names
OptimizedErrorBoundary.displayName = 'OptimizedErrorBoundary';
OptimizedUserStats.displayName = 'OptimizedUserStats';
OptimizedSkillList.displayName = 'OptimizedSkillList';
OptimizedLoading.displayName = 'OptimizedLoading';
