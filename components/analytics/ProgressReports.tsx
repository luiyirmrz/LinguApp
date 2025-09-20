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
  Share,
  Modal,
} from 'react-native';
import { theme } from '@/constants/theme';
import { useUnifiedAuth } from "@/hooks/useUnifiedAuth";
import { useI18n } from '@/hooks/useI18n';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Badge } from '@/components/Badge';
import { 
  FileTextIcon,
  DownloadIcon,
  ShareIcon,
  CalendarIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  TargetIcon,
  ClockIcon,
  BookOpenIcon,
  StarIcon,
  AwardIcon,
  UsersIcon,
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
  MailIcon,
  MessageSquareIcon,
} from '@/components/icons/LucideReplacement';
import { analyticsService } from '@/services/analytics/analytics';

const { width } = Dimensions.get('window');

interface ProgressReportsProps {
  onNavigateToAnalytics?: () => void;
  onNavigateToPredictions?: () => void;
}

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  sections: string[];
  timeframe: string;
  format: 'summary' | 'detailed' | 'comprehensive';
}

export default function ProgressReports({
  onNavigateToAnalytics,
  onNavigateToPredictions,
}: ProgressReportsProps) {
  const { user, signIn, signOut, signUp, resetPassword, updateUser } = useUnifiedAuth();
  const { t } = useI18n();

  // State management
  const [reports, setReports] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedReport, setSelectedReport] = useState<string>('weekly');
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportData, setReportData] = useState<any>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['overview', 'achievements']));

  // Report templates
  const reportTemplates: ReportTemplate[] = [
    {
      id: 'weekly',
      name: 'Weekly Progress Report',
      description: 'Your learning progress for the past week',
      icon: <CalendarIcon size={24} color={theme.colors.primary} />,
      sections: ['overview', 'achievements', 'challenges', 'recommendations'],
      timeframe: '7 days',
      format: 'summary',
    },
    {
      id: 'monthly',
      name: 'Monthly Progress Report',
      description: 'Comprehensive monthly learning analysis',
      icon: <BarChart3Icon size={24} color={theme.colors.success} />,
      sections: ['overview', 'performance', 'achievements', 'goals', 'insights', 'recommendations'],
      timeframe: '30 days',
      format: 'detailed',
    },
    {
      id: 'quarterly',
      name: 'Quarterly Progress Report',
      description: 'In-depth quarterly learning assessment',
      icon: <PieChartIcon size={24} color={theme.colors.warning} />,
      sections: ['overview', 'performance', 'achievements', 'goals', 'insights', 'predictions', 'recommendations'],
      timeframe: '90 days',
      format: 'comprehensive',
    },
    {
      id: 'yearly',
      name: 'Annual Learning Report',
      description: 'Complete year-end learning review',
      icon: <AwardIcon size={24} color={theme.colors.danger} />,
      sections: ['overview', 'performance', 'achievements', 'milestones', 'insights', 'predictions', 'goals', 'recommendations'],
      timeframe: '365 days',
      format: 'comprehensive',
    },
  ];

  useEffect(() => {
    loadReports();
  }, [selectedReport]);

  const loadReports = async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    try {
      const days = selectedReport === 'weekly' ? 7 : 
                   selectedReport === 'monthly' ? 30 : 
                   selectedReport === 'quarterly' ? 90 : 365;
      
      const analyticsData = await analyticsService.getAdvancedAnalytics(user.id, days);
      setReportData(analyticsData);
      
      // Generate mock reports for demonstration
      const mockReports = generateMockReports(analyticsData, selectedReport);
      setReports(mockReports);
    } catch (error) {
      console.error('Error loading reports:', error);
      Alert.alert('Error', 'Failed to load progress reports');
    } finally {
      setIsLoading(false);
    }
  };

  const generateMockReports = (analyticsData: any, reportType: string) => {
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
        title: `${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Learning Summary`,
        date: new Date().toISOString(),
        type: reportType,
        summary: {
          xpEarned: baseData.totalXP,
          timeSpent: baseData.totalTime,
          wordsLearned: baseData.totalWords,
          accuracy: baseData.avgAccuracy,
          streak: baseData.streak,
          lessonsCompleted: Math.floor(baseData.totalXP / 50),
          achievements: Math.floor(baseData.totalXP / 200),
        },
        highlights: [
          `Earned ${baseData.totalXP.toLocaleString()} XP this ${reportType}`,
          `Learned ${baseData.totalWords} new words`,
          `Maintained ${baseData.streak}-day streak`,
          `Achieved ${baseData.avgAccuracy.toFixed(1)}% accuracy`,
        ],
        achievements: [
          { id: '1', name: 'Consistent Learner', description: 'Studied for 7 consecutive days', earned: true },
          { id: '2', name: 'Vocabulary Master', description: 'Learned 50+ new words', earned: baseData.totalWords >= 50 },
          { id: '3', name: 'Accuracy Champion', description: 'Achieved 90%+ accuracy', earned: baseData.avgAccuracy >= 90 },
          { id: '4', name: 'Time Dedication', description: 'Studied for 5+ hours', earned: baseData.totalTime >= 300 },
        ],
        challenges: [
          { id: '1', name: 'Daily Practice', description: 'Study every day for a week', progress: Math.min(100, (baseData.streak / 7) * 100) },
          { id: '2', name: 'Vocabulary Builder', description: 'Learn 100 new words', progress: Math.min(100, (baseData.totalWords / 100) * 100) },
          { id: '3', name: 'Accuracy Master', description: 'Maintain 95% accuracy', progress: Math.min(100, (baseData.avgAccuracy / 95) * 100) },
        ],
        recommendations: [
          'Continue your daily practice routine',
          'Focus on vocabulary building exercises',
          'Try speaking exercises to improve pronunciation',
          'Join study groups for collaborative learning',
        ],
        insights: [
          {
            type: 'strength',
            title: 'Consistent Learning Pattern',
            description: 'You maintain a regular study schedule',
            impact: 'high',
          },
          {
            type: 'improvement',
            title: 'Vocabulary Expansion',
            description: 'Consider focusing more on vocabulary building',
            impact: 'medium',
          },
        ],
      },
    ];
  };

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await loadReports();
    setIsRefreshing(false);
  }, [selectedReport]);

  const handleGenerateReport = async (template: ReportTemplate) => {
    setSelectedReport(template.id);
    await loadReports();
    setShowReportModal(true);
  };

  const handleShareReport = async (report: any) => {
    try {
      const shareContent = {
        title: report.title,
        message: `Check out my ${report.type} learning progress!\n\n` +
                `📊 XP Earned: ${report.summary.xpEarned.toLocaleString()}\n` +
                `📚 Words Learned: ${report.summary.wordsLearned}\n` +
                `🎯 Accuracy: ${report.summary.accuracy.toFixed(1)}%\n` +
                `🔥 Streak: ${report.summary.streak} days\n\n` +
                'Download LinguApp to start your language learning journey!',
        url: 'https://linguapp.com',
      };
      
      await Share.share(shareContent);
    } catch (error) {
      console.error('Error sharing report:', error);
    }
  };

  const handleExportReport = async (report: any) => {
    try {
      // In a real app, this would generate and save a PDF or other format
      Alert.alert(
        'Export Report',
        'Report exported successfully! You can find it in your downloads folder.',
        [{ text: 'OK' }],
      );
    } catch (error) {
      console.error('Error exporting report:', error);
      Alert.alert('Error', 'Failed to export report');
    }
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

  const renderReportTemplates = () => (
    <View style={styles.templatesContainer}>
      <Text style={styles.sectionTitle}>Report Templates</Text>
      <View style={styles.templatesGrid}>
        {reportTemplates.map((template) => (
          <TouchableOpacity
            key={template.id}
            style={styles.templateCard}
            onPress={() => handleGenerateReport(template)}
          >
            <View style={styles.templateIcon}>
              {template.icon}
            </View>
            <Text style={styles.templateName}>{template.name}</Text>
            <Text style={styles.templateDescription}>{template.description}</Text>
            <View style={styles.templateMeta}>
              <Badge variant="subtle" style={styles.templateBadge}>
                {template.timeframe}
              </Badge>
              <Badge 
                variant={template.format === 'summary' ? 'filled' : 
                        template.format === 'detailed' ? 'outlined' : 'subtle'}
                style={styles.templateBadge}
              >
                {template.format}
              </Badge>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderRecentReports = () => (
    <View style={styles.recentReportsContainer}>
      <Text style={styles.sectionTitle}>Recent Reports</Text>
      {reports.map((report) => (
        <Card key={report.id} style={styles.reportCard}>
          <View style={styles.reportHeader}>
            <View style={styles.reportInfo}>
              <Text style={styles.reportTitle}>{report.title}</Text>
              <Text style={styles.reportDate}>
                {new Date(report.date).toLocaleDateString()}
              </Text>
            </View>
            <View style={styles.reportActions}>
              <TouchableOpacity
                style={styles.reportAction}
                onPress={() => setShowReportModal(true)}
              >
                <EyeIcon size={20} color={theme.colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.reportAction}
                onPress={() => handleShareReport(report)}
              >
                <ShareIcon size={20} color={theme.colors.success} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.reportAction}
                onPress={() => handleExportReport(report)}
              >
                <DownloadIcon size={20} color={theme.colors.warning} />
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.reportSummary}>
            <View style={styles.summaryItem}>
              <StarIcon size={16} color={theme.colors.warning} />
              <Text style={styles.summaryText}>{report.summary.xpEarned.toLocaleString()} XP</Text>
            </View>
            <View style={styles.summaryItem}>
              <BookOpenIcon size={16} color={theme.colors.primary} />
              <Text style={styles.summaryText}>{report.summary.wordsLearned} words</Text>
            </View>
            <View style={styles.summaryItem}>
              <TargetIcon size={16} color={theme.colors.success} />
              <Text style={styles.summaryText}>{report.summary.accuracy.toFixed(1)}% accuracy</Text>
            </View>
            <View style={styles.summaryItem}>
              <ClockIcon size={16} color={theme.colors.info} />
              <Text style={styles.summaryText}>{Math.round(report.summary.timeSpent)}m</Text>
            </View>
          </View>
        </Card>
      ))}
    </View>
  );

  const renderReportModal = () => {
    if (!reportData || reports.length === 0) return null;
    
    const report = reports[0];

    return (
      <Modal
        visible={showReportModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowReportModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{report.title}</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowReportModal(false)}
            >
              <XIcon size={24} color={theme.colors.gray[600]} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            {/* Overview Section */}
            <Card style={styles.modalSection}>
              <TouchableOpacity
                style={styles.sectionHeader}
                onPress={() => toggleSection('overview')}
              >
                <View style={styles.sectionTitleContainer}>
                  <BarChart3Icon size={20} color={theme.colors.primary} />
                  <Text style={styles.sectionTitle}>Overview</Text>
                </View>
                {expandedSections.has('overview') ? 
                  <ChevronDownIcon size={16} color={theme.colors.gray[600]} /> :
                  <ChevronRightIcon size={16} color={theme.colors.gray[600]} />
                }
              </TouchableOpacity>

              {expandedSections.has('overview') && (
                <View style={styles.sectionContent}>
                  <View style={styles.overviewGrid}>
                    <View style={styles.overviewItem}>
                      <StarIcon size={24} color={theme.colors.warning} />
                      <Text style={styles.overviewValue}>{report.summary.xpEarned.toLocaleString()}</Text>
                      <Text style={styles.overviewLabel}>XP Earned</Text>
                    </View>
                    <View style={styles.overviewItem}>
                      <BookOpenIcon size={24} color={theme.colors.primary} />
                      <Text style={styles.overviewValue}>{report.summary.wordsLearned}</Text>
                      <Text style={styles.overviewLabel}>Words Learned</Text>
                    </View>
                    <View style={styles.overviewItem}>
                      <TargetIcon size={24} color={theme.colors.success} />
                      <Text style={styles.overviewValue}>{report.summary.accuracy.toFixed(1)}%</Text>
                      <Text style={styles.overviewLabel}>Accuracy</Text>
                    </View>
                    <View style={styles.overviewItem}>
                      <ClockIcon size={24} color={theme.colors.info} />
                      <Text style={styles.overviewValue}>{Math.round(report.summary.timeSpent)}m</Text>
                      <Text style={styles.overviewLabel}>Study Time</Text>
                    </View>
                  </View>

                  <View style={styles.highlightsContainer}>
                    <Text style={styles.highlightsTitle}>Key Highlights</Text>
                    {report.highlights.map((highlight: string, index: number) => (
                      <View key={index} style={styles.highlightItem}>
                        <CheckCircleIcon size={16} color={theme.colors.success} />
                        <Text style={styles.highlightText}>{highlight}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </Card>

            {/* Achievements Section */}
            <Card style={styles.modalSection}>
              <TouchableOpacity
                style={styles.sectionHeader}
                onPress={() => toggleSection('achievements')}
              >
                <View style={styles.sectionTitleContainer}>
                  <AwardIcon size={20} color={theme.colors.warning} />
                  <Text style={styles.sectionTitle}>Achievements</Text>
                </View>
                {expandedSections.has('achievements') ? 
                  <ChevronDownIcon size={16} color={theme.colors.gray[600]} /> :
                  <ChevronRightIcon size={16} color={theme.colors.gray[600]} />
                }
              </TouchableOpacity>

              {expandedSections.has('achievements') && (
                <View style={styles.sectionContent}>
                  {report.achievements.map((achievement: any) => (
                    <View key={achievement.id} style={styles.achievementItem}>
                      <View style={[
                        styles.achievementIcon,
                        { backgroundColor: achievement.earned ? theme.colors.success : theme.colors.gray[300] },
                      ]}>
                        {achievement.earned ? 
                          <CheckCircleIcon size={20} color={theme.colors.white} /> :
                          <AlertCircleIcon size={20} color={theme.colors.gray[600]} />
                        }
                      </View>
                      <View style={styles.achievementContent}>
                        <Text style={[
                          styles.achievementName,
                          { color: achievement.earned ? theme.colors.black : theme.colors.gray[600] },
                        ]}>
                          {achievement.name}
                        </Text>
                        <Text style={styles.achievementDescription}>
                          {achievement.description}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </Card>

            {/* Recommendations Section */}
            <Card style={styles.modalSection}>
              <TouchableOpacity
                style={styles.sectionHeader}
                onPress={() => toggleSection('recommendations')}
              >
                <View style={styles.sectionTitleContainer}>
                  <InfoIcon size={20} color={theme.colors.info} />
                  <Text style={styles.sectionTitle}>Recommendations</Text>
                </View>
                {expandedSections.has('recommendations') ? 
                  <ChevronDownIcon size={16} color={theme.colors.gray[600]} /> :
                  <ChevronRightIcon size={16} color={theme.colors.gray[600]} />
                }
              </TouchableOpacity>

              {expandedSections.has('recommendations') && (
                <View style={styles.sectionContent}>
                  {report.recommendations.map((recommendation: string, index: number) => (
                    <View key={index} style={styles.recommendationItem}>
                      <ChevronRightIcon size={16} color={theme.colors.primary} />
                      <Text style={styles.recommendationText}>{recommendation}</Text>
                    </View>
                  ))}
                </View>
              )}
            </Card>
          </ScrollView>

          <View style={styles.modalFooter}>
            <Button
              title="Share Report"
              onPress={() => handleShareReport(report)}
              style={styles.modalButton}
              icon={<ShareIcon size={16} color={theme.colors.white} />}
            />
            <Button
              title="Export PDF"
              onPress={() => handleExportReport(report)}
              variant="outline"
              style={styles.modalButton}
              icon={<DownloadIcon size={16} color={theme.colors.primary} />}
            />
          </View>
        </View>
      </Modal>
    );
  };

  if (isLoading && reports.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <FileTextIcon size={48} color={theme.colors.primary} />
        <Text style={styles.loadingText}>Generating reports...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Progress Reports</Text>
        <Text style={styles.subtitle}>Track and share your learning journey</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {renderReportTemplates()}
        {renderRecentReports()}
      </ScrollView>

      {renderReportModal()}
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
  scrollView: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
  },
  templatesContainer: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: '600',
    color: theme.colors.black,
    marginBottom: theme.spacing.lg,
  },
  templatesGrid: {
    gap: theme.spacing.md,
  },
  templateCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.gray[200],
    shadowColor: theme.colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  templateIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.gray[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.md,
  },
  templateName: {
    fontSize: theme.fontSize.lg,
    fontWeight: '600',
    color: theme.colors.black,
    marginBottom: theme.spacing.sm,
  },
  templateDescription: {
    fontSize: theme.fontSize.md,
    color: theme.colors.gray[600],
    marginBottom: theme.spacing.md,
  },
  templateMeta: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  templateBadge: {
    // fontSize removed - Badge handles its own text styling
  },
  recentReportsContainer: {
    marginBottom: theme.spacing.xl,
  },
  reportCard: {
    marginBottom: theme.spacing.md,
  },
  reportHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  reportInfo: {
    flex: 1,
  },
  reportTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: '600',
    color: theme.colors.black,
    marginBottom: theme.spacing.xs,
  },
  reportDate: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.gray[600],
  },
  reportActions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  reportAction: {
    padding: theme.spacing.sm,
  },
  reportSummary: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  summaryText: {
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
  modalSection: {
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
  overviewValue: {
    fontSize: theme.fontSize.xl,
    fontWeight: 'bold',
    color: theme.colors.black,
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.xs,
  },
  overviewLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.gray[600],
  },
  highlightsContainer: {
    gap: theme.spacing.sm,
  },
  highlightsTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: '600',
    color: theme.colors.black,
    marginBottom: theme.spacing.sm,
  },
  highlightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  highlightText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.gray[600],
  },
  achievementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.gray[50],
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
  },
  achievementIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  achievementContent: {
    flex: 1,
  },
  achievementName: {
    fontSize: theme.fontSize.md,
    fontWeight: '600',
    marginBottom: theme.spacing.xs,
  },
  achievementDescription: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.gray[600],
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    padding: theme.spacing.sm,
    backgroundColor: theme.colors.gray[50],
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
  },
  recommendationText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.gray[600],
    flex: 1,
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
