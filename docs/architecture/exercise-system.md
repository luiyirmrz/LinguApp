# Exercise System Documentation

## Overview

The exercise system provides a comprehensive framework for creating, managing, and evaluating different types of language learning exercises. It supports three main exercise types: **multiple choice**, **fill in the blank**, and **match pairs**.

## Exercise Types

### 1. Multiple Choice (`multiple_choice`)

**Purpose**: Test vocabulary recognition and comprehension
**Features**:
- Single correct answer selection
- Visual feedback with correct/incorrect indicators
- Accessibility support with screen reader compatibility
- Option indicators (A, B, C, D)

**Example**:
```typescript
const exercise = ExerciseService.createMultipleChoiceExercise(
  'hr_a1_mc_001',
  { en: 'What does "zdravo" mean?', hr: 'Što znači "zdravo"?' },
  [
    { en: 'Hello', hr: 'Zdravo' },
    { en: 'Goodbye', hr: 'Doviđenja' },
    { en: 'Thank you', hr: 'Hvala' }
  ],
  'Hello',
  explanation,
  config
);
```

### 2. Fill in the Blank (`fill_blank`)

**Purpose**: Test grammar, vocabulary, and sentence completion
**Features**:
- Text input with word chips for selection
- Automatic blank detection and positioning
- Visual feedback for correct/incorrect answers
- Keyboard support with auto-capitalization disabled

**Example**:
```typescript
const exercise = ExerciseService.createFillBlankExercise(
  'hr_a1_fb_001',
  { en: 'I am ___ years old.', hr: 'Imam ___ godina.' },
  2, // blank position
  'twenty',
  options,
  explanation,
  config
);
```

### 3. Match Pairs (`match_pairs`)

**Purpose**: Test vocabulary association and comprehension
**Features**:
- Drag-and-drop or tap-to-match functionality
- Two-column layout with left and right items
- Visual indicators for matched pairs
- Completion tracking

**Example**:
```typescript
const exercise = ExerciseService.createMatchPairsExercise(
  'hr_a1_mp_001',
  [
    { left: { en: 'Hello', hr: 'Zdravo' }, right: { en: 'A greeting', hr: 'Pozdrav' } },
    { left: { en: 'Goodbye', hr: 'Doviđenja' }, right: { en: 'A farewell', hr: 'Oproštaj' } }
  ],
  explanation,
  config
);
```

## Exercise Service

### Core Functions

#### `createMultipleChoiceExercise()`
Creates a multiple choice exercise with options and correct answer.

#### `createFillBlankExercise()`
Creates a fill-in-the-blank exercise with sentence and blank position.

#### `createMatchPairsExercise()`
Creates a match pairs exercise with left-right item pairs.

#### `evaluateExercise()`
Evaluates user performance and returns detailed feedback.

#### `calculateQuality()`
Calculates SRS quality score (0-5) based on performance metrics.

### Evaluation System

The evaluation system provides comprehensive feedback based on:

- **Correctness**: Whether the answer is correct
- **Time Performance**: How quickly the exercise was completed
- **Hint Usage**: Number of hints used (penalty)
- **Attempts**: Number of attempts made (penalty)
- **Quality Score**: 0-5 scale for SRS integration

### Scoring Algorithm

```typescript
Base Score: 100 (if correct) or 0 (if incorrect)
Time Bonus: +10 (if completed in <50% of time limit)
Hint Penalty: -5 per hint used
Attempt Penalty: -10 per extra attempt
Final Score: max(0, min(100, base + bonus - penalties))
```

### Quality Score Calculation

```typescript
Quality = 5 (perfect)
- (attempts - 1) * 1 (max -2)
- hints * 0.5 (max -1)
- 1 if slow response (if time > 80% of limit)
Final Quality = max(0, min(5, quality))
```

## Component Architecture

### BaseExercise Component

The main exercise component that handles:
- Common exercise functionality
- Timer management
- Hint system
- Audio playback
- Haptic feedback
- Progress tracking
- SRS integration

### Specialized Components

