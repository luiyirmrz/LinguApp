import { StateCreator } from 'zustand';
import { Language } from '@/types';

export interface LanguageSlice {
  currentLanguage: Language | null;
  availableLanguages: Language[];
  targetLanguages: Language[];
  nativeLanguage: Language | null;
  setLanguage: (language: Language) => void;
  addLanguage: (language: Language) => void;
  setNativeLanguage: (language: Language) => void;
  removeLanguage: (languageId: string) => void;
}

export const createLanguageSlice: StateCreator<LanguageSlice> = (set, get) => ({
  currentLanguage: null,
  availableLanguages: [],
  targetLanguages: [],
  nativeLanguage: null,

  setLanguage: (language: Language) => {
    set({ currentLanguage: language });
  },

  addLanguage: (language: Language) => {
    const { targetLanguages } = get();
    if (!targetLanguages.find(lang => lang.id === language.id)) {
      set({ targetLanguages: [...targetLanguages, language] });
    }
  },

  setNativeLanguage: (language: Language) => {
    set({ nativeLanguage: language });
  },

  removeLanguage: (languageId: string) => {
    const { targetLanguages } = get();
    set({ 
      targetLanguages: targetLanguages.filter(lang => lang.id !== languageId), 
    });
  },
});
