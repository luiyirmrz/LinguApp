// 📁 RUTA: /levels/A1/italian-a1-lessons.ts
// Hook para generar todas las lecciones del nivel A1 en italiano según CEFR (600 palabras)

import { CEFRLevel, MultilingualContent, MultilingualLesson, MultilingualExercise, VocabularyItem, ExerciseType } from '@/types';

// Temas para el nivel A1 en italiano
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
const ITALIAN_A1_VOCABULARY: { [key: string]: { word: string; translation: string; example: string; }[] } = {
  basic_greetings: [
    { word: 'Ciao', translation: 'Hi/Bye', example: 'Ciao! Come stai?' },
    { word: 'Buongiorno', translation: 'Good morning', example: 'Buongiorno, come sta?' },
    { word: 'Buonasera', translation: 'Good evening', example: 'Buonasera, come va?' },
    { word: 'Arrivederci', translation: 'Goodbye', example: 'Arrivederci, a domani!' },
    { word: 'Per favore', translation: 'Please', example: 'Un caffè, per favore.' },
    { word: 'Grazie', translation: 'Thank you', example: 'Grazie per il tuo aiuto.' },
    { word: 'Prego', translation: 'You\'re welcome', example: '—Grazie. —Prego.' },
    { word: 'Scusa', translation: 'Excuse me/Sorry (informal)', example: 'Scusa, dov\'è la stazione?' },
    { word: 'Mi dispiace', translation: 'I\'m sorry', example: 'Mi dispiace, non volevo disturbare.' },
    { word: 'Come stai?', translation: 'How are you? (informal)', example: 'Ciao, come stai?' },
    { word: 'Come sta?', translation: 'How are you? (formal)', example: 'Buongiorno, come sta?' },
    { word: 'Sto bene', translation: 'I\'m fine', example: 'Sto bene, grazie.' },
    { word: 'E tu?', translation: 'And you? (informal)', example: 'Sto bene, e tu?' },
    { word: 'E Lei?', translation: 'And you? (formal)', example: 'Sto bene, e Lei?' },
    { word: 'Piacere', translation: 'Nice to meet you', example: 'Piacere di conoscerla.' },
    { word: 'Anch\'io', translation: 'Me too', example: '—Piacere. —Anch\'io.' },
    { word: 'Come ti chiami?', translation: 'What\'s your name? (informal)', example: 'Come ti chiami?' },
    { word: 'Mi chiamo...', translation: 'My name is...', example: 'Mi chiamo Maria.' },
    { word: 'Di dove sei?', translation: 'Where are you from? (informal)', example: 'Di dove sei?' },
    { word: 'Sono di...', translation: 'I\'m from...', example: 'Sono di Roma.' },
    { word: 'Parli inglese?', translation: 'Do you speak English? (informal)', example: 'Parli inglese?' },
    { word: 'Non capisco', translation: 'I don\'t understand', example: 'Non capisco, puoi ripetere?' },
    { word: 'Puoi ripetere?', translation: 'Can you repeat? (informal)', example: 'Puoi ripetere, per favore?' },
    { word: 'Cosa significa?', translation: 'What does it mean?', example: 'Cosa significa questa parola?' },
    { word: 'Come si dice... in italiano?', translation: 'How do you say... in Italian?', example: 'Come si dice "apple" in italiano?' },
    { word: 'Sì', translation: 'Yes', example: 'Sì, certo.' },
    { word: 'No', translation: 'No', example: 'No, grazie.' },
    { word: 'Forse', translation: 'Maybe', example: 'Forse domani.' },
    { word: 'Certo', translation: 'Of course', example: 'Certo, posso aiutarti.' },
    { word: 'A presto', translation: 'See you soon', example: 'A presto, ci sentiamo!' },
  ],
  numbers: [
    { word: 'Uno', translation: 'One', example: 'Ho un fratello.' },
    { word: 'Due', translation: 'Two', example: 'Ho due gatti.' },
    { word: 'Tre', translation: 'Three', example: 'Sono le tre del pomeriggio.' },
    { word: 'Quattro', translation: 'Four', example: 'Abito al quarto piano.' },
    { word: 'Cinque', translation: 'Five', example: 'Ho cinque anni.' },
    { word: 'Sei', translation: 'Six', example: 'La lezione inizia alle sei.' },
    { word: 'Sette', translation: 'Seven', example: 'Ci sono sette giorni nella settimana.' },
    { word: 'Otto', translation: 'Eight', example: 'Ho otto libri.' },
    { word: 'Nove', translation: 'Nine', example: 'Il mio numero preferito è nove.' },
    { word: 'Dieci', translation: 'Ten', example: 'Ho dieci dita.' },
    { word: 'Undici', translation: 'Eleven', example: 'Ho undici anni.' },
    { word: 'Dodici', translation: 'Twelve', example: 'Ci sono dodici mesi nell\'anno.' },
    { word: 'Tredici', translation: 'Thirteen', example: 'Ho tredici cugini.' },
    { word: 'Quattordici', translation: 'Fourteen', example: 'Ho quattordici matite.' },
    { word: 'Quindici', translation: 'Fifteen', example: 'Ho quindici dollari.' },
    { word: 'Sedici', translation: 'Sixteen', example: 'Ho sedici anni.' },
    { word: 'Diciassette', translation: 'Seventeen', example: 'Ho diciassette libri.' },
    { word: 'Diciotto', translation: 'Eighteen', example: 'Ho diciotto anni.' },
    { word: 'Diciannove', translation: 'Nineteen', example: 'Ho diciannove dollari.' },
    { word: 'Venti', translation: 'Twenty', example: 'Ho venti minuti.' },
    { word: 'Ventuno', translation: 'Twenty-one', example: 'Ho ventun anni.' },
    { word: 'Ventidue', translation: 'Twenty-two', example: 'Ho ventidue libri.' },
    { word: 'Ventitré', translation: 'Twenty-three', example: 'Ho ventitré anni.' },
    { word: 'Ventiquattro', translation: 'Twenty-four', example: 'Ho ventiquattro ore.' },
    { word: 'Venticinque', translation: 'Twenty-five', example: 'Ho venticinque dollari.' },
    { word: 'Trenta', translation: 'Thirty', example: 'Ho trenta minuti.' },
    { word: 'Quaranta', translation: 'Forty', example: 'Ho quarant\'anni.' },
    { word: 'Cinquanta', translation: 'Fifty', example: 'Ho cinquanta dollari.' },
    { word: 'Sessanta', translation: 'Sixty', example: 'Ho sessanta minuti.' },
    { word: 'Cento', translation: 'One hundred', example: 'Ho cento libri.' },
  ],
  // Continuaría con los demás temas hasta completar 600 palabras...
};

