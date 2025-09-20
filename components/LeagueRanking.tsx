import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { theme } from '@/constants/theme';
import { useI18n } from '@/hooks/useI18n';
import { useUnifiedAuth } from "@/hooks/useUnifiedAuth";
import useEnhancedGamification from "@/hooks/useEnhancedGamification";
import { Card } from '@/components/Card';
import { Badge } from '@/components/Badge';
import { 
  TrophyIcon, 
  CrownIcon, 
  MedalIcon, 
  AwardIcon, 
  StarIcon, 
  FlameIcon,
  UsersIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  TargetIcon,
  BookOpenIcon,
  GemIcon,
  HeartIcon,
  CalendarIcon,
  BarChart3Icon,
} from '@/components/icons/LucideReplacement';

const { width } = Dimensions.get('window');

interface LeaderboardEntry {
  id: string;
  name: string;
  avatar?: string;
  level: number;
  xp: number;
  streak: number;
  rank: number;
  league: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  weeklyXP: number;
  monthlyXP: number;
  totalLessons: number;
  accuracy: number;
  isCurrentUser: boolean;
  change: 'up' | 'down' | 'stable';
  changeAmount: number;
}

interface LeagueInfo {
  name: string;
  color: string;
  minXP: number;
  maxXP: number;
  icon: React.ReactNode;
  description: string;
}

interface LeagueRankingProps {
  onUserPress?: (user: LeaderboardEntry) => void;
  onLeaguePress?: (league: string) => void;
}

