import { 
  LessonContentSchema, 
  MultilingualContent, 
  LessonModule, 
  LanguageCourse,
  CEFRLevel,
  ExerciseType,
  GameContent,
  MultilingualSkill,
  MultilingualLesson,
  MultilingualExercise,
} from '@/types';

// Multilingual Content Templates
export const createMultilingualContent = (
  content: Record<string, string>,
): MultilingualContent => content;

// CEFR Level Definitions and Requirements
export const cefrLevelDefinitions = {
  A1: {
    description: createMultilingualContent({
      en: 'Beginner - Can understand and use familiar everyday expressions',
      es: 'Principiante - Puede entender y usar expresiones cotidianas familiares',
      fr: 'Débutant - Peut comprendre et utiliser des expressions familières du quotidien',
      it: 'Principiante - Può capire e usare espressioni familiari di uso quotidiano',
      hr: 'Početnik - Može razumjeti i koristiti poznate svakodnevne izraze',
      zh: '初级 - 能理解并使用熟悉的日常表达',
    }),
    xpRequired: 0,
    estimatedHours: 80,
    modules: 8,
  },
  A2: {
    description: createMultilingualContent({
      en: 'Elementary - Can communicate in simple routine tasks',
      es: 'Elemental - Puede comunicarse en tareas rutinarias simples',
      fr: 'Élémentaire - Peut communiquer dans des tâches routinières simples',
      it: 'Elementare - Può comunicare in compiti di routine semplici',
      hr: 'Osnovni - Može komunicirati u jednostavnim rutinskim zadacima',
      zh: '初中级 - 能在简单的日常任务中进行交流',
    }),
    xpRequired: 500,
    estimatedHours: 120,
    modules: 10,
  },
  B1: {
    description: createMultilingualContent({
      en: 'Intermediate - Can deal with most situations while traveling',
      es: 'Intermedio - Puede lidiar con la mayoría de situaciones mientras viaja',
      fr: 'Intermédiaire - Peut faire face à la plupart des situations en voyage',
      it: 'Intermedio - Può gestire la maggior parte delle situazioni durante i viaggi',
      hr: 'Srednji - Može se nositi s većinom situacija tijekom putovanja',
      zh: '中级 - 能处理旅行中的大多数情况',
    }),
    xpRequired: 1200,
    estimatedHours: 180,
    modules: 12,
  },
  B2: {
    description: createMultilingualContent({
      en: 'Upper Intermediate - Can interact with fluency and spontaneity',
      es: 'Intermedio Alto - Puede interactuar con fluidez y espontaneidad',
      fr: 'Intermédiaire Supérieur - Peut interagir avec aisance et spontanéité',
      it: 'Intermedio Superiore - Può interagire con scioltezza e spontaneità',
      hr: 'Viši srednji - Može komunicirati tečno i spontano',
      zh: '中高级 - 能流利自然地进行交流',
    }),
    xpRequired: 2500,
    estimatedHours: 240,
    modules: 15,
  },
  C1: {
    description: createMultilingualContent({
      en: 'Advanced - Can express ideas fluently and spontaneously',
      es: 'Avanzado - Puede expresar ideas con fluidez y espontaneidad',
      fr: 'Avancé - Peut exprimer des idées couramment et spontanément',
      it: 'Avanzato - Può esprimere idee in modo fluente e spontaneo',
      hr: 'Napredni - Može izraziti ideje tečno i spontano',
      zh: '高级 - 能流利自然地表达想法',
    }),
    xpRequired: 4500,
    estimatedHours: 320,
    modules: 18,
  },
  C2: {
    description: createMultilingualContent({
      en: 'Proficient - Can understand virtually everything heard or read',
      es: 'Competente - Puede entender prácticamente todo lo que oye o lee',
      fr: 'Compétent - Peut comprendre pratiquement tout ce qui est entendu ou lu',
      it: 'Competente - Può capire praticamente tutto ciò che sente o legge',
      hr: 'Stručni - Može razumjeti praktički sve što čuje ili čita',
      zh: '精通级 - 能理解几乎所有听到或读到的内容',
    }),
    xpRequired: 7500,
    estimatedHours: 400,
    modules: 20,
  },
};

