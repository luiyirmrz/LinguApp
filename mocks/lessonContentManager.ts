import { CEFRLevel, MultilingualProgress, LessonModule, LanguageCourse, MultilingualContent } from '@/types';
import { LessonContentGenerator } from './lessonContentGenerator';

// Enhanced Lesson Content Manager for multilingual support
export class LessonContentManager {
  private targetLanguage: string;
  private mainLanguage: string;
  private contentGenerator: LessonContentGenerator;

  constructor(targetLanguage: string, mainLanguage: string) {
    this.targetLanguage = targetLanguage;
    this.mainLanguage = mainLanguage;
    this.contentGenerator = new LessonContentGenerator(targetLanguage, mainLanguage);
  }

  // Get course progress for a user
  getCourseProgress(userId: string): any {
    return {
      userId,
      targetLanguage: this.targetLanguage,
      mainLanguage: this.mainLanguage,
      currentLevel: 'A1' as CEFRLevel,
      currentModule: 1,
      totalXP: 0,
      streak: 0,
      completedLessons: [],
      unlockedModules: ['A1_M1'],
      lastActivity: new Date().toISOString(),
      languageSettings: {
        mainLanguage: this.mainLanguage,
        targetLanguage: this.targetLanguage,
        previousTargetLanguages: [],
        interfacePreferences: {
          showTranslations: true,
          showPhonetics: true,
          audioAutoplay: false,
          playbackSpeed: 1.0,
          difficultyLevel: 'beginner' as const,
          reviewFrequency: 'daily' as const,
          notificationsEnabled: true,
          darkMode: false,
        },
        learningGoals: {
          dailyXPTarget: 50,
          weeklyLessonTarget: 7,
          targetLevel: 'B1' as CEFRLevel,
          completionDate: undefined,
        },
      },
    };
  }

  // Update user progress
  updateProgress(userId: string, lessonId: string, xpGained: number): any {
    console.log(`User ${userId} completed lesson ${lessonId} and gained ${xpGained} XP`);
    
    return {
      success: true,
      newXP: xpGained,
      totalXP: xpGained,
      levelUp: false,
      newUnlocks: [],
      achievements: [],
      nextRecommendedLesson: this.getNextRecommendedLesson(lessonId),
    };
  }

  // Get multilingual UI text
  getUIText(key: string): string {
    const uiTexts: { [key: string]: MultilingualContent } = {
      'lesson.complete': {
        en: 'Lesson Complete!',
        es: '¡Lección Completada!',
        fr: 'Leçon Terminée!',
        it: 'Lezione Completata!',
        hr: 'Lekcija Završena!',
        zh: '课程完成！',
      },
      'lesson.start': {
        en: 'Start Lesson',
        es: 'Comenzar Lección',
        fr: 'Commencer la Leçon',
        it: 'Inizia Lezione',
        hr: 'Počni Lekciju',
        zh: '开始课程',
      },
      'lesson.continue': {
        en: 'Continue',
        es: 'Continuar',
        fr: 'Continuer',
        it: 'Continua',
        hr: 'Nastavi',
        zh: '继续',
      },
      'lesson.retry': {
        en: 'Try Again',
        es: 'Intentar de Nuevo',
        fr: 'Réessayer',
        it: 'Riprova',
        hr: 'Pokušaj Ponovno',
        zh: '重试',
      },
      'lesson.correct': {
        en: 'Correct!',
        es: '¡Correcto!',
        fr: 'Correct!',
        it: 'Corretto!',
        hr: 'Točno!',
        zh: '正确！',
      },
      'lesson.incorrect': {
        en: 'Incorrect',
        es: 'Incorrecto',
        fr: 'Incorrect',
        it: 'Sbagliato',
        hr: 'Netočno',
        zh: '错误',
      },
      'lesson.hint': {
        en: 'Hint',
        es: 'Pista',
        fr: 'Indice',
        it: 'Suggerimento',
        hr: 'Savjet',
        zh: '提示',
      },
      'lesson.skip': {
        en: 'Skip',
        es: 'Saltar',
        fr: 'Passer',
        it: 'Salta',
        hr: 'Preskoči',
        zh: '跳过',
      },
      'lesson.xp_earned': {
        en: 'XP Earned',
        es: 'XP Ganado',
        fr: 'XP Gagné',
        it: 'XP Guadagnato',
        hr: 'XP Zarađeno',
        zh: '获得经验值',
      },
      'lesson.progress': {
        en: 'Progress',
        es: 'Progreso',
        fr: 'Progrès',
        it: 'Progresso',
        hr: 'Napredak',
        zh: '进度',
      },
    };

    const text = uiTexts[key];
    return text?.[this.mainLanguage] || text?.['en'] || key;
  }

  // Get course structure for a language pair
  getCourseStructure(): LanguageCourse {
    return {
      targetLanguage: this.targetLanguage,
      mainLanguage: this.mainLanguage,
      modules: this.generateModules(),
      totalLessons: this.calculateTotalLessons(),
      estimatedHours: this.calculateEstimatedHours(),
      description: this.getCourseDescription(),
      vocabularyProgression: this.getVocabularyProgression(),
      grammarProgression: this.getGrammarProgression(),
    };
  }

