import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { theme } from '@/constants/theme';
import { useI18n } from '@/hooks/useI18n';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';
import { useGameState } from '@/hooks/useGameState';
import { Card } from '@/components/Card';
import { ProgressBar } from '@/components/ProgressBar';
import { Badge } from '@/components/Badge';
import { 
  TrendingUpIcon, 
  TrendingDownIcon, 
  TargetIcon, 
  StarIcon, 
  BookOpenIcon,
  ClockIcon,
  AwardIcon,
  BarChart3Icon,
} from '@/components/icons/LucideReplacement';
// import { cefrLessonService } from '@/services/cefrLessonService';
// import { cefrVocabularyService } from '@/services/cefrVocabularyService';
import { CEFRLevel } from '@/types';

const { width } = Dimensions.get('window');

interface ProgressData {
  level: CEFRLevel;
  progress: number;
  wordsLearned: number;
  lessonsCompleted: number;
  accuracy: number;
  studyTime: number;
  weeklyProgress: number;
  monthlyProgress: number;
  trend: 'up' | 'down' | 'stable';
}

interface WeeklyData {
  date: string;
  xp: number;
  lessons: number;
  words: number;
  accuracy: number;
}

interface ProgressVisualizationProps {
  selectedLevel?: CEFRLevel;
  timeRange?: 'week' | 'month' | 'year';
  onLevelSelect?: (level: CEFRLevel) => void;
}

