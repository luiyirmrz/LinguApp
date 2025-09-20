/**
 * ENHANCED USER FEEDBACK SYSTEM
 * 
 * This component provides comprehensive user feedback for all user actions:
 * - Success feedback with animations
 * - Error feedback with recovery options
 * - Progress indicators for long operations
 * - Confirmation dialogs for destructive actions
 * - Haptic feedback for mobile devices
 * - Accessibility support
 * - Toast notifications with actions
 */

import React, { useState, useRef, useEffect, useCallback, useMemo, memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Modal,
  Alert,
  Platform,
  Dimensions,
  ViewStyle,
  TextStyle,
} from 'react-native';
// Lazy loaded: react-native-safe-area-context
// Lazy loaded: expo-haptics
import {
  CheckCircle,
  AlertCircle,
  Info,
  AlertTriangle,
  X,
  RefreshCw,
  Download,
  Upload,
  Save,
  Trash2,
  Edit,
  Plus,
  Minus,
  Star,
  Heart,
  ThumbsUp,
  ThumbsDown,
} from '@/components/icons/LucideReplacement';
import { theme } from '@/constants/theme';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';
import { lazyLoadHaptics } from '@/services/optimization/LazyDependencies';
import { lazyLoadSafeArea } from '@/services/optimization/LazyDependencies';
import { lazyLoadLucideIcons } from '@/services/optimization/LazyDependencies';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// ============================================================================
// FEEDBACK TYPES AND INTERFACES
// ============================================================================

export type FeedbackType = 'success' | 'error' | 'warning' | 'info' | 'loading';
export type FeedbackPosition = 'top' | 'center' | 'bottom';
export type FeedbackSize = 'small' | 'medium' | 'large';

export interface FeedbackConfig {
  type: FeedbackType;
  title: string;
  message?: string;
  duration?: number;
  position?: FeedbackPosition;
  size?: FeedbackSize;
  showIcon?: boolean;
  showProgress?: boolean;
  progress?: number;
  actions?: FeedbackAction[];
  onClose?: () => void;
  onAction?: (actionId: string) => void;
  hapticFeedback?: boolean;
  persistent?: boolean;
}

export interface FeedbackAction {
  id: string;
  label: string;
  type?: 'primary' | 'secondary' | 'destructive';
  onPress?: () => void;
}

export interface ConfirmationConfig {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'default' | 'destructive';
  onConfirm: () => void;
  onCancel?: () => void;
}

// ============================================================================
// FEEDBACK MANAGER
// ============================================================================

class FeedbackManager {
  private static instance: FeedbackManager;
  private listeners: ((feedback: FeedbackConfig | null) => void)[] = [];
  private currentFeedback: FeedbackConfig | null = null;
  private timeoutId: number | null = null;

  static getInstance(): FeedbackManager {
    if (!FeedbackManager.instance) {
      FeedbackManager.instance = new FeedbackManager();
    }
    return FeedbackManager.instance;
  }

  subscribe(listener: (feedback: FeedbackConfig | null) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify() {
    // Cache the current feedback to prevent infinite loops
    const cachedFeedback = this.currentFeedback;
    this.listeners.forEach(listener => listener(cachedFeedback));
  }

  show(config: FeedbackConfig): void {
    // Clear existing timeout
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }

    this.currentFeedback = config;
    this.notify();

    // Auto-hide if not persistent
    if (!config.persistent && config.duration !== 0) {
      this.timeoutId = setTimeout(() => {
        this.hide();
      }, config.duration || 4000);
    }
  }

  hide(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
    this.currentFeedback = null;
    this.notify();
  }

  updateProgress(progress: number): void {
    if (this.currentFeedback) {
      this.currentFeedback.progress = progress;
      this.notify();
    }
  }

  // Cached getSnapshot function to prevent infinite loops
  getSnapshot = () => {
    return this.currentFeedback;
  };
}

export const feedbackManager = FeedbackManager.getInstance();

// ============================================================================
// FEEDBACK COMPONENT
// ============================================================================

export interface FeedbackProps {
  config: FeedbackConfig;
  onClose: () => void;
}

