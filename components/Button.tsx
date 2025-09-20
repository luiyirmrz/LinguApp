import React, { memo } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  View,
} from 'react-native';
import { theme } from '@/constants/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large' | 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  style,
  textStyle,
  icon,
}) => {
  const getBackgroundColor = () => {
    if (disabled) return theme.colors.gray[200];
    switch (variant) {
      case 'primary':
        return theme.colors.primary;
      case 'secondary':
        return theme.colors.secondary;
      case 'danger':
        return theme.colors.danger;
      case 'success':
        return theme.colors.success;
      case 'outline':
      case 'ghost':
        return 'transparent';
      default:
        return theme.colors.primary;
    }
  };

  const getTextColor = () => {
    if (disabled) return theme.colors.gray[400];
    if (variant === 'outline' || variant === 'ghost') return theme.colors.primary;
    return theme.colors.white;
  };

  const getBorderStyle = () => {
    if (variant === 'outline') {
      return {
        borderWidth: 2,
        borderColor: disabled ? theme.colors.gray[300] : theme.colors.primary,
      };
    }
    return {};
  };

  const getSize = () => {
    switch (size) {
      case 'small':
      case 'sm':
        return { paddingVertical: 8, paddingHorizontal: 16 };
      case 'large':
      case 'lg':
        return { paddingVertical: 16, paddingHorizontal: 32 };
      default:
        return { paddingVertical: 12, paddingHorizontal: 24 };
    }
  };

  const getFontSize = () => {
    switch (size) {
      case 'small':
      case 'sm':
        return theme.fontSize.sm;
      case 'large':
      case 'lg':
        return theme.fontSize.lg;
      default:
        return theme.fontSize.md;
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor: getBackgroundColor() },
        getBorderStyle(),
        getSize(),
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={theme.colors.white} />
      ) : (
        <>
          {icon && <View style={styles.iconContainer}>{icon}</View>}
          <Text
            style={[
              styles.text,
              { fontSize: getFontSize(), color: getTextColor() },
              textStyle,
            ]}
          >
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    flexDirection: 'row',
  },
  iconContainer: {
    marginRight: 8,
  },
  text: {
    color: theme.colors.white,
    fontWeight: '600' as const,
  },
});

Button.displayName = 'Button';

export default memo(Button);
