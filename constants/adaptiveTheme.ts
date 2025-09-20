/**
 * Adaptive Theme System - Language-Specific Design
 * Provides culturally appropriate color palettes and visual elements
 * for different languages to enhance user experience and cultural connection
 */

import { Language } from '@/types';

// Language-specific color palettes
export const languageColorPalettes = {
  // Spanish - Warm, vibrant colors reflecting Spanish culture
  es: {
    primary: '#FF6B6B',      // Warm coral red
    primaryDark: '#E55A5A',  // Darker coral
    primaryLight: '#FFE8E8', // Light coral
    secondary: '#FF8E53',    // Warm orange
    secondaryDark: '#E67E47', // Darker orange
    secondaryLight: '#FFF0E8', // Light orange
    accent: '#FFD93D',       // Golden yellow
    accentDark: '#E6C235',   // Darker gold
    accentLight: '#FFF9E6',  // Light gold
    background: '#FFF8F5',   // Warm white
    surface: '#FFF0E8',      // Light warm surface
    text: '#2D1B1B',         // Warm dark text
    textSecondary: '#8B4513',       // Brown secondary text
    textTertiary: '#A0522D',        // Sienna tertiary text
    success: '#4CAF50',      // Green for success
    successLight: '#E8F5E8', // Light green
    warning: '#FF9800',      // Orange for warnings
    error: '#F44336',        // Red for errors
    errorLight: '#FFEBEE',   // Light red
    border: '#E0E0E0',       // Light border
    purple: '#9C27B0',       // Purple color
    cultural: {
      flag: ['#C60B1E', '#FFC400'], // Spanish flag colors
      architecture: '#D2691E',      // Terracotta
      nature: '#228B22',            // Forest green
      art: '#DC143C',               // Crimson
    },
  },

  // French - Elegant blues and sophisticated colors
  fr: {
    primary: '#4A90E2',      // Elegant blue
    primaryDark: '#357ABD',  // Darker blue
    primaryLight: '#E8F4FD', // Light blue
    secondary: '#50E3C2',    // Mint green
    secondaryDark: '#45C7A8', // Darker mint
    secondaryLight: '#E8F9F5', // Light mint
    accent: '#9B59B6',       // Purple accent
    accentDark: '#8E44AD',   // Darker purple
    accentLight: '#F4E6F7',  // Light purple
    background: '#F8FAFF',   // Cool white
    surface: '#F0F4FF',      // Light cool surface
    text: '#1A1A2E',         // Deep blue text
    textSecondary: '#16213E',       // Blue secondary text
    textTertiary: '#0F3460',        // Darker blue tertiary text
    success: '#27AE60',      // Emerald green
    successLight: '#E8F8F0', // Light emerald
    warning: '#F39C12',      // Orange for warnings
    error: '#E74C3C',        // Red for errors
    errorLight: '#FDF2F2',   // Light red
    border: '#E1E8ED',       // Light border
    purple: '#8E44AD',       // Purple color
    cultural: {
      flag: ['#002395', '#FFFFFF', '#ED2939'], // French flag colors
      architecture: '#708090',                 // Slate gray
      nature: '#2E8B57',                       // Sea green
      art: '#8A2BE2',                          // Blue violet
    },
  },

  // Croatian - Adriatic blues and Mediterranean colors
  hr: {
    primary: '#1E90FF',      // Dodger blue
    primaryDark: '#1C86EE',  // Darker blue
    primaryLight: '#E6F3FF', // Light blue
    secondary: '#FF6347',    // Tomato red
    secondaryDark: '#E55A3C', // Darker red
    secondaryLight: '#FFE8E6', // Light red
    accent: '#32CD32',       // Lime green
    accentDark: '#2DB82D',   // Darker green
    accentLight: '#E6FFE6',  // Light green
    background: '#F0F8FF',   // Alice blue
    surface: '#E6F3FF',      // Light blue surface
    text: '#191970',         // Midnight blue
    textSecondary: '#4682B4',       // Steel blue
    textTertiary: '#5F9EA0',        // Cadet blue tertiary text
    success: '#00CED1',      // Dark turquoise
    warning: '#FFD700',      // Gold
    error: '#DC143C',        // Crimson
    cultural: {
      flag: ['#FF0000', '#FFFFFF', '#0000FF'], // Croatian flag colors
      architecture: '#CD853F',                 // Peru (stone)
      nature: '#228B22',                       // Forest green
      art: '#4169E1',                          // Royal blue
    },
  },

  // German - Strong, reliable colors
  de: {
    primary: '#FF6B35',      // Vibrant orange
    primaryDark: '#E55A2B',  // Darker orange
    primaryLight: '#FFF0E8', // Light orange
    secondary: '#2C3E50',    // Dark blue-gray
    secondaryDark: '#1A252F', // Darker blue-gray
    secondaryLight: '#E8ECF0', // Light blue-gray
    accent: '#F39C12',       // Orange accent
    accentDark: '#E67E22',   // Darker orange
    accentLight: '#FEF5E7',  // Light orange
    background: '#F8F9FA',   // Light gray
    surface: '#E9ECEF',      // Light surface
    text: '#212529',         // Dark text
    textSecondary: '#6C757D',       // Gray secondary text
    textTertiary: '#ADB5BD',        // Light gray tertiary text
    success: '#28A745',      // Green
    successLight: '#D4EDDA', // Light green
    warning: '#FFC107',      // Yellow
    error: '#DC3545',        // Red
    errorLight: '#F8D7DA',   // Light red
    border: '#DEE2E6',       // Light border
    purple: '#6F42C1',       // Purple color
    cultural: {
      flag: ['#000000', '#DD0000', '#FFCE00'], // German flag colors
      architecture: '#696969',                 // Dim gray
      nature: '#228B22',                       // Forest green
      art: '#8B0000',                          // Dark red
    },
  },

  // Italian - Rich, artistic colors
  it: {
    primary: '#E74C3C',      // Italian red
    primaryDark: '#C0392B',  // Darker red
    primaryLight: '#FADBD8', // Light red
    secondary: '#F39C12',    // Orange
    secondaryDark: '#E67E22', // Darker orange
    secondaryLight: '#FEF5E7', // Light orange
    accent: '#8E44AD',       // Purple
    accentDark: '#7D3C98',   // Darker purple
    accentLight: '#F4E6F7',  // Light purple
    background: '#FFF5F5',   // Warm white
    surface: '#FFE8E8',      // Light warm surface
    text: '#2C3E50',         // Dark text
    textSecondary: '#7F8C8D',       // Gray secondary text
    textTertiary: '#BDC3C7',        // Light gray tertiary text
    success: '#27AE60',      // Green
    successLight: '#D5F4E6', // Light green
    warning: '#F1C40F',      // Yellow
    error: '#E74C3C',        // Red
    errorLight: '#FADBD8',   // Light red
    border: '#D5DBDB',       // Light border
    purple: '#8E44AD',       // Purple color
    cultural: {
      flag: ['#009246', '#FFFFFF', '#CE2B37'], // Italian flag colors
      architecture: '#CD853F',                 // Peru (stone)
      nature: '#228B22',                       // Forest green
      art: '#DC143C',                          // Crimson
    },
  },

  // Portuguese - Ocean blues and warm earth tones
  pt: {
    primary: '#3498DB',      // Ocean blue
    primaryDark: '#2980B9',  // Darker blue
    primaryLight: '#EBF3FD', // Light blue
    secondary: '#E67E22',    // Orange
    secondaryDark: '#D35400', // Darker orange
    secondaryLight: '#FDF2E9', // Light orange
    accent: '#9B59B6',       // Purple
    accentDark: '#8E44AD',   // Darker purple
    accentLight: '#F4E6F7',  // Light purple
    background: '#F8F9FA',   // Light background
    surface: '#E9ECEF',      // Light surface
    text: '#2C3E50',         // Dark text
    textSecondary: '#7F8C8D',       // Gray secondary text
    textTertiary: '#BDC3C7',        // Light gray tertiary text
    success: '#27AE60',      // Green
    successLight: '#D5F4E6', // Light green
    warning: '#F39C12',      // Orange
    error: '#E74C3C',        // Red
    errorLight: '#FADBD8',   // Light red
    border: '#D5DBDB',       // Light border
    purple: '#8E44AD',       // Purple color
    cultural: {
      flag: ['#006600', '#FF0000'], // Portuguese flag colors
      architecture: '#CD853F',      // Peru (stone)
      nature: '#228B22',            // Forest green
      art: '#4169E1',               // Royal blue
    },
  },

  // English - Classic, professional colors
  en: {
    primary: '#007AFF',      // iOS blue
    primaryDark: '#0056CC',  // Darker blue
    primaryLight: '#E6F2FF', // Light blue
    secondary: '#5856D6',    // Purple
    secondaryDark: '#4A4AC7', // Darker purple
    secondaryLight: '#F0EFFF', // Light purple
    accent: '#FF9500',       // Orange
    accentDark: '#E6850E',   // Darker orange
    accentLight: '#FFF4E6',  // Light orange
    background: '#FFFFFF',   // Pure white
    surface: '#F2F2F7',      // Light gray
    text: '#000000',         // Black text
    textSecondary: '#8E8E93',       // Gray secondary text
    textTertiary: '#C7C7CC',        // Light gray tertiary text
    success: '#34C759',      // Green
    successLight: '#D5F4E6', // Light green
    warning: '#FF9500',      // Orange
    error: '#FF3B30',        // Red
    errorLight: '#FFEBEE',   // Light red
    border: '#E1E1E1',       // Light border
    purple: '#AF52DE',       // Purple color
    cultural: {
      flag: ['#012169', '#FFFFFF', '#C8102E'], // Union Jack colors
      architecture: '#696969',                 // Dim gray
      nature: '#228B22',                       // Forest green
      art: '#4169E1',                          // Royal blue
    },
  },

  // Default fallback theme
  default: {
    primary: '#58CC02',      // Original green
    primaryDark: '#4CAF00',  // Darker green
    primaryLight: '#E8F5E8', // Light green
    secondary: '#1CB0F6',    // Blue
    secondaryDark: '#0A9BD4', // Darker blue
    secondaryLight: '#E6F7FF', // Light blue
    accent: '#FFC800',       // Yellow
    accentDark: '#E6B400',   // Darker yellow
    accentLight: '#FFF9E6',  // Light yellow
    background: '#FFFFFF',   // White
    surface: '#F7F7F7',      // Light gray
    text: '#2B2B2B',         // Dark text
    textSecondary: '#777777',       // Gray secondary text
    textTertiary: '#999999',        // Light gray tertiary text
    success: '#58CC02',      // Green
    successLight: '#E8F5E8', // Light green
    warning: '#FFC800',      // Yellow
    error: '#FF4B4B',        // Red
    errorLight: '#FFEBEE',   // Light red
    border: '#E0E0E0',       // Light border
    purple: '#9C27B0',       // Purple color
    cultural: {
      flag: ['#58CC02', '#1CB0F6'], // Default colors
      architecture: '#8B4513',      // Saddle brown
      nature: '#228B22',            // Forest green
      art: '#FF6B6B',               // Light coral
    },
  },
};

