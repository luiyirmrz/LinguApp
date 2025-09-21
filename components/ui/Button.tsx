/**
 * Improved Button Component using the Design System
 * Provides consistent styling, accessibility, and responsive design
 */

import React, { memo, forwardRef } from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  TouchableOpacityProps,
} from 'react-native';
import { componentStyles, colors, typography, spacing } from '@/constants/designSystem';

export interface ButtonProps extends Omit<TouchableOpacityProps, 'style'> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const Button = memo(forwardRef<TouchableOpacity, ButtonProps>(({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  children,
  style,
  textStyle,
  onPress,
  ...props
}, ref) => {
  const isDisabled = disabled || loading;

  const buttonStyle: ViewStyle = {
    ...componentStyles.button.base,
    ...componentStyles.button.sizes[size],
    ...componentStyles.button.variants[variant],
    ...(fullWidth && { width: '100%' }),
    ...(isDisabled && {
      opacity: 0.6,
      backgroundColor: variant === 'primary' ? colors.gray[400] : undefined,
    }),
    ...style,
  };

  const getTextColor = (): string => {
    if (isDisabled) return colors.text.tertiary;
    
    switch (variant) {
      case 'primary':
        return colors.text.inverse;
      case 'secondary':
        return colors.text.primary;
      case 'outline':
        return colors.primary[600];
      case 'ghost':
        return colors.primary[600];
      default:
        return colors.text.primary;
    }
  };

  const textStyleComputed: TextStyle = {
    fontSize: typography.fontSize[size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : 'base'],
    fontWeight: typography.fontWeight.semiBold,
    color: getTextColor(),
    textAlign: 'center',
    ...textStyle,
  };

  const handlePress = (event: any) => {
    if (!isDisabled && onPress) {
      onPress(event);
    }
  };

  return (
    <TouchableOpacity
      ref={ref}
      style={buttonStyle}
      onPress={handlePress}
      disabled={isDisabled}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityState={{
        disabled: isDisabled,
        busy: loading,
      }}
      {...props}
    >
      {loading && (
        <ActivityIndicator
          size="small"
          color={getTextColor()}
          style={{ marginRight: leftIcon || rightIcon ? spacing.xs : 0 }}
        />
      )}
      
      {!loading && leftIcon && (
        <React.Fragment>
          {leftIcon}
          <Text style={{ width: spacing.xs }} />
        </React.Fragment>
      )}
      
      <Text style={textStyleComputed}>
        {children}
      </Text>
      
      {!loading && rightIcon && (
        <React.Fragment>
          <Text style={{ width: spacing.xs }} />
          {rightIcon}
        </React.Fragment>
      )}
    </TouchableOpacity>
  );
}));

Button.displayName = 'Button';

export default Button;
