// Responsive Layout Hook - Adaptive UI for different screen sizes and orientations
// Provides breakpoints, device types, and responsive utilities for optimal user experience
// Supports phones, tablets, and different orientations

import { useState, useEffect, useMemo } from 'react';
import { Dimensions, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ScreenDimensions {
  width: number;
  height: number;
  scale: number;
  fontScale: number;
}

interface DeviceInfo {
  isPhone: boolean;
  isTablet: boolean;
  isLandscape: boolean;
  isPortrait: boolean;
  isSmallPhone: boolean;
  isLargePhone: boolean;
  screenSize: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  platform: 'ios' | 'android' | 'web';
}

interface ResponsiveValues {
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  fontSize: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
  };
  borderRadius: {
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  containerPadding: number;
  cardPadding: number;
  headerHeight: number;
  tabBarHeight: number;
}

export const useResponsiveLayout = () => {
  const [dimensions, setDimensions] = useState<ScreenDimensions>(() => {
    const { width, height, scale, fontScale } = Dimensions.get('window');
    return { width, height, scale, fontScale };
  });

  const insets = useSafeAreaInsets();

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions({
        width: window.width,
        height: window.height,
        scale: window.scale,
        fontScale: window.fontScale,
      });
    });

    return () => subscription?.remove();
  }, []);

  const deviceInfo = useMemo<DeviceInfo>(() => {
    const { width, height } = dimensions;
    const minDimension = Math.min(width, height);
    const maxDimension = Math.max(width, height);
    
    // Device type detection
    const isTablet = minDimension >= 768;
    const isPhone = !isTablet;
    const isLandscape = width > height;
    const isPortrait = !isLandscape;
    
    // Phone size categories
    const isSmallPhone = isPhone && minDimension < 375;
    const isLargePhone = isPhone && minDimension >= 414;
    
    // Screen size categories
    let screenSize: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    if (minDimension < 375) screenSize = 'xs';
    else if (minDimension < 414) screenSize = 'sm';
    else if (minDimension < 768) screenSize = 'md';
    else if (minDimension < 1024) screenSize = 'lg';
    else screenSize = 'xl';

    return {
      isPhone,
      isTablet,
      isLandscape,
      isPortrait,
      isSmallPhone,
      isLargePhone,
      screenSize,
      platform: Platform.OS as 'ios' | 'android' | 'web',
    };
  }, [dimensions]);

  const responsiveValues = useMemo<ResponsiveValues>(() => {
    const { screenSize, isTablet } = deviceInfo;
    
    // Base values that scale with screen size
    const baseSpacing = screenSize === 'xs' ? 12 : 
                      screenSize === 'sm' ? 14 : 
                      screenSize === 'md' ? 16 : 
                      screenSize === 'lg' ? 18 : 20;

    const baseFontSize = screenSize === 'xs' ? 14 : 
                        screenSize === 'sm' ? 15 : 
                        screenSize === 'md' ? 16 : 
                        screenSize === 'lg' ? 17 : 18;

    return {
      spacing: {
        xs: baseSpacing * 0.25,
        sm: baseSpacing * 0.5,
        md: baseSpacing,
        lg: baseSpacing * 1.5,
        xl: baseSpacing * 2,
      },
      fontSize: {
        xs: baseFontSize - 2,
        sm: baseFontSize,
        md: baseFontSize + 2,
        lg: baseFontSize + 4,
        xl: baseFontSize + 8,
        xxl: baseFontSize + 12,
      },
      borderRadius: {
        sm: screenSize === 'xs' ? 6 : 8,
        md: screenSize === 'xs' ? 8 : 12,
        lg: screenSize === 'xs' ? 12 : 16,
        xl: screenSize === 'xs' ? 16 : 20,
      },
      containerPadding: isTablet ? 24 : baseSpacing,
      cardPadding: isTablet ? 20 : baseSpacing,
      headerHeight: Platform.OS === 'ios' ? (isTablet ? 64 : 56) : 56,
      tabBarHeight: Platform.OS === 'ios' ? (isTablet ? 70 : 60) : 60,
    };
  }, [deviceInfo]);

  // Utility functions
  const getResponsiveValue = <T,>(values: {
    xs?: T;
    sm?: T;
    md?: T;
    lg?: T;
    xl?: T;
    default: T;
  }): T => {
    const { screenSize } = deviceInfo;
    return values[screenSize] ?? values.default;
  };

  const getSpacingMultiplier = (multiplier: number): number => {
    return responsiveValues.spacing.md * multiplier;
  };

  const getFontSizeMultiplier = (multiplier: number): number => {
    return responsiveValues.fontSize.md * multiplier;
  };

  // Responsive grid calculations
  const getGridColumns = (minItemWidth: number, maxColumns = 4): number => {
    const availableWidth = dimensions.width - (responsiveValues.containerPadding * 2);
    const possibleColumns = Math.floor(availableWidth / minItemWidth);
    return Math.min(possibleColumns, maxColumns);
  };

  const getItemWidth = (columns: number, gap = responsiveValues.spacing.md): number => {
    const availableWidth = dimensions.width - (responsiveValues.containerPadding * 2);
    const totalGap = gap * (columns - 1);
    return (availableWidth - totalGap) / columns;
  };

  // Accessibility helpers
  const getAccessibleTouchSize = (): number => {
    return Math.max(44, responsiveValues.spacing.xl * 2);
  };

  const getAccessibleFontSize = (baseSize: number): number => {
    const { fontScale } = dimensions;
    // Cap font scaling to prevent UI breaking
    const cappedScale = Math.min(fontScale, 1.3);
    return baseSize * cappedScale;
  };

  return {
    dimensions,
    deviceInfo,
    responsiveValues,
    insets,
    // Utility functions
    getResponsiveValue,
    getSpacingMultiplier,
    getFontSizeMultiplier,
    getGridColumns,
    getItemWidth,
    getAccessibleTouchSize,
    getAccessibleFontSize,
    // Breakpoint checks
    isXs: deviceInfo.screenSize === 'xs',
    isSm: deviceInfo.screenSize === 'sm',
    isMd: deviceInfo.screenSize === 'md',
    isLg: deviceInfo.screenSize === 'lg',
    isXl: deviceInfo.screenSize === 'xl',
    // Device checks
    isPhone: deviceInfo.isPhone,
    isTablet: deviceInfo.isTablet,
    isSmallPhone: deviceInfo.isSmallPhone,
    isLargePhone: deviceInfo.isLargePhone,
    isLandscape: deviceInfo.isLandscape,
    isPortrait: deviceInfo.isPortrait,
    isIOS: deviceInfo.platform === 'ios',
    isAndroid: deviceInfo.platform === 'android',
  };
};

