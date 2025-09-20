import { VocabularyItem, CEFRLevel } from '@/types';

// CEFR Vocabulary Service
// Manages the complete vocabulary database for all CEFR levels (A1, A2, B1, B2)
// Supports 6 languages: English, Spanish, French, Italian, Chinese, Croatian

export interface VocabularyFilter {
  level?: CEFRLevel;
  category?: string;
  difficulty?: number;
  minFrequency?: number;
  maxFrequency?: number;
  partOfSpeech?: string;
  tags?: string[];
}

export interface VocabularyStats {
  totalWords: number;
  wordsByLevel: Record<CEFRLevel, number>;
  wordsByCategory: Record<string, number>;
  wordsByDifficulty: Record<number, number>;
  averageFrequency: number;
}

export class CEFRVocabularyService {
  private vocabularyDatabase: Map<string, VocabularyItem[]> = new Map();
  private languageCodes: string[] = ['en', 'es', 'fr', 'it', 'zh', 'hr'];

  constructor() {
    this.initializeDatabase();
  }

  private initializeDatabase(): void {
    // Initialize with A1 vocabulary (600 words)
    // In a real implementation, this would load from the complete database
    this.vocabularyDatabase.set('en', this.getEnglishA1Vocabulary());
    this.vocabularyDatabase.set('es', this.getSpanishA1Vocabulary());
    this.vocabularyDatabase.set('fr', this.getFrenchA1Vocabulary());
    this.vocabularyDatabase.set('it', this.getItalianA1Vocabulary());
    this.vocabularyDatabase.set('zh', this.getChineseA1Vocabulary());
    this.vocabularyDatabase.set('hr', this.getCroatianA1Vocabulary());
  }

  // Get vocabulary by language and level
  getVocabularyByLevel(languageCode: string, level: CEFRLevel): VocabularyItem[] {
    const vocabulary = this.vocabularyDatabase.get(languageCode) || [];
    return vocabulary.filter(item => item.cefrLevel === level);
  }

  // Get vocabulary by language and category
  getVocabularyByCategory(languageCode: string, category: string): VocabularyItem[] {
    const vocabulary = this.vocabularyDatabase.get(languageCode) || [];
    return vocabulary.filter(item => item.tags.includes(category));
  }

  // Get vocabulary with filters
  getVocabularyWithFilters(languageCode: string, filters: VocabularyFilter): VocabularyItem[] {
    const vocabulary = this.vocabularyDatabase.get(languageCode) || [];
    
    return vocabulary.filter(item => {
      if (filters.level && item.cefrLevel !== filters.level) return false;
      if (filters.difficulty && item.difficulty !== filters.difficulty) return false;
      if (filters.minFrequency && item.frequency < filters.minFrequency) return false;
      if (filters.maxFrequency && item.frequency > filters.maxFrequency) return false;
      if (filters.partOfSpeech && item.partOfSpeech !== filters.partOfSpeech) return false;
      if (filters.tags && !filters.tags.some(tag => item.tags.includes(tag))) return false;
      if (filters.category && !item.tags.includes(filters.category)) return false;
      
      return true;
    });
  }

  // Get vocabulary statistics
  getVocabularyStats(languageCode: string): VocabularyStats {
    const vocabulary = this.vocabularyDatabase.get(languageCode) || [];
    
    const wordsByLevel: Record<CEFRLevel, number> = {
      A1: 0, A2: 0, B1: 0, B2: 0, C1: 0, C2: 0,
    };
    
    const wordsByCategory: Record<string, number> = {};
    const wordsByDifficulty: Record<number, number> = {};
    
    let totalFrequency = 0;
    
    vocabulary.forEach(item => {
      wordsByLevel[item.cefrLevel]++;
      wordsByDifficulty[item.difficulty] = (wordsByDifficulty[item.difficulty] || 0) + 1;
      totalFrequency += item.frequency;
      
      item.tags.forEach(tag => {
        wordsByCategory[tag] = (wordsByCategory[tag] || 0) + 1;
      });
    });
    
    return {
      totalWords: vocabulary.length,
      wordsByLevel,
      wordsByCategory,
      wordsByDifficulty,
      averageFrequency: vocabulary.length > 0 ? totalFrequency / vocabulary.length : 0,
    };
  }

