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
  TrendingUpIcon,
  TrendingDownIcon,
  TargetIcon,
  ClockIcon,
  BookOpenIcon,
  StarIcon,
  AwardIcon,
  BrainIcon,
  ZapIcon,
  CalendarIcon,
  BarChart3Icon,
  PieChartIcon,
  ActivityIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  InfoIcon,
  EyeIcon,
  FilterIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  XIcon,
  LightbulbIcon,
  TargetIcon as TargetIcon2,
  UsersIcon,
  MessageSquareIcon,
} from '@/components/icons/LucideReplacement';
import { analyticsService } from '@/services/analytics/analytics';

const { width } = Dimensions.get('window');

interface PerformancePredictionsProps {
  onNavigateToAnalytics?: () => void;
  onNavigateToReports?: () => void;
}

interface Prediction {
  id: string;
  type: 'proficiency' | 'retention' | 'engagement' | 'completion' | 'streak' | 'vocabulary';
  title: string;
  description: string;
  currentValue: number;
  predictedValue: number;
  confidence: number;
  timeframe: number; // days
  factors: string[];
  recommendations: string[];
  riskLevel: 'low' | 'medium' | 'high';
  trend: 'improving' | 'declining' | 'stable';
  icon: React.ReactNode;
  color: string;
}

export default function PerformancePredictions({
  onNavigateToAnalytics,
  onNavigateToReports,
}: PerformancePredictionsProps) {
  const { user, signIn, signOut, signUp, resetPassword, updateUser } = useUnifiedAuth();
  const { t } = useI18n();

  // State management
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [selectedPrediction, setSelectedPrediction] = useState<Prediction | null>(null);
  const [showPredictionModal, setShowPredictionModal] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['overview', 'predictions']));

  useEffect(() => {
    loadPredictions();
  }, [selectedTimeframe]);

  const loadPredictions = async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    try {
      const days = selectedTimeframe === '7d' ? 7 : selectedTimeframe === '30d' ? 30 : selectedTimeframe === '90d' ? 90 : 365;
      const analyticsData = await analyticsService.getAdvancedAnalytics(user.id, days);
      
      // Generate mock predictions based on analytics data
      const mockPredictions = generateMockPredictions(analyticsData);
      setPredictions(mockPredictions);
    } catch (error) {
      console.error('Error loading predictions:', error);
      Alert.alert('Error', 'Failed to load performance predictions');
    } finally {
      setIsLoading(false);
    }
  };

  const generateMockPredictions = (analyticsData: any): Prediction[] => {
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
        type: 'proficiency',
        title: 'Language Proficiency',
        description: 'Predicted CEFR level progression',
        currentValue: 65,
        predictedValue: 78,
        confidence: 0.85,
        timeframe: 30,
        factors: ['consistent practice', 'high accuracy', 'vocabulary growth', 'grammar mastery'],
        recommendations: ['Continue daily practice', 'Focus on speaking exercises', 'Review grammar concepts'],
        riskLevel: 'low',
        trend: 'improving',
        icon: <TargetIcon size={24} color={theme.colors.success} />,
        color: theme.colors.success,
      },
      {
        id: '2',
        type: 'retention',
        title: 'Knowledge Retention',
        description: 'Long-term memory retention rate',
        currentValue: 72,
        predictedValue: 88,
        confidence: 0.78,
        timeframe: 14,
        factors: ['spaced repetition', 'active recall', 'contextual learning', 'regular review'],
        recommendations: ['Use spaced repetition', 'Practice with context', 'Review old lessons'],
        riskLevel: 'low',
        trend: 'improving',
        icon: <BrainIcon size={24} color={theme.colors.info} />,
        color: theme.colors.info,
      },
      {
        id: '3',
        type: 'engagement',
        title: 'Learning Engagement',
        description: 'Motivation and engagement levels',
        currentValue: 68,
        predictedValue: 82,
        confidence: 0.72,
        timeframe: 21,
        factors: ['streak maintenance', 'achievement progress', 'social interaction', 'goal completion'],
        recommendations: ['Join study groups', 'Set daily goals', 'Celebrate achievements'],
        riskLevel: 'medium',
        trend: 'improving',
        icon: <ZapIcon size={24} color={theme.colors.warning} />,
        color: theme.colors.warning,
      },
      {
        id: '4',
        type: 'completion',
        title: 'Course Completion',
        description: 'Likelihood of completing current course',
        currentValue: 45,
        predictedValue: 67,
        confidence: 0.69,
        timeframe: 60,
        factors: ['current progress', 'consistency', 'difficulty level', 'time availability'],
        recommendations: ['Maintain regular schedule', 'Break down large goals', 'Seek help when needed'],
        riskLevel: 'medium',
        trend: 'improving',
        icon: <AwardIcon size={24} color={theme.colors.primary} />,
        color: theme.colors.primary,
      },
      {
        id: '5',
        type: 'streak',
        title: 'Streak Maintenance',
        description: 'Probability of maintaining current streak',
        currentValue: baseData.streak,
        predictedValue: baseData.streak + 15,
        confidence: 0.81,
        timeframe: 15,
        factors: ['current streak length', 'past consistency', 'motivation level', 'external factors'],
        recommendations: ['Set daily reminders', 'Plan study sessions', 'Use streak freeze if needed'],
        riskLevel: 'low',
        trend: 'stable',
        icon: <CalendarIcon size={24} color={theme.colors.danger} />,
        color: theme.colors.danger,
      },
      {
        id: '6',
        type: 'vocabulary',
        title: 'Vocabulary Growth',
        description: 'Predicted vocabulary expansion rate',
        currentValue: baseData.totalWords,
        predictedValue: baseData.totalWords + 150,
        confidence: 0.76,
        timeframe: 30,
        factors: ['current learning rate', 'review frequency', 'context usage', 'memory techniques'],
        recommendations: ['Use flashcards', 'Practice in context', 'Review regularly'],
        riskLevel: 'low',
        trend: 'improving',
        icon: <BookOpenIcon size={24} color={theme.colors.success} />,
        color: theme.colors.success,
      },
    ];
  };

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await loadPredictions();
    setIsRefreshing(false);
  }, [selectedTimeframe]);

  const handlePredictionPress = (prediction: Prediction) => {
    setSelectedPrediction(prediction);
    setShowPredictionModal(true);
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

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low': return theme.colors.success;
      case 'medium': return theme.colors.warning;
      case 'high': return theme.colors.danger;
      default: return theme.colors.gray[600];
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving':
        return <TrendingUpIcon size={16} color={theme.colors.success} />;
      case 'declining':
        return <TrendingDownIcon size={16} color={theme.colors.danger} />;
      case 'stable':
        return <ActivityIcon size={16} color={theme.colors.gray[600]} />;
      default:
        return <ActivityIcon size={16} color={theme.colors.gray[600]} />;
    }
  };

  const formatValue = (value: number, type: string): string => {
    switch (type) {
      case 'proficiency':
      case 'retention':
      case 'engagement':
      case 'completion':
        return `${value}%`;
      case 'streak':
        return `${value} days`;
      case 'vocabulary':
        return `${value} words`;
      default:
        return value.toString();
    }
  };

  const renderTimeframeSelector = () => (
    <View style={styles.timeframeSelector}>
      {(['7d', '30d', '90d', '1y'] as const).map((timeframe) => (
        <TouchableOpacity
          key={timeframe}
          style={[
            styles.timeframeButton,
            selectedTimeframe === timeframe && styles.activeTimeframeButton,
          ]}
          onPress={() => setSelectedTimeframe(timeframe)}
        >
          <Text style={[
            styles.timeframeText,
            selectedTimeframe === timeframe && styles.activeTimeframeText,
          ]}>
            {timeframe}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderOverviewSection = () => {
    const totalPredictions = predictions.length;
    const highConfidencePredictions = predictions.filter(p => p.confidence >= 0.8).length;
    const improvingTrends = predictions.filter(p => p.trend === 'improving').length;
    const lowRiskPredictions = predictions.filter(p => p.riskLevel === 'low').length;

    return (
      <Card style={styles.sectionCard}>
        <TouchableOpacity
          style={styles.sectionHeader}
          onPress={() => toggleSection('overview')}
        >
          <View style={styles.sectionTitleContainer}>
            <BarChart3Icon size={24} color={theme.colors.primary} />
            <Text style={styles.sectionTitle}>Prediction Overview</Text>
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
                <Text style={styles.overviewValue}>{totalPredictions}</Text>
                <Text style={styles.overviewLabel}>Total Predictions</Text>
              </View>

              <View style={styles.overviewItem}>
                <View style={styles.overviewIcon}>
                  <CheckCircleIcon size={24} color={theme.colors.success} />
                </View>
                <Text style={styles.overviewValue}>{highConfidencePredictions}</Text>
                <Text style={styles.overviewLabel}>High Confidence</Text>
              </View>

              <View style={styles.overviewItem}>
                <View style={styles.overviewIcon}>
                  <TrendingUpIcon size={24} color={theme.colors.success} />
                </View>
                <Text style={styles.overviewValue}>{improvingTrends}</Text>
                <Text style={styles.overviewLabel}>Improving Trends</Text>
              </View>

              <View style={styles.overviewItem}>
                <View style={styles.overviewIcon}>
                  <AlertCircleIcon size={24} color={theme.colors.warning} />
                </View>
                <Text style={styles.overviewValue}>{lowRiskPredictions}</Text>
                <Text style={styles.overviewLabel}>Low Risk</Text>
              </View>
            </View>
          </View>
        )}
      </Card>
    );
  };

  const renderPredictionsSection = () => (
    <Card style={styles.sectionCard}>
      <TouchableOpacity
        style={styles.sectionHeader}
        onPress={() => toggleSection('predictions')}
      >
        <View style={styles.sectionTitleContainer}>
          <BrainIcon size={24} color={theme.colors.info} />
          <Text style={styles.sectionTitle}>Performance Predictions</Text>
        </View>
        {expandedSections.has('predictions') ? 
          <ChevronDownIcon size={20} color={theme.colors.gray[600]} /> :
          <ChevronRightIcon size={20} color={theme.colors.gray[600]} />
        }
      </TouchableOpacity>

      {expandedSections.has('predictions') && (
        <View style={styles.sectionContent}>
          {predictions.map((prediction) => (
            <TouchableOpacity
              key={prediction.id}
              style={styles.predictionCard}
              onPress={() => handlePredictionPress(prediction)}
            >
              <View style={styles.predictionHeader}>
                <View style={styles.predictionIcon}>
                  {prediction.icon}
                </View>
                <View style={styles.predictionInfo}>
                  <Text style={styles.predictionTitle}>{prediction.title}</Text>
                  <Text style={styles.predictionDescription}>{prediction.description}</Text>
                </View>
                <View style={styles.predictionMeta}>
                  <Badge 
                    variant={prediction.riskLevel === 'low' ? 'filled' : 
                            prediction.riskLevel === 'medium' ? 'outlined' : 'subtle'}
                    style={styles.riskBadge}
                  >
                    {prediction.riskLevel}
                  </Badge>
                  <Text style={styles.confidenceText}>
                    {Math.round(prediction.confidence * 100)}% confidence
                  </Text>
                </View>
              </View>

              <View style={styles.predictionValues}>
                <View style={styles.valueItem}>
                  <Text style={styles.valueLabel}>Current</Text>
                  <Text style={styles.valueText}>
                    {formatValue(prediction.currentValue, prediction.type)}
                  </Text>
                </View>
                <View style={styles.valueArrow}>
                  {getTrendIcon(prediction.trend)}
                </View>
                <View style={styles.valueItem}>
                  <Text style={styles.valueLabel}>Predicted</Text>
                  <Text style={[styles.valueText, { color: prediction.color }]}>
                    {formatValue(prediction.predictedValue, prediction.type)}
                  </Text>
                </View>
                <View style={styles.valueItem}>
                  <Text style={styles.valueLabel}>Timeframe</Text>
                  <Text style={styles.valueText}>{prediction.timeframe} days</Text>
                </View>
              </View>

              <View style={styles.predictionFactors}>
                <Text style={styles.factorsTitle}>Key Factors:</Text>
                <View style={styles.factorsList}>
                  {prediction.factors.slice(0, 3).map((factor, index) => (
                    <Text key={index} style={styles.factorItem}>• {factor}</Text>
                  ))}
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </Card>
  );

  const renderPredictionModal = () => {
    if (!selectedPrediction) return null;

    return (
      <Modal
        visible={showPredictionModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowPredictionModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{selectedPrediction.title}</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowPredictionModal(false)}
            >
              <XIcon size={24} color={theme.colors.gray[600]} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            <Card style={styles.modalCard}>
              <View style={styles.modalIcon}>
                {selectedPrediction.icon}
              </View>
              <Text style={styles.modalDescription}>{selectedPrediction.description}</Text>
              
              <View style={styles.modalValues}>
                <View style={styles.modalValueItem}>
                  <Text style={styles.modalValueLabel}>Current Value</Text>
                  <Text style={styles.modalValueText}>
                    {formatValue(selectedPrediction.currentValue, selectedPrediction.type)}
                  </Text>
                </View>
                <View style={styles.modalValueItem}>
                  <Text style={styles.modalValueLabel}>Predicted Value</Text>
                  <Text style={[styles.modalValueText, { color: selectedPrediction.color }]}>
                    {formatValue(selectedPrediction.predictedValue, selectedPrediction.type)}
                  </Text>
                </View>
                <View style={styles.modalValueItem}>
                  <Text style={styles.modalValueLabel}>Confidence</Text>
                  <Text style={styles.modalValueText}>
                    {Math.round(selectedPrediction.confidence * 100)}%
                  </Text>
                </View>
                <View style={styles.modalValueItem}>
                  <Text style={styles.modalValueLabel}>Timeframe</Text>
                  <Text style={styles.modalValueText}>{selectedPrediction.timeframe} days</Text>
                </View>
              </View>

              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>Key Factors</Text>
                {selectedPrediction.factors.map((factor, index) => (
                  <View key={index} style={styles.factorItem}>
                    <CheckCircleIcon size={16} color={theme.colors.success} />
                    <Text style={styles.factorText}>{factor}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>Recommendations</Text>
                {selectedPrediction.recommendations.map((recommendation, index) => (
                  <View key={index} style={styles.recommendationItem}>
                    <LightbulbIcon size={16} color={theme.colors.warning} />
                    <Text style={styles.recommendationText}>{recommendation}</Text>
                  </View>
                ))}
              </View>
            </Card>
          </ScrollView>
        </View>
      </Modal>
    );
  };

  if (isLoading && predictions.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <BrainIcon size={48} color={theme.colors.primary} />
        <Text style={styles.loadingText}>Analyzing performance...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Performance Predictions</Text>
        <Text style={styles.subtitle}>AI-powered insights into your learning future</Text>
      </View>

      {renderTimeframeSelector()}

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {renderOverviewSection()}
        {renderPredictionsSection()}
      </ScrollView>

      {renderPredictionModal()}
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
  timeframeSelector: {
    flexDirection: 'row',
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    backgroundColor: theme.colors.gray[50],
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.xs,
  },
  timeframeButton: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
  },
  activeTimeframeButton: {
    backgroundColor: theme.colors.white,
    shadowColor: theme.colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  timeframeText: {
    fontSize: theme.fontSize.sm,
    fontWeight: '500',
    color: theme.colors.gray[600],
  },
  activeTimeframeText: {
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
  predictionCard: {
    backgroundColor: theme.colors.gray[50],
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.gray[200],
  },
  predictionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.md,
  },
  predictionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  predictionInfo: {
    flex: 1,
    marginRight: theme.spacing.md,
  },
  predictionTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: '600',
    color: theme.colors.black,
    marginBottom: theme.spacing.xs,
  },
  predictionDescription: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.gray[600],
  },
  predictionMeta: {
    alignItems: 'flex-end',
  },
  riskBadge: {
    marginBottom: theme.spacing.xs,
  },
  confidenceText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.gray[600],
  },
  predictionValues: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.md,
  },
  valueItem: {
    alignItems: 'center',
  },
  valueLabel: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.gray[600],
    marginBottom: theme.spacing.xs,
  },
  valueText: {
    fontSize: theme.fontSize.md,
    fontWeight: '600',
    color: theme.colors.black,
  },
  valueArrow: {
    paddingHorizontal: theme.spacing.sm,
  },
  predictionFactors: {
    gap: theme.spacing.sm,
  },
  factorsTitle: {
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
    color: theme.colors.black,
  },
  factorsList: {
    gap: theme.spacing.xs,
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
  modalValues: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  modalValueItem: {
    flex: 1,
    minWidth: (width - theme.spacing.lg * 4) / 2,
    alignItems: 'center',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.gray[50],
    borderRadius: theme.borderRadius.md,
  },
  modalValueLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.gray[600],
    marginBottom: theme.spacing.xs,
  },
  modalValueText: {
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
  factorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  factorText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.gray[600],
    flex: 1,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  recommendationText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.gray[600],
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
