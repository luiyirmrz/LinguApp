// Import adaptive theme system
import { getAdaptiveTheme } from './adaptiveTheme';

// Default theme colors (fallback)
const defaultColors = {
  primary: '#58CC02',
  primaryDark: '#4CAF00',
  primaryLight: '#E8F5E8',
  secondary: '#1CB0F6',
  secondaryDark: '#0A8BC4',
  secondaryLight: '#4FC3F7',
  warning: '#FFC800',
  danger: '#FF4B4B',
  error: '#FF4B4B',
  success: '#58CC02',
  successLight: '#E8F5E8',
  dangerLight: '#FFEBEE',
  background: '#FFFFFF',
  surface: '#F7F7F7',
  text: '#2B2B2B',
  textSecondary: '#777777',
  textTertiary: '#999999',
  border: '#E5E5E5',
  // Additional colors for UI components
  orange: '#FF9500',
  red: '#FF3B30',
  blue: '#007AFF',
  purple: '#AF52DE',
  gray: {
    50: '#F7F7F7',
    100: '#E5E5E5',
    200: '#AFAFAF',
    300: '#777777',
    400: '#4B4B4B',
    500: '#2B2B2B',
    600: '#1A1A1A',
    700: '#0F0F0F',
  },
  white: '#FFFFFF',
  black: '#000000',
  info: '#3B82F6',
  warningLight: '#FEF3C7',
};

// Get adaptive theme colors based on language
export const getThemeColors = (languageCode: string = 'en', isDarkMode: boolean = false) => {
  const adaptiveTheme = getAdaptiveTheme(languageCode, isDarkMode);
  return {
    ...defaultColors,
    ...adaptiveTheme.colors,
    // Keep additional colors from default
    orange: defaultColors.orange,
    red: defaultColors.red,
    blue: defaultColors.blue,
    purple: defaultColors.purple,
    gray: defaultColors.gray,
    white: defaultColors.white,
    black: defaultColors.black,
  };
};

export const theme = {
  colors: defaultColors,
  spacing: {
    xxs: 2,
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    full: 9999,
  },
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 24,
    xxl: 32,
  },
};
