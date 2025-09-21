/**
 * Design System Constants for LinguApp
 * Provides consistent spacing, typography, colors, and component styles
 */

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
} as const;

export const borderRadius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 24,
  full: 9999,
} as const;

export const shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
} as const;

export const typography = {
  fontFamily: {
    regular: 'Inter-Regular',
    medium: 'Inter-Medium',
    semiBold: 'Inter-SemiBold',
    bold: 'Inter-Bold',
  },
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
    '5xl': 48,
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
  fontWeight: {
    normal: '400',
    medium: '500',
    semiBold: '600',
    bold: '700',
  },
} as const;

export const colors = {
  // Primary colors
  primary: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    200: '#bae6fd',
    300: '#7dd3fc',
    400: '#38bdf8',
    500: '#0ea5e9',
    600: '#0284c7',
    700: '#0369a1',
    800: '#075985',
    900: '#0c4a6e',
  },
  secondary: {
    50: '#fdf4ff',
    100: '#fae8ff',
    200: '#f5d0fe',
    300: '#f0abfc',
    400: '#e879f9',
    500: '#d946ef',
    600: '#c026d3',
    700: '#a21caf',
    800: '#86198f',
    900: '#701a75',
  },
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
  },
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
  },
  error: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
  },
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },
  // Semantic colors
  background: '#ffffff',
  surface: '#f9fafb',
  text: {
    primary: '#111827',
    secondary: '#6b7280',
    tertiary: '#9ca3af',
    inverse: '#ffffff',
  },
  border: {
    light: '#e5e7eb',
    medium: '#d1d5db',
    dark: '#9ca3af',
  },
} as const;

export const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

export const zIndex = {
  hide: -1,
  auto: 'auto',
  base: 0,
  docked: 10,
  dropdown: 1000,
  sticky: 1100,
  banner: 1200,
  overlay: 1300,
  modal: 1400,
  popover: 1500,
  skipLink: 1600,
  toast: 1700,
  tooltip: 1800,
} as const;

export const animation = {
  duration: {
    fast: 150,
    normal: 300,
    slow: 500,
  },
  easing: {
    linear: 'linear',
    ease: 'ease',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
  },
} as const;

// Component-specific styles
export const componentStyles = {
  button: {
    base: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: borderRadius.md,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row' as const,
    },
    sizes: {
      sm: {
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        minHeight: 32,
      },
      md: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        minHeight: 40,
      },
      lg: {
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        minHeight: 48,
      },
    },
    variants: {
      primary: {
        backgroundColor: colors.primary[600],
        shadowColor: colors.primary[600],
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 2,
      },
      secondary: {
        backgroundColor: colors.gray[100],
        borderWidth: 1,
        borderColor: colors.border.medium,
      },
      outline: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: colors.primary[600],
      },
      ghost: {
        backgroundColor: 'transparent',
      },
    },
  },
  input: {
    base: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: borderRadius.md,
      borderWidth: 1,
      borderColor: colors.border.medium,
      backgroundColor: colors.background,
      fontSize: typography.fontSize.base,
      color: colors.text.primary,
    },
    focus: {
      borderColor: colors.primary[500],
      shadowColor: colors.primary[500],
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 1,
    },
    error: {
      borderColor: colors.error[500],
    },
    disabled: {
      backgroundColor: colors.gray[100],
      borderColor: colors.border.light,
      color: colors.text.tertiary,
    },
  },
  card: {
    base: {
      backgroundColor: colors.background,
      borderRadius: borderRadius.lg,
      padding: spacing.lg,
      ...shadows.md,
    },
    elevated: {
      ...shadows.lg,
    },
    flat: {
      ...shadows.none,
      borderWidth: 1,
      borderColor: colors.border.light,
    },
  },
  badge: {
    base: {
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: borderRadius.full,
      alignItems: 'center',
      justifyContent: 'center',
    },
    sizes: {
      sm: {
        paddingHorizontal: spacing.xs,
        paddingVertical: 2,
        minHeight: 20,
      },
      md: {
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        minHeight: 24,
      },
      lg: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        minHeight: 32,
      },
    },
    variants: {
      primary: {
        backgroundColor: colors.primary[100],
        borderWidth: 1,
        borderColor: colors.primary[200],
      },
      success: {
        backgroundColor: colors.success[100],
        borderWidth: 1,
        borderColor: colors.success[200],
      },
      warning: {
        backgroundColor: colors.warning[100],
        borderWidth: 1,
        borderColor: colors.warning[200],
      },
      error: {
        backgroundColor: colors.error[100],
        borderWidth: 1,
        borderColor: colors.error[200],
      },
      neutral: {
        backgroundColor: colors.gray[100],
        borderWidth: 1,
        borderColor: colors.gray[200],
      },
    },
  },
} as const;

// Responsive utilities
export const responsive = {
  isMobile: (width: number) => width < breakpoints.md,
  isTablet: (width: number) => width >= breakpoints.md && width < breakpoints.lg,
  isDesktop: (width: number) => width >= breakpoints.lg,
  
  getSpacing: (baseSpacing: number, width: number) => {
    if (width < breakpoints.sm) return baseSpacing * 0.75;
    if (width < breakpoints.md) return baseSpacing;
    if (width < breakpoints.lg) return baseSpacing * 1.25;
    return baseSpacing * 1.5;
  },
  
  getFontSize: (baseSize: number, width: number) => {
    if (width < breakpoints.sm) return baseSize * 0.9;
    if (width < breakpoints.md) return baseSize;
    if (width < breakpoints.lg) return baseSize * 1.1;
    return baseSize * 1.2;
  },
} as const;

export default {
  spacing,
  borderRadius,
  shadows,
  typography,
  colors,
  breakpoints,
  zIndex,
  animation,
  componentStyles,
  responsive,
};
