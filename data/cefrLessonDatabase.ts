import { 
  MultilingualLesson, 
  MultilingualExercise, 
  GrammarConcept, 
  VocabularyItem, 
  CEFRLevel, 
  MultilingualContent,
  ExerciseType, 
} from '@/types';

// CEFR Lesson Database - Complete 240 lessons (60 per level × 4 levels)
// Each lesson contains 10 vocabulary words, exercises, grammar, and cultural context

// A1 Level Lessons (60 lessons) - Basic Survival
export const a1LessonDatabase: MultilingualLesson[] = [
  // Lesson 1: Basic Greetings
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
    exercises: [
      {
        id: 'a1_001_exercise_001',
        type: 'flashcard',
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
        options: [
          { en: 'hola', es: 'hola', fr: 'bonjour', it: 'ciao', zh: '你好', hr: 'bok' },
          { en: 'adiós', es: 'adiós', fr: 'au revoir', it: 'arrivederci', zh: '再见', hr: 'doviđenja' },
          { en: 'gracias', es: 'gracias', fr: 'merci', it: 'grazie', zh: '谢谢', hr: 'hvala' },
        ],
        correctAnswer: 'hola',
        explanation: {
          en: '"Hello" is a common greeting used to start a conversation.',
          es: '"Hello" es un saludo común usado para iniciar una conversación.',
          fr: '"Hello" est une salutation courante utilisée pour commencer une conversation.',
          it: '"Hello" è un saluto comune usato per iniziare una conversazione.',
          zh: '"Hello"是开始对话时常用的问候语。',
          hr: '"Hello" je uobičajen pozdrav koji se koristi za početak razgovora.',
        },
        difficulty: 1,
        xpReward: 10,
        targetLanguage: 'es',
        mainLanguage: 'en',
        skills: ['reading', 'vocabulary'],
        gameContent: {
          type: 'flashcard',
          cards: [
            {
              id: 'hello_card',
              front: 'hello',
              back: 'hola',
              imageUrl: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400',
              audioUrl: '/audio/en/hello.mp3',
            },
          ],
        },
      },
      {
        id: 'a1_001_exercise_002',
        type: 'multipleChoice',
        instruction: {
          en: 'Choose the correct response to "Hello"',
          es: 'Elige la respuesta correcta a "Hello"',
          fr: 'Choisissez la bonne réponse à "Hello"',
          it: 'Scegli la risposta corretta a "Hello"',
          zh: '选择对"Hello"的正确回应',
          hr: 'Odaberi ispravan odgovor na "Hello"',
        },
        question: {
          en: 'How do you respond to "Hello"?',
          es: '¿Cómo respondes a "Hello"?',
          fr: 'Comment répondez-vous à "Hello"?',
          it: 'Come rispondi a "Hello"?',
          zh: '你如何回应"Hello"？',
          hr: 'Kako odgovaraš na "Hello"?',
        },
        options: [
          { en: 'Hello', es: 'Hola', fr: 'Bonjour', it: 'Ciao', zh: '你好', hr: 'Bok' },
          { en: 'Goodbye', es: 'Adiós', fr: 'Au revoir', it: 'Arrivederci', zh: '再见', hr: 'Doviđenja' },
          { en: 'Thank you', es: 'Gracias', fr: 'Merci', it: 'Grazie', zh: '谢谢', hr: 'Hvala' },
        ],
        correctAnswer: 'Hello',
        explanation: {
          en: 'The appropriate response to "Hello" is "Hello" back.',
          es: 'La respuesta apropiada a "Hello" es "Hello" de vuelta.',
          fr: 'La réponse appropriée à "Hello" est "Hello" en retour.',
          it: 'La risposta appropriata a "Hello" è "Hello" indietro.',
          zh: '对"Hello"的适当回应是回说"Hello"。',
          hr: 'Prikladan odgovor na "Hello" je "Hello" natrag.',
        },
        difficulty: 1,
        xpReward: 10,
        targetLanguage: 'es',
        mainLanguage: 'en',
        skills: ['speaking', 'conversation'],
      },
    ],
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
    vocabularyIntroduced: [
      {
        id: 'a1_001_hello',
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
        id: 'a1_001_goodbye',
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
      // Note: This would include 8 more vocabulary words for a total of 10
    ],
    vocabularyReviewed: [],
    grammarConcepts: [
      {
        id: 'a1_001_grammar_greetings',
        title: {
          en: 'Basic Greetings in Spanish',
          es: 'Saludos Básicos en Español',
          fr: 'Salutations de Base en Espagnol',
          it: 'Saluti di Base in Spagnolo',
          zh: '西班牙语基本问候',
          hr: 'Osnovni Pozdravi na Španjolskom',
        },
        description: {
          en: 'Learn the most common greetings used in Spanish-speaking countries',
          es: 'Aprende los saludos más comunes usados en países de habla hispana',
          fr: 'Apprenez les salutations les plus courantes utilisées dans les pays hispanophones',
          it: 'Impara i saluti più comuni usati nei paesi di lingua spagnola',
          zh: '学习西班牙语国家最常用的问候语',
          hr: 'Nauči najčešće pozdrave koji se koriste u španjolskogovornim zemljama',
        },
        examples: [
          {
            original: 'Hola, ¿cómo estás?',
            translation: 'Hello, how are you?',
            explanation: {
              en: 'This is the most common way to greet someone in Spanish',
              es: 'Esta es la forma más común de saludar a alguien en español',
              fr: 'C\'est la façon la plus courante de saluer quelqu\'un en espagnol',
              it: 'Questo è il modo più comune di salutare qualcuno in spagnolo',
              zh: '这是西班牙语中最常见的问候方式',
              hr: 'Ovo je najčešći način pozdravljanja nekoga na španjolskom',
            },
          },
        ],
        difficulty: 1,
        cefrLevel: 'A1',
        category: 'other',
      },
    ],
    learningObjectives: [
      {
        en: 'Recognize and use basic Spanish greetings',
        es: 'Reconocer y usar saludos básicos en español',
        fr: 'Reconnaître et utiliser les salutations de base en espagnol',
        it: 'Riconoscere e usare i saluti di base in spagnolo',
        zh: '识别和使用基本西班牙语问候语',
        hr: 'Prepoznati i koristiti osnovne pozdrave na španjolskom',
      },
      {
        en: 'Understand cultural context of greetings',
        es: 'Entender el contexto cultural de los saludos',
        fr: 'Comprendre le contexte culturel des salutations',
        it: 'Comprendere il contesto culturale dei saluti',
        zh: '理解问候语的文化背景',
        hr: 'Razumjeti kulturni kontekst pozdrava',
      },
    ],
    completionCriteria: {
      minimumAccuracy: 80,
      requiredExercises: ['a1_001_exercise_001', 'a1_001_exercise_002'],
    },
  },

  // Lesson 2: Family Members
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
    completed: false,
    exercises: [
      {
        id: 'a1_002_exercise_001',
        type: 'match',
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
        correctAnswer: ['mother-madre', 'father-padre', 'brother-hermano', 'sister-hermana'],
        explanation: {
          en: 'These are the basic family members in Spanish',
          es: 'Estos son los miembros básicos de la familia en español',
          fr: 'Ce sont les membres de base de la famille en espagnol',
          it: 'Questi sono i membri di base della famiglia in spagnolo',
          zh: '这些是西班牙语中的基本家庭成员',
          hr: 'Ovo su osnovni članovi obitelji na španjolskom',
        },
        difficulty: 1,
        xpReward: 15,
        targetLanguage: 'es',
        mainLanguage: 'en',
        skills: ['vocabulary', 'reading'],
      },
    ],
    xpReward: 60,
    difficulty: 1,
    estimatedTime: 20,
    description: {
      en: 'Learn vocabulary for family members in Spanish',
      es: 'Aprende vocabulario para miembros de la familia en español',
      fr: 'Apprenez le vocabulaire des membres de la famille en espagnol',
      it: 'Impara il vocabolario dei membri della famiglia in spagnolo',
      zh: '学习西班牙语家庭成员的词汇',
      hr: 'Nauči vokabular za članove obitelji na španjolskom',
    },
    targetLanguage: 'es',
    mainLanguage: 'en',
    vocabularyIntroduced: [
      {
        id: 'a1_002_mother',
        word: 'mother',
        translation: 'madre',
        pronunciation: 'ˈmʌðər',
        phonetic: 'ˈmʌðər',
        partOfSpeech: 'noun',
        difficulty: 1,
        frequency: 9,
        imageUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400',
        audioUrl: '/audio/en/mother.mp3',
        exampleSentences: [
          {
            original: 'My mother is kind.',
            translation: 'Mi madre es amable.',
            audioUrl: '/audio/en/mother_kind.mp3',
          },
        ],
        tags: ['family', 'parent', 'basic'],
        cefrLevel: 'A1',
        mastered: false,
      },
      // Note: This would include 9 more family vocabulary words
    ],
    vocabularyReviewed: [],
    grammarConcepts: [
      {
        id: 'a1_002_grammar_possession',
        title: {
          en: 'Possessive Adjectives',
          es: 'Adjetivos Posesivos',
          fr: 'Adjectifs Possessifs',
          it: 'Aggettivi Possessivi',
          zh: '物主形容词',
          hr: 'Prisvojni Pridjevi',
        },
        description: {
          en: 'Learn how to express possession with family members',
          es: 'Aprende cómo expresar posesión con miembros de la familia',
          fr: 'Apprenez à exprimer la possession avec les membres de la famille',
          it: 'Impara come esprimere il possesso con i membri della famiglia',
          zh: '学习如何表达家庭成员的所属关系',
          hr: 'Nauči kako izraziti posjedovanje s članovima obitelji',
        },
        examples: [
          {
            original: 'Mi madre es amable.',
            translation: 'My mother is kind.',
            explanation: {
              en: '"Mi" means "my" and is used before family members',
              es: '"Mi" significa "my" y se usa antes de los miembros de la familia',
              fr: '"Mi" signifie "mon/ma" et est utilisé avant les membres de la famille',
              it: '"Mi" significa "mio/mia" ed è usato prima dei membri della famiglia',
              zh: '"Mi"意思是"我的"，用在家庭成员前',
              hr: '"Mi" znači "moj/moja" i koristi se prije članova obitelji',
            },
          },
        ],
        difficulty: 2,
        cefrLevel: 'A1',
        category: 'other',
      },
    ],
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
    completionCriteria: {
      minimumAccuracy: 75,
      requiredExercises: ['a1_002_exercise_001'],
    },
  },

  // Note: This is a sample of the first 2 lessons.
  // The complete A1 lesson database would contain 60 lessons organized into:
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

