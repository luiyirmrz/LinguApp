// Responsive Layout Component - Adaptive container with device-specific optimizations
// Automatically adjusts spacing, typography, and layout based on device characteristics
// Provides consistent responsive behavior across the entire application

import React, { useMemo } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  ViewStyle,
  ScrollViewProps,
  Platform,
} from 'react-native';
import { SafeAreaView, Edge } from 'react-native-safe-area-context';
import { useResponsiveLayout, createResponsiveStyles } from '@/hooks/useResponsiveLayout';
import { theme } from '@/constants/theme';

interface ResponsiveLayoutProps {
  children: React.ReactNode;
  scrollable?: boolean;
  safeArea?: boolean;
  safeAreaEdges?: Edge[];
  style?: ViewStyle;
  contentContainerStyle?: ViewStyle;
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'auto';
  backgroundColor?: string;
  scrollViewProps?: Partial<ScrollViewProps>;
  centerContent?: boolean;
  maxWidth?: number;
}

export const ResponsiveLayout: React.FC<ResponsiveLayoutProps> = ({
  children,
  scrollable = false,
  safeArea = true,
  safeAreaEdges = ['top', 'left', 'right'],
  style,
  contentContainerStyle,
  padding = 'auto',
  backgroundColor = theme.colors.background,
  scrollViewProps,
  centerContent = false,
  maxWidth,
}) => {
  const {
    deviceInfo,
    responsiveValues,
    dimensions,
    isTablet,
    isLandscape,
  } = useResponsiveLayout();

  const responsiveStyles = useMemo(() => 
    createResponsiveStyles(deviceInfo, responsiveValues), 
    [deviceInfo, responsiveValues],
  );

  const containerPadding = useMemo(() => {
    if (padding === 'none') return 0;
    if (padding === 'auto') return responsiveValues.containerPadding;
    
    const paddingMap = {
      sm: responsiveValues.spacing.sm,
      md: responsiveValues.spacing.md,
      lg: responsiveValues.spacing.lg,
      xl: responsiveValues.spacing.xl,
    };
    
    return paddingMap[padding] || responsiveValues.containerPadding;
  }, [padding, responsiveValues]);

  const containerStyle = useMemo<ViewStyle>(() => ({
    flex: 1,
    backgroundColor,
    ...style,
  }), [backgroundColor, style]);

  const contentStyle = useMemo<ViewStyle>(() => {
    const baseStyle: ViewStyle = {
      flexGrow: 1,
      padding: containerPadding,
    };

    // Center content for tablets in landscape or when explicitly requested
    if (centerContent || (isTablet && isLandscape)) {
      baseStyle.alignItems = 'center';
      baseStyle.justifyContent = centerContent ? 'center' : 'flex-start';
    }

    // Apply max width for large screens
    if (maxWidth && dimensions.width > maxWidth) {
      baseStyle.maxWidth = maxWidth;
      baseStyle.alignSelf = 'center';
      baseStyle.width = '100%';
    }

    return {
      ...baseStyle,
      ...contentContainerStyle,
    };
  }, [
    containerPadding,
    centerContent,
    isTablet,
    isLandscape,
    maxWidth,
    dimensions.width,
    contentContainerStyle,
  ]);

  const renderContent = () => {
    if (scrollable) {
      return (
        <ScrollView
          style={containerStyle}
          contentContainerStyle={contentStyle}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          {...scrollViewProps}
        >
          {children}
        </ScrollView>
      );
    }

    return (
      <View style={[containerStyle, contentStyle]}>
        {children}
      </View>
    );
  };

  if (safeArea) {
    return (
      <SafeAreaView 
        style={styles.safeArea} 
        edges={safeAreaEdges}
      >
        {renderContent()}
      </SafeAreaView>
    );
  }

  return renderContent();
};

// Specialized responsive components
export const ResponsiveCard: React.FC<{
  children: React.ReactNode;
  style?: ViewStyle;
  padding?: 'sm' | 'md' | 'lg';
}> = ({ children, style, padding = 'md' }) => {
  const { responsiveValues, deviceInfo } = useResponsiveLayout();
  const responsiveStyles = createResponsiveStyles(deviceInfo, responsiveValues);

  const paddingValue = {
    sm: responsiveValues.spacing.sm,
    md: responsiveValues.spacing.md,
    lg: responsiveValues.spacing.lg,
  }[padding];

  return (
    <View style={[
      responsiveStyles.card,
      { 
        padding: paddingValue,
        backgroundColor: theme.colors.white,
        ...Platform.select({
          ios: {
            shadowColor: theme.colors.black,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
          },
          android: {
            elevation: 2,
          },
        }),
      },
      style,
    ]}>
      {children}
    </View>
  );
};

