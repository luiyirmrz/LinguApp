import { LessonContent, MultilingualSkill, MultilingualLesson, MultilingualExercise } from '@/types';

// Helper function to convert strings to MultilingualContent
const createMultilingualContent = (text: string, languageCode: string = 'en'): any => ({
  [languageCode]: text,
  default: text,
});

// Croatian Lessons
const croatianLessons: LessonContent[] = [
  {
    id: 'hr_a1_basics_content',
    title: 'Basic Croatian A1',
    description: 'Essential Croatian vocabulary and phrases for beginners',
    level: 'A1',
    languageCode: 'hr',
    cefrLevel: 'A1',
    skills: [
      {
        id: 'hr_a1_basics1',
        title: createMultilingualContent('Basic Greetings', 'hr'),
        icon: '👋',
        level: 0,
        totalLevels: 5,
        locked: false,
        color: '#58CC02',
        cefrLevel: 'A1',
        category: 'basics',
        xpRequired: 0,
        description: createMultilingualContent('Learn essential Croatian greetings and polite expressions', 'hr'),
        targetLanguage: 'hr',
        mainLanguage: 'en',
        vocabularyCount: 12,
        estimatedCompletionTime: 25,
        prerequisites: [],
        lessons: [
          {
            id: 'hr_a1_basics1_l1',
            title: createMultilingualContent('Hello and Goodbye', 'hr'),
            type: 'vocabulary',
            completed: false,
            xpReward: 15,
            difficulty: 1,
            estimatedTime: 5,
            description: createMultilingualContent('Basic greetings in Croatian', 'hr'),
            targetLanguage: 'hr',
            mainLanguage: 'en',
            vocabularyIntroduced: [],
            vocabularyReviewed: [],
            grammarConcepts: [],
            learningObjectives: [createMultilingualContent('Learn basic Croatian greetings', 'hr')],
            completionCriteria: {
              minimumAccuracy: 0.8,
              requiredExercises: ['hr_a1_basics1_l1_ex1'],
            },
            exercises: [
              {
                id: 'hr_a1_basics1_l1_ex1',
                type: 'multipleChoice',
                instruction: createMultilingualContent('Choose the correct Croatian greeting', 'hr'),
                question: createMultilingualContent('How do you say "Hello" in Croatian?', 'hr'),
                options: ['Bok', 'Doviđenja', 'Hvala', 'Molim'].map(opt => createMultilingualContent(opt, 'hr')),
                correctAnswer: 'Bok',
                explanation: createMultilingualContent('Bok is the most common informal greeting in Croatian.', 'hr'),
                difficulty: 1,
                xpReward: 5,
                targetLanguage: 'hr',
                mainLanguage: 'en',
                skills: ['vocabulary', 'greetings'],
              },
            ],
          },
        ],
      },
    ],
    lessons: [],
    exercises: [],
  },
  {
    id: 'hr_a2_family_content',
    title: 'Family Members A2',
    description: 'Learn family relationships and vocabulary in Croatian',
    level: 'A2',
    languageCode: 'hr',
    cefrLevel: 'A2',
    skills: [
      {
        id: 'hr_a2_family',
        title: createMultilingualContent('Family Members', 'hr'),
        icon: '👨‍👩‍👧‍👦',
        level: 0,
        totalLevels: 4,
        locked: false,
        color: '#FF4B4B',
        cefrLevel: 'A2',
        category: 'vocabulary',
        xpRequired: 100,
        description: createMultilingualContent('Learn family relationships in Croatian', 'hr'),
        targetLanguage: 'hr',
        mainLanguage: 'en',
        vocabularyCount: 15,
        estimatedCompletionTime: 30,
        prerequisites: ['hr_a1_basics1'],
        lessons: [
          {
            id: 'hr_a2_family_l1',
            title: createMultilingualContent('Immediate Family', 'hr'),
            type: 'vocabulary',
            completed: false,
            xpReward: 25,
            difficulty: 2,
            estimatedTime: 10,
            description: createMultilingualContent('Parents, siblings, and children', 'hr'),
            targetLanguage: 'hr',
            mainLanguage: 'en',
            vocabularyIntroduced: [],
            vocabularyReviewed: [],
            grammarConcepts: [],
            learningObjectives: [createMultilingualContent('Learn family vocabulary in Croatian', 'hr')],
            completionCriteria: {
              minimumAccuracy: 0.8,
              requiredExercises: ['hr_a2_family_l1_ex1'],
            },
            exercises: [
              {
                id: 'hr_a2_family_l1_ex1',
                type: 'multipleChoice',
                instruction: createMultilingualContent('Choose the correct Croatian word for mother', 'hr'),
                question: createMultilingualContent('How do you say "mother" in Croatian?', 'hr'),
                options: ['majka', 'otac', 'sestra', 'brat'].map(opt => createMultilingualContent(opt, 'hr')),
                correctAnswer: 'majka',
                explanation: createMultilingualContent('Majka means mother in Croatian.', 'hr'),
                difficulty: 2,
                xpReward: 8,
                targetLanguage: 'hr',
                mainLanguage: 'en',
                skills: ['vocabulary', 'family'],
              },
            ],
          },
        ],
      },
    ],
    lessons: [],
    exercises: [],
  },
];

