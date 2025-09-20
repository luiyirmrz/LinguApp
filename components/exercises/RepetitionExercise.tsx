import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '@/constants/theme';
import { useI18n } from '@/hooks/useI18n';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';
import useEnhancedGamification from "@/hooks/useEnhancedGamification";
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { ProgressBar } from '@/components/ProgressBar';
import { Badge } from '@/components/Badge';
import { 
  PlayIcon, 
  PauseIcon, 
  MicIcon, 
  MicOffIcon,
  Volume2Icon,
  VolumeXIcon,
  RotateCcwIcon,
  CheckIcon,
  XIcon,
  StarIcon,
  TargetIcon,
  TrendingUpIcon,
  AwardIcon,
  ClockIcon,
  HeadphonesIcon,
  RepeatIcon,
} from '@/components/icons/LucideReplacement';
import { 
  usePronunciationEvaluation,
} from '@/hooks/usePronunciationEvaluation';
// import type { PronunciationEvaluation } from '@/hooks/usePronunciationEvaluation';
import { MultilingualExercise, MultilingualContent } from '@/types';

const { width } = Dimensions.get('window');

interface RepetitionExerciseProps {
  exercise: MultilingualExercise;
  onComplete: (result: RepetitionResult) => void;
  onNext: () => void;
  onSkip?: () => void;
}

interface RepetitionResult {
  exerciseId: string;
  isCorrect: boolean;
  accuracy: number;
  attempts: number;
  timeSpent: number;
  pronunciationScore: number;
  fluencyScore: number;
  completenessScore: number;
  userAnswer: string;
  correctAnswer: string;
}

interface RepetitionPhase {
  id: string;
  name: string;
  description: string;
  targetText: string;
  expectedDuration: number;
  minAccuracy: number;
  instructions: string[];
}

