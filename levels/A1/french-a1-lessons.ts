// 📁 RUTA: /levels/A1/french-a1-lessons.ts
// Hook para generar todas las lecciones del nivel A1 en francés según CEFR (600 palabras)

import { CEFRLevel, MultilingualContent, MultilingualLesson, MultilingualExercise, VocabularyItem, ExerciseType } from '@/types';

// Temas para el nivel A1 en francés
const A1_THEMES = [
  'basic_greetings',
  'numbers',
  'colors',
  'family',
  'food_basics',
  'weather',
  'days_week',
  'months',
  'body_parts',
  'clothing',
  'animals',
  'transport',
  'home_basics',
  'professions',
  'time',
  'directions',
  'shopping_basics',
  'restaurant_basics',
  'health_basics',
  'hobbies_basics',
];

// Palabras por tema (30 palabras por tema para alcanzar 600 palabras en 20 temas)
const FRENCH_A1_VOCABULARY: { [key: string]: { word: string; translation: string; example: string; }[] } = {
  basic_greetings: [
    { word: 'Bonjour', translation: 'Hello/Good morning', example: 'Bonjour, comment allez-vous?' },
    { word: 'Bonsoir', translation: 'Good evening', example: 'Bonsoir, comment ça va?' },
    { word: 'Salut', translation: 'Hi/Bye (informal)', example: 'Salut! Ça va?' },
    { word: 'Au revoir', translation: 'Goodbye', example: 'Au revoir, à demain!' },
    { word: 'S\'il vous plaît', translation: 'Please (formal)', example: 'Un café, s\'il vous plaît.' },
    { word: 'S\'il te plaît', translation: 'Please (informal)', example: 'Passe-moi le sel, s\'il te plaît.' },
    { word: 'Merci', translation: 'Thank you', example: 'Merci pour votre aide.' },
    { word: 'De rien', translation: 'You\'re welcome', example: '—Merci. —De rien.' },
    { word: 'Excusez-moi', translation: 'Excuse me (formal)', example: 'Excusez-moi, où est la gare?' },
    { word: 'Pardon', translation: 'Sorry', example: 'Pardon, je ne voulais pas vous déranger.' },
    { word: 'Comment allez-vous?', translation: 'How are you? (formal)', example: 'Bonjour, comment allez-vous?' },
    { word: 'Ça va?', translation: 'How are you? (informal)', example: 'Salut, ça va?' },
    { word: 'Ça va bien', translation: 'I\'m fine', example: 'Ça va bien, merci.' },
    { word: 'Et vous?', translation: 'And you? (formal)', example: 'Ça va bien, et vous?' },
    { word: 'Et toi?', translation: 'And you? (informal)', example: 'Ça va bien, et toi?' },
    { word: 'Enchanté(e)', translation: 'Nice to meet you', example: 'Enchanté de faire votre connaissance.' },
    { word: 'Moi aussi', translation: 'Me too', example: '—Enchanté. —Moi aussi.' },
    { word: 'Comment vous appelez-vous?', translation: 'What\'s your name? (formal)', example: 'Comment vous appelez-vous?' },
    { word: 'Je m\'appelle...', translation: 'My name is...', example: 'Je m\'appelle Marie.' },
    { word: 'D\'où venez-vous?', translation: 'Where are you from? (formal)', example: 'D\'où venez-vous?' },
    { word: 'Je viens de...', translation: 'I\'m from...', example: 'Je viens de France.' },
    { word: 'Parlez-vous anglais?', translation: 'Do you speak English? (formal)', example: 'Parlez-vous anglais?' },
    { word: 'Je ne comprends pas', translation: 'I don\'t understand', example: 'Je ne comprends pas, pouvez-vous répéter?' },
    { word: 'Pouvez-vous répéter?', translation: 'Can you repeat? (formal)', example: 'Pouvez-vous répéter, s\'il vous plaît?' },
    { word: 'Qu\'est-ce que ça veut dire?', translation: 'What does that mean?', example: 'Qu\'est-ce que ça veut dire?' },
    { word: 'Comment dit-on... en français?', translation: 'How do you say... in French?', example: 'Comment dit-on "apple" en français?' },
    { word: 'Oui', translation: 'Yes', example: 'Oui, bien sûr.' },
    { word: 'Non', translation: 'No', example: 'Non, merci.' },
    { word: 'Peut-être', translation: 'Maybe', example: 'Peut-être demain.' },
    { word: 'Bien sûr', translation: 'Of course', example: 'Bien sûr, je peux vous aider.' },
  ],
  numbers: [
    { word: 'Un', translation: 'One', example: 'J\'ai un frère.' },
    { word: 'Deux', translation: 'Two', example: 'J\'ai deux chats.' },
    { word: 'Trois', translation: 'Three', example: 'Il est trois heures.' },
    { word: 'Quatre', translation: 'Four', example: 'J\'habite au quatrième étage.' },
    { word: 'Cinq', translation: 'Five', example: 'J\'ai cinq ans.' },
    { word: 'Six', translation: 'Six', example: 'Le cours commence à six heures.' },
    { word: 'Sept', translation: 'Seven', example: 'Il y a sept jours dans la semaine.' },
    { word: 'Huit', translation: 'Eight', example: 'J\'ai huit livres.' },
    { word: 'Neuf', translation: 'Nine', example: 'Mon numéro préféré est neuf.' },
    { word: 'Dix', translation: 'Ten', example: 'J\'ai dix doigts.' },
    { word: 'Onze', translation: 'Eleven', example: 'J\'ai onze ans.' },
    { word: 'Douze', translation: 'Twelve', example: 'Il y a douze mois dans l\'année.' },
    { word: 'Treize', translation: 'Thirteen', example: 'J\'ai treize cousins.' },
    { word: 'Quatorze', translation: 'Fourteen', example: 'J\'ai quatorze crayons.' },
    { word: 'Quinze', translation: 'Fifteen', example: 'J\'ai quinze dollars.' },
    { word: 'Seize', translation: 'Sixteen', example: 'J\'ai seize ans.' },
    { word: 'Dix-sept', translation: 'Seventeen', example: 'J\'ai dix-sept livres.' },
    { word: 'Dix-huit', translation: 'Eighteen', example: 'J\'ai dix-huit ans.' },
    { word: 'Dix-neuf', translation: 'Nineteen', example: 'J\'ai dix-neuf dollars.' },
    { word: 'Vingt', translation: 'Twenty', example: 'J\'ai vingt minutes.' },
    { word: 'Vingt et un', translation: 'Twenty-one', example: 'J\'ai vingt et un ans.' },
    { word: 'Vingt-deux', translation: 'Twenty-two', example: 'J\'ai vingt-deux livres.' },
    { word: 'Vingt-trois', translation: 'Twenty-three', example: 'J\'ai vingt-trois ans.' },
    { word: 'Vingt-quatre', translation: 'Twenty-four', example: 'J\'ai vingt-quatre heures.' },
    { word: 'Vingt-cinq', translation: 'Twenty-five', example: 'J\'ai vingt-cinq dollars.' },
    { word: 'Trente', translation: 'Thirty', example: 'J\'ai trente minutes.' },
    { word: 'Quarante', translation: 'Forty', example: 'J\'ai quarante ans.' },
    { word: 'Cinquante', translation: 'Fifty', example: 'J\'ai cinquante dollars.' },
    { word: 'Soixante', translation: 'Sixty', example: 'J\'ai soixante minutes.' },
    { word: 'Cent', translation: 'One hundred', example: 'J\'ai cent livres.' },
  ],
  // Continuaría con los demás temas hasta completar 600 palabras...
};

