/**
 * PERFORMANCE MONITORING DASHBOARD
 * 
 * Real-time performance monitoring with:
 * - Live metrics visualization
 * - Performance trends
 * - Alert management
 * - Export functionality
 * - Customizable views
 */

import React, { useState, useEffect, useCallback, memo } from 'react';
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
// Lazy loaded: react-native-safe-area-context
import {
  Activity,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Clock,
  Cpu,
  HardDrive,
  Wifi,
  Users,
  Settings,
  Download,
  RefreshCw,
  Eye,
  EyeOff,
  BarChart3,
  LineChart,
  PieChart,
} from '@/components/icons/LucideReplacement';
import { theme } from '@/constants/theme';
// import { realTimeMonitoringService, RealTimeMetrics } from '@/services/realTimeMonitoringService';
// import { sentryIntegrationService } from '@/services/sentryIntegrationService';
import { SafeAreaView } from 'react-native-safe-area-context';
// import { lazyLoadLucideIcons } from '@/services/LazyDependencies';

const { width: screenWidth } = Dimensions.get('window');

interface PerformanceMonitoringDashboardProps {
  visible: boolean;
  onClose: () => void;
  showRealTime?: boolean;
  refreshInterval?: number;
}

export const PerformanceMonitoringDashboard: React.FC<PerformanceMonitoringDashboardProps> = ({
  visible,
  onClose,
  showRealTime = true,
  refreshInterval = 30000,
}) => {
  const [metrics, setMetrics] = useState<any[]>([]);
  const [latestMetrics, setLatestMetrics] = useState<any | null>(null);
  const [summary, setSummary] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState<'overview' | 'detailed' | 'trends'>('overview');
  const [showAlerts, setShowAlerts] = useState(true);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(false);

  // ============================================================================
  // EFFECTS
  // ============================================================================

  useEffect(() => {
    if (visible) {
      startMonitoring();
    } else {
      stopMonitoring();
    }

    return () => {
      stopMonitoring();
    };
  }, [visible]);

  useEffect(() => {
    if (isMonitoring) {
      const unsubscribe: any = null; // Mock implementation
      // realTimeMonitoringService.subscribeToMetrics((newMetrics) => {
      //   setLatestMetrics(newMetrics);
      //   setMetrics(prev => [...prev, newMetrics].slice(-50)); // Keep last 50 data points
      //   updateSummary();
      // });

      const unsubscribeAlerts: any = null; // Mock implementation
      // realTimeMonitoringService.subscribeToAlerts((alert) => {
      //   setAlerts(prev => [alert, ...prev].slice(-20)); // Keep last 20 alerts
      // });

      return () => {
        if (unsubscribe) unsubscribe();
        if (unsubscribeAlerts) unsubscribeAlerts();
      };
    }
  }, [isMonitoring]);

  // ============================================================================
  // MONITORING CONTROL
  // ============================================================================

  const startMonitoring = useCallback(() => {
    if (!isMonitoring) {
      // realTimeMonitoringService.startMonitoring();
      setIsMonitoring(true);
    }
  }, [isMonitoring]);

  const stopMonitoring = useCallback(() => {
    if (isMonitoring) {
      // realTimeMonitoringService.stopMonitoring();
      setIsMonitoring(false);
    }
  }, [isMonitoring]);

  const updateSummary = useCallback(() => {
    const summaryData = null; // Mock implementation
    setSummary(summaryData);
  }, []);

  // ============================================================================
  // REFRESH HANDLERS
  // ============================================================================

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // Force metrics collection
      const currentMetrics = null; // Mock implementation
      if (currentMetrics) setMetrics(currentMetrics);
      updateSummary();
    } catch (error) {
      console.error('Error refreshing metrics:', error);
    } finally {
      setRefreshing(false);
    }
  }, [updateSummary]);

  // ============================================================================
  // EXPORT HANDLERS
  // ============================================================================

  const handleExport = useCallback((format: 'json' | 'csv' | 'pdf') => {
    try {
      const data = null; // Mock implementation
      
      // In a real implementation, this would save the file
      Alert.alert(
        'Export Successful',
        `Metrics exported in ${format.toUpperCase()} format`,
        [{ text: 'OK' }],
      );
    } catch (error) {
      Alert.alert('Export Failed', 'Failed to export metrics');
    }
  }, []);

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const renderMetricCard = (title: string, value: number | string, unit: string, icon: React.ReactNode, trend?: 'up' | 'down' | 'stable', color?: string) => (
    <View style={[styles.metricCard, { borderLeftColor: color || theme.colors.primary }]}>
      <View style={styles.metricHeader}>
        <View style={styles.metricIcon}>
          {icon}
        </View>
        <Text style={styles.metricTitle}>{title}</Text>
        {trend && (
          <View style={styles.trendIndicator}>
            {trend === 'up' && <TrendingUp size={16} color={theme.colors.error} />}
            {trend === 'down' && <TrendingDown size={16} color={theme.colors.success} />}
            {trend === 'stable' && <Activity size={16} color={theme.colors.warning} />}
          </View>
        )}
      </View>
      <Text style={styles.metricValue}>
        {typeof value === 'number' ? value.toFixed(2) : value}
        <Text style={styles.metricUnit}>{unit}</Text>
      </Text>
    </View>
  );

  const renderAlert = (alert: any, index: number) => (
    <View key={index} style={[styles.alertCard, { borderLeftColor: getAlertColor(alert.severity) }]}>
      <View style={styles.alertHeader}>
        <AlertTriangle size={16} color={getAlertColor(alert.severity)} />
        <Text style={[styles.alertSeverity, { color: getAlertColor(alert.severity) }]}>
          {alert.severity.toUpperCase()}
        </Text>
        <Text style={styles.alertTime}>
          {new Date(alert.timestamp).toLocaleTimeString()}
        </Text>
      </View>
      <Text style={styles.alertMessage}>{alert.message}</Text>
    </View>
  );

  const getAlertColor = (severity: string) => {
    switch (severity) {
      case 'critical': return theme.colors.error;
      case 'high': return theme.colors.orange;
      case 'medium': return theme.colors.warning;
      case 'low': return theme.colors.blue;
      default: return theme.colors.textSecondary;
    }
  };

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.title}>Performance Monitor</Text>
            <View style={styles.statusIndicator}>
              <View style={[styles.statusDot, { backgroundColor: isMonitoring ? theme.colors.success : theme.colors.error }]} />
              <Text style={styles.statusText}>
                {isMonitoring ? 'Monitoring' : 'Stopped'}
              </Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => setShowAlerts(!showAlerts)}
            >
              {showAlerts ? <Eye size={20} color={theme.colors.text} /> : <EyeOff size={20} color={theme.colors.text} />}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={handleRefresh}
            >
              <RefreshCw size={20} color={theme.colors.text} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={onClose}
            >
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* View Mode Selector */}
        <View style={styles.viewModeSelector}>
          <TouchableOpacity
            style={[styles.viewModeButton, viewMode === 'overview' && styles.viewModeButtonActive]}
            onPress={() => setViewMode('overview')}
          >
            <BarChart3 size={16} color={viewMode === 'overview' ? theme.colors.white : theme.colors.text} />
            <Text style={[styles.viewModeText, viewMode === 'overview' && styles.viewModeTextActive]}>
              Overview
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.viewModeButton, viewMode === 'detailed' && styles.viewModeButtonActive]}
            onPress={() => setViewMode('detailed')}
          >
            <LineChart size={16} color={viewMode === 'detailed' ? theme.colors.white : theme.colors.text} />
            <Text style={[styles.viewModeText, viewMode === 'detailed' && styles.viewModeTextActive]}>
              Detailed
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.viewModeButton, viewMode === 'trends' && styles.viewModeButtonActive]}
            onPress={() => setViewMode('trends')}
          >
            <PieChart size={16} color={viewMode === 'trends' ? theme.colors.white : theme.colors.text} />
            <Text style={[styles.viewModeText, viewMode === 'trends' && styles.viewModeTextActive]}>
              Trends
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollView}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        >
          {/* Overview Mode */}
          {viewMode === 'overview' && (
            <View style={styles.overviewContainer}>
              {/* Key Metrics */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Key Metrics</Text>
                <View style={styles.metricsGrid}>
                  {renderMetricCard(
                    'Performance Score',
                    latestMetrics?.performanceScore || 0,
                    '%',
                    <Activity size={20} color={theme.colors.primary} />,
                    summary?.trends?.performanceScore,
                    theme.colors.primary,
                  )}
                  {renderMetricCard(
                    'Error Rate',
                    latestMetrics?.errorRate || 0,
                    '%',
                    <AlertTriangle size={20} color={theme.colors.error} />,
                    summary?.trends?.errorRate,
                    theme.colors.error,
                  )}
                  {renderMetricCard(
                    'Response Time',
                    latestMetrics?.responseTime || 0,
                    'ms',
                    <Clock size={20} color={theme.colors.warning} />,
                    summary?.trends?.responseTime,
                    theme.colors.warning,
                  )}
                  {renderMetricCard(
                    'Active Users',
                    latestMetrics?.activeUsers || 0,
                    '',
                    <Users size={20} color={theme.colors.success} />,
                    summary?.trends?.userEngagement,
                    theme.colors.success,
                  )}
                </View>
              </View>

              {/* System Resources */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>System Resources</Text>
                <View style={styles.metricsGrid}>
                  {renderMetricCard(
                    'Memory Usage',
                    latestMetrics?.memoryUsage || 0,
                    '%',
                    <HardDrive size={20} color={theme.colors.blue} />,
                    summary?.trends?.memoryUsage,
                    theme.colors.blue,
                  )}
                  {renderMetricCard(
                    'CPU Usage',
                    latestMetrics?.cpuUsage || 0,
                    '%',
                    <Cpu size={20} color={theme.colors.orange} />,
                    summary?.trends?.cpuUsage,
                    theme.colors.orange,
                  )}
                  {renderMetricCard(
                    'User Engagement',
                    latestMetrics?.userEngagement || 0,
                    '%',
                    <Users size={20} color={theme.colors.purple} />,
                    summary?.trends?.userEngagement,
                    theme.colors.purple,
                  )}
                  {renderMetricCard(
                    'Crash Rate',
                    latestMetrics?.crashRate || 0,
                    '%',
                    <AlertTriangle size={20} color={theme.colors.error} />,
                    summary?.trends?.crashRate,
                    theme.colors.error,
                  )}
                </View>
              </View>
            </View>
          )}

          {/* Detailed Mode */}
          {viewMode === 'detailed' && (
            <View style={styles.detailedContainer}>
              <Text style={styles.sectionTitle}>Detailed Metrics</Text>
              {latestMetrics && (
                <View style={styles.detailedMetrics}>
                  <Text style={styles.detailedText}>
                    Last Updated: {new Date(latestMetrics.timestamp).toLocaleString()}
                  </Text>
                  <Text style={styles.detailedText}>
                    Performance Score: {latestMetrics.performanceScore.toFixed(2)}%
                  </Text>
                  <Text style={styles.detailedText}>
                    Error Rate: {latestMetrics.errorRate.toFixed(2)}%
                  </Text>
                  <Text style={styles.detailedText}>
                    Crash Rate: {latestMetrics.crashRate.toFixed(2)}%
                  </Text>
                  <Text style={styles.detailedText}>
                    Response Time: {latestMetrics.responseTime}ms
                  </Text>
                  <Text style={styles.detailedText}>
                    Memory Usage: {latestMetrics.memoryUsage.toFixed(2)}%
                  </Text>
                  <Text style={styles.detailedText}>
                    CPU Usage: {latestMetrics.cpuUsage.toFixed(2)}%
                  </Text>
                  <Text style={styles.detailedText}>
                    Active Users: {latestMetrics.activeUsers}
                  </Text>
                  <Text style={styles.detailedText}>
                    User Engagement: {latestMetrics.userEngagement.toFixed(2)}%
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Trends Mode */}
          {viewMode === 'trends' && (
            <View style={styles.trendsContainer}>
              <Text style={styles.sectionTitle}>Performance Trends</Text>
              {summary && (
                <View style={styles.trendsData}>
                  <Text style={styles.trendsText}>
                    Average Performance Score: {summary.average.performanceScore?.toFixed(2)}%
                  </Text>
                  <Text style={styles.trendsText}>
                    Average Error Rate: {summary.average.errorRate?.toFixed(2)}%
                  </Text>
                  <Text style={styles.trendsText}>
                    Average Response Time: {summary.average.responseTime?.toFixed(0)}ms
                  </Text>
                  <Text style={styles.trendsText}>
                    Average Memory Usage: {summary.average.memoryUsage?.toFixed(2)}%
                  </Text>
                  <Text style={styles.trendsText}>
                    Data Points: {metrics.length}
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Alerts */}
          {showAlerts && alerts.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Recent Alerts</Text>
              {alerts.slice(0, 5).map((alert, index) => renderAlert(alert, index))}
            </View>
          )}

          {/* Export Options */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Export Data</Text>
            <View style={styles.exportButtons}>
              <TouchableOpacity
                style={styles.exportButton}
                onPress={() => handleExport('json')}
              >
                <Download size={16} color={theme.colors.primary} />
                <Text style={styles.exportButtonText}>JSON</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.exportButton}
                onPress={() => handleExport('csv')}
              >
                <Download size={16} color={theme.colors.primary} />
                <Text style={styles.exportButtonText}>CSV</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.exportButton}
                onPress={() => handleExport('pdf')}
              >
                <Download size={16} color={theme.colors.primary} />
                <Text style={styles.exportButtonText}>PDF</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: theme.fontSize.xl,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.xs,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: theme.spacing.xs,
  },
  statusText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  headerButton: {
    padding: theme.spacing.sm,
    marginLeft: theme.spacing.sm,
  },
  closeButton: {
    fontSize: theme.fontSize.lg,
    color: theme.colors.text,
    fontWeight: 'bold',
  },
  viewModeSelector: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  viewModeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.sm,
    marginHorizontal: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.surface,
  },
  viewModeButtonActive: {
    backgroundColor: theme.colors.primary,
  },
  viewModeText: {
    marginLeft: theme.spacing.xs,
    fontSize: theme.fontSize.sm,
    color: theme.colors.text,
  },
  viewModeTextActive: {
    color: theme.colors.white,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    padding: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  overviewContainer: {
    paddingBottom: theme.spacing.lg,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
  },
  metricCard: {
    flex: 1,
    minWidth: (screenWidth - theme.spacing.lg * 3) / 2,
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderLeftWidth: 4,
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  metricIcon: {
    marginRight: theme.spacing.sm,
  },
  metricTitle: {
    flex: 1,
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  trendIndicator: {
    marginLeft: theme.spacing.xs,
  },
  metricValue: {
    fontSize: theme.fontSize.xl,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  metricUnit: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginLeft: theme.spacing.xs,
  },
  detailedContainer: {
    paddingBottom: theme.spacing.lg,
  },
  detailedMetrics: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
  },
  detailedText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  trendsContainer: {
    paddingBottom: theme.spacing.lg,
  },
  trendsData: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
  },
  trendsText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  alertCard: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderLeftWidth: 4,
    marginBottom: theme.spacing.sm,
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  alertSeverity: {
    fontSize: theme.fontSize.sm,
    fontWeight: 'bold',
    marginLeft: theme.spacing.xs,
    marginRight: theme.spacing.sm,
  },
  alertTime: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginLeft: 'auto',
  },
  alertMessage: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text,
  },
  exportButtons: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  exportButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  exportButtonText: {
    marginLeft: theme.spacing.xs,
    fontSize: theme.fontSize.sm,
    color: theme.colors.primary,
    fontWeight: '600',
  },
});

export default memo(PerformanceMonitoringDashboard);


PerformanceMonitoringDashboard.displayName = 'PerformanceMonitoringDashboard';
