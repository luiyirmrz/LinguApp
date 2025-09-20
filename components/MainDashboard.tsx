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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { theme } from '@/constants/theme';
import { useI18n } from '@/hooks/useI18n';
import { useUnifiedAuth } from "@/hooks/useUnifiedAuth";
import { useGameState } from '@/hooks/useGameState';
import useEnhancedGamification from "@/hooks/useEnhancedGamification";
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { ProgressBar } from '@/components/ProgressBar';
import { Badge } from '@/components/Badge';
import { 
  TrophyIcon, 
  TargetIcon, 
  FlameIcon, 
  StarIcon, 
  HeartIcon, 
  GemIcon,
  TrendingUpIcon,
  AwardIcon,
  BookOpenIcon,
  ClockIcon,
  UsersIcon,
  CalendarIcon,
  ZapIcon,
  BarChart3Icon,
  SettingsIcon,
  GlobeIcon,
} from '@/components/icons/LucideReplacement';
// import { cefrLessonService } from '@/services/cefrLessonService';
// import { cefrVocabularyService } from '@/services/cefrVocabularyService';
import { MultilingualLesson, CEFRLevel, Achievement } from '@/types';

const { width } = Dimensions.get('window');

interface DashboardStats {
  totalXP: number;
  level: number;
  streak: number;
  wordsLearned: number;
  lessonsCompleted: number;
  accuracy: number;
  studyTimeMinutes: number;
  achievements: Achievement[];
  dailyChallenges: any[];
  leaderboardPosition: number;
  weeklyProgress: number;
  monthlyProgress: number;
}

interface ProgressData {
  level: CEFRLevel;
  progress: number;
  wordsLearned: number;
  lessonsCompleted: number;
  accuracy: number;
}

interface RecommendedLesson {
  lesson: MultilingualLesson;
  reason: string;
  priority: 'high' | 'medium' | 'low';
}

interface DailyChallenge {
  id: string;
  title: string;
  description: string;
  type: 'lesson' | 'vocabulary' | 'streak' | 'accuracy';
  target: number;
  current: number;
  reward: number;
  completed: boolean;
  expiresAt: Date;
}

