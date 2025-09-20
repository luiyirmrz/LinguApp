// Basic Greetings Module Data
// Complete lesson content with exercises, audio, and cultural context

import { 
  GreetingItem, 
  GreetingMiniLesson, 
  GreetingsModule,
  GreetingExercise, 
} from '@/types/greetings';

// Croatian Basic Greetings Data
export const croatianGreetings: GreetingItem[] = [
  {
    id: 'hr_greeting_dobar_dan',
    greeting: 'Dobar dan',
    translation: 'Good afternoon',
    phonetic: 'ˈdɔbar ˈdan',
    audioUrl: 'https://www.soundjay.com/misc/sounds-1015.wav', // Placeholder audio
    imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop',
    context: 'neutral',
    timeOfDay: 'afternoon',
    culturalNotes: {
      en: 'Used from noon until evening. Very common and polite greeting.',
      hr: 'Koristi se od podneva do večeri. Vrlo čest i pristojan pozdrav.',
      es: 'Se usa desde el mediodía hasta la noche. Saludo muy común y educado.',
    },
    difficulty: 2,
    cefrLevel: 'A1',
    tags: ['greeting', 'polite', 'afternoon', 'basic'],
    exampleSentences: [
      {
        original: 'Dobar dan, kako ste?',
        translation: 'Good afternoon, how are you?',
        audioUrl: 'https://www.soundjay.com/misc/sounds-1016.wav',
      },
      {
        original: 'Dobar dan, hvala što ste došli.',
        translation: 'Good afternoon, thank you for coming.',
        audioUrl: 'https://www.soundjay.com/misc/sounds-1017.wav',
      },
    ],
  },
  {
    id: 'hr_greeting_dobro_jutro',
    greeting: 'Dobro jutro',
    translation: 'Good morning',
    phonetic: 'ˈdɔbrɔ ˈjutrɔ',
    audioUrl: 'https://www.soundjay.com/misc/sounds-1018.wav',
    imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
    context: 'neutral',
    timeOfDay: 'morning',
    culturalNotes: {
      en: 'Standard morning greeting until noon. Used in both formal and informal settings.',
      hr: 'Standardni jutarnji pozdrav do podneva. Koristi se u formalnim i neformalnim situacijama.',
      es: 'Saludo matutino estándar hasta el mediodía. Se usa en situaciones formales e informales.',
    },
    difficulty: 1,
    cefrLevel: 'A1',
    tags: ['greeting', 'morning', 'basic', 'universal'],
    exampleSentences: [
      {
        original: 'Dobro jutro! Kako ste spavali?',
        translation: 'Good morning! How did you sleep?',
        audioUrl: 'https://www.soundjay.com/misc/sounds-1019.wav',
      },
      {
        original: 'Dobro jutro, lijepo je danas.',
        translation: 'Good morning, it\'s nice today.',
        audioUrl: 'https://www.soundjay.com/misc/sounds-1020.wav',
      },
    ],
  },
  {
    id: 'hr_greeting_dobra_vecer',
    greeting: 'Dobra večer',
    translation: 'Good evening',
    phonetic: 'ˈdɔbra ˈvɛtʃɛr',
    audioUrl: 'https://www.soundjay.com/misc/sounds-1021.wav',
    imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
    context: 'neutral',
    timeOfDay: 'evening',
    culturalNotes: {
      en: 'Used from late afternoon/early evening onwards. More formal than casual greetings.',
      hr: 'Koristi se od kasnog poslijepodneva/ranog navečer nadalje. Formalniji od ležernih pozdrava.',
      es: 'Se usa desde la tarde/noche temprana en adelante. Más formal que los saludos casuales.',
    },
    difficulty: 2,
    cefrLevel: 'A1',
    tags: ['greeting', 'evening', 'formal', 'polite'],
    exampleSentences: [
      {
        original: 'Dobra večer, kako ste danas?',
        translation: 'Good evening, how are you today?',
        audioUrl: 'https://www.soundjay.com/misc/sounds-1022.wav',
      },
    ],
  },
  {
    id: 'hr_greeting_bok',
    greeting: 'Bok',
    translation: 'Hi/Bye',
    phonetic: 'bɔk',
    audioUrl: 'https://www.soundjay.com/misc/sounds-1023.wav',
    imageUrl: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&h=300&fit=crop',
    context: 'informal',
    timeOfDay: 'any',
    culturalNotes: {
      en: 'Very casual greeting used among friends and young people. Can mean both hello and goodbye.',
      hr: 'Vrlo ležeran pozdrav koji koriste prijatelji i mladi ljudi. Može značiti i zdravo i doviđenja.',
      es: 'Saludo muy casual usado entre amigos y jóvenes. Puede significar tanto hola como adiós.',
    },
    difficulty: 1,
    cefrLevel: 'A1',
    tags: ['greeting', 'informal', 'casual', 'youth', 'versatile'],
    exampleSentences: [
      {
        original: 'Bok, kako si?',
        translation: 'Hi, how are you?',
        audioUrl: 'https://www.soundjay.com/misc/sounds-1024.wav',
      },
      {
        original: 'Bok, vidimo se sutra!',
        translation: 'Bye, see you tomorrow!',
        audioUrl: 'https://www.soundjay.com/misc/sounds-1025.wav',
      },
    ],
  },
  {
    id: 'hr_greeting_zdravo',
    greeting: 'Zdravo',
    translation: 'Hello',
    phonetic: 'ˈzdravo',
    audioUrl: 'https://www.soundjay.com/misc/sounds-1026.wav',
    imageUrl: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=400&h=300&fit=crop',
    context: 'informal',
    timeOfDay: 'any',
    culturalNotes: {
      en: 'Friendly, informal greeting suitable for friends and acquaintances. More casual than formal greetings.',
      hr: 'Prijateljski, neformalni pozdrav prikladan za prijatelje i poznanike. Ležerniji od formalnih pozdrava.',
      es: 'Saludo amigable e informal adecuado para amigos y conocidos. Más casual que los saludos formales.',
    },
    difficulty: 1,
    cefrLevel: 'A1',
    tags: ['greeting', 'informal', 'friendly', 'common'],
    exampleSentences: [
      {
        original: 'Zdravo, drago mi je vidjeti te!',
        translation: 'Hello, nice to see you!',
        audioUrl: 'https://www.soundjay.com/misc/sounds-1027.wav',
      },
    ],
  },
  {
    id: 'hr_greeting_pozdrav',
    greeting: 'Pozdrav',
    translation: 'Greetings',
    phonetic: 'ˈpɔzdrav',
    audioUrl: 'https://www.soundjay.com/misc/sounds-1028.wav',
    imageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=300&fit=crop',
    context: 'neutral',
    timeOfDay: 'any',
    culturalNotes: {
      en: 'General greeting that can be used in various contexts. Often used in written communication.',
      hr: 'Opći pozdrav koji se može koristiti u različitim kontekstima. Često se koristi u pisanoj komunikaciji.',
      es: 'Saludo general que se puede usar en varios contextos. A menudo se usa en comunicación escrita.',
    },
    difficulty: 3,
    cefrLevel: 'A1',
    tags: ['greeting', 'general', 'written', 'versatile'],
    exampleSentences: [
      {
        original: 'Pozdrav iz Zagreba!',
        translation: 'Greetings from Zagreb!',
        audioUrl: 'https://www.soundjay.com/misc/sounds-1029.wav',
      },
    ],
  },
];