- **MultipleChoiceExercise**: Handles option selection and visual feedback
- **FillBlankExercise**: Manages text input and word chip selection
- **MatchPairsExercise**: Handles pair matching with drag-and-drop

## Configuration

### Exercise Configuration

```typescript
interface ExerciseConfig {
  type: ExerciseType;
  difficulty: number;        // 1-5 scale
  timeLimit?: number;        // seconds
  maxAttempts: number;       // maximum attempts allowed
  hintsAllowed: number;      // number of hints available
  xpReward: number;          // XP points for completion
  targetLanguage: string;    // language being learned
  mainLanguage: string;      // UI language
}
```

### A1 Level Configuration

```typescript
const A1_CONFIG = {
  type: 'multiple_choice',
  difficulty: 1,
  timeLimit: 60,
  maxAttempts: 3,
  hintsAllowed: 2,
  xpReward: 10,
  targetLanguage: 'hr',
  mainLanguage: 'en'
};
```

## Multilingual Support

All exercises support multiple languages through the `MultilingualContent` interface:

```typescript
interface MultilingualContent {
  [languageCode: string]: string;
}

// Example
const question: MultilingualContent = {
  en: 'What does "zdravo" mean?',
  hr: 'Što znači "zdravo"?',
  es: '¿Qué significa "zdravo"?'
};
```

## Accessibility Features

- **Screen Reader Support**: All interactive elements have proper accessibility labels
- **Keyboard Navigation**: Full keyboard support for all exercise types
- **High Contrast**: Visual indicators for correct/incorrect answers
- **Haptic Feedback**: Vibration feedback for user actions
- **Audio Support**: Optional audio playback for listening exercises

## Integration with SRS

The exercise system integrates with the Spaced Repetition System:

- **Quality Scores**: Each exercise generates a 0-5 quality score
- **Performance Tracking**: Time, hints, and attempts are tracked
- **Adaptive Difficulty**: Exercises can be adjusted based on performance
- **Review Scheduling**: Poor performance triggers more frequent reviews

## Testing

The system includes comprehensive tests covering:

- Exercise creation and validation
- Evaluation algorithms
- Quality score calculations
- Statistics generation
- Recommendation systems
- Type validation

Run tests with:
```bash
npm test -- __tests__/exercises.test.ts
```

## Usage Examples

### Creating a Lesson with Mixed Exercise Types

```typescript
import { ExerciseService } from '@/services/exerciseService';
import { sampleLessonExercises } from '@/data/sampleExercises';

// Use pre-created exercises
const lesson = {
  id: 'hr_a1_lesson_1',
  title: 'Basic Greetings',
  exercises: sampleLessonExercises,
  // ... other lesson properties
};
```

### Evaluating Exercise Performance

```typescript
const evaluation = ExerciseService.evaluateExercise(
  exercise,
  userAnswer,
  timeSpent,
  hintsUsed,
  attempts
);

console.log(`Score: ${evaluation.score}%`);
console.log(`Feedback: ${evaluation.feedback}`);
```

### Generating Exercise Statistics

```typescript
const stats = ExerciseService.generateExerciseStats(results);
console.log(`Accuracy: ${stats.accuracy}%`);
console.log(`Average Time: ${stats.averageTime}ms`);
```

## Future Enhancements

- **Drag and Drop**: Enhanced drag-and-drop for match pairs
- **Audio Exercises**: Listening comprehension exercises
- **Speaking Exercises**: Pronunciation and speaking practice
- **Writing Exercises**: Text input and composition
- **Adaptive Difficulty**: Dynamic difficulty adjustment
- **Gamification**: Points, streaks, and achievements
- **Offline Support**: Local exercise storage and sync

## Performance Considerations

- **Memory Management**: Proper cleanup of audio resources
- **Animation Optimization**: Efficient animations for feedback
- **Lazy Loading**: Components loaded on demand
- **Caching**: Exercise data cached for better performance
- **Error Handling**: Comprehensive error handling and recovery

## Security

- **Input Validation**: All user inputs are validated
- **XSS Prevention**: Proper sanitization of user content
- **Access Control**: Proper permissions for exercise access
- **Data Privacy**: User performance data is handled securely
