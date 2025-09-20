/**
 * ERROR ANALYTICS DASHBOARD
 * 
 * Comprehensive dashboard for monitoring:
 * - Error rates and trends
 * - Performance metrics
 * - User engagement analytics
 * - Top errors and issues
 * - Real-time monitoring
 */

import React, { useState, useEffect, memo } from 'react';
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
// Lazy loaded: react-native-safe-area-context
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Clock,
  Users,
  Activity,
  RefreshCw,
  Settings,
  Download,
  Share2,
} from '@/components/icons/LucideReplacement';
import { theme } from '@/constants/theme';
// import { getAnalyticsData, AnalyticsData } from '@/services/monitoringService';
import { centralizedErrorService } from '@/services/monitoring/centralizedErrorService';
import { SafeAreaView } from 'react-native-safe-area-context';
// import { lazyLoadLucideIcons } from '@/services/LazyDependencies';

const { width: screenWidth } = Dimensions.get('window');

interface ErrorAnalyticsDashboardProps {
  visible: boolean;
  onClose: () => void;
  showRealTime?: boolean;
  refreshInterval?: number; // in milliseconds
}

export const ErrorAnalyticsDashboard: React.FC<ErrorAnalyticsDashboardProps> = ({
  visible,
  onClose,
  showRealTime = false,
  refreshInterval = 30000, // 30 seconds
}) => {
  const [analyticsData, setAnalyticsData] = useState<any | null>(null);
  const [errorQueue, setErrorQueue] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [timeRange, setTimeRange] = useState<'1h' | '24h' | '7d' | '30d'>('24h');

  // Load analytics data
  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      const data = null; // Mock implementation
      const queue = centralizedErrorService.getErrorQueue();
      
      setAnalyticsData(data);
      setErrorQueue(queue);
      setLastRefresh(new Date());
    } catch (error) {
      console.error('Failed to load analytics data:', error);
      Alert.alert('Error', 'Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  // Auto-refresh for real-time monitoring
  useEffect(() => {
    if (!visible || !showRealTime) return;

    loadAnalyticsData();
    const interval = setInterval(loadAnalyticsData, refreshInterval);

    return () => clearInterval(interval);
  }, [visible, showRealTime, refreshInterval]);

  // Initial load
  useEffect(() => {
    if (visible) {
      loadAnalyticsData();
    }
  }, [visible]);

  // Format percentage
  const formatPercentage = (value: number) => `${value.toFixed(2)}%`;

  // Format duration
  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  };

  // Get status color based on error rate
  const getStatusColor = (errorRate: number) => {
    if (errorRate < 1) return theme.colors.success;
    if (errorRate < 5) return theme.colors.warning;
    return theme.colors.error;
  };

  // Get trend indicator
  const getTrendIcon = (current: number, previous: number) => {
    if (current > previous) return <TrendingUp size={16} color={theme.colors.error} />;
    if (current < previous) return <TrendingDown size={16} color={theme.colors.success} />;
    return <Activity size={16} color={theme.colors.textSecondary} />;
  };

  if (!visible) return null;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.title}>Error Analytics</Text>
          <Text style={styles.subtitle}>
            Last updated: {lastRefresh.toLocaleTimeString()}
          </Text>
        </View>
        
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.refreshButton}
            onPress={loadAnalyticsData}
            disabled={loading}
          >
            <RefreshCw 
              size={20} 
              color={theme.colors.primary}
              style={loading ? styles.spinning : undefined}
            />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>×</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={loadAnalyticsData} />
        }
      >
        {/* Time Range Selector */}
        <View style={styles.timeRangeContainer}>
          {(['1h', '24h', '7d', '30d'] as const).map((range) => (
            <TouchableOpacity
              key={range}
              style={[
                styles.timeRangeButton,
                timeRange === range && styles.timeRangeButtonActive,
              ]}
              onPress={() => setTimeRange(range)}
            >
              <Text
                style={[
                  styles.timeRangeButtonText,
                  timeRange === range && styles.timeRangeButtonTextActive,
                ]}
              >
                {range}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Overview Cards */}
        <View style={styles.overviewContainer}>
          <View style={styles.overviewCard}>
            <View style={styles.overviewCardHeader}>
              <AlertTriangle size={20} color={theme.colors.error} />
              <Text style={styles.overviewCardTitle}>Error Rate</Text>
            </View>
            <Text style={[styles.overviewCardValue, { color: getStatusColor(analyticsData?.errorRate || 0) }]}>
              {analyticsData ? formatPercentage(analyticsData.errorRate) : '0%'}
            </Text>
            <Text style={styles.overviewCardSubtitle}>
              {analyticsData?.topErrors.length || 0} unique errors
            </Text>
          </View>

          <View style={styles.overviewCard}>
            <View style={styles.overviewCardHeader}>
              <Activity size={20} color={theme.colors.warning} />
              <Text style={styles.overviewCardTitle}>Crash Rate</Text>
            </View>
            <Text style={[styles.overviewCardValue, { color: getStatusColor(analyticsData?.crashRate || 0) }]}>
              {analyticsData ? formatPercentage(analyticsData.crashRate) : '0%'}
            </Text>
            <Text style={styles.overviewCardSubtitle}>
              App crashes
            </Text>
          </View>

          <View style={styles.overviewCard}>
            <View style={styles.overviewCardHeader}>
              <Clock size={20} color={theme.colors.primary} />
              <Text style={styles.overviewCardTitle}>Avg Response</Text>
            </View>
            <Text style={styles.overviewCardValue}>
              {analyticsData && analyticsData.performanceMetrics.api 
                ? formatDuration(analyticsData.performanceMetrics.api)
                : '0ms'
              }
            </Text>
            <Text style={styles.overviewCardSubtitle}>
              API calls
            </Text>
          </View>

          <View style={styles.overviewCard}>
            <View style={styles.overviewCardHeader}>
              <Users size={20} color={theme.colors.secondary} />
              <Text style={styles.overviewCardTitle}>Active Users</Text>
            </View>
            <Text style={styles.overviewCardValue}>
              {analyticsData ? Object.keys(analyticsData.userEngagement).length : 0}
            </Text>
            <Text style={styles.overviewCardSubtitle}>
              This period
            </Text>
          </View>
        </View>

        {/* Top Errors */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Top Errors</Text>
            <TouchableOpacity style={styles.sectionAction}>
              <Text style={styles.sectionActionText}>View All</Text>
            </TouchableOpacity>
          </View>
          
          {analyticsData?.topErrors.length ? (
            analyticsData.topErrors.slice(0, 5).map((error: any, index: number) => (
              <View key={index} style={styles.errorItem}>
                <View style={styles.errorItemHeader}>
                  <Text style={styles.errorItemTitle} numberOfLines={2}>
                    {error.error}
                  </Text>
                  <Text style={styles.errorItemCount}>{error.count}</Text>
                </View>
                <View style={styles.errorItemBar}>
                  <View 
                    style={[
                      styles.errorItemBarFill,
                      { 
                        width: `${Math.min((error.count / analyticsData.topErrors[0].count) * 100, 100)}%`,
                        backgroundColor: theme.colors.error,
                      },
                    ]} 
                  />
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <AlertTriangle size={32} color={theme.colors.textTertiary} />
              <Text style={styles.emptyStateText}>No errors recorded</Text>
            </View>
          )}
        </View>

        {/* Performance Issues */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Performance Issues</Text>
            <TouchableOpacity style={styles.sectionAction}>
              <Text style={styles.sectionActionText}>View All</Text>
            </TouchableOpacity>
          </View>
          
          {analyticsData?.topPerformanceIssues.length ? (
            analyticsData.topPerformanceIssues.slice(0, 5).map((issue: any, index: number) => (
              <View key={index} style={styles.performanceItem}>
                <View style={styles.performanceItemHeader}>
                  <Text style={styles.performanceItemTitle} numberOfLines={1}>
                    {issue.issue}
                  </Text>
                  <Text style={styles.performanceItemDuration}>
                    {formatDuration(issue.avgDuration)}
                  </Text>
                </View>
                <View style={styles.performanceItemBar}>
                  <View 
                    style={[
                      styles.performanceItemBarFill,
                      { 
                        width: `${Math.min((issue.avgDuration / 5000) * 100, 100)}%`,
                        backgroundColor: issue.avgDuration > 3000 ? theme.colors.error : theme.colors.warning,
                      },
                    ]} 
                  />
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Clock size={32} color={theme.colors.textTertiary} />
              <Text style={styles.emptyStateText}>No performance issues</Text>
            </View>
          )}
        </View>

        {/* User Engagement */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>User Engagement</Text>
          </View>
          
          {analyticsData?.userEngagement && Object.keys(analyticsData.userEngagement).length ? (
            Object.entries(analyticsData.userEngagement).map(([event, count]) => (
              <View key={event} style={styles.engagementItem}>
                <Text style={styles.engagementItemEvent}>{event}</Text>
                <Text style={styles.engagementItemCount}>{String(count)}</Text>
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Users size={32} color={theme.colors.textTertiary} />
              <Text style={styles.emptyStateText}>No engagement data</Text>
            </View>
          )}
        </View>

        {/* Error Queue */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Errors</Text>
            <TouchableOpacity 
              style={styles.sectionAction}
              onPress={() => centralizedErrorService.clearErrorQueue()}
            >
              <Text style={styles.sectionActionText}>Clear</Text>
            </TouchableOpacity>
          </View>
          
          {errorQueue.length ? (
            errorQueue.slice(0, 3).map((error, index) => (
              <View key={index} style={styles.queueItem}>
                <Text style={styles.queueItemMessage} numberOfLines={2}>
                  {error.error.message}
                </Text>
                <Text style={styles.queueItemCategory}>
                  {error.category} • {error.severity}
                </Text>
                <Text style={styles.queueItemTime}>
                  {new Date(error.createdAt).toLocaleTimeString()}
                </Text>
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <BarChart3 size={32} color={theme.colors.textTertiary} />
              <Text style={styles.emptyStateText}>No recent errors</Text>
            </View>
          )}
        </View>

        {/* Actions */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.actionButton}>
            <Download size={16} color={theme.colors.primary} />
            <Text style={styles.actionButtonText}>Export Data</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <Share2 size={16} color={theme.colors.primary} />
            <Text style={styles.actionButtonText}>Share Report</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <Settings size={16} color={theme.colors.primary} />
            <Text style={styles.actionButtonText}>Settings</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerLeft: {
    flex: 1,
  },
  title: {
    fontSize: theme.fontSize.xl,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  subtitle: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  refreshButton: {
    padding: theme.spacing.sm,
    marginRight: theme.spacing.sm,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  spinning: {
    transform: [{ rotate: '360deg' }],
  },
  content: {
    flex: 1,
  },
  timeRangeContainer: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  timeRangeButton: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.surface,
  },
  timeRangeButtonActive: {
    backgroundColor: theme.colors.primary,
  },
  timeRangeButtonText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  timeRangeButtonTextActive: {
    color: theme.colors.white,
  },
  overviewContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  overviewCard: {
    width: (screenWidth - theme.spacing.lg * 2 - theme.spacing.md) / 2,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  overviewCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  overviewCardTitle: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginLeft: theme.spacing.sm,
    fontWeight: '500',
  },
  overviewCardValue: {
    fontSize: theme.fontSize.xl,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  overviewCardSubtitle: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textTertiary,
  },
  section: {
    marginTop: theme.spacing.xl,
    paddingHorizontal: theme.spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  sectionAction: {
    paddingVertical: theme.spacing.xs,
  },
  sectionActionText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.primary,
    fontWeight: '500',
  },
  errorItem: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  errorItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.sm,
  },
  errorItemTitle: {
    flex: 1,
    fontSize: theme.fontSize.sm,
    color: theme.colors.text,
    fontWeight: '500',
    marginRight: theme.spacing.sm,
  },
  errorItemCount: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    fontWeight: 'bold',
  },
  errorItemBar: {
    height: 4,
    backgroundColor: theme.colors.border,
    borderRadius: 2,
  },
  errorItemBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  performanceItem: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  performanceItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  performanceItemTitle: {
    flex: 1,
    fontSize: theme.fontSize.sm,
    color: theme.colors.text,
    fontWeight: '500',
    marginRight: theme.spacing.sm,
  },
  performanceItemDuration: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    fontWeight: 'bold',
  },
  performanceItemBar: {
    height: 4,
    backgroundColor: theme.colors.border,
    borderRadius: 2,
  },
  performanceItemBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  engagementItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  engagementItemEvent: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text,
    fontWeight: '500',
  },
  engagementItemCount: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    fontWeight: 'bold',
  },
  queueItem: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  queueItemMessage: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text,
    fontWeight: '500',
    marginBottom: theme.spacing.xs,
  },
  queueItemCategory: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  queueItemTime: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textTertiary,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
  },
  emptyStateText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textTertiary,
    marginTop: theme.spacing.sm,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.xl,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    marginTop: theme.spacing.xl,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
  },
  actionButtonText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.primary,
    fontWeight: '500',
    marginLeft: theme.spacing.xs,
  },
});

export default memo(ErrorAnalyticsDashboard);


ErrorAnalyticsDashboard.displayName = 'ErrorAnalyticsDashboard';
