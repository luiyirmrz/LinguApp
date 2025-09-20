// Enhanced Gamification Service
// Comprehensive gamification system supporting multiple learning paths, streaks, lives, and monetization
// Integrates with the comprehensive lesson generator and supports all CEFR levels

import { 
  CEFRLevel, 
  MultilingualContent, 
  Achievement,
  DailyChallenge,
  League,
  WeeklyLeaderboard,
  Challenge,
  EnhancedShopItem,
  AvatarCustomization,
  MultilingualLesson,
  LessonModule,
} from '@/types';
import { CEFR_WORD_TARGETS, WORDS_PER_LESSON, LESSONS_PER_LEVEL } from '../learning/comprehensiveLessonGenerator';

// Gamification constants
export const GAMIFICATION_CONSTANTS = {
  // XP and progression
  BASE_XP_PER_LESSON: 100,
  XP_MULTIPLIER_PER_LEVEL: 1.5,
  STREAK_BONUS_MULTIPLIER: 0.1, // 10% bonus per day in streak
  MAX_STREAK_BONUS: 2.0, // Maximum 200% bonus
  
  // Lives system
  MAX_LIVES: 5,
  LIFE_REGENERATION_TIME: 30 * 60 * 1000, // 30 minutes in milliseconds
  LIVES_PER_DAY: 24, // Maximum lives that can be earned per day
  
  // Streak system
  STREAK_FREEZE_DURATION: 24 * 60 * 60 * 1000, // 24 hours
  STREAK_WARNING_THRESHOLD: 12 * 60 * 60 * 1000, // 12 hours before streak expires
  
  // Achievement thresholds
  LESSONS_COMPLETED_THRESHOLDS: [10, 25, 50, 100, 250, 500, 1000],
  STREAK_THRESHOLDS: [3, 7, 14, 30, 60, 100, 365],
  ACCURACY_THRESHOLDS: [75, 80, 85, 90, 95, 98],
  XP_THRESHOLDS: [1000, 5000, 10000, 25000, 50000, 100000, 250000],
  
  // League thresholds
  LEAGUE_XP_THRESHOLDS: {
    bronze: 0,
    silver: 5000,
    gold: 15000,
    platinum: 35000,
    diamond: 75000,
    legendary: 150000,
  },
  
  // Daily challenges
  DAILY_CHALLENGE_XP_REWARD: 50,
  DAILY_CHALLENGE_COIN_REWARD: 10,
  
  // Shop items
  SHOP_ITEM_CATEGORIES: {
    hearts: { basePrice: 100, maxQuantity: 10 },
    lives: { basePrice: 50, maxQuantity: 5 },
    streakFreeze: { basePrice: 200, maxQuantity: 3 },
    xpBoost: { basePrice: 150, maxQuantity: 5 },
    avatar: { basePrice: 500, maxQuantity: 1 },
    themes: { basePrice: 300, maxQuantity: 1 },
    premium: { basePrice: 1000, maxQuantity: 1 },
  },
};

// User gamification state
export interface UserGamificationState {
  userId: string;
  currentLevel: CEFRLevel;
  totalXP: number;
  currentStreak: number;
  longestStreak: number;
  lastStudyDate: string;
  lives: number;
  lastLifeRegeneration: string;
  streakFreezeActive: boolean;
  streakFreezeExpires: string | null;
  xpBoostActive: boolean;
  xpBoostExpires: string | null;
  xpBoostMultiplier: number;
  achievements: Achievement[];
  dailyChallenges: DailyChallenge[];
  currentLeague: string;
  leagueXP: number;
  coins: number;
  gems: number;
  shopItems: EnhancedShopItem[];
  avatar: AvatarCustomization;
  completedLessons: string[];
  lessonAccuracy: { [lessonId: string]: number };
  weeklyProgress: {
    week: string;
    xpEarned: number;
    lessonsCompleted: number;
    timeSpent: number;
    accuracy: number;
  }[];
  learningPaths: {
    mainPath: LearningPathProgress;
    alternativePaths: AlternativePathProgress[];
  };
  monetizationFeatures: {
    hasPremium: boolean;
    premiumExpires: string | null;
    purchasedPackages: string[];
    adWatchedToday: number;
    maxAdsPerDay: number;
  };
}

