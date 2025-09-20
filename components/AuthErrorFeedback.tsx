/**
 * Authentication Error Feedback Component
 * Provides user-friendly error messages and recovery options for authentication failures
 */

import React, { memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
// Lazy loaded: lucide-react-native
import { useAdaptiveTheme } from '@/contexts/AdaptiveThemeContext';
import { theme } from '@/constants/theme';
import { Wifi, Lock, AlertTriangle, Mail, RefreshCw } from '@/components/icons';

interface AuthErrorFeedbackProps {
  error: string | null;
  onRetry?: () => void;
  onForgotPassword?: () => void;
  onContactSupport?: () => void;
  isLoading?: boolean;
  retryCount?: number;
  maxRetries?: number;
}

export const AuthErrorFeedback: React.FC<AuthErrorFeedbackProps> = ({
  error,
  onRetry,
  onForgotPassword,
  onContactSupport,
  isLoading = false,
  retryCount = 0,
  maxRetries = 3,
}) => {
  const { theme: adaptiveTheme } = useAdaptiveTheme();
  if (!error) return null;

  // Show error feedback using the enhanced feedback system
  const getErrorIcon = () => {
    if (error.toLowerCase().includes('network') || error.toLowerCase().includes('connection')) {
      return <Wifi size={24} color={adaptiveTheme.colors.error} />;
    }
    if (error.toLowerCase().includes('password') || error.toLowerCase().includes('invalid')) {
      return <Lock size={24} color={adaptiveTheme.colors.error} />;
    }
    return <AlertTriangle size={24} color={adaptiveTheme.colors.error} />;
  };

  const getErrorType = () => {
    if (error.toLowerCase().includes('network') || error.toLowerCase().includes('connection')) {
      return 'network';
    }
    if (error.toLowerCase().includes('password') || error.toLowerCase().includes('invalid')) {
      return 'credentials';
    }
    if (error.toLowerCase().includes('too many') || error.toLowerCase().includes('rate limit')) {
      return 'rate_limit';
    }
    return 'general';
  };

  const getRecoveryActions = () => {
    const errorType = getErrorType();
    const actions = [];

    if (errorType === 'network') {
      actions.push({
        label: 'Check Connection',
        onPress: () => {
          Alert.alert(
            'Check Your Connection',
            'Please ensure you have a stable internet connection and try again.',
            [{ text: 'OK' }],
          );
        },
        icon: <Wifi size={16} color={adaptiveTheme.colors.primary} />,
      });
    }

    if (errorType === 'credentials') {
      actions.push({
        label: 'Forgot Password?',
        onPress: onForgotPassword,
        icon: <Mail size={16} color={adaptiveTheme.colors.primary} />,
      });
    }

    if (retryCount < maxRetries && onRetry) {
      actions.push({
        label: 'Try Again',
        onPress: onRetry,
        icon: <RefreshCw size={16} color={adaptiveTheme.colors.primary} />,
        disabled: isLoading,
      });
    }

    if (retryCount >= maxRetries) {
      actions.push({
        label: 'Contact Support',
        onPress: onContactSupport,
        icon: <Mail size={16} color={adaptiveTheme.colors.secondary} />,
      });
    }

    return actions;
  };

  React.useEffect(() => {
    if (error) {
      // Import feedback dynamically to avoid circular dependencies
      import('@/components/EnhancedUserFeedback').then(({ feedback }) => {
        feedback.error(
          'Authentication Error',
          error,
          {
            persistent: true,
            actions: getRecoveryActions().map((action, index) => ({
              id: `action_${index}`,
              label: action.label,
              type: action.label === 'Try Again' ? 'primary' : 'secondary',
              onPress: action.onPress,
            })),
          },
        );
      }).catch(() => {
        // Fallback to console if feedback is not available
        console.error('Auth Error:', error);
      });
    }
  }, [error, getRecoveryActions]);

  const recoveryActions = getRecoveryActions();

  const styles = StyleSheet.create({
    container: {
      marginVertical: theme.spacing.md,
    },
    errorContainer: {
      backgroundColor: adaptiveTheme.colors.errorLight,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
      borderLeftWidth: 4,
      borderLeftColor: adaptiveTheme.colors.error,
    },
    iconContainer: {
      alignItems: 'center',
      marginBottom: theme.spacing.sm,
    },
    errorTitle: {
      fontSize: theme.fontSize.md,
      fontWeight: '600',
      color: adaptiveTheme.colors.error,
      textAlign: 'center',
      marginBottom: theme.spacing.xs,
    },
    errorMessage: {
      fontSize: theme.fontSize.sm,
      color: adaptiveTheme.colors.textSecondary,
      textAlign: 'center',
      lineHeight: 20,
      marginBottom: theme.spacing.sm,
    },
    retryInfo: {
      fontSize: theme.fontSize.xs,
      color: adaptiveTheme.colors.warning,
      textAlign: 'center',
      marginBottom: theme.spacing.sm,
    },
    actionsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
      gap: theme.spacing.sm,
    },
    actionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: adaptiveTheme.colors.background,
      borderWidth: 1,
      borderColor: adaptiveTheme.colors.primary,
      borderRadius: theme.borderRadius.sm,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
      gap: theme.spacing.xs,
    },
    actionButtonDisabled: {
      opacity: 0.5,
      borderColor: adaptiveTheme.colors.border,
    },
    actionButtonText: {
      fontSize: theme.fontSize.sm,
      color: adaptiveTheme.colors.primary,
      fontWeight: '500',
    },
    actionButtonTextDisabled: {
      color: adaptiveTheme.colors.textSecondary,
    },
    loadingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: theme.spacing.sm,
      gap: theme.spacing.xs,
    },
    loadingText: {
      fontSize: theme.fontSize.sm,
      color: adaptiveTheme.colors.primary,
    },
    spinning: {
      transform: [{ rotate: '360deg' }],
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.errorContainer}>
        <View style={styles.iconContainer}>
          {getErrorIcon()}
        </View>
        
        <Text style={styles.errorTitle}>Authentication Error</Text>
        <Text style={styles.errorMessage}>{error}</Text>

        {retryCount > 0 && (
          <Text style={styles.retryInfo}>
            Attempt {retryCount} of {maxRetries}
          </Text>
        )}

        {recoveryActions.length > 0 && (
          <View style={styles.actionsContainer}>
            {recoveryActions.map((action, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.actionButton,
                  action.disabled && styles.actionButtonDisabled,
                ]}
                onPress={action.onPress}
                disabled={action.disabled || isLoading}
              >
                {action.icon}
                <Text style={[
                  styles.actionButtonText,
                  action.disabled && styles.actionButtonTextDisabled,
                ]}>
                  {action.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {isLoading && (
          <View style={styles.loadingContainer}>
            <RefreshCw size={16} color={adaptiveTheme.colors.primary} style={styles.spinning} />
            <Text style={styles.loadingText}>Retrying...</Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default memo(AuthErrorFeedback);


AuthErrorFeedback.displayName = 'AuthErrorFeedback';
