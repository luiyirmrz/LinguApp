import React, { useState, useEffect } from 'react';
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
import { theme } from '@/constants/theme';
import { useI18n } from '@/hooks/useI18n';
import { useUnifiedAuth } from "@/hooks/useUnifiedAuth";
import { useGameState } from '@/hooks/useGameState';
import { Card } from '@/components/Card';
import { Badge } from '@/components/Badge';
import { 
  BookOpenIcon, 
  StarIcon, 
  AwardIcon, 
  FlameIcon,
  TrendingUpIcon,
  TargetIcon,
  ClockIcon,
  CalendarIcon,
  FilterIcon,
  SearchIcon,
  BarChart3Icon,
} from '@/components/icons/LucideReplacement';

const { width } = Dimensions.get('window');

interface ActivityItem {
  id: string;
  type: 'lesson' | 'vocabulary' | 'achievement' | 'streak' | 'level_up' | 'challenge';
  title: string;
  description: string;
  timestamp: Date;
  xpEarned?: number;
  icon: string;
  color: string;
  category: string;
  details?: {
    accuracy?: number;
    timeSpent?: number;
    wordsLearned?: number;
    streakLength?: number;
    level?: number;
  };
}

interface ActivityHistoryProps {
  onActivityPress?: (activity: ActivityItem) => void;
  onFilterChange?: (filter: string) => void;
}

