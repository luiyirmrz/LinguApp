import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
  Alert,
  Modal,
} from 'react-native';
import { theme } from '@/constants/theme';
import { useUnifiedAuth } from "@/hooks/useUnifiedAuth";
import { useI18n } from '@/hooks/useI18n';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Badge } from '@/components/Badge';
import { 
  LightbulbIcon,
  TargetIcon,
  ClockIcon,
  BookOpenIcon,
  StarIcon,
  AwardIcon,
  BrainIcon,
  ZapIcon,
  UsersIcon,
  MessageSquareIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  InfoIcon,
  EyeIcon,
  FilterIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  XIcon,
  PlayIcon,
  PauseIcon,
  CalendarIcon,
  BarChart3Icon,
  TrendingUpIcon,
  HeartIcon,
  ThumbsUpIcon,
  ThumbsDownIcon,
  BookmarkIcon,
  ShareIcon,
  DownloadIcon,
} from '@/components/icons/LucideReplacement';
import { analyticsService } from '@/services/analytics/analytics';

const { width } = Dimensions.get('window');

interface PersonalizedRecommendationsProps {
  onNavigateToAnalytics?: () => void;
  onNavigateToLessons?: (lessonId: string) => void;
  onNavigateToExercises?: (exerciseType: string) => void;
}

interface Recommendation {
  id: string;
  type: 'lesson' | 'exercise' | 'goal' | 'habit' | 'resource' | 'social';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  category: 'vocabulary' | 'grammar' | 'speaking' | 'listening' | 'reading' | 'writing' | 'general';
  estimatedTime: number; // minutes
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  confidence: number; // 0-1
  expectedImprovement: number; // percentage
  reasoning: string[];
  prerequisites: string[];
  resources: string[];
  icon: React.ReactNode;
  color: string;
  isCompleted: boolean;
  isBookmarked: boolean;
  isDismissed: boolean;
  createdAt: string;
  expiresAt?: string;
  relatedSkills: string[];
  socialFeatures?: {
    canShare: boolean;
    hasGroup: boolean;
    hasChallenge: boolean;
  };
}