// Cultural visual elements
export const culturalElements = {
  es: {
    patterns: ['flamenco', 'tiles', 'geometric'],
    icons: ['🌶️', '🎭', '🏛️', '🌅'],
    fonts: {
      primary: 'System',
      decorative: 'Georgia',
    },
    borders: 'rounded',
    shadows: 'warm',
  },
  fr: {
    patterns: ['fleur-de-lis', 'elegant', 'minimalist'],
    icons: ['🗼', '🥐', '🎨', '🌹'],
    fonts: {
      primary: 'System',
      decorative: 'Times New Roman',
    },
    borders: 'elegant',
    shadows: 'soft',
  },
  hr: {
    patterns: ['adriatic', 'waves', 'coastal'],
    icons: ['🏖️', '🏰', '🌊', '🍯'],
    fonts: {
      primary: 'System',
      decorative: 'Arial',
    },
    borders: 'rounded',
    shadows: 'natural',
  },
  de: {
    patterns: ['precision', 'geometric', 'industrial'],
    icons: ['🏰', '🍺', '⚙️', '🌲'],
    fonts: {
      primary: 'System',
      decorative: 'Helvetica',
    },
    borders: 'sharp',
    shadows: 'strong',
  },
  it: {
    patterns: ['renaissance', 'artistic', 'ornate'],
    icons: ['🍝', '🏛️', '🎭', '🍷'],
    fonts: {
      primary: 'System',
      decorative: 'Times New Roman',
    },
    borders: 'ornate',
    shadows: 'artistic',
  },
  pt: {
    patterns: ['azulejo', 'oceanic', 'maritime'],
    icons: ['🌊', '🏰', '🐟', '☀️'],
    fonts: {
      primary: 'System',
      decorative: 'Arial',
    },
    borders: 'flowing',
    shadows: 'oceanic',
  },
  en: {
    patterns: ['classic', 'clean', 'professional'],
    icons: ['☕', '🏰', '🌧️', '📚'],
    fonts: {
      primary: 'System',
      decorative: 'Times New Roman',
    },
    borders: 'clean',
    shadows: 'subtle',
  },
  default: {
    patterns: ['modern', 'clean', 'minimalist'],
    icons: ['🌍', '📚', '🎯', '⭐'],
    fonts: {
      primary: 'System',
      decorative: 'System',
    },
    borders: 'rounded',
    shadows: 'standard',
  },
};

