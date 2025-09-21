import React, { useState, useCallback, useMemo, memo } from 'react';
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
import { WebLayout, WebContainer } from '@/components/WebLayout';
// TODO: Implement safe versions of useGamification and useLearning
// import { useGamification, useLearning } from '@/store/unifiedStore';
import { OptimizedErrorBoundary, OptimizedUserStats } from '@/components/PerformanceOptimized';

interface Skill {
  id: string;
  name: string;
  progress: number;
  locked: boolean;
}

// Memoized skill card component for better performance
const SkillCard = memo<{ skill: Skill; onPress: (skill: Skill) => void }>(({ skill, onPress }) => (
  <TouchableOpacity
    key={skill.id}
    style={[styles.skillCard, skill.locked && styles.lockedCard]}
    onPress={() => onPress(skill)}
    disabled={skill.locked}
    data-testid="skill-card"
  >
    <View style={styles.skillHeader}>
      <Text style={[styles.skillTitle, skill.locked && styles.lockedText]} data-testid="text">
        {skill.name}
      </Text>
      {skill.locked && <Lock size={16} color={theme.colors.gray[400]} data-testid="icon" />}
    </View>
    
    <View style={styles.progressContainer}>
      <View style={styles.progressBar} data-testid="progress-bar">
        <View 
          style={[
            styles.progressFill, 
            { width: `${skill.progress * 100}%` },
          ]} 
          data-testid="progress-fill"
        />
      </View>
      <Text style={styles.progressText} data-testid="text">
        {Math.round(skill.progress * 100)}%
      </Text>
    </View>
  </TouchableOpacity>
));

SkillCard.displayName = 'SkillCard';

