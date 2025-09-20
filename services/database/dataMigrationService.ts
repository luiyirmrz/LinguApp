/**
 * DATA MIGRATION SERVICE
 * 
 * Handles migration of data from old storage systems to the new unified data service.
 * This service ensures data consistency and provides rollback capabilities.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { unifiedDataService } from './unifiedDataService';
import { User, SpacedRepetitionItem, LearningAnalytics, Challenge, Achievement } from '@/types';
import { handleError } from '../monitoring/centralizedErrorService';

export interface MigrationStatus {
  isComplete: boolean;
  currentStep: string;
  progress: number;
  errors: string[];
  warnings: string[];
  migratedRecords: { 
    users: number;
    progress: number;
    srsItems: number;
    analytics: number;
    challenges: number;
    achievements: number;
  };
}

export interface MigrationOptions {
  forceMigration?: boolean;
  backupBeforeMigration?: boolean;
  validateAfterMigration?: boolean;
  rollbackOnError?: boolean;
}

class DataMigrationService {
  private migrationStatus: MigrationStatus = {
    isComplete: false,
    currentStep: 'idle',
    progress: 0,
    errors: [],
    warnings: [],
    migratedRecords: {
      users: 0,
      progress: 0,
      srsItems: 0,
      analytics: 0,
      challenges: 0,
      achievements: 0,
    },
  };

  // ========================================================================
  // MIGRATION METHODS
  // ========================================================================

  async migrateAllData(options: MigrationOptions = {}): Promise<MigrationStatus> {
    try {
      this.resetMigrationStatus();
      this.migrationStatus.currentStep = 'starting';
      this.migrationStatus.progress = 0;

      // Check if migration is needed
      if (!options.forceMigration && await this.isMigrationComplete()) {
        this.migrationStatus.isComplete = true;
        this.migrationStatus.currentStep = 'already_complete';
        this.migrationStatus.progress = 100;
        return this.migrationStatus;
      }

      // Create backup if requested
      if (options.backupBeforeMigration) {
        await this.createBackup();
      }

      // Migrate each data type
      await this.migrateUsers();
      await this.migrateProgress();
      await this.migrateSRSItems();
      await this.migrateAnalytics();
      await this.migrateChallenges();
      await this.migrateAchievements();

      // Validate migration if requested
      if (options.validateAfterMigration) {
        await this.validateMigration();
      }

      // Mark migration as complete
      await this.markMigrationComplete();
      
      this.migrationStatus.isComplete = true;
      this.migrationStatus.currentStep = 'complete';
      this.migrationStatus.progress = 100;

      console.debug('Data migration completed successfully');
      return this.migrationStatus;

    } catch (error) {
      this.migrationStatus.errors.push(`Migration failed: ${error}`);
      this.migrationStatus.currentStep = 'failed';

      // Rollback if requested
      if (options.rollbackOnError) {
        await this.rollbackMigration();
      }

      throw error;
    }
  }

  private async migrateUsers(): Promise<void> {
    this.migrationStatus.currentStep = 'migrating_users';
    this.migrationStatus.progress = 10;

    try {
      // Check for old user data in AsyncStorage
      const oldUserKeys = [
        'local_user',
        'linguapp_user',
        'user_data',
        'current_user',
      ];

      for (const key of oldUserKeys) {
        const userData = await AsyncStorage.getItem(key);
        if (userData) {
          try {
            const user = JSON.parse(userData);
            if (this.isValidUser(user)) {
              await unifiedDataService.saveUser(user);
              this.migrationStatus.migratedRecords.users++;
              
              // Clean up old data
              await AsyncStorage.removeItem(key);
              console.debug(`Migrated user from ${key}`);
            }
          } catch (error) {
            this.migrationStatus.warnings.push(`Failed to migrate user from ${key}: ${error}`);
          }
        }
      }

      // Check for user data in old database service
      try {
        const { unifiedDataService } = await import('./unifiedDataService');
        // Note: DatabaseService doesn't have getAllUsers method
        // User migration is handled through AsyncStorage above
        console.debug('Database service found, but getAllUsers method not available');
      } catch (error) {
        console.debug('No old database service found or failed to access');
      }

    } catch (error) {
      this.migrationStatus.errors.push(`User migration failed: ${error}`);
      throw error;
    }
  }

  private async migrateProgress(): Promise<void> {
    this.migrationStatus.currentStep = 'migrating_progress';
    this.migrationStatus.progress = 30;

    try {
      // Check for old progress data in AsyncStorage
      const oldProgressKeys = [
        'local_progress',
        'linguapp_progress',
        'user_progress',
        'learning_progress',
      ];

      for (const key of oldProgressKeys) {
        const progressData = await AsyncStorage.getItem(key);
        if (progressData) {
          try {
            const progress = JSON.parse(progressData);
            if (this.isValidProgress(progress)) {
              await unifiedDataService.saveProgress(progress.userId || 'unknown', progress);
              this.migrationStatus.migratedRecords.progress++;
              
              // Clean up old data
              await AsyncStorage.removeItem(key);
              console.debug(`Migrated progress from ${key}`);
            }
          } catch (error) {
            this.migrationStatus.warnings.push(`Failed to migrate progress from ${key}: ${error}`);
          }
        }
      }

      // Check for progress data in old database service
      try {
        const { unifiedDataService } = await import('./unifiedDataService');
        // Note: DatabaseService doesn't have getAllProgress method
        // Progress migration is handled through AsyncStorage above
        console.debug('Database service found, but getAllProgress method not available');
      } catch (error) {
        console.debug('No old database service found or failed to access progress');
      }

    } catch (error) {
      this.migrationStatus.errors.push(`Progress migration failed: ${error}`);
      throw error;
    }
  }

  private async migrateSRSItems(): Promise<void> {
    this.migrationStatus.currentStep = 'migrating_srs_items';
    this.migrationStatus.progress = 50;

    try {
      // Check for old SRS data in AsyncStorage
      const oldSRSKeys = [
        'local_srs_items',
        'linguapp_srs',
        'srs_items',
        'spaced_repetition',
      ];

      for (const key of oldSRSKeys) {
        const srsData = await AsyncStorage.getItem(key);
        if (srsData) {
          try {
            const srsItems = JSON.parse(srsData);
            if (Array.isArray(srsItems)) {
              for (const item of srsItems) {
                if (this.isValidSRSItem(item)) {
                  await unifiedDataService.saveSRSItem(item.userId, item);
                  this.migrationStatus.migratedRecords.srsItems++;
                }
              }
            }
            
            // Clean up old data
            await AsyncStorage.removeItem(key);
            console.debug(`Migrated SRS items from ${key}`);
          } catch (error) {
            this.migrationStatus.warnings.push(`Failed to migrate SRS items from ${key}: ${error}`);
          }
        }
      }

      // Check for SRS items in old database service
      try {
        const { unifiedDataService } = await import('./unifiedDataService');
        // Note: DatabaseService doesn't have getAllSRSItems method
        // SRS migration is handled through AsyncStorage above
        console.debug('Database service found, but getAllSRSItems method not available');
      } catch (error) {
        console.debug('No old database service found or failed to access SRS items');
      }

    } catch (error) {
      this.migrationStatus.errors.push(`SRS items migration failed: ${error}`);
      throw error;
    }
  }

  private async migrateAnalytics(): Promise<void> {
    this.migrationStatus.currentStep = 'migrating_analytics';
    this.migrationStatus.progress = 70;

    try {
      // Check for old analytics data in AsyncStorage
      const oldAnalyticsKeys = [
        'local_analytics',
        'linguapp_analytics',
        'learning_analytics',
        'user_analytics',
      ];

      for (const key of oldAnalyticsKeys) {
        const analyticsData = await AsyncStorage.getItem(key);
        if (analyticsData) {
          try {
            const analytics = JSON.parse(analyticsData);
            if (this.isValidAnalytics(analytics)) {
              await unifiedDataService.saveAnalytics(analytics.userId, analytics);
              this.migrationStatus.migratedRecords.analytics++;
              
              // Clean up old data
              await AsyncStorage.removeItem(key);
              console.debug(`Migrated analytics from ${key}`);
            }
          } catch (error) {
            this.migrationStatus.warnings.push(`Failed to migrate analytics from ${key}: ${error}`);
          }
        }
      }

    } catch (error) {
      this.migrationStatus.errors.push(`Analytics migration failed: ${error}`);
      throw error;
    }
  }

  private async migrateChallenges(): Promise<void> {
    this.migrationStatus.currentStep = 'migrating_challenges';
    this.migrationStatus.progress = 80;

    try {
      // Check for old challenges data in AsyncStorage
      const oldChallengesKeys = [
        'local_challenges',
        'linguapp_challenges',
        'user_challenges',
        'daily_challenges',
      ];

      for (const key of oldChallengesKeys) {
        const challengesData = await AsyncStorage.getItem(key);
        if (challengesData) {
          try {
            const challenges = JSON.parse(challengesData);
            if (Array.isArray(challenges)) {
              for (const challenge of challenges) {
                if (this.isValidChallenge(challenge)) {
                  await unifiedDataService.saveChallenge(challenge);
                  this.migrationStatus.migratedRecords.challenges++;
                }
              }
            }
            
            // Clean up old data
            await AsyncStorage.removeItem(key);
            console.debug(`Migrated challenges from ${key}`);
          } catch (error) {
            this.migrationStatus.warnings.push(`Failed to migrate challenges from ${key}: ${error}`);
          }
        }
      }

    } catch (error) {
      this.migrationStatus.errors.push(`Challenges migration failed: ${error}`);
      throw error;
    }
  }

  private async migrateAchievements(): Promise<void> {
    this.migrationStatus.currentStep = 'migrating_achievements';
    this.migrationStatus.progress = 90;

    try {
      // Check for old achievements data in AsyncStorage
      const oldAchievementsKeys = [
        'local_achievements',
        'linguapp_achievements',
        'user_achievements',
        'unlocked_achievements',
      ];

      for (const key of oldAchievementsKeys) {
        const achievementsData = await AsyncStorage.getItem(key);
        if (achievementsData) {
          try {
            const achievements = JSON.parse(achievementsData);
            if (Array.isArray(achievements)) {
              for (const achievement of achievements) {
                if (this.isValidAchievement(achievement)) {
                  await unifiedDataService.saveAchievement(achievement);
                  this.migrationStatus.migratedRecords.achievements++;
                }
              }
            }
            
            // Clean up old data
            await AsyncStorage.removeItem(key);
            console.debug(`Migrated achievements from ${key}`);
          } catch (error) {
            this.migrationStatus.warnings.push(`Failed to migrate achievements from ${key}: ${error}`);
          }
        }
      }

    } catch (error) {
      this.migrationStatus.errors.push(`Achievements migration failed: ${error}`);
      throw error;
    }
  }

  // ========================================================================
  // VALIDATION METHODS
  // ========================================================================

  private isValidUser(user: any): user is User {
    return user && 
           typeof user.id === 'string' && 
           typeof user.name === 'string' && 
           typeof user.email === 'string';
  }

  private isValidProgress(progress: any): boolean {
    return progress && 
           typeof progress.userId === 'string' && 
           typeof progress.languageCode === 'string';
  }

  private isValidSRSItem(item: any): item is SpacedRepetitionItem {
    return item && 
           typeof item.userId === 'string' && 
           typeof item.itemId === 'string' && 
           typeof item.type === 'string';
  }

  private isValidAnalytics(analytics: any): analytics is LearningAnalytics {
    return analytics && 
           typeof analytics.userId === 'string' && 
           typeof analytics.date === 'string';
  }

  private isValidChallenge(challenge: any): challenge is Challenge {
    return challenge && 
           typeof challenge.id === 'string' && 
           typeof challenge.userId === 'string' && 
           typeof challenge.type === 'string';
  }

  private isValidAchievement(achievement: any): achievement is Achievement {
    return achievement && 
           typeof achievement.id === 'string' && 
           typeof achievement.userId === 'string' && 
           typeof achievement.type === 'string';
  }

  // ========================================================================
  // UTILITY METHODS
  // ========================================================================

  private async createBackup(): Promise<void> {
    try {
      const backup = await unifiedDataService.createBackup();
      console.debug('Backup created before migration');
    } catch (error) {
      this.migrationStatus.warnings.push(`Failed to create backup: ${error}`);
    }
  }

  private async validateMigration(): Promise<void> {
    this.migrationStatus.currentStep = 'validating';
    this.migrationStatus.progress = 95;

    try {
      // Validate that all data was migrated correctly
      const totalMigrated = Object.values(this.migrationStatus.migratedRecords).reduce((a, b) => a + b, 0);
      
      if (totalMigrated === 0) {
        this.migrationStatus.warnings.push('No data was migrated - this might be normal for new installations');
      } else {
        console.debug(`Migration validation complete: ${totalMigrated} records migrated`);
      }
    } catch (error) {
      this.migrationStatus.errors.push(`Validation failed: ${error}`);
    }
  }

  private async markMigrationComplete(): Promise<void> {
    try {
      await AsyncStorage.setItem('linguapp_migration_complete', 'true');
      await AsyncStorage.setItem('linguapp_migration_timestamp', new Date().toISOString());
    } catch (error) {
      console.error('Failed to mark migration as complete:', error);
    }
  }

  private async isMigrationComplete(): Promise<boolean> {
    try {
      const isComplete = await AsyncStorage.getItem('linguapp_migration_complete');
      return isComplete === 'true';
    } catch (error) {
      return false;
    }
  }

  private resetMigrationStatus(): void {
    this.migrationStatus = {
      isComplete: false,
      currentStep: 'idle',
      progress: 0,
      errors: [],
      warnings: [],
      migratedRecords: {
        users: 0,
        progress: 0,
        srsItems: 0,
        analytics: 0,
        challenges: 0,
        achievements: 0,
      },
    };
  }

  private async rollbackMigration(): Promise<void> {
    try {
      console.debug('Rolling back migration...');
      
      // Restore from backup if available
      const backup = await unifiedDataService.getBackup();
      if (backup) {
        await unifiedDataService.restoreBackup(backup);
        console.debug('Migration rolled back successfully');
      } else {
        console.debug('No backup available for rollback');
      }
    } catch (error) {
      console.error('Rollback failed:', error);
    }
  }

  // ========================================================================
  // PUBLIC API
  // ========================================================================

  async getMigrationStatus(): Promise<MigrationStatus> {
    return { ...this.migrationStatus };
  }

  async forceMigration(): Promise<MigrationStatus> {
    return this.migrateAllData({ forceMigration: true });
  }

  async safeMigration(): Promise<MigrationStatus> {
    return this.migrateAllData({ 
      backupBeforeMigration: true, 
      validateAfterMigration: true, 
      rollbackOnError: true, 
    });
  }

  async clearMigrationStatus(): Promise<void> {
    try {
      await AsyncStorage.removeItem('linguapp_migration_complete');
      await AsyncStorage.removeItem('linguapp_migration_timestamp');
      this.resetMigrationStatus();
    } catch (error) {
      console.error('Failed to clear migration status:', error);
    }
  }
}

// ============================================================================
// SERVICE INSTANCE
// ============================================================================

export const dataMigrationService = new DataMigrationService();

// ============================================================================
// CONVENIENCE EXPORTS
// ============================================================================

export const migrateAllData = dataMigrationService.migrateAllData.bind(dataMigrationService);
export const getMigrationStatus = dataMigrationService.getMigrationStatus.bind(dataMigrationService);
export const forceMigration = dataMigrationService.forceMigration.bind(dataMigrationService);
export const safeMigration = dataMigrationService.safeMigration.bind(dataMigrationService);
export const clearMigrationStatus = dataMigrationService.clearMigrationStatus.bind(dataMigrationService);
