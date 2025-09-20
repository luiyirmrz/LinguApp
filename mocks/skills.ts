import { Skill } from '@/types';
import { getAllSkillsForLanguage } from '@/mocks/lessonContent';

// This is now a function that returns skills for a specific language
export const getSkillsForLanguage = (languageCode: string): Skill[] => {
  return getAllSkillsForLanguage(languageCode);
};

// Fallback skills for backward compatibility
export const skills: Skill[] = [
  {
    id: 'basic_greetings',
    title: 'Basic Greetings',
    icon: '👋',
    level: 0,
    totalLevels: 3,
    locked: false,
    color: '#667eea',
    cefrLevel: 'A1', 
    category: 'basics',
    xpRequired: 0,
    description: 'Essential greetings for daily conversations',
    lessons: [
      {
        id: 'greetings_l1',
        title: 'Morning & Afternoon Greetings',
        type: 'vocabulary',
        completed: false,
        xpReward: 50,
        difficulty: 1,
        estimatedTime: 2,
        description: 'Learn the most common Croatian greetings for morning and afternoon',
        exercises: [],
        language: 'hr',
        score: 0,
        vocabulary: [],
      },
      {
        id: 'greetings_l2',
        title: 'Evening & Casual Greetings',
        type: 'vocabulary',
        completed: false,
        xpReward: 75,
        difficulty: 2,
        estimatedTime: 2,
        description: 'Master evening greetings and casual ways to say hello',
        exercises: [],
        language: 'hr',
        score: 0,
        vocabulary: [],
      },
      {
        id: 'greetings_l3',
        title: 'Advanced Greetings & Review',
        type: 'vocabulary',
        completed: false,
        xpReward: 100,
        difficulty: 3,
        estimatedTime: 3,
        description: 'Learn formal greetings and review all basic greetings',
        exercises: [],
        language: 'hr',
        score: 0,
        vocabulary: [],
      },
    ],
  },
  {
    id: '1',
    title: 'Basics 1',
    icon: '🥚',
    level: 0,
    totalLevels: 5,
    locked: true,
    color: '#58CC02',
    cefrLevel: 'A1',
    category: 'basics',
    xpRequired: 0,
    description: 'Basic vocabulary and phrases',
    lessons: [
      {
        id: 'l1',
        title: 'Introduction',
        type: 'vocabulary',
        completed: false,
        xpReward: 15,
        difficulty: 1,
        estimatedTime: 5,
        description: 'Basic greetings and introductions',
        language: 'es',
        score: 0,
        vocabulary: [],
        exercises: [
          {
            id: 'e1',
            type: 'match',
            question: 'Match the word with its translation',
            options: ['Hello', 'Goodbye', 'Thank you', 'Please'],
            correctAnswer: ['Hola', 'Adiós', 'Gracias', 'Por favor'],
            difficulty: 1,
            xpReward: 5,
          },
          {
            id: 'e2',
            type: 'translate',
            question: 'Translate: "Good morning"',
            correctAnswer: 'Buenos días',
            difficulty: 1,
            xpReward: 5,
          },
          {
            id: 'e3',
            type: 'multipleChoice',
            question: 'How do you say "water" in Spanish?',
            options: ['Agua', 'Leche', 'Pan', 'Café'],
            correctAnswer: 'Agua',
            difficulty: 1,
            xpReward: 5,
          },
        ],
      },
    ],
  },
];

// Export default for backward compatibility
export default skills;
