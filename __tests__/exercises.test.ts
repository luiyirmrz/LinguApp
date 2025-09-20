
// Global test timeout configuration
jest.setTimeout(10000); // 10 seconds default timeout

/**
 * Exercise System Tests
 * Tests for multiple choice, fill in the blank, and match pairs exercises
 */

import { ExerciseService } from '@/services/learning/exerciseService';
import { MultilingualExercise, MultilingualContent } from '@/types';

describe('Exercise Service', () => {
  const mockConfig = {
    type: 'multiple_choice' as const,
    difficulty: 2,
    timeLimit: 60,
    maxAttempts: 3,
    hintsAllowed: 2,
    xpReward: 10,
    targetLanguage: 'hr',
    mainLanguage: 'en',
  };

  describe('Multiple Choice Exercise Creation', () => {
    test('should create a multiple choice exercise with correct structure', () => {
      const question: MultilingualContent = {
        en: 'What does "zdravo" mean?',
        hr: 'Što znači "zdravo"?',
      };

      const options: MultilingualContent[] = [
        { en: 'Hello', hr: 'Zdravo' },
        { en: 'Goodbye', hr: 'Doviđenja' },
        { en: 'Thank you', hr: 'Hvala' },
        { en: 'Please', hr: 'Molim' },
      ];

      const explanation: MultilingualContent = {
        en: '"Zdravo" is a common greeting in Croatian, similar to "hello" in English.',
        hr: '"Zdravo" je uobičajen pozdrav na hrvatskom, sličan "hello" na engleskom.',
      };

      const exercise = ExerciseService.createMultipleChoiceExercise(
        'test_mc_1',
        question,
        options,
        'Hello',
        explanation,
        mockConfig,
      );

      expect(exercise.id).toBe('test_mc_1');
      expect(exercise.type).toBe('multiple_choice');
      expect(exercise.question).toEqual(question);
      expect(exercise.options).toEqual(options);
      expect(exercise.correctAnswer).toBe('Hello');
      expect(exercise.explanation).toEqual(explanation);
      expect(exercise.difficulty).toBe(2);
      expect(exercise.xpReward).toBe(10);
      expect(exercise.timeLimit).toBe(60);
      expect(exercise.skills).toContain('reading');
      expect(exercise.skills).toContain('vocabulary');
    });
  });

  describe('Fill in the Blank Exercise Creation', () => {
    test('should create a fill in the blank exercise with correct structure', () => {
      const sentence: MultilingualContent = {
        en: 'I am ___ years old.',
        hr: 'Imam ___ godina.',
      };

      const options: MultilingualContent[] = [
        { en: 'twenty', hr: 'dvadeset' },
        { en: 'thirty', hr: 'trideset' },
        { en: 'forty', hr: 'četrdeset' },
      ];

      const explanation: MultilingualContent = {
        en: 'The blank should be filled with a number to complete the sentence about age.',
        hr: 'Praznina se treba popuniti brojem da se završi rečenica o godinama.',
      };

      const exercise = ExerciseService.createFillBlankExercise(
        'test_fb_1',
        sentence,
        2, // blank position
        'twenty',
        options,
        explanation,
        mockConfig,
      );

      expect(exercise.id).toBe('test_fb_1');
      expect(exercise.type).toBe('fill_blank');
      expect(exercise.question.en).toContain('___');
      expect(exercise.options).toEqual(options);
      expect(exercise.correctAnswer).toBe('twenty');
      expect(exercise.skills).toContain('reading');
      expect(exercise.skills).toContain('grammar');
      expect(exercise.skills).toContain('vocabulary');
    });
  });

  describe('Match Pairs Exercise Creation', () => {
    test('should create a match pairs exercise with correct structure', () => {
      const pairs = [
        {
          left: { en: 'Hello', hr: 'Zdravo' },
          right: { en: 'A greeting', hr: 'Pozdrav' },
        },
        {
          left: { en: 'Goodbye', hr: 'Doviđenja' },
          right: { en: 'A farewell', hr: 'Oproštaj' },
        },
      ];

      const explanation: MultilingualContent = {
        en: 'Match the Croatian words with their English meanings.',
        hr: 'Povežite hrvatske riječi s njihovim engleskim značenjima.',
      };

      const exercise = ExerciseService.createMatchPairsExercise(
        'test_mp_1',
        pairs,
        explanation,
        mockConfig,
      );

      expect(exercise.id).toBe('test_mp_1');
      expect(exercise.type).toBe('match_pairs');
      expect(exercise.gameContent?.type).toBe('match_pairs');
      expect(exercise.gameContent?.pairs).toHaveLength(2);
      expect(exercise.skills).toContain('reading');
      expect(exercise.skills).toContain('vocabulary');
      expect(exercise.skills).toContain('comprehension');
    });
  });

  describe('Exercise Evaluation', () => {
    test('should evaluate correct multiple choice answer', () => {
      const exercise: MultilingualExercise = {
        id: 'test_eval_1',
        type: 'multiple_choice',
        instruction: { en: 'Choose the correct answer' },
        question: { en: 'What does "zdravo" mean?' },
        options: [
          { en: 'Hello' },
          { en: 'Goodbye' },
          { en: 'Thank you' },
        ],
        correctAnswer: 'Hello',
        explanation: { en: 'Correct explanation' },
        difficulty: 2,
        xpReward: 10,
        targetLanguage: 'hr',
        mainLanguage: 'en',
        skills: ['reading', 'vocabulary'],
      };

      const evaluation = ExerciseService.evaluateExercise(
        exercise,
        'Hello',
        5000, // 5 seconds
        0,    // no hints
        1,     // first attempt
      );

      expect(evaluation.isCorrect).toBe(true);
      expect(evaluation.score).toBe(100);
      expect(evaluation.feedback).toContain('Great job!');
    });

    test('should evaluate incorrect answer with penalties', () => {
      const exercise: MultilingualExercise = {
        id: 'test_eval_2',
        type: 'multiple_choice',
        instruction: { en: 'Choose the correct answer' },
        question: { en: 'What does "zdravo" mean?' },
        options: [
          { en: 'Hello' },
          { en: 'Goodbye' },
          { en: 'Thank you' },
        ],
        correctAnswer: 'Hello',
        explanation: { en: 'Correct explanation' },
        difficulty: 2,
        xpReward: 10,
        targetLanguage: 'hr',
        mainLanguage: 'en',
        skills: ['reading', 'vocabulary'],
      };

      const evaluation = ExerciseService.evaluateExercise(
        exercise,
        'Goodbye',
        15000, // 15 seconds
        2,     // 2 hints used
        3,      // 3 attempts
      );

      expect(evaluation.isCorrect).toBe(false);
      expect(evaluation.score).toBe(0);
      expect(evaluation.feedback).toContain("Don't worry!");
    });

    test('should evaluate match pairs exercise correctly', () => {
      const exercise: MultilingualExercise = {
        id: 'test_eval_3',
        type: 'match_pairs',
        instruction: { en: 'Match the pairs' },
        question: { en: 'Match the words' },
        options: [
          { en: 'A greeting' },
          { en: 'A farewell' },
        ],
        correctAnswer: ['A greeting', 'A farewell'],
        explanation: { en: 'Correct matches' },
        difficulty: 2,
        xpReward: 10,
        targetLanguage: 'hr',
        mainLanguage: 'en',
        skills: ['reading', 'vocabulary'],
      };

      const evaluation = ExerciseService.evaluateExercise(
        exercise,
        ['A greeting', 'A farewell'],
        8000, // 8 seconds
        0,    // no hints
        1,     // first attempt
      );

      expect(evaluation.isCorrect).toBe(true);
      expect(evaluation.score).toBe(100);
    });
  });

  describe('Quality Score Calculation', () => {
    test('should calculate perfect quality score', () => {
      const quality = ExerciseService.calculateQuality(
        true,  // correct
        3000,  // 3 seconds
        0,     // no hints
        1,     // first attempt
        60,     // 60 second time limit
      );

      expect(quality).toBe(5);
    });

    test('should reduce quality for hints and attempts', () => {
      const quality = ExerciseService.calculateQuality(
        true,  // correct
        10000, // 10 seconds
        2,     // 2 hints
        3,     // 3 attempts
        60,     // 60 second time limit
      );

      expect(quality).toBe(2); // 5 - 2 (attempts) - 1 (hints) - 1 (slow) = 1, but min is 0
    });

    test('should return 0 for incorrect answers', () => {
      const quality = ExerciseService.calculateQuality(
        false, // incorrect
        5000,  // 5 seconds
        0,     // no hints
        1,      // first attempt
      );

      expect(quality).toBe(0);
    });
  });

  describe('Exercise Statistics', () => {
    test('should generate correct exercise statistics', () => {
      const results = [
        {
          exerciseId: '1',
          correct: true,
          userAnswer: 'Hello',
          timeSpent: 5000,
          hintsUsed: 0,
          attempts: 1,
          quality: 5,
          accuracy: 100,
          feedback: 'Great job!',
        },
        {
          exerciseId: '2',
          correct: false,
          userAnswer: 'Wrong',
          timeSpent: 10000,
          hintsUsed: 1,
          attempts: 2,
          quality: 0,
          accuracy: 0,
          feedback: 'Try again!',
        },
        {
          exerciseId: '3',
          correct: true,
          userAnswer: 'Correct',
          timeSpent: 3000,
          hintsUsed: 0,
          attempts: 1,
          quality: 5,
          accuracy: 100,
          feedback: 'Excellent!',
        },
      ];

      const stats = ExerciseService.generateExerciseStats(results);

      expect(stats.totalExercises).toBe(3);
      expect(stats.correctAnswers).toBe(2);
      expect(stats.averageScore).toBeCloseTo(66.67, 2);
      expect(stats.averageTime).toBe(6000);
      expect(stats.totalHintsUsed).toBe(1);
      expect(stats.accuracy).toBeCloseTo(66.67, 2);
    });
  });

  describe('Exercise Recommendations', () => {
    test('should generate recommendations for low accuracy', () => {
      const stats = {
        totalExercises: 10,
        correctAnswers: 5,
        averageScore: 50,
        averageTime: 15000,
        totalHintsUsed: 8,
        accuracy: 50,
      };

      const recommendations = ExerciseService.generateRecommendations(stats);

      expect(recommendations).toContain('Your accuracy is below 70%. Consider reviewing easier exercises first.');
    });

    test('should generate recommendations for high accuracy', () => {
      const stats = {
        totalExercises: 10,
        correctAnswers: 9,
        averageScore: 95,
        averageTime: 8000,
        totalHintsUsed: 2,
        accuracy: 90,
      };

      const recommendations = ExerciseService.generateRecommendations(stats);

      expect(recommendations).toContain('Excellent performance! You\'re ready for more challenging exercises.');
    });

    test('should generate recommendations for excessive hint usage', () => {
      const stats = {
        totalExercises: 10,
        correctAnswers: 8,
        averageScore: 80,
        averageTime: 12000,
        totalHintsUsed: 8,
        accuracy: 80,
      };

      const recommendations = ExerciseService.generateRecommendations(stats);

      expect(recommendations).toContain('You\'re using many hints. Try to rely on your knowledge more.');
    });
  });
});

