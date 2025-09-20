import { 
  VocabularyItem, 
  GrammarConcept, 
  CEFRLevel, 
  MultilingualContent, 
} from '@/types';

// Vocabulary Database Structure
export const vocabularyDatabase: { [languageCode: string]: VocabularyItem[] } = {
  // Spanish Vocabulary
  es: [
    // A1 Level - Basic Greetings
    {
      id: 'es_a1_hola',
      word: 'hola',
      translation: 'hello',
      pronunciation: 'ˈola',
      phonetic: 'ˈola',
      partOfSpeech: 'interjection',
      difficulty: 1,
      frequency: 10,
      imageUrl: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400',
      audioUrl: '/audio/es/hola.mp3',
      exampleSentences: [
        {
          original: 'Hola, ¿cómo estás?',
          translation: 'Hello, how are you?',
          audioUrl: '/audio/es/hola_como_estas.mp3',
        },
      ],
      tags: ['greeting', 'basic', 'informal'],
      cefrLevel: 'A1',
      mastered: false,
    },
    {
      id: 'es_a1_adios',
      word: 'adiós',
      translation: 'goodbye',
      pronunciation: 'aˈðjos',
      phonetic: 'aˈðjos',
      partOfSpeech: 'interjection',
      difficulty: 1,
      frequency: 9,
      imageUrl: 'https://images.unsplash.com/photo-1566492031773-4f4e44671d66?w=400',
      audioUrl: '/audio/es/adios.mp3',
      exampleSentences: [
        {
          original: 'Adiós, hasta mañana.',
          translation: 'Goodbye, see you tomorrow.',
          audioUrl: '/audio/es/adios_hasta_manana.mp3',
        },
      ],
      tags: ['greeting', 'basic', 'farewell'],
      cefrLevel: 'A1',
      mastered: false,
    },
    // A1 Level - Family
    {
      id: 'es_a1_familia',
      word: 'familia',
      translation: 'family',
      pronunciation: 'faˈmilja',
      phonetic: 'faˈmilja',
      partOfSpeech: 'noun',
      difficulty: 1,
      frequency: 8,
      imageUrl: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=400',
      audioUrl: '/audio/es/familia.mp3',
      exampleSentences: [
        {
          original: 'Mi familia es muy grande.',
          translation: 'My family is very big.',
          audioUrl: '/audio/es/mi_familia_es_muy_grande.mp3',
        },
      ],
      tags: ['family', 'basic', 'noun'],
      cefrLevel: 'A1',
      mastered: false,
    },
  ],
  
  // French Vocabulary
  fr: [
    {
      id: 'fr_a1_bonjour',
      word: 'bonjour',
      translation: 'hello/good morning',
      pronunciation: 'bon.ˈʒuʁ',
      phonetic: 'bon.ˈʒuʁ',
      partOfSpeech: 'interjection',
      difficulty: 1,
      frequency: 10,
      imageUrl: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400',
      audioUrl: '/audio/fr/bonjour.mp3',
      exampleSentences: [
        {
          original: 'Bonjour, comment allez-vous?',
          translation: 'Hello, how are you?',
          audioUrl: '/audio/fr/bonjour_comment_allez_vous.mp3',
        },
      ],
      tags: ['greeting', 'basic', 'formal'],
      cefrLevel: 'A1',
      mastered: false,
    },
  ],
  
  // Italian Vocabulary
  it: [
    {
      id: 'it_a1_ciao',
      word: 'ciao',
      translation: 'hello/goodbye',
      phonetic: 'ˈtʃao',
      pronunciation: 'ˈtʃao',
      partOfSpeech: 'interjection',
      difficulty: 1,
      frequency: 10,
      imageUrl: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400',
      audioUrl: '/audio/it/ciao.mp3',
      exampleSentences: [
        {
          original: 'Ciao, come stai?',
          translation: 'Hi, how are you?',
          audioUrl: '/audio/it/ciao_come_stai.mp3',
        },
      ],
      tags: ['greeting', 'basic', 'informal'],
      cefrLevel: 'A1',
      mastered: false,
    },
  ],
  
  // Chinese Vocabulary
  zh: [
    {
      id: 'zh_a1_nihao',
      word: '你好',
      translation: 'hello',
      phonetic: 'nǐ hǎo',
      pronunciation: 'nǐ hǎo',
      partOfSpeech: 'interjection',
      difficulty: 2,
      frequency: 10,
      imageUrl: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400',
      audioUrl: '/audio/zh/nihao.mp3',
      exampleSentences: [
        {
          original: '你好，你好吗？',
          translation: 'Hello, how are you?',
          audioUrl: '/audio/zh/nihao_ni_hao_ma.mp3',
        },
      ],
      tags: ['greeting', 'basic', 'formal'],
      cefrLevel: 'A1',
      mastered: false,
    },
  ],
  
  // Croatian Vocabulary
  hr: [
    {
      id: 'hr_a1_bok',
      word: 'bok',
      translation: 'hello',
      phonetic: 'bok',
      pronunciation: 'bok',
      partOfSpeech: 'interjection',
      difficulty: 1,
      frequency: 10,
      imageUrl: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400',
      audioUrl: '/audio/hr/bok.mp3',
      exampleSentences: [
        {
          original: 'Bok, kako si?',
          translation: 'Hi, how are you?',
          audioUrl: '/audio/hr/bok_kako_si.mp3',
        },
      ],
      tags: ['greeting', 'basic', 'informal'],
      cefrLevel: 'A1',
      mastered: false,
    },
  ],
};

