/**
 * Exercise Service - Comprehensive exercise management and evaluation system
 * Handles multiple exercise types: multiple_choice, fill_blank, match_pairs
 * Provides evaluation, feedback, and progress tracking
 */

import { MultilingualExercise, MultilingualContent, ExerciseType, CEFRLevel } from '@/types';

// Exercise result interface
export interface ExerciseResult {
  exerciseId: string;
  correct: boolean;
  userAnswer: string | string[];
  timeSpent: number; // milliseconds
  hintsUsed: number;
  attempts: number;
  quality: number; // 0-5 for SRS
  accuracy: number; // 0-100 percentage
  feedback: string;
  explanation?: string;
}

// Exercise evaluation interface
export interface ExerciseEvaluation {
  isCorrect: boolean;
  score: number; // 0-100
  feedback: string;
  explanation?: string;
  suggestions?: string[];
  timeBonus?: number;
  accuracyBonus?: number;
}

// Exercise configuration
export interface ExerciseConfig {
  type: ExerciseType;
  difficulty: number;
  timeLimit?: number;
  maxAttempts: number;
  hintsAllowed: number;
  xpReward: number;
  targetLanguage: string;
  mainLanguage: string;
}

export class ExerciseService {
  
  /**
   * Creates a multiple choice exercise
   */
  static createMultipleChoiceExercise(
    id: string,
    question: MultilingualContent,
    options: MultilingualContent[],
    correctAnswer: string,
    explanation: MultilingualContent,
    config: ExerciseConfig,
    hints?: MultilingualContent[],
  ): MultilingualExercise {
    return {
      id,
      type: 'multiple_choice',
      instruction: {
        en: 'Choose the correct answer',
        [config.targetLanguage]: 'Odaberite točan odgovor',
      },
      question,
      options,
      correctAnswer,
      explanation,
      hints,
      difficulty: config.difficulty,
      xpReward: config.xpReward,
      timeLimit: config.timeLimit,
      targetLanguage: config.targetLanguage,
      mainLanguage: config.mainLanguage,
      skills: ['reading', 'vocabulary'],
    };
  }

  /**
   * Creates a fill in the blank exercise
   */
  static createFillBlankExercise(
    id: string,
    sentence: MultilingualContent,
    blankPosition: number,
    correctAnswer: string,
    options: MultilingualContent[],
    explanation: MultilingualContent,
    config: ExerciseConfig,
    hints?: MultilingualContent[],
  ): MultilingualExercise {
    // Create question with blank
    const questionText = this.createQuestionWithBlank(sentence, blankPosition);
    
    return {
      id,
      type: 'fill_blank',
      instruction: {
        en: 'Fill in the blank with the correct word',
        [config.targetLanguage]: 'Popunite prazninu točnom riječju',
      },
      question: questionText,
      options,
      correctAnswer,
      explanation,
      hints,
      difficulty: config.difficulty,
      xpReward: config.xpReward,
      timeLimit: config.timeLimit,
      targetLanguage: config.targetLanguage,
      mainLanguage: config.mainLanguage,
      skills: ['reading', 'grammar', 'vocabulary'],
    };
  }

  /**
   * Creates a match pairs exercise
   */
  static createMatchPairsExercise(
    id: string,
    pairs: { left: MultilingualContent; right: MultilingualContent }[],
    explanation: MultilingualContent,
    config: ExerciseConfig,
    hints?: MultilingualContent[],
  ): MultilingualExercise {
    return {
      id,
      type: 'match_pairs',
      instruction: {
        en: 'Match the items on the left with the correct items on the right',
        [config.targetLanguage]: 'Povežite stavke s lijeve strane s točnim stavkama s desne strane',
      },
      question: {
        en: 'Match the pairs',
        [config.targetLanguage]: 'Povežite parove',
      },
      options: pairs.map(pair => pair.right),
      correctAnswer: pairs.map(pair => typeof pair.right === 'string' ? pair.right : pair.right.text || JSON.stringify(pair.right)),
      explanation,
      hints,
      difficulty: config.difficulty,
      xpReward: config.xpReward,
      timeLimit: config.timeLimit,
      targetLanguage: config.targetLanguage,
      mainLanguage: config.mainLanguage,
      skills: ['reading', 'vocabulary', 'comprehension'],
      gameContent: {
        type: 'match_pairs',
        pairs: pairs.map((pair, index) => ({
          id: `pair_${index}`,
          left: pair.left,
          right: pair.right,
        })),
      },
    };
  }

  /**
   * Evaluates an exercise result
   */
  static evaluateExercise(
    exercise: MultilingualExercise,
    userAnswer: string | string[],
    timeSpent: number,
    hintsUsed: number,
    attempts: number,
  ): ExerciseEvaluation {
    const isCorrect = this.checkAnswer(exercise, userAnswer);
    const baseScore = isCorrect ? 100 : 0;
    
    // Calculate time bonus (faster = higher bonus)
    let timeBonus = 0;
    if (exercise.timeLimit && timeSpent < exercise.timeLimit * 0.5 * 1000) {
      timeBonus = 10; // 10% bonus for completing in half the time
    }
    
    // Calculate accuracy penalty
    let accuracyPenalty = 0;
    if (hintsUsed > 0) {
      accuracyPenalty += hintsUsed * 5; // 5% penalty per hint
    }
    if (attempts > 1) {
      accuracyPenalty += (attempts - 1) * 10; // 10% penalty per extra attempt
    }
    
    const finalScore = Math.max(0, Math.min(100, baseScore + timeBonus - accuracyPenalty));
    
    // Generate feedback
    const feedback = this.generateFeedback(isCorrect, finalScore, timeSpent, hintsUsed, attempts);
    
    // Generate explanation
    const explanation = isCorrect ? 
      (exercise.explanation ? this.getText(exercise.explanation, 'en') : 'Correct!') : 
      `The correct answer is: ${exercise.correctAnswer}`;
    
    return {
      isCorrect,
      score: finalScore,
      feedback,
      explanation,
      timeBonus,
      accuracyBonus: timeBonus,
    };
  }

