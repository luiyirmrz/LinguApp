import React, { memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
  TextStyle,
} from 'react-native';
// Lazy loaded: react-native-safe-area-context
import { theme } from '@/constants/theme';
import { Icon } from './Icon';
import { SafeAreaView } from 'react-native-safe-area-context';

export interface HeaderProps {
  title?: string;
  subtitle?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onLeftPress?: () => void;
  onRightPress?: () => void;
  variant?: 'default' | 'transparent' | 'gradient';
  size?: 'small' | 'medium' | 'large';
  containerStyle?: ViewStyle;
  titleStyle?: TextStyle;
  subtitleStyle?: TextStyle;
  showBackButton?: boolean;
  showCloseButton?: boolean;
  centerTitle?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  leftIcon,
  rightIcon,
  onLeftPress,
  onRightPress,
  variant = 'default',
  size = 'medium',
  containerStyle,
  titleStyle,
  subtitleStyle,
  showBackButton = false,
  showCloseButton = false,
  centerTitle = true,
}) => {
  const getVariantStyle = (): ViewStyle => {
    switch (variant) {
      case 'transparent':
        return {
          backgroundColor: 'transparent',
        };
      case 'gradient':
        return {
          backgroundColor: theme.colors.primary,
        };
      default:
        return {
          backgroundColor: theme.colors.white,
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.gray[100],
        };
    }
  };

  const getSizeStyle = (): ViewStyle => {
    switch (size) {
      case 'small':
        return {
          paddingVertical: theme.spacing.sm,
        };
      case 'large':
        return {
          paddingVertical: theme.spacing.lg,
        };
      default: // medium
        return {
          paddingVertical: theme.spacing.md,
        };
    }
  };

  const getTitleStyle = (): TextStyle => {
    const baseStyle: TextStyle = {
      fontSize: size === 'small' ? theme.fontSize.md : theme.fontSize.lg,
      fontWeight: '600' as const,
      color: variant === 'gradient' ? theme.colors.white : theme.colors.text,
    };

    if (centerTitle) {
      baseStyle.textAlign = 'center';
    }

    return baseStyle;
  };

  const getSubtitleStyle = (): TextStyle => ({
    fontSize: theme.fontSize.sm,
    color: variant === 'gradient' ? theme.colors.white : theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  });

  const renderLeftIcon = () => {
    if (leftIcon) {
      return leftIcon;
    }

    if (showBackButton) {
      return (
        <Icon
          name="back"
          size={24}
          color={variant === 'gradient' ? theme.colors.white : theme.colors.text}
        />
      );
    }

    return null;
  };

  const renderRightIcon = () => {
    if (rightIcon) {
      return rightIcon;
    }

    if (showCloseButton) {
      return (
        <Icon
          name="close"
          size={24}
          color={variant === 'gradient' ? theme.colors.white : theme.colors.text}
        />
      );
    }

    return null;
  };

  return (
    <SafeAreaView style={[styles.container, getVariantStyle(), containerStyle]}>
      <View style={[styles.content, getSizeStyle()]}>
        <View style={styles.leftContainer}>
          {renderLeftIcon() && (
            <TouchableOpacity
              style={styles.iconButton}
              onPress={onLeftPress}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              {renderLeftIcon()}
            </TouchableOpacity>
          )}
        </View>

        <View style={[styles.titleContainer, centerTitle && styles.centerTitle]}>
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

        <View style={styles.rightContainer}>
          {renderRightIcon() && (
            <TouchableOpacity
              style={styles.iconButton}
              onPress={onRightPress}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              {renderRightIcon()}
            </TouchableOpacity>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  leftContainer: {
    width: 60,
    alignItems: 'flex-start',
  },
  rightContainer: {
    width: 60,
    alignItems: 'flex-end',
  },
  titleContainer: {
    flex: 1,
    paddingHorizontal: theme.spacing.md,
  },
  centerTitle: {
    alignItems: 'center',
  },
  iconButton: {
    padding: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
});


Header.displayName = 'Header';

export default memo(Header);
