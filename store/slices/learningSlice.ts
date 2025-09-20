import { StateCreator } from 'zustand';

export interface Lesson {
  id: string;
  title: string;
  description: string;
  level: string;
  language: string;
  completed: boolean;
  score: number;
  lastAttempted?: string;
}

export interface Progress {
  lessonsCompleted: number;
  totalLessons: number;
  averageScore: number;
  timeSpent: number; // in minutes
  lastStudyDate?: string;
}

export interface LearningSlice {
  progress: Progress;
  currentLesson: Lesson | null;
  lessons: Lesson[];
  vocabulary: Record<string, any[]>;
  updateProgress: (updates: Partial<Progress>) => void;
  setCurrentLesson: (lesson: Lesson | null) => void;
  completeLesson: (lessonId: string, score: number) => void;
  addVocabulary: (language: string, words: any[]) => void;
  getProgressPercentage: () => number;
  getStreakDays: () => number;
}

const initialProgress: Progress = {
  lessonsCompleted: 0,
  totalLessons: 0,
  averageScore: 0,
  timeSpent: 0,
};

export const createLearningSlice: StateCreator<LearningSlice> = (set, get) => ({
  progress: initialProgress,
  currentLesson: null,
  lessons: [],
  vocabulary: {},

  updateProgress: (updates: Partial<Progress>) => {
    set((state) => ({
      progress: { ...state.progress, ...updates },
    }));
  },

  setCurrentLesson: (lesson: Lesson | null) => {
    set({ currentLesson: lesson });
  },

  completeLesson: (lessonId: string, score: number) => {
    const { lessons, progress } = get();
    const updatedLessons = lessons.map(lesson =>
      lesson.id === lessonId
        ? { ...lesson, completed: true, score, lastAttempted: new Date().toISOString() }
        : lesson,
    );

    const completedLessons = updatedLessons.filter(l => l.completed).length;
    const totalLessons = updatedLessons.length;
    const averageScore = updatedLessons
      .filter(l => l.completed)
      .reduce((acc, l) => acc + l.score, 0) / completedLessons || 0;

    set({
      lessons: updatedLessons,
      progress: {
        ...progress,
        lessonsCompleted: completedLessons,
        totalLessons,
        averageScore,
        lastStudyDate: new Date().toISOString(),
      },
    });
  },

  addVocabulary: (language: string, words: any[]) => {
    const { vocabulary } = get();
    set({
      vocabulary: {
        ...vocabulary,
        [language]: [...(vocabulary[language] || []), ...words],
      },
    });
  },

  getProgressPercentage: () => {
    const { progress } = get();
    if (progress.totalLessons === 0) return 0;
    return Math.round((progress.lessonsCompleted / progress.totalLessons) * 100);
  },

  getStreakDays: () => {
    const { progress } = get();
    if (!progress.lastStudyDate) return 0;
    
    const lastStudy = new Date(progress.lastStudyDate);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - lastStudy.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays === 1 ? 1 : 0; // Simplified streak calculation
  },
});
