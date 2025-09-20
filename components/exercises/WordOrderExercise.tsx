import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Alert,
  ScrollView,
  Dimensions,
} from 'react-native';
import { theme } from '@/constants/theme';
import { useI18n } from '@/hooks/useI18n';
import useEnhancedGamification from "@/hooks/useEnhancedGamification";
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Badge } from '@/components/Badge';
import { CheckIcon, XIcon, StarIcon, HeartIcon, ShuffleIcon, ArrowUpIcon, ArrowDownIcon } from '@/components/icons/LucideReplacement';
import { MultilingualExercise, MultilingualContent } from '@/types';

const { width } = Dimensions.get('window');

interface WordItem {
  id: string;
  text: string;
  isSelected: boolean;
  order: number;
}

interface WordOrderExerciseProps {
  exercise: MultilingualExercise;
  onComplete: (isCorrect: boolean, timeSpent: number) => void;
  onNext: () => void;
  userAnswer?: string;
  isSubmitted?: boolean;
  showFeedback?: boolean;
}

export default function WordOrderExercise({
  exercise,
  onComplete,
  onNext,
  userAnswer: initialAnswer,
  isSubmitted: initialSubmitted,
  showFeedback: initialShowFeedback,
}: WordOrderExerciseProps) {
  const { t } = useI18n();
  const { awardXP, completeLesson, acceptChallenge, createChallenge, generateDailyChallenges, refreshStats } = useEnhancedGamification();

  const [words, setWords] = useState<WordItem[]>([]);
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(initialSubmitted || false);
  const [showFeedback, setShowFeedback] = useState(initialShowFeedback || false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [timeSpent, setTimeSpent] = useState(0);
  const [hearts, setHearts] = useState(5);
  const [animationValue] = useState(new Animated.Value(0));

  useEffect(() => {
    loadUserHearts();
    startTimer();
    initializeWords();
  }, []);

  useEffect(() => {
    if (isSubmitted) {
      animateFeedback();
    }
  }, [isSubmitted]);

  const loadUserHearts = async () => {
    try {
      const userHearts = 5; // Mock implementation
      setHearts(userHearts);
    } catch (error) {
      console.error('Error loading user hearts:', error);
    }
  };

  const startTimer = () => {
    const timer = setInterval(() => {
      setTimeSpent(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  };

  const getContentInLanguage = (content: MultilingualContent, language: string = 'en'): string => {
    if (typeof content === 'string') return content;
    return content[language] || content.en || '';
  };

  const initializeWords = () => {
    // Parse the correct answer to create word items
    const correctAnswer = exercise.correctAnswer as string;
    const wordArray = correctAnswer.split(' ');
    
    const wordItems: WordItem[] = wordArray.map((word, index) => ({
      id: `word_${index}`,
      text: word,
      isSelected: false,
      order: index,
    }));

    // Shuffle the words
    const shuffledWords = [...wordItems].sort(() => Math.random() - 0.5);
    setWords(shuffledWords);
  };

  const handleWordSelect = (wordId: string) => {
    if (isSubmitted) return;
    
    if (selectedWord === wordId) {
      setSelectedWord(null);
    } else {
      setSelectedWord(wordId);
    }
  };

  const handleMoveWord = (direction: 'up' | 'down') => {
    if (!selectedWord || isSubmitted) return;

    const selectedIndex = words.findIndex(word => word.id === selectedWord);
    if (selectedIndex === -1) return;

    const newWords = [...words];
    const targetIndex = direction === 'up' ? selectedIndex - 1 : selectedIndex + 1;

    if (targetIndex >= 0 && targetIndex < newWords.length) {
      // Swap words
      [newWords[selectedIndex], newWords[targetIndex]] = [newWords[targetIndex], newWords[selectedIndex]];
      setWords(newWords);
    }
  };

  const handleShuffle = () => {
    const shuffledWords = [...words].sort(() => Math.random() - 0.5);
    setWords(shuffledWords);
    setSelectedWord(null);
  };

  const handleSubmit = async () => {
    const userAnswer = words.map(word => word.text).join(' ');
    const correct = userAnswer === exercise.correctAnswer;
    
    setIsSubmitted(true);
    setIsCorrect(correct);
    setShowFeedback(true);

    if (!correct) {
      const newHearts = hearts - 1;
      setHearts(newHearts);
      
      if (newHearts === 0) {
        Alert.alert(
          'Out of Hearts!',
          'You need to wait or buy more hearts to continue.',
          [{ text: 'OK' }],
        );
      }
    } else {
      // Award XP for correct answer
      await awardXP(exercise.xpReward, 'exercise_completion');
    }

    onComplete(correct, timeSpent);
  };

  const animateFeedback = () => {
    Animated.spring(animationValue, {
      toValue: 1,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();
  };

  const getWordStyle = (word: WordItem) => {
    const baseStyle = [styles.wordButton];
    
    if (word.id === selectedWord) {
      baseStyle.push(styles.selectedWord as any);
    }

    return baseStyle;
  };

  const getWordTextStyle = (word: WordItem) => {
    const baseStyle = [styles.wordText];
    
    if (word.id === selectedWord) {
      baseStyle.push(styles.selectedWordText as any);
    }

    return baseStyle;
  };

  const renderFeedback = () => {
    if (!showFeedback) return null;

    return (
      <Animated.View
        style={[
          styles.feedbackContainer,
          {
            transform: [{
              scale: animationValue.interpolate({
                inputRange: [0, 1],
                outputRange: [0.8, 1],
              }),
            }],
            opacity: animationValue,
          },
        ]}
      >
        <Card style={[
          styles.feedbackCard,
          isCorrect ? styles.correctFeedback : styles.incorrectFeedback,
        ] as any}>
          <View style={styles.feedbackHeader}>
            {isCorrect ? (
              <CheckIcon size={24} color={theme.colors.success} />
            ) : (
              <XIcon size={24} color={theme.colors.danger} />
            )}
            <Text style={[
              styles.feedbackTitle,
              isCorrect ? styles.correctFeedbackTitle : styles.incorrectFeedbackTitle,
            ]}>
              {isCorrect ? 'Correct Order!' : 'Incorrect Order'}
            </Text>
          </View>

          {!isCorrect && (
            <View style={styles.correctAnswerContainer}>
              <Text style={styles.correctAnswerLabel}>Correct order:</Text>
              <Text style={styles.correctAnswerText}>{exercise.correctAnswer}</Text>
            </View>
          )}

          {exercise.explanation && (
            <Text style={styles.feedbackExplanation}>
              {getContentInLanguage(exercise.explanation, 'en')}
            </Text>
          )}

          <View style={styles.feedbackStats}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{timeSpent}s</Text>
              <Text style={styles.statLabel}>Time</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {isCorrect ? `+${exercise.xpReward}` : '0'}
              </Text>
              <Text style={styles.statLabel}>XP</Text>
            </View>
            <View style={styles.statItem}>
              <HeartIcon size={16} color={theme.colors.danger} />
              <Text style={styles.statLabel}>{hearts}</Text>
            </View>
          </View>

          <Button
            title="Continue"
            onPress={onNext}
            style={styles.continueButton}
          />
        </Card>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <Card style={styles.exerciseCard}>
        <View style={styles.exerciseHeader}>
          <Badge
            text="Word Order"
            color={theme.colors.primary}
            size="small"
          />
          <View style={styles.difficultyContainer}>
            <StarIcon size={16} color={theme.colors.warning} />
            <Text style={styles.difficultyText}>{exercise.difficulty}/5</Text>
          </View>
        </View>

        <Text style={styles.instruction}>
          {getContentInLanguage(exercise.instruction, 'en')}
        </Text>

        <Text style={styles.question}>
          {getContentInLanguage(exercise.question, 'en')}
        </Text>

        <View style={styles.controlsContainer}>
          <TouchableOpacity
            style={styles.shuffleButton}
            onPress={handleShuffle}
            disabled={isSubmitted}
          >
            <ShuffleIcon size={16} color={theme.colors.primary} />
            <Text style={styles.shuffleButtonText}>Shuffle</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.wordsContainer}>
          {words.map((word, index) => (
            <TouchableOpacity
              key={word.id}
              style={getWordStyle(word)}
              onPress={() => handleWordSelect(word.id)}
              disabled={isSubmitted}
            >
              <Text style={getWordTextStyle(word)}>{word.text}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {selectedWord && (
          <View style={styles.moveControls}>
            <TouchableOpacity
              style={styles.moveButton}
              onPress={() => handleMoveWord('up')}
              disabled={isSubmitted}
            >
              <ArrowUpIcon size={20} color={theme.colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.moveButton}
              onPress={() => handleMoveWord('down')}
              disabled={isSubmitted}
            >
              <ArrowDownIcon size={20} color={theme.colors.primary} />
            </TouchableOpacity>
          </View>
        )}

        {!isSubmitted && (
          <Button
            title="Submit Order"
            onPress={handleSubmit}
            style={styles.submitButton}
          />
        )}
      </Card>

      {renderFeedback()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  exerciseCard: {
    marginBottom: theme.spacing.lg,
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  difficultyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  difficultyText: {
    fontSize: theme.fontSize.sm,
    fontWeight: '500',
    color: theme.colors.gray[600],
  },
  instruction: {
    fontSize: theme.fontSize.md,
    color: theme.colors.gray[600],
    marginBottom: theme.spacing.md,
    lineHeight: 22,
  },
  question: {
    fontSize: theme.fontSize.lg,
    fontWeight: '600',
    color: theme.colors.black,
    marginBottom: theme.spacing.lg,
    lineHeight: 24,
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: theme.spacing.lg,
  },
  shuffleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.gray[100],
    borderRadius: theme.borderRadius.md,
  },
  shuffleButtonText: {
    fontSize: theme.fontSize.sm,
    fontWeight: '500',
    color: theme.colors.primary,
  },
  wordsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  wordButton: {
    backgroundColor: theme.colors.gray[50],
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 2,
    borderColor: theme.colors.gray[200],
  },
  selectedWord: {
    backgroundColor: theme.colors.primaryLight,
    borderColor: theme.colors.primary,
  },
  wordText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.black,
    fontWeight: '500',
  },
  selectedWordText: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
  moveControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  moveButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: theme.colors.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButton: {
    marginTop: theme.spacing.md,
  },
  feedbackContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  feedbackCard: {
    width: '100%',
    maxWidth: 400,
  },
  correctFeedback: {
    borderColor: theme.colors.success,
    borderWidth: 2,
  },
  incorrectFeedback: {
    borderColor: theme.colors.danger,
    borderWidth: 2,
  },
  feedbackHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  feedbackTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: '600',
  },
  correctFeedbackTitle: {
    color: theme.colors.success,
  },
  incorrectFeedbackTitle: {
    color: theme.colors.danger,
  },
  correctAnswerContainer: {
    backgroundColor: theme.colors.gray[50],
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
  },
  correctAnswerLabel: {
    fontSize: theme.fontSize.sm,
    fontWeight: '500',
    color: theme.colors.gray[600],
    marginBottom: theme.spacing.xs,
  },
  correctAnswerText: {
    fontSize: theme.fontSize.md,
    fontWeight: '600',
    color: theme.colors.black,
  },
  feedbackExplanation: {
    fontSize: theme.fontSize.md,
    color: theme.colors.gray[600],
    lineHeight: 22,
    marginBottom: theme.spacing.lg,
  },
  feedbackStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: theme.spacing.lg,
  },
  statItem: {
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  statValue: {
    fontSize: theme.fontSize.lg,
    fontWeight: '600',
    color: theme.colors.black,
  },
  statLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.gray[600],
  },
  continueButton: {
    marginTop: theme.spacing.md,
  },
});
