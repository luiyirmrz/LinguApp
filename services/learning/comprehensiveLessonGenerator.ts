// Comprehensive Lesson Generator Service
// Generates complete language lessons from A1 to C2 following CEFR standards
// Supports multiple languages with 10 words per lesson and gamification features

import { 
  CEFRLevel, 
  MultilingualContent, 
  VocabularyItem, 
  MultilingualExercise,
  MultilingualLesson, 
  LessonModule,
  LanguageCourse,
  ExerciseType,
  GrammarConcept,
  MultilingualSkill,
  SkillCategory,
  LessonType,
} from '@/types';
import { languages } from '@/mocks/languages';

// CEFR Word Targets by Level
export const CEFR_WORD_TARGETS = {
  A1: 600,
  A2: 1200,
  B1: 2500,
  B2: 4000,
  C1: 8000,
  C2: 16000,
};

// Words per lesson (as specified in requirements)
export const WORDS_PER_LESSON = 10;

// Calculate lessons needed per level
export const LESSONS_PER_LEVEL = {
  A1: Math.ceil(CEFR_WORD_TARGETS.A1 / WORDS_PER_LESSON), // 60 lessons
  A2: Math.ceil(CEFR_WORD_TARGETS.A2 / WORDS_PER_LESSON), // 120 lessons
  B1: Math.ceil(CEFR_WORD_TARGETS.B1 / WORDS_PER_LESSON), // 250 lessons
  B2: Math.ceil(CEFR_WORD_TARGETS.B2 / WORDS_PER_LESSON), // 400 lessons
  C1: Math.ceil(CEFR_WORD_TARGETS.C1 / WORDS_PER_LESSON), // 800 lessons
  C2: Math.ceil(CEFR_WORD_TARGETS.C2 / WORDS_PER_LESSON),  // 1600 lessons
};

// Lesson themes by CEFR level
export const LESSON_THEMES = {
  A1: [
    'basic_greetings', 'numbers', 'colors', 'family', 'food_basics', 'weather',
    'days_week', 'months', 'body_parts', 'clothing', 'animals', 'transport',
    'home_basics', 'professions', 'time', 'directions', 'shopping_basics',
    'restaurant_basics', 'health_basics', 'hobbies_basics',
  ],
  A2: [
    'advanced_greetings', 'descriptions', 'daily_routine', 'shopping',
    'restaurant', 'travel_basics', 'work_basics', 'school', 'sports',
    'entertainment', 'technology_basics', 'health', 'weather_advanced',
    'emotions', 'opinions', 'plans', 'past_events', 'future_plans',
    'comparisons', 'preferences',
  ],
  B1: [
    'business_basics', 'travel_advanced', 'culture', 'politics',
    'environment', 'technology', 'media', 'relationships', 'education',
    'career', 'social_issues', 'entertainment_advanced', 'sports_advanced',
    'food_culture', 'fashion', 'art', 'literature', 'science_basics',
    'health_advanced', 'finance_basics',
  ],
  B2: [
    'business_advanced', 'academic', 'legal', 'medical', 'technical',
    'creative_writing', 'debate', 'negotiation', 'presentation',
    'research', 'analysis', 'criticism', 'abstract_concepts',
    'philosophy', 'psychology', 'economics', 'sociology', 'history',
    'geography', 'anthropology',
  ],
  C1: [
    'academic_advanced', 'professional_specialized', 'literary_analysis',
    'scientific_research', 'philosophical_discussion', 'political_analysis',
    'economic_theory', 'cultural_criticism', 'artistic_interpretation',
    'historical_analysis', 'linguistic_study', 'psychological_theory',
    'sociological_research', 'anthropological_study', 'geographical_analysis',
    'environmental_science', 'technology_advanced', 'medical_specialized',
    'legal_advanced', 'business_strategy',
  ],
  C2: [
    'native_level_conversation', 'academic_writing', 'literary_creation',
    'professional_expertise', 'cultural_mastery', 'linguistic_expertise',
    'philosophical_mastery', 'scientific_expertise', 'artistic_mastery',
    'historical_expertise', 'political_mastery', 'economic_expertise',
    'social_theory', 'psychological_expertise', 'anthropological_mastery',
    'geographical_expertise', 'environmental_expertise', 'technological_mastery',
    'medical_expertise', 'legal_mastery',
  ],
};

