/**
 * Error Boundary Component
 * Catches JavaScript errors in child components and displays a fallback UI
 * Prevents the entire app from crashing due to component errors
 */

import React, { Component, ErrorInfo, ReactNode, memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
// Lazy loaded: lucide-react-native
import colors from '@/constants/colors';
import { centralizedErrorService } from '@/services/monitoring/centralizedErrorService';
import { AlertTriangle, RefreshCw, Home } from '@/components/icons';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  resetOnPropsChange?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo,
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log error to analytics or error reporting service
    this.logError(error, errorInfo);
  }

  componentDidUpdate(prevProps: Props) {
    // Reset error state when props change (if enabled)
    if (this.props.resetOnPropsChange && prevProps !== this.props) {
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
      });
    }
  }

  private logError = (error: Error, errorInfo: ErrorInfo) => {
    // Use centralized error handling service
    centralizedErrorService.handleError(
      error,
      'unknown',
      {
        component: this.constructor.name,
        additionalData: { errorInfo },
      }
    );
  };

  private handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  private handleReportError = () => {
    const { error, errorInfo } = this.state;
    if (!error) return;

    Alert.alert(
      'Report Error',
      'Would you like to report this error to help us improve the app?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Report',
          onPress: () => {
            // In a real app, you would open a feedback form or send to your support
            Alert.alert(
              'Thank you!',
              'Your error report has been submitted. We\'ll investigate and fix the issue.',
              [{ text: 'OK' }],
            );
          },
        },
      ],
    );
  };

  private handleGoHome = () => {
    // In a real app, you would navigate to the home screen
    Alert.alert(
      'Go Home',
      'This would navigate to the home screen in a real app.',
      [{ text: 'OK' }],
    );
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <View style={styles.container}>
          <View style={styles.errorContainer}>
            <AlertTriangle size={48} color={colors.error} />
            <Text style={styles.title}>Oops! Something went wrong</Text>
            <Text style={styles.message}>
              We're sorry, but something unexpected happened. Please try again.
            </Text>
            
            {__DEV__ && this.state.error && (
              <View style={styles.debugContainer}>
                <Text style={styles.debugTitle}>Debug Information:</Text>
                <Text style={styles.debugText}>{this.state.error.message}</Text>
                {this.state.errorInfo && (
                  <Text style={styles.debugText}>
                    {this.state.errorInfo.componentStack}
                  </Text>
                )}
              </View>
            )}

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.retryButton}
                onPress={this.handleRetry}
              >
                <RefreshCw size={20} color={colors.white} />
                <Text style={styles.retryButtonText}>Try Again</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={this.handleGoHome}
              >
                <Home size={20} color={colors.primary} />
                <Text style={styles.secondaryButtonText}>Go Home</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.reportButton}
              onPress={this.handleReportError}
            >
              <Text style={styles.reportButtonText}>Report This Error</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorContainer: {
    alignItems: 'center',
    maxWidth: 400,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  message: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  debugContainer: {
    backgroundColor: colors.errorLight,
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    width: '100%',
  },
  debugTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.error,
    marginBottom: 8,
  },
  debugText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontFamily: 'monospace',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 15,
    marginBottom: 20,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  retryButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  secondaryButtonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  reportButton: {
    paddingVertical: 10,
  },
  reportButtonText: {
    color: colors.textSecondary,
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});

export default memo(ErrorBoundary);


// ErrorBoundary.displayName = 'ErrorBoundary';
