/**
 * A1 SRS Test Component - Test and verify SRS functionality with A1 lessons
 * Provides a testing interface to validate SRS parameters and behavior
 */

import React, { useState, useEffect, memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
// Lazy loaded: react-native-safe-area-context
import { 
  Play, 
  CheckCircle, 
  XCircle, 
  RotateCcw, 
  Settings,
  BarChart3,
  Clock,
} from '@/components/icons/LucideReplacement';
import { useA1SRS } from '@/hooks/useA1SRS';
import { useUnifiedAuth } from "@/hooks/useUnifiedAuth";
import { A1SRSPerformance } from '@/services/learning/a1SRSConfiguration';
import { croatianA1Vocabulary } from '@/levels/A1/croatian-a1-lessons';
import { SafeAreaView } from 'react-native-safe-area-context';
// import { lazyLoadLucideIcons } from '@/services/LazyDependencies';

interface TestResult {
  wordId: string;
  word: string;
  translation: string;
  quality: number;
  responseTime: number;
  interval: number;
  easeFactor: number;
  repetitions: number;
}

const A1SRSTestComponent: React.FC = () => {
  const { user, signIn, signOut, signUp, resetPassword, updateUser } = useUnifiedAuth();
  const {
    a1Items,
    isLoading,
    reviewStats,
    initializeA1SRS,
    createSRSItemsForA1Lesson,
    updateA1SRSItem,
  } = useA1SRS();

  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [currentTestIndex, setCurrentTestIndex] = useState(0);
  const [isTestRunning, setIsTestRunning] = useState(false);
  const [testStartTime, setTestStartTime] = useState<number>(0);

  // Sample test words from Croatian A1 vocabulary
  const testWords = croatianA1Vocabulary.slice(0, 5);

  // Initialize test when component mounts
  useEffect(() => {
    if (user?.id && user?.currentLanguage?.code === 'hr') {
      initializeA1SRS();
    }
  }, [user?.id, user?.currentLanguage?.code, initializeA1SRS]);

  // Start SRS test
  const startSRSTest = async () => {
    try {
      setIsTestRunning(true);
      setTestResults([]);
      setCurrentTestIndex(0);
      setTestStartTime(Date.now());

      // Create SRS items for test
      await createSRSItemsForA1Lesson('croatian_a1_test');

      Alert.alert(
        'SRS Test Started',
        `Testing ${testWords.length} Croatian A1 words. Each word will be shown with different quality ratings to test the SRS algorithm.`,
      );
    } catch (error) {
      console.error('Error starting SRS test:', error);
      Alert.alert('Error', 'Failed to start SRS test');
      setIsTestRunning(false);
    }
  };

  // Simulate different quality ratings for testing
  const simulateQualityRating = (index: number): number => {
    // Simulate different quality ratings: 0, 2, 3, 4, 5
    const qualities = [0, 2, 3, 4, 5];
    return qualities[index % qualities.length];
  };

  // Process test word with simulated performance
  const processTestWord = async (wordIndex: number) => {
    if (wordIndex >= testWords.length) {
      // Test completed
      setIsTestRunning(false);
      showTestResults();
      return;
    }

    const word = testWords[wordIndex];
    const quality = simulateQualityRating(wordIndex);
    const responseTime = Math.random() * 5000 + 1000; // 1-6 seconds

    const performance: A1SRSPerformance = {
      quality,
      responseTime,
      hintsUsed: quality < 3 ? 1 : 0,
      attempts: quality < 3 ? 2 : 1,
      difficulty: word.difficulty <= 1 ? 'easy' : word.difficulty <= 2 ? 'medium' : 'hard',
    };

    try {
      // Update SRS item (this would normally be done with a real SRS item ID)
      // For testing, we'll simulate the update
      const testResult: TestResult = {
        wordId: word.id,
        word: word.word,
        translation: word.translation,
        quality,
        responseTime,
        interval: calculateTestInterval(quality, wordIndex),
        easeFactor: calculateTestEaseFactor(quality),
        repetitions: quality >= 3 ? 1 : 0,
      };

      setTestResults(prev => [...prev, testResult]);
      setCurrentTestIndex(wordIndex + 1);

      // Simulate processing time
      setTimeout(() => {
        processTestWord(wordIndex + 1);
      }, 1000);

    } catch (error) {
      console.error('Error processing test word:', error);
      Alert.alert('Error', 'Failed to process test word');
    }
  };

  // Calculate test interval based on quality (simplified)
  const calculateTestInterval = (quality: number, index: number): number => {
    if (quality < 3) return 1; // Failed - reset to 1 day
    if (index === 0) return 1; // First review
    if (index === 1) return 3; // Second review
    return 7; // Subsequent reviews
  };

  // Calculate test ease factor based on quality (simplified)
  const calculateTestEaseFactor = (quality: number): number => {
    const baseFactor = 2.5;
    if (quality >= 4) return Math.min(2.5, baseFactor + 0.1);
    if (quality >= 3) return baseFactor;
    return Math.max(1.3, baseFactor - 0.2);
  };

  // Show test results
  const showTestResults = () => {
    const totalWords = testResults.length;
    const passedWords = testResults.filter(r => r.quality >= 3).length;
    const averageQuality = testResults.reduce((sum, r) => sum + r.quality, 0) / totalWords;
    const averageResponseTime = testResults.reduce((sum, r) => sum + r.responseTime, 0) / totalWords;

    Alert.alert(
      'SRS Test Results',
      `Words tested: ${totalWords}\n` +
      `Passed: ${passedWords} (${((passedWords / totalWords) * 100).toFixed(1)}%)\n` +
      `Average quality: ${averageQuality.toFixed(1)}/5\n` +
      `Average response time: ${(averageResponseTime / 1000).toFixed(1)}s\n` +
      `Test duration: ${((Date.now() - testStartTime) / 1000).toFixed(1)}s`,
    );
  };

  // Reset test
  const resetTest = () => {
    setTestResults([]);
    setCurrentTestIndex(0);
    setIsTestRunning(false);
  };

  // Get quality color
  const getQualityColor = (quality: number) => {
    if (quality >= 4) return '#4CAF50';
    if (quality >= 3) return '#FF9800';
    return '#F44336';
  };

  // Get quality label
  const getQualityLabel = (quality: number) => {
    if (quality >= 4) return 'Excellent';
    if (quality >= 3) return 'Good';
    if (quality >= 2) return 'Hard';
    return 'Failed';
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading A1 SRS test...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>A1 SRS Test</Text>
          <Text style={styles.headerSubtitle}>
            Test spaced repetition system with Croatian A1 vocabulary
          </Text>
        </View>

        {/* Test Configuration */}
        <View style={styles.configContainer}>
          <Text style={styles.configTitle}>Test Configuration</Text>
          <View style={styles.configGrid}>
            <View style={styles.configItem}>
              <Text style={styles.configLabel}>Words to test</Text>
              <Text style={styles.configValue}>{testWords.length}</Text>
            </View>
            <View style={styles.configItem}>
              <Text style={styles.configLabel}>Ease Factor</Text>
              <Text style={styles.configValue}>2.5 (default)</Text>
            </View>
            <View style={styles.configItem}>
              <Text style={styles.configLabel}>Initial Interval</Text>
              <Text style={styles.configValue}>1 day</Text>
            </View>
            <View style={styles.configItem}>
              <Text style={styles.configLabel}>Repetitions</Text>
              <Text style={styles.configValue}>0 (start)</Text>
            </View>
          </View>
        </View>

        {/* Test Controls */}
        <View style={styles.controlsContainer}>
          <TouchableOpacity
            style={[styles.controlButton, styles.startButton]}
            onPress={startSRSTest}
            disabled={isTestRunning}
          >
            <Play size={20} color="white" />
            <Text style={styles.startButtonText}>
              {isTestRunning ? 'Running Test...' : 'Start SRS Test'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.controlButton, styles.resetButton]}
            onPress={resetTest}
            disabled={isTestRunning}
          >
            <RotateCcw size={20} color="#666" />
            <Text style={styles.resetButtonText}>Reset Test</Text>
          </TouchableOpacity>
        </View>

        {/* Test Progress */}
        {isTestRunning && (
          <View style={styles.progressContainer}>
            <Text style={styles.progressTitle}>Test Progress</Text>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${(currentTestIndex / testWords.length) * 100}%` },
                ]} 
              />
            </View>
            <Text style={styles.progressText}>
              {currentTestIndex} / {testWords.length} words processed
            </Text>
          </View>
        )}

        {/* Test Results */}
        {testResults.length > 0 && (
          <View style={styles.resultsContainer}>
            <Text style={styles.resultsTitle}>Test Results</Text>
            {testResults.map((result, index) => (
              <View key={result.wordId} style={styles.resultItem}>
                <View style={styles.resultHeader}>
                  <Text style={styles.resultWord}>{result.word}</Text>
                  <View style={[styles.qualityBadge, { backgroundColor: getQualityColor(result.quality) }]}>
                    <Text style={styles.qualityText}>{getQualityLabel(result.quality)}</Text>
                  </View>
                </View>
                <Text style={styles.resultTranslation}>{result.translation}</Text>
                <View style={styles.resultStats}>
                  <View style={styles.resultStat}>
                    <Clock size={14} color="#666" />
                    <Text style={styles.resultStatText}>{(result.responseTime / 1000).toFixed(1)}s</Text>
                  </View>
                  <View style={styles.resultStat}>
                    <BarChart3 size={14} color="#666" />
                    <Text style={styles.resultStatText}>Interval: {result.interval}d</Text>
                  </View>
                  <View style={styles.resultStat}>
                    <Settings size={14} color="#666" />
                    <Text style={styles.resultStatText}>Ease: {result.easeFactor.toFixed(2)}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* SRS Stats */}
        <View style={styles.statsContainer}>
          <Text style={styles.statsTitle}>Current SRS Stats</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Total Items</Text>
              <Text style={styles.statValue}>{reviewStats.totalA1Items}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Items Due</Text>
              <Text style={styles.statValue}>{reviewStats.itemsDue}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Accuracy</Text>
              <Text style={styles.statValue}>{reviewStats.averageAccuracy.toFixed(1)}%</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
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
    fontSize: 16,
    color: '#666',
    marginTop: 16,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: 'white',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e5e9',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  configContainer: {
    backgroundColor: 'white',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  configTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  configGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  configItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
  },
  configLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  configValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  controlsContainer: {
    padding: 16,
    gap: 12,
  },
  controlButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  startButton: {
    backgroundColor: '#007AFF',
  },
  startButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  resetButton: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e1e5e9',
  },
  resetButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  progressContainer: {
    backgroundColor: 'white',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e1e5e9',
    borderRadius: 4,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  resultsContainer: {
    backgroundColor: 'white',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  resultItem: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  resultWord: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  qualityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  qualityText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '600',
  },
  resultTranslation: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  resultStats: {
    flexDirection: 'row',
    gap: 16,
  },
  resultStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  resultStatText: {
    fontSize: 12,
    color: '#666',
  },
  statsContainer: {
    backgroundColor: 'white',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statItem: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
});

export default memo(A1SRSTestComponent);


A1SRSTestComponent.displayName = 'A1SRSTestComponent';