// Chinese (Mandarin) Lessons
const chineseLessons: LessonContent[] = [
  {
    id: 'zh_a1_basics',
    title: 'Basic Chinese A1',
    description: 'Essential Chinese vocabulary and phrases for beginners',
    level: 'A1',
    languageCode: 'zh',
    cefrLevel: 'A1',
    skills: [
      {
        id: 'zh_a1_basics1',
        title: createMultilingualContent('Basic Greetings', 'zh'),
        icon: '👋',
        level: 0,
        totalLevels: 5,
        locked: false,
        color: '#58CC02',
        cefrLevel: 'A1',
        category: 'basics',
        xpRequired: 0,
        description: createMultilingualContent('Learn essential Chinese greetings and polite expressions', 'zh'),
        targetLanguage: 'zh',
        mainLanguage: 'en',
        vocabularyCount: 12,
        estimatedCompletionTime: 25,
        prerequisites: [],
        lessons: [
          {
            id: 'zh_a1_basics1_l1',
            title: createMultilingualContent('Hello and Goodbye', 'zh'),
            type: 'vocabulary',
            completed: false,
            xpReward: 15,
            difficulty: 1,
            estimatedTime: 5,
            description: createMultilingualContent('Basic greetings in Chinese', 'zh'),
            targetLanguage: 'zh',
            mainLanguage: 'en',
            vocabularyIntroduced: [],
            vocabularyReviewed: [],
            grammarConcepts: [],
            learningObjectives: [createMultilingualContent('Learn basic Chinese greetings', 'zh')],
            completionCriteria: {
              minimumAccuracy: 0.8,
              requiredExercises: ['zh_a1_basics1_l1_ex1', 'zh_a1_basics1_l1_ex2'],
            },
            exercises: [
              {
                id: 'zh_a1_basics1_l1_ex1',
                type: 'multipleChoice',
                instruction: createMultilingualContent('Choose the correct Chinese greeting', 'zh'),
                question: createMultilingualContent('How do you say "Hello" in Chinese?', 'zh'),
                options: ['你好 (nǐ hǎo)', '再见 (zài jiàn)', '谢谢 (xiè xiè)', '请 (qǐng)'].map(opt => createMultilingualContent(opt, 'zh')),
                correctAnswer: '你好 (nǐ hǎo)',
                explanation: createMultilingualContent('你好 (nǐ hǎo) is the most common greeting in Chinese.', 'zh'),
                difficulty: 1,
                xpReward: 5,
                targetLanguage: 'zh',
                mainLanguage: 'en',
                skills: ['vocabulary', 'reading'],
              },
              {
                id: 'zh_a1_basics1_l1_ex2',
                type: 'translate',
                instruction: createMultilingualContent('Translate the English phrase to Chinese', 'zh'),
                question: createMultilingualContent('Translate: "Good morning"', 'zh'),
                correctAnswer: '早上好 (zǎo shàng hǎo)',
                explanation: createMultilingualContent('早上好 is used in the morning until around 10 AM.', 'zh'),
                difficulty: 2,
                xpReward: 5,
                targetLanguage: 'zh',
                mainLanguage: 'en',
                skills: ['vocabulary', 'translation'],
              },
            ],
          },
        ],
      },
      {
        id: 'zh_a1_numbers',
        title: createMultilingualContent('Numbers 1-10', 'zh'),
        icon: '🔢',
        level: 0,
        totalLevels: 3,
        locked: true,
        color: '#1CB0F6',
        cefrLevel: 'A1',
        category: 'basics',
        xpRequired: 30,
        description: createMultilingualContent('Learn Chinese numbers and counting', 'zh'),
        targetLanguage: 'zh',
        mainLanguage: 'en',
        vocabularyCount: 10,
        estimatedCompletionTime: 20,
        prerequisites: ['zh_a1_basics1'],
        lessons: [
          {
            id: 'zh_a1_numbers_l1',
            title: createMultilingualContent('Numbers 1-5', 'zh'),
            type: 'vocabulary',
            completed: false,
            xpReward: 20,
            difficulty: 2,
            estimatedTime: 8,
            description: createMultilingualContent('Learn to count from 1 to 5 in Chinese', 'zh'),
            targetLanguage: 'zh',
            mainLanguage: 'en',
            vocabularyIntroduced: [],
            vocabularyReviewed: [],
            grammarConcepts: [],
            learningObjectives: [createMultilingualContent('Learn Chinese numbers 1-5', 'zh')],
            completionCriteria: {
              minimumAccuracy: 0.8,
              requiredExercises: ['zh_a1_numbers_l1_ex1'],
            },
            exercises: [
              {
                id: 'zh_a1_numbers_l1_ex1',
                type: 'multipleChoice',
                instruction: createMultilingualContent('Choose the correct Chinese number', 'zh'),
                question: createMultilingualContent('How do you say "3" in Chinese?', 'zh'),
                options: ['一 (yī)', '二 (èr)', '三 (sān)', '四 (sì)'].map(opt => createMultilingualContent(opt, 'zh')),
                correctAnswer: '三 (sān)',
                explanation: createMultilingualContent('三 (sān) means three in Chinese.', 'zh'),
                difficulty: 2,
                xpReward: 8,
                targetLanguage: 'zh',
                mainLanguage: 'en',
                skills: ['vocabulary', 'numbers'],
              },
            ],
          },
        ],
      },
    ],
    lessons: [],
    exercises: [],
  },
];

