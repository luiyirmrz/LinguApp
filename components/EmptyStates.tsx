import React, { memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { 
  Inbox, 
  Search, 
  Heart, 
  BookOpen, 
  Users, 
  Trophy,
  MessageCircle,
  Settings,
  HelpCircle,
  RefreshCw,
} from '@/components/icons/LucideReplacement';
import { theme } from '@/constants/theme';
// import { lazyLoadLucideIcons } from '@/services/LazyDependencies';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  subtitle?: string;
  actionText?: string;
  onAction?: () => void;
  variant?: 'default' | 'search' | 'favorites' | 'lessons' | 'friends' | 'achievements' | 'messages' | 'settings' | 'help';
  containerStyle?: ViewStyle;
  iconStyle?: ViewStyle;
  titleStyle?: TextStyle;
  subtitleStyle?: TextStyle;
  actionStyle?: ViewStyle;
  actionTextStyle?: TextStyle;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  subtitle,
  actionText,
  onAction,
  variant = 'default',
  containerStyle,
  iconStyle,
  titleStyle,
  subtitleStyle,
  actionStyle,
  actionTextStyle,
}) => {
  const getVariantIcon = () => {
    if (icon) return icon;

    const iconSize = 64;
    const iconColor = theme.colors.gray[300];

    switch (variant) {
      case 'search':
        return <Search size={iconSize} color={iconColor} />;
      case 'favorites':
        return <Heart size={iconSize} color={iconColor} />;
      case 'lessons':
        return <BookOpen size={iconSize} color={iconColor} />;
      case 'friends':
        return <Users size={iconSize} color={iconColor} />;
      case 'achievements':
        return <Trophy size={iconSize} color={iconColor} />;
      case 'messages':
        return <MessageCircle size={iconSize} color={iconColor} />;
      case 'settings':
        return <Settings size={iconSize} color={iconColor} />;
      case 'help':
        return <HelpCircle size={iconSize} color={iconColor} />;
      default:
        return <Inbox size={iconSize} color={iconColor} />;
    }
  };

  return (
    <View style={[styles.container, containerStyle]}>
      <View style={[styles.iconContainer, iconStyle]}>
        {getVariantIcon()}
      </View>
      
      <Text style={[styles.title as any, titleStyle]}>
        {title}
      </Text>
      
      {subtitle && (
        <Text style={[styles.subtitle, subtitleStyle]}>
          {subtitle}
        </Text>
      )}
      
      {actionText && onAction && (
        <TouchableOpacity
          style={[styles.actionButton, actionStyle]}
          onPress={onAction}
          activeOpacity={0.8}
        >
          <Text style={[styles.actionText, actionTextStyle]}>
            {actionText}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export interface EmptyListProps {
  title: string;
  subtitle?: string;
  actionText?: string;
  onAction?: () => void;
  variant?: EmptyStateProps['variant'];
  containerStyle?: ViewStyle;
}

export const EmptyList: React.FC<EmptyListProps> = ({
  title,
  subtitle,
  actionText,
  onAction,
  variant,
  containerStyle,
}) => {
  return (
    <View style={[styles.listContainer, containerStyle]}>
      <EmptyState
        title={title}
        subtitle={subtitle}
        actionText={actionText}
        onAction={onAction}
        variant={variant}
      />
    </View>
  );
};

export interface EmptySearchProps {
  query?: string;
  onClearSearch?: () => void;
  onRetry?: () => void;
  containerStyle?: ViewStyle;
}

export const EmptySearch: React.FC<EmptySearchProps> = ({
  query,
  onClearSearch,
  onRetry,
  containerStyle,
}) => {
  return (
    <View style={[styles.container, containerStyle]}>
      <View style={styles.iconContainer}>
        <Search size={64} color={theme.colors.gray[300]} />
      </View>
      
      <Text style={styles.title as any}>
        {query ? `No results for "${query}"` : 'No search results'}
      </Text>
      
      <Text style={styles.subtitle}>
        Try adjusting your search terms or browse our categories
      </Text>
      
      <View style={styles.actionContainer}>
        {onClearSearch && (
          <TouchableOpacity
            style={[styles.actionButton, styles.secondaryButton]}
            onPress={onClearSearch}
            activeOpacity={0.8}
          >
            <Text style={[styles.actionText, styles.secondaryActionText]}>
              Clear Search
            </Text>
          </TouchableOpacity>
        )}
        
        {onRetry && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={onRetry}
            activeOpacity={0.8}
          >
            <RefreshCw size={16} color={theme.colors.white} />
            <Text style={styles.actionText}>
              Try Again
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export interface EmptyErrorProps {
  title?: string;
  subtitle?: string;
  onRetry?: () => void;
  containerStyle?: ViewStyle;
}

export const EmptyError: React.FC<EmptyErrorProps> = ({
  title = 'Something went wrong',
  subtitle = "We couldn't load the content. Please try again.",
  onRetry,
  containerStyle,
}) => {
  return (
    <View style={[styles.container, containerStyle]}>
      <View style={styles.iconContainer}>
        <HelpCircle size={64} color={theme.colors.error} />
      </View>
      
      <Text style={[styles.title as any, styles.errorTitle]}>
        {title}
      </Text>
      
      <Text style={styles.subtitle}>
        {subtitle}
      </Text>
      
      {onRetry && (
        <TouchableOpacity
          style={[styles.actionButton, styles.errorButton]}
          onPress={onRetry}
          activeOpacity={0.8}
        >
          <RefreshCw size={16} color={theme.colors.white} />
          <Text style={styles.actionText}>
            Try Again
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xl,
  },
  listContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xl,
  },
  iconContainer: {
    marginBottom: theme.spacing.lg,
  },
  title: {
    fontSize: theme.fontSize.xl,
    fontWeight: '600' as const,
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  errorTitle: {
    color: theme.colors.error,
  },
  subtitle: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: theme.spacing.xl,
    maxWidth: 300,
  },
  actionContainer: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    gap: theme.spacing.sm,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  errorButton: {
    backgroundColor: theme.colors.error,
  },
  actionText: {
    color: theme.colors.white,
    fontSize: theme.fontSize.md,
    fontWeight: '600' as const,
  },
  secondaryActionText: {
    color: theme.colors.primary,
  },
});


EmptyState.displayName = 'EmptyState';

export default memo(EmptyState);