// Exercise types by CEFR level
export const EXERCISE_TYPES_BY_LEVEL = {
  A1: ['flashcard', 'multiple_choice', 'fill_blank', 'matching', 'listening'],
  A2: ['flashcard', 'multiple_choice', 'fill_blank', 'matching', 'listening', 'speaking', 'reading'],
  B1: ['flashcard', 'multiple_choice', 'fill_blank', 'matching', 'listening', 'speaking', 'reading', 'writing', 'dialogue', 'conversation'],
  B2: ['flashcard', 'multiple_choice', 'fill_blank', 'matching', 'listening', 'speaking', 'reading', 'writing', 'dialogue', 'conversation', 'comprehension', 'wordOrder'],
  C1: ['flashcard', 'multiple_choice', 'fill_blank', 'matching', 'listening', 'speaking', 'reading', 'writing', 'dialogue', 'conversation', 'comprehension', 'wordOrder', 'conjugation', 'translation'],
  C2: ['flashcard', 'multiple_choice', 'fill_blank', 'matching', 'listening', 'speaking', 'reading', 'writing', 'dialogue', 'conversation', 'comprehension', 'wordOrder', 'conjugation', 'translation', 'dragDrop'],
};

// Grammar concepts by CEFR level
export const GRAMMAR_CONCEPTS_BY_LEVEL = {
  A1: [
    'basic_pronouns', 'present_tense', 'basic_articles', 'simple_questions',
    'basic_adjectives', 'numbers', 'basic_prepositions', 'simple_negation',
  ],
  A2: [
    'past_tense', 'future_tense', 'comparative_adjectives', 'adverbs',
    'modal_verbs', 'imperative', 'possessive_pronouns', 'demonstratives',
  ],
  B1: [
    'perfect_tenses', 'conditional', 'subjunctive_basic', 'relative_clauses',
    'passive_voice', 'gerunds', 'infinitives', 'complex_prepositions',
  ],
  B2: [
    'subjunctive_advanced', 'participles', 'complex_sentences', 'reported_speech',
    'inversion', 'emphasis', 'ellipsis', 'complex_modals',
  ],
  C1: [
    'advanced_subjunctive', 'complex_conditionals', 'literary_structures',
    'academic_style', 'rhetorical_devices', 'nuanced_expressions',
    'idiomatic_structures', 'advanced_ellipsis',
  ],
  C2: [
    'native_level_grammar', 'literary_grammar', 'academic_grammar',
    'professional_grammar', 'creative_grammar', 'technical_grammar',
    'formal_grammar', 'informal_grammar',
  ],
};

// Skill categories
export const SKILL_CATEGORIES: SkillCategory[] = [
  'vocabulary', 'grammar', 'listening', 'speaking', 'reading', 'writing',
  'pronunciation', 'conversation', 'culture', 'business', 'academic',
];

// Lesson types
export const LESSON_TYPES: LessonType[] = [
  'vocabulary', 'grammar', 'conversation', 'listening', 'reading', 'writing',
  'pronunciation', 'culture', 'business', 'academic', 'survival',
];

export class ComprehensiveLessonGenerator {
  private targetLanguage: string;
  private mainLanguage: string;
  private currentLevel: CEFRLevel;
  private userPreferences: any;

  constructor(
    targetLanguage: string,
    mainLanguage: string,
    currentLevel: CEFRLevel = 'A1',
    userPreferences: any = {},
  ) {
    this.targetLanguage = targetLanguage;
    this.mainLanguage = mainLanguage;
    this.currentLevel = currentLevel;
    this.userPreferences = userPreferences;
  }