// Italian Lessons
const italianLessons: LessonContent[] = [
  {
    id: 'it_a1_basics',
    title: 'Basic Italian A1',
    description: 'Essential Italian vocabulary and phrases for beginners',
    level: 'A1',
    languageCode: 'it',
    cefrLevel: 'A1',
    skills: [
      {
        id: 'it_a1_basics1',
        title: createMultilingualContent('Basic Greetings', 'it'),
        icon: '👋',
        level: 0,
        totalLevels: 5,
        locked: false,
        color: '#58CC02',
        cefrLevel: 'A1',
        category: 'basics',
        xpRequired: 0,
        description: createMultilingualContent('Learn essential Italian greetings and polite expressions', 'it'),
        targetLanguage: 'it',
        mainLanguage: 'en',
        vocabularyCount: 12,
        estimatedCompletionTime: 25,
        prerequisites: [],
        lessons: [
          {
            id: 'it_a1_basics1_l1',
            title: createMultilingualContent('Hello and Goodbye', 'it'),
            type: 'vocabulary',
            completed: false,
            xpReward: 15,
            difficulty: 1,
            estimatedTime: 5,
            description: createMultilingualContent('Basic greetings in Italian', 'it'),
            targetLanguage: 'it',
            mainLanguage: 'en',
            vocabularyIntroduced: [],
            vocabularyReviewed: [],
            grammarConcepts: [],
            learningObjectives: [createMultilingualContent('Learn basic Italian greetings', 'it')],
            completionCriteria: {
              minimumAccuracy: 0.8,
              requiredExercises: ['it_a1_basics1_l1_ex1', 'it_a1_basics1_l1_ex2'],
            },
            exercises: [
              {
                id: 'it_a1_basics1_l1_ex1',
                type: 'multipleChoice',
                instruction: createMultilingualContent('Choose the correct Italian greeting', 'it'),
                question: createMultilingualContent('How do you say "Hello" in Italian?', 'it'),
                options: ['Ciao', 'Arrivederci', 'Grazie', 'Prego'].map(opt => createMultilingualContent(opt, 'it')),
                correctAnswer: 'Ciao',
                explanation: createMultilingualContent('Ciao is the most common informal greeting in Italian.', 'it'),
                difficulty: 1,
                xpReward: 5,
                targetLanguage: 'it',
                mainLanguage: 'en',
                skills: ['vocabulary', 'greetings'],
              },
              {
                id: 'it_a1_basics1_l1_ex2',
                type: 'translate',
                instruction: createMultilingualContent('Translate the English phrase to Italian', 'it'),
                question: createMultilingualContent('Translate: "Good morning"', 'it'),
                correctAnswer: 'Buongiorno',
                explanation: createMultilingualContent('Buongiorno is used until around 2 PM in Italy.', 'it'),
                difficulty: 1,
                xpReward: 5,
                targetLanguage: 'it',
                mainLanguage: 'en',
                skills: ['vocabulary', 'translation'],
              },
            ],
          },
        ],
      },
    ],
    lessons: [],
    exercises: [],
  },
];

