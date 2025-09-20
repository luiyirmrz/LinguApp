import React, { useState, forwardRef, memo } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TextInputProps,
  ViewStyle,
  TextStyle,
  Platform,
  TouchableOpacity,
} from 'react-native';
// Lazy loaded: lucide-react-native
import { theme } from '@/constants/theme';
import { Eye, EyeOff, AlertCircle, CheckCircle } from '@/components/icons';

export interface InputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  error?: string;
  success?: boolean;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  labelStyle?: TextStyle;
  errorStyle?: TextStyle;
  helperStyle?: TextStyle;
  variant?: 'outlined' | 'filled' | 'underlined';
  size?: 'small' | 'medium' | 'large';
}

export const Input = forwardRef<TextInput, InputProps>(({
  label,
  error,
  success,
  helperText,
  leftIcon,
  rightIcon,
  containerStyle,
  inputStyle,
  labelStyle,
  errorStyle,
  helperStyle,
  variant = 'outlined',
  size = 'medium',
  secureTextEntry,
  ...props
}, ref) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = secureTextEntry && !showPassword;
  const hasError = !!error;
  const hasSuccess = success && !hasError;

  const getContainerStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderWidth: variant === 'outlined' ? 2 : 0,
      borderColor: hasError 
        ? theme.colors.error 
        : hasSuccess 
        ? theme.colors.success 
        : isFocused 
        ? theme.colors.primary 
        : theme.colors.gray[200],
      backgroundColor: variant === 'filled' ? theme.colors.gray[50] : theme.colors.white,
      borderRadius: theme.borderRadius.md,
    };

    if (variant === 'underlined') {
      baseStyle.borderRadius = 0;
      baseStyle.borderBottomWidth = 2;
      baseStyle.borderWidth = 0;
    }

    return baseStyle;
  };

  const getInputStyle = (): TextStyle => {
    const baseStyle: TextStyle = {
      color: theme.colors.text,
      fontSize: size === 'small' ? theme.fontSize.sm : size === 'large' ? theme.fontSize.lg : theme.fontSize.md,
      paddingVertical: size === 'small' ? 8 : size === 'large' ? 16 : 12,
      paddingHorizontal: theme.spacing.md,
    };

    if (leftIcon) {
      baseStyle.paddingLeft = theme.spacing.xl;
    }

    if (rightIcon || (secureTextEntry && !showPassword)) {
      baseStyle.paddingRight = theme.spacing.xl;
    }

    return baseStyle;
  };

  const getLabelStyle = (): TextStyle => ({
    fontSize: theme.fontSize.sm,
    fontWeight: '600' as const,
    color: hasError 
      ? theme.colors.error 
      : hasSuccess 
      ? theme.colors.success 
      : theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  });

  const handleFocus = (e: any) => {
    setIsFocused(true);
    props.onFocus?.(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    props.onBlur?.(e);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const renderRightIcon = () => {
    if (secureTextEntry) {
      return (
        <TouchableOpacity
          style={styles.iconContainer}
          onPress={togglePasswordVisibility}
        >
          {showPassword ? (
            <EyeOff size={20} color={theme.colors.textSecondary} />
          ) : (
            <Eye size={20} color={theme.colors.textSecondary} />
          )}
        </TouchableOpacity>
      );
    }

    if (rightIcon) {
      return <View style={styles.iconContainer}>{rightIcon}</View>;
    }

    if (hasError) {
      return (
        <View style={styles.iconContainer}>
          <AlertCircle size={20} color={theme.colors.error} />
        </View>
      );
    }

    if (hasSuccess) {
      return (
        <View style={styles.iconContainer}>
          <CheckCircle size={20} color={theme.colors.success} />
        </View>
      );
    }

    return null;
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={[getLabelStyle(), labelStyle]}>
          {label}
        </Text>
      )}
      
      <View style={[styles.inputContainer, getContainerStyle()]}>
        {leftIcon && (
          <View style={styles.leftIconContainer}>
            {leftIcon}
          </View>
        )}
        
        <TextInput
          ref={ref}
          style={[getInputStyle(), inputStyle]}
          secureTextEntry={isPassword}
          placeholderTextColor={theme.colors.textSecondary}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...props}
        />
        
        {renderRightIcon()}
      </View>

      {(error || helperText) && (
        <Text style={[
          styles.helperText,
          hasError && styles.errorText,
          helperStyle,
          errorStyle,
        ]}>
          {error || helperText}
        </Text>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.md,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  leftIconContainer: {
    position: 'absolute',
    left: theme.spacing.md,
    zIndex: 1,
  },
  iconContainer: {
    position: 'absolute',
    right: theme.spacing.md,
    zIndex: 1,
  },
  helperText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
    marginLeft: theme.spacing.xs,
  },
  errorText: {
    color: theme.colors.error,
  },
});

Input.displayName = 'Input';


export default memo(Input);
