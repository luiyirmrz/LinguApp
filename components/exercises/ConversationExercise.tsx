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
} from '@/components/icons/LucideReplacement';
import { 
  usePronunciationEvaluation,
  // PronunciationEvaluation 
} from '@/hooks/usePronunciationEvaluation';
import { MultilingualExercise, MultilingualContent } from '@/types';

const { width } = Dimensions.get('window');

interface ConversationExerciseProps {
  exercise: MultilingualExercise;
  onComplete: (result: ConversationResult) => void;
  onNext: () => void;
  onSkip?: () => void;
}

interface ConversationResult {
  exerciseId: string;
  isCorrect: boolean;
  accuracy: number;
  attempts: number;
  timeSpent: number;
  pronunciationScore: number;
  fluencyScore: number;
  completenessScore: number;
  conversationFlow: number;
  userResponses: string[];
  correctResponses: string[];
}

interface ConversationTurn {
  id: string;
  speaker: 'user' | 'partner';
  text: string;
  audioUrl?: string;
  expectedResponse?: string;
  pronunciationTarget?: string;
  difficulty: number;
  timeLimit?: number;
}

interface ConversationScenario {
  id: string;
  title: string;
  description: string;
  context: string;
  turns: ConversationTurn[];
  successCriteria: {
    minAccuracy: number;
    minFluency: number;
    minCompleteness: number;
    maxTime: number;
  };
}

