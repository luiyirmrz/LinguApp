import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Alert,
  Vibration,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '@/constants/theme';
import { useI18n } from '@/hooks/useI18n';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { ProgressBar } from '@/components/ProgressBar';
import { Badge } from '@/components/Badge';
import { 
  MicIcon, 
  MicOffIcon, 
  PlayIcon, 
  PauseIcon,
  Volume2Icon,
  VolumeXIcon,
  RotateCcwIcon,
  CheckIcon,
  XIcon,
  StarIcon,
  TargetIcon,
  TrendingUpIcon,
  AwardIcon,
  AlertCircleIcon,
  LightbulbIcon,
  HeadphonesIcon,
} from '@/components/icons/LucideReplacement';
import { 
  elevenLabsService, 
  SpeechResult, 
  VoiceConfig, 
} from '@/services/audio/elevenLabsService';
import type { PronunciationEvaluation } from '@/services/audio/elevenLabsService';
import { 
  speechToTextService, 
  PronunciationAssessment, 
} from '@/services/audio/speechToText';

const { width, height } = Dimensions.get('window');

interface PronunciationEvaluationProps {
  targetText: string;
  languageCode: string;
  onComplete: (evaluation: PronunciationEvaluation) => void;
  onSkip?: () => void;
  maxAttempts?: number;
  showReferenceAudio?: boolean;
  customVoiceId?: string;
}

interface RecordingState {
  isRecording: boolean;
  isProcessing: boolean;
  hasRecorded: boolean;
  audioData?: ArrayBuffer;
  duration: number;
}

interface EvaluationState {
  evaluation: PronunciationEvaluation | null;
  isEvaluating: boolean;
  attempts: number;
  bestScore: number;
}

