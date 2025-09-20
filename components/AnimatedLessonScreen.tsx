/**
 * Animated Lesson Screen - Example Implementation
 * Demonstrates micro-interactions in a lesson context
 */

import React, { useState, useEffect, memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useAdaptiveTheme } from '@/contexts/AdaptiveThemeContext';
import { 
  useMicroInteractions,
  LessonCompletionAnimation,
  StreakFireAnimation,
  AnimatedProgressComponent,
  AnimatedCounterComponent,
  MicroInteractionFeedback,
  LoadingOverlay,
} from './MicroInteractionSystem';
import { CulturalBackground } from './CulturalBackground';

interface AnimatedLessonScreenProps {
  lessonId: string;
  title: string;
  content: string;
  onComplete: () => void;
}

export const AnimatedLessonScreen: React.FC<AnimatedLessonScreenProps> = ({
  lessonId,
  title,
  content,
  onComplete,
}) => {
  const { theme, getPrimaryColor, getSecondaryColor, getTextColor } = useAdaptiveTheme();
  const { 
    triggerConfetti, 
    triggerFire, 
    triggerSparkles, 
    triggerSuccess, 
    triggerCelebration,
    triggerError,
    triggerHeart,
    triggerStar,
    showProgress,
    showLoading,
  } = useMicroInteractions();
  
  const [isCompleted, setIsCompleted] = useState(false);
  const [currentProgress, setCurrentProgress] = useState(0);
  const [streakCount, setStreakCount] = useState(5);
  const [isLoading, setIsLoading] = useState(false);
  const [showCompletionAnimation, setShowCompletionAnimation] = useState(false);
  const [feedbackType, setFeedbackType] = useState<'success' | 'error' | 'warning' | 'info' | null>(null);

  // Simulate progress updates
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 500);

    return () => clearInterval(interval);
  }, []);

  const handleComplete = () => {
    setIsCompleted(true);
    setShowCompletionAnimation(true);
    triggerConfetti();
    
    setTimeout(() => {
      onComplete();
    }, 3000);
  };

  const handleSuccess = () => {
    setFeedbackType('success');
    triggerSuccess();
    setTimeout(() => setFeedbackType(null), 2000);
  };

  const handleError = () => {
    setFeedbackType('error');
    triggerError();
    setTimeout(() => setFeedbackType(null), 2000);
  };

  const handleWarning = () => {
    setFeedbackType('warning');
    triggerSparkles();
    setTimeout(() => setFeedbackType(null), 2000);
  };

  const handleInfo = () => {
    setFeedbackType('info');
    triggerHeart();
    setTimeout(() => setFeedbackType(null), 2000);
  };

  const handleStar = () => {
    triggerStar();
  };

  const handleLoading = () => {
    setIsLoading(true);
    showLoading(true);
    
    setTimeout(() => {
      setIsLoading(false);
      showLoading(false);
    }, 3000);
  };

  return (
    <CulturalBackground pattern="medium" opacity={0.1}>
      <ScrollView style={styles.container}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: getPrimaryColor() }]}>
          <Text style={[styles.title, { color: '#FFFFFF' }]}>
            {title}
          </Text>
          <Text style={[styles.subtitle, { color: '#FFFFFF' }]}>
            Animated Lesson Experience
          </Text>
        </View>

        {/* Progress Section */}
        <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: getTextColor() }]}>
            Progress
          </Text>
          <AnimatedProgressComponent
            progress={currentProgress}
            color={getPrimaryColor()}
            backgroundColor={theme.colors.border}
            height={12}
            borderRadius={6}
          />
          <Text style={[styles.progressText, { color: getTextColor() }]}>
            {currentProgress}% Complete
          </Text>
        </View>

        {/* Streak Section */}
        <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: getTextColor() }]}>
            Streak Counter
          </Text>
          <View style={styles.streakContainer}>
            <AnimatedCounterComponent
              value={streakCount}
              prefix="🔥 "
              suffix=" days"
              style={[styles.streakText, { color: getSecondaryColor() }]}
            />
            <StreakFireAnimation
              streakCount={streakCount}
              active={streakCount > 0}
              position="center"
            />
          </View>
        </View>

        {/* Content */}
        <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: getTextColor() }]}>
            Lesson Content
          </Text>
          <Text style={[styles.content, { color: getTextColor() }]}>
            {content}
          </Text>
        </View>

        {/* Animation Controls */}
        <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: getTextColor() }]}>
            Animation Controls
          </Text>
          
          <View style={styles.buttonGrid}>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: getPrimaryColor() }]}
              onPress={handleSuccess}
            >
              <Text style={styles.buttonText}>Success</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.button, { backgroundColor: theme.colors.error }]}
              onPress={handleError}
            >
              <Text style={styles.buttonText}>Error</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.button, { backgroundColor: theme.colors.warning }]}
              onPress={handleWarning}
            >
              <Text style={styles.buttonText}>Warning</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.button, { backgroundColor: getSecondaryColor() }]}
              onPress={handleInfo}
            >
              <Text style={styles.buttonText}>Info</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.button, { backgroundColor: theme.colors.accent }]}
              onPress={handleStar}
            >
              <Text style={styles.buttonText}>Star</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.button, { backgroundColor: theme.colors.purple }]}
              onPress={handleLoading}
            >
              <Text style={styles.buttonText}>Loading</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Complete Button */}
        <TouchableOpacity
          style={[
            styles.completeButton,
            { 
              backgroundColor: isCompleted ? theme.colors.success : getPrimaryColor(),
              borderColor: getSecondaryColor(),
            },
          ]}
          onPress={handleComplete}
          disabled={isCompleted}
        >
          <Text style={styles.completeButtonText}>
            {isCompleted ? '✅ Completed!' : 'Complete Lesson'}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Completion Animation */}
      {showCompletionAnimation && (
        <LessonCompletionAnimation
          onComplete={() => setShowCompletionAnimation(false)}
          showConfetti={true}
          showCelebration={true}
          showSparkles={true}
        />
      )}

      {/* Feedback Animation */}
      {feedbackType && (
        <MicroInteractionFeedback
          type={feedbackType}
          showAnimation={true}
          onComplete={() => setFeedbackType(null)}
        />
      )}

      {/* Loading Overlay */}
      <LoadingOverlay
        visible={isLoading}
        message="Processing..."
        showAnimation={true}
      />
    </CulturalBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.9,
  },
  section: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  progressText: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  streakContainer: {
    alignItems: 'center',
    padding: 20,
  },
  streakText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  content: {
    fontSize: 16,
    lineHeight: 24,
  },
  buttonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  button: {
    flex: 1,
    minWidth: '45%',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  completeButton: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 3.84,
    elevation: 5,
  },
  completeButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default memo(AnimatedLessonScreen);


AnimatedLessonScreen.displayName = 'AnimatedLessonScreen';
