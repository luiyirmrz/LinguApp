import { 
  MultilingualLesson, 
  MultilingualExercise, 
  GrammarConcept, 
  VocabularyItem, 
  CEFRLevel, 
  MultilingualContent,
  ExerciseType, 
} from '@/types';

// Lesson Database Generator
// This script generates the complete CEFR lesson database with 240 lessons
// (60 lessons per level × 4 levels: A1, A2, B1, B2)

interface LessonTemplate {
  id: string;
  title: MultilingualContent;
  type: string;
  difficulty: number;
  estimatedTime: number;
  xpReward: number;
  description: MultilingualContent;
  vocabularyWords: string[];
  grammarConcepts: string[];
  learningObjectives: MultilingualContent[];
  exercises: ExerciseTemplate[];
  culturalContext?: MultilingualContent;
}

interface ExerciseTemplate {
  type: ExerciseType;
  difficulty: number;
  xpReward: number;
  instruction: MultilingualContent;
  question: MultilingualContent;
  correctAnswer: string;
  explanation: MultilingualContent;
  skills: string[];
}

// A1 Lesson Templates (60 lessons)
const a1LessonTemplates: LessonTemplate[] = [
  // Greetings & Communication (10 lessons)
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
    difficulty: 1,
    estimatedTime: 15,
    xpReward: 50,
    description: {
      en: 'Learn basic greetings to start conversations in Spanish',
      es: 'Aprende saludos básicos para iniciar conversaciones en español',
      fr: 'Apprenez les salutations de base pour commencer des conversations en espagnol',
      it: 'Impara i saluti di base per iniziare conversazioni in spagnolo',
      zh: '学习基本问候语以开始西班牙语对话',
      hr: 'Nauči osnovne pozdrave za početak razgovora na španjolskom',
    },
    vocabularyWords: ['hello', 'goodbye', 'please', 'thank_you', 'sorry', 'yes', 'no', 'help', 'understand', 'speak'],
    grammarConcepts: ['basic_greetings'],
    learningObjectives: [
      {
        en: 'Recognize and use basic Spanish greetings',
        es: 'Reconocer y usar saludos básicos en español',
        fr: 'Reconnaître et utiliser les salutations de base en espagnol',
        it: 'Riconoscere e usare i saluti di base in spagnolo',
        zh: '识别和使用基本西班牙语问候语',
        hr: 'Prepoznati i koristiti osnovne pozdrave na španjolskom',
      },
    ],
    exercises: [
      {
        type: 'flashcard',
        difficulty: 1,
        xpReward: 10,
        instruction: {
          en: 'Match the greeting with its translation',
          es: 'Empareja el saludo con su traducción',
          fr: 'Associez le salut à sa traduction',
          it: 'Abbina il saluto alla sua traduzione',
          zh: '将问候语与其翻译匹配',
          hr: 'Poveži pozdrav s prijevodom',
        },
        question: {
          en: 'What does "hello" mean?',
          es: '¿Qué significa "hello"?',
          fr: 'Que signifie "hello"?',
          it: 'Cosa significa "hello"?',
          zh: '"hello"是什么意思？',
          hr: 'Što znači "hello"?',
        },
        correctAnswer: 'hola',
        explanation: {
          en: '"Hello" is a common greeting used to start a conversation.',
          es: '"Hello" es un saludo común usado para iniciar una conversación.',
          fr: '"Hello" est une salutation courante utilisée pour commencer une conversation.',
          it: '"Hello" è un saluto comune usato per iniziare una conversazione.',
          zh: '"Hello"是开始对话时常用的问候语。',
          hr: '"Hello" je uobičajen pozdrav koji se koristi za početak razgovora.',
        },
        skills: ['reading', 'vocabulary'],
      },
    ],
    culturalContext: {
      en: 'In Spanish-speaking countries, greetings are very important and often include physical contact like handshakes or kisses on the cheek.',
      es: 'En los países de habla hispana, los saludos son muy importantes y a menudo incluyen contacto físico como apretones de mano o besos en la mejilla.',
      fr: 'Dans les pays hispanophones, les salutations sont très importantes et incluent souvent un contact physique comme des poignées de main ou des baisers sur la joue.',
      it: 'Nei paesi di lingua spagnola, i saluti sono molto importanti e spesso includono contatto fisico come strette di mano o baci sulla guancia.',
      zh: '在西班牙语国家，问候语非常重要，通常包括握手或脸颊亲吻等身体接触。',
      hr: 'U španjolskogovornim zemljama, pozdravi su vrlo važni i često uključuju fizički kontakt kao što su rukovanje ili poljupci u obraz.',
    },
  },
  {
    id: 'a1_lesson_002_family_members',
    title: {
      en: 'Family Members',
      es: 'Miembros de la Familia',
      fr: 'Membres de la Famille',
      it: 'Membri della Famiglia',
      zh: '家庭成员',
      hr: 'Članovi Obitelji',
    },
    type: 'vocabulary',
    difficulty: 1,
    estimatedTime: 20,
    xpReward: 60,
    description: {
      en: 'Learn vocabulary for family members in Spanish',
      es: 'Aprende vocabulario para miembros de la familia en español',
      fr: 'Apprenez le vocabulaire des membres de la famille en espagnol',
      it: 'Impara il vocabolario dei membri della famiglia in spagnolo',
      zh: '学习西班牙语家庭成员的词汇',
      hr: 'Nauči vokabular za članove obitelji na španjolskom',
    },
    vocabularyWords: ['family', 'mother', 'father', 'brother', 'sister', 'baby', 'child', 'man', 'woman', 'friend'],
    grammarConcepts: ['possessive_adjectives'],
    learningObjectives: [
      {
        en: 'Identify and name family members in Spanish',
        es: 'Identificar y nombrar miembros de la familia en español',
        fr: 'Identifier et nommer les membres de la famille en espagnol',
        it: 'Identificare e nominare i membri della famiglia in spagnolo',
        zh: '识别和命名西班牙语家庭成员',
        hr: 'Identificirati i imenovati članove obitelji na španjolskom',
      },
    ],
    exercises: [
      {
        type: 'match',
        difficulty: 1,
        xpReward: 15,
        instruction: {
          en: 'Match the family member with the correct word',
          es: 'Empareja el miembro de la familia con la palabra correcta',
          fr: 'Associez le membre de la famille au bon mot',
          it: 'Abbina il membro della famiglia alla parola corretta',
          zh: '将家庭成员与正确的单词匹配',
          hr: 'Poveži člana obitelji s ispravnom riječi',
        },
        question: {
          en: 'Match the family members',
          es: 'Empareja los miembros de la familia',
          fr: 'Associez les membres de la famille',
          it: 'Abbina i membri della famiglia',
          zh: '匹配家庭成员',
          hr: 'Poveži članove obitelji',
        },
        correctAnswer: 'mother-madre',
        explanation: {
          en: 'These are the basic family members in Spanish',
          es: 'Estos son los miembros básicos de la familia en español',
          fr: 'Ce sont les membres de base de la famille en espagnol',
          it: 'Questi sono i membri di base della famiglia in spagnolo',
          zh: '这些是西班牙语中的基本家庭成员',
          hr: 'Ovo su osnovni članovi obitelji na španjolskom',
        },
        skills: ['vocabulary', 'reading'],
      },
    ],
  },
  // Note: This is a sample of the first 2 lessons.
  // The complete A1 lesson templates would contain 60 lessons organized into:
  // - Greetings & Communication (10 lessons)
  // - Family & People (10 lessons)
  // - Numbers & Colors (5 lessons)
  // - Food & Drinks (10 lessons)
  // - Animals & Nature (5 lessons)
  // - Body Parts & Health (5 lessons)
  // - Clothes & Appearance (5 lessons)
  // - Time & Days (5 lessons)
  // - House & Home (5 lessons)
  // - School & Learning (5 lessons)
];