// Exercise Type Templates
export const exerciseTypeTemplates = {
  wordImageMatch: {
    instruction: createMultilingualContent({
      en: 'Match the words with the correct images',
      es: 'Empareja las palabras con las imágenes correctas',
      fr: 'Associez les mots aux bonnes images',
      it: 'Abbina le parole alle immagini corrette',
      hr: 'Spojite riječi s odgovarajućim slikama',
      zh: '将单词与正确的图片匹配',
    }),
    timeLimit: 60,
  },
  sentenceBuilding: {
    instruction: createMultilingualContent({
      en: 'Arrange the words to form a correct sentence',
      es: 'Ordena las palabras para formar una oración correcta',
      fr: 'Arrangez les mots pour former une phrase correcte',
      it: 'Disponi le parole per formare una frase corretta',
      hr: 'Poredajte riječi da biste formirali ispravnu rečenicu',
      zh: '排列单词组成正确的句子',
    }),
    timeLimit: 90,
  },
  fillBlank: {
    instruction: createMultilingualContent({
      en: 'Fill in the blanks with the correct words',
      es: 'Completa los espacios en blanco con las palabras correctas',
      fr: 'Remplissez les blancs avec les mots corrects',
      it: 'Riempi gli spazi vuoti con le parole corrette',
      hr: 'Popunite praznine s ispravnim riječima',
      zh: '用正确的单词填空',
    }),
    timeLimit: 75,
  },
  listeningChallenge: {
    instruction: createMultilingualContent({
      en: 'Listen carefully and answer the questions',
      es: 'Escucha atentamente y responde las preguntas',
      fr: 'Écoutez attentivement et répondez aux questions',
      it: 'Ascolta attentamente e rispondi alle domande',
      hr: 'Paželjivo slušajte i odgovorite na pitanja',
      zh: '仔细听并回答问题',
    }),
    timeLimit: 120,
  },
  speakingChallenge: {
    instruction: createMultilingualContent({
      en: 'Speak the phrase clearly and correctly',
      es: 'Pronuncia la frase clara y correctamente',
      fr: 'Prononcez la phrase clairement et correctement',
      it: 'Pronuncia la frase chiaramente e correttamente',
      hr: 'Izgovorite frazu jasno i ispravno',
      zh: '清楚正确地说出这个短语',
    }),
    timeLimit: 30,
  },
  flashcard: {
    instruction: createMultilingualContent({
      en: 'Review the flashcards and test your memory',
      es: 'Revisa las tarjetas y pon a prueba tu memoria',
      fr: 'Révisez les cartes mémoire et testez votre mémoire',
      it: 'Rivedi le flashcard e metti alla prova la tua memoria',
      hr: 'Pregledajte kartice i testirajte svoju memoriju',
      zh: '复习闪卡并测试你的记忆',
    }),
    timeLimit: 180,
  },
  adaptiveReview: {
    instruction: createMultilingualContent({
      en: 'Review items based on your learning progress',
      es: 'Revisa elementos basados en tu progreso de aprendizaje',
      fr: 'Révisez les éléments selon votre progression d\'apprentissage',
      it: 'Rivedi gli elementi in base ai tuoi progressi di apprendimento',
      hr: 'Pregledajte stavke na temelju vašeg napretka u učenju',
      zh: '根据你的学习进度复习项目',
    }),
    timeLimit: 300,
  },
};