// Color palette interface
export interface ColorPalette {
  primary: string;
  primaryDark: string;
  primaryLight: string;
  secondary: string;
  secondaryDark: string;
  secondaryLight: string;
  accent: string;
  accentDark: string;
  accentLight: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  textTertiary: string;
  success: string;
  successLight?: string;
  warning: string;
  error: string;
  errorLight?: string;
  border?: string;
  purple?: string;
  info?: string;
  cultural: {
    flag: string[];
    architecture: string;
    nature: string;
    art: string;
  };
}

// Theme configuration interface
export interface AdaptiveThemeConfig {
  language: string;
  colors: ColorPalette;
  cultural: typeof culturalElements.es;
  isDarkMode?: boolean;
}

// Get adaptive theme for a specific language
export const getAdaptiveTheme = (languageCode: string, isDarkMode: boolean = false): AdaptiveThemeConfig => {
  const normalizedLang = (languageCode || '').toLowerCase();
  const colors = languageColorPalettes[normalizedLang as keyof typeof languageColorPalettes] || languageColorPalettes.default;
  const cultural = culturalElements[normalizedLang as keyof typeof culturalElements] || culturalElements.default;

  // Apply dark mode adjustments if needed
  if (isDarkMode) {
    return {
      language: normalizedLang,
      colors: {
        ...colors,
        background: '#1A1A1A',
        surface: '#2D2D2D',
        text: '#FFFFFF',
        textSecondary: '#CCCCCC',
        textTertiary: '#999999',
        border: '#404040',
      },
      cultural,
      isDarkMode: true,
    };
  }

  return {
    language: normalizedLang,
    colors,
    cultural,
    isDarkMode: false,
  };
};