export default function RepetitionExercise({
  exercise,
  onComplete,
  onNext,
  onSkip,
}: RepetitionExerciseProps) {
  const { t } = useI18n();
  const { user } = useUnifiedAuth();
  const { awardXP, completeLesson, acceptChallenge, createChallenge, generateDailyChallenges, refreshStats } = useEnhancedGamification();

  // State management
  const [currentPhase, setCurrentPhase] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [timeSpent, setTimeSpent] = useState(0);
  const [hearts, setHearts] = useState(5);
  const [showResults, setShowResults] = useState(false);
  const [phaseResults, setPhaseResults] = useState<any[]>([]);
  const [overallScore, setOverallScore] = useState(0);

  // Animation refs
  const pulseAnimation = useRef(new Animated.Value(1)).current;
  const waveAnimation = useRef(new Animated.Value(0)).current;
  const progressAnimation = useRef(new Animated.Value(0)).current;
  const phaseAnimation = useRef(new Animated.Value(0)).current;

  // Timer refs
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  // Helper functions
  const getContentInLanguage = (content: MultilingualContent, language: string = 'en'): string => {
    if (typeof content === 'string') return content;
    return content[language] || content.en || '';
  };

  const getCurrentPhase = (): RepetitionPhase => {
    return phases[currentPhase];
  };

  const handlePronunciationComplete = (evaluation: any) => {
    const phase = getCurrentPhase();
    const isCorrect = evaluation.accuracy >= phase.minAccuracy;
    
    if (isCorrect) {
      setPhaseResults(prev => ({
        ...prev,
        [phase.id]: {
          accuracy: evaluation.accuracy,
          timeSpent,
          attempts: evaluation.attempts,
          feedback: evaluation.feedback,
        },
      }));
      
      if (currentPhase < phases.length - 1) {
        setCurrentPhase(prev => prev + 1);
        setShowResults(false);
      } else {
        completeExercise();
      }
    } else {
      setShowResults(true);
    }
  };

  const handlePronunciationError = (error: string) => {
    console.error('Pronunciation error:', error);
    setShowResults(true);
  };

  // Pronunciation evaluation hook
  const [pronunciationState, pronunciationActions] = usePronunciationEvaluation({
    targetText: getCurrentPhase().targetText,
    languageCode: exercise.targetLanguage,
    maxAttempts: 3,
    onComplete: handlePronunciationComplete,
    onError: handlePronunciationError,
  });

  // Repetition phases
  const phases: RepetitionPhase[] = [
    {
      id: 'slow',
      name: 'Slow Repetition',
      description: 'Repeat the phrase slowly, focusing on each sound',
      targetText: getContentInLanguage(exercise.question, exercise.targetLanguage),
      expectedDuration: 3,
      minAccuracy: 70,
      instructions: [
        'Listen to the reference audio carefully',
        'Repeat each word slowly and clearly',
        'Focus on correct pronunciation of each sound',
        'Take your time - accuracy is more important than speed',
      ],
    },
    {
      id: 'normal',
      name: 'Normal Speed',
      description: 'Repeat the phrase at normal speaking pace',
      targetText: getContentInLanguage(exercise.question, exercise.targetLanguage),
      expectedDuration: 2,
      minAccuracy: 80,
      instructions: [
        'Listen to the reference audio',
        'Repeat at a natural speaking pace',
        'Maintain clear pronunciation',
        'Focus on natural rhythm and flow',
      ],
    },
    {
      id: 'fast',
      name: 'Quick Repetition',
      description: 'Repeat the phrase quickly while maintaining clarity',
      targetText: getContentInLanguage(exercise.question, exercise.targetLanguage),
      expectedDuration: 1.5,
      minAccuracy: 75,
      instructions: [
        'Listen to the reference audio',
        'Repeat quickly but clearly',
        'Maintain pronunciation accuracy',
        'Focus on fluency and speed',
      ],
    },
  ];

  useEffect(() => {
    loadUserHearts();
    startTimer();
    animatePhase();
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (isRecording) {
      startRecordingAnimations();
    } else {
      stopRecordingAnimations();
    }
  }, [isRecording]);

  useEffect(() => {
    if (showResults) {
      animateResults();
    }
  }, [showResults]);

  const loadUserHearts = async () => {
    try {
      const userHearts = 5; // Mock implementation
      setHearts(userHearts);
    } catch (error) {
      console.error('Error loading user hearts:', error);
    }
  };

  const startTimer = () => {
    startTimeRef.current = Date.now();
    timerRef.current = setInterval(() => {
      setTimeSpent(Date.now() - startTimeRef.current);
    }, 1000) as any;
  };

  const animatePhase = () => {
    Animated.spring(phaseAnimation, {
      toValue: 1,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();
  };

  const startRecordingAnimations = () => {
    // Pulse animation for recording button
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnimation, {
          toValue: 1.2,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnimation, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    ).start();

    // Wave animation
    Animated.loop(
      Animated.timing(waveAnimation, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
    ).start();
  };

  const stopRecordingAnimations = () => {
    pulseAnimation.stopAnimation();
    waveAnimation.stopAnimation();
    pulseAnimation.setValue(1);
    waveAnimation.setValue(0);
  };

  const animateResults = () => {
    Animated.timing(progressAnimation, {
      toValue: overallScore / 100,
      duration: 1000,
      useNativeDriver: false,
    }).start();
  };

  const handlePlayAudio = async () => {
    try {
      setIsPlaying(true);
      await pronunciationActions.playReferenceAudio();
      
      // Simulate audio playback duration
      setTimeout(() => {
        setIsPlaying(false);
      }, 3000);
    } catch (error) {
      console.error('Failed to play audio:', error);
      setIsPlaying(false);
    }
  };

  const handleStartRecording = async () => {
    try {
      setAttempts(prev => prev + 1);
      await pronunciationActions.startRecording();
    } catch (error) {
      console.error('Failed to start recording:', error);
      Alert.alert('Recording Error', 'Failed to start recording. Please try again.');
    }
  };

  const handleStopRecording = async () => {
    try {
      await pronunciationActions.stopRecording();
    } catch (error) {
      console.error('Failed to stop recording:', error);
      Alert.alert('Recording Error', 'Failed to stop recording. Please try again.');
    }
  };


  const completeExercise = () => {
    // Calculate overall score
    const totalScore = phaseResults.reduce((sum, result) => sum + result.overallScore, 0);
    const averageScore = totalScore / phaseResults.length;
    setOverallScore(averageScore);

    // Calculate result
    const result: RepetitionResult = {
      exerciseId: exercise.id,
      isCorrect: averageScore >= 75,
      accuracy: averageScore,
      attempts,
      timeSpent: Math.floor(timeSpent / 1000),
      pronunciationScore: phaseResults.reduce((sum, r) => sum + r.accuracyScore, 0) / phaseResults.length,
      fluencyScore: phaseResults.reduce((sum, r) => sum + r.fluencyScore, 0) / phaseResults.length,
      completenessScore: phaseResults.reduce((sum, r) => sum + r.completenessScore, 0) / phaseResults.length,
      userAnswer: getContentInLanguage(exercise.question, exercise.targetLanguage),
      correctAnswer: getContentInLanguage(exercise.question, exercise.targetLanguage),
    };

    setShowResults(true);

    // Award XP
    if (result.isCorrect) {
      awardXP(exercise.xpReward, 'repetition_exercise_completion');
    }

    // Call completion callback
    setTimeout(() => {
      onComplete(result);
    }, 3000);
  };

  const retryPhase = () => {
    setAttempts(prev => prev + 1);
    pronunciationActions.retry();
  };

  const skipExercise = () => {
    if (onSkip) {
      onSkip();
    } else {
      onNext();
    }
  };

  const formatTime = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getScoreColor = (score: number): string => {
    if (score >= 80) return theme.colors.success;
    if (score >= 60) return theme.colors.warning;
    return theme.colors.danger;
  };

  const renderPhaseHeader = () => (
    <Animated.View
      style={[
        styles.phaseHeader,
        {
          transform: [{
            scale: phaseAnimation.interpolate({
              inputRange: [0, 1],
              outputRange: [0.9, 1],
            }),
          }],
          opacity: phaseAnimation,
        },
      ]}
    >
      <Card style={styles.phaseCard}>
        <View style={styles.phaseInfo}>
          <Badge
            text={`Phase ${currentPhase + 1} of ${phases.length}`}
            color={theme.colors.primary}
            size="small"
          />
          <Text style={styles.phaseName}>{getCurrentPhase().name}</Text>
          <Text style={styles.phaseDescription}>{getCurrentPhase().description}</Text>
        </View>

        <View style={styles.phaseProgress}>
          <ProgressBar
            progress={(currentPhase / phases.length) * 100}
            height={6}
            color={theme.colors.primary}
          />
        </View>
      </Card>
    </Animated.View>
  );

  const renderInstructions = () => (
    <Card style={styles.instructionsCard}>
      <Text style={styles.instructionsTitle}>Instructions:</Text>
      {getCurrentPhase().instructions.map((instruction, index) => (
        <View key={index} style={styles.instructionItem}>
          <Text style={styles.instructionNumber}>{index + 1}.</Text>
          <Text style={styles.instructionText}>{instruction}</Text>
        </View>
      ))}
    </Card>
  );

  const renderTargetText = () => (
    <Card style={styles.targetCard}>
      <View style={styles.targetHeader}>
        <HeadphonesIcon size={20} color={theme.colors.primary} />
        <Text style={styles.targetTitle}>Target Text</Text>
      </View>
      
      <Text style={styles.targetText}>{getCurrentPhase().targetText}</Text>
      
      <TouchableOpacity
        style={[styles.playButton, isPlaying && styles.playButtonActive]}
        onPress={handlePlayAudio}
        disabled={isPlaying}
      >
        {isPlaying ? (
          <PauseIcon size={20} color={theme.colors.white} />
        ) : (
          <PlayIcon size={20} color={theme.colors.white} />
        )}
        <Text style={styles.playButtonText}>
          {isPlaying ? 'Playing...' : 'Play Reference'}
        </Text>
      </TouchableOpacity>
    </Card>
  );

  const renderRecordingSection = () => (
    <Card style={styles.recordingCard}>
      <View style={styles.recordingHeader}>
        <MicIcon size={20} color={theme.colors.primary} />
        <Text style={styles.recordingTitle}>Your Turn</Text>
      </View>

      <View style={styles.recordingContainer}>
        <Animated.View
          style={[
            styles.recordingButton,
            {
              transform: [{ scale: pulseAnimation }],
            },
          ]}
        >
          <TouchableOpacity
            style={[
              styles.recordButton,
              pronunciationState.isRecording && styles.recordButtonActive,
            ]}
            onPress={pronunciationState.isRecording ? handleStopRecording : handleStartRecording}
            disabled={pronunciationState.isProcessing || pronunciationState.isEvaluating}
          >
            {pronunciationState.isRecording ? (
              <MicOffIcon size={32} color={theme.colors.white} />
            ) : (
              <MicIcon size={32} color={theme.colors.white} />
            )}
          </TouchableOpacity>
        </Animated.View>

        {pronunciationState.isRecording && (
          <Animated.View
            style={[
              styles.recordingWave,
              {
                opacity: waveAnimation,
                transform: [{
                  scale: waveAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 1.5],
                  }),
                }],
              },
            ]}
          />
        )}

        <Text style={styles.recordingLabel}>
          {pronunciationState.isRecording 
            ? 'Recording... Speak clearly'
            : pronunciationState.isProcessing
              ? 'Processing your recording...'
              : pronunciationState.isEvaluating
                ? 'Evaluating pronunciation...'
                : 'Tap to start recording'
          }
        </Text>

        {pronunciationState.evaluation && (
          <View style={styles.evaluationResult}>
            <Text style={[
              styles.evaluationScore,
              { color: getScoreColor(pronunciationState.evaluation.overallScore) },
            ]}>
              {pronunciationState.evaluation.overallScore}% Accuracy
            </Text>
            <Text style={styles.evaluationFeedback}>
              {pronunciationState.evaluation.overallScore >= getCurrentPhase().minAccuracy
                ? 'Great job! Moving to next phase.'
                : 'Keep practicing! Try again.'
              }
            </Text>
          </View>
        )}
      </View>
    </Card>
  );

  const renderResults = () => {
    if (!showResults) return null;

    return (
      <View style={styles.resultsContainer}>
        <Card style={styles.resultsCard}>
          <View style={styles.resultsHeader}>
            <Text style={styles.resultsTitle}>Exercise Complete!</Text>
            <Text style={[
              styles.overallScore,
              { color: getScoreColor(overallScore) },
            ]}>
              {Math.round(overallScore)}% Overall
            </Text>
          </View>

          <View style={styles.scoreBreakdown}>
            <View style={styles.scoreItem}>
              <TargetIcon size={20} color={theme.colors.primary} />
              <Text style={styles.scoreLabel}>Pronunciation</Text>
              <Text style={styles.scoreValue}>
                {Math.round(phaseResults.reduce((sum, r) => sum + r.accuracyScore, 0) / phaseResults.length)}%
              </Text>
            </View>
            <View style={styles.scoreItem}>
              <TrendingUpIcon size={20} color={theme.colors.success} />
              <Text style={styles.scoreLabel}>Fluency</Text>
              <Text style={styles.scoreValue}>
                {Math.round(phaseResults.reduce((sum, r) => sum + r.fluencyScore, 0) / phaseResults.length)}%
              </Text>
            </View>
            <View style={styles.scoreItem}>
              <AwardIcon size={20} color={theme.colors.warning} />
              <Text style={styles.scoreLabel}>Completeness</Text>
              <Text style={styles.scoreValue}>
                {Math.round(phaseResults.reduce((sum, r) => sum + r.completenessScore, 0) / phaseResults.length)}%
              </Text>
            </View>
          </View>

          <View style={styles.exerciseStats}>
            <View style={styles.statItem}>
              <ClockIcon size={16} color={theme.colors.gray[600]} />
              <Text style={styles.statValue}>{formatTime(timeSpent)}</Text>
              <Text style={styles.statLabel}>Time</Text>
            </View>
            <View style={styles.statItem}>
              <RepeatIcon size={16} color={theme.colors.gray[600]} />
              <Text style={styles.statValue}>{attempts}</Text>
              <Text style={styles.statLabel}>Attempts</Text>
            </View>
            <View style={styles.statItem}>
              <StarIcon size={16} color={theme.colors.gray[600]} />
              <Text style={styles.statValue}>
                {overallScore >= 75 ? `+${exercise.xpReward}` : '0'}
              </Text>
              <Text style={styles.statLabel}>XP</Text>
            </View>
          </View>

          <Button
            title="Continue"
            onPress={onNext}
            style={styles.continueButton}
          />
        </Card>
      </View>
    );
  };

  if (showResults) {
    return renderResults();
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Repetition Exercise</Text>
        <Text style={styles.subtitle}>
          Practice pronunciation through structured repetition
        </Text>
      </View>

      {renderPhaseHeader()}
      {renderInstructions()}
      {renderTargetText()}
      {renderRecordingSection()}

      <View style={styles.actionButtons}>
        <Button
          title="Retry Phase"
          onPress={retryPhase}
          variant="outline"
          style={styles.retryButton}
        />
        <Button
          title="Skip Exercise"
          onPress={skipExercise}
          variant="outline"
          style={styles.skipButton}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.white,
    padding: theme.spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  title: {
    fontSize: theme.fontSize.xxl,
    fontWeight: 'bold',
    color: theme.colors.black,
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    fontSize: theme.fontSize.md,
    color: theme.colors.gray[600],
    textAlign: 'center',
  },
  phaseHeader: {
    marginBottom: theme.spacing.lg,
  },
  phaseCard: {
    padding: theme.spacing.lg,
  },
  phaseInfo: {
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  phaseName: {
    fontSize: theme.fontSize.lg,
    fontWeight: '600',
    color: theme.colors.black,
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.xs,
  },
  phaseDescription: {
    fontSize: theme.fontSize.md,
    color: theme.colors.gray[600],
    textAlign: 'center',
  },
  phaseProgress: {
    marginTop: theme.spacing.md,
  },
  instructionsCard: {
    marginBottom: theme.spacing.lg,
    padding: theme.spacing.lg,
  },
  instructionsTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: '600',
    color: theme.colors.black,
    marginBottom: theme.spacing.md,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.sm,
  },
  instructionNumber: {
    fontSize: theme.fontSize.md,
    fontWeight: '600',
    color: theme.colors.primary,
    marginRight: theme.spacing.sm,
    minWidth: 20,
  },
  instructionText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.gray[600],
    flex: 1,
    lineHeight: 20,
  },
  targetCard: {
    marginBottom: theme.spacing.lg,
    padding: theme.spacing.lg,
  },
  targetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  targetTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: '600',
    color: theme.colors.black,
    marginLeft: theme.spacing.sm,
  },
  targetText: {
    fontSize: theme.fontSize.xl,
    fontWeight: '600',
    color: theme.colors.black,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
    lineHeight: 28,
  },
  playButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
  },
  playButtonActive: {
    backgroundColor: theme.colors.primaryDark,
  },
  playButtonText: {
    color: theme.colors.white,
    fontSize: theme.fontSize.md,
    fontWeight: '600',
    marginLeft: theme.spacing.sm,
  },
  recordingCard: {
    marginBottom: theme.spacing.lg,
    padding: theme.spacing.lg,
  },
  recordingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  recordingTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: '600',
    color: theme.colors.black,
    marginLeft: theme.spacing.sm,
  },
  recordingContainer: {
    alignItems: 'center',
  },
  recordingButton: {
    marginBottom: theme.spacing.lg,
  },
  recordButton: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: theme.colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  recordButtonActive: {
    backgroundColor: theme.colors.danger,
  },
  recordingWave: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    top: -10,
    left: -10,
  },
  recordingLabel: {
    fontSize: theme.fontSize.md,
    color: theme.colors.gray[600],
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  evaluationResult: {
    alignItems: 'center',
  },
  evaluationScore: {
    fontSize: theme.fontSize.lg,
    fontWeight: 'bold',
    marginBottom: theme.spacing.xs,
  },
  evaluationFeedback: {
    fontSize: theme.fontSize.md,
    color: theme.colors.gray[600],
    textAlign: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  retryButton: {
    flex: 1,
  },
  skipButton: {
    flex: 1,
  },
  resultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultsCard: {
    width: '100%',
    maxWidth: 400,
    padding: theme.spacing.xl,
  },
  resultsHeader: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  resultsTitle: {
    fontSize: theme.fontSize.xxl,
    fontWeight: 'bold',
    color: theme.colors.black,
    marginBottom: theme.spacing.sm,
  },
  overallScore: {
    fontSize: theme.fontSize.xl,
    fontWeight: 'bold',
  },
  scoreBreakdown: {
    marginBottom: theme.spacing.xl,
  },
  scoreItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  scoreLabel: {
    fontSize: theme.fontSize.md,
    color: theme.colors.gray[600],
    marginLeft: theme.spacing.sm,
    flex: 1,
  },
  scoreValue: {
    fontSize: theme.fontSize.md,
    fontWeight: '600',
    color: theme.colors.black,
  },
  exerciseStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: theme.spacing.xl,
  },
  statItem: {
    alignItems: 'center',
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
  },
  continueButton: {
    backgroundColor: theme.colors.success,
  },
});