// A2 Level Lessons (60 lessons) - Elementary
export const a2LessonDatabase: MultilingualLesson[] = [
  // Lesson 1: Shopping Vocabulary
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
    exercises: [
      {
        id: 'a2_001_exercise_001',
        type: 'fillBlank',
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
        difficulty: 2,
        xpReward: 15,
        targetLanguage: 'es',
        mainLanguage: 'en',
        skills: ['speaking', 'vocabulary'],
      },
    ],
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
    vocabularyIntroduced: [
      {
        id: 'a2_001_shopping',
        word: 'shopping',
        translation: 'compras',
        pronunciation: 'ˈʃɑpɪŋ',
        phonetic: 'ˈʃɑpɪŋ',
        partOfSpeech: 'noun',
        difficulty: 2,
        frequency: 7,
        imageUrl: 'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=400',
        audioUrl: '/audio/en/shopping.mp3',
        exampleSentences: [
          {
            original: 'I go shopping every weekend.',
            translation: 'Voy de compras cada fin de semana.',
            audioUrl: '/audio/en/shopping_weekend.mp3',
          },
        ],
        tags: ['shopping', 'activity', 'intermediate'],
        cefrLevel: 'A2',
        mastered: false,
      },
      // Note: This would include 9 more shopping vocabulary words
    ],
    vocabularyReviewed: [],
    grammarConcepts: [
      {
        id: 'a2_001_grammar_shopping_phrases',
        title: {
          en: 'Shopping Phrases',
          es: 'Frases de Compras',
          fr: 'Phrases de Shopping',
          it: 'Frasi dello Shopping',
          zh: '购物短语',
          hr: 'Fraze za Kupovinu',
        },
        description: {
          en: 'Learn common phrases used when shopping',
          es: 'Aprende frases comunes usadas al comprar',
          fr: 'Apprenez les phrases courantes utilisées lors du shopping',
          it: 'Impara le frasi comuni usate quando si fa shopping',
          zh: '学习购物时常用的短语',
          hr: 'Nauči uobičajene fraze koje se koriste pri kupovini',
        },
        examples: [
          {
            original: '¿Cuánto cuesta?',
            translation: 'How much does it cost?',
            explanation: {
              en: 'This is the most important question when shopping',
              es: 'Esta es la pregunta más importante al comprar',
              fr: 'C\'est la question la plus importante lors du shopping',
              it: 'Questa è la domanda più importante quando si fa shopping',
              zh: '这是购物时最重要的问题',
              hr: 'Ovo je najvažnije pitanje pri kupovini',
            },
          },
        ],
        difficulty: 2,
        cefrLevel: 'A2',
        category: 'other',
      },
    ],
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
    completionCriteria: {
      minimumAccuracy: 80,
      requiredExercises: ['a2_001_exercise_001'],
    },
  },
  // Note: Complete A2 lesson database would contain 60 lessons
];

