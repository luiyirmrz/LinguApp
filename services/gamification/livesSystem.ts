/**
 * Enhanced Lives System Service - Manages the gamified lives system with Firebase integration
 * Handles life loss on mistakes, automatic refill, purchase mechanics, and real-time sync
 * Integrates with Firestore for cross-device synchronization and offline support
 */

import { User } from '@/types';
import { unifiedDataService } from '../database/unifiedDataService';
import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  firestoreDoc,
  updateDoc,
  increment,
  serverTimestamp,
  getRemoteConfigValue,
  createRealtimeListener,
} from '@/config/firebase';

interface LivesConfig { 
  maxLives: number;
  refillTimeMinutes: number;
  livesLostPerMistake: number;
  heartToLifeRatio: number; // How many hearts equal one life
}

class LivesSystemService {
  private config: LivesConfig = {
    maxLives: 5,
    refillTimeMinutes: 30, // 30 minutes per life
    livesLostPerMistake: 1,
    heartToLifeRatio: 1, // 1 heart = 1 life for now
  };

  /**
   * Initialize user with lives system
   */
  async initializeUserLives(userId: string): Promise<void> {
    try {
      const user = await unifiedDataService.getUser(userId);
      if (!user) {
        console.debug('User not found for lives initialization:', userId);
        return;
      }

      // Initialize lives if not already set
      if (user.lives === undefined || user.maxLives === undefined) {
        const updatedUser: User = {
          ...user,
          lives: this.config.maxLives,
          maxLives: this.config.maxLives,
          lastLifeLoss: undefined,
          lifeRefillTime: undefined,
        };

        await unifiedDataService.saveUser(updatedUser);
        console.debug('Lives system initialized for user:', userId);
      }
    } catch (error) {
      console.error('Error initializing lives system:', error);
    }
  }

  /**
   * Lose a life due to mistake with Firebase sync
   */
  async loseLife(userId: string, reason: string = 'mistake'): Promise<{
    livesRemaining: number;
    canContinue: boolean;
    refillTime?: string;
    gameOver: boolean;
  }> {
    try {
      const user = await unifiedDataService.getUser(userId);
      if (!user) {
        throw new Error(`User ${userId} not found`);
      }

      // Get Remote Config values for lives system
      const livesLostPerMistake = await getRemoteConfigValue('livesLostPerMistake', this.config.livesLostPerMistake);
      const refillTimeMinutes = await getRemoteConfigValue('lifeRefillTimeMinutes', this.config.refillTimeMinutes);

      // Ensure lives are initialized
      const currentLives = user.lives ?? this.config.maxLives;
      const newLives = Math.max(0, currentLives - livesLostPerMistake);
      const now = new Date().toISOString();

      // Calculate refill time if lives are depleted
      let refillTime: string | undefined;
      if (newLives === 0) {
        const refillDate = new Date();
        refillDate.setMinutes(refillDate.getMinutes() + refillTimeMinutes);
        refillTime = refillDate.toISOString();
      }

      // Update in Firestore with atomic operations
      try {
        const userDocRef = firestoreDoc('users', userId);
        const updateData: any = {
          lives: newLives,
          lastLifeLoss: now,
          lastUpdated: serverTimestamp(),
        };
        
        if (refillTime) {
          updateData.lifeRefillTime = refillTime;
        }
        
        await updateDoc(userDocRef, updateData);
      } catch (error) {
        console.warn('Failed to update lives in Firestore:', error);
      }

      // Update local database
      const updatedUser: User = {
        ...user,
        lives: newLives,
        lastLifeLoss: now,
        lifeRefillTime: refillTime,
      };

      await unifiedDataService.saveUser(updatedUser);

      // Haptic feedback for life loss
      await this.triggerHapticFeedback('error');

      // Cache for offline access
      await this.cacheLivesData(userId, {
        lives: newLives,
        maxLives: user.maxLives ?? this.config.maxLives,
        lastLifeLoss: now,
        lifeRefillTime: refillTime,
      });

      console.debug(`User ${userId} lost a life (${reason}). Lives remaining: ${newLives}`);

      return {
        livesRemaining: newLives,
        canContinue: newLives > 0,
        refillTime,
        gameOver: newLives === 0,
      };
    } catch (error) {
      console.error('Error losing life:', error);
      throw error;
    }
  }