export default function MainDashboard() {
  const { t } = useI18n();
  const router = useRouter();
  const { user, signIn, signOut, signUp, resetPassword, updateUser } = useUnifiedAuth();
  const { getUserProgress } = useGameState();
  // const { awardXP, completeLesson, acceptChallenge, createChallenge, generateDailyChallenges, refreshStats } = useEnhancedGamification();

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [progressData, setProgressData] = useState<ProgressData[]>([]);
  const [recommendedLessons, setRecommendedLessons] = useState<RecommendedLesson[]>([]);
  const [dailyChallenges, setDailyChallenges] = useState<DailyChallenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [animationValue] = useState(new Animated.Value(0));

  useEffect(() => {
    loadDashboardData();
    animateDashboard();
  }, []);

  const animateDashboard = () => {
    Animated.timing(animationValue, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  };

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      if (!user) return;

      // Load user statistics
      const userLevel = 1; // Mock implementation
      const userXP = 0; // Mock implementation
      const userStreak = 0; // Mock implementation
      const userAchievements: any[] = []; // Mock implementation
      const userProgress = await getUserProgress(user.id);

      // Calculate progress by CEFR level
      const levels: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2'];
      const progressByLevel: ProgressData[] = [];

      for (const level of levels) {
        const levelLessons: any[] = []; // Mock implementation
        const levelVocabulary: any[] = []; // Mock implementation
        
        const completedLessons = levelLessons.filter(lesson => 
          userProgress[lesson.id]?.completed,
        ).length;
        
        const learnedWords = levelVocabulary.filter(word => 
          userProgress[word.id]?.mastered,
        ).length;

        const accuracy = calculateLevelAccuracy(level, userProgress);

        progressByLevel.push({
          level,
          progress: (completedLessons / levelLessons.length) * 100,
          wordsLearned: learnedWords,
          lessonsCompleted: completedLessons,
          accuracy,
        });
      }

      // Generate recommended lessons
      const recommendations = generateRecommendedLessons(userProgress, userLevel);

      // Generate daily challenges
      const challenges = generateDailyChallenges(userProgress, userStreak);

      // Calculate overall statistics
      const totalWordsLearned = progressByLevel.reduce((sum, level) => sum + level.wordsLearned, 0);
      const totalLessonsCompleted = progressByLevel.reduce((sum, level) => sum + level.lessonsCompleted, 0);
      const overallAccuracy = progressByLevel.reduce((sum, level) => sum + level.accuracy, 0) / progressByLevel.length;

      setStats({
        totalXP: userXP,
        level: userLevel,
        streak: userStreak,
        wordsLearned: totalWordsLearned,
        lessonsCompleted: totalLessonsCompleted,
        accuracy: overallAccuracy,
        studyTimeMinutes: userProgress.studyTimeMinutes || 0,
        achievements: userAchievements,
        dailyChallenges: challenges,
        leaderboardPosition: userProgress.leaderboardPosition || 0,
        weeklyProgress: userProgress.weeklyProgress || 0,
        monthlyProgress: userProgress.monthlyProgress || 0,
      });

      setProgressData(progressByLevel);
      setRecommendedLessons(recommendations);
      setDailyChallenges(challenges);

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateLevelAccuracy = (level: CEFRLevel, userProgress: any): number => {
    const levelLessons: any[] = []; // Mock implementation
    const completedLessons = levelLessons.filter(lesson => 
      userProgress[lesson.id]?.completed,
    );
    
    if (completedLessons.length === 0) return 0;
    
    const totalAccuracy = completedLessons.reduce((sum, lesson) => 
      sum + (userProgress[lesson.id]?.accuracy || 0), 0,
    );
    
    return totalAccuracy / completedLessons.length;
  };

  const generateRecommendedLessons = (userProgress: any, userLevel: number): RecommendedLesson[] => {
    const allLessons: any[] = []; // Mock implementation
    const recommendations: RecommendedLesson[] = [];

    // Find lessons not yet completed
    const availableLessons = allLessons.filter((lesson: any) => 
      !userProgress[lesson.id]?.completed,
    );

    // Sort by difficulty and user level
    const sortedLessons = availableLessons.sort((a: any, b: any) => {
      const aDiff = Math.abs(a.difficulty - userLevel);
      const bDiff = Math.abs(b.difficulty - userLevel);
      return aDiff - bDiff;
    });

    // Take top 3 recommendations
    sortedLessons.slice(0, 3).forEach((lesson: any, index: number) => {
      let reason = '';
      let priority: 'high' | 'medium' | 'low' = 'medium';

      if (lesson.difficulty <= userLevel) {
        reason = 'Perfect for your level';
        priority = 'high';
      } else if (lesson.difficulty === userLevel + 1) {
        reason = 'Slightly challenging';
        priority = 'medium';
      } else {
        reason = 'Advanced challenge';
        priority = 'low';
      }

      recommendations.push({
        lesson,
        reason,
        priority,
      });
    });

    return recommendations;
  };

  const generateDailyChallenges = (userProgress: any, streak: number): DailyChallenge[] => {
    const challenges: DailyChallenge[] = [
      {
        id: 'daily_lesson',
        title: 'Complete a Lesson',
        description: 'Finish one lesson today',
        type: 'lesson',
        target: 1,
        current: userProgress.dailyLessonsCompleted || 0,
        reward: 50,
        completed: (userProgress.dailyLessonsCompleted || 0) >= 1,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
      {
        id: 'daily_vocabulary',
        title: 'Learn 5 Words',
        description: 'Master 5 new vocabulary words',
        type: 'vocabulary',
        target: 5,
        current: userProgress.dailyWordsLearned || 0,
        reward: 30,
        completed: (userProgress.dailyWordsLearned || 0) >= 5,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
      {
        id: 'daily_streak',
        title: 'Maintain Streak',
        description: 'Keep your learning streak alive',
        type: 'streak',
        target: streak + 1,
        current: streak,
        reward: 20,
        completed: streak > 0,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    ];

    return challenges;
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const getContentInLanguage = (content: any, language: string = 'en'): string => {
    if (typeof content === 'string') return content;
    return content[language] || content.en || '';
  };

  const getLevelColor = (level: CEFRLevel): string => {
    const colors = {
      A1: '#4CAF50',
      A2: '#2196F3',
      B1: '#FF9800',
      B2: '#F44336',
    };
    return colors[level as keyof typeof colors] || theme.colors.gray[500];
  };

  const getPriorityColor = (priority: 'high' | 'medium' | 'low'): string => {
    const colors = {
      high: theme.colors.success,
      medium: theme.colors.warning,
      low: theme.colors.gray[500],
    };
    return colors[priority];
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
        <View style={styles.statsCardHeader}>
          <View style={[styles.statsIcon, { backgroundColor: color }]}>
            {icon}
          </View>
          <Text style={styles.statsValue}>{value}</Text>
        </View>
        <Text style={styles.statsLabel}>{title}</Text>
      </Card>
    </Animated.View>
  );

  const renderProgressCard = (data: ProgressData) => (
    <Card key={data.level} style={styles.progressCard}>
      <View style={styles.progressCardHeader}>
        <Badge
          text={data.level}
          color={getLevelColor(data.level)}
          size="small"
        />
        <Text style={styles.progressPercentage}>{Math.round(data.progress)}%</Text>
      </View>
      
      <ProgressBar
        progress={data.progress}
        height={8}
        color={getLevelColor(data.level)}
        style={styles.progressBar}
      />
      
      <View style={styles.progressStats}>
        <View style={styles.progressStat}>
          <Text style={styles.progressStatValue}>{data.wordsLearned}</Text>
          <Text style={styles.progressStatLabel}>Words</Text>
        </View>
        <View style={styles.progressStat}>
          <Text style={styles.progressStatValue}>{data.lessonsCompleted}</Text>
          <Text style={styles.progressStatLabel}>Lessons</Text>
        </View>
        <View style={styles.progressStat}>
          <Text style={styles.progressStatValue}>{Math.round(data.accuracy)}%</Text>
          <Text style={styles.progressStatLabel}>Accuracy</Text>
        </View>
      </View>
    </Card>
  );

  const renderRecommendedLesson = (recommendation: RecommendedLesson) => (
    <TouchableOpacity
      key={recommendation.lesson.id}
      style={styles.recommendedLesson}
      onPress={() => router.push(`/lesson/${recommendation.lesson.id}` as any)}
    >
      <Card style={styles.recommendedLessonCard}>
        <View style={styles.recommendedLessonHeader}>
          <Text style={styles.recommendedLessonTitle} numberOfLines={2}>
            {getContentInLanguage(recommendation.lesson.title, 'en')}
          </Text>
          <Badge
            text={recommendation.priority}
            color={getPriorityColor(recommendation.priority)}
            size="small"
          />
        </View>
        
        <Text style={styles.recommendedLessonReason}>
          {recommendation.reason}
        </Text>
        
        <View style={styles.recommendedLessonFooter}>
          <View style={styles.recommendedLessonStats}>
            <Text style={styles.recommendedLessonStat}>
              {recommendation.lesson.exercises.length} exercises
            </Text>
            <Text style={styles.recommendedLessonStat}>
              {recommendation.lesson.estimatedTime} min
            </Text>
          </View>
          <Text style={styles.recommendedLessonXP}>
            +{recommendation.lesson.xpReward} XP
          </Text>
        </View>
      </Card>
    </TouchableOpacity>
  );

  const renderDailyChallenge = (challenge: DailyChallenge) => (
    <Card key={challenge.id} style={styles.challengeCard}>
      <View style={styles.challengeHeader}>
        <View style={styles.challengeIcon}>
          {challenge.type === 'lesson' && <BookOpenIcon size={20} color={theme.colors.primary} />}
          {challenge.type === 'vocabulary' && <StarIcon size={20} color={theme.colors.primary} />}
          {challenge.type === 'streak' && <FlameIcon size={20} color={theme.colors.primary} />}
          {challenge.type === 'accuracy' && <TargetIcon size={20} color={theme.colors.primary} />}
        </View>
        <View style={styles.challengeInfo}>
          <Text style={styles.challengeTitle}>{challenge.title}</Text>
          <Text style={styles.challengeDescription}>{challenge.description}</Text>
        </View>
        <View style={styles.challengeReward}>
          <Text style={styles.challengeRewardText}>+{challenge.reward} XP</Text>
        </View>
      </View>
      
      <View style={styles.challengeProgress}>
        <ProgressBar
          progress={(challenge.current / challenge.target) * 100}
          height={6}
          color={challenge.completed ? theme.colors.success : theme.colors.primary}
        />
        <Text style={styles.challengeProgressText}>
          {challenge.current}/{challenge.target}
        </Text>
      </View>
    </Card>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading dashboard...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!stats) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Failed to load dashboard</Text>
          <Button title="Retry" onPress={loadDashboardData} />
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
              <View style={styles.headerGreeting}>
                <Text style={styles.headerTitle}>
                  Hello, {user?.name || 'Learner'}! 👋
                </Text>
                <Text style={styles.headerSubtitle}>
                  Ready to continue your language journey?
                </Text>
              </View>
              <TouchableOpacity
                style={styles.settingsButton}
                onPress={() => router.push('/(tabs)/profile')}
              >
                <SettingsIcon size={24} color={theme.colors.white} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.levelCard}>
              <View style={styles.levelInfo}>
                <Text style={styles.levelText}>Level {stats.level}</Text>
                <Text style={styles.xpText}>{stats.totalXP} XP</Text>
              </View>
              <ProgressBar
                progress={((stats.totalXP % 1000) / 1000) * 100}
                height={8}
                color={theme.colors.white}
                style={styles.levelProgressBar}
              />
            </View>
          </View>
        </LinearGradient>

        {/* Stats Overview */}
        <View style={styles.statsContainer}>
          <Text style={styles.sectionTitle}>Your Progress</Text>
          <View style={styles.statsGrid}>
            {renderStatsCard('Streak', stats.streak, <FlameIcon size={20} color={theme.colors.white} />, theme.colors.warning)}
            {renderStatsCard('Words', stats.wordsLearned, <StarIcon size={20} color={theme.colors.white} />, theme.colors.success)}
            {renderStatsCard('Lessons', stats.lessonsCompleted, <BookOpenIcon size={20} color={theme.colors.white} />, theme.colors.primary)}
            {renderStatsCard('Accuracy', `${Math.round(stats.accuracy)}%`, <TargetIcon size={20} color={theme.colors.white} />, theme.colors.info)}
          </View>
        </View>

        {/* CEFR Level Progress */}
        <View style={styles.progressContainer}>
          <Text style={styles.sectionTitle}>CEFR Level Progress</Text>
          <View style={styles.progressGrid}>
            {progressData.map(renderProgressCard)}
          </View>
        </View>

        {/* Daily Challenges */}
        <View style={styles.challengesContainer}>
          <Text style={styles.sectionTitle}>Daily Challenges</Text>
          <View style={styles.challengesList}>
            {dailyChallenges.map(renderDailyChallenge)}
          </View>
        </View>

        {/* Recommended Lessons */}
        <View style={styles.recommendationsContainer}>
          <Text style={styles.sectionTitle}>Recommended for You</Text>
          <View style={styles.recommendationsList}>
            {recommendedLessons.map(renderRecommendedLesson)}
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsContainer}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity
              style={styles.quickAction}
              onPress={() => router.push('/lessons' as any)}
            >
              <BookOpenIcon size={24} color={theme.colors.primary} />
              <Text style={styles.quickActionText}>Lessons</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.quickAction}
              onPress={() => router.push('/(tabs)/leaderboard')}
            >
              <TrophyIcon size={24} color={theme.colors.warning} />
              <Text style={styles.quickActionText}>Leaderboard</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.quickAction}
              onPress={() => router.push('/(tabs)/shop')}
            >
              <GemIcon size={24} color={theme.colors.info} />
              <Text style={styles.quickActionText}>Shop</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.quickAction}
              onPress={() => router.push('/(tabs)/profile')}
            >
              <UsersIcon size={24} color={theme.colors.success} />
              <Text style={styles.quickActionText}>Profile</Text>
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
    alignItems: 'flex-start',
    width: '100%',
    marginBottom: theme.spacing.lg,
  },
  headerGreeting: {
    flex: 1,
  },
  headerTitle: {
    fontSize: theme.fontSize.xxl,
    fontWeight: 'bold',
    color: theme.colors.white,
    marginBottom: theme.spacing.xs,
  },
  headerSubtitle: {
    fontSize: theme.fontSize.md,
    color: theme.colors.white,
    opacity: 0.9,
  },
  settingsButton: {
    padding: theme.spacing.sm,
  },
  levelCard: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
  },
  levelInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  levelText: {
    fontSize: theme.fontSize.lg,
    fontWeight: 'bold',
    color: theme.colors.white,
  },
  xpText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.white,
    opacity: 0.9,
  },
  levelProgressBar: {
    width: '100%',
  },
  statsContainer: {
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
  },
  statsCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  statsIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.sm,
  },
  statsValue: {
    fontSize: theme.fontSize.lg,
    fontWeight: 'bold',
    color: theme.colors.black,
  },
  statsLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.gray[600],
  },
  progressContainer: {
    padding: theme.spacing.lg,
  },
  progressGrid: {
    gap: theme.spacing.md,
  },
  progressCard: {
    padding: theme.spacing.md,
  },
  progressCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  progressPercentage: {
    fontSize: theme.fontSize.lg,
    fontWeight: 'bold',
    color: theme.colors.black,
  },
  progressBar: {
    marginBottom: theme.spacing.md,
  },
  progressStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  progressStat: {
    alignItems: 'center',
  },
  progressStatValue: {
    fontSize: theme.fontSize.md,
    fontWeight: '600',
    color: theme.colors.black,
  },
  progressStatLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.gray[600],
    marginTop: theme.spacing.xs,
  },
  challengesContainer: {
    padding: theme.spacing.lg,
  },
  challengesList: {
    gap: theme.spacing.md,
  },
  challengeCard: {
    padding: theme.spacing.md,
  },
  challengeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  challengeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  challengeInfo: {
    flex: 1,
  },
  challengeTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: '600',
    color: theme.colors.black,
    marginBottom: theme.spacing.xs,
  },
  challengeDescription: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.gray[600],
  },
  challengeReward: {
    alignItems: 'center',
  },
  challengeRewardText: {
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  challengeProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  challengeProgressText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.gray[600],
    minWidth: 40,
    textAlign: 'right',
  },
  recommendationsContainer: {
    padding: theme.spacing.lg,
  },
  recommendationsList: {
    gap: theme.spacing.md,
  },
  recommendedLesson: {
    marginBottom: theme.spacing.sm,
  },
  recommendedLessonCard: {
    padding: theme.spacing.md,
  },
  recommendedLessonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.sm,
  },
  recommendedLessonTitle: {
    flex: 1,
    fontSize: theme.fontSize.md,
    fontWeight: '600',
    color: theme.colors.black,
    marginRight: theme.spacing.sm,
  },
  recommendedLessonReason: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.gray[600],
    marginBottom: theme.spacing.md,
  },
  recommendedLessonFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recommendedLessonStats: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  recommendedLessonStat: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.gray[600],
  },
  recommendedLessonXP: {
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  quickActionsContainer: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
  },
  quickAction: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: theme.colors.gray[50],
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.gray[200],
  },
  quickActionText: {
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
    color: theme.colors.black,
    marginTop: theme.spacing.sm,
  },
});
