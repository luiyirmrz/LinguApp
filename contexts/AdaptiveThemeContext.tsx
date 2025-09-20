/**
 * Adaptive Theme Context - Language-Specific Theme Management
 * Provides theme context with language-specific colors and cultural elements
 */

import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import { getAdaptiveTheme, AdaptiveThemeConfig, getCulturalColor, getCulturalPattern, getCulturalIcons } from '@/constants/adaptiveTheme';

interface AdaptiveThemeContextType {
  theme: AdaptiveThemeConfig;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  updateLanguage: (languageCode: string) => void;
  getCulturalColor: (context: 'flag' | 'architecture' | 'nature' | 'art') => string;
  getCulturalPattern: () => string;
  getCulturalIcons: () => string[];
  // Theme utilities
  getPrimaryColor: () => string;
  getSecondaryColor: () => string;
  getAccentColor: () => string;
  getBackgroundColor: () => string;
  getSurfaceColor: () => string;
  getTextColor: () => string;
  getTextSecondaryColor: () => string;
  getSuccessColor: () => string;
  getWarningColor: () => string;
  getErrorColor: () => string;
}

export const AdaptiveThemeContext = createContext<AdaptiveThemeContextType | undefined>(undefined);

interface AdaptiveThemeProviderProps {
  children: ReactNode;
}

export const AdaptiveThemeProvider: React.FC<AdaptiveThemeProviderProps> = ({ children }) => {
  const { currentLanguage } = useLanguage();
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // Get current language code
  const currentLanguageCode = currentLanguage?.code || 'en';
  
  // Get adaptive theme based on current language and dark mode
  // Memoize theme to prevent unnecessary recalculations
  const theme = useMemo(() => {
    return getAdaptiveTheme(currentLanguageCode, isDarkMode);
  }, [currentLanguageCode, isDarkMode]);

  // Toggle dark mode
  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
  };

  // Update language (this will trigger theme update)
  const updateLanguage = (languageCode: string) => {
    // The theme will automatically update when currentLanguage changes
    // This function is here for future use if needed
  };

  // Cultural color getter
  const getCulturalColorForContext = (context: 'flag' | 'architecture' | 'nature' | 'art'): string => {
    return getCulturalColor(currentLanguageCode, context);
  };

  // Cultural pattern getter
  const getCulturalPatternForLanguage = (): string => {
    return getCulturalPattern(currentLanguageCode);
  };

  // Cultural icons getter
  const getCulturalIconsForLanguage = (): string[] => {
    return getCulturalIcons(currentLanguageCode);
  };

  // Theme color getters
  const getPrimaryColor = (): string => theme.colors.primary;
  const getSecondaryColor = (): string => theme.colors.secondary;
  const getAccentColor = (): string => theme.colors.accent;
  const getBackgroundColor = (): string => theme.colors.background;
  const getSurfaceColor = (): string => theme.colors.surface;
  const getTextColor = (): string => theme.colors.text;
  const getTextSecondaryColor = (): string => theme.colors.textSecondary;
  const getSuccessColor = (): string => theme.colors.success;
  const getWarningColor = (): string => theme.colors.warning;
  const getErrorColor = (): string => theme.colors.error;

  // Load dark mode preference from storage
  useEffect(() => {
    // TODO: Load from AsyncStorage or user preferences
    // For now, we'll use system preference
    if (typeof window !== 'undefined' && window.matchMedia) {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDarkMode(prefersDark);
    } else {
      // Default to light mode on mobile/Android
      setIsDarkMode(false);
    }
  }, []);

  // Save dark mode preference
  useEffect(() => {
    // TODO: Save to AsyncStorage or user preferences
    // For now, we'll just store in memory
  }, [isDarkMode]);

  const contextValue: AdaptiveThemeContextType = {
    theme,
    isDarkMode,
    toggleDarkMode,
    updateLanguage,
    getCulturalColor: getCulturalColorForContext,
    getCulturalPattern: getCulturalPatternForLanguage,
    getCulturalIcons: getCulturalIconsForLanguage,
    getPrimaryColor,
    getSecondaryColor,
    getAccentColor,
    getBackgroundColor,
    getSurfaceColor,
    getTextColor,
    getTextSecondaryColor,
    getSuccessColor,
    getWarningColor,
    getErrorColor,
  };

  return (
    <AdaptiveThemeContext.Provider value={contextValue}>
      {children}
    </AdaptiveThemeContext.Provider>
  );
};

