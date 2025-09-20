import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Animated,
  Alert,
  ScrollView,
} from 'react-native';
import { theme } from '@/constants/theme';
import { useI18n } from '@/hooks/useI18n';
import useEnhancedGamification from "@/hooks/useEnhancedGamification";
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Badge } from '@/components/Badge';
import { CheckIcon, XIcon, StarIcon, HeartIcon, LightbulbIcon } from '@/components/icons/LucideReplacement';
import { MultilingualExercise, MultilingualContent } from '@/types';

interface FillBlankExerciseProps {
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

export default function FillBlankExercise({
  exercise,
  onComplete,
  onNext,
  userAnswer: initialAnswer,
  isSubmitted: initialSubmitted,
  showFeedback: initialShowFeedback,
}: FillBlankExerciseProps) {
  const { t } = useI18n();
  const { awardXP, completeLesson, acceptChallenge, createChallenge, generateDailyChallenges, refreshStats } = useEnhancedGamification();

  const [userAnswer, setUserAnswer] = useState(initialAnswer || '');
  const [isSubmitted, setIsSubmitted] = useState(initialSubmitted || false);
  const [showFeedback, setShowFeedback] = useState(initialShowFeedback || false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [timeSpent, setTimeSpent] = useState(0);
  const [hearts, setHearts] = useState(5);
  const [showHint, setShowHint] = useState(false);
  const [animationValue] = useState(new Animated.Value(0));
  const [shakeAnimation] = useState(new Animated.Value(0));

  const inputRef = useRef<TextInput>(null);

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

  const handleAnswerChange = (text: string) => {
    if (isSubmitted) return;
    setUserAnswer(text);
  };

  const handleSubmit = async () => {
    if (!userAnswer.trim()) return;

    setIsSubmitted(true);
    
    const correct = userAnswer.toLowerCase().trim() === (Array.isArray(exercise.correctAnswer) ? exercise.correctAnswer[0] : exercise.correctAnswer).toLowerCase().trim();
    setIsCorrect(correct);
    setShowFeedback(true);

    if (!correct) {
      const newHearts = hearts - 1;
      setHearts(newHearts);
      
      // Shake animation for incorrect answer
      animateShake();
      
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

  const handleHint = () => {
    setShowHint(true);
    // Reduce XP reward for using hint
    // This would be implemented in the gamification service
  };

  const animateFeedback = () => {
    Animated.spring(animationValue, {
      toValue: 1,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();
  };

  const animateShake = () => {
    Animated.sequence([
      Animated.timing(shakeAnimation, {
        toValue: 10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: -10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: 10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const getInputStyle = () => {
    const baseStyle = [styles.textInput];
    
    if (isSubmitted) {
      if (isCorrect) {
        baseStyle.push(styles.correctInput as any);
      } else {
        baseStyle.push(styles.incorrectInput as any);
      }
    }

    return baseStyle;
  };

  const renderQuestionWithBlanks = () => {
    const question = getContentInLanguage(exercise.question, 'en');
    const parts = question.split('_____');
    
    return (
      <View style={styles.questionContainer}>
        {parts.map((part, index) => (
          <View key={index} style={styles.questionPart}>
            <Text style={styles.questionText}>{part}</Text>
            {index < parts.length - 1 && (
              <Animated.View
                style={[
                  styles.blankContainer,
                  {
                    transform: [{ translateX: shakeAnimation }],
                  },
                ]}
              >
                <TextInput
                  ref={inputRef}
                  style={getInputStyle()}
                  value={userAnswer}
                  onChangeText={handleAnswerChange}
                  placeholder="?"
                  placeholderTextColor={theme.colors.gray[400]}
                  editable={!isSubmitted}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </Animated.View>
            )}
          </View>
        ))}
      </View>
    );
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

          {!isCorrect && (
            <View style={styles.correctAnswerContainer}>
              <Text style={styles.correctAnswerLabel}>Correct answer:</Text>
              <Text style={styles.correctAnswerText}>{exercise.correctAnswer}</Text>
            </View>
          )}

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
            text="Fill in the Blank"
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

        {renderQuestionWithBlanks()}

        {exercise.hints && exercise.hints.length > 0 && !showHint && (
          <TouchableOpacity
            style={styles.hintButton}
            onPress={handleHint}
            disabled={isSubmitted}
          >
            <LightbulbIcon size={16} color={theme.colors.warning} />
            <Text style={styles.hintButtonText}>Show Hint</Text>
          </TouchableOpacity>
        )}

        {showHint && exercise.hints && exercise.hints.length > 0 && (
          <View style={styles.hintContainer}>
            <Text style={styles.hintLabel}>Hint:</Text>
            <Text style={styles.hintText}>
              {getContentInLanguage(exercise.hints[0], 'en')}
            </Text>
          </View>
        )}

        {!isSubmitted && (
          <Button
            title="Submit Answer"
            onPress={handleSubmit}
            disabled={!userAnswer.trim()}
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
    marginBottom: theme.spacing.lg,
    lineHeight: 22,
  },
  questionContainer: {
    marginBottom: theme.spacing.lg,
  },
  questionPart: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  questionText: {
    fontSize: theme.fontSize.lg,
    fontWeight: '500',
    color: theme.colors.black,
    lineHeight: 28,
  },
  blankContainer: {
    marginHorizontal: theme.spacing.sm,
  },
  textInput: {
    borderWidth: 2,
    borderColor: theme.colors.gray[300],
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    fontSize: theme.fontSize.lg,
    fontWeight: '500',
    color: theme.colors.black,
    backgroundColor: theme.colors.white,
    minWidth: 80,
    textAlign: 'center',
  },
  correctInput: {
    borderColor: theme.colors.success,
    backgroundColor: theme.colors.successLight,
  },
  incorrectInput: {
    borderColor: theme.colors.danger,
    backgroundColor: theme.colors.dangerLight,
  },
  hintButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    alignSelf: 'flex-start',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.warningLight,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.lg,
  },
  hintButtonText: {
    fontSize: theme.fontSize.sm,
    fontWeight: '500',
    color: theme.colors.warning,
  },
  hintContainer: {
    backgroundColor: theme.colors.warningLight,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.lg,
  },
  hintLabel: {
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
    color: theme.colors.warning,
    marginBottom: theme.spacing.xs,
  },
  hintText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.warning,
    lineHeight: 20,
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
  correctAnswerContainer: {
    backgroundColor: theme.colors.gray[50],
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
  },
  correctAnswerLabel: {
    fontSize: theme.fontSize.sm,
    fontWeight: '500',
    color: theme.colors.gray[600],
    marginBottom: theme.spacing.xs,
  },
  correctAnswerText: {
    fontSize: theme.fontSize.md,
    fontWeight: '600',
    color: theme.colors.black,
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
