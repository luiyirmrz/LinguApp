import { StateCreator } from 'zustand';

export interface GameState {
  currentLevel: number;
  lives: number;
  streak: number;
  isPlaying: boolean;
  currentExercise: string | null;
  completedExercises: string[];
  score: number;
}

export interface GameStateSlice {
  gameState: GameState;
  updateGameState: (updates: Partial<GameState>) => void;
  resetGameState: () => void;
  addLife: () => void;
  removeLife: () => void;
  incrementStreak: () => void;
  resetStreak: () => void;
  completeExercise: (exerciseId: string) => void;
  addScore: (points: number) => void;
}

const initialGameState: GameState = {
  currentLevel: 1,
  lives: 5,
  streak: 0,
  isPlaying: false,
  currentExercise: null,
  completedExercises: [],
  score: 0,
};

export const createGameStateSlice: StateCreator<GameStateSlice> = (set, get) => ({
  gameState: initialGameState,

  updateGameState: (updates: Partial<GameState>) => {
    set((state) => ({
      gameState: { ...state.gameState, ...updates },
    }));
  },

  resetGameState: () => {
    set({ gameState: initialGameState });
  },

  addLife: () => {
    const { gameState } = get();
    set({
      gameState: { ...gameState, lives: Math.min(gameState.lives + 1, 5) },
    });
  },

  removeLife: () => {
    const { gameState } = get();
    set({
      gameState: { ...gameState, lives: Math.max(gameState.lives - 1, 0) },
    });
  },

  incrementStreak: () => {
    const { gameState } = get();
    set({
      gameState: { ...gameState, streak: gameState.streak + 1 },
    });
  },

  resetStreak: () => {
    const { gameState } = get();
    set({
      gameState: { ...gameState, streak: 0 },
    });
  },

  completeExercise: (exerciseId: string) => {
    const { gameState } = get();
    if (!gameState.completedExercises.includes(exerciseId)) {
      set({
        gameState: {
          ...gameState,
          completedExercises: [...gameState.completedExercises, exerciseId],
        },
      });
    }
  },

  addScore: (points: number) => {
    const { gameState } = get();
    set({
      gameState: { ...gameState, score: gameState.score + points },
    });
  },
});
