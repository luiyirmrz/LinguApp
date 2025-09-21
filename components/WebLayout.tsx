// Web-specific layout component for better browser presentation
// Handles responsive design, proper scrolling, and web-specific styling

import React, { useMemo, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  ViewStyle,
  ScrollViewProps,
  Platform,
  Dimensions,
} from 'react-native';
import { SafeAreaView, Edge } from 'react-native-safe-area-context';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';
import { theme } from '@/constants/theme';

interface WebLayoutProps {
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

export const WebLayout: React.FC<WebLayoutProps> = ({
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

  // Web-specific setup
  useEffect(() => {
    if (Platform.OS === 'web') {
      // Set viewport meta tag for proper mobile viewport
      const viewport = document.querySelector('meta[name="viewport"]');
      if (viewport) {
        viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
      }

      // Add web-specific body styles
      document.body.style.margin = '0';
      document.body.style.padding = '0';
      document.body.style.overflow = 'hidden';
      document.body.style.fontFamily = 'Inter, system-ui, sans-serif';
    }
  }, []);

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

  const containerStyle = useMemo<ViewStyle>(() => {
    const baseStyle: ViewStyle = {
      flex: 1,
      backgroundColor,
    };

    // Web-specific styles
    if (Platform.OS === 'web') {
      baseStyle.height = '100vh';
      baseStyle.width = '100vw';
      baseStyle.overflow = 'hidden';
    }

    return {
      ...baseStyle,
      ...style,
    };
  }, [backgroundColor, style]);

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

    // Web-specific content styles
    if (Platform.OS === 'web') {
      baseStyle.minHeight = '100vh';
      baseStyle.boxSizing = 'border-box';
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
          bounces={Platform.OS !== 'web'}
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

// Web-specific container component
export const WebContainer: React.FC<{
  children: React.ReactNode;
  maxWidth?: number;
  centered?: boolean;
  style?: ViewStyle;
}> = ({ children, maxWidth = 1200, centered = true, style }) => {
  const containerStyle = useMemo<ViewStyle>(() => {
    const baseStyle: ViewStyle = {
      width: '100%',
      maxWidth: maxWidth,
      marginHorizontal: 'auto',
    };

    if (Platform.OS === 'web') {
      baseStyle.paddingLeft = '1rem';
      baseStyle.paddingRight = '1rem';
      baseStyle.boxSizing = 'border-box';
    }

    if (centered) {
      baseStyle.alignSelf = 'center';
    }

    return {
      ...baseStyle,
      ...style,
    };
  }, [maxWidth, centered, style]);

  return (
    <View style={containerStyle}>
      {children}
    </View>
  );
};

// Web-specific grid component
export const WebGrid: React.FC<{
  children: React.ReactNode;
  columns?: number;
  gap?: number;
  style?: ViewStyle;
}> = ({ children, columns = 1, gap = 16, style }) => {
  const gridStyle = useMemo<ViewStyle>(() => {
    const baseStyle: ViewStyle = {
      display: 'flex',
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: gap,
    };

    if (Platform.OS === 'web') {
      baseStyle.display = 'grid';
      baseStyle.gridTemplateColumns = `repeat(${columns}, 1fr)`;
      baseStyle.gap = `${gap}px`;
    }

    return {
      ...baseStyle,
      ...style,
    };
  }, [columns, gap, style]);

  return (
    <View style={gridStyle}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
});
