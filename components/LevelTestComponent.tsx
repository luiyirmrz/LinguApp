import React, { useState, useEffect, useCallback, memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Award, Clock, CheckCircle, Play } from '@/components/icons/LucideReplacement';
import { LevelTestQuestion, LevelTestResult, CEFRLevel } from '@/types/didactic';
import { LevelTestService } from '@/services/learning/levelTest';
import { useUnifiedAuth } from "@/hooks/useUnifiedAuth";

interface LevelTestProps {
  targetLanguage: string;
  onComplete: (result: LevelTestResult) => void;
  onSkip?: () => void;
}

interface TestAnswer {
  questionId: string;
  userAnswer: string;
  isCorrect: boolean;
  timeSpent: number;
}

const LevelTestComponent: React.FC<LevelTestProps> = ({
  targetLanguage,
  onComplete,
  onSkip,
}) => {
  const { user, signIn, signOut, signUp, resetPassword, updateUser } = useUnifiedAuth();
  
  // Test state
  const [questions, setQuestions] = useState<LevelTestQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<TestAnswer[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [testStartTime, setTestStartTime] = useState<number>(0);
  const [questionStartTime, setQuestionStartTime] = useState<number>(0);
  const [showResult, setShowResult] = useState(false);
  const [testResult, setTestResult] = useState<LevelTestResult | null>(null);
  
  // Initialize test
  useEffect(() => {
    initializeTest();
  }, [targetLanguage]);
  
  // Start question timer when question changes
  useEffect(() => {
    if (questions.length > 0 && currentQuestionIndex < questions.length) {
      setQuestionStartTime(Date.now());
      setSelectedAnswer('');
    }
  }, [currentQuestionIndex, questions]);
  
  const initializeTest = async () => {
    try {
      setIsLoading(true);
      console.debug('Initializing level test for language:', targetLanguage);
      
      const testQuestions = await LevelTestService.generateLevelTest(targetLanguage, 15);
      
      if (testQuestions.length === 0) {
        Alert.alert(
          'Test Unavailable',
          'Level test is not available for this language yet. You can skip and start with beginner level.',
          [
            { text: 'Skip Test', onPress: onSkip },
            { text: 'Try Again', onPress: initializeTest },
          ],
        );
        return;
      }
      
      setQuestions(testQuestions);
      setTestStartTime(Date.now());
      setCurrentQuestionIndex(0);
      setAnswers([]);
      
      console.debug(`Level test initialized with ${testQuestions.length} questions`);
    } catch (error) {
      console.error('Error initializing test:', error);
      Alert.alert(
        'Error',
        'Failed to load the level test. Please try again.',
        [
          { text: 'Retry', onPress: initializeTest },
          { text: 'Skip', onPress: onSkip },
        ],
      );
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleAnswerSelect = useCallback((answer: string) => {
    setSelectedAnswer(answer);
  }, []);
  
  const handleNextQuestion = useCallback(async () => {
    if (!selectedAnswer) {
      Alert.alert('Please select an answer', 'Choose one of the options before continuing.');
      return;
    }
    
    const currentQuestion = questions[currentQuestionIndex];
    const timeSpent = Date.now() - questionStartTime;
    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
    
    // Save answer
    const newAnswer: TestAnswer = {
      questionId: currentQuestion.id,
      userAnswer: selectedAnswer,
      isCorrect,
      timeSpent,
    };
    
    const updatedAnswers = [...answers, newAnswer];
    setAnswers(updatedAnswers);
    
    console.debug(`Question ${currentQuestionIndex + 1}: ${isCorrect ? 'Correct' : 'Incorrect'} (${timeSpent}ms)`);
    
    // Check if test is complete
    if (currentQuestionIndex >= questions.length - 1) {
      await completeTest(updatedAnswers);
    } else {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  }, [selectedAnswer, questions, currentQuestionIndex, answers, questionStartTime]);
  
  const completeTest = async (finalAnswers: TestAnswer[]) => {
    try {
      setIsSubmitting(true);
      console.debug('Completing level test with', finalAnswers.length, 'answers');
      
      // Calculate test result
      const result = LevelTestService.calculateCEFRLevel(finalAnswers);
      
      // Add user ID and test duration
      result.userId = user?.id || 'anonymous';
      result.duration = Math.round((Date.now() - testStartTime) / 1000 / 60); // minutes
      
      // Save result
      if (user?.id) {
        await LevelTestService.saveLevelTestResult(result);
      }
      
      setTestResult(result);
      setShowResult(true);
      
      console.debug('Level test completed. Estimated level:', result.estimatedLevel);
    } catch (error) {
      console.error('Error completing test:', error);
      Alert.alert(
        'Error',
        'Failed to process test results. Please try again.',
        [{ text: 'OK', onPress: () => setIsSubmitting(false) }],
      );
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleCompleteTest = () => {
    if (testResult) {
      onComplete(testResult);
    }
  };
  
  const renderLoadingScreen = () => (
    <SafeAreaView style={styles.container}>
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Preparing your level test...</Text>
        <Text style={styles.loadingSubtext}>
          We're creating a personalized assessment to determine your current level.
        </Text>
      </View>
    </SafeAreaView>
  );
  
  const renderResultScreen = () => {
    if (!testResult) return null;
    
    const getLevelColor = (level: CEFRLevel) => {
      const colors = {
        A1: '#4CAF50', A2: '#8BC34A',
        B1: '#FF9800', B2: '#FF5722',
        C1: '#9C27B0', C2: '#673AB7',
      };
      return colors[level] || '#007AFF';
    };
    
    const getLevelDescription = (level: CEFRLevel) => {
      const descriptions = {
        A1: 'Beginner - You can understand and use familiar everyday expressions',
        A2: 'Elementary - You can communicate in simple and routine tasks',
        B1: 'Intermediate - You can deal with most situations while traveling',
        B2: 'Upper Intermediate - You can interact with native speakers fluently',
        C1: 'Advanced - You can express yourself fluently and spontaneously',
        C2: 'Proficient - You can understand virtually everything with ease',
      };
      return descriptions[level] || 'Language learner';
    };
    
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContent}>
          <View style={styles.resultContainer}>
            {/* Header */}
            <View style={styles.resultHeader}>
              <Award size={48} color={getLevelColor(testResult.estimatedLevel)} />
              <Text style={styles.resultTitle}>Test Complete!</Text>
              <Text style={styles.resultSubtitle}>Here are your results</Text>
            </View>
            
            {/* Main Result */}
            <View style={[styles.levelCard, { borderColor: getLevelColor(testResult.estimatedLevel) }]}>
              <Text style={styles.levelLabel}>Your Level</Text>
              <Text style={[styles.levelText, { color: getLevelColor(testResult.estimatedLevel) }]}>
                {testResult.estimatedLevel}
              </Text>
              <Text style={styles.levelDescription}>
                {getLevelDescription(testResult.estimatedLevel)}
              </Text>
              <View style={styles.confidenceContainer}>
                <Text style={styles.confidenceText}>
                  Confidence: {Math.round(testResult.confidence * 100)}%
                </Text>
              </View>
            </View>
            
            {/* Action Button */}
            <TouchableOpacity
              style={[styles.completeButton, { backgroundColor: getLevelColor(testResult.estimatedLevel) }]}
              onPress={handleCompleteTest}
            >
              <Text style={styles.completeButtonText}>Start Learning at {testResult.recommendedStartingLevel} Level</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  };
  
  const renderTestScreen = () => {
    if (questions.length === 0) return null;
    
    const currentQuestion = questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
    
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progress}%` }]} />
            </View>
            <Text style={styles.progressText}>
              {currentQuestionIndex + 1} of {questions.length}
            </Text>
          </View>
        </View>
        
        <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContent}>
          <View style={styles.questionContainer}>
            {/* Question */}
            <Text style={styles.questionText}>{currentQuestion.question}</Text>
            
            {/* Options */}
            <View style={styles.optionsContainer}>
              {currentQuestion.options.map((option, index) => {
                const isSelected = selectedAnswer === option;
                return (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.optionButton,
                      isSelected && styles.selectedOption,
                    ]}
                    onPress={() => handleAnswerSelect(option)}
                  >
                    <View style={styles.optionContent}>
                      <View style={[
                        styles.optionCircle,
                        isSelected && styles.selectedCircle,
                      ]}>
                        {isSelected && <View style={styles.selectedDot} />}
                      </View>
                      <Text style={[
                        styles.optionText,
                        isSelected && styles.selectedOptionText,
                      ]}>
                        {option}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </ScrollView>
        
        {/* Bottom Actions */}
        <View style={styles.bottomContainer}>
          <TouchableOpacity
            style={[
              styles.nextButton,
              !selectedAnswer && styles.disabledButton,
            ]}
            onPress={handleNextQuestion}
            disabled={!selectedAnswer || isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.nextButtonText}>
                {currentQuestionIndex >= questions.length - 1 ? 'Complete Test' : 'Next Question'}
              </Text>
            )}
          </TouchableOpacity>
          
          {onSkip && (
            <TouchableOpacity style={styles.skipButton} onPress={onSkip}>
              <Text style={styles.skipButtonText}>Skip Test</Text>
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>
    );
  };
  
  if (isLoading) {
    return renderLoadingScreen();
  }
  
  if (showResult) {
    return renderResultScreen();
  }
  
  return renderTestScreen();
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    textAlign: 'center',
  },
  loadingSubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },
  header: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e5e9',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  questionContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  questionText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#333',
    lineHeight: 24,
    marginBottom: 20,
  },
  optionsContainer: {
    gap: 12,
  },
  optionButton: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedOption: {
    backgroundColor: '#e3f2fd',
    borderColor: '#007AFF',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#ccc',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedCircle: {
    borderColor: '#007AFF',
  },
  selectedDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#007AFF',
  },
  optionText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  selectedOptionText: {
    color: '#007AFF',
    fontWeight: '500',
  },
  bottomContainer: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#e1e5e9',
  },
  nextButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  skipButtonText: {
    fontSize: 14,
    color: '#666',
  },
  // Result screen styles
  resultContainer: {
    padding: 20,
  },
  resultHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  resultTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
  },
  resultSubtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  levelCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  levelLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  levelText: {
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  levelDescription: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 16,
  },
  confidenceContainer: {
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  confidenceText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  completeButton: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  completeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});

LevelTestComponent.displayName = 'LevelTestComponent';

export default memo(LevelTestComponent);