// Función para generar una lección (misma estructura que los anteriores)
const generateLesson = (
  theme: string,
  lessonNumber: number,
  words: { word: string; translation: string; example: string; }[],
  startIndex: number,
  endIndex: number,
): MultilingualLesson => {
  const lessonWords = words.slice(startIndex, endIndex);
  
  return {
    id: `it_a1_${theme}_l${lessonNumber}`,
    title: {
      en: `${theme.replace('_', ' ')} Part ${lessonNumber}`,
      es: `${theme.replace('_', ' ')} Parte ${lessonNumber}`,
      fr: `${theme.replace('_', ' ')} Partie ${lessonNumber}`,
      it: `${theme.replace('_', ' ')} Parte ${lessonNumber}`,
      hr: `${theme.replace('_', ' ')} Dio ${lessonNumber}`,
      zh: `${theme.replace('_', ' ')} 第${lessonNumber}部分`,
    },
    type: 'vocabulary',
    completed: false,
    description: {
      en: `Learn basic Italian vocabulary about ${theme.replace('_', ' ')}`,
      es: `Aprende vocabulario básico en italiano sobre ${theme.replace('_', ' ')}`,
      fr: `Apprenez le vocabulaire italien de base sur ${theme.replace('_', ' ')}`,
      it: `Impara il vocabolario italiano di base su ${theme.replace('_', ' ')}`,
      hr: `Naučite osnovni talijanski vokabular o ${theme.replace('_', ' ')}`,
      zh: `学习关于${theme.replace('_', ' ')}的基础意大利语词汇`,
    },
    difficulty: 1,
    xpReward: 15,
    estimatedTime: 5,
    targetLanguage: 'it',
    mainLanguage: 'en',
    vocabularyReviewed: [],
    grammarConcepts: [],
    vocabularyIntroduced: lessonWords.map((item, index) => ({
      id: `it_a1_${theme}_w${startIndex + index + 1}`,
      word: item.word,
      translation: item.translation,
      pronunciation: '',
      phonetic: '',
      partOfSpeech: 'noun' as const,
      difficulty: 1,
      frequency: 5,
      mastered: false,
      exampleSentences: [{
        original: item.example,
        translation: item.translation,
      }],
      tags: [theme],
      cefrLevel: 'A1' as const,
    })),
    exercises: [
      {
        id: `it_a1_${theme}_l${lessonNumber}_e1`,
        type: 'multiple_choice' as ExerciseType,
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
        difficulty: 1,
        xpReward: 10,
        targetLanguage: 'it',
        mainLanguage: 'en',
        skills: ['vocabulary', 'reading'],
      },
      {
        id: `it_a1_${theme}_l${lessonNumber}_e2`,
        type: 'fill_blank' as ExerciseType,
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
        difficulty: 1,
        xpReward: 10,
        targetLanguage: 'it',
        mainLanguage: 'en',
        skills: ['vocabulary', 'reading'],
      },
    ],
    learningObjectives: [
      {
        en: `Learn 10 new Italian words about ${theme.replace('_', ' ')}`,
        es: `Aprende 10 nuevas palabras en italiano sobre ${theme.replace('_', ' ')}`,
        fr: `Apprenez 10 nouveaux mots italiens sur ${theme.replace('_', ' ')}`,
        it: `Impara 10 nuove parole italiane su ${theme.replace('_', ' ')}`,
        hr: `Naučite 10 novih talijanskih riječi o ${theme.replace('_', ' ')}`,
        zh: `学习10个关于${theme.replace('_', ' ')}的意大利语新单词`,
      },
    ],
    completionCriteria: {
      minimumAccuracy: 80,
      requiredExercises: [],
    },
  };
};

// Función principal para generar todas las lecciones A1 en italiano
export const generateItalianA1Lessons = (): MultilingualLesson[] => {
  const lessons: MultilingualLesson[] = [];
  let lessonCounter = 1;

  for (let i = 0; i < A1_THEMES.length; i++) {
    const theme = A1_THEMES[i];
    const words = ITALIAN_A1_VOCABULARY[theme] || [];

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
export const italianA1Lessons: MultilingualLesson[] = generateItalianA1Lessons();

// Funciones auxiliares
export const getLessonsByTheme = (theme: string): MultilingualLesson[] => {
  return italianA1Lessons.filter(lesson => lesson.id.includes(theme));
};

export const getVocabularyByLessonId = (lessonId: string): VocabularyItem[] => {
  const lesson = italianA1Lessons.find(l => l.id === lessonId);
  return lesson ? lesson.vocabularyIntroduced : [];
};

export { A1_THEMES, ITALIAN_A1_VOCABULARY };