// Exercise generators for different types
const generateFlashcardExercise = (greeting: GreetingItem): GreetingExercise => ({
  id: `flashcard_${greeting.id}`,
  type: 'flashcard',
  greetingId: greeting.id,
  instruction: {
    en: 'What does this Croatian greeting mean?',
    hr: 'Što znači ovaj hrvatski pozdrav?',
    es: '¿Qué significa este saludo croata?',
  },
  question: {
    en: greeting.greeting,
    hr: greeting.greeting,
    es: greeting.greeting,
  },
  correctAnswer: greeting.translation,
  audioUrl: greeting.audioUrl,
  imageUrl: greeting.imageUrl,
  hints: [
    {
      en: `This greeting is used ${greeting.timeOfDay !== 'any' ? `in the ${  greeting.timeOfDay}` : 'at any time'}`,
      hr: `Ovaj pozdrav se koristi ${greeting.timeOfDay !== 'any' ? greeting.timeOfDay === 'morning' ? 'ujutro' : greeting.timeOfDay === 'afternoon' ? 'poslijepodne' : 'navečer' : 'u bilo koje vrijeme'}`,
      es: `Este saludo se usa ${greeting.timeOfDay !== 'any' ? `en la ${  greeting.timeOfDay === 'morning' ? 'mañana' : greeting.timeOfDay === 'afternoon' ? 'tarde' : 'noche'}` : 'en cualquier momento'}`,
    },
  ],
  explanation: {
    en: `"${greeting.greeting}" means "${greeting.translation}". ${greeting.culturalNotes?.en || ''}`,
    hr: `"${greeting.greeting}" znači "${greeting.translation}". ${greeting.culturalNotes?.hr || ''}`,
    es: `"${greeting.greeting}" significa "${greeting.translation}". ${greeting.culturalNotes?.es || ''}`,
  },
  timeLimit: 15,
  xpReward: 10,
  difficulty: greeting.difficulty,
  adaptiveSettings: {
    minAccuracy: 70,
    maxAttempts: 3,
    hintsAllowed: 2,
  },
});

