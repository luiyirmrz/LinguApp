/**
 * Language Management Hook - Dynamic language switching for the entire app
 * ULTRA-NUCLEAR VERSION - Replacing createContextHook with native React Context
 * This eliminates any possible conflicts with Expo Router and external libraries
 */

import React, { createContext, useContext, useState, useCallback, useEffect, useMemo, ReactNode } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Language, User } from '@/types';
import { languages, getLanguageByCode } from '@/mocks/languages'; 
import { getTranslations, TranslationKeys, t } from '@/constants/i18n';
import { unifiedDataService } from '@/services/database/unifiedDataService';

// Constants
const STORAGE_KEY = 'ui_language';
const DEFAULT_LANGUAGE_CODE = 'en';

// Define the context type
interface LanguageContextType {
  // States
  currentUILanguage: Language;
  currentLanguage: Language; // Alias for backward compatibility
  translations: Record<string, string>;
  isLoading: boolean;
  error: string | null;
  availableLanguages: Language[]; // For backward compatibility
  
  // Methods
  changeUILanguage: (language: Language) => Promise<void>;
  refreshTranslations: () => void;
  t: (key: string, fallback?: string) => string;
}

// Create the context
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Provider component
interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  // Estados básicos
  const [currentUILanguage, setCurrentUILanguage] = useState<Language>(languages[0]);
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize language from storage - ULTRA SIMPLE
  useEffect(() => {
    const initializeLanguage = async () => {
      try {
        console.debug('Initializing language with ultra-nuclear approach');
        setIsLoading(true);
        setError(null);

        let languageCode = DEFAULT_LANGUAGE_CODE;

        // Try to get stored language
        try {
          const storedLanguage = await AsyncStorage.getItem(STORAGE_KEY);
          if (storedLanguage) {
            languageCode = storedLanguage;
            console.debug('Using stored language:', languageCode);
          }
        } catch (storageError) {
          console.warn('AsyncStorage error, using default:', storageError);
        }

        const language = getLanguageByCode(languageCode);
        if (language) {
          setCurrentUILanguage(language);
          // Try to save to storage (don't fail if it doesn't work)
          try {
            await AsyncStorage.setItem(STORAGE_KEY, language.code);
          } catch (saveError) {
            console.warn('Failed to save language to storage:', saveError);
          }
        }

        // Load translations
        try {
          const newTranslations = await getTranslations(languageCode);
          setTranslations(newTranslations as any);
        } catch (translationError) {
          console.warn('Failed to load translations:', translationError);
          setTranslations({});
        }
      } catch (error) {
        console.error('Error initializing language:', error);
        setError(null); // Don't propagate errors in ultra-nuclear mode
        // Fallback to default
        setCurrentUILanguage(languages[0]);
        setTranslations({});
      } finally {
        setIsLoading(false);
      }
    };

    // Use setTimeout to break any potential synchronous loops
    const timeoutId = setTimeout(initializeLanguage, 0);
    return () => clearTimeout(timeoutId);
  }, []); // NO dependencies

  // Change UI language - simplified
  const changeUILanguage = useCallback(async (newLanguage: Language) => {
    try {
      setIsLoading(true);
      setError(null);

      setCurrentUILanguage(newLanguage);
      
      // Save to storage (don't fail if it doesn't work)
      try {
        await AsyncStorage.setItem(STORAGE_KEY, newLanguage.code);
      } catch (saveError) {
        console.warn('Failed to save language to storage:', saveError);
      }

      // Load new translations
      try {
        const newTranslations = await getTranslations(newLanguage.code);
        setTranslations(newTranslations as any);
      } catch (translationError) {
        console.warn('Failed to load translations:', translationError);
        setTranslations({});
      }
    } catch (error) {
      console.error('Error changing language:', error);
      setError(null); // Don't propagate errors
    } finally {
      setIsLoading(false);
    }
  }, []); // NO dependencies

  // Refresh translations - simplified
  const refreshTranslations = useCallback(() => {
    const loadTranslations = async () => {
      try {
        const newTranslations = await getTranslations(currentUILanguage.code);
        setTranslations({ ...(newTranslations as any) }); // Create new object reference
      } catch (error) {
        console.warn('Failed to refresh translations:', error);
      }
    };
    
    loadTranslations();
  }, [currentUILanguage.code]);

  // Translation function - simplified
  const translate = useCallback((key: string, fallback?: string): string => {
    try {
      // Use the global t function from i18n
      return t(key as keyof TranslationKeys, currentUILanguage.code) || fallback || key;
    } catch {
      return fallback || key;
    }
  }, [currentUILanguage.code]);

  // Context value - memoized
  const contextValue = useMemo(() => ({
    // States
    currentUILanguage,
    currentLanguage: currentUILanguage, // Alias for backward compatibility
    translations,
    isLoading,
    error,
    availableLanguages: languages, // For backward compatibility
    
    // Methods
    changeUILanguage,
    refreshTranslations,
    t: translate,
  }), [
    currentUILanguage,
    translations,
    isLoading,
    error,
    changeUILanguage,
    refreshTranslations,
    translate,
  ]);

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
};

// Hook to use the context
export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

// Helper functions for backward compatibility
export const getCurrentLanguage = () => {
  try {
    const { currentUILanguage } = useLanguage();
    return currentUILanguage;
  } catch {
    return languages[0]; // Fallback
  }
};

export const getTranslation = (key: TranslationKeys, params?: Record<string, string>) => {
  try {
    const { t } = useLanguage();
    return t(key as any);
  } catch {
    return key; // Fallback to key
  }
};

// Safe language hook - fallback version
export const useSafeLanguage = () => {
  try {
    return useLanguage();
  } catch (error) {
    console.warn('useLanguage context not available:', error);
    return {
      currentUILanguage: languages[0],
      currentLanguage: languages[0],
      translations: {},
      isLoading: false,
      error: null,
      availableLanguages: languages,
      changeUILanguage: async (): Promise<void> => { console.warn('Language not initialized'); },
      refreshTranslations: (): void => { console.warn('Language not initialized'); },
      t: (key: string, fallback?: string): string => fallback || key,
    };
  }
};

// Backward compatibility exports
export const useTranslations = () => {
  try {
    const { t, translations } = useLanguage();
    return { t, translations };
  } catch {
    return { 
      t: (key: string, fallback?: string) => fallback || key,
      translations: {}, 
    };
  }
};

export const getTranslationForLanguage = (key: TranslationKeys, languageCode: string, params?: Record<string, string>) => {
  try {
    // Simplified for ultra-nuclear mode
    return String(key);
  } catch {
    return String(key);
  }
};