export default function ActivityHistory({
  onActivityPress,
  onFilterChange,
}: ActivityHistoryProps) {
  const { t } = useI18n();
  const { user, signIn, signOut, signUp, resetPassword, updateUser } = useUnifiedAuth();
  const { getUserProgress } = useGameState();

  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [filteredActivities, setFilteredActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [animationValue] = useState(new Animated.Value(0));

  const filterOptions = [
    { key: 'all', label: 'All', icon: 'bar-chart' },
    { key: 'lesson', label: 'Lessons', icon: 'book-open' },
    { key: 'vocabulary', label: 'Vocabulary', icon: 'star' },
    { key: 'achievement', label: 'Achievements', icon: 'award' },
    { key: 'streak', label: 'Streaks', icon: 'flame' },
    { key: 'level_up', label: 'Level Ups', icon: 'trending-up' },
    { key: 'challenge', label: 'Challenges', icon: 'target' },
  ];

  useEffect(() => {
    loadActivityHistory();
    animateComponents();
  }, []);

  useEffect(() => {
    filterActivities();
  }, [activities, selectedFilter]);

  const animateComponents = () => {
    Animated.timing(animationValue, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  };

  const loadActivityHistory = async () => {
    try {
      setLoading(true);
      
      if (!user) return;

      const userProgress = await getUserProgress(user.id);
      const activityHistory = generateActivityHistory(userProgress);
      setActivities(activityHistory);

    } catch (error) {
      console.error('Error loading activity history:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateActivityHistory = (userProgress: any): ActivityItem[] => {
    const activities: ActivityItem[] = [];

    // Add lesson completions
    if (userProgress.lessonHistory) {
      userProgress.lessonHistory.forEach((lesson: any) => {
        activities.push({
          id: `lesson_${lesson.id}`,
          type: 'lesson',
          title: 'Lesson Completed',
          description: lesson.title,
          timestamp: new Date(lesson.completedAt),
          xpEarned: lesson.xpEarned,
          icon: 'book-open',
          color: theme.colors.primary,
          category: 'Learning',
          details: {
            accuracy: lesson.accuracy,
            timeSpent: lesson.timeSpent,
            wordsLearned: lesson.wordsLearned,
          },
        });
      });
    }

    // Add vocabulary learning
    if (userProgress.vocabularyHistory) {
      userProgress.vocabularyHistory.forEach((vocab: any) => {
        activities.push({
          id: `vocab_${vocab.id}`,
          type: 'vocabulary',
          title: 'Vocabulary Learned',
          description: `Learned "${vocab.word}"`,
          timestamp: new Date(vocab.learnedAt),
          xpEarned: vocab.xpEarned,
          icon: 'star',
          color: theme.colors.success,
          category: 'Vocabulary',
          details: {
            wordsLearned: 1,
          },
        });
      });
    }

    // Add achievements
    if (userProgress.achievementHistory) {
      userProgress.achievementHistory.forEach((achievement: any) => {
        activities.push({
          id: `achievement_${achievement.id}`,
          type: 'achievement',
          title: 'Achievement Unlocked',
          description: achievement.title,
          timestamp: new Date(achievement.unlockedAt),
          xpEarned: achievement.xpReward,
          icon: 'award',
          color: theme.colors.warning,
          category: 'Achievement',
        });
      });
    }

    // Add streak milestones
    if (userProgress.streakHistory) {
      userProgress.streakHistory.forEach((streak: any) => {
        activities.push({
          id: `streak_${streak.id}`,
          type: 'streak',
          title: 'Streak Milestone',
          description: `${streak.length} day streak!`,
          timestamp: new Date(streak.achievedAt),
          xpEarned: streak.xpReward,
          icon: 'flame',
          color: theme.colors.danger,
          category: 'Streak',
          details: {
            streakLength: streak.length,
          },
        });
      });
    }

    // Add level ups
    if (userProgress.levelHistory) {
      userProgress.levelHistory.forEach((level: any) => {
        activities.push({
          id: `level_${level.id}`,
          type: 'level_up',
          title: 'Level Up!',
          description: `Reached level ${level.level}`,
          timestamp: new Date(level.achievedAt),
          xpEarned: level.xpReward,
          icon: 'trending-up',
          color: theme.colors.success,
          category: 'Level',
        });
      });
    }

    // Add challenge completions
    if (userProgress.challengeHistory) {
      userProgress.challengeHistory.forEach((challenge: any) => {
        activities.push({
          id: `challenge_${challenge.id}`,
          type: 'challenge',
          title: 'Challenge Completed',
          description: challenge.title,
          timestamp: new Date(challenge.completedAt),
          xpEarned: challenge.xpReward,
          icon: 'target',
          color: theme.colors.info,
          category: 'Challenge',
        });
      });
    }

    // Sort by timestamp (newest first)
    return activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  };

  const filterActivities = () => {
    if (selectedFilter === 'all') {
      setFilteredActivities(activities);
    } else {
      setFilteredActivities(activities.filter(activity => activity.type === selectedFilter));
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadActivityHistory();
    setRefreshing(false);
  };

  const handleFilterChange = (filter: string) => {
    setSelectedFilter(filter);
    if (onFilterChange) {
      onFilterChange(filter);
    }
  };

  const getActivityIcon = (icon: string) => {
    switch (icon) {
      case 'book-open':
        return <BookOpenIcon size={20} color={theme.colors.white} />;
      case 'star':
        return <StarIcon size={20} color={theme.colors.white} />;
      case 'award':
        return <AwardIcon size={20} color={theme.colors.white} />;
      case 'flame':
        return <FlameIcon size={20} color={theme.colors.white} />;
      case 'trending-up':
        return <TrendingUpIcon size={20} color={theme.colors.white} />;
      case 'target':
        return <TargetIcon size={20} color={theme.colors.white} />;
      default:
        return <BarChart3Icon size={20} color={theme.colors.white} />;
    }
  };

  const formatTimeAgo = (date: Date): string => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const weeks = Math.floor(days / 7);
    const months = Math.floor(days / 30);

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    if (weeks < 4) return `${weeks}w ago`;
    return `${months}mo ago`;
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
    });
  };

  const renderFilterButton = (filter: any) => (
    <TouchableOpacity
      key={filter.key}
      style={[
        styles.filterButton,
        selectedFilter === filter.key && styles.filterButtonActive,
      ]}
      onPress={() => handleFilterChange(filter.key)}
    >
      <Text style={[
        styles.filterButtonText,
        selectedFilter === filter.key && styles.filterButtonTextActive,
      ]}>
        {filter.label}
      </Text>
    </TouchableOpacity>
  );

  const renderActivityItem = (activity: ActivityItem, index: number) => (
    <Animated.View
      key={activity.id}
      style={[
        styles.activityItem,
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
      <TouchableOpacity
        style={styles.activityCard}
        onPress={() => onActivityPress?.(activity)}
        activeOpacity={0.7}
      >
        <View style={styles.activityHeader}>
          <View style={[styles.activityIcon, { backgroundColor: activity.color }]}>
            {getActivityIcon(activity.icon)}
          </View>
          
          <View style={styles.activityContent}>
            <Text style={styles.activityTitle}>{activity.title}</Text>
            <Text style={styles.activityDescription}>{activity.description}</Text>
            <Text style={styles.activityTime}>{formatTimeAgo(activity.timestamp)}</Text>
          </View>
          
          <View style={styles.activityMeta}>
            {activity.xpEarned && (
              <View style={styles.xpBadge}>
                <Text style={styles.xpText}>+{activity.xpEarned} XP</Text>
              </View>
            )}
            <Text style={styles.activityDate}>{formatDate(activity.timestamp)}</Text>
          </View>
        </View>

        {activity.details && (
          <View style={styles.activityDetails}>
            {activity.details.accuracy && (
              <View style={styles.detailItem}>
                <TargetIcon size={14} color={theme.colors.gray[600]} />
                <Text style={styles.detailText}>{activity.details.accuracy}% accuracy</Text>
              </View>
            )}
            {activity.details.timeSpent && (
              <View style={styles.detailItem}>
                <ClockIcon size={14} color={theme.colors.gray[600]} />
                <Text style={styles.detailText}>{activity.details.timeSpent}m</Text>
              </View>
            )}
            {activity.details.wordsLearned && (
              <View style={styles.detailItem}>
                <StarIcon size={14} color={theme.colors.gray[600]} />
                <Text style={styles.detailText}>{activity.details.wordsLearned} words</Text>
              </View>
            )}
            {activity.details.streakLength && (
              <View style={styles.detailItem}>
                <FlameIcon size={14} color={theme.colors.gray[600]} />
                <Text style={styles.detailText}>{activity.details.streakLength} days</Text>
              </View>
            )}
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <BarChart3Icon size={64} color={theme.colors.gray[400]} />
      <Text style={styles.emptyStateTitle}>No Activities Yet</Text>
      <Text style={styles.emptyStateSubtitle}>
        Start learning to see your activity history here
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading activity history...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Activity History</Text>
        <Text style={styles.headerSubtitle}>
          {filteredActivities.length} activities
        </Text>
      </View>

      {/* Filter Buttons */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
        contentContainerStyle={styles.filterContent}
      >
        {filterOptions.map(renderFilterButton)}
      </ScrollView>

      {/* Activities List */}
      <ScrollView
        style={styles.activitiesList}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {filteredActivities.length > 0 ? (
          filteredActivities.map(renderActivityItem)
        ) : (
          renderEmptyState()
        )}
      </ScrollView>
    </View>
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
  header: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
  },
  headerTitle: {
    fontSize: theme.fontSize.xxl,
    fontWeight: 'bold',
    color: theme.colors.black,
    marginBottom: theme.spacing.xs,
  },
  headerSubtitle: {
    fontSize: theme.fontSize.md,
    color: theme.colors.gray[600],
  },
  filterContainer: {
    marginBottom: theme.spacing.lg,
  },
  filterContent: {
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  filterButton: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.gray[100],
  },
  filterButtonActive: {
    backgroundColor: theme.colors.primary,
  },
  filterButtonText: {
    fontSize: theme.fontSize.sm,
    fontWeight: '500',
    color: theme.colors.gray[600],
  },
  filterButtonTextActive: {
    color: theme.colors.white,
  },
  activitiesList: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
  },
  activityItem: {
    marginBottom: theme.spacing.md,
  },
  activityCard: {
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.gray[200],
  },
  activityHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.md,
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
  activityMeta: {
    alignItems: 'flex-end',
  },
  xpBadge: {
    backgroundColor: theme.colors.warningLight,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
    marginBottom: theme.spacing.xs,
  },
  xpText: {
    fontSize: theme.fontSize.xs,
    fontWeight: '600',
    color: theme.colors.warning,
  },
  activityDate: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.gray[500],
  },
  activityDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.gray[100],
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  detailText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.gray[600],
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xxl,
  },
  emptyStateTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: '600',
    color: theme.colors.gray[600],
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
  },
  emptyStateSubtitle: {
    fontSize: theme.fontSize.md,
    color: theme.colors.gray[500],
    textAlign: 'center',
    lineHeight: 20,
  },
});