export default function ProgressVisualization({
  selectedLevel,
  timeRange = 'week',
  onLevelSelect,
}: ProgressVisualizationProps) {
  const { t } = useI18n();
  const { user, signIn, signOut, signUp, resetPassword, updateUser } = useUnifiedAuth();
  const { getUserProgress } = useGameState();

  const [progressData, setProgressData] = useState<ProgressData[]>([]);
  const [weeklyData, setWeeklyData] = useState<WeeklyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState<'week' | 'month' | 'year'>(timeRange);

  useEffect(() => {
    loadProgressData();
  }, [user, selectedTimeRange]);

  const loadProgressData = async () => {
    try {
      setLoading(true);
      
      if (!user) return;

      const userProgress = await getUserProgress(user.id);
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
        const studyTime = calculateStudyTime(level, userProgress);
        const weeklyProgress = calculateWeeklyProgress(level, userProgress);
        const monthlyProgress = calculateMonthlyProgress(level, userProgress);
        const trend = calculateTrend(level, userProgress);

        progressByLevel.push({
          level,
          progress: (completedLessons / levelLessons.length) * 100,
          wordsLearned: learnedWords,
          lessonsCompleted: completedLessons,
          accuracy,
          studyTime,
          weeklyProgress,
          monthlyProgress,
          trend,
        });
      }

      setProgressData(progressByLevel);

      // Generate weekly data for charts
      const weeklyChartData = generateWeeklyData(userProgress);
      setWeeklyData(weeklyChartData);

    } catch (error) {
      console.error('Error loading progress data:', error);
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

  const calculateStudyTime = (level: CEFRLevel, userProgress: any): number => {
    const levelLessons: any[] = []; // Mock implementation
    const completedLessons = levelLessons.filter(lesson => 
      userProgress[lesson.id]?.completed,
    );
    
    return completedLessons.reduce((sum, lesson) => 
      sum + (userProgress[lesson.id]?.timeSpent || 0), 0,
    );
  };

  const calculateWeeklyProgress = (level: CEFRLevel, userProgress: any): number => {
    // Calculate progress made in the last week
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const levelLessons: any[] = []; // Mock implementation
    
    const recentLessons = levelLessons.filter(lesson => {
      const completionDate = userProgress[lesson.id]?.completedAt;
      return completionDate && new Date(completionDate) > oneWeekAgo;
    });

    return recentLessons.length;
  };

  const calculateMonthlyProgress = (level: CEFRLevel, userProgress: any): number => {
    // Calculate progress made in the last month
    const oneMonthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const levelLessons: any[] = []; // Mock implementation
    
    const recentLessons = levelLessons.filter(lesson => {
      const completionDate = userProgress[lesson.id]?.completedAt;
      return completionDate && new Date(completionDate) > oneMonthAgo;
    });

    return recentLessons.length;
  };

  const calculateTrend = (level: CEFRLevel, userProgress: any): 'up' | 'down' | 'stable' => {
    const weeklyProgress = calculateWeeklyProgress(level, userProgress);
    const monthlyProgress = calculateMonthlyProgress(level, userProgress);
    
    const weeklyAverage = weeklyProgress / 7;
    const monthlyAverage = monthlyProgress / 30;
    
    if (weeklyAverage > monthlyAverage * 1.1) return 'up';
    if (weeklyAverage < monthlyAverage * 0.9) return 'down';
    return 'stable';
  };

  const generateWeeklyData = (userProgress: any): WeeklyData[] => {
    const data: WeeklyData[] = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      const dateStr = date.toISOString().split('T')[0];
      const dayProgress = userProgress.dailyProgress?.[dateStr] || {
        xp: 0,
        lessons: 0,
        words: 0,
        accuracy: 0,
      };
      
      data.push({
        date: dateStr,
        xp: dayProgress.xp,
        lessons: dayProgress.lessons,
        words: dayProgress.words,
        accuracy: dayProgress.accuracy,
      });
    }
    
    return data;
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

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <TrendingUpIcon size={16} color={theme.colors.success} />;
      case 'down':
        return <TrendingDownIcon size={16} color={theme.colors.danger} />;
      default:
        return <BarChart3Icon size={16} color={theme.colors.gray[500]} />;
    }
  };

  const getTrendText = (trend: 'up' | 'down' | 'stable'): string => {
    switch (trend) {
      case 'up':
        return 'Improving';
      case 'down':
        return 'Declining';
      default:
        return 'Stable';
    }
  };

  const renderLevelCard = (data: ProgressData) => (
    <TouchableOpacity
      key={data.level}
      style={[
        styles.levelCard,
        selectedLevel === data.level && styles.selectedLevelCard,
      ]}
      onPress={() => onLevelSelect?.(data.level)}
    >
      <Card style={styles.levelCardContent}>
        <View style={styles.levelCardHeader}>
          <Badge
            text={data.level}
            color={getLevelColor(data.level)}
            size="small"
          />
          <View style={styles.trendContainer}>
            {getTrendIcon(data.trend)}
            <Text style={styles.trendText}>{getTrendText(data.trend)}</Text>
          </View>
        </View>
        
        <View style={styles.progressContainer}>
          <Text style={styles.progressLabel}>Overall Progress</Text>
          <ProgressBar
            progress={data.progress}
            height={12}
            color={getLevelColor(data.level)}
            style={styles.progressBar}
          />
          <Text style={styles.progressPercentage}>{Math.round(data.progress)}%</Text>
        </View>
        
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <StarIcon size={16} color={theme.colors.warning} />
            <Text style={styles.statValue}>{data.wordsLearned}</Text>
            <Text style={styles.statLabel}>Words</Text>
          </View>
          
          <View style={styles.statItem}>
            <BookOpenIcon size={16} color={theme.colors.primary} />
            <Text style={styles.statValue}>{data.lessonsCompleted}</Text>
            <Text style={styles.statLabel}>Lessons</Text>
          </View>
          
          <View style={styles.statItem}>
            <TargetIcon size={16} color={theme.colors.success} />
            <Text style={styles.statValue}>{Math.round(data.accuracy)}%</Text>
            <Text style={styles.statLabel}>Accuracy</Text>
          </View>
          
          <View style={styles.statItem}>
            <ClockIcon size={16} color={theme.colors.info} />
            <Text style={styles.statValue}>{Math.round(data.studyTime / 60)}m</Text>
            <Text style={styles.statLabel}>Study Time</Text>
          </View>
        </View>
        
        <View style={styles.weeklyProgress}>
          <Text style={styles.weeklyProgressLabel}>This Week</Text>
          <View style={styles.weeklyProgressBar}>
            <View 
              style={[
                styles.weeklyProgressFill,
                { 
                  width: `${Math.min((data.weeklyProgress / 7) * 100, 100)}%`,
                  backgroundColor: getLevelColor(data.level),
                },
              ]}
            />
          </View>
          <Text style={styles.weeklyProgressText}>
            {data.weeklyProgress} lessons completed
          </Text>
        </View>
      </Card>
    </TouchableOpacity>
  );

  const renderWeeklyChart = () => (
    <Card style={styles.chartCard}>
      <View style={styles.chartHeader}>
        <Text style={styles.chartTitle}>Weekly Progress</Text>
        <View style={styles.timeRangeSelector}>
          {(['week', 'month', 'year'] as const).map((range) => (
            <TouchableOpacity
              key={range}
              style={[
                styles.timeRangeButton,
                selectedTimeRange === range && styles.timeRangeButtonActive,
              ]}
              onPress={() => setSelectedTimeRange(range)}
            >
              <Text style={[
                styles.timeRangeButtonText,
                selectedTimeRange === range && styles.timeRangeButtonTextActive,
              ]}>
                {range.charAt(0).toUpperCase() + range.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      
      <View style={styles.chartContainer}>
        <View style={styles.chartBars}>
          {weeklyData.map((day, index) => (
            <View key={day.date} style={styles.chartBar}>
              <View style={styles.chartBarContainer}>
                <View 
                  style={[
                    styles.chartBarFill,
                    { 
                      height: `${Math.max((day.xp / 100) * 100, 10)}%`,
                      backgroundColor: theme.colors.primary,
                    },
                  ]}
                />
              </View>
              <Text style={styles.chartBarLabel}>
                {new Date(day.date).toLocaleDateString('en', { weekday: 'short' })}
              </Text>
            </View>
          ))}
        </View>
      </View>
      
      <View style={styles.chartLegend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: theme.colors.primary }]} />
          <Text style={styles.legendText}>XP Earned</Text>
        </View>
      </View>
    </Card>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading progress data...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Time Range Selector */}
      <View style={styles.timeRangeContainer}>
        <Text style={styles.sectionTitle}>Progress by CEFR Level</Text>
      </View>

      {/* Level Progress Cards */}
      <View style={styles.levelsContainer}>
        {progressData.map(renderLevelCard)}
      </View>

      {/* Weekly Chart */}
      {renderWeeklyChart()}

      {/* Summary Stats */}
      <Card style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Learning Summary</Text>
        <View style={styles.summaryStats}>
          <View style={styles.summaryStat}>
            <Text style={styles.summaryStatValue}>
              {progressData.reduce((sum, level) => sum + level.wordsLearned, 0)}
            </Text>
            <Text style={styles.summaryStatLabel}>Total Words Learned</Text>
          </View>
          
          <View style={styles.summaryStat}>
            <Text style={styles.summaryStatValue}>
              {progressData.reduce((sum, level) => sum + level.lessonsCompleted, 0)}
            </Text>
            <Text style={styles.summaryStatLabel}>Total Lessons Completed</Text>
          </View>
          
          <View style={styles.summaryStat}>
            <Text style={styles.summaryStatValue}>
              {Math.round(progressData.reduce((sum, level) => sum + level.accuracy, 0) / progressData.length)}%
            </Text>
            <Text style={styles.summaryStatLabel}>Average Accuracy</Text>
          </View>
          
          <View style={styles.summaryStat}>
            <Text style={styles.summaryStatValue}>
              {Math.round(progressData.reduce((sum, level) => sum + level.studyTime, 0) / 60)}m
            </Text>
            <Text style={styles.summaryStatLabel}>Total Study Time</Text>
          </View>
        </View>
      </Card>
    </ScrollView>
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
    padding: theme.spacing.lg,
  },
  loadingText: {
    fontSize: theme.fontSize.lg,
    color: theme.colors.gray[600],
  },
  timeRangeContainer: {
    padding: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: '600',
    color: theme.colors.black,
  },
  levelsContainer: {
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  levelCard: {
    marginBottom: theme.spacing.md,
  },
  selectedLevelCard: {
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  levelCardContent: {
    padding: theme.spacing.lg,
  },
  levelCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  trendText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.gray[600],
  },
  progressContainer: {
    marginBottom: theme.spacing.lg,
  },
  progressLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.gray[600],
    marginBottom: theme.spacing.sm,
  },
  progressBar: {
    marginBottom: theme.spacing.sm,
  },
  progressPercentage: {
    fontSize: theme.fontSize.lg,
    fontWeight: '600',
    color: theme.colors.black,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  statItem: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    padding: theme.spacing.sm,
    backgroundColor: theme.colors.gray[50],
    borderRadius: theme.borderRadius.md,
  },
  statValue: {
    fontSize: theme.fontSize.lg,
    fontWeight: '600',
    color: theme.colors.black,
    marginTop: theme.spacing.xs,
  },
  statLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.gray[600],
    marginTop: theme.spacing.xs,
  },
  weeklyProgress: {
    marginTop: theme.spacing.md,
  },
  weeklyProgressLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.gray[600],
    marginBottom: theme.spacing.sm,
  },
  weeklyProgressBar: {
    height: 8,
    backgroundColor: theme.colors.gray[200],
    borderRadius: 4,
    marginBottom: theme.spacing.sm,
  },
  weeklyProgressFill: {
    height: '100%',
    borderRadius: 4,
  },
  weeklyProgressText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.gray[600],
    textAlign: 'center',
  },
  chartCard: {
    margin: theme.spacing.lg,
    padding: theme.spacing.lg,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  chartTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: '600',
    color: theme.colors.black,
  },
  timeRangeSelector: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  timeRangeButton: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.gray[100],
  },
  timeRangeButtonActive: {
    backgroundColor: theme.colors.primary,
  },
  timeRangeButtonText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.gray[600],
  },
  timeRangeButtonTextActive: {
    color: theme.colors.white,
  },
  chartContainer: {
    height: 200,
    marginBottom: theme.spacing.lg,
  },
  chartBars: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: '100%',
  },
  chartBar: {
    alignItems: 'center',
    flex: 1,
  },
  chartBarContainer: {
    height: '80%',
    width: 20,
    backgroundColor: theme.colors.gray[200],
    borderRadius: 10,
    justifyContent: 'flex-end',
    marginBottom: theme.spacing.sm,
  },
  chartBarFill: {
    width: '100%',
    borderRadius: 10,
    minHeight: 4,
  },
  chartBarLabel: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.gray[600],
  },
  chartLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: theme.spacing.lg,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.gray[600],
  },
  summaryCard: {
    margin: theme.spacing.lg,
    padding: theme.spacing.lg,
  },
  summaryTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: '600',
    color: theme.colors.black,
    marginBottom: theme.spacing.lg,
    textAlign: 'center',
  },
  summaryStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
  },
  summaryStat: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.gray[50],
    borderRadius: theme.borderRadius.md,
  },
  summaryStatValue: {
    fontSize: theme.fontSize.xl,
    fontWeight: 'bold',
    color: theme.colors.black,
    marginBottom: theme.spacing.xs,
  },
  summaryStatLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.gray[600],
    textAlign: 'center',
  },
});
