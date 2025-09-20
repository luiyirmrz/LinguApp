/**
 * Security Monitoring Component for LinguApp
 * Provides UI for viewing security status, logs, and managing security settings
 * Includes rate limiting status, account lockout information, and security events
 */

import React, { useState, useEffect, memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Modal,
  TextInput,
  Switch,
} from 'react-native';
import { theme } from '@/constants/theme';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';
import { securityService, SecurityEventType } from '@/services/auth/securityService';
import { 
  Shield, 
  AlertTriangle, 
  Lock, 
  Eye, 
  EyeOff, 
  RefreshCw, 
  Settings,
  Clock,
  User,
  Activity,
  X,
  CheckCircle,
  XCircle,
} from '@/components/icons/LucideReplacement';

interface SecurityEvent {
  id: string;
  type: SecurityEventType;
  userId?: string;
  email?: string;
  timestamp: Date;
  details: Record<string, any>;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export default memo(SecurityMonitoringComponent);

SecurityMonitoringComponent.displayName = 'SecurityMonitoringComponent';

function SecurityMonitoringComponent() {
  const { user } = useUnifiedAuth();
  
  // Mock security functions
  const securityStatus = {
    rateLimitRemaining: 10,
    accountLocked: false,
    lockoutRemaining: 0,
    lastSecurityEvent: {
      type: SecurityEventType.LOGIN_ATTEMPT,
      timestamp: new Date()
    }
  };
  const getSecurityStatus = () => securityStatus;
  const getSecurityLog = () => [];
  const validatePassword = (password: string) => ({ 
    isValid: true, 
    strength: 'medium' as const,
    score: 5,
    errors: [] 
  });
  const [securityLog, setSecurityLog] = useState<SecurityEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showLogs, setShowLogs] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [passwordTest, setPasswordTest] = useState('');
  const [passwordStrength, setPasswordStrength] = useState<{
    isValid: boolean;
    strength: 'weak' | 'medium' | 'strong' | 'very_strong';
    score: number;
    errors: string[];
  } | null>(null);

