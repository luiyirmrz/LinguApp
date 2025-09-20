/**
 * ENHANCED ERROR HANDLING HOOK
 * 
 * This hook provides comprehensive error handling capabilities for React components:
 * - Integration with centralized error service
 * - User-friendly error messages
 * - Retry mechanisms
 * - Loading states during error recovery
 * - Toast notifications for user feedback
 * - Haptic feedback for mobile devices
 */

import { useState, useCallback } from 'react';
import { Platform, Alert } from 'react-native';
import * as Haptics from 'expo-haptics';
import { 
  centralizedErrorService, 
  ErrorCategory, 
  ErrorContext,
  handleError,
  handleAuthError,
  handleNetworkError,
  handleDatabaseError,
} from '@/services/monitoring/centralizedErrorService';
// import { toast } from '@/components/Toast';
import { useUnifiedAuth } from './useUnifiedAuth';

export interface ErrorHandlingOptions {
  showToast?: boolean;
  showAlert?: boolean;
  enableHaptic?: boolean;
  enableRetry?: boolean;
  maxRetries?: number;
  retryDelay?: number;
  onError?: (error: Error, context: ErrorContext) => void;
  onRetry?: (retryCount: number) => void;
  onSuccess?: () => void;
}

export interface ErrorState {
  isError: boolean;
  error: Error | null;
  isRetrying: boolean;
  retryCount: number;
  userMessage: string;
}

