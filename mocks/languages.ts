import { Language } from '@/types';

export const languages: Language[] = [
  {
    id: 'en',
    code: 'en',
    name: 'English',
    flag: '🇺🇸',
    level: 'beginner',
    nativeName: 'English',
    rtl: false,
    difficulty: 1,
    family: 'Germanic',
    speakers: 1500000000,
    countries: ['US', 'UK', 'CA', 'AU', 'NZ', 'IE'],
    writingSystem: 'Latin',
    hasGender: false,
    hasCases: false,
    wordOrder: 'SVO',
  },
  {
    id: 'es',
    code: 'es', 
    name: 'Spanish',
    flag: '🇪🇸',
    level: 'beginner',
    nativeName: 'Español',
    rtl: false,
    difficulty: 2,
    family: 'Romance',
    speakers: 500000000,
    countries: ['ES', 'MX', 'AR', 'CO', 'PE', 'VE', 'CL', 'EC', 'GT', 'CU'],
    writingSystem: 'Latin',
    hasGender: true,
    hasCases: false,
    wordOrder: 'SVO',
  },
  {
    id: 'fr',
    code: 'fr',
    name: 'French',
    flag: '🇫🇷',
    level: 'beginner',
    nativeName: 'Français',
    rtl: false,
    difficulty: 2,
    family: 'Romance',
    speakers: 280000000,
    countries: ['FR', 'CA', 'BE', 'CH', 'LU', 'MC'],
    writingSystem: 'Latin',
    hasGender: true,
    hasCases: false,
    wordOrder: 'SVO',
  },
  {
    id: 'it',
    code: 'it',
    name: 'Italian',
    flag: '🇮🇹',
    level: 'beginner',
    nativeName: 'Italiano',
    rtl: false,
    difficulty: 2,
    family: 'Romance',
    speakers: 65000000,
    countries: ['IT', 'CH', 'SM', 'VA'],
    writingSystem: 'Latin',
    hasGender: true,
    hasCases: false,
    wordOrder: 'SVO',
  },
  {
    id: 'zh',
    code: 'zh',
    name: 'Chinese (Mandarin)',
    flag: '🇨🇳',
    level: 'beginner',
    nativeName: '中文',
    rtl: false,
    difficulty: 5,
    family: 'Sino-Tibetan',
    speakers: 918000000,
    countries: ['CN', 'TW', 'SG'],
    writingSystem: 'Chinese characters',
    hasGender: false,
    hasCases: false,
    wordOrder: 'SVO',
  },
  {
    id: 'hr',
    code: 'hr',
    name: 'Croatian',
    flag: '🇭🇷',
    level: 'beginner',
    nativeName: 'Hrvatski',
    rtl: false,
    difficulty: 4,
    family: 'Slavic',
    speakers: 5600000,
    countries: ['HR', 'BA', 'ME'],
    writingSystem: 'Latin',
    hasGender: true,
    hasCases: true,
    wordOrder: 'SVO',
  },
];

// Supported language pairs for learning
export const supportedLanguagePairs = [
  // English as main language
  { main: 'en', target: 'es' },
  { main: 'en', target: 'fr' },
  { main: 'en', target: 'it' },
  { main: 'en', target: 'zh' },
  { main: 'en', target: 'hr' },
  
  // Spanish as main language
  { main: 'es', target: 'en' },
  { main: 'es', target: 'fr' },
  { main: 'es', target: 'it' },
  
  // French as main language
  { main: 'fr', target: 'en' },
  { main: 'fr', target: 'es' },
  { main: 'fr', target: 'it' },
  
  // Italian as main language
  { main: 'it', target: 'en' },
  { main: 'it', target: 'es' },
  { main: 'it', target: 'fr' },
  
  // Chinese as main language
  { main: 'zh', target: 'en' },
  
  // Croatian as main language
  { main: 'hr', target: 'en' },
  { main: 'hr', target: 'es' },
  { main: 'hr', target: 'it' },
];

export const getLanguageByCode = (code: string): Language | undefined => {
  return languages.find(lang => lang.code === code);
};

export const getAvailableTargetLanguages = (mainLanguageCode: string): Language[] => {
  const availableTargets = supportedLanguagePairs
    .filter(pair => pair.main === mainLanguageCode)
    .map(pair => pair.target);
  
  return languages.filter(lang => availableTargets.includes(lang.code));
};

export const getAvailableMainLanguages = (targetLanguageCode: string): Language[] => {
  const availableMains = supportedLanguagePairs
    .filter(pair => pair.target === targetLanguageCode)
    .map(pair => pair.main);
  
  return languages.filter(lang => availableMains.includes(lang.code));
};

export const isLanguagePairSupported = (mainCode: string, targetCode: string): boolean => {
  return supportedLanguagePairs.some(
    pair => pair.main === mainCode && pair.target === targetCode,
  );
};
