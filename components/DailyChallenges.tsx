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
import { useGameState } from '@/hooks/useGameState';
import useEnhancedGamification from "@/hooks/useEnhancedGamification";
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { ProgressBar } from '@/components/ProgressBar';
import { Badge } from '@/components/Badge';
import { 
  TargetIcon, 
  StarIcon, 
  BookOpenIcon,
  FlameIcon,
  ClockIcon,
  TrophyIcon,
  AwardIcon,
  ZapIcon,
  CalendarIcon,
  CheckIcon,
  XIcon,
  GemIcon,
  HeartIcon,
} from '@/components/icons/LucideReplacement';
// import { cefrLessonService } from '@/services/cefrLessonService';
// import { cefrVocabularyService } from '@/services/cefrVocabularyService';

const { width } = Dimensions.get('window');

interface DailyChallenge {
  id: string;
  title: string;
  description: string;
  type: 'lesson' | 'vocabulary' | 'streak' | 'accuracy' | 'time' | 'xp';
  target: number;
  current: number;
  reward: number;
  rewardType: 'xp' | 'gems' | 'hearts';
  completed: boolean;
  expiresAt: Date;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  isNew: boolean;
}

interface WeeklyChallenge {
  id: string;
  title: string;
  description: string;
  type: 'lessons' | 'vocabulary' | 'streak' | 'accuracy';
  target: number;
  current: number;
  reward: number;
  rewardType: 'xp' | 'gems' | 'hearts';
  completed: boolean;
  expiresAt: Date;
  difficulty: 'easy' | 'medium' | 'hard';
  progress: number;
}

interface DailyChallengesProps {
  onChallengePress?: (challenge: DailyChallenge) => void;
  onWeeklyChallengePress?: (challenge: WeeklyChallenge) => void;
}

