// Dashboard Component - Comprehensive analytics, progress tracking, and gamification display
// Includes XP graphs, streak visualization, achievement showcase, and social features
// Mobile-safe UI with proper safe area handling and responsive design

import React, { useState, useEffect, useMemo, memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Dimensions,
  Platform,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
// Lazy loaded: react-native-safe-area-context
// Lazy loaded: expo-linear-gradient
import { theme } from '@/constants/theme';
import { useUnifiedAuth } from "@/hooks/useUnifiedAuth";
import useEnhancedGamification from "@/hooks/useEnhancedGamification";
import { useSpacedRepetition } from '@/hooks/useSpacedRepetition';
import { useErrorHandler } from '@/services/monitoring/centralizedErrorService';
// import {
//   LeaderboardEntry,
// } from '@/services/gamification/enhancedGamificationService';
import { Achievement, DailyChallenge } from '@/types';
import ErrorBoundary from './ErrorBoundary';
import { 
  LoadingSpinner, 
  SkeletonList, 
  SkeletonCard, 
  ErrorState, 
  EmptyState, 
} from './EnhancedLoadingStates';
import { useEnhancedErrorHandling } from '@/hooks/useEnhancedErrorHandling';
import {
  Trophy,
  Target,
  Flame,
  Star,
  Users,
  Calendar,
  TrendingUp,
  Award,
  Zap,
  BookOpen,
  Clock,
  BarChart3,
} from '@/components/icons/LucideReplacement';

// Get screen dimensions for responsive design
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Dashboard interfaces
interface DashboardStats {
  totalXP: number;
  level: number;
  streak: number;
  wordsLearned: number;
  lessonsCompleted: number;
  accuracy: number;
  studyTimeMinutes: number;
  achievements: Achievement[];
  badges: any[];
  dailyChallenges: DailyChallenge[];
  leaderboardPosition: number;
}

interface ProgressGraphData {
  date: string;
  xp: number;
  lessons: number;
  words: number;
}

// Main Dashboard Component
export const Dashboard: React.FC = () => {
  const { user, signIn, signOut, signUp, resetPassword, updateUser } = useUnifiedAuth();
  // const gamification = useGamification(); // Mock implementation
  const { getUIText } = useSpacedRepetition();
  const insets = useSafeAreaInsets();
  const { handleError } = useErrorHandler();
  const { handleError: handleEnhancedError, showSuccess, showWarning } = useEnhancedErrorHandling({
    showToast: true,
    enableHaptic: true,
    enableRetry: true,
  });
  
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [progressData, setProgressData] = useState<ProgressGraphData[]>([]);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'week' | 'month' | 'year'>('week');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load dashboard data
  useEffect(() => {
    loadDashboardData();
  }, [user?.id]);

  const loadDashboardData = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      
      // Load user stats (mock data for now)
      const userStats = {
        totalXP: 1250,
        level: 5,
        streak: 7,
        wordsLearned: 156,
        lessonsCompleted: 23,
        accuracy: 87,
        studyTimeMinutes: 420,
        achievements: [],
        badges: [],
        dailyChallenges: [],
      };
      const leaderboardData: any[] = [];
      
      // Find user position in leaderboard
      const userPosition = leaderboardData.findIndex((entry: any) => entry.userId === user?.id) + 1;
      
      setStats({
        totalXP: userStats.totalXP,
        level: userStats.level,
        streak: userStats.streak,
        wordsLearned: userStats.wordsLearned,
        lessonsCompleted: userStats.lessonsCompleted,
        accuracy: userStats.accuracy,
        studyTimeMinutes: userStats.studyTimeMinutes,
        achievements: userStats.achievements,
        badges: userStats.badges,
        dailyChallenges: userStats.dailyChallenges,
        leaderboardPosition: userPosition || 0,
      });
      
      setLeaderboard(leaderboardData.slice(0, 10)); // Top 10
      
      // Generate mock progress data (in real app, this would come from analytics)
      generateProgressData();
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load dashboard data';
      setError(errorMessage);
      await handleEnhancedError(error as Error, 'api', {
        action: 'loadDashboardData',
        additionalData: { userId: user?.id },
      });
    } finally {
      setLoading(false);
    }
  };

  // Generate mock progress data for graphs
  const generateProgressData = () => {
    const data: ProgressGraphData[] = [];
    const days = selectedTimeframe === 'week' ? 7 : selectedTimeframe === 'month' ? 30 : 365;
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      data.push({
        date: date.toISOString().split('T')[0],
        xp: Math.floor(Math.random() * 100) + 20,
        lessons: Math.floor(Math.random() * 5) + 1,
        words: Math.floor(Math.random() * 15) + 5,
      });
    }
    
    setProgressData(data);
  };

  // Calculate level progress
  const levelProgress = useMemo(() => {
    if (!stats) return { progress: 0, currentLevelXP: 0, nextLevelXP: 100 };
    
    const baseXP = 100;
    const multiplier = 1.2;
    let totalXPForCurrentLevel = 0;
    
    for (let i = 1; i < stats.level; i++) {
      totalXPForCurrentLevel += Math.floor(baseXP * Math.pow(multiplier, i - 1));
    }
    
    const nextLevelXP = Math.floor(baseXP * Math.pow(multiplier, stats.level - 1));
    const currentLevelXP = stats.totalXP - totalXPForCurrentLevel;
    const progress = (currentLevelXP / nextLevelXP) * 100;
    
    return {
      progress: Math.min(100, progress),
      currentLevelXP,
      nextLevelXP,
    };
  }, [stats]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <LoadingSpinner 
          size="large" 
          text={getUIText('dashboard.loading')}
          containerStyle={styles.loadingContainer}
        />
      </SafeAreaView>
    );
  }

  if (error || !stats) {
    return (
      <SafeAreaView style={styles.container}>
        <ErrorState
          title="Failed to load dashboard"
          message={error || 'Unable to load your dashboard data. Please try again.'}
          onRetry={() => {
            setError(null);
            loadDashboardData();
          }}
          onGoHome={() => {
            // Navigate to home or refresh
            setError(null);
            loadDashboardData();
          }}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: insets.bottom + theme.spacing.xl,
        }}
      >
        {/* Header Section */}
        <View style={styles.header}>
          <Text style={styles.welcomeText}>
            {getUIText('dashboard.welcome')}, {user?.name || 'Learner'}!
          </Text>
          <Text style={styles.subtitleText}>
            {getUIText('dashboard.subtitle')}
          </Text>
        </View>

        {/* Stats Overview Cards */}
        <View style={styles.statsGrid}>
          <StatsCard
            icon={<Trophy size={24} color={theme.colors.primary} />}
            title={getUIText('dashboard.level')}
            value={stats.level.toString()}
            subtitle={`${Math.round(levelProgress.progress)}% ${getUIText('dashboard.to_next_level')}`}
            gradient={['#FF6B6B', '#FF8E53']}
          />
          
          <StatsCard
            icon={<Flame size={24} color={theme.colors.warning} />}
            title={getUIText('dashboard.streak')}
            value={stats.streak.toString()}
            subtitle={getUIText('dashboard.days')}
            gradient={['#FF9500', '#FF5722']}
          />
          
          <StatsCard
            icon={<Star size={24} color={theme.colors.success} />}
            title={getUIText('dashboard.total_xp')}
            value={stats.totalXP.toLocaleString()}
            subtitle={getUIText('dashboard.points')}
            gradient={['#4CAF50', '#8BC34A']}
          />
          
          <StatsCard
            icon={<Target size={24} color={theme.colors.secondary} />}
            title={getUIText('dashboard.accuracy')}
            value={`${Math.round(stats.accuracy)}%`}
            subtitle={getUIText('dashboard.average')}
            gradient={['#2196F3', '#03DAC6']}
          />
        </View>

        {/* Progress Graph Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {getUIText('dashboard.progress_overview')}
            </Text>
            <View style={styles.timeframeSelector}>
              {(['week', 'month', 'year'] as const).map((timeframe) => (
                <Pressable
                  key={timeframe}
                  style={[
                    styles.timeframeButton,
                    selectedTimeframe === timeframe && styles.timeframeButtonActive,
                  ]}
                  onPress={() => {
                    setSelectedTimeframe(timeframe);
                    generateProgressData();
                  }}
                >
                  <Text style={[
                    styles.timeframeButtonText,
                    selectedTimeframe === timeframe && styles.timeframeButtonTextActive,
                  ]}>
                    {getUIText(`dashboard.${timeframe}`)}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
          
          <ProgressGraph data={progressData} timeframe={selectedTimeframe} />
        </View>

        {/* Learning Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {getUIText('dashboard.learning_stats')}
          </Text>
          
          <View style={styles.learningStatsGrid}>
            <LearningStatItem
              icon={<BookOpen size={20} color={theme.colors.primary} />}
              label={getUIText('dashboard.lessons_completed')}
              value={stats.lessonsCompleted}
            />
            
            <LearningStatItem
              icon={<Zap size={20} color={theme.colors.warning} />}
              label={getUIText('dashboard.words_learned')}
              value={stats.wordsLearned}
            />
            
            <LearningStatItem
              icon={<Clock size={20} color={theme.colors.secondary} />}
              label={getUIText('dashboard.study_time')}
              value={`${Math.round(stats.studyTimeMinutes / 60)}h`}
            />
            
            <LearningStatItem
              icon={<Users size={20} color={theme.colors.success} />}
              label={getUIText('dashboard.leaderboard_rank')}
              value={stats.leaderboardPosition > 0 ? `#${stats.leaderboardPosition}` : '-'}
            />
          </View>
        </View>

        {/* Daily Challenges */}
        {stats.dailyChallenges.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {getUIText('dashboard.daily_challenges')}
            </Text>
            
            {stats.dailyChallenges.map((challenge) => (
              <DailyChallengeCard key={challenge.id} challenge={challenge} />
            ))}
          </View>
        )}

        {/* Recent Achievements */}
        {stats.achievements.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {getUIText('dashboard.recent_achievements')}
            </Text>
            
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.achievementsContainer}
            >
              {stats.achievements.slice(-5).map((achievement) => (
                <AchievementCard key={achievement.id} achievement={achievement} />
              ))}
            </ScrollView>
          </View>
        )}

        {/* Leaderboard Preview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {getUIText('dashboard.leaderboard')}
          </Text>
          
          {leaderboard.slice(0, 5).map((entry, index) => (
            <LeaderboardItem key={entry.userId} entry={entry} rank={index + 1} />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// Stats Card Component
const StatsCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  value: string;
  subtitle: string;
  gradient: string[];
}> = ({ icon, title, value, subtitle, gradient }) => {
  return (
    <View style={styles.statsCard}>
      <LinearGradient
        colors={gradient as any}
        style={styles.statsCardGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.statsCardContent}>
          <View style={styles.statsCardIcon}>
            <Text>{icon}</Text>
          </View>
          <Text style={styles.statsCardTitle}>{title}</Text>
          <Text style={styles.statsCardValue}>{value}</Text>
          <Text style={styles.statsCardSubtitle}>{subtitle}</Text>
        </View>
      </LinearGradient>
    </View>
  );
};

// Progress Graph Component (simplified version)
const ProgressGraph: React.FC<{
  data: ProgressGraphData[];
  timeframe: 'week' | 'month' | 'year';
}> = ({ data, timeframe }) => {
  const maxXP = Math.max(...data.map(d => d.xp));
  
  return (
    <View style={styles.progressGraph}>
      <View style={styles.graphContainer}>
        {data.map((point, index) => {
          const height = (point.xp / maxXP) * 120;
          return (
            <View key={index} style={styles.graphBar}>
              <View 
                style={[
                  styles.graphBarFill,
                  { height },
                ]}
              />
              {timeframe === 'week' && (
                <Text style={styles.graphLabel}>
                  {new Date(point.date).toLocaleDateString('en', { weekday: 'short' })}
                </Text>
              )}
            </View>
          );
        })}
      </View>
      
      <View style={styles.graphLegend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: theme.colors.primary }]} />
          <Text style={styles.legendText}>XP Earned</Text>
        </View>
      </View>
    </View>
  );
};

// Learning Stat Item Component
const LearningStatItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string | number;
}> = ({ icon, label, value }) => {
  return (
    <View style={styles.learningStatItem}>
      <View style={styles.learningStatIcon}>
        <Text>{icon}</Text>
      </View>
      <Text style={styles.learningStatLabel}>{label}</Text>
      <Text style={styles.learningStatValue}>{value}</Text>
    </View>
  );
};

// Daily Challenge Card Component
const DailyChallengeCard: React.FC<{
  challenge: DailyChallenge;
}> = ({ challenge }) => {
  const { getUIText } = useSpacedRepetition();
  const progress = (challenge.progress / challenge.goal) * 100;
  
  return (
    <View style={styles.challengeCard}>
      <View style={styles.challengeHeader}>
        <Text style={styles.challengeTitle}>
          {getUIText(challenge.title as any) || challenge.title.en}
        </Text>
        <View style={[
          styles.challengeDifficulty,
          { backgroundColor: 
            challenge.difficulty === 'easy' ? theme.colors.success :
            challenge.difficulty === 'medium' ? theme.colors.warning :
            theme.colors.error,
          },
        ]}>
          <Text style={styles.challengeDifficultyText}>
            {challenge.difficulty.toUpperCase()}
          </Text>
        </View>
      </View>
      
      <Text style={styles.challengeDescription}>
        {getUIText(challenge.description as any) || challenge.description.en}
      </Text>
      
      <View style={styles.challengeProgress}>
        <View style={styles.challengeProgressBar}>
          <View 
            style={[
              styles.challengeProgressFill,
              { width: `${progress}%` },
            ]}
          />
        </View>
        <Text style={styles.challengeProgressText}>
          {challenge.progress}/{challenge.goal}
        </Text>
      </View>
      
      <View style={styles.challengeReward}>
        <Text style={styles.challengeRewardText}>
          {getUIText('dashboard.reward')}: {challenge.reward.xp} XP, {challenge.reward.coins} coins
        </Text>
      </View>
    </View>
  );
};

// Achievement Card Component
const AchievementCard: React.FC<{
  achievement: Achievement;
}> = ({ achievement }) => {
  return (
    <View style={styles.achievementCard}>
      <Text style={styles.achievementIcon}>{achievement.icon}</Text>
      <Text style={styles.achievementTitle}>{achievement.title}</Text>
      <Text style={styles.achievementDescription}>{achievement.description}</Text>
    </View>
  );
};

// Leaderboard Item Component
const LeaderboardItem: React.FC<{
  entry: any;
  rank: number;
}> = ({ entry, rank }) => {
  return (
    <View style={styles.leaderboardItem as any}>
      <View style={styles.leaderboardRank as any}>
        <Text style={styles.leaderboardRankText as any}>#{rank}</Text>
      </View>
      
      <Text style={styles.leaderboardAvatar as any}>{entry.avatar}</Text>
      
      <View style={styles.leaderboardInfo as any}>
        <Text style={styles.leaderboardName as any}>{entry.username}</Text>
        <Text style={styles.leaderboardLevel as any}>Level {entry.level}</Text>
      </View>
      
      <View style={styles.leaderboardStats as any}>
        <Text style={styles.leaderboardXP as any}>{entry.totalXP.toLocaleString()} XP</Text>
        <View style={styles.leaderboardStreak as any}>
          <Flame size={12} color={theme.colors.warning} />
          <Text style={styles.leaderboardStreakText as any}>{entry.streak}</Text>
        </View>
      </View>
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: theme.fontSize.lg,
    color: theme.colors.textSecondary,
  },
  header: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
  },
  welcomeText: {
    fontSize: theme.fontSize.xxl,
    fontWeight: '700' as const,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  subtitleText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  statsCard: {
    width: (screenWidth - theme.spacing.lg * 2 - theme.spacing.md) / 2,
    height: 120,
    borderRadius: 16,
    overflow: 'hidden',
  },
  statsCardGradient: {
    flex: 1,
    padding: theme.spacing.md,
  },
  statsCardContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  statsCardIcon: {
    alignSelf: 'flex-start',
  },
  statsCardTitle: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.white,
    opacity: 0.9,
  },
  statsCardValue: {
    fontSize: theme.fontSize.xl,
    fontWeight: '700' as const,
    color: theme.colors.white,
  },
  statsCardSubtitle: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.white,
    opacity: 0.8,
  },
  section: {
    marginTop: theme.spacing.xl,
    paddingHorizontal: theme.spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: '600' as const,
    color: theme.colors.text,
  },
  timeframeSelector: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    borderRadius: 8,
    padding: 2,
  },
  timeframeButton: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: 6,
  },
  timeframeButtonActive: {
    backgroundColor: theme.colors.primary,
  },
  timeframeButtonText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  timeframeButtonTextActive: {
    color: theme.colors.white,
    fontWeight: '500' as const,
  },
  progressGraph: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: theme.spacing.lg,
  },
  graphContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 140,
    gap: 4,
  },
  graphBar: {
    flex: 1,
    alignItems: 'center',
  },
  graphBarFill: {
    backgroundColor: theme.colors.primary,
    width: '80%',
    borderRadius: 2,
    minHeight: 4,
  },
  graphLabel: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  graphLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: theme.spacing.md,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 2,
  },
  legendText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  learningStatsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
  },
  learningStatItem: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: theme.spacing.md,
    width: (screenWidth - theme.spacing.lg * 2 - theme.spacing.md) / 2,
    alignItems: 'center',
  },
  learningStatIcon: {
    marginBottom: theme.spacing.sm,
  },
  learningStatLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.xs,
  },
  learningStatValue: {
    fontSize: theme.fontSize.lg,
    fontWeight: '600' as const,
    color: theme.colors.text,
  },
  challengeCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  challengeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  challengeTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: '600' as const,
    color: theme.colors.text,
    flex: 1,
  },
  challengeDifficulty: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: 4,
  },
  challengeDifficultyText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.white,
    fontWeight: '600' as const,
  },
  challengeDescription: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
  },
  challengeProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  challengeProgressBar: {
    flex: 1,
    height: 8,
    backgroundColor: theme.colors.background,
    borderRadius: 4,
    overflow: 'hidden',
  },
  challengeProgressFill: {
    height: '100%',
    backgroundColor: theme.colors.primary,
    borderRadius: 4,
  },
  challengeProgressText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text,
    fontWeight: '500' as const,
  },
  challengeReward: {
    alignItems: 'center',
  },
  challengeRewardText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.primary,
    fontWeight: '500' as const,
  },
  achievementsContainer: {
    paddingRight: theme.spacing.lg,
  },
  achievementCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: theme.spacing.md,
    width: 120,
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  achievementIcon: {
    fontSize: 32,
    marginBottom: theme.spacing.sm,
  },
  achievementTitle: {
    fontSize: theme.fontSize.sm,
    fontWeight: '600' as const,
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.xs,
  },
  achievementDescription: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  leaderboardRank: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  leaderboardRankText: {
    fontSize: theme.fontSize.sm,
    fontWeight: '600' as const,
    color: theme.colors.white,
  },
  leaderboardAvatar: {
    fontSize: 24,
    marginRight: theme.spacing.md,
  },
  leaderboardInfo: {
    flex: 1,
  },
  leaderboardName: {
    fontSize: theme.fontSize.md,
    fontWeight: '500' as const,
    color: theme.colors.text,
  },
  leaderboardLevel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  leaderboardStats: {
    alignItems: 'flex-end',
  },
  leaderboardXP: {
    fontSize: theme.fontSize.sm,
    fontWeight: '600' as const,
    color: theme.colors.primary,
  },
  leaderboardStreak: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginTop: 2,
  },
  leaderboardStreakText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.warning,
    fontWeight: '500' as const,
  },
});

// Export with error boundary wrapper
export const DashboardWithErrorBoundary: React.FC = () => {
  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        console.error('Dashboard error:', error, errorInfo);
      }}
    >
      <Dashboard />
    </ErrorBoundary>
  );
};

export default memo(Dashboard);

Dashboard.displayName = 'Dashboard';
