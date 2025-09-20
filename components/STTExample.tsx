/**
 * Example STT Integration Component
 * Demonstrates how to use the Speech-to-Text module for pronunciation practice
 */

import React, { useState, useEffect, memo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
// Lazy loaded: lucide-react-native
import {
  PronunciationAssessment,
  LanguageConfig,
  speechToTextService,
} from '@/services/audio/speechToText';
import colors from '@/constants/colors';
import { CheckCircle, XCircle, Play, Mic, MicOff, RotateCcw } from '@/components/icons';

interface STTExampleProps {
  targetText: string;
  languageCode: string;
  onComplete?: (assessment: PronunciationAssessment) => void;
}

export const STTExample: React.FC<STTExampleProps> = ({
  targetText,
  languageCode,
  onComplete,
}) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [assessment, setAssessment] = useState<PronunciationAssessment | null>(null);
  const [transcription, setTranscription] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [supportedLanguages, setSupportedLanguages] = useState<LanguageConfig[]>([]);
  const [attempts, setAttempts] = useState(0);

  // Initialize STT service
  useEffect(() => {
    const initializeSTT = async () => {
      try {
        console.debug('Initializing STT service...');
        
        // Initialize with offline fallback enabled
        await speechToTextService.initialize({
          offlineMode: true,
          cacheResults: true,
          timeout: 15000,
          retryAttempts: 2,
        });
        
        // Get supported languages
        const languages = speechToTextService.getSupportedLanguages();
        setSupportedLanguages(languages);
        
        setIsInitialized(true);
        console.debug('STT service initialized successfully');
        console.debug(`Found ${languages.length} supported languages`);
      } catch (error) {
        console.error('Failed to initialize STT service:', error);
        setError('Failed to initialize speech recognition. Please check microphone permissions.');
      }
    };

    initializeSTT();
  }, []);

  // Check if current language is supported
  const isLanguageSupported = speechToTextService.isLanguageSupported(languageCode);
  const languageAccuracy = speechToTextService.getLanguageAccuracy(languageCode);

  // Start recording
  const startRecording = async () => {
    if (!isInitialized) {
      setError('Service not initialized');
      return;
    }

    if (!isLanguageSupported) {
      setError(`Language ${languageCode} is not supported`);
      return;
    }

    try {
      setError(null);
      setIsRecording(true);
      
      console.debug(`Starting recording for language: ${languageCode}`);
      await speechToTextService.startRecording(languageCode);
      
      console.debug('Recording started successfully');
    } catch (error) {
      console.error('Failed to start recording:', error);
      setError('Failed to start recording. Please check microphone permissions.');
      setIsRecording(false);
    }
  };

  // Stop recording and process
  const stopRecording = async () => {
    if (!isRecording) return;

    try {
      setIsRecording(false);
      setIsProcessing(true);
      
      console.debug('Stopping recording and processing...');
      
      // Stop recording and get audio data
      const audioData = await speechToTextService.stopRecording();
      console.debug('Audio data received:', { duration: audioData.duration });
      
      // Get transcription
      const transcriptionResult = await speechToTextService.transcribe(
        audioData,
        languageCode,
        targetText,
      );
      
      console.debug('Transcription result:', transcriptionResult);
      setTranscription(transcriptionResult.text);
      
      // Get pronunciation assessment
      const assessmentResult = await speechToTextService.assessPronunciation(
        audioData,
        targetText,
        languageCode,
      );
      
      console.debug('Assessment result:', assessmentResult);
      setAssessment(assessmentResult);
      setAttempts(prev => prev + 1);
      
      // Call completion callback
      if (onComplete) {
        onComplete(assessmentResult);
      }
      
    } catch (error) {
      console.error('Failed to process recording:', error);
      setError(`Processing failed: ${(error as Error).message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Reset for new attempt
  const resetAssessment = () => {
    setAssessment(null);
    setTranscription('');
    setError(null);
  };

  // Get score color
  const getScoreColor = (score: number): string => {
    if (score >= 80) return colors.success;
    if (score >= 60) return colors.warning;
    return colors.error;
  };

  // Get score icon
  const getScoreIcon = (score: number) => {
    if (score >= 70) {
      return <CheckCircle size={20} color={colors.success} />;
    }
    return <XCircle size={20} color={colors.error} />;
  };

  // Show service status
  const showServiceStatus = async () => {
    try {
      const status = await speechToTextService.getServiceStatus();
      Alert.alert('STT Service Status', JSON.stringify(status, null, 2));
    } catch (err) {
      Alert.alert('Error', 'Failed to get service status');
    }
  };

  if (!isInitialized) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Initializing speech recognition...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Pronunciation Practice</Text>
        <TouchableOpacity onPress={showServiceStatus} style={styles.statusButton}>
          <Text style={styles.statusButtonText}>Service Status</Text>
        </TouchableOpacity>
      </View>

      {/* Language Info */}
      <View style={styles.languageInfo}>
        <Text style={styles.languageText}>
          Language: {languageCode.toUpperCase()}
        </Text>
        <Text style={[
          styles.accuracyText,
          { color: languageAccuracy === 'high' ? colors.success : 
                   languageAccuracy === 'medium' ? colors.warning : colors.error },
        ]}>
          Accuracy: {languageAccuracy || 'Unknown'}
        </Text>
        <Text style={styles.supportedText}>
          Supported: {isLanguageSupported ? '✓' : '✗'}
        </Text>
      </View>

      {/* Target Text */}
      <View style={styles.targetContainer}>
        <Text style={styles.targetLabel}>Say this phrase:</Text>
        <Text style={styles.targetText}>{targetText}</Text>
        <TouchableOpacity style={styles.playButton}>
          <Play size={16} color={colors.primary} />
          <Text style={styles.playButtonText}>Listen</Text>
        </TouchableOpacity>
      </View>

      {/* Error Display */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Recording Controls */}
      <View style={styles.recordingSection}>
        <TouchableOpacity
          style={[
            styles.recordButton,
            isRecording && styles.recordButtonActive,
            (!isLanguageSupported || isProcessing) && styles.recordButtonDisabled,
          ]}
          onPress={isRecording ? stopRecording : startRecording}
          disabled={!isLanguageSupported || isProcessing}
        >
          {isProcessing ? (
            <Text style={styles.recordButtonText}>Processing...</Text>
          ) : isRecording ? (
            <>
              <MicOff size={24} color="white" />
              <Text style={styles.recordButtonText}>Stop Recording</Text>
            </>
          ) : (
            <>
              <Mic size={24} color="white" />
              <Text style={styles.recordButtonText}>Start Recording</Text>
            </>
          )}
        </TouchableOpacity>

        <Text style={styles.instructionText}>
          {isRecording
            ? 'Speak clearly and tap to stop'
            : isProcessing
            ? 'Processing your pronunciation...'
            : 'Tap to start recording'}
        </Text>

        {attempts > 0 && (
          <Text style={styles.attemptsText}>
            Attempts: {attempts}
          </Text>
        )}
      </View>

      {/* Transcription Result */}
      {transcription && (
        <View style={styles.transcriptionContainer}>
          <Text style={styles.transcriptionLabel}>What you said:</Text>
          <Text style={styles.transcriptionText}>&ldquo;{transcription}&rdquo;</Text>
        </View>
      )}

      {/* Assessment Results */}
      {assessment && (
        <View style={styles.assessmentContainer}>
          <View style={styles.scoreHeader}>
            {getScoreIcon(assessment.overallScore)}
            <Text style={[
              styles.overallScore,
              { color: getScoreColor(assessment.overallScore) },
            ]}>
              {assessment.overallScore}%
            </Text>
          </View>

          {/* Detailed Scores */}
          <View style={styles.detailedScores}>
            <View style={styles.scoreRow}>
              <Text style={styles.scoreLabel}>Accuracy:</Text>
              <Text style={styles.scoreValue}>{assessment.accuracyScore}%</Text>
            </View>
            <View style={styles.scoreRow}>
              <Text style={styles.scoreLabel}>Fluency:</Text>
              <Text style={styles.scoreValue}>{assessment.fluencyScore}%</Text>
            </View>
            <View style={styles.scoreRow}>
              <Text style={styles.scoreLabel}>Completeness:</Text>
              <Text style={styles.scoreValue}>{assessment.completenessScore}%</Text>
            </View>
            <View style={styles.scoreRow}>
              <Text style={styles.scoreLabel}>Prosody:</Text>
              <Text style={styles.scoreValue}>{assessment.prosodyScore}%</Text>
            </View>
          </View>

          {/* Feedback */}
          <View style={styles.feedbackContainer}>
            <Text style={styles.feedbackTitle}>Feedback:</Text>
            {assessment.feedback.map((feedback, index) => (
              <Text key={index} style={styles.feedbackText}>
                • {feedback}
              </Text>
            ))}
          </View>

          {/* Word-level Feedback */}
          {assessment.detailedFeedback.words.length > 0 && (
            <View style={styles.wordFeedbackContainer}>
              <Text style={styles.feedbackTitle}>Word Analysis:</Text>
              {assessment.detailedFeedback.words.map((word, index) => (
                <View key={index} style={styles.wordFeedbackRow}>
                  <Text style={styles.wordText}>{word.word}</Text>
                  <Text style={[
                    styles.wordScore,
                    { color: getScoreColor(word.score) },
                  ]}>
                    {word.score}%
                  </Text>
                  {word.issues.length > 0 && (
                    <Text style={styles.wordIssues}>
                      {word.issues.join(', ')}
                    </Text>
                  )}
                </View>
              ))}
            </View>
          )}

          {/* Try Again Button */}
          <TouchableOpacity style={styles.tryAgainButton} onPress={resetAssessment}>
            <RotateCcw size={16} color={colors.primary} />
            <Text style={styles.tryAgainText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Supported Languages Info */}
      <View style={styles.languagesContainer}>
        <Text style={styles.languagesTitle}>
          Supported Languages ({supportedLanguages.length})
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {supportedLanguages.slice(0, 10).map((lang, index) => (
            <View key={index} style={styles.languageChip}>
              <Text style={styles.languageChipText}>{lang.code}</Text>
              <Text style={styles.languageChipAccuracy}>{lang.accuracy}</Text>
            </View>
          ))}
        </ScrollView>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainer: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  statusButton: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  statusButtonText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '600',
  },
  loadingText: {
    textAlign: 'center',
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 50,
  },
  languageInfo: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  languageText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  accuracyText: {
    fontSize: 14,
    fontWeight: '500',
  },
  supportedText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  targetContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  targetLabel: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  targetText: {
    fontSize: 20,
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
  recordButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    minWidth: 200,
    justifyContent: 'center',
  },
  recordButtonActive: {
    backgroundColor: colors.error,
  },
  recordButtonDisabled: {
    backgroundColor: colors.textSecondary,
    opacity: 0.6,
  },
  recordButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  instructionText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 8,
  },
  attemptsText: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  transcriptionContainer: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
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
  assessmentContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  scoreHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  overallScore: {
    fontSize: 32,
    fontWeight: 'bold',
    marginLeft: 8,
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
  feedbackContainer: {
    marginBottom: 20,
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
  wordFeedbackContainer: {
    marginBottom: 20,
  },
  wordFeedbackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  wordText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
  },
  wordScore: {
    fontSize: 14,
    fontWeight: '600',
    marginRight: 8,
  },
  wordIssues: {
    fontSize: 12,
    color: colors.textSecondary,
    flex: 2,
  },
  tryAgainButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
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
  languagesContainer: {
    marginTop: 20,
  },
  languagesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  languageChip: {
    backgroundColor: colors.primaryLight,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    alignItems: 'center',
  },
  languageChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },
  languageChipAccuracy: {
    fontSize: 10,
    color: colors.primary,
    opacity: 0.7,
  },
});

export default memo(STTExample);

STTExample.displayName = 'STTExample';
