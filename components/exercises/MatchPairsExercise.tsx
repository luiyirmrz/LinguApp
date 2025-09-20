/**
 * Match Pairs Exercise Component
 * Handles matching exercises with drag-and-drop or tap-to-match functionality
 */

import React, { useState, useCallback, useMemo, memo } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  Animated,
} from 'react-native';
import { useAdaptiveTheme } from '@/contexts/AdaptiveThemeContext';
import { theme } from '@/constants/theme';
import { MultilingualExercise, MultilingualContent } from '@/types';

interface MatchPairsExerciseProps {
  exercise: MultilingualExercise;
  userAnswer: string[];
  onAnswerChange: (answer: string[]) => void;
  disabled: boolean;
  getText: (content: MultilingualContent) => string;
  showFeedback?: boolean;
  correctAnswer?: string[];
}

interface MatchPair {
  id: string;
  left: MultilingualContent;
  right: MultilingualContent;
}

export const MatchPairsExercise: React.FC<MatchPairsExerciseProps> = ({
  exercise,
  userAnswer,
  onAnswerChange,
  disabled,
  getText,
  showFeedback = false,
  correctAnswer,
}) => {
  const { theme: adaptiveTheme } = useAdaptiveTheme();
  const [selectedLeft, setSelectedLeft] = useState<number | null>(null);
  const [selectedRight, setSelectedRight] = useState<number | null>(null);
  const [matches, setMatches] = useState<{ left: number; right: number }[]>([]);
  
  // Animation values
  const fadeAnim = useMemo(() => new Animated.Value(1), []);
  const scaleAnim = useMemo(() => new Animated.Value(1), []);

  // Parse exercise data into pairs
  const pairs: MatchPair[] = useMemo(() => {
    // For now, create sample pairs since the exercise structure doesn't have pairs
    // This should be updated when the actual exercise data structure is defined
    return [
      { id: 'pair-1', left: { en: 'Hello', es: 'Hola' }, right: { en: 'Goodbye', es: 'Adiós' } },
      { id: 'pair-2', left: { en: 'Yes', es: 'Sí' }, right: { en: 'No', es: 'No' } },
      { id: 'pair-3', left: { en: 'Thank you', es: 'Gracias' }, right: { en: 'Please', es: 'Por favor' } },
    ];
  }, []);

  // Create left and right items arrays
  const leftItems = useMemo(() => 
    pairs.map((pair, index) => ({
      id: `left-${index}`,
      text: getText(pair.left),
      index,
    })), [pairs, getText]);

  const rightItems = useMemo(() => 
    pairs.map((pair, index) => ({
      id: `right-${index}`,
      text: getText(pair.right),
      index,
    })), [pairs, getText]);

  // Shuffle right items for variety
  const shuffledRightItems = useMemo(() => {
    const shuffled = [...rightItems];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }, [rightItems]);

  const handleLeftItemPress = useCallback((index: number) => {
    if (disabled || matches.some(match => match.left === index)) return;
    
    if (selectedLeft === index) {
      setSelectedLeft(null);
    } else {
      setSelectedLeft(index);
      setSelectedRight(null);
    }
  }, [disabled, matches, selectedLeft]);

  const handleRightItemPress = useCallback((index: number) => {
    if (disabled || matches.some(match => match.right === index)) return;
    
    if (selectedRight === index) {
      setSelectedRight(null);
    } else {
      setSelectedRight(index);
    }
  }, [disabled, matches, selectedRight]);

  const handleMatch = useCallback(() => {
    if (selectedLeft === null || selectedRight === null) return;
    
    const newMatch = { left: selectedLeft, right: selectedRight };
    const newMatches = [...matches, newMatch];
    setMatches(newMatches);
    
    // Update user answer
    const newAnswer = newMatches.map(match => 
      `${leftItems[match.left].text}-${rightItems[match.right].text}`,
    );
    onAnswerChange(newAnswer);
    
    // Reset selections
    setSelectedLeft(null);
    setSelectedRight(null);
    
    // Animate match
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.1,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  }, [selectedLeft, selectedRight, matches, leftItems, rightItems, onAnswerChange, scaleAnim]);

  const getLeftItemStyle = useCallback((index: number) => {
    const isSelected = selectedLeft === index;
    const isMatched = matches.some(match => match.left === index);
    const isCorrect = showFeedback && correctAnswer && 
      matches.some(match => match.left === index && 
        rightItems[match.right].text === correctAnswer[index]);
    
    return [
      styles.leftItem,
      isSelected && styles.selectedItem,
      isMatched && styles.matchedItem,
      isCorrect && styles.correctItem,
      disabled && styles.disabledItem,
    ];
  }, [selectedLeft, matches, showFeedback, correctAnswer, rightItems, disabled]);

  const getRightItemStyle = useCallback((index: number) => {
    const isSelected = selectedRight === index;
    const isMatched = matches.some(match => match.right === index);
    const isCorrect = showFeedback && correctAnswer && 
      matches.some(match => match.right === index && 
        rightItems[index].text === correctAnswer[match.left]);
    
    return [
      styles.rightItem,
      isSelected && styles.selectedItem,
      isMatched && styles.matchedItem,
      isCorrect && styles.correctItem,
      disabled && styles.disabledItem,
    ];
  }, [selectedRight, matches, showFeedback, correctAnswer, rightItems, disabled]);

  const getItemTextStyle = useCallback((index: number, isLeft: boolean) => {
    const isSelected = isLeft ? selectedLeft === index : selectedRight === index;
    const isMatched = isLeft ? 
      matches.some(match => match.left === index) :
      matches.some(match => match.right === index);
    const isCorrect = showFeedback && correctAnswer && 
      matches.some(match => 
        (isLeft ? match.left === index : match.right === index) && 
        rightItems[isLeft ? match.right : index].text === correctAnswer[isLeft ? index : match.left],
      );
    
    return [
      styles.itemText,
      isSelected && styles.selectedItemText,
      isMatched && styles.matchedItemText,
      isCorrect && styles.correctItemText,
    ];
  }, []);

  const isComplete = matches.length === pairs.length;

  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    instruction: {
      fontSize: theme.fontSize.md,
      color: adaptiveTheme.colors.textSecondary,
      textAlign: 'center',
      marginBottom: theme.spacing.lg,
      lineHeight: 22,
    },
    matchContainer: {
      flexDirection: 'row',
      flex: 1,
      gap: theme.spacing.lg,
    },
    column: {
      flex: 1,
    },
    columnTitle: {
      fontSize: theme.fontSize.md,
      fontWeight: '600',
      color: adaptiveTheme.colors.text,
      textAlign: 'center',
      marginBottom: theme.spacing.md,
    },
    item: {
      backgroundColor: adaptiveTheme.colors.surface,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.sm,
      borderWidth: 2,
      borderColor: 'transparent',
      minHeight: 50,
      justifyContent: 'center',
      alignItems: 'center',
    },
    leftItem: {
      backgroundColor: adaptiveTheme.colors.surface,
    },
    rightItem: {
      backgroundColor: adaptiveTheme.colors.surface,
    },
    selectedItem: {
      borderColor: adaptiveTheme.colors.primary,
      backgroundColor: adaptiveTheme.colors.primaryLight,
    },
    matchedItem: {
      borderColor: adaptiveTheme.colors.success,
      backgroundColor: adaptiveTheme.colors.successLight,
    },
    correctItem: {
      borderColor: adaptiveTheme.colors.success,
      backgroundColor: adaptiveTheme.colors.successLight,
    },
    incorrectItem: {
      borderColor: adaptiveTheme.colors.error,
      backgroundColor: adaptiveTheme.colors.errorLight,
    },
    disabledItem: {
      opacity: 0.6,
    },
    itemText: {
      fontSize: theme.fontSize.md,
      color: adaptiveTheme.colors.text,
      textAlign: 'center',
      fontWeight: '500',
    },
    selectedItemText: {
      color: adaptiveTheme.colors.primary,
      fontWeight: '600',
    },
    matchedItemText: {
      color: adaptiveTheme.colors.success,
      fontWeight: '600',
    },
    correctItemText: {
      color: adaptiveTheme.colors.success,
      fontWeight: '600',
    },
    incorrectItemText: {
      color: adaptiveTheme.colors.error,
      fontWeight: '600',
    },
    completionContainer: {
      alignItems: 'center',
      marginTop: theme.spacing.lg,
      padding: theme.spacing.md,
      backgroundColor: adaptiveTheme.colors.successLight,
      borderRadius: theme.borderRadius.md,
    },
    completionText: {
      fontSize: theme.fontSize.lg,
      fontWeight: '600',
      color: adaptiveTheme.colors.success,
    },
    feedbackContainer: {
      alignItems: 'center',
      marginTop: theme.spacing.lg,
      padding: theme.spacing.md,
      backgroundColor: adaptiveTheme.colors.errorLight,
      borderRadius: theme.borderRadius.md,
    },
    feedbackText: {
      fontSize: theme.fontSize.md,
      fontWeight: '600',
      color: adaptiveTheme.colors.error,
      textAlign: 'center',
    },
  });

  return (
    <Animated.View 
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <Text style={styles.instruction}>
        {getText(exercise.instruction) || 'Match the items on the left with their corresponding items on the right.'}
      </Text>
      
      <View style={styles.matchContainer}>
        {/* Left Column */}
        <View style={styles.column}>
          <Text style={styles.columnTitle}>Left</Text>
          <ScrollView showsVerticalScrollIndicator={false}>
            {leftItems.map((item, index) => (
              <Pressable
                key={item.id}
                style={getLeftItemStyle(index)}
                onPress={() => handleLeftItemPress(index)}
                disabled={disabled}
                accessibilityRole="button"
                accessibilityLabel={`Left item: ${item.text}`}
              >
                <Text style={getItemTextStyle(index, true)}>
                  {item.text}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
        
        {/* Right Column */}
        <View style={styles.column}>
          <Text style={styles.columnTitle}>Right</Text>
          <ScrollView showsVerticalScrollIndicator={false}>
            {shuffledRightItems.map((item, index) => (
              <Pressable
                key={item.id}
                style={getRightItemStyle(index)}
                onPress={() => handleRightItemPress(index)}
                disabled={disabled}
                accessibilityRole="button"
                accessibilityLabel={`Right item: ${item.text}`}
              >
                <Text style={getItemTextStyle(index, false)}>
                  {item.text}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      </View>
      
      {/* Match Button */}
      {selectedLeft !== null && selectedRight !== null && (
        <Pressable
          style={[styles.item, { backgroundColor: adaptiveTheme.colors.primary }]}
          onPress={handleMatch}
          disabled={disabled}
          accessibilityRole="button"
          accessibilityLabel="Create match"
        >
          <Text style={[styles.itemText, { color: adaptiveTheme.colors.background }]}>
            Match Selected Items
          </Text>
        </Pressable>
      )}
      
      {isComplete && (
        <View style={styles.completionContainer}>
          <Text style={styles.completionText}>
            🎉 All pairs matched!
          </Text>
        </View>
      )}
      
      {showFeedback && correctAnswer && (
        <View style={styles.feedbackContainer}>
          <Text style={styles.feedbackText}>
            {matches.length === correctAnswer.length ? 
              '✓ All matches are correct!' : 
              'Some matches are incorrect. Try again!'}
          </Text>
        </View>
      )}
    </Animated.View>
  );
};

export default memo(MatchPairsExercise);


MatchPairsExercise.displayName = 'MatchPairsExercise';