// Función para generar una lección (misma estructura que el español)
const generateLesson = (
  theme: string,
  lessonNumber: number,
  words: { word: string; translation: string; example: string; }[],
  startIndex: number,
  endIndex: number,
): MultilingualLesson => {
  const lessonWords = words.slice(startIndex, endIndex);
  
  return {
    id: `fr_a1_${theme}_l${lessonNumber}`,
    title: {
      en: `${theme.replace('_', ' ')} Part ${lessonNumber}`,
      es: `${theme.replace('_', ' ')} Parte ${lessonNumber}`,
      fr: `${theme.replace('_', ' ')} Partie ${lessonNumber}`,
      it: `${theme.replace('_', ' ')} Parte ${lessonNumber}`,
      hr: `${theme.replace('_', ' ')} Dio ${lessonNumber}`,
      zh: `${theme.replace('_', ' ')} 第${lessonNumber}部分`,
    },
    type: 'vocabulary',
    difficulty: 1,
    xpReward: 15,
    estimatedTime: 5,
    completed: false,
    description: {
      en: `Learn French vocabulary related to ${theme.replace('_', ' ')}`,
      es: `Aprende vocabulario francés relacionado con ${theme.replace('_', ' ')}`,
      fr: `Apprenez le vocabulaire français lié à ${theme.replace('_', ' ')}`,
      it: `Impara il vocabolario francese relativo a ${theme.replace('_', ' ')}`,
      hr: `Naučite francuski vokabular vezan za ${theme.replace('_', ' ')}`,
      zh: `学习与${theme.replace('_', ' ')}相关的法语词汇`,
    },
    targetLanguage: 'fr',
    mainLanguage: 'en',
    vocabularyReviewed: [],
    grammarConcepts: [],
    completionCriteria: {
      minimumAccuracy: 80,
      requiredExercises: [`fr_a1_${theme}_l${lessonNumber}_e1`, `fr_a1_${theme}_l${lessonNumber}_e2`],
    },
    vocabularyIntroduced: lessonWords.map((item, index) => ({
      id: `fr_a1_${theme}_w${startIndex + index + 1}`,
      word: item.word,
      translation: item.translation,
      pronunciation: '',
      partOfSpeech: 'noun' as const,
      frequency: 5,
      mastered: false,
      difficulty: 1,
      exampleSentences: [{ original: item.example, translation: item.translation }],
      tags: [theme],
      cefrLevel: 'A1' as const,
    })),
    exercises: [
      {
        id: `fr_a1_${theme}_l${lessonNumber}_e1`,
        type: 'multiple_choice' as ExerciseType,
        difficulty: 1,
        xpReward: 10,
        targetLanguage: 'fr',
        mainLanguage: 'en',
        skills: ['vocabulary', 'reading'],
        instruction: {
          en: 'Choose the correct translation',
          es: 'Elige la traducción correcta',
          fr: 'Choisissez la bonne traduction',
          it: 'Scegli la traduzione corretta',
          hr: 'Odaberite točan prijevod',
          zh: '选择正确的翻译',
        },
        question: {
          en: `What is the meaning of "${lessonWords[0].word}"?`,
          es: `¿Cuál es el significado de "${lessonWords[0].word}"?`,
          fr: `Quelle est la signification de "${lessonWords[0].word}"?`,
          it: `Qual è il significato di "${lessonWords[0].word}"?`,
          hr: `Što znači "${lessonWords[0].word}"?`,
          zh: `"${lessonWords[0].word}"是什么意思？`,
        },
        options: [
          { en: lessonWords[0].translation, es: lessonWords[0].translation, fr: lessonWords[0].translation, it: lessonWords[0].translation, hr: lessonWords[0].translation, zh: lessonWords[0].translation },
          { en: lessonWords[1].translation, es: lessonWords[1].translation, fr: lessonWords[1].translation, it: lessonWords[1].translation, hr: lessonWords[1].translation, zh: lessonWords[1].translation },
          { en: lessonWords[2].translation, es: lessonWords[2].translation, fr: lessonWords[2].translation, it: lessonWords[2].translation, hr: lessonWords[2].translation, zh: lessonWords[2].translation },
          { en: lessonWords[3].translation, es: lessonWords[3].translation, fr: lessonWords[3].translation, it: lessonWords[3].translation, hr: lessonWords[3].translation, zh: lessonWords[3].translation },
        ],
        correctAnswer: lessonWords[0].translation,
        explanation: {
          en: `The word "${lessonWords[0].word}" means "${lessonWords[0].translation}" in English.`,
          es: `La palabra "${lessonWords[0].word}" significa "${lessonWords[0].translation}" en inglés.`,
          fr: `Le mot "${lessonWords[0].word}" signifie "${lessonWords[0].translation}" en anglais.`,
          it: `La parola "${lessonWords[0].word}" significa "${lessonWords[0].translation}" in inglese.`,
          hr: `Riječ "${lessonWords[0].word}" znači "${lessonWords[0].translation}" na engleskom.`,
          zh: `单词"${lessonWords[0].word}"在英语中意思是"${lessonWords[0].translation}"。`,
        },
      },
      {
        id: `fr_a1_${theme}_l${lessonNumber}_e2`,
        type: 'fill_blank' as ExerciseType,
        difficulty: 1,
        xpReward: 10,
        targetLanguage: 'fr',
        mainLanguage: 'en',
        skills: ['vocabulary', 'reading'],
        instruction: {
          en: 'Complete the sentence with the correct word',
          es: 'Completa la oración con la palabra correcta',
          fr: 'Complétez la phrase avec le mot correct',
          it: 'Completa la frase con la parola corretta',
          hr: 'Dopuni rečenicu točnom riječju',
          zh: '用正确的单词填空',
        },
        question: {
          en: lessonWords[0].example.replace(lessonWords[0].word, '_____'),
          es: lessonWords[0].example.replace(lessonWords[0].word, '_____'),
          fr: lessonWords[0].example.replace(lessonWords[0].word, '_____'),
          it: lessonWords[0].example.replace(lessonWords[0].word, '_____'),
          hr: lessonWords[0].example.replace(lessonWords[0].word, '_____'),
          zh: lessonWords[0].example.replace(lessonWords[0].word, '_____'),
        },
        correctAnswer: lessonWords[0].word,
        explanation: {
          en: `The complete sentence is: "${lessonWords[0].example}"`,
          es: `La oración completa es: "${lessonWords[0].example}"`,
          fr: `La phrase complète est: "${lessonWords[0].example}"`,
          it: `La frase completa è: "${lessonWords[0].example}"`,
          hr: `Potpuna rečenica je: "${lessonWords[0].example}"`,
          zh: `完整的句子是："${lessonWords[0].example}"`,
        },
      },
    ],
    learningObjectives: [
      {
        en: `Learn 10 new French words about ${theme.replace('_', ' ')}`,
        es: `Aprende 10 nuevas palabras en francés sobre ${theme.replace('_', ' ')}`,
        fr: `Apprenez 10 nouveaux mots français sur ${theme.replace('_', ' ')}`,
        it: `Impara 10 nuove parole francesi su ${theme.replace('_', ' ')}`,
        hr: `Naučite 10 novih francuskih riječi o ${theme.replace('_', ' ')}`,
        zh: `学习10个关于${theme.replace('_', ' ')}的法语新单词`,
      },
    ],
  };
};

