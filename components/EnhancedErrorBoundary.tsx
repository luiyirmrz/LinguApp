/**
 * ENHANCED ERROR BOUNDARY COMPONENT
 * 
 * This component provides advanced error handling with:
 * - Integration with centralized error service
 * - Automatic error reporting and logging
 * - User-friendly error messages
 * - Retry mechanisms
 * - Fallback UI with recovery options
 * - Error categorization and severity handling
 */

import React, { Component, ErrorInfo, ReactNode, memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
  ScrollView,
} from 'react-native';
// Lazy loaded: lucide-react-native
import { theme } from '@/constants/theme';
import { centralizedErrorService, ErrorCategory, ErrorSeverity } from '@/services/monitoring/centralizedErrorService';
import { AlertTriangle, RefreshCw, Home, Bug } from '@/components/icons/index';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  resetOnPropsChange?: boolean;
  showRetryButton?: boolean;
  showReportButton?: boolean;
  category?: ErrorCategory;
  severity?: ErrorSeverity;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  isRetrying: boolean;
  retryCount: number;
  errorReportId?: string;
  showDetails: boolean;
}

export class EnhancedErrorBoundary extends Component<Props, State> {
  private maxRetries = 3;
  private retryDelay = 1000;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      isRetrying: false,
      retryCount: 0,
      showDetails: false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('EnhancedErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo,
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Report error to centralized service
    this.reportError(error, errorInfo);

    // Show user feedback for critical errors
    if (this.props.severity === 'critical' || this.props.severity === 'high') {
      // Import feedback dynamically to avoid circular dependencies
      import('@/components/EnhancedUserFeedback').then(({ feedback }) => {
        feedback.error(
          'Application Error',
          'A critical error occurred. The application will attempt to recover automatically.',
          {
            persistent: true,
            actions: [
              {
                id: 'retry',
                label: 'Retry',
                type: 'primary',
                onPress: () => this.handleRetry(),
              },
              {
                id: 'refresh',
                label: 'Refresh App',
                type: 'secondary',
                onPress: () => this.handleRefresh(),
              },
            ],
          },
        );
      }).catch(() => {
        // Fallback to alert if feedback is not available
        Alert.alert(
          'Application Error',
          'A critical error occurred. Please try refreshing the app.',
          [
            { text: 'Retry', onPress: () => this.handleRetry() },
            { text: 'Refresh', onPress: () => this.handleRefresh() },
          ],
        );
      });
    }
  }

  componentDidUpdate(prevProps: Props) {
    // Reset error state when props change (if enabled)
    if (this.props.resetOnPropsChange && prevProps !== this.props) {
      this.resetError();
    }
  }

  private async reportError(error: Error, errorInfo: ErrorInfo) {
    try {
      const result = await centralizedErrorService.handleError(
        error,
        this.props.category || 'unknown',
        {
          component: 'ErrorBoundary',
          action: 'component_error',
          additionalData: {
            componentStack: errorInfo.componentStack,
            retryCount: this.state.retryCount,
          },
        },
      );

      // Store error report ID for potential follow-up
      this.setState({ errorReportId: result.userMessage });
    } catch (reportingError) {
      console.error('Failed to report error:', reportingError);
    }
  }

