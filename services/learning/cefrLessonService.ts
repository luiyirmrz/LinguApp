import { 
  MultilingualLesson, 
  MultilingualExercise, 
  GrammarConcept, 
  VocabularyItem, 
  CEFRLevel, 
  MultilingualContent,
  ExerciseType, 
} from '@/types';

// CEFR Lesson Service
// Manages the complete lesson database for all CEFR levels (A1, A2, B1, B2)
// 240 lessons total (60 per level × 4 levels)

export interface LessonFilter {
  level?: CEFRLevel;
  type?: string;
  difficulty?: number;
  minXPReward?: number;
  maxXPReward?: number;
  estimatedTime?: number;
  tags?: string[];
}

export interface LessonProgress {
  lessonId: string;
  userId: string;
  completed: boolean;
  progress: number; // 0-100
  exercisesCompleted: number;
  totalExercises: number;
  timeSpent: number; // in minutes
  accuracy: number; // 0-100
  xpEarned: number;
  lastAccessed: string;
  completedAt?: string;
  mistakes: {
    exerciseId: string;
    userAnswer: string;
    correctAnswer: string;
    timestamp: string;
  }[];
}

export interface LessonStats {
  totalLessons: number;
  lessonsByLevel: Record<CEFRLevel, number>;
  lessonsByType: Record<string, number>;
  averageDifficulty: number;
  totalXPReward: number;
  averageEstimatedTime: number;
}

export class CEFRLessonService {
  private lessonDatabase: Map<CEFRLevel, MultilingualLesson[]> = new Map();
  private userProgress: Map<string, LessonProgress[]> = new Map();

  constructor() {
    this.initializeDatabase();
  }

  private initializeDatabase(): void {
    // Initialize with sample lessons
    // In a real implementation, this would load from the complete database
    this.lessonDatabase.set('A1', this.getSampleA1Lessons());
    this.lessonDatabase.set('A2', this.getSampleA2Lessons());
    this.lessonDatabase.set('B1', this.getSampleB1Lessons());
    this.lessonDatabase.set('B2', this.getSampleB2Lessons());
  }

  // Get lessons by level
  getLessonsByLevel(level: CEFRLevel): MultilingualLesson[] {
    return this.lessonDatabase.get(level) || [];
  }

  // Get lesson by ID
  getLessonById(lessonId: string): MultilingualLesson | undefined {
    const allLevels: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2'];
    
    for (const level of allLevels) {
      const lessons = this.lessonDatabase.get(level) || [];
      const lesson = lessons.find(l => l.id === lessonId);
      if (lesson) return lesson;
    }
    
    return undefined;
  }

  // Get lessons with filters
  getLessonsWithFilters(filters: LessonFilter): MultilingualLesson[] {
    const allLessons: MultilingualLesson[] = [];
    
    const levels = filters.level ? [filters.level] : ['A1', 'A2', 'B1', 'B2'] as CEFRLevel[];
    
    levels.forEach(level => {
      const lessons = this.lessonDatabase.get(level) || [];
      allLessons.push(...lessons);
    });
    
    return allLessons.filter(lesson => {
      if (filters.type && lesson.type !== filters.type) return false;
      if (filters.difficulty && lesson.difficulty !== filters.difficulty) return false;
      if (filters.minXPReward && lesson.xpReward < filters.minXPReward) return false;
      if (filters.maxXPReward && lesson.xpReward > filters.maxXPReward) return false;
      if (filters.estimatedTime && lesson.estimatedTime > filters.estimatedTime) return false;
      
      return true;
    });
  }

  // Get lessons by type
  getLessonsByType(level: CEFRLevel, type: string): MultilingualLesson[] {
    const lessons = this.getLessonsByLevel(level);
    return lessons.filter(lesson => lesson.type === type);
  }

  // Get lessons by difficulty
  getLessonsByDifficulty(level: CEFRLevel, difficulty: number): MultilingualLesson[] {
    const lessons = this.getLessonsByLevel(level);
    return lessons.filter(lesson => lesson.difficulty === difficulty);
  }

  // Get next lesson for user
  getNextLesson(userId: string, level: CEFRLevel): MultilingualLesson | undefined {
    const userProgress = this.getUserProgress(userId);
    const completedLessonIds = userProgress
      .filter(progress => progress.completed)
      .map(progress => progress.lessonId);
    
    const lessons = this.getLessonsByLevel(level);
    return lessons.find(lesson => !completedLessonIds.includes(lesson.id));
  }

