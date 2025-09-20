import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
  Alert,
  Modal,
} from 'react-native';
import { theme } from '@/constants/theme';
import { useUnifiedAuth } from "@/hooks/useUnifiedAuth";
import { useI18n } from '@/hooks/useI18n';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Badge } from '@/components/Badge';
import { 
  TrendingUpIcon,
  TrendingDownIcon,
  TargetIcon,
  ClockIcon,
  BookOpenIcon,
  StarIcon,
  AwardIcon,
  BrainIcon,
  ZapIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  InfoIcon,
  EyeIcon,
  FilterIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  XIcon,
  LightbulbIcon,
  UsersIcon,
  MessageSquareIcon,
  BarChart3Icon,
  PieChartIcon,
  ActivityIcon,
  ThumbsUpIcon,
  ThumbsDownIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  MinusIcon,
} from '@/components/icons/LucideReplacement';
import { analyticsService } from '@/services/analytics/analytics';

const { width } = Dimensions.get('window');

interface StrengthsWeaknessesAnalysisProps {
  onNavigateToAnalytics?: () => void;
  onNavigateToRecommendations?: () => void;
}

interface SkillAnalysis {
  id: string;
  name: string;
  category: 'language' | 'cognitive' | 'behavioral' | 'social';
  currentLevel: number; // 0-100
  targetLevel: number; // 0-100
  trend: 'improving' | 'declining' | 'stable';
  confidence: number; // 0-1
  lastUpdated: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  isStrength: boolean;
  improvementRate: number; // percentage change over time
  practiceFrequency: number; // times per week
  masteryLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  relatedSkills: string[];
  recommendations: string[];
  challenges: string[];
}

