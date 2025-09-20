import React, { memo, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from '@/components/icons/LucideReplacement';
import { theme } from '@/constants/theme';

export interface ToastAction {
  label: string;
  onPress: () => void;
}

export interface ToastProps {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  action?: ToastAction;
  onDismiss: (id: string) => void;
}

const ToastItem: React.FC<ToastProps> = ({
  id,
  type,
  title,
  message,
  duration = 4000,
  action,
  onDismiss,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-100)).current;

  useEffect(() => {
    // Animate in
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto dismiss
    const timer = setTimeout(() => {
      handleDismiss();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  const handleDismiss = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onDismiss(id);
    });
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle size={20} color={theme.colors.success} />;
      case 'error':
        return <AlertCircle size={20} color={theme.colors.error} />;
      case 'warning':
        return <AlertTriangle size={20} color={theme.colors.warning} />;
      case 'info':
      default:
        return <Info size={20} color={theme.colors.primary} />;
    }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return `${theme.colors.success  }20`;
      case 'error':
        return `${theme.colors.error  }20`;
      case 'warning':
        return `${theme.colors.warning  }20`;
      case 'info':
      default:
        return `${theme.colors.primary  }20`;
    }
  };

  return (
    <Animated.View
      style={[
        styles.toastItem,
        {
          backgroundColor: getBackgroundColor(),
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <View style={styles.toastContent}>
        <View style={styles.toastIconContainer}>
          {getIcon()}
        </View>
        <View style={styles.toastTextContainer}>
          <Text style={styles.toastTitle}>{title}</Text>
          {message && <Text style={styles.toastMessage}>{message}</Text>}
        </View>
        {action && (
          <TouchableOpacity style={styles.actionButton} onPress={action.onPress}>
            <Text style={styles.actionText}>{action.label}</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.closeButton} onPress={handleDismiss}>
          <X size={16} color={theme.colors.textSecondary} />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

ToastItem.displayName = 'ToastItem';

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.sm,
  },
  toastItem: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: theme.colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  toastContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  toastIconContainer: {
    marginRight: theme.spacing.sm,
  },
  toastTextContainer: {
    flex: 1,
  },
  toastTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  toastMessage: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  actionButton: {
    marginLeft: theme.spacing.sm,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.primary,
  },
  actionText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.white,
    fontWeight: '600',
  },
  closeButton: {
    marginLeft: theme.spacing.sm,
    padding: theme.spacing.xs,
  },
});

export default memo(ToastItem);