  // Get recommended lessons for user
  getRecommendedLessons(userId: string, level: CEFRLevel, count: number = 5): MultilingualLesson[] {
    const userProgress = this.getUserProgress(userId);
    const completedLessonIds = userProgress
      .filter(progress => progress.completed)
      .map(progress => progress.lessonId);
    
    const lessons = this.getLessonsByLevel(level);
    const availableLessons = lessons.filter(lesson => !completedLessonIds.includes(lesson.id));
    
    // Sort by difficulty and XP reward
    return availableLessons
      .sort((a, b) => {
        if (a.difficulty !== b.difficulty) return a.difficulty - b.difficulty;
        return b.xpReward - a.xpReward;
      })
      .slice(0, count);
  }

  // Get lesson statistics
  getLessonStats(): LessonStats {
    const stats: LessonStats = {
      totalLessons: 0,
      lessonsByLevel: { A1: 0, A2: 0, B1: 0, B2: 0, C1: 0, C2: 0 },
      lessonsByType: {},
      averageDifficulty: 0,
      totalXPReward: 0,
      averageEstimatedTime: 0,
    };
    
    let totalDifficulty = 0;
    let totalEstimatedTime = 0;
    
    this.lessonDatabase.forEach((lessons, level) => {
      stats.lessonsByLevel[level] = lessons.length;
      stats.totalLessons += lessons.length;
      
      lessons.forEach(lesson => {
        stats.lessonsByType[lesson.type] = (stats.lessonsByType[lesson.type] || 0) + 1;
        totalDifficulty += lesson.difficulty;
        totalEstimatedTime += lesson.estimatedTime;
        stats.totalXPReward += lesson.xpReward;
      });
    });
    
    stats.averageDifficulty = stats.totalLessons > 0 ? totalDifficulty / stats.totalLessons : 0;
    stats.averageEstimatedTime = stats.totalLessons > 0 ? totalEstimatedTime / stats.totalLessons : 0;
    
    return stats;
  }

  // Get user progress
  getUserProgress(userId: string): LessonProgress[] {
    return this.userProgress.get(userId) || [];
  }

  // Update lesson progress
  updateLessonProgress(userId: string, lessonId: string, progress: Partial<LessonProgress>): void {
    const userProgress = this.getUserProgress(userId);
    const existingProgress = userProgress.find(p => p.lessonId === lessonId);
    
    if (existingProgress) {
      Object.assign(existingProgress, progress);
    } else {
      const newProgress: LessonProgress = {
        lessonId,
        userId,
        completed: false,
        progress: 0,
        exercisesCompleted: 0,
        totalExercises: 0,
        timeSpent: 0,
        accuracy: 0,
        xpEarned: 0,
        lastAccessed: new Date().toISOString(),
        mistakes: [],
        ...progress,
      };
      userProgress.push(newProgress);
    }
    
    this.userProgress.set(userId, userProgress);
  }

  // Complete lesson
  completeLesson(userId: string, lessonId: string, accuracy: number, timeSpent: number): void {
    const lesson = this.getLessonById(lessonId);
    if (!lesson) return;
    
    const xpEarned = Math.floor(lesson.xpReward * (accuracy / 100));
    
    this.updateLessonProgress(userId, lessonId, {
      completed: true,
      progress: 100,
      exercisesCompleted: lesson.exercises.length,
      totalExercises: lesson.exercises.length,
      timeSpent,
      accuracy,
      xpEarned,
      completedAt: new Date().toISOString(),
    });
  }

  // Get lesson completion rate
  getLessonCompletionRate(userId: string, level: CEFRLevel): number {
    const userProgress = this.getUserProgress(userId);
    const completedLessons = userProgress.filter(progress => 
      progress.completed && this.getLessonById(progress.lessonId)?.targetLanguage === level,
    ).length;
    
    const totalLessons = this.getLessonsByLevel(level).length;
    return totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;
  }

