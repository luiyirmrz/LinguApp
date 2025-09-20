/**
 * Enhanced Onboarding Component - Complete multi-step user setup
 * Handles language selection, CEFR assessment, goals, and preferences
 * Integrates with onboarding service and provides smooth UX
 */

import React, { useState, useEffect, memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
// Lazy loaded: expo-linear-gradient
// Lazy loaded: lucide-react-native
import { useUnifiedAuth } from "@/hooks/useUnifiedAuth";
import { languages } from '@/mocks/languages';
import onboardingService from '@/services/learning/onboarding';
import { Star, Target, Clock, Check, Bell, Shield, ChevronLeft, ChevronRight } from '@/components/icons';
import { Language, CEFRLevel, LearningGoal } from '@/types';
import colors from '@/constants/colors';

const { width, height } = Dimensions.get('window');

interface OnboardingComponentProps {
  onComplete: () => void;
}

function EnhancedOnboardingComponent({ onComplete }: OnboardingComponentProps) {
  const { user, signIn, signOut, signUp, resetPassword, updateUser } = useUnifiedAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  
  // Onboarding data state
  const [selectedNativeLanguage, setSelectedNativeLanguage] = useState<Language | null>(null);
  const [selectedTargetLanguages, setSelectedTargetLanguages] = useState<Language[]>([]);
  const [selectedCEFRLevel, setSelectedCEFRLevel] = useState<CEFRLevel | null>(null);
  const [selectedGoals, setSelectedGoals] = useState<LearningGoal[]>([]);
  const [dailyGoalXP, setDailyGoalXP] = useState(100);
  const [studyTimePreference, setStudyTimePreference] = useState<'morning' | 'afternoon' | 'evening' | 'flexible'>('evening');
  const [weeklyCommitment, setWeeklyCommitment] = useState(5);
  const [notifTime, setNotifTime] = useState('19:00');
  const [pushConsent, setPushConsent] = useState(false);
  const [emailConsent, setEmailConsent] = useState(false);
  const [tosAccepted, setTosAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);

  const steps = onboardingService.getOnboardingSteps();
  const learningGoals = onboardingService.getLearningGoals();
  const cefrLevels = onboardingService.getCEFRLevels();

  useEffect(() => {
    // Load any existing onboarding progress
    loadOnboardingProgress();
  }, []);

  const loadOnboardingProgress = async () => {
    try {
      const progress = await onboardingService.getOnboardingProgress();
      
      // Restore state from saved progress
      if (progress.languages) {
        setSelectedNativeLanguage(progress.languages.nativeLanguage);
        setSelectedTargetLanguages(progress.languages.targetLanguages || []);
      }
      
      if (progress.assessment) {
        setSelectedCEFRLevel(progress.assessment.level);
      }
      
      if (progress.goals) {
        setSelectedGoals(progress.goals.learningGoals || []);
        setDailyGoalXP(progress.goals.dailyGoalXP || 100);
      }
      
      if (progress.schedule) {
        setStudyTimePreference(progress.schedule.timePreference || 'evening');
        setWeeklyCommitment(progress.schedule.weeklyCommitment || 5);
      }
      
      if (progress.notifications) {
        setNotifTime(progress.notifications.notifTime || '19:00');
        setPushConsent(progress.notifications.pushConsent || false);
        setEmailConsent(progress.notifications.emailConsent || false);
      }
      
      if (progress.privacy) {
        setTosAccepted(progress.privacy.tosAccepted || false);
        setPrivacyAccepted(progress.privacy.privacyAccepted || false);
      }
    } catch (error) {
      console.error('Error loading onboarding progress:', error);
    }
  };

  const saveStepData = async (stepId: string, data: any) => {
    try {
      await onboardingService.saveStepData(stepId, data);
    } catch (error) {
      console.error('Error saving step data:', error);
    }
  };

  const handleNext = async () => {
    // Save current step data
    switch (currentStep) {
      case 1: // Languages
        if (!selectedNativeLanguage || selectedTargetLanguages.length === 0) {
          Alert.alert('Required', 'Please select your native language and at least one target language.');
          return;
        }
        await saveStepData('languages', {
          nativeLanguage: selectedNativeLanguage,
          targetLanguages: selectedTargetLanguages,
        });
        break;
        
      case 2: // Assessment
        if (!selectedCEFRLevel) {
          Alert.alert('Required', 'Please select your current level.');
          return;
        }
        await saveStepData('assessment', {
          level: selectedCEFRLevel,
          hasCompletedTest: false,
        });
        break;
        
      case 3: // Goals
        if (selectedGoals.length === 0) {
          Alert.alert('Required', 'Please select at least one learning goal.');
          return;
        }
        await saveStepData('goals', {
          learningGoals: selectedGoals,
          dailyGoalXP,
        });
        break;
        
      case 4: // Schedule
        await saveStepData('schedule', {
          timePreference: studyTimePreference,
          weeklyCommitment,
        });
        break;
        
      case 5: // Notifications
        await saveStepData('notifications', {
          notifTime,
          pushConsent,
          emailConsent,
        });
        break;
        
      case 6: // Privacy
        if (!tosAccepted || !privacyAccepted) {
          Alert.alert('Required', 'Please accept the Terms of Service and Privacy Policy to continue.');
          return;
        }
        await saveStepData('privacy', {
          tosAccepted,
          privacyAccepted,
          dataProcessingConsent: true,
        });
        break;
    }

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      await completeOnboarding();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const completeOnboarding = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      await onboardingService.completeOnboarding(user.id);
      onComplete();
    } catch (error) {
      console.error('Error completing onboarding:', error);
      Alert.alert('Error', 'Failed to complete onboarding. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderProgressBar = () => (
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
        {currentStep + 1} of {steps.length}
      </Text>
    </View>
  );

  const renderWelcomeStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.welcomeContent}>
        <Text style={styles.welcomeTitle}>Welcome to LinguApp! 🌍</Text>
        <Text style={styles.welcomeSubtitle}>
          Let&apos;s personalize your language learning journey
        </Text>
        <View style={styles.featureList}>
          <View style={styles.featureItem}>
            <Star size={24} color={colors.primary} />
            <Text style={styles.featureText}>Adaptive learning system</Text>
          </View>
          <View style={styles.featureItem}>
            <Target size={24} color={colors.primary} />
            <Text style={styles.featureText}>Personalized goals</Text>
          </View>
          <View style={styles.featureItem}>
            <Clock size={24} color={colors.primary} />
            <Text style={styles.featureText}>Flexible scheduling</Text>
          </View>
        </View>
      </View>
    </View>
  );

  const renderLanguageStep = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Choose Your Languages</Text>
      <Text style={styles.stepSubtitle}>
        Select your native language and what you want to learn
      </Text>
      
      <View style={styles.languageSection}>
        <Text style={styles.sectionTitle}>Native Language</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.languageScroll}>
          {languages.slice(0, 10).map((language) => (
            <TouchableOpacity
              key={language.code}
              style={[
                styles.languageCard,
                selectedNativeLanguage?.code === language.code && styles.selectedLanguageCard,
              ]}
              onPress={() => setSelectedNativeLanguage(language)}
            >
              <Text style={styles.languageFlag}>{language.flag}</Text>
              <Text style={styles.languageName}>{language.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.languageSection}>
        <Text style={styles.sectionTitle}>Target Languages</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.languageScroll}>
          {languages.filter(l => l.code !== selectedNativeLanguage?.code).slice(0, 10).map((language) => (
            <TouchableOpacity
              key={language.code}
              style={[
                styles.languageCard,
                selectedTargetLanguages.some(l => l.code === language.code) && styles.selectedLanguageCard,
              ]}
              onPress={() => {
                if (selectedTargetLanguages.some(l => l.code === language.code)) {
                  setSelectedTargetLanguages(selectedTargetLanguages.filter(l => l.code !== language.code));
                } else {
                  setSelectedTargetLanguages([...selectedTargetLanguages, language]);
                }
              }}
            >
              <Text style={styles.languageFlag}>{language.flag}</Text>
              <Text style={styles.languageName}>{language.name}</Text>
              {selectedTargetLanguages.some(l => l.code === language.code) && (
                <Check size={16} color={colors.primary} style={styles.checkIcon} />
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>
  );

  const renderAssessmentStep = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>What&apos;s Your Level?</Text>
      <Text style={styles.stepSubtitle}>
        Help us understand your current proficiency
      </Text>
      
      <View style={styles.levelContainer}>
        {cefrLevels.map((level) => (
          <TouchableOpacity
            key={level.level}
            style={[
              styles.levelCard,
              selectedCEFRLevel === level.level && styles.selectedLevelCard,
            ]}
            onPress={() => setSelectedCEFRLevel(level.level)}
          >
            <Text style={styles.levelTitle}>{level.level}</Text>
            <Text style={styles.levelSubtitle}>{level.title}</Text>
            <Text style={styles.levelDescription}>{level.description}</Text>
            {selectedCEFRLevel === level.level && (
              <Check size={20} color={colors.primary} style={styles.levelCheck} />
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderGoalsStep = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Set Your Goals</Text>
      <Text style={styles.stepSubtitle}>
        What do you want to achieve?
      </Text>
      
      <View style={styles.goalsContainer}>
        {learningGoals.map((goal) => (
          <TouchableOpacity
            key={goal.id}
            style={[
              styles.goalCard,
              selectedGoals.includes(goal.id) && styles.selectedGoalCard,
            ]}
            onPress={() => {
              if (selectedGoals.includes(goal.id)) {
                setSelectedGoals(selectedGoals.filter(g => g !== goal.id));
              } else {
                setSelectedGoals([...selectedGoals, goal.id]);
              }
            }}
          >
            <Text style={styles.goalIcon}>{goal.icon}</Text>
            <Text style={styles.goalTitle}>{goal.title}</Text>
            <Text style={styles.goalDescription}>{goal.description}</Text>
            {selectedGoals.includes(goal.id) && (
              <Check size={20} color={colors.primary} style={styles.goalCheck} />
            )}
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.xpGoalContainer}>
        <Text style={styles.sectionTitle}>Daily XP Goal</Text>
        <View style={styles.xpOptions}>
          {[50, 100, 200, 300].map((xp) => (
            <TouchableOpacity
              key={xp}
              style={[
                styles.xpOption,
                dailyGoalXP === xp && styles.selectedXpOption,
              ]}
              onPress={() => setDailyGoalXP(xp)}
            >
              <Text style={styles.xpText}>{xp} XP</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );

  const renderScheduleStep = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Create Your Schedule</Text>
      <Text style={styles.stepSubtitle}>
        When would you like to study?
      </Text>
      
      <View style={styles.scheduleSection}>
        <Text style={styles.sectionTitle}>Preferred Study Time</Text>
        <View style={styles.timeOptions}>
          {[
            { id: 'morning', label: 'Morning', icon: '🌅' },
            { id: 'afternoon', label: 'Afternoon', icon: '☀️' },
            { id: 'evening', label: 'Evening', icon: '🌙' },
            { id: 'flexible', label: 'Flexible', icon: '⏰' },
          ].map((time) => (
            <TouchableOpacity
              key={time.id}
              style={[
                styles.timeOption,
                studyTimePreference === time.id && styles.selectedTimeOption,
              ]}
              onPress={() => setStudyTimePreference(time.id as any)}
            >
              <Text style={styles.timeIcon}>{time.icon}</Text>
              <Text style={styles.timeLabel}>{time.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.scheduleSection}>
        <Text style={styles.sectionTitle}>Weekly Commitment</Text>
        <View style={styles.commitmentOptions}>
          {[1, 3, 5, 7].map((days) => (
            <TouchableOpacity
              key={days}
              style={[
                styles.commitmentOption,
                weeklyCommitment === days && styles.selectedCommitmentOption,
              ]}
              onPress={() => setWeeklyCommitment(days)}
            >
              <Text style={styles.commitmentText}>{days} day{days > 1 ? 's' : ''}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );

  const renderNotificationsStep = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Stay Motivated</Text>
      <Text style={styles.stepSubtitle}>
        Set up reminders and notifications
      </Text>
      
      <View style={styles.notificationSection}>
        <View style={styles.notificationOption}>
          <Bell size={24} color={colors.primary} />
          <View style={styles.notificationContent}>
            <Text style={styles.notificationTitle}>Push Notifications</Text>
            <Text style={styles.notificationDescription}>
              Get reminders and achievement updates
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.toggle, pushConsent && styles.toggleActive]}
            onPress={() => setPushConsent(!pushConsent)}
          >
            <View style={[styles.toggleThumb, pushConsent && styles.toggleThumbActive]} />
          </TouchableOpacity>
        </View>

        <View style={styles.notificationOption}>
          <Text style={styles.notificationIcon}>📧</Text>
          <View style={styles.notificationContent}>
            <Text style={styles.notificationTitle}>Email Updates</Text>
            <Text style={styles.notificationDescription}>
              Weekly progress reports and tips
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.toggle, emailConsent && styles.toggleActive]}
            onPress={() => setEmailConsent(!emailConsent)}
          >
            <View style={[styles.toggleThumb, emailConsent && styles.toggleThumbActive]} />
          </TouchableOpacity>
        </View>
      </View>

      {pushConsent && (
        <View style={styles.reminderTimeSection}>
          <Text style={styles.sectionTitle}>Daily Reminder Time</Text>
          <View style={styles.timeSlots}>
            {['08:00', '12:00', '17:00', '19:00', '21:00'].map((time) => (
              <TouchableOpacity
                key={time}
                style={[
                  styles.timeSlot,
                  notifTime === time && styles.selectedTimeSlot,
                ]}
                onPress={() => setNotifTime(time)}
              >
                <Text style={styles.timeSlotText}>{time}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
    </View>
  );

  const renderPrivacyStep = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Privacy & Terms</Text>
      <Text style={styles.stepSubtitle}>
        Review our terms and privacy policy
      </Text>
      
      <View style={styles.privacySection}>
        <TouchableOpacity
          style={styles.privacyOption}
          onPress={() => setTosAccepted(!tosAccepted)}
        >
          <View style={[styles.checkbox, tosAccepted && styles.checkboxActive]}>
            {tosAccepted && <Check size={16} color="white" />}
          </View>
          <Text style={styles.privacyText}>
            I accept the <Text style={styles.linkText}>Terms of Service</Text>
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.privacyOption}
          onPress={() => setPrivacyAccepted(!privacyAccepted)}
        >
          <View style={[styles.checkbox, privacyAccepted && styles.checkboxActive]}>
            {privacyAccepted && <Check size={16} color="white" />}
          </View>
          <Text style={styles.privacyText}>
            I accept the <Text style={styles.linkText}>Privacy Policy</Text>
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.privacyInfo}>
        <Shield size={24} color={colors.primary} />
        <Text style={styles.privacyInfoText}>
          Your data is secure and will only be used to improve your learning experience.
        </Text>
      </View>
    </View>
  );

  const renderCompleteStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.completeContent}>
        <Text style={styles.completeTitle}>You&apos;re All Set! 🎉</Text>
        <Text style={styles.completeSubtitle}>
          Ready to start your language learning journey
        </Text>
        <View style={styles.summaryContainer}>
          <Text style={styles.summaryTitle}>Your Setup:</Text>
          <Text style={styles.summaryItem}>
            📚 Learning: {selectedTargetLanguages.map(l => l.name).join(', ')}
          </Text>
          <Text style={styles.summaryItem}>
            📊 Level: {selectedCEFRLevel}
          </Text>
          <Text style={styles.summaryItem}>
            🎯 Daily Goal: {dailyGoalXP} XP
          </Text>
          <Text style={styles.summaryItem}>
            📅 Commitment: {weeklyCommitment} days/week
          </Text>
        </View>
      </View>
    </View>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: return renderWelcomeStep();
      case 1: return renderLanguageStep();
      case 2: return renderAssessmentStep();
      case 3: return renderGoalsStep();
      case 4: return renderScheduleStep();
      case 5: return renderNotificationsStep();
      case 6: return renderPrivacyStep();
      case 7: return renderCompleteStep();
      default: return renderWelcomeStep();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[colors.primary, colors.secondary]}
        style={styles.gradient}
      >
        {renderProgressBar()}
        
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {renderStepContent()}
        </ScrollView>

        <View style={styles.navigationContainer}>
          {currentStep > 0 && (
            <TouchableOpacity
              style={styles.backButton}
              onPress={handleBack}
            >
              <ChevronLeft size={24} color={colors.primary} />
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity
            style={[styles.nextButton, isLoading && styles.disabledButton]}
            onPress={handleNext}
            disabled={isLoading}
          >
            <Text style={styles.nextButtonText}>
              {currentStep === steps.length - 1 ? 'Get Started' : 'Next'}
            </Text>
            {currentStep < steps.length - 1 && (
              <ChevronRight size={24} color="white" />
            )}
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  progressContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: 'white',
    borderRadius: 2,
  },
  progressText: {
    color: 'white',
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
  },
  stepContainer: {
    flex: 1,
    justifyContent: 'center',
    minHeight: height * 0.6,
  },
  stepTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginBottom: 32,
  },
  welcomeContent: {
    alignItems: 'center',
  },
  welcomeTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 16,
  },
  welcomeSubtitle: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginBottom: 40,
  },
  featureList: {
    alignItems: 'flex-start',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    minWidth: width * 0.7,
  },
  featureText: {
    color: 'white',
    fontSize: 16,
    marginLeft: 12,
    fontWeight: '500',
  },
  languageSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    marginBottom: 12,
  },
  languageScroll: {
    flexDirection: 'row',
  },
  languageCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    alignItems: 'center',
    minWidth: 80,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedLanguageCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderColor: 'white',
  },
  languageFlag: {
    fontSize: 24,
    marginBottom: 8,
  },
  languageName: {
    color: 'white',
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '500',
  },
  checkIcon: {
    position: 'absolute',
    top: 4,
    right: 4,
  },
  levelContainer: {
    gap: 12,
  },
  levelCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
  },
  selectedLevelCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderColor: 'white',
  },
  levelTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  levelSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 8,
  },
  levelDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  levelCheck: {
    position: 'absolute',
    top: 16,
    right: 16,
  },
  goalsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  goalCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    width: (width - 56) / 2,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
  },
  selectedGoalCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderColor: 'white',
  },
  goalIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  goalTitle: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
  },
  goalDescription: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
    textAlign: 'center',
  },
  goalCheck: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  xpGoalContainer: {
    marginTop: 16,
  },
  xpOptions: {
    flexDirection: 'row',
    gap: 12,
  },
  xpOption: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedXpOption: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderColor: 'white',
  },
  xpText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  scheduleSection: {
    marginBottom: 24,
  },
  timeOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  timeOption: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    width: (width - 56) / 2,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedTimeOption: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderColor: 'white',
  },
  timeIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  timeLabel: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  commitmentOptions: {
    flexDirection: 'row',
    gap: 12,
  },
  commitmentOption: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedCommitmentOption: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderColor: 'white',
  },
  commitmentText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  notificationSection: {
    gap: 16,
    marginBottom: 24,
  },
  notificationOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 20,
  },
  notificationIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  notificationDescription: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
  },
  toggle: {
    width: 50,
    height: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 15,
    padding: 2,
  },
  toggleActive: {
    backgroundColor: 'white',
  },
  toggleThumb: {
    width: 26,
    height: 26,
    backgroundColor: 'white',
    borderRadius: 13,
  },
  toggleThumbActive: {
    backgroundColor: colors.primary,
    transform: [{ translateX: 20 }],
  },
  reminderTimeSection: {
    marginTop: 16,
  },
  timeSlots: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  timeSlot: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedTimeSlot: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderColor: 'white',
  },
  timeSlotText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  privacySection: {
    gap: 16,
    marginBottom: 24,
  },
  privacyOption: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: 'white',
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  privacyText: {
    color: 'white',
    fontSize: 16,
    flex: 1,
  },
  linkText: {
    textDecorationLine: 'underline',
    fontWeight: '600',
  },
  privacyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
  },
  privacyInfoText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    marginLeft: 12,
    flex: 1,
  },
  completeContent: {
    alignItems: 'center',
  },
  completeTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 16,
  },
  completeSubtitle: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginBottom: 32,
  },
  summaryContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 20,
    width: '100%',
  },
  summaryTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  summaryItem: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 16,
    marginBottom: 8,
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 4,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 16,
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  disabledButton: {
    opacity: 0.6,
  },
  nextButtonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600',
    marginRight: 4,
  },
});

EnhancedOnboardingComponent.displayName = 'EnhancedOnboardingComponent';

export default memo(EnhancedOnboardingComponent);