describe('Exercise Type Validation', () => {
  test('should validate multiple_choice type', () => {
    const exercise: MultilingualExercise = {
      id: 'test_validation_1',
      type: 'multiple_choice',
      instruction: { en: 'Choose the correct answer' },
      question: { en: 'What does "zdravo" mean?' },
      options: [
        { en: 'Hello' },
        { en: 'Goodbye' },
      ],
      correctAnswer: 'Hello',
      explanation: { en: 'Explanation' },
      difficulty: 1,
      xpReward: 10,
      targetLanguage: 'hr',
      mainLanguage: 'en',
      skills: ['reading'],
    };

    expect(exercise.type).toBe('multiple_choice');
    expect(exercise.options).toBeDefined();
    expect(exercise.options?.length).toBeGreaterThan(0);
  });

  test('should validate fill_blank type', () => {
    const exercise: MultilingualExercise = {
      id: 'test_validation_2',
      type: 'fill_blank',
      instruction: { en: 'Fill in the blank' },
      question: { en: 'I am ___ years old.' },
      options: [
        { en: 'twenty' },
        { en: 'thirty' },
      ],
      correctAnswer: 'twenty',
      explanation: { en: 'Explanation' },
      difficulty: 1,
      xpReward: 10,
      targetLanguage: 'hr',
      mainLanguage: 'en',
      skills: ['reading'],
    };

    expect(exercise.type).toBe('fill_blank');
    expect(exercise.question.en).toContain('___');
  });

  test('should validate match_pairs type', () => {
    const exercise: MultilingualExercise = {
      id: 'test_validation_3',
      type: 'match_pairs',
      instruction: { en: 'Match the pairs' },
      question: { en: 'Match the words' },
      options: [
        { en: 'A greeting' },
        { en: 'A farewell' },
      ],
      correctAnswer: ['A greeting', 'A farewell'],
      explanation: { en: 'Explanation' },
      difficulty: 1,
      xpReward: 10,
      targetLanguage: 'hr',
      mainLanguage: 'en',
      skills: ['reading'],
      gameContent: {
        type: 'match_pairs',
        pairs: [
          { id: '1', left: { en: 'Hello' }, right: { en: 'A greeting' } },
          { id: '2', left: { en: 'Goodbye' }, right: { en: 'A farewell' } },
        ],
      },
    };

    expect(exercise.type).toBe('match_pairs');
    expect(exercise.gameContent?.type).toBe('match_pairs');
    expect(Array.isArray(exercise.correctAnswer)).toBe(true);
  });
});