  /**
   * Checks if the user's answer is correct
   */
  private static checkAnswer(exercise: MultilingualExercise, userAnswer: string | string[]): boolean {
    const correctAnswer = exercise.correctAnswer;
    
    if (exercise.type === 'match_pairs') {
      // For match pairs, check if all pairs are correctly matched
      if (Array.isArray(userAnswer) && Array.isArray(correctAnswer)) {
        return userAnswer.length === correctAnswer.length &&
               userAnswer.every((answer, index) => 
                 answer.toLowerCase().trim() === correctAnswer[index].toLowerCase().trim(),
               );
      }
      return false;
    }
    
    if (Array.isArray(correctAnswer)) {
      if (Array.isArray(userAnswer)) {
        return correctAnswer.every(correct => 
          userAnswer.some(userAns => 
            userAns.toLowerCase().trim() === correct.toLowerCase().trim(),
          ),
        );
      } else {
        return correctAnswer.some(correct => 
          userAnswer.toLowerCase().trim() === correct.toLowerCase().trim(),
        );
      }
    } else {
      if (Array.isArray(userAnswer)) {
        return userAnswer.some(userAns => 
          userAns.toLowerCase().trim() === correctAnswer.toLowerCase().trim(),
        );
      } else {
        return userAnswer.toLowerCase().trim() === correctAnswer.toLowerCase().trim();
      }
    }
  }

  /**
   * Generates feedback based on performance
   */
  private static generateFeedback(
    isCorrect: boolean,
    score: number,
    timeSpent: number,
    hintsUsed: number,
    attempts: number,
  ): string {
    if (!isCorrect) {
      return "Don't worry! Keep practicing and you'll get it next time.";
    }
    
    let feedback = 'Great job! ';
    
    if (score >= 90) {
      feedback += 'Excellent work! ';
    } else if (score >= 80) {
      feedback += 'Well done! ';
    } else if (score >= 70) {
      feedback += 'Good effort! ';
    }
    
    if (hintsUsed === 0 && attempts === 1) {
      feedback += 'You got it right on the first try without hints!';
    } else if (hintsUsed === 0) {
      feedback += 'You figured it out without hints!';
    } else if (attempts === 1) {
      feedback += 'You got it right on the first try!';
    }
    
    return feedback;
  }

  /**
   * Creates a question with blank placeholder
   */
  private static createQuestionWithBlank(
    sentence: MultilingualContent,
    blankPosition: number,
  ): MultilingualContent {
    const result: MultilingualContent = {};
    
    Object.keys(sentence).forEach(lang => {
      const words = sentence[lang].split(' ');
      if (blankPosition >= 0 && blankPosition < words.length) {
        words[blankPosition] = '___';
        result[lang] = words.join(' ');
      } else {
        result[lang] = sentence[lang];
      }
    });
    
    return result;
  }

  /**
   * Helper to get text from multilingual content
   */
  private static getText(content: MultilingualContent, language: string): string {
    return content[language] || content['en'] || '';
  }

  /**
   * Calculates quality score for SRS (0-5)
   */
  static calculateQuality(
    correct: boolean,
    timeSpent: number,
    hintsUsed: number,
    attempts: number,
    timeLimit?: number,
  ): number {
    if (!correct) return 0;
    
    let quality = 5; // Start with perfect score
    
    // Reduce for multiple attempts
    quality -= Math.min(attempts - 1, 2);
    
    // Reduce for hints used
    quality -= hintsUsed * 0.5;
    
    // Reduce for slow response (if time limit exists)
    if (timeLimit && timeSpent > timeLimit * 0.8 * 1000) {
      quality -= 1;
    }
    
    return Math.max(0, Math.min(5, Math.round(quality)));
  }

  /**
   * Generates exercise statistics
   */
  static generateExerciseStats(results: ExerciseResult[]): {
    totalExercises: number;
    correctAnswers: number;
    averageScore: number;
    averageTime: number;
    totalHintsUsed: number;
    accuracy: number;
  } {
    const totalExercises = results.length;
    const correctAnswers = results.filter(r => r.correct).length;
    const averageScore = results.reduce((sum, r) => sum + r.accuracy, 0) / totalExercises;
    const averageTime = results.reduce((sum, r) => sum + r.timeSpent, 0) / totalExercises;
    const totalHintsUsed = results.reduce((sum, r) => sum + r.hintsUsed, 0);
    const accuracy = (correctAnswers / totalExercises) * 100;
    
    return {
      totalExercises,
      correctAnswers,
      averageScore,
      averageTime,
      totalHintsUsed,
      accuracy,
    };
  }

  /**
   * Creates exercise recommendations based on performance
   */
  static generateRecommendations(stats: ReturnType<typeof ExerciseService.generateExerciseStats>): string[] {
    const recommendations: string[] = [];
    
    if (stats.accuracy < 70) {
      recommendations.push('Your accuracy is below 70%. Consider reviewing easier exercises first.');
    }
    
    if (stats.averageTime > 30000) { // 30 seconds
      recommendations.push("You're taking longer than average. Try to work on speed while maintaining accuracy.");
    }
    
    if (stats.totalHintsUsed > stats.totalExercises * 0.5) {
      recommendations.push("You're using many hints. Try to rely on your knowledge more.");
    }
    
    if (stats.accuracy >= 90) {
      recommendations.push("Excellent performance! You're ready for more challenging exercises.");
    }
    
    return recommendations;
  }
}

export default ExerciseService;
