import React, { memo } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useContext } from 'react';
import { AdaptiveThemeContext } from '@/contexts/AdaptiveThemeContext';

// Loading Spinner Component
export interface LoadingSpinnerProps {
  size?: 'small' | 'large';
  color?: string;
  text?: string;
  containerStyle?: any;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'large', 
  color, 
  text,
  containerStyle,
}) => {
  const context = useContext(AdaptiveThemeContext);
  if (!context) {
    throw new Error('EnhancedLoadingStates must be used within AdaptiveThemeProvider');
  }
  const { theme } = context;
  
  return (
    <View style={[styles.container, containerStyle]}>
      <ActivityIndicator 
        size={size} 
        color={color || theme.colors.primary} 
      />
      {text && (
        <Text style={[styles.text, { color: theme.colors.text }]}>
          {text}
        </Text>
      )}
    </View>
  );
};

// Skeleton Component
export interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: any;
}

export const Skeleton: React.FC<SkeletonProps> = ({ 
  width = '100%', 
  height = 20, 
  borderRadius = 4,
  style,
}) => {
  const context = useContext(AdaptiveThemeContext);
  if (!context) {
    throw new Error('EnhancedLoadingStates must be used within AdaptiveThemeProvider');
  }
  const { theme } = context;
  
  return (
    <View 
      style={[
        styles.skeleton, 
        { 
          width, 
          height, 
          borderRadius,
          backgroundColor: theme.colors.surface, 
        },
        style,
      ]} 
    />
  );
};

// Skeleton Card Component
export interface SkeletonCardProps {
  title?: boolean;
  subtitle?: boolean;
  content?: boolean;
  actions?: boolean;
}

export const SkeletonCard: React.FC<SkeletonCardProps> = ({ 
  title = true, 
  subtitle = true, 
  content = true, 
  actions = true, 
}) => {
  return (
    <View style={styles.card}>
      {title && <Skeleton width="60%" height={24} />}
      {subtitle && <Skeleton width="40%" height={16} style={{ marginTop: 8 }} />}
      {content && (
        <View style={{ marginTop: 12 }}>
          <Skeleton width="100%" height={16} />
          <Skeleton width="80%" height={16} style={{ marginTop: 4 }} />
          <Skeleton width="60%" height={16} style={{ marginTop: 4 }} />
        </View>
      )}
      {actions && (
        <View style={styles.actions}>
          <Skeleton width={80} height={32} />
          <Skeleton width={80} height={32} />
        </View>
      )}
    </View>
  );
};

// Skeleton List Component
export interface SkeletonListProps {
  count?: number;
  showAvatar?: boolean;
}

export const SkeletonList: React.FC<SkeletonListProps> = ({ 
  count = 5, 
  showAvatar = true, 
}) => {
  return (
    <View style={styles.list}>
      {Array.from({ length: count }).map((_, index) => (
        <View key={index} style={styles.listItem}>
          {showAvatar && <Skeleton width={40} height={40} borderRadius={20} />}
          <View style={styles.listContent}>
            <Skeleton width="70%" height={18} />
            <Skeleton width="50%" height={14} style={{ marginTop: 4 }} />
          </View>
        </View>
      ))}
    </View>
  );
};

// Loading Overlay Component
export interface LoadingOverlayProps {
  visible: boolean;
  text?: string;
  transparent?: boolean;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ 
  visible, 
  text, 
  transparent = false, 
}) => {
  const context = useContext(AdaptiveThemeContext);
  if (!context) {
    throw new Error('EnhancedLoadingStates must be used within AdaptiveThemeProvider');
  }
  const { theme } = context;
  
  if (!visible) return null;
  
  return (
    <View style={[
      styles.overlay, 
      { 
        backgroundColor: transparent ? 'transparent' : 'rgba(0,0,0,0.5)', 
      },
    ]}>
      <View style={[styles.overlayContent, { backgroundColor: theme.colors.surface }]}>
        <LoadingSpinner text={text} />
      </View>
    </View>
  );
};

// Error State Component
export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  retryText?: string;
  onGoHome?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ 
  title = 'Error', 
  message = 'Something went wrong', 
  onRetry, 
  retryText = 'Try Again',
  onGoHome,
}) => {
  const context = useContext(AdaptiveThemeContext);
  if (!context) {
    throw new Error('EnhancedLoadingStates must be used within AdaptiveThemeProvider');
  }
  const { theme } = context;
  
  return (
    <View style={styles.errorContainer}>
      <Text style={[styles.errorTitle, { color: theme.colors.error }]}>
        {title}
      </Text>
      <Text style={[styles.errorMessage, { color: theme.colors.textSecondary }]}>
        {message}
      </Text>
      <View style={styles.buttonContainer}>
        {onRetry && (
          <View style={[styles.retryButton, { backgroundColor: theme.colors.primary }]}>
            <Text style={[styles.retryText, { color: theme.colors.background }]}>
              {retryText}
            </Text>
          </View>
        )}
        {onGoHome && (
          <View style={[styles.retryButton, { backgroundColor: theme.colors.secondary }]}>
            <Text style={[styles.retryText, { color: theme.colors.background }]}>
              Go Home
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

// Network Error State Component
export interface NetworkErrorStateProps {
  onRetry?: () => void;
}

export const NetworkErrorState: React.FC<NetworkErrorStateProps> = ({ onRetry }) => {
  return (
    <ErrorState
      title="Connection Error"
      message="Please check your internet connection and try again"
      onRetry={onRetry}
      retryText="Retry"
    />
  );
};

// Enhanced Empty State Component
export interface EnhancedEmptyStateProps {
  title?: string;
  message?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

export const EnhancedEmptyState: React.FC<EnhancedEmptyStateProps> = ({ 
  title = 'No Data', 
  message = 'There is no data to display', 
  icon, 
  action, 
}) => {
  const context = useContext(AdaptiveThemeContext);
  if (!context) {
    throw new Error('EnhancedLoadingStates must be used within AdaptiveThemeProvider');
  }
  const { theme } = context;
  
  return (
    <View style={styles.emptyContainer}>
      {icon}
      <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
        {title}
      </Text>
      <Text style={[styles.emptyMessage, { color: theme.colors.textSecondary }]}>
        {message}
      </Text>
      {action}
    </View>
  );
};

// Empty State Component (alias for backward compatibility)
export const EmptyState = EnhancedEmptyState;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  text: {
    marginTop: 12,
    fontSize: 16,
    textAlign: 'center',
  },
  skeleton: {
    backgroundColor: '#E0E0E0',
  },
  card: {
    padding: 16,
    margin: 8,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  list: {
    padding: 16,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  listContent: {
    flex: 1,
    marginLeft: 12,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  overlayContent: {
    padding: 24,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 6,
  },
  retryText: {
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
  },
});


// Main component that exports all loading states
const EnhancedLoadingStates = {
  LoadingSpinner,
  Skeleton,
};

// EnhancedLoadingStates.displayName = 'EnhancedLoadingStates';

export default EnhancedLoadingStates;
