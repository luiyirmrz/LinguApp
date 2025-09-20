import { StateCreator } from 'zustand';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
  points: number;
}

export interface GamificationSlice {
  points: number;
  level: number;
  experience: number;
  achievements: Achievement[];
  dailyStreak: number;
  lastLoginDate: string | null;
  addPoints: (points: number) => void;
  unlockAchievement: (achievementId: string) => void;
  incrementDailyStreak: () => void;
  resetDailyStreak: () => void;
  calculateLevel: () => number;
  getExperienceToNextLevel: () => number;
}

const initialAchievements: Achievement[] = [
  {
    id: 'first_lesson',
    name: 'First Steps',
    description: 'Complete your first lesson',
    icon: '🎯',
    unlocked: false,
    points: 50,
  },
  {
    id: 'streak_7',
    name: 'Week Warrior',
    description: 'Maintain a 7-day streak',
    icon: '🔥',
    unlocked: false,
    points: 100,
  },
  {
    id: 'perfect_score',
    name: 'Perfect Score',
    description: 'Get 100% on any lesson',
    icon: '⭐',
    unlocked: false,
    points: 200,
  },
];

export const createGamificationSlice: StateCreator<GamificationSlice> = (set, get) => ({
  points: 0,
  level: 1,
  experience: 0,
  achievements: initialAchievements,
  dailyStreak: 0,
  lastLoginDate: null,

  addPoints: (points: number) => {
    const { experience, calculateLevel } = get();
    const newExperience = experience + points;
    const newLevel = calculateLevel();
    
    set((state) => ({
      points: state.points + points,
      experience: newExperience,
      level: newLevel,
    }));
  },

  unlockAchievement: (achievementId: string) => {
    const { achievements, addPoints } = get();
    const achievement = achievements.find(a => a.id === achievementId);
    
    if (achievement && !achievement.unlocked) {
      set((state) => ({
        achievements: state.achievements.map(a =>
          a.id === achievementId
            ? { ...a, unlocked: true, unlockedAt: new Date().toISOString() }
            : a,
        ),
      }));
      
      addPoints(achievement.points);
    }
  },

  incrementDailyStreak: () => {
    const { dailyStreak } = get();
    set({ dailyStreak: dailyStreak + 1, lastLoginDate: new Date().toISOString() });
  },

  resetDailyStreak: () => {
    set({ dailyStreak: 0 });
  },

  calculateLevel: () => {
    const { experience } = get();
    // Simple level calculation: every 1000 XP = 1 level
    return Math.floor(experience / 1000) + 1;
  },

  getExperienceToNextLevel: () => {
    const { experience, level } = get();
    // const _experienceForCurrentLevel = (level - 1) * 1000;
    const experienceForNextLevel = level * 1000;
    return experienceForNextLevel - experience;
  },
});
