import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Alert,
  ScrollView,
  Dimensions,
} from 'react-native';
import { theme } from '@/constants/theme';
import { useI18n } from '@/hooks/useI18n';
import useEnhancedGamification from "@/hooks/useEnhancedGamification";
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Badge } from '@/components/Badge';
import { CheckIcon, XIcon, StarIcon, HeartIcon, ShuffleIcon } from '@/components/icons/LucideReplacement';
import { MultilingualExercise, MultilingualContent } from '@/types';

const { width } = Dimensions.get('window');

interface MatchItem {
  id: string;
  text: string;
  isSelected: boolean;
  isMatched: boolean;
  pairId: string;
}

interface MatchExerciseProps {
  exercise: MultilingualExercise;
  onComplete: (isCorrect: boolean, timeSpent: number) => void;
  onNext: () => void;
  userAnswer?: string;
  isSubmitted?: boolean;
  showFeedback?: boolean;
}

export default function MatchExercise({
  exercise,
  onComplete,
  onNext,
  userAnswer: initialAnswer,
  isSubmitted: initialSubmitted,
  showFeedback: initialShowFeedback,
}: MatchExerciseProps) {
  const { t } = useI18n();
  const { awardXP, completeLesson, acceptChallenge, createChallenge, generateDailyChallenges, refreshStats } = useEnhancedGamification();

  const [leftItems, setLeftItems] = useState<MatchItem[]>([]);
  const [rightItems, setRightItems] = useState<MatchItem[]>([]);
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [selectedRight, setSelectedRight] = useState<string | null>(null);
  const [matches, setMatches] = useState<Record<string, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(initialSubmitted || false);
  const [showFeedback, setShowFeedback] = useState(initialShowFeedback || false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [timeSpent, setTimeSpent] = useState(0);
  const [hearts, setHearts] = useState(5);
  const [animationValue] = useState(new Animated.Value(0));

  useEffect(() => {
    loadUserHearts();
    startTimer();
    initializeItems();
  }, []);

  useEffect(() => {
    if (isSubmitted) {
      animateFeedback();
    }
  }, [isSubmitted]);

  const loadUserHearts = async () => {
    try {
      const userHearts = 5; // Mock implementation
      setHearts(userHearts);
    } catch (error) {
      console.error('Error loading user hearts:', error);
    }
  };

  const startTimer = () => {
    const timer = setInterval(() => {
      setTimeSpent(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  };

  const getContentInLanguage = (content: MultilingualContent, language: string = 'en'): string => {
    if (typeof content === 'string') return content;
    return content[language] || content.en || '';
  };

  const initializeItems = () => {
    // Parse the correct answer to create match pairs
    const correctAnswer = exercise.correctAnswer as string[];
    const leftItems: MatchItem[] = [];
    const rightItems: MatchItem[] = [];

    correctAnswer.forEach((pair, index) => {
      const [left, right] = pair.split('-');
      const leftId = `left_${index}`;
      const rightId = `right_${index}`;

      leftItems.push({
        id: leftId,
        text: left,
        isSelected: false,
        isMatched: false,
        pairId: `pair_${index}`,
      });

      rightItems.push({
        id: rightId,
        text: right,
        isSelected: false,
        isMatched: false,
        pairId: `pair_${index}`,
      });
    });

    // Shuffle the right items
    const shuffledRight = [...rightItems].sort(() => Math.random() - 0.5);

    setLeftItems(leftItems);
    setRightItems(shuffledRight);
  };

  const handleItemSelect = (itemId: string, side: 'left' | 'right') => {
    if (isSubmitted) return;

    if (side === 'left') {
      if (selectedLeft === itemId) {
        setSelectedLeft(null);
      } else {
        setSelectedLeft(itemId);
        setSelectedRight(null);
      }
    } else {
      if (selectedRight === itemId) {
        setSelectedRight(null);
      } else {
        setSelectedRight(itemId);
      }
    }
  };

  const handleMatch = () => {
    if (!selectedLeft || !selectedRight) return;

    const leftItem = leftItems.find(item => item.id === selectedLeft);
    const rightItem = rightItems.find(item => item.id === selectedRight);

    if (leftItem && rightItem && leftItem.pairId === rightItem.pairId) {
      // Correct match
      setLeftItems(prev => prev.map(item => 
        item.id === selectedLeft ? { ...item, isMatched: true, isSelected: false } : item,
      ));
      setRightItems(prev => prev.map(item => 
        item.id === selectedRight ? { ...item, isMatched: true, isSelected: false } : item,
      ));
      setMatches(prev => ({ ...prev, [selectedLeft]: selectedRight }));
    } else {
      // Incorrect match
      const newHearts = hearts - 1;
      setHearts(newHearts);
      
      if (newHearts === 0) {
        Alert.alert(
          'Out of Hearts!',
          'You need to wait or buy more hearts to continue.',
          [{ text: 'OK' }],
        );
      }
    }

    setSelectedLeft(null);
    setSelectedRight(null);
  };

  const handleSubmit = async () => {
    const allMatched = leftItems.every(item => item.isMatched);
    setIsSubmitted(true);
    setIsCorrect(allMatched);
    setShowFeedback(true);

    if (allMatched) {
      await awardXP(exercise.xpReward, 'exercise_completion');
    }

    onComplete(allMatched, timeSpent);
  };

  const handleShuffle = () => {
    const shuffledRight = [...rightItems].sort(() => Math.random() - 0.5);
    setRightItems(shuffledRight);
  };

  const animateFeedback = () => {
    Animated.spring(animationValue, {
      toValue: 1,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();
  };

  const getItemStyle = (item: MatchItem, side: 'left' | 'right') => {
    const baseStyle = [styles.matchItem];
    
    if (item.isMatched) {
      baseStyle.push(styles.matchedItem as any);
    } else if ((side === 'left' && selectedLeft === item.id) || 
               (side === 'right' && selectedRight === item.id)) {
      baseStyle.push(styles.selectedItem as any);
    }

    return baseStyle;
  };

  const getItemTextStyle = (item: MatchItem) => {
    const baseStyle = [styles.matchItemText];
    
    if (item.isMatched) {
      baseStyle.push(styles.matchedItemText as any);
    }

    return baseStyle;
  };

  const renderFeedback = () => {
    if (!showFeedback) return null;

    return (
      <Animated.View
        style={[
          styles.feedbackContainer,
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
        <Card style={[
          styles.feedbackCard,
          isCorrect ? styles.correctFeedback : styles.incorrectFeedback,
        ] as any}>
          <View style={styles.feedbackHeader}>
            {isCorrect ? (
              <CheckIcon size={24} color={theme.colors.success} />
            ) : (
              <XIcon size={24} color={theme.colors.danger} />
            )}
            <Text style={[
              styles.feedbackTitle,
              isCorrect ? styles.correctFeedbackTitle : styles.incorrectFeedbackTitle,
            ]}>
              {isCorrect ? 'All Matched!' : 'Incomplete'}
            </Text>
          </View>

          {exercise.explanation && (
            <Text style={styles.feedbackExplanation}>
              {getContentInLanguage(exercise.explanation, 'en')}
            </Text>
          )}

          <View style={styles.feedbackStats}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{timeSpent}s</Text>
              <Text style={styles.statLabel}>Time</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {isCorrect ? `+${exercise.xpReward}` : '0'}
              </Text>
              <Text style={styles.statLabel}>XP</Text>
            </View>
            <View style={styles.statItem}>
              <HeartIcon size={16} color={theme.colors.danger} />
              <Text style={styles.statLabel}>{hearts}</Text>
            </View>
          </View>

          <Button
            title="Continue"
            onPress={onNext}
            style={styles.continueButton}
          />
        </Card>
      </Animated.View>
    );
  };

  const allMatched = leftItems.every(item => item.isMatched);

  return (
    <View style={styles.container}>
      <Card style={styles.exerciseCard}>
        <View style={styles.exerciseHeader}>
          <Badge
            text="Match Items"
            color={theme.colors.primary}
            size="small"
          />
          <View style={styles.difficultyContainer}>
            <StarIcon size={16} color={theme.colors.warning} />
            <Text style={styles.difficultyText}>{exercise.difficulty}/5</Text>
          </View>
        </View>

        <Text style={styles.instruction}>
          {getContentInLanguage(exercise.instruction, 'en')}
        </Text>

        <Text style={styles.question}>
          {getContentInLanguage(exercise.question, 'en')}
        </Text>

        <View style={styles.matchContainer}>
          <View style={styles.matchColumn}>
            <Text style={styles.columnTitle}>Column A</Text>
            {leftItems.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={getItemStyle(item, 'left')}
                onPress={() => handleItemSelect(item.id, 'left')}
                disabled={item.isMatched || isSubmitted}
              >
                <Text style={getItemTextStyle(item)}>{item.text}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.matchColumn}>
            <View style={styles.columnHeader}>
              <Text style={styles.columnTitle}>Column B</Text>
              <TouchableOpacity
                style={styles.shuffleButton}
                onPress={handleShuffle}
                disabled={isSubmitted}
              >
                <ShuffleIcon size={16} color={theme.colors.primary} />
              </TouchableOpacity>
            </View>
            {rightItems.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={getItemStyle(item, 'right')}
                onPress={() => handleItemSelect(item.id, 'right')}
                disabled={item.isMatched || isSubmitted}
              >
                <Text style={getItemTextStyle(item)}>{item.text}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {selectedLeft && selectedRight && (
          <Button
            title="Match"
            onPress={handleMatch}
            style={styles.matchButton}
          />
        )}

        {!isSubmitted && (
          <Button
            title="Submit"
            onPress={handleSubmit}
            disabled={!allMatched}
            style={styles.submitButton}
          />
        )}
      </Card>

      {renderFeedback()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  exerciseCard: {
    marginBottom: theme.spacing.lg,
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  difficultyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  difficultyText: {
    fontSize: theme.fontSize.sm,
    fontWeight: '500',
    color: theme.colors.gray[600],
  },
  instruction: {
    fontSize: theme.fontSize.md,
    color: theme.colors.gray[600],
    marginBottom: theme.spacing.md,
    lineHeight: 22,
  },
  question: {
    fontSize: theme.fontSize.lg,
    fontWeight: '600',
    color: theme.colors.black,
    marginBottom: theme.spacing.lg,
    lineHeight: 24,
  },
  matchContainer: {
    flexDirection: 'row',
    gap: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  matchColumn: {
    flex: 1,
  },
  columnHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  columnTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: '600',
    color: theme.colors.gray[700],
    marginBottom: theme.spacing.md,
  },
  shuffleButton: {
    padding: theme.spacing.sm,
    backgroundColor: theme.colors.gray[100],
    borderRadius: theme.borderRadius.md,
  },
  matchItem: {
    backgroundColor: theme.colors.gray[50],
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 2,
    borderColor: theme.colors.gray[200],
    marginBottom: theme.spacing.sm,
  },
  selectedItem: {
    backgroundColor: theme.colors.primaryLight,
    borderColor: theme.colors.primary,
  },
  matchedItem: {
    backgroundColor: theme.colors.successLight,
    borderColor: theme.colors.success,
  },
  matchItemText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.black,
    textAlign: 'center',
    fontWeight: '500',
  },
  matchedItemText: {
    color: theme.colors.success,
    fontWeight: '600',
  },
  matchButton: {
    marginBottom: theme.spacing.md,
  },
  submitButton: {
    marginTop: theme.spacing.md,
  },
  feedbackContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  feedbackCard: {
    width: '100%',
    maxWidth: 400,
  },
  correctFeedback: {
    borderColor: theme.colors.success,
    borderWidth: 2,
  },
  incorrectFeedback: {
    borderColor: theme.colors.danger,
    borderWidth: 2,
  },
  feedbackHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  feedbackTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: '600',
  },
  correctFeedbackTitle: {
    color: theme.colors.success,
  },
  incorrectFeedbackTitle: {
    color: theme.colors.danger,
  },
  feedbackExplanation: {
    fontSize: theme.fontSize.md,
    color: theme.colors.gray[600],
    lineHeight: 22,
    marginBottom: theme.spacing.lg,
  },
  feedbackStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: theme.spacing.lg,
  },
  statItem: {
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  statValue: {
    fontSize: theme.fontSize.lg,
    fontWeight: '600',
    color: theme.colors.black,
  },
  statLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.gray[600],
  },
  continueButton: {
    marginTop: theme.spacing.md,
  },
});