// Pre-defined responsive styles generator
export const createResponsiveStyles = (deviceInfo: DeviceInfo, values: ResponsiveValues) => {
  return {
    container: {
      padding: values.containerPadding,
      paddingTop: values.containerPadding + (deviceInfo.isPhone ? 0 : 10),
    },
    card: {
      padding: values.cardPadding,
      borderRadius: values.borderRadius.lg,
      marginBottom: values.spacing.md,
    },
    text: {
      fontSize: values.fontSize.md,
      lineHeight: values.fontSize.md * 1.4,
    },
    title: {
      fontSize: values.fontSize.xl,
      lineHeight: values.fontSize.xl * 1.2,
      fontWeight: '600' as const,
    },
    button: {
      paddingHorizontal: values.spacing.lg,
      paddingVertical: values.spacing.md,
      borderRadius: values.borderRadius.md,
      minHeight: deviceInfo.isTablet ? 48 : 44,
    },
    input: {
      paddingHorizontal: values.spacing.md,
      paddingVertical: values.spacing.sm,
      borderRadius: values.borderRadius.sm,
      fontSize: values.fontSize.md,
      minHeight: deviceInfo.isTablet ? 48 : 44,
    },
    grid: {
      gap: values.spacing.md,
      paddingHorizontal: values.containerPadding,
    },
  };
};