// Grammar Concepts Database
export const grammarDatabase: { [languageCode: string]: GrammarConcept[] } = {
  // Spanish Grammar
  es: [
    {
      id: 'es_present_tense_ser',
      title: {
        en: 'Present Tense - Verb \"ser\" (to be)',
        es: 'Presente - Verbo \"ser\"',
        fr: 'Présent - Verbe \"ser\" (être)',
        it: 'Presente - Verbo \"ser\" (essere)',
        hr: 'Sadašnje vrijeme - Glagol \"ser\" (biti)',
        zh: '现在时 - 动词\"ser\"（是）',
      } as MultilingualContent,
      description: {
        en: 'Learn how to conjugate and use the verb \"ser\" for permanent characteristics',
        es: 'Aprende a conjugar y usar el verbo \"ser\" para características permanentes',
        fr: 'Apprenez à conjuguer et utiliser le verbe \"ser\" pour les caractéristiques permanentes',
        it: 'Impara a coniugare e usare il verbo \"ser\" per le caratteristiche permanenti',
        hr: 'Naučite konjugirati i koristiti glagol \"ser\" za stalna svojstva',
        zh: '学习如何变位和使用动词\"ser\"表示永久特征',
      } as MultilingualContent,
      examples: [
        {
          original: 'Yo soy estudiante.',
          translation: 'I am a student.',
          explanation: {
            en: '\"Soy\" is the first person singular form of \"ser\"',
            es: '\"Soy\" es la primera persona del singular de \"ser\"',
            fr: '\"Soy\" est la première personne du singulier de \"ser\"',
            it: '\"Soy\" è la prima persona singolare di \"ser\"',
            hr: '\"Soy\" je prvi lice jednine glagola \"ser\"',
            zh: '\"Soy\"是\"ser\"的第一人称单数形式',
          } as MultilingualContent,
        },
        {
          original: 'Ella es doctora.',
          translation: 'She is a doctor.',
          explanation: {
            en: '\"Es\" is the third person singular form of \"ser\"',
            es: '\"Es\" es la tercera persona del singular de \"ser\"',
            fr: '\"Es\" est la troisième personne du singulier de \"ser\"',
            it: '\"Es\" è la terza persona singolare di \"ser\"',
            hr: '\"Es\" je treće lice jednine glagola \"ser\"',
            zh: '\"Es\"是\"ser\"的第三人称单数形式',
          } as MultilingualContent,
        },
      ],
      difficulty: 2,
      cefrLevel: 'A1',
      category: 'tense',
    },
  ],
  
  // French Grammar
  fr: [
    {
      id: 'fr_present_tense_etre',
      title: {
        en: 'Present Tense - Verb \"être\" (to be)',
        es: 'Presente - Verbo \"être\" (ser/estar)',
        fr: 'Présent - Verbe \"être\"',
        it: 'Presente - Verbo \"être\" (essere)',
        hr: 'Sadašnje vrijeme - Glagol \"être\" (biti)',
        zh: '现在时 - 动词\"être\"（是）',
      } as MultilingualContent,
      description: {
        en: 'Learn how to conjugate and use the verb \"être\"',
        es: 'Aprende a conjugar y usar el verbo \"être\"',
        fr: 'Apprenez à conjuguer et utiliser le verbe \"être\"',
        it: 'Impara a coniugare e usare il verbo \"être\"',
        hr: 'Naučite konjugirati i koristiti glagol \"être\"',
        zh: '学习如何变位和使用动词\"être\"',
      } as MultilingualContent,
      examples: [
        {
          original: 'Je suis étudiant.',
          translation: 'I am a student.',
          explanation: {
            en: '\"Suis\" is the first person singular form of \"être\"',
            es: '\"Suis\" es la primera persona del singular de \"être\"',
            fr: '\"Suis\" est la première personne du singulier de \"être\"',
            it: '\"Suis\" è la prima persona singolare di \"être\"',
            hr: '\"Suis\" je prvo lice jednine glagola \"être\"',
            zh: '\"Suis\"是\"être\"的第一人称单数形式',
          } as MultilingualContent,
        },
      ],
      difficulty: 2,
      cefrLevel: 'A1',
      category: 'tense',
    },
  ],
};