// French Lessons
const frenchLessons: LessonContent[] = [
  {
    id: 'fr_a1_basics',
    title: 'Basic French A1',
    description: 'Essential French vocabulary and phrases for beginners',
    level: 'A1',
    languageCode: 'fr',
    cefrLevel: 'A1',
    skills: [
      {
        id: 'fr_a1_basics1',
        title: createMultilingualContent('Basic Greetings', 'fr'),
        icon: '👋',
        level: 0,
        totalLevels: 5,
        locked: false,
        color: '#58CC02',
        cefrLevel: 'A1',
        category: 'basics',
        xpRequired: 0,
        description: createMultilingualContent('Learn essential French greetings and polite expressions', 'fr'),
        targetLanguage: 'fr',
        mainLanguage: 'en',
        vocabularyCount: 12,
        estimatedCompletionTime: 25,
        prerequisites: [],
        lessons: [
          {
            id: 'fr_a1_basics1_l1',
            title: createMultilingualContent('Hello and Goodbye', 'fr'),
            type: 'vocabulary',
            completed: false,
            xpReward: 15,
            difficulty: 1,
            estimatedTime: 5,
            description: createMultilingualContent('Basic greetings in French', 'fr'),
            targetLanguage: 'fr',
            mainLanguage: 'en',
            vocabularyIntroduced: [],
            vocabularyReviewed: [],
            grammarConcepts: [],
            learningObjectives: [createMultilingualContent('Learn basic French greetings', 'fr')],
            completionCriteria: {
              minimumAccuracy: 0.8,
              requiredExercises: ['fr_a1_basics1_l1_ex1', 'fr_a1_basics1_l1_ex2'],
            },
            exercises: [
              {
                id: 'fr_a1_basics1_l1_ex1',
                type: 'multipleChoice',
                instruction: createMultilingualContent('Choose the correct French greeting', 'fr'),
                question: createMultilingualContent('How do you say "Hello" in French?', 'fr'),
                options: ['Bonjour', 'Au revoir', 'Merci', 'S\'il vous plaît'].map(opt => createMultilingualContent(opt, 'fr')),
                correctAnswer: 'Bonjour',
                explanation: createMultilingualContent('Bonjour is the standard greeting in French.', 'fr'),
                difficulty: 1,
                xpReward: 5,
                targetLanguage: 'fr',
                mainLanguage: 'en',
                skills: ['vocabulary', 'greetings'],
              },
              {
                id: 'fr_a1_basics1_l1_ex2',
                type: 'translate',
                instruction: createMultilingualContent('Translate the English phrase to French', 'fr'),
                question: createMultilingualContent('Translate: "Good evening"', 'fr'),
                correctAnswer: 'Bonsoir',
                explanation: createMultilingualContent('Bonsoir is used from around 6 PM onwards.', 'fr'),
                difficulty: 1,
                xpReward: 5,
                targetLanguage: 'fr',
                mainLanguage: 'en',
                skills: ['vocabulary', 'translation'],
              },
            ],
          },
        ],
      },
    ],
    lessons: [],
    exercises: [],
  },
];