// Skill Categories with Multilingual Support
export const skillCategories = {
  basics: {
    name: createMultilingualContent({
      en: 'Basics',
      es: 'Básicos',
      fr: 'Bases',
      it: 'Basi',
      hr: 'Osnove',
      zh: '基础',
    }),
    description: createMultilingualContent({
      en: 'Essential words and phrases for beginners',
      es: 'Palabras y frases esenciales para principiantes',
      fr: 'Mots et phrases essentiels pour débutants',
      it: 'Parole e frasi essenziali per principianti',
      hr: 'Osnovne riječi i fraze za početnike',
      zh: '初学者必备的单词和短语',
    }),
    color: '#58CC02',
  },
  grammar: {
    name: createMultilingualContent({
      en: 'Grammar',
      es: 'Gramática',
      fr: 'Grammaire',
      it: 'Grammatica',
      hr: 'Gramatika',
      zh: '语法',
    }),
    description: createMultilingualContent({
      en: 'Learn the rules and structure of the language',
      es: 'Aprende las reglas y estructura del idioma',
      fr: 'Apprenez les règles et la structure de la langue',
      it: 'Impara le regole e la struttura della lingua',
      hr: 'Naučite pravila i strukturu jezika',
      zh: '学习语言的规则和结构',
    }),
    color: '#1CB0F6',
  },
  vocabulary: {
    name: createMultilingualContent({
      en: 'Vocabulary',
      es: 'Vocabulario',
      fr: 'Vocabulaire',
      it: 'Vocabolario',
      hr: 'Rječnik',
      zh: '词汇',
    }),
    description: createMultilingualContent({
      en: 'Expand your word knowledge',
      es: 'Amplía tu conocimiento de palabras',
      fr: 'Élargissez vos connaissances de mots',
      it: 'Espandi la tua conoscenza delle parole',
      hr: 'Proširite svoje znanje riječi',
      zh: '扩展你的词汇知识',
    }),
    color: '#FF4B4B',
  },
  conversation: {
    name: createMultilingualContent({
      en: 'Conversation',
      es: 'Conversación',
      fr: 'Conversation',
      it: 'Conversazione',
      hr: 'Razgovor',
      zh: '对话',
    }),
    description: createMultilingualContent({
      en: 'Practice real-world conversations',
      es: 'Practica conversaciones del mundo real',
      fr: 'Pratiquez des conversations du monde réel',
      it: 'Pratica conversazioni del mondo reale',
      hr: 'Vježbajte razgovore iz stvarnog svijeta',
      zh: '练习真实世界的对话',
    }),
    color: '#FF9600',
  },
  culture: {
    name: createMultilingualContent({
      en: 'Culture',
      es: 'Cultura',
      fr: 'Culture',
      it: 'Cultura',
      hr: 'Kultura',
      zh: '文化',
    }),
    description: createMultilingualContent({
      en: 'Learn about customs and traditions',
      es: 'Aprende sobre costumbres y tradiciones',
      fr: 'Apprenez les coutumes et traditions',
      it: 'Impara su costumi e tradizioni',
      hr: 'Naučite o običajima i tradicijama',
      zh: '了解习俗和传统',
    }),
    color: '#CE82FF',
  },
  business: {
    name: createMultilingualContent({
      en: 'Business',
      es: 'Negocios',
      fr: 'Affaires',
      it: 'Affari',
      hr: 'Poslovanje',
      zh: '商务',
    }),
    description: createMultilingualContent({
      en: 'Professional language for work environments',
      es: 'Lenguaje profesional para entornos de trabajo',
      fr: 'Langage professionnel pour les environnements de travail',
      it: 'Linguaggio professionale per ambienti di lavoro',
      hr: 'Profesionalni jezik za radna okruženja',
      zh: '工作环境中的专业语言',
    }),
    color: '#00CD9C',
  },
  travel: {
    name: createMultilingualContent({
      en: 'Travel',
      es: 'Viajes',
      fr: 'Voyage',
      it: 'Viaggi',
      hr: 'Putovanja',
      zh: '旅行',
    }),
    description: createMultilingualContent({
      en: 'Essential phrases for travelers',
      es: 'Frases esenciales para viajeros',
      fr: 'Phrases essentielles pour les voyageurs',
      it: 'Frasi essenziali per i viaggiatori',
      hr: 'Osnovne fraze za putnike',
      zh: '旅行者必备短语',
    }),
    color: '#FFC800',
  },
};

// Lesson Content Schema Factory
export const createLessonContentSchema = (
  lessonId: string,
  mainLanguage: string,
  targetLanguage: string,
  level: CEFRLevel,
  module: number,
  lesson: number,
  exerciseType: ExerciseType,
  content: {
    instruction: MultilingualContent;
    question: MultilingualContent;
    options?: MultilingualContent[];
    correctAnswer: string | string[];
    explanation: MultilingualContent;
    hints?: MultilingualContent[];
  },
  gameContent?: GameContent,
  metadata?: {
    difficulty?: number;
    xpReward?: number;
    estimatedTime?: number;
    skills?: string[];
    topics?: string[];
  },
): LessonContentSchema => {
  return {
    lessonId,
    mainLanguage,
    targetLanguage,
    level,
    module,
    lesson,
    exerciseType,
    content,
    gameContent,
    media: {
      images: [],
      audio: [],
      video: [],
    },
    metadata: {
      difficulty: metadata?.difficulty || 1,
      xpReward: metadata?.xpReward || 10,
      estimatedTime: metadata?.estimatedTime || 60,
      skills: metadata?.skills || [],
      topics: metadata?.topics || [],
      vocabularyIds: [],
      grammarIds: [],
      prerequisites: [],
    },
    adaptiveSettings: {
      minAccuracy: 0.7,
      maxAttempts: 3,
      timeLimit: metadata?.estimatedTime || 60,
      hintsAllowed: 2,
    },
  };
};

