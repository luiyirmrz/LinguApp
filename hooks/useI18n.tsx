/**
 * Enhanced i18n Hook for React Components
 * Provides access to translations, pluralization, and RTL support
 */

import { useCallback, useMemo } from 'react';
import { i18n, TranslationKeys, PluralizedString } from '@/constants/i18n';
import { useOptimizedLanguage } from '@/components/PerformanceOptimized';

export interface UseI18nReturn {
  // Basic translation
  t: (key: keyof TranslationKeys) => string;
  
  // Pluralized translation
  tPlural: (key: keyof TranslationKeys, count: number) => string;
  
  // Current language info
  currentLanguage: string;
  isRTL: boolean;
  textDirection: 'ltr' | 'rtl';
  
  // Language management
  setLanguage: (languageCode: string) => void;
  hasTranslations: (languageCode: string) => boolean;
  getAvailableLanguages: () => string[];
  
  // Accessibility
  accessibility: (key: keyof TranslationKeys['accessibility']) => string;
  
  // Utility functions
  formatNumber: (number: number) => string;
  formatDate: (date: Date) => string;
  formatTime: (date: Date) => string;
}

export const useI18n = (): UseI18nReturn => {
  const { currentLanguage: mainLanguage } = useOptimizedLanguage();
  
  // Update i18n service when language changes
  const currentLanguage = useMemo(() => {
    const languageCode = mainLanguage?.code || 'en';
    i18n.setLanguage(languageCode);
    return languageCode;
  }, [mainLanguage?.code]);

  // Basic translation
  const t = useCallback((key: keyof TranslationKeys): string => {
    return i18n.t(key);
  }, []);

  // Pluralized translation
  const tPlural = useCallback((key: keyof TranslationKeys, count: number): string => {
    return i18n.tPlural(key, count);
  }, []);

  // RTL support
  const isRTL = useMemo(() => i18n.isRTL(), [currentLanguage]);
  const textDirection = useMemo(() => i18n.getTextDirection(), [currentLanguage]);

  // Language management
  const setLanguage = useCallback((languageCode: string) => {
    i18n.setLanguage(languageCode);
  }, []);

  const hasTranslations = useCallback((languageCode: string): boolean => {
    return i18n.hasTranslations(languageCode);
  }, []);

  const getAvailableLanguages = useCallback((): string[] => {
    return i18n.getAvailableLanguages();
  }, []);

  // Accessibility
  const accessibility = useCallback((key: keyof TranslationKeys['accessibility']): string => {
    return i18n.accessibility(key);
  }, []);

  // Number formatting based on locale
  const formatNumber = useCallback((number: number): string => {
    try {
      return new Intl.NumberFormat(currentLanguage).format(number);
    } catch {
      return number.toString();
    }
  }, [currentLanguage]);

  // Date formatting based on locale
  const formatDate = useCallback((date: Date): string => {
    try {
      return new Intl.DateTimeFormat(currentLanguage, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }).format(date);
    } catch {
      return date.toLocaleDateString();
    }
  }, [currentLanguage]);

  // Time formatting based on locale
  const formatTime = useCallback((date: Date): string => {
    try {
      return new Intl.DateTimeFormat(currentLanguage, {
        hour: '2-digit',
        minute: '2-digit',
      }).format(date);
    } catch {
      return date.toLocaleTimeString();
    }
  }, [currentLanguage]);

  return {
    t,
    tPlural,
    currentLanguage,
    isRTL,
    textDirection,
    setLanguage,
    hasTranslations,
    getAvailableLanguages,
    accessibility,
    formatNumber,
    formatDate,
    formatTime,
  };
};

// Hook for pluralized strings with automatic count detection
export const usePlural = (key: keyof TranslationKeys, count: number): string => {
  const { tPlural } = useI18n();
  return tPlural(key, count);
};

// Hook for RTL-aware styling
export const useRTL = () => {
  const { isRTL, textDirection } = useI18n();
  
  const rtlStyle = useMemo(() => ({
    writingDirection: textDirection as 'ltr' | 'rtl',
    textAlign: isRTL ? 'right' : 'left' as 'left' | 'right',
  }), [isRTL, textDirection]);

  return {
    isRTL,
    textDirection,
    rtlStyle,
  };
};
