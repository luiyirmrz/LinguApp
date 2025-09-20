/**
 * OPTIMIZED HOME SCREEN
 * 
 * This is an optimized version of the home screen that demonstrates:
 * - React.memo to prevent unnecessary re-renders
 * - Selective Zustand selectors for better performance
 * - Proper lazy loading and virtualization
 * - Memory leak prevention
 * - Optimized event handlers
 */

import React, { memo, useCallback, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Heart, Flame, Gem, Lock, Globe, Star, Settings } from '@/components/icons/LucideReplacement';
import { theme } from '@/constants/theme';
import { useOptimizedAuth, useOptimizedGameState, useOptimizedLanguage } from '@/components/PerformanceOptimized';
import { OptimizedUserStats, OptimizedSkillList, OptimizedLoading } from '@/components/PerformanceOptimized';
import { EnhancedLanguageSelector, useLanguageSelector } from '@/components/EnhancedLanguageSelector';
import { LanguageSelector } from '@/components/LanguageSelector';
import { Language } from '@/types';

// ============================================================================
// OPTIMIZED COMPONENTS
// ============================================================================

// Memoized header component
const OptimizedHeader = memo(() => {
  const { user } = useOptimizedAuth();
  const { currentLanguage: mainLanguage } = useOptimizedLanguage();
  const { selectorVisible, showSelector, hideSelector } = useLanguageSelector();
  const [showLanguageSelector, setShowLanguageSelector] = React.useState(false);

  const handleMainLanguagePress = useCallback(() => {
    showSelector();
  }, [showSelector]);

  const handleTargetLanguagePress = useCallback(() => {
    setShowLanguageSelector(true);
  }, []);

  const handleLanguageSelect = useCallback((language: Language) => {
    console.debug('Language selected:', language);
    setShowLanguageSelector(false);
  }, []);

  const handleCloseLanguageSelector = useCallback(() => {
    setShowLanguageSelector(false);
  }, []);

  if (!user) return null;

  return (
    <LinearGradient
      colors={[theme.colors.primary, theme.colors.secondary]}
      style={styles.header}
    >
      <OptimizedUserStats />
      
      <View style={styles.userInfo}>
        <Text style={styles.userName}>Hi, {user?.name}!</Text>
        
        {/* Main Language Selector */}
        <TouchableOpacity 
          style={styles.languageSelector}
          onPress={handleMainLanguagePress}
        >
          <Settings size={16} color={theme.colors.white} />
          <Text style={styles.userLanguage}>
            Main: {user.mainLanguage?.flag} {user.mainLanguage?.name}
          </Text>
        </TouchableOpacity>
        
        {/* Target Language Display */}
        <TouchableOpacity 
          style={styles.languageSelector}
          onPress={handleTargetLanguagePress}
        >
          <Globe size={16} color={theme.colors.white} />
          <Text style={styles.userLanguage}>
            Learning: {user?.currentLanguage?.name} {user?.currentLanguage?.flag}
          </Text>
        </TouchableOpacity>
        
        <View style={styles.progressInfo}>
          <View style={styles.levelBadge}>
            <Star size={14} color={theme.colors.warning} />
            <Text style={styles.levelText}>A1</Text>
          </View>
          <Text style={styles.xpText}>1250 XP</Text>
        </View>
      </View>

      {/* Language Selectors */}
      <LanguageSelector
        visible={showLanguageSelector}
        onClose={handleCloseLanguageSelector}
        currentLanguage={user?.currentLanguage || {
          id: 'en',
          code: 'en',
          name: 'English',
          level: 'beginner',
          flag: '🇺🇸',
        }}
        onLanguageSelect={handleLanguageSelect}
      />
      
      <EnhancedLanguageSelector
        visible={selectorVisible}
        onClose={hideSelector}
        title="Choose Language"
        description="Choose your preferred language for the app interface."
      />
    </LinearGradient>
  );
});

OptimizedHeader.displayName = 'OptimizedHeader';

// Memoized skill tree component
const OptimizedSkillTree = memo(() => {
  const router = useRouter();
  const { currentLanguage: mainLanguage } = useOptimizedLanguage();
  
  // Mock skills data - in real app this would come from a service
  const skills = useMemo(() => [
    {
      id: 'greetings',
      title: 'Basic Greetings',
      icon: '👋',
      color: theme.colors.primary,
      level: 2,
      totalLevels: 5,
      locked: false,
    },
    {
      id: 'numbers',
      title: 'Numbers',
      icon: '🔢',
      color: theme.colors.secondary,
      level: 1,
      totalLevels: 3,
      locked: false,
    },
    {
      id: 'colors',
      title: 'Colors',
      icon: '🎨',
      color: theme.colors.warning,
      level: 0,
      totalLevels: 4,
      locked: true,
    },
    {
      id: 'family',
      title: 'Family',
      icon: '👨‍👩‍👧‍👦',
      color: theme.colors.success,
      level: 0,
      totalLevels: 3,
      locked: true,
    },
  ], []);

  const handleSkillPress = useCallback((skillId: string) => {
    const skill = skills.find(s => s.id === skillId);
    if (!skill) return;

    if (skillId === 'greetings') {
      router.push('/greetings');
    } else if (skill.level && skill.totalLevels) {
      router.push({
        pathname: '/lesson' as any,
        params: { 
          skillId: skill.id,
          lessonId: skill.id,
        },
      });
    }
  }, [skills, router]);

  return (
    <View style={styles.skillTree}>
      <OptimizedSkillList skills={skills} />
    </View>
  );
});

OptimizedSkillTree.displayName = 'OptimizedSkillTree';

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const OptimizedHomeScreen = memo(() => {
  const { user, isAuthenticated, isLoading } = useOptimizedAuth();

  // Update streak on mount
  useEffect(() => {
    if (isAuthenticated && user) {
      // updateStreak();
    }
  }, [isAuthenticated, user]);

  // Show loading state
  if (isLoading) {
    return <OptimizedLoading />;
  }

  // Show nothing if not authenticated
  if (!isAuthenticated || !user) {
    return null;
  }

  const currentLanguage: Language = user?.currentLanguage || {
    id: 'en',
    code: 'en',
    name: 'English',
    level: 'beginner',
    flag: '🇺🇸',
  };

  return (
    <SafeAreaView style={styles.container}>
      <OptimizedHeader />
      <OptimizedSkillTree />
    </SafeAreaView>
  );
});

OptimizedHomeScreen.displayName = 'OptimizedHomeScreen';

export default OptimizedHomeScreen;

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.gray[50],
  },
  header: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.lg,
    borderBottomLeftRadius: theme.borderRadius.xl,
    borderBottomRightRadius: theme.borderRadius.xl,
  },
  userInfo: {
    alignItems: 'center',
    marginTop: theme.spacing.lg,
  },
  languageSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginBottom: theme.spacing.sm,
  },
  progressInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
  },
  levelText: {
    fontSize: theme.fontSize.sm,
    fontWeight: '600' as const,
    color: theme.colors.white,
  },
  xpText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.white,
    opacity: 0.9,
  },
  userName: {
    fontSize: theme.fontSize.xl,
    fontWeight: 'bold' as const,
    color: theme.colors.white,
    marginBottom: theme.spacing.xs,
  },
  userLanguage: {
    fontSize: theme.fontSize.md,
    color: theme.colors.white,
    opacity: 0.9,
  },
  skillTree: {
    flex: 1,
  },
});