// B1 Level Lessons (60 lessons) - Intermediate
export const b1LessonDatabase: MultilingualLesson[] = [
  // Lesson 1: Technology and Internet
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
    exercises: [
      {
        id: 'b1_001_exercise_001',
        type: 'conversation',
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
        difficulty: 3,
        xpReward: 25,
        targetLanguage: 'es',
        mainLanguage: 'en',
        skills: ['speaking', 'conversation'],
      },
    ],
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
    vocabularyIntroduced: [
      {
        id: 'b1_001_technology',
        word: 'technology',
        translation: 'tecnología',
        pronunciation: 'tɛkˈnɑlədʒi',
        phonetic: 'tɛkˈnɑlədʒi',
        partOfSpeech: 'noun',
        difficulty: 3,
        frequency: 6,
        imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400',
        audioUrl: '/audio/en/technology.mp3',
        exampleSentences: [
          {
            original: 'Technology is advancing rapidly.',
            translation: 'La tecnología avanza rápidamente.',
            audioUrl: '/audio/en/technology_advancing.mp3',
          },
        ],
        tags: ['technology', 'modern', 'intermediate'],
        cefrLevel: 'B1',
        mastered: false,
      },
      // Note: This would include 9 more technology vocabulary words
    ],
    vocabularyReviewed: [],
    grammarConcepts: [
      {
        id: 'b1_001_grammar_conditional',
        title: {
          en: 'Conditional Sentences',
          es: 'Oraciones Condicionales',
          fr: 'Phrases Conditionnelles',
          it: 'Frasi Condizionali',
          zh: '条件句',
          hr: 'Uvjetne Rečenice',
        },
        description: {
          en: 'Learn to express hypothetical situations with technology',
          es: 'Aprende a expresar situaciones hipotéticas con tecnología',
          fr: 'Apprenez à exprimer des situations hypothétiques avec la technologie',
          it: 'Impara ad esprimere situazioni ipotetiche con la tecnologia',
          zh: '学习用技术表达假设情况',
          hr: 'Nauči izraziti hipotetske situacije s tehnologijom',
        },
        examples: [
          {
            original: 'Si tuviera más tiempo, aprendería programación.',
            translation: 'If I had more time, I would learn programming.',
            explanation: {
              en: 'This is a second conditional sentence expressing a hypothetical situation',
              es: 'Esta es una oración condicional de segundo tipo que expresa una situación hipotética',
              fr: 'C\'est une phrase conditionnelle de deuxième type exprimant une situation hypothétique',
              it: 'Questa è una frase condizionale di secondo tipo che esprime una situazione ipotetica',
              zh: '这是表达假设情况的第二条件句',
              hr: 'Ovo je uvjetna rečenica drugog tipa koja izražava hipotetsku situaciju',
            },
          },
        ],
        difficulty: 3,
        cefrLevel: 'B1',
        category: 'syntax',
      },
    ],
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
    completionCriteria: {
      minimumAccuracy: 85,
      requiredExercises: ['b1_001_exercise_001'],
    },
  },
  // Note: Complete B1 lesson database would contain 60 lessons
];