const generateListeningExercise = (greeting: GreetingItem): GreetingExercise => ({
  id: `listening_${greeting.id}`,
  type: 'listening',
  greetingId: greeting.id,
  instruction: {
    en: 'Listen and select the correct greeting',
    hr: 'Slušaj i odaberi točan pozdrav',
    es: 'Escucha y selecciona el saludo correcto',
  },
  question: {
    en: 'What greeting did you hear?',
    hr: 'Koji pozdrav ste čuli?',
    es: '¿Qué saludo escuchaste?',
  },
  options: [
    greeting.translation,
    'Good night',
    'Thank you',
    'Excuse me',
  ],
  correctAnswer: greeting.translation,
  audioUrl: greeting.audioUrl,
  hints: [
    {
      en: `Listen for the ${greeting.timeOfDay !== 'any' ? `${greeting.timeOfDay  } ` : ''}greeting`,
      hr: `Slušajte ${greeting.timeOfDay !== 'any' ? (greeting.timeOfDay === 'morning' ? 'jutarnji ' : greeting.timeOfDay === 'afternoon' ? 'poslijepodnevni ' : 'večernji ') : ''}pozdrav`,
      es: `Escucha el saludo ${greeting.timeOfDay !== 'any' ? `de ${  greeting.timeOfDay === 'morning' ? 'la mañana' : greeting.timeOfDay === 'afternoon' ? 'la tarde' : 'la noche'}` : ''}`,
    },
  ],
  explanation: {
    en: `You heard "${greeting.greeting}" which means "${greeting.translation}"`,
    hr: `Čuli ste "${greeting.greeting}" što znači "${greeting.translation}"`,
    es: `Escuchaste "${greeting.greeting}" que significa "${greeting.translation}"`,
  },
  timeLimit: 20,
  xpReward: 15,
  difficulty: greeting.difficulty + 1,
  adaptiveSettings: {
    minAccuracy: 60,
    maxAttempts: 3,
    hintsAllowed: 1,
  },
});

const generateFillBlankExercise = (greeting: GreetingItem): GreetingExercise => {
  const sentence = greeting.exampleSentences[0];
  const words = sentence.original.split(' ');
  const blankIndex = words.findIndex(word => word.toLowerCase().includes(greeting.greeting.toLowerCase().split(' ')[0]));
  const blankedSentence = words.map((word, index) => 
    index === blankIndex ? '____' : word,
  ).join(' ');

  return {
    id: `fillblank_${greeting.id}`,
    type: 'fill_blank',
    greetingId: greeting.id,
    instruction: {
      en: 'Fill in the blank with the correct greeting',
      hr: 'Popunite prazninu s točnim pozdravom',
      es: 'Completa el espacio en blanco con el saludo correcto',
    },
    question: {
      en: blankedSentence,
      hr: blankedSentence,
      es: blankedSentence,
    },
    options: [
      greeting.greeting.split(' ')[0],
      'Hvala',
      'Molim',
      'Izvините',
    ],
    correctAnswer: greeting.greeting.split(' ')[0],
    audioUrl: sentence.audioUrl,
    hints: [
      {
        en: `This is a ${greeting.context} ${greeting.timeOfDay !== 'any' ? `${greeting.timeOfDay  } ` : ''}greeting`,
        hr: `Ovo je ${greeting.context === 'formal' ? 'formalan' : greeting.context === 'informal' ? 'neformalan' : 'neutralan'} ${greeting.timeOfDay !== 'any' ? (greeting.timeOfDay === 'morning' ? 'jutarnji ' : greeting.timeOfDay === 'afternoon' ? 'poslijepodnevni ' : 'večernji ') : ''}pozdrav`,
        es: `Este es un saludo ${greeting.context === 'formal' ? 'formal' : greeting.context === 'informal' ? 'informal' : 'neutral'} ${greeting.timeOfDay !== 'any' ? `de ${  greeting.timeOfDay === 'morning' ? 'la mañana' : greeting.timeOfDay === 'afternoon' ? 'la tarde' : 'la noche'}` : ''}`,
      },
    ],
    explanation: {
      en: `The sentence "${sentence.original}" means "${sentence.translation}"`,
      hr: `Rečenica "${sentence.original}" znači "${sentence.translation}"`,
      es: `La oración "${sentence.original}" significa "${sentence.translation}"`,
    },
    timeLimit: 25,
    xpReward: 20,
    difficulty: greeting.difficulty + 1,
    adaptiveSettings: {
      minAccuracy: 75,
      maxAttempts: 3,
      hintsAllowed: 2,
    },
  };
};

