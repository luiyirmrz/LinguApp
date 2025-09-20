// Greetings Lesson Screen - Interactive Learning Session
// Manages the flow of exercises within a lesson

import React, { useState, useEffect, memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Modal,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
// Lazy loaded: react-native-safe-area-context
// Lazy loaded: expo-linear-gradient
import { 
  X, 
  ArrowLeft, 
  Trophy, 
  Star,
  CheckCircle,
  Target,
} from '@/components/icons/LucideReplacement';

import { useGreetings } from '@/hooks/useGreetings';
import { GreetingExerciseResult } from '@/types/greetings';
import { 
  FlashcardExercise, 
  MultipleChoiceExercise, 
  FillBlankExercise, 
  SpeakingExercise, 
} from './GreetingsExercises';

const { width } = Dimensions.get('window');

interface LessonScreenProps {
  visible: boolean;
  onClose: () => void;
}

function GreetingsLessonScreen({ visible, onClose }: LessonScreenProps) {
  const {
    currentLesson,
    currentExercise,
    exerciseIndex,
    exerciseResults,
    sessionActive,
    submitExerciseResult,
    nextExercise,
    completeLesson,
    getUIText,
  } = useGreetings();

  const [showCompletionModal, setShowCompletionModal] = useState<boolean>(false);
  const [sessionStats, setSessionStats] = useState<{
    accuracy: number;
    xpEarned: number;
    timeSpent: number;
  } | null>(null);

  useEffect(() => {
    if (!sessionActive && exerciseResults.length > 0) {
      // Calculate session statistics
      const totalAccuracy = exerciseResults.reduce((sum, result) => sum + result.accuracy, 0);
      const averageAccuracy = totalAccuracy / exerciseResults.length;
      const totalXP = exerciseResults.reduce((sum, result) => sum + result.xpEarned, 0);
      const timeSpent = exerciseResults.length > 0 
        ? (new Date(exerciseResults[exerciseResults.length - 1].timestamp).getTime() - 
           new Date(exerciseResults[0].timestamp).getTime()) / 1000
        : 0;

      setSessionStats({
        accuracy: averageAccuracy,
        xpEarned: totalXP,
        timeSpent,
      });
      setShowCompletionModal(true);
    }
  }, [sessionActive, exerciseResults]);

  const handleExerciseComplete = async (result: Omit<GreetingExerciseResult, 'timestamp' | 'xpEarned'>) => {
    try {
      await submitExerciseResult(result);
    } catch (error) {
      Alert.alert('Error', 'Failed to submit exercise result');
    }
  };

  const handleNextExercise = () => {
    if (!currentLesson) return;
    
    if (exerciseIndex < currentLesson.exercises.length - 1) {
      nextExercise();
    } else {
      // All exercises completed, finish lesson
      handleCompleteLesson();
    }
  };

  const handleCompleteLesson = async () => {
    try {
      await completeLesson();
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to complete lesson');
    }
  };

  const handleCloseLesson = () => {
    Alert.alert(
      'Exit Lesson',
      'Are you sure you want to exit? Your progress will be saved.',
      [
        { text: 'Continue', style: 'cancel' },
        { text: 'Exit', style: 'destructive', onPress: onClose },
      ],
    );
  };

  const renderExercise = () => {
    if (!currentExercise) return null;

    const exerciseProps = {
      exercise: currentExercise,
      onComplete: handleExerciseComplete,
      onNext: handleNextExercise,
    };

    switch (currentExercise.type) {
      case 'flashcard':
        return <FlashcardExercise {...exerciseProps} />;
      case 'multiple_choice':
      case 'listening':
        return <MultipleChoiceExercise {...exerciseProps} />;
      case 'fill_blank':
        return <FillBlankExercise {...exerciseProps} />;
      case 'pronunciation':
        return <SpeakingExercise {...exerciseProps} />;
      default:
        return (
          <View style={styles.fallbackContainer}>
            <Text style={styles.fallbackText}>
              Exercise type "{currentExercise.type}" not implemented yet
            </Text>
            <TouchableOpacity 
              style={styles.skipButton}
              onPress={handleNextExercise}
            >
              <Text style={styles.skipButtonText}>Skip Exercise</Text>
            </TouchableOpacity>
          </View>
        );
    }
  };

  const getProgressPercentage = (): number => {
    if (!currentLesson) return 0;
    return ((exerciseIndex + 1) / currentLesson.exercises.length) * 100;
  };

  if (!visible) {
    return null;
  }

  // Show loading state while lesson is being prepared
  if (!currentLesson) {
    console.debug('GreetingsLessonScreen: No current lesson, showing loading state');
    return (
      <Modal
        visible={visible}
        animationType={'slide'}
        presentationStyle={'fullScreen'}
      >
        <SafeAreaView style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={handleCloseLesson}
            >
              <X size={24} color={'#333'} />
            </TouchableOpacity>
            <View style={styles.headerCenter}>
              <Text style={styles.lessonTitle}>Loading Lesson</Text>
            </View>
            <View style={styles.headerRight} />
          </View>
          
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Preparing your greetings lesson...</Text>
            <Text style={styles.loadingSubtext}>This will just take a moment</Text>
            
            {/* Audio Test Button */}
            <TouchableOpacity 
              style={styles.audioTestButton}
              onPress={async () => {
                console.debug('Testing Croatian greeting audio...');
                try {
                  // Test Croatian greeting
                  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
                    const utterance = new SpeechSynthesisUtterance('Dobar dan');
                    utterance.lang = 'hr-HR';
                    utterance.rate = 0.8;
                    utterance.volume = 1.0;
                    
                    // Find Croatian voice
                    const voices = speechSynthesis.getVoices();
                    const croatianVoice = voices.find(voice => voice.lang.startsWith('hr')) ||
                                        voices.find(voice => voice.lang.startsWith('en'));
                    
                    if (croatianVoice) {
                      utterance.voice = croatianVoice;
                      console.debug('Using voice:', croatianVoice.name);
                    }
                    
                    speechSynthesis.speak(utterance);
                    console.debug('Croatian greeting audio should be playing: "Dobar dan"');
                  } else {
                    console.debug('Speech synthesis not available');
                  }
                } catch (error) {
                  console.error('Audio test failed:', error);
                }
              }}
            >
              <Text style={styles.audioTestText}>🔊 Test Croatian Audio</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    );
  }

  return (
    <Modal
      visible={visible}
      animationType={'slide'}
      presentationStyle={'fullScreen'}
    >
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={handleCloseLesson}
          >
            <X size={24} color={'#333'} />
          </TouchableOpacity>
          
          <View style={styles.headerCenter}>
            <Text style={styles.lessonTitle}>{currentLesson.title.en}</Text>
            <Text style={styles.exerciseCounter}>
              {exerciseIndex + 1} of {currentLesson.exercises.length}
            </Text>
          </View>
          
          <View style={styles.headerRight}>
            <View style={styles.xpIndicator}>
              <Star size={16} color={'#FFD700'} />
              <Text style={styles.xpText}>
                {exerciseResults.reduce((sum, result) => sum + result.xpEarned, 0)}
              </Text>
            </View>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <LinearGradient
              colors={['#4ECDC4', '#44A08D']}
              style={[
                styles.progressFill,
                { width: `${getProgressPercentage()}%` },
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {Math.round(getProgressPercentage())}% Complete
          </Text>
        </View>

        {/* Exercise Content */}
        <View style={styles.exerciseContent}>
          {renderExercise()}
        </View>

        {/* Completion Modal */}
        <Modal
          visible={showCompletionModal}
          transparent={true}
          animationType={'fade'}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.completionModal}>
              <LinearGradient
                colors={['#667eea', '#764ba2']}
                style={styles.modalHeader}
              >
                <Trophy size={48} color={'white'} />
                <Text style={styles.modalTitle}>Lesson Complete!</Text>
                <Text style={styles.modalSubtitle}>{currentLesson.title.en}</Text>
              </LinearGradient>
              
              <View style={styles.modalContent}>
                <View style={styles.statsGrid}>
                  <View style={styles.statCard}>
                    <Target size={24} color={'#4ECDC4'} />
                    <Text style={styles.statValue}>
                      {sessionStats?.accuracy.toFixed(0) || 0}%
                    </Text>
                    <Text style={styles.statLabel}>Accuracy</Text>
                  </View>
                  
                  <View style={styles.statCard}>
                    <Star size={24} color={'#FFD700'} />
                    <Text style={styles.statValue}>
                      {sessionStats?.xpEarned || 0}
                    </Text>
                    <Text style={styles.statLabel}>XP Earned</Text>
                  </View>
                  
                  <View style={styles.statCard}>
                    <CheckCircle size={24} color={'#6BCF7F'} />
                    <Text style={styles.statValue}>
                      {Math.round((sessionStats?.timeSpent || 0) / 60)}
                    </Text>
                    <Text style={styles.statLabel}>Minutes</Text>
                  </View>
                </View>

                <View style={styles.modalButtons}>
                  <TouchableOpacity 
                    style={styles.continueButton}
                    onPress={() => {
                      setShowCompletionModal(false);
                      onClose();
                    }}
                  >
                    <Text style={styles.continueButtonText}>Continue Learning</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 16,
  },
  lessonTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  exerciseCounter: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  xpIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff8dc',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  xpText: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: '600',
    color: '#b8860b',
  },
  progressContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  exerciseContent: {
    flex: 1,
  },
  fallbackContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  fallbackText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  skipButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
  },
  skipButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  completionModal: {
    backgroundColor: 'white',
    borderRadius: 20,
    overflow: 'hidden',
    width: width - 40,
    maxWidth: 400,
  },
  modalHeader: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 16,
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  modalContent: {
    padding: 24,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 32,
  },
  statCard: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  modalButtons: {
    gap: 12,
  },
  continueButton: {
    backgroundColor: '#4ECDC4',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  continueButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  
  // Loading state styles
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    fontSize: 18,
    color: '#666',
    fontWeight: '500',
    marginBottom: 8,
  },
  loadingSubtext: {
    fontSize: 14,
    color: '#999',
    fontWeight: '400',
  },
  audioTestButton: {
    backgroundColor: '#4ECDC4',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    marginTop: 20,
  },
  audioTestText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});

GreetingsLessonScreen.displayName = 'GreetingsLessonScreen';

export default memo(GreetingsLessonScreen);
