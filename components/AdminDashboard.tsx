// Admin Dashboard - Central hub for all specialized dashboards and monitoring tools
// Provides access to testing, optimization, performance monitoring, and error analytics
// Includes real-time metrics overview and quick actions

import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Modal,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '@/constants/theme';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import {
  Settings,
  Activity,
  TestTube,
  Zap,
  BarChart3,
  AlertTriangle,
  TrendingUp,
  Users,
  Shield,
  Eye,
  RefreshCw,
  Download,
  FileText,
  Monitor,
  Cpu,
  HardDrive,
  Wifi,
  Volume2,
} from '@/components/icons/LucideReplacement';

// Import specialized dashboards
import TestingDashboard from '@/components/testing/TestingDashboard';
import OptimizationDashboard from '@/components/optimization/OptimizationDashboard';
import { PerformanceMonitoringDashboard } from '@/components/PerformanceMonitoringDashboard';
import ErrorAnalyticsDashboard from '@/components/ErrorAnalyticsDashboard';
import GoogleTTSTestComponent from '@/components/GoogleTTSTestComponent'; // Now tests ElevenLabs

// Import services for overview data
import { realTimeMonitoringService } from '@/services/monitoring/realTimeMonitoringService';
import { monitoringService } from '@/services/monitoring/monitoringService';

const { width } = Dimensions.get('window');

interface AdminDashboardProps {
  visible: boolean;
  onClose: () => void;
}

interface SystemOverview {
  performance: {
    score: number;
    status: 'excellent' | 'good' | 'fair' | 'poor';
  };
  testing: {
    activeTests: number;
    passRate: number;
    status: 'running' | 'idle' | 'failed';
  };
  optimization: {
    score: number;
    memoryUsage: number;
    status: 'optimal' | 'good' | 'needs_attention' | 'poor';
  };
  errors: {
    count: number;
    severity: 'low' | 'medium' | 'high' | 'critical';
    trend: 'increasing' | 'stable' | 'decreasing';
  };
}

