import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Alert,
  ScrollView,
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
  MessageCircleIcon,
  UsersIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  RepeatIcon,
  HeadphonesIcon,
  MusicIcon,
  WaveformIcon,
  ActivityIcon,
} from '@/components/icons/LucideReplacement';
import { 
  usePronunciationEvaluation,
  // PronunciationEvaluation 
} from '@/hooks/usePronunciationEvaluation';
import { MultilingualExercise, MultilingualContent } from '@/types';

const { width } = Dimensions.get('window');

interface IntonationExerciseProps {
  exercise: MultilingualExercise;
  onComplete: (result: IntonationResult) => void;
  onNext: () => void;
  onSkip?: () => void;
}

interface IntonationResult {
  exerciseId: string;
  isCorrect: boolean;
  accuracy: number;
  attempts: number;
  timeSpent: number;
  pronunciationScore: number;
  fluencyScore: number;
  completenessScore: number;
  intonationScore: number;
  pitchAccuracy: number;
  rhythmScore: number;
  userResponses: string[];
  correctResponses: string[];
}

interface IntonationPattern {
  id: string;
  name: string;
  description: string;
  text: string;
  audioUrl?: string;
  pattern: 'rising' | 'falling' | 'rising-falling' | 'falling-rising' | 'flat';
  difficulty: number;
  visualPattern: number[]; // Visual representation of pitch
  targetPitch: {
    start: number;
    end: number;
    peaks: number[];
    valleys: number[];
  };
  instructions: string[];
  examples: string[];
}

interface IntonationExercise {
  id: string;
  title: string;
  description: string;
  patterns: IntonationPattern[];
  successCriteria: {
    minAccuracy: number;
    minIntonation: number;
    minPitchAccuracy: number;
    minRhythm: number;
    maxTime: number;
  };
}