export default function HomeScreen() {
  const router = useRouter();
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
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
    gems: gems || 45,
    level: level || 5,
    xp: points || 1250,
    xpToNext: 1800, // Level 5: 1250/1800 XP (550 XP needed to reach next level)
  }), [user, progress.currentStreak, hearts, gems, level, points]);

  const skills = useMemo(() => [
    { id: 'greetings', name: 'Greetings', progress: 0.8, locked: false },
    { id: 'basics', name: 'Basics', progress: 0.6, locked: false },
    { id: 'family', name: 'Family', progress: 0, locked: false },
    { id: 'food', name: 'Food', progress: 0, locked: true },
    { id: 'travel', name: 'Travel', progress: 0, locked: true },
  ], []);

  const handleSkillPress = useCallback(async (skill: Skill) => {
    if (skill.locked) {
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Navigate to lesson based on skill
      if (skill.id === 'greetings') {
        await router.push('/greetings');
      } else {
        await router.push('/lesson');
      }
    } catch (err) {
      setError('Failed to navigate to lesson. Please try again.');
      console.error('Navigation error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  const renderSkillCard = useCallback((skill: Skill) => (
    <SkillCard key={skill.id} skill={skill} onPress={handleSkillPress} />
  ), [handleSkillPress]);

  // Show error state
  if (error) {
    return (
      <OptimizedErrorBoundary>
        <WebLayout scrollable padding="auto">
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity 
              style={styles.retryButton}
              onPress={() => setError(null)}
            >
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        </WebLayout>
      </OptimizedErrorBoundary>
    );
  }

  return (
    <OptimizedErrorBoundary>
      <WebLayout 
        scrollable
        padding="auto"
        maxWidth={isTablet ? 800 : undefined}
      >
        {/* Header */}
        <View style={styles.header} data-testid="header">
          <View style={styles.greeting}>
            <Text style={styles.greetingText}>Hello, {userData.name}! 👋</Text>
            <Text style={styles.subGreeting}>Ready to learn today?</Text>
          </View>
          
          <TouchableOpacity 
            style={styles.settingsButton}
            onPress={() => router.push('/(tabs)/profile')}
            data-testid="touchable-opacity"
          >
            <Settings size={24} color={theme.colors.text} data-testid="icon" />
          </TouchableOpacity>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer} data-testid="stats-container">
          <View style={styles.statCard} data-testid="stat-card">
            <View style={styles.statIcon}>
              <Flame size={20} color={theme.colors.orange} data-testid="icon" />
            </View>
            <Text style={styles.statValue} data-testid="text">{userData.streak}</Text>
            <Text style={styles.statLabel} data-testid="text">Day Streak</Text>
          </View>
          
          <View style={styles.statCard} data-testid="stat-card">
            <View style={styles.statIcon}>
              <Heart size={20} color={theme.colors.red} data-testid="icon" />
            </View>
            <Text style={styles.statValue} data-testid="text">{userData.hearts}</Text>
            <Text style={styles.statLabel} data-testid="text">Hearts</Text>
          </View>
          
          <View style={styles.statCard} data-testid="stat-card">
            <View style={styles.statIcon}>
              <Gem size={20} color={theme.colors.blue} data-testid="icon" />
            </View>
            <Text style={styles.statValue} data-testid="text">{userData.gems}</Text>
            <Text style={styles.statLabel} data-testid="text">Gems</Text>
          </View>
        </View>

        {/* Level Progress */}
        <View style={styles.levelCard} data-testid="level-card">
          <LinearGradient
            colors={[theme.colors.primary, theme.colors.secondary]}
            style={styles.levelGradient}
          >
            <View style={styles.levelContent}>
              <View style={styles.levelInfo}>
                <Text style={styles.levelText} data-testid="text">Level {userData.level}</Text>
                <Text style={styles.xpText} data-testid="text">{userData.xp} / {userData.xpToNext} XP</Text>
              </View>
              <View style={styles.levelProgress}>
                <View style={styles.levelProgressBar} data-testid="progress-bar">
                  <View 
                    style={[
                      styles.levelProgressFill, 
                      { width: `${Math.min((userData.xp / userData.xpToNext) * 100, 100)}%` },
                    ]} 
                    data-testid="progress-fill"
                  />
                </View>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Language Selector */}
        <View style={styles.languageSection} data-testid="language-section">
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle} data-testid="text">Learning</Text>
            <TouchableOpacity 
              style={styles.changeLanguageButton}
              onPress={() => setShowLanguageSelector(true)}
              data-testid="touchable-opacity"
            >
              <Globe size={16} color={theme.colors.primary} data-testid="icon" />
              <Text style={styles.changeLanguageText} data-testid="text">Change</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.currentLanguage} data-testid="current-language">
            <Text style={styles.currentLanguageText} data-testid="text">English</Text>
            <Text style={styles.currentLanguageSubtext} data-testid="text">Beginner Level</Text>
          </View>
        </View>

        {/* Skills Section */}
        <View style={styles.skillsSection} data-testid="skills-section">
          <Text style={styles.sectionTitle} data-testid="text">Continue Learning</Text>
          <View style={styles.skillsGrid}>
            {skills.map(renderSkillCard)}
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions} data-testid="quick-actions">
          <Text style={styles.sectionTitle} data-testid="text">Quick Actions</Text>
          <View style={styles.actionsGrid} data-testid="actions-grid">
            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => router.push('/greetings')}
              data-testid="action-card"
            >
              <Star size={24} color={theme.colors.primary} data-testid="icon" />
              <Text style={styles.actionText} data-testid="text">Practice</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => router.push('/(tabs)/leaderboard')}
              data-testid="action-card"
            >
              <Flame size={24} color={theme.colors.orange} data-testid="icon" />
              <Text style={styles.actionText} data-testid="text">Leaderboard</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => router.push('/(tabs)/shop')}
              data-testid="action-card"
            >
              <Gem size={24} color={theme.colors.blue} data-testid="icon" />
              <Text style={styles.actionText} data-testid="text">Shop</Text>
            </TouchableOpacity>
          </View>
        </View>
      </WebLayout>
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  errorText: {
    fontSize: theme.fontSize.lg,
    color: theme.colors.error,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  retryButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },
  retryButtonText: {
    color: theme.colors.white,
    fontSize: theme.fontSize.md,
    fontWeight: '600',
  },
});