export const useEnhancedErrorHandling = (options: ErrorHandlingOptions = {}) => {
  const { user, signIn, signOut, signUp, resetPassword, updateUser } = useUnifiedAuth();
  const [errorState, setErrorState] = useState<ErrorState>({
    isError: false,
    error: null,
    isRetrying: false,
    retryCount: 0,
    userMessage: '',
  });

  const {
    showToast = true,
    showAlert = false,
    enableHaptic = true,
    enableRetry = true,
    maxRetries = 3,
    retryDelay = 1000,
    onError,
    onRetry,
    onSuccess,
  } = options;

  // Trigger haptic feedback
  const triggerHaptic = useCallback(async (type: 'success' | 'error' | 'warning' | 'light') => {
    if (!enableHaptic || Platform.OS === 'web' || !user?.preferences?.hapticEnabled) return;
    
    try {
      switch (type) {
        case 'success':
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          break;
        case 'error':
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          break;
        case 'warning':
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          break;
        case 'light':
        default:
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    } catch (error) {
      console.error('Haptic feedback error:', error);
    }
  }, [enableHaptic, user?.preferences?.hapticEnabled]);

  // Show user feedback
  const showUserFeedback = useCallback((message: string, type: 'success' | 'error' | 'warning' | 'info') => {
    if (showToast) {
      switch (type) {
        case 'success':
          // toast.success('Success', message);
          break;
        case 'error':
          // toast.error('Error', message);
          break;
        case 'warning':
          // toast.warning('Warning', message);
          break;
        case 'info':
        default:
          // toast.info('Info', message);
      }
    }

    if (showAlert) {
      Alert.alert(
        type === 'error' ? 'Error' : type === 'warning' ? 'Warning' : 'Info',
        message,
        [{ text: 'OK' }],
      );
    }

    // Trigger haptic feedback
    const hapticType = type === 'info' ? 'light' : type;
    triggerHaptic(hapticType);
  }, [showToast, showAlert, triggerHaptic]);

  // Handle any error with comprehensive recovery
  const handleErrorWithRecovery = useCallback(async (
    error: Error | string,
    category: ErrorCategory = 'unknown',
    context: Partial<ErrorContext> = {},
    retryFunction?: () => Promise<any>,
  ) => {
    const errorMessage = typeof error === 'string' ? error : error.message;
    
    setErrorState(prev => ({
      ...prev,
      isError: true,
      error: error instanceof Error ? error : new Error(errorMessage),
      userMessage: '',
    }));

    try {
      const result = await handleError(error, category, {
        ...context,
        component: 'React Component',
        userId: user?.id,
      }, retryFunction);

      setErrorState(prev => ({
        ...prev,
        userMessage: result.userMessage,
        isRetrying: result.shouldRetry,
      }));

      // Show user feedback
      if (result.userMessage) {
        showUserFeedback(result.userMessage, 'error');
      }

      // Call custom error handler
      if (onError && error instanceof Error) {
        onError(error, {
          ...context,
          timestamp: new Date().toISOString(),
          component: 'React Component',
          userId: user?.id,
        });
      }

      return result;
    } catch (handlingError) {
      console.error('Error in error handling:', handlingError);
      showUserFeedback('An unexpected error occurred', 'error');
      return { success: false, shouldRetry: false, userMessage: 'An unexpected error occurred' };
    }
  }, [user, onError, showUserFeedback]);

  // Handle authentication errors
  const handleAuthErrorWithRecovery = useCallback(async (
    error: Error | string,
    context: { email?: string; retryCount?: number } = {},
  ) => {
    const result = await handleAuthError(error, context);
    
    setErrorState(prev => ({
      ...prev,
      isError: !result.success,
      userMessage: result.userMessage,
      isRetrying: result.shouldRetry,
    }));

    if (result.userMessage) {
      showUserFeedback(result.userMessage, 'error');
    }

    return result;
  }, [showUserFeedback]);

  // Handle network errors with retry
  const handleNetworkErrorWithRetry = useCallback(async (
    error: Error | string,
    retryFunction: () => Promise<any>,
    context: { endpoint?: string; retryCount?: number } = {},
  ) => {
    setErrorState(prev => ({
      ...prev,
      isError: true,
      isRetrying: true,
    }));

    const result = await handleNetworkError(error, retryFunction, context);
    
    setErrorState(prev => ({
      ...prev,
      isError: !result.success,
      isRetrying: false,
      userMessage: result.userMessage,
    }));

    if (result.userMessage) {
      showUserFeedback(result.userMessage, result.success ? 'success' : 'error');
    }

    if (result.success && onSuccess) {
      onSuccess();
    }

    return result;
  }, [showUserFeedback, onSuccess]);

  // Handle database errors
  const handleDatabaseErrorWithFallback = useCallback(async (
    error: Error | string,
    operation: 'read' | 'write' | 'delete',
    context: { table?: string; retryCount?: number } = {},
  ) => {
    const result = await handleDatabaseError(error, operation, context);
    
    setErrorState(prev => ({
      ...prev,
      isError: !result.success,
      userMessage: result.userMessage,
    }));

    if (result.userMessage) {
      showUserFeedback(result.userMessage, 'error');
    }

    return result;
  }, [showUserFeedback]);

  // Manual retry function
  const retryOperation = useCallback(async (retryFunction: () => Promise<any>) => {
    if (!enableRetry || errorState.retryCount >= maxRetries) {
      showUserFeedback('Maximum retry attempts reached', 'error');
      return { success: false };
    }

    setErrorState(prev => ({
      ...prev,
      isRetrying: true,
      retryCount: prev.retryCount + 1,
    }));

    if (onRetry) {
      onRetry(errorState.retryCount + 1);
    }

    try {
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, retryDelay * (errorState.retryCount + 1)));
      
      const result = await retryFunction();
      
      setErrorState(prev => ({
        ...prev,
        isError: false,
        isRetrying: false,
        error: null,
        userMessage: '',
      }));

      showUserFeedback('Operation completed successfully', 'success');
      
      if (onSuccess) {
        onSuccess();
      }

      return { success: true, data: result };
    } catch (error) {
      setErrorState(prev => ({
        ...prev,
        isRetrying: false,
        error: error instanceof Error ? error : new Error(String(error)),
      }));

      showUserFeedback('Retry failed. Please try again.', 'error');
      return { success: false, error };
    }
  }, [enableRetry, maxRetries, errorState.retryCount, retryDelay, onRetry, onSuccess, showUserFeedback]);

  // Clear error state
  const clearError = useCallback(() => {
    setErrorState({
      isError: false,
      error: null,
      isRetrying: false,
      retryCount: 0,
      userMessage: '',
    });
  }, []);

  // Show success message
  const showSuccess = useCallback((message: string) => {
    showUserFeedback(message, 'success');
  }, [showUserFeedback]);

  // Show warning message
  const showWarning = useCallback((message: string) => {
    showUserFeedback(message, 'warning');
  }, [showUserFeedback]);

  // Show info message
  const showInfo = useCallback((message: string) => {
    showUserFeedback(message, 'info');
  }, [showUserFeedback]);

  return {
    // Error state
    ...errorState,
    
    // Error handling functions
    handleError: handleErrorWithRecovery,
    handleAuthError: handleAuthErrorWithRecovery,
    handleNetworkError: handleNetworkErrorWithRetry,
    handleDatabaseError: handleDatabaseErrorWithFallback,
    
    // Utility functions
    retryOperation,
    clearError,
    showSuccess,
    showWarning,
    showInfo,
    
    // Haptic feedback
    triggerHaptic,
  };
};

export default useEnhancedErrorHandling;