  // Generate vocabulary items for a lesson
  private generateVocabularyItems(
    theme: string,
    lessonNumber: number,
    level: CEFRLevel,
  ): VocabularyItem[] {
    const words: VocabularyItem[] = [];
    
    // This would integrate with a vocabulary database or AI service
    // For now, we'll create placeholder vocabulary items
    for (let i = 0; i < WORDS_PER_LESSON; i++) {
      const wordId = `${level}_${theme}_${lessonNumber}_word_${i + 1}`;
      
      words.push({
        id: wordId,
        word: `[${this.targetLanguage.toUpperCase()}] ${theme}_word_${i + 1}`,
        translation: `[${this.mainLanguage.toUpperCase()}] ${theme}_translation_${i + 1}`,
        phonetic: `[IPA] ${theme}_phonetic_${i + 1}`,
        partOfSpeech: this.getRandomPartOfSpeech(),
        difficulty: this.calculateDifficulty(level, i),
        frequency: this.calculateFrequency(level, i),
        imageUrl: `https://images.unsplash.com/photo-${Math.random().toString(36).substring(2, 15)}?w=400&h=300&fit=crop`,
        audioUrl: `https://api.elevenlabs.io/v1/text-to-speech/${wordId}`,
        exampleSentences: this.generateExampleSentences(theme, i),
        tags: [theme, level.toLowerCase(), `lesson_${lessonNumber}`],
        cefrLevel: level,
        pronunciation: `[IPA] ${theme}_phonetic_${i + 1}`,
        mastered: false,
      });
    }

    return words;
  }

  // Generate exercises for a lesson
  private generateExercises(
    vocabulary: VocabularyItem[],
    theme: string,
    lessonNumber: number,
    level: CEFRLevel,
  ): MultilingualExercise[] {
    const exercises: MultilingualExercise[] = [];
    const exerciseTypes = EXERCISE_TYPES_BY_LEVEL[level];
    
    // Generate exercises for each vocabulary item
    vocabulary.forEach((word, index) => {
      const exerciseTypesForWord = this.selectExerciseTypes(exerciseTypes as ExerciseType[], index);
      
      exerciseTypesForWord.forEach((exerciseType, exerciseIndex) => {
        const exercise = this.createExercise(
          word,
          exerciseType,
          theme,
          lessonNumber,
          level,
          exerciseIndex,
        );
        exercises.push(exercise);
      });
    });

    // Add mini-dialogue exercise
    exercises.push(this.createMiniDialogue(vocabulary, theme, lessonNumber, level));

    return exercises;
  }

  // Create a single exercise
  private createExercise(
    vocabulary: VocabularyItem,
    exerciseType: ExerciseType,
    theme: string,
    lessonNumber: number,
    level: CEFRLevel,
    exerciseIndex: number,
  ): MultilingualExercise {
    const exerciseId = `${level}_${theme}_${lessonNumber}_${exerciseType}_${exerciseIndex}`;
    
    const baseExercise: MultilingualExercise = {
      id: exerciseId,
      type: exerciseType,
      instruction: this.createMultilingualContent({
        en: `Complete the ${exerciseType} exercise`,
        [this.mainLanguage]: `Complete the ${exerciseType} exercise`,
      }),
      question: this.createMultilingualContent({
        en: `Practice: ${vocabulary.word}`,
        [this.mainLanguage]: `Practice: ${vocabulary.word}`,
      }),
      correctAnswer: vocabulary.translation,
      difficulty: vocabulary.difficulty,
      xpReward: this.calculateXPReward(level, exerciseType),
      timeLimit: this.calculateTimeLimit(level, exerciseType),
      targetLanguage: this.targetLanguage,
      mainLanguage: this.mainLanguage,
      vocabularyItems: [vocabulary.id],
      skills: this.getSkillsForExerciseType(exerciseType),
    };

    // Add exercise-specific content
    switch (exerciseType) {
      case 'flashcard':
        return this.createFlashcardExercise(baseExercise, vocabulary);
      case 'multiple_choice':
        return this.createMultipleChoiceExercise(baseExercise, vocabulary);
      case 'fill_blank':
        return this.createFillBlankExercise(baseExercise, vocabulary);
      case 'listening':
        return this.createListeningExercise(baseExercise, vocabulary);
      case 'speaking':
        return this.createSpeakingExercise(baseExercise, vocabulary);
      case 'matching':
        return this.createMatchingExercise(baseExercise, vocabulary);
      default:
        return baseExercise;
    }
  }

