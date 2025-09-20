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
} from 'react-native';
import { theme } from '@/constants/theme';
import { useUnifiedAuth } from "@/hooks/useUnifiedAuth";
import { useI18n } from '@/hooks/useI18n';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Badge } from '@/components/Badge';
import { 
  BarChart3Icon,
  TrendingUpIcon,
  TrendingDownIcon,
  TargetIcon,
  ClockIcon,
  BookOpenIcon,
  BrainIcon,
  ZapIcon,
  AwardIcon,
  CalendarIcon,
  ActivityIcon,
  UsersIcon,
  StarIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  InfoIcon,
  DownloadIcon,
  ShareIcon,
  FilterIcon,
  EyeIcon,
  EyeOffIcon,
  ChevronRightIcon,
  ChevronDownIcon,
} from '@/components/icons/LucideReplacement';
import { analyticsService } from '@/services/analytics/analytics';

const { width } = Dimensions.get('window');

interface LearningAnalyticsProps {
  onNavigateToReport?: (reportType: string) => void;
  onNavigateToPredictions?: () => void;
  onNavigateToRecommendations?: () => void;
}

export default function LearningAnalytics({
  onNavigateToReport,
  onNavigateToPredictions,
  onNavigateToRecommendations,
}: LearningAnalyticsProps) {
  const { user, signIn, signOut, signUp, resetPassword, updateUser } = useUnifiedAuth();
  const { t } = useI18n();

  // State management
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [selectedMetric, setSelectedMetric] = useState<'xp' | 'accuracy' | 'time' | 'words'>('xp');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['overview', 'performance']));
  const [chartData, setChartData] = useState<{ labels: string[], data: number[] }>({ labels: [], data: [] });

  useEffect(() => {
    loadAnalytics();
  }, [selectedTimeframe, selectedMetric]);

  const loadAnalytics = async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    try {
      const days = selectedTimeframe === '7d' ? 7 : selectedTimeframe === '30d' ? 30 : selectedTimeframe === '90d' ? 90 : 365;
      const data = await analyticsService.getAdvancedAnalytics(user.id, days);
      setAnalyticsData(data);
      
      // Load chart data
      const chart = await analyticsService.getChartData(user.id, selectedMetric, days);
      setChartData(chart);
    } catch (error) {
      console.error('Error loading analytics:', error);
      Alert.alert('Error', 'Failed to load analytics data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await loadAnalytics();
    setIsRefreshing(false);
  }, [selectedTimeframe, selectedMetric]);

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const getTimeframeDays = (timeframe: string): number => {
    switch (timeframe) {
      case '7d': return 7;
      case '30d': return 30;
      case '90d': return 90;
      case '1y': return 365;
      default: return 30;
    }
  };

  const formatMetricValue = (value: number, type: string): string => {
    switch (type) {
      case 'xp':
        return value.toLocaleString();
      case 'accuracy':
        return `${value.toFixed(1)}%`;
      case 'time':
        return `${Math.round(value)}m`;
      case 'words':
        return value.toLocaleString();
      default:
        return value.toString();
    }
  };

  const getMetricIcon = (metric: string) => {
    switch (metric) {
      case 'xp':
        return <StarIcon size={20} color={theme.colors.warning} />;
      case 'accuracy':
        return <TargetIcon size={20} color={theme.colors.success} />;
      case 'time':
        return <ClockIcon size={20} color={theme.colors.info} />;
      case 'words':
        return <BookOpenIcon size={20} color={theme.colors.primary} />;
      default:
        return <ActivityIcon size={20} color={theme.colors.gray[600]} />;
    }
  };

  const getTrendIcon = (trend: 'improving' | 'declining' | 'stable') => {
    switch (trend) {
      case 'improving':
        return <TrendingUpIcon size={16} color={theme.colors.success} />;
      case 'declining':
        return <TrendingDownIcon size={16} color={theme.colors.danger} />;
      case 'stable':
        return <ActivityIcon size={16} color={theme.colors.gray[600]} />;
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

  const renderMetricSelector = () => (
    <View style={styles.metricSelector}>
      {(['xp', 'accuracy', 'time', 'words'] as const).map((metric) => (
        <TouchableOpacity
          key={metric}
          style={[
            styles.metricButton,
            selectedMetric === metric && styles.activeMetricButton,
          ]}
          onPress={() => setSelectedMetric(metric)}
        >
          {getMetricIcon(metric)}
          <Text style={[
            styles.metricText,
            selectedMetric === metric && styles.activeMetricText,
          ]}>
            {metric.charAt(0).toUpperCase() + metric.slice(1)}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderOverviewSection = () => {
    if (!analyticsData) return null;

    const { performanceMetrics, streakData } = analyticsData;
    const totalXP = analyticsData.daily?.reduce((sum: number, day: any) => sum + day.xpEarned, 0) || 0;
    const totalTime = analyticsData.daily?.reduce((sum: number, day: any) => sum + day.timeSpent, 0) || 0;
    const totalWords = analyticsData.daily?.reduce((sum: number, day: any) => sum + day.newWordsLearned, 0) || 0;
    const avgAccuracy = analyticsData.daily?.reduce((sum: number, day: any) => sum + day.accuracy, 0) / analyticsData.daily?.length || 0;

    return (
      <Card style={styles.sectionCard}>
        <TouchableOpacity
          style={styles.sectionHeader}
          onPress={() => toggleSection('overview')}
        >
          <View style={styles.sectionTitleContainer}>
            <BarChart3Icon size={24} color={theme.colors.primary} />
            <Text style={styles.sectionTitle}>Learning Overview</Text>
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
                  <StarIcon size={24} color={theme.colors.warning} />
                </View>
                <Text style={styles.overviewValue}>{totalXP.toLocaleString()}</Text>
                <Text style={styles.overviewLabel}>Total XP</Text>
                <View style={styles.overviewTrend}>
                  {getTrendIcon('improving')}
                  <Text style={styles.trendText}>+12%</Text>
                </View>
              </View>

              <View style={styles.overviewItem}>
                <View style={styles.overviewIcon}>
                  <TargetIcon size={24} color={theme.colors.success} />
                </View>
                <Text style={styles.overviewValue}>{avgAccuracy.toFixed(1)}%</Text>
                <Text style={styles.overviewLabel}>Accuracy</Text>
                <View style={styles.overviewTrend}>
                  {getTrendIcon('stable')}
                  <Text style={styles.trendText}>+2%</Text>
                </View>
              </View>

              <View style={styles.overviewItem}>
                <View style={styles.overviewIcon}>
                  <ClockIcon size={24} color={theme.colors.info} />
                </View>
                <Text style={styles.overviewValue}>{Math.round(totalTime)}m</Text>
                <Text style={styles.overviewLabel}>Study Time</Text>
                <View style={styles.overviewTrend}>
                  {getTrendIcon('improving')}
                  <Text style={styles.trendText}>+8%</Text>
                </View>
              </View>

              <View style={styles.overviewItem}>
                <View style={styles.overviewIcon}>
                  <BookOpenIcon size={24} color={theme.colors.primary} />
                </View>
                <Text style={styles.overviewValue}>{totalWords.toLocaleString()}</Text>
                <Text style={styles.overviewLabel}>Words Learned</Text>
                <View style={styles.overviewTrend}>
                  {getTrendIcon('improving')}
                  <Text style={styles.trendText}>+15%</Text>
                </View>
              </View>
            </View>

            <View style={styles.streakContainer}>
              <View style={styles.streakInfo}>
                <ZapIcon size={20} color={theme.colors.danger} />
                <Text style={styles.streakText}>
                  Current Streak: {streakData?.currentStreak || 0} days
                </Text>
              </View>
              <Text style={styles.streakSubtext}>
                Longest: {streakData?.longestStreak || 0} days
              </Text>
            </View>
          </View>
        )}
      </Card>
    );
  };

  const renderPerformanceSection = () => {
    if (!analyticsData?.performanceMetrics) return null;

    const { performanceMetrics } = analyticsData;

    return (
      <Card style={styles.sectionCard}>
        <TouchableOpacity
          style={styles.sectionHeader}
          onPress={() => toggleSection('performance')}
        >
          <View style={styles.sectionTitleContainer}>
            <BrainIcon size={24} color={theme.colors.success} />
            <Text style={styles.sectionTitle}>Performance Analysis</Text>
          </View>
          {expandedSections.has('performance') ? 
            <ChevronDownIcon size={20} color={theme.colors.gray[600]} /> :
            <ChevronRightIcon size={20} color={theme.colors.gray[600]} />
          }
        </TouchableOpacity>

        {expandedSections.has('performance') && (
          <View style={styles.sectionContent}>
            <View style={styles.performanceGrid}>
              <View style={styles.performanceItem}>
                <Text style={styles.performanceLabel}>Consistency Score</Text>
                <View style={styles.performanceBar}>
                  <View 
                    style={[
                      styles.performanceBarFill, 
                      { width: `${performanceMetrics.consistencyScore || 0}%` },
                    ]} 
                  />
                </View>
                <Text style={styles.performanceValue}>{performanceMetrics.consistencyScore || 0}%</Text>
              </View>

              <View style={styles.performanceItem}>
                <Text style={styles.performanceLabel}>Learning Velocity</Text>
                <View style={styles.performanceBar}>
                  <View 
                    style={[
                      styles.performanceBarFill, 
                      { width: `${Math.min(100, (performanceMetrics.learningVelocity || 0) * 10)}%` },
                    ]} 
                  />
                </View>
                <Text style={styles.performanceValue}>{performanceMetrics.learningVelocity || 0}/week</Text>
              </View>

              <View style={styles.performanceItem}>
                <Text style={styles.performanceLabel}>Engagement Score</Text>
                <View style={styles.performanceBar}>
                  <View 
                    style={[
                      styles.performanceBarFill, 
                      { width: `${performanceMetrics.engagementScore || 0}%` },
                    ]} 
                  />
                </View>
                <Text style={styles.performanceValue}>{performanceMetrics.engagementScore || 0}%</Text>
              </View>

              <View style={styles.performanceItem}>
                <Text style={styles.performanceLabel}>Retention Rate</Text>
                <View style={styles.performanceBar}>
                  <View 
                    style={[
                      styles.performanceBarFill, 
                      { width: `${performanceMetrics.retentionRate || 0}%` },
                    ]} 
                  />
                </View>
                <Text style={styles.performanceValue}>{performanceMetrics.retentionRate || 0}%</Text>
              </View>
            </View>

            <View style={styles.skillsContainer}>
              <View style={styles.skillsSection}>
                <Text style={styles.skillsTitle}>Strong Skills</Text>
                <View style={styles.skillsList}>
                  {(performanceMetrics.strongSkills || []).map((skill: string, index: number) => (
                    <Badge key={index} variant="filled" style={styles.skillBadge}>
                      {skill}
                    </Badge>
                  ))}
                </View>
              </View>

              <View style={styles.skillsSection}>
                <Text style={styles.skillsTitle}>Areas for Improvement</Text>
                <View style={styles.skillsList}>
                  {(performanceMetrics.weakSkills || []).map((skill: string, index: number) => (
                    <Badge key={index} variant="outlined" style={styles.skillBadge}>
                      {skill}
                    </Badge>
                  ))}
                </View>
              </View>
            </View>
          </View>
        )}
      </Card>
    );
  };

  const renderInsightsSection = () => {
    if (!analyticsData?.insights) return null;

    return (
      <Card style={styles.sectionCard}>
        <TouchableOpacity
          style={styles.sectionHeader}
          onPress={() => toggleSection('insights')}
        >
          <View style={styles.sectionTitleContainer}>
            <InfoIcon size={24} color={theme.colors.info} />
            <Text style={styles.sectionTitle}>Learning Insights</Text>
          </View>
          {expandedSections.has('insights') ? 
            <ChevronDownIcon size={20} color={theme.colors.gray[600]} /> :
            <ChevronRightIcon size={20} color={theme.colors.gray[600]} />
          }
        </TouchableOpacity>

        {expandedSections.has('insights') && (
          <View style={styles.sectionContent}>
            {analyticsData.insights.map((insight: any, index: number) => (
              <View key={index} style={styles.insightItem}>
                <View style={styles.insightHeader}>
                  <View style={[
                    styles.insightIcon,
                    { backgroundColor: insight.type === 'strength' ? theme.colors.success : 
                                      insight.type === 'improvement' ? theme.colors.warning : theme.colors.info },
                  ]}>
                    {insight.type === 'strength' ? <CheckCircleIcon size={16} color={theme.colors.white} /> :
                     insight.type === 'improvement' ? <AlertCircleIcon size={16} color={theme.colors.white} /> :
                     <InfoIcon size={16} color={theme.colors.white} />}
                  </View>
                  <View style={styles.insightContent}>
                    <Text style={styles.insightTitle}>{insight.title?.en || insight.title}</Text>
                    <Text style={styles.insightDescription}>{insight.description?.en || insight.description}</Text>
                  </View>
                </View>
                <Badge 
                  variant={insight.priority === 'high' ? 'filled' : insight.priority === 'medium' ? 'outlined' : 'subtle'}
                  style={styles.insightPriority}
                >
                  {insight.priority}
                </Badge>
              </View>
            ))}
          </View>
        )}
      </Card>
    );
  };

  const renderPredictionsSection = () => {
    if (!analyticsData?.predictions) return null;

    return (
      <Card style={styles.sectionCard}>
        <TouchableOpacity
          style={styles.sectionHeader}
          onPress={() => toggleSection('predictions')}
        >
          <View style={styles.sectionTitleContainer}>
            <TrendingUpIcon size={24} color={theme.colors.warning} />
            <Text style={styles.sectionTitle}>Performance Predictions</Text>
          </View>
          {expandedSections.has('predictions') ? 
            <ChevronDownIcon size={20} color={theme.colors.gray[600]} /> :
            <ChevronRightIcon size={20} color={theme.colors.gray[600]} />
          }
        </TouchableOpacity>

        {expandedSections.has('predictions') && (
          <View style={styles.sectionContent}>
            {analyticsData.predictions.map((prediction: any, index: number) => (
              <View key={index} style={styles.predictionItem}>
                <View style={styles.predictionHeader}>
                  <Text style={styles.predictionType}>{prediction.type}</Text>
                  <Text style={styles.predictionConfidence}>
                    {Math.round(prediction.confidence * 100)}% confidence
                  </Text>
                </View>
                <Text style={styles.predictionValue}>
                  {formatMetricValue(prediction.predictedValue, prediction.type)}
                </Text>
                <Text style={styles.predictionTimeframe}>
                  In {prediction.timeframe} days
                </Text>
                <View style={styles.predictionFactors}>
                  <Text style={styles.predictionFactorsTitle}>Key Factors:</Text>
                  {prediction.factors.map((factor: string, factorIndex: number) => (
                    <Text key={factorIndex} style={styles.predictionFactor}>• {factor}</Text>
                  ))}
                </View>
              </View>
            ))}
          </View>
        )}
      </Card>
    );
  };

  const renderActionButtons = () => (
    <View style={styles.actionButtons}>
      <Button
        title="Generate Report"
        onPress={() => onNavigateToReport?.('comprehensive')}
        style={styles.actionButton}
        icon={<DownloadIcon size={16} color={theme.colors.white} />}
      />
      <Button
        title="Share Analytics"
        onPress={() => {}}
        variant="outline"
        style={styles.actionButton}
        icon={<ShareIcon size={16} color={theme.colors.primary} />}
      />
    </View>
  );

  if (isLoading && !analyticsData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIcon size={48} color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading analytics...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Learning Analytics</Text>
        <Text style={styles.subtitle}>Track your progress and optimize your learning</Text>
      </View>

      {renderTimeframeSelector()}
      {renderMetricSelector()}

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {renderOverviewSection()}
        {renderPerformanceSection()}
        {renderInsightsSection()}
        {renderPredictionsSection()}
        {renderActionButtons()}
      </ScrollView>
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
    marginBottom: theme.spacing.md,
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
  metricSelector: {
    flexDirection: 'row',
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  metricButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.gray[50],
    gap: theme.spacing.xs,
  },
  activeMetricButton: {
    backgroundColor: theme.colors.primary,
  },
  metricText: {
    fontSize: theme.fontSize.sm,
    fontWeight: '500',
    color: theme.colors.gray[600],
  },
  activeMetricText: {
    color: theme.colors.white,
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
    marginBottom: theme.spacing.lg,
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
    marginBottom: theme.spacing.sm,
  },
  overviewTrend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  trendText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.success,
    fontWeight: '500',
  },
  streakContainer: {
    backgroundColor: theme.colors.danger,
    opacity: 0.1,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
  },
  streakInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.xs,
  },
  streakText: {
    fontSize: theme.fontSize.md,
    fontWeight: '600',
    color: theme.colors.danger,
  },
  streakSubtext: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.gray[600],
  },
  performanceGrid: {
    gap: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  performanceItem: {
    gap: theme.spacing.sm,
  },
  performanceLabel: {
    fontSize: theme.fontSize.md,
    fontWeight: '500',
    color: theme.colors.black,
  },
  performanceBar: {
    height: 8,
    backgroundColor: theme.colors.gray[200],
    borderRadius: 4,
    overflow: 'hidden',
  },
  performanceBarFill: {
    height: '100%',
    backgroundColor: theme.colors.primary,
    borderRadius: 4,
  },
  performanceValue: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.gray[600],
    textAlign: 'right',
  },
  skillsContainer: {
    gap: theme.spacing.lg,
  },
  skillsSection: {
    gap: theme.spacing.sm,
  },
  skillsTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: '600',
    color: theme.colors.black,
  },
  skillsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  skillBadge: {
    marginRight: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.gray[50],
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
    gap: theme.spacing.md,
  },
  insightIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  insightContent: {
    flex: 1,
  },
  insightTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: '600',
    color: theme.colors.black,
    marginBottom: theme.spacing.xs,
  },
  insightDescription: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.gray[600],
    lineHeight: 18,
  },
  insightPriority: {
    alignSelf: 'flex-start',
  },
  predictionItem: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.gray[50],
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
  },
  predictionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  predictionType: {
    fontSize: theme.fontSize.md,
    fontWeight: '600',
    color: theme.colors.black,
    textTransform: 'capitalize',
  },
  predictionConfidence: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.gray[600],
  },
  predictionValue: {
    fontSize: theme.fontSize.xl,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: theme.spacing.xs,
  },
  predictionTimeframe: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.gray[600],
    marginBottom: theme.spacing.md,
  },
  predictionFactors: {
    gap: theme.spacing.xs,
  },
  predictionFactorsTitle: {
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
    color: theme.colors.black,
  },
  predictionFactor: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.gray[600],
  },
  actionButtons: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.xl,
  },
  actionButton: {
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
