/**
 * Enhanced Onboarding Service - Complete user setup and preferences
 * Handles multi-step onboarding flow with language selection, CEFR assessment, and preferences
 * Integrates with Firebase for persistent storage and analytics
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, CEFRLevel, LearningGoal } from '@/types';
import { languages } from '@/mocks/languages';
import { unifiedDataService } from '../database/unifiedDataService';
import { gamificationService } from '../gamification/enhancedGamificationService';

// Using the OnboardingData interface from types/index.ts
import { OnboardingData } from '@/types';

export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  data?: any;
}

class OnboardingService {
  private readonly ONBOARDING_VERSION = '1.0.0';
  private readonly ONBOARDING_KEY = 'linguapp_onboarding';
  
  /**
   * Check if user needs onboarding
   */
  async needsOnboarding(userId: string): Promise<boolean> {
    try {
      const user = await unifiedDataService.getUser(userId);
      if (!user) return true;
      
      // Check if onboarding is completed and up to date
      return !user.onboardingCompleted || 
             !user.onboardingData?.onboardingVersion ||
             user.onboardingData.onboardingVersion !== this.ONBOARDING_VERSION;
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      return true;
    }
  }
  
  /**
   * Get onboarding steps for user
   */
  getOnboardingSteps(): OnboardingStep[] {
    return [
      {
        id: 'welcome',
        title: 'Welcome to LinguApp',
        description: 'Let\'s personalize your learning experience',
        completed: false,
      },
      {
        id: 'languages',
        title: 'Choose Your Languages',
        description: 'Select your native language and what you want to learn',
        completed: false,
      },
      {
        id: 'assessment',
        title: 'Quick Assessment',
        description: 'Help us understand your current level',
        completed: false,
      },
      {
        id: 'goals',
        title: 'Set Your Goals',
        description: 'What do you want to achieve?',
        completed: false,
      },
      {
        id: 'schedule',
        title: 'Create Your Schedule',
        description: 'When would you like to study?',
        completed: false,
      },
      {
        id: 'notifications',
        title: 'Stay Motivated',
        description: 'Set up reminders and notifications',
        completed: false,
      },
      {
        id: 'privacy',
        title: 'Privacy & Terms',
        description: 'Review our terms and privacy policy',
        completed: false,
      },
      {
        id: 'complete',
        title: 'You\'re All Set!',
        description: 'Ready to start your language journey',
        completed: false,
      },
    ];
  }
  
  /**
   * Save onboarding step data
   */
  async saveStepData(stepId: string, data: any): Promise<void> {
    try {
      const existing = await this.getOnboardingProgress();
      const updated = {
        ...existing,
        [stepId]: {
          ...data,
          completedAt: new Date().toISOString(),
        },
      };
      
      await AsyncStorage.setItem(this.ONBOARDING_KEY, JSON.stringify(updated));
      console.debug(`Saved onboarding step: ${stepId}`);
    } catch (error) {
      console.error('Error saving onboarding step:', error);
    }
  }
  
  /**
   * Get current onboarding progress
   */
  async getOnboardingProgress(): Promise<any> {
    try {
      const data = await AsyncStorage.getItem(this.ONBOARDING_KEY);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error('Error getting onboarding progress:', error);
      return {};
    }
  }
  
  /**
   * Complete onboarding and update user profile
   */
  async completeOnboarding(userId: string): Promise<User> {
    try {
      const progress = await this.getOnboardingProgress();
      const user = await unifiedDataService.getUser(userId);
      
      if (!user) {
        throw new Error('User not found');
      }
      
      // Compile onboarding data
      const onboardingData: OnboardingData = {
        nativeLanguage: progress.languages?.nativeLanguage || languages[0],
        targetLanguages: progress.languages?.targetLanguages || [languages[5]], // Croatian default
        startingCEFRLevel: progress.assessment?.level || 'A1',
        hasCompletedTest: progress.assessment?.hasCompletedTest || false,
        learningGoals: progress.goals?.learningGoals || ['vocabulary', 'speaking'],
        dailyGoalXP: progress.goals?.dailyGoalXP || 100,
        studyTimePreference: progress.schedule?.timePreference || 'evening',
        weeklyCommitment: progress.schedule?.weeklyCommitment || 5,
        notifTime: progress.notifications?.notifTime || '19:00',
        pushConsent: progress.notifications?.pushConsent || false,
        emailConsent: progress.notifications?.emailConsent || false,
        tosAccepted: progress.privacy?.tosAccepted || false,
        privacyAccepted: progress.privacy?.privacyAccepted || false,
        dataProcessingConsent: progress.privacy?.dataProcessingConsent || false,
        completedAt: new Date().toISOString(),
        onboardingVersion: this.ONBOARDING_VERSION,
      };
      
      // Update user profile with onboarding data
      const updatedUser: User = {
        ...user,
        nativeLanguage: onboardingData.nativeLanguage,
        currentLanguage: onboardingData.targetLanguages[0],
        onboardingCompleted: true,
        onboardingData,
        preferences: {
          timezone: user.preferences?.timezone || 'UTC',
          reminderTime: onboardingData.notifTime,
          weeklyGoal: onboardingData.dailyGoalXP * 7,
          studyDays: this.generateStudyDays(onboardingData.weeklyCommitment),
          immersionMode: user.preferences?.immersionMode || false,
          notificationsEnabled: onboardingData.pushConsent,
          soundEnabled: user.preferences?.soundEnabled || true,
          hapticEnabled: user.preferences?.hapticEnabled || true,
          notifications: onboardingData.pushConsent,
          soundEffects: user.preferences?.soundEffects || true,
          dailyReminder: user.preferences?.dailyReminder || true,
          theme: user.preferences?.theme || 'system',
          autoPlay: user.preferences?.autoPlay ?? true,
        },
      };
      
      // Save updated user
      await unifiedDataService.saveUser(updatedUser);
      
      // Initialize gamification stats
      await gamificationService.initializeUserStats(userId);
      
      // Clear onboarding progress
      await AsyncStorage.removeItem(this.ONBOARDING_KEY);
      
      console.debug('Onboarding completed successfully for user:', userId);
      return updatedUser;
    } catch (error) {
      console.error('Error completing onboarding:', error);
      throw error;
    }
  }
  
  /**
   * Generate study days based on weekly commitment
   */
  private generateStudyDays(weeklyCommitment: number): string[] {
    const allDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    
    if (weeklyCommitment >= 7) return allDays;
    if (weeklyCommitment >= 5) return allDays.slice(0, 5); // Weekdays
    if (weeklyCommitment >= 3) return ['monday', 'wednesday', 'friday'];
    if (weeklyCommitment >= 2) return ['tuesday', 'thursday'];
    
    return ['saturday']; // At least one day
  }
  
  /**
   * Get available learning goals
   */
  getLearningGoals(): { id: LearningGoal; title: string; description: string; icon: string }[] {
    return [
      {
        id: 'vocabulary',
        title: 'Build Vocabulary',
        description: 'Learn new words and phrases',
        icon: '📚',
      },
      {
        id: 'speaking',
        title: 'Improve Speaking',
        description: 'Practice pronunciation and conversation',
        icon: '🗣️',
      },
      {
        id: 'listening',
        title: 'Better Listening',
        description: 'Understand native speakers',
        icon: '👂',
      },
      {
        id: 'grammar',
        title: 'Master Grammar',
        description: 'Learn language structure and rules',
        icon: '📝',
      },
      {
        id: 'fluency',
        title: 'Achieve Fluency',
        description: 'Speak naturally and confidently',
        icon: '🎯',
      },
      {
        id: 'travel',
        title: 'Travel Preparation',
        description: 'Essential phrases for traveling',
        icon: '✈️',
      },
      {
        id: 'business',
        title: 'Business Communication',
        description: 'Professional language skills',
        icon: '💼',
      },
      {
        id: 'culture',
        title: 'Cultural Understanding',
        description: 'Learn about customs and traditions',
        icon: '🌍',
      },
    ];
  }
  
  /**
   * Get CEFR level descriptions
   */
  getCEFRLevels(): { level: CEFRLevel; title: string; description: string }[] {
    return [
      {
        level: 'A1',
        title: 'Beginner',
        description: 'I\'m just starting to learn this language',
      },
      {
        level: 'A2',
        title: 'Elementary',
        description: 'I know some basic words and phrases',
      },
      {
        level: 'B1',
        title: 'Intermediate',
        description: 'I can have simple conversations',
      },
      {
        level: 'B2',
        title: 'Upper Intermediate',
        description: 'I can discuss various topics comfortably',
      },
      {
        level: 'C1',
        title: 'Advanced',
        description: 'I can express myself fluently',
      },
      {
        level: 'C2',
        title: 'Proficient',
        description: 'I have near-native proficiency',
      },
    ];
  }
  
  /**
   * Validate onboarding data
   */
  validateOnboardingData(data: Partial<OnboardingData>): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!data.nativeLanguage) {
      errors.push('Native language is required');
    }
    
    if (!data.targetLanguages || data.targetLanguages.length === 0) {
      errors.push('At least one target language is required');
    }
    
    if (!data.startingCEFRLevel) {
      errors.push('CEFR level is required');
    }
    
    if (!data.learningGoals || data.learningGoals.length === 0) {
      errors.push('At least one learning goal is required');
    }
    
    if (!data.dailyGoalXP || data.dailyGoalXP < 50 || data.dailyGoalXP > 1000) {
      errors.push('Daily XP goal must be between 50 and 1000');
    }
    
    if (!data.weeklyCommitment || data.weeklyCommitment < 1 || data.weeklyCommitment > 7) {
      errors.push('Weekly commitment must be between 1 and 7 days');
    }
    
    if (!data.tosAccepted) {
      errors.push('Terms of Service must be accepted');
    }
    
    if (!data.privacyAccepted) {
      errors.push('Privacy Policy must be accepted');
    }
    
    return {
      valid: errors.length === 0,
      errors,
    };
  }
  
  /**
   * Reset onboarding progress
   */
  async resetOnboarding(): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.ONBOARDING_KEY);
      console.debug('Onboarding progress reset');
    } catch (error) {
      console.error('Error resetting onboarding:', error);
    }
  }
}

export const onboardingService = new OnboardingService();
export default onboardingService;