// Learning path progress
export interface LearningPathProgress {
  pathId: string;
  pathType: 'main' | 'alternative' | 'challenge' | 'review';
  currentLesson: string;
  completedLessons: string[];
  totalLessons: number;
  accuracy: number;
  timeSpent: number;
  xpEarned: number;
  difficulty: number;
  isActive: boolean;
  unlockRequirements: {
    previousPathId?: string;
    minimumXP?: number;
    minimumAccuracy?: number;
    completedLessons?: string[];
  };
}

// Alternative path progress
export interface AlternativePathProgress extends LearningPathProgress {
  penaltyMultiplier: number; // XP penalty for failing
  rewardMultiplier: number; // XP bonus for succeeding
  riskLevel: 'low' | 'medium' | 'high';
  timeLimit?: number; // Optional time limit
  livesCost: number; // Lives lost on failure
}

// Micro-challenge types
export interface MicroChallenge {
  id: string;
  type: 'timed_translation' | 'quick_match' | 'rapid_fire' | 'memory_game' | 'speed_reading';
  title: MultilingualContent;
  description: MultilingualContent;
  difficulty: number;
  timeLimit: number;
  xpReward: number;
  coinReward: number;
  livesCost: number;
  requirements: {
    minimumLevel: CEFRLevel;
    minimumXP: number;
    completedLessons?: string[];
  };
  content: any; // Challenge-specific content
}

export class EnhancedGamificationService {
  private userState: UserGamificationState | null = null;
  private lessonGenerator: any; // Will be imported from comprehensiveLessonGenerator

  constructor() {
    this.initializeService();
  }

  // Initialize the gamification service
  private async initializeService() {
    // Load user state from storage
    await this.loadUserState();
    
    // Initialize daily challenges
    await this.initializeDailyChallenges();
    
    // Check for streak warnings
    this.checkStreakWarnings();
    
    // Start life regeneration timer
    this.startLifeRegenerationTimer();
  }

  // Load user gamification state
  private async loadUserState(): Promise<void> {
    try {
      // This would load from AsyncStorage or database
      // For now, we'll create a default state
      this.userState = this.createDefaultUserState();
    } catch (error) {
      console.error('Error loading user gamification state:', error);
      this.userState = this.createDefaultUserState();
    }
  }

  // Create default user state
  private createDefaultUserState(): UserGamificationState {
    return {
      userId: 'default_user',
      currentLevel: 'A1',
      totalXP: 0,
      currentStreak: 0,
      longestStreak: 0,
      lastStudyDate: new Date().toISOString(),
      lives: GAMIFICATION_CONSTANTS.MAX_LIVES,
      lastLifeRegeneration: new Date().toISOString(),
      streakFreezeActive: false,
      streakFreezeExpires: null,
      xpBoostActive: false,
      xpBoostExpires: null,
      xpBoostMultiplier: 1.0,
      achievements: [],
      dailyChallenges: [],
      currentLeague: 'bronze',
      leagueXP: 0,
      coins: 100, // Starting coins
      gems: 10, // Starting gems
      shopItems: [],
      avatar: this.createDefaultAvatar(),
      completedLessons: [],
      lessonAccuracy: {},
      weeklyProgress: [],
      learningPaths: {
        mainPath: this.createMainLearningPath(),
        alternativePaths: [],
      },
      monetizationFeatures: {
        hasPremium: false,
        premiumExpires: null,
        purchasedPackages: [],
        adWatchedToday: 0,
        maxAdsPerDay: 5,
      },
    };
  }

