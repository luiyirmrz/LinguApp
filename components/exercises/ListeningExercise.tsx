// Listening Exercise Component - Audio comprehension with interactive controls
// Supports multiple audio formats, playback speed control, and transcript verification
// Integrates with pronunciation evaluation and adaptive learning

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Alert,
  Platform,
  Animated,
  Dimensions,
} from 'react-native';
import { Audio } from 'expo-av';
import { Button } from '@/components/Button';
import { ProgressBar } from '@/components/ProgressBar';
import { theme } from '@/constants/theme';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';
import { useEnhancedErrorHandling } from '@/hooks/useEnhancedErrorHandling';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Headphones } from '@/components/icons/LucideReplacement';
import { MultilingualExercise, MultilingualContent } from '@/types';
// import { lazyLoadAudio } from '@/services/LazyDependencies';
import { useUniversalAudio } from '@/hooks/useUniversalAudio';

const { width } = Dimensions.get('window');

interface ListeningExerciseProps {
  exercise: MultilingualExercise;
  userAnswer: string;
  onAnswerChange: (answer: string) => void;
  disabled?: boolean;
  getText: (content: MultilingualContent) => string;
  playAudio?: (url: string) => Promise<void>;
  onComplete?: (result: ListeningResult) => void;
  onNext?: () => void;
  onSkip?: () => void;
}

interface ListeningResult {
  exerciseId: string;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  timeSpent: number;
  attemptsUsed: number;
  hintsUsed: number;
  playbackCount: number;
  accuracy: number;
}