  // Create mini-dialogue exercise
  private createMiniDialogue(
    vocabulary: VocabularyItem[],
    theme: string,
    lessonNumber: number,
    level: CEFRLevel,
  ): MultilingualExercise {
    const dialogueId = `${level}_${theme}_${lessonNumber}_dialogue`;
    
    return {
      id: dialogueId,
      type: 'dialogue',
      instruction: this.createMultilingualContent({
        en: 'Practice this conversation using the new vocabulary',
        [this.mainLanguage]: 'Practice this conversation using the new vocabulary',
      }),
      question: this.createMultilingualContent({
        en: 'Complete the dialogue',
        [this.mainLanguage]: 'Complete the dialogue',
      }),
      correctAnswer: 'dialogue_completion',
      difficulty: this.calculateDifficulty(level, 0) + 1,
      xpReward: this.calculateXPReward(level, 'dialogue'),
      timeLimit: 120,
      targetLanguage: this.targetLanguage,
      mainLanguage: this.mainLanguage,
      vocabularyItems: vocabulary.map(v => v.id),
      skills: ['conversation', 'speaking', 'listening'],
      gameContent: {
        type: 'conversation',
        scenario: this.createMultilingualContent({
          en: `Practice conversation about ${theme}`,
          [this.mainLanguage]: `Practice conversation about ${theme}`,
        }),
        dialogue: this.generateDialogueContent(vocabulary, theme),
        objectives: [
          this.createMultilingualContent({
            en: 'Use all new vocabulary words',
            [this.mainLanguage]: 'Use all new vocabulary words',
          }),
        ],
        vocabulary: vocabulary.map(v => v.id),
      },
    };
  }

  // Generate a complete lesson
  public generateLesson(
    theme: string,
    lessonNumber: number,
    level: CEFRLevel,
  ): MultilingualLesson {
    const lessonId = `${level}_${theme}_${lessonNumber}`;
    const vocabulary = this.generateVocabularyItems(theme, lessonNumber, level);
    const exercises = this.generateExercises(vocabulary, theme, lessonNumber, level);

    return {
      id: lessonId,
      title: this.createMultilingualContent({
        en: `${this.capitalizeFirst(theme.replace('_', ' '))} - Lesson ${lessonNumber}`,
        [this.mainLanguage]: `${this.capitalizeFirst(theme.replace('_', ' '))} - Lesson ${lessonNumber}`,
      }),
      type: this.determineLessonType(theme),
      completed: false,
      exercises,
      xpReward: this.calculateLessonXPReward(level, exercises.length),
      difficulty: this.calculateLessonDifficulty(level, vocabulary),
      estimatedTime: this.calculateEstimatedTime(level, exercises.length),
      description: this.createMultilingualContent({
        en: `Learn ${WORDS_PER_LESSON} new words about ${theme.replace('_', ' ')}`,
        [this.mainLanguage]: `Learn ${WORDS_PER_LESSON} new words about ${theme.replace('_', ' ')}`,
      }),
      targetLanguage: this.targetLanguage,
      mainLanguage: this.mainLanguage,
      vocabularyIntroduced: vocabulary,
      vocabularyReviewed: [],
      grammarConcepts: this.getGrammarConceptsForTheme(theme, level),
      learningObjectives: this.generateLearningObjectives(theme, level),
      completionCriteria: {
        minimumAccuracy: this.getMinimumAccuracy(level),
        requiredExercises: exercises.map(e => e.id),
      },
    };
  }

  // Generate a complete module
  public generateModule(
    level: CEFRLevel,
    moduleNumber: number,
    themes: string[],
  ): LessonModule {
    const moduleId = `${level}_module_${moduleNumber}`;
    const lessons: MultilingualLesson[] = [];
    const skills: MultilingualSkill[] = [];

    // Generate lessons for each theme
    themes.forEach((theme, themeIndex) => {
      const lesson = this.generateLesson(theme, moduleNumber, level);
      lessons.push(lesson);
    });

    // Generate skills based on themes
    themes.forEach((theme, themeIndex) => {
      const skill = this.generateSkill(theme, level, moduleNumber, themeIndex);
      skills.push(skill);
    });

    return {
      id: moduleId,
      title: this.createMultilingualContent({
        en: `${level} Module ${moduleNumber}`,
        [this.mainLanguage]: `${level} Module ${moduleNumber}`,
      }),
      description: this.createMultilingualContent({
        en: `Complete ${level} level module with ${themes.length} lessons`,
        [this.mainLanguage]: `Complete ${level} level module with ${themes.length} lessons`,
      }),
      skills,
      cefrLevel: level,
      targetLanguage: this.targetLanguage,
      mainLanguage: this.mainLanguage,
      moduleNumber,
      totalModules: Math.ceil(LESSONS_PER_LEVEL[level] / themes.length),
      vocabularyTarget: {
        newWords: themes.length * WORDS_PER_LESSON,
        reviewWords: Math.floor(themes.length * WORDS_PER_LESSON * 0.3),
        totalWords: themes.length * WORDS_PER_LESSON + Math.floor(themes.length * WORDS_PER_LESSON * 0.3),
      },
      grammarConcepts: this.getGrammarConceptsForLevel(level),
      unlockRequirement: {
        previousModuleId: moduleNumber > 1 ? `${level}_module_${moduleNumber - 1}` : undefined,
        minimumXP: this.calculateRequiredXP(level, moduleNumber),
        minimumAccuracy: this.getMinimumAccuracy(level),
      },
      estimatedHours: this.calculateModuleHours(level, themes.length),
    };
  }