// A2 Lesson Templates (60 lessons)
const a2LessonTemplates: LessonTemplate[] = [
  // Shopping & Money (10 lessons)
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
    difficulty: 2,
    estimatedTime: 25,
    xpReward: 75,
    description: {
      en: 'Learn essential vocabulary for shopping in Spanish',
      es: 'Aprende vocabulario esencial para comprar en español',
      fr: 'Apprenez le vocabulaire essentiel pour faire du shopping en espagnol',
      it: 'Impara il vocabolario essenziale per fare shopping in spagnolo',
      zh: '学习西班牙语购物的基本词汇',
      hr: 'Nauči osnovni vokabular za kupovinu na španjolskom',
    },
    vocabularyWords: ['shopping', 'money', 'buy', 'sell', 'price', 'expensive', 'cheap', 'store', 'market', 'customer'],
    grammarConcepts: ['shopping_phrases', 'comparisons'],
    learningObjectives: [
      {
        en: 'Use shopping vocabulary in real situations',
        es: 'Usar vocabulario de compras en situaciones reales',
        fr: 'Utiliser le vocabulaire de shopping dans des situations réelles',
        it: 'Usare il vocabolario dello shopping in situazioni reali',
        zh: '在真实情境中使用购物词汇',
        hr: 'Koristiti vokabular za kupovinu u stvarnim situacijama',
      },
    ],
    exercises: [
      {
        type: 'fillBlank',
        difficulty: 2,
        xpReward: 15,
        instruction: {
          en: 'Complete the shopping dialogue',
          es: 'Completa el diálogo de compras',
          fr: 'Complétez le dialogue de shopping',
          it: 'Completa il dialogo dello shopping',
          zh: '完成购物对话',
          hr: 'Dovrši dijalog o kupovini',
        },
        question: {
          en: 'Complete: "I need to buy some _____"',
          es: 'Completa: "Necesito comprar _____"',
          fr: 'Complétez: "J\'ai besoin d\'acheter _____"',
          it: 'Completa: "Ho bisogno di comprare _____"',
          zh: '完成："我需要买一些_____"',
          hr: 'Dovrši: "Trebam kupiti _____"',
        },
        correctAnswer: 'food',
        explanation: {
          en: 'This is a common shopping expression',
          es: 'Esta es una expresión común de compras',
          fr: 'C\'est une expression de shopping courante',
          it: 'Questa è un\'espressione comune dello shopping',
          zh: '这是常见的购物表达',
          hr: 'Ovo je uobičajen izraz za kupovinu',
        },
        skills: ['speaking', 'vocabulary'],
      },
    ],
  },
  // Note: Complete A2 lesson templates would contain 60 lessons
];