  // Create default avatar
  private createDefaultAvatar(): AvatarCustomization {
    return {
      head: 'default_head',
      body: 'default_body',
      outfit: 'default_outfit',
      background: 'default_background',
      unlockedItems: ['default_head', 'default_body', 'default_outfit', 'default_background'],
    };
  }

  // Create main learning path
  private createMainLearningPath(): LearningPathProgress {
    return {
      pathId: 'main_path',
      pathType: 'main',
      currentLesson: 'A1_basic_greetings_1',
      completedLessons: [],
      totalLessons: Object.values(LESSONS_PER_LEVEL).reduce((sum, count) => sum + count, 0),
      accuracy: 0,
      timeSpent: 0,
      xpEarned: 0,
      difficulty: 1,
      isActive: true,
      unlockRequirements: {},
    };
  }

  // Complete a lesson and update gamification state
  public async completeLesson(
    lessonId: string,
    accuracy: number,
    timeSpent: number,
    exercisesCompleted: number,
  ): Promise<{
    xpEarned: number;
    streakUpdated: boolean;
    achievementsUnlocked: Achievement[];
    levelUp: boolean;
    newLevel?: CEFRLevel;
    coinsEarned: number;
    gemsEarned: number;
  }> {
    if (!this.userState) {
      throw new Error('User gamification state not initialized');
    }

    // Calculate base XP
    let baseXP = GAMIFICATION_CONSTANTS.BASE_XP_PER_LESSON;
    
    // Apply level multiplier
    const levelMultiplier = Math.pow(GAMIFICATION_CONSTANTS.XP_MULTIPLIER_PER_LEVEL, 
      this.getLevelIndex(this.userState.currentLevel));
    baseXP *= levelMultiplier;
    
    // Apply accuracy bonus
    const accuracyBonus = accuracy / 100;
    baseXP *= (1 + accuracyBonus);
    
    // Apply streak bonus
    const streakBonus = Math.min(
      this.userState.currentStreak * GAMIFICATION_CONSTANTS.STREAK_BONUS_MULTIPLIER,
      GAMIFICATION_CONSTANTS.MAX_STREAK_BONUS,
    );
    baseXP *= (1 + streakBonus);
    
    // Apply XP boost if active
    if (this.userState.xpBoostActive) {
      baseXP *= this.userState.xpBoostMultiplier;
    }
    
    const xpEarned = Math.round(baseXP);
    
    // Update user state
    this.userState.totalXP += xpEarned;
    this.userState.completedLessons.push(lessonId);
    this.userState.lessonAccuracy[lessonId] = accuracy;
    
    // Update streak
    const streakUpdated = this.updateStreak();
    
    // Check for achievements
    const achievementsUnlocked = this.checkAchievements();
    
    // Check for level up
    const levelUp = this.checkLevelUp();
    const newLevel = levelUp ? this.calculateNewLevel() : undefined;
    
    // Calculate coins and gems earned
    const coinsEarned = Math.floor(xpEarned / 10);
    const gemsEarned = accuracy >= 95 ? 1 : 0;
    
    this.userState.coins += coinsEarned;
    this.userState.gems += gemsEarned;
    
    // Update learning path progress
    this.updateLearningPathProgress(lessonId, accuracy, timeSpent, xpEarned);
    
    // Update weekly progress
    this.updateWeeklyProgress(xpEarned, 1, timeSpent, accuracy);
    
    // Save state
    await this.saveUserState();
    
    return {
      xpEarned,
      streakUpdated,
      achievementsUnlocked,
      levelUp,
      newLevel,
      coinsEarned,
      gemsEarned,
    };
  }