// Module Structure Template
export const createLessonModule = (
  id: string,
  title: MultilingualContent,
  description: MultilingualContent,
  skills: MultilingualSkill[],
  cefrLevel: CEFRLevel,
  targetLanguage: string,
  mainLanguage: string,
  moduleNumber: number,
  totalModules: number,
  unlockRequirement: {
    previousModuleId?: string;
    minimumXP?: number;
    completedSkills?: string[];
  } = {},
): LessonModule => {
  return {
    id,
    title,
    description,
    skills,
    cefrLevel,
    targetLanguage,
    mainLanguage,
    moduleNumber,
    totalModules,
    unlockRequirement,
    vocabularyTarget: {
      newWords: skills.reduce((total, skill) => total + skill.vocabularyCount, 0),
      reviewWords: 0,
      totalWords: skills.reduce((total, skill) => total + skill.vocabularyCount, 0),
    },
    grammarConcepts: [],
    estimatedHours: skills.reduce((total, skill) => total + skill.estimatedCompletionTime / 60, 0),
  };
};

// Language Course Factory
export const createLanguageCourse = (
  targetLanguage: string,
  mainLanguage: string,
  modules: LessonModule[],
  description: MultilingualContent,
): LanguageCourse => {
  const totalLessons = modules.reduce((total, module) => {
    return total + module.skills.reduce((skillTotal, skill) => {
      return skillTotal + skill.lessons.length;
    }, 0);
  }, 0);

  const estimatedHours = modules.reduce((total, module) => {
    const levelDef = cefrLevelDefinitions[module.cefrLevel];
    return total + levelDef.estimatedHours;
  }, 0);

  return {
    targetLanguage,
    mainLanguage,
    modules,
    totalLessons,
    estimatedHours,
    description,
    vocabularyProgression: {
      A1: { targetWords: 500, cumulativeWords: 500, keyTopics: ['basics', 'greetings', 'numbers'] },
      A2: { targetWords: 1000, cumulativeWords: 1500, keyTopics: ['family', 'food', 'travel'] },
      B1: { targetWords: 2000, cumulativeWords: 3500, keyTopics: ['work', 'hobbies', 'culture'] },
      B2: { targetWords: 4000, cumulativeWords: 7500, keyTopics: ['politics', 'science', 'literature'] },
      C1: { targetWords: 8000, cumulativeWords: 15500, keyTopics: ['academic', 'professional', 'abstract'] },
      C2: { targetWords: 16000, cumulativeWords: 31500, keyTopics: ['native', 'idiomatic', 'specialized'] },
    },
    grammarProgression: {
      A1: ['basic_pronouns', 'present_simple', 'articles'],
      A2: ['past_simple', 'future_will', 'comparatives'],
      B1: ['present_perfect', 'conditionals', 'passive'],
      B2: ['past_perfect', 'subjunctive', 'complex_sentences'],
      C1: ['advanced_conditionals', 'inversion', 'academic_style'],
      C2: ['idiomatic_expressions', 'literary_style', 'specialized_grammar'],
    },
  };
};

// Helper Functions for Content Generation
export const generateExerciseId = (
  targetLang: string,
  level: CEFRLevel,
  module: number,
  skill: number,
  lesson: number,
  exercise: number,
): string => {
  return `${targetLang}_${level.toLowerCase()}_m${module}_s${skill}_l${lesson}_ex${exercise}`;
};

export const generateLessonId = (
  targetLang: string,
  level: CEFRLevel,
  module: number,
  skill: number,
  lesson: number,
): string => {
  return `${targetLang}_${level.toLowerCase()}_m${module}_s${skill}_l${lesson}`;
};

export const generateSkillId = (
  targetLang: string,
  level: CEFRLevel,
  module: number,
  skill: number,
): string => {
  return `${targetLang}_${level.toLowerCase()}_m${module}_s${skill}`;
};

