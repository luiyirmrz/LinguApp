import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useCallback, useMemo, useEffect } from 'react';
import { 
  MultilingualLesson, 
  MultilingualSkill, 
  VocabularyItem, 
  GrammarConcept, 
  MultilingualContent,
  CEFRLevel,
  Language,
  SpacedRepetitionItem,
} from '@/types';

// Local type definition for language learning
interface LanguageProgress {
  languageCode: string;
  currentLevel: CEFRLevel;
  totalXP: number;
  completedSkills: string[];
  streak: number;
  achievements: string[];
  weakAreas: string[];
  strongAreas: string[];
  lastPracticeDate: string;
}
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';
import { 
  croatianA1Lessons, 
  croatianA1Skills, 
  croatianA1Vocabulary,
  getLessonsBySkillId,
  getVocabularyByLessonId, 
} from '@/levels/A1/croatian-a1-lessons';
import { languages, getLanguageByCode } from '@/mocks/languages';

interface MultilingualLearningState {
  currentLanguageProgress: LanguageProgress | null;
  availableSkills: MultilingualSkill[];
  availableLessons: MultilingualLesson[];
  vocabulary: VocabularyItem[];
  spacedRepetitionItems: SpacedRepetitionItem[];
  isLoading: boolean;
  mainLanguage: string; // UI language
  targetLanguage: string; // Language being learned
}

