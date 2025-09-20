// Core Exercise Components - Comprehensive exercise framework with adaptive learning
// Supports multiple exercise types with multilingual content and performance tracking
// Integrates with SRS and gamification systems

import React, { useState, useCallback, useEffect, useMemo, memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Alert,
  Platform,
  Animated,
} from 'react-native';
// Lazy loaded: expo-haptics
// Lazy loaded: expo-av
import { Button } from '@/components/Button';
import { ProgressBar } from '@/components/ProgressBar';
import { theme } from '@/constants/theme';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';
import { useSpacedRepetition } from '@/hooks/useSpacedRepetition';
import useEnhancedGamification from "@/hooks/useEnhancedGamification";
import { useEnhancedErrorHandling } from '@/hooks/useEnhancedErrorHandling';
import { feedback } from '@/components/EnhancedUserFeedback';
import {
  MultilingualExercise,
  MultilingualContent,
} from '@/types';
import MultipleChoiceExercise from './MultipleChoiceExercise';
import FillBlankExercise from './FillBlankExercise';
import MatchPairsExercise from './MatchPairsExercise';
import ListeningExercise from './ListeningExercise';
import PronunciationExercise from './PronunciationExercise';
import TranslationExercise from './TranslationExercise';
import WordOrderExercise from './WordOrderExercise';
import DictationExercise from './DictationExercise';
// import { lazyLoadAudio, lazyLoadHaptics } from '@/services/LazyDependencies';
import { useUniversalAudio } from '@/hooks/useUniversalAudio';

// Exercise component props
interface ExerciseComponentProps {
  exercise: MultilingualExercise;
  onComplete: (result: ExerciseResult) => void;
  onSkip?: () => void;
  showHints?: boolean;
  timeLimit?: number;
}

// Exercise result interface
export interface ExerciseResult {
  exerciseId: string;
  correct: boolean;
  userAnswer: string | string[];
  timeSpent: number; // milliseconds
  hintsUsed: number;
  attempts: number;
  quality: number; // 0-5 for SRS
}