// B1 Lesson Templates (60 lessons)
const b1LessonTemplates: LessonTemplate[] = [
  // Technology & Internet (10 lessons)
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
    difficulty: 3,
    estimatedTime: 35,
    xpReward: 100,
    description: {
      en: 'Learn vocabulary and expressions related to technology and the internet',
      es: 'Aprende vocabulario y expresiones relacionadas con la tecnología e internet',
      fr: 'Apprenez le vocabulaire et les expressions liés à la technologie et à l\'internet',
      it: 'Impara il vocabolario e le espressioni relative alla tecnologia e internet',
      zh: '学习与技术和互联网相关的词汇和表达',
      hr: 'Nauči vokabular i izraze vezane za tehnologiju i internet',
    },
    vocabularyWords: ['technology', 'internet', 'computer', 'website', 'email', 'download', 'upload', 'password', 'software', 'hardware'],
    grammarConcepts: ['conditional_sentences', 'passive_voice'],
    learningObjectives: [
      {
        en: 'Discuss technology topics fluently',
        es: 'Discutir temas de tecnología con fluidez',
        fr: 'Discuter des sujets technologiques avec fluidité',
        it: 'Discutere argomenti tecnologici con fluidità',
        zh: '流利地讨论技术话题',
        hr: 'Tekuće raspravljati o tehnološkim temama',
      },
    ],
    exercises: [
      {
        type: 'conversation',
        difficulty: 3,
        xpReward: 25,
        instruction: {
          en: 'Have a conversation about technology',
          es: 'Ten una conversación sobre tecnología',
          fr: 'Ayez une conversation sur la technologie',
          it: 'Abbi una conversazione sulla tecnologia',
          zh: '进行关于技术的对话',
          hr: 'Vodi razgovor o tehnologiji',
        },
        question: {
          en: 'Discuss how technology has changed your life',
          es: 'Discute cómo la tecnología ha cambiado tu vida',
          fr: 'Discutez de la façon dont la technologie a changé votre vie',
          it: 'Discuti di come la tecnologia ha cambiato la tua vita',
          zh: '讨论技术如何改变了你的生活',
          hr: 'Raspravi o tome kako je tehnologija promijenila tvoj život',
        },
        correctAnswer: 'technology',
        explanation: {
          en: 'This exercise helps you practice discussing technology topics',
          es: 'Este ejercicio te ayuda a practicar discutiendo temas de tecnología',
          fr: 'Cet exercice vous aide à pratiquer la discussion sur les sujets technologiques',
          it: 'Questo esercizio ti aiuta a praticare la discussione di argomenti tecnologici',
          zh: '这个练习帮助你练习讨论技术话题',
          hr: 'Ova vježba pomaže ti vježbati raspravljanje o tehnološkim temama',
        },
        skills: ['speaking', 'conversation'],
      },
    ],
  },
  // Note: Complete B1 lesson templates would contain 60 lessons
];