export const [MultilingualLearningProvider, useMultilingualLearning] = createContextHook(() => {
  // Safely get auth context with fallback
  let user: any = null;
  let updateUser: ((updates: any) => Promise<void>) | null = null;
  
  try {
    const authContext = useUnifiedAuth();
    user = authContext?.user || null;
    updateUser = authContext?.updateUser || null;
  } catch (error) {
    console.warn('useUnifiedAuth not available in useMultilingualLearning:', error);
    // Provide fallback values
    user = null;
    updateUser = null;
  }
  const [state, setState] = useState<MultilingualLearningState>({
    currentLanguageProgress: null,
    availableSkills: [],
    availableLessons: [],
    vocabulary: [],
    spacedRepetitionItems: [],
    isLoading: true,
    mainLanguage: 'en',
    targetLanguage: 'hr',
  });

  const initializeMultilingualLearning = useCallback(async () => {
    if (!user || !updateUser) return;

    try {
      console.debug('Initializing multilingual learning...');
      
      // Get user's language preferences
      const mainLanguage = user.mainLanguage?.code || 'en';
      const targetLanguage = user.currentLanguage?.code || 'hr';
      
      console.debug(`Main language: ${mainLanguage}, Target language: ${targetLanguage}`);
      
      // Get or create language progress for current target language
      let currentProgress = user.languageProgress?.find(
        (p: any) => p.languageCode === targetLanguage,
      );

      let shouldUpdateUser = false;
      if (!currentProgress) {
        // Create new progress for this language
        currentProgress = {
          languageCode: targetLanguage,
          currentLevel: 'A1',
          totalXP: 0,
          completedSkills: [],
          streak: 0,
          achievements: [],
          weakAreas: [],
          strongAreas: [],
          lastPracticeDate: new Date().toISOString(),
        };
        shouldUpdateUser = true;
      }

      // Load skills and lessons based on target language
      let skills: MultilingualSkill[] = [];
      let lessons: MultilingualLesson[] = [];
      let vocabulary: VocabularyItem[] = [];

      if (targetLanguage === 'hr') {
        // Croatian content
        skills = croatianA1Skills.map(skill => ({
          ...skill,
          mainLanguage,
          targetLanguage,
          locked: skill.id === 'hr_a1_skill_001' ? false : !currentProgress!.completedSkills.includes(getPrerequisiteSkillId(skill.id)),
        }));
        
        lessons = croatianA1Lessons.map(lesson => ({
          ...lesson,
          mainLanguage,
          targetLanguage,
        }));
        
        vocabulary = croatianA1Vocabulary;
      }

      // Load spaced repetition items
      const spacedRepetitionKey = `spaced_repetition_${user.id}_${targetLanguage}`;
      const storedSpacedRepetition = await AsyncStorage.getItem(spacedRepetitionKey);
      let spacedRepetitionItems: SpacedRepetitionItem[] = [];

      if (storedSpacedRepetition) {
        spacedRepetitionItems = JSON.parse(storedSpacedRepetition);
      }

      setState({
        currentLanguageProgress: currentProgress,
        availableSkills: skills,
        availableLessons: lessons,
        vocabulary,
        spacedRepetitionItems,
        isLoading: false,
        mainLanguage,
        targetLanguage,
      });

      // Update user only if needed
      if (shouldUpdateUser) {
        const updatedLanguageProgress = [...(user.languageProgress || []), currentProgress];
        await updateUser({ languageProgress: updatedLanguageProgress });
      }
    } catch (error) {
      console.error('Error initializing multilingual learning:', error);
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [user?.id, user?.mainLanguage?.code, user?.currentLanguage?.code, updateUser]);

  // Initialize when user or language changes
  useEffect(() => {
    if (user?.id && user?.mainLanguage?.code && user?.currentLanguage?.code) {
      initializeMultilingualLearning();
    }
  }, [user?.id, user?.mainLanguage?.code, user?.currentLanguage?.code]); // Use specific dependencies instead of callback

  const switchMainLanguage = useCallback(async (newMainLanguage: Language) => {
    if (!user || !updateUser) return;

    console.debug(`Switching main language to: ${newMainLanguage.code}`);
    
    // Update user's main language
    await updateUser({ mainLanguage: newMainLanguage });
    
    // Reinitialize with new main language
    setState(prev => ({ ...prev, isLoading: true }));
  }, [user, updateUser]);

  const switchTargetLanguage = useCallback(async (newTargetLanguage: Language) => {
    if (!user || !updateUser) return;

    console.debug(`Switching target language to: ${newTargetLanguage.code}`);
    
    // Update user's current language (target language)
    await updateUser({ currentLanguage: newTargetLanguage });
    
    // Reinitialize with new target language
    setState(prev => ({ ...prev, isLoading: true }));
  }, [user, updateUser]);

  const completeLesson = useCallback(async (
    lessonId: string,
    performance: {
      correctAnswers: number;
      totalAnswers: number;
      timeSpent: number;
    },
  ) => {
    if (!user || !state.currentLanguageProgress) return { xpEarned: 0, levelUp: false };

    const lesson = state.availableLessons.find(l => l.id === lessonId);
    if (!lesson) return { xpEarned: 0, levelUp: false };

    try {
      // Calculate XP based on performance
      const baseXP = lesson.xpReward;
      const accuracyBonus = Math.floor((performance.correctAnswers / performance.totalAnswers) * 10);
      const speedBonus = performance.timeSpent < lesson.estimatedTime * 60 ? 5 : 0;
      const totalXP = baseXP + accuracyBonus + speedBonus;

      // Mark lesson as completed
      lesson.completed = true;

      // Update language progress
      const updatedProgress: LanguageProgress = {
        ...state.currentLanguageProgress,
        totalXP: state.currentLanguageProgress.totalXP + totalXP,
        lastPracticeDate: new Date().toISOString(),
      };

      // Check if any skills are completed
      const completedSkillIds: string[] = [];
      state.availableSkills.forEach(skill => {
        const skillLessons = getLessonsBySkillId(skill.id);
        const allCompleted = skillLessons.every(l => l.completed);
        if (allCompleted && !updatedProgress.completedSkills.includes(skill.id)) {
          completedSkillIds.push(skill.id);
        }
      });

      updatedProgress.completedSkills = [...updatedProgress.completedSkills, ...completedSkillIds];

      // Update user's language progress
      const updatedLanguageProgress = user.languageProgress?.map((p: any) => 
        p.languageCode === state.targetLanguage ? updatedProgress : p,
      ) || [updatedProgress];

      if (updateUser) {
        await updateUser({ 
          languageProgress: updatedLanguageProgress,
          totalXP: (user.totalXP || 0) + totalXP,
          points: (user.points || 0) + totalXP,
        });
      }

      // Update spaced repetition items
      const newSpacedRepetitionItems: SpacedRepetitionItem[] = [];
      lesson.vocabularyIntroduced.forEach(vocab => {
        const existingItem = state.spacedRepetitionItems.find(item => item.itemId === vocab.id);
        if (!existingItem) {
          newSpacedRepetitionItems.push({
            id: `sr_${vocab.id}_${Date.now()}`,
            userId: user.id,
            itemId: vocab.id,
            itemType: 'vocabulary',
            languageCode: state.targetLanguage,
            easeFactor: 2.5,
            interval: 1,
            repetitions: 0,
            nextReviewDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
            lastReviewed: new Date().toISOString(),
            quality: 3,
            averageQuality: 3,
            totalReviews: 0,
          });
        }
      });

      const updatedSpacedRepetitionItems = [...state.spacedRepetitionItems, ...newSpacedRepetitionItems];
      
      // Save spaced repetition items
      const spacedRepetitionKey = `spaced_repetition_${user.id}_${state.targetLanguage}`;
      await AsyncStorage.setItem(spacedRepetitionKey, JSON.stringify(updatedSpacedRepetitionItems));

      // Unlock next skills
      const updatedSkills = state.availableSkills.map(skill => {
        if (skill.locked && skill.prerequisites.every(prereq => updatedProgress.completedSkills.includes(prereq))) {
          return { ...skill, locked: false };
        }
        return skill;
      });

      setState(prev => ({
        ...prev,
        currentLanguageProgress: updatedProgress,
        availableSkills: updatedSkills,
        spacedRepetitionItems: updatedSpacedRepetitionItems,
      }));

      return { xpEarned: totalXP, levelUp: false }; // TODO: Implement level up detection
    } catch (error) {
      console.error('Error completing lesson:', error);
      throw error;
    }
  }, [user, state, updateUser]);

  const getUIText = useCallback((key: string): string => {
    const uiTexts: { [key: string]: MultilingualContent } = {
      'lesson.complete': {
        en: 'Lesson Complete!',
        es: '¡Lección Completada!',
        hr: 'Lekcija Završena!',
      },
      'lesson.start': {
        en: 'Start Lesson',
        es: 'Comenzar Lección',
        hr: 'Počni Lekciju',
      },
      'lesson.continue': {
        en: 'Continue',
        es: 'Continuar',
        hr: 'Nastavi',
      },
      'lesson.correct': {
        en: 'Correct!',
        es: '¡Correcto!',
        hr: 'Točno!',
      },
      'lesson.incorrect': {
        en: 'Incorrect',
        es: 'Incorrecto',
        hr: 'Netočno',
      },
      'nav.home': {
        en: 'Home',
        es: 'Inicio',
        hr: 'Početna',
      },
      'nav.profile': {
        en: 'Profile',
        es: 'Perfil',
        hr: 'Profil',
      },
      'nav.leaderboard': {
        en: 'Leaderboard',
        es: 'Clasificación',
        hr: 'Ljestvica',
      },
      'nav.shop': {
        en: 'Shop',
        es: 'Tienda',
        hr: 'Trgovina',
      },
      'settings.main_language': {
        en: 'Main Language',
        es: 'Idioma Principal',
        hr: 'Glavni Jezik',
      },
      'settings.target_language': {
        en: 'Learning Language',
        es: 'Idioma de Aprendizaje',
        hr: 'Jezik Učenja',
      },
    };

    const text = uiTexts[key];
    return text?.[state.mainLanguage] || text?.['en'] || key;
  }, [state.mainLanguage]);

  const getRecommendedLesson = useCallback((): MultilingualLesson | null => {
    // Find the first incomplete lesson in unlocked skills
    for (const skill of state.availableSkills) {
      if (!skill.locked) {
        const skillLessons = getLessonsBySkillId(skill.id);
        const incompleteLesson = skillLessons.find(lesson => !lesson.completed);
        if (incompleteLesson) {
          return incompleteLesson;
        }
      }
    }
    return null;
  }, [state.availableSkills]);

  const getLanguageStats = useCallback(() => {
    if (!state.currentLanguageProgress) return null;

    const completedLessons = state.availableLessons.filter(lesson => lesson.completed).length;
    const totalLessons = state.availableLessons.length;

    return {
      currentLevel: state.currentLanguageProgress.currentLevel,
      totalXP: state.currentLanguageProgress.totalXP,
      completedSkills: state.currentLanguageProgress.completedSkills.length,
      totalSkills: state.availableSkills.length,
      completedLessons,
      totalLessons,
      streak: state.currentLanguageProgress.streak,
      weakAreas: state.currentLanguageProgress.weakAreas,
      strongAreas: state.currentLanguageProgress.strongAreas,
      mainLanguage: state.mainLanguage,
      targetLanguage: state.targetLanguage,
    };
  }, [state]);

  const getAvailableMainLanguages = useCallback(() => {
    return languages.filter(lang => ['en', 'es'].includes(lang.code));
  }, []);

  const getAvailableTargetLanguages = useCallback(() => {
    return languages.filter(lang => ['hr'].includes(lang.code));
  }, []);

  return useMemo(() => ({
    ...state,
    switchMainLanguage,
    switchTargetLanguage,
    completeLesson,
    getUIText,
    getRecommendedLesson,
    getLanguageStats,
    getAvailableMainLanguages,
    getAvailableTargetLanguages,
    initializeMultilingualLearning,
  }), [
    state,
    switchMainLanguage,
    switchTargetLanguage,
    completeLesson,
    getUIText,
    getRecommendedLesson,
    getLanguageStats,
    getAvailableMainLanguages,
    getAvailableTargetLanguages,
    initializeMultilingualLearning,
  ]);
});

// Helper function to get prerequisite skill ID
function getPrerequisiteSkillId(skillId: string): string {
  const skillOrder = [
    'hr_a1_skill_001',
    'hr_a1_skill_002', 
    'hr_a1_skill_003',
    'hr_a1_skill_004',
    'hr_a1_skill_005',
  ];
  
  const currentIndex = skillOrder.indexOf(skillId);
  return currentIndex > 0 ? skillOrder[currentIndex - 1] : '';
}
