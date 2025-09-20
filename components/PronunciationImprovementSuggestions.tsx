import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '@/constants/theme';
import { useI18n } from '@/hooks/useI18n';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Badge } from '@/components/Badge';
import { 
  LightbulbIcon, 
  TargetIcon, 
  TrendingUpIcon,
  XIcon, 
  StarIcon,
  PlayIcon,
  PauseIcon,
  Volume2Icon,
  BookOpenIcon,
  ClockIcon,
  AwardIcon,
  CheckIcon,
  ArrowRightIcon,
  RotateCcwIcon,
} from '@/components/icons/LucideReplacement';
import { PronunciationEvaluation } from '@/services/audio/elevenLabsService';

const { width } = Dimensions.get('window');

interface PronunciationImprovementSuggestionsProps {
  evaluation: PronunciationEvaluation;
  targetText: string;
  languageCode: string;
  onPracticeAgain?: () => void;
  onNextExercise?: () => void;
  onViewProgress?: () => void;
}

interface SuggestionItem {
  id: string;
  title: string;
  description: string;
  category: 'accuracy' | 'fluency' | 'prosody' | 'completeness';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: number; // in minutes
  exercises: string[];
  tips: string[];
  icon: React.ReactNode;
  color: string;
}

interface PracticeExercise {
  id: string;
  title: string;
  description: string;
  type: 'repeat' | 'slow' | 'rhythm' | 'stress' | 'intonation';
  instructions: string[];
  targetWords: string[];
  audioUrl?: string;
}

