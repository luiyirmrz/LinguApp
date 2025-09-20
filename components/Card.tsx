import React, { memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { theme } from '@/constants/theme';

export interface CardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  variant?: 'default' | 'elevated' | 'outlined' | 'filled';
  size?: 'small' | 'medium' | 'large';
  onPress?: () => void;
  disabled?: boolean;
  style?: ViewStyle;
  containerStyle?: ViewStyle;
  contentStyle?: ViewStyle;
  titleStyle?: TextStyle;
  subtitleStyle?: TextStyle;
  headerStyle?: ViewStyle;
  footer?: React.ReactNode;
  footerStyle?: ViewStyle;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  children,
  title,
  subtitle,
  variant = 'default',
  size = 'medium',
  onPress,
  disabled = false,
  style,
  containerStyle,
  contentStyle,
  titleStyle,
  subtitleStyle,
  headerStyle,
  footer,
  footerStyle,
  leftIcon,
  rightIcon,
}) => {
  const getVariantStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      backgroundColor: theme.colors.white,
      borderRadius: theme.borderRadius.lg,
    };

    switch (variant) {
      case 'elevated':
        return {
          ...baseStyle,
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: 4,
          },
          shadowOpacity: 0.15,
          shadowRadius: 8,
          elevation: 8,
        };
      case 'outlined':
        return {
          ...baseStyle,
          borderWidth: 2,
          borderColor: theme.colors.gray[200],
        };
      case 'filled':
        return {
          ...baseStyle,
          backgroundColor: theme.colors.gray[50],
        };
      default:
        return {
          ...baseStyle,
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: 2,
          },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        };
    }
  };

  const getSizeStyle = (): ViewStyle => {
    switch (size) {
      case 'small':
        return {
          padding: theme.spacing.md,
        };
      case 'large':
        return {
          padding: theme.spacing.xl,
        };
      default: // medium
        return {
          padding: theme.spacing.lg,
        };
    }
  };

  const getTitleStyle = (): TextStyle => ({
    fontSize: size === 'small' ? theme.fontSize.md : theme.fontSize.lg,
    fontWeight: '600' as const,
    color: theme.colors.text,
    marginBottom: subtitle ? theme.spacing.xs : theme.spacing.sm,
  });

  const getSubtitleStyle = (): TextStyle => ({
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  });

  const CardContainer = onPress ? TouchableOpacity : View;
  const cardProps = onPress ? { onPress, disabled, activeOpacity: 0.8 } : {};

  return (
    <CardContainer
      style={[
        styles.container,
        getVariantStyle(),
        getSizeStyle(),
        disabled && styles.disabled,
        style,
        containerStyle,
      ]}
      {...cardProps}
    >
      {(title || subtitle || leftIcon || rightIcon) && (
        <View style={[styles.header, headerStyle]}>
          <View style={styles.headerContent}>
            {leftIcon && (
              <View style={styles.leftIcon}>
                {leftIcon}
              </View>
            )}
            <View style={styles.titleContainer}>
              {title && (
                <Text style={[getTitleStyle(), titleStyle]}>
                  {title}
                </Text>
              )}
              {subtitle && (
                <Text style={[getSubtitleStyle(), subtitleStyle]}>
                  {subtitle}
                </Text>
              )}
            </View>
          </View>
          {rightIcon && (
            <View style={styles.rightIcon}>
              {rightIcon}
            </View>
          )}
        </View>
      )}

      <View style={[styles.content, contentStyle]}>
        {children}
      </View>

      {footer && (
        <View style={[styles.footer, footerStyle]}>
          {footer}
        </View>
      )}
    </CardContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.md,
  },
  disabled: {
    opacity: 0.6,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  leftIcon: {
    marginRight: theme.spacing.sm,
    marginTop: 2,
  },
  rightIcon: {
    marginLeft: theme.spacing.sm,
    marginTop: 2,
  },
  titleContainer: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  footer: {
    marginTop: theme.spacing.md,
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.gray[100],
  },
});


Card.displayName = 'Card';

export default memo(Card);
