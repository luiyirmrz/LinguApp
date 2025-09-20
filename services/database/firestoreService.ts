/**
 * Firestore Service for LinguApp
 * Provides comprehensive data management with offline-first support
 * Handles users, progress, gamification, SRS, and multilingual content
 */

import {
  User,
  SpacedRepetitionItem,
  LearningAnalytics,
  Challenge,
  DailyChallenge,
  MultilingualProgress,
  UserLanguageSettings,
  Achievement,
  League,
  WeeklyLeaderboard,
} from '@/types';
import {
  db,
  firestoreDoc,
  firestoreCollection,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  increment,
  serverTimestamp,
  onSnapshot,
  writeBatch,
  runTransaction,
  createRealtimeListener,
  getRemoteConfigValue,
} from '@/config/firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Firestore collection paths
const COLLECTIONS = {
  USERS: 'users',
  USER_PROGRESS: 'userProgress',
  SRS_ITEMS: 'srsItems',
  ANALYTICS: 'analytics',
  CHALLENGES: 'challenges',
  DAILY_CHALLENGES: 'dailyChallenges',
  LEADERBOARDS: 'leaderboards',
  ACHIEVEMENTS: 'achievements',
  LANGUAGES: 'languages',
  LESSONS: 'lessons',
  VOCABULARY: 'vocabulary',
} as const;

// Data converters for Firestore
class FirestoreConverters {
  // User converter
  static userConverter = {
    toFirestore: (user: User) => {
      const { id, ...userData } = user;
      return {
        ...userData,
        updatedAt: serverTimestamp(),
        // Ensure all required fields are present
        points: user.points || 0,
        streak: user.streak || 0,
        hearts: user.hearts || 5,
        gems: user.gems || 500,
        coins: user.coins || 100,
        level: user.level || 1,
        totalXP: user.totalXP || 0,
        weeklyXP: user.weeklyXP || 0,
        longestStreak: user.longestStreak || 0,
        totalLessonsCompleted: user.totalLessonsCompleted || 0,
      };
    },
    fromFirestore: (snapshot: any, options: any) => {
      const data = snapshot.data(options);
      return {
        id: snapshot.id,
        ...data,
        // Convert Firestore timestamps to ISO strings
        createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
        lastLoginAt: data.lastLoginAt?.toDate?.()?.toISOString() || data.lastLoginAt,
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
      } as User;
    },
  };

  // Progress converter
  static progressConverter = {
    toFirestore: (progress: MultilingualProgress) => ({
      ...progress,
      updatedAt: serverTimestamp(),
    }),
    fromFirestore: (snapshot: any, options: any) => {
      const data = snapshot.data(options);
      return {
        ...data,
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
      } as MultilingualProgress;
    },
  };

  // SRS Item converter
  static srsConverter = {
    toFirestore: (item: SpacedRepetitionItem) => ({
      ...item,
      updatedAt: serverTimestamp(),
    }),
    fromFirestore: (snapshot: any, options: any) => {
      const data = snapshot.data(options);
      return {
        ...data,
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
      } as SpacedRepetitionItem;
    },
  };
}

class FirestoreService {
  private static instance: FirestoreService;
  private offlineCache = new Map<string, any>();
  private isOnline = true;

  static getInstance(): FirestoreService {
    if (!FirestoreService.instance) {
      FirestoreService.instance = new FirestoreService();
    }
    return FirestoreService.instance;
  }