  // Update streak
  private updateStreak(): boolean {
    if (!this.userState) return false;
    
    const now = new Date();
    const lastStudy = new Date(this.userState.lastStudyDate);
    const timeDiff = now.getTime() - lastStudy.getTime();
    const oneDay = 24 * 60 * 60 * 1000;
    
    // Check if streak freeze is active
    if (this.userState.streakFreezeActive && this.userState.streakFreezeExpires) {
      const freezeExpires = new Date(this.userState.streakFreezeExpires);
      if (now < freezeExpires) {
        // Streak is protected
        this.userState.lastStudyDate = now.toISOString();
        return false;
      } else {
        // Streak freeze expired
        this.userState.streakFreezeActive = false;
        this.userState.streakFreezeExpires = null;
      }
    }
    
    if (timeDiff <= oneDay) {
      // Same day or next day, continue streak
      this.userState.currentStreak++;
      if (this.userState.currentStreak > this.userState.longestStreak) {
        this.userState.longestStreak = this.userState.currentStreak;
      }
    } else if (timeDiff <= 2 * oneDay) {
      // Next day, continue streak
      this.userState.currentStreak++;
      if (this.userState.currentStreak > this.userState.longestStreak) {
        this.userState.longestStreak = this.userState.currentStreak;
      }
    } else {
      // Streak broken
      this.userState.currentStreak = 1;
    }
    
    this.userState.lastStudyDate = now.toISOString();
    return true;
  }

  // Check for achievements
  private checkAchievements(): Achievement[] {
    if (!this.userState) return [];
    
    const unlockedAchievements: Achievement[] = [];
    const existingAchievementIds = this.userState.achievements.map(a => a.id);
    
    // Check lessons completed achievements
    GAMIFICATION_CONSTANTS.LESSONS_COMPLETED_THRESHOLDS.forEach(threshold => {
      if (this.userState!.completedLessons.length >= threshold && 
          !existingAchievementIds.includes(`lessons_${threshold}`)) {
        unlockedAchievements.push({
          id: `lessons_${threshold}`,
          name: `Lesson Master ${threshold}`,
          title: `Lesson Master ${threshold}`,
          description: `Complete ${threshold} lessons`,
          icon: '📚',
          unlocked: true,
          unlockedAt: new Date().toISOString(),
          points: threshold * 10,
        });
      }
    });
    
    // Check streak achievements
    GAMIFICATION_CONSTANTS.STREAK_THRESHOLDS.forEach(threshold => {
      if (this.userState!.currentStreak >= threshold && 
          !existingAchievementIds.includes(`streak_${threshold}`)) {
        unlockedAchievements.push({
          id: `streak_${threshold}`,
          name: `Streak Master ${threshold}`,
          title: `Streak Master ${threshold}`,
          description: `Maintain a ${threshold}-day streak`,
          icon: '🔥',
          unlocked: true,
          unlockedAt: new Date().toISOString(),
          points: threshold * 5,
        });
      }
    });
    
    // Check XP achievements
    GAMIFICATION_CONSTANTS.XP_THRESHOLDS.forEach(threshold => {
      if (this.userState!.totalXP >= threshold && 
          !existingAchievementIds.includes(`xp_${threshold}`)) {
        unlockedAchievements.push({
          id: `xp_${threshold}`,
          name: `XP Collector ${threshold}`,
          title: `XP Collector ${threshold}`,
          description: `Earn ${threshold} XP`,
          icon: '⭐',
          unlocked: true,
          unlockedAt: new Date().toISOString(),
          points: threshold / 100,
        });
      }
    });
    
    // Add new achievements to user state
    this.userState.achievements.push(...unlockedAchievements);
    
    return unlockedAchievements;
  }

  // Check for level up
  private checkLevelUp(): boolean {
    if (!this.userState) return false;
    
    const currentLevelIndex = this.getLevelIndex(this.userState.currentLevel);
    const newLevel = this.calculateNewLevel();
    
    if (newLevel !== this.userState.currentLevel) {
      this.userState.currentLevel = newLevel;
      return true;
    }
    
    return false;
  }

  // Calculate new level based on XP
  private calculateNewLevel(): CEFRLevel {
    if (!this.userState) return 'A1';
    
    const xp = this.userState.totalXP;
    
    if (xp >= 50000) return 'C2';
    if (xp >= 25000) return 'C1';
    if (xp >= 10000) return 'B2';
    if (xp >= 5000) return 'B1';
    if (xp >= 2000) return 'A2';
    return 'A1';
  }