  // Generate a complete language course
  public generateLanguageCourse(): LanguageCourse {
    const modules: LessonModule[] = [];
    const allLevels: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

    allLevels.forEach(level => {
      const themes = LESSON_THEMES[level];
      const lessonsPerModule = Math.ceil(themes.length / 10); // 10 modules per level
      
      for (let moduleIndex = 0; moduleIndex < 10; moduleIndex++) {
        const startIndex = moduleIndex * lessonsPerModule;
        const endIndex = Math.min(startIndex + lessonsPerModule, themes.length);
        const moduleThemes = themes.slice(startIndex, endIndex);
        
        if (moduleThemes.length > 0) {
          const module = this.generateModule(level, moduleIndex + 1, moduleThemes);
          modules.push(module);
        }
      }
    });

    return {
      targetLanguage: this.targetLanguage,
      mainLanguage: this.mainLanguage,
      modules,
      totalLessons: modules.reduce((total, module) => total + module.skills.length, 0),
      estimatedHours: modules.reduce((total, module) => total + module.estimatedHours, 0),
      description: this.createMultilingualContent({
        en: `Complete ${this.targetLanguage} course from A1 to C2`,
        [this.mainLanguage]: `Complete ${this.targetLanguage} course from A1 to C2`,
      }),
      vocabularyProgression: this.generateVocabularyProgression(),
      grammarProgression: this.generateGrammarProgression(),
    };
  }

  // Helper methods
  private createMultilingualContent(content: { [key: string]: string }): MultilingualContent {
    return content;
  }

  private capitalizeFirst(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  private getRandomPartOfSpeech(): 'noun' | 'verb' | 'adjective' | 'adverb' | 'preposition' | 'conjunction' | 'interjection' | 'pronoun' {
    const parts = ['noun', 'verb', 'adjective', 'adverb', 'preposition', 'conjunction', 'interjection', 'pronoun'];
    return parts[Math.floor(Math.random() * parts.length)] as any;
  }

  private calculateDifficulty(level: CEFRLevel, index: number): number {
    const baseDifficulty = {
      A1: 1, A2: 2, B1: 3, B2: 4, C1: 5, C2: 6,
    }[level];
    return Math.min(10, baseDifficulty + Math.floor(index / 3));
  }

  private calculateFrequency(level: CEFRLevel, index: number): number {
    const baseFrequency = {
      A1: 9, A2: 8, B1: 7, B2: 6, C1: 5, C2: 4,
    }[level];
    return Math.max(1, baseFrequency - Math.floor(index / 2));
  }

  private generateExampleSentences(theme: string, index: number): { original: string; translation: string; audioUrl?: string }[] {
    return [
      {
        original: `[${this.targetLanguage.toUpperCase()}] Example sentence ${index + 1} for ${theme}`,
        translation: `[${this.mainLanguage.toUpperCase()}] Example translation ${index + 1} for ${theme}`,
        audioUrl: `https://api.elevenlabs.io/v1/text-to-speech/example_${index + 1}`,
      },
    ];
  }

  private selectExerciseTypes(availableTypes: ExerciseType[], index: number): ExerciseType[] {
    // Select 2-3 exercise types per vocabulary item
    const numExercises = Math.min(3, Math.max(2, Math.floor(Math.random() * 2) + 2));
    const shuffled = [...availableTypes].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, numExercises);
  }

