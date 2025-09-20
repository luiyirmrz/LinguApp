import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';
import { Language } from '@/types';

// Mock languages data - replace with real data
const AVAILABLE_LANGUAGES: Language[] = [
  { id: 'en', code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸', level: 'beginner' },
  { id: 'es', code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸', level: 'beginner' },
  { id: 'fr', code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷', level: 'beginner' },
  { id: 'de', code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪', level: 'beginner' },
  { id: 'it', code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹', level: 'beginner' },
  { id: 'pt', code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇵🇹', level: 'beginner' },
  { id: 'ru', code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺', level: 'beginner' },
  { id: 'ja', code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵', level: 'beginner' },
  { id: 'ko', code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷', level: 'beginner' },
  { id: 'zh', code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳', level: 'beginner' },
  { id: 'ar', code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦', level: 'beginner' },
  { id: 'hi', code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳', level: 'beginner' },
  { id: 'hr', code: 'hr', name: 'Croatian', nativeName: 'Hrvatski', flag: '🇭🇷', level: 'beginner' },
  { id: 'pl', code: 'pl', name: 'Polish', nativeName: 'Polski', flag: '🇵🇱', level: 'beginner' },
  { id: 'nl', code: 'nl', name: 'Dutch', nativeName: 'Nederlands', flag: '🇳🇱', level: 'beginner' },
];

export default function OnboardingSetupScreen() {
  const router = useRouter();
  const { user, updateUser } = useUnifiedAuth();
  
  const [selectedNativeLanguage, setSelectedNativeLanguage] = useState<Language | null>(null);
  const [selectedTargetLanguage, setSelectedTargetLanguage] = useState<Language | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleCompleteSetup = useCallback(async () => {
    if (!selectedNativeLanguage || !selectedTargetLanguage) {
      Alert.alert('Error', 'Please select both your native language and the language you want to learn.');
      return;
    }

    if (selectedNativeLanguage.code === selectedTargetLanguage.code) {
      Alert.alert('Error', 'Your native language and target language cannot be the same.');
      return;
    }

    try {
      setIsLoading(true);
      
      // Update user with selected languages
      await updateUser({
        mainLanguage: selectedNativeLanguage,
        currentLanguage: selectedTargetLanguage,
        nativeLanguage: selectedNativeLanguage,
        onboardingCompleted: true,
        isNewUser: false, // Mark as no longer new
      });

      // Navigate to main app
      router.replace('/(tabs)/home');
    } catch (error) {
      console.error('Error completing setup:', error);
      Alert.alert('Error', 'Failed to complete setup. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [selectedNativeLanguage, selectedTargetLanguage, updateUser, router]);

  const renderLanguageSelector = (
    title: string,
    selectedLanguage: Language | null,
    onSelect: (language: Language) => void,
  ) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <ScrollView style={styles.languageList} showsVerticalScrollIndicator={false}>
        {AVAILABLE_LANGUAGES.map((language) => (
          <TouchableOpacity
            key={language.code}
            style={[
              styles.languageItem,
              selectedLanguage?.code === language.code && styles.selectedLanguageItem,
            ]}
            onPress={() => onSelect(language)}
          >
            <Text style={styles.languageFlag}>{language.flag}</Text>
            <View style={styles.languageInfo}>
              <Text style={[
                styles.languageName,
                selectedLanguage?.code === language.code && styles.selectedLanguageText,
              ]}>
                {language.name}
              </Text>
              <Text style={[
                styles.languageNativeName,
                selectedLanguage?.code === language.code && styles.selectedLanguageText,
              ]}>
                {language.nativeName}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Welcome to LinguApp! 🎉</Text>
        <Text style={styles.subtitle}>
          Let's set up your language learning journey
        </Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderLanguageSelector(
          "What's your native language?",
          selectedNativeLanguage,
          setSelectedNativeLanguage,
        )}

        {renderLanguageSelector(
          'What language would you like to learn?',
          selectedTargetLanguage,
          setSelectedTargetLanguage,
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.completeButton,
            (!selectedNativeLanguage || !selectedTargetLanguage || isLoading) && styles.disabledButton,
          ]}
          onPress={handleCompleteSetup}
          disabled={!selectedNativeLanguage || !selectedTargetLanguage || isLoading}
        >
          <Text style={styles.completeButtonText}>
            {isLoading ? 'Setting up...' : 'Complete Setup'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    padding: 24,
    paddingTop: 60,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6c757d',
    lineHeight: 24,
  },
  content: {
    flex: 1,
    padding: 24,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 16,
  },
  languageList: {
    maxHeight: 300,
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  selectedLanguageItem: {
    borderColor: '#007bff',
    backgroundColor: '#f8f9ff',
  },
  languageFlag: {
    fontSize: 24,
    marginRight: 16,
  },
  languageInfo: {
    flex: 1,
  },
  languageName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 2,
  },
  languageNativeName: {
    fontSize: 14,
    color: '#6c757d',
  },
  selectedLanguageText: {
    color: '#007bff',
  },
  footer: {
    padding: 24,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  completeButton: {
    backgroundColor: '#007bff',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#6c757d',
  },
  completeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
