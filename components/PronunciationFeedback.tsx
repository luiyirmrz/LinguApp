/**
 * Pronunciation Feedback Component
 * Provides real-time pronunciation assessment with visual feedback
 * Integrates with await lazyLoadSpeech()-to-Text service for accurate pronunciation scoring
 */

import React, { useState, useCallback, useEffect, memo } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Alert,
} from 'react-native';
// Lazy loaded: lucide-react-native
// Lazy loaded: expo-linear-gradient
// Lazy loaded: expo-speech
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';
import speechToTextService, {
  PronunciationAssessment,
  TranscriptionResult,
} from '@/services/audio/speechToText';
import colors from '@/constants/colors';
import ErrorBoundary from './ErrorBoundary';
import { CheckCircle, XCircle, Mic, MicOff, Volume2, RotateCcw } from '@/components/icons';

interface PronunciationFeedbackProps {
  targetText: string;
  languageCode?: string;
  onComplete?: (assessment: PronunciationAssessment) => void;
  onSkip?: () => void;
  showSkipButton?: boolean;
  maxAttempts?: number;
  autoStart?: boolean;
}

interface RecordingState {
  isRecording: boolean;
  isProcessing: boolean;
  hasRecorded: boolean;
  duration: number;
}

const PronunciationFeedbackComponent: React.FC<PronunciationFeedbackProps> = ({
  targetText,
  languageCode = 'en',
  onComplete,
  onSkip,
  showSkipButton = true,
  maxAttempts = 3,
  autoStart = false,
}) => {
  useUnifiedAuth(); // Keep auth context active
  const [recordingState, setRecordingState] = useState<RecordingState>({
    isRecording: false,
    isProcessing: false,
    hasRecorded: false,
    duration: 0,
  });
  
  const [assessment, setAssessment] = useState<PronunciationAssessment | null>(null);
  const [transcription, setTranscription] = useState<TranscriptionResult | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  
  // Animation values
  const pulseAnim = useState(new Animated.Value(1))[0];
  const progressAnim = useState(new Animated.Value(0))[0];
  const feedbackAnim = useState(new Animated.Value(0))[0];



  // Audio playback function
  const playTargetAudio = useCallback(async () => {
    if (isPlayingAudio) return;
    
    try {
      setIsPlayingAudio(true);
      
      // Get language code for speech synthesis
      const speechLanguage = getSpeechLanguageCode(languageCode);
      
      const Speech = await import('expo-speech');
      await Speech.speak(targetText, {
        language: speechLanguage,
        pitch: 1.0,
        rate: 0.8, // Slightly slower for better pronunciation learning
        onDone: () => {
          setIsPlayingAudio(false);
        },
        onError: (error: any) => {
          console.error('Speech synthesis error:', error);
          setIsPlayingAudio(false);
          Alert.alert('Audio Error', 'Unable to play pronunciation audio. Please try again.');
        },
      });
    } catch (error) {
      console.error('Failed to play audio:', error);
      setIsPlayingAudio(false);
      Alert.alert('Audio Error', 'Unable to play pronunciation audio. Please try again.');
    }
  }, [targetText, languageCode, isPlayingAudio]);

  // Helper function to get speech language code
  const getSpeechLanguageCode = (code: string): string => {
    const languageMap: { [key: string]: string } = {
      'en': 'en-US',
      'es': 'es-ES',
      'hr': 'hr-HR',
      'fr': 'fr-FR',
      'de': 'de-DE',
      'it': 'it-IT',
      'pt': 'pt-BR',
      'ru': 'ru-RU',
      'ja': 'ja-JP',
      'ko': 'ko-KR',
      'zh': 'zh-CN',
    };
    return languageMap[code] || 'en-US';
  };

  // Initialize STT service
  useEffect(() => {
    const initializeSTT = async () => {
      try {
        console.debug('Initializing STT service for pronunciation feedback');
        await speechToTextService.initialize();
        setIsInitialized(true);
        
        if (autoStart) {
          setTimeout(() => {
            void startRecording();
          }, 1000);
        }
      } catch (error) {
        console.error('Failed to initialize STT service:', error);
        setError('Microphone access required for pronunciation feedback');
      }
    };

    initializeSTT();
  }, [autoStart]);

  // Cleanup speech on unmount
  useEffect(() => {
    return () => {
      import('expo-speech').then((Speech) => Speech.stop()).catch(console.error);
    };
  }, []);

  // Pulse animation for recording
  const startPulseAnimation = useCallback(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [pulseAnim]);

  const stopPulseAnimation = useCallback(() => {
    pulseAnim.stopAnimation();
    Animated.timing(pulseAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [pulseAnim]);

  // Progress animation
  const animateProgress = useCallback((progress: number) => {
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 500,
      useNativeDriver: false,
    }).start();
  }, [progressAnim]);

  // Feedback animation
  const animateFeedback = useCallback(() => {
    feedbackAnim.setValue(0);
    Animated.spring(feedbackAnim, {
      toValue: 1,
      tension: 100,
      friction: 8,
      useNativeDriver: true,
    }).start();
  }, [feedbackAnim]);

  // Start recording
  const startRecording = useCallback(async () => {
    if (!isInitialized) {
      setError('Service not initialized');
      return;
    }

    if (!speechToTextService.isLanguageSupported(languageCode)) {
      setError(`Language ${languageCode} not supported`);
      return;
    }

    if (attempts >= maxAttempts) {
      setError(`Maximum attempts (${maxAttempts}) reached`);
      return;
    }

    try {
      setError(null);
      setRecordingState({
        isRecording: true,
        isProcessing: false,
        hasRecorded: false,
        duration: 0,
      });

      startPulseAnimation();
      await speechToTextService.startRecording(languageCode);
      
      console.debug('Recording started for pronunciation feedback');
    } catch (error) {
      console.error('Failed to start recording:', error);
      setError('Failed to start recording. Please check microphone permissions.');
      setRecordingState(prev => ({ ...prev, isRecording: false }));
      stopPulseAnimation();
    }
  }, [isInitialized, languageCode, attempts, maxAttempts, startPulseAnimation, stopPulseAnimation]);

  // Stop recording and process
  const stopRecording = useCallback(async () => {
    if (!recordingState.isRecording) return;

    try {
      setRecordingState(prev => ({
        ...prev,
        isRecording: false,
        isProcessing: true,
        hasRecorded: true,
      }));
      
      stopPulseAnimation();
      
      console.debug('Stopping recording and processing pronunciation...');
      const audioData = await speechToTextService.stopRecording();
      
      // Get transcription and assessment
      const transcriptionResult = await speechToTextService.transcribe(
        audioData,
        languageCode,
        targetText,
      );
      
      const assessmentResult = await speechToTextService.assessPronunciation(
        audioData,
        targetText,
        languageCode,
      );

      setTranscription(transcriptionResult);
      setAssessment(assessmentResult);
      setAttempts(prev => prev + 1);
      
      // Animate progress based on score
      animateProgress(assessmentResult.overallScore / 100);
      animateFeedback();
      
      // Call completion callback
      if (onComplete) {
        onComplete(assessmentResult);
      }
      
      console.debug('Pronunciation assessment completed:', {
        score: assessmentResult.overallScore,
        transcription: transcriptionResult.text,
      });
    } catch (error) {
      console.error('Failed to process recording:', error);
      setError('Failed to process recording. Please try again.');
    } finally {
      setRecordingState(prev => ({ ...prev, isProcessing: false }));
    }
  }, [recordingState.isRecording, languageCode, targetText, onComplete, stopPulseAnimation, animateProgress, animateFeedback]);

  // Try again
  const tryAgain = useCallback(() => {
    setAssessment(null);
    setTranscription(null);
    setError(null);
    setRecordingState({
      isRecording: false,
      isProcessing: false,
      hasRecorded: false,
      duration: 0,
    });
    progressAnim.setValue(0);
    feedbackAnim.setValue(0);
  }, [progressAnim, feedbackAnim]);

  // Get score color
  const getScoreColor = (score: number): string => {
    if (score >= 80) return colors.success;
    if (score >= 60) return colors.warning;
    return colors.error;
  };

  // Get score icon
  const getScoreIcon = (score: number) => {
    if (score >= 70) {
      return <CheckCircle size={24} color={colors.success} />;
    }
    return <XCircle size={24} color={colors.error} />;
  };

  // Render recording button
  const renderRecordingButton = () => {
    const { isRecording, isProcessing } = recordingState;
    
    if (isProcessing) {
      return (
        <View style={styles.recordingButton}>
          <LinearGradient
            colors={[colors.primary, colors.secondary]}
            style={styles.recordingButtonGradient}
          >
            <Text style={styles.processingText}>Processing...</Text>
          </LinearGradient>
        </View>
      );
    }

    return (
      <TouchableOpacity
        style={styles.recordingButton}
        onPress={isRecording ? stopRecording : startRecording}
        disabled={!isInitialized || isProcessing}
      >
        <Animated.View
          style={[
            styles.recordingButtonGradient,
            {
              transform: [{ scale: isRecording ? pulseAnim : 1 }],
            },
          ]}
        >
          <LinearGradient
            colors={
              isRecording
                ? [colors.error, '#ff6b6b']
                : [colors.primary, colors.secondary]
            }
            style={styles.recordingButtonGradient}
          >
            {isRecording ? (
              <MicOff size={32} color="white" />
            ) : (
              <Mic size={32} color="white" />
            )}
          </LinearGradient>
        </Animated.View>
      </TouchableOpacity>
    );
  };

  // Render assessment results
  const renderAssessment = () => {
    if (!assessment) return null;

    return (
      <Animated.View
        style={[
          styles.assessmentContainer,
          {
            transform: [
              {
                scale: feedbackAnim,
              },
            ],
            opacity: feedbackAnim,
          },
        ]}
      >
        {/* Overall Score */}
        <View style={styles.scoreContainer}>
          <View style={styles.scoreHeader}>
            {getScoreIcon(assessment.overallScore)}
            <Text style={[styles.scoreText, { color: getScoreColor(assessment.overallScore) }]}>
              {assessment.overallScore}%
            </Text>
          </View>
          
          {/* Progress Bar */}
          <View style={styles.progressBarContainer}>
            <Animated.View
              style={[
                styles.progressBar,
                {
                  width: progressAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%'],
                  }),
                  backgroundColor: getScoreColor(assessment.overallScore),
                },
              ]}
            />
          </View>
        </View>

        {/* Detailed Scores */}
        <View style={styles.detailedScores}>
          <View style={styles.scoreRow}>
            <Text style={styles.scoreLabel}>Accuracy</Text>
            <Text style={styles.scoreValue}>{assessment.accuracyScore}%</Text>
          </View>
          <View style={styles.scoreRow}>
            <Text style={styles.scoreLabel}>Fluency</Text>
            <Text style={styles.scoreValue}>{assessment.fluencyScore}%</Text>
          </View>
          <View style={styles.scoreRow}>
            <Text style={styles.scoreLabel}>Completeness</Text>
            <Text style={styles.scoreValue}>{assessment.completenessScore}%</Text>
          </View>
        </View>

        {/* Transcription */}
        {transcription && (
          <View style={styles.transcriptionContainer}>
            <Text style={styles.transcriptionLabel}>What you said:</Text>
            <Text style={styles.transcriptionText}>&ldquo;{transcription.text}&rdquo;</Text>
          </View>
        )}

        {/* Feedback */}
        <View style={styles.feedbackContainer}>
          <Text style={styles.feedbackTitle}>Feedback:</Text>
          {assessment.feedback.map((feedback, index) => (
            <Text key={index} style={styles.feedbackText}>
              • {feedback}
            </Text>
          ))}
        </View>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Target Text */}
      <View style={styles.targetContainer}>
        <Text style={styles.targetLabel}>Say this phrase:</Text>
        <Text style={styles.targetText}>{targetText}</Text>
        <TouchableOpacity 
          style={[styles.playButton, isPlayingAudio && styles.playButtonDisabled]}
          onPress={playTargetAudio}
          disabled={isPlayingAudio}
        >
          <Volume2 size={20} color={isPlayingAudio ? colors.textSecondary : colors.primary} />
          <Text style={[styles.playButtonText, isPlayingAudio && styles.playButtonTextDisabled]}>
            {isPlayingAudio ? 'Playing...' : 'Listen'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Error Message */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Recording Section */}
      <View style={styles.recordingSection}>
        {renderRecordingButton()}
        
        <Text style={styles.instructionText}>
          {recordingState.isRecording
            ? 'Tap to stop recording'
            : recordingState.isProcessing
            ? 'Processing your pronunciation...'
            : assessment
            ? 'Great job! Try again or continue'
            : 'Tap to start recording'}
        </Text>
        
        {attempts > 0 && (
          <Text style={styles.attemptsText}>
            Attempt {attempts} of {maxAttempts}
          </Text>
        )}
      </View>

      {/* Assessment Results */}
      {renderAssessment()}

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        {assessment && (
          <TouchableOpacity style={styles.tryAgainButton} onPress={tryAgain}>
            <RotateCcw size={20} color={colors.primary} />
            <Text style={styles.tryAgainText}>Try Again</Text>
          </TouchableOpacity>
        )}
        
        {showSkipButton && (
          <TouchableOpacity style={styles.skipButton} onPress={onSkip}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: colors.background,
  },
  targetContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  targetLabel: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  targetText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 12,
  },
  playButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  playButtonText: {
    marginLeft: 8,
    color: colors.primary,
    fontWeight: '600',
  },
  playButtonDisabled: {
    opacity: 0.6,
  },
  playButtonTextDisabled: {
    color: colors.textSecondary,
  },
  errorContainer: {
    backgroundColor: colors.errorLight,
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  errorText: {
    color: colors.error,
    textAlign: 'center',
    fontSize: 14,
  },
  recordingSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  recordingButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  recordingButtonGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  processingText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  instructionText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 8,
  },
  attemptsText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  assessmentContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  scoreContainer: {
    marginBottom: 20,
  },
  scoreHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  scoreText: {
    fontSize: 32,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  detailedScores: {
    marginBottom: 20,
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  scoreLabel: {
    fontSize: 16,
    color: colors.text,
  },
  scoreValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
  transcriptionContainer: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  transcriptionLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  transcriptionText: {
    fontSize: 16,
    color: colors.text,
    fontStyle: 'italic',
  },
  feedbackContainer: {
    marginTop: 8,
  },
  feedbackTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  feedbackText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
    lineHeight: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tryAgainButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  tryAgainText: {
    marginLeft: 8,
    color: colors.primary,
    fontWeight: '600',
  },
  skipButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  skipText: {
    color: colors.textSecondary,
    fontSize: 16,
  },
});

// Export with error boundary wrapper
export const PronunciationFeedback: React.FC<PronunciationFeedbackProps> = (props) => {
  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        console.error('PronunciationFeedback error:', error, errorInfo);
      }}
    >
      <PronunciationFeedbackComponent {...props} />
    </ErrorBoundary>
  );
};

export default memo(PronunciationFeedback);

PronunciationFeedback.displayName = 'PronunciationFeedback';
