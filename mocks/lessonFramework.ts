import { 
  CEFRLevel, 
  MultilingualContent, 
  LessonModule, 
  LanguageCourse,
  VocabularyItem,
  GrammarConcept,
  MultilingualSkill,
  MultilingualLesson,
  MultilingualExercise,
  ExerciseType,
  SkillCategory,
} from '@/types';

// CEFR Level Definitions with Vocabulary Targets
export const cefrLevelDefinitions = { 
  A1: {
    description: {
      en: 'Beginner - Can understand and use familiar everyday expressions',
      es: 'Principiante - Puede entender y usar expresiones cotidianas familiares',
      fr: 'Débutant - Peut comprendre et utiliser des expressions familières du quotidien',
      it: 'Principiante - Può capire e usare espressioni familiari di uso quotidiano',
      hr: 'Početnik - Može razumjeti i koristiti poznate svakodnevne izraze',
      zh: '初级 - 能理解并使用熟悉的日常表达',
    } as MultilingualContent,
    xpRequired: 0,
    estimatedHours: 80,
    modules: 8,
    vocabularyTarget: {
      newWords: 500,
      cumulativeWords: 500,
      keyTopics: ['greetings', 'family', 'food', 'numbers', 'colors', 'basic_verbs', 'time', 'places'],
    },
    grammarConcepts: ['present_tense', 'articles', 'basic_pronouns', 'question_formation', 'negation'],
  },
  A2: {
    description: {
      en: 'Elementary - Can communicate in simple routine tasks',
      es: 'Elemental - Puede comunicarse en tareas rutinarias simples',
      fr: 'Élémentaire - Peut communiquer dans des tâches routinières simples',
      it: 'Elementare - Può comunicare in compiti di routine semplici',
      hr: 'Osnovni - Može komunicirati u jednostavnim rutinskim zadacima',
      zh: '初中级 - 能在简单的日常任务中进行交流',
    } as MultilingualContent,
    xpRequired: 500,
    estimatedHours: 120,
    modules: 10,
    vocabularyTarget: {
      newWords: 700,
      cumulativeWords: 1200,
      keyTopics: ['shopping', 'directions', 'weather', 'hobbies', 'work', 'health', 'travel', 'adjectives'],
    },
    grammarConcepts: ['past_tense', 'future_tense', 'comparatives', 'modal_verbs', 'prepositions'],
  },
  B1: {
    description: {
      en: 'Intermediate - Can deal with most situations while traveling',
      es: 'Intermedio - Puede lidiar con la mayoría de situaciones mientras viaja',
      fr: 'Intermédiaire - Peut faire face à la plupart des situations en voyage',
      it: 'Intermedio - Può gestire la maggior parte delle situazioni durante i viaggi',
      hr: 'Srednji - Može se nositi s većinom situacija tijekom putovanja',
      zh: '中级 - 能处理旅行中的大多数情况',
    } as MultilingualContent,
    xpRequired: 1200,
    estimatedHours: 180,
    modules: 12,
    vocabularyTarget: {
      newWords: 1000,
      cumulativeWords: 2200,
      keyTopics: ['education', 'technology', 'environment', 'culture', 'media', 'relationships', 'opinions', 'experiences'],
    },
    grammarConcepts: ['perfect_tenses', 'conditional', 'subjunctive_basic', 'passive_voice', 'reported_speech'],
  },
  B2: {
    description: {
      en: 'Upper Intermediate - Can interact with fluency and spontaneity',
      es: 'Intermedio Alto - Puede interactuar con fluidez y espontaneidad',
      fr: 'Intermédiaire Supérieur - Peut interagir avec aisance et spontanéité',
      it: 'Intermedio Superiore - Può interagire con scioltezza e spontaneità',
      hr: 'Viši srednji - Može komunicirati tečno i spontano',
      zh: '中高级 - 能流利自然地进行交流',
    } as MultilingualContent,
    xpRequired: 2500,
    estimatedHours: 240,
    modules: 15,
    vocabularyTarget: {
      newWords: 1800,
      cumulativeWords: 4000,
      keyTopics: ['business', 'politics', 'science', 'arts', 'literature', 'philosophy', 'psychology', 'economics'],
    },
    grammarConcepts: ['advanced_tenses', 'subjunctive_advanced', 'complex_conditionals', 'advanced_passive', 'discourse_markers'],
  },
  C1: {
    description: {
      en: 'Advanced - Can express ideas fluently and spontaneously',
      es: 'Avanzado - Puede expresar ideas con fluidez y espontaneidad',
      fr: 'Avancé - Peut exprimer des idées couramment et spontanément',
      it: 'Avanzato - Può esprimere idee in modo fluente e spontaneo',
      hr: 'Napredni - Može izraziti ideje tečno i spontano',
      zh: '高级 - 能流利自然地表达想法',
    } as MultilingualContent,
    xpRequired: 4500,
    estimatedHours: 320,
    modules: 18,
    vocabularyTarget: {
      newWords: 4000,
      cumulativeWords: 8000,
      keyTopics: ['academic', 'professional', 'specialized', 'abstract_concepts', 'formal_language', 'idiomatic_expressions'],
    },
    grammarConcepts: ['complex_syntax', 'stylistic_variations', 'register_variations', 'advanced_discourse', 'nuanced_meanings'],
  },
  C2: {
    description: {
      en: 'Proficient - Can understand virtually everything heard or read',
      es: 'Competente - Puede entender prácticamente todo lo que oye o lee',
      fr: 'Compétent - Peut comprendre pratiquement tout ce qui est entendu ou lu',
      it: 'Competente - Può capire praticamente tutto ciò che sente o legge',
      hr: 'Stručni - Može razumjeti praktički sve što čuje ili čita',
      zh: '精通级 - 能理解几乎所有听到或读到的内容',
    } as MultilingualContent,
    xpRequired: 7500,
    estimatedHours: 400,
    modules: 20,
    vocabularyTarget: {
      newWords: 8000,
      cumulativeWords: 16000,
      keyTopics: ['literary', 'philosophical', 'scientific', 'cultural_nuances', 'historical', 'artistic', 'technical'],
    },
    grammarConcepts: ['mastery_level', 'native_like_usage', 'subtle_distinctions', 'cultural_grammar', 'advanced_stylistics'],
  },
};