  private calculateXPReward(level: CEFRLevel, exerciseType: ExerciseType): number {
    const baseXP = {
      A1: 10, A2: 15, B1: 20, B2: 25, C1: 30, C2: 35,
    }[level];
    
    const exerciseMultiplier = {
      flashcard: 1,
      multiple_choice: 1.2,
      multipleChoice: 1.2,
      fill_blank: 1.3,
      fillBlank: 1.3,
      listening: 1.4,
      speaking: 1.5,
      dialogue: 1.6,
      conversation: 1.7,
      cloze: 1.4,
      matching: 1.2,
      match: 1.2,
      match_pairs: 1.3,
      reading: 1.3,
      writing: 1.5,
      comprehension: 1.4,
      wordOrder: 1.3,
      conjugation: 1.4,
      translation: 1.3,
      translate: 1.3,
      dragDrop: 1.3,
      dictation: 1.6,
      pronunciation: 1.5,
      survival_scenario: 1.8,
    }[exerciseType] || 1;

    return Math.round(baseXP * exerciseMultiplier);
  }

  private calculateTimeLimit(level: CEFRLevel, exerciseType: ExerciseType): number {
    const baseTime = {
      A1: 30, A2: 25, B1: 20, B2: 18, C1: 15, C2: 12,
    }[level];
    
    const exerciseMultiplier = {
      flashcard: 1,
      multiple_choice: 1.2,
      multipleChoice: 1.2,
      fill_blank: 1.3,
      fillBlank: 1.3,
      listening: 1.5,
      speaking: 2,
      dialogue: 1.8,
      conversation: 2.2,
      cloze: 1.4,
      matching: 1.2,
      match: 1.2,
      match_pairs: 1.3,
      reading: 1.3,
      writing: 1.5,
      comprehension: 1.4,
      wordOrder: 1.3,
      conjugation: 1.4,
      translation: 1.3,
      translate: 1.3,
      dragDrop: 1.3,
      dictation: 1.6,
      pronunciation: 1.5,
      survival_scenario: 1.8,
    }[exerciseType] || 1;

    return Math.round(baseTime * exerciseMultiplier);
  }

  private getSkillsForExerciseType(exerciseType: ExerciseType): string[] {
    const skillMap: { [key in ExerciseType]: string[] } = {
      flashcard: ['vocabulary'],
      multiple_choice: ['vocabulary', 'reading'],
      multipleChoice: ['vocabulary', 'reading'],
      fill_blank: ['vocabulary', 'grammar'],
      fillBlank: ['vocabulary', 'grammar'],
      listening: ['listening'],
      speaking: ['speaking', 'pronunciation'],
      dialogue: ['conversation', 'speaking', 'listening'],
      conversation: ['conversation', 'speaking', 'listening'],
      cloze: ['vocabulary', 'grammar'],
      matching: ['vocabulary'],
      match: ['vocabulary'],
      match_pairs: ['vocabulary', 'reading'],
      reading: ['reading'],
      writing: ['writing'],
      comprehension: ['reading', 'listening'],
      wordOrder: ['grammar'],
      conjugation: ['grammar'],
      translate: ['vocabulary', 'grammar'],
      dragDrop: ['vocabulary', 'grammar'],
      dictation: ['listening', 'writing'],
      pronunciation: ['speaking', 'pronunciation'],
      survival_scenario: ['conversation', 'vocabulary'],
    };
    return skillMap[exerciseType] || ['vocabulary'];
  }

  private generateDialogueContent(vocabulary: VocabularyItem[], theme: string): any[] {
    // Generate dialogue content using vocabulary words
    return [
      {
        speaker: 'npc',
        text: `[${this.targetLanguage.toUpperCase()}] Dialogue using ${vocabulary[0]?.word}`,
        translation: `[${this.mainLanguage.toUpperCase()}] Dialogue translation`,
        audioUrl: 'https://api.elevenlabs.io/v1/text-to-speech/dialogue_1',
      },
      {
        speaker: 'user',
        text: '',
        options: vocabulary.slice(0, 3).map(v => ({
          text: v.word,
          isCorrect: true,
          feedback: `Good! You used "${v.word}" correctly.`,
        })),
      },
    ];
  }

  private determineLessonType(theme: string): LessonType {
    if (theme.includes('business')) return 'business';
    if (theme.includes('academic')) return 'academic';
    if (theme.includes('culture')) return 'culture';
    if (theme.includes('survival')) return 'survival';
    if (theme.includes('conversation')) return 'conversation';
    return 'vocabulary';
  }

