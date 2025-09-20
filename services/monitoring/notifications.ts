/**
 * Enhanced Notification Service - Smart notifications and reminders
 * Supports FCM push notifications, local notifications, and adaptive scheduling
 * Integrates with user preferences and learning analytics
 */

// import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, SmartNotification } from '@/types';
import { unifiedDataService } from '../database/unifiedDataService';
import { getTranslationForLanguage } from '@/hooks/useLanguage';

export interface NotificationConfig {
  enabled: boolean;
  dailyReminder: boolean; 
  streakReminder: boolean;
  achievementNotifications: boolean;
  friendActivity: boolean;
  challengeUpdates: boolean;
  reminderTime: string; // HH:MM format
  timezone: string;
  quietHours: {
    start: string; // HH:MM
    end: string; // HH:MM
  };
}

export interface NotificationTemplate {
  id: string;
  type: 'reminder' | 'streak_risk' | 'achievement' | 'challenge' | 'friend_activity';
  title: string;
  body: string;
  data?: any;
  priority: 'low' | 'normal' | 'high';
  category?: string;
}

class NotificationService {
  private expoPushToken: string | null = null;
  private notificationListener: any = null;
  private responseListener: any = null;
  private isInitialized = false;

  /**
   * Initialize notification service
   */
  async initialize(): Promise<void> {
    try {
      console.debug('Initializing notification service...');

      // Configure notification behavior
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: true,
          shouldShowBanner: true,
          shouldShowList: true,
        }),
      });

      // Register for push notifications
      if (Device.isDevice) {
        await this.registerForPushNotifications();
      } else {
        console.debug('Push notifications only work on physical devices');
      }

      // Set up notification listeners
      this.setupNotificationListeners();

      this.isInitialized = true;
      console.debug('Notification service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize notification service:', error);
      throw error;
    }
  }

  /**
   * Register for push notifications and get token
   */
  private async registerForPushNotifications(): Promise<void> {
    try {
      // Check existing permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      // Request permissions if not granted
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.debug('Push notification permissions not granted');
        return;
      }

      // Get push token
      const token = await Notifications.getExpoPushTokenAsync({
        projectId: Constants.expoConfig?.extra?.eas?.projectId,
      });

      this.expoPushToken = token.data;
      console.debug('Expo push token:', this.expoPushToken);

      // Store token for server-side notifications
      await this.storePushToken(this.expoPushToken);
    } catch (error) {
      console.error('Failed to register for push notifications:', error);
    }
  }

  /**
   * Set up notification event listeners
   */
  private setupNotificationListeners(): void {
    // Listener for notifications received while app is running
    this.notificationListener = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.debug('Notification received:', notification);
        this.handleNotificationReceived(notification);
      },
    );

    // Listener for notification responses (user tapped notification)
    this.responseListener = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        console.debug('Notification response:', response);
        this.handleNotificationResponse(response);
      },
    );
  }

  /**
   * Handle notification received while app is running
   */
  private handleNotificationReceived(notification: Notifications.Notification): void {
    const { request } = notification;
    const { content, identifier } = request;

    // Update notification as opened
    this.markNotificationAsOpened(identifier);

    // Handle specific notification types
    if (content.data?.type) {
      this.handleNotificationAction(content.data.type as string, content.data);
    }
  }

  /**
   * Handle user response to notification
   */
  private handleNotificationResponse(response: Notifications.NotificationResponse): void {
    const { notification, actionIdentifier } = response;
    const { content } = notification.request;

    console.debug('User responded to notification:', actionIdentifier);

    // Handle different action types
    switch (actionIdentifier) {
      case 'start_lesson':
        this.navigateToLesson(content.data?.lessonId as string | undefined);
        break;
      case 'view_achievement':
        this.navigateToAchievements();
        break;
      case 'accept_challenge':
        this.handleChallengeAction(content.data?.challengeId as string, 'accept');
        break;
      case 'decline_challenge':
        this.handleChallengeAction(content.data?.challengeId as string, 'decline');
        break;
      default:
        // Default action (tap notification)
        this.handleDefaultNotificationAction(content.data);
    }
  }

  /**
   * Schedule daily reminder notification
   */
  async scheduleDailyReminder(userId: string, config: NotificationConfig): Promise<void> {
    try {
      if (!config.enabled || !config.dailyReminder) {
        return;
      }

      // Cancel existing daily reminders
      await this.cancelNotificationsByType('daily_reminder');

      // Parse reminder time
      const [hours, minutes] = config.reminderTime.split(':').map(Number);

      // Schedule notification
      const trigger: Notifications.DailyTriggerInput = {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: hours,
        minute: minutes,
      };

      const { unifiedDataService: dataService1 } = await import('../database/unifiedDataService');
      const user = await dataService1.getUser(userId);
      const languageCode = user?.mainLanguage?.code || 'en';
      const t = (key: string) => getTranslationForLanguage(key as any, languageCode);
      
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: `📚 ${  t('dailyReminder')}`,
          body: t('streakRisk'),
          data: {
            type: 'daily_reminder',
            userId,
            action: 'start_lesson',
          },
          categoryIdentifier: 'reminder',
        },
        trigger,
      });

      console.debug('Daily reminder scheduled:', notificationId);
    } catch (error) {
      console.error('Failed to schedule daily reminder:', error);
    }
  }

  /**
   * Schedule streak risk notification
   */
  async scheduleStreakRiskNotification(userId: string, streakDays: number): Promise<void> {
    try {
      const { unifiedDataService: dataService1 } = await import('../database/unifiedDataService');
      const user = await dataService1.getUser(userId);
      if (!user?.preferences?.notificationsEnabled) {
        return;
      }

      // Only notify if streak is significant (3+ days)
      if (streakDays < 3) {
        return;
      }

      // Schedule for 2 hours before usual reminder time
      const reminderTime = user.preferences.reminderTime || '19:00';
      const [hours, minutes] = reminderTime.split(':').map(Number);
      const notificationHour = hours >= 2 ? hours - 2 : hours + 22; // Handle day wrap

      const trigger: Notifications.DailyTriggerInput = {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: notificationHour,
        minute: minutes,
      };

      const languageCode = user?.mainLanguage?.code || 'en';
      const t = (key: string) => getTranslationForLanguage(key as any, languageCode);
      
      await Notifications.scheduleNotificationAsync({
        content: {
          title: `🔥 ${  t('streakRisk')}`,
          body: `${t('streak')}: ${streakDays} ${t('days')}. ${t('continue')} ${t('lesson')} ${t('streakRisk')}`,
          data: {
            type: 'streak_risk',
            userId,
            streakDays,
            action: 'start_lesson',
          },
          categoryIdentifier: 'streak',
        },
        trigger,
      });

      console.debug('Streak risk notification scheduled');
    } catch (error) {
      console.error('Failed to schedule streak risk notification:', error);
    }
  }

  /**
   * Send achievement notification
   */
  async sendAchievementNotification(
    userId: string,
    achievementTitle: string,
    achievementDescription: string,
  ): Promise<void> {
    try {
      const { unifiedDataService: dataService1 } = await import('../database/unifiedDataService');
      const user = await dataService1.getUser(userId);
      if (!user?.preferences?.notificationsEnabled) {
        return;
      }

      const languageCode = user?.mainLanguage?.code || 'en';
      const t = (key: string) => getTranslationForLanguage(key as any, languageCode);
      
      await Notifications.scheduleNotificationAsync({
        content: {
          title: `🏆 ${  t('newAchievement')}`,
          body: `${achievementTitle}: ${achievementDescription}`,
          data: {
            type: 'achievement',
            userId,
            achievementTitle,
            action: 'view_achievement',
          },
          categoryIdentifier: 'achievement',
        },
        trigger: null, // Send immediately
      });

      console.debug('Achievement notification sent');
    } catch (error) {
      console.error('Failed to send achievement notification:', error);
    }
  }

  /**
   * Send challenge notification
   */
  async sendChallengeNotification(
    userId: string,
    challengerName: string,
    challengeType: string,
    challengeId: string,
  ): Promise<void> {
    try {
      const { unifiedDataService: dataService1 } = await import('../database/unifiedDataService');
      const user = await dataService1.getUser(userId);
      if (!user?.preferences?.notificationsEnabled) {
        return;
      }

      const languageCode = user?.mainLanguage?.code || 'en';
      const t = (key: string) => getTranslationForLanguage(key as any, languageCode);
      
      await Notifications.scheduleNotificationAsync({
        content: {
          title: `⚔️ ${  t('challengeInvite')}`,
          body: `${challengerName} ${t('challengeInvite')} ${challengeType}`,
          data: {
            type: 'challenge',
            userId,
            challengeId,
            challengerName,
            challengeType,
          },
          categoryIdentifier: 'challenge',
        },
        trigger: null,
      });

      console.debug('Challenge notification sent');
    } catch (error) {
      console.error('Failed to send challenge notification:', error);
    }
  }

  /**
   * Send friend activity notification
   */
  async sendFriendActivityNotification(
    userId: string,
    friendName: string,
    activity: string,
  ): Promise<void> {
    try {
      const { unifiedDataService: dataService1 } = await import('../database/unifiedDataService');
      const user = await dataService1.getUser(userId);
      if (!user?.preferences?.notificationsEnabled) {
        return;
      }

      const languageCode = user?.mainLanguage?.code || 'en';
      const t = (key: string) => getTranslationForLanguage(key as any, languageCode);
      
      await Notifications.scheduleNotificationAsync({
        content: {
          title: `👥 ${  t('friendActivity')}`,
          body: `${friendName} ${activity}`,
          data: {
            type: 'friend_activity',
            userId,
            friendName,
            activity,
          },
          categoryIdentifier: 'social',
        },
        trigger: null,
      });

      console.debug('Friend activity notification sent');
    } catch (error) {
      console.error('Failed to send friend activity notification:', error);
    }
  }

  /**
   * Schedule smart review reminder based on SRS
   */
  async scheduleReviewReminder(
    userId: string,
    dueItemsCount: number,
    nextReviewTime: Date,
  ): Promise<void> {
    try {
      if (dueItemsCount === 0) {
        return;
      }

      const { unifiedDataService: dataService1 } = await import('../database/unifiedDataService');
      const user = await dataService1.getUser(userId);
      if (!user?.preferences?.notificationsEnabled) {
        return;
      }

      // Don't schedule if next review is more than 24 hours away
      const hoursUntilReview = (nextReviewTime.getTime() - Date.now()) / (1000 * 60 * 60);
      if (hoursUntilReview > 24) {
        return;
      }

      const trigger: Notifications.DateTriggerInput = {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: nextReviewTime,
      };

      const languageCode = user?.mainLanguage?.code || 'en';
      const t = (key: string) => getTranslationForLanguage(key as any, languageCode);
      
      await Notifications.scheduleNotificationAsync({
        content: {
          title: `🧠 ${  t('reviewTime')}`,
          body: `${t('youHave')} ${dueItemsCount} ${t('itemsReady')} ${t('review')}`,
          data: {
            type: 'review_reminder',
            userId,
            dueItemsCount,
            action: 'start_review',
          },
          categoryIdentifier: 'review',
        },
        trigger,
      });

      console.debug('Review reminder scheduled for:', nextReviewTime);
    } catch (error) {
      console.error('Failed to schedule review reminder:', error);
    }
  }

  /**
   * Update notification preferences
   */
  async updateNotificationPreferences(
    userId: string,
    config: Partial<NotificationConfig>,
  ): Promise<void> {
    try {
      const { unifiedDataService: dataService1 } = await import('../database/unifiedDataService');
      const user = await dataService1.getUser(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Update user preferences
      const updatedPreferences = {
        ...user.preferences,
        notificationsEnabled: config.enabled ?? user.preferences?.notificationsEnabled ?? true,
        dailyReminder: config.dailyReminder ?? user.preferences?.dailyReminder ?? true,
        reminderTime: config.reminderTime ?? user.preferences?.reminderTime ?? '19:00',
        timezone: config.timezone ?? user.preferences?.timezone ?? 'UTC',
      };

      const updatedUser: User = {
        ...user,
        preferences: {
          timezone: updatedPreferences.timezone,
          reminderTime: updatedPreferences.reminderTime,
          weeklyGoal: updatedPreferences.weeklyGoal || 1000,
          studyDays: updatedPreferences.studyDays || ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
          immersionMode: updatedPreferences.immersionMode || false,
          notificationsEnabled: updatedPreferences.notificationsEnabled,
          soundEnabled: updatedPreferences.soundEnabled || true,
          hapticEnabled: updatedPreferences.hapticEnabled || true,
          notifications: updatedPreferences.notificationsEnabled,
          soundEffects: updatedPreferences.soundEffects || true,
          dailyReminder: updatedPreferences.dailyReminder,
          theme: updatedPreferences.theme || 'system',
          autoPlay: updatedPreferences.autoPlay ?? true,
        },
      };

      const { unifiedDataService: dataService2 } = await import('../database/unifiedDataService');
      await dataService2.saveUser(updatedUser);

      // Reschedule notifications based on new preferences
      if (config.enabled && config.dailyReminder) {
        await this.scheduleDailyReminder(userId, config as NotificationConfig);
      } else {
        await this.cancelNotificationsByType('daily_reminder');
      }

      console.debug('Notification preferences updated');
    } catch (error) {
      console.error('Failed to update notification preferences:', error);
      throw error;
    }
  }

  /**
   * Get notification history
   */
  async getNotificationHistory(userId: string, limit = 50): Promise<SmartNotification[]> {
    try {
      // In a real implementation, this would fetch from a database
      // For now, return mock data
      const mockNotifications: SmartNotification[] = [
        {
          id: 'notif_1',
          userId,
          type: 'reminder',
          title: { en: 'Daily Reminder', hr: 'Dnevni Podsjetnik' },
          body: { en: 'Time for your daily lesson!', hr: 'Vrijeme za dnevnu lekciju!' },
          scheduledFor: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          sent: true,
          opened: true,
          data: { lessonId: 'default' },
        },
        {
          id: 'notif_2',
          userId,
          type: 'achievement',
          title: { en: 'Achievement Unlocked!', hr: 'Postignuće Otključano!' },
          body: { en: 'You earned the Week Warrior badge!', hr: 'Zaradili ste značku Tjedni Ratnik!' },
          scheduledFor: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
          sent: true,
          opened: false,
          data: { achievementId: 'week_warrior' },
        },
      ];

      return mockNotifications.slice(0, limit);
    } catch (error) {
      console.error('Failed to get notification history:', error);
      return [];
    }
  }

  /**
   * Cancel notifications by type
   */
  private async cancelNotificationsByType(type: string): Promise<void> {
    try {
      const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
      
      const notificationsToCancel = scheduledNotifications.filter(
        notification => notification.content.data?.type === type,
      );

      for (const notification of notificationsToCancel) {
        await Notifications.cancelScheduledNotificationAsync(notification.identifier);
      }

      console.debug(`Cancelled ${notificationsToCancel.length} notifications of type: ${type}`);
    } catch (error) {
      console.error('Failed to cancel notifications:', error);
    }
  }

  /**
   * Store push token for server-side notifications
   */
  private async storePushToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem('expo_push_token', token);
      
      // In a real implementation, you would also send this to your server
      // to enable server-side push notifications
      console.debug('Push token stored locally');
    } catch (error) {
      console.error('Failed to store push token:', error);
    }
  }

  /**
   * Mark notification as opened
   */
  private async markNotificationAsOpened(notificationId: string): Promise<void> {
    try {
      // In a real implementation, this would update the database
      console.debug('Notification marked as opened:', notificationId);
    } catch (error) {
      console.error('Failed to mark notification as opened:', error);
    }
  }

  /**
   * Handle notification actions
   */
  private handleNotificationAction(type: string, data: any): void {
    switch (type) {
      case 'daily_reminder':
      case 'streak_risk':
        this.navigateToLesson(data.lessonId);
        break;
      case 'achievement':
        this.navigateToAchievements();
        break;
      case 'challenge':
        this.navigateToChallenge(data.challengeId);
        break;
      case 'friend_activity':
        this.navigateToSocial();
        break;
      case 'review_reminder':
        this.navigateToReview();
        break;
      default:
        console.debug('Unknown notification type:', type);
    }
  }

  /**
   * Handle default notification action (tap)
   */
  private handleDefaultNotificationAction(data: any): void {
    if (data?.action) {
      this.handleNotificationAction(data.action, data);
    } else {
      // Navigate to main app
      console.debug('Opening main app from notification');
    }
  }

  /**
   * Handle challenge actions
   */
  private handleChallengeAction(challengeId: string, action: 'accept' | 'decline'): void {
    console.debug(`Challenge ${challengeId} ${action}ed`);
    // In a real implementation, this would update the challenge status
  }

  /**
   * Navigation helpers (these would integrate with your navigation system)
   */
  private navigateToLesson(lessonId?: string): void {
    console.debug('Navigate to lesson:', lessonId || 'default');
    // Implementation depends on your navigation setup
  }

  private navigateToAchievements(): void {
    console.debug('Navigate to achievements');
  }

  private navigateToChallenge(challengeId: string): void {
    console.debug('Navigate to challenge:', challengeId);
  }

  private navigateToSocial(): void {
    console.debug('Navigate to social features');
  }

  private navigateToReview(): void {
    console.debug('Navigate to review session');
  }

  /**
   * Get notification statistics
   */
  async getNotificationStats(_userId: string): Promise<{
    totalSent: number;
    totalOpened: number;
    openRate: number;
    byType: { [key: string]: { sent: number; opened: number } };
  }> {
    try {
      // In a real implementation, this would query the database
      // For now, return mock statistics
      return {
        totalSent: 45,
        totalOpened: 32,
        openRate: 71.1,
        byType: {
          reminder: { sent: 20, opened: 18 },
          achievement: { sent: 8, opened: 7 },
          challenge: { sent: 5, opened: 3 },
          friend_activity: { sent: 7, opened: 2 },
          streak_risk: { sent: 5, opened: 2 },
        },
      };
    } catch (error) {
      console.error('Failed to get notification stats:', error);
      return {
        totalSent: 0,
        totalOpened: 0,
        openRate: 0,
        byType: {},
      };
    }
  }

  /**
   * Test notification (for debugging)
   */
  async sendTestNotification(title: string, body: string): Promise<void> {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: { type: 'test' },
        },
        trigger: null,
      });

      console.debug('Test notification sent');
    } catch (error) {
      console.error('Failed to send test notification:', error);
    }
  }

  /**
   * Get push token
   */
  getPushToken(): string | null {
    return this.expoPushToken;
  }

  /**
   * Check if notifications are enabled
   */
  async areNotificationsEnabled(): Promise<boolean> {
    try {
      const { status } = await Notifications.getPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Failed to check notification permissions:', error);
      return false;
    }
  }

  /**
   * Cleanup notification service
   */
  cleanup(): void {
    if (this.notificationListener) {
      (Notifications as any).removeNotificationSubscription(this.notificationListener);
      this.notificationListener = null;
    }

    if (this.responseListener) {
      (Notifications as any).removeNotificationSubscription(this.responseListener);
      this.responseListener = null;
    }

    console.debug('Notification service cleaned up');
  }
}

export const notificationService = new NotificationService();
export default notificationService;
