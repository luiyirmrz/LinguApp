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
import { CheckIcon, XIcon, StarIcon, HeartIcon, PlayIcon, PauseIcon, VolumeIcon } from '@/components/icons/LucideReplacement';
import { MultilingualExercise, MultilingualContent } from '@/types';

interface DictationExerciseProps {
  exercise: MultilingualExercise;
  onComplete: (isCorrect: boolean, timeSpent: number) => void;
  onNext: () => void;
  userAnswer?: string;
  isSubmitted?: boolean;
  showFeedback?: boolean;
  onAnswerChange?: (answer: string) => void;
  disabled?: boolean;
  getText?: (content: MultilingualContent) => string;
  playAudio?: (audioUrl?: string, exerciseText?: string) => Promise<any>;
}

export default function DictationExercise({
  exercise,
  onComplete,
  onNext,
  userAnswer: initialAnswer,
  isSubmitted: initialSubmitted,
  showFeedback: initialShowFeedback,
}: DictationExerciseProps) {
  const { t } = useI18n();
  const { awardXP, completeLesson, acceptChallenge, createChallenge, generateDailyChallenges, refreshStats } = useEnhancedGamification();

  const [userAnswer, setUserAnswer] = useState(initialAnswer || '');
  const [isSubmitted, setIsSubmitted] = useState(initialSubmitted || false);
  const [showFeedback, setShowFeedback] = useState(initialShowFeedback || false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [timeSpent, setTimeSpent] = useState(0);
  const [hearts, setHearts] = useState(5);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playCount, setPlayCount] = useState(0);
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

  const handlePlayAudio = () => {
    setIsPlaying(true);
    setPlayCount(prev => prev + 1);
    
    // Simulate audio playback
    setTimeout(() => {
      setIsPlaying(false);
    }, 3000);
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
              <Text style={styles.statValue}>{playCount}</Text>
              <Text style={styles.statLabel}>Plays</Text>
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
            text="Dictation"
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

        <View style={styles.audioContainer}>
          <TouchableOpacity
            style={[styles.audioButton, isPlaying && styles.audioButtonPlaying]}
            onPress={handlePlayAudio}
            disabled={isSubmitted}
          >
            {isPlaying ? (
              <PauseIcon size={24} color={theme.colors.white} />
            ) : (
              <PlayIcon size={24} color={theme.colors.white} />
            )}
            <Text style={styles.audioButtonText}>
              {isPlaying ? 'Playing...' : 'Play Audio'}
            </Text>
          </TouchableOpacity>
          
          <Text style={styles.audioHint}>
            Listen carefully and type what you hear
          </Text>
        </View>

        <Animated.View
          style={[
            styles.inputContainer,
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
            placeholder="Type what you hear..."
            placeholderTextColor={theme.colors.gray[400]}
            editable={!isSubmitted}
            autoCapitalize="none"
            autoCorrect={false}
            multiline
            numberOfLines={3}
          />
        </Animated.View>

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
  audioContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  audioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.sm,
  },
  audioButtonPlaying: {
    backgroundColor: theme.colors.primaryDark,
  },
  audioButtonText: {
    color: theme.colors.white,
    fontSize: theme.fontSize.md,
    fontWeight: '500',
  },
  audioHint: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.gray[500],
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: theme.spacing.lg,
  },
  textInput: {
    borderWidth: 2,
    borderColor: theme.colors.gray[300],
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    fontSize: theme.fontSize.md,
    color: theme.colors.black,
    backgroundColor: theme.colors.white,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  correctInput: {
    borderColor: theme.colors.success,
    backgroundColor: theme.colors.successLight,
  },
  incorrectInput: {
    borderColor: theme.colors.danger,
    backgroundColor: theme.colors.dangerLight,
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
