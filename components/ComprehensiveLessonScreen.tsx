// Comprehensive Lesson Screen Component
// Demonstrates the complete lesson system with gamification, progress tracking, and user verification
// Integrates all services: lesson generator, gamification, and lesson manager

import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  ActivityIndicator,
  Dimensions,
  TextInput,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { ProgressBar } from '@/components/ProgressBar';
import { theme } from '@/constants/theme';
import { useI18n } from '@/hooks/useI18n';
// import { lazyLoadHaptics } from '@/services/LazyDependencies';
import { 
  lessonManager, 
  LESSON_MANAGER_CONFIG,
  UserLessonState,
  LessonSession,
} from '@/services/learning/comprehensiveLessonManager';
import { 
  gamificationService,
  GAMIFICATION_CONSTANTS, 
} from '@/services/gamification/enhancedGamificationService';
import { 
  ComprehensiveLessonGenerator,
  CEFR_WORD_TARGETS,
  WORDS_PER_LESSON,
  LESSONS_PER_LEVEL,
} from '@/services/learning/comprehensiveLessonGenerator';
import { 
  MultilingualLesson,
  MultilingualExercise,
  VocabularyItem,
  CEFRLevel,
  Achievement,
  MultilingualContent,
} from '@/types';

const { width, height } = Dimensions.get('window');

interface LessonScreenState {
  isLoading: boolean;
  currentLesson: MultilingualLesson | null;
  currentExercise: MultilingualExercise | null;
  exerciseIndex: number;
  userAnswer: string;
  isAnswerSubmitted: boolean;
  isCorrect: boolean;
  showExplanation: boolean;
  sessionId: string;
  livesRemaining: number;
  streakCount: number;
  totalXP: number;
  lessonProgress: number;
  timeSpent: number;
  achievements: Achievement[];
  showAchievement: boolean;
  levelUp: boolean;
  newLevel?: CEFRLevel;
  lessonCompleted: boolean;
}

// Helper function to get content in a specific language
const getContentInLanguage = (content: MultilingualContent, languageCode: string): string => {
  if (typeof content === 'string') return content;
  return content[languageCode as keyof MultilingualContent] || content.en || '';
};

export default memo(ComprehensiveLessonScreen);

ComprehensiveLessonScreen.displayName = 'ComprehensiveLessonScreen';