  private resetError = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      isRetrying: false,
      retryCount: 0,
      errorReportId: undefined,
    });
  };

  private handleRetry = async () => {
    const { retryCount } = this.state;
    
    if (retryCount >= this.maxRetries) {
      Alert.alert(
        'Maximum Retries Reached',
        'Unable to recover from this error. Please try refreshing the app or contact support.',
        [
          { text: 'OK', style: 'default' },
          { text: 'Contact Support', onPress: this.handleContactSupport },
        ],
      );
      return;
    }

    this.setState({ isRetrying: true });

    try {
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, this.retryDelay * (retryCount + 1)));
      
      // Reset error state
      this.resetError();
    } catch (retryError) {
      console.error('Retry failed:', retryError);
      this.setState({ 
        isRetrying: false,
        retryCount: retryCount + 1, 
      });
    }
  };

  private handleContactSupport = () => {
    const { error, errorReportId } = this.state;
    
    if (Platform.OS === 'web') {
      // Web: Open support email
      const subject = encodeURIComponent('LinguApp Error Report');
      const body = encodeURIComponent(`
Error Details:
- Error: ${error?.message}
- Report ID: ${errorReportId}
- Component: ${error?.stack?.split('\n')[1] || 'Unknown'}
- Time: ${new Date().toISOString()}

Please describe what you were doing when this error occurred:
      `);
      
      window.open(`mailto:support@linguapp.com?subject=${subject}&body=${body}`);
    } else {
      // Mobile: Show support options
      Alert.alert(
        'Contact Support',
        'Please contact our support team with the following information:',
        [
          { text: 'Copy Error ID', onPress: () => this.copyErrorId() },
          { text: 'Email Support', onPress: () => this.openSupportEmail() },
          { text: 'Cancel', style: 'cancel' },
        ],
      );
    }
  };

  private copyErrorId = () => {
    const { errorReportId } = this.state;
    if (Platform.OS === 'web' && navigator.clipboard) {
      navigator.clipboard.writeText(errorReportId || 'Unknown Error ID');
      Alert.alert('Copied', 'Error ID copied to clipboard');
    }
  };

  private openSupportEmail = () => {
    // This would open the default email app on mobile
    console.debug('Opening support email...');
  };

  private handleRefresh = () => {
    if (Platform.OS === 'web') {
      window.location.reload();
    } else {
      // For React Native, we could implement a different refresh mechanism
      this.resetError();
    }
  };

  private renderErrorDetails() {
    const { error, errorInfo } = this.state;
    
    if (!__DEV__) {
      return null; // Don't show error details in production
    }

    return (
      <ScrollView style={styles.errorDetails}>
        <Text style={styles.errorDetailsTitle as any}>Error Details (Development)</Text>
        <Text style={styles.errorText}>Error: {error?.message}</Text>
        <Text style={styles.errorText}>Stack: {error?.stack}</Text>
        <Text style={styles.errorText}>Component Stack: {errorInfo?.componentStack}</Text>
      </ScrollView>
    );
  }

  private renderFallbackUI() {
    const { error, isRetrying, retryCount, errorReportId } = this.state;
    const { showRetryButton = true, showReportButton = true } = this.props;

    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <AlertTriangle size={64} color={theme.colors.error} />
          </View>
          
          <Text style={styles.title as any}>Oops! Something went wrong</Text>
          
          <Text style={styles.message}>
            We encountered an unexpected error. Don't worry, your progress is safe.
          </Text>

          {errorReportId && (
            <Text style={styles.errorId}>
              Error ID: {errorReportId}
            </Text>
          )}

          {retryCount > 0 && (
            <Text style={styles.retryInfo}>
              Retry attempt {retryCount} of {this.maxRetries}
            </Text>
          )}

          <View style={styles.buttonContainer}>
            {showRetryButton && (
              <TouchableOpacity
                style={[styles.button, styles.retryButton]}
                onPress={this.handleRetry}
                disabled={isRetrying}
              >
                <RefreshCw 
                  size={20} 
                  color={theme.colors.white} 
                  style={isRetrying ? styles.spinning : undefined}
                />
                <Text style={styles.buttonText}>
                  {isRetrying ? 'Retrying...' : 'Try Again'}
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[styles.button, styles.refreshButton]}
              onPress={this.handleRefresh}
            >
              <Home size={20} color={theme.colors.primary} />
              <Text style={[styles.buttonText, styles.refreshButtonText]}>
                Refresh App
              </Text>
            </TouchableOpacity>

            {showReportButton && (
              <TouchableOpacity
                style={[styles.button, styles.reportButton]}
                onPress={this.handleContactSupport}
              >
                <Bug size={20} color={theme.colors.secondary} />
                <Text style={[styles.buttonText, styles.reportButtonText]}>
                  Report Issue
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {__DEV__ && (
            <TouchableOpacity
              style={styles.devButton}
              onPress={() => this.setState(prev => ({ showDetails: !prev.showDetails }))}
            >
              <Text style={styles.devButtonText}>
                {this.state.showDetails ? 'Hide' : 'Show'} Error Details
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {this.state.showDetails && this.renderErrorDetails()}
      </View>
    );
  }

  render() {
    const { children, fallback } = this.props;

    if (this.state.hasError) {
      return fallback || this.renderFallbackUI();
    }

    return children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  iconContainer: {
    marginBottom: theme.spacing.lg,
  },
  title: {
    fontSize: theme.fontSize.xl,
    fontWeight: 'bold',
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  message: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: theme.spacing.lg,
  },
  errorId: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textTertiary,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  retryInfo: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.warning,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  buttonContainer: {
    width: '100%',
    gap: theme.spacing.md,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    borderWidth: 2,
  },
  retryButton: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  refreshButton: {
    backgroundColor: 'transparent',
    borderColor: theme.colors.primary,
  },
  reportButton: {
    backgroundColor: 'transparent',
    borderColor: theme.colors.secondary,
  },
  buttonText: {
    fontSize: theme.fontSize.md,
    fontWeight: '600',
    marginLeft: theme.spacing.sm,
  },
  refreshButtonText: {
    color: theme.colors.primary,
  },
  reportButtonText: {
    color: theme.colors.secondary,
  },
  spinning: {
    transform: [{ rotate: '360deg' }],
  },
  devButton: {
    marginTop: theme.spacing.lg,
    padding: theme.spacing.sm,
  },
  devButtonText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textTertiary,
    textDecorationLine: 'underline',
  },
  errorDetails: {
    maxHeight: 200,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  errorDetailsTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  errorText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    marginBottom: theme.spacing.xs,
  },
});

// ============================================================================
// CONVENIENCE COMPONENTS
// ============================================================================

/**
 * Simple error boundary for basic error handling
 */
export const SimpleErrorBoundary: React.FC<{ children: ReactNode }> = ({ children }) => (
  <EnhancedErrorBoundary
    showRetryButton={true}
    showReportButton={false}
    resetOnPropsChange={true}
  >
    {children}
  </EnhancedErrorBoundary>
);

/**
 * Critical error boundary for important components
 */
export const CriticalErrorBoundary: React.FC<{ children: ReactNode }> = ({ children }) => (
  <EnhancedErrorBoundary
    category="unknown"
    severity="high"
    showRetryButton={true}
    showReportButton={true}
    resetOnPropsChange={false}
  >
    {children}
  </EnhancedErrorBoundary>
);

/**
 * Network error boundary for API-dependent components
 */
export const NetworkErrorBoundary: React.FC<{ children: ReactNode }> = ({ children }) => (
  <EnhancedErrorBoundary
    category="unknown"
    severity="medium"
    showRetryButton={true}
    showReportButton={true}
    resetOnPropsChange={true}
  >
    {children}
  </EnhancedErrorBoundary>
);

export default memo(EnhancedErrorBoundary);


// EnhancedErrorBoundary.displayName = 'EnhancedErrorBoundary';