  // Load security data
  const loadSecurityData = async () => {
    setIsLoading(true);
    try {
      const [status, log] = await Promise.all([
        getSecurityStatus(),
        getSecurityLog(),
      ]);
      setSecurityLog(log);
    } catch (error) {
      console.error('Failed to load security data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSecurityData();
  }, []);

  // Test password strength
  const testPasswordStrength = () => {
    if (!passwordTest.trim()) {
      setPasswordStrength(null);
      return;
    }
    
    const result = validatePassword(passwordTest);
    setPasswordStrength(result);
  };

  useEffect(() => {
    testPasswordStrength();
  }, [passwordTest]);

  // Clear security data
  const clearSecurityData = () => {
    Alert.alert(
      'Clear Security Data',
      'This will clear all security logs and reset rate limiting. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              await securityService.clearSecurityData();
              await loadSecurityData();
              Alert.alert('Success', 'Security data cleared successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to clear security data');
            }
          },
        },
      ],
    );
  };

  // Get severity color
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return '#ef4444';
      case 'high': return '#f97316';
      case 'medium': return '#eab308';
      case 'low': return '#22c55e';
      default: return theme.colors.gray[400];
    }
  };

  // Get event type label
  const getEventTypeLabel = (type: SecurityEventType) => {
    switch (type) {
      case SecurityEventType.LOGIN_ATTEMPT: return 'Login Attempt';
      case SecurityEventType.LOGIN_SUCCESS: return 'Login Success';
      case SecurityEventType.LOGIN_FAILURE: return 'Login Failure';
      case SecurityEventType.ACCOUNT_LOCKOUT: return 'Account Lockout';
      case SecurityEventType.PASSWORD_RESET: return 'Password Reset';
      case SecurityEventType.SUSPICIOUS_ACTIVITY: return 'Suspicious Activity';
      case SecurityEventType.TOKEN_REFRESH: return 'Token Refresh';
      case SecurityEventType.SESSION_EXPIRED: return 'Session Expired';
      case SecurityEventType.RATE_LIMIT_EXCEEDED: return 'Rate Limit Exceeded';
      default: return type;
    }
  };

  // Format timestamp
  const formatTimestamp = (timestamp: Date) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Shield size={24} color={theme.colors.primary} />
          <Text style={styles.headerTitle}>Security Monitor</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity 
            style={styles.iconButton}
            onPress={() => setShowSettings(true)}
          >
            <Settings size={20} color={theme.colors.gray[600]} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.iconButton}
            onPress={loadSecurityData}
            disabled={isLoading}
          >
            <RefreshCw 
              size={20} 
              color={theme.colors.gray[600]} 
              style={isLoading ? styles.rotating : undefined}
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={loadSecurityData} />
        }
      >
        {/* Security Status Cards */}
        <View style={styles.statusSection}>
          <Text style={styles.sectionTitle}>Security Status</Text>
          
          {/* Rate Limiting Status */}
          <View style={styles.statusCard}>
            <View style={styles.statusHeader}>
              <Clock size={20} color={theme.colors.primary} />
              <Text style={styles.statusTitle}>Rate Limiting</Text>
            </View>
            <Text style={styles.statusValue}>
              {securityStatus.rateLimitRemaining} attempts remaining
            </Text>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { 
                    width: `${(securityStatus.rateLimitRemaining / 10) * 100}%`,
                    backgroundColor: securityStatus.rateLimitRemaining < 3 ? theme.colors.danger : theme.colors.primary,
                  },
                ]} 
              />
            </View>
          </View>

          {/* Account Lockout Status */}
          <View style={[
            styles.statusCard,
            securityStatus.accountLocked && styles.lockedCard,
          ]}>
            <View style={styles.statusHeader}>
              <Lock size={20} color={securityStatus.accountLocked ? theme.colors.danger : theme.colors.success} />
              <Text style={styles.statusTitle}>Account Status</Text>
            </View>
            <Text style={[
              styles.statusValue,
              securityStatus.accountLocked && styles.lockedText,
            ]}>
              {securityStatus.accountLocked 
                ? `Locked for ${Math.ceil((securityStatus.lockoutRemaining || 0) / 60)} minutes`
                : 'Account Active'
              }
            </Text>
            {securityStatus.accountLocked && (
              <View style={styles.lockoutTimer}>
                <Text style={styles.lockoutText}>
                  Unlocks in {Math.ceil((securityStatus.lockoutRemaining || 0) / 60)} minutes
                </Text>
              </View>
            )}
          </View>

          {/* Last Security Event */}
          {securityStatus.lastSecurityEvent && (
            <View style={styles.statusCard}>
              <View style={styles.statusHeader}>
                <Activity size={20} color={theme.colors.primary} />
                <Text style={styles.statusTitle}>Last Event</Text>
              </View>
              <Text style={styles.statusValue}>
                {getEventTypeLabel(securityStatus.lastSecurityEvent.type)}
              </Text>
              <Text style={styles.statusSubtext}>
                {formatTimestamp(securityStatus.lastSecurityEvent.timestamp)}
              </Text>
            </View>
          )}
        </View>

        {/* Security Logs */}
        <View style={styles.logsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Security Events</Text>
            <TouchableOpacity 
              style={styles.viewAllButton}
              onPress={() => setShowLogs(true)}
            >
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          
          {securityLog.slice(0, 5).map((event, index) => (
            <View key={event.id} style={styles.logItem}>
              <View style={styles.logHeader}>
                <View style={[
                  styles.severityIndicator,
                  { backgroundColor: getSeverityColor(event.severity) },
                ]} />
                <Text style={styles.logType}>
                  {getEventTypeLabel(event.type)}
                </Text>
                <Text style={styles.logTime}>
                  {formatTimestamp(event.timestamp)}
                </Text>
              </View>
              {event.email && (
                <Text style={styles.logEmail}>{event.email}</Text>
              )}
              {Object.keys(event.details).length > 0 && (
                <Text style={styles.logDetails}>
                  {JSON.stringify(event.details, null, 2)}
                </Text>
              )}
            </View>
          ))}
          
          {securityLog.length === 0 && (
            <View style={styles.emptyState}>
              <Shield size={48} color={theme.colors.gray[300]} />
              <Text style={styles.emptyText}>No security events yet</Text>
            </View>
          )}
        </View>

        {/* Password Strength Tester */}
        <View style={styles.passwordSection}>
          <Text style={styles.sectionTitle}>Password Strength Tester</Text>
          <TextInput
            style={styles.passwordInput}
            placeholder="Test password strength..."
            value={passwordTest}
            onChangeText={setPasswordTest}
            secureTextEntry
            placeholderTextColor={theme.colors.gray[400]}
          />
          
          {passwordStrength && (
            <View style={styles.strengthResult}>
              <View style={styles.strengthHeader}>
                <Text style={styles.strengthLabel}>Strength:</Text>
                <Text style={[
                  styles.strengthValue,
                  { color: passwordStrength.isValid ? theme.colors.success : theme.colors.danger },
                ]}>
                  {passwordStrength.strength.toUpperCase()}
                </Text>
              </View>
              
              <View style={styles.strengthBar}>
                <View 
                  style={[
                    styles.strengthFill,
                    { 
                      width: `${(passwordStrength.score / 100) * 100}%`,
                      backgroundColor: passwordStrength.isValid ? theme.colors.success : theme.colors.danger,
                    },
                  ]} 
                />
              </View>
              
              <Text style={styles.strengthScore}>Score: {passwordStrength.score}/100</Text>
              
              {passwordStrength.errors.length > 0 && (
                <View style={styles.errorList}>
                  {passwordStrength.errors.map((error, index) => (
                    <Text key={index} style={styles.errorText}>• {error}</Text>
                  ))}
                </View>
              )}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Security Logs Modal */}
      <Modal
        visible={showLogs}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Security Logs</Text>
            <TouchableOpacity onPress={() => setShowLogs(false)}>
              <X size={24} color={theme.colors.gray[600]} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            {securityLog.map((event) => (
              <View key={event.id} style={styles.modalLogItem}>
                <View style={styles.modalLogHeader}>
                  <View style={[
                    styles.severityIndicator,
                    { backgroundColor: getSeverityColor(event.severity) },
                  ]} />
                  <Text style={styles.modalLogType}>
                    {getEventTypeLabel(event.type)}
                  </Text>
                  <Text style={styles.modalLogSeverity}>
                    {event.severity.toUpperCase()}
                  </Text>
                </View>
                
                <Text style={styles.modalLogTime}>
                  {formatTimestamp(event.timestamp)}
                </Text>
                
                {event.email && (
                  <Text style={styles.modalLogEmail}>{event.email}</Text>
                )}
                
                {Object.keys(event.details).length > 0 && (
                  <View style={styles.modalLogDetails}>
                    <Text style={styles.modalLogDetailsTitle}>Details:</Text>
                    <Text style={styles.modalLogDetailsText}>
                      {JSON.stringify(event.details, null, 2)}
                    </Text>
                  </View>
                )}
              </View>
            ))}
          </ScrollView>
        </View>
      </Modal>

      {/* Settings Modal */}
      <Modal
        visible={showSettings}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Security Settings</Text>
            <TouchableOpacity onPress={() => setShowSettings(false)}>
              <X size={24} color={theme.colors.gray[600]} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            <View style={styles.settingSection}>
              <Text style={styles.settingTitle}>Security Actions</Text>
              
              <TouchableOpacity 
                style={[styles.settingButton, styles.dangerButton]}
                onPress={clearSecurityData}
              >
                <Text style={styles.dangerButtonText}>Clear Security Data</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.settingButton}
                onPress={loadSecurityData}
              >
                <Text style={styles.settingButtonText}>Refresh Security Data</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.settingSection}>
              <Text style={styles.settingTitle}>Security Information</Text>
              
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Rate Limit Window:</Text>
                <Text style={styles.infoValue}>5 minutes</Text>
              </View>
              
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Max Login Attempts:</Text>
                <Text style={styles.infoValue}>5 attempts</Text>
              </View>
              
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Lockout Duration:</Text>
                <Text style={styles.infoValue}>15 minutes</Text>
              </View>
              
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Session Timeout:</Text>
                <Text style={styles.infoValue}>60 minutes</Text>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.white,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray[100],
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  headerTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: '600' as const,
    color: theme.colors.black,
  },
  headerRight: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  iconButton: {
    padding: theme.spacing.sm,
  },
  rotating: {
    transform: [{ rotate: '360deg' }],
  },
  content: {
    flex: 1,
  },
  statusSection: {
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: '600' as const,
    color: theme.colors.black,
    marginBottom: theme.spacing.sm,
  },
  statusCard: {
    backgroundColor: theme.colors.gray[50],
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.gray[200],
  },
  lockedCard: {
    borderColor: theme.colors.danger,
    backgroundColor: '#fef2f2',
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  statusTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: '600' as const,
    color: theme.colors.black,
  },
  statusValue: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.gray[600],
    marginBottom: theme.spacing.xs,
  },
  lockedText: {
    color: theme.colors.danger,
    fontWeight: '600' as const,
  },
  statusSubtext: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.gray[400],
  },
  progressBar: {
    height: 4,
    backgroundColor: theme.colors.gray[200],
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  lockoutTimer: {
    marginTop: theme.spacing.xs,
  },
  lockoutText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.danger,
  },
  logsSection: {
    padding: theme.spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  viewAllButton: {
    padding: theme.spacing.sm,
  },
  viewAllText: {
    color: theme.colors.primary,
    fontSize: theme.fontSize.sm,
    fontWeight: '600' as const,
  },
  logItem: {
    backgroundColor: theme.colors.gray[50],
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.gray[200],
  },
  logHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.xs,
  },
  severityIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  logType: {
    fontSize: theme.fontSize.sm,
    fontWeight: '600' as const,
    color: theme.colors.black,
    flex: 1,
  },
  logTime: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.gray[400],
  },
  logEmail: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.gray[600],
    marginBottom: theme.spacing.xs,
  },
  logDetails: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.gray[500],
    fontFamily: 'monospace',
  },
  emptyState: {
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  emptyText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.gray[400],
    marginTop: theme.spacing.sm,
  },
  passwordSection: {
    padding: theme.spacing.lg,
  },
  passwordInput: {
    borderWidth: 1,
    borderColor: theme.colors.gray[200],
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    fontSize: theme.fontSize.md,
    backgroundColor: theme.colors.gray[50],
    marginBottom: theme.spacing.md,
  },
  strengthResult: {
    backgroundColor: theme.colors.gray[50],
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.gray[200],
  },
  strengthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  strengthLabel: {
    fontSize: theme.fontSize.sm,
    fontWeight: '600' as const,
    color: theme.colors.black,
  },
  strengthValue: {
    fontSize: theme.fontSize.sm,
    fontWeight: '600' as const,
  },
  strengthBar: {
    height: 6,
    backgroundColor: theme.colors.gray[200],
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: theme.spacing.sm,
  },
  strengthFill: {
    height: '100%',
    borderRadius: 3,
  },
  strengthScore: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.gray[600],
    marginBottom: theme.spacing.sm,
  },
  errorList: {
    gap: theme.spacing.xs,
  },
  errorText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.danger,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: theme.colors.white,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray[100],
  },
  modalTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: '600' as const,
    color: theme.colors.black,
  },
  modalContent: {
    flex: 1,
    padding: theme.spacing.lg,
  },
  modalLogItem: {
    backgroundColor: theme.colors.gray[50],
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.gray[200],
  },
  modalLogHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.xs,
  },
  modalLogType: {
    fontSize: theme.fontSize.sm,
    fontWeight: '600' as const,
    color: theme.colors.black,
    flex: 1,
  },
  modalLogSeverity: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.gray[600],
    fontWeight: '600' as const,
  },
  modalLogTime: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.gray[400],
    marginBottom: theme.spacing.xs,
  },
  modalLogEmail: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.gray[600],
    marginBottom: theme.spacing.xs,
  },
  modalLogDetails: {
    marginTop: theme.spacing.sm,
  },
  modalLogDetailsTitle: {
    fontSize: theme.fontSize.xs,
    fontWeight: '600' as const,
    color: theme.colors.black,
    marginBottom: theme.spacing.xs,
  },
  modalLogDetailsText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.gray[600],
    fontFamily: 'monospace',
  },
  settingSection: {
    marginBottom: theme.spacing.xl,
  },
  settingTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: '600' as const,
    color: theme.colors.black,
    marginBottom: theme.spacing.md,
  },
  settingButton: {
    backgroundColor: theme.colors.gray[100],
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  dangerButton: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: theme.colors.danger,
  },
  settingButtonText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.black,
    textAlign: 'center',
    fontWeight: '500' as const,
  },
  dangerButtonText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.danger,
    textAlign: 'center',
    fontWeight: '500' as const,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray[100],
  },
  infoLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.gray[600],
  },
  infoValue: {
    fontSize: theme.fontSize.sm,
    fontWeight: '600' as const,
    color: theme.colors.black,
  },
});


SecurityMonitoringComponent.displayName = 'SecurityMonitoringComponent';
