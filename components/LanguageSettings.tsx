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
import { useLanguage } from '@/hooks/useLanguage';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Badge } from '@/components/Badge';
import { 
  GlobeIcon, 
  CheckIcon, 
  XIcon, 
  StarIcon, 
  BookOpenIcon,
  TargetIcon,
  SettingsIcon,
  SaveIcon,
  PlusIcon,
  TrashIcon,
} from '@/components/icons/LucideReplacement';
import { Language } from '@/types';

const { width } = Dimensions.get('window');

interface LanguageSettings {
  uiLanguage: string;
  nativeLanguage: string;
  learningLanguages: string[];
  autoTranslate: boolean;
  pronunciation: boolean;
  subtitles: boolean;
  difficulty: 'easy' | 'medium' | 'hard';
  immersionMode: boolean;
}

interface LanguageSettingsProps {
  onSave?: (settings: LanguageSettings) => void;
  onCancel?: () => void;
}

export default function LanguageSettings({
  onSave,
  onCancel,
}: LanguageSettingsProps) {
  const { t } = useI18n();
  const { user, signIn, signOut, signUp, resetPassword, updateUser } = useUnifiedAuth();
  const { getUserProgress } = useGameState();
  const { availableLanguages, currentUILanguage, changeUILanguage } = useLanguage();

  const [settings, setSettings] = useState<LanguageSettings>({
    uiLanguage: 'en',
    nativeLanguage: 'en',
    learningLanguages: ['es'],
    autoTranslate: true,
    pronunciation: true,
    subtitles: true,
    difficulty: 'medium',
    immersionMode: false,
  });

  const [loading, setLoading] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);

  const difficultyOptions = [
    { key: 'easy', label: 'Easy', description: 'More hints and slower pace' },
    { key: 'medium', label: 'Medium', description: 'Balanced learning experience' },
    { key: 'hard', label: 'Hard', description: 'Challenging and immersive' },
  ];

  useEffect(() => {
    loadLanguageSettings();
  }, []);

  const loadLanguageSettings = async () => {
    try {
      setLoading(true);
      
      if (!user) return;

      const userProgress = await getUserProgress(user.id);
      
      if (userProgress.languageSettings) {
        setSettings(userProgress.languageSettings);
      } else {
        // Set default settings based on user preferences
        setSettings({
          uiLanguage: currentUILanguage?.code || 'en',
          nativeLanguage: user.nativeLanguage?.code || 'en',
          learningLanguages: user.currentLanguage ? [user.currentLanguage.code] : ['es'],
          autoTranslate: true,
          pronunciation: true,
          subtitles: true,
          difficulty: 'medium',
          immersionMode: false,
        });
      }

    } catch (error) {
      console.error('Error loading language settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      if (onSave) {
        onSave(settings);
      }
      
      // Update UI language if changed
      if (settings.uiLanguage !== currentUILanguage?.code) {
        const newLanguage = availableLanguages.find(lang => lang.code === settings.uiLanguage);
        if (newLanguage) {
          await changeUILanguage(newLanguage);
        }
      }
      
      setHasChanges(false);
      Alert.alert('Success', 'Language settings saved successfully!');
    } catch (error) {
      console.error('Error saving language settings:', error);
      Alert.alert('Error', 'Failed to save language settings. Please try again.');
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

  const updateSetting = (field: keyof LanguageSettings, value: any) => {
    setSettings(prev => ({
      ...prev,
      [field]: value,
    }));
    setHasChanges(true);
  };

  const toggleLearningLanguage = (languageCode: string) => {
    const currentLanguages = settings.learningLanguages;
    const newLanguages = currentLanguages.includes(languageCode)
      ? currentLanguages.filter(code => code !== languageCode)
      : [...currentLanguages, languageCode];
    
    updateSetting('learningLanguages', newLanguages);
  };

  const renderLanguageOption = (
    language: Language,
    isSelected: boolean,
    onPress: () => void,
    showFlag: boolean = true,
  ) => (
    <TouchableOpacity
      key={language.code}
      style={[
        styles.languageOption,
        isSelected && styles.languageOptionSelected,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.languageInfo}>
        {showFlag && (
          <Text style={styles.languageFlag}>{language.flag}</Text>
        )}
        <View style={styles.languageDetails}>
          <Text style={[
            styles.languageName,
            isSelected && styles.languageNameSelected,
          ]}>
            {language.name}
          </Text>
          <Text style={[
            styles.languageCode,
            isSelected && styles.languageCodeSelected,
          ]}>
            {language.nativeName}
          </Text>
        </View>
      </View>
      
      {isSelected && (
        <View style={styles.selectedIndicator}>
          <CheckIcon size={20} color={theme.colors.primary} />
        </View>
      )}
    </TouchableOpacity>
  );

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

  const renderDifficultyOption = (option: any) => (
    <TouchableOpacity
      key={option.key}
      style={[
        styles.difficultyOption,
        settings.difficulty === option.key && styles.difficultyOptionSelected,
      ]}
      onPress={() => updateSetting('difficulty', option.key)}
    >
      <View style={styles.difficultyInfo}>
        <Text style={[
          styles.difficultyLabel,
          settings.difficulty === option.key && styles.difficultyLabelSelected,
        ]}>
          {option.label}
        </Text>
        <Text style={[
          styles.difficultyDescription,
          settings.difficulty === option.key && styles.difficultyDescriptionSelected,
        ]}>
          {option.description}
        </Text>
      </View>
      
      {settings.difficulty === option.key && (
        <View style={styles.selectedIndicator}>
          <CheckIcon size={20} color={theme.colors.primary} />
        </View>
      )}
    </TouchableOpacity>
  );

  const renderUILanguageSection = () => (
    <Card style={styles.settingsSection}>
      <View style={styles.sectionHeader}>
        <View style={[styles.sectionIcon, { backgroundColor: theme.colors.primary }]}>
          <GlobeIcon size={20} color={theme.colors.white} />
        </View>
        <Text style={styles.sectionTitle}>Interface Language</Text>
      </View>
      
      <Text style={styles.sectionDescription}>
        Choose the language for the app interface
      </Text>
      
      <View style={styles.languageList}>
        {availableLanguages.map((language) =>
          renderLanguageOption(
            language,
            settings.uiLanguage === language.code,
            () => updateSetting('uiLanguage', language.code),
          ),
        )}
      </View>
    </Card>
  );

  const renderNativeLanguageSection = () => (
    <Card style={styles.settingsSection}>
      <View style={styles.sectionHeader}>
        <View style={[styles.sectionIcon, { backgroundColor: theme.colors.success }]}>
          <StarIcon size={20} color={theme.colors.white} />
        </View>
        <Text style={styles.sectionTitle}>Native Language</Text>
      </View>
      
      <Text style={styles.sectionDescription}>
        Your primary language for better learning experience
      </Text>
      
      <View style={styles.languageList}>
        {availableLanguages.map((language) =>
          renderLanguageOption(
            language,
            settings.nativeLanguage === language.code,
            () => updateSetting('nativeLanguage', language.code),
          ),
        )}
      </View>
    </Card>
  );

  const renderLearningLanguagesSection = () => (
    <Card style={styles.settingsSection}>
      <View style={styles.sectionHeader}>
        <View style={[styles.sectionIcon, { backgroundColor: theme.colors.warning }]}>
          <BookOpenIcon size={20} color={theme.colors.white} />
        </View>
        <Text style={styles.sectionTitle}>Learning Languages</Text>
      </View>
      
      <Text style={styles.sectionDescription}>
        Select the languages you want to learn
      </Text>
      
      <View style={styles.languageList}>
        {availableLanguages
          .filter(lang => lang.code !== settings.nativeLanguage)
          .map((language) =>
            renderLanguageOption(
              language,
              settings.learningLanguages.includes(language.code),
              () => toggleLearningLanguage(language.code),
            ),
          )}
      </View>
    </Card>
  );

  const renderLearningSettingsSection = () => (
    <Card style={styles.settingsSection}>
      <View style={styles.sectionHeader}>
        <View style={[styles.sectionIcon, { backgroundColor: theme.colors.info }]}>
          <SettingsIcon size={20} color={theme.colors.white} />
        </View>
        <Text style={styles.sectionTitle}>Learning Settings</Text>
      </View>
      
      <View style={styles.settingsList}>
        {renderToggleSetting(
          'Auto Translate',
          'Automatically translate words and phrases',
          settings.autoTranslate,
          (value) => updateSetting('autoTranslate', value),
          <GlobeIcon size={20} color={theme.colors.white} />,
          theme.colors.primary,
        )}
        
        {renderToggleSetting(
          'Pronunciation',
          'Enable pronunciation audio for words',
          settings.pronunciation,
          (value) => updateSetting('pronunciation', value),
          <StarIcon size={20} color={theme.colors.white} />,
          theme.colors.success,
        )}
        
        {renderToggleSetting(
          'Subtitles',
          'Show subtitles in videos and audio',
          settings.subtitles,
          (value) => updateSetting('subtitles', value),
          <BookOpenIcon size={20} color={theme.colors.white} />,
          theme.colors.info,
        )}
        
        {renderToggleSetting(
          'Immersion Mode',
          'Hide translations to challenge yourself',
          settings.immersionMode,
          (value) => updateSetting('immersionMode', value),
          <TargetIcon size={20} color={theme.colors.white} />,
          theme.colors.warning,
        )}
      </View>
    </Card>
  );

  const renderDifficultySection = () => (
    <Card style={styles.settingsSection}>
      <View style={styles.sectionHeader}>
        <View style={[styles.sectionIcon, { backgroundColor: theme.colors.danger }]}>
          <TargetIcon size={20} color={theme.colors.white} />
        </View>
        <Text style={styles.sectionTitle}>Difficulty Level</Text>
      </View>
      
      <Text style={styles.sectionDescription}>
        Choose your preferred learning difficulty
      </Text>
      
      <View style={styles.difficultyList}>
        {difficultyOptions.map(renderDifficultyOption)}
      </View>
    </Card>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading language settings...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Language Settings</Text>
          <Text style={styles.headerSubtitle}>
            Customize your language learning experience
          </Text>
        </View>

        {/* UI Language */}
        {renderUILanguageSection()}

        {/* Native Language */}
        {renderNativeLanguageSection()}

        {/* Learning Languages */}
        {renderLearningLanguagesSection()}

        {/* Learning Settings */}
        {renderLearningSettingsSection()}

        {/* Difficulty Level */}
        {renderDifficultySection()}

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
    marginBottom: theme.spacing.sm,
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
  sectionDescription: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.gray[600],
    marginBottom: theme.spacing.lg,
    lineHeight: 18,
  },
  languageList: {
    gap: theme.spacing.sm,
  },
  languageOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.gray[50],
    borderRadius: theme.borderRadius.lg,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  languageOptionSelected: {
    backgroundColor: theme.colors.primaryLight,
    borderColor: theme.colors.primary,
  },
  languageInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  languageFlag: {
    fontSize: 24,
    marginRight: theme.spacing.md,
  },
  languageDetails: {
    flex: 1,
  },
  languageName: {
    fontSize: theme.fontSize.md,
    fontWeight: '500',
    color: theme.colors.black,
    marginBottom: theme.spacing.xs,
  },
  languageNameSelected: {
    color: theme.colors.primary,
  },
  languageCode: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.gray[600],
  },
  languageCodeSelected: {
    color: theme.colors.primary,
  },
  selectedIndicator: {
    marginLeft: theme.spacing.md,
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
  difficultyList: {
    gap: theme.spacing.sm,
  },
  difficultyOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.gray[50],
    borderRadius: theme.borderRadius.lg,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  difficultyOptionSelected: {
    backgroundColor: theme.colors.primaryLight,
    borderColor: theme.colors.primary,
  },
  difficultyInfo: {
    flex: 1,
  },
  difficultyLabel: {
    fontSize: theme.fontSize.md,
    fontWeight: '500',
    color: theme.colors.black,
    marginBottom: theme.spacing.xs,
  },
  difficultyLabelSelected: {
    color: theme.colors.primary,
  },
  difficultyDescription: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.gray[600],
  },
  difficultyDescriptionSelected: {
    color: theme.colors.primary,
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
