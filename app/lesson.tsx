import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { theme } from '@/constants/theme';
import { useUnifiedAuth } from "@/hooks/useUnifiedAuth";
import { useGameState } from '@/hooks/useGameState';
import useEnhancedGamification from "@/hooks/useEnhancedGamification";
import { X, Heart } from '@/components/icons/LucideReplacement';
import { Button } from '@/components/Button';
import { ProgressBar } from '@/components/ProgressBar';
import { skills } from '@/mocks/skills';

export default function LessonScreen() {
  const { skillId, lessonId } = useLocalSearchParams();
  const router = useRouter();
  const { user, signIn, signOut, signUp, resetPassword, updateUser } = useUnifiedAuth();
  const { completeLesson: completeGameLesson } = useGameState();
  const { awardXP, completeLesson, acceptChallenge, createChallenge, generateDailyChallenges, refreshStats } = useEnhancedGamification();
  
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [hearts, setHearts] = useState(user?.hearts || 5);

  const skill = skills.find(s => s.id === skillId);
  const lesson = skill?.lessons.find(l => l.id === lessonId);
  const currentExercise = lesson?.exercises[currentExerciseIndex];
  const progress = lesson ? (currentExerciseIndex + 1) / lesson.exercises.length : 0;

  if (!skill || !lesson || !currentExercise) {
    return null;
  }

  const handleAnswer = (answer: string) => {
    setSelectedAnswer(answer);
    const correct = answer === currentExercise.correctAnswer;
    setIsCorrect(correct);

    if (!correct) {
      const newHearts = hearts - 1;
      setHearts(newHearts);
      
      if (newHearts === 0) {
        Alert.alert(
          'Out of hearts!',
          'You need to wait or buy more hearts to continue.',
          [{ text: 'OK', onPress: () => router.back() }],
        );
      }
    }
  };

  const handleContinue = async () => {
    if (currentExerciseIndex < lesson.exercises.length - 1) {
      setCurrentExerciseIndex(currentExerciseIndex + 1);
      setSelectedAnswer(null);
      setIsCorrect(null);
    } else {
      // Lesson completed
      const earnedPoints = 10;
      const earnedGems = 5;
      
      await awardXP(earnedPoints, 'lesson_completion');
      await completeLesson();
      
      Alert.alert(
        'Lesson Complete!',
        `You earned ${earnedPoints} XP and ${earnedGems} gems!`,
        [{ text: 'Great!', onPress: () => router.back() }],
      );
    }
  };

  const renderExercise = () => {
    switch (currentExercise.type) {
      case 'multipleChoice':
        return (
          <View style={styles.exerciseContainer}>
            <Text style={styles.question}>{currentExercise.question}</Text>
            <View style={styles.optionsContainer}>
              {currentExercise.options?.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.optionButton,
                    selectedAnswer === option && isCorrect === true && styles.correctOption,
                    selectedAnswer === option && isCorrect === false && styles.incorrectOption,
                  ]}
                  onPress={() => handleAnswer(option)}
                  disabled={selectedAnswer !== null}
                >
                  <Text style={styles.optionText}>{option}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );
      
      case 'translate':
        return (
          <View style={styles.exerciseContainer}>
            <Text style={styles.question}>{currentExercise.question}</Text>
            <View style={styles.optionsContainer}>
              <TouchableOpacity
                style={[
                  styles.optionButton,
                  selectedAnswer && isCorrect === true && styles.correctOption,
                  selectedAnswer && isCorrect === false && styles.incorrectOption,
                ]}
                onPress={() => handleAnswer(currentExercise.correctAnswer as string)}
                disabled={selectedAnswer !== null}
              >
                <Text style={styles.optionText}>
                  {selectedAnswer || 'Tap to answer'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        );
      
      default:
        return (
          <View style={styles.exerciseContainer}>
            <Text style={styles.question}>Exercise type not implemented</Text>
          </View>
        );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <X size={24} color={theme.colors.gray[400]} />
        </TouchableOpacity>
        
        <ProgressBar progress={progress} />
        
        <View style={styles.heartsContainer}>
          <Heart size={20} color={theme.colors.danger} />
          <Text style={styles.heartsText}>{hearts}</Text>
        </View>
      </View>

      <View style={styles.content}>
        {renderExercise()}
      </View>

      <View style={styles.footer}>
        {selectedAnswer && (
          <View style={[
            styles.feedback,
            isCorrect ? styles.correctFeedback : styles.incorrectFeedback,
          ]}>
            <Text style={styles.feedbackText}>
              {isCorrect ? '✓ Correct!' : '✗ Try again!'}
            </Text>
          </View>
        )}
        
        {isCorrect && (
          <Button
            title="Continue"
            onPress={handleContinue}
            size="large"
            style={styles.continueButton}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  heartsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  heartsText: {
    fontSize: theme.fontSize.md,
    fontWeight: '600' as const,
    color: theme.colors.danger,
  },
  content: {
    flex: 1,
    padding: theme.spacing.lg,
  },
  exerciseContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  question: {
    fontSize: theme.fontSize.xl,
    fontWeight: '600' as const,
    color: theme.colors.black,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
  },
  optionsContainer: {
    gap: theme.spacing.md,
  },
  optionButton: {
    backgroundColor: theme.colors.gray[50],
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 2,
    borderColor: theme.colors.gray[100],
  },
  optionText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.black,
    textAlign: 'center',
  },
  correctOption: {
    backgroundColor: '#E8F5E9',
    borderColor: theme.colors.success,
  },
  incorrectOption: {
    backgroundColor: '#FFEBEE',
    borderColor: theme.colors.danger,
  },
  footer: {
    padding: theme.spacing.lg,
  },
  feedback: {
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
  },
  correctFeedback: {
    backgroundColor: '#E8F5E9',
  },
  incorrectFeedback: {
    backgroundColor: '#FFEBEE',
  },
  feedbackText: {
    fontSize: theme.fontSize.md,
    fontWeight: '600' as const,
    textAlign: 'center',
  },
  continueButton: {
    width: '100%',
  },
});
