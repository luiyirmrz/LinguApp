import {
  LessonContentSchema,
  MultilingualContent,
  CEFRLevel,
  ExerciseType,
} from '@/types';
import {
  createMultilingualContent,
  createLessonContentSchema,
  generateExerciseId,
  generateLessonId,
  exerciseTypeTemplates,
} from './multilingualLessonFramework';

// Sample lesson content for different language pairs and exercise types
export const sampleLessonContent: LessonContentSchema[] = [
  // English to Spanish - A1 Level - Word-Image Match
  createLessonContentSchema(
    generateLessonId('es', 'A1', 1, 1, 1),
    'en', // main language (UI)
    'es', // target language (learning)
    'A1',
    1, // module
    1, // lesson
    'match',
    {
      instruction: createMultilingualContent({
        en: 'Match the Spanish words with the correct images',
        es: 'Empareja las palabras en español con las imágenes correctas',
      }),
      question: createMultilingualContent({
        en: 'Select the correct image for each Spanish word',
        es: 'Selecciona la imagen correcta para cada palabra en español',
      }),
      options: [
        createMultilingualContent({ en: 'apple', es: 'manzana' }),
        createMultilingualContent({ en: 'book', es: 'libro' }),
        createMultilingualContent({ en: 'house', es: 'casa' }),
        createMultilingualContent({ en: 'car', es: 'coche' }),
      ],
      correctAnswer: ['manzana', 'libro', 'casa', 'coche'],
      explanation: createMultilingualContent({
        en: 'These are basic Spanish nouns for everyday objects',
        es: 'Estos son sustantivos básicos en español para objetos cotidianos',
      }),
      hints: [
        createMultilingualContent({
          en: 'Think about the shape and use of each object',
          es: 'Piensa en la forma y el uso de cada objeto',
        }),
      ],
    },
    {
      type: 'wordImageMatch',
      words: [
        {
          id: 'vocab_manzana_001',
          word: 'manzana',
          translation: 'apple',
          imageUrl: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=300',
          audioUrl: 'https://example.com/audio/manzana.mp3',
          difficulty: 1,
        },
        {
          id: 'vocab_libro_002',
          word: 'libro',
          translation: 'book',
          imageUrl: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300',
          audioUrl: 'https://example.com/audio/libro.mp3',
          difficulty: 1,
        },
        {
          id: 'vocab_casa_003',
          word: 'casa',
          translation: 'house',
          imageUrl: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=300',
          audioUrl: 'https://example.com/audio/casa.mp3',
          difficulty: 1,
        },
        {
          id: 'vocab_coche_004',
          word: 'coche',
          translation: 'car',
          imageUrl: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=300',
          audioUrl: 'https://example.com/audio/coche.mp3',
          difficulty: 1,
        },
      ],
      timeLimit: 60,
      maxAttempts: 3,
      showTranslations: true,
    },
    {
      difficulty: 1,
      xpReward: 15,
      estimatedTime: 60,
      skills: ['vocabulary', 'recognition'],
      topics: ['everyday_objects', 'nouns'],
    },
  ),

  // Spanish to English - A1 Level - Sentence Building
  createLessonContentSchema(
    generateLessonId('en', 'A1', 1, 1, 2),
    'es', // main language (UI)
    'en', // target language (learning)
    'A1',
    1, // module
    2, // lesson
    'dragDrop',
    {
      instruction: createMultilingualContent({
        es: 'Ordena las palabras para formar una oración correcta en inglés',
        en: 'Arrange the words to form a correct sentence in English',
      }),
      question: createMultilingualContent({
        es: 'Forma la oración: "Yo tengo un perro"',
        en: 'Form the sentence: "I have a dog"',
      }),
      correctAnswer: 'I have a dog',
      explanation: createMultilingualContent({
        es: 'En inglés, el orden básico es Sujeto + Verbo + Objeto',
        en: 'In English, the basic order is Subject + Verb + Object',
      }),
      hints: [
        createMultilingualContent({
          es: 'Comienza con el pronombre personal',
          en: 'Start with the personal pronoun',
        }),
      ],
    },
    {
      type: 'sentenceBuilding',
      targetSentence: 'I have a dog',
      translation: 'Yo tengo un perro',
      words: ['I', 'have', 'a', 'dog'],
      distractorWords: ['cat', 'am', 'the', 'big'],
      audioUrl: 'https://example.com/audio/i-have-a-dog.mp3',
      hints: [
        createMultilingualContent({
          es: 'Recuerda el orden: Sujeto + Verbo + Objeto',
          en: 'Remember the order: Subject + Verb + Object',
        }),
        createMultilingualContent({
          es: 'Usa "a" antes de objetos singulares',
          en: 'Use "a" before singular objects',
        }),
      ],
    },
    {
      difficulty: 2,
      xpReward: 20,
      estimatedTime: 90,
      skills: ['grammar', 'sentence_structure'],
      topics: ['present_tense', 'possession'],
    },
  ),

  // French to English - A2 Level - Fill in the Blank
  createLessonContentSchema(
    generateLessonId('en', 'A2', 2, 1, 1),
    'fr', // main language (UI)
    'en', // target language (learning)
    'A2',
    2, // module
    1, // lesson
    'fillBlank',
    {
      instruction: createMultilingualContent({
        fr: 'Complétez les phrases avec les mots corrects en anglais',
        en: 'Complete the sentences with the correct English words',
      }),
      question: createMultilingualContent({
        fr: 'Je _____ à l\'école tous les jours',
        en: 'I _____ to school every day',
      }),
      options: [
        createMultilingualContent({ fr: 'vais', en: 'go' }),
        createMultilingualContent({ fr: 'mange', en: 'eat' }),
        createMultilingualContent({ fr: 'dors', en: 'sleep' }),
        createMultilingualContent({ fr: 'cours', en: 'run' }),
      ],
      correctAnswer: 'go',
      explanation: createMultilingualContent({
        fr: '"Go" est le verbe correct pour exprimer le mouvement vers un lieu',
        en: '"Go" is the correct verb to express movement to a place',
      }),
    },
    {
      type: 'fillBlank',
      sentence: 'I _____ to school every day',
      translation: 'Je vais à l\'école tous les jours',
      blanks: [
        {
          position: 1,
          correctAnswer: 'go',
          options: ['go', 'eat', 'sleep', 'run'],
        },
      ],
      audioUrl: 'https://example.com/audio/i-go-to-school.mp3',
    },
    {
      difficulty: 2,
      xpReward: 18,
      estimatedTime: 75,
      skills: ['grammar', 'verbs'],
      topics: ['present_simple', 'daily_routines'],
    },
  ),

  // Chinese to English - A1 Level - Listening Challenge
  createLessonContentSchema(
    generateLessonId('en', 'A1', 1, 2, 1),
    'zh', // main language (UI)
    'en', // target language (learning)
    'A1',
    1, // module
    1, // lesson
    'listening',
    {
      instruction: createMultilingualContent({
        zh: '仔细听英语音频并回答问题',
        en: 'Listen carefully to the English audio and answer the questions',
      }),
      question: createMultilingualContent({
        zh: '这个人在说什么？',
        en: 'What is this person saying?',
      }),
      options: [
        createMultilingualContent({ zh: '你好', en: 'Hello' }),
        createMultilingualContent({ zh: '再见', en: 'Goodbye' }),
        createMultilingualContent({ zh: '谢谢', en: 'Thank you' }),
        createMultilingualContent({ zh: '对不起', en: 'Sorry' }),
      ],
      correctAnswer: 'Hello',
      explanation: createMultilingualContent({
        zh: '"Hello" 是英语中最常见的问候语',
        en: '"Hello" is the most common greeting in English',
      }),
    },
    {
      type: 'listeningChallenge',
      audioUrl: 'https://example.com/audio/hello-greeting.mp3',
      transcript: 'Hello, how are you today?',
      translation: '你好，你今天怎么样？',
      playbackSpeed: 1.0,
      questions: [
        {
          id: 'listening_question_001',
          question: createMultilingualContent({
            zh: '你听到了什么问候语？',
            en: 'What greeting did you hear?',
          }),
          options: [
            createMultilingualContent({ zh: '你好', en: 'Hello' }),
            createMultilingualContent({ zh: '再见', en: 'Goodbye' }),
            createMultilingualContent({ zh: '谢谢', en: 'Thank you' }),
            createMultilingualContent({ zh: '对不起', en: 'Sorry' }),
          ],
          correctAnswer: 'Hello',
        },
      ],
      allowReplay: true,
      maxReplays: 3,
    },
    {
      difficulty: 1,
      xpReward: 25,
      estimatedTime: 120,
      skills: ['listening', 'pronunciation'],
      topics: ['greetings', 'basic_conversation'],
    },
  ),

  // Italian to English - B1 Level - Speaking Challenge
  createLessonContentSchema(
    generateLessonId('en', 'B1', 3, 2, 1),
    'it', // main language (UI)
    'en', // target language (learning)
    'B1',
    3, // module
    1, // lesson
    'speaking',
    {
      instruction: createMultilingualContent({
        it: 'Pronuncia chiaramente la frase inglese',
        en: 'Pronounce the English phrase clearly',
      }),
      question: createMultilingualContent({
        it: 'Dì: "Vorrei prenotare un tavolo per due persone"',
        en: 'Say: "I would like to book a table for two people"',
      }),
      correctAnswer: 'I would like to book a table for two people',
      explanation: createMultilingualContent({
        it: 'Questa è una frase utile per prenotare al ristorante',
        en: 'This is a useful phrase for making restaurant reservations',
      }),
      hints: [
        createMultilingualContent({
          it: 'Concentrati sulla pronuncia di "would like"',
          en: 'Focus on the pronunciation of "would like"',
        }),
      ],
    },
    {
      type: 'speakingChallenge',
      targetPhrase: 'I would like to book a table for two people',
      translation: 'Vorrei prenotare un tavolo per due persone',
      phonetic: '/aɪ wʊd laɪk tuː bʊk ə ˈteɪbəl fɔːr tuː ˈpiːpəl/',
      audioUrl: 'https://example.com/audio/book-table.mp3',
      acceptableVariations: [
        'I would like to book a table for two people',
        'I\'d like to book a table for two people',
        'I would like to reserve a table for two people',
      ],
      pronunciationTips: [
        createMultilingualContent({
          it: 'Pronuncia "would" come "wʊd"',
          en: 'Pronounce "would" as "wʊd"',
        }),
        createMultilingualContent({
          it: 'Enfatizza "book" e "table"',
          en: 'Emphasize "book" and "table"',
        }),
      ],
      recordingTimeLimit: 30,
      allowRetry: true,
    },
    {
      difficulty: 3,
      xpReward: 30,
      estimatedTime: 90,
      skills: ['speaking', 'pronunciation', 'conversation'],
      topics: ['restaurant', 'reservations', 'polite_requests'],
    },
  ),
];

// Helper function to get sample content by language pair
export const getSampleContentByLanguagePair = (
  mainLanguage: string,
  targetLanguage: string,
  level?: CEFRLevel,
): LessonContentSchema[] => {
  return sampleLessonContent.filter(content => 
    content.mainLanguage === mainLanguage && 
    content.targetLanguage === targetLanguage &&
    (!level || content.level === level),
  );
};

// Helper function to get sample content by exercise type
export const getSampleContentByExerciseType = (
  exerciseType: ExerciseType,
): LessonContentSchema[] => {
  return sampleLessonContent.filter(content => 
    content.exerciseType === exerciseType,
  );
};

// Helper function to get sample content by CEFR level
export const getSampleContentByLevel = (
  level: CEFRLevel,
): LessonContentSchema[] => {
  return sampleLessonContent.filter(content => 
    content.level === level,
  );
};

export default {
  sampleLessonContent,
  getSampleContentByLanguagePair,
  getSampleContentByExerciseType,
  getSampleContentByLevel,
};