function ComprehensiveLessonScreen() {
  const { t } = useI18n();
  const [state, setState] = useState<LessonScreenState>({
    isLoading: true,
    currentLesson: null,
    currentExercise: null,
    exerciseIndex: 0,
    userAnswer: '',
    isAnswerSubmitted: false,
    isCorrect: false,
    showExplanation: false,
    sessionId: '',
    livesRemaining: 5,
    streakCount: 0,
    totalXP: 0,
    lessonProgress: 0,
    timeSpent: 0,
    achievements: [],
    showAchievement: false,
    levelUp: false,
    newLevel: undefined,
    lessonCompleted: false,
  });

  const [lessonState, setLessonState] = useState<UserLessonState | null>(null);
  const [session, setSession] = useState<LessonSession | null>(null);
  const [startTime, setStartTime] = useState<Date>(new Date());

  // Initialize lesson system
  useEffect(() => {
    initializeLessonSystem();
  }, []);

  // Update time spent
  useEffect(() => {
    const timer = setInterval(() => {
      setState(prev => ({
        ...prev,
        timeSpent: Math.floor((new Date().getTime() - startTime.getTime()) / 1000),
      }));
    }, 1000);

    return () => clearInterval(timer);
  }, [startTime]);

  // Initialize lesson system
  const initializeLessonSystem = async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));

      // Get user lesson state
      const userState = lessonManager.getUserLessonState();
      setLessonState(userState);

      // Get gamification state
      const gamificationState = gamificationService.getUserState();
      if (gamificationState) {
        setState(prev => ({
          ...prev,
          livesRemaining: gamificationState.lives,
          streakCount: gamificationState.currentStreak,
          totalXP: gamificationState.totalXP,
        }));
      }

      // Get available lessons
      const availableLessons = await lessonManager.getAvailableLessons();
      
      if (availableLessons.currentLesson) {
        await startLesson(availableLessons.currentLesson.id);
      } else if (availableLessons.nextLessons.length > 0) {
        await startLesson(availableLessons.nextLessons[0].id);
      } else {
        // Generate first lesson
        const lessonGenerator = new ComprehensiveLessonGenerator('hr', 'en', 'A1');
        const firstLesson = lessonGenerator.generateLesson('basic_greetings', 1, 'A1');
        await startLesson(firstLesson.id);
      }

    } catch (error) {
      console.error('Error initializing lesson system:', error);
      Alert.alert('Error', 'Failed to initialize lesson system');
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  // Start a lesson
  const startLesson = async (lessonId: string) => {
    try {
      const result = await lessonManager.startLesson(lessonId);
      
      if (result.success) {
        setState(prev => ({
          ...prev,
          currentLesson: result.lesson,
          currentExercise: result.lesson.exercises[0],
          exerciseIndex: 0,
          sessionId: result.sessionId,
          livesRemaining: result.livesRequired,
        }));

        setStartTime(new Date());
        
        // Update session
        const currentSession = lessonManager.getCurrentSession();
        setSession(currentSession);

        // Haptic feedback
        // const haptics = await lazyLoadHaptics(); // Mock implementation
        // await haptics.impactAsync(haptics.ImpactFeedbackStyle.Light); // Mock implementation
      } else {
        Alert.alert('Cannot Start Lesson', result.message || 'Unknown error');
      }
    } catch (error) {
      console.error('Error starting lesson:', error);
      Alert.alert('Error', 'Failed to start lesson');
    }
  };

  // Submit answer
  const submitAnswer = async () => {
    if (!state.currentExercise || !state.userAnswer.trim()) return;

    try {
      setState(prev => ({ ...prev, isAnswerSubmitted: true }));

      const result = await lessonManager.completeExercise(
        state.currentExercise.id,
        state.userAnswer,
        state.timeSpent,
        0, // hints used
      );

      if (result.success) {
        setState(prev => ({
          ...prev,
          isCorrect: result.isCorrect,
          showExplanation: true,
          livesRemaining: prev.livesRemaining - result.livesUsed,
          lessonProgress: result.lessonCompleted ? 100 : 
            ((prev.exerciseIndex + 1) / (state.currentLesson?.exercises.length || 1)) * 100,
        }));

        // Haptic feedback
        // const haptics = await lazyLoadHaptics(); // Mock implementation
        // await haptics.impactAsync(
        //   result.isCorrect 
        //     ? haptics.ImpactFeedbackStyle.Heavy
        //     : haptics.ImpactFeedbackStyle.Medium,
        // ); // Mock implementation

        // Check if lesson is completed
        if (result.lessonCompleted) {
          await completeLesson();
        } else if (result.nextExercise) {
          // Move to next exercise
          setTimeout(() => {
            setState(prev => ({
              ...prev,
              currentExercise: result.nextExercise!,
              exerciseIndex: prev.exerciseIndex + 1,
              userAnswer: '',
              isAnswerSubmitted: false,
              showExplanation: false,
            }));
          }, 2000);
        }
      } else {
        Alert.alert('Error', 'Failed to submit answer');
      }
    } catch (error) {
      console.error('Error submitting answer:', error);
      Alert.alert('Error', 'Failed to submit answer');
    }
  };

  // Complete lesson
  const completeLesson = async () => {
    try {
      const result = await lessonManager.completeLessonSession();
      
      if (result.success) {
        setState(prev => ({
          ...prev,
          totalXP: prev.totalXP + result.totalXpEarned,
          achievements: result.achievementsUnlocked,
          showAchievement: result.achievementsUnlocked.length > 0,
          levelUp: result.levelUp,
          newLevel: result.newLevel,
        }));

        // Show completion alert
        Alert.alert(
          'Lesson Completed!',
          `You earned ${result.totalXpEarned} XP and ${result.coinsEarned} coins!`,
          [
            {
              text: 'Continue',
              onPress: () => {
                if (result.nextLesson) {
                  startLesson(result.nextLesson);
                } else {
                  // Return to lesson selection
                  initializeLessonSystem();
                }
              },
            },
          ],
        );
      }
    } catch (error) {
      console.error('Error completing lesson:', error);
    }
  };

  // Handle input change
  const handleInputChange = (text: string) => {
    setState(prev => ({ ...prev, userAnswer: text }));
  };

  // Skip explanation
  const skipExplanation = () => {
    setState(prev => ({ ...prev, showExplanation: false }));
  };

  // Get exercise content
  const getExerciseContent = useMemo(() => {
    if (!state.currentExercise) return null;

    const exercise = state.currentExercise;
    
    switch (exercise.type) {
      case 'flashcard':
        return (
          <View style={styles.exerciseContent}>
            <Text style={styles.exerciseQuestion}>
              {typeof exercise.question === 'string' ? exercise.question : exercise.question.en}
            </Text>
            {exercise.image && (
              <View style={styles.imageContainer}>
                <Text style={styles.imagePlaceholder}>📷 Image</Text>
              </View>
            )}
            {exercise.audio && (
              <Pressable style={styles.audioButton}>
                <Text style={styles.audioButtonText}>🔊 Play Audio</Text>
              </Pressable>
            )}
          </View>
        );

      case 'multiple_choice':
        return (
          <View style={styles.exerciseContent}>
            <Text style={styles.exerciseQuestion}>
              {getContentInLanguage(exercise.question, 'en')}
            </Text>
            {exercise.options?.map((option, index) => (
              <Pressable
                key={index}
                style={[
                  styles.optionButton,
                  state.userAnswer === getContentInLanguage(option, 'en') && styles.selectedOption,
                ]}
                onPress={() => handleInputChange(getContentInLanguage(option, 'en'))}
              >
                <Text style={styles.optionText}>{getContentInLanguage(option, 'en')}</Text>
              </Pressable>
            ))}
          </View>
        );

      case 'fill_blank':
        return (
          <View style={styles.exerciseContent}>
            <Text style={styles.exerciseQuestion}>
              {getContentInLanguage(exercise.question, 'en')}
            </Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.textInput}
                value={state.userAnswer}
                onChangeText={handleInputChange}
                placeholder="Enter your answer..."
                placeholderTextColor="#6b7280"
              />
            </View>
          </View>
        );

      default:
        return (
          <View style={styles.exerciseContent}>
            <Text style={styles.exerciseQuestion}>
              {getContentInLanguage(exercise.question, 'en')}
            </Text>
          </View>
        );
    }
  }, [state.currentExercise, state.userAnswer]);

  // Get explanation content
  const getExplanationContent = useMemo(() => {
    if (!state.currentExercise || !state.showExplanation) return null;

    return (
      <View style={styles.explanationContainer}>
        <Text style={styles.explanationTitle}>
          {state.isCorrect ? '✅ Correct!' : '❌ Incorrect'}
        </Text>
        <Text style={styles.explanationText}>
          {state.currentExercise.explanation?.en || 'No explanation available'}
        </Text>
        <Text style={styles.correctAnswer}>
          Correct answer: {state.currentExercise.correctAnswer}
        </Text>
        {state.currentExercise.hints && state.currentExercise.hints.length > 0 && (
          <View style={styles.hintsContainer}>
            <Text style={styles.hintsTitle}>Hints:</Text>
            {state.currentExercise.hints.map((hint, index) => (
              <Text key={index} style={styles.hintText}>
                • {hint.en}
              </Text>
            ))}
          </View>
        )}
      </View>
    );
  }, [state.currentExercise, state.showExplanation, state.isCorrect]);

  // Get lesson statistics
  const getLessonStats = useMemo(() => {
    if (!state.currentLesson) return null;

    const totalExercises = state.currentLesson.exercises.length;
    const completedExercises = state.exerciseIndex + (state.isAnswerSubmitted ? 1 : 0);
    const progress = (completedExercises / totalExercises) * 100;

    return {
      totalExercises,
      completedExercises,
      progress,
      estimatedTime: state.currentLesson.estimatedTime,
      xpReward: state.currentLesson.xpReward,
    };
  }, [state.currentLesson, state.exerciseIndex, state.isAnswerSubmitted]);

  if (state.isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading lesson...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.secondary]}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.userStats}>
              <Text style={styles.livesText}>❤️ {state.livesRemaining}</Text>
              <Text style={styles.streakText}>🔥 {state.streakCount}</Text>
              <Text style={styles.xpText}>⭐ {state.totalXP}</Text>
            </View>
            <View style={styles.timeContainer}>
              <Text style={styles.timeText}>
                {Math.floor(state.timeSpent / 60)}:{(state.timeSpent % 60).toString().padStart(2, '0')}
              </Text>
            </View>
          </View>
          
          {getLessonStats && (
            <View style={styles.progressContainer}>
              <Text style={styles.progressText}>
                Exercise {getLessonStats.completedExercises} of {getLessonStats.totalExercises}
              </Text>
              <ProgressBar progress={getLessonStats.progress / 100} />
            </View>
          )}
        </View>

        {/* Lesson Content */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {state.currentLesson && (
            <View style={styles.lessonContainer}>
              <Text style={styles.lessonTitle}>
                {getContentInLanguage(state.currentLesson.title, 'en')}
              </Text>
              <Text style={styles.lessonDescription}>
                {getContentInLanguage(state.currentLesson.description, 'en')}
              </Text>
              
              {/* Vocabulary Preview */}
              <View style={styles.vocabularyContainer}>
                <Text style={styles.vocabularyTitle}>New Words ({WORDS_PER_LESSON})</Text>
                <View style={styles.vocabularyGrid}>
                  {state.currentLesson.vocabularyIntroduced.slice(0, 6).map((word, index) => (
                    <View key={index} style={styles.vocabularyItem}>
                      <Text style={styles.vocabularyWord}>{word.word}</Text>
                      <Text style={styles.vocabularyTranslation}>{word.translation}</Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* Current Exercise */}
              {state.currentExercise && (
                <Card>
                  <Text style={styles.exerciseType}>
                    {getContentInLanguage(state.currentExercise.instruction, 'en')}
                  </Text>
                  {getExerciseContent}
                  
                  {!state.isAnswerSubmitted && (
                    <Button
                      title="Submit Answer"
                      onPress={submitAnswer}
                      disabled={!state.userAnswer.trim()}
                      style={styles.submitButton}
                    />
                  )}
                </Card>
              )}

              {/* Explanation */}
              {getExplanationContent}

              {/* Next Exercise Button */}
              {state.showExplanation && !state.lessonCompleted && (
                <Button
                  title="Continue"
                  onPress={skipExplanation}
                  style={styles.continueButton}
                />
              )}
            </View>
          )}
        </ScrollView>

        {/* Achievement Popup */}
        {state.showAchievement && (
          <View style={styles.achievementOverlay}>
            <View style={styles.achievementCard}>
              <Text style={styles.achievementTitle}>🏆 Achievement Unlocked!</Text>
              {state.achievements.map((achievement, index) => (
                <Text key={index} style={styles.achievementText as any}>
                  {achievement.name}
                </Text>
              ))}
              <Button
                title="Continue"
                onPress={() => setState(prev => ({ ...prev, showAchievement: false }))}
                style={styles.achievementButton}
              />
            </View>
          </View>
        )}

        {/* Level Up Popup */}
        {state.levelUp && (
          <View style={styles.levelUpOverlay}>
            <View style={styles.levelUpCard}>
              <Text style={styles.levelUpTitle}>🎉 Level Up!</Text>
              <Text style={styles.levelUpText as any}>
                You've reached level {state.newLevel}!
              </Text>
              <Button
                title="Continue"
                onPress={() => setState(prev => ({ ...prev, levelUp: false }))}
                style={styles.levelUpButton}
              />
            </View>
          </View>
        )}
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  } as ViewStyle,
  gradient: {
    flex: 1,
  } as ViewStyle,
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  } as ViewStyle,
  loadingText: {
    color: theme.colors.white,
    fontSize: theme.fontSize.lg,
    marginTop: theme.spacing.md,
  } as TextStyle,
  header: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
  } as ViewStyle,
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  } as ViewStyle,
  userStats: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  } as ViewStyle,
  livesText: {
    color: theme.colors.white,
    fontSize: theme.fontSize.md,
    fontWeight: '600',
  } as TextStyle,
  streakText: {
    color: theme.colors.white,
    fontSize: theme.fontSize.md,
    fontWeight: '600',
  } as TextStyle,
  xpText: {
    color: theme.colors.white,
    fontSize: theme.fontSize.md,
    fontWeight: '600',
  } as TextStyle,
  timeContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: 20,
  } as ViewStyle,
  timeText: {
    color: theme.colors.white,
    fontSize: theme.fontSize.md,
    fontWeight: '600',
  } as TextStyle,
  progressContainer: {
    marginTop: theme.spacing.sm,
  } as ViewStyle,
  progressText: {
    color: theme.colors.white,
    fontSize: theme.fontSize.sm,
    marginBottom: theme.spacing.xs,
  } as TextStyle,
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
  } as ViewStyle,
  lessonContainer: {
    paddingBottom: theme.spacing.xl,
  } as ViewStyle,
  lessonTitle: {
    fontSize: theme.fontSize.xxl,
    fontWeight: 'bold',
    color: theme.colors.white,
    marginBottom: theme.spacing.sm,
  } as TextStyle,
  lessonDescription: {
    fontSize: theme.fontSize.md,
    color: theme.colors.white,
    opacity: 0.9,
    marginBottom: theme.spacing.lg,
    lineHeight: 24,
  } as TextStyle,
  vocabularyContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  } as ViewStyle,
  vocabularyTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: '600',
    color: theme.colors.white,
    marginBottom: theme.spacing.sm,
  } as TextStyle,
  vocabularyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  } as ViewStyle,
  vocabularyItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    padding: theme.spacing.sm,
    minWidth: (width - theme.spacing.lg * 2 - theme.spacing.sm * 2) / 3,
  } as ViewStyle,
  vocabularyWord: {
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
    color: theme.colors.white,
  } as TextStyle,
  vocabularyTranslation: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.white,
    opacity: 0.8,
  } as TextStyle,
  exerciseCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  } as ViewStyle,
  exerciseType: {
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
    color: theme.colors.primary,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  } as TextStyle,
  exerciseContent: {
    marginBottom: theme.spacing.lg,
  } as ViewStyle,
  exerciseQuestion: {
    fontSize: theme.fontSize.lg,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  } as TextStyle,
  imageContainer: {
    height: 200,
    backgroundColor: '#6b7280',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  } as ViewStyle,
  imagePlaceholder: {
    fontSize: theme.fontSize.lg,
    color: theme.colors.white,
  } as TextStyle,
  audioButton: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.md,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  } as ViewStyle,
  audioButtonText: {
    color: theme.colors.white,
    fontSize: theme.fontSize.md,
    fontWeight: '600',
  } as TextStyle,
  optionButton: {
    backgroundColor: '#f3f4f6',
    padding: theme.spacing.md,
    borderRadius: 8,
    marginBottom: theme.spacing.sm,
  } as ViewStyle,
  selectedOption: {
    backgroundColor: theme.colors.primary,
  } as ViewStyle,
  optionText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    textAlign: 'center',
  } as TextStyle,
  inputContainer: {
    marginBottom: theme.spacing.md,
  } as ViewStyle,
  textInput: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
  } as TextStyle,
  submitButton: {
    backgroundColor: theme.colors.primary,
    marginTop: theme.spacing.md,
  } as ViewStyle,
  explanationContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  } as ViewStyle,
  explanationTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  } as TextStyle,
  explanationText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
    lineHeight: 24,
  } as TextStyle,
  correctAnswer: {
    fontSize: theme.fontSize.md,
    fontWeight: '600',
    color: theme.colors.primary,
    marginBottom: theme.spacing.md,
  } as TextStyle,
  hintsContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 8,
    padding: theme.spacing.md,
  } as ViewStyle,
  hintsTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  } as TextStyle,
  hintText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  } as TextStyle,
  continueButton: {
    backgroundColor: theme.colors.secondary,
  },
  achievementOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  achievementCard: {
    backgroundColor: theme.colors.white,
    borderRadius: 16,
    padding: theme.spacing.xl,
    margin: theme.spacing.lg,
    alignItems: 'center',
  },
  achievementTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: theme.spacing.md,
  },
  achievementText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  achievementButton: {
    backgroundColor: theme.colors.primary,
    marginTop: theme.spacing.md,
  },
  levelUpOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  levelUpCard: {
    backgroundColor: theme.colors.white,
    borderRadius: 16,
    padding: theme.spacing.xl,
    margin: theme.spacing.lg,
    alignItems: 'center',
  },
  levelUpTitle: {
    fontSize: theme.fontSize.xxl,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: theme.spacing.md,
  },
  levelUpText: {
    fontSize: theme.fontSize.lg,
    color: theme.colors.text,
    marginBottom: theme.spacing.lg,
  },
  levelUpButton: {
    backgroundColor: theme.colors.primary,
  },
});


ComprehensiveLessonScreen.displayName = 'ComprehensiveLessonScreen';