  // Get random vocabulary for practice
  getRandomVocabulary(languageCode: string, count: number, filters?: VocabularyFilter): VocabularyItem[] {
    const vocabulary = filters 
      ? this.getVocabularyWithFilters(languageCode, filters)
      : this.vocabularyDatabase.get(languageCode) || [];
    
    const shuffled = [...vocabulary].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  // Get vocabulary for spaced repetition
  getVocabularyForReview(languageCode: string, level: CEFRLevel, count: number): VocabularyItem[] {
    const vocabulary = this.getVocabularyByLevel(languageCode, level);
    
    // Prioritize words that haven't been mastered
    const notMastered = vocabulary.filter(item => !item.mastered);
    const mastered = vocabulary.filter(item => item.mastered);
    
    // Mix not mastered and mastered words
    const result = [...notMastered, ...mastered];
    return result.slice(0, count);
  }

  // Search vocabulary
  searchVocabulary(languageCode: string, query: string): VocabularyItem[] {
    const vocabulary = this.vocabularyDatabase.get(languageCode) || [];
    const lowerQuery = query.toLowerCase();
    
    return vocabulary.filter(item => 
      item.word.toLowerCase().includes(lowerQuery) ||
      item.translation.toLowerCase().includes(lowerQuery) ||
      item.tags.some(tag => tag.toLowerCase().includes(lowerQuery)),
    );
  }

  // Get vocabulary by frequency (most common first)
  getVocabularyByFrequency(languageCode: string, level: CEFRLevel, count: number): VocabularyItem[] {
    const vocabulary = this.getVocabularyByLevel(languageCode, level);
    return vocabulary
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, count);
  }

  // Get vocabulary for lesson planning
  getVocabularyForLesson(languageCode: string, level: CEFRLevel, category: string, count: number): VocabularyItem[] {
    const vocabulary = this.getVocabularyByLevel(languageCode, level);
    const categoryWords = vocabulary.filter(item => item.tags.includes(category));
    
    // Sort by frequency and difficulty
    return categoryWords
      .sort((a, b) => {
        if (a.frequency !== b.frequency) return b.frequency - a.frequency;
        return a.difficulty - b.difficulty;
      })
      .slice(0, count);
  }

  // Update vocabulary mastery status
  updateVocabularyMastery(languageCode: string, wordId: string, mastered: boolean): void {
    const vocabulary = this.vocabularyDatabase.get(languageCode) || [];
    const word = vocabulary.find(item => item.id === wordId);
    
    if (word) {
      word.mastered = mastered;
      word.lastReviewed = new Date().toISOString();
    }
  }

  // Get progress statistics
  getProgressStats(languageCode: string, level: CEFRLevel): {
    total: number;
    mastered: number;
    inProgress: number;
    notStarted: number;
    masteryPercentage: number;
  } {
    const vocabulary = this.getVocabularyByLevel(languageCode, level);
    const mastered = vocabulary.filter(item => item.mastered).length;
    const inProgress = vocabulary.filter(item => item.lastReviewed && !item.mastered).length;
    const notStarted = vocabulary.filter(item => !item.lastReviewed && !item.mastered).length;
    
    return {
      total: vocabulary.length,
      mastered,
      inProgress,
      notStarted,
      masteryPercentage: vocabulary.length > 0 ? (mastered / vocabulary.length) * 100 : 0,
    };
  }