// Exercise Type Templates with Multilingual Instructions
export const exerciseTypeTemplates = {
  wordImageMatch: {
    instruction: {
      en: 'Match the words with the correct images',
      es: 'Empareja las palabras con las imágenes correctas',
      fr: 'Associez les mots aux bonnes images',
      it: 'Abbina le parole alle immagini corrette',
      hr: 'Spojite riječi s odgovarajućim slikama',
      zh: '将单词与正确的图片匹配',
    } as MultilingualContent,
    timeLimit: 60,
    difficulty: 1,
  },
  sentenceBuilding: {
    instruction: {
      en: 'Arrange the words to form a correct sentence',
      es: 'Ordena las palabras para formar una oración correcta',
      fr: 'Arrangez les mots pour former une phrase correcte',
      it: 'Disponi le parole per formare una frase corretta',
      hr: 'Poredajte riječi da biste formirali ispravnu rečenicu',
      zh: '排列单词组成正确的句子',
    } as MultilingualContent,
    timeLimit: 90,
    difficulty: 2,
  },
  fillBlank: {
    instruction: {
      en: 'Fill in the blanks with the correct words',
      es: 'Completa los espacios en blanco con las palabras correctas',
      fr: 'Remplissez les blancs avec les mots corrects',
      it: 'Riempi gli spazi vuoti con le parole corrette',
      hr: 'Popunite praznine s ispravnim riječima',
      zh: '用正确的单词填空',
    } as MultilingualContent,
    timeLimit: 75,
    difficulty: 2,
  },
  multipleChoice: {
    instruction: {
      en: 'Choose the correct answer',
      es: 'Elige la respuesta correcta',
      fr: 'Choisissez la bonne réponse',
      it: 'Scegli la risposta corretta',
      hr: 'Odaberite točan odgovor',
      zh: '选择正确答案',
    } as MultilingualContent,
    timeLimit: 45,
    difficulty: 1,
  },
  listening: {
    instruction: {
      en: 'Listen carefully and answer the questions',
      es: 'Escucha atentamente y responde las preguntas',
      fr: 'Écoutez attentivement et répondez aux questions',
      it: 'Ascolta attentamente e rispondi alle domande',
      hr: 'Pažljivo slušajte i odgovorite na pitanja',
      zh: '仔细听并回答问题',
    } as MultilingualContent,
    timeLimit: 120,
    difficulty: 3,
  },
  speaking: {
    instruction: {
      en: 'Speak the phrase clearly and correctly',
      es: 'Pronuncia la frase clara y correctamente',
      fr: 'Prononcez la phrase clairement et correctement',
      it: 'Pronuncia la frase chiaramente e correttamente',
      hr: 'Izgovorite frazu jasno i ispravno',
      zh: '清楚正确地说出这个短语',
    } as MultilingualContent,
    timeLimit: 30,
    difficulty: 4,
  },
  translate: {
    instruction: {
      en: 'Translate the following text',
      es: 'Traduce el siguiente texto',
      fr: 'Traduisez le texte suivant',
      it: 'Traduci il seguente testo',
      hr: 'Prevedite sljedeći tekst',
      zh: '翻译以下文本',
    } as MultilingualContent,
    timeLimit: 90,
    difficulty: 3,
  },
};