// Vocabulary progression by CEFR level
export const vocabularyProgression = {
  A1: {
    targetWords: 500,
    topics: ['greetings', 'family', 'food', 'numbers', 'colors', 'basic_verbs', 'time', 'places'],
    wordsPerLesson: 8,
    reviewRatio: 0.3, // 30% review, 70% new words
  },
  A2: {
    targetWords: 700,
    topics: ['shopping', 'directions', 'weather', 'hobbies', 'work', 'health', 'travel', 'adjectives'],
    wordsPerLesson: 10,
    reviewRatio: 0.4,
  },
  B1: {
    targetWords: 1000,
    topics: ['education', 'technology', 'environment', 'culture', 'media', 'relationships', 'opinions'],
    wordsPerLesson: 12,
    reviewRatio: 0.5,
  },
  B2: {
    targetWords: 1800,
    topics: ['business', 'politics', 'science', 'arts', 'literature', 'philosophy', 'psychology'],
    wordsPerLesson: 15,
    reviewRatio: 0.6,
  },
  C1: {
    targetWords: 4000,
    topics: ['academic', 'professional', 'specialized', 'abstract_concepts', 'formal_language'],
    wordsPerLesson: 18,
    reviewRatio: 0.7,
  },
  C2: {
    targetWords: 8000,
    topics: ['literary', 'philosophical', 'scientific', 'cultural_nuances', 'historical', 'artistic'],
    wordsPerLesson: 20,
    reviewRatio: 0.8,
  },
};

// Helper functions for vocabulary management
export const getVocabularyByLanguage = (languageCode: string): VocabularyItem[] => {
  return vocabularyDatabase[languageCode] || [];
};

export const getVocabularyByLevel = (languageCode: string, level: CEFRLevel): VocabularyItem[] => {
  const vocabulary = getVocabularyByLanguage(languageCode);
  return vocabulary.filter(item => item.cefrLevel === level);
};

export const getVocabularyByTopic = (languageCode: string, topic: string): VocabularyItem[] => {
  const vocabulary = getVocabularyByLanguage(languageCode);
  return vocabulary.filter(item => item.tags.includes(topic));
};

export const getGrammarByLanguage = (languageCode: string): GrammarConcept[] => {
  return grammarDatabase[languageCode] || [];
};

export const getGrammarByLevel = (languageCode: string, level: CEFRLevel): GrammarConcept[] => {
  const grammar = getGrammarByLanguage(languageCode);
  return grammar.filter(concept => concept.cefrLevel === level);
};

export const calculateVocabularyDistribution = (
  level: CEFRLevel,
  lessonNumber: number,
  totalLessons: number,
): { newWords: number; reviewWords: number } => {
  const progression = vocabularyProgression[level];
  const wordsPerLesson = progression.wordsPerLesson;
  const reviewRatio = progression.reviewRatio;
  
  const newWords = Math.floor(wordsPerLesson * (1 - reviewRatio));
  const reviewWords = Math.floor(wordsPerLesson * reviewRatio);
  
  return { newWords, reviewWords };
};

// Export all vocabulary and grammar utilities
export default {
  vocabularyDatabase,
  grammarDatabase,
  vocabularyProgression,
  getVocabularyByLanguage,
  getVocabularyByLevel,
  getVocabularyByTopic,
  getGrammarByLanguage,
  getGrammarByLevel,
  calculateVocabularyDistribution,
};
