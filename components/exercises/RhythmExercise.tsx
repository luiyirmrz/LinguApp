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
  TimerIcon,
  BeatIcon,
} from '@/components/icons/LucideReplacement';
import { 
  usePronunciationEvaluation,
} from '@/hooks/usePronunciationEvaluation';
// import type { PronunciationEvaluation } from '@/hooks/usePronunciationEvaluation';
import { MultilingualExercise, MultilingualContent } from '@/types';

const { width } = Dimensions.get('window');

interface RhythmExerciseProps {
  exercise: MultilingualExercise;
  onComplete: (result: RhythmResult) => void;
  onNext: () => void;
  onSkip?: () => void;
}

interface RhythmResult {
  exerciseId: string;
  isCorrect: boolean;
  accuracy: number;
  attempts: number;
  timeSpent: number;
  pronunciationScore: number;
  fluencyScore: number;
  completenessScore: number;
  rhythmScore: number;
  timingAccuracy: number;
  stressPatternScore: number;
  userResponses: string[];
  correctResponses: string[];
}

interface RhythmPattern {
  id: string;
  name: string;
  description: string;
  text: string;
  audioUrl?: string;
  pattern: 'stressed-unstressed' | 'unstressed-stressed' | 'stressed-stressed' | 'unstressed-unstressed' | 'mixed';
  difficulty: number;
  beatPattern: number[]; // 1 = stressed, 0 = unstressed
  tempo: number; // beats per minute
  visualPattern: string[]; // Visual representation of rhythm
  instructions: string[];
  examples: string[];
}

interface RhythmExercise {
  id: string;
  title: string;
  description: string;
  patterns: RhythmPattern[];
  successCriteria: {
    minAccuracy: number;
    minRhythm: number;
    minTiming: number;
    minStress: number;
    maxTime: number;
  };
}