const generateSpeakingExercise = (greeting: GreetingItem): GreetingExercise => ({
  id: `speaking_${greeting.id}`,
  type: 'pronunciation',
  greetingId: greeting.id,
  instruction: {
    en: 'Listen and repeat the greeting. Try to match the pronunciation.',
    hr: 'Slušajte i ponovite pozdrav. Pokušajte uskladiti izgovor.',
    es: 'Escucha y repite el saludo. Trata de igualar la pronunciación.',
  },
  question: {
    en: `Say: "${greeting.greeting}"`,
    hr: `Recite: "${greeting.greeting}"`,
    es: `Di: "${greeting.greeting}"`,
  },
  correctAnswer: greeting.greeting,
  audioUrl: greeting.audioUrl,
  hints: [
    {
      en: greeting.phonetic ? `Pronunciation guide: ${greeting.phonetic}` : 'Listen carefully to the audio',
      hr: greeting.phonetic ? `Vodič za izgovor: ${greeting.phonetic}` : 'Pažljivo slušajte audio',
      es: greeting.phonetic ? `Guía de pronunciación: ${greeting.phonetic}` : 'Escucha atentamente el audio',
    },
  ],
  explanation: {
    en: `"${greeting.greeting}" is pronounced as ${greeting.phonetic || 'shown in the audio'}`,
    hr: `"${greeting.greeting}" se izgovara kao ${greeting.phonetic || 'prikazano u audiju'}`,
    es: `"${greeting.greeting}" se pronuncia como ${greeting.phonetic || 'se muestra en el audio'}`,
  },
  timeLimit: 30,
  xpReward: 25,
  difficulty: greeting.difficulty + 2,
  adaptiveSettings: {
    minAccuracy: 65,
    maxAttempts: 5,
    hintsAllowed: 3,
  },
});

// Generate all exercises for a greeting
const generateExercisesForGreeting = (greeting: GreetingItem): GreetingExercise[] => [
  generateFlashcardExercise(greeting),
  generateListeningExercise(greeting),
  generateFillBlankExercise(greeting),
  generateSpeakingExercise(greeting),
];