export default function DailyChallenges({
  onChallengePress,
  onWeeklyChallengePress,
}: DailyChallengesProps) {
  const { t } = useI18n();
  const { user, signIn, signOut, signUp, resetPassword, updateUser } = useUnifiedAuth();
  const { getUserProgress } = useGameState();
  const { awardXP, completeLesson, acceptChallenge, createChallenge, generateDailyChallenges, refreshStats } = useEnhancedGamification();

  const [dailyChallenges, setDailyChallenges] = useState<DailyChallenge[]>([]);
  const [weeklyChallenges, setWeeklyChallenges] = useState<WeeklyChallenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [animationValue] = useState(new Animated.Value(0));
  const [selectedTab, setSelectedTab] = useState<'daily' | 'weekly'>('daily');

  useEffect(() => {
    loadChallenges();
    animateComponents();
  }, []);

  const animateComponents = () => {
    Animated.timing(animationValue, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  };

  const loadChallenges = async () => {
    try {
      setLoading(true);
      
      if (!user) return;

      const userProgress = await getUserProgress(user.id);
      const userStreak = 0; // Mock implementation
      const userXP = 0; // Mock implementation
      const userLevel = 1; // Mock implementation

      // Generate daily challenges
      const daily: DailyChallenge[] = [
        {
          id: 'daily_lesson',
          title: 'Complete a Lesson',
          description: 'Finish one lesson today to keep your streak alive',
          type: 'lesson',
          target: 1,
          current: userProgress.dailyLessonsCompleted || 0,
          reward: 50,
          rewardType: 'xp',
          completed: (userProgress.dailyLessonsCompleted || 0) >= 1,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
          difficulty: 'easy',
          category: 'Learning',
          isNew: false,
        },
        {
          id: 'daily_vocabulary',
          title: 'Learn 5 Words',
          description: 'Master 5 new vocabulary words',
          type: 'vocabulary',
          target: 5,
          current: userProgress.dailyWordsLearned || 0,
          reward: 30,
          rewardType: 'xp',
          completed: (userProgress.dailyWordsLearned || 0) >= 5,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
          difficulty: 'easy',
          category: 'Vocabulary',
          isNew: false,
        },
        {
          id: 'daily_streak',
          title: 'Maintain Streak',
          description: 'Keep your learning streak alive',
          type: 'streak',
          target: userStreak + 1,
          current: userStreak,
          reward: 20,
          rewardType: 'xp',
          completed: userStreak > 0,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
          difficulty: 'medium',
          category: 'Streak',
          isNew: false,
        },
        {
          id: 'daily_accuracy',
          title: 'High Accuracy',
          description: 'Achieve 80% accuracy in today\'s lessons',
          type: 'accuracy',
          target: 80,
          current: userProgress.dailyAccuracy || 0,
          reward: 40,
          rewardType: 'gems',
          completed: (userProgress.dailyAccuracy || 0) >= 80,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
          difficulty: 'medium',
          category: 'Accuracy',
          isNew: false,
        },
        {
          id: 'daily_time',
          title: 'Study Time',
          description: 'Spend 15 minutes studying today',
          type: 'time',
          target: 15,
          current: Math.round((userProgress.dailyStudyTime || 0) / 60),
          reward: 25,
          rewardType: 'xp',
          completed: Math.round((userProgress.dailyStudyTime || 0) / 60) >= 15,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
          difficulty: 'easy',
          category: 'Study Time',
          isNew: false,
        },
      ];

      // Generate weekly challenges
      const weekly: WeeklyChallenge[] = [
        {
          id: 'weekly_lessons',
          title: 'Lesson Master',
          description: 'Complete 10 lessons this week',
          type: 'lessons',
          target: 10,
          current: userProgress.weeklyLessonsCompleted || 0,
          reward: 200,
          rewardType: 'xp',
          completed: (userProgress.weeklyLessonsCompleted || 0) >= 10,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          difficulty: 'medium',
          progress: Math.min(((userProgress.weeklyLessonsCompleted || 0) / 10) * 100, 100),
        },
        {
          id: 'weekly_vocabulary',
          title: 'Vocabulary Builder',
          description: 'Learn 50 new words this week',
          type: 'vocabulary',
          target: 50,
          current: userProgress.weeklyWordsLearned || 0,
          reward: 300,
          rewardType: 'gems',
          completed: (userProgress.weeklyWordsLearned || 0) >= 50,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          difficulty: 'hard',
          progress: Math.min(((userProgress.weeklyWordsLearned || 0) / 50) * 100, 100),
        },
        {
          id: 'weekly_streak',
          title: 'Streak Champion',
          description: 'Maintain a 7-day streak',
          type: 'streak',
          target: 7,
          current: userStreak,
          reward: 150,
          rewardType: 'hearts',
          completed: userStreak >= 7,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          difficulty: 'hard',
          progress: Math.min((userStreak / 7) * 100, 100),
        },
      ];

      setDailyChallenges(daily);
      setWeeklyChallenges(weekly);

    } catch (error) {
      console.error('Error loading challenges:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (difficulty: string): string => {
    const colors = {
      easy: theme.colors.success,
      medium: theme.colors.warning,
      hard: theme.colors.danger,
    };
    return colors[difficulty as keyof typeof colors] || theme.colors.gray[500];
  };

  const getRewardIcon = (rewardType: string) => {
    switch (rewardType) {
      case 'xp':
        return <StarIcon size={16} color={theme.colors.warning} />;
      case 'gems':
        return <GemIcon size={16} color={theme.colors.info} />;
      case 'hearts':
        return <HeartIcon size={16} color={theme.colors.danger} />;
      default:
        return <AwardIcon size={16} color={theme.colors.primary} />;
    }
  };

  const getChallengeIcon = (type: string) => {
    switch (type) {
      case 'lesson':
        return <BookOpenIcon size={24} color={theme.colors.primary} />;
      case 'vocabulary':
        return <StarIcon size={24} color={theme.colors.success} />;
      case 'streak':
        return <FlameIcon size={24} color={theme.colors.warning} />;
      case 'accuracy':
        return <TargetIcon size={24} color={theme.colors.info} />;
      case 'time':
        return <ClockIcon size={24} color={theme.colors.gray[600]} />;
      case 'xp':
        return <ZapIcon size={24} color={theme.colors.warning} />;
      default:
        return <TrophyIcon size={24} color={theme.colors.primary} />;
    }
  };

  const getTimeRemaining = (expiresAt: Date): string => {
    const now = new Date();
    const diff = expiresAt.getTime() - now.getTime();
    
    if (diff <= 0) return 'Expired';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  };

  const renderDailyChallenge = (challenge: DailyChallenge, index: number) => (
    <Animated.View
      key={challenge.id}
      style={[
        styles.challengeCard,
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
          styles.challengeCardContent,
          challenge.completed && styles.challengeCompleted,
          challenge.isNew && styles.challengeNew,
        ]}
        onPress={() => onChallengePress?.(challenge)}
        activeOpacity={0.7}
      >
        <View style={styles.challengeHeader}>
          <View style={styles.challengeIcon}>
            {getChallengeIcon(challenge.type)}
          </View>
          
          <View style={styles.challengeInfo}>
            <View style={styles.challengeTitleRow}>
              <Text style={[
                styles.challengeTitle,
                challenge.completed && styles.challengeTitleCompleted,
              ]}>
                {challenge.title}
              </Text>
              {challenge.completed && (
                <CheckIcon size={20} color={theme.colors.success} />
              )}
            </View>
            
            <Text style={[
              styles.challengeDescription,
              challenge.completed && styles.challengeDescriptionCompleted,
            ]}>
              {challenge.description}
            </Text>
          </View>
          
          <View style={styles.challengeBadge}>
            <Badge
              text={challenge.difficulty}
              color={getDifficultyColor(challenge.difficulty)}
              size="small"
            />
          </View>
        </View>

        <View style={styles.challengeProgress}>
          <View style={styles.challengeProgressHeader}>
            <Text style={styles.challengeProgressLabel}>
              {challenge.current}/{challenge.target}
            </Text>
            <Text style={styles.challengeTimeRemaining}>
              {getTimeRemaining(challenge.expiresAt)}
            </Text>
          </View>
          
          <ProgressBar
            progress={(challenge.current / challenge.target) * 100}
            height={8}
            color={challenge.completed ? theme.colors.success : getDifficultyColor(challenge.difficulty)}
            style={styles.challengeProgressBar}
          />
        </View>

        <View style={styles.challengeFooter}>
          <View style={styles.challengeReward}>
            {getRewardIcon(challenge.rewardType)}
            <Text style={styles.challengeRewardText}>
              +{challenge.reward} {challenge.rewardType.toUpperCase()}
            </Text>
          </View>
          
          <View style={styles.challengeCategory}>
            <Text style={styles.challengeCategoryText}>
              {challenge.category}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderWeeklyChallenge = (challenge: WeeklyChallenge, index: number) => (
    <Animated.View
      key={challenge.id}
      style={[
        styles.challengeCard,
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
          styles.challengeCardContent,
          challenge.completed && styles.challengeCompleted,
        ]}
        onPress={() => onWeeklyChallengePress?.(challenge)}
        activeOpacity={0.7}
      >
        <View style={styles.challengeHeader}>
          <View style={styles.challengeIcon}>
            {getChallengeIcon(challenge.type)}
          </View>
          
          <View style={styles.challengeInfo}>
            <View style={styles.challengeTitleRow}>
              <Text style={[
                styles.challengeTitle,
                challenge.completed && styles.challengeTitleCompleted,
              ]}>
                {challenge.title}
              </Text>
              {challenge.completed && (
                <CheckIcon size={20} color={theme.colors.success} />
              )}
            </View>
            
            <Text style={[
              styles.challengeDescription,
              challenge.completed && styles.challengeDescriptionCompleted,
            ]}>
              {challenge.description}
            </Text>
          </View>
          
          <View style={styles.challengeBadge}>
            <Badge
              text={challenge.difficulty}
              color={getDifficultyColor(challenge.difficulty)}
              size="small"
            />
          </View>
        </View>

        <View style={styles.challengeProgress}>
          <View style={styles.challengeProgressHeader}>
            <Text style={styles.challengeProgressLabel}>
              {challenge.current}/{challenge.target}
            </Text>
            <Text style={styles.challengeTimeRemaining}>
              {getTimeRemaining(challenge.expiresAt)}
            </Text>
          </View>
          
          <ProgressBar
            progress={challenge.progress}
            height={8}
            color={challenge.completed ? theme.colors.success : getDifficultyColor(challenge.difficulty)}
            style={styles.challengeProgressBar}
          />
        </View>

        <View style={styles.challengeFooter}>
          <View style={styles.challengeReward}>
            {getRewardIcon(challenge.rewardType)}
            <Text style={styles.challengeRewardText}>
              +{challenge.reward} {challenge.rewardType.toUpperCase()}
            </Text>
          </View>
          
          <View style={styles.challengeCategory}>
            <Text style={styles.challengeCategoryText}>
              Weekly Challenge
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading challenges...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Tab Selector */}
      <View style={styles.tabSelector}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            selectedTab === 'daily' && styles.tabButtonActive,
          ]}
          onPress={() => setSelectedTab('daily')}
        >
          <Text style={[
            styles.tabButtonText,
            selectedTab === 'daily' && styles.tabButtonTextActive,
          ]}>
            Daily
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.tabButton,
            selectedTab === 'weekly' && styles.tabButtonActive,
          ]}
          onPress={() => setSelectedTab('weekly')}
        >
          <Text style={[
            styles.tabButtonText,
            selectedTab === 'weekly' && styles.tabButtonTextActive,
          ]}>
            Weekly
          </Text>
        </TouchableOpacity>
      </View>

      {/* Challenges List */}
      <ScrollView style={styles.challengesList} showsVerticalScrollIndicator={false}>
        {selectedTab === 'daily' ? (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Daily Challenges</Text>
              <Text style={styles.sectionSubtitle}>
                {dailyChallenges.filter(c => c.completed).length} of {dailyChallenges.length} completed
              </Text>
            </View>
            
            {dailyChallenges.map(renderDailyChallenge)}
          </>
        ) : (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Weekly Challenges</Text>
              <Text style={styles.sectionSubtitle}>
                {weeklyChallenges.filter(c => c.completed).length} of {weeklyChallenges.length} completed
              </Text>
            </View>
            
            {weeklyChallenges.map(renderWeeklyChallenge)}
          </>
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
  tabSelector: {
    flexDirection: 'row',
    margin: theme.spacing.lg,
    backgroundColor: theme.colors.gray[100],
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.xs,
  },
  tabButton: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
  },
  tabButtonActive: {
    backgroundColor: theme.colors.white,
    shadowColor: theme.colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tabButtonText: {
    fontSize: theme.fontSize.md,
    fontWeight: '500',
    color: theme.colors.gray[600],
  },
  tabButtonTextActive: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
  challengesList: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
  },
  sectionHeader: {
    marginBottom: theme.spacing.lg,
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
  challengeCard: {
    marginBottom: theme.spacing.md,
  },
  challengeCardContent: {
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 2,
    borderColor: theme.colors.gray[200],
    backgroundColor: theme.colors.white,
  },
  challengeCompleted: {
    borderColor: theme.colors.success,
    backgroundColor: theme.colors.successLight,
  },
  challengeNew: {
    borderColor: theme.colors.warning,
    backgroundColor: theme.colors.warningLight,
  },
  challengeHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.md,
  },
  challengeIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: theme.colors.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  challengeInfo: {
    flex: 1,
  },
  challengeTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  challengeTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: '600',
    color: theme.colors.black,
    flex: 1,
  },
  challengeTitleCompleted: {
    color: theme.colors.success,
  },
  challengeDescription: {
    fontSize: theme.fontSize.md,
    color: theme.colors.gray[600],
    lineHeight: 20,
  },
  challengeDescriptionCompleted: {
    color: theme.colors.gray[500],
  },
  challengeBadge: {
    marginLeft: theme.spacing.md,
  },
  challengeProgress: {
    marginBottom: theme.spacing.md,
  },
  challengeProgressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  challengeProgressLabel: {
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
    color: theme.colors.black,
  },
  challengeTimeRemaining: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.gray[600],
  },
  challengeProgressBar: {
    marginBottom: theme.spacing.sm,
  },
  challengeFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  challengeReward: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  challengeRewardText: {
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
    color: theme.colors.warning,
  },
  challengeCategory: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    backgroundColor: theme.colors.gray[100],
    borderRadius: theme.borderRadius.sm,
  },
  challengeCategoryText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.gray[600],
    fontWeight: '500',
  },
});