  private generateModules(): LessonModule[] {
    // For now, generate A1 modules only
    return [
      {
        id: 'A1_M1',
        title: this.getModuleTitle('A1_M1'),
        description: this.getModuleDescription('A1_M1'),
        skills: [],
        cefrLevel: 'A1',
        targetLanguage: this.targetLanguage,
        mainLanguage: this.mainLanguage,
        moduleNumber: 1,
        totalModules: 8,
        vocabularyTarget: {
          newWords: 50,
          reviewWords: 0,
          totalWords: 50,
        },
        grammarConcepts: ['present_tense_be', 'basic_pronouns', 'articles'],
        unlockRequirement: {},
        estimatedHours: 8,
      },
    ];
  }

  private getModuleTitle(moduleId: string): MultilingualContent {
    const titles: { [key: string]: MultilingualContent } = {
      'A1_M1': {
        en: 'Basic Greetings and Introductions',
        es: 'Saludos Básicos e Introducciones',
        fr: 'Salutations de Base et Présentations',
        it: 'Saluti di Base e Presentazioni',
        hr: 'Osnovni Pozdravi i Predstavljanja',
        zh: '基本问候和介绍',
      },
    };
    
    return titles[moduleId] || titles['A1_M1'];
  }

  private getModuleDescription(moduleId: string): MultilingualContent {
    const descriptions: { [key: string]: MultilingualContent } = {
      'A1_M1': {
        en: 'Learn basic greetings, how to introduce yourself, and essential everyday phrases.',
        es: 'Aprende saludos básicos, cómo presentarte y frases esenciales del día a día.',
        fr: 'Apprenez les salutations de base, comment vous présenter et les phrases essentielles du quotidien.',
        it: 'Impara i saluti di base, come presentarti e le frasi essenziali di tutti i giorni.',
        hr: 'Naučite osnovne pozdrave, kako se predstaviti i osnovne svakodnevne fraze.',
        zh: '学习基本问候语、如何自我介绍以及日常必需短语。',
      },
    };
    
    return descriptions[moduleId] || descriptions['A1_M1'];
  }

  private calculateTotalLessons(): number {
    return 40; // Placeholder for A1 level
  }

  private calculateEstimatedHours(): number {
    return 60; // Placeholder for A1 level
  }

  private getCourseDescription(): MultilingualContent {
    return {
      en: `Complete ${this.targetLanguage} course from beginner to advanced level`,
      es: `Curso completo de ${this.targetLanguage} desde principiante hasta nivel avanzado`,
      fr: `Cours complet de ${this.targetLanguage} du débutant au niveau avancé`,
      it: `Corso completo di ${this.targetLanguage} dal principiante al livello avanzato`,
      hr: `Potpuni tečaj ${this.targetLanguage} od početnika do napredne razine`,
      zh: `从初学者到高级水平的完整${this.targetLanguage}课程`,
    };
  }

  private getVocabularyProgression(): LanguageCourse['vocabularyProgression'] {
    return {
      A1: {
        targetWords: 500,
        cumulativeWords: 500,
        keyTopics: ['greetings', 'family', 'food', 'numbers', 'colors', 'basic_verbs'],
      },
      A2: {
        targetWords: 1000,
        cumulativeWords: 1500,
        keyTopics: ['travel', 'shopping', 'hobbies', 'weather', 'time', 'directions'],
      },
      B1: {
        targetWords: 2000,
        cumulativeWords: 3500,
        keyTopics: ['work', 'education', 'health', 'technology', 'environment'],
      },
      B2: {
        targetWords: 4000,
        cumulativeWords: 7500,
        keyTopics: ['politics', 'culture', 'science', 'economics', 'media'],
      },
      C1: {
        targetWords: 8000,
        cumulativeWords: 15500,
        keyTopics: ['academic', 'professional', 'abstract_concepts', 'literature'],
      },
      C2: {
        targetWords: 16000,
        cumulativeWords: 31500,
        keyTopics: ['specialized', 'idiomatic', 'nuanced', 'sophisticated'],
      },
    };
  }

  private getGrammarProgression(): LanguageCourse['grammarProgression'] {
    return {
      A1: ['present_tense', 'articles', 'basic_pronouns', 'plural_forms', 'basic_questions'],
      A2: ['past_tense', 'future_tense', 'comparatives', 'modal_verbs', 'prepositions'],
      B1: ['perfect_tenses', 'conditional', 'passive_voice', 'relative_clauses'],
      B2: ['subjunctive', 'complex_tenses', 'reported_speech', 'advanced_clauses'],
      C1: ['advanced_subjunctive', 'complex_structures', 'stylistic_variations'],
      C2: ['literary_forms', 'archaic_structures', 'regional_variations'],
    };
  }

  private getNextRecommendedLesson(completedLessonId: string): string {
    // Simple logic to recommend next lesson
    const lessonNumber = parseInt(completedLessonId.split('_').pop() || '1');
    return `A1_M1_L${lessonNumber + 1}`;
  }

  // Generate lesson content for specific lesson
  generateLessonContent(lessonId: string, exerciseType: string) {
    return this.contentGenerator.generateExerciseContent(
      exerciseType as any,
      'A1',
      'basics',
    );
  }
}