  private calculateLessonXPReward(level: CEFRLevel, exerciseCount: number): number {
    const baseXP = {
      A1: 100, A2: 150, B1: 200, B2: 250, C1: 300, C2: 350,
    }[level];
    return baseXP + (exerciseCount * 10);
  }

  private calculateLessonDifficulty(level: CEFRLevel, vocabulary: VocabularyItem[]): number {
    const avgDifficulty = vocabulary.reduce((sum, v) => sum + v.difficulty, 0) / vocabulary.length;
    return Math.round(avgDifficulty);
  }

  private calculateEstimatedTime(level: CEFRLevel, exerciseCount: number): number {
    const baseTime = {
      A1: 5, A2: 4, B1: 3.5, B2: 3, C1: 2.5, C2: 2,
    }[level];
    return Math.round(baseTime * exerciseCount);
  }

  private getGrammarConceptsForTheme(theme: string, level: CEFRLevel): GrammarConcept[] {
    const concepts = GRAMMAR_CONCEPTS_BY_LEVEL[level];
    const selectedConcepts = concepts.slice(0, Math.floor(Math.random() * 3) + 1);
    
    return selectedConcepts.map(concept => ({
      id: `${level}_${concept}`,
      title: this.createMultilingualContent({
        en: concept.replace('_', ' '),
        [this.mainLanguage]: concept.replace('_', ' '),
      }),
      description: this.createMultilingualContent({
        en: `Grammar concept: ${concept}`,
        [this.mainLanguage]: `Grammar concept: ${concept}`,
      }),
      examples: [],
      difficulty: this.calculateDifficulty(level, 0),
      cefrLevel: level,
      category: 'other',
    }));
  }

  private generateLearningObjectives(theme: string, level: CEFRLevel): MultilingualContent[] {
    return [
      this.createMultilingualContent({
        en: `Learn ${WORDS_PER_LESSON} new vocabulary words about ${theme}`,
        [this.mainLanguage]: `Learn ${WORDS_PER_LESSON} new vocabulary words about ${theme}`,
      }),
      this.createMultilingualContent({
        en: 'Practice using new words in context',
        [this.mainLanguage]: 'Practice using new words in context',
      }),
      this.createMultilingualContent({
        en: 'Improve listening and speaking skills',
        [this.mainLanguage]: 'Improve listening and speaking skills',
      }),
    ];
  }

  private getMinimumAccuracy(level: CEFRLevel): number {
    return {
      A1: 70, A2: 75, B1: 80, B2: 85, C1: 90, C2: 95,
    }[level];
  }

  private generateSkill(theme: string, level: CEFRLevel, moduleNumber: number, themeIndex: number): MultilingualSkill {
    const skillId = `${level}_${theme}_skill`;
    
    return {
      id: skillId,
      title: this.createMultilingualContent({
        en: this.capitalizeFirst(theme.replace('_', ' ')),
        [this.mainLanguage]: this.capitalizeFirst(theme.replace('_', ' ')),
      }),
      icon: '📚',
      level: moduleNumber,
      totalLevels: 10,
      lessons: [],
      locked: moduleNumber > 1,
      color: this.getSkillColor(themeIndex),
      cefrLevel: level,
      category: this.getSkillCategory(theme),
      xpRequired: this.calculateRequiredXP(level, moduleNumber),
      description: this.createMultilingualContent({
        en: `Master ${theme} vocabulary and expressions`,
        [this.mainLanguage]: `Master ${theme} vocabulary and expressions`,
      }),
      targetLanguage: this.targetLanguage,
      mainLanguage: this.mainLanguage,
      vocabularyCount: WORDS_PER_LESSON,
      estimatedCompletionTime: 5,
      prerequisites: moduleNumber > 1 ? [`${level}_module_${moduleNumber - 1}`] : [],
    };
  }

  private getSkillColor(index: number): string {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'];
    return colors[index % colors.length];
  }

  private getSkillCategory(theme: string): SkillCategory {
    if (theme.includes('business')) return 'business';
    if (theme.includes('academic')) return 'academic';
    if (theme.includes('culture')) return 'culture';
    return 'vocabulary';
  }

  private getGrammarConceptsForLevel(level: CEFRLevel): string[] {
    return GRAMMAR_CONCEPTS_BY_LEVEL[level];
  }