  // Get user's learning path
  getUserLearningPath(userId: string): {
    currentLevel: CEFRLevel;
    currentLesson?: string;
    completedLessons: number;
    totalLessons: number;
    progress: number;
  } {
    const levels: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2'];
    let currentLevel: CEFRLevel = 'A1';
    let currentLesson: string | undefined;
    
    for (const level of levels) {
      const completionRate = this.getLessonCompletionRate(userId, level);
      if (completionRate < 100) {
        currentLevel = level;
        currentLesson = this.getNextLesson(userId, level)?.id;
        break;
      }
    }
    
    const completedLessons = this.getUserProgress(userId).filter(p => p.completed).length;
    const totalLessons = this.getLessonStats().totalLessons;
    
    return {
      currentLevel,
      currentLesson,
      completedLessons,
      totalLessons,
      progress: totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0,
    };
  }

  // Search lessons
  searchLessons(query: string): MultilingualLesson[] {
    const allLessons: MultilingualLesson[] = [];
    this.lessonDatabase.forEach(lessons => allLessons.push(...lessons));
    
    const lowerQuery = query.toLowerCase();
    
    return allLessons.filter(lesson => {
      // Search in title
      const titleMatch = Object.values(lesson.title).some(title => 
        title.toLowerCase().includes(lowerQuery),
      );
      
      // Search in description
      const descriptionMatch = Object.values(lesson.description).some(desc => 
        desc.toLowerCase().includes(lowerQuery),
      );
      
      // Search in vocabulary
      const vocabularyMatch = lesson.vocabularyIntroduced.some(vocab => 
        vocab.word.toLowerCase().includes(lowerQuery) ||
        vocab.translation.toLowerCase().includes(lowerQuery),
      );
      
      return titleMatch || descriptionMatch || vocabularyMatch;
    });
  }

  // Get lessons by vocabulary
  getLessonsByVocabulary(vocabularyId: string): MultilingualLesson[] {
    const allLessons: MultilingualLesson[] = [];
    this.lessonDatabase.forEach(lessons => allLessons.push(...lessons));
    
    return allLessons.filter(lesson => 
      lesson.vocabularyIntroduced.some(vocab => vocab.id === vocabularyId),
    );
  }

  // Get lessons by grammar concept
  getLessonsByGrammarConcept(grammarId: string): MultilingualLesson[] {
    const allLessons: MultilingualLesson[] = [];
    this.lessonDatabase.forEach(lessons => allLessons.push(...lessons));
    
    return allLessons.filter(lesson => 
      lesson.grammarConcepts.some(grammar => grammar.id === grammarId),
    );
  }

  // Sample A1 lessons
  private getSampleA1Lessons(): MultilingualLesson[] {
    return [
      {
        id: 'a1_lesson_001_basic_greetings',
        title: {
          en: 'Basic Greetings',
          es: 'Saludos Básicos',
          fr: 'Salutations de Base',
          it: 'Saluti di Base',
          zh: '基本问候',
          hr: 'Osnovni Pozdravi',
        },
        type: 'vocabulary',
        completed: false,
        exercises: [],
        xpReward: 50,
        difficulty: 1,
        estimatedTime: 15,
        description: {
          en: 'Learn basic greetings to start conversations in Spanish',
          es: 'Aprende saludos básicos para iniciar conversaciones en español',
          fr: 'Apprenez les salutations de base pour commencer des conversations en espagnol',
          it: 'Impara i saluti di base per iniziare conversazioni in spagnolo',
          zh: '学习基本问候语以开始西班牙语对话',
          hr: 'Nauči osnovne pozdrave za početak razgovora na španjolskom',
        },
        targetLanguage: 'es',
        mainLanguage: 'en',
        vocabularyIntroduced: [],
        vocabularyReviewed: [],
        grammarConcepts: [],
        learningObjectives: [],
        completionCriteria: {
          minimumAccuracy: 80,
          requiredExercises: [],
        },
      },
      // Note: This would contain all 60 A1 lessons
    ];
  }

  // Sample A2 lessons
  private getSampleA2Lessons(): MultilingualLesson[] {
    return [
      {
        id: 'a2_lesson_001_shopping_vocabulary',
        title: {
          en: 'Shopping Vocabulary',
          es: 'Vocabulario de Compras',
          fr: 'Vocabulaire de Shopping',
          it: 'Vocabolario dello Shopping',
          zh: '购物词汇',
          hr: 'Vokabular za Kupovinu',
        },
        type: 'vocabulary',
        completed: false,
        exercises: [],
        xpReward: 75,
        difficulty: 2,
        estimatedTime: 25,
        description: {
          en: 'Learn essential vocabulary for shopping in Spanish',
          es: 'Aprende vocabulario esencial para comprar en español',
          fr: 'Apprenez le vocabulaire essentiel pour faire du shopping en espagnol',
          it: 'Impara il vocabolario essenziale per fare shopping in spagnolo',
          zh: '学习西班牙语购物的基本词汇',
          hr: 'Nauči osnovni vokabular za kupovinu na španjolskom',
        },
        targetLanguage: 'es',
        mainLanguage: 'en',
        vocabularyIntroduced: [],
        vocabularyReviewed: [],
        grammarConcepts: [],
        learningObjectives: [],
        completionCriteria: {
          minimumAccuracy: 80,
          requiredExercises: [],
        },
      },
      // Note: This would contain all 60 A2 lessons
    ];
  }