export default function ConversationExercise({
  exercise,
  onComplete,
  onNext,
  onSkip,
}: ConversationExerciseProps) {
  const { t } = useI18n();
  const { user } = useUnifiedAuth();
  const { awardXP, completeLesson, acceptChallenge, createChallenge, generateDailyChallenges, refreshStats } = useEnhancedGamification();

  // State management
  const [currentTurn, setCurrentTurn] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [timeSpent, setTimeSpent] = useState(0);
  const [hearts, setHearts] = useState(5);
  const [showResults, setShowResults] = useState(false);
  const [turnResults, setTurnResults] = useState<any[]>([]);
  const [userResponses, setUserResponses] = useState<string[]>([]);
  const [conversationFlow, setConversationFlow] = useState(0);
  const [overallScore, setOverallScore] = useState(0);

  // Animation refs
  const pulseAnimation = useRef(new Animated.Value(1)).current;
  const waveAnimation = useRef(new Animated.Value(0)).current;
  const progressAnimation = useRef(new Animated.Value(0)).current;
  const turnAnimation = useRef(new Animated.Value(0)).current;
  const messageAnimation = useRef(new Animated.Value(0)).current;

  // Timer refs
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  // Helper functions
  const getCurrentTurn = (): ConversationTurn | null => {
    if (conversationFlow >= 0 && conversationFlow < scenarios[0].turns.length) {
      return scenarios[0].turns[conversationFlow];
    }
    return null;
  };

  const handlePronunciationComplete = (evaluation: any) => {
    const turnResult = evaluation;
    setTurnResults(prev => [...prev, turnResult]);

    // Store user response
    const userResponse = getCurrentTurn()?.expectedResponse || '';
    setUserResponses(prev => [...prev, userResponse]);

    // Calculate conversation-specific scores
    const conversationScore = evaluation.overallScore; // Simplified for now
    const fluencyScore = evaluation.fluencyScore;
    const accuracyScore = evaluation.accuracyScore;

    // Update scores (simplified for now)
    setOverallScore(prev => (prev + evaluation.overallScore) / 2);

    // Check if turn is complete
    if (evaluation.overallScore >= 70) {
      // Move to next turn or complete exercise
      if (conversationFlow < scenarios[0].turns.length - 1) {
        setTimeout(() => {
          setConversationFlow(prev => prev + 1);
          setShowResults(false);
        }, 2000);
      } else {
        // All turns completed
        setTimeout(() => {
          setShowResults(true);
          setOverallScore(evaluation.overallScore);
        }, 2000);
      }
    } else {
      // Turn failed, show feedback
      setShowResults(true);
    }
  };

  const handlePronunciationError = (error: string) => {
    console.error('Pronunciation error:', error);
    Alert.alert('Error', error);
  };

  // Pronunciation evaluation hook
  const [pronunciationState, pronunciationActions] = usePronunciationEvaluation({
    targetText: getCurrentTurn()?.pronunciationTarget || getCurrentTurn()?.expectedResponse || '',
    languageCode: exercise.targetLanguage,
    maxAttempts: 3,
    onComplete: handlePronunciationComplete,
    onError: handlePronunciationError,
  });

  // Conversation scenarios
  const scenarios: ConversationScenario[] = [
    {
      id: 'greeting',
      title: 'Greeting Conversation',
      description: 'Practice basic greetings and introductions',
      context: 'You meet someone new at a coffee shop',
      turns: [
        {
          id: 'partner_1',
          speaker: 'partner',
          text: 'Hello! How are you today?',
          audioUrl: 'greeting_1_audio',
          expectedResponse: 'Hello! I\'m doing well, thank you. How are you?',
          pronunciationTarget: 'Hello! I\'m doing well, thank you. How are you?',
          difficulty: 1,
        },
        {
          id: 'user_1',
          speaker: 'user',
          text: 'Hello! I\'m doing well, thank you. How are you?',
          expectedResponse: 'I\'m great, thanks for asking!',
          pronunciationTarget: 'Hello! I\'m doing well, thank you. How are you?',
          difficulty: 1,
        },
        {
          id: 'partner_2',
          speaker: 'partner',
          text: 'I\'m great, thanks for asking! What\'s your name?',
          audioUrl: 'greeting_2_audio',
          expectedResponse: 'My name is [your name]. What\'s yours?',
          pronunciationTarget: 'My name is [your name]. What\'s yours?',
          difficulty: 2,
        },
        {
          id: 'user_2',
          speaker: 'user',
          text: 'My name is [your name]. What\'s yours?',
          expectedResponse: 'Nice to meet you!',
          pronunciationTarget: 'My name is [your name]. What\'s yours?',
          difficulty: 2,
        },
      ],
      successCriteria: {
        minAccuracy: 75,
        minFluency: 70,
        minCompleteness: 80,
        maxTime: 300,
      },
    },
    {
      id: 'ordering',
      title: 'Ordering Food',
      description: 'Practice ordering food at a restaurant',
      context: 'You\'re at a restaurant and need to order',
      turns: [
        {
          id: 'partner_1',
          speaker: 'partner',
          text: 'Good evening! Welcome to our restaurant. Are you ready to order?',
          audioUrl: 'ordering_1_audio',
          expectedResponse: 'Yes, I\'d like to see the menu, please.',
          pronunciationTarget: 'Yes, I\'d like to see the menu, please.',
          difficulty: 2,
        },
        {
          id: 'user_1',
          speaker: 'user',
          text: 'Yes, I\'d like to see the menu, please.',
          expectedResponse: 'Of course! Here you go.',
          pronunciationTarget: 'Yes, I\'d like to see the menu, please.',
          difficulty: 2,
        },
        {
          id: 'partner_2',
          speaker: 'partner',
          text: 'Of course! Here you go. What would you like to order?',
          audioUrl: 'ordering_2_audio',
          expectedResponse: 'I\'ll have the chicken pasta, please.',
          pronunciationTarget: 'I\'ll have the chicken pasta, please.',
          difficulty: 3,
        },
        {
          id: 'user_2',
          speaker: 'user',
          text: 'I\'ll have the chicken pasta, please.',
          expectedResponse: 'Excellent choice! Anything to drink?',
          pronunciationTarget: 'I\'ll have the chicken pasta, please.',
          difficulty: 3,
        },
      ],
      successCriteria: {
        minAccuracy: 80,
        minFluency: 75,
        minCompleteness: 85,
        maxTime: 400,
      },
    },
  ];

  const currentScenario = scenarios[0]; // For now, use first scenario

  useEffect(() => {
    loadUserHearts();
    startTimer();
    animateTurn();
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

  const animateTurn = () => {
    Animated.spring(turnAnimation, {
      toValue: 1,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();

    Animated.spring(messageAnimation, {
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


  const completeConversation = () => {
    // Calculate overall score
    const totalScore = turnResults.reduce((sum, result) => sum + result.overallScore, 0);
    const averageScore = totalScore / turnResults.length;
    setOverallScore(averageScore);

    // Calculate conversation flow (how well the conversation flowed)
    const flowScore = calculateConversationFlow();
    setConversationFlow(flowScore);

    // Calculate result
    const result: ConversationResult = {
      exerciseId: exercise.id,
      isCorrect: averageScore >= currentScenario.successCriteria.minAccuracy,
      accuracy: averageScore,
      attempts,
      timeSpent: Math.floor(timeSpent / 1000),
      pronunciationScore: turnResults.reduce((sum, r) => sum + r.accuracyScore, 0) / turnResults.length,
      fluencyScore: turnResults.reduce((sum, r) => sum + r.fluencyScore, 0) / turnResults.length,
      completenessScore: turnResults.reduce((sum, r) => sum + r.completenessScore, 0) / turnResults.length,
      conversationFlow: flowScore,
      userResponses,
      correctResponses: currentScenario.turns.map(turn => turn.expectedResponse || ''),
    };

    setShowResults(true);

    // Award XP
    if (result.isCorrect) {
      awardXP(exercise.xpReward, 'conversation_exercise_completion');
    }

    // Call completion callback
    setTimeout(() => {
      onComplete(result);
    }, 3000);
  };

  const calculateConversationFlow = (): number => {
    // Calculate how well the conversation flowed based on timing and responses
    const expectedTime = currentScenario.turns.length * 10; // 10 seconds per turn
    const actualTime = timeSpent / 1000;
    const timeScore = Math.max(0, 100 - Math.abs(actualTime - expectedTime) / expectedTime * 100);
    
    // Calculate response appropriateness
    const responseScore = turnResults.reduce((sum, result) => sum + result.completenessScore, 0) / turnResults.length;
    
    return (timeScore + responseScore) / 2;
  };

  const retryTurn = () => {
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

  const renderConversationHeader = () => (
    <Animated.View
      style={[
        styles.conversationHeader,
        {
          transform: [{
            scale: turnAnimation.interpolate({
              inputRange: [0, 1],
              outputRange: [0.9, 1],
            }),
          }],
          opacity: turnAnimation,
        },
      ]}
    >
      <Card style={styles.scenarioCard}>
        <View style={styles.scenarioInfo}>
          <Badge
            text={`Turn ${currentTurn + 1} of ${currentScenario.turns.length}`}
            color={theme.colors.primary}
            size="small"
          />
          <Text style={styles.scenarioTitle}>{currentScenario.title}</Text>
          <Text style={styles.scenarioDescription}>{currentScenario.description}</Text>
        </View>

        <View style={styles.conversationProgress}>
          <ProgressBar
            progress={((currentTurn + 1) / currentScenario.turns.length) * 100}
            height={6}
            color={theme.colors.primary}
          />
        </View>
      </Card>
    </Animated.View>
  );

  const renderConversationHistory = () => (
    <Card style={styles.historyCard}>
      <Text style={styles.historyTitle}>Conversation History</Text>
      <ScrollView style={styles.historyScroll} showsVerticalScrollIndicator={false}>
        {currentScenario.turns.slice(0, currentTurn + 1).map((turn, index) => (
          <Animated.View
            key={turn.id}
            style={[
              styles.messageContainer,
              {
                transform: [{
                  scale: messageAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.9, 1],
                  }),
                }],
                opacity: messageAnimation,
              },
            ]}
          >
            <View style={[
              styles.message,
              turn.speaker === 'user' ? styles.userMessage : styles.partnerMessage,
            ]}>
              <View style={styles.messageHeader}>
                <View style={styles.speakerInfo}>
                  {turn.speaker === 'user' ? (
                    <UsersIcon size={16} color={theme.colors.primary} />
                  ) : (
                    <MessageCircleIcon size={16} color={theme.colors.gray[600]} />
                  )}
                  <Text style={[
                    styles.speakerName,
                    turn.speaker === 'user' ? styles.userSpeakerName : styles.partnerSpeakerName,
                  ]}>
                    {turn.speaker === 'user' ? 'You' : 'Partner'}
                  </Text>
                </View>
                {turn.audioUrl && (
                  <TouchableOpacity
                    style={styles.playMessageButton}
                    onPress={handlePlayAudio}
                  >
                    <PlayIcon size={14} color={theme.colors.gray[600]} />
                  </TouchableOpacity>
                )}
              </View>
              <Text style={[
                styles.messageText,
                turn.speaker === 'user' ? styles.userMessageText : styles.partnerMessageText,
              ]}>
                {turn.text}
              </Text>
            </View>
          </Animated.View>
        ))}
      </ScrollView>
    </Card>
  );

  const renderCurrentTurn = () => {
    const turn = getCurrentTurn();
    if (!turn) return null;

    return (
      <Card style={styles.currentTurnCard}>
        <View style={styles.turnHeader}>
          <Text style={styles.turnTitle}>
            {turn.speaker === 'user' ? 'Your Turn' : 'Partner\'s Turn'}
          </Text>
          <Badge
            text={`Difficulty ${turn.difficulty}/5`}
            color={turn.difficulty <= 2 ? theme.colors.success : turn.difficulty <= 3 ? theme.colors.warning : theme.colors.danger}
            size="small"
          />
        </View>

        {turn.speaker === 'partner' ? (
          <View style={styles.partnerTurn}>
            <Text style={styles.turnText}>{turn.text}</Text>
            {turn.audioUrl && (
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
                  {isPlaying ? 'Playing...' : 'Listen'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View style={styles.userTurn}>
            <Text style={styles.expectedResponse}>
              Expected: {turn.expectedResponse}
            </Text>
            
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
                  ? 'Recording... Speak your response'
                  : pronunciationState.isProcessing
                    ? 'Processing your response...'
                    : pronunciationState.isEvaluating
                      ? 'Evaluating pronunciation...'
                      : 'Tap to record your response'
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
                    {pronunciationState.evaluation.overallScore >= currentScenario.successCriteria.minAccuracy
                      ? 'Great response! Moving to next turn.'
                      : 'Good try! Let\'s practice this response again.'
                    }
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}
      </Card>
    );
  };

  const renderResults = () => {
    if (!showResults) return null;

    return (
      <View style={styles.resultsContainer}>
        <Card style={styles.resultsCard}>
          <View style={styles.resultsHeader}>
            <Text style={styles.resultsTitle}>Conversation Complete!</Text>
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
                {Math.round(turnResults.reduce((sum, r) => sum + r.accuracyScore, 0) / turnResults.length)}%
              </Text>
            </View>
            <View style={styles.scoreItem}>
              <TrendingUpIcon size={20} color={theme.colors.success} />
              <Text style={styles.scoreLabel}>Fluency</Text>
              <Text style={styles.scoreValue}>
                {Math.round(turnResults.reduce((sum, r) => sum + r.fluencyScore, 0) / turnResults.length)}%
              </Text>
            </View>
            <View style={styles.scoreItem}>
              <AwardIcon size={20} color={theme.colors.warning} />
              <Text style={styles.scoreLabel}>Completeness</Text>
              <Text style={styles.scoreValue}>
                {Math.round(turnResults.reduce((sum, r) => sum + r.completenessScore, 0) / turnResults.length)}%
              </Text>
            </View>
            <View style={styles.scoreItem}>
              <MessageCircleIcon size={20} color={theme.colors.info} />
              <Text style={styles.scoreLabel}>Flow</Text>
              <Text style={styles.scoreValue}>
                {Math.round(conversationFlow)}%
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
                {overallScore >= currentScenario.successCriteria.minAccuracy ? `+${exercise.xpReward}` : '0'}
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
        <Text style={styles.title}>Conversation Exercise</Text>
        <Text style={styles.subtitle}>
          Practice real-world conversations with pronunciation focus
        </Text>
      </View>

      {renderConversationHeader()}
      {renderConversationHistory()}
      {renderCurrentTurn()}

      <View style={styles.actionButtons}>
        <Button
          title="Retry Turn"
          onPress={retryTurn}
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
  conversationHeader: {
    marginBottom: theme.spacing.lg,
  },
  scenarioCard: {
    padding: theme.spacing.lg,
  },
  scenarioInfo: {
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  scenarioTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: '600',
    color: theme.colors.black,
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.xs,
  },
  scenarioDescription: {
    fontSize: theme.fontSize.md,
    color: theme.colors.gray[600],
    textAlign: 'center',
  },
  conversationProgress: {
    marginTop: theme.spacing.md,
  },
  historyCard: {
    marginBottom: theme.spacing.lg,
    padding: theme.spacing.lg,
    maxHeight: 200,
  },
  historyTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: '600',
    color: theme.colors.black,
    marginBottom: theme.spacing.md,
  },
  historyScroll: {
    flex: 1,
  },
  messageContainer: {
    marginBottom: theme.spacing.sm,
  },
  message: {
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    maxWidth: '80%',
  },
  userMessage: {
    backgroundColor: theme.colors.primary,
    alignSelf: 'flex-end',
  },
  partnerMessage: {
    backgroundColor: theme.colors.gray[100],
    alignSelf: 'flex-start',
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  speakerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  speakerName: {
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
    marginLeft: theme.spacing.xs,
  },
  userSpeakerName: {
    color: theme.colors.white,
  },
  partnerSpeakerName: {
    color: theme.colors.gray[600],
  },
  playMessageButton: {
    padding: theme.spacing.xs,
  },
  messageText: {
    fontSize: theme.fontSize.md,
    lineHeight: 20,
  },
  userMessageText: {
    color: theme.colors.white,
  },
  partnerMessageText: {
    color: theme.colors.black,
  },
  currentTurnCard: {
    marginBottom: theme.spacing.lg,
    padding: theme.spacing.lg,
  },
  turnHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  turnTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: '600',
    color: theme.colors.black,
  },
  partnerTurn: {
    alignItems: 'center',
  },
  turnText: {
    fontSize: theme.fontSize.lg,
    color: theme.colors.black,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
    lineHeight: 24,
  },
  playButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
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
  userTurn: {
    alignItems: 'center',
  },
  expectedResponse: {
    fontSize: theme.fontSize.md,
    color: theme.colors.gray[600],
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
    fontStyle: 'italic',
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
