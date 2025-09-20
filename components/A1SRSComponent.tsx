/**
 * A1 SRS Component - Specialized component for A1 level spaced repetition
 * Integrates with Croatian A1 lessons and provides beginner-friendly interface
 */

import React, { useState, useEffect, useCallback, memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
// Lazy loaded: react-native-safe-area-context
import { 
  BookOpen, 
  Clock, 
  TrendingUp, 
  Target, 
  CheckCircle, 
  AlertCircle,
  Play,
  RotateCcw,
} from '@/components/icons/LucideReplacement';
import { useA1SRS } from '@/hooks/useA1SRS';
import { useUnifiedAuth } from "@/hooks/useUnifiedAuth";
import { A1SRSPerformance } from '@/services/learning/a1SRSConfiguration';
import { croatianA1Vocabulary, croatianA1Grammar } from '@/levels/A1/croatian-a1-lessons';
import { SafeAreaView } from 'react-native-safe-area-context';
// import { lazyLoadLucideIcons } from '@/services/LazyDependencies';

const { width: screenWidth } = Dimensions.get('window');

interface A1SRSComponentProps {
  onStartReview?: () => void;
  onViewProgress?: () => void;
}

const A1SRSComponent: React.FC<A1SRSComponentProps> = ({
  onStartReview,
  onViewProgress,
}) => {
  const { user, signIn, signOut, signUp, resetPassword, updateUser } = useUnifiedAuth();
  const {
    a1Items,
    isLoading,
    currentLesson,
    reviewStats,
    initializeA1SRS,
    createSRSItemsForA1Lesson,
    updateA1SRSItem,
    getA1ReviewRecommendations,
  } = useA1SRS();

  const [isInitializing, setIsInitializing] = useState(false);

  // Initialize A1 SRS when component mounts
  useEffect(() => {
    if (user?.id && user?.currentLanguage?.code === 'hr') {
      initializeA1SRS();
    }
  }, [user?.id, user?.currentLanguage?.code, initializeA1SRS]);

  // Handle starting a review session
  const handleStartReview = useCallback(async () => {
    try {
      setIsInitializing(true);
      
      // Ensure SRS items exist for the current lesson
      await createSRSItemsForA1Lesson('croatian_a1_basics');
      
      // Call the parent callback
      onStartReview?.();
      
      console.debug('Started A1 review session');
    } catch (error) {
      console.error('Error starting A1 review:', error);
      Alert.alert('Error', 'Failed to start review session. Please try again.');
    } finally {
      setIsInitializing(false);
    }
  }, [createSRSItemsForA1Lesson, onStartReview]);

  // Handle viewing progress
  const handleViewProgress = useCallback(() => {
    onViewProgress?.();
  }, [onViewProgress]);

  // Get difficulty color for display
  const getDifficultyColor = (difficulty: number) => {
    if (difficulty <= 1) return '#4CAF50'; // Easy - Green
    if (difficulty <= 2) return '#FF9800'; // Medium - Orange
    if (difficulty <= 3) return '#FF5722'; // Hard - Red
    return '#F44336'; // Very Hard - Dark Red
  };

  // Get difficulty label
  const getDifficultyLabel = (difficulty: number) => {
    if (difficulty <= 1) return 'Easy';
    if (difficulty <= 2) return 'Medium';
    if (difficulty <= 3) return 'Hard';
    return 'Very Hard';
  };

  // Get accuracy color
  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 80) return '#4CAF50';
    if (accuracy >= 60) return '#FF9800';
    return '#F44336';
  };

  if (isLoading || isInitializing) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Setting up A1 review system...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <BookOpen size={24} color="#007AFF" />
            <Text style={styles.headerTitle}>A1 Croatian Review</Text>
          </View>
          <Text style={styles.headerSubtitle}>
            Spaced repetition for beginner Croatian learners
          </Text>
        </View>

        {/* Stats Overview */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <View style={styles.statHeader}>
              <Target size={20} color="#007AFF" />
              <Text style={styles.statTitle}>Total Items</Text>
            </View>
            <Text style={styles.statValue}>{reviewStats.totalA1Items}</Text>
            <Text style={styles.statSubtext}>
              {currentLesson?.vocabulary.length || 0} vocabulary + {currentLesson?.grammar.length || 0} grammar
            </Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statHeader}>
              <Clock size={20} color="#FF9800" />
              <Text style={styles.statTitle}>Due for Review</Text>
            </View>
            <Text style={[styles.statValue, { color: reviewStats.itemsDue > 0 ? '#FF9800' : '#4CAF50' }]}>
              {reviewStats.itemsDue}
            </Text>
            <Text style={styles.statSubtext}>
              {reviewStats.itemsDue === 0 ? 'All caught up!' : 'Items need review'}
            </Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statHeader}>
              <TrendingUp size={20} color={getAccuracyColor(reviewStats.averageAccuracy)} />
              <Text style={styles.statTitle}>Accuracy</Text>
            </View>
            <Text style={[styles.statValue, { color: getAccuracyColor(reviewStats.averageAccuracy) }]}>
              {reviewStats.averageAccuracy.toFixed(1)}%
            </Text>
            <Text style={styles.statSubtext}>
              {reviewStats.averageAccuracy >= 80 ? 'Excellent!' : 
               reviewStats.averageAccuracy >= 60 ? 'Good progress' : 'Keep practicing'}
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.actionButton, styles.primaryButton]}
            onPress={handleStartReview}
            disabled={isInitializing}
          >
            <Play size={20} color="white" />
            <Text style={styles.primaryButtonText}>
              {isInitializing ? 'Setting up...' : 'Start Review'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.secondaryButton]}
            onPress={handleViewProgress}
          >
            <TrendingUp size={20} color="#007AFF" />
            <Text style={styles.secondaryButtonText}>View Progress</Text>
          </TouchableOpacity>
        </View>

        {/* Vocabulary Preview */}
        {currentLesson?.vocabulary && currentLesson.vocabulary.length > 0 && (
          <View style={styles.previewContainer}>
            <Text style={styles.previewTitle}>Vocabulary Preview</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.previewScroll}>
              {currentLesson.vocabulary.slice(0, 10).map((vocab, index) => (
                <View key={vocab.id} style={styles.previewCard}>
                  <View style={styles.previewCardHeader}>
                    <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(vocab.difficulty) }]}>
                      <Text style={styles.difficultyText}>
                        {getDifficultyLabel(vocab.difficulty)}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.previewWord}>{vocab.word}</Text>
                  <Text style={styles.previewTranslation}>{vocab.translation}</Text>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Recommendations */}
        {reviewStats.recommendations.length > 0 && (
          <View style={styles.recommendationsContainer}>
            <Text style={styles.recommendationsTitle}>Recommendations</Text>
            {reviewStats.recommendations.map((recommendation, index) => (
              <View key={index} style={styles.recommendationItem}>
                <AlertCircle size={16} color="#FF9800" />
                <Text style={styles.recommendationText}>{recommendation}</Text>
              </View>
            ))}
          </View>
        )}

        {/* SRS Configuration Info */}
        <View style={styles.configInfoContainer}>
          <Text style={styles.configInfoTitle}>A1 SRS Configuration</Text>
          <View style={styles.configInfoGrid}>
            <View style={styles.configInfoItem}>
              <Text style={styles.configInfoLabel}>Ease Factor</Text>
              <Text style={styles.configInfoValue}>2.5 (default)</Text>
            </View>
            <View style={styles.configInfoItem}>
              <Text style={styles.configInfoLabel}>Initial Interval</Text>
              <Text style={styles.configInfoValue}>1 day</Text>
            </View>
            <View style={styles.configInfoItem}>
              <Text style={styles.configInfoLabel}>Repetitions</Text>
              <Text style={styles.configInfoValue}>0 (start)</Text>
            </View>
            <View style={styles.configInfoItem}>
              <Text style={styles.configInfoLabel}>Algorithm</Text>
              <Text style={styles.configInfoValue}>SM-2 (A1 optimized)</Text>
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
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 12,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    marginLeft: 36,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statTitle: {
    fontSize: 12,
    color: '#666',
    marginLeft: 6,
    fontWeight: '500',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  statSubtext: {
    fontSize: 11,
    color: '#999',
  },
  actionsContainer: {
    padding: 16,
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  primaryButton: {
    backgroundColor: '#007AFF',
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  secondaryButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  previewContainer: {
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
  previewTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  previewScroll: {
    flexDirection: 'row',
  },
  previewCard: {
    width: 120,
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#e1e5e9',
  },
  previewCardHeader: {
    marginBottom: 8,
  },
  difficultyBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  difficultyText: {
    fontSize: 10,
    color: 'white',
    fontWeight: '600',
  },
  previewWord: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  previewTranslation: {
    fontSize: 12,
    color: '#666',
  },
  recommendationsContainer: {
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
  recommendationsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
    gap: 8,
  },
  recommendationText: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  configInfoContainer: {
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
  configInfoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  configInfoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  configInfoItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
  },
  configInfoLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  configInfoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
});

export default memo(A1SRSComponent);


A1SRSComponent.displayName = 'A1SRSComponent';
