/**
 * Sample Exercises for Croatian A1 Level
 * Demonstrates multiple choice, fill in the blank, and match pairs exercises
 */

import { MultilingualExercise, MultilingualContent } from '@/types';
import { ExerciseService } from '@/services/learning/exerciseService';

// Exercise configuration for A1 level
const A1_CONFIG = {
  type: 'multiple_choice' as const,
  difficulty: 1,
  timeLimit: 60,
  maxAttempts: 3,
  hintsAllowed: 2,
  xpReward: 10,
  targetLanguage: 'hr',
  mainLanguage: 'en',
};

// Multiple Choice Exercises
export const multipleChoiceExercises: MultilingualExercise[] = [
  ExerciseService.createMultipleChoiceExercise(
    'hr_a1_mc_001',
    {
      en: 'What does "zdravo" mean?',
      hr: 'Što znači "zdravo"?',
    },
    [
      { en: 'Hello', hr: 'Zdravo' },
      { en: 'Goodbye', hr: 'Doviđenja' },
      { en: 'Thank you', hr: 'Hvala' },
      { en: 'Please', hr: 'Molim' },
    ],
    'Hello',
    {
      en: '"Zdravo" is the most common way to say hello in Croatian. It can be used in both formal and informal situations.',
      hr: '"Zdravo" je najčešći način da se kaže pozdrav na hrvatskom. Može se koristiti u formalnim i neformalnim situacijama.',
    },
    A1_CONFIG,
    [
      {
        en: 'This is a greeting word',
        hr: 'Ovo je riječ za pozdrav',
      },
      {
        en: 'It starts with the letter "z"',
        hr: 'Počinje slovom "z"',
      },
    ],
  ),

  ExerciseService.createMultipleChoiceExercise(
    'hr_a1_mc_002',
    {
      en: 'How do you say "goodbye" in Croatian?',
      hr: 'Kako se kaže "goodbye" na hrvatskom?',
    },
    [
      { en: 'Zdravo', hr: 'Zdravo' },
      { en: 'Doviđenja', hr: 'Doviđenja' },
      { en: 'Hvala', hr: 'Hvala' },
      { en: 'Molim', hr: 'Molim' },
    ],
    'Doviđenja',
    {
      en: '"Doviđenja" is the formal way to say goodbye in Croatian. It literally means "until we see each other again."',
      hr: '"Doviđenja" je formalni način da se kaže oproštaj na hrvatskom. Doslovno znači "dok se ponovno ne vidimo."',
    },
    A1_CONFIG,
    [
      {
        en: 'This is a farewell word',
        hr: 'Ovo je riječ za oproštaj',
      },
      {
        en: 'It has 9 letters',
        hr: 'Ima 9 slova',
      },
    ],
  ),

  ExerciseService.createMultipleChoiceExercise(
    'hr_a1_mc_003',
    {
      en: 'What does "hvala" mean?',
      hr: 'Što znači "hvala"?',
    },
    [
      { en: 'Hello', hr: 'Zdravo' },
      { en: 'Goodbye', hr: 'Doviđenja' },
      { en: 'Thank you', hr: 'Hvala' },
      { en: 'Please', hr: 'Molim' },
    ],
    'Thank you',
    {
      en: '"Hvala" means "thank you" in Croatian. It\'s used to express gratitude.',
      hr: '"Hvala" znači "thank you" na hrvatskom. Koristi se za izražavanje zahvalnosti.',
    },
    A1_CONFIG,
  ),
];

// Fill in the Blank Exercises
export const fillBlankExercises: MultilingualExercise[] = [
  ExerciseService.createFillBlankExercise(
    'hr_a1_fb_001',
    {
      en: 'I am ___ years old.',
      hr: 'Imam ___ godina.',
    },
    2, // blank position
    'twenty',
    [
      { en: 'twenty', hr: 'dvadeset' },
      { en: 'thirty', hr: 'trideset' },
      { en: 'forty', hr: 'četrdeset' },
      { en: 'fifty', hr: 'pedeset' },
    ],
    {
      en: 'The blank should be filled with a number to complete the sentence about age. "Twenty" is the correct answer.',
      hr: 'Praznina se treba popuniti brojem da se završi rečenica o godinama. "Dvadeset" je točan odgovor.',
    },
    A1_CONFIG,
    [
      {
        en: 'This is about age',
        hr: 'Ovo je o godinama',
      },
      {
        en: 'It\'s a number between 10 and 100',
        hr: 'To je broj između 10 i 100',
      },
    ],
  ),

  ExerciseService.createFillBlankExercise(
    'hr_a1_fb_002',
    {
      en: 'My name ___ Ana.',
      hr: 'Moje ime ___ Ana.',
    },
    2, // blank position
    'is',
    [
      { en: 'is', hr: 'je' },
      { en: 'are', hr: 'su' },
      { en: 'am', hr: 'sam' },
      { en: 'be', hr: 'biti' },
    ],
    {
      en: 'The verb "is" is used with third person singular subjects like "my name".',
      hr: 'Glagol "je" se koristi s trećim licem jednine kao što je "moje ime".',
    },
    A1_CONFIG,
  ),

  ExerciseService.createFillBlankExercise(
    'hr_a1_fb_003',
    {
      en: 'I ___ from Croatia.',
      hr: 'Ja ___ iz Hrvatske.',
    },
    1, // blank position
    'am',
    [
      { en: 'am', hr: 'sam' },
      { en: 'is', hr: 'je' },
      { en: 'are', hr: 'su' },
      { en: 'be', hr: 'biti' },
    ],
    {
      en: 'The verb "am" is used with first person singular "I".',
      hr: 'Glagol "sam" se koristi s prvim licem jednine "ja".',
    },
    A1_CONFIG,
  ),
];