export const ResponsiveGrid: React.FC<{
  children: React.ReactNode;
  minItemWidth: number;
  maxColumns?: number;
  gap?: number;
  style?: ViewStyle;
}> = ({ children, minItemWidth, maxColumns = 4, gap, style }) => {
  const { 
    getGridColumns, 
    getItemWidth, 
    responsiveValues, 
  } = useResponsiveLayout();

  const columns = getGridColumns(minItemWidth, maxColumns);
  const itemWidth = getItemWidth(columns, gap || responsiveValues.spacing.md);
  const gridGap = gap || responsiveValues.spacing.md;

  return (
    <View style={[
      styles.grid,
      { gap: gridGap },
      style,
    ]}>
      {React.Children.map(children, (child, index) => (
        <View 
          key={index} 
          style={{ 
            width: itemWidth,
            marginBottom: index < React.Children.count(children) - columns ? gridGap : 0,
          }}
        >
          {child}
        </View>
      ))}
    </View>
  );
};

export const ResponsiveText: React.FC<{
  children: React.ReactNode;
  variant?: 'body' | 'title' | 'subtitle' | 'caption';
  style?: any;
  numberOfLines?: number;
}> = ({ children, variant = 'body', style, ...props }) => {
  const { responsiveValues, getAccessibleFontSize } = useResponsiveLayout();

  const variantStyles = {
    body: {
      fontSize: getAccessibleFontSize(responsiveValues.fontSize.md),
      lineHeight: getAccessibleFontSize(responsiveValues.fontSize.md) * 1.4,
      color: theme.colors.text,
    },
    title: {
      fontSize: getAccessibleFontSize(responsiveValues.fontSize.xl),
      lineHeight: getAccessibleFontSize(responsiveValues.fontSize.xl) * 1.2,
      fontWeight: '600' as const,
      color: theme.colors.text,
    },
    subtitle: {
      fontSize: getAccessibleFontSize(responsiveValues.fontSize.lg),
      lineHeight: getAccessibleFontSize(responsiveValues.fontSize.lg) * 1.3,
      fontWeight: '500' as const,
      color: theme.colors.text,
    },
    caption: {
      fontSize: getAccessibleFontSize(responsiveValues.fontSize.sm),
      lineHeight: getAccessibleFontSize(responsiveValues.fontSize.sm) * 1.3,
      color: theme.colors.textSecondary,
    },
  };

  const Text = require('react-native').Text;
  
  return (
    <Text 
      style={[variantStyles[variant], style]} 
      {...props}
    >
      {children}
    </Text>
  );
};

export const ResponsiveButton: React.FC<{
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  style?: ViewStyle;
}> = ({ title, onPress, variant = 'primary', size = 'md', disabled, style }) => {
  const { 
    responsiveValues, 
    getAccessibleTouchSize, 
    getAccessibleFontSize, 
  } = useResponsiveLayout();

  const sizeStyles = {
    sm: {
      paddingHorizontal: responsiveValues.spacing.md,
      paddingVertical: responsiveValues.spacing.sm,
      minHeight: getAccessibleTouchSize() * 0.8,
      fontSize: getAccessibleFontSize(responsiveValues.fontSize.sm),
    },
    md: {
      paddingHorizontal: responsiveValues.spacing.lg,
      paddingVertical: responsiveValues.spacing.md,
      minHeight: getAccessibleTouchSize(),
      fontSize: getAccessibleFontSize(responsiveValues.fontSize.md),
    },
    lg: {
      paddingHorizontal: responsiveValues.spacing.xl,
      paddingVertical: responsiveValues.spacing.lg,
      minHeight: getAccessibleTouchSize() * 1.2,
      fontSize: getAccessibleFontSize(responsiveValues.fontSize.lg),
    },
  };

  const variantStyles = {
    primary: {
      backgroundColor: disabled ? theme.colors.gray[300] : theme.colors.primary,
      color: theme.colors.white,
    },
    secondary: {
      backgroundColor: disabled ? theme.colors.gray[100] : theme.colors.gray[200],
      color: disabled ? theme.colors.gray[400] : theme.colors.text,
    },
    outline: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: disabled ? theme.colors.gray[300] : theme.colors.primary,
      color: disabled ? theme.colors.gray[400] : theme.colors.primary,
    },
  };

  const TouchableOpacity = require('react-native').TouchableOpacity;
  const Text = require('react-native').Text;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={[
        {
          borderRadius: responsiveValues.borderRadius.md,
          alignItems: 'center',
          justifyContent: 'center',
          ...sizeStyles[size],
          backgroundColor: variantStyles[variant].backgroundColor,
          borderWidth: (variantStyles[variant] as any).borderWidth || 0,
          borderColor: (variantStyles[variant] as any).borderColor,
        },
        style,
      ]}
      activeOpacity={0.8}
    >
      <Text style={{
        fontSize: sizeStyles[size].fontSize,
        color: variantStyles[variant].color,
        fontWeight: '600',
      }}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
});