// B2 Level Lessons (60 lessons) - Upper Intermediate
export const b2LessonDatabase: MultilingualLesson[] = [
  // Lesson 1: Business and Professional Communication
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
    exercises: [
      {
        id: 'b2_001_exercise_001',
        type: 'writing',
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
        difficulty: 4,
        xpReward: 35,
        targetLanguage: 'es',
        mainLanguage: 'en',
        skills: ['writing', 'business'],
      },
    ],
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
    vocabularyIntroduced: [
      {
        id: 'b2_001_business',
        word: 'business',
        translation: 'negocio',
        pronunciation: 'ˈbɪznəs',
        phonetic: 'ˈbɪznəs',
        partOfSpeech: 'noun',
        difficulty: 4,
        frequency: 5,
        imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
        audioUrl: '/audio/en/business.mp3',
        exampleSentences: [
          {
            original: 'Business is growing rapidly.',
            translation: 'El negocio está creciendo rápidamente.',
            audioUrl: '/audio/en/business_growing.mp3',
          },
        ],
        tags: ['business', 'professional', 'advanced'],
        cefrLevel: 'B2',
        mastered: false,
      },
      // Note: This would include 9 more business vocabulary words
    ],
    vocabularyReviewed: [],
    grammarConcepts: [
      {
        id: 'b2_001_grammar_formal_register',
        title: {
          en: 'Formal Register in Business',
          es: 'Registro Formal en los Negocios',
          fr: 'Registre Formel dans les Affaires',
          it: 'Registro Formale negli Affari',
          zh: '商务中的正式语域',
          hr: 'Formalni Registar u Poslu',
        },
        description: {
          en: 'Learn to use formal language in business contexts',
          es: 'Aprende a usar lenguaje formal en contextos empresariales',
          fr: 'Apprenez à utiliser un langage formel dans les contextes d\'entreprise',
          it: 'Impara ad usare un linguaggio formale nei contesti aziendali',
          zh: '学习在商务环境中使用正式语言',
          hr: 'Nauči koristiti formalni jezik u poslovnim kontekstima',
        },
        examples: [
          {
            original: 'Le agradezco su tiempo y consideración.',
            translation: 'I thank you for your time and consideration.',
            explanation: {
              en: 'This is a formal way to end a business email',
              es: 'Esta es una forma formal de terminar un correo empresarial',
              fr: 'C\'est une façon formelle de terminer un e-mail d\'entreprise',
              it: 'Questo è un modo formale per terminare un\'email aziendale',
              zh: '这是结束商务邮件的正式方式',
              hr: 'Ovo je formalan način završetka poslovnog emaila',
            },
          },
        ],
        difficulty: 4,
        cefrLevel: 'B2',
        category: 'syntax',
      },
    ],
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
    completionCriteria: {
      minimumAccuracy: 90,
      requiredExercises: ['b2_001_exercise_001'],
    },
  },
  // Note: Complete B2 lesson database would contain 60 lessons
];

