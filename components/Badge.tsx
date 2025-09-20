import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { theme } from '@/constants/theme';

export interface BadgeProps {
  text?: string;
  children?: React.ReactNode;
  color?: string;
  backgroundColor?: string;
  size?: 'small' | 'medium' | 'large';
  style?: ViewStyle;
  textStyle?: TextStyle;
  variant?: 'filled' | 'outlined' | 'subtle';
}

export function Badge({
  text,
  children,
  color = theme.colors.white,
  backgroundColor = theme.colors.primary,
  size = 'medium',
  style,
  textStyle,
  variant = 'filled',
}: BadgeProps) {
  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          paddingHorizontal: theme.spacing.xs,
          paddingVertical: theme.spacing.xxs,
          borderRadius: theme.borderRadius.sm,
        };
      case 'large':
        return {
          paddingHorizontal: theme.spacing.md,
          paddingVertical: theme.spacing.sm,
          borderRadius: theme.borderRadius.lg,
        };
      case 'medium':
      default:
        return {
          paddingHorizontal: theme.spacing.sm,
          paddingVertical: theme.spacing.xs,
          borderRadius: theme.borderRadius.md,
        };
    }
  };

  const getFontSize = () => {
    switch (size) {
      case 'small':
        return theme.fontSize.xs;
      case 'large':
        return theme.fontSize.md;
      case 'medium':
      default:
        return theme.fontSize.sm;
    }
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'outlined':
        return {
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: backgroundColor,
        };
      case 'subtle':
        return {
          backgroundColor: `${backgroundColor}20`, // 20% opacity
          borderWidth: 0,
        };
      case 'filled':
      default:
        return {
          backgroundColor,
          borderWidth: 0,
        };
    }
  };

  const getTextColor = () => {
    if (variant === 'outlined') {
      return backgroundColor;
    }
    return color;
  };

  return (
    <View
      style={[
        styles.badge,
        getSizeStyles(),
        getVariantStyles(),
        style,
      ]}
    >
      <Text
        style={[
          styles.badgeText,
          {
            fontSize: getFontSize(),
            color: getTextColor(),
          },
          textStyle,
        ]}
      >
        {text || children}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontWeight: '600',
    textAlign: 'center',
  },
});
