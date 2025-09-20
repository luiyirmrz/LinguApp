import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { theme } from '@/constants/theme';
import { useI18n } from '@/hooks/useI18n';
import { useUnifiedAuth } from "@/hooks/useUnifiedAuth";
import useEnhancedGamification from "@/hooks/useEnhancedGamification";
import { Card } from '@/components/Card';
import { Badge } from '@/components/Badge';
import { 
  TrophyIcon, 
  AwardIcon, 
  FlameIcon, 
  StarIcon, 
  TargetIcon,
  BookOpenIcon,
  ClockIcon,
  ZapIcon,
  CrownIcon,
  MedalIcon,
  GemIcon,
  HeartIcon,
  UsersIcon,
  CalendarIcon,
} from '@/components/icons/LucideReplacement';
import { Achievement } from '@/types';

const { width } = Dimensions.get('window');

interface StreakData {
  currentStreak: number;
  longestStreak: number;
  streakStartDate: Date;
  lastActivityDate: Date;
  streakGoal: number;
  streakRewards: number[];
}

interface AchievementData {
  achievement: Achievement;
  unlockedAt: Date;
  progress: number;
  isUnlocked: boolean;
  isNew: boolean;
}

interface AchievementsStreakProps {
  onAchievementPress?: (achievement: Achievement) => void;
  onStreakPress?: () => void;
}

