/**
 * Improved Input Component using the Design System
 * Provides consistent styling, validation, and accessibility
 */

import React, { memo, forwardRef, useState } from 'react';
import {
  TextInput,
  View,
  Text,
  TextInputProps,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { componentStyles, colors, typography, spacing } from '@/constants/designSystem';

export interface InputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  disabled?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  labelStyle?: TextStyle;
  errorStyle?: TextStyle;
  helperStyle?: TextStyle;
}

const Input = memo(forwardRef<TextInput, InputProps>(({
  label,
  error,
  helperText,
  required = false,
  disabled = false,
  leftIcon,
  rightIcon,
  containerStyle,
  inputStyle,
  labelStyle,
  errorStyle,
  helperStyle,
  onFocus,
  onBlur,
  ...props
}, ref) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = (event: any) => {
    setIsFocused(true);
    onFocus?.(event);
  };

  const handleBlur = (event: any) => {
    setIsFocused(false);
    onBlur?.(event);
  };

  const getInputStyle = (): ViewStyle => {
    const baseStyle = { ...componentStyles.input.base };
    
    if (isFocused) {
      return { ...baseStyle, ...componentStyles.input.focus };
    }
    
    if (error) {
      return { ...baseStyle, ...componentStyles.input.error };
    }
    
    if (disabled) {
      return { ...baseStyle, ...componentStyles.input.disabled };
    }
    
    return baseStyle;
  };

  const containerStyleComputed: ViewStyle = {
    marginBottom: spacing.md,
    ...containerStyle,
  };

  const labelStyleComputed: TextStyle = {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: error ? colors.error[600] : colors.text.primary,
    marginBottom: spacing.xs,
    ...labelStyle,
  };

  const inputStyleComputed: ViewStyle = {
    ...getInputStyle(),
    flexDirection: 'row',
    alignItems: 'center',
    ...(leftIcon && { paddingLeft: spacing.sm }),
    ...(rightIcon && { paddingRight: spacing.sm }),
    ...inputStyle,
  };

  const errorStyleComputed: TextStyle = {
    fontSize: typography.fontSize.xs,
    color: colors.error[600],
    marginTop: spacing.xs,
    ...errorStyle,
  };

  const helperStyleComputed: TextStyle = {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
    marginTop: spacing.xs,
    ...helperStyle,
  };

  return (
    <View style={containerStyleComputed}>
      {label && (
        <Text style={labelStyleComputed}>
          {label}
          {required && <Text style={{ color: colors.error[500] }}> *</Text>}
        </Text>
      )}
      
      <View style={inputStyleComputed}>
        {leftIcon && (
          <View style={{ marginRight: spacing.sm }}>
            {leftIcon}
          </View>
        )}
        
        <TextInput
          ref={ref}
          style={{
            flex: 1,
            fontSize: typography.fontSize.base,
            color: disabled ? colors.text.tertiary : colors.text.primary,
            paddingVertical: 0, // Remove default padding to center text properly
          }}
          editable={!disabled}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholderTextColor={colors.text.tertiary}
          accessibilityLabel={label}
          accessibilityHint={helperText}
          accessibilityState={{
            disabled,
            invalid: !!error,
          }}
          {...props}
        />
        
        {rightIcon && (
          <View style={{ marginLeft: spacing.sm }}>
            {rightIcon}
          </View>
        )}
      </View>
      
      {error && (
        <Text style={errorStyleComputed}>
          {error}
        </Text>
      )}
      
      {!error && helperText && (
        <Text style={helperStyleComputed}>
          {helperText}
        </Text>
      )}
    </View>
  );
}));

Input.displayName = 'Input';

export default Input;
