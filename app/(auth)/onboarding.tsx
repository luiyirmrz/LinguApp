import React, { useState } from 'react';
import {
  View, 
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '@/components/Button';
import { theme } from '@/constants/theme';

export default function OnboardingScreen() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');

  const steps = [
    {
      title: 'Welcome to LinguApp!',
      subtitle: "Let's personalize your learning experience",
      content: "We'll ask you a few questions to customize your language learning journey.",
    },
    {
      title: 'What language do you want to learn?',
      subtitle: 'Choose Your Languages',
      content: "Select the language you'd like to focus on.",
    },
    {
      title: "What's your current level?",
      subtitle: 'Help us understand your starting point',
      content: 'This helps us provide the right level of content for you.',
    },
    {
      title: "You're all set!",
      subtitle: 'Ready to start learning?',
      content: "Let's begin your language learning journey!",
    },
  ];

  const languages = [
    { id: 'spanish', name: 'Spanish', flag: '🇪🇸' },
    { id: 'french', name: 'French', flag: '🇫🇷' },
    { id: 'german', name: 'German', flag: '🇩🇪' },
    { id: 'italian', name: 'Italian', flag: '🇮🇹' },
    { id: 'portuguese', name: 'Portuguese', flag: '🇵🇹' },
    { id: 'japanese', name: 'Japanese', flag: '🇯🇵' },
    { id: 'croatian', name: 'Croatian', flag: '🇭🇷' },
  ];

  const levels = [
    { id: 'beginner', name: 'Beginner', description: 'I know a few words' },
    { id: 'elementary', name: 'Elementary', description: 'I can form basic sentences' },
    { id: 'intermediate', name: 'Intermediate', description: 'I can have conversations' },
    { id: 'advanced', name: 'Advanced', description: 'I can discuss complex topics' },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Complete onboarding
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    // For demo purposes, navigate to tabs
    router.replace('/(tabs)/home');
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepText}>{steps[currentStep].content}</Text>
          </View>
        );

      case 1:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepText}>{steps[currentStep].content}</Text>
            <View style={styles.optionsContainer}>
              {languages.map((language) => (
                <TouchableOpacity
                  key={language.id}
                  style={[
                    styles.option,
                    selectedLanguage === language.id ? styles.selectedOption : null,
                  ]}
                  onPress={() => setSelectedLanguage(language.id)}
                >
                  <Text style={styles.optionEmoji}>{language.flag}</Text>
                  <Text style={styles.optionText}>{language.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );

      case 2:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepText}>{steps[currentStep].content}</Text>
            <View style={styles.optionsContainer}>
              {levels.map((level) => (
                <TouchableOpacity
                  key={level.id}
                  style={[
                    styles.option,
                    selectedLevel === level.id ? styles.selectedOption : null,
                  ]}
                  onPress={() => setSelectedLevel(level.id)}
                >
                  <Text style={styles.optionText}>{level.name}</Text>
                  <Text style={styles.optionDescription}>{level.description}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );

      case 3:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepText}>{steps[currentStep].content}</Text>
            {selectedLanguage && (
              <Text style={styles.summaryText}>
                You'll be learning {languages.find(l => l.id === selectedLanguage)?.name} at {levels.find(l => l.id === selectedLevel)?.name} level.
              </Text>
            )}
          </View>
        );

      default:
        return null;
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return selectedLanguage !== '';
      case 2:
        return selectedLevel !== '';
      default:
        return true;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Progress Indicator */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${((currentStep + 1) / steps.length) * 100}%` },
              ]} 
            />
          </View>
          <Text style={styles.progressText}>
            Step {currentStep + 1} of {steps.length}
          </Text>
        </View>

        {/* Step Content */}
        <View style={styles.content}>
          <Text style={styles.title}>{steps[currentStep].title}</Text>
          <Text style={styles.subtitle}>{steps[currentStep].subtitle}</Text>
          
          {renderStepContent()}
        </View>

        {/* Navigation Buttons */}
        <View style={styles.navigation}>
          {currentStep > 0 && (
            <Button
              title="Back"
              onPress={handleBack}
              variant="outline"
              style={styles.backButton}
            />
          )}
          
          <Button
            title={currentStep === steps.length - 1 ? 'Get Started' : 'Next'}
            onPress={handleNext}
            disabled={!canProceed()}
            style={styles.nextButton}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    padding: theme.spacing.lg,
  },
  progressContainer: {
    marginBottom: theme.spacing.xl,
  },
  progressBar: {
    height: 4,
    backgroundColor: theme.colors.border,
    borderRadius: 2,
    marginBottom: theme.spacing.sm,
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.primary,
    borderRadius: 2,
  },
  progressText: {
    textAlign: 'center',
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.sm,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: theme.fontSize.xxl,
    fontWeight: 'bold',
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    fontSize: theme.fontSize.lg,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
  },
  stepContent: {
    flex: 1,
    alignItems: 'center',
  },
  stepText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: theme.spacing.xl,
  },
  summaryText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.primary,
    textAlign: 'center',
    fontWeight: '600',
    marginTop: theme.spacing.lg,
  },
  optionsContainer: {
    width: '100%',
    gap: theme.spacing.md,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.surface,
  },
  selectedOption: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primaryLight,
  },
  optionEmoji: {
    fontSize: 24,
    marginRight: theme.spacing.md,
  },
  optionText: {
    fontSize: theme.fontSize.md,
    fontWeight: '600',
    color: theme.colors.text,
  },
  optionDescription: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  navigation: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginTop: theme.spacing.xl,
  },
  backButton: {
    flex: 1,
  },
  nextButton: {
    flex: 2,
  },
});
