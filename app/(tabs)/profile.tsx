import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { theme } from '@/constants/theme';
import { useRouter } from 'expo-router';
import { Button } from '@/components/Button';
import { Award, Calendar, Target, Settings, User, Globe, Shield } from '@/components/icons/LucideReplacement';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';
import { useLanguage } from '@/hooks/useLanguage';
// TODO: Implement safe versions of useGamification and useLearning
// import { useGamification, useLearning } from '@/store/unifiedStore';
import { OptimizedErrorBoundary } from '@/components/PerformanceOptimized';
import AdminDashboard from '@/components/AdminDashboard';

export default function ProfileScreen() {
  const router = useRouter();
  
  // Use safe hooks
  const { user, signOut } = useUnifiedAuth();
  const { availableLanguages } = useLanguage();
  
  // Admin dashboard state
  const [showAdminDashboard, setShowAdminDashboard] = useState(false);
  
  // Mock data for gamification and learning (temporarily)
  const level = 5;
  const points = 1250;
  const earnedAchievements = ['first_lesson', 'week_streak', 'level_3'];
  const progress = { currentStreak: 7, totalLessons: 25, completedLessons: 18 };

  // Computed user data
  const userData = useMemo(() => ({
    name: user?.name || 'Demo User',
    email: user?.email || process.env.EXPO_PUBLIC_TEST_EMAIL_1 || 'demo@localhost.dev',
    level: level || 3,
    streak: progress.currentStreak || 7,
    totalXP: points || 1250,
    languages: availableLanguages.map(lang => lang.name) || ['Spanish', 'French'],
    isAdmin: user?.role === 'admin' || user?.email?.includes('admin') || __DEV__,
    achievements: [
      { id: 'first_lesson', name: 'First Lesson', description: 'Completed your first lesson', earned: earnedAchievements.includes('first_lesson') },
      { id: 'week_streak', name: 'Week Warrior', description: '7 day streak', earned: earnedAchievements.includes('week_streak') },
      { id: 'level_3', name: 'Level 3', description: 'Reached level 3', earned: earnedAchievements.includes('level_3') },
      { id: 'perfect_week', name: 'Perfect Week', description: 'Complete 7 lessons in a week', earned: earnedAchievements.includes('perfect_week') },
    ],
  }), [user, level, points, earnedAchievements, progress.currentStreak, availableLanguages]);

  const handleSignOut = useCallback(async () => {
    try {
      await signOut();
      router.replace('/(auth)/welcome');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  }, [signOut, router]);

  const renderAchievement = useCallback((achievement: any) => (
    <View 
      key={achievement.id}
      style={[
        styles.achievementCard,
        !achievement.earned && styles.lockedAchievement,
      ]}
    >
      <View style={styles.achievementIcon}>
        <Award 
          size={20} 
          color={achievement.earned ? theme.colors.primary : theme.colors.gray[400]} 
        />
      </View>
      <View style={styles.achievementContent}>
        <Text style={[
          styles.achievementName,
          !achievement.earned && styles.lockedText,
        ]}>
          {achievement.name}
        </Text>
        <Text style={[
          styles.achievementDescription,
          !achievement.earned && styles.lockedText,
        ]}>
          {achievement.description}
        </Text>
      </View>
    </View>
  ), []);

  return (
    <OptimizedErrorBoundary>
      <SafeAreaView style={styles.container}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
          <TouchableOpacity 
            style={styles.settingsButton}
            onPress={() => {/* Settings functionality */}}
          >
            <Settings size={24} color={theme.colors.text} />
          </TouchableOpacity>
        </View>

        {/* User Info */}
        <View style={styles.userCard}>
          <View style={styles.avatar}>
            <User size={40} color={theme.colors.primary} />
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{userData.name}</Text>
            <Text style={styles.userEmail}>{userData.email}</Text>
            <Text style={styles.userLevel}>Level {userData.level}</Text>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Your Stats</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Calendar size={24} color={theme.colors.orange} />
              <Text style={styles.statValue}>{userData.streak}</Text>
              <Text style={styles.statLabel}>Day Streak</Text>
            </View>
            
            <View style={styles.statCard}>
              <Target size={24} color={theme.colors.primary} />
              <Text style={styles.statValue}>{userData.totalXP}</Text>
              <Text style={styles.statLabel}>Total XP</Text>
            </View>
            
            <View style={styles.statCard}>
              <Globe size={24} color={theme.colors.blue} />
              <Text style={styles.statValue}>{userData.languages.length}</Text>
              <Text style={styles.statLabel}>Languages</Text>
            </View>
          </View>
        </View>

        {/* Languages */}
        <View style={styles.languagesSection}>
          <Text style={styles.sectionTitle}>Learning Languages</Text>
          <View style={styles.languagesList}>
            {userData.languages.map((language, index) => (
              <View key={index} style={styles.languageItem}>
                <Text style={styles.languageName}>{language}</Text>
                <Text style={styles.languageLevel}>Beginner</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Achievements */}
        <View style={styles.achievementsSection}>
          <Text style={styles.sectionTitle}>Achievements</Text>
          <View style={styles.achievementsList}>
            {userData.achievements.map(renderAchievement)}
          </View>
        </View>

        {/* Admin Dashboard Access */}
        {userData.isAdmin && (
          <View style={styles.adminSection}>
            <Text style={styles.sectionTitle}>Administration</Text>
            <TouchableOpacity 
              style={styles.adminButton}
              onPress={() => setShowAdminDashboard(true)}
            >
              <Shield size={20} color={theme.colors.primary} />
              <Text style={styles.adminButtonText}>Admin Dashboard</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Actions */}
        <View style={styles.actionsSection}>
          <Button
            title="Sign Out"
            onPress={handleSignOut}
            variant="outline"
            style={styles.signOutButton}
          />
        </View>
        </ScrollView>

        {/* Admin Dashboard Modal */}
        <AdminDashboard 
          visible={showAdminDashboard}
          onClose={() => setShowAdminDashboard(false)}
        />
      </SafeAreaView>
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
  title: {
    fontSize: theme.fontSize.xxl,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  settingsButton: {
    padding: theme.spacing.sm,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    margin: theme.spacing.lg,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: theme.fontSize.lg,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  userEmail: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  userLevel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.primary,
    fontWeight: '600',
    marginTop: theme.spacing.xs,
  },
  statsSection: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
  },
  statValue: {
    fontSize: theme.fontSize.lg,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginTop: theme.spacing.sm,
  },
  statLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  languagesSection: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  languagesList: {
    gap: theme.spacing.sm,
  },
  languageItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },
  languageName: {
    fontSize: theme.fontSize.md,
    fontWeight: '600',
    color: theme.colors.text,
  },
  languageLevel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  achievementsSection: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  achievementsList: {
    gap: theme.spacing.sm,
  },
  achievementCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },
  lockedAchievement: {
    opacity: 0.6,
  },
  achievementIcon: {
    marginRight: theme.spacing.md,
  },
  achievementContent: {
    flex: 1,
  },
  achievementName: {
    fontSize: theme.fontSize.md,
    fontWeight: '600',
    color: theme.colors.text,
  },
  achievementDescription: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  lockedText: {
    color: theme.colors.gray[400],
  },
  adminSection: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  adminButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    gap: theme.spacing.sm,
    borderWidth: 1,
    borderColor: `${theme.colors.primary  }20`,
  },
  adminButtonText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  actionsSection: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  signOutButton: {
    marginTop: theme.spacing.lg,
  },
});