export default function PronunciationEvaluation({
  targetText,
  languageCode,
  onComplete,
  onSkip,
  maxAttempts = 3,
  showReferenceAudio = true,
  customVoiceId,
}: PronunciationEvaluationProps) {
  const { t } = useI18n();
  const { user, signIn, signOut, signUp, resetPassword, updateUser } = useUnifiedAuth();

  // State management
  const [recordingState, setRecordingState] = useState<RecordingState>({
    isRecording: false,
    isProcessing: false,
    hasRecorded: false,
    duration: 0,
  });

  const [evaluationState, setEvaluationState] = useState<EvaluationState>({
    evaluation: null,
    isEvaluating: false,
    attempts: 0,
    bestScore: 0,
  });

  const [referenceAudio, setReferenceAudio] = useState<SpeechResult | null>(null);
  const [isPlayingReference, setIsPlayingReference] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState<VoiceConfig | null>(null);
  const [showVoiceSelector, setShowVoiceSelector] = useState(false);

  // Animation refs
  const pulseAnimation = useRef(new Animated.Value(1)).current;
  const waveAnimation = useRef(new Animated.Value(0)).current;
  const progressAnimation = useRef(new Animated.Value(0)).current;
  const feedbackAnimation = useRef(new Animated.Value(0)).current;

  // Recording timer
  const recordingTimer = useRef<NodeJS.Timeout | null>(null);
  const recordingStartTime = useRef<number>(0);

  useEffect(() => {
    initializeComponent();
    return () => {
      cleanup();
    };
  }, []);

  useEffect(() => {
    if (recordingState.isRecording) {
      startRecordingAnimations();
    } else {
      stopRecordingAnimations();
    }
  }, [recordingState.isRecording]);

  useEffect(() => {
    if (evaluationState.evaluation) {
      animateFeedback();
    }
  }, [evaluationState.evaluation]);

  const initializeComponent = async () => {
    try {
      // Initialize ElevenLabs service
      await elevenLabsService.initialize();
      
      // Initialize speech-to-text service
      await speechToTextService.initialize();

      // Load reference audio
      if (showReferenceAudio) {
        await loadReferenceAudio();
      }

      // Set default voice
      const voices = elevenLabsService.getVoicesForLanguage(languageCode);
      if (voices.length > 0) {
        setSelectedVoice(voices[0]);
      }

    } catch (error) {
      console.error('Failed to initialize pronunciation evaluation:', error);
      Alert.alert('Error', 'Failed to initialize pronunciation evaluation');
    }
  };

  const loadReferenceAudio = async () => {
    try {
      const voiceId = customVoiceId || elevenLabsService.getBestVoiceForLanguage(languageCode);
      const audio = await elevenLabsService.synthesizeSpeech(targetText, {
        voiceId,
        voiceSettings: {
          stability: 0.8,
          similarityBoost: 0.8,
          useSpeakerBoost: true,
        },
      });
      setReferenceAudio(audio);
    } catch (error) {
      console.error('Failed to load reference audio:', error);
    }
  };

  const startRecording = async () => {
    try {
      if (evaluationState.attempts >= maxAttempts) {
        Alert.alert('Maximum Attempts', `You have reached the maximum of ${maxAttempts} attempts.`);
        return;
      }

      setRecordingState(prev => ({
        ...prev,
        isRecording: true,
        hasRecorded: false,
        duration: 0,
      }));

      recordingStartTime.current = Date.now();
      
      // Start recording timer
      recordingTimer.current = setInterval(() => {
        setRecordingState(prev => ({
          ...prev,
          duration: Date.now() - recordingStartTime.current,
        }));
      }, 100) as any;

      // Start actual recording
      await speechToTextService.startRecording(languageCode);

    } catch (error) {
      console.error('Failed to start recording:', error);
      setRecordingState(prev => ({ ...prev, isRecording: false }));
      Alert.alert('Recording Error', 'Failed to start recording. Please try again.');
    }
  };

  const stopRecording = async () => {
    try {
      setRecordingState(prev => ({ ...prev, isRecording: false, isProcessing: true }));

      // Clear recording timer
      if (recordingTimer.current) {
        clearInterval(recordingTimer.current);
        recordingTimer.current = null;
      }

      // Stop recording and get audio data
      const audioData = await speechToTextService.stopRecording();
      
      const audioBuffer = audioData.blob ? await audioData.blob.arrayBuffer() : undefined;
      setRecordingState(prev => ({
        ...prev,
        hasRecorded: true,
        audioData: audioBuffer,
        isProcessing: false,
      }));

      // Auto-evaluate if we have audio data
      if (audioData.blob) {
        await evaluatePronunciation(await audioData.blob.arrayBuffer());
      }

    } catch (error) {
      console.error('Failed to stop recording:', error);
      setRecordingState(prev => ({ ...prev, isRecording: false, isProcessing: false }));
      Alert.alert('Recording Error', 'Failed to stop recording. Please try again.');
    }
  };

  const evaluatePronunciation = async (audioData: ArrayBuffer) => {
    try {
      setEvaluationState(prev => ({ ...prev, isEvaluating: true }));

      // Use ElevenLabs for pronunciation evaluation
      const evaluation = await elevenLabsService.evaluatePronunciation(
        audioData,
        targetText,
        languageCode,
        selectedVoice?.id,
      );

      setEvaluationState(prev => ({
        ...prev,
        evaluation,
        attempts: prev.attempts + 1,
        bestScore: Math.max(prev.bestScore, evaluation.overallScore),
        isEvaluating: false,
      }));

      // Provide haptic feedback based on score
      if (evaluation.overallScore >= 80) {
        Vibration.vibrate([0, 100, 50, 100]); // Success pattern
      } else if (evaluation.overallScore >= 60) {
        Vibration.vibrate([0, 50]); // Partial success
      } else {
        Vibration.vibrate([0, 200, 100, 200]); // Needs improvement
      }

    } catch (error) {
      console.error('Failed to evaluate pronunciation:', error);
      setEvaluationState(prev => ({ ...prev, isEvaluating: false }));
      Alert.alert('Evaluation Error', 'Failed to evaluate pronunciation. Please try again.');
    }
  };

  const playReferenceAudio = async () => {
    if (!referenceAudio) return;

    try {
      setIsPlayingReference(true);
      
      // In a real implementation, you would play the audio
      // For now, we'll simulate playback
      setTimeout(() => {
        setIsPlayingReference(false);
      }, 3000);

    } catch (error) {
      console.error('Failed to play reference audio:', error);
      setIsPlayingReference(false);
    }
  };

  const retryRecording = () => {
    setRecordingState({
      isRecording: false,
      isProcessing: false,
      hasRecorded: false,
      duration: 0,
    });
    setEvaluationState(prev => ({
      ...prev,
      evaluation: null,
      isEvaluating: false,
    }));
  };

  const handleComplete = () => {
    if (evaluationState.evaluation) {
      onComplete(evaluationState.evaluation);
    }
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

  const animateFeedback = () => {
    Animated.spring(feedbackAnimation, {
      toValue: 1,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();
  };

  const cleanup = () => {
    if (recordingTimer.current) {
      clearInterval(recordingTimer.current);
    }
    stopRecordingAnimations();
  };

  const formatDuration = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    return `${seconds}s`;
  };

  const getScoreColor = (score: number): string => {
    if (score >= 80) return theme.colors.success;
    if (score >= 60) return theme.colors.warning;
    return theme.colors.danger;
  };

  const getScoreLabel = (score: number): string => {
    if (score >= 90) return 'Excellent';
    if (score >= 80) return 'Very Good';
    if (score >= 70) return 'Good';
    if (score >= 60) return 'Fair';
    return 'Needs Practice';
  };

  const renderRecordingButton = () => (
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
            recordingState.isRecording && styles.recordingActive,
          ]}
          onPress={recordingState.isRecording ? stopRecording : startRecording}
          disabled={recordingState.isProcessing || evaluationState.isEvaluating}
        >
          {recordingState.isRecording ? (
            <MicOffIcon size={32} color={theme.colors.white} />
          ) : (
            <MicIcon size={32} color={theme.colors.white} />
          )}
        </TouchableOpacity>
      </Animated.View>

      {recordingState.isRecording && (
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
        {recordingState.isRecording 
          ? `Recording... ${formatDuration(recordingState.duration)}`
          : recordingState.hasRecorded 
            ? 'Tap to record again'
            : 'Tap to start recording'
        }
      </Text>
    </View>
  );

  const renderReferenceAudio = () => (
    <Card style={styles.referenceCard}>
      <View style={styles.referenceHeader}>
        <HeadphonesIcon size={20} color={theme.colors.primary} />
        <Text style={styles.referenceTitle}>Reference Audio</Text>
      </View>
      
      <Text style={styles.referenceText}>{targetText}</Text>
      
      <TouchableOpacity
        style={styles.playButton}
        onPress={playReferenceAudio}
        disabled={isPlayingReference}
      >
        {isPlayingReference ? (
          <PauseIcon size={20} color={theme.colors.white} />
        ) : (
          <PlayIcon size={20} color={theme.colors.white} />
        )}
        <Text style={styles.playButtonText}>
          {isPlayingReference ? 'Playing...' : 'Play Reference'}
        </Text>
      </TouchableOpacity>
    </Card>
  );

  const renderEvaluationResults = () => {
    if (!evaluationState.evaluation) return null;

    const { evaluation } = evaluationState;
    const scoreColor = getScoreColor(evaluation.overallScore);
    const scoreLabel = getScoreLabel(evaluation.overallScore);

    return (
      <Animated.View
        style={[
          styles.evaluationContainer,
          {
            transform: [{
              scale: feedbackAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: [0.8, 1],
              }),
            }],
            opacity: feedbackAnimation,
          },
        ]}
      >
        <Card style={styles.evaluationCard}>
          <View style={styles.evaluationHeader}>
            <View style={[styles.scoreCircle, { borderColor: scoreColor }]}>
              <Text style={[styles.scoreText, { color: scoreColor }]}>
                {evaluation.overallScore}%
              </Text>
            </View>
            <View style={styles.scoreInfo}>
              <Text style={styles.scoreLabel}>{scoreLabel}</Text>
              <Text style={styles.attemptText}>
                Attempt {evaluationState.attempts} of {maxAttempts}
              </Text>
            </View>
          </View>

          <View style={styles.scoreBreakdown}>
            <View style={styles.scoreItem}>
              <TargetIcon size={16} color={theme.colors.primary} />
              <Text style={styles.scoreItemLabel}>Accuracy</Text>
              <Text style={styles.scoreItemValue}>{evaluation.accuracyScore}%</Text>
            </View>
            <View style={styles.scoreItem}>
              <TrendingUpIcon size={16} color={theme.colors.success} />
              <Text style={styles.scoreItemLabel}>Fluency</Text>
              <Text style={styles.scoreItemValue}>{evaluation.fluencyScore}%</Text>
            </View>
            <View style={styles.scoreItem}>
              <StarIcon size={16} color={theme.colors.warning} />
              <Text style={styles.scoreItemLabel}>Prosody</Text>
              <Text style={styles.scoreItemValue}>{evaluation.prosodyScore}%</Text>
            </View>
            <View style={styles.scoreItem}>
              <AwardIcon size={16} color={theme.colors.info} />
              <Text style={styles.scoreItemLabel}>Completeness</Text>
              <Text style={styles.scoreItemValue}>{evaluation.completenessScore}%</Text>
            </View>
          </View>

          <View style={styles.feedbackSection}>
            <Text style={styles.feedbackTitle}>Feedback</Text>
            
            {evaluation.feedback.strengths.length > 0 && (
              <View style={styles.feedbackGroup}>
                <Text style={styles.feedbackGroupTitle}>Strengths</Text>
                {evaluation.feedback.strengths.map((strength, index) => (
                  <View key={index} style={styles.feedbackItem}>
                    <CheckIcon size={16} color={theme.colors.success} />
                    <Text style={styles.feedbackText}>{strength}</Text>
                  </View>
                ))}
              </View>
            )}

            {evaluation.feedback.improvements.length > 0 && (
              <View style={styles.feedbackGroup}>
                <Text style={styles.feedbackGroupTitle}>Areas for Improvement</Text>
                {evaluation.feedback.improvements.map((improvement, index) => (
                  <View key={index} style={styles.feedbackItem}>
                    <AlertCircleIcon size={16} color={theme.colors.warning} />
                    <Text style={styles.feedbackText}>{improvement}</Text>
                  </View>
                ))}
              </View>
            )}

            {evaluation.feedback.specificTips.length > 0 && (
              <View style={styles.feedbackGroup}>
                <Text style={styles.feedbackGroupTitle}>Tips</Text>
                {evaluation.feedback.specificTips.map((tip, index) => (
                  <View key={index} style={styles.feedbackItem}>
                    <LightbulbIcon size={16} color={theme.colors.info} />
                    <Text style={styles.feedbackText}>{tip}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        </Card>
      </Animated.View>
    );
  };

  const renderActionButtons = () => (
    <View style={styles.actionButtons}>
      {evaluationState.evaluation && (
        <Button
          title="Continue"
          onPress={handleComplete}
          style={styles.continueButton}
        />
      )}
      
      {evaluationState.attempts < maxAttempts && (
        <Button
          title="Try Again"
          onPress={retryRecording}
          variant="outline"
          style={styles.retryButton}
        />
      )}
      
      {onSkip && (
        <Button
          title="Skip"
          onPress={onSkip}
          variant="outline"
          style={styles.skipButton}
        />
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Pronunciation Practice</Text>
        <Text style={styles.subtitle}>
          {evaluationState.attempts > 0 
            ? `Best Score: ${evaluationState.bestScore}%`
            : 'Speak the text clearly'
          }
        </Text>
      </View>

      {showReferenceAudio && renderReferenceAudio()}

      <View style={styles.recordingSection}>
        {renderRecordingButton()}
      </View>

      {recordingState.isProcessing && (
        <View style={styles.processingContainer}>
          <Text style={styles.processingText}>Processing your recording...</Text>
        </View>
      )}

      {evaluationState.isEvaluating && (
        <View style={styles.processingContainer}>
          <Text style={styles.processingText}>Evaluating pronunciation...</Text>
        </View>
      )}

      {renderEvaluationResults()}
      {renderActionButtons()}
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
  referenceCard: {
    marginBottom: theme.spacing.xl,
    padding: theme.spacing.lg,
  },
  referenceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  referenceTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: '600',
    color: theme.colors.black,
    marginLeft: theme.spacing.sm,
  },
  referenceText: {
    fontSize: theme.fontSize.lg,
    color: theme.colors.gray[700],
    marginBottom: theme.spacing.lg,
    textAlign: 'center',
    lineHeight: 24,
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
  playButtonText: {
    color: theme.colors.white,
    fontSize: theme.fontSize.md,
    fontWeight: '600',
    marginLeft: theme.spacing.sm,
  },
  recordingSection: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  recordingContainer: {
    alignItems: 'center',
    position: 'relative',
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
  recordingActive: {
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
  },
  processingContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  processingText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.gray[600],
  },
  evaluationContainer: {
    marginBottom: theme.spacing.xl,
  },
  evaluationCard: {
    padding: theme.spacing.lg,
  },
  evaluationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  scoreCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.lg,
  },
  scoreText: {
    fontSize: theme.fontSize.xl,
    fontWeight: 'bold',
  },
  scoreInfo: {
    flex: 1,
  },
  scoreLabel: {
    fontSize: theme.fontSize.lg,
    fontWeight: '600',
    color: theme.colors.black,
    marginBottom: theme.spacing.xs,
  },
  attemptText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.gray[600],
  },
  scoreBreakdown: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: theme.spacing.lg,
  },
  scoreItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '50%',
    marginBottom: theme.spacing.md,
  },
  scoreItemLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.gray[600],
    marginLeft: theme.spacing.sm,
    flex: 1,
  },
  scoreItemValue: {
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
    color: theme.colors.black,
  },
  feedbackSection: {
    marginTop: theme.spacing.lg,
  },
  feedbackTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: '600',
    color: theme.colors.black,
    marginBottom: theme.spacing.md,
  },
  feedbackGroup: {
    marginBottom: theme.spacing.md,
  },
  feedbackGroupTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: '600',
    color: theme.colors.gray[700],
    marginBottom: theme.spacing.sm,
  },
  feedbackItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.sm,
  },
  feedbackText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.gray[600],
    marginLeft: theme.spacing.sm,
    flex: 1,
    lineHeight: 18,
  },
  actionButtons: {
    gap: theme.spacing.md,
  },
  continueButton: {
    backgroundColor: theme.colors.success,
  },
  retryButton: {
    borderColor: theme.colors.primary,
  },
  skipButton: {
    borderColor: theme.colors.gray[400],
  },
});
