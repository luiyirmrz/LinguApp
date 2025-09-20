import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { theme } from '@/constants/theme';
import { useI18n } from '@/hooks/useI18n';
import { useUnifiedAuth } from "@/hooks/useUnifiedAuth";
import { useGameState } from '@/hooks/useGameState';
import useEnhancedGamification from "@/hooks/useEnhancedGamification";
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { ProgressBar } from '@/components/ProgressBar';
import { Badge } from '@/components/Badge';
import { SearchIcon, FilterIcon, StarIcon, LockIcon, CheckIcon } from '@/components/icons/LucideReplacement';
// import { cefrLessonService } from '@/services/cefrLessonService';
import { MultilingualLesson, CEFRLevel } from '@/types';

const { width } = Dimensions.get('window');

interface LessonSelectionScreenProps {
  level?: CEFRLevel;
  category?: string;
  onLessonSelect?: (lesson: MultilingualLesson) => void;
}

interface FilterState {
  level: CEFRLevel | 'all';
  category: string | 'all';
  difficulty: number | 'all';
  completed: boolean | 'all';
  search: string;
}

export default function LessonSelectionScreen({ 
  level: initialLevel, 
  category: initialCategory,
  onLessonSelect, 
}: LessonSelectionScreenProps) {
  const { t } = useI18n();
  const router = useRouter();
  const { user, signIn, signOut, signUp, resetPassword, updateUser } = useUnifiedAuth();
  const { getUserProgress } = useGameState();
  const { awardXP, completeLesson, acceptChallenge, createChallenge, generateDailyChallenges, refreshStats } = useEnhancedGamification();

  const [lessons, setLessons] = useState<MultilingualLesson[]>([]);
  const [filteredLessons, setFilteredLessons] = useState<MultilingualLesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [userProgress, setUserProgress] = useState<Record<string, any>>({});
  const [userLevel, setUserLevel] = useState(1);
  const [userXP, setUserXP] = useState(0);

  const [filters, setFilters] = useState<FilterState>({
    level: initialLevel || 'all',
    category: initialCategory || 'all',
    difficulty: 'all',
    completed: 'all',
    search: '',
  });

  const [showFilters, setShowFilters] = useState(false);

  // Load lessons and user data
  useEffect(() => {
    loadLessons();
    loadUserData();
  }, []);

  // Filter lessons when filters change
  useEffect(() => {
    filterLessons();
  }, [lessons, filters]);

  const loadLessons = async () => {
    try {
      setLoading(true);
      const allLessons: MultilingualLesson[] = [];
      
      // Load lessons from all levels
      const levels: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2'];
      for (const level of levels) {
        const levelLessons: any[] = []; // Mock implementation
        allLessons.push(...levelLessons);
      }
      
      setLessons(allLessons);
    } catch (error) {
      console.error('Error loading lessons:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserData = async () => {
    try {
      if (user) {
        const progress = await getUserProgress(user.id);
        setUserProgress(progress);
        
        const level = 1; // Mock implementation
        setUserLevel(level);
        
        const xp = 0; // Mock implementation
        setUserXP(xp);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const filterLessons = () => {
    let filtered = [...lessons];

    // Filter by level
    if (filters.level !== 'all') {
      filtered = filtered.filter(lesson => lesson.targetLanguage === filters.level);
    }

    // Filter by category
    if (filters.category !== 'all') {
      filtered = filtered.filter(lesson => lesson.type === filters.category);
    }

    // Filter by difficulty
    if (filters.difficulty !== 'all') {
      filtered = filtered.filter(lesson => lesson.difficulty === filters.difficulty);
    }

    // Filter by completion status
    if (filters.completed !== 'all') {
      filtered = filtered.filter(lesson => {
        const isCompleted = userProgress[lesson.id]?.completed || false;
        return filters.completed ? isCompleted : !isCompleted;
      });
    }

    // Filter by search
    if (filters.search.trim()) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(lesson => {
        const title = getContentInLanguage(lesson.title, 'en').toLowerCase();
        const description = getContentInLanguage(lesson.description, 'en').toLowerCase();
        return title.includes(searchTerm) || description.includes(searchTerm);
      });
    }

    setFilteredLessons(filtered);
  };

  const getContentInLanguage = (content: any, language: string): string => {
    if (typeof content === 'string') return content;
    return content[language] || content.en || '';
  };

  const handleLessonSelect = (lesson: MultilingualLesson) => {
    if (onLessonSelect) {
      onLessonSelect(lesson);
    } else {
      router.push(`/lesson/${lesson.id}` as any);
    }
  };

  const updateFilter = (key: keyof FilterState, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      level: 'all',
      category: 'all',
      difficulty: 'all',
      completed: 'all',
      search: '',
    });
  };

  const getLevelColor = (level: CEFRLevel): string => {
    const colors = {
      A1: '#4CAF50',
      A2: '#2196F3',
      B1: '#FF9800',
      B2: '#F44336',
    };
    return colors[level as keyof typeof colors] || theme.colors.gray[500];
  };

  const getDifficultyColor = (difficulty: number): string => {
    if (difficulty <= 1) return '#4CAF50';
    if (difficulty <= 2) return '#2196F3';
    if (difficulty <= 3) return '#FF9800';
    return '#F44336';
  };

  const isLessonLocked = (lesson: MultilingualLesson): boolean => {
    // Check if user has completed prerequisite lessons
    if (lesson.prerequisites && lesson.prerequisites.length > 0) {
      return lesson.prerequisites.some(prereq => !userProgress[prereq]?.completed);
    }
    return false;
  };

  const getLessonProgress = (lesson: MultilingualLesson): number => {
    const progress = userProgress[lesson.id];
    return progress ? progress.progress : 0;
  };

  const renderLessonCard = ({ item: lesson }: { item: MultilingualLesson }) => {
    const isCompleted = userProgress[lesson.id]?.completed || false;
    const isLocked = isLessonLocked(lesson);
    const progress = getLessonProgress(lesson);

    return (
      <TouchableOpacity
        style={styles.lessonCard}
        onPress={() => !isLocked && handleLessonSelect(lesson)}
        disabled={isLocked}
      >
        <Card style={[styles.card, isLocked ? styles.lockedCard : null] as any}>
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleRow}>
              <Text style={styles.lessonTitle} numberOfLines={2}>
                {getContentInLanguage(lesson.title, 'en')}
              </Text>
              {isLocked && <LockIcon size={20} color={theme.colors.gray[400]} />}
            </View>
            
            <View style={styles.badgesRow}>
              <Badge
                text={lesson.targetLanguage}
                color={getLevelColor(lesson.targetLanguage as CEFRLevel)}
                size="small"
              />
              <Badge
                text={`${lesson.difficulty}/5`}
                color={getDifficultyColor(lesson.difficulty)}
                size="small"
              />
              <Badge
                text={`${lesson.xpReward} XP`}
                color={theme.colors.primary}
                size="small"
              />
            </View>
          </View>

          <Text style={styles.lessonDescription} numberOfLines={2}>
            {getContentInLanguage(lesson.description, 'en')}
          </Text>

          <View style={styles.cardFooter}>
            <View style={styles.progressContainer}>
              <Text style={styles.progressText}>
                {isCompleted ? 'Completed' : `${progress}% Complete`}
              </Text>
              <ProgressBar
                progress={isCompleted ? 100 : progress}
                height={4}
                color={isCompleted ? theme.colors.success : theme.colors.primary}
              />
            </View>

            <View style={styles.lessonStats}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{lesson.exercises.length}</Text>
                <Text style={styles.statLabel}>Exercises</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{lesson.estimatedTime}</Text>
                <Text style={styles.statLabel}>min</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{lesson.vocabularyIntroduced.length}</Text>
                <Text style={styles.statLabel}>Words</Text>
              </View>
            </View>
          </View>

          {isCompleted && (
            <View style={styles.completedBadge}>
              <CheckIcon size={16} color={theme.colors.white} />
              <Text style={styles.completedText}>Completed</Text>
            </View>
          )}
        </Card>
      </TouchableOpacity>
    );
  };

  const renderFilters = () => {
    if (!showFilters) return null;

    return (
      <Card style={styles.filtersCard}>
        <Text style={styles.filtersTitle}>Filters</Text>
        
        <View style={styles.filterRow}>
          <Text style={styles.filterLabel}>Level</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.filterOptions}>
              {['all', 'A1', 'A2', 'B1', 'B2'].map(level => (
                <TouchableOpacity
                  key={level}
                  style={[
                    styles.filterOption,
                    filters.level === level && styles.filterOptionActive,
                  ]}
                  onPress={() => updateFilter('level', level)}
                >
                  <Text style={[
                    styles.filterOptionText,
                    filters.level === level && styles.filterOptionTextActive,
                  ]}>
                    {level === 'all' ? 'All' : level}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        <View style={styles.filterRow}>
          <Text style={styles.filterLabel}>Category</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.filterOptions}>
              {['all', 'vocabulary', 'grammar', 'conversation', 'culture'].map(category => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.filterOption,
                    filters.category === category && styles.filterOptionActive,
                  ]}
                  onPress={() => updateFilter('category', category)}
                >
                  <Text style={[
                    styles.filterOptionText,
                    filters.category === category && styles.filterOptionTextActive,
                  ]}>
                    {category === 'all' ? 'All' : category.charAt(0).toUpperCase() + category.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        <View style={styles.filterRow}>
          <Text style={styles.filterLabel}>Difficulty</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.filterOptions}>
              {['all', 1, 2, 3, 4, 5].map(difficulty => (
                <TouchableOpacity
                  key={difficulty}
                  style={[
                    styles.filterOption,
                    filters.difficulty === difficulty && styles.filterOptionActive,
                  ]}
                  onPress={() => updateFilter('difficulty', difficulty)}
                >
                  <Text style={[
                    styles.filterOptionText,
                    filters.difficulty === difficulty && styles.filterOptionTextActive,
                  ]}>
                    {difficulty === 'all' ? 'All' : `${difficulty}/5`}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        <View style={styles.filterRow}>
          <Text style={styles.filterLabel}>Status</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.filterOptions}>
              {['all', true, false].map(status => (
                <TouchableOpacity
                  key={status.toString()}
                  style={[
                    styles.filterOption,
                    filters.completed === status && styles.filterOptionActive,
                  ]}
                  onPress={() => updateFilter('completed', status)}
                >
                  <Text style={[
                    styles.filterOptionText,
                    filters.completed === status && styles.filterOptionTextActive,
                  ]}>
                    {status === 'all' ? 'All' : status ? 'Completed' : 'Not Completed'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        <View style={styles.filterActions}>
          <Button
            title="Clear Filters"
            onPress={clearFilters}
            variant="outline"
            size="small"
          />
        </View>
      </Card>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading lessons...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.primaryDark]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Lessons</Text>
          <Text style={styles.headerSubtitle}>
            {filteredLessons.length} lessons available
          </Text>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <SearchIcon size={20} color={theme.colors.gray[400]} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search lessons..."
              value={filters.search}
              onChangeText={(text) => updateFilter('search', text)}
              placeholderTextColor={theme.colors.gray[400]}
            />
          </View>
          
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setShowFilters(!showFilters)}
          >
            <FilterIcon size={20} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>

        {renderFilters()}

        <FlatList
          data={filteredLessons}
          renderItem={renderLessonCard}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.lessonsList}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyTitle}>No lessons found</Text>
              <Text style={styles.emptySubtitle}>
                Try adjusting your filters or search terms
              </Text>
            </View>
          }
        />
      </View>
    </SafeAreaView>
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
  },
  loadingText: {
    marginTop: theme.spacing.md,
    fontSize: theme.fontSize.md,
    color: theme.colors.gray[600],
  },
  header: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.xl,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: theme.fontSize.xxl,
    fontWeight: 'bold',
    color: theme.colors.white,
    marginBottom: theme.spacing.xs,
  },
  headerSubtitle: {
    fontSize: theme.fontSize.md,
    color: theme.colors.white,
    opacity: 0.9,
  },
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.gray[50],
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    gap: theme.spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: theme.fontSize.md,
    color: theme.colors.black,
  },
  filterButton: {
    backgroundColor: theme.colors.gray[50],
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.sm,
  },
  filtersCard: {
    marginBottom: theme.spacing.lg,
  },
  filtersTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: '600',
    color: theme.colors.black,
    marginBottom: theme.spacing.md,
  },
  filterRow: {
    marginBottom: theme.spacing.md,
  },
  filterLabel: {
    fontSize: theme.fontSize.sm,
    fontWeight: '500',
    color: theme.colors.gray[600],
    marginBottom: theme.spacing.sm,
  },
  filterOptions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  filterOption: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.gray[100],
  },
  filterOptionActive: {
    backgroundColor: theme.colors.primary,
  },
  filterOptionText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.gray[600],
  },
  filterOptionTextActive: {
    color: theme.colors.white,
  },
  filterActions: {
    marginTop: theme.spacing.md,
  },
  lessonsList: {
    paddingBottom: theme.spacing.xl,
  },
  lessonCard: {
    marginBottom: theme.spacing.md,
  },
  card: {
    position: 'relative',
  },
  lockedCard: {
    opacity: 0.6,
  },
  cardHeader: {
    marginBottom: theme.spacing.md,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
  },
  lessonTitle: {
    flex: 1,
    fontSize: theme.fontSize.lg,
    fontWeight: '600',
    color: theme.colors.black,
    marginRight: theme.spacing.sm,
  },
  badgesRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  lessonDescription: {
    fontSize: theme.fontSize.md,
    color: theme.colors.gray[600],
    lineHeight: 20,
    marginBottom: theme.spacing.md,
  },
  cardFooter: {
    marginTop: theme.spacing.md,
  },
  progressContainer: {
    marginBottom: theme.spacing.md,
  },
  progressText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.gray[600],
    marginBottom: theme.spacing.xs,
  },
  lessonStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: theme.fontSize.lg,
    fontWeight: '600',
    color: theme.colors.black,
  },
  statLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.gray[600],
    marginTop: theme.spacing.xs,
  },
  completedBadge: {
    position: 'absolute',
    top: theme.spacing.md,
    right: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.success,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.md,
    gap: theme.spacing.xs,
  },
  completedText: {
    fontSize: theme.fontSize.sm,
    fontWeight: '500',
    color: theme.colors.white,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xxl,
  },
  emptyTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: '600',
    color: theme.colors.gray[600],
    marginBottom: theme.spacing.sm,
  },
  emptySubtitle: {
    fontSize: theme.fontSize.md,
    color: theme.colors.gray[500],
    textAlign: 'center',
  },
});