export default function StrengthsWeaknessesAnalysis({
  onNavigateToAnalytics,
  onNavigateToRecommendations,
}: StrengthsWeaknessesAnalysisProps) {
  const { user, signIn, signOut, signUp, resetPassword, updateUser } = useUnifiedAuth();
  const { t } = useI18n();

  // State management
  const [skillAnalyses, setSkillAnalyses] = useState<SkillAnalysis[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'language' | 'cognitive' | 'behavioral' | 'social'>('all');
  const [selectedSkill, setSelectedSkill] = useState<SkillAnalysis | null>(null);
  const [showSkillModal, setShowSkillModal] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['overview', 'strengths', 'weaknesses']));

  useEffect(() => {
    loadSkillAnalyses();
  }, [selectedCategory]);

  const loadSkillAnalyses = async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    try {
      const analyticsData = await analyticsService.getAdvancedAnalytics(user.id, 30);
      
      // Generate mock skill analyses based on analytics data
      const mockAnalyses = generateMockSkillAnalyses(analyticsData);
      setSkillAnalyses(mockAnalyses);
    } catch (error) {
      console.error('Error loading skill analyses:', error);
      Alert.alert('Error', 'Failed to load strengths and weaknesses analysis');
    } finally {
      setIsLoading(false);
    }
  };

  const generateMockSkillAnalyses = (analyticsData: any): SkillAnalysis[] => {
    const baseData = {
      totalXP: analyticsData?.daily?.reduce((sum: number, day: any) => sum + day.xpEarned, 0) || 0,
      totalTime: analyticsData?.daily?.reduce((sum: number, day: any) => sum + day.timeSpent, 0) || 0,
      totalWords: analyticsData?.daily?.reduce((sum: number, day: any) => sum + day.newWordsLearned, 0) || 0,
      avgAccuracy: analyticsData?.daily?.reduce((sum: number, day: any) => sum + day.accuracy, 0) / analyticsData?.daily?.length || 0,
      streak: analyticsData?.streakData?.currentStreak || 0,
      performance: analyticsData?.performanceMetrics || {},
    };

    return [
      {
        id: '1',
        name: 'Vocabulary Building',
        category: 'language',
        currentLevel: 85,
        targetLevel: 90,
        trend: 'improving',
        confidence: 0.88,
        lastUpdated: new Date().toISOString(),
        description: 'Ability to learn and retain new vocabulary words',
        icon: <BookOpenIcon size={24} color={theme.colors.success} />,
        color: theme.colors.success,
        isStrength: true,
        improvementRate: 12.5,
        practiceFrequency: 5,
        masteryLevel: 'advanced',
        relatedSkills: ['Reading Comprehension', 'Writing Skills', 'Speaking Fluency'],
        recommendations: ['Continue vocabulary exercises', 'Use spaced repetition', 'Practice in context'],
        challenges: ['Complex technical terms', 'Idiomatic expressions', 'Synonyms and antonyms'],
      },
      {
        id: '2',
        name: 'Grammar Mastery',
        category: 'language',
        currentLevel: 72,
        targetLevel: 85,
        trend: 'improving',
        confidence: 0.75,
        lastUpdated: new Date().toISOString(),
        description: 'Understanding and application of grammatical rules',
        icon: <TargetIcon size={24} color={theme.colors.warning} />,
        color: theme.colors.warning,
        isStrength: false,
        improvementRate: 8.3,
        practiceFrequency: 3,
        masteryLevel: 'intermediate',
        relatedSkills: ['Writing Skills', 'Speaking Accuracy', 'Reading Comprehension'],
        recommendations: ['Focus on grammar exercises', 'Practice with native speakers', 'Review common mistakes'],
        challenges: ['Complex sentence structures', 'Verb conjugations', 'Conditional statements'],
      },
      {
        id: '3',
        name: 'Speaking Fluency',
        category: 'language',
        currentLevel: 68,
        targetLevel: 80,
        trend: 'stable',
        confidence: 0.70,
        lastUpdated: new Date().toISOString(),
        description: 'Ability to speak fluently and naturally',
        icon: <MessageSquareIcon size={24} color={theme.colors.info} />,
        color: theme.colors.info,
        isStrength: false,
        improvementRate: 5.2,
        practiceFrequency: 2,
        masteryLevel: 'intermediate',
        relatedSkills: ['Pronunciation', 'Listening Comprehension', 'Vocabulary Building'],
        recommendations: ['Practice speaking daily', 'Join conversation groups', 'Record and review speech'],
        challenges: ['Pronunciation accuracy', 'Speaking speed', 'Natural intonation'],
      },
      {
        id: '4',
        name: 'Listening Comprehension',
        category: 'language',
        currentLevel: 78,
        targetLevel: 85,
        trend: 'improving',
        confidence: 0.82,
        lastUpdated: new Date().toISOString(),
        description: 'Ability to understand spoken language',
        icon: <UsersIcon size={24} color={theme.colors.primary} />,
        color: theme.colors.primary,
        isStrength: true,
        improvementRate: 10.1,
        practiceFrequency: 4,
        masteryLevel: 'advanced',
        relatedSkills: ['Speaking Fluency', 'Pronunciation', 'Vocabulary Building'],
        recommendations: ['Listen to native content', 'Practice with different accents', 'Use subtitles strategically'],
        challenges: ['Fast speech', 'Regional accents', 'Background noise'],
      },
      {
        id: '5',
        name: 'Consistency',
        category: 'behavioral',
        currentLevel: 92,
        targetLevel: 95,
        trend: 'improving',
        confidence: 0.95,
        lastUpdated: new Date().toISOString(),
        description: 'Regular practice and study habits',
        icon: <ClockIcon size={24} color={theme.colors.success} />,
        color: theme.colors.success,
        isStrength: true,
        improvementRate: 15.8,
        practiceFrequency: 7,
        masteryLevel: 'expert',
        relatedSkills: ['Time Management', 'Motivation', 'Goal Setting'],
        recommendations: ['Maintain current schedule', 'Set weekly goals', 'Track progress'],
        challenges: ['Busy periods', 'Motivation dips', 'External distractions'],
      },
      {
        id: '6',
        name: 'Reading Speed',
        category: 'cognitive',
        currentLevel: 65,
        targetLevel: 80,
        trend: 'declining',
        confidence: 0.68,
        lastUpdated: new Date().toISOString(),
        description: 'Speed and efficiency in reading comprehension',
        icon: <EyeIcon size={24} color={theme.colors.danger} />,
        color: theme.colors.danger,
        isStrength: false,
        improvementRate: -2.1,
        practiceFrequency: 2,
        masteryLevel: 'intermediate',
        relatedSkills: ['Vocabulary Building', 'Grammar Mastery', 'Focus'],
        recommendations: ['Practice speed reading', 'Read daily', 'Use reading exercises'],
        challenges: ['Complex texts', 'Time pressure', 'Concentration'],
      },
      {
        id: '7',
        name: 'Writing Skills',
        category: 'language',
        currentLevel: 70,
        targetLevel: 85,
        trend: 'stable',
        confidence: 0.72,
        lastUpdated: new Date().toISOString(),
        description: 'Ability to write clearly and accurately',
        icon: <MessageSquareIcon size={24} color={theme.colors.warning} />,
        color: theme.colors.warning,
        isStrength: false,
        improvementRate: 3.4,
        practiceFrequency: 3,
        masteryLevel: 'intermediate',
        relatedSkills: ['Grammar Mastery', 'Vocabulary Building', 'Reading Comprehension'],
        recommendations: ['Practice writing daily', 'Get feedback', 'Study writing styles'],
        challenges: ['Complex sentence structures', 'Formal writing', 'Creative expression'],
      },
      {
        id: '8',
        name: 'Social Learning',
        category: 'social',
        currentLevel: 45,
        targetLevel: 70,
        trend: 'improving',
        confidence: 0.60,
        lastUpdated: new Date().toISOString(),
        description: 'Engagement with social learning features',
        icon: <UsersIcon size={24} color={theme.colors.info} />,
        color: theme.colors.info,
        isStrength: false,
        improvementRate: 18.7,
        practiceFrequency: 1,
        masteryLevel: 'beginner',
        relatedSkills: ['Speaking Fluency', 'Listening Comprehension', 'Cultural Understanding'],
        recommendations: ['Join study groups', 'Participate in challenges', 'Connect with native speakers'],
        challenges: ['Social anxiety', 'Time constraints', 'Language barriers'],
      },
    ];
  };

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await loadSkillAnalyses();
    setIsRefreshing(false);
  }, [selectedCategory]);

  const handleSkillPress = (skill: SkillAnalysis) => {
    setSelectedSkill(skill);
    setShowSkillModal(true);
  };

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const getFilteredSkills = () => {
    if (selectedCategory === 'all') return skillAnalyses;
    return skillAnalyses.filter(skill => skill.category === selectedCategory);
  };

  const getStrengths = () => skillAnalyses.filter(skill => skill.isStrength);
  const getWeaknesses = () => skillAnalyses.filter(skill => !skill.isStrength);

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving':
        return <ArrowUpIcon size={16} color={theme.colors.success} />;
      case 'declining':
        return <ArrowDownIcon size={16} color={theme.colors.danger} />;
      case 'stable':
        return <MinusIcon size={16} color={theme.colors.gray[600]} />;
      default:
        return <MinusIcon size={16} color={theme.colors.gray[600]} />;
    }
  };

  const getMasteryColor = (level: string) => {
    switch (level) {
      case 'beginner': return theme.colors.gray[500];
      case 'intermediate': return theme.colors.warning;
      case 'advanced': return theme.colors.success;
      case 'expert': return theme.colors.primary;
      default: return theme.colors.gray[500];
    }
  };

  const renderCategorySelector = () => (
    <View style={styles.categorySelector}>
      {(['all', 'language', 'cognitive', 'behavioral', 'social'] as const).map((category) => (
        <TouchableOpacity
          key={category}
          style={[
            styles.categoryButton,
            selectedCategory === category && styles.activeCategoryButton,
          ]}
          onPress={() => setSelectedCategory(category)}
        >
          <Text style={[
            styles.categoryText,
            selectedCategory === category && styles.activeCategoryText,
          ]}>
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderOverviewSection = () => {
    const strengths = getStrengths();
    const weaknesses = getWeaknesses();
    const totalSkills = skillAnalyses.length;
    const avgLevel = skillAnalyses.reduce((sum, skill) => sum + skill.currentLevel, 0) / totalSkills;

    return (
      <Card style={styles.sectionCard}>
        <TouchableOpacity
          style={styles.sectionHeader}
          onPress={() => toggleSection('overview')}
        >
          <View style={styles.sectionTitleContainer}>
            <BarChart3Icon size={24} color={theme.colors.primary} />
            <Text style={styles.sectionTitle}>Skills Overview</Text>
          </View>
          {expandedSections.has('overview') ? 
            <ChevronDownIcon size={20} color={theme.colors.gray[600]} /> :
            <ChevronRightIcon size={20} color={theme.colors.gray[600]} />
          }
        </TouchableOpacity>

        {expandedSections.has('overview') && (
          <View style={styles.sectionContent}>
            <View style={styles.overviewGrid}>
              <View style={styles.overviewItem}>
                <View style={styles.overviewIcon}>
                  <ThumbsUpIcon size={24} color={theme.colors.success} />
                </View>
                <Text style={styles.overviewValue}>{strengths.length}</Text>
                <Text style={styles.overviewLabel}>Strengths</Text>
              </View>

              <View style={styles.overviewItem}>
                <View style={styles.overviewIcon}>
                  <ThumbsDownIcon size={24} color={theme.colors.danger} />
                </View>
                <Text style={styles.overviewValue}>{weaknesses.length}</Text>
                <Text style={styles.overviewLabel}>Weaknesses</Text>
              </View>

              <View style={styles.overviewItem}>
                <View style={styles.overviewIcon}>
                  <TargetIcon size={24} color={theme.colors.primary} />
                </View>
                <Text style={styles.overviewValue}>{avgLevel.toFixed(0)}%</Text>
                <Text style={styles.overviewLabel}>Average Level</Text>
              </View>

              <View style={styles.overviewItem}>
                <View style={styles.overviewIcon}>
                  <ActivityIcon size={24} color={theme.colors.info} />
                </View>
                <Text style={styles.overviewValue}>{totalSkills}</Text>
                <Text style={styles.overviewLabel}>Total Skills</Text>
              </View>
            </View>
          </View>
        )}
      </Card>
    );
  };

  const renderStrengthsSection = () => {
    const strengths = getStrengths();

    return (
      <Card style={styles.sectionCard}>
        <TouchableOpacity
          style={styles.sectionHeader}
          onPress={() => toggleSection('strengths')}
        >
          <View style={styles.sectionTitleContainer}>
            <ThumbsUpIcon size={24} color={theme.colors.success} />
            <Text style={styles.sectionTitle}>Strengths ({strengths.length})</Text>
          </View>
          {expandedSections.has('strengths') ? 
            <ChevronDownIcon size={20} color={theme.colors.gray[600]} /> :
            <ChevronRightIcon size={20} color={theme.colors.gray[600]} />
          }
        </TouchableOpacity>

        {expandedSections.has('strengths') && (
          <View style={styles.sectionContent}>
            {strengths.map((skill) => (
              <TouchableOpacity
                key={skill.id}
                style={styles.skillCard}
                onPress={() => handleSkillPress(skill)}
              >
                <View style={styles.skillHeader}>
                  <View style={styles.skillIcon}>
                    {skill.icon}
                  </View>
                  <View style={styles.skillInfo}>
                    <Text style={styles.skillName}>{skill.name}</Text>
                    <Text style={styles.skillDescription}>{skill.description}</Text>
                  </View>
                  <View style={styles.skillMeta}>
                    <Badge variant="filled" style={styles.masteryBadge}>
                      {skill.masteryLevel}
                    </Badge>
                    <Text style={styles.skillLevel}>{skill.currentLevel}%</Text>
                  </View>
                </View>

                <View style={styles.skillProgress}>
                  <View style={styles.progressBar}>
                    <View 
                      style={[
                        styles.progressFill, 
                        { width: `${skill.currentLevel}%`, backgroundColor: skill.color },
                      ]} 
                    />
                  </View>
                  <View style={styles.progressLabels}>
                    <Text style={styles.progressLabel}>Current: {skill.currentLevel}%</Text>
                    <Text style={styles.progressLabel}>Target: {skill.targetLevel}%</Text>
                  </View>
                </View>

                <View style={styles.skillTrend}>
                  <View style={styles.trendItem}>
                    {getTrendIcon(skill.trend)}
                    <Text style={styles.trendText}>
                      {skill.improvementRate > 0 ? '+' : ''}{skill.improvementRate.toFixed(1)}%
                    </Text>
                  </View>
                  <Text style={styles.practiceText}>
                    {skill.practiceFrequency}x/week
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </Card>
    );
  };

  const renderWeaknessesSection = () => {
    const weaknesses = getWeaknesses();

    return (
      <Card style={styles.sectionCard}>
        <TouchableOpacity
          style={styles.sectionHeader}
          onPress={() => toggleSection('weaknesses')}
        >
          <View style={styles.sectionTitleContainer}>
            <ThumbsDownIcon size={24} color={theme.colors.danger} />
            <Text style={styles.sectionTitle}>Areas for Improvement ({weaknesses.length})</Text>
          </View>
          {expandedSections.has('weaknesses') ? 
            <ChevronDownIcon size={20} color={theme.colors.gray[600]} /> :
            <ChevronRightIcon size={20} color={theme.colors.gray[600]} />
          }
        </TouchableOpacity>

        {expandedSections.has('weaknesses') && (
          <View style={styles.sectionContent}>
            {weaknesses.map((skill) => (
              <TouchableOpacity
                key={skill.id}
                style={styles.skillCard}
                onPress={() => handleSkillPress(skill)}
              >
                <View style={styles.skillHeader}>
                  <View style={styles.skillIcon}>
                    {skill.icon}
                  </View>
                  <View style={styles.skillInfo}>
                    <Text style={styles.skillName}>{skill.name}</Text>
                    <Text style={styles.skillDescription}>{skill.description}</Text>
                  </View>
                  <View style={styles.skillMeta}>
                    <Badge 
                      variant={skill.masteryLevel === 'beginner' ? 'subtle' : 
                              skill.masteryLevel === 'intermediate' ? 'outlined' : 'filled'}
                      style={styles.masteryBadge}
                    >
                      {skill.masteryLevel}
                    </Badge>
                    <Text style={styles.skillLevel}>{skill.currentLevel}%</Text>
                  </View>
                </View>

                <View style={styles.skillProgress}>
                  <View style={styles.progressBar}>
                    <View 
                      style={[
                        styles.progressFill, 
                        { width: `${skill.currentLevel}%`, backgroundColor: skill.color },
                      ]} 
                    />
                  </View>
                  <View style={styles.progressLabels}>
                    <Text style={styles.progressLabel}>Current: {skill.currentLevel}%</Text>
                    <Text style={styles.progressLabel}>Target: {skill.targetLevel}%</Text>
                  </View>
                </View>

                <View style={styles.skillTrend}>
                  <View style={styles.trendItem}>
                    {getTrendIcon(skill.trend)}
                    <Text style={styles.trendText}>
                      {skill.improvementRate > 0 ? '+' : ''}{skill.improvementRate.toFixed(1)}%
                    </Text>
                  </View>
                  <Text style={styles.practiceText}>
                    {skill.practiceFrequency}x/week
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </Card>
    );
  };

  const renderSkillModal = () => {
    if (!selectedSkill) return null;

    return (
      <Modal
        visible={showSkillModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowSkillModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{selectedSkill.name}</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowSkillModal(false)}
            >
              <XIcon size={24} color={theme.colors.gray[600]} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            <Card style={styles.modalCard}>
              <View style={styles.modalIcon}>
                {selectedSkill.icon}
              </View>
              <Text style={styles.modalDescription}>{selectedSkill.description}</Text>
              
              <View style={styles.modalStats}>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Current Level</Text>
                  <Text style={styles.statValue}>{selectedSkill.currentLevel}%</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Target Level</Text>
                  <Text style={styles.statValue}>{selectedSkill.targetLevel}%</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Mastery Level</Text>
                  <Text style={[styles.statValue, { color: getMasteryColor(selectedSkill.masteryLevel) }]}>
                    {selectedSkill.masteryLevel}
                  </Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Practice Frequency</Text>
                  <Text style={styles.statValue}>{selectedSkill.practiceFrequency}x/week</Text>
                </View>
              </View>

              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>Related Skills</Text>
                <View style={styles.relatedSkills}>
                  {selectedSkill.relatedSkills.map((relatedSkill, index) => (
                    <Badge key={index} variant="subtle" style={styles.relatedSkillBadge}>
                      {relatedSkill}
                    </Badge>
                  ))}
                </View>
              </View>

              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>Recommendations</Text>
                {selectedSkill.recommendations.map((recommendation, index) => (
                  <View key={index} style={styles.recommendationItem}>
                    <LightbulbIcon size={16} color={theme.colors.warning} />
                    <Text style={styles.recommendationText}>{recommendation}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>Challenges</Text>
                {selectedSkill.challenges.map((challenge, index) => (
                  <View key={index} style={styles.challengeItem}>
                    <AlertCircleIcon size={16} color={theme.colors.danger} />
                    <Text style={styles.challengeText}>{challenge}</Text>
                  </View>
                ))}
              </View>
            </Card>
          </ScrollView>
        </View>
      </Modal>
    );
  };

  if (isLoading && skillAnalyses.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <BrainIcon size={48} color={theme.colors.primary} />
        <Text style={styles.loadingText}>Analyzing skills...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Strengths & Weaknesses</Text>
        <Text style={styles.subtitle}>Comprehensive analysis of your learning skills</Text>
      </View>

      {renderCategorySelector()}

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {renderOverviewSection()}
        {renderStrengthsSection()}
        {renderWeaknessesSection()}
      </ScrollView>

      {renderSkillModal()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.white,
  },
  header: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
  },
  title: {
    fontSize: theme.fontSize.xxl,
    fontWeight: 'bold',
    color: theme.colors.black,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    fontSize: theme.fontSize.md,
    color: theme.colors.gray[600],
  },
  categorySelector: {
    flexDirection: 'row',
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    backgroundColor: theme.colors.gray[50],
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.xs,
  },
  categoryButton: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
  },
  activeCategoryButton: {
    backgroundColor: theme.colors.white,
    shadowColor: theme.colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  categoryText: {
    fontSize: theme.fontSize.sm,
    fontWeight: '500',
    color: theme.colors.gray[600],
  },
  activeCategoryText: {
    color: theme.colors.primary,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
  },
  sectionCard: {
    marginBottom: theme.spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.lg,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: '600',
    color: theme.colors.black,
  },
  sectionContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
  },
  overviewGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
  },
  overviewItem: {
    flex: 1,
    minWidth: (width - theme.spacing.lg * 4) / 2,
    alignItems: 'center',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.gray[50],
    borderRadius: theme.borderRadius.lg,
  },
  overviewIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.sm,
  },
  overviewValue: {
    fontSize: theme.fontSize.xl,
    fontWeight: 'bold',
    color: theme.colors.black,
    marginBottom: theme.spacing.xs,
  },
  overviewLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.gray[600],
  },
  skillCard: {
    backgroundColor: theme.colors.gray[50],
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.gray[200],
  },
  skillHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.md,
  },
  skillIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  skillInfo: {
    flex: 1,
    marginRight: theme.spacing.md,
  },
  skillName: {
    fontSize: theme.fontSize.lg,
    fontWeight: '600',
    color: theme.colors.black,
    marginBottom: theme.spacing.xs,
  },
  skillDescription: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.gray[600],
  },
  skillMeta: {
    alignItems: 'flex-end',
  },
  masteryBadge: {
    marginBottom: theme.spacing.xs,
  },
  skillLevel: {
    fontSize: theme.fontSize.lg,
    fontWeight: 'bold',
    color: theme.colors.black,
  },
  skillProgress: {
    marginBottom: theme.spacing.md,
  },
  progressBar: {
    height: 8,
    backgroundColor: theme.colors.gray[200],
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: theme.spacing.sm,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressLabel: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.gray[600],
  },
  skillTrend: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  trendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  trendText: {
    fontSize: theme.fontSize.sm,
    fontWeight: '500',
    color: theme.colors.gray[600],
  },
  practiceText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.gray[600],
  },
  modalContainer: {
    flex: 1,
    backgroundColor: theme.colors.white,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray[200],
  },
  modalTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: '600',
    color: theme.colors.black,
  },
  closeButton: {
    padding: theme.spacing.sm,
  },
  modalContent: {
    flex: 1,
    padding: theme.spacing.lg,
  },
  modalCard: {
    padding: theme.spacing.lg,
  },
  modalIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: theme.colors.gray[50],
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: theme.spacing.lg,
  },
  modalDescription: {
    fontSize: theme.fontSize.md,
    color: theme.colors.gray[600],
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  modalStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  statItem: {
    flex: 1,
    minWidth: (width - theme.spacing.lg * 4) / 2,
    alignItems: 'center',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.gray[50],
    borderRadius: theme.borderRadius.md,
  },
  statLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.gray[600],
    marginBottom: theme.spacing.xs,
  },
  statValue: {
    fontSize: theme.fontSize.lg,
    fontWeight: 'bold',
    color: theme.colors.black,
  },
  modalSection: {
    marginBottom: theme.spacing.lg,
  },
  modalSectionTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: '600',
    color: theme.colors.black,
    marginBottom: theme.spacing.md,
  },
  relatedSkills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  relatedSkillBadge: {
    marginBottom: theme.spacing.sm,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  recommendationText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.gray[600],
    flex: 1,
  },
  challengeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  challengeText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.gray[600],
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.lg,
  },
  loadingText: {
    fontSize: theme.fontSize.lg,
    color: theme.colors.gray[600],
  },
});