export default function LeagueRanking({
  onUserPress,
  onLeaguePress,
}: LeagueRankingProps) {
  const { t } = useI18n();
  const { user, signIn, signOut, signUp, resetPassword, updateUser } = useUnifiedAuth();
  const { awardXP, completeLesson, acceptChallenge, createChallenge, generateDailyChallenges, refreshStats } = useEnhancedGamification();

  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [currentUser, setCurrentUser] = useState<LeaderboardEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedLeague, setSelectedLeague] = useState<string>('all');
  const [animationValue] = useState(new Animated.Value(0));

  const leagues: LeagueInfo[] = [
    {
      name: 'Bronze',
      color: '#CD7F32',
      minXP: 0,
      maxXP: 999,
      icon: <MedalIcon size={20} color="#CD7F32" />,
      description: 'Getting started',
    },
    {
      name: 'Silver',
      color: '#C0C0C0',
      minXP: 1000,
      maxXP: 2499,
      icon: <AwardIcon size={20} color="#C0C0C0" />,
      description: 'Making progress',
    },
    {
      name: 'Gold',
      color: '#FFD700',
      minXP: 2500,
      maxXP: 4999,
      icon: <TrophyIcon size={20} color="#FFD700" />,
      description: 'Advanced learner',
    },
    {
      name: 'Platinum',
      color: '#E5E4E2',
      minXP: 5000,
      maxXP: 9999,
      icon: <CrownIcon size={20} color="#E5E4E2" />,
      description: 'Expert level',
    },
    {
      name: 'Diamond',
      color: '#B9F2FF',
      minXP: 10000,
      maxXP: Infinity,
      icon: <CrownIcon size={20} color="#B9F2FF" />,
      description: 'Master level',
    },
  ];

  useEffect(() => {
    loadLeaderboard();
    animateComponents();
  }, []);

  const animateComponents = () => {
    Animated.timing(animationValue, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  };

  const loadLeaderboard = async () => {
    try {
      setLoading(true);
      
      if (!user) return;

      // Generate mock leaderboard data
      const mockLeaderboard: LeaderboardEntry[] = [
        {
          id: '1',
          name: 'Alex Johnson',
          level: 15,
          xp: 12500,
          streak: 45,
          rank: 1,
          league: 'diamond',
          weeklyXP: 850,
          monthlyXP: 3200,
          totalLessons: 180,
          accuracy: 94,
          isCurrentUser: false,
          change: 'up',
          changeAmount: 2,
        },
        {
          id: '2',
          name: 'Maria Garcia',
          level: 14,
          xp: 11800,
          streak: 38,
          rank: 2,
          league: 'diamond',
          weeklyXP: 720,
          monthlyXP: 2800,
          totalLessons: 165,
          accuracy: 92,
          isCurrentUser: false,
          change: 'down',
          changeAmount: 1,
        },
        {
          id: '3',
          name: 'David Chen',
          level: 13,
          xp: 11200,
          streak: 42,
          rank: 3,
          league: 'diamond',
          weeklyXP: 680,
          monthlyXP: 2600,
          totalLessons: 155,
          accuracy: 91,
          isCurrentUser: false,
          change: 'up',
          changeAmount: 3,
        },
        {
          id: user.id,
          name: user.name || 'You',
          level: 1, // Mock implementation
          xp: 0, // Mock implementation
          streak: 0, // Mock implementation
          rank: 4,
          league: 'platinum',
          weeklyXP: 450,
          monthlyXP: 1800,
          totalLessons: 120,
          accuracy: 88,
          isCurrentUser: true,
          change: 'stable',
          changeAmount: 0,
        },
        {
          id: '5',
          name: 'Sarah Wilson',
          level: 12,
          xp: 9800,
          streak: 25,
          rank: 5,
          league: 'platinum',
          weeklyXP: 420,
          monthlyXP: 1600,
          totalLessons: 140,
          accuracy: 89,
          isCurrentUser: false,
          change: 'down',
          changeAmount: 1,
        },
      ];

      setLeaderboard(mockLeaderboard);
      setCurrentUser(mockLeaderboard.find(entry => entry.isCurrentUser) || null);

    } catch (error) {
      console.error('Error loading leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadLeaderboard();
    setRefreshing(false);
  };

  const getLeagueInfo = (league: string): LeagueInfo => {
    return leagues.find(l => l.name.toLowerCase() === league.toLowerCase()) || leagues[0];
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <CrownIcon size={24} color="#FFD700" />;
      case 2:
        return <MedalIcon size={24} color="#C0C0C0" />;
      case 3:
        return <AwardIcon size={24} color="#CD7F32" />;
      default:
        return <TrophyIcon size={24} color={theme.colors.gray[500]} />;
    }
  };

  const getChangeIcon = (change: 'up' | 'down' | 'stable') => {
    switch (change) {
      case 'up':
        return <TrendingUpIcon size={16} color={theme.colors.success} />;
      case 'down':
        return <TrendingDownIcon size={16} color={theme.colors.danger} />;
      default:
        return <BarChart3Icon size={16} color={theme.colors.gray[500]} />;
    }
  };

  const getChangeText = (change: 'up' | 'down' | 'stable', amount: number): string => {
    switch (change) {
      case 'up':
        return `+${amount}`;
      case 'down':
        return `-${amount}`;
      default:
        return '0';
    }
  };

  const getChangeColor = (change: 'up' | 'down' | 'stable'): string => {
    switch (change) {
      case 'up':
        return theme.colors.success;
      case 'down':
        return theme.colors.danger;
      default:
        return theme.colors.gray[500];
    }
  };

  const filteredLeaderboard = selectedLeague === 'all' 
    ? leaderboard 
    : leaderboard.filter(entry => entry.league === selectedLeague);

  const renderLeagueSelector = () => (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      style={styles.leagueSelector}
      contentContainerStyle={styles.leagueSelectorContent}
    >
      <TouchableOpacity
        style={[
          styles.leagueButton,
          selectedLeague === 'all' && styles.leagueButtonActive,
        ]}
        onPress={() => setSelectedLeague('all')}
      >
        <Text style={[
          styles.leagueButtonText,
          selectedLeague === 'all' && styles.leagueButtonTextActive,
        ]}>
          All
        </Text>
      </TouchableOpacity>
      
      {leagues.map((league) => (
        <TouchableOpacity
          key={league.name}
          style={[
            styles.leagueButton,
            selectedLeague === league.name.toLowerCase() && styles.leagueButtonActive,
          ]}
          onPress={() => setSelectedLeague(league.name.toLowerCase())}
        >
          {league.icon}
          <Text style={[
            styles.leagueButtonText,
            selectedLeague === league.name.toLowerCase() && styles.leagueButtonTextActive,
          ]}>
            {league.name}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderLeaderboardEntry = (entry: LeaderboardEntry, index: number) => (
    <Animated.View
      key={entry.id}
      style={[
        styles.leaderboardEntry,
        {
          transform: [{
            scale: animationValue.interpolate({
              inputRange: [0, 1],
              outputRange: [0.8, 1],
            }),
          }],
          opacity: animationValue,
        },
      ]}
    >
      <TouchableOpacity
        style={[
          styles.leaderboardCard,
          entry.isCurrentUser && styles.currentUserCard,
        ]}
        onPress={() => onUserPress?.(entry)}
        activeOpacity={0.7}
      >
        <View style={styles.rankContainer}>
          {getRankIcon(entry.rank)}
          <Text style={styles.rankText}>#{entry.rank}</Text>
        </View>

        <View style={styles.userInfo}>
          <View style={styles.userHeader}>
            <Text style={[
              styles.userName,
              entry.isCurrentUser && styles.currentUserName,
            ]}>
              {entry.name}
            </Text>
            <View style={styles.changeContainer}>
              {getChangeIcon(entry.change)}
              <Text style={[
                styles.changeText,
                { color: getChangeColor(entry.change) },
              ]}>
                {getChangeText(entry.change, entry.changeAmount)}
              </Text>
            </View>
          </View>
          
          <View style={styles.userStats}>
            <View style={styles.userStat}>
              <StarIcon size={14} color={theme.colors.warning} />
              <Text style={styles.userStatText}>Level {entry.level}</Text>
            </View>
            <View style={styles.userStat}>
              <FlameIcon size={14} color={theme.colors.warning} />
              <Text style={styles.userStatText}>{entry.streak} days</Text>
            </View>
            <View style={styles.userStat}>
              <TargetIcon size={14} color={theme.colors.success} />
              <Text style={styles.userStatText}>{entry.accuracy}%</Text>
            </View>
          </View>
        </View>

        <View style={styles.leagueContainer}>
          <Badge
            text={entry.league}
            color={getLeagueInfo(entry.league).color}
            size="small"
          />
          <Text style={styles.xpText}>{entry.xp.toLocaleString()} XP</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderCurrentUserCard = () => {
    if (!currentUser) return null;

    return (
      <Card style={styles.currentUserCard}>
        <View style={styles.currentUserHeader}>
          <Text style={styles.currentUserTitle}>Your Ranking</Text>
          <Badge
            text={`#${currentUser.rank}`}
            color={theme.colors.primary}
            size="small"
          />
        </View>
        
        <View style={styles.currentUserStats}>
          <View style={styles.currentUserStat}>
            <Text style={styles.currentUserStatValue}>{currentUser.level}</Text>
            <Text style={styles.currentUserStatLabel}>Level</Text>
          </View>
          <View style={styles.currentUserStat}>
            <Text style={styles.currentUserStatValue}>{currentUser.xp.toLocaleString()}</Text>
            <Text style={styles.currentUserStatLabel}>XP</Text>
          </View>
          <View style={styles.currentUserStat}>
            <Text style={styles.currentUserStatValue}>{currentUser.streak}</Text>
            <Text style={styles.currentUserStatLabel}>Streak</Text>
          </View>
          <View style={styles.currentUserStat}>
            <Text style={styles.currentUserStatValue}>{currentUser.accuracy}%</Text>
            <Text style={styles.currentUserStatLabel}>Accuracy</Text>
          </View>
        </View>
      </Card>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading leaderboard...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* League Selector */}
      {renderLeagueSelector()}

      {/* Current User Card */}
      {renderCurrentUserCard()}

      {/* Leaderboard */}
      <ScrollView
        style={styles.leaderboard}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.leaderboardHeader}>
          <Text style={styles.leaderboardTitle}>Leaderboard</Text>
          <Text style={styles.leaderboardSubtitle}>
            {filteredLeaderboard.length} players in {selectedLeague === 'all' ? 'all leagues' : selectedLeague}
          </Text>
        </View>

        {filteredLeaderboard.map(renderLeaderboardEntry)}
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
  leagueSelector: {
    marginHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.lg,
  },
  leagueSelectorContent: {
    paddingRight: theme.spacing.lg,
  },
  leagueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.gray[100],
    marginRight: theme.spacing.sm,
  },
  leagueButtonActive: {
    backgroundColor: theme.colors.primary,
  },
  leagueButtonText: {
    fontSize: theme.fontSize.sm,
    fontWeight: '500',
    color: theme.colors.gray[600],
  },
  leagueButtonTextActive: {
    color: theme.colors.white,
  },
  currentUserHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  currentUserTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  currentUserStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  currentUserStat: {
    alignItems: 'center',
  },
  currentUserStatValue: {
    fontSize: theme.fontSize.lg,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  currentUserStatLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.primary,
    marginTop: theme.spacing.xs,
  },
  leaderboard: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
  },
  leaderboardHeader: {
    marginBottom: theme.spacing.lg,
  },
  leaderboardTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: '600',
    color: theme.colors.black,
    marginBottom: theme.spacing.xs,
  },
  leaderboardSubtitle: {
    fontSize: theme.fontSize.md,
    color: theme.colors.gray[600],
  },
  leaderboardEntry: {
    marginBottom: theme.spacing.md,
  },
  leaderboardCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.gray[200],
  },
  currentUserCard: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primaryLight,
  },
  rankContainer: {
    alignItems: 'center',
    marginRight: theme.spacing.md,
    minWidth: 60,
  },
  rankText: {
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
    color: theme.colors.gray[600],
    marginTop: theme.spacing.xs,
  },
  userInfo: {
    flex: 1,
  },
  userHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  userName: {
    fontSize: theme.fontSize.md,
    fontWeight: '600',
    color: theme.colors.black,
  },
  currentUserName: {
    color: theme.colors.primary,
  },
  changeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  changeText: {
    fontSize: theme.fontSize.sm,
    fontWeight: '500',
  },
  userStats: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  userStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  userStatText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.gray[600],
  },
  leagueContainer: {
    alignItems: 'center',
    marginLeft: theme.spacing.md,
  },
  xpText: {
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
    color: theme.colors.gray[600],
    marginTop: theme.spacing.xs,
  },
});