  private calculateRequiredXP(level: CEFRLevel, moduleNumber: number): number {
    const baseXP = {
      A1: 0, A2: 1000, B1: 2500, B2: 5000, C1: 10000, C2: 20000,
    }[level];
    return baseXP + (moduleNumber - 1) * 500;
  }

  private calculateModuleHours(level: CEFRLevel, lessonCount: number): number {
    const baseHours = {
      A1: 0.5, A2: 0.4, B1: 0.35, B2: 0.3, C1: 0.25, C2: 0.2,
    }[level];
    return Math.round(baseHours * lessonCount * 10) / 10;
  }

  private generateVocabularyProgression(): any {
    const progression: any = {};
    Object.keys(CEFR_WORD_TARGETS).forEach(level => {
      progression[level] = {
        targetWords: CEFR_WORD_TARGETS[level as CEFRLevel],
        cumulativeWords: Object.keys(CEFR_WORD_TARGETS)
          .filter(l => l <= level)
          .reduce((sum, l) => sum + CEFR_WORD_TARGETS[l as CEFRLevel], 0),
        keyTopics: LESSON_THEMES[level as CEFRLevel],
      };
    });
    return progression;
  }

  private generateGrammarProgression(): any {
    const progression: any = {};
    Object.keys(GRAMMAR_CONCEPTS_BY_LEVEL).forEach(level => {
      progression[level] = GRAMMAR_CONCEPTS_BY_LEVEL[level as CEFRLevel];
    });
    return progression;
  }

  // Exercise creation methods (simplified for now)
  private createFlashcardExercise(base: MultilingualExercise, vocabulary: VocabularyItem): MultilingualExercise {
    return {
      ...base,
      options: [
        this.createMultilingualContent({ en: vocabulary.translation, [this.mainLanguage]: vocabulary.translation }),
        this.createMultilingualContent({ en: 'Option 2', [this.mainLanguage]: 'Option 2' }),
        this.createMultilingualContent({ en: 'Option 3', [this.mainLanguage]: 'Option 3' }),
        this.createMultilingualContent({ en: 'Option 4', [this.mainLanguage]: 'Option 4' }),
      ],
    };
  }

  private createMultipleChoiceExercise(base: MultilingualExercise, vocabulary: VocabularyItem): MultilingualExercise {
    return {
      ...base,
      options: [
        this.createMultilingualContent({ en: vocabulary.translation, [this.mainLanguage]: vocabulary.translation }),
        this.createMultilingualContent({ en: 'Option 2', [this.mainLanguage]: 'Option 2' }),
        this.createMultilingualContent({ en: 'Option 3', [this.mainLanguage]: 'Option 3' }),
        this.createMultilingualContent({ en: 'Option 4', [this.mainLanguage]: 'Option 4' }),
      ],
    };
  }

  private createFillBlankExercise(base: MultilingualExercise, vocabulary: VocabularyItem): MultilingualExercise {
    return {
      ...base,
      question: this.createMultilingualContent({
        en: 'Fill in the blank: "I like to ___"',
        [this.mainLanguage]: 'Fill in the blank: "I like to ___"',
      }),
    };
  }

  private createListeningExercise(base: MultilingualExercise, vocabulary: VocabularyItem): MultilingualExercise {
    return {
      ...base,
      audio: vocabulary.audioUrl,
    };
  }

  private createSpeakingExercise(base: MultilingualExercise, vocabulary: VocabularyItem): MultilingualExercise {
    return {
      ...base,
      audio: vocabulary.audioUrl,
    };
  }

  private createMatchingExercise(base: MultilingualExercise, vocabulary: VocabularyItem): MultilingualExercise {
    return {
      ...base,
      options: [
        this.createMultilingualContent({ en: vocabulary.translation, [this.mainLanguage]: vocabulary.translation }),
        this.createMultilingualContent({ en: 'Option 2', [this.mainLanguage]: 'Option 2' }),
        this.createMultilingualContent({ en: 'Option 3', [this.mainLanguage]: 'Option 3' }),
        this.createMultilingualContent({ en: 'Option 4', [this.mainLanguage]: 'Option 4' }),
      ],
    };
  }
}

// Export singleton instance
export const lessonGenerator = new ComprehensiveLessonGenerator('hr', 'en', 'A1');