export default function ListeningExercise({
  exercise,
  userAnswer,
  onAnswerChange,
  disabled = false,
  getText,
  playAudio,
  onComplete,
  onNext,
  onSkip,
}: ListeningExerciseProps) {
  const { user } = useUnifiedAuth();
  const { handleError, showSuccess, triggerHaptic } = useEnhancedErrorHandling({
    showToast: true,
    enableHaptic: true,
    enableRetry: true,
  });
  const { playSentence, stopAudio } = useUniversalAudio({
    defaultLanguage: exercise.targetLanguage,
    quality: 'premium',
    enableHapticFeedback: true,
  });

  // State management
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [playbackCount, setPlaybackCount] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [showTranscript, setShowTranscript] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [timeSpent, setTimeSpent] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string>('');

  // Refs and animations
  const startTimeRef = useRef(Date.now());
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const waveformAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;

  // Get audio URL from exercise
  const audioUrl = (exercise as any).audioUrl || exercise.question?.audioUrl || '';
  const transcript = (exercise as any).transcript || getText(exercise.question);
  const options = exercise.options || [];

  useEffect(() => {
    startTimer();
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, []);

  useEffect(() => {
    if (isPlaying) {
      startWaveformAnimation();
    } else {
      stopWaveformAnimation();
    }
  }, [isPlaying]);

  const startTimer = () => {
    timerRef.current = setInterval(() => {
      setTimeSpent(Date.now() - startTimeRef.current);
    }, 1000) as any;
  };

  const startWaveformAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(waveformAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(waveformAnim, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  };

  const stopWaveformAnimation = () => {
    waveformAnim.stopAnimation();
    waveformAnim.setValue(0);
  };

  const loadAudio = useCallback(async () => {
    if (!audioUrl) {
      handleError(new Error('No audio URL provided'));
      return null;
    }

    try {
      setIsLoading(true);
      const { sound: audioSound } = await Audio.Sound.createAsync(
        { uri: audioUrl },
        { 
          shouldPlay: false,
          rate: playbackSpeed,
          volume: isMuted ? 0 : 1.0,
        },
      );

      audioSound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded) {
          setIsPlaying(status.isPlaying || false);
          if (status.didJustFinish) {
            setIsPlaying(false);
            triggerHaptic('light');
          }
        }
      });

      setSound(audioSound);
      return audioSound;
    } catch (error) {
      handleError(error as Error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [audioUrl, playbackSpeed, isMuted, handleError, triggerHaptic]);

  const playAudioTrack = useCallback(async () => {
    try {
      if (isPlaying) {
        // Stop current audio
        await stopAudio();
        setIsPlaying(false);
        return;
      }

      // Get the correct answer text to speak (what the user should hear)
      let textToSpeak = '';
      
      if (exercise.correctAnswer && typeof exercise.correctAnswer === 'string') {
        // Speak the correct answer in the target language
        textToSpeak = exercise.correctAnswer;
      } else if ((exercise as any).transcript) {
        // Use transcript if available
        textToSpeak = (exercise as any).transcript;
      } else {
        // Fallback to question content
        textToSpeak = getText(exercise.question);
      }
      
      const targetLanguage = exercise.targetLanguage || 'en';
      
      console.debug('ListeningExercise: Playing correct answer audio:', textToSpeak, 'Language:', targetLanguage);
      
      setIsPlaying(true);
      setPlaybackCount(prev => prev + 1);
      
      // Use professional TTS for the listening content
      const result = await playSentence(textToSpeak, targetLanguage, true);
      
      if (result.success) {
        console.debug(`ListeningExercise: Audio played using ${result.method}`);
      } else {
        console.warn('ListeningExercise: Audio failed:', (result as any).error);
      }
      
      setIsPlaying(false);
    } catch (error) {
      setIsPlaying(false);
      handleError(error as Error);
    }
  }, [isPlaying, exercise, getText, playSentence, stopAudio, handleError]);

  const replayAudio = useCallback(async () => {
    try {
      if (sound) {
        await sound.setPositionAsync(0);
        await sound.playAsync();
        setPlaybackCount(prev => prev + 1);
        await triggerHaptic('light');
      }
    } catch (error) {
      handleError(error as Error);
    }
  }, [sound, handleError, triggerHaptic]);

  const changePlaybackSpeed = () => {
    const speeds = [0.75, 1.0, 1.25, 1.5];
    const currentIndex = speeds.indexOf(playbackSpeed);
    const nextSpeed = speeds[(currentIndex + 1) % speeds.length];
    setPlaybackSpeed(nextSpeed);
    
    if (sound) {
      sound.setRateAsync(nextSpeed, true);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (sound) {
      sound.setVolumeAsync(isMuted ? 1.0 : 0);
    }
  };

  const showHint = () => {
    setShowTranscript(true);
    setHintsUsed(prev => prev + 1);
    triggerHaptic('warning');
  };

  const handleAnswerSelect = (answer: string) => {
    setSelectedOption(answer);
    onAnswerChange(answer);
    setAttempts(prev => prev + 1);
  };

  const handleSubmit = () => {
    const isCorrect = selectedOption === exercise.correctAnswer;
    const accuracy = isCorrect ? 100 : 0;

    const result: ListeningResult = {
      exerciseId: exercise.id,
      userAnswer: selectedOption,
      correctAnswer: exercise.correctAnswer as string,
      isCorrect,
      timeSpent,
      attemptsUsed: attempts,
      hintsUsed,
      playbackCount,
      accuracy,
    };

    if (isCorrect) {
      showSuccess('Correct! Well done!');
      triggerHaptic('success');
    } else {
      triggerHaptic('error');
    }

    onComplete?.(result);
  };

  const renderWaveform = () => {
    return (
      <View style={styles.waveformContainer}>
        {[...Array(12)].map((_, index) => (
          <Animated.View
            key={index}
            style={[
              styles.waveformBar,
              {
                height: 20 + Math.random() * 30,
                opacity: waveformAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.3, 1],
                }),
                transform: [{
                  scaleY: waveformAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.5, 1.5],
                  }),
                }],
              },
            ]}
          />
        ))}
      </View>
    );
  };

  const renderMultipleChoice = () => {
    return (
      <View style={styles.optionsContainer}>
        {options.map((option, index) => (
          <Pressable
            key={index}
            style={[
              styles.optionButton,
              selectedOption === (option as any) && styles.selectedOption,
              disabled && styles.disabledOption,
            ]}
            onPress={() => handleAnswerSelect(option as any)}
            disabled={disabled}
          >
            <Text style={[
              styles.optionText,
              selectedOption === (option as any) && styles.selectedOptionText,
            ]}>
              {option as any}
            </Text>
          </Pressable>
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Audio Player Section */}
      <View style={styles.audioSection}>
        <Text style={styles.instruction}>
          {getText(exercise.instruction) || 'Listen and choose the correct answer'}
        </Text>

        {/* Waveform Visualization */}
        {renderWaveform()}

        {/* Audio Controls */}
        <View style={styles.controlsContainer}>
          <Pressable
            style={[styles.controlButton, styles.playButton]}
            onPress={playAudioTrack}
            disabled={isLoading}
          >
            {isLoading ? (
              <Text style={styles.controlButtonText}>Loading...</Text>
            ) : isPlaying ? (
              <Pause size={24} color={theme.colors.white} />
            ) : (
              <Play size={24} color={theme.colors.white} />
            )}
          </Pressable>

          <Pressable
            style={styles.controlButton}
            onPress={replayAudio}
            disabled={!sound}
          >
            <RotateCcw size={20} color={theme.colors.primary} />
          </Pressable>

          <Pressable
            style={styles.controlButton}
            onPress={changePlaybackSpeed}
          >
            <Text style={styles.speedText}>{playbackSpeed}x</Text>
          </Pressable>

          <Pressable
            style={styles.controlButton}
            onPress={toggleMute}
          >
            {isMuted ? (
              <VolumeX size={20} color={theme.colors.gray[400]} />
            ) : (
              <Volume2 size={20} color={theme.colors.primary} />
            )}
          </Pressable>
        </View>

        {/* Playback Info */}
        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>
            Played {playbackCount} time{playbackCount !== 1 ? 's' : ''}
          </Text>
          <Text style={styles.infoText}>
            Speed: {playbackSpeed}x
          </Text>
        </View>
      </View>

      {/* Exercise Content */}
      <View style={styles.exerciseContent}>
        <Text style={styles.question}>
          {getText(exercise.question)}
        </Text>

        {/* Transcript (if hint used) */}
        {showTranscript && (
          <Animated.View 
            style={[styles.transcriptContainer, { opacity: fadeAnim }]}
          >
            <Text style={styles.transcriptLabel}>Transcript:</Text>
            <Text style={styles.transcriptText}>{transcript}</Text>
          </Animated.View>
        )}

        {/* Answer Options */}
        {renderMultipleChoice()}

        {/* Hint Button */}
        {!showTranscript && (
          <Pressable
            style={styles.hintButton}
            onPress={showHint}
          >
            <Text style={styles.hintButtonText}>
              Show Transcript (Hint)
            </Text>
          </Pressable>
        )}
      </View>

      {/* Submit Button */}
      <View style={styles.submitContainer}>
        <Button
          title="Submit Answer"
          onPress={handleSubmit}
          disabled={!selectedOption || disabled}
          size="large"
          style={styles.submitButton}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: theme.colors.background,
  },
  audioSection: {
    backgroundColor: theme.colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    elevation: 2,
    shadowColor: theme.colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  instruction: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: 20,
  },
  waveformContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 60,
    marginBottom: 20,
    gap: 4,
  },
  waveformBar: {
    width: 4,
    backgroundColor: theme.colors.primary,
    borderRadius: 2,
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 15,
    marginBottom: 15,
  },
  controlButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 1,
  },
  playButton: {
    backgroundColor: theme.colors.primary,
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  controlButtonText: {
    fontSize: 12,
    color: theme.colors.white,
  },
  speedText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  exerciseContent: {
    flex: 1,
  },
  question: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 24,
  },
  transcriptContainer: {
    backgroundColor: `${theme.colors.warning  }20`,
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.warning,
  },
  transcriptLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.warning,
    marginBottom: 5,
    textTransform: 'uppercase',
  },
  transcriptText: {
    fontSize: 14,
    color: theme.colors.text,
    fontStyle: 'italic',
  },
  optionsContainer: {
    gap: 12,
    marginBottom: 20,
  },
  optionButton: {
    backgroundColor: theme.colors.white,
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: theme.colors.gray[200],
  },
  selectedOption: {
    borderColor: theme.colors.primary,
    backgroundColor: `${theme.colors.primary  }10`,
  },
  disabledOption: {
    opacity: 0.6,
  },
  optionText: {
    fontSize: 16,
    color: theme.colors.text,
    textAlign: 'center',
  },
  selectedOptionText: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
  hintButton: {
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: `${theme.colors.warning  }20`,
    borderWidth: 1,
    borderColor: theme.colors.warning,
  },
  hintButtonText: {
    fontSize: 14,
    color: theme.colors.warning,
    fontWeight: '500',
  },
  submitContainer: {
    paddingTop: 20,
  },
  submitButton: {
    marginTop: 10,
  },
});