  /**
   * Check and refill lives automatically
   */
  async checkAndRefillLives(userId: string): Promise<{
    lives: number;
    refilled: boolean;
    nextRefillTime?: string;
  }> {
    try {
      const user = await unifiedDataService.getUser(userId);
      if (!user) {
        throw new Error(`User ${userId} not found`);
      }

      const currentLives = user.lives ?? this.config.maxLives;
      const maxLives = user.maxLives ?? this.config.maxLives;
      const now = new Date();

      // If already at max lives, no refill needed
      if (currentLives >= maxLives) {
        return {
          lives: currentLives,
          refilled: false,
        };
      }

      // Check if it's time to refill
      let newLives = currentLives;
      let refilled = false;
      let nextRefillTime: string | undefined;

      if (user.lifeRefillTime) {
        const refillTime = new Date(user.lifeRefillTime);
        
        if (now >= refillTime) {
          // Calculate how many lives to refill based on time passed
          const timePassed = now.getTime() - refillTime.getTime();
          const livesToRefill = Math.floor(timePassed / (this.config.refillTimeMinutes * 60 * 1000));
          
          newLives = Math.min(maxLives, currentLives + livesToRefill + 1); // +1 for the original refill
          refilled = true;

          // Calculate next refill time if not at max
          if (newLives < maxLives) {
            const nextRefill = new Date();
            nextRefill.setMinutes(nextRefill.getMinutes() + this.config.refillTimeMinutes);
            nextRefillTime = nextRefill.toISOString();
          }
        } else {
          nextRefillTime = user.lifeRefillTime;
        }
      }

      if (refilled) {
        const updatedUser: User = {
          ...user,
          lives: newLives,
          lifeRefillTime: nextRefillTime,
        };

        await unifiedDataService.saveUser(updatedUser);

        // Haptic feedback for life refill
        await this.triggerHapticFeedback('success');

        // Cache for offline access
        await this.cacheLivesData(userId, {
          lives: newLives,
          maxLives,
          lastLifeLoss: user.lastLifeLoss,
          lifeRefillTime: nextRefillTime,
        });

        console.debug(`User ${userId} lives refilled. New lives: ${newLives}`);
      }

      return {
        lives: newLives,
        refilled,
        nextRefillTime,
      };
    } catch (error) {
      console.error('Error checking/refilling lives:', error);
      const user = await unifiedDataService.getUser(userId);
      return {
        lives: user?.lives ?? this.config.maxLives,
        refilled: false,
      };
    }
  }

  /**
   * Purchase lives with coins using Firebase transactions
   */
  async purchaseLives(userId: string, livesToPurchase: number, costInCoins: number): Promise<{
    success: boolean;
    newLives: number;
    newCoins: number;
    error?: string;
  }> {
    try {
      const user = await unifiedDataService.getUser(userId);
      if (!user) {
        throw new Error(`User ${userId} not found`);
      }

      const currentCoins = user.coins ?? 0;
      const currentLives = user.lives ?? 0;
      const maxLives = user.maxLives ?? this.config.maxLives;

      // Check if user has enough coins
      if (currentCoins < costInCoins) {
        return {
          success: false,
          newLives: currentLives,
          newCoins: currentCoins,
          error: 'Not enough coins',
        };
      }

      // Check if user needs lives
      if (currentLives >= maxLives) {
        return {
          success: false,
          newLives: currentLives,
          newCoins: currentCoins,
          error: 'Lives already full',
        };
      }

      const newLives = Math.min(maxLives, currentLives + livesToPurchase);
      const newCoins = currentCoins - costInCoins;

      // Update in Firestore with atomic operations
      try {
        const userDocRef = firestoreDoc('users', userId);
        await updateDoc(userDocRef, {
          lives: newLives,
          coins: increment(-costInCoins), // Atomic decrement
          lifeRefillTime: null, // Clear refill timer since lives are full
          lastUpdated: serverTimestamp(),
        });
      } catch (error) {
        console.warn('Failed to update lives purchase in Firestore:', error);
      }

      // Update local database
      const updatedUser: User = {
        ...user,
        lives: newLives,
        coins: newCoins,
        lifeRefillTime: undefined, // Clear refill timer since lives are full
      };

      await unifiedDataService.saveUser(updatedUser);

      // Haptic feedback for successful purchase
      await this.triggerHapticFeedback('success');

      // Cache for offline access
      await this.cacheLivesData(userId, {
        lives: newLives,
        maxLives,
        lastLifeLoss: user.lastLifeLoss,
        lifeRefillTime: undefined,
      });

      console.debug(`User ${userId} purchased ${livesToPurchase} lives for ${costInCoins} coins`);

      return {
        success: true,
        newLives,
        newCoins,
      };
    } catch (error) {
      console.error('Error purchasing lives:', error);
      const user = await unifiedDataService.getUser(userId);
      return {
        success: false,
        newLives: user?.lives ?? 0,
        newCoins: user?.coins ?? 0,
        error: 'Purchase failed',
      };
    }
  }

  /**
   * Get time until next life refill
   */
  async getTimeUntilRefill(userId: string): Promise<{
    timeUntilRefill: number; // milliseconds
    canRefillNow: boolean;
    nextRefillTime?: string;
  }> {
    try {
      const user = await unifiedDataService.getUser(userId);
      if (!user || !user.lifeRefillTime) {
        return {
          timeUntilRefill: 0,
          canRefillNow: true,
        };
      }

      const now = new Date();
      const refillTime = new Date(user.lifeRefillTime);
      const timeUntilRefill = refillTime.getTime() - now.getTime();

      return {
        timeUntilRefill: Math.max(0, timeUntilRefill),
        canRefillNow: timeUntilRefill <= 0,
        nextRefillTime: user.lifeRefillTime,
      };
    } catch (error) {
      console.error('Error getting refill time:', error);
      return {
        timeUntilRefill: 0,
        canRefillNow: true,
      };
    }
  }

