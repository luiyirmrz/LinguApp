import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
  Animated,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { theme } from '@/constants/theme';
import { useI18n } from '@/hooks/useI18n';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';
import { useGameState } from '@/hooks/useGameState';
import useEnhancedGamification from "@/hooks/useEnhancedGamification";
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { ProgressBar } from '@/components/ProgressBar';
import { Badge } from '@/components/Badge';
import { 
  User as UserIcon, 
  Settings as SettingsIcon, 
  Edit as EditIcon, 
  Trophy as TrophyIcon, 
  Star as StarIcon, 
  Flame as FlameIcon,
  Target as TargetIcon,
  BookOpen as BookOpenIcon,
  Clock as ClockIcon,
  Award as AwardIcon,
  Calendar as CalendarIcon,
  Globe as GlobeIcon,
  Bell as BellIcon,
  Heart as HeartIcon,
  Gem as GemIcon,
  TrendingUp as TrendingUpIcon,
  BarChart3 as BarChart3Icon,
  Camera as CameraIcon,
  Share as ShareIcon,
  LogOut as LogOutIcon,
} from '@/components/icons/LucideReplacement';
import { User, Language, Achievement } from '@/types';

const { width } = Dimensions.get('window');

interface ProfileStats {
  totalXP: number;
  level: number;
  streak: number;
  wordsLearned: number;
  lessonsCompleted: number;
  accuracy: number;
  studyTimeMinutes: number;
  achievements: Achievement[];
  weeklyProgress: number;
  monthlyProgress: number;
  rank: number;
  league: string;
}

interface ActivityItem {
  id: string;
  type: 'lesson' | 'vocabulary' | 'achievement' | 'streak' | 'level_up';
  title: string;
  description: string;
  timestamp: Date;
  xpEarned?: number;
  icon: string;
  color: string;
}

interface UserProfileScreenProps {
  onEditProfile?: () => void;
  onSettings?: () => void;
  onShareProfile?: () => void;
}

