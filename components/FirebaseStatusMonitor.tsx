import React, { useState, useEffect, memo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { 
  isFirebaseConfigured, 
  isFirebaseReady, 
  checkConnectionHealth, 
  retryConnection,
  isMockMode, 
} from '../config/firebase';

interface ConnectionStatus {
  isConfigured: boolean;
  isReady: boolean;
  isHealthy: boolean;
  isMock: boolean;
  lastCheck: Date | null;
  errorCount: number;
}

export const FirebaseStatusMonitor: React.FC = () => {
  const [status, setStatus] = useState<ConnectionStatus>({
    isConfigured: false,
    isReady: false,
    isHealthy: false,
    isMock: false,
    lastCheck: null,
    errorCount: 0,
  });
  const [isChecking, setIsChecking] = useState(false);

  const checkStatus = async () => {
    setIsChecking(true);
    try {
      const isConfigured = isFirebaseConfigured();
      const isReady = isFirebaseReady();
      const isMock = isMockMode();
      
      let isHealthy = false;
      if (isConfigured && isReady && !isMock) {
        try {
          isHealthy = await checkConnectionHealth();
        } catch (error) {
          console.error('Health check failed:', error);
          isHealthy = false;
        }
      }

      setStatus(prev => ({
        isConfigured,
        isReady,
        isHealthy,
        isMock,
        lastCheck: new Date(),
        errorCount: isHealthy ? 0 : prev.errorCount + 1,
      }));
    } catch (error) {
      console.error('Status check failed:', error);
      setStatus(prev => ({
        ...prev,
        lastCheck: new Date(),
        errorCount: prev.errorCount + 1,
      }));
    } finally {
      setIsChecking(false);
    }
  };

  const handleRetryConnection = async () => {
    try {
      const success = await retryConnection();
      if (success) {
        Alert.alert('Success', 'Firebase connection restored!');
        checkStatus(); // Refresh status
      } else {
        Alert.alert('Failed', 'Could not restore Firebase connection. Check your network and Firebase project status.');
      }
    } catch (error) {
      Alert.alert('Error', `Retry failed: ${error}`);
    }
  };

  const getStatusColor = () => {
    if (status.isMock) return '#FFA500'; // Orange for mock mode
    if (status.isHealthy) return '#4CAF50'; // Green for healthy
    if (status.isReady) return '#FF9800'; // Orange for ready but unhealthy
    return '#F44336'; // Red for not ready
  };

  const getStatusText = () => {
    if (status.isMock) return 'Mock Mode';
    if (status.isHealthy) return 'Connected';
    if (status.isReady) return 'Ready (No Connection)';
    return 'Not Ready';
  };

  useEffect(() => {
    checkStatus();
    
    // Check status every 30 seconds
    const interval = setInterval(checkStatus, 30000);
    
    return () => clearInterval(interval);
  }, []);

  if (!status.isConfigured) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Firebase Status</Text>
        <Text style={styles.error}>Not Configured</Text>
        <Text style={styles.subtitle}>Firebase configuration is missing</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Firebase Status</Text>
      
      <View style={[styles.statusIndicator, { backgroundColor: getStatusColor() }]}>
        <Text style={styles.statusText}>{getStatusText()}</Text>
      </View>

      <View style={styles.details}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Configuration:</Text>
          <Text style={styles.detailValue}>
            {status.isConfigured ? '✓' : '✗'}
          </Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Initialization:</Text>
          <Text style={styles.detailValue}>
            {status.isReady ? '✓' : '✗'}
          </Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Connection:</Text>
          <Text style={styles.detailValue}>
            {status.isHealthy ? '✓' : '✗'}
          </Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Mode:</Text>
          <Text style={styles.detailValue}>
            {status.isMock ? 'Mock' : 'Real'}
          </Text>
        </View>

        {status.lastCheck && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Last Check:</Text>
            <Text style={styles.detailValue}>
              {status.lastCheck.toLocaleTimeString()}
            </Text>
          </View>
        )}

        {status.errorCount > 0 && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Errors:</Text>
            <Text style={[styles.detailValue, styles.errorText]}>
              {status.errorCount}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.actions}>
        <TouchableOpacity 
          style={[styles.button, styles.checkButton]} 
          onPress={checkStatus}
          disabled={isChecking}
        >
          <Text style={styles.buttonText}>
            {isChecking ? 'Checking...' : 'Check Status'}
          </Text>
        </TouchableOpacity>

        {status.isReady && !status.isHealthy && !status.isMock && (
          <TouchableOpacity 
            style={[styles.button, styles.retryButton]} 
            onPress={handleRetryConnection}
          >
            <Text style={styles.buttonText}>Retry Connection</Text>
          </TouchableOpacity>
        )}
      </View>

      {!status.isHealthy && !status.isMock && (
        <View style={styles.troubleshooting}>
          <Text style={styles.troubleshootingTitle}>Troubleshooting Tips:</Text>
          <Text style={styles.troubleshootingText}>
            • Check your internet connection{'\n'}
            • Verify Firebase project is active{'\n'}
            • Check Firestore security rules{'\n'}
            • Ensure project billing is enabled{'\n'}
            • Try restarting the app
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    margin: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  statusIndicator: {
    padding: 12,
    borderRadius: 6,
    marginBottom: 16,
  },
  statusText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  details: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  errorText: {
    color: '#F44336',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 6,
    minWidth: 120,
  },
  checkButton: {
    backgroundColor: '#2196F3',
  },
  retryButton: {
    backgroundColor: '#FF9800',
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  troubleshooting: {
    backgroundColor: '#FFF3E0',
    padding: 12,
    borderRadius: 6,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  troubleshootingTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#E65100',
  },
  troubleshootingText: {
    fontSize: 12,
    color: '#BF360C',
    lineHeight: 18,
  },
  error: {
    color: '#F44336',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    color: '#666',
    fontSize: 14,
    textAlign: 'center',
  },
});

export default memo(FirebaseStatusMonitor);


FirebaseStatusMonitor.displayName = 'FirebaseStatusMonitor';
