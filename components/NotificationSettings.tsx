import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Dimensions,
} from 'react-native';
import { theme } from '@/constants/theme';
import { useI18n } from '@/hooks/useI18n';
import { useUnifiedAuth } from "@/hooks/useUnifiedAuth";
import { useGameState } from '@/hooks/useGameState';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Badge } from '@/components/Badge';
import { 
  BellIcon, 
  ClockIcon, 
  StarIcon, 
  AwardIcon, 
  FlameIcon,
  TargetIcon,
  BookOpenIcon,
  SettingsIcon,
  CheckIcon,
  XIcon,
  Volume2Icon,
  VolumeXIcon,
  VibrateIcon,
  SmartphoneIcon,
} from '@/components/icons/LucideReplacement';

const { width } = Dimensions.get('window');

interface NotificationSettings {
  general: {
    enabled: boolean;
    sound: boolean;
    vibration: boolean;
    badges: boolean;
  };
  reminders: {
    dailyStudy: boolean;
    streakReminder: boolean;
    goalReminder: boolean;
    weeklyReport: boolean;
  };
  achievements: {
    newAchievement: boolean;
    levelUp: boolean;
    streakMilestone: boolean;
    challengeComplete: boolean;
  };
  social: {
    friendRequests: boolean;
    friendActivity: boolean;
    leaderboardUpdates: boolean;
    communityChallenges: boolean;
  };
  timing: {
    quietHours: boolean;
    quietStart: string;
    quietEnd: string;
    timezone: string;
  };
}

interface NotificationSettingsProps {
  onSave?: (settings: NotificationSettings) => void;
  onCancel?: () => void;
}

