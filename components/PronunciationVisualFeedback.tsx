import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  Easing,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '@/constants/theme';
import { 
  TargetIcon, 
  TrendingUpIcon, 
  StarIcon, 
  AwardIcon,
  CheckIcon,
  XIcon,
  AlertCircleIcon,
  LightbulbIcon,
} from '@/components/icons/LucideReplacement';
import { PronunciationEvaluation } from '@/services/audio/elevenLabsService';

const { width } = Dimensions.get('window');

interface PronunciationVisualFeedbackProps {
  evaluation: PronunciationEvaluation;
  isVisible: boolean;
  onAnimationComplete?: () => void;
}

interface ScoreBarProps {
  label: string;
  score: number;
  icon: React.ReactNode;
  color: string;
  delay: number;
}

interface WordFeedbackProps {
  word: string;
  score: number;
  issues: string[];
  suggestions: string[];
  isCorrect: boolean;
}

export default function PronunciationVisualFeedback({
  evaluation,
  isVisible,
  onAnimationComplete,
}: PronunciationVisualFeedbackProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [showDetails, setShowDetails] = useState(false);

  // Animation values
  const fadeAnimation = useRef(new Animated.Value(0)).current;
  const slideAnimation = useRef(new Animated.Value(50)).current;
  const scaleAnimation = useRef(new Animated.Value(0.8)).current;
  const progressAnimations = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;

  useEffect(() => {
    if (isVisible) {
      startAnimations();
    } else {
      resetAnimations();
    }
  }, [isVisible]);

  const startAnimations = () => {
    // Fade in
    Animated.timing(fadeAnimation, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    // Slide up
    Animated.timing(slideAnimation, {
      toValue: 0,
      duration: 600,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();

    // Scale up
    Animated.spring(scaleAnimation, {
      toValue: 1,
      tension: 100,
      friction: 8,
      useNativeDriver: true,
    }).start();

    // Animate progress bars with delays
    progressAnimations.forEach((anim, index) => {
      Animated.timing(anim, {
        toValue: 1,
        duration: 800,
        delay: index * 200,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }).start();
    });

    // Show details after initial animation
    setTimeout(() => {
      setShowDetails(true);
      onAnimationComplete?.();
    }, 1500);
  };

  const resetAnimations = () => {
    fadeAnimation.setValue(0);
    slideAnimation.setValue(50);
    scaleAnimation.setValue(0.8);
    progressAnimations.forEach(anim => anim.setValue(0));
    setCurrentStep(0);
    setShowDetails(false);
  };

  const getScoreColor = (score: number): string => {
    if (score >= 80) return theme.colors.success;
    if (score >= 60) return theme.colors.warning;
    return theme.colors.danger;
  };

  const getScoreGradient = (score: number): string[] => {
    if (score >= 80) return [theme.colors.success, theme.colors.successLight];
    if (score >= 60) return [theme.colors.warning, theme.colors.warningLight];
    return [theme.colors.danger, theme.colors.dangerLight];
  };

  const getOverallRating = (score: number): { label: string; emoji: string } => {
    if (score >= 90) return { label: 'Excellent', emoji: '🌟' };
    if (score >= 80) return { label: 'Very Good', emoji: '👏' };
    if (score >= 70) return { label: 'Good', emoji: '👍' };
    if (score >= 60) return { label: 'Fair', emoji: '👌' };
    return { label: 'Needs Practice', emoji: '💪' };
  };

  const ScoreBar: React.FC<ScoreBarProps> = ({ label, score, icon, color, delay }) => {
    const progressAnimation = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      if (isVisible) {
        Animated.timing(progressAnimation, {
          toValue: score / 100,
          duration: 1000,
          delay,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: false,
        }).start();
      }
    }, [isVisible, score, delay]);

    return (
      <View style={styles.scoreBarContainer}>
        <View style={styles.scoreBarHeader}>
          <View style={styles.scoreBarIcon}>
            {icon}
          </View>
          <Text style={styles.scoreBarLabel}>{label}</Text>
          <Text style={[styles.scoreBarValue, { color }]}>{score}%</Text>
        </View>
        
        <View style={styles.scoreBarTrack}>
          <Animated.View
            style={[
              styles.scoreBarFill,
              {
                backgroundColor: color,
                width: progressAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%'],
                }),
              },
            ]}
          />
        </View>
      </View>
    );
  };

  const WordFeedback: React.FC<WordFeedbackProps> = ({ 
    word, 
    score, 
    issues, 
    suggestions, 
    isCorrect, 
  }) => {
    const wordAnimation = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      if (showDetails) {
        Animated.spring(wordAnimation, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }).start();
      }
    }, [showDetails]);

    return (
      <Animated.View
        style={[
          styles.wordFeedbackContainer,
          {
            transform: [{
              scale: wordAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: [0.9, 1],
              }),
            }],
            opacity: wordAnimation,
          },
        ]}
      >
        <View style={styles.wordHeader}>
          <Text style={styles.wordText}>{word}</Text>
          <View style={[
            styles.wordScore,
            { backgroundColor: getScoreColor(score) },
          ]}>
            {isCorrect ? (
              <CheckIcon size={16} color={theme.colors.white} />
            ) : (
              <XIcon size={16} color={theme.colors.white} />
            )}
            <Text style={styles.wordScoreText}>{score}%</Text>
          </View>
        </View>

        {issues.length > 0 && (
          <View style={styles.issuesContainer}>
            {issues.map((issue, index) => (
              <View key={index} style={styles.issueItem}>
                <AlertCircleIcon size={14} color={theme.colors.warning} />
                <Text style={styles.issueText}>{issue}</Text>
              </View>
            ))}
          </View>
        )}

        {suggestions.length > 0 && (
          <View style={styles.suggestionsContainer}>
            {suggestions.map((suggestion, index) => (
              <View key={index} style={styles.suggestionItem}>
                <LightbulbIcon size={14} color={theme.colors.info} />
                <Text style={styles.suggestionText}>{suggestion}</Text>
              </View>
            ))}
          </View>
        )}
      </Animated.View>
    );
  };

  if (!isVisible) return null;

  const overallRating = getOverallRating(evaluation.overallScore);
  const scoreColor = getScoreColor(evaluation.overallScore);
  const scoreGradient = getScoreGradient(evaluation.overallScore);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnimation,
          transform: [
            { translateY: slideAnimation },
            { scale: scaleAnimation },
          ],
        },
      ]}
    >
      <LinearGradient
        colors={scoreGradient as any}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.overallScoreContainer}>
          <Text style={styles.overallScoreEmoji}>{overallRating.emoji}</Text>
          <Text style={styles.overallScoreValue}>{evaluation.overallScore}%</Text>
          <Text style={styles.overallScoreLabel}>{overallRating.label}</Text>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        <View style={styles.scoreBreakdown}>
          <Text style={styles.sectionTitle}>Score Breakdown</Text>
          
          <ScoreBar
            label="Accuracy"
            score={evaluation.accuracyScore}
            icon={<TargetIcon size={20} color={theme.colors.primary} />}
            color={theme.colors.primary}
            delay={0}
          />
          
          <ScoreBar
            label="Fluency"
            score={evaluation.fluencyScore}
            icon={<TrendingUpIcon size={20} color={theme.colors.success} />}
            color={theme.colors.success}
            delay={200}
          />
          
          <ScoreBar
            label="Prosody"
            score={evaluation.prosodyScore}
            icon={<StarIcon size={20} color={theme.colors.warning} />}
            color={theme.colors.warning}
            delay={400}
          />
          
          <ScoreBar
            label="Completeness"
            score={evaluation.completenessScore}
            icon={<AwardIcon size={20} color={theme.colors.info} />}
            color={theme.colors.info}
            delay={600}
          />
        </View>

        {showDetails && (
          <View style={styles.detailedFeedback}>
            <Text style={styles.sectionTitle}>Detailed Feedback</Text>
            
            {evaluation.feedback.strengths.length > 0 && (
              <View style={styles.feedbackGroup}>
                <Text style={styles.feedbackGroupTitle}>Strengths</Text>
                {evaluation.feedback.strengths.map((strength, index) => (
                  <View key={index} style={styles.feedbackItem}>
                    <CheckIcon size={16} color={theme.colors.success} />
                    <Text style={styles.feedbackText}>{strength}</Text>
                  </View>
                ))}
              </View>
            )}

            {evaluation.feedback.improvements.length > 0 && (
              <View style={styles.feedbackGroup}>
                <Text style={styles.feedbackGroupTitle}>Areas for Improvement</Text>
                {evaluation.feedback.improvements.map((improvement, index) => (
                  <View key={index} style={styles.feedbackItem}>
                    <AlertCircleIcon size={16} color={theme.colors.warning} />
                    <Text style={styles.feedbackText}>{improvement}</Text>
                  </View>
                ))}
              </View>
            )}

            {evaluation.feedback.specificTips.length > 0 && (
              <View style={styles.feedbackGroup}>
                <Text style={styles.feedbackGroupTitle}>Specific Tips</Text>
                {evaluation.feedback.specificTips.map((tip, index) => (
                  <View key={index} style={styles.feedbackItem}>
                    <LightbulbIcon size={16} color={theme.colors.info} />
                    <Text style={styles.feedbackText}>{tip}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {showDetails && evaluation.detailedAnalysis.words.length > 0 && (
          <View style={styles.wordAnalysis}>
            <Text style={styles.sectionTitle}>Word-by-Word Analysis</Text>
            {evaluation.detailedAnalysis.words.map((wordData, index) => (
              <WordFeedback
                key={index}
                word={wordData.word}
                score={wordData.score}
                issues={wordData.issues}
                suggestions={wordData.suggestions}
                isCorrect={wordData.score >= 70}
              />
            ))}
          </View>
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.xl,
    margin: theme.spacing.lg,
    elevation: 8,
    shadowColor: theme.colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  header: {
    padding: theme.spacing.xl,
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    alignItems: 'center',
  },
  overallScoreContainer: {
    alignItems: 'center',
  },
  overallScoreEmoji: {
    fontSize: 48,
    marginBottom: theme.spacing.sm,
  },
  overallScoreValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: theme.colors.white,
    marginBottom: theme.spacing.xs,
  },
  overallScoreLabel: {
    fontSize: theme.fontSize.lg,
    color: theme.colors.white,
    fontWeight: '600',
  },
  content: {
    padding: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: '600',
    color: theme.colors.black,
    marginBottom: theme.spacing.lg,
  },
  scoreBreakdown: {
    marginBottom: theme.spacing.xl,
  },
  scoreBarContainer: {
    marginBottom: theme.spacing.lg,
  },
  scoreBarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  scoreBarIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.sm,
  },
  scoreBarLabel: {
    fontSize: theme.fontSize.md,
    fontWeight: '500',
    color: theme.colors.black,
    flex: 1,
  },
  scoreBarValue: {
    fontSize: theme.fontSize.md,
    fontWeight: '600',
  },
  scoreBarTrack: {
    height: 8,
    backgroundColor: theme.colors.gray[200],
    borderRadius: 4,
    overflow: 'hidden',
  },
  scoreBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  detailedFeedback: {
    marginBottom: theme.spacing.xl,
  },
  feedbackGroup: {
    marginBottom: theme.spacing.lg,
  },
  feedbackGroupTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: '600',
    color: theme.colors.gray[700],
    marginBottom: theme.spacing.sm,
  },
  feedbackItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.sm,
  },
  feedbackText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.gray[600],
    marginLeft: theme.spacing.sm,
    flex: 1,
    lineHeight: 18,
  },
  wordAnalysis: {
    marginTop: theme.spacing.lg,
  },
  wordFeedbackContainer: {
    backgroundColor: theme.colors.gray[50],
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  wordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  wordText: {
    fontSize: theme.fontSize.md,
    fontWeight: '600',
    color: theme.colors.black,
  },
  wordScore: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  wordScoreText: {
    color: theme.colors.white,
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
    marginLeft: theme.spacing.xs,
  },
  issuesContainer: {
    marginBottom: theme.spacing.sm,
  },
  issueItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.xs,
  },
  issueText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.warning,
    marginLeft: theme.spacing.xs,
    flex: 1,
  },
  suggestionsContainer: {
    marginTop: theme.spacing.sm,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.xs,
  },
  suggestionText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.info,
    marginLeft: theme.spacing.xs,
    flex: 1,
  },
});
