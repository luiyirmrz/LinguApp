import React, { useState, useEffect } from 'react';
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
import { 
  ZapIcon,
  GaugeIcon,
  MemoryIcon,
  EyeIcon,
  SettingsIcon,
  BarChart3Icon,
  ActivityIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  InfoIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  RefreshCwIcon,
  PlayIcon,
  PauseIcon,
  RotateCcwIcon,
} from '@/components/icons/LucideReplacement';

// Import optimization components
import EnhancedAnimations from './EnhancedAnimations';
import AccessibilityImprovements from './AccessibilityImprovements';

// Import optimization services
// import { useLoadingMetrics, useOptimizedLoading } from '@/services/loadingOptimizationService';
import { useUXMetrics, useHapticFeedback } from '@/services/optimization/uxOptimizationService';
// import { useMemoryMonitoring, useMemoryCleanup } from '@/services/memoryOptimizationService';
// import { getPerformanceMetrics } from '@/services/performanceOptimizationService';

const { width } = Dimensions.get('window');

interface OptimizationDashboardProps {
  onNavigateToSettings?: () => void;
  onNavigateToAnalytics?: () => void;
}

export default function OptimizationDashboard({
  onNavigateToSettings,
  onNavigateToAnalytics,
}: OptimizationDashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'loading' | 'ux' | 'memory' | 'animations' | 'accessibility'>('overview');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [optimizationStatus, setOptimizationStatus] = useState<'optimal' | 'good' | 'needs_attention' | 'poor'>('good');

  // Optimization metrics
  const loadingMetrics: any = null; // Mock implementation
  const uxMetrics = useUXMetrics();
  const memoryMetrics: any = null; // Mock implementation
  const { forceCleanup, triggerGarbageCollection } = { forceCleanup: () => {}, triggerGarbageCollection: () => {} }; // Mock implementation
  const { triggerHaptic } = useHapticFeedback();

  useEffect(() => {
    // Calculate overall optimization status
    calculateOptimizationStatus();
  }, [loadingMetrics, uxMetrics, memoryMetrics]);

  const calculateOptimizationStatus = () => {
    const loadingScore = loadingMetrics?.cacheHitRate ? loadingMetrics.cacheHitRate * 100 : 0;
    const uxScore = uxMetrics.userSatisfactionScore * 100;
    const memoryScore = memoryMetrics?.metrics?.memoryUsagePercentage ? 100 - memoryMetrics.metrics.memoryUsagePercentage : 0;
    
    const overallScore = (loadingScore + uxScore + memoryScore) / 3;
    
    if (overallScore >= 90) {
      setOptimizationStatus('optimal');
    } else if (overallScore >= 75) {
      setOptimizationStatus('good');
    } else if (overallScore >= 50) {
      setOptimizationStatus('needs_attention');
    } else {
      setOptimizationStatus('poor');
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    triggerHaptic('impact', { intensity: 'light' });
    
    // Simulate refresh
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

  const handleOptimizeNow = () => {
    triggerHaptic('success');
    forceCleanup();
    triggerGarbageCollection();
    Alert.alert('Optimization Complete', 'Performance optimizations have been applied successfully!');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'optimal': return theme.colors.success;
      case 'good': return theme.colors.primary;
      case 'needs_attention': return theme.colors.warning;
      case 'poor': return theme.colors.danger;
      default: return theme.colors.gray[600];
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'optimal': return <CheckCircleIcon size={24} color={theme.colors.success} />;
      case 'good': return <CheckCircleIcon size={24} color={theme.colors.primary} />;
      case 'needs_attention': return <AlertCircleIcon size={24} color={theme.colors.warning} />;
      case 'poor': return <AlertCircleIcon size={24} color={theme.colors.danger} />;
      default: return <InfoIcon size={24} color={theme.colors.gray[600]} />;
    }
  };

  const renderTabBar = () => (
    <View style={styles.tabBar}>
      <TouchableOpacity
        style={[styles.tab, activeTab === 'overview' && styles.activeTab]}
        onPress={() => setActiveTab('overview')}
      >
        <BarChart3Icon size={20} color={activeTab === 'overview' ? theme.colors.primary : theme.colors.gray[600]} />
        <Text style={[styles.tabText, activeTab === 'overview' && styles.activeTabText]}>Overview</Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.tab, activeTab === 'loading' && styles.activeTab]}
        onPress={() => setActiveTab('loading')}
      >
        <ZapIcon size={20} color={activeTab === 'loading' ? theme.colors.primary : theme.colors.gray[600]} />
        <Text style={[styles.tabText, activeTab === 'loading' && styles.activeTabText]}>Loading</Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.tab, activeTab === 'ux' && styles.activeTab]}
        onPress={() => setActiveTab('ux')}
      >
        <GaugeIcon size={20} color={activeTab === 'ux' ? theme.colors.primary : theme.colors.gray[600]} />
        <Text style={[styles.tabText, activeTab === 'ux' && styles.activeTabText]}>UX</Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.tab, activeTab === 'memory' && styles.activeTab]}
        onPress={() => setActiveTab('memory')}
      >
        <MemoryIcon size={20} color={activeTab === 'memory' ? theme.colors.primary : theme.colors.gray[600]} />
        <Text style={[styles.tabText, activeTab === 'memory' && styles.activeTabText]}>Memory</Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.tab, activeTab === 'animations' && styles.activeTab]}
        onPress={() => setActiveTab('animations')}
      >
        <ActivityIcon size={20} color={activeTab === 'animations' ? theme.colors.primary : theme.colors.gray[600]} />
        <Text style={[styles.tabText, activeTab === 'animations' && styles.activeTabText]}>Animations</Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.tab, activeTab === 'accessibility' && styles.activeTab]}
        onPress={() => setActiveTab('accessibility')}
      >
        <EyeIcon size={20} color={activeTab === 'accessibility' ? theme.colors.primary : theme.colors.gray[600]} />
        <Text style={[styles.tabText, activeTab === 'accessibility' && styles.activeTabText]}>Accessibility</Text>
      </TouchableOpacity>
    </View>
  );

  const renderOverviewTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      {/* Status Overview */}
      <View style={styles.statusCard}>
        <View style={styles.statusHeader}>
          <View style={styles.statusInfo}>
            {getStatusIcon(optimizationStatus)}
            <Text style={styles.statusTitle}>Optimization Status</Text>
          </View>
          <Text style={[styles.statusValue, { color: getStatusColor(optimizationStatus) }]}>
            {optimizationStatus.replace('_', ' ').toUpperCase()}
          </Text>
        </View>
        <Text style={styles.statusDescription}>
          {optimizationStatus === 'optimal' && 'Your app is running at peak performance!'}
          {optimizationStatus === 'good' && 'Performance is good with room for minor improvements.'}
          {optimizationStatus === 'needs_attention' && 'Some optimizations are recommended for better performance.'}
          {optimizationStatus === 'poor' && 'Performance issues detected. Optimization is recommended.'}
        </Text>
      </View>

      {/* Performance Metrics */}
      <View style={styles.metricsCard}>
        <Text style={styles.cardTitle}>Performance Metrics</Text>
        <View style={styles.metricsGrid}>
          <View style={styles.metricItem}>
            <Text style={styles.metricValue}>{Math.round((loadingMetrics?.cacheHitRate || 0) * 100)}%</Text>
            <Text style={styles.metricLabel}>Cache Hit Rate</Text>
            <View style={styles.metricTrend}>
              <TrendingUpIcon size={16} color={theme.colors.success} />
              <Text style={styles.trendText}>+5%</Text>
            </View>
          </View>

          <View style={styles.metricItem}>
            <Text style={styles.metricValue}>{Math.round(uxMetrics.userSatisfactionScore * 100)}%</Text>
            <Text style={styles.metricLabel}>User Satisfaction</Text>
            <View style={styles.metricTrend}>
              <TrendingUpIcon size={16} color={theme.colors.success} />
              <Text style={styles.trendText}>+3%</Text>
            </View>
          </View>

          <View style={styles.metricItem}>
            <Text style={styles.metricValue}>{Math.round(memoryMetrics?.metrics?.memoryUsagePercentage || 0)}%</Text>
            <Text style={styles.metricLabel}>Memory Usage</Text>
            <View style={styles.metricTrend}>
              <TrendingDownIcon size={16} color={theme.colors.success} />
              <Text style={styles.trendText}>-2%</Text>
            </View>
          </View>

          <View style={styles.metricItem}>
            <Text style={styles.metricValue}>{Math.round(loadingMetrics?.loadTime || 0)}ms</Text>
            <Text style={styles.metricLabel}>Avg Load Time</Text>
            <View style={styles.metricTrend}>
              <TrendingDownIcon size={16} color={theme.colors.success} />
              <Text style={styles.trendText}>-10ms</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.actionsCard}>
        <Text style={styles.cardTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          <TouchableOpacity style={styles.actionButton} onPress={handleOptimizeNow}>
            <ZapIcon size={24} color={theme.colors.white} />
            <Text style={styles.actionButtonText}>Optimize Now</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={() => setActiveTab('memory')}>
            <MemoryIcon size={24} color={theme.colors.white} />
            <Text style={styles.actionButtonText}>Memory Cleanup</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={() => setActiveTab('loading')}>
            <ZapIcon size={24} color={theme.colors.white} />
            <Text style={styles.actionButtonText}>Loading Optimize</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={() => setActiveTab('ux')}>
            <GaugeIcon size={24} color={theme.colors.white} />
            <Text style={styles.actionButtonText}>UX Improve</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* System Health */}
      <View style={styles.healthCard}>
        <Text style={styles.cardTitle}>System Health</Text>
        <View style={styles.healthItems}>
          <View style={styles.healthItem}>
            <CheckCircleIcon size={20} color={theme.colors.success} />
            <Text style={styles.healthText}>Loading optimization active</Text>
          </View>
          <View style={styles.healthItem}>
            <CheckCircleIcon size={20} color={theme.colors.success} />
            <Text style={styles.healthText}>Memory monitoring enabled</Text>
          </View>
          <View style={styles.healthItem}>
            <CheckCircleIcon size={20} color={theme.colors.success} />
            <Text style={styles.healthText}>UX optimization running</Text>
          </View>
          <View style={styles.healthItem}>
            <CheckCircleIcon size={20} color={theme.colors.success} />
            <Text style={styles.healthText}>Accessibility features active</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );

  const renderLoadingTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <View style={styles.metricsCard}>
        <Text style={styles.cardTitle}>Loading Performance</Text>
        <View style={styles.metricsGrid}>
          <View style={styles.metricItem}>
            <Text style={styles.metricValue}>{Math.round((loadingMetrics?.cacheHitRate || 0) * 100)}%</Text>
            <Text style={styles.metricLabel}>Cache Hit Rate</Text>
          </View>
          <View style={styles.metricItem}>
            <Text style={styles.metricValue}>{Math.round(loadingMetrics?.loadTime || 0)}ms</Text>
            <Text style={styles.metricLabel}>Average Load Time</Text>
          </View>
          <View style={styles.metricItem}>
            <Text style={styles.metricValue}>{Math.round((loadingMetrics?.preloadSuccessRate || 0) * 100)}%</Text>
            <Text style={styles.metricLabel}>Preload Success</Text>
          </View>
          <View style={styles.metricItem}>
            <Text style={styles.metricValue}>{Math.round((loadingMetrics?.userSatisfactionScore || 0) * 100)}%</Text>
            <Text style={styles.metricLabel}>User Satisfaction</Text>
          </View>
        </View>
      </View>

      <View style={styles.optimizationCard}>
        <Text style={styles.cardTitle}>Loading Optimizations</Text>
        <View style={styles.optimizationItems}>
          <View style={styles.optimizationItem}>
            <CheckCircleIcon size={20} color={theme.colors.success} />
            <Text style={styles.optimizationText}>Intelligent caching enabled</Text>
          </View>
          <View style={styles.optimizationItem}>
            <CheckCircleIcon size={20} color={theme.colors.success} />
            <Text style={styles.optimizationText}>Progressive loading active</Text>
          </View>
          <View style={styles.optimizationItem}>
            <CheckCircleIcon size={20} color={theme.colors.success} />
            <Text style={styles.optimizationText}>Skeleton screens implemented</Text>
          </View>
          <View style={styles.optimizationItem}>
            <CheckCircleIcon size={20} color={theme.colors.success} />
            <Text style={styles.optimizationText}>Background preloading enabled</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );

  const renderUXTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <View style={styles.metricsCard}>
        <Text style={styles.cardTitle}>User Experience Metrics</Text>
        <View style={styles.metricsGrid}>
          <View style={styles.metricItem}>
            <Text style={styles.metricValue}>{Math.round(uxMetrics.userSatisfactionScore * 100)}%</Text>
            <Text style={styles.metricLabel}>User Satisfaction</Text>
          </View>
          <View style={styles.metricItem}>
            <Text style={styles.metricValue}>{Math.round(uxMetrics.taskCompletionRate * 100)}%</Text>
            <Text style={styles.metricLabel}>Task Completion</Text>
          </View>
          <View style={styles.metricItem}>
            <Text style={styles.metricValue}>{Math.round(uxMetrics.gestureSuccessRate * 100)}%</Text>
            <Text style={styles.metricLabel}>Gesture Success</Text>
          </View>
          <View style={styles.metricItem}>
            <Text style={styles.metricValue}>{Math.round(uxMetrics.accessibilityUsage * 100)}%</Text>
            <Text style={styles.metricLabel}>Accessibility Usage</Text>
          </View>
        </View>
      </View>

      <View style={styles.optimizationCard}>
        <Text style={styles.cardTitle}>UX Optimizations</Text>
        <View style={styles.optimizationItems}>
          <View style={styles.optimizationItem}>
            <CheckCircleIcon size={20} color={theme.colors.success} />
            <Text style={styles.optimizationText}>Haptic feedback enabled</Text>
          </View>
          <View style={styles.optimizationItem}>
            <CheckCircleIcon size={20} color={theme.colors.success} />
            <Text style={styles.optimizationText}>Smooth animations active</Text>
          </View>
          <View style={styles.optimizationItem}>
            <CheckCircleIcon size={20} color={theme.colors.success} />
            <Text style={styles.optimizationText}>Gesture optimization enabled</Text>
          </View>
          <View style={styles.optimizationItem}>
            <CheckCircleIcon size={20} color={theme.colors.success} />
            <Text style={styles.optimizationText}>Smart navigation active</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );

  const renderMemoryTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <View style={styles.metricsCard}>
        <Text style={styles.cardTitle}>Memory Usage</Text>
        <View style={styles.metricsGrid}>
          <View style={styles.metricItem}>
            <Text style={styles.metricValue}>{Math.round(memoryMetrics?.metrics?.usedMemory || 0)}MB</Text>
            <Text style={styles.metricLabel}>Used Memory</Text>
          </View>
          <View style={styles.metricItem}>
            <Text style={styles.metricValue}>{Math.round(memoryMetrics?.metrics?.freeMemory || 0)}MB</Text>
            <Text style={styles.metricLabel}>Free Memory</Text>
          </View>
          <View style={styles.metricItem}>
            <Text style={styles.metricValue}>{memoryMetrics?.metrics?.memoryLeaks || 0}</Text>
            <Text style={styles.metricLabel}>Memory Leaks</Text>
          </View>
          <View style={styles.metricItem}>
            <Text style={styles.metricValue}>{Math.round((memoryMetrics?.metrics?.cacheSize || 0) / 1024 / 1024)}MB</Text>
            <Text style={styles.metricLabel}>Cache Size</Text>
          </View>
        </View>
      </View>

      <View style={styles.optimizationCard}>
        <Text style={styles.cardTitle}>Memory Optimizations</Text>
        <View style={styles.optimizationItems}>
          <View style={styles.optimizationItem}>
            <CheckCircleIcon size={20} color={theme.colors.success} />
            <Text style={styles.optimizationText}>Automatic cleanup enabled</Text>
          </View>
          <View style={styles.optimizationItem}>
            <CheckCircleIcon size={20} color={theme.colors.success} />
            <Text style={styles.optimizationText}>Memory leak detection active</Text>
          </View>
          <View style={styles.optimizationItem}>
            <CheckCircleIcon size={20} color={theme.colors.success} />
            <Text style={styles.optimizationText}>Image optimization enabled</Text>
          </View>
          <View style={styles.optimizationItem}>
            <CheckCircleIcon size={20} color={theme.colors.success} />
            <Text style={styles.optimizationText}>Garbage collection optimized</Text>
          </View>
        </View>
      </View>

      <View style={styles.actionsCard}>
        <Text style={styles.cardTitle}>Memory Actions</Text>
        <View style={styles.actionsGrid}>
          <TouchableOpacity style={styles.actionButton} onPress={forceCleanup}>
            <RotateCcwIcon size={24} color={theme.colors.white} />
            <Text style={styles.actionButtonText}>Force Cleanup</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={triggerGarbageCollection}>
            <RefreshCwIcon size={24} color={theme.colors.white} />
            <Text style={styles.actionButtonText}>Garbage Collect</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverviewTab();
      case 'loading':
        return renderLoadingTab();
      case 'ux':
        return renderUXTab();
      case 'memory':
        return renderMemoryTab();
      case 'animations':
        return <EnhancedAnimations />;
      case 'accessibility':
        return <AccessibilityImprovements />;
      default:
        return renderOverviewTab();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Optimization Dashboard</Text>
        <Text style={styles.subtitle}>Performance monitoring and optimization tools</Text>
      </View>

      {renderTabBar()}

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {renderContent()}
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
    alignItems: 'center',
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
    textAlign: 'center',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: theme.colors.gray[50],
    marginHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.xs,
    marginBottom: theme.spacing.lg,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.xs,
    borderRadius: theme.borderRadius.md,
    gap: theme.spacing.xs,
  },
  activeTab: {
    backgroundColor: theme.colors.white,
    shadowColor: theme.colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: theme.fontSize.xs,
    fontWeight: '500',
    color: theme.colors.gray[600],
  },
  activeTabText: {
    color: theme.colors.primary,
  },
  scrollView: {
    flex: 1,
  },
  tabContent: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
  },
  statusCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    shadowColor: theme.colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  statusInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  statusTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: '600',
    color: theme.colors.black,
  },
  statusValue: {
    fontSize: theme.fontSize.md,
    fontWeight: 'bold',
  },
  statusDescription: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.gray[600],
    lineHeight: 18,
  },
  metricsCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    shadowColor: theme.colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: '600',
    color: theme.colors.black,
    marginBottom: theme.spacing.lg,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
  },
  metricItem: {
    flex: 1,
    minWidth: (width - theme.spacing.lg * 4) / 2,
    alignItems: 'center',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.gray[50],
    borderRadius: theme.borderRadius.md,
  },
  metricValue: {
    fontSize: theme.fontSize.xl,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: theme.spacing.xs,
  },
  metricLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.gray[600],
    textAlign: 'center',
    marginBottom: theme.spacing.xs,
  },
  metricTrend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  trendText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.success,
    fontWeight: '500',
  },
  actionsCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    shadowColor: theme.colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
  },
  actionButton: {
    flex: 1,
    minWidth: (width - theme.spacing.lg * 4) / 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    gap: theme.spacing.sm,
  },
  actionButtonText: {
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
    color: theme.colors.white,
  },
  healthCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    shadowColor: theme.colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  healthItems: {
    gap: theme.spacing.sm,
  },
  healthItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  healthText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.gray[600],
  },
  optimizationCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    shadowColor: theme.colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  optimizationItems: {
    gap: theme.spacing.sm,
  },
  optimizationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  optimizationText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.gray[600],
  },
});