// Get cultural color for specific context
export const getCulturalColor = (languageCode: string, context: 'flag' | 'architecture' | 'nature' | 'art'): string => {
  const theme = getAdaptiveTheme(languageCode);
  const color = theme.colors.cultural[context] || theme.colors.primary;
  
  // If it's an array, return the first color
  if (Array.isArray(color)) {
    return color[0];
  }
  
  return color;
};

// Get cultural pattern for background
export const getCulturalPattern = (languageCode: string): string => {
  const theme = getAdaptiveTheme(languageCode);
  return theme.cultural.patterns[0] || 'modern';
};

// Get cultural icons for the language
export const getCulturalIcons = (languageCode: string): string[] => {
  const theme = getAdaptiveTheme(languageCode);
  return theme.cultural.icons || ['🌍', '📚'];
};

// Export default theme colors for backward compatibility
export const themeColors = {
  es: ['#FF6B6B', '#FF8E53'],
  fr: ['#4A90E2', '#50E3C2'],
  hr: ['#1E90FF', '#FF6347'],
  de: ['#FF6B35', '#2C3E50'],
  it: ['#E74C3C', '#F39C12'],
  pt: ['#3498DB', '#E67E22'],
  en: ['#007AFF', '#5856D6'],
  default: ['#58CC02', '#1CB0F6'],
};

export default {
  languageColorPalettes,
  culturalElements,
  getAdaptiveTheme,
  getCulturalColor,
  getCulturalPattern,
  getCulturalIcons,
  themeColors,
};