// Mini-lessons structure
export const greetingsMiniLessons: GreetingMiniLesson[] = [
  {
    id: 'lesson_basic_greetings_1',
    title: {
      en: 'Morning & Afternoon Greetings',
      hr: 'Jutarnji i poslijepodnevni pozdravi',
      es: 'Saludos de mañana y tarde',
    },
    description: {
      en: 'Learn the most common Croatian greetings for morning and afternoon',
      hr: 'Naučite najčešće hrvatske pozdrave za jutro i poslijepodne',
      es: 'Aprende los saludos croatas más comunes para la mañana y la tarde',
    },
    greetings: [
      croatianGreetings.find(g => g.id === 'hr_greeting_dobro_jutro')!,
      croatianGreetings.find(g => g.id === 'hr_greeting_dobar_dan')!,
    ],
    exercises: [
      ...generateExercisesForGreeting(croatianGreetings.find(g => g.id === 'hr_greeting_dobro_jutro')!),
      ...generateExercisesForGreeting(croatianGreetings.find(g => g.id === 'hr_greeting_dobar_dan')!),
    ],
    estimatedTime: 90, // 1.5 minutes
    xpReward: 50,
    completionCriteria: {
      minimumAccuracy: 70,
      requiredExercises: ['flashcard_hr_greeting_dobro_jutro', 'flashcard_hr_greeting_dobar_dan'],
    },
  },
  {
    id: 'lesson_basic_greetings_2',
    title: {
      en: 'Evening & Casual Greetings',
      hr: 'Večernji i ležerni pozdravi',
      es: 'Saludos de noche y casuales',
    },
    description: {
      en: 'Master evening greetings and casual ways to say hello',
      hr: 'Savladajte večernje pozdrave i ležerne načine pozdrava',
      es: 'Domina los saludos de noche y las formas casuales de saludar',
    },
    greetings: [
      croatianGreetings.find(g => g.id === 'hr_greeting_dobra_vecer')!,
      croatianGreetings.find(g => g.id === 'hr_greeting_bok')!,
      croatianGreetings.find(g => g.id === 'hr_greeting_zdravo')!,
    ],
    exercises: [
      ...generateExercisesForGreeting(croatianGreetings.find(g => g.id === 'hr_greeting_dobra_vecer')!),
      ...generateExercisesForGreeting(croatianGreetings.find(g => g.id === 'hr_greeting_bok')!),
      ...generateExercisesForGreeting(croatianGreetings.find(g => g.id === 'hr_greeting_zdravo')!),
    ],
    estimatedTime: 120, // 2 minutes
    xpReward: 75,
    completionCriteria: {
      minimumAccuracy: 70,
      requiredExercises: [
        'flashcard_hr_greeting_dobra_vecer',
        'flashcard_hr_greeting_bok',
        'listening_hr_greeting_zdravo',
      ],
    },
    unlockRequirements: {
      previousLessons: ['lesson_basic_greetings_1'],
    },
  },
  {
    id: 'lesson_basic_greetings_3',
    title: {
      en: 'Advanced Greetings & Review',
      hr: 'Napredni pozdravi i ponavljanje',
      es: 'Saludos avanzados y repaso',
    },
    description: {
      en: 'Learn formal greetings and review all basic greetings',
      hr: 'Naučite formalne pozdrave i ponovite sve osnovne pozdrave',
      es: 'Aprende saludos formales y repasa todos los saludos básicos',
    },
    greetings: [
      croatianGreetings.find(g => g.id === 'hr_greeting_pozdrav')!,
      ...croatianGreetings.slice(0, 3), // Review previous greetings
    ],
    exercises: [
      ...generateExercisesForGreeting(croatianGreetings.find(g => g.id === 'hr_greeting_pozdrav')!),
      // Mixed review exercises
      {
        id: 'mixed_review_greetings',
        type: 'multiple_choice',
        greetingId: 'mixed',
        instruction: {
          en: 'Choose the most appropriate greeting for each situation',
          hr: 'Odaberite najprikladniji pozdrav za svaku situaciju',
          es: 'Elige el saludo más apropiado para cada situación',
        },
        question: {
          en: 'You meet your teacher at 2 PM. What do you say?',
          hr: 'Susrećete svog učitelja u 14 sati. Što kažete?',
          es: 'Te encuentras con tu profesor a las 2 PM. ¿Qué dices?',
        },
        options: ['Dobro jutro', 'Dobar dan', 'Dobra večer', 'Bok'],
        correctAnswer: 'Dobar dan',
        explanation: {
          en: '"Dobar dan" is the appropriate greeting for afternoon (after noon)',
          hr: '"Dobar dan" je prikladan pozdrav za poslijepodne (nakon podneva)',
          es: '"Dobar dan" es el saludo apropiado para la tarde (después del mediodía)',
        },
        timeLimit: 20,
        xpReward: 30,
        difficulty: 3,
        adaptiveSettings: {
          minAccuracy: 80,
          maxAttempts: 2,
          hintsAllowed: 1,
        },
      },
    ],
    estimatedTime: 150, // 2.5 minutes
    xpReward: 100,
    completionCriteria: {
      minimumAccuracy: 75,
      requiredExercises: [
        'flashcard_hr_greeting_pozdrav',
        'mixed_review_greetings',
        'speaking_hr_greeting_pozdrav',
      ],
    },
    unlockRequirements: {
      previousLessons: ['lesson_basic_greetings_1', 'lesson_basic_greetings_2'],
    },
  },
];

// Complete Greetings Module
export const basicGreetingsModule: GreetingsModule = {
  id: 'module_basic_greetings',
  title: {
    en: 'Basic Greetings',
    hr: 'Osnovni pozdravi',
    es: 'Saludos básicos',
  },
  description: {
    en: 'Master essential Croatian greetings for daily conversations. Learn when and how to use formal and informal greetings.',
    hr: 'Savladajte osnovne hrvatske pozdrave za svakodnevne razgovore. Naučite kada i kako koristiti formalne i neformalne pozdrave.',
    es: 'Domina los saludos croatas esenciales para conversaciones diarias. Aprende cuándo y cómo usar saludos formales e informales.',
  },
  miniLessons: greetingsMiniLessons,
  totalEstimatedTime: 360, // 6 minutes total
  totalXPReward: 225,
  completionReward: {
    xp: 50, // Bonus XP for completing the module
    achievement: 'greeting_master',
    unlocksNext: 'module_basic_introductions',
  },
  progressTracking: {
    lessonsCompleted: 0,
    totalLessons: greetingsMiniLessons.length,
    accuracy: 0,
    timeSpent: 0,
    streakDays: 0,
  },
};
