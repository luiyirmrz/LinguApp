// 📁 RUTA: /levels/A1/chinese-a1-lessons.ts
// Hook para generar todas las lecciones del nivel A1 en chino (mandarín) según CEFR (600 palabras)

import { CEFRLevel, MultilingualContent, MultilingualLesson, MultilingualExercise, VocabularyItem, ExerciseType } from '@/types';

// Temas para el nivel A1 en chino
const A1_THEMES = [
  'basic_greetings', 'numbers', 'colors', 'family', 'food_basics',
  'weather', 'days_week', 'months', 'body_parts', 'clothing',
  'animals', 'transport', 'home_basics', 'professions', 'time',
  'directions', 'shopping_basics', 'restaurant_basics', 'health_basics', 'hobbies_basics',
];

// Palabras por tema (30 palabras por tema para alcanzar 600 palabras en 20 temas)
const CHINESE_A1_VOCABULARY: { [key: string]: { word: string; pinyin: string; translation: string; example: string; }[] } = {
  basic_greetings: [
    { word: '你好', pinyin: 'nǐ hǎo', translation: 'Hello', example: '你好！你怎么样？' },
    { word: '再见', pinyin: 'zài jiàn', translation: 'Goodbye', example: '再见！明天见！' },
    { word: '早上好', pinyin: 'zǎo shàng hǎo', translation: 'Good morning', example: '早上好！你吃早饭了吗？' },
    { word: '下午好', pinyin: 'xià wǔ hǎo', translation: 'Good afternoon', example: '下午好！今天过得怎么样？' },
    { word: '晚上好', pinyin: 'wǎn shàng hǎo', translation: 'Good evening', example: '晚上好！你吃晚饭了吗？' },
    { word: '请', pinyin: 'qǐng', translation: 'Please', example: '请给我一杯水。' },
    { word: '谢谢', pinyin: 'xiè xie', translation: 'Thank you', example: '谢谢你的帮助。' },
    { word: '不客气', pinyin: 'bù kè qì', translation: 'You\'re welcome', example: '—谢谢。—不客气。' },
    { word: '对不起', pinyin: 'duì bù qǐ', translation: 'Sorry', example: '对不起，我不是故意的。' },
    { word: '没关系', pinyin: 'méi guān xì', translation: 'It\'s okay', example: '—对不起。—没关系。' },
    { word: '你怎么样？', pinyin: 'nǐ zěn me yàng?', translation: 'How are you?', example: '你好！你怎么样？' },
    { word: '我很好', pinyin: 'wǒ hěn hǎo', translation: 'I\'m fine', example: '我很好，谢谢。' },
    { word: '你呢？', pinyin: 'nǐ ne?', translation: 'And you?', example: '我很好，你呢？' },
    { word: '很高兴认识你', pinyin: 'hěn gāo xìng rèn shi nǐ', translation: 'Nice to meet you', example: '很高兴认识你。' },
    { word: '我也是', pinyin: 'wǒ yě shì', translation: 'Me too', example: '—很高兴认识你。—我也是。' },
    { word: '你叫什么名字？', pinyin: 'nǐ jiào shén me míng zì?', translation: 'What\'s your name?', example: '你叫什么名字？' },
    { word: '我叫...', pinyin: 'wǒ jiào...', translation: 'My name is...', example: '我叫玛丽。' },
    { word: '你从哪里来？', pinyin: 'nǐ cóng nǎ lǐ lái?', translation: 'Where are you from?', example: '你从哪里来？' },
    { word: '我来自...', pinyin: 'wǒ lái zì...', translation: 'I\'m from...', example: '我来自中国。' },
    { word: '你会说英语吗？', pinyin: 'nǐ huì shuō yīng yǔ ma?', translation: 'Do you speak English?', example: '你会说英语吗？' },
    { word: '我不明白', pinyin: 'wǒ bù míng bái', translation: 'I don\'t understand', example: '我不明白，你能重复吗？' },
    { word: '你能重复吗？', pinyin: 'nǐ néng chóng fù ma?', translation: 'Can you repeat?', example: '你能重复吗？请慢一点。' },
    { word: '这是什么意思？', pinyin: 'zhè shì shén me yì si?', translation: 'What does this mean?', example: '这个词是什么意思？' },
    { word: '用中文怎么说...？', pinyin: 'yòng zhōng wén zěn me shuō...?', translation: 'How do you say... in Chinese?', example: '用中文怎么说"apple"？' },
    { word: '是', pinyin: 'shì', translation: 'Yes', example: '是的，当然。' },
    { word: '不', pinyin: 'bù', translation: 'No', example: '不，谢谢。' },
    { word: '也许', pinyin: 'yě xǔ', translation: 'Maybe', example: '也许明天。' },
    { word: '当然', pinyin: 'dāng rán', translation: 'Of course', example: '当然，我可以帮你。' },
    { word: '祝你有美好的一天', pinyin: 'zhù nǐ yǒu měi hǎo de yī tiān', translation: 'Have a nice day', example: '再见！祝你有美好的一天！' },
    { word: '晚安', pinyin: 'wǎn ān', translation: 'Good night', example: '晚安！做个好梦。' },
  ],
  numbers: [
    { word: '一', pinyin: 'yī', translation: 'One', example: '我有一个哥哥。' },
    { word: '二', pinyin: 'èr', translation: 'Two', example: '我有两只猫。' },
    { word: '三', pinyin: 'sān', translation: 'Three', example: '现在是三点。' },
    { word: '四', pinyin: 'sì', translation: 'Four', example: '我住在四楼。' },
    { word: '五', pinyin: 'wǔ', translation: 'Five', example: '我五岁了。' },
    { word: '六', pinyin: 'liù', translation: 'Six', example: '课程在六点开始。' },
    { word: '七', pinyin: 'qī', translation: 'Seven', example: '一周有七天。' },
    { word: '八', pinyin: 'bā', translation: 'Eight', example: '我有八本书。' },
    { word: '九', pinyin: 'jiǔ', translation: 'Nine', example: '我最喜欢的数字是九。' },
    { word: '十', pinyin: 'shí', translation: 'Ten', example: '我有十个手指。' },
    { word: '十一', pinyin: 'shí yī', translation: 'Eleven', example: '我十一岁了。' },
    { word: '十二', pinyin: 'shí èr', translation: 'Twelve', example: '一年有十二个月。' },
    { word: '十三', pinyin: 'shí sān', translation: 'Thirteen', example: '我有十三个表亲。' },
    { word: '十四', pinyin: 'shí sì', translation: 'Fourteen', example: '我有十四支铅笔。' },
    { word: '十五', pinyin: 'shí wǔ', translation: 'Fifteen', example: '我有十五美元。' },
    { word: '十六', pinyin: 'shí liù', translation: 'Sixteen', example: '我十六岁了。' },
    { word: '十七', pinyin: 'shí qī', translation: 'Seventeen', example: '我有十七本书。' },
    { word: '十八', pinyin: 'shí bā', translation: 'Eighteen', example: '我十八岁了。' },
    { word: '十九', pinyin: 'shí jiǔ', translation: 'Nineteen', example: '我有十九美元。' },
    { word: '二十', pinyin: 'èr shí', translation: 'Twenty', example: '我有二十分钟。' },
    { word: '二十一', pinyin: 'èr shí yī', translation: 'Twenty-one', example: '我二十一岁了。' },
    { word: '二十二', pinyin: 'èr shí èr', translation: 'Twenty-two', example: '我有二十二本书。' },
    { word: '二十三', pinyin: 'èr shí sān', translation: 'Twenty-three', example: '我二十三岁了。' },
    { word: '二十四', pinyin: 'èr shí sì', translation: 'Twenty-four', example: '我有二十四小时。' },
    { word: '二十五', pinyin: 'èr shí wǔ', translation: 'Twenty-five', example: '我有二十五美元。' },
    { word: '三十', pinyin: 'sān shí', translation: 'Thirty', example: '我有三十分钟。' },
    { word: '四十', pinyin: 'sì shí', translation: 'Forty', example: '我四十岁了。' },
    { word: '五十', pinyin: 'wǔ shí', translation: 'Fifty', example: '我有五十美元。' },
    { word: '六十', pinyin: 'liù shí', translation: 'Sixty', example: '我有六十分钟。' },
    { word: '一百', pinyin: 'yī bǎi', translation: 'One hundred', example: '我有一百本书。' },
  ],
};