export default function RhythmExercise({
  exercise,
  onComplete,
  onNext,
  onSkip,
}: RhythmExerciseProps) {
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
  const [rhythmScore, setRhythmScore] = useState(0);
  const [timingAccuracy, setTimingAccuracy] = useState(0);
  const [stressPatternScore, setStressPatternScore] = useState(0);
  const [overallScore, setOverallScore] = useState(0);
  const [metronomeActive, setMetronomeActive] = useState(false);

  // Animation refs
  const pulseAnimation = useRef(new Animated.Value(1)).current;
  const waveAnimation = useRef(new Animated.Value(0)).current;
  const progressAnimation = useRef(new Animated.Value(0)).current;
  const patternAnimation = useRef(new Animated.Value(0)).current;
  const beatAnimation = useRef(new Animated.Value(0)).current;
  const metronomeAnimation = useRef(new Animated.Value(0)).current;

  // Timer refs
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const metronomeTimer = useRef<NodeJS.Timeout | null>(null);

  // Helper functions
  const getCurrentPattern = (): RhythmPattern | null => {
    if (currentPattern >= 0 && currentPattern < rhythmExercises[0].patterns.length) {
      return rhythmExercises[0].patterns[currentPattern];
    }
    return null;
  };

  const handlePronunciationComplete = (evaluation: any) => {
    const pattern = getCurrentPattern();
    if (!pattern) return;

    const isCorrect = evaluation.accuracy >= 70; // Minimum accuracy threshold
    
    if (isCorrect) {
      setPatternResults(prev => ({
        ...prev,
        [pattern.id]: {
          accuracy: evaluation.accuracy,
          timeSpent,
          attempts: evaluation.attempts,
          feedback: evaluation.feedback,
        },
      }));
      
      // Move to next pattern or complete exercise
      if (currentPattern < rhythmExercises[0].patterns.length - 1) {
        setCurrentPattern(prev => prev + 1);
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
    targetText: getCurrentPattern()?.text || '',
    languageCode: exercise.targetLanguage,
    maxAttempts: 3,
    onComplete: handlePronunciationComplete,
    onError: handlePronunciationError,
  });

  // Rhythm exercises
  const rhythmExercises: RhythmExercise[] = [
    {
      id: 'basic_rhythms',
      title: 'Basic Rhythm Patterns',
      description: 'Learn fundamental rhythm patterns in English speech',
      patterns: [
        {
          id: 'stressed_unstressed',
          name: 'Stressed-Unstressed Pattern',
          description: 'Alternating stressed and unstressed syllables',
          text: 'Hello there',
          audioUrl: 'stressed_unstressed_audio',
          pattern: 'stressed-unstressed',
          difficulty: 1,
          beatPattern: [1, 0, 1, 0],
          tempo: 120,
          visualPattern: ['●', '○', '●', '○'],
          instructions: [
            'Emphasize the first syllable',
            'Lighten the second syllable',
            'Keep a steady beat',
            'Practice with a metronome',
          ],
          examples: ['Hello there', 'Good morning', 'Nice day'],
        },
        {
          id: 'unstressed_stressed',
          name: 'Unstressed-Stressed Pattern',
          description: 'Starting with unstressed, then stressed syllables',
          text: 'I am here',
          audioUrl: 'unstressed_stressed_audio',
          pattern: 'unstressed-stressed',
          difficulty: 2,
          beatPattern: [0, 1, 0, 1],
          tempo: 110,
          visualPattern: ['○', '●', '○', '●'],
          instructions: [
            'Start softly',
            'Emphasize the second syllable',
            'Maintain rhythm',
            'Don\'t rush the first syllable',
          ],
          examples: ['I am here', 'You are there', 'We can go'],
        },
        {
          id: 'stressed_stressed',
          name: 'Stressed-Stressed Pattern',
          description: 'Two stressed syllables in sequence',
          text: 'Stop now',
          audioUrl: 'stressed_stressed_audio',
          pattern: 'stressed-stressed',
          difficulty: 2,
          beatPattern: [1, 1],
          tempo: 100,
          visualPattern: ['●', '●'],
          instructions: [
            'Emphasize both syllables equally',
            'Keep them distinct',
            'Don\'t blend them together',
            'Use clear pauses',
          ],
          examples: ['Stop now', 'Go home', 'Come here'],
        },
        {
          id: 'unstressed_unstressed',
          name: 'Unstressed-Unstressed Pattern',
          description: 'Two unstressed syllables in sequence',
          text: 'I will go',
          audioUrl: 'unstressed_unstressed_audio',
          pattern: 'unstressed-unstressed',
          difficulty: 3,
          beatPattern: [0, 0, 1],
          tempo: 130,
          visualPattern: ['○', '○', '●'],
          instructions: [
            'Keep first two syllables light',
            'Emphasize the final syllable',
            'Maintain flow between syllables',
            'Don\'t pause between unstressed syllables',
          ],
          examples: ['I will go', 'You can do', 'We should try'],
        },
        {
          id: 'mixed_pattern',
          name: 'Mixed Rhythm Pattern',
          description: 'Complex pattern with varying stress',
          text: 'I am going home',
          audioUrl: 'mixed_pattern_audio',
          pattern: 'mixed',
          difficulty: 4,
          beatPattern: [0, 1, 0, 1],
          tempo: 115,
          visualPattern: ['○', '●', '○', '●'],
          instructions: [
            'Follow the stress pattern carefully',
            'Emphasize stressed syllables',
            'Keep unstressed syllables light',
            'Maintain overall rhythm',
          ],
          examples: ['I am going home', 'You are coming here', 'We will be there'],
        },
      ],
      successCriteria: {
        minAccuracy: 75,
        minRhythm: 70,
        minTiming: 65,
        minStress: 70,
        maxTime: 600,
      },
    },
  ];

  const currentExercise = rhythmExercises[0]; // For now, use first exercise

  useEffect(() => {
    loadUserHearts();
    startTimer();
    animatePattern();
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (metronomeTimer.current) {
        clearInterval(metronomeTimer.current);
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

    Animated.spring(beatAnimation, {
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

  const startMetronome = () => {
    const pattern = getCurrentPattern();
    if (!pattern) return;

    setMetronomeActive(true);
    const interval = 60000 / pattern.tempo; // Convert BPM to milliseconds

    metronomeTimer.current = setInterval(() => {
      Animated.sequence([
        Animated.timing(metronomeAnimation, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(metronomeAnimation, {
          toValue: 0,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
    }, interval) as any;
  };

  const stopMetronome = () => {
    setMetronomeActive(false);
    if (metronomeTimer.current) {
      clearInterval(metronomeTimer.current);
      metronomeTimer.current = null;
    }
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



  const calculateRhythmScore = (evaluation: any, pattern: RhythmPattern | null): number => {
    if (!pattern) return 0;

    let score = evaluation.fluencyScore;

    // Bonus for rhythm recognition
    if (evaluation.feedback.strengths.some((s: string) => s.includes('rhythm'))) {
      score += 10;
    }

    // Bonus for steady pace
    if (evaluation.feedback.strengths.some((s: string) => s.includes('pace'))) {
      score += 5;
    }

    return Math.min(100, score);
  };

  const calculateTimingAccuracy = (evaluation: any, pattern: RhythmPattern | null): number => {
    if (!pattern) return 0;

    // This would be calculated based on actual timing analysis
    // For now, use fluency score as a proxy
    return evaluation.fluencyScore;
  };

  const calculateStressPatternScore = (evaluation: any, pattern: RhythmPattern | null): number => {
    if (!pattern) return 0;

    // This would be calculated based on stress pattern analysis
    // For now, use prosody score as a proxy
    return evaluation.prosodyScore;
  };

  const completeExercise = () => {
    // Calculate overall score
    const totalScore = patternResults.reduce((sum, result) => sum + result.overallScore, 0);
    const averageScore = totalScore / patternResults.length;
    setOverallScore(averageScore);

    // Calculate result
    const result: RhythmResult = {
      exerciseId: exercise.id,
      isCorrect: averageScore >= currentExercise.successCriteria.minAccuracy,
      accuracy: averageScore,
      attempts,
      timeSpent: Math.floor(timeSpent / 1000),
      pronunciationScore: patternResults.reduce((sum, r) => sum + r.accuracyScore, 0) / patternResults.length,
      fluencyScore: patternResults.reduce((sum, r) => sum + r.fluencyScore, 0) / patternResults.length,
      completenessScore: patternResults.reduce((sum, r) => sum + r.completenessScore, 0) / patternResults.length,
      rhythmScore,
      timingAccuracy,
      stressPatternScore,
      userResponses,
      correctResponses: currentExercise.patterns.map(pattern => pattern.text),
    };

    setShowResults(true);

    // Award XP
    if (result.isCorrect) {
      awardXP(exercise.xpReward, 'rhythm_exercise_completion');
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
      case 'stressed-unstressed': return theme.colors.success;
      case 'unstressed-stressed': return theme.colors.danger;
      case 'stressed-stressed': return theme.colors.warning;
      case 'unstressed-unstressed': return theme.colors.info;
      case 'mixed': return theme.colors.primary;
      default: return theme.colors.gray[600];
    }
  };

  const renderRhythmHeader = () => (
    <Animated.View
      style={[
        styles.rhythmHeader,
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
            text={`${pattern.tempo} BPM`}
            color={getPatternColor(pattern.pattern)}
            size="small"
          />
        </View>

        <Text style={styles.patternDescription}>{pattern.description}</Text>

        <View style={styles.visualPattern}>
          <Text style={styles.visualPatternTitle}>Rhythm Pattern:</Text>
          <View style={styles.beatVisualization}>
            {pattern.visualPattern.map((beat, index) => (
              <Animated.View
                key={index}
                style={[
                  styles.beatCircle,
                  {
                    backgroundColor: beat === '●' ? getPatternColor(pattern.pattern) : theme.colors.gray[300],
                    transform: [{
                      scale: beatAnimation.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.8, 1],
                      }),
                    }],
                  },
                ]}
              >
                <Text style={[
                  styles.beatText,
                  { color: beat === '●' ? theme.colors.white : theme.colors.gray[600] },
                ]}>
                  {beat}
                </Text>
              </Animated.View>
            ))}
          </View>
        </View>

        <View style={styles.metronomeContainer}>
          <TouchableOpacity
            style={[
              styles.metronomeButton,
              metronomeActive && styles.metronomeButtonActive,
            ]}
            onPress={metronomeActive ? stopMetronome : startMetronome}
          >
            <Animated.View
              style={[
                styles.metronomeIcon,
                {
                  transform: [{
                    scale: metronomeAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [1, 1.2],
                    }),
                  }],
                },
              ]}
            >
              <TimerIcon size={20} color={theme.colors.white} />
            </Animated.View>
            <Text style={styles.metronomeButtonText}>
              {metronomeActive ? 'Stop Metronome' : 'Start Metronome'}
            </Text>
          </TouchableOpacity>
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
            {isPlaying ? 'Playing...' : 'Listen to Rhythm'}
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
            ? 'Recording... Follow the rhythm pattern'
            : pronunciationState.isProcessing
              ? 'Processing your recording...'
              : pronunciationState.isEvaluating
                ? 'Evaluating rhythm...'
                : 'Tap to record your rhythm'
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
                ? 'Great rhythm! Moving to next pattern.'
                : 'Keep practicing! Try to match the rhythm better.'
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
            <Text style={styles.resultsTitle}>Rhythm Exercise Complete!</Text>
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
              <Text style={styles.scoreLabel}>Rhythm</Text>
              <Text style={styles.scoreValue}>
                {Math.round(rhythmScore)}%
              </Text>
            </View>
            <View style={styles.scoreItem}>
              <TimerIcon size={20} color={theme.colors.warning} />
              <Text style={styles.scoreLabel}>Timing</Text>
              <Text style={styles.scoreValue}>
                {Math.round(timingAccuracy)}%
              </Text>
            </View>
            <View style={styles.scoreItem}>
              <BeatIcon size={20} color={theme.colors.info} />
              <Text style={styles.scoreLabel}>Stress</Text>
              <Text style={styles.scoreValue}>
                {Math.round(stressPatternScore)}%
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
        <Text style={styles.title}>Rhythm Exercise</Text>
        <Text style={styles.subtitle}>
          Practice speech rhythm and stress patterns
        </Text>
      </View>

      {renderRhythmHeader()}
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
  rhythmHeader: {
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
  beatVisualization: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.md,
  },
  beatCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  beatText: {
    fontSize: theme.fontSize.lg,
    fontWeight: 'bold',
  },
  metronomeContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  metronomeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
  },
  metronomeButtonActive: {
    backgroundColor: theme.colors.danger,
  },
  metronomeIcon: {
    marginRight: theme.spacing.sm,
  },
  metronomeButtonText: {
    color: theme.colors.white,
    fontSize: theme.fontSize.md,
    fontWeight: '600',
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