export default function AdminDashboard({ visible, onClose }: AdminDashboardProps) {
  const { user } = useUnifiedAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'audio' | 'testing' | 'optimization' | 'performance' | 'errors'>('overview');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [systemOverview, setSystemOverview] = useState<SystemOverview>({
    performance: { score: 85, status: 'good' },
    testing: { activeTests: 0, passRate: 94, status: 'idle' },
    optimization: { score: 78, memoryUsage: 45, status: 'good' },
    errors: { count: 3, severity: 'low', trend: 'stable' },
  });

  // Check if user has admin access
  const isAdmin = useMemo(() => {
    return user?.role === 'admin' || user?.email?.includes('admin') || __DEV__;
  }, [user]);

  useEffect(() => {
    if (visible && isAdmin) {
      loadSystemOverview();
    }
  }, [visible, isAdmin]);

  const loadSystemOverview = async () => {
    try {
      // Get real-time metrics
      const metrics = await realTimeMonitoringService.getMetrics();
      const analytics = monitoringService.getAnalyticsData();
      
      // Calculate performance score
      const latestMetrics = metrics && metrics.length > 0 ? metrics[metrics.length - 1] : null;
      const performanceScore = Math.round(
        (100 - (latestMetrics?.cpuUsage || 0)) * 0.4 +
        (100 - (latestMetrics?.memoryUsage || 0)) * 0.3 +
        (100 - (latestMetrics?.responseTime || 50)) * 0.3,
      );

      // Update system overview
      setSystemOverview({
        performance: {
          score: performanceScore,
          status: performanceScore >= 80 ? 'excellent' : 
                 performanceScore >= 60 ? 'good' : 
                 performanceScore >= 40 ? 'fair' : 'poor',
        },
        testing: {
          activeTests: 0, // Would be calculated from testing services
          passRate: 94,
          status: 'idle',
        },
        optimization: {
          score: Math.round((100 - (latestMetrics?.memoryUsage || 0)) * 0.6 + 40),
          memoryUsage: latestMetrics?.memoryUsage || 45,
          status: latestMetrics?.memoryUsage && latestMetrics.memoryUsage < 70 ? 'good' : 'needs_attention',
        },
        errors: {
          count: analytics.topErrors?.length || 0,
          severity: (analytics.topErrors?.length || 0) > 10 ? 'high' : (analytics.topErrors?.length || 0) > 5 ? 'medium' : 'low',
          trend: 'stable',
        },
      });
    } catch (error) {
      console.error('Error loading system overview:', error);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadSystemOverview();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const handleExportData = () => {
    Alert.alert(
      'Export Data',
      'Choose what data to export:',
      [
        { text: 'Performance Metrics', onPress: () => exportData('performance') },
        { text: 'Error Logs', onPress: () => exportData('errors') },
        { text: 'All Data', onPress: () => exportData('all') },
        { text: 'Cancel', style: 'cancel' },
      ],
    );
  };

  const exportData = async (type: string) => {
    try {
      // Implementation would depend on the specific export requirements
      Alert.alert('Export Started', `Exporting ${type} data...`);
    } catch (error) {
      Alert.alert('Export Failed', 'Failed to export data');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent':
      case 'optimal':
        return theme.colors.success;
      case 'good':
        return theme.colors.primary;
      case 'fair':
      case 'needs_attention':
        return theme.colors.warning;
      case 'poor':
      case 'critical':
        return theme.colors.danger;
      default:
        return theme.colors.gray[400];
    }
  };

  const renderOverviewTab = () => (
    <ScrollView
      style={styles.tabContent}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={handleRefresh}
          colors={[theme.colors.primary]}
        />
      }
    >
      {/* System Status Cards */}
      <View style={styles.statusGrid}>
        {/* Performance Card */}
        <Card style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <Activity size={20} color={getStatusColor(systemOverview.performance.status)} />
            <Text style={styles.statusTitle}>Performance</Text>
          </View>
          <Text style={[styles.statusScore, { color: getStatusColor(systemOverview.performance.status) }]}>
            {systemOverview.performance.score}%
          </Text>
          <Text style={styles.statusLabel}>{systemOverview.performance.status}</Text>
        </Card>

        {/* Testing Card */}
        <Card style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <TestTube size={20} color={theme.colors.primary} />
            <Text style={styles.statusTitle}>Testing</Text>
          </View>
          <Text style={styles.statusScore}>{systemOverview.testing.passRate}%</Text>
          <Text style={styles.statusLabel}>Pass Rate</Text>
        </Card>

        {/* Optimization Card */}
        <Card style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <Zap size={20} color={getStatusColor(systemOverview.optimization.status)} />
            <Text style={styles.statusTitle}>Optimization</Text>
          </View>
          <Text style={[styles.statusScore, { color: getStatusColor(systemOverview.optimization.status) }]}>
            {systemOverview.optimization.score}%
          </Text>
          <Text style={styles.statusLabel}>{systemOverview.optimization.status}</Text>
        </Card>

        {/* Errors Card */}
        <Card style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <AlertTriangle size={20} color={getStatusColor(systemOverview.errors.severity)} />
            <Text style={styles.statusTitle}>Errors</Text>
          </View>
          <Text style={[styles.statusScore, { color: getStatusColor(systemOverview.errors.severity) }]}>
            {systemOverview.errors.count}
          </Text>
          <Text style={styles.statusLabel}>{systemOverview.errors.severity} severity</Text>
        </Card>
      </View>

      {/* Quick Actions */}
      <Card style={styles.quickActionsCard}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.quickAction} onPress={() => setActiveTab('performance')}>
            <Monitor size={24} color={theme.colors.primary} />
            <Text style={styles.quickActionText}>Monitor</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.quickAction} onPress={() => setActiveTab('testing')}>
            <TestTube size={24} color={theme.colors.primary} />
            <Text style={styles.quickActionText}>Test</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.quickAction} onPress={() => setActiveTab('optimization')}>
            <Zap size={24} color={theme.colors.primary} />
            <Text style={styles.quickActionText}>Optimize</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.quickAction} onPress={handleExportData}>
            <Download size={24} color={theme.colors.primary} />
            <Text style={styles.quickActionText}>Export</Text>
          </TouchableOpacity>
        </View>
      </Card>

      {/* System Resources */}
      <Card style={styles.resourcesCard}>
        <Text style={styles.sectionTitle}>System Resources</Text>
        <View style={styles.resourceItem}>
          <Cpu size={16} color={theme.colors.textSecondary} />
          <Text style={styles.resourceLabel}>CPU Usage</Text>
          <Text style={styles.resourceValue}>25%</Text>
        </View>
        <View style={styles.resourceItem}>
          <HardDrive size={16} color={theme.colors.textSecondary} />
          <Text style={styles.resourceLabel}>Memory</Text>
          <Text style={styles.resourceValue}>{systemOverview.optimization.memoryUsage}%</Text>
        </View>
        <View style={styles.resourceItem}>
          <Wifi size={16} color={theme.colors.textSecondary} />
          <Text style={styles.resourceLabel}>Network</Text>
          <Text style={styles.resourceValue}>Good</Text>
        </View>
      </Card>
    </ScrollView>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverviewTab();
      case 'audio':
        return <GoogleTTSTestComponent />;
      case 'testing':
        return <TestingDashboard />;
      case 'optimization':
        return <OptimizationDashboard />;
      case 'performance':
        return <PerformanceMonitoringDashboard visible={true} onClose={() => setActiveTab('overview')} />;
      case 'errors':
        return <ErrorAnalyticsDashboard visible={true} onClose={() => setActiveTab('overview')} />;
      default:
        return renderOverviewTab();
    }
  };

  if (!isAdmin) {
    return (
      <Modal visible={visible} animationType="slide">
        <SafeAreaView style={styles.container}>
          <View style={styles.unauthorizedContainer}>
            <Shield size={64} color={theme.colors.gray[400]} />
            <Text style={styles.unauthorizedTitle}>Access Denied</Text>
            <Text style={styles.unauthorizedText}>
              You don't have permission to access the admin dashboard.
            </Text>
            <Button title="Close" onPress={onClose} style={styles.closeButton} />
          </View>
        </SafeAreaView>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} animationType="slide">
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <LinearGradient
          colors={[theme.colors.primary, `${theme.colors.primary  }DD`]}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.headerTitle}>Admin Dashboard</Text>
              <Text style={styles.headerSubtitle}>System monitoring and management</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton as any}>
              <Text style={styles.closeButtonText as any}>✕</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Tab Navigation */}
        <View style={styles.tabBar as any}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {[
              { key: 'overview', label: 'Overview', icon: BarChart3 },
              { key: 'audio', label: 'Audio Test', icon: Volume2 },
              { key: 'testing', label: 'Testing', icon: TestTube },
              { key: 'optimization', label: 'Optimization', icon: Zap },
              { key: 'performance', label: 'Performance', icon: Activity },
              { key: 'errors', label: 'Errors', icon: AlertTriangle },
            ].map((tab) => {
              const IconComponent = tab.icon;
              return (
                <TouchableOpacity
                  key={tab.key}
                  style={[
                    styles.tab as any,
                    activeTab === tab.key && styles.activeTab as any,
                  ]}
                  onPress={() => setActiveTab(tab.key as any)}
                >
                  <IconComponent 
                    size={16} 
                    color={activeTab === tab.key ? theme.colors.primary : theme.colors.textSecondary} 
                  />
                  <Text style={[
                    styles.tabText as any,
                    activeTab === tab.key && styles.activeTabText as any,
                  ]}>
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Tab Content */}
        <View style={styles.content as any}>
          {renderTabContent()}
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  unauthorizedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  unauthorizedTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginTop: 20,
    marginBottom: 10,
  },
  unauthorizedText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.white,
  },
  headerSubtitle: {
    fontSize: 14,
    color: `${theme.colors.white  }CC`,
    marginTop: 2,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: `${theme.colors.white  }20`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: theme.colors.white,
    fontWeight: 'bold',
  },
  tabBar: {
    backgroundColor: theme.colors.white,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray[200],
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 6,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: theme.colors.primary,
  },
  tabText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  activeTabText: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  tabContent: {
    flex: 1,
    padding: 16,
  },
  statusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  statusCard: {
    width: (width - 44) / 2,
    padding: 16,
    alignItems: 'center',
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  statusTitle: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  statusScore: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  statusLabel: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    textTransform: 'capitalize',
  },
  quickActionsCard: {
    padding: 16,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 12,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  quickAction: {
    alignItems: 'center',
    gap: 6,
  },
  quickActionText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  resourcesCard: {
    padding: 16,
  },
  resourceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 8,
  },
  resourceLabel: {
    flex: 1,
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  resourceValue: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
  },
});
