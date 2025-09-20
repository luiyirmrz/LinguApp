import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Modal,
  ScrollView,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '@/constants/theme';
import { useUnifiedAuth } from "@/hooks/useUnifiedAuth";
import { useI18n } from '@/hooks/useI18n';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Badge } from '@/components/Badge';
import { ProgressBar } from '@/components/ProgressBar';
import { 
  Trophy as TrophyIcon,
  Target as TargetIcon,
  Clock as ClockIcon,
  Users as UsersIcon,
  Zap as ZapIcon,
  Star as StarIcon,
  Award as AwardIcon,
  Play as PlayIcon,
  Check as CheckIcon,
  X as XIcon,
  Plus as PlusIcon,
  Flame as FlameIcon,
  TrendingUp as TrendingUpIcon,
  Calendar as CalendarIcon,
  MessageCircle as MessageCircleIcon,
  Crown as CrownIcon,
  Medal as MedalIcon,
} from '@/components/icons/LucideReplacement';

const { width } = Dimensions.get('window');

interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'vocabulary' | 'grammar' | 'pronunciation' | 'conversation' | 'streak' | 'xp';
  difficulty: 'easy' | 'medium' | 'hard';
  duration: number; // in minutes
  xpReward: number;
  gemReward: number;
  status: 'pending' | 'active' | 'completed' | 'expired' | 'declined';
  challenger: {
    id: string;
    name: string;
    avatar?: string;
    level: number;
  };
  challengee: {
    id: string;
    name: string;
    avatar?: string;
    level: number;
  };
  createdAt: string;
  expiresAt: string;
  startedAt?: string;
  completedAt?: string;
  results?: {
    challenger: {
      score: number;
      timeSpent: number;
      accuracy: number;
    };
    challengee: {
      score: number;
      timeSpent: number;
      accuracy: number;
    };
    winner: string;
  };
}

interface UserChallengesProps {
  onNavigateToChallenge?: (challengeId: string) => void;
  onNavigateToProfile?: (userId: string) => void;
}

