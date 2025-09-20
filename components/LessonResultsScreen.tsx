import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ScrollView,
  Dimensions,
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
  CheckIcon, 
  XIcon, 
  StarIcon, 
  HeartIcon, 
  TrophyIcon, 
  TargetIcon,
  ClockIcon,
  TrendingUpIcon,
  AwardIcon,
  ShareIcon,
} from '@/components/icons/LucideReplacement';
import { MultilingualLesson } from '@/types';

const { width } = Dimensions.get('window');

interface ExerciseResult {
  id: string;
  type: string;
  isCorrect: boolean;
  timeSpent: number;
  xpEarned: number;
  attempts: number;
}

interface LessonResultsScreenProps {
  lesson: MultilingualLesson;
  results: ExerciseResult[];
  totalTimeSpent: number;
  totalXPEarned: number;
  accuracy: number;
  onContinue?: () => void;
  onRetry?: () => void;
  onShare?: () => void;
}

export default function LessonResultsScreen({
  lesson,
  results,
  totalTimeSpent,
  totalXPEarned,
  accuracy,
  onContinue,
  onRetry,
  onShare,
}: LessonResultsScreenProps) {
  const { t } = useI18n();
  const router = useRouter();
  const { user, signIn, signOut, signUp, resetPassword, updateUser } = useUnifiedAuth();
  const { completeLesson } = useGameState();
  // const { awardXP, completeLesson, acceptChallenge, createChallenge, generateDailyChallenges, refreshStats } = useEnhancedGamification();

  const [userLevel, setUserLevel] = useState(1);
  const [userXP, setUserXP] = useState(0);
  const [levelUp, setLevelUp] = useState(false);
  const [newLevel, setNewLevel] = useState(1);
  const [achievements, setAchievements] = useState<string[]>([]);
  const [animationValue] = useState(new Animated.Value(0));
  const [progressAnimation] = useState(new Animated.Value(0));

  useEffect(() => {
    loadUserData();
    animateResults();
    checkAchievements();
  }, []);

  const loadUserData = async () => {
    try {
      if (user) {
        const level = 1; // Mock implementation
        const xp = 0; // Mock implementation
        setUserLevel(level);
        setUserXP(xp);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const animateResults = () => {
    Animated.sequence([
      Animated.timing(animationValue, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(progressAnimation, {
        toValue: accuracy / 100,
        duration: 1000,
        useNativeDriver: false,
      }),
    ]).start();
  };

  const checkAchievements = () => {
    const newAchievements: string[] = [];

    // Check for various achievements
    if (accuracy === 100) {
      newAchievements.push('Perfect Score');
    }
    if (totalTimeSpent < 300) { // Less than 5 minutes
      newAchievements.push('Speed Demon');
    }
    if (results.every(result => result.isCorrect)) {
      newAchievements.push('No Mistakes');
    }
    if (totalXPEarned >= 100) {
      newAchievements.push('XP Master');
    }

    setAchievements(newAchievements);
  };

  const getContentInLanguage = (content: any, language: string = 'en'): string => {
    if (typeof content === 'string') return content;
    return content[language] || content.en || '';
  };

  const getAccuracyColor = (accuracy: number): string => {
    if (accuracy >= 90) return theme.colors.success;
    if (accuracy >= 70) return theme.colors.warning;
    return theme.colors.danger;
  };

  const getAccuracyText = (accuracy: number): string => {
    if (accuracy >= 90) return 'Excellent!';
    if (accuracy >= 70) return 'Good job!';
    if (accuracy >= 50) return 'Keep practicing!';
    return 'Try again!';
  };

  const handleContinue = () => {
    if (onContinue) {
      onContinue();
    } else {
      router.back();
    }
  };

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      router.push(`/lesson/${lesson.id}` as any);
    }
  };

  const handleShare = () => {
    if (onShare) {
      onShare();
    } else {
      // Implement sharing functionality
      console.debug('Sharing lesson results');
    }
  };

  const renderExerciseResult = (result: ExerciseResult, index: number) => (
    <View key={result.id} style={styles.exerciseResult}>
      <View style={styles.exerciseResultHeader}>
        <Text style={styles.exerciseNumber}>Exercise {index + 1}</Text>
        <Badge
          text={result.type}
          color={theme.colors.primary}
          size="small"
        />
      </View>
      
      <View style={styles.exerciseResultContent}>
        <View style={styles.exerciseResultIcon}>
          {result.isCorrect ? (
            <CheckIcon size={20} color={theme.colors.success} />
          ) : (
            <XIcon size={20} color={theme.colors.danger} />
          )}
        </View>
        
        <View style={styles.exerciseResultStats}>
          <View style={styles.exerciseStat}>
            <ClockIcon size={16} color={theme.colors.gray[500]} />
            <Text style={styles.exerciseStatText}>{result.timeSpent}s</Text>
          </View>
          <View style={styles.exerciseStat}>
            <StarIcon size={16} color={theme.colors.warning} />
            <Text style={styles.exerciseStatText}>+{result.xpEarned} XP</Text>
          </View>
        </View>
      </View>
    </View>
  );

  const renderAchievement = (achievement: string, index: number) => (
    <Animated.View
      key={achievement}
      style={[
        styles.achievement,
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
      <AwardIcon size={24} color={theme.colors.warning} />
      <Text style={styles.achievementText}>{achievement}</Text>
    </Animated.View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.primaryDark]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TrophyIcon size={48} color={theme.colors.white} />
          <Text style={styles.headerTitle}>Lesson Complete!</Text>
          <Text style={styles.headerSubtitle}>
            {getContentInLanguage(lesson.title, 'en')}
          </Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Overall Results */}
        <Card style={styles.resultsCard}>
          <View style={styles.resultsHeader}>
            <Text style={styles.resultsTitle}>Your Results</Text>
            <Text style={[
              styles.accuracyText,
              { color: getAccuracyColor(accuracy) },
            ]}>
              {getAccuracyText(accuracy)}
            </Text>
          </View>

          <View style={styles.accuracyContainer}>
            <Animated.View style={styles.accuracyCircle}>
              <ProgressBar
                progress={accuracy}
                size={120}
                color={getAccuracyColor(accuracy)}
                showPercentage
              />
            </Animated.View>
          </View>

          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <TargetIcon size={24} color={theme.colors.primary} />
              <Text style={styles.statValue}>{accuracy}%</Text>
              <Text style={styles.statLabel}>Accuracy</Text>
            </View>
            <View style={styles.statItem}>
              <ClockIcon size={24} color={theme.colors.primary} />
              <Text style={styles.statValue}>{Math.floor(totalTimeSpent / 60)}m {totalTimeSpent % 60}s</Text>
              <Text style={styles.statLabel}>Time</Text>
            </View>
            <View style={styles.statItem}>
              <StarIcon size={24} color={theme.colors.warning} />
              <Text style={styles.statValue}>+{totalXPEarned}</Text>
              <Text style={styles.statLabel}>XP Earned</Text>
            </View>
            <View style={styles.statItem}>
              <CheckIcon size={24} color={theme.colors.success} />
              <Text style={styles.statValue}>{results.filter(r => r.isCorrect).length}/{results.length}</Text>
              <Text style={styles.statLabel}>Correct</Text>
            </View>
          </View>
        </Card>

        {/* Achievements */}
        {achievements.length > 0 && (
          <Card style={styles.achievementsCard}>
            <Text style={styles.achievementsTitle}>Achievements Unlocked!</Text>
            <View style={styles.achievementsList}>
              {achievements.map(renderAchievement)}
            </View>
          </Card>
        )}

        {/* Exercise Breakdown */}
        <Card style={styles.exercisesCard}>
          <Text style={styles.exercisesTitle}>Exercise Breakdown</Text>
          <View style={styles.exercisesList}>
            {results.map(renderExerciseResult)}
          </View>
        </Card>

        {/* Vocabulary Learned */}
        <Card style={styles.vocabularyCard}>
          <Text style={styles.vocabularyTitle}>Words You Learned</Text>
          <View style={styles.vocabularyGrid}>
            {lesson.vocabularyIntroduced.slice(0, 6).map((word, index) => (
              <View key={index} style={styles.vocabularyItem}>
                <Text style={styles.vocabularyWord}>{word.word}</Text>
                <Text style={styles.vocabularyTranslation}>{word.translation}</Text>
              </View>
            ))}
          </View>
        </Card>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <Button
            title="Continue Learning"
            onPress={handleContinue}
            style={styles.continueButton}
          />
          
          <View style={styles.secondaryButtons}>
            <Button
              title="Retry Lesson"
              onPress={handleRetry}
              variant="outline"
              style={styles.retryButton}
            />
            
            <TouchableOpacity
              style={styles.shareButton}
              onPress={handleShare}
            >
              <ShareIcon size={20} color={theme.colors.primary} />
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
  header: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.xl,
    alignItems: 'center',
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: theme.fontSize.xxl,
    fontWeight: 'bold',
    color: theme.colors.white,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.xs,
  },
  headerSubtitle: {
    fontSize: theme.fontSize.md,
    color: theme.colors.white,
    opacity: 0.9,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
  },
  resultsCard: {
    marginTop: -theme.spacing.xl,
    marginBottom: theme.spacing.lg,
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  resultsTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: '600',
    color: theme.colors.black,
  },
  accuracyText: {
    fontSize: theme.fontSize.lg,
    fontWeight: '600',
  },
  accuracyContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  accuracyCircle: {
    width: 120,
    height: 120,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
  },
  statItem: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.gray[50],
    borderRadius: theme.borderRadius.lg,
  },
  statValue: {
    fontSize: theme.fontSize.lg,
    fontWeight: '600',
    color: theme.colors.black,
    marginTop: theme.spacing.sm,
  },
  statLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.gray[600],
    marginTop: theme.spacing.xs,
  },
  achievementsCard: {
    marginBottom: theme.spacing.lg,
  },
  achievementsTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: '600',
    color: theme.colors.black,
    marginBottom: theme.spacing.md,
  },
  achievementsList: {
    gap: theme.spacing.sm,
  },
  achievement: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.warningLight,
    borderRadius: theme.borderRadius.lg,
  },
  achievementText: {
    fontSize: theme.fontSize.md,
    fontWeight: '500',
    color: theme.colors.warning,
  },
  exercisesCard: {
    marginBottom: theme.spacing.lg,
  },
  exercisesTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: '600',
    color: theme.colors.black,
    marginBottom: theme.spacing.md,
  },
  exercisesList: {
    gap: theme.spacing.md,
  },
  exerciseResult: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.gray[50],
    borderRadius: theme.borderRadius.lg,
  },
  exerciseResultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  exerciseNumber: {
    fontSize: theme.fontSize.md,
    fontWeight: '500',
    color: theme.colors.black,
  },
  exerciseResultContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  exerciseResultIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  exerciseResultStats: {
    flex: 1,
    flexDirection: 'row',
    gap: theme.spacing.lg,
  },
  exerciseStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  exerciseStatText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.gray[600],
  },
  vocabularyCard: {
    marginBottom: theme.spacing.lg,
  },
  vocabularyTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: '600',
    color: theme.colors.black,
    marginBottom: theme.spacing.md,
  },
  vocabularyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  vocabularyItem: {
    flex: 1,
    minWidth: '45%',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.gray[50],
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
  },
  vocabularyWord: {
    fontSize: theme.fontSize.md,
    fontWeight: '600',
    color: theme.colors.black,
    marginBottom: theme.spacing.xs,
  },
  vocabularyTranslation: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.gray[600],
  },
  actionButtons: {
    marginBottom: theme.spacing.xl,
  },
  continueButton: {
    marginBottom: theme.spacing.md,
  },
  secondaryButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  retryButton: {
    flex: 1,
  },
  shareButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
});