export default function PersonalizedRecommendations({
  onNavigateToAnalytics,
  onNavigateToLessons,
  onNavigateToExercises,
}: PersonalizedRecommendationsProps) {
  const { user, signIn, signOut, signUp, resetPassword, updateUser } = useUnifiedAuth();
  const { t } = useI18n();

  // State management
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'vocabulary' | 'grammar' | 'speaking' | 'listening' | 'reading' | 'writing' | 'general'>('all');
  const [selectedPriority, setSelectedPriority] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [selectedRecommendation, setSelectedRecommendation] = useState<Recommendation | null>(null);
  const [showRecommendationModal, setShowRecommendationModal] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['overview', 'high-priority', 'medium-priority']));

  useEffect(() => {
    loadRecommendations();
  }, [selectedCategory, selectedPriority]);

  const loadRecommendations = async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    try {
      const analyticsData = await analyticsService.getAdvancedAnalytics(user.id, 30);
      
      // Generate mock recommendations based on analytics data
      const mockRecommendations = generateMockRecommendations(analyticsData);
      setRecommendations(mockRecommendations);
    } catch (error) {
      console.error('Error loading recommendations:', error);
      Alert.alert('Error', 'Failed to load personalized recommendations');
    } finally {
      setIsLoading(false);
    }
  };

  const generateMockRecommendations = (analyticsData: any): Recommendation[] => {
    const baseData = {
      totalXP: analyticsData?.daily?.reduce((sum: number, day: any) => sum + day.xpEarned, 0) || 0,
      totalTime: analyticsData?.daily?.reduce((sum: number, day: any) => sum + day.timeSpent, 0) || 0,
      totalWords: analyticsData?.daily?.reduce((sum: number, day: any) => sum + day.newWordsLearned, 0) || 0,
      avgAccuracy: analyticsData?.daily?.reduce((sum: number, day: any) => sum + day.accuracy, 0) / analyticsData?.daily?.length || 0,
      streak: analyticsData?.streakData?.currentStreak || 0,
      performance: analyticsData?.performanceMetrics || {},
    };

    return [
      {
        id: '1',
        type: 'lesson',
        title: 'Advanced Grammar: Conditional Statements',
        description: 'Master complex conditional statements to improve your writing and speaking accuracy',
        priority: 'high',
        category: 'grammar',
        estimatedTime: 25,
        difficulty: 'intermediate',
        confidence: 0.85,
        expectedImprovement: 15,
        reasoning: [
          'Your grammar accuracy is below target level',
          'Conditional statements are commonly used in daily conversation',
          'This will help improve your overall language proficiency',
        ],
        prerequisites: ['Basic grammar knowledge', 'Understanding of verb tenses'],
        resources: ['Grammar exercises', 'Video explanations', 'Practice quizzes'],
        icon: <BookOpenIcon size={24} color={theme.colors.primary} />,
        color: theme.colors.primary,
        isCompleted: false,
        isBookmarked: false,
        isDismissed: false,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        relatedSkills: ['Writing Skills', 'Speaking Accuracy', 'Reading Comprehension'],
        socialFeatures: {
          canShare: true,
          hasGroup: true,
          hasChallenge: true,
        },
      },
      {
        id: '2',
        type: 'exercise',
        title: 'Daily Speaking Practice',
        description: 'Practice speaking for 10 minutes daily to improve fluency and pronunciation',
        priority: 'high',
        category: 'speaking',
        estimatedTime: 10,
        difficulty: 'beginner',
        confidence: 0.92,
        expectedImprovement: 20,
        reasoning: [
          'Your speaking practice frequency is low',
          'Daily practice is essential for fluency development',
          'Short sessions are more sustainable',
        ],
        prerequisites: ['Basic vocabulary', 'Pronunciation guide'],
        resources: ['Speaking exercises', 'Pronunciation guide', 'Voice recording'],
        icon: <MessageSquareIcon size={24} color={theme.colors.success} />,
        color: theme.colors.success,
        isCompleted: false,
        isBookmarked: true,
        isDismissed: false,
        createdAt: new Date().toISOString(),
        relatedSkills: ['Pronunciation', 'Listening Comprehension', 'Vocabulary Building'],
      },
      {
        id: '3',
        type: 'goal',
        title: 'Learn 50 New Words This Week',
        description: 'Expand your vocabulary by learning 50 new words with context and usage examples',
        priority: 'medium',
        category: 'vocabulary',
        estimatedTime: 30,
        difficulty: 'intermediate',
        confidence: 0.78,
        expectedImprovement: 12,
        reasoning: [
          'Your vocabulary growth rate is steady but could be faster',
          'Weekly goals provide clear targets',
          'Contextual learning improves retention',
        ],
        prerequisites: ['Basic reading skills', 'Dictionary access'],
        resources: ['Vocabulary lists', 'Context examples', 'Spaced repetition'],
        icon: <StarIcon size={24} color={theme.colors.warning} />,
        color: theme.colors.warning,
        isCompleted: false,
        isBookmarked: false,
        isDismissed: false,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        relatedSkills: ['Reading Comprehension', 'Writing Skills', 'Speaking Fluency'],
      },
      {
        id: '4',
        type: 'habit',
        title: 'Morning Language Review',
        description: 'Start each day with a 5-minute review of yesterday\'s lessons',
        priority: 'medium',
        category: 'general',
        estimatedTime: 5,
        difficulty: 'beginner',
        confidence: 0.88,
        expectedImprovement: 18,
        reasoning: [
          'Morning reviews improve retention',
          'Short sessions fit into busy schedules',
          'Consistent daily practice builds habits',
        ],
        prerequisites: ['Previous lesson completion', 'Review materials'],
        resources: ['Lesson summaries', 'Quick quizzes', 'Progress tracking'],
        icon: <ClockIcon size={24} color={theme.colors.info} />,
        color: theme.colors.info,
        isCompleted: false,
        isBookmarked: false,
        isDismissed: false,
        createdAt: new Date().toISOString(),
        relatedSkills: ['Memory Retention', 'Consistency', 'Time Management'],
      },
      {
        id: '5',
        type: 'resource',
        title: 'Join Spanish Conversation Group',
        description: 'Connect with other learners and native speakers for practice',
        priority: 'low',
        category: 'speaking',
        estimatedTime: 60,
        difficulty: 'intermediate',
        confidence: 0.75,
        expectedImprovement: 25,
        reasoning: [
          'Social learning increases engagement',
          'Real conversation practice is invaluable',
          'Peer support motivates continued learning',
        ],
        prerequisites: ['Basic conversation skills', 'Group participation'],
        resources: ['Group chat', 'Video calls', 'Discussion topics'],
        icon: <UsersIcon size={24} color={theme.colors.primary} />,
        color: theme.colors.primary,
        isCompleted: false,
        isBookmarked: false,
        isDismissed: false,
        createdAt: new Date().toISOString(),
        relatedSkills: ['Speaking Fluency', 'Listening Comprehension', 'Cultural Understanding'],
        socialFeatures: {
          canShare: true,
          hasGroup: true,
          hasChallenge: false,
        },
      },
      {
        id: '6',
        type: 'exercise',
        title: 'Listening Comprehension Challenge',
        description: 'Complete 3 listening exercises with native speaker audio',
        priority: 'medium',
        category: 'listening',
        estimatedTime: 20,
        difficulty: 'intermediate',
        confidence: 0.82,
        expectedImprovement: 14,
        reasoning: [
          'Your listening skills need improvement',
          'Native speaker audio is essential',
          'Regular practice builds confidence',
        ],
        prerequisites: ['Basic vocabulary', 'Audio equipment'],
        resources: ['Audio files', 'Transcripts', 'Comprehension questions'],
        icon: <EyeIcon size={24} color={theme.colors.success} />,
        color: theme.colors.success,
        isCompleted: false,
        isBookmarked: false,
        isDismissed: false,
        createdAt: new Date().toISOString(),
        relatedSkills: ['Speaking Fluency', 'Pronunciation', 'Vocabulary Building'],
      },
    ];
  };

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await loadRecommendations();
    setIsRefreshing(false);
  }, [selectedCategory, selectedPriority]);

  const handleRecommendationPress = (recommendation: Recommendation) => {
    setSelectedRecommendation(recommendation);
    setShowRecommendationModal(true);
  };

  const handleStartRecommendation = (recommendation: Recommendation) => {
    if (recommendation.type === 'lesson') {
      onNavigateToLessons?.(recommendation.id);
    } else if (recommendation.type === 'exercise') {
      onNavigateToExercises?.(recommendation.category);
    }
    setShowRecommendationModal(false);
  };

  const handleBookmarkRecommendation = (recommendationId: string) => {
    setRecommendations(prev => 
      prev.map(rec => 
        rec.id === recommendationId 
          ? { ...rec, isBookmarked: !rec.isBookmarked }
          : rec,
      ),
    );
  };

  const handleDismissRecommendation = (recommendationId: string) => {
    setRecommendations(prev => 
      prev.map(rec => 
        rec.id === recommendationId 
          ? { ...rec, isDismissed: true }
          : rec,
      ),
    );
  };

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const getFilteredRecommendations = () => {
    let filtered = recommendations.filter(rec => !rec.isDismissed);
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(rec => rec.category === selectedCategory);
    }
    
    if (selectedPriority !== 'all') {
      filtered = filtered.filter(rec => rec.priority === selectedPriority);
    }
    
    return filtered;
  };

  const getRecommendationsByPriority = (priority: string) => {
    return getFilteredRecommendations().filter(rec => rec.priority === priority);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return theme.colors.danger;
      case 'medium': return theme.colors.warning;
      case 'low': return theme.colors.info;
      default: return theme.colors.gray[600];
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return theme.colors.success;
      case 'intermediate': return theme.colors.warning;
      case 'advanced': return theme.colors.danger;
      default: return theme.colors.gray[600];
    }
  };

  const renderCategorySelector = () => (
    <View style={styles.categorySelector}>
      {(['all', 'vocabulary', 'grammar', 'speaking', 'listening', 'reading', 'writing', 'general'] as const).map((category) => (
        <TouchableOpacity
          key={category}
          style={[
            styles.categoryButton,
            selectedCategory === category && styles.activeCategoryButton,
          ]}
          onPress={() => setSelectedCategory(category)}
        >
          <Text style={[
            styles.categoryText,
            selectedCategory === category && styles.activeCategoryText,
          ]}>
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderPrioritySelector = () => (
    <View style={styles.prioritySelector}>
      {(['all', 'high', 'medium', 'low'] as const).map((priority) => (
        <TouchableOpacity
          key={priority}
          style={[
            styles.priorityButton,
            selectedPriority === priority && styles.activePriorityButton,
          ]}
          onPress={() => setSelectedPriority(priority)}
        >
          <Text style={[
            styles.priorityText,
            selectedPriority === priority && styles.activePriorityText,
          ]}>
            {priority.charAt(0).toUpperCase() + priority.slice(1)}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderOverviewSection = () => {
    const filteredRecs = getFilteredRecommendations();
    const highPriority = getRecommendationsByPriority('high');
    const mediumPriority = getRecommendationsByPriority('medium');
    const lowPriority = getRecommendationsByPriority('low');
    const bookmarked = filteredRecs.filter(rec => rec.isBookmarked);

    return (
      <Card style={styles.sectionCard}>
        <TouchableOpacity
          style={styles.sectionHeader}
          onPress={() => toggleSection('overview')}
        >
          <View style={styles.sectionTitleContainer}>
            <LightbulbIcon size={24} color={theme.colors.primary} />
            <Text style={styles.sectionTitle}>Recommendations Overview</Text>
          </View>
          {expandedSections.has('overview') ? 
            <ChevronDownIcon size={20} color={theme.colors.gray[600]} /> :
            <ChevronRightIcon size={20} color={theme.colors.gray[600]} />
          }
        </TouchableOpacity>

        {expandedSections.has('overview') && (
          <View style={styles.sectionContent}>
            <View style={styles.overviewGrid}>
              <View style={styles.overviewItem}>
                <View style={styles.overviewIcon}>
                  <TargetIcon size={24} color={theme.colors.primary} />
                </View>
                <Text style={styles.overviewValue}>{filteredRecs.length}</Text>
                <Text style={styles.overviewLabel}>Total Recommendations</Text>
              </View>

              <View style={styles.overviewItem}>
                <View style={styles.overviewIcon}>
                  <AlertCircleIcon size={24} color={theme.colors.danger} />
                </View>
                <Text style={styles.overviewValue}>{highPriority.length}</Text>
                <Text style={styles.overviewLabel}>High Priority</Text>
              </View>

              <View style={styles.overviewItem}>
                <View style={styles.overviewIcon}>
                  <BookmarkIcon size={24} color={theme.colors.warning} />
                </View>
                <Text style={styles.overviewValue}>{bookmarked.length}</Text>
                <Text style={styles.overviewLabel}>Bookmarked</Text>
              </View>

              <View style={styles.overviewItem}>
                <View style={styles.overviewIcon}>
                  <ClockIcon size={24} color={theme.colors.info} />
                </View>
                <Text style={styles.overviewValue}>
                  {filteredRecs.reduce((sum, rec) => sum + rec.estimatedTime, 0)}m
                </Text>
                <Text style={styles.overviewLabel}>Total Time</Text>
              </View>
            </View>
          </View>
        )}
      </Card>
    );
  };

  const renderRecommendationsSection = (priority: string) => {
    const priorityRecs = getRecommendationsByPriority(priority);
    if (priorityRecs.length === 0) return null;

    return (
      <Card style={styles.sectionCard}>
        <TouchableOpacity
          style={styles.sectionHeader}
          onPress={() => toggleSection(`${priority}-priority`)}
        >
          <View style={styles.sectionTitleContainer}>
            <AlertCircleIcon 
              size={24} 
              color={getPriorityColor(priority)} 
            />
            <Text style={styles.sectionTitle}>
              {priority.charAt(0).toUpperCase() + priority.slice(1)} Priority ({priorityRecs.length})
            </Text>
          </View>
          {expandedSections.has(`${priority}-priority`) ? 
            <ChevronDownIcon size={20} color={theme.colors.gray[600]} /> :
            <ChevronRightIcon size={20} color={theme.colors.gray[600]} />
          }
        </TouchableOpacity>

        {expandedSections.has(`${priority}-priority`) && (
          <View style={styles.sectionContent}>
            {priorityRecs.map((recommendation) => (
              <TouchableOpacity
                key={recommendation.id}
                style={styles.recommendationCard}
                onPress={() => handleRecommendationPress(recommendation)}
              >
                <View style={styles.recommendationHeader}>
                  <View style={styles.recommendationIcon}>
                    {recommendation.icon}
                  </View>
                  <View style={styles.recommendationInfo}>
                    <Text style={styles.recommendationTitle}>{recommendation.title}</Text>
                    <Text style={styles.recommendationDescription}>{recommendation.description}</Text>
                  </View>
                  <View style={styles.recommendationActions}>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => handleBookmarkRecommendation(recommendation.id)}
                    >
                      <BookmarkIcon 
                        size={20} 
                        color={recommendation.isBookmarked ? theme.colors.warning : theme.colors.gray[600]} 
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => handleDismissRecommendation(recommendation.id)}
                    >
                      <XIcon size={20} color={theme.colors.gray[600]} />
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.recommendationMeta}>
                  <Badge 
                    variant={priority === 'high' ? 'filled' : 
                            priority === 'medium' ? 'outlined' : 'subtle'}
                    style={styles.priorityBadge}
                  >
                    {recommendation.priority}
                  </Badge>
                  <Badge 
                    variant={recommendation.difficulty === 'beginner' ? 'filled' : 
                            recommendation.difficulty === 'intermediate' ? 'outlined' : 'subtle'}
                    style={styles.difficultyBadge}
                  >
                    {recommendation.difficulty}
                  </Badge>
                  <Text style={styles.timeText}>{recommendation.estimatedTime}m</Text>
                  <Text style={styles.improvementText}>
                    +{recommendation.expectedImprovement}% improvement
                  </Text>
                </View>

                <View style={styles.recommendationReasoning}>
                  <Text style={styles.reasoningTitle}>Why this helps:</Text>
                  <Text style={styles.reasoningText}>
                    {recommendation.reasoning[0]}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </Card>
    );
  };

  const renderRecommendationModal = () => {
    if (!selectedRecommendation) return null;

    return (
      <Modal
        visible={showRecommendationModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowRecommendationModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{selectedRecommendation.title}</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowRecommendationModal(false)}
            >
              <XIcon size={24} color={theme.colors.gray[600]} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            <Card style={styles.modalCard}>
              <View style={styles.modalIcon}>
                {selectedRecommendation.icon}
              </View>
              <Text style={styles.modalDescription}>{selectedRecommendation.description}</Text>
              
              <View style={styles.modalStats}>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Estimated Time</Text>
                  <Text style={styles.statValue}>{selectedRecommendation.estimatedTime} minutes</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Difficulty</Text>
                  <Text style={[styles.statValue, { color: getDifficultyColor(selectedRecommendation.difficulty) }]}>
                    {selectedRecommendation.difficulty}
                  </Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Expected Improvement</Text>
                  <Text style={styles.statValue}>+{selectedRecommendation.expectedImprovement}%</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Confidence</Text>
                  <Text style={styles.statValue}>{Math.round(selectedRecommendation.confidence * 100)}%</Text>
                </View>
              </View>

              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>Why This Helps</Text>
                {selectedRecommendation.reasoning.map((reason, index) => (
                  <View key={index} style={styles.reasoningItem}>
                    <CheckCircleIcon size={16} color={theme.colors.success} />
                    <Text style={styles.reasoningText}>{reason}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>Prerequisites</Text>
                {selectedRecommendation.prerequisites.map((prereq, index) => (
                  <View key={index} style={styles.prerequisiteItem}>
                    <InfoIcon size={16} color={theme.colors.info} />
                    <Text style={styles.prerequisiteText}>{prereq}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>Resources</Text>
                {selectedRecommendation.resources.map((resource, index) => (
                  <View key={index} style={styles.resourceItem}>
                    <BookOpenIcon size={16} color={theme.colors.primary} />
                    <Text style={styles.resourceText}>{resource}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>Related Skills</Text>
                <View style={styles.relatedSkills}>
                  {selectedRecommendation.relatedSkills.map((skill, index) => (
                    <Badge key={index} variant="subtle" style={styles.relatedSkillBadge}>
                      {skill}
                    </Badge>
                  ))}
                </View>
              </View>
            </Card>
          </ScrollView>

          <View style={styles.modalFooter}>
            <Button
              title="Start Now"
              onPress={() => handleStartRecommendation(selectedRecommendation)}
              style={styles.modalButton}
              icon={<PlayIcon size={16} color={theme.colors.white} />}
            />
            <Button
              title={selectedRecommendation.isBookmarked ? 'Bookmarked' : 'Bookmark'}
              onPress={() => handleBookmarkRecommendation(selectedRecommendation.id)}
              variant="outline"
              style={styles.modalButton}
              icon={<BookmarkIcon size={16} color={theme.colors.primary} />}
            />
          </View>
        </View>
      </Modal>
    );
  };

  if (isLoading && recommendations.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <LightbulbIcon size={48} color={theme.colors.primary} />
        <Text style={styles.loadingText}>Generating recommendations...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Personalized Recommendations</Text>
        <Text style={styles.subtitle}>AI-powered suggestions tailored to your learning needs</Text>
      </View>

      {renderCategorySelector()}
      {renderPrioritySelector()}

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {renderOverviewSection()}
        {renderRecommendationsSection('high')}
        {renderRecommendationsSection('medium')}
        {renderRecommendationsSection('low')}
      </ScrollView>

      {renderRecommendationModal()}
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
    paddingBottom: theme.spacing.md,
  },
  title: {
    fontSize: theme.fontSize.xxl,
    fontWeight: 'bold',
    color: theme.colors.black,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    fontSize: theme.fontSize.md,
    color: theme.colors.gray[600],
  },
  categorySelector: {
    flexDirection: 'row',
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
    backgroundColor: theme.colors.gray[50],
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.xs,
  },
  categoryButton: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
  },
  activeCategoryButton: {
    backgroundColor: theme.colors.white,
    shadowColor: theme.colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  categoryText: {
    fontSize: theme.fontSize.xs,
    fontWeight: '500',
    color: theme.colors.gray[600],
  },
  activeCategoryText: {
    color: theme.colors.primary,
  },
  prioritySelector: {
    flexDirection: 'row',
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    backgroundColor: theme.colors.gray[50],
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.xs,
  },
  priorityButton: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
  },
  activePriorityButton: {
    backgroundColor: theme.colors.white,
    shadowColor: theme.colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  priorityText: {
    fontSize: theme.fontSize.sm,
    fontWeight: '500',
    color: theme.colors.gray[600],
  },
  activePriorityText: {
    color: theme.colors.primary,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
  },
  sectionCard: {
    marginBottom: theme.spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.lg,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: '600',
    color: theme.colors.black,
  },
  sectionContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
  },
  overviewGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
  },
  overviewItem: {
    flex: 1,
    minWidth: (width - theme.spacing.lg * 4) / 2,
    alignItems: 'center',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.gray[50],
    borderRadius: theme.borderRadius.lg,
  },
  overviewIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.sm,
  },
  overviewValue: {
    fontSize: theme.fontSize.xl,
    fontWeight: 'bold',
    color: theme.colors.black,
    marginBottom: theme.spacing.xs,
  },
  overviewLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.gray[600],
  },
  recommendationCard: {
    backgroundColor: theme.colors.gray[50],
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.gray[200],
  },
  recommendationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.md,
  },
  recommendationIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  recommendationInfo: {
    flex: 1,
    marginRight: theme.spacing.md,
  },
  recommendationTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: '600',
    color: theme.colors.black,
    marginBottom: theme.spacing.xs,
  },
  recommendationDescription: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.gray[600],
  },
  recommendationActions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  actionButton: {
    padding: theme.spacing.sm,
  },
  recommendationMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  priorityBadge: {
    // fontSize removed - Badge handles its own text styling
  },
  difficultyBadge: {
    // fontSize removed - Badge handles its own text styling
  },
  timeText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.gray[600],
  },
  improvementText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.success,
    fontWeight: '500',
  },
  recommendationReasoning: {
    backgroundColor: theme.colors.white,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },
  reasoningTitle: {
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
    color: theme.colors.black,
    marginBottom: theme.spacing.xs,
  },
  reasoningText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.gray[600],
  },
  modalContainer: {
    flex: 1,
    backgroundColor: theme.colors.white,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray[200],
  },
  modalTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: '600',
    color: theme.colors.black,
  },
  closeButton: {
    padding: theme.spacing.sm,
  },
  modalContent: {
    flex: 1,
    padding: theme.spacing.lg,
  },
  modalCard: {
    padding: theme.spacing.lg,
  },
  modalIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: theme.colors.gray[50],
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: theme.spacing.lg,
  },
  modalDescription: {
    fontSize: theme.fontSize.md,
    color: theme.colors.gray[600],
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  modalStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  statItem: {
    flex: 1,
    minWidth: (width - theme.spacing.lg * 4) / 2,
    alignItems: 'center',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.gray[50],
    borderRadius: theme.borderRadius.md,
  },
  statLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.gray[600],
    marginBottom: theme.spacing.xs,
  },
  statValue: {
    fontSize: theme.fontSize.lg,
    fontWeight: 'bold',
    color: theme.colors.black,
  },
  modalSection: {
    marginBottom: theme.spacing.lg,
  },
  modalSectionTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: '600',
    color: theme.colors.black,
    marginBottom: theme.spacing.md,
  },
  reasoningItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  prerequisiteItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  prerequisiteText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.gray[600],
    flex: 1,
  },
  resourceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  resourceText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.gray[600],
    flex: 1,
  },
  relatedSkills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  relatedSkillBadge: {
    marginBottom: theme.spacing.sm,
  },
  modalFooter: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    padding: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.gray[200],
  },
  modalButton: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.lg,
  },
  loadingText: {
    fontSize: theme.fontSize.lg,
    color: theme.colors.gray[600],
  },
});