  /**
   * Get current lives status
   */
  async getLivesStatus(userId: string): Promise<{
    lives: number;
    maxLives: number;
    canPlay: boolean;
    timeUntilRefill?: number;
    nextRefillTime?: string;
  }> {
    try {
      // First check for automatic refill
      await this.checkAndRefillLives(userId);

      const user = await unifiedDataService.getUser(userId);
      if (!user) {
        throw new Error(`User ${userId} not found`);
      }

      const lives = user.lives ?? this.config.maxLives;
      const maxLives = user.maxLives ?? this.config.maxLives;
      const canPlay = lives > 0;

      let timeUntilRefill: number | undefined;
      let nextRefillTime: string | undefined;

      if (lives < maxLives && user.lifeRefillTime) {
        const refillInfo = await this.getTimeUntilRefill(userId);
        timeUntilRefill = refillInfo.timeUntilRefill;
        nextRefillTime = refillInfo.nextRefillTime;
      }

      return {
        lives,
        maxLives,
        canPlay,
        timeUntilRefill,
        nextRefillTime,
      };
    } catch (error) {
      console.error('Error getting lives status:', error);
      return {
        lives: this.config.maxLives,
        maxLives: this.config.maxLives,
        canPlay: true,
      };
    }
  }

  /**
   * Cache lives data for offline access
   */
  private async cacheLivesData(userId: string, data: {
    lives: number;
    maxLives: number;
    lastLifeLoss?: string;
    lifeRefillTime?: string;
  }): Promise<void> {
    try {
      await AsyncStorage.setItem(`lives_${userId}`, JSON.stringify({
        ...data,
        cachedAt: new Date().toISOString(),
      }));
    } catch (error) {
      console.error('Error caching lives data:', error);
    }
  }

  /**
   * Get cached lives data for offline mode
   */
  async getCachedLivesData(userId: string): Promise<{
    lives: number;
    maxLives: number;
    lastLifeLoss?: string;
    lifeRefillTime?: string;
    cachedAt?: string;
  } | null> {
    try {
      const cached = await AsyncStorage.getItem(`lives_${userId}`);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.error('Error getting cached lives data:', error);
      return null;
    }
  }

  /**
   * Trigger haptic feedback with web compatibility
   */
  private async triggerHapticFeedback(type: 'success' | 'error' | 'light' = 'light'): Promise<void> {
    if (Platform.OS === 'web') return;
    
    try {
      switch (type) {
        case 'success':
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          break;
        case 'error':
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          break;
        default:
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    } catch (error) {
      console.error('Haptic feedback error:', error);
    }
  }

  /**
   * Update lives configuration with Remote Config integration
   */
  async updateConfig(newConfig: Partial<LivesConfig>): Promise<void> {
    // Get values from Remote Config if available
    const remoteMaxLives = await getRemoteConfigValue('maxLives', this.config.maxLives);
    const remoteRefillTime = await getRemoteConfigValue('lifeRefillTimeMinutes', this.config.refillTimeMinutes);
    const remoteLivesLost = await getRemoteConfigValue('livesLostPerMistake', this.config.livesLostPerMistake);
    
    this.config = { 
      ...this.config, 
      ...newConfig,
      maxLives: remoteMaxLives,
      refillTimeMinutes: remoteRefillTime,
      livesLostPerMistake: remoteLivesLost,
    };
    
    console.debug('Lives system config updated with Remote Config:', this.config);
  }

  /**
   * Get current configuration with Remote Config values
   */
  async getConfig(): Promise<LivesConfig> {
    await this.updateConfig({});
    return { ...this.config };
  }

  /**
   * Create real-time listener for user lives updates
   */
  createLivesListener(userId: string, callback: (livesData: {
    lives: number;
    maxLives: number;
    lifeRefillTime?: string;
    lastLifeLoss?: string;
  }) => void): () => void {
    try {
      const userDocRef = firestoreDoc('users', userId);
      return createRealtimeListener(userDocRef, (userData) => {
        if (userData) {
          callback({
            lives: userData.lives ?? this.config.maxLives,
            maxLives: userData.maxLives ?? this.config.maxLives,
            lifeRefillTime: userData.lifeRefillTime,
            lastLifeLoss: userData.lastLifeLoss,
          });
        }
      });
    } catch (error) {
      console.error('Error creating lives listener:', error);
      return () => {}; // Return empty unsubscribe function
    }
  }
}

export const livesSystemService = new LivesSystemService();
export default livesSystemService;