export default function AchievementsStreak({
  onAchievementPress,
  onStreakPress,
}: AchievementsStreakProps) {
  const { t } = useI18n();
  const { user, signIn, signOut, signUp, resetPassword, updateUser } = useUnifiedAuth();
  const { awardXP, completeLesson, acceptChallenge, createChallenge, generateDailyChallenges, refreshStats } = useEnhancedGamification();

  const [streakData, setStreakData] = useState<StreakData | null>(null);
  const [achievements, setAchievements] = useState<AchievementData[]>([]);
  const [loading, setLoading] = useState(true);
  const [animationValue] = useState(new Animated.Value(0));
  const [streakAnimation] = useState(new Animated.Value(0));

  useEffect(() => {
    loadData();
    animateComponents();
  }, []);

  const animateComponents = () => {
    Animated.sequence([
      Animated.timing(animationValue, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(streakAnimation, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const loadData = async () => {
    try {
      setLoading(true);
      
      if (!user) return;

      const userStreak = 0; // Mock implementation
      const userAchievements: any[] = []; // Mock implementation
      const userLevel = 1; // Mock implementation

      // Generate streak data
      const streak: StreakData = {
        currentStreak: userStreak || 0,
        longestStreak: userStreak || 0,
        streakStartDate: new Date(),
        lastActivityDate: new Date(),
        streakGoal: Math.max(7, userLevel * 2), // Dynamic goal based on level
        streakRewards: [7, 14, 30, 60, 100], // Milestone rewards
      };

      // Generate achievement data
      const achievementData: AchievementData[] = [
        {
          achievement: {
            id: 'first_lesson',
            name: 'First Steps',
            title: 'First Steps',
            description: 'Complete your first lesson',
            icon: 'book-open',
            unlocked: false,
            points: 50,
            rarity: 'common',
            xpReward: 50,
            category: 'learning',
          },
          unlockedAt: userAchievements.find(a => a.id === 'first_lesson')?.unlockedAt ? new Date(userAchievements.find(a => a.id === 'first_lesson')!.unlockedAt!) : new Date(),
          progress: userAchievements.find(a => a.id === 'first_lesson')?.unlocked ? 100 : 0,
          isUnlocked: !!userAchievements.find(a => a.id === 'first_lesson')?.unlocked,
          isNew: false,
        },
        {
          achievement: {
            id: 'streak_7',
            name: 'Week Warrior',
            title: 'Week Warrior',
            description: 'Maintain a 7-day streak',
            icon: 'flame',
            unlocked: false,
            points: 100,
            rarity: 'rare',
            xpReward: 100,
            category: 'streak',
          },
          unlockedAt: userAchievements.find(a => a.id === 'streak_7')?.unlockedAt ? new Date(userAchievements.find(a => a.id === 'streak_7')!.unlockedAt!) : new Date(),
          progress: Math.min((streak.currentStreak / 7) * 100, 100),
          isUnlocked: !!userAchievements.find(a => a.id === 'streak_7')?.unlocked,
          isNew: false,
        },
        {
          achievement: {
            id: 'vocabulary_master',
            name: 'Vocabulary Master',
            title: 'Vocabulary Master',
            description: 'Learn 100 vocabulary words',
            icon: 'star',
            unlocked: false,
            points: 200,
            rarity: 'rare',
            xpReward: 200,
            category: 'vocabulary',
          },
          unlockedAt: userAchievements.find(a => a.id === 'vocabulary_master')?.unlockedAt ? new Date(userAchievements.find(a => a.id === 'vocabulary_master')!.unlockedAt!) : new Date(),
          progress: 0, // Placeholder - would need to implement word counting
          isUnlocked: !!userAchievements.find(a => a.id === 'vocabulary_master')?.unlocked,
          isNew: false,
        },
        {
          achievement: {
            id: 'accuracy_90',
            name: 'Perfectionist',
            title: 'Perfectionist',
            description: 'Achieve 90% accuracy in lessons',
            icon: 'target',
            unlocked: false,
            points: 300,
            rarity: 'epic',
            xpReward: 300,
            category: 'accuracy',
          },
          unlockedAt: userAchievements.find(a => a.id === 'accuracy_90')?.unlockedAt ? new Date(userAchievements.find(a => a.id === 'accuracy_90')!.unlockedAt!) : new Date(),
          progress: 0, // Placeholder - would need to implement accuracy tracking
          isUnlocked: !!userAchievements.find(a => a.id === 'accuracy_90')?.unlocked,
          isNew: false,
        },
        {
          achievement: {
            id: 'level_5',
            name: 'Rising Star',
            title: 'Rising Star',
            description: 'Reach level 5',
            icon: 'crown',
            unlocked: false,
            points: 500,
            rarity: 'legendary',
            xpReward: 500,
            category: 'level',
          },
          unlockedAt: userAchievements.find(a => a.id === 'level_5')?.unlockedAt ? new Date(userAchievements.find(a => a.id === 'level_5')!.unlockedAt!) : new Date(),
          progress: Math.min((userLevel / 5) * 100, 100),
          isUnlocked: !!userAchievements.find(a => a.id === 'level_5')?.unlocked,
          isNew: false,
        },
      ];

      setStreakData(streak);
      setAchievements(achievementData);

    } catch (error) {
      console.error('Error loading achievements and streak data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRarityColor = (rarity: string): string => {
    const colors = {
      common: theme.colors.gray[500],
      uncommon: theme.colors.success,
      rare: theme.colors.primary,
      epic: theme.colors.warning,
      legendary: theme.colors.danger,
    };
    return colors[rarity as keyof typeof colors] || theme.colors.gray[500];
  };

  const getRarityText = (rarity: string): string => {
    return rarity.charAt(0).toUpperCase() + rarity.slice(1);
  };

  const getStreakReward = (streak: number): number => {
    const rewards = [7, 14, 30, 60, 100];
    return rewards.find(reward => streak >= reward) || 0;
  };

  const getNextStreakReward = (streak: number): number => {
    const rewards = [7, 14, 30, 60, 100];
    return rewards.find(reward => streak < reward) || 100;
  };

  const renderStreakCard = () => {
    if (!streakData) return null;

    const nextReward = getNextStreakReward(streakData.currentStreak);
    const progressToNext = (streakData.currentStreak / nextReward) * 100;

    return (
      <Animated.View
        style={[
          styles.streakCard,
          {
            transform: [{
              scale: streakAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: [0.9, 1],
              }),
            }],
            opacity: streakAnimation,
          },
        ]}
      >
        <Card style={styles.streakCardContent}>
          <TouchableOpacity
            style={styles.streakHeader}
            onPress={onStreakPress}
            activeOpacity={0.7}
          >
            <View style={styles.streakIcon}>
              <FlameIcon size={32} color={theme.colors.warning} />
            </View>
            <View style={styles.streakInfo}>
              <Text style={styles.streakTitle}>Learning Streak</Text>
              <Text style={styles.streakValue}>{streakData.currentStreak} days</Text>
            </View>
            <View style={styles.streakBadge}>
              <Badge
                text={`${streakData.currentStreak} days`}
                color={theme.colors.warning}
                size="small"
              />
            </View>
          </TouchableOpacity>

          <View style={styles.streakProgress}>
            <View style={styles.streakProgressHeader}>
              <Text style={styles.streakProgressLabel}>
                Next reward at {nextReward} days
              </Text>
              <Text style={styles.streakProgressValue}>
                {Math.round(progressToNext)}%
              </Text>
            </View>
            <View style={styles.streakProgressBar}>
              <View 
                style={[
                  styles.streakProgressFill,
                  { 
                    width: `${Math.min(progressToNext, 100)}%`,
                    backgroundColor: theme.colors.warning,
                  },
                ]}
              />
            </View>
          </View>

          <View style={styles.streakStats}>
            <View style={styles.streakStat}>
              <Text style={styles.streakStatValue}>{streakData.longestStreak}</Text>
              <Text style={styles.streakStatLabel}>Longest Streak</Text>
            </View>
            <View style={styles.streakStat}>
              <Text style={styles.streakStatValue}>{streakData.streakGoal}</Text>
              <Text style={styles.streakStatLabel}>Goal</Text>
            </View>
            <View style={styles.streakStat}>
              <Text style={styles.streakStatValue}>
                {Math.max(0, streakData.streakGoal - streakData.currentStreak)}
              </Text>
              <Text style={styles.streakStatLabel}>Days to Goal</Text>
            </View>
          </View>

          <View style={styles.streakRewards}>
            <Text style={styles.streakRewardsTitle}>Streak Rewards</Text>
            <View style={styles.streakRewardsList}>
              {streakData.streakRewards.map((reward, index) => (
                <View
                  key={reward}
                  style={[
                    styles.streakReward,
                    streakData.currentStreak >= reward && styles.streakRewardUnlocked,
                  ]}
                >
                  <View style={styles.streakRewardIcon}>
                    {streakData.currentStreak >= reward ? (
                      <TrophyIcon size={16} color={theme.colors.warning} />
                    ) : (
                      <ClockIcon size={16} color={theme.colors.gray[400]} />
                    )}
                  </View>
                  <Text style={[
                    styles.streakRewardText,
                    streakData.currentStreak >= reward && styles.streakRewardTextUnlocked,
                  ]}>
                    {reward} days
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </Card>
      </Animated.View>
    );
  };

  const renderAchievement = (achievementData: AchievementData, index: number) => (
    <Animated.View
      key={achievementData.achievement.id}
      style={[
        styles.achievementCard,
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
        style={[
          styles.achievementCardContent,
          achievementData.isUnlocked && styles.achievementUnlocked,
          achievementData.isNew && styles.achievementNew,
        ]}
        onPress={() => onAchievementPress?.(achievementData.achievement)}
        activeOpacity={0.7}
      >
        <View style={styles.achievementHeader}>
          <View style={[
            styles.achievementIcon,
            { backgroundColor: getRarityColor(achievementData.achievement.rarity || 'common') },
          ]}>
            {achievementData.achievement.icon === 'book-open' && <BookOpenIcon size={24} color={theme.colors.white} />}
            {achievementData.achievement.icon === 'flame' && <FlameIcon size={24} color={theme.colors.white} />}
            {achievementData.achievement.icon === 'star' && <StarIcon size={24} color={theme.colors.white} />}
            {achievementData.achievement.icon === 'target' && <TargetIcon size={24} color={theme.colors.white} />}
            {achievementData.achievement.icon === 'crown' && <CrownIcon size={24} color={theme.colors.white} />}
          </View>
          
          <View style={styles.achievementInfo}>
            <Text style={[
              styles.achievementTitle,
              !achievementData.isUnlocked && styles.achievementTitleLocked,
            ]}>
              {achievementData.achievement.title}
            </Text>
            <Text style={[
              styles.achievementDescription,
              !achievementData.isUnlocked && styles.achievementDescriptionLocked,
            ]}>
              {achievementData.achievement.description || ''}
            </Text>
          </View>
          
          <View style={styles.achievementBadge}>
            <Badge
              text={getRarityText(achievementData.achievement.rarity || 'common')}
              color={getRarityColor(achievementData.achievement.rarity || 'common')}
              size="small"
            />
          </View>
        </View>

        {!achievementData.isUnlocked && (
          <View style={styles.achievementProgress}>
            <View style={styles.achievementProgressBar}>
              <View 
                style={[
                  styles.achievementProgressFill,
                  { 
                    width: `${achievementData.progress}%`,
                    backgroundColor: getRarityColor(achievementData.achievement.rarity || 'common'),
                  },
                ]}
              />
            </View>
            <Text style={styles.achievementProgressText}>
              {Math.round(achievementData.progress)}%
            </Text>
          </View>
        )}

        <View style={styles.achievementReward}>
          <GemIcon size={16} color={theme.colors.warning} />
          <Text style={styles.achievementRewardText}>
            +{achievementData.achievement.xpReward} XP
          </Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading achievements...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Streak Card */}
      {renderStreakCard()}

      {/* Achievements Section */}
      <View style={styles.achievementsSection}>
        <Text style={styles.sectionTitle}>Achievements</Text>
        <Text style={styles.sectionSubtitle}>
          {achievements.filter(a => a.isUnlocked).length} of {achievements.length} unlocked
        </Text>
      </View>

      {/* Achievements List */}
      <View style={styles.achievementsList}>
        {achievements.map(renderAchievement)}
      </View>

      {/* Achievement Categories */}
      <View style={styles.categoriesSection}>
        <Text style={styles.sectionTitle}>Categories</Text>
        <View style={styles.categoriesGrid}>
          {[
            { name: 'Learning', icon: 'book-open', count: achievements.filter(a => a.achievement.category === 'learning' && a.isUnlocked).length },
            { name: 'Streak', icon: 'flame', count: achievements.filter(a => a.achievement.category === 'streak' && a.isUnlocked).length },
            { name: 'Vocabulary', icon: 'star', count: achievements.filter(a => a.achievement.category === 'vocabulary' && a.isUnlocked).length },
            { name: 'Accuracy', icon: 'target', count: achievements.filter(a => a.achievement.category === 'accuracy' && a.isUnlocked).length },
            { name: 'Level', icon: 'crown', count: achievements.filter(a => a.achievement.category === 'level' && a.isUnlocked).length },
          ].map((category, index) => (
            <View key={category.name} style={styles.categoryCard}>
              <View style={styles.categoryIcon}>
                {category.icon === 'book-open' && <BookOpenIcon size={20} color={theme.colors.primary} />}
                {category.icon === 'flame' && <FlameIcon size={20} color={theme.colors.warning} />}
                {category.icon === 'star' && <StarIcon size={20} color={theme.colors.success} />}
                {category.icon === 'target' && <TargetIcon size={20} color={theme.colors.info} />}
                {category.icon === 'crown' && <CrownIcon size={20} color={theme.colors.danger} />}
              </View>
              <Text style={styles.categoryName}>{category.name}</Text>
              <Text style={styles.categoryCount}>{category.count}</Text>
            </View>
          ))}
        </View>
      </View>
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
  streakCard: {
    margin: theme.spacing.lg,
  },
  streakCardContent: {
    padding: theme.spacing.lg,
  },
  streakHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  streakIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.warningLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  streakInfo: {
    flex: 1,
  },
  streakTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: '600',
    color: theme.colors.black,
    marginBottom: theme.spacing.xs,
  },
  streakValue: {
    fontSize: theme.fontSize.xl,
    fontWeight: 'bold',
    color: theme.colors.warning,
  },
  streakBadge: {
    marginLeft: theme.spacing.md,
  },
  streakProgress: {
    marginBottom: theme.spacing.lg,
  },
  streakProgressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  streakProgressLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.gray[600],
  },
  streakProgressValue: {
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
    color: theme.colors.warning,
  },
  streakProgressBar: {
    height: 8,
    backgroundColor: theme.colors.gray[200],
    borderRadius: 4,
  },
  streakProgressFill: {
    height: '100%',
    borderRadius: 4,
  },
  streakStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: theme.spacing.lg,
  },
  streakStat: {
    alignItems: 'center',
  },
  streakStatValue: {
    fontSize: theme.fontSize.lg,
    fontWeight: 'bold',
    color: theme.colors.black,
  },
  streakStatLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.gray[600],
    marginTop: theme.spacing.xs,
  },
  streakRewards: {
    marginTop: theme.spacing.md,
  },
  streakRewardsTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: '600',
    color: theme.colors.black,
    marginBottom: theme.spacing.md,
  },
  streakRewardsList: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  streakReward: {
    alignItems: 'center',
    opacity: 0.5,
  },
  streakRewardUnlocked: {
    opacity: 1,
  },
  streakRewardIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  streakRewardText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.gray[600],
  },
  streakRewardTextUnlocked: {
    color: theme.colors.warning,
    fontWeight: '600',
  },
  achievementsSection: {
    padding: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: '600',
    color: theme.colors.black,
    marginBottom: theme.spacing.xs,
  },
  sectionSubtitle: {
    fontSize: theme.fontSize.md,
    color: theme.colors.gray[600],
  },
  achievementsList: {
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  achievementCard: {
    marginBottom: theme.spacing.md,
  },
  achievementCardContent: {
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 2,
    borderColor: theme.colors.gray[200],
    backgroundColor: theme.colors.white,
  },
  achievementUnlocked: {
    borderColor: theme.colors.success,
    backgroundColor: theme.colors.successLight,
  },
  achievementNew: {
    borderColor: theme.colors.warning,
    backgroundColor: theme.colors.warningLight,
  },
  achievementHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  achievementIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: '600',
    color: theme.colors.black,
    marginBottom: theme.spacing.xs,
  },
  achievementTitleLocked: {
    color: theme.colors.gray[500],
  },
  achievementDescription: {
    fontSize: theme.fontSize.md,
    color: theme.colors.gray[600],
  },
  achievementDescriptionLocked: {
    color: theme.colors.gray[400],
  },
  achievementBadge: {
    marginLeft: theme.spacing.md,
  },
  achievementProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  achievementProgressBar: {
    flex: 1,
    height: 6,
    backgroundColor: theme.colors.gray[200],
    borderRadius: 3,
    marginRight: theme.spacing.sm,
  },
  achievementProgressFill: {
    height: '100%',
    borderRadius: 3,
  },
  achievementProgressText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.gray[600],
    minWidth: 40,
    textAlign: 'right',
  },
  achievementReward: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.xs,
  },
  achievementRewardText: {
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
    color: theme.colors.warning,
  },
  categoriesSection: {
    padding: theme.spacing.lg,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
  },
  categoryCard: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.gray[50],
    borderRadius: theme.borderRadius.lg,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  categoryName: {
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
    color: theme.colors.black,
    marginBottom: theme.spacing.xs,
  },
  categoryCount: {
    fontSize: theme.fontSize.lg,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
});