// English Lessons (for non-native speakers)
const englishLessons: LessonContent[] = [
  {
    id: 'en_a1_basics',
    title: 'Basic English A1',
    description: 'Essential English vocabulary and phrases for beginners',
    level: 'A1',
    languageCode: 'en',
    cefrLevel: 'A1',
    skills: [
      {
        id: 'en_a1_basics1',
        title: createMultilingualContent('Basic Greetings', 'en'),
        icon: '👋',
        level: 0,
        totalLevels: 5,
        locked: false,
        color: '#58CC02',
        cefrLevel: 'A1',
        category: 'basics',
        xpRequired: 0,
        description: createMultilingualContent('Learn essential English greetings and polite expressions', 'en'),
        targetLanguage: 'en',
        mainLanguage: 'en',
        vocabularyCount: 12,
        estimatedCompletionTime: 25,
        prerequisites: [],
        lessons: [
          {
            id: 'en_a1_basics1_l1',
            title: createMultilingualContent('Hello and Goodbye', 'en'),
            type: 'vocabulary',
            completed: false,
            xpReward: 15,
            difficulty: 1,
            estimatedTime: 5,
            description: createMultilingualContent('Basic greetings in English', 'en'),
            targetLanguage: 'en',
            mainLanguage: 'en',
            vocabularyIntroduced: [],
            vocabularyReviewed: [],
            grammarConcepts: [],
            learningObjectives: [createMultilingualContent('Learn basic English greetings', 'en')],
            completionCriteria: {
              minimumAccuracy: 0.8,
              requiredExercises: ['en_a1_basics1_l1_ex1', 'en_a1_basics1_l1_ex2'],
            },
            exercises: [
              {
                id: 'en_a1_basics1_l1_ex1',
                type: 'multipleChoice',
                instruction: createMultilingualContent('Choose the correct English greeting', 'en'),
                question: createMultilingualContent('How do you say "Hello" in English?', 'en'),
                options: ['Hello', 'Goodbye', 'Thank you', 'Please'].map(opt => createMultilingualContent(opt, 'en')),
                correctAnswer: 'Hello',
                explanation: createMultilingualContent('Hello is the most common greeting in English.', 'en'),
                difficulty: 1,
                xpReward: 5,
                targetLanguage: 'en',
                mainLanguage: 'en',
                skills: ['vocabulary', 'greetings'],
              },
              {
                id: 'en_a1_basics1_l1_ex2',
                type: 'translate',
                instruction: createMultilingualContent('Translate the phrase to English', 'en'),
                question: createMultilingualContent('Translate: "Good morning"', 'en'),
                correctAnswer: 'Good morning',
                explanation: createMultilingualContent('Good morning is used in the morning until around 12 PM.', 'en'),
                difficulty: 1,
                xpReward: 5,
                targetLanguage: 'en',
                mainLanguage: 'en',
                skills: ['vocabulary', 'translation'],
              },
            ],
          },
        ],
      },
    ],
    lessons: [],
    exercises: [],
  },
];

// Export all lesson content
export const lessonContent: LessonContent[] = [
  ...croatianLessons,
  ...chineseLessons,
  ...italianLessons,
  ...frenchLessons,
  ...englishLessons,
];

// Export individual lesson arrays for specific use cases
export { croatianLessons, chineseLessons, italianLessons, frenchLessons, englishLessons };

// Helper functions to get lessons by language and level
export const getLessonsByLanguage = (languageCode: string): LessonContent[] => {
  return lessonContent.filter(content => content.languageCode === languageCode);
};

export const getLessonsByLanguageAndLevel = (languageCode: string, cefrLevel: string): LessonContent | undefined => {
  return lessonContent.find(content => 
    content.languageCode === languageCode && content.cefrLevel === cefrLevel,
  );
};

export const getAllSkillsForLanguage = (languageCode: string): any[] => {
  const lessons = getLessonsByLanguage(languageCode);
  return lessons.flatMap(lesson => lesson.skills);
};

export const getSkillById = (skillId: string): any | undefined => {
  for (const content of lessonContent) {
    const skill = content.skills.find(s => s.id === skillId);
    if (skill) return skill;
  }
  return undefined;
};

export const getLessonById = (lessonId: string): any | undefined => {
  for (const content of lessonContent) {
    for (const skill of content.skills) {
      const lesson = skill.lessons.find(l => l.id === lessonId);
      if (lesson) return lesson;
    }
  }
  return undefined;
};