// Skill Categories with Enhanced Descriptions
export const skillCategories = {
  basics: {
    name: {
      en: 'Basics',
      es: 'Básicos',
      fr: 'Bases',
      it: 'Basi',
      hr: 'Osnove',
      zh: '基础',
    } as MultilingualContent,
    description: {
      en: 'Essential words and phrases for beginners',
      es: 'Palabras y frases esenciales para principiantes',
      fr: 'Mots et phrases essentiels pour débutants',
      it: 'Parole e frasi essenziali per principianti',
      hr: 'Osnovne riječi i fraze za početnike',
      zh: '初学者必备的单词和短语',
    } as MultilingualContent,
    color: '#58CC02',
    icon: '🌟',
  },
  grammar: {
    name: {
      en: 'Grammar',
      es: 'Gramática',
      fr: 'Grammaire',
      it: 'Grammatica',
      hr: 'Gramatika',
      zh: '语法',
    } as MultilingualContent,
    description: {
      en: 'Learn the rules and structure of the language',
      es: 'Aprende las reglas y estructura del idioma',
      fr: 'Apprenez les règles et la structure de la langue',
      it: 'Impara le regole e la struttura della lingua',
      hr: 'Naučite pravila i strukturu jezika',
      zh: '学习语言的规则和结构',
    } as MultilingualContent,
    color: '#1CB0F6',
    icon: '📚',
  },
  vocabulary: {
    name: {
      en: 'Vocabulary',
      es: 'Vocabulario',
      fr: 'Vocabulaire',
      it: 'Vocabolario',
      hr: 'Rječnik',
      zh: '词汇',
    } as MultilingualContent,
    description: {
      en: 'Expand your word knowledge',
      es: 'Amplía tu conocimiento de palabras',
      fr: 'Élargissez vos connaissances de mots',
      it: 'Espandi la tua conoscenza delle parole',
      hr: 'Proširite svoje znanje riječi',
      zh: '扩展你的词汇知识',
    } as MultilingualContent,
    color: '#FF4B4B',
    icon: '📖',
  },
  conversation: {
    name: {
      en: 'Conversation',
      es: 'Conversación',
      fr: 'Conversation',
      it: 'Conversazione',
      hr: 'Razgovor',
      zh: '对话',
    } as MultilingualContent,
    description: {
      en: 'Practice real-world conversations',
      es: 'Practica conversaciones del mundo real',
      fr: 'Pratiquez des conversations du monde réel',
      it: 'Pratica conversazioni del mondo reale',
      hr: 'Vježbajte razgovore iz stvarnog svijeta',
      zh: '练习真实世界的对话',
    } as MultilingualContent,
    color: '#FF9600',
    icon: '💬',
  },
  culture: {
    name: {
      en: 'Culture',
      es: 'Cultura',
      fr: 'Culture',
      it: 'Cultura',
      hr: 'Kultura',
      zh: '文化',
    } as MultilingualContent,
    description: {
      en: 'Learn about customs and traditions',
      es: 'Aprende sobre costumbres y tradiciones',
      fr: 'Apprenez les coutumes et traditions',
      it: 'Impara su costumi e tradizioni',
      hr: 'Naučite o običajima i tradicijama',
      zh: '了解习俗和传统',
    } as MultilingualContent,
    color: '#CE82FF',
    icon: '🎭',
  },
  travel: {
    name: {
      en: 'Travel',
      es: 'Viajes',
      fr: 'Voyage',
      it: 'Viaggi',
      hr: 'Putovanja',
      zh: '旅行',
    } as MultilingualContent,
    description: {
      en: 'Essential phrases for travelers',
      es: 'Frases esenciales para viajeros',
      fr: 'Phrases essentielles pour les voyageurs',
      it: 'Frasi essenziali per i viaggiatori',
      hr: 'Osnovne fraze za putnike',
      zh: '旅行者必备短语',
    } as MultilingualContent,
    color: '#FFC800',
    icon: '✈️',
  },
};