// Función para generar una lección (adaptada para chino con pinyin)
const generateLesson = (
  theme: string,
  lessonNumber: number,
  words: { word: string; pinyin: string; translation: string; example: string; }[],
  startIndex: number,
  endIndex: number,
): MultilingualLesson => {
  const lessonWords = words.slice(startIndex, endIndex);
  
  return {
    id: `zh_a1_${theme}_l${lessonNumber}`,
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
      en: `Learn basic Chinese vocabulary about ${theme.replace('_', ' ')}`,
      es: `Aprende vocabulario básico en chino sobre ${theme.replace('_', ' ')}`,
      fr: `Apprenez le vocabulaire chinois de base sur ${theme.replace('_', ' ')}`,
      it: `Impara il vocabolario cinese di base su ${theme.replace('_', ' ')}`,
      hr: `Naučite osnovni kineski vokabular o ${theme.replace('_', ' ')}`,
      zh: `学习关于${theme.replace('_', ' ')}的基础中文词汇`,
    },
    difficulty: 1,
    xpReward: 15,
    estimatedTime: 5,
    targetLanguage: 'zh',
    mainLanguage: 'en',
    vocabularyReviewed: [],
    grammarConcepts: [],
    vocabularyIntroduced: lessonWords.map((item, index) => ({
      id: `zh_a1_${theme}_w${startIndex + index + 1}`,
      word: item.word,
      translation: item.translation,
      pronunciation: item.pinyin,
      phonetic: item.pinyin,
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
        id: `zh_a1_${theme}_l${lessonNumber}_e1`,
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
          en: `The word "${lessonWords[0].word}" (${lessonWords[0].pinyin}) means "${lessonWords[0].translation}" in English.`,
          es: `La palabra "${lessonWords[0].word}" (${lessonWords[0].pinyin}) significa "${lessonWords[0].translation}" en inglés.`,
          fr: `Le mot "${lessonWords[0].word}" (${lessonWords[0].pinyin}) signifie "${lessonWords[0].translation}" en anglais.`,
          it: `La parola "${lessonWords[0].word}" (${lessonWords[0].pinyin}) significa "${lessonWords[0].translation}" in inglese.`,
          hr: `Riječ "${lessonWords[0].word}" (${lessonWords[0].pinyin}) znači "${lessonWords[0].translation}" na engleskom.`,
          zh: `单词"${lessonWords[0].word}"(${lessonWords[0].pinyin})在英语中意思是"${lessonWords[0].translation}"。`,
        },
        difficulty: 1,
        xpReward: 10,
        targetLanguage: 'zh',
        mainLanguage: 'en',
        skills: ['vocabulary', 'reading'],
      },
    ],
    learningObjectives: [
      {
        en: `Learn 10 new Chinese words about ${theme.replace('_', ' ')}`,
        es: `Aprende 10 nuevas palabras en chino sobre ${theme.replace('_', ' ')}`,
        fr: `Apprenez 10 nouveaux mots chinois sur ${theme.replace('_', ' ')}`,
        it: `Impara 10 nuove parole cinesi su ${theme.replace('_', ' ')}`,
        hr: `Naučite 10 novih kineskih riječi o ${theme.replace('_', ' ')}`,
        zh: `学习10个关于${theme.replace('_', ' ')}的中文新单词`,
      },
    ],
    completionCriteria: {
      minimumAccuracy: 80,
      requiredExercises: [],
    },
  };
};

// Función principal para generar todas las lecciones A1 en chino
export const generateChineseA1Lessons = (): MultilingualLesson[] => {
  const lessons: MultilingualLesson[] = [];
  let lessonCounter = 1;

  for (let i = 0; i < A1_THEMES.length; i++) {
    const theme = A1_THEMES[i];
    const words = CHINESE_A1_VOCABULARY[theme] || [];

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
export const chineseA1Lessons: MultilingualLesson[] = generateChineseA1Lessons();

// Funciones auxiliares
export const getLessonsByTheme = (theme: string): MultilingualLesson[] => {
  return chineseA1Lessons.filter(lesson => lesson.id.includes(theme));
};

export const getVocabularyByLessonId = (lessonId: string): VocabularyItem[] => {
  const lesson = chineseA1Lessons.find(l => l.id === lessonId);
  return lesson ? lesson.vocabularyIntroduced : [];
};

export { A1_THEMES, CHINESE_A1_VOCABULARY };