export const Feedback: React.FC<FeedbackProps> = ({ config, onClose }) => {
  const { user } = useUnifiedAuth();
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const progressAnim = useRef(new Animated.Value(config.progress || 0)).current;

  useEffect(() => {
    // Entrance animation
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    // Progress animation
    if (config.showProgress && config.progress !== undefined) {
      Animated.timing(progressAnim, {
        toValue: config.progress,
        duration: 500,
        useNativeDriver: false,
      }).start();
    }

    // Haptic feedback
    if (config.hapticFeedback !== false && user?.preferences?.hapticEnabled !== false) {
      triggerHapticFeedback(config.type);
    }
  }, [config, slideAnim, scaleAnim, progressAnim, user?.preferences?.hapticEnabled]);

  const triggerHapticFeedback = async (type: FeedbackType) => {
    if (Platform.OS === 'web') return;
    
    try {
      const haptics = await lazyLoadHaptics();
      switch (type) {
        case 'success':
          await haptics.notificationAsync(haptics.NotificationFeedbackType.Success);
          break;
        case 'error':
          await haptics.notificationAsync(haptics.NotificationFeedbackType.Error);
          break;
        case 'warning':
          await haptics.notificationAsync(haptics.NotificationFeedbackType.Warning);
          break;
        case 'info':
        case 'loading':
        default:
          await haptics.impactAsync(haptics.ImpactFeedbackStyle.Light);
      }
    } catch (error) {
      console.error('Haptic feedback error:', error);
    }
  };

  const handleClose = () => {
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: -100,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 0.8,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };

  const handleAction = (action: FeedbackAction) => {
    if (action.onPress) {
      action.onPress();
    }
    if (config.onAction) {
      config.onAction(action.id);
    }
  };

  const getTypeConfig = () => {
    switch (config.type) {
      case 'success':
        return {
          icon: <CheckCircle size={24} color={theme.colors.success} />,
          backgroundColor: theme.colors.success,
          borderColor: theme.colors.success,
        };
      case 'error':
        return {
          icon: <AlertCircle size={24} color={theme.colors.error} />,
          backgroundColor: theme.colors.error,
          borderColor: theme.colors.error,
        };
      case 'warning':
        return {
          icon: <AlertTriangle size={24} color={theme.colors.warning} />,
          backgroundColor: theme.colors.warning,
          borderColor: theme.colors.warning,
        };
      case 'loading':
        return {
          icon: <RefreshCw size={24} color={theme.colors.primary} />,
          backgroundColor: theme.colors.primary,
          borderColor: theme.colors.primary,
        };
      case 'info':
      default:
        return {
          icon: <Info size={24} color={theme.colors.primary} />,
          backgroundColor: theme.colors.primary,
          borderColor: theme.colors.primary,
        };
    }
  };

  const getSizeStyle = (): ViewStyle => {
    switch (config.size) {
      case 'small':
        return { padding: theme.spacing.md };
      case 'large':
        return { padding: theme.spacing.xl };
      default:
        return { padding: theme.spacing.lg };
    }
  };

  const getPositionStyle = (): ViewStyle => {
    switch (config.position) {
      case 'top':
        return { top: 50 };
      case 'bottom':
        return { bottom: 50 };
      case 'center':
      default:
        return { top: screenHeight / 2 - 100 };
    }
  };

  const typeConfig = getTypeConfig();

  return (
    <Animated.View
      style={[
        styles.feedback,
        getSizeStyle(),
        getPositionStyle(),
        {
          transform: [
            { translateY: slideAnim },
            { scale: scaleAnim },
          ],
          borderLeftColor: typeConfig.borderColor,
        },
      ]}
    >
      <View style={styles.feedbackContent}>
        <View style={styles.feedbackHeader}>
          {config.showIcon !== false && (
            <View style={styles.feedbackIcon}>
              {typeConfig.icon}
            </View>
          )}
          
          <View style={styles.feedbackText}>
            <Text style={styles.feedbackTitle}>{config.title}</Text>
            {config.message && (
              <Text style={styles.feedbackMessage}>{config.message}</Text>
            )}
          </View>
          
          {!config.persistent && (
            <TouchableOpacity
              style={styles.closeButton}
              onPress={handleClose}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <X size={16} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
        
        {config.showProgress && (
          <View style={styles.progressContainer as any}>
            <View style={styles.progressBar as any}>
              <Animated.View 
                style={[
                  styles.progressFill as any, 
                  { 
                    width: progressAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0%', '100%'],
                    }),
                  },
                ]} 
              />
            </View>
            <Text style={styles.progressText as any}>
              {Math.round((config.progress || 0) * 100)}%
            </Text>
          </View>
        )}
        
        {config.actions && config.actions.length > 0 && (
          <View style={styles.actionsContainer as any}>
            {config.actions.map((action) => (
              <TouchableOpacity
                key={action.id}
                style={[
                  styles.actionButton as any,
                  action.type === 'primary' && styles.primaryAction as any,
                  action.type === 'destructive' && styles.destructiveAction as any,
                ]}
                onPress={() => handleAction(action)}
              >
                <Text
                  style={[
                    styles.actionText as any,
                    action.type === 'primary' && styles.primaryActionText as any,
                    action.type === 'destructive' && styles.destructiveActionText as any,
                  ]}
                >
                  {action.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    </Animated.View>
  );
};

// ============================================================================
// CONFIRMATION DIALOG
// ============================================================================

export interface ConfirmationDialogProps {
  visible: boolean;
  config: ConfirmationConfig;
  onClose: () => void;
}

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  visible,
  config,
  onClose,
}) => {
  const { user } = useUnifiedAuth();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, fadeAnim, scaleAnim]);

  const handleConfirm = async () => {
    if (user?.preferences?.hapticEnabled !== false) {
      const haptics = await lazyLoadHaptics();
      await haptics.impactAsync(haptics.ImpactFeedbackStyle.Medium);
    }
    config.onConfirm();
    onClose();
  };

  const handleCancel = async () => {
    if (user?.preferences?.hapticEnabled !== false) {
      const haptics = await lazyLoadHaptics();
      await haptics.impactAsync(haptics.ImpactFeedbackStyle.Light);
    }
    if (config.onCancel) {
      config.onCancel();
    }
    onClose();
  };

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onClose}
    >
      <Animated.View style={[styles.modalOverlay as any, { opacity: fadeAnim }]}>
        <Animated.View
          style={[
            styles.modalContent as any,
            { transform: [{ scale: scaleAnim }] },
          ]}
        >
          <View style={styles.modalHeader as any}>
            <Text style={styles.modalTitle as any}>{config.title}</Text>
          </View>
          
          <View style={styles.modalBody as any}>
            <Text style={styles.modalMessage as any}>{config.message}</Text>
          </View>
          
          <View style={styles.modalActions as any}>
            <TouchableOpacity
              style={[
                styles.modalButton as any,
                styles.cancelButton as any,
                config.type === 'destructive' && styles.destructiveCancelButton as any,
              ]}
              onPress={handleCancel}
            >
              <Text
                style={[
                  styles.modalButtonText as any,
                  styles.cancelButtonText as any,
                  config.type === 'destructive' && styles.destructiveCancelButtonText as any,
                ]}
              >
                {config.cancelText || 'Cancel'}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.modalButton as any,
                styles.confirmButton as any,
                config.type === 'destructive' && styles.destructiveConfirmButton as any,
              ]}
              onPress={handleConfirm}
            >
              <Text
                style={[
                  styles.modalButtonText as any,
                  styles.confirmButtonText as any,
                  config.type === 'destructive' && styles.destructiveConfirmButtonText as any,
                ]}
              >
                {config.confirmText || 'Confirm'}
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

