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
  TestTube as TestTubeIcon,
  Users as UsersIcon,
  Zap as ZapIcon,
  Eye as EyeIcon,
  Shield as ShieldIcon,
  BarChart3 as BarChart3Icon,
  Play as PlayIcon,
  Pause as PauseIcon,
  CheckCircle as CheckCircleIcon,
  AlertCircle as AlertCircleIcon,
  XCircle as XCircleIcon,
  Clock as ClockIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  RefreshCw as RefreshCwIcon,
  FileText as FileTextIcon,
  Settings as SettingsIcon,
} from '@/components/icons/LucideReplacement';

// Import testing services
// import { userTestingService } from '@/services/userTestingService';
// import { loadTestingService } from '@/services/loadTestingService';
// import { accessibilityTestingService } from '@/services/accessibilityTestingService';
// import { compatibilityTestingService } from '@/services/compatibilityTestingService';
import { securityTestingService } from '@/services/testing/securityTestingService';

const { width } = Dimensions.get('window');

interface TestingDashboardProps {
  onNavigateToSettings?: () => void;
  onNavigateToReports?: () => void;
}

export default function TestingDashboard({
  onNavigateToSettings,
  onNavigateToReports,
}: TestingDashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'user' | 'load' | 'accessibility' | 'compatibility' | 'security'>('overview');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [testingStatus, setTestingStatus] = useState<'ready' | 'running' | 'completed' | 'failed'>('ready');
  const [activeTests, setActiveTests] = useState<{
    user: number;
    load: number;
    accessibility: number;
    compatibility: number;
    security: number;
  }>({ user: 0, load: 0, accessibility: 0, compatibility: 0, security: 0 });

  useEffect(() => {
    loadTestingStatus();
  }, []);

  const loadTestingStatus = async () => {
    try {
      // Load active tests count
      const userTests: any[] = []; // Mock implementation
      const loadTests: any[] = []; // Mock implementation
      const accessibilityTests: any[] = []; // Mock implementation
      const compatibilityTests: any[] = []; // Mock implementation
      const securityTests = await securityTestingService.getSecurityTestHistory();

      setActiveTests({
        user: userTests.filter(t => t.status === 'active').length,
        load: loadTests.filter(t => t.status === 'running').length,
        accessibility: accessibilityTests.filter(t => t.status === 'running').length,
        compatibility: compatibilityTests.filter(t => t.status === 'running').length,
        security: securityTests.filter(t => t.status === 'running').length,
      });
    } catch (error) {
      console.error('Error loading testing status:', error);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadTestingStatus();
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

  const handleStartTest = async (testType: string) => {
    try {
      Alert.alert(
        'Start Test',
        `Are you sure you want to start ${testType} testing?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Start', 
            onPress: async () => {
              setTestingStatus('running');
              // Simulate test start
              setTimeout(() => {
                setTestingStatus('completed');
                loadTestingStatus();
              }, 3000);
            },
          },
        ],
      );
    } catch (error) {
      console.error('Error starting test:', error);
      Alert.alert('Error', 'Failed to start test');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready': return theme.colors.primary;
      case 'running': return theme.colors.warning;
      case 'completed': return theme.colors.success;
      case 'failed': return theme.colors.danger;
      default: return theme.colors.gray[600];
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ready': return <PlayIcon size={24} color={theme.colors.primary} />;
      case 'running': return <ClockIcon size={24} color={theme.colors.warning} />;
      case 'completed': return <CheckCircleIcon size={24} color={theme.colors.success} />;
      case 'failed': return <XCircleIcon size={24} color={theme.colors.danger} />;
      default: return <AlertCircleIcon size={24} color={theme.colors.gray[600]} />;
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
        style={[styles.tab, activeTab === 'user' && styles.activeTab]}
        onPress={() => setActiveTab('user')}
      >
        <UsersIcon size={20} color={activeTab === 'user' ? theme.colors.primary : theme.colors.gray[600]} />
        <Text style={[styles.tabText, activeTab === 'user' && styles.activeTabText]}>User</Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.tab, activeTab === 'load' && styles.activeTab]}
        onPress={() => setActiveTab('load')}
      >
        <ZapIcon size={20} color={activeTab === 'load' ? theme.colors.primary : theme.colors.gray[600]} />
        <Text style={[styles.tabText, activeTab === 'load' && styles.activeTabText]}>Load</Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.tab, activeTab === 'accessibility' && styles.activeTab]}
        onPress={() => setActiveTab('accessibility')}
      >
        <EyeIcon size={20} color={activeTab === 'accessibility' ? theme.colors.primary : theme.colors.gray[600]} />
        <Text style={[styles.tabText, activeTab === 'accessibility' && styles.activeTabText]}>Accessibility</Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.tab, activeTab === 'compatibility' && styles.activeTab]}
        onPress={() => setActiveTab('compatibility')}
      >
        <TestTubeIcon size={20} color={activeTab === 'compatibility' ? theme.colors.primary : theme.colors.gray[600]} />
        <Text style={[styles.tabText, activeTab === 'compatibility' && styles.activeTabText]}>Compatibility</Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.tab, activeTab === 'security' && styles.activeTab]}
        onPress={() => setActiveTab('security')}
      >
        <ShieldIcon size={20} color={activeTab === 'security' ? theme.colors.primary : theme.colors.gray[600]} />
        <Text style={[styles.tabText, activeTab === 'security' && styles.activeTabText]}>Security</Text>
      </TouchableOpacity>
    </View>
  );

  const renderOverviewTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      {/* Testing Status */}
      <View style={styles.statusCard}>
        <View style={styles.statusHeader}>
          <View style={styles.statusInfo}>
            {getStatusIcon(testingStatus)}
            <Text style={styles.statusTitle}>Testing Status</Text>
          </View>
          <Text style={[styles.statusValue, { color: getStatusColor(testingStatus) }]}>
            {testingStatus.toUpperCase()}
          </Text>
        </View>
        <Text style={styles.statusDescription}>
          {testingStatus === 'ready' && 'All testing services are ready to run tests.'}
          {testingStatus === 'running' && 'Tests are currently running. Please wait for completion.'}
          {testingStatus === 'completed' && 'All tests have been completed successfully.'}
          {testingStatus === 'failed' && 'Some tests have failed. Please check the results.'}
        </Text>
      </View>

      {/* Active Tests */}
      <View style={styles.activeTestsCard}>
        <Text style={styles.cardTitle}>Active Tests</Text>
        <View style={styles.activeTestsGrid}>
          <View style={styles.activeTestItem}>
            <UsersIcon size={24} color={theme.colors.primary} />
            <Text style={styles.activeTestCount}>{activeTests.user}</Text>
            <Text style={styles.activeTestLabel}>User Tests</Text>
          </View>
          <View style={styles.activeTestItem}>
            <ZapIcon size={24} color={theme.colors.warning} />
            <Text style={styles.activeTestCount}>{activeTests.load}</Text>
            <Text style={styles.activeTestLabel}>Load Tests</Text>
          </View>
          <View style={styles.activeTestItem}>
            <EyeIcon size={24} color={theme.colors.success} />
            <Text style={styles.activeTestCount}>{activeTests.accessibility}</Text>
            <Text style={styles.activeTestLabel}>Accessibility</Text>
          </View>
          <View style={styles.activeTestItem}>
            <TestTubeIcon size={24} color={theme.colors.info} />
            <Text style={styles.activeTestCount}>{activeTests.compatibility}</Text>
            <Text style={styles.activeTestLabel}>Compatibility</Text>
          </View>
          <View style={styles.activeTestItem}>
            <ShieldIcon size={24} color={theme.colors.danger} />
            <Text style={styles.activeTestCount}>{activeTests.security}</Text>
            <Text style={styles.activeTestLabel}>Security</Text>
          </View>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.actionsCard}>
        <Text style={styles.cardTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={() => handleStartTest('User')}
          >
            <UsersIcon size={24} color={theme.colors.white} />
            <Text style={styles.actionButtonText}>Start User Test</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={() => handleStartTest('Load')}
          >
            <ZapIcon size={24} color={theme.colors.white} />
            <Text style={styles.actionButtonText}>Start Load Test</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={() => handleStartTest('Accessibility')}
          >
            <EyeIcon size={24} color={theme.colors.white} />
            <Text style={styles.actionButtonText}>Start Accessibility Test</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={() => handleStartTest('Compatibility')}
          >
            <TestTubeIcon size={24} color={theme.colors.white} />
            <Text style={styles.actionButtonText}>Start Compatibility Test</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={() => handleStartTest('Security')}
          >
            <ShieldIcon size={24} color={theme.colors.white} />
            <Text style={styles.actionButtonText}>Start Security Test</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={() => handleStartTest('All')}
          >
            <PlayIcon size={24} color={theme.colors.white} />
            <Text style={styles.actionButtonText}>Run All Tests</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Test Results Summary */}
      <View style={styles.resultsCard}>
        <Text style={styles.cardTitle}>Recent Test Results</Text>
        <View style={styles.resultsList}>
          <View style={styles.resultItem}>
            <CheckCircleIcon size={20} color={theme.colors.success} />
            <Text style={styles.resultText}>User Testing - Completed</Text>
            <Text style={styles.resultTime}>2 hours ago</Text>
          </View>
          <View style={styles.resultItem}>
            <CheckCircleIcon size={20} color={theme.colors.success} />
            <Text style={styles.resultText}>Load Testing - Completed</Text>
            <Text style={styles.resultTime}>4 hours ago</Text>
          </View>
          <View style={styles.resultItem}>
            <AlertCircleIcon size={20} color={theme.colors.warning} />
            <Text style={styles.resultText}>Accessibility Testing - Warning</Text>
            <Text style={styles.resultTime}>6 hours ago</Text>
          </View>
          <View style={styles.resultItem}>
            <CheckCircleIcon size={20} color={theme.colors.success} />
            <Text style={styles.resultText}>Compatibility Testing - Completed</Text>
            <Text style={styles.resultTime}>1 day ago</Text>
          </View>
          <View style={styles.resultItem}>
            <XCircleIcon size={20} color={theme.colors.danger} />
            <Text style={styles.resultText}>Security Testing - Failed</Text>
            <Text style={styles.resultTime}>2 days ago</Text>
          </View>
        </View>
      </View>

      {/* System Health */}
      <View style={styles.healthCard}>
        <Text style={styles.cardTitle}>Testing System Health</Text>
        <View style={styles.healthItems}>
          <View style={styles.healthItem}>
            <CheckCircleIcon size={20} color={theme.colors.success} />
            <Text style={styles.healthText}>User Testing Service - Active</Text>
          </View>
          <View style={styles.healthItem}>
            <CheckCircleIcon size={20} color={theme.colors.success} />
            <Text style={styles.healthText}>Load Testing Service - Active</Text>
          </View>
          <View style={styles.healthItem}>
            <CheckCircleIcon size={20} color={theme.colors.success} />
            <Text style={styles.healthText}>Accessibility Testing Service - Active</Text>
          </View>
          <View style={styles.healthItem}>
            <CheckCircleIcon size={20} color={theme.colors.success} />
            <Text style={styles.healthText}>Compatibility Testing Service - Active</Text>
          </View>
          <View style={styles.healthItem}>
            <CheckCircleIcon size={20} color={theme.colors.success} />
            <Text style={styles.healthText}>Security Testing Service - Active</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );

  const renderUserTestingTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <View style={styles.metricsCard}>
        <Text style={styles.cardTitle}>User Testing</Text>
        <View style={styles.metricsGrid}>
          <View style={styles.metricItem}>
            <Text style={styles.metricValue}>85%</Text>
            <Text style={styles.metricLabel}>Success Rate</Text>
            <View style={styles.metricTrend}>
              <TrendingUpIcon size={16} color={theme.colors.success} />
              <Text style={styles.trendText}>+5%</Text>
            </View>
          </View>
          <View style={styles.metricItem}>
            <Text style={styles.metricValue}>7.2</Text>
            <Text style={styles.metricLabel}>Avg Score</Text>
            <View style={styles.metricTrend}>
              <TrendingUpIcon size={16} color={theme.colors.success} />
              <Text style={styles.trendText}>+0.3</Text>
            </View>
          </View>
          <View style={styles.metricItem}>
            <Text style={styles.metricValue}>12</Text>
            <Text style={styles.metricLabel}>Active Sessions</Text>
            <View style={styles.metricTrend}>
              <TrendingUpIcon size={16} color={theme.colors.success} />
              <Text style={styles.trendText}>+2</Text>
            </View>
          </View>
          <View style={styles.metricItem}>
            <Text style={styles.metricValue}>156</Text>
            <Text style={styles.metricLabel}>Total Tests</Text>
            <View style={styles.metricTrend}>
              <TrendingUpIcon size={16} color={theme.colors.success} />
              <Text style={styles.trendText}>+8</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.actionsCard}>
        <Text style={styles.cardTitle}>User Testing Actions</Text>
        <View style={styles.actionsGrid}>
          <TouchableOpacity style={styles.actionButton} onPress={() => handleStartTest('User')}>
            <PlayIcon size={24} color={theme.colors.white} />
            <Text style={styles.actionButtonText}>Start User Test</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={onNavigateToReports}>
            <FileTextIcon size={24} color={theme.colors.white} />
            <Text style={styles.actionButtonText}>View Reports</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );

  const renderLoadTestingTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <View style={styles.metricsCard}>
        <Text style={styles.cardTitle}>Load Testing</Text>
        <View style={styles.metricsGrid}>
          <View style={styles.metricItem}>
            <Text style={styles.metricValue}>2.1s</Text>
            <Text style={styles.metricLabel}>Avg Response Time</Text>
            <View style={styles.metricTrend}>
              <TrendingDownIcon size={16} color={theme.colors.success} />
              <Text style={styles.trendText}>-0.2s</Text>
            </View>
          </View>
          <View style={styles.metricItem}>
            <Text style={styles.metricValue}>95%</Text>
            <Text style={styles.metricLabel}>Success Rate</Text>
            <View style={styles.metricTrend}>
              <TrendingUpIcon size={16} color={theme.colors.success} />
              <Text style={styles.trendText}>+2%</Text>
            </View>
          </View>
          <View style={styles.metricItem}>
            <Text style={styles.metricValue}>150</Text>
            <Text style={styles.metricLabel}>Concurrent Users</Text>
            <View style={styles.metricTrend}>
              <TrendingUpIcon size={16} color={theme.colors.success} />
              <Text style={styles.trendText}>+10</Text>
            </View>
          </View>
          <View style={styles.metricItem}>
            <Text style={styles.metricValue}>850</Text>
            <Text style={styles.metricLabel}>Requests/min</Text>
            <View style={styles.metricTrend}>
              <TrendingUpIcon size={16} color={theme.colors.success} />
              <Text style={styles.trendText}>+50</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.actionsCard}>
        <Text style={styles.cardTitle}>Load Testing Actions</Text>
        <View style={styles.actionsGrid}>
          <TouchableOpacity style={styles.actionButton} onPress={() => handleStartTest('Load')}>
            <PlayIcon size={24} color={theme.colors.white} />
            <Text style={styles.actionButtonText}>Start Load Test</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={onNavigateToReports}>
            <FileTextIcon size={24} color={theme.colors.white} />
            <Text style={styles.actionButtonText}>View Reports</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );

  const renderAccessibilityTestingTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <View style={styles.metricsCard}>
        <Text style={styles.cardTitle}>Accessibility Testing</Text>
        <View style={styles.metricsGrid}>
          <View style={styles.metricItem}>
            <Text style={styles.metricValue}>92%</Text>
            <Text style={styles.metricLabel}>WCAG Compliance</Text>
            <View style={styles.metricTrend}>
              <TrendingUpIcon size={16} color={theme.colors.success} />
              <Text style={styles.trendText}>+3%</Text>
            </View>
          </View>
          <View style={styles.metricItem}>
            <Text style={styles.metricValue}>8.5</Text>
            <Text style={styles.metricLabel}>Accessibility Score</Text>
            <View style={styles.metricTrend}>
              <TrendingUpIcon size={16} color={theme.colors.success} />
              <Text style={styles.trendText}>+0.2</Text>
            </View>
          </View>
          <View style={styles.metricItem}>
            <Text style={styles.metricValue}>3</Text>
            <Text style={styles.metricLabel}>Critical Issues</Text>
            <View style={styles.metricTrend}>
              <TrendingDownIcon size={16} color={theme.colors.success} />
              <Text style={styles.trendText}>-1</Text>
            </View>
          </View>
          <View style={styles.metricItem}>
            <Text style={styles.metricValue}>15</Text>
            <Text style={styles.metricLabel}>Total Issues</Text>
            <View style={styles.metricTrend}>
              <TrendingDownIcon size={16} color={theme.colors.success} />
              <Text style={styles.trendText}>-3</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.actionsCard}>
        <Text style={styles.cardTitle}>Accessibility Testing Actions</Text>
        <View style={styles.actionsGrid}>
          <TouchableOpacity style={styles.actionButton} onPress={() => handleStartTest('Accessibility')}>
            <PlayIcon size={24} color={theme.colors.white} />
            <Text style={styles.actionButtonText}>Start Accessibility Test</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={onNavigateToReports}>
            <FileTextIcon size={24} color={theme.colors.white} />
            <Text style={styles.actionButtonText}>View Reports</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );

  const renderCompatibilityTestingTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <View style={styles.metricsCard}>
        <Text style={styles.cardTitle}>Compatibility Testing</Text>
        <View style={styles.metricsGrid}>
          <View style={styles.metricItem}>
            <Text style={styles.metricValue}>88%</Text>
            <Text style={styles.metricLabel}>Overall Compatibility</Text>
            <View style={styles.metricTrend}>
              <TrendingUpIcon size={16} color={theme.colors.success} />
              <Text style={styles.trendText}>+2%</Text>
            </View>
          </View>
          <View style={styles.metricItem}>
            <Text style={styles.metricValue}>iOS</Text>
            <Text style={styles.metricLabel}>95% Compatible</Text>
            <View style={styles.metricTrend}>
              <TrendingUpIcon size={16} color={theme.colors.success} />
              <Text style={styles.trendText}>+1%</Text>
            </View>
          </View>
          <View style={styles.metricItem}>
            <Text style={styles.metricValue}>Android</Text>
            <Text style={styles.metricLabel}>92% Compatible</Text>
            <View style={styles.metricTrend}>
              <TrendingUpIcon size={16} color={theme.colors.success} />
              <Text style={styles.trendText}>+2%</Text>
            </View>
          </View>
          <View style={styles.metricItem}>
            <Text style={styles.metricValue}>Web</Text>
            <Text style={styles.metricLabel}>85% Compatible</Text>
            <View style={styles.metricTrend}>
              <TrendingUpIcon size={16} color={theme.colors.success} />
              <Text style={styles.trendText}>+3%</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.actionsCard}>
        <Text style={styles.cardTitle}>Compatibility Testing Actions</Text>
        <View style={styles.actionsGrid}>
          <TouchableOpacity style={styles.actionButton} onPress={() => handleStartTest('Compatibility')}>
            <PlayIcon size={24} color={theme.colors.white} />
            <Text style={styles.actionButtonText}>Start Compatibility Test</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={onNavigateToReports}>
            <FileTextIcon size={24} color={theme.colors.white} />
            <Text style={styles.actionButtonText}>View Reports</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );

  const renderSecurityTestingTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <View style={styles.metricsCard}>
        <Text style={styles.cardTitle}>Security Testing</Text>
        <View style={styles.metricsGrid}>
          <View style={styles.metricItem}>
            <Text style={styles.metricValue}>85</Text>
            <Text style={styles.metricLabel}>Security Score</Text>
            <View style={styles.metricTrend}>
              <TrendingUpIcon size={16} color={theme.colors.success} />
              <Text style={styles.trendText}>+5</Text>
            </View>
          </View>
          <View style={styles.metricItem}>
            <Text style={styles.metricValue}>2</Text>
            <Text style={styles.metricLabel}>Critical Issues</Text>
            <View style={styles.metricTrend}>
              <TrendingDownIcon size={16} color={theme.colors.success} />
              <Text style={styles.trendText}>-1</Text>
            </View>
          </View>
          <View style={styles.metricItem}>
            <Text style={styles.metricValue}>8</Text>
            <Text style={styles.metricLabel}>High Issues</Text>
            <View style={styles.metricTrend}>
              <TrendingDownIcon size={16} color={theme.colors.success} />
              <Text style={styles.trendText}>-2</Text>
            </View>
          </View>
          <View style={styles.metricItem}>
            <Text style={styles.metricValue}>Medium</Text>
            <Text style={styles.metricLabel}>Risk Level</Text>
            <View style={styles.metricTrend}>
              <TrendingDownIcon size={16} color={theme.colors.success} />
              <Text style={styles.trendText}>Improving</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.actionsCard}>
        <Text style={styles.cardTitle}>Security Testing Actions</Text>
        <View style={styles.actionsGrid}>
          <TouchableOpacity style={styles.actionButton} onPress={() => handleStartTest('Security')}>
            <PlayIcon size={24} color={theme.colors.white} />
            <Text style={styles.actionButtonText}>Start Security Test</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={onNavigateToReports}>
            <FileTextIcon size={24} color={theme.colors.white} />
            <Text style={styles.actionButtonText}>View Reports</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverviewTab();
      case 'user':
        return renderUserTestingTab();
      case 'load':
        return renderLoadTestingTab();
      case 'accessibility':
        return renderAccessibilityTestingTab();
      case 'compatibility':
        return renderCompatibilityTestingTab();
      case 'security':
        return renderSecurityTestingTab();
      default:
        return renderOverviewTab();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Testing Dashboard</Text>
        <Text style={styles.subtitle}>Comprehensive testing and quality assurance</Text>
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
  activeTestsCard: {
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
  activeTestsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
  },
  activeTestItem: {
    flex: 1,
    minWidth: (width - theme.spacing.lg * 4) / 2,
    alignItems: 'center',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.gray[50],
    borderRadius: theme.borderRadius.md,
  },
  activeTestCount: {
    fontSize: theme.fontSize.xl,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginTop: theme.spacing.xs,
  },
  activeTestLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.gray[600],
    textAlign: 'center',
    marginTop: theme.spacing.xs,
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
  resultsCard: {
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
  resultsList: {
    gap: theme.spacing.sm,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray[200],
  },
  resultText: {
    flex: 1,
    fontSize: theme.fontSize.sm,
    color: theme.colors.gray[600],
  },
  resultTime: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.gray[400],
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
});
