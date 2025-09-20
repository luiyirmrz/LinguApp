import React, { useState, useEffect, useCallback, memo } from 'react';
// SRS Flashcard Component - Phase 1: Word System + SRS
// Interactive flashcard component with spaced repetition integration
// Provides native audio, example sentences, and performance tracking
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Alert,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
// Lazy loaded: react-native-safe-area-context
import { 
  Volume2, 
  RotateCcw, 
  CheckCircle, 
  XCircle, 
  Eye, 
  EyeOff,
  Star,
  Clock,
  TrendingUp,
} from '@/components/icons/LucideReplacement';
import { WordSRS, WordDifficulty } from '@/types/didactic';
import { EnhancedSRSService } from '@/services/learning/enhancedSRS';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';
import ErrorBoundary from './ErrorBoundary';
import { SafeAreaView } from 'react-native-safe-area-context';
import { lazyLoadLucideIcons } from '@/services/optimization/LazyDependencies';

interface SRSFlashcardProps {
  words: WordSRS[];
  onComplete: (results: { wordId: string; isCorrect: boolean; responseTime: number; quality: number }[]) => void;
  onExit?: () => void;
}

const { width: screenWidth } = Dimensions.get('window');

const SRSFlashcardComponent: React.FC<SRSFlashcardProps> = ({
  words,
  onComplete,
  onExit,
}) => {
  const { user, signIn, signOut, signUp, resetPassword, updateUser } = useUnifiedAuth();
  
  // Component state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [results, setResults] = useState<{ wordId: string; isCorrect: boolean; responseTime: number; quality: number }[]>([]);
  const [startTime, setStartTime] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [showExample, setShowExample] = useState(false);
  
  // Animation values
  const flipAnimation = new Animated.Value(0);
  const scaleAnimation = new Animated.Value(1);
  
  // Initialize card
  useEffect(() => {
    if (words.length > 0) {
      setStartTime(Date.now());
      setIsFlipped(false);
      setShowAnswer(false);
      setShowExample(false);
    }
  }, [currentIndex, words]);
  
  // Get current word
  const currentWord = words[currentIndex];
  
  // Handle card flip animation
  const handleFlip = useCallback(() => {
    if (isFlipped) return;
    
    Animated.sequence([
      Animated.timing(flipAnimation, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsFlipped(true);
      setShowAnswer(true);
    });
  }, [isFlipped, flipAnimation]);
  
  // Handle answer selection
  const handleAnswer = useCallback(async (quality: number) => {
    if (!currentWord || !user?.id) return;
    
    const responseTime = Date.now() - startTime;
    const isCorrect = quality >= 3; // Quality 3+ is considered correct
    
    // Add result
    const newResult = {
      wordId: currentWord.id,
      isCorrect,
      responseTime,
      quality,
    };
    
    const updatedResults = [...results, newResult];
    setResults(updatedResults);
    
    // Animate feedback
    Animated.sequence([
      Animated.timing(scaleAnimation, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnimation, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
    
    try {
      setIsLoading(true);
      
      // Process with SRS service
      await EnhancedSRSService.processReviewResult(
        user.id,
        currentWord.id,
        isCorrect,
        responseTime,
        quality,
      );
      
      console.debug(`Processed SRS result for word ${currentWord.word}: quality ${quality}`);
      
      // Move to next card or complete
      if (currentIndex < words.length - 1) {
        setTimeout(() => {
          setCurrentIndex(currentIndex + 1);
          flipAnimation.setValue(0);
          scaleAnimation.setValue(1);
        }, 500);
      } else {
        // Session complete
        setTimeout(() => {
          onComplete(updatedResults);
        }, 500);
      }
    } catch (error) {
      console.error('Error processing SRS result:', error);
      Alert.alert('Error', 'Failed to save progress. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [currentWord, user?.id, startTime, results, currentIndex, words.length, onComplete, flipAnimation, scaleAnimation]);
  
  // Play audio (mock implementation)
  const playAudio = useCallback(() => {
    if (currentWord?.audioUrl) {
      console.debug('Playing audio:', currentWord.audioUrl);
      // In a real app, use expo-av to play audio
      Alert.alert('Audio', `Playing pronunciation for "${currentWord.word}"`);
    }
  }, [currentWord]);
  
  // Get difficulty color
  const getDifficultyColor = (difficulty: WordDifficulty) => {
    const colors = {
      easy: '#4CAF50',
      medium: '#FF9800',
      hard: '#FF5722',
      very_hard: '#F44336',
    };
    return colors[difficulty];
  };
  
  // Get difficulty label
  const getDifficultyLabel = (difficulty: WordDifficulty) => {
    const labels = {
      easy: 'Easy',
      medium: 'Medium',
      hard: 'Hard',
      very_hard: 'Very Hard',
    };
    return labels[difficulty];
  };
  
  if (!currentWord) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No words to review</Text>
          <TouchableOpacity style={styles.exitButton} onPress={onExit}>
            <Text style={styles.exitButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }
  
  const progress = ((currentIndex + 1) / words.length) * 100;
  
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
          <Text style={styles.progressText}>
            {currentIndex + 1} / {words.length}
          </Text>
        </View>
        
        {onExit && (
          <TouchableOpacity style={styles.exitButton} onPress={onExit}>
            <Text style={styles.exitButtonText}>Exit</Text>
          </TouchableOpacity>
        )}
      </View>
      
      {/* Card Container */}
      <View style={styles.cardContainer}>
        <Animated.View 
          style={[
            styles.card,
            {
              transform: [
                { scale: scaleAnimation },
                {
                  rotateY: flipAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '180deg'],
                  }),
                },
              ],
            },
          ]}
        >
          {/* Card Front */}
          {!isFlipped && (
            <View style={styles.cardFront}>
              {/* Difficulty Badge */}
              <View style={styles.cardHeader}>
                <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(currentWord.difficulty) }]}>
                  <Text style={styles.difficultyText}>
                    {getDifficultyLabel(currentWord.difficulty)}
                  </Text>
                </View>
                
                <View style={styles.levelBadge}>
                  <Text style={styles.levelText}>{currentWord.cefrLevel}</Text>
                </View>
              </View>
              
              {/* Word */}
              <View style={styles.wordContainer}>
                <Text style={styles.word}>{currentWord.word}</Text>
                
                {/* Phonetic */}
                {currentWord.phonetic && (
                  <Text style={styles.phonetic}>/{currentWord.phonetic}/</Text>
                )}
                
                {/* Audio Button */}
                {currentWord.audioUrl && (
                  <TouchableOpacity style={styles.audioButton} onPress={playAudio}>
                    <Volume2 size={24} color="#007AFF" />
                    <Text style={styles.audioText}>Listen</Text>
                  </TouchableOpacity>
                )}
              </View>
              
              {/* Category */}
              <View style={styles.categoryContainer}>
                <Text style={styles.categoryText}>{currentWord.category}</Text>
              </View>
              
              {/* Flip Instruction */}
              <TouchableOpacity style={styles.flipButton} onPress={handleFlip}>
                <Eye size={20} color="#666" />
                <Text style={styles.flipText}>Tap to reveal translation</Text>
              </TouchableOpacity>
            </View>
          )}
          
          {/* Card Back */}
          {isFlipped && showAnswer && (
            <Animated.View 
              style={[
                styles.cardBack,
                {
                  transform: [{ rotateY: '180deg' }],
                },
              ]}
            >
              {/* Translation */}
              <View style={styles.translationContainer}>
                <Text style={styles.translation}>{currentWord.translation}</Text>
              </View>
              
              {/* Example Sentence */}
              <View style={styles.exampleContainer}>
                <TouchableOpacity 
                  style={styles.exampleToggle}
                  onPress={() => setShowExample(!showExample)}
                >
                  {showExample ? <EyeOff size={16} color="#666" /> : <Eye size={16} color="#666" />}
                  <Text style={styles.exampleToggleText}>
                    {showExample ? 'Hide' : 'Show'} Example
                  </Text>
                </TouchableOpacity>
                
                {showExample && (
                  <View style={styles.exampleContent}>
                    <Text style={styles.exampleSentence}>{currentWord.exampleSentence}</Text>
                    <Text style={styles.exampleTranslation}>{currentWord.exampleTranslation}</Text>
                  </View>
                )}
              </View>
              
              {/* Performance Stats */}
              <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                  <CheckCircle size={16} color="#4CAF50" />
                  <Text style={styles.statText}>{currentWord.correctCount}</Text>
                </View>
                <View style={styles.statItem}>
                  <XCircle size={16} color="#F44336" />
                  <Text style={styles.statText}>{currentWord.incorrectCount}</Text>
                </View>
                <View style={styles.statItem}>
                  <RotateCcw size={16} color="#666" />
                  <Text style={styles.statText}>{currentWord.repetitions}</Text>
                </View>
              </View>
              
              {/* Quality Buttons */}
              <View style={styles.qualityContainer}>
                <Text style={styles.qualityTitle}>How well did you know this word?</Text>
                
                <View style={styles.qualityButtons}>
                  <TouchableOpacity
                    style={[styles.qualityButton, styles.qualityAgain]}
                    onPress={() => handleAnswer(0)}
                    disabled={isLoading}
                  >
                    <Text style={styles.qualityButtonText}>Again</Text>
                    <Text style={styles.qualitySubtext}>Didn't know</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[styles.qualityButton, styles.qualityHard]}
                    onPress={() => handleAnswer(2)}
                    disabled={isLoading}
                  >
                    <Text style={styles.qualityButtonText}>Hard</Text>
                    <Text style={styles.qualitySubtext}>Struggled</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[styles.qualityButton, styles.qualityGood]}
                    onPress={() => handleAnswer(3)}
                    disabled={isLoading}
                  >
                    <Text style={styles.qualityButtonText}>Good</Text>
                    <Text style={styles.qualitySubtext}>Knew it</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[styles.qualityButton, styles.qualityEasy]}
                    onPress={() => handleAnswer(5)}
                    disabled={isLoading}
                  >
                    <Text style={styles.qualityButtonText}>Easy</Text>
                    <Text style={styles.qualitySubtext}>Too easy</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Animated.View>
          )}
          
          {/* Loading Overlay */}
          {isLoading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color="#007AFF" />
            </View>
          )}
        </Animated.View>
      </View>
      
      {/* Instructions */}
      {!isFlipped && (
        <View style={styles.instructionsContainer}>
          <Text style={styles.instructionsText}>
            Study the word, then tap to see the translation
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
};

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
    borderBottomColor: '#e1e5e9',
  },
  progressContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#e1e5e9',
    borderRadius: 4,
    marginRight: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  exitButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  exitButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  cardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  card: {
    width: screenWidth - 40,
    height: 400,
    backgroundColor: 'white',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  cardFront: {
    flex: 1,
    padding: 24,
    justifyContent: 'space-between',
  },
  cardBack: {
    flex: 1,
    padding: 24,
    justifyContent: 'space-between',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  difficultyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  },
  levelBadge: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  levelText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  wordContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  word: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  phonetic: {
    fontSize: 16,
    color: '#666',
    fontStyle: 'italic',
    marginBottom: 16,
  },
  audioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f8ff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 24,
    marginTop: 16,
  },
  audioText: {
    fontSize: 14,
    color: '#007AFF',
    marginLeft: 8,
    fontWeight: '500',
  },
  categoryContainer: {
    alignItems: 'center',
  },
  categoryText: {
    fontSize: 14,
    color: '#666',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    textTransform: 'capitalize',
  },
  flipButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f9fa',
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 16,
  },
  flipText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  translationContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  translation: {
    fontSize: 28,
    fontWeight: '600',
    color: '#007AFF',
    textAlign: 'center',
  },
  exampleContainer: {
    marginBottom: 20,
  },
  exampleToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  exampleToggleText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 6,
  },
  exampleContent: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  exampleSentence: {
    fontSize: 16,
    color: '#333',
    fontStyle: 'italic',
    marginBottom: 8,
    textAlign: 'center',
  },
  exampleTranslation: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginBottom: 20,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  qualityContainer: {
    alignItems: 'center',
  },
  qualityTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  qualityButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  qualityButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  qualityAgain: {
    backgroundColor: '#ffebee',
  },
  qualityHard: {
    backgroundColor: '#fff3e0',
  },
  qualityGood: {
    backgroundColor: '#e8f5e8',
  },
  qualityEasy: {
    backgroundColor: '#e3f2fd',
  },
  qualityButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  qualitySubtext: {
    fontSize: 10,
    color: '#666',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  instructionsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    alignItems: 'center',
  },
  instructionsText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 20,
  },
});

// Export with error boundary wrapper
export const SRSFlashcardComponentWithErrorBoundary: React.FC<SRSFlashcardProps> = (props) => {
  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        console.error('SRSFlashcardComponent error:', error, errorInfo);
      }}
    >
      <SRSFlashcardComponent {...props} />
    </ErrorBoundary>
  );
};

export default memo(SRSFlashcardComponent);

SRSFlashcardComponent.displayName = 'SRSFlashcardComponent';