// Module Structure Templates
export const moduleStructureTemplates = {
  A1: [
    {
      moduleNumber: 1,
      title: {
        en: 'First Steps',
        es: 'Primeros Pasos',
        fr: 'Premiers Pas',
        it: 'Primi Passi',
        hr: 'Prvi Koraci',
        zh: '第一步',
      } as MultilingualContent,
      skills: ['greetings', 'introductions', 'basic_phrases'],
      vocabularyTarget: { newWords: 50, reviewWords: 0, totalWords: 50 },
    },
    {
      moduleNumber: 2,
      title: {
        en: 'Family & People',
        es: 'Familia y Personas',
        fr: 'Famille et Personnes',
        it: 'Famiglia e Persone',
        hr: 'Obitelj i Ljudi',
        zh: '家庭和人',
      } as MultilingualContent,
      skills: ['family_members', 'descriptions', 'relationships'],
      vocabularyTarget: { newWords: 60, reviewWords: 25, totalWords: 110 },
    },
    {
      moduleNumber: 3,
      title: {
        en: 'Food & Drink',
        es: 'Comida y Bebida',
        fr: 'Nourriture et Boisson',
        it: 'Cibo e Bevande',
        hr: 'Hrana i Piće',
        zh: '食物和饮料',
      } as MultilingualContent,
      skills: ['food_items', 'restaurants', 'cooking'],
      vocabularyTarget: { newWords: 70, reviewWords: 35, totalWords: 180 },
    },
  ],
};

// Helper Functions for Framework
export const generateModuleId = (
  targetLang: string,
  level: CEFRLevel,
  module: number,
): string => {
  return `${targetLang}_${level.toLowerCase()}_m${module}`;
};