export default function UserChallenges({ 
  onNavigateToChallenge, 
  onNavigateToProfile, 
}: UserChallengesProps) {
  const { user, signIn, signOut, signUp, resetPassword, updateUser } = useUnifiedAuth();
  const { t } = useI18n();

  // State management
  const [activeTab, setActiveTab] = useState<'active' | 'pending' | 'completed' | 'create'>('active');
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [showChallengeDetails, setShowChallengeDetails] = useState(false);

  // Mock data for challenges
  const mockChallenges: Challenge[] = [
    {
      id: 'challenge_1',
      title: 'Vocabulary Master',
      description: 'Complete 50 vocabulary exercises with 90% accuracy',
      type: 'vocabulary',
      difficulty: 'medium',
      duration: 15,
      xpReward: 500,
      gemReward: 25,
      status: 'active',
      challenger: {
        id: 'user_1',
        name: 'Alex Johnson',
        avatar: '👨‍💼',
        level: 12,
      },
      challengee: {
        id: user?.id || 'current_user',
        name: user?.name || 'You',
        avatar: user?.avatar || '👤',
        level: user?.level || 10,
      },
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      expiresAt: new Date(Date.now() + 22 * 60 * 60 * 1000).toISOString(),
      startedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    },
    {
      id: 'challenge_2',
      title: 'Grammar Guru',
      description: 'Complete 30 grammar exercises in under 10 minutes',
      type: 'grammar',
      difficulty: 'hard',
      duration: 10,
      xpReward: 750,
      gemReward: 40,
      status: 'pending',
      challenger: {
        id: user?.id || 'current_user',
        name: user?.name || 'You',
        avatar: user?.avatar || '👤',
        level: user?.level || 10,
      },
      challengee: {
        id: 'user_2',
        name: 'Maria Garcia',
        avatar: '👩‍🎓',
        level: 18,
      },
      createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      expiresAt: new Date(Date.now() + 23 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'challenge_3',
      title: 'Pronunciation Pro',
      description: 'Achieve 95% pronunciation accuracy in 20 exercises',
      type: 'pronunciation',
      difficulty: 'hard',
      duration: 20,
      xpReward: 1000,
      gemReward: 50,
      status: 'completed',
      challenger: {
        id: 'user_3',
        name: 'Chen Wei',
        avatar: '👨‍🔬',
        level: 15,
      },
      challengee: {
        id: user?.id || 'current_user',
        name: user?.name || 'You',
        avatar: user?.avatar || '👤',
        level: user?.level || 10,
      },
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      expiresAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      startedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      completedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      results: {
        challenger: {
          score: 92,
          timeSpent: 18 * 60 * 1000,
          accuracy: 92,
        },
        challengee: {
          score: 96,
          timeSpent: 16 * 60 * 1000,
          accuracy: 96,
        },
        winner: user?.id || 'current_user',
      },
    },
  ];

  useEffect(() => {
    loadChallenges();
  }, [activeTab]);

  const loadChallenges = async () => {
    setIsLoading(true);
    try {
      // Filter challenges based on active tab
      let filteredChallenges = mockChallenges;
      
      switch (activeTab) {
        case 'active':
          filteredChallenges = mockChallenges.filter(c => c.status === 'active');
          break;
        case 'pending':
          filteredChallenges = mockChallenges.filter(c => c.status === 'pending');
          break;
        case 'completed':
          filteredChallenges = mockChallenges.filter(c => c.status === 'completed');
          break;
      }
      
      setChallenges(filteredChallenges);
    } catch (error) {
      console.error('Error loading challenges:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await loadChallenges();
    setIsRefreshing(false);
  }, [activeTab]);

  const handleAcceptChallenge = async (challengeId: string) => {
    try {
      // Update challenge status to active
      setChallenges(prev => 
        prev.map(c => 
          c.id === challengeId 
            ? { ...c, status: 'active' as const, startedAt: new Date().toISOString() }
            : c,
        ),
      );
      
      Alert.alert('Challenge Accepted!', 'Good luck with your challenge!');
    } catch (error) {
      console.error('Error accepting challenge:', error);
      Alert.alert('Error', 'Failed to accept challenge');
    }
  };

  const handleDeclineChallenge = async (challengeId: string) => {
    Alert.alert(
      'Decline Challenge',
      'Are you sure you want to decline this challenge?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Decline',
          style: 'destructive',
          onPress: () => {
            setChallenges(prev => 
              prev.map(c => 
                c.id === challengeId 
                  ? { ...c, status: 'declined' as const }
                  : c,
              ),
            );
            Alert.alert('Challenge Declined', 'The challenge has been declined');
          },
        },
      ],
    );
  };

  const handleStartChallenge = (challengeId: string) => {
    onNavigateToChallenge?.(challengeId);
  };

  const getChallengeTypeIcon = (type: string) => {
    switch (type) {
      case 'vocabulary':
        return <TargetIcon size={20} color={theme.colors.primary} />;
      case 'grammar':
        return <AwardIcon size={20} color={theme.colors.success} />;
      case 'pronunciation':
        return <MessageCircleIcon size={20} color={theme.colors.warning} />;
      case 'conversation':
        return <UsersIcon size={20} color={theme.colors.info} />;
      case 'streak':
        return <FlameIcon size={20} color={theme.colors.danger} />;
      case 'xp':
        return <StarIcon size={20} color={theme.colors.warning} />;
      default:
        return <TrophyIcon size={20} color={theme.colors.gray[600]} />;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return theme.colors.success;
      case 'medium':
        return theme.colors.warning;
      case 'hard':
        return theme.colors.danger;
      default:
        return theme.colors.gray[600];
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return theme.colors.primary;
      case 'pending':
        return theme.colors.warning;
      case 'completed':
        return theme.colors.success;
      case 'expired':
        return theme.colors.gray[600];
      case 'declined':
        return theme.colors.danger;
      default:
        return theme.colors.gray[600];
    }
  };

  const formatTimeRemaining = (expiresAt: string): string => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diffMs = expiry.getTime() - now.getTime();
    
    if (diffMs <= 0) return 'Expired';
    
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffHours > 0) {
      return `${diffHours}h ${diffMins}m left`;
    } else {
      return `${diffMins}m left`;
    }
  };

  const formatTimeSpent = (timeSpent: number): string => {
    const minutes = Math.floor(timeSpent / (1000 * 60));
    const seconds = Math.floor((timeSpent % (1000 * 60)) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const renderChallengeItem = ({ item }: { item: Challenge }) => {
    const isChallenger = user && item.challenger.id === user.id;
    const opponent = isChallenger ? item.challengee : item.challenger;
    const isWinner = item.results && item.results.winner === user?.id;

    return (
      <Card style={styles.challengeCard}>
        <View style={styles.challengeHeader}>
          <View style={styles.challengeInfo}>
            <View style={styles.challengeTitleRow}>
              {getChallengeTypeIcon(item.type)}
              <Text style={styles.challengeTitle}>{item.title}</Text>
              <Badge
                text={item.difficulty}
                color={getDifficultyColor(item.difficulty)}
                size="small"
              />
            </View>
            <Text style={styles.challengeDescription}>{item.description}</Text>
            <View style={styles.challengeMeta}>
              <View style={styles.metaItem}>
                <ClockIcon size={14} color={theme.colors.gray[500]} />
                <Text style={styles.metaText}>{item.duration} min</Text>
              </View>
              <View style={styles.metaItem}>
                <StarIcon size={14} color={theme.colors.warning} />
                <Text style={styles.metaText}>{item.xpReward} XP</Text>
              </View>
              <View style={styles.metaItem}>
                <ZapIcon size={14} color={theme.colors.primary} />
                <Text style={styles.metaText}>{item.gemReward} gems</Text>
              </View>
            </View>
          </View>
          <View style={styles.challengeStatus}>
            <Badge
              text={item.status}
              color={getStatusColor(item.status)}
              size="small"
            />
            {item.status === 'active' && (
              <Text style={styles.timeRemaining}>
                {formatTimeRemaining(item.expiresAt)}
              </Text>
            )}
          </View>
        </View>

        <View style={styles.opponentInfo}>
          <View style={styles.opponentHeader}>
            <Text style={styles.opponentLabel}>
              {isChallenger ? 'Challenging' : 'Challenged by'}
            </Text>
            <TouchableOpacity
              style={styles.opponentProfile}
              onPress={() => onNavigateToProfile?.(opponent.id)}
            >
              <Text style={styles.opponentAvatar}>{opponent.avatar || '👤'}</Text>
              <View style={styles.opponentDetails}>
                <Text style={styles.opponentName}>{opponent.name}</Text>
                <Text style={styles.opponentLevel}>Level {opponent.level}</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {item.status === 'completed' && item.results && (
          <View style={styles.resultsSection}>
            <Text style={styles.resultsTitle}>Challenge Results</Text>
            <View style={styles.resultsContainer}>
              <View style={styles.resultItem}>
                <Text style={styles.resultLabel}>Your Score</Text>
                <Text style={[
                  styles.resultScore,
                  isWinner && styles.winnerScore,
                ]}>
                  {isChallenger ? item.results.challenger.score : item.results.challengee.score}%
                </Text>
                <Text style={styles.resultTime}>
                  {formatTimeSpent(isChallenger ? item.results.challenger.timeSpent : item.results.challengee.timeSpent)}
                </Text>
              </View>
              <View style={styles.resultItem}>
                <Text style={styles.resultLabel}>{opponent.name}</Text>
                <Text style={[
                  styles.resultScore,
                  !isWinner && styles.winnerScore,
                ]}>
                  {isChallenger ? item.results.challengee.score : item.results.challenger.score}%
                </Text>
                <Text style={styles.resultTime}>
                  {formatTimeSpent(isChallenger ? item.results.challengee.timeSpent : item.results.challenger.timeSpent)}
                </Text>
              </View>
            </View>
            {isWinner && (
              <View style={styles.winnerBadge}>
                <CrownIcon size={20} color="#FFD700" />
                <Text style={styles.winnerText}>You Won!</Text>
              </View>
            )}
          </View>
        )}

        <View style={styles.challengeActions}>
          {item.status === 'pending' && !isChallenger && (
            <>
              <Button
                title="Accept"
                onPress={() => handleAcceptChallenge(item.id)}
                style={styles.acceptButton}
                icon={<CheckIcon size={16} color={theme.colors.white} />}
              />
              <Button
                title="Decline"
                onPress={() => handleDeclineChallenge(item.id)}
                variant="outline"
                style={styles.declineButton}
                icon={<XIcon size={16} color={theme.colors.danger} />}
              />
            </>
          )}
          {item.status === 'active' && (
            <Button
              title="Start Challenge"
              onPress={() => handleStartChallenge(item.id)}
              style={styles.startButton}
              icon={<PlayIcon size={16} color={theme.colors.white} />}
            />
          )}
          {item.status === 'completed' && (
            <Button
              title="View Details"
              onPress={() => {
                setSelectedChallenge(item);
                setShowChallengeDetails(true);
              }}
              variant="outline"
              style={styles.detailsButton}
            />
          )}
        </View>
      </Card>
    );
  };

  const renderTabBar = () => (
    <View style={styles.tabBar}>
      <TouchableOpacity
        style={[styles.tab, activeTab === 'active' && styles.activeTab]}
        onPress={() => setActiveTab('active')}
      >
        <PlayIcon size={20} color={activeTab === 'active' ? theme.colors.primary : theme.colors.gray[600]} />
        <Text style={[styles.tabText, activeTab === 'active' && styles.activeTabText]}>
          Active ({challenges.filter(c => c.status === 'active').length})
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.tab, activeTab === 'pending' && styles.activeTab]}
        onPress={() => setActiveTab('pending')}
      >
        <ClockIcon size={20} color={activeTab === 'pending' ? theme.colors.primary : theme.colors.gray[600]} />
        <Text style={[styles.tabText, activeTab === 'pending' && styles.activeTabText]}>
          Pending ({challenges.filter(c => c.status === 'pending').length})
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.tab, activeTab === 'completed' && styles.activeTab]}
        onPress={() => setActiveTab('completed')}
      >
        <TrophyIcon size={20} color={activeTab === 'completed' ? theme.colors.primary : theme.colors.gray[600]} />
        <Text style={[styles.tabText, activeTab === 'completed' && styles.activeTabText]}>
          Completed ({challenges.filter(c => c.status === 'completed').length})
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderCreateChallengeButton = () => (
    <View style={styles.createButtonContainer}>
      <Button
        title="Create Challenge"
        onPress={() => setShowCreateModal(true)}
        style={styles.createButton}
        icon={<PlusIcon size={20} color={theme.colors.white} />}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Challenges</Text>
        <Text style={styles.subtitle}>Compete with friends and improve together</Text>
      </View>

      {renderTabBar()}
      {renderCreateChallengeButton()}

      <FlatList
        data={challenges}
        renderItem={renderChallengeItem}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <TrophyIcon size={48} color={theme.colors.gray[400]} />
            <Text style={styles.emptyTitle}>No Challenges</Text>
            <Text style={styles.emptySubtitle}>
              {activeTab === 'active' && 'You don\'t have any active challenges'}
              {activeTab === 'pending' && 'You don\'t have any pending challenges'}
              {activeTab === 'completed' && 'You haven\'t completed any challenges yet'}
            </Text>
            <Button
              title="Create Challenge"
              onPress={() => setShowCreateModal(true)}
              style={styles.emptyButton}
            />
          </View>
        }
        contentContainerStyle={styles.listContainer}
      />

      {/* Create Challenge Modal */}
      <Modal
        visible={showCreateModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create Challenge</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowCreateModal(false)}
              >
                <XIcon size={24} color={theme.colors.gray[600]} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalBody}>
              <Text style={styles.modalSubtitle}>
                Challenge creation feature coming soon! You'll be able to create custom challenges and invite friends to compete.
              </Text>
              <View style={styles.comingSoonFeatures}>
                <Text style={styles.featureTitle}>Planned Features:</Text>
                <Text style={styles.featureItem}>• Custom challenge types</Text>
                <Text style={styles.featureItem}>• Difficulty selection</Text>
                <Text style={styles.featureItem}>• Time limits and rewards</Text>
                <Text style={styles.featureItem}>• Friend invitations</Text>
                <Text style={styles.featureItem}>• Real-time competition</Text>
              </View>
            </ScrollView>
            <View style={styles.modalFooter}>
              <Button
                title="Got it!"
                onPress={() => setShowCreateModal(false)}
                style={styles.modalButton}
              />
            </View>
          </View>
        </View>
      </Modal>
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
  tabBar: {
    flexDirection: 'row',
    backgroundColor: theme.colors.gray[50],
    marginHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.xs,
    marginBottom: theme.spacing.md,
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
    fontSize: theme.fontSize.sm,
    fontWeight: '500',
    color: theme.colors.gray[600],
  },
  activeTabText: {
    color: theme.colors.primary,
  },
  createButtonContainer: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  createButton: {
    backgroundColor: theme.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
  },
  listContainer: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
  },
  challengeCard: {
    marginBottom: theme.spacing.lg,
    padding: theme.spacing.lg,
  },
  challengeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.md,
  },
  challengeInfo: {
    flex: 1,
    marginRight: theme.spacing.md,
  },
  challengeTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
    gap: theme.spacing.sm,
  },
  challengeTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: '600',
    color: theme.colors.black,
    flex: 1,
  },
  challengeDescription: {
    fontSize: theme.fontSize.md,
    color: theme.colors.gray[600],
    marginBottom: theme.spacing.sm,
    lineHeight: 20,
  },
  challengeMeta: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  metaText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.gray[600],
  },
  challengeStatus: {
    alignItems: 'flex-end',
  },
  timeRemaining: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.gray[500],
    marginTop: theme.spacing.xs,
  },
  opponentInfo: {
    marginBottom: theme.spacing.md,
  },
  opponentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  opponentLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.gray[600],
    marginBottom: theme.spacing.sm,
  },
  opponentProfile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  opponentAvatar: {
    fontSize: 24,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.gray[100],
    textAlign: 'center',
    lineHeight: 40,
  },
  opponentDetails: {
    flex: 1,
  },
  opponentName: {
    fontSize: theme.fontSize.md,
    fontWeight: '600',
    color: theme.colors.black,
  },
  opponentLevel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.gray[600],
  },
  resultsSection: {
    backgroundColor: theme.colors.gray[50],
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
  },
  resultsTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: '600',
    color: theme.colors.black,
    marginBottom: theme.spacing.sm,
  },
  resultsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
  },
  resultItem: {
    alignItems: 'center',
    flex: 1,
  },
  resultLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.gray[600],
    marginBottom: theme.spacing.xs,
  },
  resultScore: {
    fontSize: theme.fontSize.lg,
    fontWeight: 'bold',
    color: theme.colors.black,
    marginBottom: theme.spacing.xs,
  },
  winnerScore: {
    color: theme.colors.success,
  },
  resultTime: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.gray[500],
  },
  winnerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
  },
  winnerText: {
    fontSize: theme.fontSize.md,
    fontWeight: '600',
    color: '#FFD700',
  },
  challengeActions: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  acceptButton: {
    flex: 1,
    backgroundColor: theme.colors.success,
  },
  declineButton: {
    flex: 1,
    borderColor: theme.colors.danger,
  },
  startButton: {
    flex: 1,
    backgroundColor: theme.colors.primary,
  },
  detailsButton: {
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xxl,
    paddingHorizontal: theme.spacing.lg,
  },
  emptyTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: '600',
    color: theme.colors.black,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  emptySubtitle: {
    fontSize: theme.fontSize.md,
    color: theme.colors.gray[600],
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  emptyButton: {
    backgroundColor: theme.colors.primary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  modalContent: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.xl,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
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
  modalBody: {
    padding: theme.spacing.lg,
  },
  modalSubtitle: {
    fontSize: theme.fontSize.md,
    color: theme.colors.gray[600],
    lineHeight: 22,
    marginBottom: theme.spacing.lg,
  },
  comingSoonFeatures: {
    backgroundColor: theme.colors.gray[50],
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },
  featureTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: '600',
    color: theme.colors.black,
    marginBottom: theme.spacing.sm,
  },
  featureItem: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.gray[600],
    marginBottom: theme.spacing.xs,
  },
  modalFooter: {
    padding: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.gray[200],
  },
  modalButton: {
    backgroundColor: theme.colors.primary,
  },
});
