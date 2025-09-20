import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { theme } from '@/constants/theme';
import { Heart, Flame, Gem, Lock, Globe, Star, Settings } from '@/components/icons/LucideReplacement';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';
import { useLanguage } from '@/hooks/useLanguage';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';
import { ResponsiveLayout, ResponsiveCard, ResponsiveText, ResponsiveGrid } from '@/components/ResponsiveLayout';
// TODO: Implement safe versions of useGamification and useLearning
// import { useGamification, useLearning } from '@/store/unifiedStore';
import { OptimizedErrorBoundary, OptimizedUserStats } from '@/components/PerformanceOptimized';

export default function HomeScreen() {
  const router = useRouter();
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);
  
  // Use safe hooks
  const { user } = useUnifiedAuth();
  const { currentUILanguage: targetLanguage } = useLanguage();
  const { isTablet, isLandscape, responsiveValues } = useResponsiveLayout();
  
  // Mock data for gamification and learning (temporarily)
  const points = 1250;
  const level = 5;
  const gems = 45;
  const hearts = 5;
  const progress = { currentStreak: 7, totalLessons: 25, completedLessons: 18 };

  // Computed user data
  const userData = useMemo(() => ({
    name: user?.name || 'Demo User',
    streak: progress.currentStreak || 7,
    hearts: hearts || 5,
    gems: gems || 120,
    level: level || 3,
    xp: points || 450,
    xpToNext: 550, // This could be calculated based on level
  }), [user, progress.currentStreak, hearts, gems, level, points]);

  const skills = [
    { id: 'greetings', name: 'Greetings', progress: 0.8, locked: false },
    { id: 'basics', name: 'Basics', progress: 0.6, locked: false },
    { id: 'family', name: 'Family', progress: 0.3, locked: false },
    { id: 'food', name: 'Food', progress: 0, locked: true },
    { id: 'travel', name: 'Travel', progress: 0, locked: true },
  ];

  const handleSkillPress = useCallback((skill: any) => {
    if (skill.locked) {
      return;
    }
    
    // Navigate to lesson based on skill
    if (skill.id === 'greetings') {
      router.push('/greetings');
    } else {
      router.push('/lesson');
    }
  }, [router]);

  const renderSkillCard = useCallback((skill: any) => (
    <TouchableOpacity
      key={skill.id}
      style={[styles.skillCard, skill.locked && styles.lockedCard]}
      onPress={() => handleSkillPress(skill)}
      disabled={skill.locked}
    >
      <View style={styles.skillHeader}>
        <Text style={[styles.skillTitle, skill.locked && styles.lockedText]}>
          {skill.name}
        </Text>
        {skill.locked && <Lock size={16} color={theme.colors.gray[400]} />}
      </View>
      
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { width: `${skill.progress * 100}%` },
            ]} 
          />
        </View>
        <Text style={styles.progressText}>
          {Math.round(skill.progress * 100)}%
        </Text>
      </View>
    </TouchableOpacity>
  ), [handleSkillPress]);

  return (
    <OptimizedErrorBoundary>
      <ResponsiveLayout 
        scrollable
        padding="auto"
        maxWidth={isTablet ? 800 : undefined}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.greeting}>
            <Text style={styles.greetingText}>Hello, {userData.name}! 👋</Text>
            <Text style={styles.subGreeting}>Ready to learn today?</Text>
          </View>
          
          <TouchableOpacity 
            style={styles.settingsButton}
            onPress={() => router.push('/(tabs)/profile')}
          >
            <Settings size={24} color={theme.colors.text} />
          </TouchableOpacity>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <View style={styles.statIcon}>
              <Flame size={20} color={theme.colors.orange} />
            </View>
            <Text style={styles.statValue}>{userData.streak}</Text>
            <Text style={styles.statLabel}>Day Streak</Text>
          </View>
          
          <View style={styles.statCard}>
            <View style={styles.statIcon}>
              <Heart size={20} color={theme.colors.red} />
            </View>
            <Text style={styles.statValue}>{userData.hearts}</Text>
            <Text style={styles.statLabel}>Hearts</Text>
          </View>
          
          <View style={styles.statCard}>
            <View style={styles.statIcon}>
              <Gem size={20} color={theme.colors.blue} />
            </View>
            <Text style={styles.statValue}>{userData.gems}</Text>
            <Text style={styles.statLabel}>Gems</Text>
          </View>
        </View>

        {/* Level Progress */}
        <View style={styles.levelCard}>
          <LinearGradient
            colors={[theme.colors.primary, theme.colors.secondary]}
            style={styles.levelGradient}
          >
            <View style={styles.levelContent}>
              <View style={styles.levelInfo}>
                <Text style={styles.levelText}>Level {userData.level}</Text>
                <Text style={styles.xpText}>{userData.xp} / {userData.xpToNext} XP</Text>
              </View>
              <View style={styles.levelProgress}>
                <View style={styles.levelProgressBar}>
                  <View 
                    style={[
                      styles.levelProgressFill, 
                      { width: `${(userData.xp / userData.xpToNext) * 100}%` },
                    ]} 
                  />
                </View>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Language Selector */}
        <View style={styles.languageSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Learning</Text>
            <TouchableOpacity 
              style={styles.changeLanguageButton}
              onPress={() => setShowLanguageSelector(true)}
            >
              <Globe size={16} color={theme.colors.primary} />
              <Text style={styles.changeLanguageText}>Change</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.currentLanguage}>
            <Text style={styles.currentLanguageText}>{targetLanguage?.name || 'Spanish'}</Text>
            <Text style={styles.currentLanguageSubtext}>Beginner Level</Text>
          </View>
        </View>

        {/* Skills Section */}
        <View style={styles.skillsSection}>
          <Text style={styles.sectionTitle}>Continue Learning</Text>
          <View style={styles.skillsGrid}>
            {skills.map(renderSkillCard)}
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => router.push('/greetings')}
            >
              <Star size={24} color={theme.colors.primary} />
              <Text style={styles.actionText}>Practice</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => router.push('/(tabs)/leaderboard')}
            >
              <Flame size={24} color={theme.colors.orange} />
              <Text style={styles.actionText}>Leaderboard</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => router.push('/(tabs)/shop')}
            >
              <Gem size={24} color={theme.colors.blue} />
              <Text style={styles.actionText}>Shop</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ResponsiveLayout>
    </OptimizedErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.lg,
    paddingTop: theme.spacing.md,
  },
  greeting: {
    flex: 1,
  },
  greetingText: {
    fontSize: theme.fontSize.xl,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  subGreeting: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  settingsButton: {
    padding: theme.spacing.sm,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
  },
  statIcon: {
    marginBottom: theme.spacing.sm,
  },
  statValue: {
    fontSize: theme.fontSize.lg,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  statLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  levelCard: {
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
  },
  levelGradient: {
    padding: theme.spacing.lg,
  },
  levelContent: {
    alignItems: 'center',
  },
  levelInfo: {
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  levelText: {
    fontSize: theme.fontSize.lg,
    fontWeight: 'bold',
    color: theme.colors.white,
  },
  xpText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.white,
    opacity: 0.9,
    marginTop: theme.spacing.xs,
  },
  levelProgress: {
    width: '100%',
  },
  levelProgressBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 4,
  },
  levelProgressFill: {
    height: '100%',
    backgroundColor: theme.colors.white,
    borderRadius: 4,
  },
  languageSection: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  changeLanguageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  changeLanguageText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  currentLanguage: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },
  currentLanguageText: {
    fontSize: theme.fontSize.md,
    fontWeight: '600',
    color: theme.colors.text,
  },
  currentLanguageSubtext: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  skillsSection: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  skillsGrid: {
    gap: theme.spacing.md,
  },
  skillCard: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  lockedCard: {
    opacity: 0.6,
  },
  skillHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  skillTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: '600',
    color: theme.colors.text,
  },
  lockedText: {
    color: theme.colors.gray[400],
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: theme.colors.border,
    borderRadius: 3,
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.primary,
    borderRadius: 3,
  },
  progressText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    minWidth: 40,
    textAlign: 'right',
  },
  quickActions: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  actionsGrid: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  actionCard: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  actionText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text,
    marginTop: theme.spacing.sm,
    fontWeight: '600',
  },
});