export const generateSkillId = (
  targetLang: string,
  level: CEFRLevel,
  module: number,
  skill: number,
): string => {
  return `${targetLang}_${level.toLowerCase()}_m${module}_s${skill}`;
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

// Validation Functions
export const validateMultilingualContent = (
  content: MultilingualContent,
  requiredLanguages: string[],
): boolean => {
  return requiredLanguages.every(lang => 
    content[lang] && content[lang].trim().length > 0,
  );
};

export const calculateModuleXP = (vocabularyTarget: number, difficulty: number): number => {
  return Math.floor(vocabularyTarget * difficulty * 2.5);
};

export const calculateLessonTime = (exerciseCount: number, difficulty: number): number => {
  return Math.floor(exerciseCount * difficulty * 3); // minutes
};

// Course Structure Factory
export const createCourseStructure = (
  targetLanguage: string,
  mainLanguage: string,
): LanguageCourse => {
  const modules: LessonModule[] = [];
  
  // Generate modules for each CEFR level
  Object.entries(cefrLevelDefinitions).forEach(([level, definition]) => {
    const cefrLevel = level as CEFRLevel;
    
    for (let moduleNum = 1; moduleNum <= definition.modules; moduleNum++) {
      const moduleId = generateModuleId(targetLanguage, cefrLevel, moduleNum);
      
      const module: LessonModule = {
        id: moduleId,
        title: {
          [mainLanguage]: `${level} Module ${moduleNum}`,
          [targetLanguage]: `${level} Module ${moduleNum}`,
        } as MultilingualContent,
        description: {
          [mainLanguage]: `Learn essential ${level} level concepts`,
          [targetLanguage]: `Learn essential ${level} level concepts`,
        } as MultilingualContent,
        skills: [], // Will be populated with actual skills
        cefrLevel,
        targetLanguage,
        mainLanguage,
        moduleNumber: moduleNum,
        totalModules: definition.modules,
        vocabularyTarget: {
          newWords: Math.floor(definition.vocabularyTarget.newWords / definition.modules),
          reviewWords: Math.floor(definition.vocabularyTarget.newWords / definition.modules * 0.3),
          totalWords: Math.floor(definition.vocabularyTarget.newWords / definition.modules * 1.3),
        },
        grammarConcepts: definition.grammarConcepts,
        unlockRequirement: {
          previousModuleId: moduleNum > 1 ? generateModuleId(targetLanguage, cefrLevel, moduleNum - 1) : undefined,
          minimumXP: definition.xpRequired,
          minimumAccuracy: 0.7,
        },
        estimatedHours: Math.floor(definition.estimatedHours / definition.modules),
      };
      
      modules.push(module);
    }
  });
  
  const totalLessons = modules.reduce((total, module) => {
    return total + module.skills.reduce((skillTotal, skill) => {
      return skillTotal + skill.lessons.length;
    }, 0);
  }, 0);
  
  const estimatedHours = modules.reduce((total, module) => {
    return total + module.estimatedHours;
  }, 0);
  
  return {
    targetLanguage,
    mainLanguage,
    modules,
    totalLessons,
    estimatedHours,
    description: {
      [mainLanguage]: `Complete ${targetLanguage} course from A1 to C2`,
      [targetLanguage]: `Complete ${targetLanguage} course from A1 to C2`,
    } as MultilingualContent,
    vocabularyProgression: Object.fromEntries(
      Object.entries(cefrLevelDefinitions).map(([level, def]) => [
        level,
        {
          targetWords: def.vocabularyTarget.newWords,
          cumulativeWords: def.vocabularyTarget.cumulativeWords,
          keyTopics: def.vocabularyTarget.keyTopics,
        },
      ]),
    ) as any,
    grammarProgression: Object.fromEntries(
      Object.entries(cefrLevelDefinitions).map(([level, def]) => [
        level,
        def.grammarConcepts,
      ]),
    ) as any,
  };
};

// Export the complete framework
export default {
  cefrLevelDefinitions,
  exerciseTypeTemplates,
  skillCategories,
  moduleStructureTemplates,
  generateModuleId,
  generateSkillId,
  generateLessonId,
  generateExerciseId,
  validateMultilingualContent,
  calculateModuleXP,
  calculateLessonTime,
  createCourseStructure,
};