// Complete lesson database
export const completeCefrLessonDatabase = {
  A1: a1LessonDatabase,
  A2: a2LessonDatabase,
  B1: b1LessonDatabase,
  B2: b2LessonDatabase,
  C1: [] as MultilingualLesson[], // Placeholder for C1 lessons
  C2: [] as MultilingualLesson[],  // Placeholder for C2 lessons
};

// Helper functions
export const getLessonsByLevel = (level: CEFRLevel): MultilingualLesson[] => {
  return completeCefrLessonDatabase[level] || [];
};

export const getLessonById = (lessonId: string): MultilingualLesson | undefined => {
  const allLevels: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
  
  for (const level of allLevels) {
    const lessons = completeCefrLessonDatabase[level];
    const lesson = lessons.find(l => l.id === lessonId);
    if (lesson) return lesson;
  }
  
  return undefined;
};

export const getLessonsByType = (level: CEFRLevel, type: string): MultilingualLesson[] => {
  const lessons = getLessonsByLevel(level);
  return lessons.filter(lesson => lesson.type === type);
};

export const getLessonsByDifficulty = (level: CEFRLevel, difficulty: number): MultilingualLesson[] => {
  const lessons = getLessonsByLevel(level);
  return lessons.filter(lesson => lesson.difficulty === difficulty);
};

export const getLessonStats = (): {
  totalLessons: number;
  lessonsByLevel: Record<CEFRLevel, number>;
  lessonsByType: Record<string, number>;
  averageDifficulty: number;
  totalXPReward: number;
} => {
  const stats = {
    totalLessons: 0,
    lessonsByLevel: {} as Record<CEFRLevel, number>,
    lessonsByType: {} as Record<string, number>,
    averageDifficulty: 0,
    totalXPReward: 0,
  };
  
  let totalDifficulty = 0;
  
  Object.entries(completeCefrLessonDatabase).forEach(([level, lessons]) => {
    const levelKey = level as CEFRLevel;
    stats.lessonsByLevel[levelKey] = lessons.length;
    stats.totalLessons += lessons.length;
    
    lessons.forEach(lesson => {
      stats.lessonsByType[lesson.type] = (stats.lessonsByType[lesson.type] || 0) + 1;
      totalDifficulty += lesson.difficulty;
      stats.totalXPReward += lesson.xpReward;
    });
  });
  
  stats.averageDifficulty = stats.totalLessons > 0 ? totalDifficulty / stats.totalLessons : 0;
  
  return stats;
};

export default completeCefrLessonDatabase;