  // Sample B1 lessons
  private getSampleB1Lessons(): MultilingualLesson[] {
    return [
      {
        id: 'b1_lesson_001_technology_internet',
        title: {
          en: 'Technology and Internet',
          es: 'Tecnología e Internet',
          fr: 'Technologie et Internet',
          it: 'Tecnologia e Internet',
          zh: '技术和互联网',
          hr: 'Tehnologija i Internet',
        },
        type: 'vocabulary',
        completed: false,
        exercises: [],
        xpReward: 100,
        difficulty: 3,
        estimatedTime: 35,
        description: {
          en: 'Learn vocabulary and expressions related to technology and the internet',
          es: 'Aprende vocabulario y expresiones relacionadas con la tecnología e internet',
          fr: 'Apprenez le vocabulaire et les expressions liés à la technologie et à l\'internet',
          it: 'Impara il vocabolario e le espressioni relative alla tecnologia e internet',
          zh: '学习与技术和互联网相关的词汇和表达',
          hr: 'Nauči vokabular i izraze vezane za tehnologiju i internet',
        },
        targetLanguage: 'es',
        mainLanguage: 'en',
        vocabularyIntroduced: [],
        vocabularyReviewed: [],
        grammarConcepts: [],
        learningObjectives: [],
        completionCriteria: {
          minimumAccuracy: 85,
          requiredExercises: [],
        },
      },
      // Note: This would contain all 60 B1 lessons
    ];
  }

  // Sample B2 lessons
  private getSampleB2Lessons(): MultilingualLesson[] {
    return [
      {
        id: 'b2_lesson_001_business_communication',
        title: {
          en: 'Business and Professional Communication',
          es: 'Comunicación Empresarial y Profesional',
          fr: 'Communication d\'Entreprise et Professionnelle',
          it: 'Comunicazione Aziendale e Professionale',
          zh: '商务和专业沟通',
          hr: 'Poslovna i Profesionalna Komunikacija',
        },
        type: 'vocabulary',
        completed: false,
        exercises: [],
        xpReward: 150,
        difficulty: 4,
        estimatedTime: 45,
        description: {
          en: 'Master professional communication skills in Spanish business contexts',
          es: 'Domina las habilidades de comunicación profesional en contextos empresariales españoles',
          fr: 'Maîtrisez les compétences de communication professionnelle dans les contextes d\'entreprise espagnols',
          it: 'Padroneggia le competenze di comunicazione professionale nei contesti aziendali spagnoli',
          zh: '掌握西班牙语商务环境中的专业沟通技能',
          hr: 'Ovladaj vještinama profesionalne komunikacije u španjolskim poslovnim kontekstima',
        },
        targetLanguage: 'es',
        mainLanguage: 'en',
        vocabularyIntroduced: [],
        vocabularyReviewed: [],
        grammarConcepts: [],
        learningObjectives: [],
        completionCriteria: {
          minimumAccuracy: 90,
          requiredExercises: [],
        },
      },
      // Note: This would contain all 60 B2 lessons
    ];
  }
}

// Export singleton instance
export const cefrLessonService = new CEFRLessonService();

// Export helper functions
export const getLessonsByLevel = (level: CEFRLevel): MultilingualLesson[] => {
  return cefrLessonService.getLessonsByLevel(level);
};

export const getLessonById = (lessonId: string): MultilingualLesson | undefined => {
  return cefrLessonService.getLessonById(lessonId);
};

export const getLessonStats = (): LessonStats => {
  return cefrLessonService.getLessonStats();
};

export const getNextLesson = (userId: string, level: CEFRLevel): MultilingualLesson | undefined => {
  return cefrLessonService.getNextLesson(userId, level);
};

export default cefrLessonService;
