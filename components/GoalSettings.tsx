import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  TextInput,
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
  TargetIcon, 
  CalendarIcon, 
  ClockIcon, 
  StarIcon, 
  BookOpenIcon,
  FlameIcon,
  TrendingUpIcon,
  CheckIcon,
  XIcon,
  EditIcon,
  SaveIcon,
} from '@/components/icons/LucideReplacement';

const { width } = Dimensions.get('window');

interface GoalSettings {
  dailyGoals: {
    lessons: number;
    words: number;
    studyTime: number; // in minutes
    xp: number;
  };
  weeklyGoals: {
    lessons: number;
    words: number;
    studyTime: number; // in minutes
    xp: number;
  };
  monthlyGoals: {
    lessons: number;
    words: number;
    studyTime: number; // in minutes
    xp: number;
  };
  studyDays: string[];
  reminderTime: string;
  notificationsEnabled: boolean;
  streakGoal: number;
}

interface GoalSettingsProps {
  onSave?: (settings: GoalSettings) => void;
  onCancel?: () => void;
}

export default function GoalSettings({
  onSave,
  onCancel,
}: GoalSettingsProps) {
  const { t } = useI18n();
  const { user, signIn, signOut, signUp, resetPassword, updateUser } = useUnifiedAuth();
  const { getUserProgress } = useGameState();

  const [settings, setSettings] = useState<GoalSettings>({
    dailyGoals: {
      lessons: 1,
      words: 5,
      studyTime: 15,
      xp: 50,
    },
    weeklyGoals: {
      lessons: 7,
      words: 35,
      studyTime: 105,
      xp: 350,
    },
    monthlyGoals: {
      lessons: 30,
      words: 150,
      studyTime: 450,
      xp: 1500,
    },
    studyDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
    reminderTime: '19:00',
    notificationsEnabled: true,
    streakGoal: 7,
  });

  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  const studyDaysOptions = [
    { key: 'monday', label: 'Monday' },
    { key: 'tuesday', label: 'Tuesday' },
    { key: 'wednesday', label: 'Wednesday' },
    { key: 'thursday', label: 'Thursday' },
    { key: 'friday', label: 'Friday' },
    { key: 'saturday', label: 'Saturday' },
    { key: 'sunday', label: 'Sunday' },
  ];

  const timeOptions = [
    '06:00', '07:00', '08:00', '09:00', '10:00',
    '11:00', '12:00', '13:00', '14:00', '15:00',
    '16:00', '17:00', '18:00', '19:00', '20:00',
    '21:00', '22:00',
  ];

  useEffect(() => {
    loadUserSettings();
  }, []);

  const loadUserSettings = async () => {
    try {
      setLoading(true);
      
      if (!user) return;

      const userProgress = await getUserProgress(user.id);
      
      if (userProgress.goalSettings) {
        setSettings(userProgress.goalSettings);
      }

    } catch (error) {
      console.error('Error loading goal settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      // Save settings to user profile
      if (onSave) {
        onSave(settings);
      }
      
      setEditing(false);
      Alert.alert('Success', 'Goal settings saved successfully!');
    } catch (error) {
      console.error('Error saving goal settings:', error);
      Alert.alert('Error', 'Failed to save goal settings. Please try again.');
    }
  };

  const handleCancel = () => {
    setEditing(false);
    if (onCancel) {
      onCancel();
    }
  };

  const updateDailyGoal = (field: keyof GoalSettings['dailyGoals'], value: number) => {
    setSettings(prev => ({
      ...prev,
      dailyGoals: {
        ...prev.dailyGoals,
        [field]: value,
      },
    }));
  };

  const updateWeeklyGoal = (field: keyof GoalSettings['weeklyGoals'], value: number) => {
    setSettings(prev => ({
      ...prev,
      weeklyGoals: {
        ...prev.weeklyGoals,
        [field]: value,
      },
    }));
  };

  const updateMonthlyGoal = (field: keyof GoalSettings['monthlyGoals'], value: number) => {
    setSettings(prev => ({
      ...prev,
      monthlyGoals: {
        ...prev.monthlyGoals,
        [field]: value,
      },
    }));
  };

  const toggleStudyDay = (day: string) => {
    setSettings(prev => ({
      ...prev,
      studyDays: prev.studyDays.includes(day)
        ? prev.studyDays.filter(d => d !== day)
        : [...prev.studyDays, day],
    }));
  };

  const renderGoalInput = (
    label: string,
    value: number,
    onChange: (value: number) => void,
    icon: React.ReactNode,
    color: string,
    unit?: string,
  ) => (
    <View style={styles.goalInputContainer}>
      <View style={styles.goalInputHeader}>
        <View style={[styles.goalInputIcon, { backgroundColor: color }]}>
          {icon}
        </View>
        <Text style={styles.goalInputLabel}>{label}</Text>
      </View>
      
      {editing ? (
        <View style={styles.goalInputRow}>
          <TouchableOpacity
            style={styles.goalInputButton}
            onPress={() => onChange(Math.max(0, value - 1))}
          >
            <XIcon size={16} color={theme.colors.gray[600]} />
          </TouchableOpacity>
          
          <TextInput
            style={styles.goalInput}
            value={value.toString()}
            onChangeText={(text) => {
              const num = parseInt(text) || 0;
              onChange(Math.max(0, num));
            }}
            keyboardType="numeric"
            selectTextOnFocus
          />
          
          <TouchableOpacity
            style={styles.goalInputButton}
            onPress={() => onChange(value + 1)}
          >
            <CheckIcon size={16} color={theme.colors.gray[600]} />
          </TouchableOpacity>
        </View>
      ) : (
        <Text style={styles.goalInputValue}>
          {value} {unit}
        </Text>
      )}
    </View>
  );

  const renderGoalSection = (
    title: string,
    goals: GoalSettings['dailyGoals'] | GoalSettings['weeklyGoals'] | GoalSettings['monthlyGoals'],
    updateFunction: (field: any, value: number) => void,
  ) => (
    <Card style={styles.goalSection}>
      <Text style={styles.goalSectionTitle}>{title}</Text>
      
      <View style={styles.goalInputsGrid}>
        {renderGoalInput(
          'Lessons',
          goals.lessons,
          (value) => updateFunction('lessons', value),
          <BookOpenIcon size={20} color={theme.colors.white} />,
          theme.colors.primary,
        )}
        
        {renderGoalInput(
          'Words',
          goals.words,
          (value) => updateFunction('words', value),
          <StarIcon size={20} color={theme.colors.white} />,
          theme.colors.success,
        )}
        
        {renderGoalInput(
          'Study Time',
          goals.studyTime,
          (value) => updateFunction('studyTime', value),
          <ClockIcon size={20} color={theme.colors.white} />,
          theme.colors.info,
          'min',
        )}
        
        {renderGoalInput(
          'XP',
          goals.xp,
          (value) => updateFunction('xp', value),
          <TrendingUpIcon size={20} color={theme.colors.white} />,
          theme.colors.warning,
        )}
      </View>
    </Card>
  );

  const renderStudyDays = () => (
    <Card style={styles.studyDaysCard}>
      <Text style={styles.studyDaysTitle}>Study Days</Text>
      <Text style={styles.studyDaysSubtitle}>Choose which days you want to study</Text>
      
      <View style={styles.studyDaysGrid}>
        {studyDaysOptions.map((day) => (
          <TouchableOpacity
            key={day.key}
            style={[
              styles.studyDayButton,
              settings.studyDays.includes(day.key) && styles.studyDayButtonActive,
            ]}
            onPress={() => toggleStudyDay(day.key)}
            disabled={!editing}
          >
            <Text style={[
              styles.studyDayText,
              settings.studyDays.includes(day.key) && styles.studyDayTextActive,
            ]}>
              {day.label.slice(0, 3)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </Card>
  );

  const renderReminderSettings = () => (
    <Card style={styles.reminderCard}>
      <Text style={styles.reminderTitle}>Daily Reminder</Text>
      
      <View style={styles.reminderRow}>
        <View style={styles.reminderInfo}>
          <Text style={styles.reminderLabel}>Notification Time</Text>
          <Text style={styles.reminderSubtitle}>When to remind you to study</Text>
        </View>
        
        <View style={styles.reminderControls}>
          <Switch
            value={settings.notificationsEnabled}
            onValueChange={(value) => setSettings(prev => ({ ...prev, notificationsEnabled: value }))}
            trackColor={{ false: theme.colors.gray[300], true: theme.colors.primary }}
            thumbColor={settings.notificationsEnabled ? theme.colors.white : theme.colors.gray[500]}
          />
        </View>
      </View>
      
      {settings.notificationsEnabled && (
        <View style={styles.timeSelector}>
          <Text style={styles.timeSelectorLabel}>Reminder Time</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.timeOptions}>
              {timeOptions.map((time) => (
                <TouchableOpacity
                  key={time}
                  style={[
                    styles.timeOption,
                    settings.reminderTime === time && styles.timeOptionActive,
                  ]}
                  onPress={() => setSettings(prev => ({ ...prev, reminderTime: time }))}
                  disabled={!editing}
                >
                  <Text style={[
                    styles.timeOptionText,
                    settings.reminderTime === time && styles.timeOptionTextActive,
                  ]}>
                    {time}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
      )}
    </Card>
  );

  const renderStreakGoal = () => (
    <Card style={styles.streakGoalCard}>
      <Text style={styles.streakGoalTitle}>Streak Goal</Text>
      <Text style={styles.streakGoalSubtitle}>Target streak length</Text>
      
      <View style={styles.streakGoalRow}>
        <View style={styles.streakGoalIcon}>
          <FlameIcon size={24} color={theme.colors.warning} />
        </View>
        
        <View style={styles.streakGoalInfo}>
          <Text style={styles.streakGoalLabel}>Target Streak</Text>
          <Text style={styles.streakGoalValue}>{settings.streakGoal} days</Text>
        </View>
        
        {editing && (
          <View style={styles.streakGoalControls}>
            <TouchableOpacity
              style={styles.streakGoalButton}
              onPress={() => setSettings(prev => ({ ...prev, streakGoal: Math.max(1, prev.streakGoal - 1) }))}
            >
              <XIcon size={16} color={theme.colors.gray[600]} />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.streakGoalButton}
              onPress={() => setSettings(prev => ({ ...prev, streakGoal: prev.streakGoal + 1 }))}
            >
              <CheckIcon size={16} color={theme.colors.gray[600]} />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </Card>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading goal settings...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Goal Settings</Text>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => setEditing(!editing)}
          >
            {editing ? (
              <XIcon size={24} color={theme.colors.primary} />
            ) : (
              <EditIcon size={24} color={theme.colors.primary} />
            )}
          </TouchableOpacity>
        </View>

        {/* Daily Goals */}
        {renderGoalSection('Daily Goals', settings.dailyGoals, updateDailyGoal)}

        {/* Weekly Goals */}
        {renderGoalSection('Weekly Goals', settings.weeklyGoals, updateWeeklyGoal)}

        {/* Monthly Goals */}
        {renderGoalSection('Monthly Goals', settings.monthlyGoals, updateMonthlyGoal)}

        {/* Study Days */}
        {renderStudyDays()}

        {/* Reminder Settings */}
        {renderReminderSettings()}

        {/* Streak Goal */}
        {renderStreakGoal()}

        {/* Action Buttons */}
        {editing && (
          <View style={styles.actionButtons}>
            <Button
              title="Cancel"
              onPress={handleCancel}
              variant="outline"
              style={styles.cancelButton}
            />
            <Button
              title="Save Goals"
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  headerTitle: {
    fontSize: theme.fontSize.xxl,
    fontWeight: 'bold',
    color: theme.colors.black,
  },
  editButton: {
    padding: theme.spacing.sm,
  },
  goalSection: {
    marginBottom: theme.spacing.lg,
    padding: theme.spacing.lg,
  },
  goalSectionTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: '600',
    color: theme.colors.black,
    marginBottom: theme.spacing.lg,
  },
  goalInputsGrid: {
    gap: theme.spacing.md,
  },
  goalInputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.gray[50],
    borderRadius: theme.borderRadius.lg,
  },
  goalInputHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  goalInputIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  goalInputLabel: {
    fontSize: theme.fontSize.md,
    fontWeight: '500',
    color: theme.colors.black,
  },
  goalInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  goalInputButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.gray[300],
  },
  goalInput: {
    width: 60,
    height: 32,
    textAlign: 'center',
    fontSize: theme.fontSize.md,
    fontWeight: '600',
    color: theme.colors.black,
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.gray[300],
  },
  goalInputValue: {
    fontSize: theme.fontSize.md,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  studyDaysCard: {
    marginBottom: theme.spacing.lg,
    padding: theme.spacing.lg,
  },
  studyDaysTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: '600',
    color: theme.colors.black,
    marginBottom: theme.spacing.xs,
  },
  studyDaysSubtitle: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.gray[600],
    marginBottom: theme.spacing.lg,
  },
  studyDaysGrid: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  studyDayButton: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.gray[100],
    alignItems: 'center',
  },
  studyDayButtonActive: {
    backgroundColor: theme.colors.primary,
  },
  studyDayText: {
    fontSize: theme.fontSize.sm,
    fontWeight: '500',
    color: theme.colors.gray[600],
  },
  studyDayTextActive: {
    color: theme.colors.white,
  },
  reminderCard: {
    marginBottom: theme.spacing.lg,
    padding: theme.spacing.lg,
  },
  reminderTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: '600',
    color: theme.colors.black,
    marginBottom: theme.spacing.lg,
  },
  reminderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  reminderInfo: {
    flex: 1,
  },
  reminderLabel: {
    fontSize: theme.fontSize.md,
    fontWeight: '500',
    color: theme.colors.black,
    marginBottom: theme.spacing.xs,
  },
  reminderSubtitle: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.gray[600],
  },
  reminderControls: {
    marginLeft: theme.spacing.md,
  },
  timeSelector: {
    marginTop: theme.spacing.md,
  },
  timeSelectorLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.gray[600],
    marginBottom: theme.spacing.sm,
  },
  timeOptions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  timeOption: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.gray[100],
  },
  timeOptionActive: {
    backgroundColor: theme.colors.primary,
  },
  timeOptionText: {
    fontSize: theme.fontSize.sm,
    fontWeight: '500',
    color: theme.colors.gray[600],
  },
  timeOptionTextActive: {
    color: theme.colors.white,
  },
  streakGoalCard: {
    marginBottom: theme.spacing.lg,
    padding: theme.spacing.lg,
  },
  streakGoalTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: '600',
    color: theme.colors.black,
    marginBottom: theme.spacing.xs,
  },
  streakGoalSubtitle: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.gray[600],
    marginBottom: theme.spacing.lg,
  },
  streakGoalRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  streakGoalIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: theme.colors.warningLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  streakGoalInfo: {
    flex: 1,
  },
  streakGoalLabel: {
    fontSize: theme.fontSize.md,
    fontWeight: '500',
    color: theme.colors.black,
    marginBottom: theme.spacing.xs,
  },
  streakGoalValue: {
    fontSize: theme.fontSize.lg,
    fontWeight: '600',
    color: theme.colors.warning,
  },
  streakGoalControls: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  streakGoalButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
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