  // Get level index for calculations
  private getLevelIndex(level: CEFRLevel): number {
    const levels: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
    return levels.indexOf(level);
  }

  // Update learning path progress
  private updateLearningPathProgress(
    lessonId: string,
    accuracy: number,
    timeSpent: number,
    xpEarned: number,
  ): void {
    if (!this.userState) return;
    
    const mainPath = this.userState.learningPaths.mainPath;
    mainPath.completedLessons.push(lessonId);
    mainPath.xpEarned += xpEarned;
    mainPath.timeSpent += timeSpent;
    
    // Update accuracy (running average)
    const totalAccuracy = Object.values(this.userState.lessonAccuracy).reduce((sum, acc) => sum + acc, 0);
    mainPath.accuracy = totalAccuracy / this.userState.completedLessons.length;
  }

  // Update weekly progress
  private updateWeeklyProgress(
    xpEarned: number,
    lessonsCompleted: number,
    timeSpent: number,
    accuracy: number,
  ): void {
    if (!this.userState) return;
    
    const now = new Date();
    const weekStart = this.getWeekStart(now);
    const weekKey = weekStart.toISOString().split('T')[0];
    
    let weekProgress = this.userState.weeklyProgress.find(wp => wp.week === weekKey);
    
    if (!weekProgress) {
      weekProgress = {
        week: weekKey,
        xpEarned: 0,
        lessonsCompleted: 0,
        timeSpent: 0,
        accuracy: 0,
      };
      this.userState.weeklyProgress.push(weekProgress);
    }
    
    weekProgress.xpEarned += xpEarned;
    weekProgress.lessonsCompleted += lessonsCompleted;
    weekProgress.timeSpent += timeSpent;
    
    // Update accuracy (running average)
    const totalAccuracy = (weekProgress.accuracy * (weekProgress.lessonsCompleted - 1) + accuracy) / weekProgress.lessonsCompleted;
    weekProgress.accuracy = totalAccuracy;
  }

  // Get week start date
  private getWeekStart(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    return new Date(d.setDate(diff));
  }

  // Use a life
  public useLife(): boolean {
    if (!this.userState || this.userState.lives <= 0) {
      return false;
    }
    
    this.userState.lives--;
    return true;
  }

  // Regenerate lives
  private regenerateLives(): void {
    if (!this.userState) return;
    
    const now = new Date();
    const lastRegeneration = new Date(this.userState.lastLifeRegeneration);
    const timeDiff = now.getTime() - lastRegeneration.getTime();
    
    if (timeDiff >= GAMIFICATION_CONSTANTS.LIFE_REGENERATION_TIME) {
      const livesToAdd = Math.floor(timeDiff / GAMIFICATION_CONSTANTS.LIFE_REGENERATION_TIME);
      this.userState.lives = Math.min(
        GAMIFICATION_CONSTANTS.MAX_LIVES,
        this.userState.lives + livesToAdd,
      );
      this.userState.lastLifeRegeneration = now.toISOString();
    }
  }

  // Start life regeneration timer
  private startLifeRegenerationTimer(): void {
    setInterval(() => {
      this.regenerateLives();
    }, 60000); // Check every minute
  }

  // Check streak warnings
  private checkStreakWarnings(): void {
    if (!this.userState) return;
    
    const now = new Date();
    const lastStudy = new Date(this.userState.lastStudyDate);
    const timeDiff = now.getTime() - lastStudy.getTime();
    
    if (timeDiff >= GAMIFICATION_CONSTANTS.STREAK_WARNING_THRESHOLD) {
      // Send streak warning notification
      this.sendStreakWarning();
    }
  }

  // Send streak warning
  private sendStreakWarning(): void {
    // This would integrate with the notification service
    console.debug('Streak warning: Your streak is about to expire!');
  }