// Función principal para generar todas las lecciones A1 en francés
export const generateFrenchA1Lessons = (): MultilingualLesson[] => {
  const lessons: MultilingualLesson[] = [];
  let lessonCounter = 1;

  for (let i = 0; i < A1_THEMES.length; i++) {
    const theme = A1_THEMES[i];
    const words = FRENCH_A1_VOCABULARY[theme] || [];

    for (let j = 0; j < 3; j++) {
      const startIndex = j * 10;
      const endIndex = startIndex + 10;
      
      if (startIndex < words.length) {
        const lesson = generateLesson(theme, j + 1, words, startIndex, endIndex);
        lessons.push(lesson);
        lessonCounter++;
      }
    }
  }

  return lessons;
};

// Exportar lecciones generadas
export const frenchA1Lessons: MultilingualLesson[] = generateFrenchA1Lessons();

// Funciones auxiliares
export const getLessonsByTheme = (theme: string): MultilingualLesson[] => {
  return frenchA1Lessons.filter(lesson => lesson.id.includes(theme));
};

export const getVocabularyByLessonId = (lessonId: string): VocabularyItem[] => {
  const lesson = frenchA1Lessons.find(l => l.id === lessonId);
  return lesson ? lesson.vocabularyIntroduced : [];
};

export { A1_THEMES, FRENCH_A1_VOCABULARY };