// Ultra-nuclear fallback theme - memoized to prevent re-creation
const ULTRA_NUCLEAR_FALLBACK_THEME: AdaptiveThemeContextType = {
  theme: {
    language: 'en',
    colors: {
      primary: '#3B82F6',
      primaryDark: '#2563EB',
      primaryLight: '#DBEAFE',
      secondary: '#10B981',
      secondaryDark: '#059669',
      secondaryLight: '#D1FAE5',
      accent: '#F59E0B',
      accentDark: '#D97706',
      accentLight: '#FEF3C7',
      background: '#FFFFFF',
      surface: '#F9FAFB',
      text: '#1F2937',
      textSecondary: '#6B7280',
      textTertiary: '#9CA3AF',
      border: '#E5E7EB',
      error: '#EF4444',
      success: '#10B981',
      warning: '#F59E0B',
      cultural: {
        flag: ['#3B82F6', '#10B981'],
        architecture: '#6B7280',
        nature: '#059669',
        art: '#EF4444',
      },
    },
    cultural: {
      patterns: ['🌟'],
      icons: ['🌟', '✨', '🎯'],
      fonts: {
        primary: 'System',
        decorative: 'Georgia',
      },
      borders: 'rounded',
      shadows: 'standard',
    },
  },
  isDarkMode: false,
  toggleDarkMode: () => {},
  updateLanguage: () => {},
  getCulturalColor: () => '#3B82F6',
  getCulturalPattern: () => '🌟',
  getCulturalIcons: () => ['🌟', '✨', '🎯'],
  getPrimaryColor: () => '#3B82F6',
  getSecondaryColor: () => '#10B981',
  getAccentColor: () => '#F59E0B',
  getBackgroundColor: () => '#FFFFFF',
  getSurfaceColor: () => '#F9FAFB',
  getTextColor: () => '#1F2937',
  getTextSecondaryColor: () => '#6B7280',
  getSuccessColor: () => '#10B981',
  getWarningColor: () => '#F59E0B',
  getErrorColor: () => '#EF4444',
};

// Hook to use adaptive theme - ultra-nuclear version with memoized fallback
export const useAdaptiveTheme = (): AdaptiveThemeContextType => {
  const context = useContext(AdaptiveThemeContext);
  if (context === undefined) {
    // Return memoized fallback to prevent re-creation and loops
    return ULTRA_NUCLEAR_FALLBACK_THEME;
  }
  return context;
};

// Hook for theme colors only
export const useThemeColors = () => {
  const { theme } = useAdaptiveTheme();
  return theme.colors;
};

// Hook for cultural elements only
export const useCulturalElements = () => {
  const { theme } = useAdaptiveTheme();
  return theme.cultural;
};

// Hook for theme utilities
export const useThemeUtils = () => {
  const {
    getPrimaryColor,
    getSecondaryColor,
    getAccentColor,
    getBackgroundColor,
    getSurfaceColor,
    getTextColor,
    getTextSecondaryColor,
    getSuccessColor,
    getWarningColor,
    getErrorColor,
    getCulturalColor,
    getCulturalPattern,
    getCulturalIcons,
  } = useAdaptiveTheme();

  return {
    getPrimaryColor,
    getSecondaryColor,
    getAccentColor,
    getBackgroundColor,
    getSurfaceColor,
    getTextColor,
    getTextSecondaryColor,
    getSuccessColor,
    getWarningColor,
    getErrorColor,
    getCulturalColor,
    getCulturalPattern,
    getCulturalIcons,
  };
};

export default AdaptiveThemeProvider;