// Base exercise component with common functionality
export const BaseExercise: React.FC<ExerciseComponentProps> = ({
  exercise,
  onComplete,
  onSkip,
  showHints = true,
  timeLimit,
}) => {
  const { user } = useUnifiedAuth();
  const { getUIText } = useSpacedRepetition();
  const { awardXP, completeLesson, acceptChallenge, createChallenge, generateDailyChallenges, refreshStats } = useEnhancedGamification();
  const { handleError, showSuccess, showWarning, triggerHaptic } = useEnhancedErrorHandling({
    showToast: true,
    enableHaptic: true,
    enableRetry: true,
  });
  const { playText, playVocabulary, playSentence } = useUniversalAudio({
    defaultLanguage: exercise.targetLanguage,
    quality: 'premium',
    enableHapticFeedback: true,
  });
  
  const [userAnswer, setUserAnswer] = useState<string | string[]>('');
  const [showExplanation, setShowExplanation] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [startTime] = useState(Date.now());
  const [timeRemaining, setTimeRemaining] = useState(timeLimit || 0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [sound, setSound] = useState<any>(null);
  
  // Animation values
  const fadeAnim = useMemo(() => new Animated.Value(1), []);
  const shakeAnim = useMemo(() => new Animated.Value(0), []);

  // Get UI language
  const uiLanguage = user?.mainLanguage?.code || 'en';
  
  // Helper to get localized text
  const getText = useCallback((content: MultilingualContent): string => {
    return content[uiLanguage] || content['en'] || '';
  }, [uiLanguage]);

  // Enhanced haptic feedback using the error handling hook
  const hapticFeedback = useCallback(async (type: 'success' | 'error' | 'light' = 'light') => {
    await triggerHaptic(type);
  }, [triggerHaptic]);

  // Check if answer is correct
  const isAnswerCorrect = useCallback((answer: string | string[]): boolean => {
    const correctAnswer = exercise.correctAnswer;
    
    if (Array.isArray(correctAnswer)) {
      if (Array.isArray(answer)) {
        return correctAnswer.every(correct => 
          answer.some(userAns => 
            userAns.toLowerCase().trim() === correct.toLowerCase().trim(),
          ),
        );
      } else {
        return correctAnswer.some(correct => 
          answer.toLowerCase().trim() === correct.toLowerCase().trim(),
        );
      }
    } else {
      if (Array.isArray(answer)) {
        return answer.some(userAns => 
          userAns.toLowerCase().trim() === correctAnswer.toLowerCase().trim(),
        );
      } else {
        return answer.toLowerCase().trim() === correctAnswer.toLowerCase().trim();
      }
    }
  }, [exercise.correctAnswer]);

  // Calculate quality score for SRS (0-5)
  const calculateQuality = useCallback((correct: boolean, timeSpent: number, hintsUsed: number, attempts: number): number => {
    if (!correct) return 0;
    
    let quality = 5; // Start with perfect score
    
    // Reduce for multiple attempts
    quality -= Math.min(attempts - 1, 2);
    
    // Reduce for hints used
    quality -= hintsUsed * 0.5;
    
    // Reduce for slow response (if time limit exists)
    if (timeLimit && timeSpent > timeLimit * 0.8 * 1000) {
      quality -= 1;
    }
    
    return Math.max(0, Math.min(5, Math.round(quality)));
  }, [timeLimit]);

  // Animate feedback
  const animateFeedback = useCallback((correct: boolean) => {
    if (correct) {
      // Success animation
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0.7,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Error shake animation
      Animated.sequence([
        Animated.timing(shakeAnim, {
          toValue: 10,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: -10,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: 0,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [fadeAnim, shakeAnim]);





  // Play audio helper with professional TTS using ElevenLabs/Google Voice
  const playAudio = useCallback(async (audioUrl?: string, exerciseText?: string) => {
    if (!audioUrl && !exerciseText) return;
    
    try {
      // Get the text to speak - prioritize the target language content
      let textToSpeak = '';
      
      if (exerciseText) {
        textToSpeak = exerciseText;
      } else if (exercise.correctAnswer && typeof exercise.correctAnswer === 'string') {
        // For vocabulary exercises, speak the correct answer in target language
        textToSpeak = exercise.correctAnswer;
      } else {
        // Fallback to question text
        textToSpeak = getText(exercise.question);
      }
      
      const targetLanguage = exercise.targetLanguage || 'en';
      
      console.debug('BaseExercise: Playing audio for text:', textToSpeak, 'Language:', targetLanguage);
      
      // Use appropriate audio method based on exercise type
      let result;
      if (exercise.type === 'flashcard') {
        result = await playVocabulary(textToSpeak, targetLanguage);
      } else {
        result = await playSentence(textToSpeak, targetLanguage, true); // Slower for comprehension
      }
      
      if (result.success) {
        console.debug(`BaseExercise: Audio played using ${result.method}`);
      } else {
        console.warn('BaseExercise: Audio playback failed:', (result as any).error || 'Unknown error');
      }
      
    } catch (error) {
      console.error('BaseExercise: Audio error:', error);
      await handleError(error as Error, 'audio', {
        action: 'play_exercise_audio',
        additionalData: { audioUrl, exerciseText },
      });
    }
  }, [exercise, getText, playVocabulary, playSentence, handleError]);

  // Enhanced cleanup with proper memory management
  useEffect(() => {
    return () => {
      // Cleanup function for component unmount
      if (sound) {
        sound.unloadAsync().catch((error: any) => {
          console.warn('Error cleaning up audio on unmount:', error);
        });
        setSound(null);
      }
    };
  }, [sound]);

  // Removed duplicate useEffect - cleanup is handled in the main cleanup effect



  // Submit answer
  const handleSubmit = useCallback(async (isTimeout = false) => {
    if (isCompleted) return;
    
    const currentAttempts = attempts + 1;
    setAttempts(currentAttempts);
    
    const timeSpent = Date.now() - startTime;
    const correct = !isTimeout && isAnswerCorrect(userAnswer);
    const quality = calculateQuality(correct, timeSpent, hintsUsed, currentAttempts);
    
    // Haptic and visual feedback
    await hapticFeedback(correct ? 'success' : 'error');
    animateFeedback(correct);
    
    if (correct || currentAttempts >= 3 || isTimeout) {
      // Exercise completed
      setIsCompleted(true);
      setShowExplanation(true);
      
      const result: ExerciseResult = {
        exerciseId: exercise.id,
        correct,
        userAnswer,
        timeSpent,
        hintsUsed,
        attempts: currentAttempts,
        quality,
      };
      
      // Award XP for correct answers with error handling
      if (correct) {
        try {
          await awardXP(exercise.xpReward, 'exercise_completion', user?.currentLanguage?.code);
          showSuccess(`+${exercise.xpReward} XP earned!`);
        } catch (error) {
          await handleError(error as Error, 'api', {
            action: 'award_xp',
            additionalData: { exerciseId: exercise.id, xpReward: exercise.xpReward },
          });
        }
      }
      
      // Complete after showing explanation briefly
      setTimeout(() => {
        onComplete(result);
      }, correct ? 1500 : 2500);
    } else {
      // Allow retry with enhanced feedback
      setUserAnswer('');
      showWarning(getUIText('exercise.incorrect'));
    }
  }, [
    isCompleted, attempts, startTime, userAnswer, isAnswerCorrect, 
    calculateQuality, animateFeedback, exercise.id, exercise.xpReward, hapticFeedback,
    hintsUsed, onComplete, awardXP, user?.currentLanguage?.code, getUIText,
    handleError, showSuccess, showWarning,
  ]);

  // Show hint with enhanced feedback
  const showHint = useCallback(() => {
    if (!exercise.hints || hintsUsed >= exercise.hints.length) return;
    
    const hint = getText(exercise.hints[hintsUsed]);
    feedback.info(getUIText('exercise.hint'), hint);
    setHintsUsed(prev => prev + 1);
    hapticFeedback('light');
  }, [exercise.hints, hintsUsed, getText, getUIText, hapticFeedback]);

  // Timer effect - optimized to prevent excessive re-renders
  useEffect(() => {
    if (!timeLimit || timeRemaining <= 0 || isCompleted) {
      return;
    }
    
    const timer = setTimeout(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          // Time's up - trigger submission
          setTimeout(() => handleSubmit(true), 0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [timeRemaining, timeLimit, isCompleted, handleSubmit]);

  // Skip exercise
  const handleSkip = useCallback(() => {
    if (onSkip) {
      onSkip();
    } else {
      // Treat as incorrect completion
      const result: ExerciseResult = {
        exerciseId: exercise.id,
        correct: false,
        userAnswer: '',
        timeSpent: Date.now() - startTime,
        hintsUsed,
        attempts: attempts + 1,
        quality: 0,
      };
      onComplete(result);
    }
  }, [onSkip, exercise.id, startTime, hintsUsed, attempts, onComplete]);

  // Render exercise content based on type
  const renderExerciseContent = () => {
    switch (exercise.type) {
      case 'multiple_choice':
      case 'multipleChoice':
        return (
          <MultipleChoiceExercise
            exercise={exercise}
            userAnswer={userAnswer as string}
            onAnswerChange={setUserAnswer}
            disabled={isCompleted}
            getText={getText}
            correctAnswer={exercise.correctAnswer as string}
            onComplete={() => {}}
            onNext={() => {}}
          />
        );
      
      case 'fill_blank':
      case 'fillBlank':
        return (
          <FillBlankExercise
            exercise={exercise}
            userAnswer={userAnswer as string}
            onAnswerChange={setUserAnswer}
            disabled={isCompleted}
            getText={getText}
            correctAnswer={exercise.correctAnswer as string}
            onComplete={() => {}}
            onNext={() => {}}
          />
        );
      
      case 'match_pairs':
      case 'match':
        return (
          <MatchPairsExercise
            exercise={exercise}
            userAnswer={userAnswer as string[]}
            onAnswerChange={setUserAnswer}
            disabled={isCompleted}
            getText={getText}
            correctAnswer={exercise.correctAnswer as string[]}
          />
        );
      
      case 'listening':
        return (
          <ListeningExercise
            exercise={exercise}
            userAnswer={userAnswer as string}
            onAnswerChange={setUserAnswer}
            disabled={isCompleted}
            getText={getText}
            playAudio={playAudio}
          />
        );
      
      case 'pronunciation':
      case 'speaking':
        return (
          <PronunciationExercise
            exercise={exercise}
            userAnswer={userAnswer as string}
            onAnswerChange={setUserAnswer}
            disabled={isCompleted}
            getText={getText}
            onComplete={() => {}}
            onNext={() => {}}
          />
        );
      
      case 'cloze':
        return (
          <TranslationExercise
            exercise={exercise}
            userAnswer={userAnswer as string}
            onAnswerChange={setUserAnswer}
            disabled={isCompleted}
            getText={getText}
            correctAnswer={exercise.correctAnswer as string}
            onComplete={() => {}}
            onNext={() => {}}
          />
        );
      
      case 'matching':
        return (
          <WordOrderExercise
            exercise={exercise}
            userAnswer={Array.isArray(userAnswer) ? userAnswer.join(' ') : userAnswer}
            onComplete={() => {}}
            onNext={() => {}}
            isSubmitted={isCompleted}
            showFeedback={false}
          />
        );
      
      case 'dictation':
        return (
          <DictationExercise
            exercise={exercise}
            userAnswer={userAnswer as string}
            onAnswerChange={setUserAnswer}
            disabled={isCompleted}
            getText={getText}
            playAudio={playAudio}
            onComplete={() => {}}
            onNext={() => {}}
          />
        );
      
      default:
        return (
          <View style={styles.exerciseContent}>
            <Text style={styles.question}>{getText(exercise.question)}</Text>
            <Text style={styles.comingSoon}>
              Supported exercise types: multiple choice, fill blank, match pairs, listening, pronunciation, translation, word order, dictation
            </Text>
            <Text style={styles.comingSoon}>
              Current type: &quot;{exercise.type}&quot;
            </Text>
          </View>
        );
    }
  };

  return (
    <Animated.View 
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ translateX: shakeAnim }],
        },
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <ProgressBar 
          progress={isCompleted ? 1 : 0.5} 
          color={isCompleted ? (isAnswerCorrect(userAnswer) ? theme.colors.success : theme.colors.error) : theme.colors.primary}
        />
        
        {timeLimit && timeLimit > 0 && (
          <View style={styles.timerContainer}>
            <Text style={styles.timerText}>
              {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
            </Text>
          </View>
        )}
      </View>

      {/* Exercise Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.instructionContainer}>
          <Text style={styles.instruction}>{getText(exercise.instruction)}</Text>
        </View>
        
        {renderExerciseContent()}
        
        {/* Explanation (shown after completion) */}
        {showExplanation && exercise.explanation && (
          <View style={styles.explanationContainer}>
            <Text style={styles.explanationTitle}>
              {getUIText(isAnswerCorrect(userAnswer) ? 'exercise.correct' : 'exercise.explanation')}
            </Text>
            <Text style={styles.explanationText}>
              {getText(exercise.explanation)}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        {!isCompleted && (
          <>
            {showHints && exercise.hints && hintsUsed < exercise.hints.length && (
              <Button
                title={getUIText('exercise.hint')}
                onPress={showHint}
                variant="secondary"
                style={styles.hintButton}
              />
            )}
            
            <Button
              title={getUIText('exercise.skip')}
              onPress={handleSkip}
              variant="outline"
              style={styles.skipButton}
            />
            
            <Button
              title={getUIText('exercise.check')}
              onPress={() => handleSubmit()}
              disabled={!userAnswer || (Array.isArray(userAnswer) && userAnswer.length === 0)}
              style={styles.submitButton}
            />
          </>
        )}
      </View>
    </Animated.View>
  );
};

// Multiple Choice Exercise Component - REMOVED (using imported component instead)

// Fill in the Blank Exercise Component - REMOVED (using imported component instead)

// Listening Exercise Component - REMOVED (using imported component instead)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
  },
  timerContainer: {
    alignItems: 'center',
    marginTop: theme.spacing.sm,
  },
  timerText: {
    fontSize: theme.fontSize.lg,
    fontWeight: '600' as const,
    color: theme.colors.primary,
  },
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
  },
  instructionContainer: {
    marginBottom: theme.spacing.lg,
  },
  instruction: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  exerciseContent: {
    marginBottom: theme.spacing.xl,
  },
  question: {
    fontSize: theme.fontSize.xl,
    fontWeight: '600' as const,
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
    lineHeight: 28,
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  imagePlaceholder: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    textAlign: 'center',
  },
  optionsContainer: {
    gap: theme.spacing.md,
  },
  optionButton: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: theme.spacing.lg,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedOption: {
    backgroundColor: theme.colors.primaryLight,
    borderColor: theme.colors.primary,
  },
  disabledOption: {
    opacity: 0.6,
  },
  optionText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    textAlign: 'center',
    fontWeight: '500' as const,
  },
  selectedOptionText: {
    color: theme.colors.primary,
    fontWeight: '600' as const,
  },
  fillBlankContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.lg,
  },
  fillBlankText: {
    fontSize: theme.fontSize.lg,
    color: theme.colors.text,
    lineHeight: 32,
  },
  blankInput: {
    backgroundColor: theme.colors.surface,
    borderRadius: 8,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    marginHorizontal: theme.spacing.xs,
    minWidth: 80,
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  blankInputText: {
    fontSize: theme.fontSize.lg,
    color: theme.colors.primary,
    textAlign: 'center',
    fontWeight: '600' as const,
  },
  wordChipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  wordChip: {
    backgroundColor: theme.colors.surface,
    borderRadius: 20,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedWordChip: {
    backgroundColor: theme.colors.primaryLight,
    borderColor: theme.colors.primary,
  },
  wordChipText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    fontWeight: '500' as const,
  },
  selectedWordChipText: {
    color: theme.colors.primary,
    fontWeight: '600' as const,
  },
  audioButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 12,
    padding: theme.spacing.lg,
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  audioButtonText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.white,
    fontWeight: '600' as const,
  },
  explanationContainer: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: theme.spacing.lg,
    marginTop: theme.spacing.lg,
  },
  explanationTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: '600' as const,
    color: theme.colors.primary,
    marginBottom: theme.spacing.sm,
  },
  explanationText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    lineHeight: 22,
  },
  footer: {
    flexDirection: 'row',
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  hintButton: {
    flex: 1,
  },
  skipButton: {
    flex: 1,
  },
  submitButton: {
    flex: 2,
  },
  errorText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.error,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  comingSoon: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
    padding: theme.spacing.xl,
  },
});

// Memoize the component to prevent unnecessary re-renders
export default memo(BaseExercise);