export default function NotificationSettings({
  onSave,
  onCancel,
}: NotificationSettingsProps) {
  const { t } = useI18n();
  const { user, signIn, signOut, signUp, resetPassword, updateUser } = useUnifiedAuth();
  const { getUserProgress } = useGameState();

  const [settings, setSettings] = useState<NotificationSettings>({
    general: {
      enabled: true,
      sound: true,
      vibration: true,
      badges: true,
    },
    reminders: {
      dailyStudy: true,
      streakReminder: true,
      goalReminder: true,
      weeklyReport: true,
    },
    achievements: {
      newAchievement: true,
      levelUp: true,
      streakMilestone: true,
      challengeComplete: true,
    },
    social: {
      friendRequests: true,
      friendActivity: false,
      leaderboardUpdates: false,
      communityChallenges: true,
    },
    timing: {
      quietHours: false,
      quietStart: '22:00',
      quietEnd: '08:00',
      timezone: 'UTC',
    },
  });

  const [loading, setLoading] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    loadNotificationSettings();
  }, []);

  const loadNotificationSettings = async () => {
    try {
      setLoading(true);
      
      if (!user) return;

      const userProgress = await getUserProgress(user.id);
      
      if (userProgress.notificationSettings) {
        setSettings(userProgress.notificationSettings);
      }

    } catch (error) {
      console.error('Error loading notification settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      if (onSave) {
        onSave(settings);
      }
      
      setHasChanges(false);
      Alert.alert('Success', 'Notification settings saved successfully!');
    } catch (error) {
      console.error('Error saving notification settings:', error);
      Alert.alert('Error', 'Failed to save notification settings. Please try again.');
    }
  };

  const handleCancel = () => {
    if (hasChanges) {
      Alert.alert(
        'Unsaved Changes',
        'You have unsaved changes. Are you sure you want to cancel?',
        [
          { text: 'Keep Editing', style: 'cancel' },
          { 
            text: 'Discard Changes', 
            style: 'destructive',
            onPress: () => {
              setHasChanges(false);
              if (onCancel) {
                onCancel();
              }
            },
          },
        ],
      );
    } else {
      if (onCancel) {
        onCancel();
      }
    }
  };

  const updateSetting = (category: keyof NotificationSettings, field: string, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: value,
      },
    }));
    setHasChanges(true);
  };

  const renderToggleSetting = (
    title: string,
    description: string,
    value: boolean,
    onValueChange: (value: boolean) => void,
    icon: React.ReactNode,
    color: string,
  ) => (
    <View style={styles.settingRow}>
      <View style={styles.settingInfo}>
        <View style={[styles.settingIcon, { backgroundColor: color }]}>
          {icon}
        </View>
        <View style={styles.settingText}>
          <Text style={styles.settingTitle}>{title}</Text>
          <Text style={styles.settingDescription}>{description}</Text>
        </View>
      </View>
      
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: theme.colors.gray[300], true: color }}
        thumbColor={value ? theme.colors.white : theme.colors.gray[500]}
      />
    </View>
  );

  const renderSettingsSection = (
    title: string,
    settings: any,
    category: keyof NotificationSettings,
    icon: React.ReactNode,
    color: string,
  ) => (
    <Card style={styles.settingsSection}>
      <View style={styles.sectionHeader}>
        <View style={[styles.sectionIcon, { backgroundColor: color }]}>
          {icon}
        </View>
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      
      <View style={styles.settingsList}>
        {Object.entries(settings).map(([key, value]) => {
          const settingConfig = getSettingConfig(key);
          return renderToggleSetting(
            settingConfig.title,
            settingConfig.description,
            value as boolean,
            (newValue) => updateSetting(category, key, newValue),
            settingConfig.icon,
            settingConfig.color,
          );
        })}
      </View>
    </Card>
  );

  const getSettingConfig = (key: string) => {
    const configs: Record<string, any> = {
      // General settings
      enabled: {
        title: 'Enable Notifications',
        description: 'Allow all notifications from the app',
        icon: <BellIcon size={20} color={theme.colors.white} />,
        color: theme.colors.primary,
      },
      sound: {
        title: 'Sound',
        description: 'Play sound for notifications',
        icon: <Volume2Icon size={20} color={theme.colors.white} />,
        color: theme.colors.info,
      },
      vibration: {
        title: 'Vibration',
        description: 'Vibrate for notifications',
        icon: <VibrateIcon size={20} color={theme.colors.white} />,
        color: theme.colors.warning,
      },
      badges: {
        title: 'Badge Count',
        description: 'Show notification count on app icon',
        icon: <TargetIcon size={20} color={theme.colors.white} />,
        color: theme.colors.success,
      },
      
      // Reminder settings
      dailyStudy: {
        title: 'Daily Study Reminder',
        description: 'Remind me to study every day',
        icon: <ClockIcon size={20} color={theme.colors.white} />,
        color: theme.colors.primary,
      },
      streakReminder: {
        title: 'Streak Reminder',
        description: 'Remind me to maintain my streak',
        icon: <FlameIcon size={20} color={theme.colors.white} />,
        color: theme.colors.danger,
      },
      goalReminder: {
        title: 'Goal Reminder',
        description: 'Remind me about my learning goals',
        icon: <TargetIcon size={20} color={theme.colors.white} />,
        color: theme.colors.warning,
      },
      weeklyReport: {
        title: 'Weekly Report',
        description: 'Send weekly progress report',
        icon: <BookOpenIcon size={20} color={theme.colors.white} />,
        color: theme.colors.info,
      },
      
      // Achievement settings
      newAchievement: {
        title: 'New Achievements',
        description: 'Notify when unlocking new achievements',
        icon: <AwardIcon size={20} color={theme.colors.white} />,
        color: theme.colors.warning,
      },
      levelUp: {
        title: 'Level Up',
        description: 'Notify when reaching a new level',
        icon: <StarIcon size={20} color={theme.colors.white} />,
        color: theme.colors.success,
      },
      streakMilestone: {
        title: 'Streak Milestones',
        description: 'Notify when reaching streak milestones',
        icon: <FlameIcon size={20} color={theme.colors.white} />,
        color: theme.colors.danger,
      },
      challengeComplete: {
        title: 'Challenge Complete',
        description: 'Notify when completing challenges',
        icon: <TargetIcon size={20} color={theme.colors.white} />,
        color: theme.colors.primary,
      },
      
      // Social settings
      friendRequests: {
        title: 'Friend Requests',
        description: 'Notify when receiving friend requests',
        icon: <BellIcon size={20} color={theme.colors.white} />,
        color: theme.colors.primary,
      },
      friendActivity: {
        title: 'Friend Activity',
        description: 'Notify about friends\' learning activity',
        icon: <StarIcon size={20} color={theme.colors.white} />,
        color: theme.colors.info,
      },
      leaderboardUpdates: {
        title: 'Leaderboard Updates',
        description: 'Notify about ranking changes',
        icon: <TargetIcon size={20} color={theme.colors.white} />,
        color: theme.colors.warning,
      },
      communityChallenges: {
        title: 'Community Challenges',
        description: 'Notify about new community challenges',
        icon: <AwardIcon size={20} color={theme.colors.white} />,
        color: theme.colors.success,
      },
    };
    
    return configs[key] || {
      title: key,
      description: '',
      icon: <BellIcon size={20} color={theme.colors.white} />,
      color: theme.colors.gray[500],
    };
  };

  const renderQuietHours = () => (
    <Card style={styles.quietHoursCard}>
      <View style={styles.sectionHeader}>
        <View style={[styles.sectionIcon, { backgroundColor: theme.colors.gray[600] }]}>
          <ClockIcon size={20} color={theme.colors.white} />
        </View>
        <Text style={styles.sectionTitle}>Quiet Hours</Text>
      </View>
      
      <View style={styles.quietHoursContent}>
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>Enable Quiet Hours</Text>
            <Text style={styles.settingDescription}>
              Disable notifications during specified hours
            </Text>
          </View>
          <Switch
            value={settings.timing.quietHours}
            onValueChange={(value) => updateSetting('timing', 'quietHours', value)}
            trackColor={{ false: theme.colors.gray[300], true: theme.colors.gray[600] }}
            thumbColor={settings.timing.quietHours ? theme.colors.white : theme.colors.gray[500]}
          />
        </View>
        
        {settings.timing.quietHours && (
          <View style={styles.quietHoursTimes}>
            <View style={styles.timeSelector}>
              <Text style={styles.timeLabel}>From</Text>
              <TouchableOpacity style={styles.timeButton}>
                <Text style={styles.timeText}>{settings.timing.quietStart}</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.timeSelector}>
              <Text style={styles.timeLabel}>To</Text>
              <TouchableOpacity style={styles.timeButton}>
                <Text style={styles.timeText}>{settings.timing.quietEnd}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </Card>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading notification settings...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Notification Settings</Text>
          <Text style={styles.headerSubtitle}>
            Customize how and when you receive notifications
          </Text>
        </View>

        {/* General Settings */}
        {renderSettingsSection(
          'General',
          settings.general,
          'general',
          <BellIcon size={20} color={theme.colors.white} />,
          theme.colors.primary,
        )}

        {/* Reminder Settings */}
        {renderSettingsSection(
          'Reminders',
          settings.reminders,
          'reminders',
          <ClockIcon size={20} color={theme.colors.white} />,
          theme.colors.info,
        )}

        {/* Achievement Settings */}
        {renderSettingsSection(
          'Achievements',
          settings.achievements,
          'achievements',
          <AwardIcon size={20} color={theme.colors.white} />,
          theme.colors.warning,
        )}

        {/* Social Settings */}
        {renderSettingsSection(
          'Social',
          settings.social,
          'social',
          <StarIcon size={20} color={theme.colors.white} />,
          theme.colors.success,
        )}

        {/* Quiet Hours */}
        {renderQuietHours()}

        {/* Action Buttons */}
        {hasChanges && (
          <View style={styles.actionButtons}>
            <Button
              title="Cancel"
              onPress={handleCancel}
              variant="outline"
              style={styles.cancelButton}
            />
            <Button
              title="Save Settings"
              onPress={handleSave}
              style={styles.saveButton}
            />
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  loadingText: {
    fontSize: theme.fontSize.lg,
    color: theme.colors.gray[600],
  },
  scrollView: {
    flex: 1,
    padding: theme.spacing.lg,
  },
  header: {
    marginBottom: theme.spacing.lg,
  },
  headerTitle: {
    fontSize: theme.fontSize.xxl,
    fontWeight: 'bold',
    color: theme.colors.black,
    marginBottom: theme.spacing.xs,
  },
  headerSubtitle: {
    fontSize: theme.fontSize.md,
    color: theme.colors.gray[600],
  },
  settingsSection: {
    marginBottom: theme.spacing.lg,
    padding: theme.spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  sectionIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: '600',
    color: theme.colors.black,
  },
  settingsList: {
    gap: theme.spacing.md,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: '500',
    color: theme.colors.black,
    marginBottom: theme.spacing.xs,
  },
  settingDescription: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.gray[600],
    lineHeight: 16,
  },
  quietHoursCard: {
    marginBottom: theme.spacing.lg,
    padding: theme.spacing.lg,
  },
  quietHoursContent: {
    gap: theme.spacing.md,
  },
  quietHoursTimes: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginTop: theme.spacing.md,
  },
  timeSelector: {
    flex: 1,
  },
  timeLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.gray[600],
    marginBottom: theme.spacing.sm,
  },
  timeButton: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.gray[100],
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
  },
  timeText: {
    fontSize: theme.fontSize.md,
    fontWeight: '500',
    color: theme.colors.black,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginTop: theme.spacing.lg,
  },
  cancelButton: {
    flex: 1,
  },
  saveButton: {
    flex: 1,
  },
});
