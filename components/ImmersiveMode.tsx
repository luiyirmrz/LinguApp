// Immersive Mode Component - Full app UI in target language with adaptive content
// Provides complete language immersion experience with contextual learning
// Mobile-safe UI with proper safe area handling and responsive design

import React, { useState, useEffect, useCallback, memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Switch,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
// Lazy loaded: react-native-safe-area-context
import { theme } from '@/constants/theme';
import { useUnifiedAuth } from "@/hooks/useUnifiedAuth";
import { useSpacedRepetition } from '@/hooks/useSpacedRepetition';
import useEnhancedGamification from "@/hooks/useEnhancedGamification";
import {
  Globe,
  Languages,
  Settings,
  Eye,
  EyeOff,
  Volume2,
  VolumeX,
  Lightbulb,
  BookOpen,
  MessageCircle,
  Users,
  Target,
  Zap,
} from '@/components/icons/LucideReplacement';

// Immersive mode interfaces
interface ImmersiveModeSettings {
  enabled: boolean;
  targetLanguage: string;
  difficultyLevel: 'beginner' | 'intermediate' | 'advanced';
  showTranslations: boolean;
  audioEnabled: boolean;
  contextualHints: boolean;
  realWorldScenarios: boolean;
  socialInteraction: boolean;
}

interface LanguageContent {
  [key: string]: {
    navigation: Record<string, string>;
    common: Record<string, string>;
    scenarios: Record<string, string>;
    instructions: Record<string, string>;
  };
}

// Immersive language content
const immersiveContent: LanguageContent = {
  'hr': {
    navigation: {
      home: 'Početna',
      lessons: 'Lekcije',
      profile: 'Profil',
      leaderboard: 'Ljestvica',
      shop: 'Trgovina',
      settings: 'Postavke',
    },
    common: {
      welcome: 'Dobrodošli',
      continue: 'Nastavi',
      start: 'Počni',
      complete: 'Završi',
      excellent: 'Izvrsno',
      good: 'Dobro',
      tryAgain: 'Pokušaj ponovno',
    },
    scenarios: {
      restaurant: 'U restoranu',
      airport: 'Na aerodromu',
      shopping: 'Kupovanje',
      hotel: 'U hotelu',
      directions: 'Smjerovi',
    },
    instructions: {
      tapToSelect: 'Dodirnite za odabir',
      speakClearly: 'Govorite jasno',
      listenCarefully: 'Pažljivo slušajte',
      readAloud: 'Čitajte naglas',
    },
  },
  'es': {
    navigation: {
      home: 'Inicio',
      lessons: 'Lecciones',
      profile: 'Perfil',
      leaderboard: 'Clasificación',
      shop: 'Tienda',
      settings: 'Configuración',
    },
    common: {
      welcome: 'Bienvenido',
      continue: 'Continuar',
      start: 'Comenzar',
      complete: 'Completar',
      excellent: 'Excelente',
      good: 'Bien',
      tryAgain: 'Inténtalo de nuevo',
    },
    scenarios: {
      restaurant: 'En el restaurante',
      airport: 'En el aeropuerto',
      shopping: 'De compras',
      hotel: 'En el hotel',
      directions: 'Direcciones',
    },
    instructions: {
      tapToSelect: 'Toca para seleccionar',
      speakClearly: 'Habla claramente',
      listenCarefully: 'Escucha atentamente',
      readAloud: 'Lee en voz alta',
    },
  },
  'fr': {
    navigation: {
      home: 'Accueil',
      lessons: 'Leçons',
      profile: 'Profil',
      leaderboard: 'Classement',
      shop: 'Boutique',
      settings: 'Paramètres',
    },
    common: {
      welcome: 'Bienvenue',
      continue: 'Continuer',
      start: 'Commencer',
      complete: 'Terminer',
      excellent: 'Excellent',
      good: 'Bien',
      tryAgain: 'Réessayez',
    },
    scenarios: {
      restaurant: 'Au restaurant',
      airport: 'À l\'aéroport',
      shopping: 'Shopping',
      hotel: 'À l\'hôtel',
      directions: 'Directions',
    },
    instructions: {
      tapToSelect: 'Appuyez pour sélectionner',
      speakClearly: 'Parlez clairement',
      listenCarefully: 'Écoutez attentivement',
      readAloud: 'Lisez à haute voix',
    },
  },
};

// Main Immersive Mode Component
export const ImmersiveMode: React.FC = () => {
  const { user, signIn, signOut, signUp, resetPassword, updateUser } = useUnifiedAuth();
  const { getUIText } = useSpacedRepetition();
  const { awardXP, completeLesson, acceptChallenge, createChallenge, generateDailyChallenges, refreshStats } = useEnhancedGamification();
  const insets = useSafeAreaInsets();
  
  const [settings, setSettings] = useState<ImmersiveModeSettings>({
    enabled: false,
    targetLanguage: user?.currentLanguage?.code || 'hr',
    difficultyLevel: 'beginner',
    showTranslations: true,
    audioEnabled: true,
    contextualHints: true,
    realWorldScenarios: true,
    socialInteraction: false,
  });
  
  const [currentScenario, setCurrentScenario] = useState<string | null>(null);
  const [immersiveText, setImmersiveText] = useState<string>('');

  // Get immersive content for current language
  const getImmersiveText = useCallback((key: string, category: keyof LanguageContent[string] = 'common'): string => {
    const languageContent = immersiveContent[settings.targetLanguage];
    if (!languageContent || !languageContent[category]) {
      return key; // Fallback to key if translation not found
    }
    return languageContent[category][key] || key;
  }, [settings.targetLanguage]);

  // Toggle immersive mode
  const toggleImmersiveMode = useCallback(async () => {
    const newEnabled = !settings.enabled;
    
    if (newEnabled) {
      // Show confirmation dialog
      Alert.alert(
        getUIText('immersive.enable_title'),
        getUIText('immersive.enable_message'),
        [
          {
            text: getUIText('common.cancel'),
            style: 'cancel',
          },
          {
            text: getUIText('common.enable'),
            onPress: () => {
              setSettings(prev => ({ ...prev, enabled: true }));
              // Award XP for enabling immersive mode
              awardXP(25, 'immersive_mode_enabled');
            },
          },
        ],
      );
    } else {
      setSettings(prev => ({ ...prev, enabled: false }));
      setCurrentScenario(null);
    }
  }, [settings.enabled, getUIText, awardXP]);

  // Start real-world scenario
  const startScenario = useCallback((scenarioKey: string) => {
    setCurrentScenario(scenarioKey);
    
    // Generate contextual immersive text based on scenario
    const scenarioTexts = {
      restaurant: getImmersiveText('restaurant_welcome', 'scenarios'),
      airport: getImmersiveText('airport_checkin', 'scenarios'),
      shopping: getImmersiveText('shopping_greeting', 'scenarios'),
      hotel: getImmersiveText('hotel_reception', 'scenarios'),
      directions: getImmersiveText('directions_help', 'scenarios'),
    };
    
    setImmersiveText(scenarioTexts[scenarioKey as keyof typeof scenarioTexts] || '');
    
    // Award XP for starting scenario
    awardXP(10, 'scenario_started');
  }, [getImmersiveText, awardXP]);

  // Update setting
  const updateSetting = useCallback(<K extends keyof ImmersiveModeSettings>(
    key: K,
    value: ImmersiveModeSettings[K],
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: insets.bottom + theme.spacing.xl,
        }}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerIcon}>
            <Globe size={32} color={theme.colors.primary} />
          </View>
          <Text style={styles.headerTitle}>
            {settings.enabled ? getImmersiveText('immersive_mode') : getUIText('immersive.title')}
          </Text>
          <Text style={styles.headerSubtitle}>
            {settings.enabled ? getImmersiveText('full_immersion') : getUIText('immersive.subtitle')}
          </Text>
        </View>

        {/* Main Toggle */}
        <View style={styles.section}>
          <View style={styles.toggleCard}>
            <View style={styles.toggleContent}>
              <View style={styles.toggleInfo}>
                <Text style={styles.toggleTitle}>
                  {settings.enabled ? getImmersiveText('immersive_mode') : getUIText('immersive.enable_mode')}
                </Text>
                <Text style={styles.toggleDescription}>
                  {settings.enabled ? getImmersiveText('mode_active') : getUIText('immersive.enable_description')}
                </Text>
              </View>
              <Switch
                value={settings.enabled}
                onValueChange={toggleImmersiveMode}
                trackColor={{ false: theme.colors.gray[300], true: theme.colors.primaryLight }}
                thumbColor={settings.enabled ? theme.colors.primary : theme.colors.gray[500]}
              />
            </View>
          </View>
        </View>

        {/* Settings (only show when immersive mode is enabled) */}
        {settings.enabled && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {getImmersiveText('settings', 'navigation')}
            </Text>
            
            {/* Difficulty Level */}
            <SettingCard
              icon={<Target size={20} color={theme.colors.primary} />}
              title={getImmersiveText('difficulty_level')}
              description={getImmersiveText('adjust_complexity')}
              rightContent={
                <View style={styles.difficultySelector}>
                  {(['beginner', 'intermediate', 'advanced'] as const).map((level) => (
                    <Pressable
                      key={level}
                      style={[
                        styles.difficultyButton,
                        settings.difficultyLevel === level && styles.difficultyButtonActive,
                      ]}
                      onPress={() => updateSetting('difficultyLevel', level)}
                    >
                      <Text style={[
                        styles.difficultyButtonText,
                        settings.difficultyLevel === level && styles.difficultyButtonTextActive,
                      ]}>
                        {getImmersiveText(level)}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              }
            />

            {/* Show Translations */}
            <SettingCard
              icon={settings.showTranslations ? <Eye size={20} color={theme.colors.success} /> : <EyeOff size={20} color={theme.colors.textSecondary} />}
              title={getImmersiveText('show_translations')}
              description={getImmersiveText('translation_help')}
              rightContent={
                <Switch
                  value={settings.showTranslations}
                  onValueChange={(value) => updateSetting('showTranslations', value)}
                  trackColor={{ false: theme.colors.gray[300], true: theme.colors.success }}
                  thumbColor={settings.showTranslations ? theme.colors.success : theme.colors.gray[500]}
                />
              }
            />

            {/* Audio Enabled */}
            <SettingCard
              icon={settings.audioEnabled ? <Volume2 size={20} color={theme.colors.warning} /> : <VolumeX size={20} color={theme.colors.textSecondary} />}
              title={getImmersiveText('audio_enabled')}
              description={getImmersiveText('pronunciation_help')}
              rightContent={
                <Switch
                  value={settings.audioEnabled}
                  onValueChange={(value) => updateSetting('audioEnabled', value)}
                  trackColor={{ false: theme.colors.gray[300], true: theme.colors.warning }}
                  thumbColor={settings.audioEnabled ? theme.colors.warning : theme.colors.gray[500]}
                />
              }
            />

            {/* Contextual Hints */}
            <SettingCard
              icon={<Lightbulb size={20} color={settings.contextualHints ? theme.colors.secondary : theme.colors.textSecondary} />}
              title={getImmersiveText('contextual_hints')}
              description={getImmersiveText('smart_assistance')}
              rightContent={
                <Switch
                  value={settings.contextualHints}
                  onValueChange={(value) => updateSetting('contextualHints', value)}
                  trackColor={{ false: theme.colors.gray[300], true: theme.colors.secondary }}
                  thumbColor={settings.contextualHints ? theme.colors.secondary : theme.colors.gray[500]}
                />
              }
            />
          </View>
        )}

        {/* Real-World Scenarios */}
        {settings.enabled && settings.realWorldScenarios && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {getImmersiveText('real_world_scenarios')}
            </Text>
            
            <View style={styles.scenariosGrid}>
              {Object.keys(immersiveContent[settings.targetLanguage]?.scenarios || {}).map((scenarioKey) => (
                <ScenarioCard
                  key={scenarioKey}
                  title={getImmersiveText(scenarioKey, 'scenarios')}
                  description={getImmersiveText(`${scenarioKey}_description`)}
                  isActive={currentScenario === scenarioKey}
                  onPress={() => startScenario(scenarioKey)}
                />
              ))}
            </View>
          </View>
        )}

        {/* Current Scenario Display */}
        {currentScenario && immersiveText && (
          <View style={styles.section}>
            <View style={styles.scenarioDisplay}>
              <Text style={styles.scenarioTitle}>
                {getImmersiveText(currentScenario, 'scenarios')}
              </Text>
              <Text style={styles.scenarioText}>
                {immersiveText}
              </Text>
              {settings.showTranslations && (
                <Text style={styles.scenarioTranslation}>
                  {getUIText(`scenario.${currentScenario}.text`)}
                </Text>
              )}
              <Pressable
                style={styles.scenarioButton}
                onPress={() => setCurrentScenario(null)}
              >
                <Text style={styles.scenarioButtonText}>
                  {getImmersiveText('complete')}
                </Text>
              </Pressable>
            </View>
          </View>
        )}

        {/* Tips and Benefits */}
        {settings.enabled && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {getImmersiveText('immersion_tips')}
            </Text>
            
            <View style={styles.tipsContainer}>
              <TipCard
                icon={<BookOpen size={16} color={theme.colors.primary} />}
                text={getImmersiveText('tip_practice_daily')}
              />
              <TipCard
                icon={<MessageCircle size={16} color={theme.colors.success} />}
                text={getImmersiveText('tip_think_in_language')}
              />
              <TipCard
                icon={<Users size={16} color={theme.colors.warning} />}
                text={getImmersiveText('tip_social_interaction')}
              />
              <TipCard
                icon={<Zap size={16} color={theme.colors.secondary} />}
                text={getImmersiveText('tip_gradual_increase')}
              />
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

// Setting Card Component
const SettingCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
  rightContent: React.ReactNode;
}> = ({ icon, title, description, rightContent }) => {
  return (
    <View style={styles.settingCard}>
      <View style={styles.settingIcon}>
        <Text>{icon}</Text>
      </View>
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{title}</Text>
        <Text style={styles.settingDescription}>{description}</Text>
      </View>
      <View style={styles.settingRight}>
        <Text>{rightContent}</Text>
      </View>
    </View>
  );
};

// Scenario Card Component
const ScenarioCard: React.FC<{
  title: string;
  description: string;
  isActive: boolean;
  onPress: () => void;
}> = ({ title, description, isActive, onPress }) => {
  return (
    <Pressable
      style={[
        styles.scenarioCard,
        isActive && styles.scenarioCardActive,
      ]}
      onPress={onPress}
    >
      <Text style={[
        styles.scenarioCardTitle,
        isActive && styles.scenarioCardTitleActive,
      ]}>
        {title}
      </Text>
      <Text style={[
        styles.scenarioCardDescription,
        isActive && styles.scenarioCardDescriptionActive,
      ]}>
        {description}
      </Text>
    </Pressable>
  );
};

// Tip Card Component
const TipCard: React.FC<{
  icon: React.ReactNode;
  text: string;
}> = ({ icon, text }) => {
  return (
    <View style={styles.tipCard}>
      <View style={styles.tipIcon}>
        <Text>{icon}</Text>
      </View>
      <Text style={styles.tipText}>{text}</Text>
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    padding: theme.spacing.xl,
    paddingBottom: theme.spacing.lg,
  },
  headerIcon: {
    marginBottom: theme.spacing.md,
  },
  headerTitle: {
    fontSize: theme.fontSize.xxl,
    fontWeight: '700' as const,
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.xs,
  },
  headerSubtitle: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  section: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: '600' as const,
    color: theme.colors.text,
    marginBottom: theme.spacing.lg,
  },
  toggleCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: theme.spacing.lg,
  },
  toggleContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toggleInfo: {
    flex: 1,
    marginRight: theme.spacing.md,
  },
  toggleTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: '600' as const,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  toggleDescription: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  settingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  settingIcon: {
    marginRight: theme.spacing.md,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: '500' as const,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  settingDescription: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  settingRight: {
    marginLeft: theme.spacing.md,
  },
  difficultySelector: {
    flexDirection: 'row',
    backgroundColor: theme.colors.background,
    borderRadius: 8,
    padding: 2,
  },
  difficultyButton: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: 6,
  },
  difficultyButtonActive: {
    backgroundColor: theme.colors.primary,
  },
  difficultyButtonText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
  },
  difficultyButtonTextActive: {
    color: theme.colors.white,
    fontWeight: '500' as const,
  },
  scenariosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
  },
  scenarioCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: theme.spacing.md,
    width: '48%',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  scenarioCardActive: {
    backgroundColor: theme.colors.primaryLight,
    borderColor: theme.colors.primary,
  },
  scenarioCardTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: '600' as const,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  scenarioCardTitleActive: {
    color: theme.colors.primary,
  },
  scenarioCardDescription: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  scenarioCardDescriptionActive: {
    color: theme.colors.primary,
  },
  scenarioDisplay: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: theme.spacing.xl,
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  scenarioTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: '600' as const,
    color: theme.colors.primary,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  scenarioText: {
    fontSize: theme.fontSize.lg,
    color: theme.colors.text,
    textAlign: 'center',
    lineHeight: 28,
    marginBottom: theme.spacing.md,
  },
  scenarioTranslation: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: theme.spacing.lg,
  },
  scenarioButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 12,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    alignSelf: 'center',
  },
  scenarioButtonText: {
    fontSize: theme.fontSize.md,
    fontWeight: '600' as const,
    color: theme.colors.white,
  },
  tipsContainer: {
    gap: theme.spacing.md,
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: theme.spacing.md,
  },
  tipIcon: {
    marginRight: theme.spacing.md,
  },
  tipText: {
    flex: 1,
    fontSize: theme.fontSize.sm,
    color: theme.colors.text,
    lineHeight: 20,
  },
});

export default memo(ImmersiveMode);

ImmersiveMode.displayName = 'ImmersiveMode';