export const generateModuleId = (
  targetLang: string,
  level: CEFRLevel,
  module: number,
): string => {
  return `${targetLang}_${level.toLowerCase()}_m${module}`;
};

// Content Validation Functions
export const validateMultilingualContent = (
  content: MultilingualContent,
  requiredLanguages: string[],
): boolean => {
  return requiredLanguages.every(lang => 
    content[lang] && content[lang].trim().length > 0,
  );
};

export const validateLessonContentSchema = (
  schema: LessonContentSchema,
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!schema.lessonId) errors.push('Lesson ID is required');
  if (!schema.mainLanguage) errors.push('Main language is required');
  if (!schema.targetLanguage) errors.push('Target language is required');
  if (!schema.level) errors.push('CEFR level is required');
  
  const requiredLanguages = [schema.mainLanguage, schema.targetLanguage];
  
  if (!validateMultilingualContent(schema.content.instruction, requiredLanguages)) {
    errors.push('Instruction must be provided in both main and target languages');
  }
  
  if (!validateMultilingualContent(schema.content.question, requiredLanguages)) {
    errors.push('Question must be provided in both main and target languages');
  }
  
  if (!validateMultilingualContent(schema.content.explanation, requiredLanguages)) {
    errors.push('Explanation must be provided in both main and target languages');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Sample Lesson Framework Structure (JSON Schema)
export const lessonFrameworkSchema = {
  '$schema': 'http://json-schema.org/draft-07/schema#',
  'title': 'Multilingual Lesson Framework',
  'type': 'object',
  'properties': {
    'lessonId': {
      'type': 'string',
      'pattern': '^[a-z]{2}_[a-z][0-9]_m[0-9]+_s[0-9]+_l[0-9]+$',
    },
    'mainLanguage': {
      'type': 'string',
      'enum': ['en', 'es', 'fr', 'it', 'hr', 'zh'],
    },
    'targetLanguage': {
      'type': 'string',
      'enum': ['en', 'es', 'fr', 'it', 'hr', 'zh'],
    },
    'level': {
      'type': 'string',
      'enum': ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'],
    },
    'module': {
      'type': 'integer',
      'minimum': 1,
    },
    'lesson': {
      'type': 'integer',
      'minimum': 1,
    },
    'exerciseType': {
      'type': 'string',
      'enum': ['match', 'translate', 'fillBlank', 'multipleChoice', 'listening', 'speaking', 'reading', 'writing', 'dragDrop', 'pronunciation'],
    },
    'content': {
      'type': 'object',
      'properties': {
        'instruction': {
          'type': 'object',
          'patternProperties': {
            '^[a-z]{2}$': {
              'type': 'string',
            },
          },
        },
        'question': {
          'type': 'object',
          'patternProperties': {
            '^[a-z]{2}$': {
              'type': 'string',
            },
          },
        },
        'correctAnswer': {
          'oneOf': [
            { 'type': 'string' },
            { 'type': 'array', 'items': { 'type': 'string' } },
          ],
        },
        'explanation': {
          'type': 'object',
          'patternProperties': {
            '^[a-z]{2}$': {
              'type': 'string',
            },
          },
        },
      },
      'required': ['instruction', 'question', 'correctAnswer', 'explanation'],
    },
    'metadata': {
      'type': 'object',
      'properties': {
        'difficulty': {
          'type': 'integer',
          'minimum': 1,
          'maximum': 5,
        },
        'xpReward': {
          'type': 'integer',
          'minimum': 1,
        },
        'estimatedTime': {
          'type': 'integer',
          'minimum': 10,
        },
        'skills': {
          'type': 'array',
          'items': { 'type': 'string' },
        },
        'topics': {
          'type': 'array',
          'items': { 'type': 'string' },
        },
      },
    },
  },
  'required': ['lessonId', 'mainLanguage', 'targetLanguage', 'level', 'module', 'lesson', 'exerciseType', 'content', 'metadata'],
};

// Export all framework components
export default {
  cefrLevelDefinitions,
  exerciseTypeTemplates,
  skillCategories,
  createLessonContentSchema,
  createLessonModule,
  createLanguageCourse,
  generateExerciseId,
  generateLessonId,
  generateSkillId,
  generateModuleId,
  validateMultilingualContent,
  validateLessonContentSchema,
  lessonFrameworkSchema,
};