export default function IntonationExercise({
  exercise,
  onComplete,
  onNext,
  onSkip,
}: IntonationExerciseProps) {
  const { t } = useI18n();
  const { user } = useUnifiedAuth();
  const { awardXP, completeLesson, acceptChallenge, createChallenge, generateDailyChallenges, refreshStats } = useEnhancedGamification();

  // State management
  const [currentPattern, setCurrentPattern] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [timeSpent, setTimeSpent] = useState(0);
  const [hearts, setHearts] = useState(5);
  const [showResults, setShowResults] = useState(false);
  const [patternResults, setPatternResults] = useState<any[]>([]);
  const [userResponses, setUserResponses] = useState<string[]>([]);
  const [intonationScore, setIntonationScore] = useState(0);
  const [pitchAccuracy, setPitchAccuracy] = useState(0);
  const [rhythmScore, setRhythmScore] = useState(0);
  const [overallScore, setOverallScore] = useState(0);

  // Animation refs
  const pulseAnimation = useRef(new Animated.Value(1)).current;
  const waveAnimation = useRef(new Animated.Value(0)).current;
  const progressAnimation = useRef(new Animated.Value(0)).current;
  const patternAnimation = useRef(new Animated.Value(0)).current;
  const pitchAnimation = useRef(new Animated.Value(0)).current;

  // Timer refs
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  // Helper functions
  const getCurrentPattern = (): IntonationPattern | null => {
    if (currentPattern >= 0 && currentPattern < intonationExercises[0].patterns.length) {
      return intonationExercises[0].patterns[currentPattern];
    }
    return null;
  };

  const handlePronunciationComplete = (evaluation: any) => {
    const patternResult = evaluation;
    setPatternResults(prev => [...prev, patternResult]);

    // Store user response
    const userResponse = getCurrentPattern()?.text || '';
    setUserResponses(prev => [...prev, userResponse]);

    // Calculate intonation-specific scores
    const intonationScore = calculateIntonationScore(evaluation, getCurrentPattern());
    const pitchScore = calculatePitchAccuracy(evaluation, getCurrentPattern());
    const rhythmScore = calculateRhythmScore(evaluation, getCurrentPattern());

    setIntonationScore(prev => (prev + intonationScore) / 2);
    setPitchAccuracy(prev => (prev + pitchScore) / 2);
    setRhythmScore(prev => (prev + rhythmScore) / 2);

    // Check if pattern is complete
    if (evaluation.overallScore >= 70) {
      // Move to next pattern or complete exercise
      if (currentPattern < intonationExercises[0].patterns.length - 1) {
        setTimeout(() => {
          setCurrentPattern(prev => prev + 1);
          setShowResults(false);
        }, 2000);
      } else {
        // All patterns completed
        setTimeout(() => {
          setShowResults(true);
          setOverallScore(evaluation.overallScore);
        }, 2000);
      }
    } else {
      // Pattern failed, show feedback
      setShowResults(true);
    }
  };

  const handlePronunciationError = (error: string) => {
    console.error('Pronunciation error:', error);
    Alert.alert('Error', error);
  };

  // Pronunciation evaluation hook
  const [pronunciationState, pronunciationActions] = usePronunciationEvaluation({
    targetText: getCurrentPattern()?.text || '',
    languageCode: exercise.targetLanguage,
    maxAttempts: 3,
    onComplete: handlePronunciationComplete,
    onError: handlePronunciationError,
  });

  // Intonation exercises
  const intonationExercises: IntonationExercise[] = [
    {
      id: 'basic_patterns',
      title: 'Basic Intonation Patterns',
      description: 'Learn fundamental intonation patterns in English',
      patterns: [
        {
          id: 'rising_question',
          name: 'Rising Question',
          description: 'Questions that end with rising intonation',
          text: 'Are you coming?',
          audioUrl: 'rising_question_audio',
          pattern: 'rising',
          difficulty: 1,
          visualPattern: [1, 2, 3, 4, 5],
          targetPitch: {
            start: 1,
            end: 5,
            peaks: [5],
            valleys: [1],
          },
          instructions: [
            'Start with normal pitch',
            'Gradually raise your voice',
            'End with a higher pitch',
            'Make it sound like a question',
          ],
          examples: ['Are you coming?', 'Is it ready?', 'Can you help?'],
        },
        {
          id: 'falling_statement',
          name: 'Falling Statement',
          description: 'Statements that end with falling intonation',
          text: 'I am coming.',
          audioUrl: 'falling_statement_audio',
          pattern: 'falling',
          difficulty: 1,
          visualPattern: [5, 4, 3, 2, 1],
          targetPitch: {
            start: 5,
            end: 1,
            peaks: [5],
            valleys: [1],
          },
          instructions: [
            'Start with higher pitch',
            'Gradually lower your voice',
            'End with a lower pitch',
            'Make it sound like a statement',
          ],
          examples: ['I am coming.', 'It is ready.', 'I can help.'],
        },
        {
          id: 'rising_falling_emphasis',
          name: 'Rising-Falling Emphasis',
          description: 'Emphatic statements with rising-falling pattern',
          text: 'Really?',
          audioUrl: 'rising_falling_audio',
          pattern: 'rising-falling',
          difficulty: 2,
          visualPattern: [2, 5, 1],
          targetPitch: {
            start: 2,
            end: 1,
            peaks: [5],
            valleys: [1],
          },
          instructions: [
            'Start with normal pitch',
            'Rise to a high pitch',
            'Quickly fall to low pitch',
            'Show surprise or emphasis',
          ],
          examples: ['Really?', 'Wow!', 'Amazing!'],
        },
        {
          id: 'falling_rising_uncertainty',
          name: 'Falling-Rising Uncertainty',
          description: 'Expressions of uncertainty with falling-rising pattern',
          text: 'Maybe.',
          audioUrl: 'falling_rising_audio',
          pattern: 'falling-rising',
          difficulty: 2,
          visualPattern: [4, 1, 3],
          targetPitch: {
            start: 4,
            end: 3,
            peaks: [4, 3],
            valleys: [1],
          },
          instructions: [
            'Start with higher pitch',
            'Fall to low pitch',
            'Rise slightly at the end',
            'Show uncertainty or hesitation',
          ],
          examples: ['Maybe.', 'Perhaps.', 'I think so.'],
        },
        {
          id: 'flat_monotone',
          name: 'Flat Monotone',
          description: 'Monotone speech with minimal pitch variation',
          text: 'I see.',
          audioUrl: 'flat_monotone_audio',
          pattern: 'flat',
          difficulty: 1,
          visualPattern: [3, 3, 3, 3],
          targetPitch: {
            start: 3,
            end: 3,
            peaks: [3],
            valleys: [3],
          },
          instructions: [
            'Keep pitch steady',
            'Minimal variation',
            'Sound neutral or bored',
            'Avoid emotional expression',
          ],
          examples: ['I see.', 'Okay.', 'Fine.'],
        },
      ],
      successCriteria: {
        minAccuracy: 75,
        minIntonation: 70,
        minPitchAccuracy: 65,
        minRhythm: 70,
        maxTime: 600,
      },
    },
  ];

  const currentExercise = intonationExercises[0]; // For now, use first exercise

  useEffect(() => {
    loadUserHearts();
    startTimer();
    animatePattern();
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

  const getContentInLanguage = (content: MultilingualContent, language: string = 'en'): string => {
    if (typeof content === 'string') return content;
    return content[language] || content.en || '';
  };


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

  const animatePattern = () => {
    Animated.spring(patternAnimation, {
      toValue: 1,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();

    Animated.spring(pitchAnimation, {
      toValue: 1,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
      delay: 200,
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


  const calculateIntonationScore = (evaluation: any, pattern: IntonationPattern | null): number => {
    if (!pattern) return 0;

    let score = evaluation.prosodyScore;

    // Bonus for pattern recognition
    if (evaluation.feedback.strengths.some((s: string) => s.includes('intonation'))) {
      score += 10;
    }

    // Bonus for pitch variation
    if (evaluation.feedback.strengths.some((s: string) => s.includes('pitch'))) {
      score += 5;
    }

    return Math.min(100, score);
  };

  const calculatePitchAccuracy = (evaluation: any, pattern: IntonationPattern | null): number => {
    if (!pattern) return 0;

    // This would be calculated based on actual pitch analysis
    // For now, use prosody score as a proxy
    return evaluation.prosodyScore;
  };

  const calculateRhythmScore = (evaluation: any, pattern: IntonationPattern | null): number => {
    if (!pattern) return 0;

    // This would be calculated based on rhythm analysis
    // For now, use fluency score as a proxy
    return evaluation.fluencyScore;
  };

  const completeExercise = () => {
    // Calculate overall score
    const totalScore = patternResults.reduce((sum, result) => sum + result.overallScore, 0);
    const averageScore = totalScore / patternResults.length;
    setOverallScore(averageScore);

    // Calculate result
    const result: IntonationResult = {
      exerciseId: exercise.id,
      isCorrect: averageScore >= currentExercise.successCriteria.minAccuracy,
      accuracy: averageScore,
      attempts,
      timeSpent: Math.floor(timeSpent / 1000),
      pronunciationScore: patternResults.reduce((sum, r) => sum + r.accuracyScore, 0) / patternResults.length,
      fluencyScore: patternResults.reduce((sum, r) => sum + r.fluencyScore, 0) / patternResults.length,
      completenessScore: patternResults.reduce((sum, r) => sum + r.completenessScore, 0) / patternResults.length,
      intonationScore,
      pitchAccuracy,
      rhythmScore,
      userResponses,
      correctResponses: currentExercise.patterns.map(pattern => pattern.text),
    };

    setShowResults(true);

    // Award XP
    if (result.isCorrect) {
      awardXP(exercise.xpReward, 'intonation_exercise_completion');
    }

    // Call completion callback
    setTimeout(() => {
      onComplete(result);
    }, 3000);
  };

  const retryPattern = () => {
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

  const getPatternColor = (pattern: string): string => {
    switch (pattern) {
      case 'rising': return theme.colors.success;
      case 'falling': return theme.colors.danger;
      case 'rising-falling': return theme.colors.warning;
      case 'falling-rising': return theme.colors.info;
      case 'flat': return theme.colors.gray[600];
      default: return theme.colors.primary;
    }
  };

  const renderIntonationHeader = () => (
    <Animated.View
      style={[
        styles.intonationHeader,
        {
          transform: [{
            scale: patternAnimation.interpolate({
              inputRange: [0, 1],
              outputRange: [0.9, 1],
            }),
          }],
          opacity: patternAnimation,
        },
      ]}
    >
      <Card style={styles.exerciseCard}>
        <View style={styles.exerciseInfo}>
          <Badge
            text={`Pattern ${currentPattern + 1} of ${currentExercise.patterns.length}`}
            color={theme.colors.primary}
            size="small"
          />
          <Text style={styles.exerciseTitle}>{currentExercise.title}</Text>
          <Text style={styles.exerciseDescription}>{currentExercise.description}</Text>
        </View>

        <View style={styles.exerciseProgress}>
          <ProgressBar
            progress={((currentPattern + 1) / currentExercise.patterns.length) * 100}
            height={6}
            color={theme.colors.primary}
          />
        </View>
      </Card>
    </Animated.View>
  );

  const renderPatternInfo = () => {
    const pattern = getCurrentPattern();
    if (!pattern) return null;

    return (
      <Card style={styles.patternCard}>
        <View style={styles.patternHeader}>
          <Text style={styles.patternName}>{pattern.name}</Text>
          <Badge
            text={pattern.pattern}
            color={getPatternColor(pattern.pattern)}
            size="small"
          />
        </View>

        <Text style={styles.patternDescription}>{pattern.description}</Text>

        <View style={styles.visualPattern}>
          <Text style={styles.visualPatternTitle}>Pitch Pattern:</Text>
          <View style={styles.pitchVisualization}>
            {pattern.visualPattern.map((pitch, index) => (
              <Animated.View
                key={index}
                style={[
                  styles.pitchBar,
                  {
                    height: pitch * 8,
                    backgroundColor: getPatternColor(pattern.pattern),
                    transform: [{
                      scale: pitchAnimation.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.5, 1],
                      }),
                    }],
                  },
                ]}
              />
            ))}
          </View>
        </View>

        <View style={styles.instructionsContainer}>
          <Text style={styles.instructionsTitle}>Instructions:</Text>
          {pattern.instructions.map((instruction, index) => (
            <View key={index} style={styles.instructionItem}>
              <Text style={styles.instructionNumber}>{index + 1}.</Text>
              <Text style={styles.instructionText}>{instruction}</Text>
            </View>
          ))}
        </View>

        <View style={styles.examplesContainer}>
          <Text style={styles.examplesTitle}>Examples:</Text>
          {pattern.examples.map((example, index) => (
            <Text key={index} style={styles.exampleText}>• {example}</Text>
          ))}
        </View>
      </Card>
    );
  };

  const renderTargetText = () => {
    const pattern = getCurrentPattern();
    if (!pattern) return null;

    return (
      <Card style={styles.targetCard}>
        <View style={styles.targetHeader}>
          <MusicIcon size={20} color={theme.colors.primary} />
          <Text style={styles.targetTitle}>Target Text</Text>
        </View>
        
        <Text style={styles.targetText}>{pattern.text}</Text>
        
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
            {isPlaying ? 'Playing...' : 'Listen to Pattern'}
          </Text>
        </TouchableOpacity>
      </Card>
    );
  };

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
            ? 'Recording... Match the intonation pattern'
            : pronunciationState.isProcessing
              ? 'Processing your recording...'
              : pronunciationState.isEvaluating
                ? 'Evaluating intonation...'
                : 'Tap to record your intonation'
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
              {pronunciationState.evaluation.overallScore >= currentExercise.successCriteria.minAccuracy
                ? 'Great intonation! Moving to next pattern.'
                : 'Keep practicing! Try to match the pattern better.'
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
            <Text style={styles.resultsTitle}>Intonation Exercise Complete!</Text>
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
                {Math.round(patternResults.reduce((sum, r) => sum + r.accuracyScore, 0) / patternResults.length)}%
              </Text>
            </View>
            <View style={styles.scoreItem}>
              <MusicIcon size={20} color={theme.colors.success} />
              <Text style={styles.scoreLabel}>Intonation</Text>
              <Text style={styles.scoreValue}>
                {Math.round(intonationScore)}%
              </Text>
            </View>
            <View style={styles.scoreItem}>
              <WaveformIcon size={20} color={theme.colors.warning} />
              <Text style={styles.scoreLabel}>Pitch</Text>
              <Text style={styles.scoreValue}>
                {Math.round(pitchAccuracy)}%
              </Text>
            </View>
            <View style={styles.scoreItem}>
              <ActivityIcon size={20} color={theme.colors.info} />
              <Text style={styles.scoreLabel}>Rhythm</Text>
              <Text style={styles.scoreValue}>
                {Math.round(rhythmScore)}%
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
                {overallScore >= currentExercise.successCriteria.minAccuracy ? `+${exercise.xpReward}` : '0'}
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
        <Text style={styles.title}>Intonation Exercise</Text>
        <Text style={styles.subtitle}>
          Practice pitch patterns and intonation in speech
        </Text>
      </View>

      {renderIntonationHeader()}
      {renderPatternInfo()}
      {renderTargetText()}
      {renderRecordingSection()}

      <View style={styles.actionButtons}>
        <Button
          title="Retry Pattern"
          onPress={retryPattern}
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
  intonationHeader: {
    marginBottom: theme.spacing.lg,
  },
  exerciseCard: {
    padding: theme.spacing.lg,
  },
  exerciseInfo: {
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  exerciseTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: '600',
    color: theme.colors.black,
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.xs,
  },
  exerciseDescription: {
    fontSize: theme.fontSize.md,
    color: theme.colors.gray[600],
    textAlign: 'center',
  },
  exerciseProgress: {
    marginTop: theme.spacing.md,
  },
  patternCard: {
    marginBottom: theme.spacing.lg,
    padding: theme.spacing.lg,
  },
  patternHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  patternName: {
    fontSize: theme.fontSize.lg,
    fontWeight: '600',
    color: theme.colors.black,
  },
  patternDescription: {
    fontSize: theme.fontSize.md,
    color: theme.colors.gray[600],
    marginBottom: theme.spacing.lg,
    lineHeight: 20,
  },
  visualPattern: {
    marginBottom: theme.spacing.lg,
  },
  visualPatternTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: '600',
    color: theme.colors.black,
    marginBottom: theme.spacing.sm,
  },
  pitchVisualization: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    height: 60,
    gap: theme.spacing.sm,
  },
  pitchBar: {
    width: 20,
    borderRadius: 10,
  },
  instructionsContainer: {
    marginBottom: theme.spacing.lg,
  },
  instructionsTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: '600',
    color: theme.colors.black,
    marginBottom: theme.spacing.sm,
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
  examplesContainer: {
    marginBottom: theme.spacing.lg,
  },
  examplesTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: '600',
    color: theme.colors.black,
    marginBottom: theme.spacing.sm,
  },
  exampleText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.gray[600],
    marginBottom: theme.spacing.xs,
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