  // Sample A1 vocabulary data (English)
  private getEnglishA1Vocabulary(): VocabularyItem[] {
    return [
      {
        id: 'en_a1_001_hello',
        word: 'hello',
        translation: 'hola',
        pronunciation: 'həˈloʊ',
        phonetic: 'həˈloʊ',
        partOfSpeech: 'interjection',
        difficulty: 1,
        frequency: 10,
        imageUrl: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400',
        audioUrl: '/audio/en/hello.mp3',
        exampleSentences: [
          {
            original: 'Hello, how are you?',
            translation: 'Hola, ¿cómo estás?',
            audioUrl: '/audio/en/hello_how_are_you.mp3',
          },
        ],
        tags: ['greeting', 'basic', 'communication'],
        cefrLevel: 'A1',
        mastered: false,
      },
      {
        id: 'en_a1_002_goodbye',
        word: 'goodbye',
        translation: 'adiós',
        pronunciation: 'ɡʊdˈbaɪ',
        phonetic: 'ɡʊdˈbaɪ',
        partOfSpeech: 'interjection',
        difficulty: 1,
        frequency: 9,
        imageUrl: 'https://images.unsplash.com/photo-1566492031773-4f4e44671d66?w=400',
        audioUrl: '/audio/en/goodbye.mp3',
        exampleSentences: [
          {
            original: 'Goodbye, see you tomorrow.',
            translation: 'Adiós, hasta mañana.',
            audioUrl: '/audio/en/goodbye_see_you_tomorrow.mp3',
          },
        ],
        tags: ['greeting', 'farewell', 'basic'],
        cefrLevel: 'A1',
        mastered: false,
      },
      // Note: In a real implementation, this would contain all 600 A1 words
    ];
  }

  // Sample A1 vocabulary data (Spanish)
  private getSpanishA1Vocabulary(): VocabularyItem[] {
    return [
      {
        id: 'es_a1_001_hola',
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
        tags: ['greeting', 'basic', 'communication'],
        cefrLevel: 'A1',
        mastered: false,
      },
      // Note: In a real implementation, this would contain all 600 A1 words
    ];
  }

  // Sample A1 vocabulary data (French)
  private getFrenchA1Vocabulary(): VocabularyItem[] {
    return [
      {
        id: 'fr_a1_001_bonjour',
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
      // Note: In a real implementation, this would contain all 600 A1 words
    ];
  }

  // Sample A1 vocabulary data (Italian)
  private getItalianA1Vocabulary(): VocabularyItem[] {
    return [
      {
        id: 'it_a1_001_ciao',
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
      // Note: In a real implementation, this would contain all 600 A1 words
    ];
  }

  // Sample A1 vocabulary data (Chinese)
  private getChineseA1Vocabulary(): VocabularyItem[] {
    return [
      {
        id: 'zh_a1_001_nihao',
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
      // Note: In a real implementation, this would contain all 600 A1 words
    ];
  }

  // Sample A1 vocabulary data (Croatian)
  private getCroatianA1Vocabulary(): VocabularyItem[] {
    return [
      {
        id: 'hr_a1_001_bok',
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
      // Note: In a real implementation, this would contain all 600 A1 words
    ];
  }
}

// Export singleton instance
export const cefrVocabularyService = new CEFRVocabularyService();

// Export helper functions
export const getVocabularyByLevel = (languageCode: string, level: CEFRLevel): VocabularyItem[] => {
  return cefrVocabularyService.getVocabularyByLevel(languageCode, level);
};

export const getVocabularyByCategory = (languageCode: string, category: string): VocabularyItem[] => {
  return cefrVocabularyService.getVocabularyByCategory(languageCode, category);
};

export const getVocabularyStats = (languageCode: string): VocabularyStats => {
  return cefrVocabularyService.getVocabularyStats(languageCode);
};

export const getRandomVocabulary = (languageCode: string, count: number, filters?: VocabularyFilter): VocabularyItem[] => {
  return cefrVocabularyService.getRandomVocabulary(languageCode, count, filters);
};

export default cefrVocabularyService;