export default function PronunciationImprovementSuggestions({
  evaluation,
  targetText,
  languageCode,
  onPracticeAgain,
  onNextExercise,
  onViewProgress,
}: PronunciationImprovementSuggestionsProps) {
  const { t } = useI18n();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSuggestion, setSelectedSuggestion] = useState<SuggestionItem | null>(null);
  const [showExercises, setShowExercises] = useState(false);
  const [currentExercise, setCurrentExercise] = useState<PracticeExercise | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const [animationValue] = useState(new Animated.Value(0));

  const categories = [
    { key: 'all', label: 'All', icon: 'target' },
    { key: 'accuracy', label: 'Accuracy', icon: 'target' },
    { key: 'fluency', label: 'Fluency', icon: 'trending-up' },
    { key: 'prosody', label: 'Prosody', icon: 'star' },
    { key: 'completeness', label: 'Completeness', icon: 'award' },
  ];

  useEffect(() => {
    animateIn();
  }, []);

  const animateIn = () => {
    Animated.timing(animationValue, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  };

  const generateSuggestions = (): SuggestionItem[] => {
    const suggestions: SuggestionItem[] = [];

    // Accuracy suggestions
    if (evaluation.accuracyScore < 80) {
      suggestions.push({
        id: 'accuracy_1',
        title: 'Improve Word Pronunciation',
        description: 'Focus on clear articulation of individual sounds and words',
        category: 'accuracy',
        difficulty: 'beginner',
        estimatedTime: 5,
        exercises: ['Slow repetition', 'Phoneme practice', 'Word isolation'],
        tips: [
          'Speak slowly and clearly',
          'Focus on one word at a time',
          'Listen to native speakers',
          'Practice difficult sounds separately',
        ],
        icon: <TargetIcon size={20} color={theme.colors.primary} />,
        color: theme.colors.primary,
      });
    }

    // Fluency suggestions
    if (evaluation.fluencyScore < 80) {
      suggestions.push({
        id: 'fluency_1',
        title: 'Improve Speaking Rhythm',
        description: 'Work on smooth, natural speech flow and pacing',
        category: 'fluency',
        difficulty: 'intermediate',
        estimatedTime: 8,
        exercises: ['Rhythm practice', 'Pacing exercises', 'Flow drills'],
        tips: [
          'Practice with a metronome',
          'Focus on natural pauses',
          'Avoid rushing through words',
          'Maintain steady pace',
        ],
        icon: <TrendingUpIcon size={20} color={theme.colors.success} />,
        color: theme.colors.success,
      });
    }

    // Prosody suggestions
    if (evaluation.prosodyScore < 80) {
      suggestions.push({
        id: 'prosody_1',
        title: 'Improve Intonation and Stress',
        description: 'Work on natural pitch patterns and word stress',
        category: 'prosody',
        difficulty: 'intermediate',
        estimatedTime: 10,
        exercises: ['Stress patterns', 'Intonation practice', 'Pitch exercises'],
        tips: [
          'Listen to sentence melody',
          'Practice word stress patterns',
          'Use rising and falling tones',
          'Match native speaker rhythm',
        ],
        icon: <StarIcon size={20} color={theme.colors.warning} />,
        color: theme.colors.warning,
      });
    }

    // Completeness suggestions
    if (evaluation.completenessScore < 80) {
      suggestions.push({
        id: 'completeness_1',
        title: 'Complete All Words',
        description: 'Ensure you speak all words in the target phrase',
        category: 'completeness',
        difficulty: 'beginner',
        estimatedTime: 3,
        exercises: ['Word counting', 'Complete phrases', 'Memory practice'],
        tips: [
          'Break down the phrase into words',
          'Practice each word individually',
          'Count words as you speak',
          'Use visual cues',
        ],
        icon: <AwardIcon size={20} color={theme.colors.info} />,
        color: theme.colors.info,
      });
    }

    // General improvement suggestions
    suggestions.push({
      id: 'general_1',
      title: 'Daily Pronunciation Practice',
      description: 'Regular practice with native speaker audio',
      category: 'accuracy',
      difficulty: 'beginner',
      estimatedTime: 15,
      exercises: ['Daily repetition', 'Audio comparison', 'Progress tracking'],
      tips: [
        'Practice 10-15 minutes daily',
        'Record yourself regularly',
        'Compare with native speakers',
        'Track your progress',
      ],
      icon: <BookOpenIcon size={20} color={theme.colors.primary} />,
      color: theme.colors.primary,
    });

    return suggestions;
  };

  const generatePracticeExercises = (suggestion: SuggestionItem): PracticeExercise[] => {
    const exercises: PracticeExercise[] = [];

    switch (suggestion.category) {
      case 'accuracy':
        exercises.push(
          {
            id: 'slow_repeat',
            title: 'Slow Repetition',
            description: 'Repeat the phrase slowly, focusing on each sound',
            type: 'slow',
            instructions: [
              'Listen to the reference audio',
              'Repeat each word slowly',
              'Focus on clear articulation',
              'Gradually increase speed',
            ],
            targetWords: targetText.split(' '),
            audioUrl: 'reference_audio_url',
          },
          {
            id: 'phoneme_practice',
            title: 'Phoneme Practice',
            description: 'Practice individual sounds that are challenging',
            type: 'repeat',
            instructions: [
              'Identify difficult sounds',
              'Practice each sound in isolation',
              'Combine sounds into words',
              'Practice in context',
            ],
            targetWords: targetText.split(' '),
            audioUrl: 'phoneme_audio_url',
          },
        );
        break;

      case 'fluency':
        exercises.push(
          {
            id: 'rhythm_practice',
            title: 'Rhythm Practice',
            description: 'Practice speaking with natural rhythm and flow',
            type: 'rhythm',
            instructions: [
              'Listen to the rhythm pattern',
              'Tap along with the beat',
              'Speak in time with the rhythm',
              'Maintain steady pace',
            ],
            targetWords: targetText.split(' '),
            audioUrl: 'rhythm_audio_url',
          },
        );
        break;

      case 'prosody':
        exercises.push(
          {
            id: 'stress_patterns',
            title: 'Stress Patterns',
            description: 'Practice word stress and sentence intonation',
            type: 'stress',
            instructions: [
              'Identify stressed syllables',
              'Practice word stress patterns',
              'Apply stress in sentences',
              'Use natural intonation',
            ],
            targetWords: targetText.split(' '),
            audioUrl: 'stress_audio_url',
          },
        );
        break;

      case 'completeness':
        exercises.push(
          {
            id: 'word_counting',
            title: 'Word Counting',
            description: 'Practice saying all words in the correct order',
            type: 'repeat',
            instructions: [
              'Count the words in the phrase',
              'Practice each word individually',
              'Combine words in order',
              'Say the complete phrase',
            ],
            targetWords: targetText.split(' '),
            audioUrl: 'complete_audio_url',
          },
        );
        break;
    }

    return exercises;
  };

  const suggestions = generateSuggestions();
  const filteredSuggestions = selectedCategory === 'all' 
    ? suggestions 
    : suggestions.filter(s => s.category === selectedCategory);

  const renderCategoryButton = (category: any) => (
    <TouchableOpacity
      key={category.key}
      style={[
        styles.categoryButton,
        selectedCategory === category.key && styles.categoryButtonActive,
      ]}
      onPress={() => setSelectedCategory(category.key)}
    >
      <Text style={[
        styles.categoryButtonText,
        selectedCategory === category.key && styles.categoryButtonTextActive,
      ]}>
        {category.label}
      </Text>
    </TouchableOpacity>
  );

  const renderSuggestionCard = (suggestion: SuggestionItem) => (
    <Animated.View
      key={suggestion.id}
      style={[
        styles.suggestionCard,
        {
          transform: [{
            scale: animationValue.interpolate({
              inputRange: [0, 1],
              outputRange: [0.9, 1],
            }),
          }],
          opacity: animationValue,
        },
      ]}
    >
      <Card style={styles.suggestionCardContent}>
        <View style={styles.suggestionHeader}>
          <View style={[styles.suggestionIcon, { backgroundColor: suggestion.color }]}>
            {suggestion.icon}
          </View>
          <View style={styles.suggestionInfo}>
            <Text style={styles.suggestionTitle}>{suggestion.title}</Text>
            <Text style={styles.suggestionDescription}>{suggestion.description}</Text>
          </View>
          <Badge
            text={suggestion.difficulty}
            color={suggestion.color}
            size="small"
          />
        </View>

        <View style={styles.suggestionMeta}>
          <View style={styles.metaItem}>
            <ClockIcon size={16} color={theme.colors.gray[600]} />
            <Text style={styles.metaText}>{suggestion.estimatedTime} min</Text>
          </View>
          <View style={styles.metaItem}>
            <BookOpenIcon size={16} color={theme.colors.gray[600]} />
            <Text style={styles.metaText}>{suggestion.exercises.length} exercises</Text>
          </View>
        </View>

        <View style={styles.suggestionTips}>
          <Text style={styles.tipsTitle}>Quick Tips:</Text>
          {suggestion.tips.slice(0, 2).map((tip, index) => (
            <Text key={index} style={styles.tipText}>• {tip}</Text>
          ))}
        </View>

        <Button
          title="Start Practice"
          onPress={() => {
            setSelectedSuggestion(suggestion);
            setShowExercises(true);
          }}
          style={[styles.practiceButton, { backgroundColor: suggestion.color }] as any}
        />
      </Card>
    </Animated.View>
  );

  const renderPracticeExercises = () => {
    if (!selectedSuggestion) return null;

    const exercises = generatePracticeExercises(selectedSuggestion);

    return (
      <View style={styles.exercisesContainer}>
        <View style={styles.exercisesHeader}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setShowExercises(false)}
          >
            <ArrowRightIcon size={20} color={theme.colors.primary} />
            <Text style={styles.backButtonText}>Back to Suggestions</Text>
          </TouchableOpacity>
          <Text style={styles.exercisesTitle}>{selectedSuggestion.title}</Text>
        </View>

        <ScrollView style={styles.exercisesList}>
          {exercises.map((exercise) => (
            <Card key={exercise.id} style={styles.exerciseCard}>
              <View style={styles.exerciseHeader}>
                <Text style={styles.exerciseTitle}>{exercise.title}</Text>
                <TouchableOpacity
                  style={styles.playExerciseButton}
                  onPress={() => setCurrentExercise(exercise)}
                >
                  <PlayIcon size={20} color={theme.colors.primary} />
                </TouchableOpacity>
              </View>
              
              <Text style={styles.exerciseDescription}>{exercise.description}</Text>
              
              <View style={styles.instructionsContainer}>
                <Text style={styles.instructionsTitle}>Instructions:</Text>
                {exercise.instructions.map((instruction, index) => (
                  <View key={index} style={styles.instructionItem}>
                    <Text style={styles.instructionNumber}>{index + 1}.</Text>
                    <Text style={styles.instructionText}>{instruction}</Text>
                  </View>
                ))}
              </View>

              <Button
                title="Start Exercise"
                onPress={() => setCurrentExercise(exercise)}
                style={styles.startExerciseButton}
              />
            </Card>
          ))}
        </ScrollView>
      </View>
    );
  };

  const renderExerciseModal = () => {
    if (!currentExercise) return null;

    return (
      <View style={styles.exerciseModal}>
        <View style={styles.exerciseModalContent}>
          <View style={styles.exerciseModalHeader}>
            <Text style={styles.exerciseModalTitle}>{currentExercise.title}</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setCurrentExercise(null)}
            >
              <XIcon size={24} color={theme.colors.gray[600]} />
            </TouchableOpacity>
          </View>

          <Text style={styles.exerciseModalDescription}>
            {currentExercise.description}
          </Text>

          <View style={styles.targetWordsContainer}>
            <Text style={styles.targetWordsTitle}>Target Words:</Text>
            <View style={styles.targetWordsList}>
              {currentExercise.targetWords.map((word, index) => (
                <Badge
                  key={index}
                  text={word}
                  color={theme.colors.primary}
                  size="small"
                />
              ))}
            </View>
          </View>

          <View style={styles.instructionsContainer}>
            <Text style={styles.instructionsTitle}>Step-by-Step Instructions:</Text>
            {currentExercise.instructions.map((instruction, index) => (
              <View key={index} style={styles.instructionItem}>
                <View style={styles.instructionNumberCircle}>
                  <Text style={styles.instructionNumberText}>{index + 1}</Text>
                </View>
                <Text style={styles.instructionText}>{instruction}</Text>
              </View>
            ))}
          </View>

          <View style={styles.exerciseActions}>
            <Button
              title="Start Practice"
              onPress={() => {
                setCurrentExercise(null);
                onPracticeAgain?.();
              }}
              style={styles.startPracticeButton}
            />
            <Button
              title="Close"
              onPress={() => setCurrentExercise(null)}
              variant="outline"
              style={styles.closeExerciseButton}
            />
          </View>
        </View>
      </View>
    );
  };

  if (showExercises) {
    return renderPracticeExercises();
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Improvement Suggestions</Text>
        <Text style={styles.subtitle}>
          Based on your pronunciation, here are personalized suggestions to help you improve
        </Text>
      </View>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesContainer}
        contentContainerStyle={styles.categoriesContent}
      >
        {categories.map(renderCategoryButton)}
      </ScrollView>

      <ScrollView style={styles.suggestionsList} showsVerticalScrollIndicator={false}>
        {filteredSuggestions.map(renderSuggestionCard)}
      </ScrollView>

      <View style={styles.actionButtons}>
        <Button
          title="Practice Again"
          onPress={onPracticeAgain || (() => {})}
          variant="outline"
          style={styles.practiceAgainButton}
        />
        <Button
          title="Next Exercise"
          onPress={onNextExercise || (() => {})}
          style={styles.nextExerciseButton}
        />
      </View>

      {renderExerciseModal()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.white,
  },
  header: {
    padding: theme.spacing.lg,
    alignItems: 'center',
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
    lineHeight: 20,
  },
  categoriesContainer: {
    marginBottom: theme.spacing.lg,
  },
  categoriesContent: {
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  categoryButton: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.gray[100],
  },
  categoryButtonActive: {
    backgroundColor: theme.colors.primary,
  },
  categoryButtonText: {
    fontSize: theme.fontSize.sm,
    fontWeight: '500',
    color: theme.colors.gray[600],
  },
  categoryButtonTextActive: {
    color: theme.colors.white,
  },
  suggestionsList: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
  },
  suggestionCard: {
    marginBottom: theme.spacing.lg,
  },
  suggestionCardContent: {
    padding: theme.spacing.lg,
  },
  suggestionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.md,
  },
  suggestionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  suggestionInfo: {
    flex: 1,
  },
  suggestionTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: '600',
    color: theme.colors.black,
    marginBottom: theme.spacing.xs,
  },
  suggestionDescription: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.gray[600],
    lineHeight: 18,
  },
  suggestionMeta: {
    flexDirection: 'row',
    gap: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  metaText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.gray[600],
  },
  suggestionTips: {
    marginBottom: theme.spacing.lg,
  },
  tipsTitle: {
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
    color: theme.colors.gray[700],
    marginBottom: theme.spacing.xs,
  },
  tipText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.gray[600],
    marginBottom: theme.spacing.xs,
  },
  practiceButton: {
    marginTop: theme.spacing.sm,
  },
  exercisesContainer: {
    flex: 1,
    backgroundColor: theme.colors.white,
  },
  exercisesHeader: {
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray[200],
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  backButtonText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.primary,
    marginLeft: theme.spacing.xs,
  },
  exercisesTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: 'bold',
    color: theme.colors.black,
  },
  exercisesList: {
    flex: 1,
    padding: theme.spacing.lg,
  },
  exerciseCard: {
    marginBottom: theme.spacing.lg,
    padding: theme.spacing.lg,
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  exerciseTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: '600',
    color: theme.colors.black,
    flex: 1,
  },
  playExerciseButton: {
    padding: theme.spacing.sm,
  },
  exerciseDescription: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.gray[600],
    marginBottom: theme.spacing.md,
    lineHeight: 18,
  },
  instructionsContainer: {
    marginBottom: theme.spacing.lg,
  },
  instructionsTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: '600',
    color: theme.colors.gray[700],
    marginBottom: theme.spacing.sm,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.sm,
  },
  instructionNumber: {
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
    color: theme.colors.primary,
    marginRight: theme.spacing.sm,
    minWidth: 20,
  },
  instructionNumberCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.sm,
  },
  instructionNumberText: {
    fontSize: theme.fontSize.xs,
    fontWeight: '600',
    color: theme.colors.white,
  },
  instructionText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.gray[600],
    flex: 1,
    lineHeight: 18,
  },
  startExerciseButton: {
    marginTop: theme.spacing.sm,
  },
  exerciseModal: {
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
  exerciseModalContent: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    maxHeight: '80%',
    width: '100%',
  },
  exerciseModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  exerciseModalTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: 'bold',
    color: theme.colors.black,
    flex: 1,
  },
  closeButton: {
    padding: theme.spacing.sm,
  },
  exerciseModalDescription: {
    fontSize: theme.fontSize.md,
    color: theme.colors.gray[600],
    marginBottom: theme.spacing.lg,
    lineHeight: 20,
  },
  targetWordsContainer: {
    marginBottom: theme.spacing.lg,
  },
  targetWordsTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: '600',
    color: theme.colors.gray[700],
    marginBottom: theme.spacing.sm,
  },
  targetWordsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  exerciseActions: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginTop: theme.spacing.lg,
  },
  startPracticeButton: {
    flex: 1,
  },
  closeExerciseButton: {
    flex: 1,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    padding: theme.spacing.lg,
  },
  practiceAgainButton: {
    flex: 1,
  },
  nextExerciseButton: {
    flex: 1,
  },
});