export default function UserProfileScreen({
  onEditProfile,
  onSettings,
  onShareProfile,
}: UserProfileScreenProps) {
  const { t } = useI18n();
  const router = useRouter();
  const { user, signIn, signOut, signUp, resetPassword, updateUser } = useUnifiedAuth();
  const { getUserProgress } = useGameState();
  const { awardXP, completeLesson, acceptChallenge, createChallenge, generateDailyChallenges, refreshStats } = useEnhancedGamification();

  const [profileStats, setProfileStats] = useState<ProfileStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [animationValue] = useState(new Animated.Value(0));

  useEffect(() => {
    loadProfileData();
    animateProfile();
  }, []);

  const animateProfile = () => {
    Animated.timing(animationValue, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  };

  const loadProfileData = async () => {
    try {
      setLoading(true);
      
      if (!user) return;

      const userLevel = 1; // Mock implementation
      const userXP = 0; // Mock implementation
      const userStreak = 0; // Mock implementation
      const userAchievements: any[] = []; // Mock implementation
      const userProgress = await getUserProgress(user.id);

      // Calculate comprehensive statistics
      const stats: ProfileStats = {
        totalXP: userXP,
        level: userLevel,
        streak: userStreak || 0,
        wordsLearned: userProgress.wordsLearned || 0,
        lessonsCompleted: userProgress.lessonsCompleted || 0,
        accuracy: userProgress.averageAccuracy || 0,
        studyTimeMinutes: userProgress.studyTimeMinutes || 0,
        achievements: userAchievements,
        weeklyProgress: userProgress.weeklyProgress || 0,
        monthlyProgress: userProgress.monthlyProgress || 0,
        rank: userProgress.rank || 0,
        league: userProgress.league || 'Bronze',
      };

      setProfileStats(stats);

      // Generate recent activity
      const activity = generateRecentActivity(userProgress, userAchievements);
      setRecentActivity(activity);

    } catch (error) {
      console.error('Error loading profile data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateRecentActivity = (userProgress: any, achievements: Achievement[]): ActivityItem[] => {
    const activities: ActivityItem[] = [];

    // Add recent lessons
    if (userProgress.recentLessons) {
      userProgress.recentLessons.slice(0, 3).forEach((lesson: any) => {
        activities.push({
          id: `lesson_${lesson.id}`,
          type: 'lesson',
          title: 'Lesson Completed',
          description: lesson.title,
          timestamp: new Date(lesson.completedAt),
          xpEarned: lesson.xpEarned,
          icon: 'book-open',
          color: theme.colors.primary,
        });
      });
    }

    // Add recent achievements
    achievements.slice(0, 2).forEach((achievement) => {
      activities.push({
        id: `achievement_${achievement.id}`,
        type: 'achievement',
        title: 'Achievement Unlocked',
        description: achievement.title,
        timestamp: new Date(achievement.unlockedAt || new Date()),
        xpEarned: achievement.points || 0,
        icon: 'award',
        color: theme.colors.warning,
      });
    });

    // Add level up if recent
    if (userProgress.recentLevelUp) {
      activities.push({
        id: 'level_up',
        type: 'level_up',
        title: 'Level Up!',
        description: `Reached level ${userProgress.currentLevel}`,
        timestamp: new Date(userProgress.levelUpDate),
        xpEarned: 100,
        icon: 'trending-up',
        color: theme.colors.success,
      });
    }

    // Sort by timestamp and take latest 5
    return activities
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 5);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProfileData();
    setRefreshing(false);
  };

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
              router.replace('/(auth)/welcome');
            } catch (error) {
              console.error('Sign out error:', error);
            }
          },
        },
      ],
    );
  };

  const getActivityIcon = (icon: string) => {
    switch (icon) {
      case 'book-open':
        return <BookOpenIcon size={20} color={theme.colors.primary} />;
      case 'award':
        return <AwardIcon size={20} color={theme.colors.warning} />;
      case 'trending-up':
        return <TrendingUpIcon size={20} color={theme.colors.success} />;
      case 'flame':
        return <FlameIcon size={20} color={theme.colors.warning} />;
      case 'star':
        return <StarIcon size={20} color={theme.colors.warning} />;
      default:
        return <TrophyIcon size={20} color={theme.colors.primary} />;
    }
  };

  const formatTimeAgo = (date: Date): string => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const renderStatsCard = (title: string, value: string | number, icon: React.ReactNode, color: string) => (
    <Animated.View
      style={[
        styles.statsCard,
        {
          transform: [{
            scale: animationValue.interpolate({
              inputRange: [0, 1],
              outputRange: [0.8, 1],
            }),
          }],
          opacity: animationValue,
        },
      ]}
    >
      <Card style={styles.statsCardContent}>
        <View style={[styles.statsIcon, { backgroundColor: color }]}>
          {icon}
        </View>
        <Text style={styles.statsValue}>{value}</Text>
        <Text style={styles.statsLabel}>{title}</Text>
      </Card>
    </Animated.View>
  );

  const renderActivityItem = (activity: ActivityItem) => (
    <View key={activity.id} style={styles.activityItem}>
      <View style={[styles.activityIcon, { backgroundColor: activity.color }]}>
        {getActivityIcon(activity.icon)}
      </View>
      <View style={styles.activityContent}>
        <Text style={styles.activityTitle}>{activity.title}</Text>
        <Text style={styles.activityDescription}>{activity.description}</Text>
        <Text style={styles.activityTime}>{formatTimeAgo(activity.timestamp)}</Text>
      </View>
      {activity.xpEarned && (
        <View style={styles.activityXP}>
          <Text style={styles.activityXPText}>+{activity.xpEarned} XP</Text>
        </View>
      )}
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!profileStats || !user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Failed to load profile</Text>
          <Button title="Retry" onPress={loadProfileData} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <LinearGradient
          colors={[theme.colors.primary, theme.colors.primaryDark]}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <View style={styles.headerTop}>
              <Text style={styles.headerTitle}>Profile</Text>
              <View style={styles.headerActions}>
                <TouchableOpacity
                  style={styles.headerAction}
                  onPress={onShareProfile}
                >
                  <ShareIcon size={24} color={theme.colors.white} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.headerAction}
                  onPress={onSettings}
                >
                  <SettingsIcon size={24} color={theme.colors.white} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </LinearGradient>

        {/* Profile Card */}
        <Card style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <TouchableOpacity style={styles.avatarContainer} onPress={onEditProfile}>
              <View style={styles.avatar}>
                {user.photoURL ? (
                  <Text style={styles.avatarText}>📷</Text>
                ) : (
                  <UserIcon size={40} color={theme.colors.primary} />
                )}
              </View>
              <View style={styles.editAvatarButton}>
                <CameraIcon size={16} color={theme.colors.white} />
              </View>
            </TouchableOpacity>
            
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{user.name || 'User'}</Text>
              <Text style={styles.profileEmail}>{user.email}</Text>
              <View style={styles.profileBadges}>
                <Badge
                  text={`Level ${profileStats.level}`}
                  color={theme.colors.primary}
                  size="small"
                />
                <Badge
                  text={profileStats.league}
                  color={theme.colors.warning}
                  size="small"
                />
              </View>
            </View>
          </View>

          <View style={styles.levelProgress}>
            <View style={styles.levelProgressHeader}>
              <Text style={styles.levelProgressLabel}>Progress to Level {profileStats.level + 1}</Text>
              <Text style={styles.levelProgressValue}>
                {profileStats.totalXP % 1000}/1000 XP
              </Text>
            </View>
            <ProgressBar
              progress={((profileStats.totalXP % 1000) / 1000) * 100}
              height={8}
              color={theme.colors.primary}
            />
          </View>
        </Card>

        {/* Statistics */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Statistics</Text>
          <View style={styles.statsGrid}>
            {renderStatsCard('Total XP', profileStats.totalXP.toLocaleString(), <StarIcon size={20} color={theme.colors.white} />, theme.colors.warning)}
            {renderStatsCard('Streak', `${profileStats.streak} days`, <FlameIcon size={20} color={theme.colors.white} />, theme.colors.danger)}
            {renderStatsCard('Lessons', profileStats.lessonsCompleted, <BookOpenIcon size={20} color={theme.colors.white} />, theme.colors.primary)}
            {renderStatsCard('Words', profileStats.wordsLearned, <TargetIcon size={20} color={theme.colors.white} />, theme.colors.success)}
            {renderStatsCard('Accuracy', `${Math.round(profileStats.accuracy)}%`, <BarChart3Icon size={20} color={theme.colors.white} />, theme.colors.info)}
            {renderStatsCard('Study Time', `${Math.round(profileStats.studyTimeMinutes / 60)}h`, <ClockIcon size={20} color={theme.colors.white} />, theme.colors.gray[600])}
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.activitySection}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <View style={styles.activityList}>
            {recentActivity.map(renderActivityItem)}
          </View>
        </View>

        {/* Achievements Preview */}
        <View style={styles.achievementsSection}>
          <Text style={styles.sectionTitle}>Recent Achievements</Text>
          <View style={styles.achievementsGrid}>
            {profileStats.achievements.slice(0, 4).map((achievement) => (
              <View key={achievement.id} style={styles.achievementItem}>
                <View style={styles.achievementIcon}>
                  <AwardIcon size={24} color={theme.colors.warning} />
                </View>
                <Text style={styles.achievementTitle} numberOfLines={2}>
                  {achievement.title}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={onEditProfile}
            >
              <EditIcon size={24} color={theme.colors.primary} />
              <Text style={styles.actionText}>Edit Profile</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.actionButton}
              onPress={onSettings}
            >
              <SettingsIcon size={24} color={theme.colors.primary} />
              <Text style={styles.actionText}>Settings</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => router.push('/(tabs)/leaderboard')}
            >
              <TrophyIcon size={24} color={theme.colors.warning} />
              <Text style={styles.actionText}>Leaderboard</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleSignOut}
            >
              <LogOutIcon size={24} color={theme.colors.danger} />
              <Text style={styles.actionText}>Sign Out</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: theme.fontSize.lg,
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
    marginBottom: theme.spacing.lg,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.xl,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  headerTitle: {
    fontSize: theme.fontSize.xxl,
    fontWeight: 'bold',
    color: theme.colors.white,
  },
  headerActions: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  headerAction: {
    padding: theme.spacing.sm,
  },
  profileCard: {
    margin: theme.spacing.lg,
    marginTop: -theme.spacing.xl,
    padding: theme.spacing.lg,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: theme.spacing.lg,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 32,
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.colors.white,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: theme.fontSize.xl,
    fontWeight: 'bold',
    color: theme.colors.black,
    marginBottom: theme.spacing.xs,
  },
  profileEmail: {
    fontSize: theme.fontSize.md,
    color: theme.colors.gray[600],
    marginBottom: theme.spacing.sm,
  },
  profileBadges: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  levelProgress: {
    marginTop: theme.spacing.md,
  },
  levelProgressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  levelProgressLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.gray[600],
  },
  levelProgressValue: {
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  statsSection: {
    padding: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: '600',
    color: theme.colors.black,
    marginBottom: theme.spacing.lg,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
  },
  statsCard: {
    flex: 1,
    minWidth: '45%',
  },
  statsCardContent: {
    padding: theme.spacing.md,
    alignItems: 'center',
  },
  statsIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  statsValue: {
    fontSize: theme.fontSize.lg,
    fontWeight: 'bold',
    color: theme.colors.black,
    marginBottom: theme.spacing.xs,
  },
  statsLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.gray[600],
  },
  activitySection: {
    padding: theme.spacing.lg,
  },
  activityList: {
    gap: theme.spacing.md,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.gray[50],
    borderRadius: theme.borderRadius.lg,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: '600',
    color: theme.colors.black,
    marginBottom: theme.spacing.xs,
  },
  activityDescription: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.gray[600],
    marginBottom: theme.spacing.xs,
  },
  activityTime: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.gray[500],
  },
  activityXP: {
    alignItems: 'center',
  },
  activityXPText: {
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
    color: theme.colors.warning,
  },
  achievementsSection: {
    padding: theme.spacing.lg,
  },
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
  },
  achievementItem: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.gray[50],
    borderRadius: theme.borderRadius.lg,
  },
  achievementIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: theme.colors.warningLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  achievementTitle: {
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
    color: theme.colors.black,
    textAlign: 'center',
  },
  actionsSection: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
  },
  actionButton: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.gray[50],
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.gray[200],
  },
  actionText: {
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
    color: theme.colors.black,
    marginTop: theme.spacing.sm,
  },
});
