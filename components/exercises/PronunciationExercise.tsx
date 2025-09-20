import React, { useState, useEffect, useRef } from 'react';
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
import { CheckIcon, XIcon, StarIcon, HeartIcon, PlayIcon, MicIcon, VolumeIcon } from '@/components/icons/LucideReplacement';
import { MultilingualExercise, MultilingualContent } from '@/types';

const { width } = Dimensions.get('window');

interface PronunciationExerciseProps {
  exercise: MultilingualExercise;
  onComplete: (isCorrect: boolean, timeSpent: number) => void;
  onNext: () => void;
  userAnswer?: string;
  isSubmitted?: boolean;
  showFeedback?: boolean;
  onAnswerChange?: (answer: string) => void;
  disabled?: boolean;
  getText?: (content: MultilingualContent) => string;
}

export default function PronunciationExercise({
  exercise,
  onComplete,
  onNext,
  userAnswer: initialAnswer,
  isSubmitted: initialSubmitted,
  showFeedback: initialShowFeedback,
}: PronunciationExerciseProps) {
  const { t } = useI18n();
  const { awardXP, completeLesson, acceptChallenge, createChallenge, generateDailyChallenges, refreshStats } = useEnhancedGamification();

  const [isSubmitted, setIsSubmitted] = useState(initialSubmitted || false);
  const [showFeedback, setShowFeedback] = useState(initialShowFeedback || false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [timeSpent, setTimeSpent] = useState(0);
  const [hearts, setHearts] = useState(5);
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playCount, setPlayCount] = useState(0);
  const [recordingCount, setRecordingCount] = useState(0);
  const [animationValue] = useState(new Animated.Value(0));
  const [pulseAnimation] = useState(new Animated.Value(1));

  useEffect(() => {
    loadUserHearts();
    startTimer();
  }, []);

  useEffect(() => {
    if (isSubmitted) {
      animateFeedback();
    }
  }, [isSubmitted]);

  useEffect(() => {
    if (isRecording) {
      startPulseAnimation();
    } else {
      stopPulseAnimation();
    }
  }, [isRecording]);

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

  const handlePlayAudio = () => {
    setIsPlaying(true);
    setPlayCount(prev => prev + 1);
    
    // Simulate audio playback
    setTimeout(() => {
      setIsPlaying(false);
    }, 3000);
  };

  const handleStartRecording = () => {
    setIsRecording(true);
    setRecordingCount(prev => prev + 1);
    
    // Simulate recording for 3 seconds
    setTimeout(() => {
      setIsRecording(false);
    }, 3000);
  };

  const handleSubmit = async () => {
    setIsSubmitted(true);
    
    // Simulate pronunciation assessment
    // In a real app, this would use speech recognition and pronunciation analysis
    const correct = Math.random() > 0.3; // 70% chance of being correct for demo
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

  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnimation, {
          toValue: 1.2,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnimation, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  };

  const stopPulseAnimation = () => {
    pulseAnimation.stopAnimation();
    pulseAnimation.setValue(1);
  };

  const animateFeedback = () => {
    Animated.spring(animationValue, {
      toValue: 1,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();
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
              {isCorrect ? 'Great Pronunciation!' : 'Keep Practicing'}
            </Text>
          </View>

          {exercise.explanation && (
            <Text style={styles.feedbackExplanation}>
              {getContentInLanguage(exercise.explanation, 'en')}
            </Text>
          )}

          <View style={styles.pronunciationTips}>
            <Text style={styles.tipsTitle}>Pronunciation Tips:</Text>
            <Text style={styles.tipText}>• Speak clearly and at a normal pace</Text>
            <Text style={styles.tipText}>• Pay attention to stress and intonation</Text>
            <Text style={styles.tipText}>• Practice the word several times</Text>
          </View>

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
              <Text style={styles.statValue}>{recordingCount}</Text>
              <Text style={styles.statLabel}>Attempts</Text>
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
            text="Pronunciation"
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

        <View style={styles.pronunciationContainer}>
          <View style={styles.wordContainer}>
            <Text style={styles.wordText}>{exercise.correctAnswer}</Text>
            <Text style={styles.phoneticText}>/həˈloʊ/</Text>
          </View>

          <View style={styles.audioContainer}>
            <TouchableOpacity
              style={[styles.audioButton, isPlaying && styles.audioButtonPlaying]}
              onPress={handlePlayAudio}
              disabled={isSubmitted}
            >
              <VolumeIcon size={24} color={theme.colors.white} />
              <Text style={styles.audioButtonText}>
                {isPlaying ? 'Playing...' : 'Listen'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.recordingContainer}>
            <Animated.View
              style={[
                styles.recordingButton,
                isRecording && styles.recordingButtonActive,
                {
                  transform: [{ scale: pulseAnimation }],
                },
              ]}
            >
              <TouchableOpacity
                style={styles.recordingButtonInner}
                onPress={handleStartRecording}
                disabled={isSubmitted || isRecording}
              >
                <MicIcon size={32} color={theme.colors.white} />
              </TouchableOpacity>
            </Animated.View>
            
            <Text style={styles.recordingText}>
              {isRecording ? 'Recording...' : 'Tap to record your pronunciation'}
            </Text>
          </View>
        </View>

        {!isSubmitted && (
          <Button
            title="Submit Pronunciation"
            onPress={handleSubmit}
            disabled={recordingCount === 0}
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
  pronunciationContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  wordContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  wordText: {
    fontSize: theme.fontSize.xxl,
    fontWeight: 'bold',
    color: theme.colors.black,
    marginBottom: theme.spacing.sm,
  },
  phoneticText: {
    fontSize: theme.fontSize.lg,
    color: theme.colors.gray[600],
    fontStyle: 'italic',
  },
  audioContainer: {
    marginBottom: theme.spacing.xl,
  },
  audioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
  },
  audioButtonPlaying: {
    backgroundColor: theme.colors.primaryDark,
  },
  audioButtonText: {
    color: theme.colors.white,
    fontSize: theme.fontSize.md,
    fontWeight: '500',
  },
  recordingContainer: {
    alignItems: 'center',
  },
  recordingButton: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: theme.colors.gray[200],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  recordingButtonActive: {
    backgroundColor: theme.colors.danger,
  },
  recordingButtonInner: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordingText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.gray[600],
    textAlign: 'center',
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
  pronunciationTips: {
    backgroundColor: theme.colors.gray[50],
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.lg,
  },
  tipsTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: '600',
    color: theme.colors.black,
    marginBottom: theme.spacing.sm,
  },
  tipText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.gray[600],
    marginBottom: theme.spacing.xs,
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