  // Initialize daily challenges
  private async initializeDailyChallenges(): Promise<void> {
    if (!this.userState) return;
    
    const today = new Date().toISOString().split('T')[0];
    
    // Check if we need to generate new daily challenges
    if (this.userState.dailyChallenges.length === 0 || 
        !this.userState.dailyChallenges.some(dc => dc.date === today)) {
      
      this.userState.dailyChallenges = this.generateDailyChallenges();
    }
  }

  // Generate daily challenges
  private generateDailyChallenges(): DailyChallenge[] {
    const challenges: DailyChallenge[] = [];
    const challengeTypes: DailyChallenge['type'][] = [
      'lesson_completion', 'xp_target', 'perfect_lesson', 'streak_maintenance', 'vocabulary_review',
    ];
    
    challengeTypes.forEach((type, index) => {
      challenges.push({
        id: `daily_${type}_${Date.now()}_${index}`,
        date: new Date().toISOString().split('T')[0],
        type,
        title: this.getChallengeTitle(type),
        description: this.getChallengeDescription(type),
        goal: this.getChallengeGoal(type),
        progress: 0,
        completed: false,
        reward: {
          xp: GAMIFICATION_CONSTANTS.DAILY_CHALLENGE_XP_REWARD,
          coins: GAMIFICATION_CONSTANTS.DAILY_CHALLENGE_COIN_REWARD,
          items: [],
        },
        difficulty: this.getChallengeDifficulty(type),
      });
    });
    
    return challenges;
  }

  // Get challenge title
  private getChallengeTitle(type: DailyChallenge['type']): MultilingualContent {
    const titles: { [key in DailyChallenge['type']]: MultilingualContent } = {
      lesson_completion: { en: 'Complete Lessons', es: 'Completar Lecciones', hr: 'Završiti Lekcije' },
      xp_target: { en: 'XP Target', es: 'Objetivo de XP', hr: 'XP Cilj' },
      perfect_lesson: { en: 'Perfect Lesson', es: 'Lección Perfecta', hr: 'Savršena Lekcija' },
      streak_maintenance: { en: 'Maintain Streak', es: 'Mantener Racha', hr: 'Održati Seriju' },
      vocabulary_review: { en: 'Review Vocabulary', es: 'Repasar Vocabulario', hr: 'Ponoviti Rječnik' },
    };
    return titles[type];
  }

  // Get challenge description
  private getChallengeDescription(type: DailyChallenge['type']): MultilingualContent {
    const descriptions: { [key in DailyChallenge['type']]: MultilingualContent } = {
      lesson_completion: { en: 'Complete 3 lessons today', es: 'Completa 3 lecciones hoy', hr: 'Završi 3 lekcije danas' },
      xp_target: { en: 'Earn 500 XP today', es: 'Gana 500 XP hoy', hr: 'Zaradi 500 XP danas' },
      perfect_lesson: { en: 'Get 100% accuracy on a lesson', es: 'Obtén 100% de precisión en una lección', hr: 'Postigni 100% točnosti na lekciji' },
      streak_maintenance: { en: 'Maintain your current streak', es: 'Mantén tu racha actual', hr: 'Održi svoju trenutnu seriju' },
      vocabulary_review: { en: 'Review 20 vocabulary words', es: 'Repasa 20 palabras de vocabulario', hr: 'Ponovi 20 riječi iz rječnika' },
    };
    return descriptions[type];
  }

  // Get challenge goal
  private getChallengeGoal(type: DailyChallenge['type']): number {
    const goals: { [key in DailyChallenge['type']]: number } = {
      lesson_completion: 3,
      xp_target: 500,
      perfect_lesson: 1,
      streak_maintenance: 1,
      vocabulary_review: 20,
    };
    return goals[type];
  }