  constructor() {
    // Monitor network status for offline handling
    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.addEventListener) {
      window.addEventListener('online', () => {
        this.isOnline = true;
        this.syncOfflineData();
      });
      window.addEventListener('offline', () => {
        this.isOnline = false;
      });
    }
  }

  // User operations
  async createUser(user: User): Promise<void> {
    try {
      console.debug('Creating user in Firestore:', user.id);
      const userRef = firestoreDoc(COLLECTIONS.USERS, user.id).withConverter(FirestoreConverters.userConverter);
      await setDoc(userRef, user);
      
      // Cache locally
      await this.cacheData(`user_${user.id}`, user);
      console.debug('User created successfully');
    } catch (error) {
      console.error('Error creating user:', error);
      // Fallback to local storage
      await this.cacheData(`user_${user.id}`, user);
      throw error;
    }
  }

  async getUser(userId: string): Promise<User | null> {
    try {
      console.debug('Fetching user from Firestore:', userId);
      const userRef = firestoreDoc(COLLECTIONS.USERS, userId).withConverter(FirestoreConverters.userConverter);
      const doc = await getDoc(userRef);
      
      if (doc.exists()) {
        const user = doc.data();
        await this.cacheData(`user_${userId}`, user);
        return user as User;
      }
      
      // Try cache if not found in Firestore
      return await this.getCachedData(`user_${userId}`);
    } catch (error) {
      console.error('Error fetching user:', error);
      // Fallback to cache
      return await this.getCachedData(`user_${userId}`);
    }
  }

  async updateUser(userId: string, updates: Partial<User>): Promise<void> {
    try {
      console.debug('Updating user in Firestore:', userId, Object.keys(updates));
      const userRef = firestoreDoc(COLLECTIONS.USERS, userId);
      await updateDoc(userRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });
      
      // Update cache
      const cachedUser = await this.getCachedData(`user_${userId}`);
      if (cachedUser) {
        const updatedUser = { ...cachedUser, ...updates };
        await this.cacheData(`user_${userId}`, updatedUser);
      }
      
      console.debug('User updated successfully');
    } catch (error) {
      console.error('Error updating user:', error);
      // Queue for offline sync
      await this.queueOfflineUpdate('users', userId, updates);
      throw error;
    }
  }

  // Real-time user listener
  subscribeToUser(userId: string, callback: (user: User | null) => void): () => void {
    try {
      // Check if db is initialized
      if (!db) {
        console.warn('Firestore not initialized, skipping user listener setup');
        return () => {};
      }
      
      const userRef = firestoreDoc(COLLECTIONS.USERS, userId).withConverter(FirestoreConverters.userConverter);
      return createRealtimeListener(userRef, callback);
    } catch (error) {
      console.error('Error setting up user listener:', error);
      return () => {};
    }
  }

  // Progress operations
  async saveProgress(userId: string, progress: MultilingualProgress): Promise<void> {
    try {
      console.debug('Saving progress to Firestore:', userId);
      const progressRef = firestoreDoc(COLLECTIONS.USER_PROGRESS, userId).withConverter(FirestoreConverters.progressConverter);
      await setDoc(progressRef, progress);
      
      await this.cacheData(`progress_${userId}`, progress);
      console.debug('Progress saved successfully');
    } catch (error) {
      console.error('Error saving progress:', error);
      await this.cacheData(`progress_${userId}`, progress);
      throw error;
    }
  }

  async getProgress(userId: string): Promise<MultilingualProgress | null> {
    try {
      const progressRef = firestoreDoc(COLLECTIONS.USER_PROGRESS, userId).withConverter(FirestoreConverters.progressConverter);
      const doc = await getDoc(progressRef);
      
      if (doc.exists()) {
        const progress = doc.data();
        await this.cacheData(`progress_${userId}`, progress);
        return progress as MultilingualProgress;
      }
      
      return await this.getCachedData(`progress_${userId}`);
    } catch (error) {
      console.error('Error fetching progress:', error);
      return await this.getCachedData(`progress_${userId}`);
    }
  }

  // SRS operations
  async saveSRSItem(item: SpacedRepetitionItem): Promise<void> {
    try {
      const srsRef = firestoreDoc(COLLECTIONS.SRS_ITEMS, item.id).withConverter(FirestoreConverters.srsConverter);
      await setDoc(srsRef, item);
      
      await this.cacheData(`srs_${item.id}`, item);
    } catch (error) {
      console.error('Error saving SRS item:', error);
      await this.cacheData(`srs_${item.id}`, item);
      throw error;
    }
  }

  async getSRSItemsDue(userId: string, languageCode: string, limitCount: number = 20): Promise<SpacedRepetitionItem[]> {
    try {
      const now = new Date().toISOString();
      const srsQuery = query(
        firestoreCollection(COLLECTIONS.SRS_ITEMS).withConverter(FirestoreConverters.srsConverter),
        where('userId', '==', userId),
        where('languageCode', '==', languageCode),
        where('nextReviewDate', '<=', now),
        orderBy('nextReviewDate'),
        limit(limitCount),
      );
      
      const snapshot = await getDocs(srsQuery);
      const items = snapshot.docs.map(doc => doc.data());
      
      // Cache the results
      await this.cacheData(`srs_due_${userId}_${languageCode}`, items);
      return items as SpacedRepetitionItem[];
    } catch (error) {
      console.error('Error fetching SRS items:', error);
      // Fallback to cache
      return await this.getCachedData(`srs_due_${userId}_${languageCode}`) || [];
    }
  }

  // Analytics operations
  async saveAnalytics(analytics: LearningAnalytics): Promise<void> {
    try {
      const analyticsRef = firestoreCollection(COLLECTIONS.ANALYTICS);
      await addDoc(analyticsRef, {
        ...analytics,
        createdAt: serverTimestamp(),
      });
      
      await this.cacheData(`analytics_${analytics.userId}_${analytics.date}`, analytics);
    } catch (error) {
      console.error('Error saving analytics:', error);
      await this.cacheData(`analytics_${analytics.userId}_${analytics.date}`, analytics);
      throw error;
    }
  }

  // Gamification operations
  async updateXP(userId: string, xpGain: number): Promise<void> {
    try {
      const userRef = firestoreDoc(COLLECTIONS.USERS, userId);
      await updateDoc(userRef, {
        totalXP: increment(xpGain),
        weeklyXP: increment(xpGain),
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error updating XP:', error);
      await this.queueOfflineUpdate('users', userId, { 
        totalXP: increment(xpGain),
        weeklyXP: increment(xpGain),
      });
      throw error;
    }
  }

  async updateStreak(userId: string, newStreak: number): Promise<void> {
    try {
      const userRef = firestoreDoc(COLLECTIONS.USERS, userId);
      await updateDoc(userRef, {
        streak: newStreak,
        longestStreak: increment(0), // Will be updated by cloud function
        lastPracticeDate: new Date().toISOString(),
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error updating streak:', error);
      await this.queueOfflineUpdate('users', userId, {
        streak: newStreak,
        lastPracticeDate: new Date().toISOString(),
      });
      throw error;
    }
  }

  async awardCoins(userId: string, coins: number): Promise<void> {
    try {
      const userRef = firestoreDoc(COLLECTIONS.USERS, userId);
      await updateDoc(userRef, {
        coins: increment(coins),
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error awarding coins:', error);
      await this.queueOfflineUpdate('users', userId, {
        coins: increment(coins),
      });
      throw error;
    }
  }

  // Challenge operations
  async createChallenge(challenge: Challenge): Promise<void> {
    try {
      const challengeRef = firestoreCollection(COLLECTIONS.CHALLENGES);
      await addDoc(challengeRef, {
        ...challenge,
        createdAt: serverTimestamp(),
      });
      
      await this.cacheData(`challenge_${challenge.id}`, challenge);
    } catch (error) {
      console.error('Error creating challenge:', error);
      await this.cacheData(`challenge_${challenge.id}`, challenge);
      throw error;
    }
  }

  async getUserChallenges(userId: string): Promise<Challenge[]> {
    try {
      const challengesQuery = query(
        firestoreCollection(COLLECTIONS.CHALLENGES),
        where('challengerId', '==', userId),
        orderBy('createdAt', 'desc'),
      );
      
      const snapshot = await getDocs(challengesQuery);
      const challenges = snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) } as Challenge));
      
      await this.cacheData(`challenges_${userId}`, challenges);
      return challenges;
    } catch (error) {
      console.error('Error fetching challenges:', error);
      return await this.getCachedData(`challenges_${userId}`) || [];
    }
  }

  // Leaderboard operations
  async getWeeklyLeaderboard(weekId: string): Promise<WeeklyLeaderboard | null> {
    try {
      const leaderboardRef = firestoreDoc(COLLECTIONS.LEADERBOARDS, weekId);
      const doc = await getDoc(leaderboardRef);
      
      if (doc.exists()) {
        const leaderboard = { id: doc.id, ...(doc.data() as any) } as unknown as WeeklyLeaderboard;
        await this.cacheData(`leaderboard_${weekId}`, leaderboard);
        return leaderboard;
      }
      
      return await this.getCachedData(`leaderboard_${weekId}`);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      return await this.getCachedData(`leaderboard_${weekId}`);
    }
  }

  // Batch operations for performance
  async batchUpdateUsers(updates: { userId: string; data: Partial<User> }[]): Promise<void> {
    try {
      const batch = writeBatch(db);
      
      updates.forEach(({ userId, data }) => {
        const userRef = firestoreDoc(COLLECTIONS.USERS, userId);
        batch.update(userRef, {
          ...data,
          updatedAt: serverTimestamp(),
        });
      });
      
      await batch.commit();
      console.debug('Batch update completed successfully');
    } catch (error) {
      console.error('Error in batch update:', error);
      // Queue individual updates for offline sync
      for (const { userId, data } of updates) {
        await this.queueOfflineUpdate('users', userId, data);
      }
      throw error;
    }
  }

  // Remote Config integration
  async getGameConfig(): Promise<any> {
    try {
      const config = {
        xpPerWord: await getRemoteConfigValue('xpPerWord', 10),
        xpPerReview: await getRemoteConfigValue('xpPerReview', 5),
        xpPerLesson: await getRemoteConfigValue('xpPerLesson', 50),
        cefrThresholds: {
          A1: await getRemoteConfigValue('cefrA1Threshold', 500),
          A2: await getRemoteConfigValue('cefrA2Threshold', 1000),
          B1: await getRemoteConfigValue('cefrB1Threshold', 2000),
          B2: await getRemoteConfigValue('cefrB2Threshold', 3500),
          C1: await getRemoteConfigValue('cefrC1Threshold', 5500),
          C2: await getRemoteConfigValue('cefrC2Threshold', 8000),
        },
        maxHeartsPerDay: await getRemoteConfigValue('maxHeartsPerDay', 5),
        heartRefillTimeMinutes: await getRemoteConfigValue('heartRefillTimeMinutes', 30),
      };
      
      await this.cacheData('game_config', config);
      return config;
    } catch (error) {
      console.error('Error fetching game config:', error);
      return await this.getCachedData('game_config') || {
        xpPerWord: 10,
        xpPerReview: 5,
        xpPerLesson: 50,
        cefrThresholds: { A1: 500, A2: 1000, B1: 2000, B2: 3500, C1: 5500, C2: 8000 },
        maxHeartsPerDay: 5,
        heartRefillTimeMinutes: 30,
      };
    }
  }

  // Offline support methods
  private async cacheData(key: string, data: any): Promise<void> {
    try {
      this.offlineCache.set(key, data);
      await AsyncStorage.setItem(`firestore_cache_${key}`, JSON.stringify(data));
    } catch (error) {
      console.error('Error caching data:', error);
    }
  }

  private async getCachedData(key: string): Promise<any> {
    try {
      // Check memory cache first
      if (this.offlineCache.has(key)) {
        return this.offlineCache.get(key);
      }
      
      // Check AsyncStorage
      const cached = await AsyncStorage.getItem(`firestore_cache_${key}`);
      if (cached) {
        const data = JSON.parse(cached);
        this.offlineCache.set(key, data);
        return data;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting cached data:', error);
      return null;
    }
  }

  private async queueOfflineUpdate(collection: string, docId: string, data: any): Promise<void> {
    try {
      const queueKey = `offline_queue_${Date.now()}`;
      const update = {
        collection,
        docId,
        data,
        timestamp: Date.now(),
      };
      
      await AsyncStorage.setItem(queueKey, JSON.stringify(update));
      console.debug('Queued offline update:', queueKey);
    } catch (error) {
      console.error('Error queuing offline update:', error);
    }
  }

  private async syncOfflineData(): Promise<void> {
    try {
      console.debug('Syncing offline data...');
      const keys = await AsyncStorage.getAllKeys();
      const queueKeys = keys.filter(key => key.startsWith('offline_queue_'));
      
      for (const key of queueKeys) {
        try {
          const updateData = await AsyncStorage.getItem(key);
          if (updateData) {
            const { collection, docId, data } = JSON.parse(updateData);
            
            const docRef = firestoreDoc(collection, docId);
            await updateDoc(docRef, {
              ...data,
              updatedAt: serverTimestamp(),
            });
            
            await AsyncStorage.removeItem(key);
            console.debug('Synced offline update:', key);
          }
        } catch (error) {
          console.error('Error syncing update:', key, error);
        }
      }
      
      console.debug('Offline sync completed');
    } catch (error) {
      console.error('Error during offline sync:', error);
    }
  }

  // Cleanup methods
  async clearCache(): Promise<void> {
    try {
      this.offlineCache.clear();
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith('firestore_cache_'));
      await AsyncStorage.multiRemove(cacheKeys);
      console.debug('Cache cleared successfully');
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }

  // User management methods
  async deleteUser(userId: string): Promise<void> {
    try {
      const userRef = firestoreDoc(COLLECTIONS.USERS, userId);
      await deleteDoc(userRef);
      
      // Also delete related data
      const progressRef = firestoreDoc(COLLECTIONS.USER_PROGRESS, userId);
      await deleteDoc(progressRef);
      
      // Clear from cache
      this.offlineCache.delete(`user_${userId}`);
      await AsyncStorage.removeItem(`firestore_cache_user_${userId}`);
      
      console.debug('User deleted successfully:', userId);
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }
}

// Export singleton instance with lazy initialization
export const firestoreService = (() => {
  // Only initialize when actually accessed, not during module loading
  if (typeof window !== 'undefined' || Platform.OS !== 'web') {
    return FirestoreService.getInstance();
  } else {
    // Return a mock service for server-side rendering
    return {
      createUser: async () => {},
      getUser: async () => null,
      updateUser: async () => {},
      deleteUser: async () => {},
      subscribeToUser: () => () => {},
      // Add other methods as needed
    } as any;
  }
})();
export default firestoreService;
