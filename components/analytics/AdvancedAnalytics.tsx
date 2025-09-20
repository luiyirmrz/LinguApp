import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { theme } from '@/constants/theme';
import { 
  BarChart3Icon,
  FileTextIcon,
  TrendingUpIcon,
  BrainIcon,
  LightbulbIcon,
} from '@/components/icons/LucideReplacement';

// Import the analytics components
import LearningAnalytics from './LearningAnalytics';
import ProgressReports from './ProgressReports';
import PerformancePredictions from './PerformancePredictions';
import StrengthsWeaknessesAnalysis from './StrengthsWeaknessesAnalysis';
import PersonalizedRecommendations from './PersonalizedRecommendations';

interface AdvancedAnalyticsProps {
  onNavigateToProfile?: (userId: string) => void;
  onNavigateToChallenge?: (challengeId: string) => void;
  onNavigateToGroup?: (groupId: string) => void;
  onNavigateToChat?: (userId: string) => void;
  onNavigateToLessons?: (lessonId: string) => void;
  onNavigateToExercises?: (exerciseType: string) => void;
}

export default function AdvancedAnalytics({
  onNavigateToProfile,
  onNavigateToChallenge,
  onNavigateToGroup,
  onNavigateToChat,
  onNavigateToLessons,
  onNavigateToExercises,
}: AdvancedAnalyticsProps) {
  const [activeTab, setActiveTab] = useState<'analytics' | 'reports' | 'predictions' | 'strengths' | 'recommendations'>('analytics');

  const renderTabBar = () => (
    <View style={styles.tabBar}>
      <TouchableOpacity
        style={[styles.tab, activeTab === 'analytics' && styles.activeTab]}
        onPress={() => setActiveTab('analytics')}
      >
        <BarChart3Icon size={20} color={activeTab === 'analytics' ? theme.colors.primary : theme.colors.gray[600]} />
        <Text style={[styles.tabText, activeTab === 'analytics' && styles.activeTabText]}>Analytics</Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.tab, activeTab === 'reports' && styles.activeTab]}
        onPress={() => setActiveTab('reports')}
      >
        <FileTextIcon size={20} color={activeTab === 'reports' ? theme.colors.primary : theme.colors.gray[600]} />
        <Text style={[styles.tabText, activeTab === 'reports' && styles.activeTabText]}>Reports</Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.tab, activeTab === 'predictions' && styles.activeTab]}
        onPress={() => setActiveTab('predictions')}
      >
        <TrendingUpIcon size={20} color={activeTab === 'predictions' ? theme.colors.primary : theme.colors.gray[600]} />
        <Text style={[styles.tabText, activeTab === 'predictions' && styles.activeTabText]}>Predictions</Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.tab, activeTab === 'strengths' && styles.activeTab]}
        onPress={() => setActiveTab('strengths')}
      >
        <BrainIcon size={20} color={activeTab === 'strengths' ? theme.colors.primary : theme.colors.gray[600]} />
        <Text style={[styles.tabText, activeTab === 'strengths' && styles.activeTabText]}>Strengths</Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.tab, activeTab === 'recommendations' && styles.activeTab]}
        onPress={() => setActiveTab('recommendations')}
      >
        <LightbulbIcon size={20} color={activeTab === 'recommendations' ? theme.colors.primary : theme.colors.gray[600]} />
        <Text style={[styles.tabText, activeTab === 'recommendations' && styles.activeTabText]}>Recommendations</Text>
      </TouchableOpacity>
    </View>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'analytics':
        return (
          <LearningAnalytics
            onNavigateToReport={(reportType) => setActiveTab('reports')}
            onNavigateToPredictions={() => setActiveTab('predictions')}
            onNavigateToRecommendations={() => setActiveTab('recommendations')}
          />
        );

      case 'reports':
        return (
          <ProgressReports
            onNavigateToAnalytics={() => setActiveTab('analytics')}
            onNavigateToPredictions={() => setActiveTab('predictions')}
          />
        );

      case 'predictions':
        return (
          <PerformancePredictions
            onNavigateToAnalytics={() => setActiveTab('analytics')}
            onNavigateToReports={() => setActiveTab('reports')}
          />
        );

      case 'strengths':
        return (
          <StrengthsWeaknessesAnalysis
            onNavigateToAnalytics={() => setActiveTab('analytics')}
            onNavigateToRecommendations={() => setActiveTab('recommendations')}
          />
        );

      case 'recommendations':
        return (
          <PersonalizedRecommendations
            onNavigateToAnalytics={() => setActiveTab('analytics')}
            onNavigateToLessons={onNavigateToLessons}
            onNavigateToExercises={onNavigateToExercises}
          />
        );

      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      {renderTabBar()}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {renderContent()}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.white,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: theme.colors.gray[50],
    marginHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.xs,
    marginBottom: theme.spacing.lg,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    gap: theme.spacing.xs,
  },
  activeTab: {
    backgroundColor: theme.colors.white,
    shadowColor: theme.colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: theme.fontSize.xs,
    fontWeight: '500',
    color: theme.colors.gray[600],
  },
  activeTabText: {
    color: theme.colors.primary,
  },
  scrollView: {
    flex: 1,
  },
});