  // Get challenge difficulty
  private getChallengeDifficulty(type: DailyChallenge['type']): 'easy' | 'medium' | 'hard' {
    const difficulties: { [key in DailyChallenge['type']]: 'easy' | 'medium' | 'hard' } = {
      lesson_completion: 'easy',
      xp_target: 'medium',
      perfect_lesson: 'hard',
      streak_maintenance: 'medium',
      vocabulary_review: 'easy',
    };
    return difficulties[type];
  }

  // Update daily challenge progress
  public updateDailyChallengeProgress(type: DailyChallenge['type'], progress: number): void {
    if (!this.userState) return;
    
    const challenge = this.userState.dailyChallenges.find(dc => dc.type === type && !dc.completed);
    if (challenge) {
      challenge.progress = Math.min(challenge.goal, challenge.progress + progress);
      
      if (challenge.progress >= challenge.goal && !challenge.completed) {
        challenge.completed = true;
        this.userState.totalXP += challenge.reward.xp;
        this.userState.coins += challenge.reward.coins;
      }
    }
  }

  // Purchase shop item
  public async purchaseShopItem(itemId: string): Promise<boolean> {
    if (!this.userState) return false;
    
    const item = this.userState.shopItems.find(si => si.id === itemId);
    if (!item) return false;
    
    // Check if user has enough currency
    if (item.cost.coins && this.userState.coins < item.cost.coins) return false;
    if (item.cost.gems && this.userState.gems < item.cost.gems) return false;
    
    // Deduct currency
    if (item.cost.coins) this.userState.coins -= item.cost.coins;
    if (item.cost.gems) this.userState.gems -= item.cost.gems;
    
    // Apply item effects
    this.applyShopItemEffects(item);
    
    // Mark as owned
    item.owned = true;
    if (item.quantity !== undefined) {
      item.quantity = (item.quantity || 0) + 1;
    }
    
    await this.saveUserState();
    return true;
  }

  // Apply shop item effects
  private applyShopItemEffects(item: EnhancedShopItem): void {
    if (!this.userState) return;
    
    if (item.effects?.lives) {
      this.userState.lives = Math.min(GAMIFICATION_CONSTANTS.MAX_LIVES, this.userState.lives + item.effects.lives);
    }
    
    if (item.effects?.streakFreeze) {
      this.userState.streakFreezeActive = true;
      const expires = new Date();
      expires.setHours(expires.getHours() + (item.effects.streakFreeze || 24));
      this.userState.streakFreezeExpires = expires.toISOString();
    }
    
    if (item.effects?.xpMultiplier) {
      this.userState.xpBoostActive = true;
      this.userState.xpBoostMultiplier = item.effects.xpMultiplier || 1.5;
      const expires = new Date();
      expires.setMinutes(expires.getMinutes() + (item.effects.duration || 60));
      this.userState.xpBoostExpires = expires.toISOString();
    }
  }

  // Watch ad for rewards
  public async watchAdForRewards(): Promise<{
    success: boolean;
    livesEarned?: number;
    coinsEarned?: number;
    streakFreezeEarned?: boolean;
  }> {
    if (!this.userState) {
      return { success: false };
    }
    
    if (this.userState.monetizationFeatures.adWatchedToday >= this.userState.monetizationFeatures.maxAdsPerDay) {
      return { success: false };
    }
    
    // Simulate ad watching
    this.userState.monetizationFeatures.adWatchedToday++;
    
    // Random rewards
    const rewards = {
      livesEarned: Math.random() > 0.7 ? 1 : 0,
      coinsEarned: Math.floor(Math.random() * 20) + 10,
      streakFreezeEarned: Math.random() > 0.9,
    };
    
    // Apply rewards
    if (rewards.livesEarned) {
      this.userState.lives = Math.min(GAMIFICATION_CONSTANTS.MAX_LIVES, this.userState.lives + rewards.livesEarned);
    }
    
    if (rewards.coinsEarned) {
      this.userState.coins += rewards.coinsEarned;
    }
    
    if (rewards.streakFreezeEarned) {
      this.userState.streakFreezeActive = true;
      const expires = new Date();
      expires.setHours(expires.getHours() + 24);
      this.userState.streakFreezeExpires = expires.toISOString();
    }
    
    await this.saveUserState();
    
    return {
      success: true,
      ...rewards,
    };
  }

