# Multilingual Language Learning Framework

## Overview

This framework provides a comprehensive system for creating and managing multilingual language learning content. It supports adaptive learning, multiple exercise types, and seamless language switching while maintaining progress across all languages.

## Supported Languages

- **English** (en) - 🇬🇧
- **Spanish** (es) - 🇪🇸  
- **French** (fr) - 🇫🇷
- **Italian** (it) - 🇮🇹
- **Croatian** (hr) - 🇭🇷
- **Chinese (Mandarin)** (zh) - 🇨🇳

## Framework Architecture

### 1. User Language Settings

Users can configure:
- **Main Language**: The UI language (what they're comfortable with)
- **Target Language**: The language they want to learn
- **Interface Preferences**: Translation visibility, phonetics, audio settings

```typescript
interface UserLanguageSettings {
  mainLanguage: string;        // UI language
  targetLanguage: string;      // Language being learned
  previousTargetLanguages: string[];
  interfacePreferences: {
    showTranslations: boolean;
    showPhonetics: boolean;
    audioAutoplay: boolean;
    difficultyLevel: 'beginner' | 'intermediate' | 'advanced';
  };
}
```

### 2. CEFR Level Structure

The framework follows the Common European Framework of Reference (CEFR):

| Level | Description | XP Required | Estimated Hours | Modules |
|-------|-------------|-------------|-----------------|---------|
| **A1** | Beginner | 0 | 80 | 8 |
| **A2** | Elementary | 500 | 120 | 10 |
| **B1** | Intermediate | 1,200 | 180 | 12 |
| **B2** | Upper Intermediate | 2,500 | 240 | 15 |
| **C1** | Advanced | 4,500 | 320 | 18 |
| **C2** | Proficient | 7,500 | 400 | 20 |

### 3. Lesson Content Schema

Every lesson follows this structured format:

```typescript
interface LessonContentSchema {
  lessonId: string;                    // Unique identifier
  mainLanguage: string;                // UI language
  targetLanguage: string;              // Learning language
  level: CEFRLevel;                    // A1, A2, B1, B2, C1, C2
  module: number;                      // Module within level
  lesson: number;                      // Lesson within module
  exerciseType: ExerciseType;          // Type of exercise
  content: {
    instruction: MultilingualContent;   // Instructions in both languages
    question: MultilingualContent;      // Question in both languages
    options?: MultilingualContent[];    // Multiple choice options
    correctAnswer: string | string[];   // Correct answer(s)
    explanation: MultilingualContent;   // Explanation in both languages
    hints?: MultilingualContent[];      // Optional hints
  };
  gameContent?: GameContent;           // Interactive game data
  metadata: {
    difficulty: number;                // 1-5 difficulty scale
    xpReward: number;                  // XP earned on completion
    estimatedTime: number;             // Time in seconds
    skills: string[];                  // Skills practiced
    topics: string[];                  // Topics covered
  };
}
```

## Exercise Types and Games

### 1. Word-to-Image Matching
- **Type**: `wordImageMatch`
- **Description**: Match vocabulary words with corresponding images
- **Skills**: Vocabulary recognition, visual association
- **Time Limit**: 60 seconds

### 2. Sentence Building Puzzles
- **Type**: `sentenceBuilding`
- **Description**: Drag and drop words to form correct sentences
- **Skills**: Grammar, sentence structure, word order
- **Time Limit**: 90 seconds

### 3. Fill in the Blank
- **Type**: `fillBlank`
- **Description**: Complete sentences with missing words
- **Skills**: Grammar, vocabulary, context understanding
- **Time Limit**: 75 seconds

### 4. Listening Challenges
- **Type**: `listeningChallenge`
- **Description**: Listen to audio and answer comprehension questions
- **Skills**: Listening comprehension, pronunciation recognition
- **Time Limit**: 120 seconds

### 5. Speaking Challenges
- **Type**: `speakingChallenge`
- **Description**: Speak phrases clearly and correctly
- **Skills**: Pronunciation, speaking confidence
- **Time Limit**: 30 seconds

### 6. Flashcard/Memory Games
- **Type**: `flashcard`
- **Description**: Review vocabulary with spaced repetition
- **Skills**: Memory, vocabulary retention
- **Time Limit**: 180 seconds

### 7. Adaptive Review
- **Type**: `adaptiveReview`
- **Description**: Review content based on performance and forgetting curve
- **Skills**: Comprehensive review, weak area reinforcement
- **Time Limit**: 300 seconds

## Skill Categories

### 1. Basics 🟢
- Essential words and phrases for beginners
- Greetings, numbers, colors, family
- **Color**: #58CC02

### 2. Grammar 🔵
- Language rules and structure
- Verb tenses, sentence construction, articles
- **Color**: #1CB0F6

### 3. Vocabulary 🔴
- Word knowledge expansion
- Thematic vocabulary, synonyms, expressions
- **Color**: #FF4B4B

### 4. Conversation 🟠
- Real-world communication practice
- Dialogues, role-playing, social interactions
- **Color**: #FF9600

### 5. Culture 🟣
- Cultural context and customs
- Traditions, etiquette, cultural expressions
- **Color**: #CE82FF

### 6. Business 🟢
- Professional language skills
- Meetings, presentations, formal communication
- **Color**: #00CD9C

### 7. Travel 🟡
- Travel-specific vocabulary and phrases
- Airport, hotel, restaurant, directions
- **Color**: #FFC800

## Content Generation Guidelines

### ID Generation Pattern
```
{targetLanguage}_{level}_{module}_{skill}_{lesson}_{exercise}

Examples:
- es_a1_m1_s1_l1_ex1 (Spanish A1, Module 1, Skill 1, Lesson 1, Exercise 1)
- fr_b2_m5_s3_l2_ex4 (French B2, Module 5, Skill 3, Lesson 2, Exercise 4)
```

### Multilingual Content Structure
```typescript
const multilingualContent: MultilingualContent = {
  en: "English text",
  es: "Texto en español",
  fr: "Texte en français",
  it: "Testo in italiano",
  hr: "Tekst na hrvatskom",
  zh: "中文文本"
};
```

### Content Validation
All content must include:
- Instructions in both main and target languages
- Questions in both languages
- Explanations in both languages
- Proper difficulty scaling (1-5)
- Appropriate XP rewards (10-50 per exercise)
- Realistic time estimates

## Adaptive Learning System

### Performance Tracking
- **Accuracy Rate**: Percentage of correct answers
- **Response Time**: Time taken to complete exercises
- **Retention Rate**: Long-term memory performance
- **Difficulty Progression**: Automatic adjustment based on performance

### Spaced Repetition Algorithm
- Items reviewed based on forgetting curve
- Successful items: longer intervals
- Failed items: shorter intervals
- Difficulty adjusts based on consecutive successes/failures

### Weak Area Identification
- Automatic detection of struggling topics
- Increased review frequency for weak areas
- Personalized lesson recommendations
- Progress tracking per skill category

## Progress Tracking

### Per-Language Progress
```typescript
interface LanguageProgress {
  currentLevel: CEFRLevel;
  totalXP: number;
  completedModules: string[];
  completedSkills: string[];
  completedLessons: string[];
  currentStreak: number;
  longestStreak: number;
  lastPracticeDate: string;
  weakAreas: string[];
  strongAreas: string[];
  timeSpent: number; // in minutes
  achievements: Achievement[];
  adaptiveDifficulty: AdaptiveDifficulty;
}
```

### Overall Statistics
- Total languages started/completed
- Combined XP across all languages
- Total time spent learning
- Favorite language (most practiced)
- Global achievements and milestones

## Implementation Examples

### Creating a New Lesson
```typescript
import { createLessonContentSchema, generateLessonId } from './multilingualLessonFramework';

const newLesson = createLessonContentSchema(
  generateLessonId('es', 'A1', 1, 1, 1),
  'en', // main language
  'es', // target language
  'A1',
  1, // module
  1, // lesson
  'multipleChoice',
  {
    instruction: createMultilingualContent({
      en: 'Choose the correct Spanish translation',
      es: 'Elige la traducción correcta en español'
    }),
    question: createMultilingualContent({
      en: 'How do you say "Hello" in Spanish?',
      es: '¿Cómo se dice "Hello" en español?'
    }),
    options: [
      createMultilingualContent({ en: 'Hello', es: 'Hola' }),
      createMultilingualContent({ en: 'Goodbye', es: 'Adiós' }),
      createMultilingualContent({ en: 'Thank you', es: 'Gracias' })
    ],
    correctAnswer: 'Hola',
    explanation: createMultilingualContent({
      en: '"Hola" is the most common way to say hello in Spanish',
      es: '"Hola" es la forma más común de saludar en español'
    })
  },
  undefined, // no game content
  {
    difficulty: 1,
    xpReward: 15,
    estimatedTime: 30,
    skills: ['vocabulary', 'greetings'],
    topics: ['basic_greetings']
  }
);
```

### Validating Content
```typescript
import { validateLessonContentSchema } from './multilingualLessonFramework';

const validation = validateLessonContentSchema(newLesson);
if (!validation.isValid) {
  console.error('Validation errors:', validation.errors);
}
```

## Database Schema Recommendations

### Lesson Storage
```sql
CREATE TABLE multilingual_lessons (
  id VARCHAR(50) PRIMARY KEY,
  main_language VARCHAR(2) NOT NULL,
  target_language VARCHAR(2) NOT NULL,
  cefr_level VARCHAR(2) NOT NULL,
  module_number INTEGER NOT NULL,
  lesson_number INTEGER NOT NULL,
  exercise_type VARCHAR(20) NOT NULL,
  content JSONB NOT NULL,
  game_content JSONB,
  metadata JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### User Progress Storage
```sql
CREATE TABLE user_language_progress (
  user_id VARCHAR(50) NOT NULL,
  language_code VARCHAR(2) NOT NULL,
  current_level VARCHAR(2) NOT NULL,
  total_xp INTEGER DEFAULT 0,
  completed_modules JSONB DEFAULT '[]',
  completed_skills JSONB DEFAULT '[]',
  completed_lessons JSONB DEFAULT '[]',
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_practice_date TIMESTAMP,
  weak_areas JSONB DEFAULT '[]',
  strong_areas JSONB DEFAULT '[]',
  time_spent INTEGER DEFAULT 0,
  achievements JSONB DEFAULT '[]',
  adaptive_difficulty JSONB,
  PRIMARY KEY (user_id, language_code)
);
```

## Next Steps for Implementation

1. **Content Generation**: Use this framework to generate comprehensive lesson sets for all language pairs
2. **Game Development**: Implement interactive games for each exercise type
3. **Adaptive Algorithm**: Build the spaced repetition and difficulty adjustment system
4. **Progress Analytics**: Create detailed progress tracking and reporting
5. **Content Management**: Build tools for content creators to add new lessons
6. **Quality Assurance**: Implement content validation and testing procedures

This framework provides the foundation for a robust, scalable multilingual language learning system that can adapt to users' needs and provide personalized learning experiences across multiple languages.