// ============================================================================
// FEEDBACK CONTAINER
// ============================================================================

export const FeedbackContainer: React.FC = () => {
  const [feedback, setFeedback] = useState<FeedbackConfig | null>(null);

  // Cached getSnapshot function to prevent infinite loops
  const getSnapshot = useCallback(() => {
    return feedback;
  }, [feedback]);

  // Memoized close handler to prevent re-renders
  const handleClose = useCallback(() => {
    feedbackManager.hide();
  }, []);

  useEffect(() => {
    const unsubscribe = feedbackManager.subscribe(setFeedback);
    return unsubscribe;
  }, []);

  if (!feedback) return null;

  return (
    <Feedback
      config={feedback}
      onClose={handleClose}
    />
  );
};

// ============================================================================
// CONVENIENCE FUNCTIONS
// ============================================================================

export const showFeedback = (config: FeedbackConfig) => {
  feedbackManager.show(config);
};

export const hideFeedback = () => {
  feedbackManager.hide();
};

export const updateProgress = (progress: number) => {
  feedbackManager.updateProgress(progress);
};

// Predefined feedback types
export const feedback = {
  success: (title: string, message?: string, options?: Partial<FeedbackConfig>) =>
    showFeedback({ type: 'success', title, message, ...options }),
  
  error: (title: string, message?: string, options?: Partial<FeedbackConfig>) =>
    showFeedback({ type: 'error', title, message, ...options }),
  
  warning: (title: string, message?: string, options?: Partial<FeedbackConfig>) =>
    showFeedback({ type: 'warning', title, message, ...options }),
  
  info: (title: string, message?: string, options?: Partial<FeedbackConfig>) =>
    showFeedback({ type: 'info', title, message, ...options }),
  
  loading: (title: string, message?: string, options?: Partial<FeedbackConfig>) =>
    showFeedback({ type: 'loading', title, message, persistent: true, ...options }),
  
  progress: (title: string, progress: number, message?: string) =>
    showFeedback({ 
      type: 'loading', 
      title, 
      message, 
      showProgress: true, 
      progress,
      persistent: true, 
    }),
};

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  feedback: {
    position: 'absolute',
    left: theme.spacing.md,
    right: theme.spacing.md,
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 9999,
  },
  feedbackContent: {
    flex: 1,
  },
  feedbackHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  feedbackIcon: {
    marginRight: theme.spacing.md,
    marginTop: 2,
  },
  feedbackText: {
    flex: 1,
    marginRight: theme.spacing.md,
  },
  feedbackTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  feedbackMessage: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
  closeButton: {
    padding: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  progressContainer: {
    marginTop: theme.spacing.md,
    alignItems: 'center',
  },
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: theme.colors.gray[200],
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.primary,
  },
  progressText: {
    marginTop: theme.spacing.sm,
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  actionsContainer: {
    marginTop: theme.spacing.md,
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  actionButton: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.gray[100],
    alignItems: 'center',
  },
  primaryAction: {
    backgroundColor: theme.colors.primary,
  },
  destructiveAction: {
    backgroundColor: theme.colors.error,
  },
  actionText: {
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
    color: theme.colors.text,
  },
  primaryActionText: {
    color: theme.colors.white,
  },
  destructiveActionText: {
    color: theme.colors.white,
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  modalContent: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray[100],
  },
  modalTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: '600',
    color: theme.colors.text,
    textAlign: 'center',
  },
  modalBody: {
    padding: theme.spacing.lg,
  },
  modalMessage: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  modalActions: {
    flexDirection: 'row',
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  modalButton: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: theme.colors.gray[100],
  },
  destructiveCancelButton: {
    backgroundColor: theme.colors.gray[200],
  },
  confirmButton: {
    backgroundColor: theme.colors.primary,
  },
  destructiveConfirmButton: {
    backgroundColor: theme.colors.error,
  },
  modalButtonText: {
    fontSize: theme.fontSize.md,
    fontWeight: '600',
  },
  cancelButtonText: {
    color: theme.colors.text,
  },
  destructiveCancelButtonText: {
    color: theme.colors.textSecondary,
  },
  confirmButtonText: {
    color: theme.colors.white,
  },
  destructiveConfirmButtonText: {
    color: theme.colors.white,
  },
});

export default {
  Feedback,
  ConfirmationDialog,
  FeedbackContainer,
  showFeedback,
  hideFeedback,
  updateProgress,
  feedback,
};


// EnhancedUserFeedback.displayName = 'EnhancedUserFeedback';