  // Get alternative learning paths
  public getAlternativePaths(): AlternativePathProgress[] {
    if (!this.userState) return [];
    
    return this.userState.learningPaths.alternativePaths.filter(path => {
      // Check if path is unlocked
      if (path.unlockRequirements.previousPathId) {
        const previousPath = this.userState!.learningPaths.alternativePaths.find(p => p.pathId === path.unlockRequirements.previousPathId);
        if (!previousPath || !previousPath.completedLessons.length) return false;
      }
      
      if (path.unlockRequirements.minimumXP && this.userState!.totalXP < path.unlockRequirements.minimumXP) {
        return false;
      }
      
      if (path.unlockRequirements.minimumAccuracy && this.userState!.learningPaths.mainPath.accuracy < path.unlockRequirements.minimumAccuracy) {
        return false;
      }
      
      return true;
    });
  }

  // Start alternative path
  public startAlternativePath(pathId: string): boolean {
    if (!this.userState) return false;
    
    const path = this.userState.learningPaths.alternativePaths.find(p => p.pathId === pathId);
    if (!path) return false;
    
    // Check if user has enough lives
    if (this.userState.lives < path.livesCost) return false;
    
    // Deduct lives
    this.userState.lives -= path.livesCost;
    
    // Activate path
    path.isActive = true;
    
    return true;
  }

  // Save user state
  private async saveUserState(): Promise<void> {
    if (!this.userState) return;
    
    try {
      // This would save to AsyncStorage or database
      console.debug('Saving user gamification state:', this.userState);
    } catch (error) {
      console.error('Error saving user gamification state:', error);
    }
  }

  // Get user gamification state
  public getUserState(): UserGamificationState | null {
    return this.userState;
  }

  // Get current league
  public getCurrentLeague(): League | null {
    if (!this.userState) return null;
    
    const leagues: League[] = [
      {
        id: 'bronze',
        name: 'Bronze League',
        tier: 'bronze',
        minXP: 0,
        maxXP: 4999,
        color: '#CD7F32',
        icon: '🥉',
        rewards: {
          promotion: { xp: 100, coins: 50, items: [] },
          demotion: { xp: 0, coins: 0 },
        },
      },
      {
        id: 'silver',
        name: 'Silver League',
        tier: 'silver',
        minXP: 5000,
        maxXP: 14999,
        color: '#C0C0C0',
        icon: '🥈',
        rewards: {
          promotion: { xp: 200, coins: 100, items: [] },
          demotion: { xp: 50, coins: 25 },
        },
      },
      {
        id: 'gold',
        name: 'Gold League',
        tier: 'gold',
        minXP: 15000,
        maxXP: 34999,
        color: '#FFD700',
        icon: '🥇',
        rewards: {
          promotion: { xp: 300, coins: 150, items: [] },
          demotion: { xp: 100, coins: 50 },
        },
      },
    ];
    
    return leagues.find(league => 
      this.userState!.leagueXP >= league.minXP && this.userState!.leagueXP <= league.maxXP,
    ) || null;
  }

  // Additional methods for compatibility
  async awardXP(userId: string, amount: number, source: string, language?: string, metadata?: any): Promise<any> {
    // Mock implementation
    return {
      success: true,
      xpGained: amount,
      levelUp: false,
      achievements: []
    };
  }

  async getUserGamificationStats(userId: string) {
    return this.getUserState();
  }

  async initializeUserStats(userId: string): Promise<void> {
    // Mock implementation
    return Promise.resolve();
  }

  calculateLevel(totalXP: number): number {
    return Math.floor(totalXP / 1000) + 1;
  }
}

// Export singleton instance
export const gamificationService = new EnhancedGamificationService();