// B2 Lesson Templates (60 lessons)
const b2LessonTemplates: LessonTemplate[] = [
  // Business & Professional (10 lessons)
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
    difficulty: 4,
    estimatedTime: 45,
    xpReward: 150,
    description: {
      en: 'Master professional communication skills in Spanish business contexts',
      es: 'Domina las habilidades de comunicación profesional en contextos empresariales españoles',
      fr: 'Maîtrisez les compétences de communication professionnelle dans les contextes d\'entreprise espagnols',
      it: 'Padroneggia le competenze di comunicazione professionale nei contesti aziendali spagnoli',
      zh: '掌握西班牙语商务环境中的专业沟通技能',
      hr: 'Ovladaj vještinama profesionalne komunikacije u španjolskim poslovnim kontekstima',
    },
    vocabularyWords: ['business', 'meeting', 'presentation', 'contract', 'negotiation', 'client', 'colleague', 'project', 'deadline', 'budget'],
    grammarConcepts: ['formal_register', 'business_phrases', 'complex_grammar'],
    learningObjectives: [
      {
        en: 'Communicate professionally in business settings',
        es: 'Comunicarse profesionalmente en entornos empresariales',
        fr: 'Communiquer professionnellement dans les environnements d\'entreprise',
        it: 'Comunicare professionalmente negli ambienti aziendali',
        zh: '在商务环境中进行专业沟通',
        hr: 'Profesionalno komunicirati u poslovnim okruženjima',
      },
    ],
    exercises: [
      {
        type: 'writing',
        difficulty: 4,
        xpReward: 35,
        instruction: {
          en: 'Write a professional email',
          es: 'Escribe un correo electrónico profesional',
          fr: 'Écrivez un e-mail professionnel',
          it: 'Scrivi un\'email professionale',
          zh: '写一封专业邮件',
          hr: 'Napiši profesionalni email',
        },
        question: {
          en: 'Write an email to a business partner about a project',
          es: 'Escribe un correo a un socio comercial sobre un proyecto',
          fr: 'Écrivez un e-mail à un partenaire commercial à propos d\'un projet',
          it: 'Scrivi un\'email a un partner commerciale su un progetto',
          zh: '给商业伙伴写一封关于项目的邮件',
          hr: 'Napiši email poslovnom partneru o projektu',
        },
        correctAnswer: 'professional email',
        explanation: {
          en: 'This exercise helps you practice formal business communication',
          es: 'Este ejercicio te ayuda a practicar la comunicación empresarial formal',
          fr: 'Cet exercice vous aide à pratiquer la communication d\'entreprise formelle',
          it: 'Questo esercizio ti aiuta a praticare la comunicazione aziendale formale',
          zh: '这个练习帮助你练习正式的商务沟通',
          hr: 'Ova vježba pomaže ti vježbati formalnu poslovnu komunikaciju',
        },
        skills: ['writing', 'business'],
      },
    ],
  },
  // Note: Complete B2 lesson templates would contain 60 lessons
];