// Match Pairs Exercises
export const matchPairsExercises: MultilingualExercise[] = [
  ExerciseService.createMatchPairsExercise(
    'hr_a1_mp_001',
    [
      {
        left: { en: 'Hello', hr: 'Zdravo' },
        right: { en: 'A greeting', hr: 'Pozdrav' },
      },
      {
        left: { en: 'Goodbye', hr: 'Doviđenja' },
        right: { en: 'A farewell', hr: 'Oproštaj' },
      },
      {
        left: { en: 'Thank you', hr: 'Hvala' },
        right: { en: 'Gratitude', hr: 'Zahvalnost' },
      },
      {
        left: { en: 'Please', hr: 'Molim' },
        right: { en: 'Polite request', hr: 'Uljudna molba' },
      },
    ],
    {
      en: 'Match the Croatian words with their English meanings. These are basic polite expressions.',
      hr: 'Povežite hrvatske riječi s njihovim engleskim značenjima. Ovo su osnovni uljudni izrazi.',
    },
    A1_CONFIG,
    [
      {
        en: 'These are all polite expressions',
        hr: 'Ovo su svi uljudni izrazi',
      },
      {
        en: 'They are commonly used in daily conversation',
        hr: 'Često se koriste u svakodnevnom razgovoru',
      },
    ],
  ),

  ExerciseService.createMatchPairsExercise(
    'hr_a1_mp_002',
    [
      {
        left: { en: 'One', hr: 'Jedan' },
        right: { en: '1', hr: '1' },
      },
      {
        left: { en: 'Two', hr: 'Dva' },
        right: { en: '2', hr: '2' },
      },
      {
        left: { en: 'Three', hr: 'Tri' },
        right: { en: '3', hr: '3' },
      },
      {
        left: { en: 'Four', hr: 'Četiri' },
        right: { en: '4', hr: '4' },
      },
    ],
    {
      en: 'Match the Croatian numbers with their English equivalents and digits.',
      hr: 'Povežite hrvatske brojeve s njihovim engleskim ekvivalentima i znamenkama.',
    },
    A1_CONFIG,
  ),

  ExerciseService.createMatchPairsExercise(
    'hr_a1_mp_003',
    [
      {
        left: { en: 'Red', hr: 'Crvena' },
        right: { en: 'A color', hr: 'Boja' },
      },
      {
        left: { en: 'Blue', hr: 'Plava' },
        right: { en: 'A color', hr: 'Boja' },
      },
      {
        left: { en: 'Green', hr: 'Zelena' },
        right: { en: 'A color', hr: 'Boja' },
      },
      {
        left: { en: 'Yellow', hr: 'Žuta' },
        right: { en: 'A color', hr: 'Boja' },
      },
    ],
    {
      en: 'Match the Croatian color words with their English equivalents.',
      hr: 'Povežite hrvatske riječi za boje s njihovim engleskim ekvivalentima.',
    },
    A1_CONFIG,
  ),
];

// Combined exercises for a lesson
export const sampleLessonExercises: MultilingualExercise[] = [
  ...multipleChoiceExercises,
  ...fillBlankExercises,
  ...matchPairsExercises,
];

// Exercise statistics for testing
export const exerciseStats = {
  totalExercises: sampleLessonExercises.length,
  multipleChoice: multipleChoiceExercises.length,
  fillBlank: fillBlankExercises.length,
  matchPairs: matchPairsExercises.length,
  averageDifficulty: 1,
  totalXPReward: sampleLessonExercises.reduce((sum, ex) => sum + ex.xpReward, 0),
  estimatedTime: sampleLessonExercises.reduce((sum, ex) => sum + (ex.timeLimit || 60), 0),
};

export default {
  multipleChoiceExercises,
  fillBlankExercises,
  matchPairsExercises,
  sampleLessonExercises,
  exerciseStats,
};
