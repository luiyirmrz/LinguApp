// Greetings Module Screen - Simplified Version
// Complete UI for the Basic Greetings learning module

import React, { useState, memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
// Lazy loaded: react-native-safe-area-context
// Lazy loaded: expo-linear-gradient
import { useRouter } from 'expo-router';

import { 
  Play, 
  CheckCircle, 
  Lock, 
  Star, 
  Trophy, 
  Volume2,
  Mic,
  RotateCcw,
  ArrowLeft,
  Clock,
} from '@/components/icons/LucideReplacement';

import { theme } from '@/constants/theme';

// Mock data for greetings module
const mockGreetingsModule = {
  id: 'basic_greetings',
  title: 'Basic Greetings',
  description: 'Learn essential greetings in Spanish',
  totalLessons: 5,
  estimatedTime: '15 min',
  difficulty: 'Beginner',
  lessons: [
    {
      id: 'hello_goodbye',
      title: 'Hello & Goodbye',
      description: 'Learn basic greetings',
      duration: '3 min',
      difficulty: 'Beginner',
      completed: true,
      locked: false,
      exercises: 4,
      xpReward: 20,
    },
    {
      id: 'good_morning',
      title: 'Good Morning',
      description: 'Morning greetings',
      duration: '3 min',
      difficulty: 'Beginner',
      completed: true,
      locked: false,
      exercises: 3,
      xpReward: 15,
    },
    {
      id: 'how_are_you',
      title: 'How are you?',
      description: 'Asking about well-being',
      duration: '4 min',
      difficulty: 'Beginner',
      completed: false,
      locked: false,
      exercises: 5,
      xpReward: 25,
    },
    {
      id: 'introductions',
      title: 'Introductions',
      description: 'Introducing yourself',
      duration: '3 min',
      difficulty: 'Beginner',
      completed: false,
      locked: false,
      exercises: 4,
      xpReward: 20,
    },
    {
      id: 'polite_expressions',
      title: 'Polite Expressions',
      description: 'Please, thank you, etc.',
      duration: '2 min',
      difficulty: 'Beginner',
      completed: false,
      locked: true,
      exercises: 3,
      xpReward: 15,
    },
  ],
};

function GreetingsModuleScreen() {
  const router = useRouter();
  const [selectedLesson, setSelectedLesson] = useState<string | null>(null);

  // Mock progress data
  const progress = {
    completedLessons: 2,
    totalLessons: 5,
    totalXP: 35,
    streak: 3,
    lastPracticeDate: '2024-01-15',
  };

  const handleLessonPress = (lesson: any) => {
    if (lesson.locked) {
      Alert.alert('Lesson Locked', 'Complete previous lessons to unlock this one.');
      return;
    }

    if (lesson.id === 'hello_goodbye') {
      router.push('/greetings-lesson');
    } else {
      Alert.alert('Coming Soon', 'This lesson will be available soon!');
    }
  };

  const handleStartPractice = () => {
    Alert.alert('Practice Mode', 'Practice mode will be available soon!');
  };

  const renderLessonCard = (lesson: any) => (
    <TouchableOpacity
      key={lesson.id}
      style={[styles.lessonCard, lesson.locked && styles.lockedCard]}
      onPress={() => handleLessonPress(lesson)}
      disabled={lesson.locked}
    >
      <View style={styles.lessonHeader}>
        <View style={styles.lessonInfo}>
          <Text style={[styles.lessonTitle, lesson.locked && styles.lockedText]}>
            {lesson.title}
          </Text>
          <Text style={[styles.lessonDescription, lesson.locked && styles.lockedText]}>
            {lesson.description}
          </Text>
        </View>
        
        <View style={styles.lessonStatus}>
          {lesson.completed ? (
            <CheckCircle size={24} color={theme.colors.success} />
          ) : lesson.locked ? (
            <Lock size={24} color={theme.colors.gray[400]} />
          ) : (
            <Play size={24} color={theme.colors.primary} />
          )}
        </View>
      </View>

      <View style={styles.lessonFooter}>
        <View style={styles.lessonStats}>
          <View style={styles.statItem}>
            <Clock size={14} color={theme.colors.textSecondary} />
            <Text style={styles.statText}>{lesson.duration}</Text>
          </View>
          <View style={styles.statItem}>
            <Star size={14} color={theme.colors.orange} />
            <Text style={styles.statText}>{lesson.xpReward} XP</Text>
          </View>
          <View style={styles.statItem}>
            <Trophy size={14} color={theme.colors.blue} />
            <Text style={styles.statText}>{lesson.exercises} exercises</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Greetings</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Module Overview */}
        <View style={styles.moduleOverview}>
          <LinearGradient
            colors={[theme.colors.primary, theme.colors.secondary]}
            style={styles.moduleGradient}
          >
            <Text style={styles.moduleTitle}>{mockGreetingsModule.title}</Text>
            <Text style={styles.moduleDescription}>{mockGreetingsModule.description}</Text>
            
            <View style={styles.moduleStats}>
              <View style={styles.moduleStat}>
                <Text style={styles.moduleStatValue}>{progress.completedLessons}/{progress.totalLessons}</Text>
                <Text style={styles.moduleStatLabel}>Lessons</Text>
              </View>
              <View style={styles.moduleStat}>
                <Text style={styles.moduleStatValue}>{progress.totalXP}</Text>
                <Text style={styles.moduleStatLabel}>XP Earned</Text>
              </View>
              <View style={styles.moduleStat}>
                <Text style={styles.moduleStatValue}>{progress.streak}</Text>
                <Text style={styles.moduleStatLabel}>Day Streak</Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>Progress</Text>
            <Text style={styles.progressText}>
              {Math.round((progress.completedLessons / progress.totalLessons) * 100)}%
            </Text>
          </View>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${(progress.completedLessons / progress.totalLessons) * 100}%` },
              ]} 
            />
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={handleStartPractice}
          >
            <Volume2 size={20} color={theme.colors.white} />
            <Text style={styles.actionButtonText}>Practice</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.secondaryButton]}
            onPress={() => Alert.alert('Coming Soon', 'Review mode will be available soon!')}
          >
            <RotateCcw size={20} color={theme.colors.primary} />
            <Text style={[styles.actionButtonText, styles.secondaryButtonText]}>Review</Text>
          </TouchableOpacity>
        </View>

        {/* Lessons List */}
        <View style={styles.lessonsSection}>
          <Text style={styles.sectionTitle}>Lessons</Text>
          <View style={styles.lessonsList}>
            {mockGreetingsModule.lessons.map(renderLessonCard)}
          </View>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.lg,
    paddingTop: theme.spacing.md,
  },
  backButton: {
    padding: theme.spacing.sm,
  },
  headerTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  headerRight: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  moduleOverview: {
    margin: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
  },
  moduleGradient: {
    padding: theme.spacing.xl,
  },
  moduleTitle: {
    fontSize: theme.fontSize.xxl,
    fontWeight: 'bold',
    color: theme.colors.white,
    marginBottom: theme.spacing.sm,
  },
  moduleDescription: {
    fontSize: theme.fontSize.md,
    color: theme.colors.white,
    opacity: 0.9,
    marginBottom: theme.spacing.lg,
  },
  moduleStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  moduleStat: {
    alignItems: 'center',
  },
  moduleStatValue: {
    fontSize: theme.fontSize.lg,
    fontWeight: 'bold',
    color: theme.colors.white,
  },
  moduleStatLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.white,
    opacity: 0.8,
    marginTop: theme.spacing.xs,
  },
  progressSection: {
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  progressTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  progressText: {
    fontSize: theme.fontSize.md,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  progressBar: {
    height: 8,
    backgroundColor: theme.colors.border,
    borderRadius: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.primary,
    borderRadius: 4,
  },
  quickActions: {
    flexDirection: 'row',
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    gap: theme.spacing.sm,
  },
  secondaryButton: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  actionButtonText: {
    fontSize: theme.fontSize.md,
    fontWeight: '600',
    color: theme.colors.white,
  },
  secondaryButtonText: {
    color: theme.colors.primary,
  },
  lessonsSection: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  lessonsList: {
    gap: theme.spacing.md,
  },
  lessonCard: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  lockedCard: {
    opacity: 0.6,
  },
  lessonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.md,
  },
  lessonInfo: {
    flex: 1,
  },
  lessonTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  lessonDescription: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  lockedText: {
    color: theme.colors.gray[400],
  },
  lessonStatus: {
    marginLeft: theme.spacing.md,
  },
  lessonFooter: {
    marginTop: theme.spacing.sm,
  },
  lessonStats: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  statText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
});

export default memo(GreetingsModuleScreen);

GreetingsModuleScreen.displayName = 'GreetingsModuleScreen';
