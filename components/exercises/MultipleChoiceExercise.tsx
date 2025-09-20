import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Alert,
} from 'react-native';
import { theme } from '@/constants/theme';
import { useI18n } from '@/hooks/useI18n';
import useEnhancedGamification from "@/hooks/useEnhancedGamification";
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Badge } from '@/components/Badge';
import { CheckIcon, XIcon, StarIcon, HeartIcon } from '@/components/icons/LucideReplacement';
import { MultilingualExercise, MultilingualContent } from '@/types';

const { width } = Dimensions.get('window');

interface MultipleChoiceExerciseProps {
  exercise: MultilingualExercise;
  onComplete: (isCorrect: boolean, timeSpent: number) => void;
  onNext: () => void;
  userAnswer?: string;
  isSubmitted?: boolean;
  showFeedback?: boolean;
  onAnswerChange?: (answer: string) => void;
  disabled?: boolean;
  getText?: (content: MultilingualContent) => string;
  correctAnswer?: string;
}

export default function MultipleChoiceExercise({
  exercise,
  onComplete,
  onNext,
  userAnswer: initialAnswer,
  isSubmitted: initialSubmitted,
  showFeedback: initialShowFeedback,
}: MultipleChoiceExerciseProps) {
  const { t } = useI18n();
  const { awardXP, completeLesson, acceptChallenge, createChallenge, generateDailyChallenges, refreshStats } = useEnhancedGamification();

  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(initialAnswer || null);
  const [isSubmitted, setIsSubmitted] = useState(initialSubmitted || false);
  const [showFeedback, setShowFeedback] = useState(initialShowFeedback || false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [timeSpent, setTimeSpent] = useState(0);
  const [hearts, setHearts] = useState(5);
  const [animationValue] = useState(new Animated.Value(0));

  useEffect(() => {
    loadUserHearts();
    startTimer();
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

  const handleAnswerSelect = (answer: string) => {
    if (isSubmitted) return;
    
    setSelectedAnswer(answer);
    animateSelection();
  };

  const handleSubmit = async () => {
    if (!selectedAnswer) return;

    setIsSubmitted(true);
    
    const correct = selectedAnswer === exercise.correctAnswer;
    setIsCorrect(correct);
    setShowFeedback(true);

    if (!correct) {
      const newHearts = hearts - 1;
      setHearts(newHearts);
      
      if (newHearts === 0) {
        Alert.alert(
          'Out of Hearts!',
          'You need to wait or buy more hearts to continue.',
          [{ text: 'OK' }],
        );
      }
    } else {
      // Award XP for correct answer
      await awardXP(exercise.xpReward, 'exercise_completion');
    }

    onComplete(correct, timeSpent);
  };

  const animateSelection = () => {
    Animated.sequence([
      Animated.timing(animationValue, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(animationValue, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const animateFeedback = () => {
    Animated.spring(animationValue, {
      toValue: 1,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();
  };

  const getOptionStyle = (option: string) => {
    const baseStyle = [styles.optionButton];
    
    if (isSubmitted) {
      if (option === exercise.correctAnswer) {
        baseStyle.push(styles.correctOption as any);
      } else if (option === selectedAnswer && option !== exercise.correctAnswer) {
        baseStyle.push(styles.incorrectOption as any);
      } else {
        baseStyle.push(styles.disabledOption as any);
      }
    } else if (selectedAnswer === option) {
      baseStyle.push(styles.selectedOption as any);
    }

    return baseStyle;
  };

  const getOptionTextStyle = (option: string) => {
    const baseStyle = [styles.optionText];
    
    if (isSubmitted) {
      if (option === exercise.correctAnswer) {
        baseStyle.push(styles.correctOptionText as any);
      } else if (option === selectedAnswer && option !== exercise.correctAnswer) {
        baseStyle.push(styles.incorrectOptionText as any);
      } else {
        baseStyle.push(styles.disabledOptionText as any);
      }
    } else if (selectedAnswer === option) {
      baseStyle.push(styles.selectedOptionText as any);
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
              {isCorrect ? 'Correct!' : 'Incorrect'}
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

  return (
    <View style={styles.container}>
      <Card style={styles.exerciseCard}>
        <View style={styles.exerciseHeader}>
          <Badge
            text="Multiple Choice"
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

        {exercise.image && (
          <View style={styles.imageContainer}>
            <Text style={styles.imagePlaceholder}>📷 Image</Text>
          </View>
        )}

        {exercise.audio && (
          <TouchableOpacity style={styles.audioButton}>
            <Text style={styles.audioButtonText}>🔊 Play Audio</Text>
          </TouchableOpacity>
        )}

        <View style={styles.optionsContainer}>
          {exercise.options?.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={getOptionStyle(getContentInLanguage(option, 'en'))}
              onPress={() => handleAnswerSelect(getContentInLanguage(option, 'en'))}
              disabled={isSubmitted}
            >
              <Text style={getOptionTextStyle(getContentInLanguage(option, 'en'))}>
                {getContentInLanguage(option, 'en')}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {!isSubmitted && (
          <Button
            title="Submit Answer"
            onPress={handleSubmit}
            disabled={!selectedAnswer}
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
  imageContainer: {
    height: 200,
    backgroundColor: theme.colors.gray[100],
    borderRadius: theme.borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  imagePlaceholder: {
    fontSize: theme.fontSize.xl,
    color: theme.colors.gray[400],
  },
  audioButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    alignSelf: 'center',
    marginBottom: theme.spacing.lg,
  },
  audioButtonText: {
    color: theme.colors.white,
    fontSize: theme.fontSize.md,
    fontWeight: '500',
  },
  optionsContainer: {
    gap: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  optionButton: {
    backgroundColor: theme.colors.gray[50],
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 2,
    borderColor: theme.colors.gray[200],
  },
  selectedOption: {
    backgroundColor: theme.colors.primaryLight,
    borderColor: theme.colors.primary,
  },
  correctOption: {
    backgroundColor: theme.colors.successLight,
    borderColor: theme.colors.success,
  },
  incorrectOption: {
    backgroundColor: theme.colors.dangerLight,
    borderColor: theme.colors.danger,
  },
  disabledOption: {
    backgroundColor: theme.colors.gray[100],
    borderColor: theme.colors.gray[200],
  },
  optionText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.black,
    textAlign: 'center',
    fontWeight: '500',
  },
  selectedOptionText: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
  correctOptionText: {
    color: theme.colors.success,
    fontWeight: '600',
  },
  incorrectOptionText: {
    color: theme.colors.danger,
    fontWeight: '600',
  },
  disabledOptionText: {
    color: theme.colors.gray[400],
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