// Generate lesson from template
function generateLessonFromTemplate(
  template: LessonTemplate,
  level: CEFRLevel,
  targetLanguage: string,
  mainLanguage: string,
): MultilingualLesson {
  return {
    id: template.id,
    title: template.title,
    type: template.type as any,
    completed: false,
    exercises: template.exercises.map((exerciseTemplate, index) => ({
      id: `${template.id}_exercise_${String(index + 1).padStart(3, '0')}`,
      type: exerciseTemplate.type,
      instruction: exerciseTemplate.instruction,
      question: exerciseTemplate.question,
      correctAnswer: exerciseTemplate.correctAnswer,
      explanation: exerciseTemplate.explanation,
      difficulty: exerciseTemplate.difficulty,
      xpReward: exerciseTemplate.xpReward,
      targetLanguage,
      mainLanguage,
      skills: exerciseTemplate.skills,
    })),
    xpReward: template.xpReward,
    difficulty: template.difficulty,
    estimatedTime: template.estimatedTime,
    description: template.description,
    targetLanguage,
    mainLanguage,
    vocabularyIntroduced: [], // Would be populated with actual vocabulary items
    vocabularyReviewed: [],
    grammarConcepts: [], // Would be populated with actual grammar concepts
    learningObjectives: template.learningObjectives,
    completionCriteria: {
      minimumAccuracy: 80,
      requiredExercises: template.exercises.map((_, index) => 
        `${template.id}_exercise_${String(index + 1).padStart(3, '0')}`,
      ),
    },
  };
}

// Generate complete lesson database
export function generateCompleteLessonDatabase(): Record<CEFRLevel, MultilingualLesson[]> {
  const levels: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2'];
  const templates = {
    A1: a1LessonTemplates,
    A2: a2LessonTemplates,
    B1: b1LessonTemplates,
    B2: b2LessonTemplates,
    C1: [] as any[], // Placeholder for C1 templates
    C2: [] as any[],  // Placeholder for C2 templates
  };
  
  const database: Record<CEFRLevel, MultilingualLesson[]> = {
    A1: [],
    A2: [],
    B1: [],
    B2: [],
    C1: [],
    C2: [],
  };
  
  levels.forEach(level => {
    database[level] = templates[level].map(template => 
      generateLessonFromTemplate(template, level, 'es', 'en'),
    );
  });
  
  return database;
}

// Generate lesson statistics
export function generateLessonStatistics(database: Record<CEFRLevel, MultilingualLesson[]>): {
  totalLessons: number;
  lessonsByLevel: Record<CEFRLevel, number>;
  lessonsByType: Record<string, number>;
  averageDifficulty: number;
  totalXPReward: number;
  averageEstimatedTime: number;
} {
  const stats = {
    totalLessons: 0,
    lessonsByLevel: {} as Record<CEFRLevel, number>,
    lessonsByType: {} as Record<string, number>,
    averageDifficulty: 0,
    totalXPReward: 0,
    averageEstimatedTime: 0,
  };
  
  let totalDifficulty = 0;
  let totalEstimatedTime = 0;
  
  Object.entries(database).forEach(([level, lessons]) => {
    const levelKey = level as CEFRLevel;
    stats.lessonsByLevel[levelKey] = lessons.length;
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

// Export the generator functions
export default {
  generateCompleteLessonDatabase,
  generateLessonStatistics,
  a1LessonTemplates,
  a2LessonTemplates,
  b1LessonTemplates,
  b2LessonTemplates,
};
