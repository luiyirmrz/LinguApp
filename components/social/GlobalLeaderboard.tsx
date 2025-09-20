import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '@/constants/theme';
import { useUnifiedAuth } from "@/hooks/useUnifiedAuth";
import { useI18n } from '@/hooks/useI18n';
import { Card } from '@/components/Card';
import { Badge } from '@/components/Badge';
import { ProgressBar } from '@/components/ProgressBar';
import { 
  Trophy as TrophyIcon,
  Medal as MedalIcon,
  Crown as CrownIcon,
  Star as StarIcon,
  Users as UsersIcon,
  Globe as GlobeIcon,
  TrendingUp as TrendingUpIcon,
  Calendar as CalendarIcon,
  Award as AwardIcon,
  Target as TargetIcon,
  Activity as ActivityIcon,
  Flame as FlameIcon,
  Zap as ZapIcon,
  Shield as ShieldIcon,
} from '@/components/icons/LucideReplacement';
import { socialSystemService } from '@/services/social/socialSystem';

const { width } = Dimensions.get('window');

interface LeaderboardEntry {
  userId: string;
  name: string;
  avatar?: string;
  totalXP: number;
  weeklyXP: number;
  level: number;
  streak: number;
  rank: number;
  country?: string;
  isOnline: boolean;
  lastActive: string;
}

interface GlobalLeaderboardProps {
  onNavigateToProfile?: (userId: string) => void;
}

export default function GlobalLeaderboard({ onNavigateToProfile }: GlobalLeaderboardProps) {
  const { user, signIn, signOut, signUp, resetPassword, updateUser } = useUnifiedAuth();
  const { t } = useI18n();

  // State management
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [activeTab, setActiveTab] = useState<'global' | 'friends' | 'country'>('global');
  const [activeTimeframe, setActiveTimeframe] = useState<'weekly' | 'allTime'>('allTime');
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [userRank, setUserRank] = useState<number | null>(null);

  useEffect(() => {
    loadLeaderboard();
  }, [activeTab, activeTimeframe, user]);

  const loadLeaderboard = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const data = await socialSystemService.getLeaderboard(
        activeTab,
        activeTimeframe,
        user.id,
        50,
      );
      setLeaderboard(data);
      
      // Find user's rank
      const userEntry = data.find(entry => entry.userId === user.id);
      setUserRank(userEntry?.rank || null);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await loadLeaderboard();
    setIsRefreshing(false);
  }, [activeTab, activeTimeframe, user]);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <CrownIcon size={24} color="#FFD700" />;
      case 2:
        return <MedalIcon size={24} color="#C0C0C0" />;
      case 3:
        return <MedalIcon size={24} color="#CD7F32" />;
      default:
        return <TrophyIcon size={20} color={theme.colors.gray[600]} />;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return '#FFD700';
      case 2:
        return '#C0C0C0';
      case 3:
        return '#CD7F32';
      default:
        return theme.colors.gray[600];
    }
  };

  const getCountryFlag = (country?: string) => {
    const flags: { [key: string]: string } = {
      'US': '🇺🇸',
      'UK': '🇬🇧',
      'CA': '🇨🇦',
      'DE': '🇩🇪',
      'FR': '🇫🇷',
      'ES': '🇪🇸',
      'IT': '🇮🇹',
      'JP': '🇯🇵',
      'KR': '🇰🇷',
      'CN': '🇨🇳',
      'BR': '🇧🇷',
      'MX': '🇲🇽',
      'AU': '🇦🇺',
      'IN': '🇮🇳',
      'RU': '🇷🇺',
    };
    return flags[country || ''] || '🌍';
  };

  const formatLastActive = (lastActive: string): string => {
    const now = new Date();
    const active = new Date(lastActive);
    const diffMs = now.getTime() - active.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffMins < 1) return 'Now';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    return 'Offline';
  };

  const renderLeaderboardItem = ({ item, index }: { item: LeaderboardEntry; index: number }) => {
    const isCurrentUser = user && item.userId === user.id;
    const isTopThree = item.rank <= 3;

    return (
      <TouchableOpacity
        style={[
          styles.leaderboardItem,
          isCurrentUser && styles.currentUserItem,
          isTopThree && styles.topThreeItem,
        ]}
        onPress={() => onNavigateToProfile?.(item.userId)}
      >
        <View style={styles.rankContainer}>
          {isTopThree ? (
            <View style={styles.topRankContainer}>
              {getRankIcon(item.rank)}
            </View>
          ) : (
            <View style={styles.rankNumber}>
              <Text style={[
                styles.rankText,
                { color: getRankColor(item.rank) },
              ]}>
                {item.rank}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.userInfo}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>{item.avatar || '👤'}</Text>
            {item.isOnline && <View style={styles.onlineIndicator} />}
          </View>
          <View style={styles.userDetails}>
            <View style={styles.nameContainer}>
              <Text style={[
                styles.userName,
                isCurrentUser && styles.currentUserName,
              ]}>
                {item.name}
                {isCurrentUser && ' (You)'}
              </Text>
              {item.country && (
                <Text style={styles.countryFlag}>
                  {getCountryFlag(item.country)}
                </Text>
              )}
            </View>
            <View style={styles.userStats}>
              <View style={styles.statItem}>
                <StarIcon size={12} color={theme.colors.warning} />
                <Text style={styles.statText}>
                  {activeTimeframe === 'weekly' ? item.weeklyXP.toLocaleString() : item.totalXP.toLocaleString()} XP
                </Text>
              </View>
              <View style={styles.statItem}>
                <TargetIcon size={12} color={theme.colors.primary} />
                <Text style={styles.statText}>Lv.{item.level}</Text>
              </View>
              <View style={styles.statItem}>
                <FlameIcon size={12} color={theme.colors.danger} />
                <Text style={styles.statText}>{item.streak}d</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.statusContainer}>
          <View style={styles.onlineStatus}>
            <View style={[
              styles.statusDot,
              { backgroundColor: item.isOnline ? theme.colors.success : theme.colors.gray[400] },
            ]} />
            <Text style={styles.statusText}>
              {item.isOnline ? 'Online' : formatLastActive(item.lastActive)}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderTopThree = () => {
    const topThree = leaderboard.slice(0, 3);
    if (topThree.length < 3) return null;

    return (
      <View style={styles.topThreeContainer}>
        <Text style={styles.topThreeTitle}>Top 3</Text>
        <View style={styles.podium}>
          {/* Second place */}
          {topThree[1] && (
            <View style={[styles.podiumItem, styles.secondPlace]}>
              <View style={styles.podiumAvatar}>
                <Text style={styles.podiumAvatarText}>{topThree[1].avatar || '👤'}</Text>
                <MedalIcon size={20} color="#C0C0C0" />
              </View>
              <Text style={styles.podiumName}>{topThree[1].name}</Text>
              <Text style={styles.podiumXP}>
                {activeTimeframe === 'weekly' ? topThree[1].weeklyXP.toLocaleString() : topThree[1].totalXP.toLocaleString()} XP
              </Text>
            </View>
          )}

          {/* First place */}
          {topThree[0] && (
            <View style={[styles.podiumItem, styles.firstPlace]}>
              <View style={styles.podiumAvatar}>
                <Text style={styles.podiumAvatarText}>{topThree[0].avatar || '👤'}</Text>
                <CrownIcon size={24} color="#FFD700" />
              </View>
              <Text style={styles.podiumName}>{topThree[0].name}</Text>
              <Text style={styles.podiumXP}>
                {activeTimeframe === 'weekly' ? topThree[0].weeklyXP.toLocaleString() : topThree[0].totalXP.toLocaleString()} XP
              </Text>
            </View>
          )}

          {/* Third place */}
          {topThree[2] && (
            <View style={[styles.podiumItem, styles.thirdPlace]}>
              <View style={styles.podiumAvatar}>
                <Text style={styles.podiumAvatarText}>{topThree[2].avatar || '👤'}</Text>
                <MedalIcon size={20} color="#CD7F32" />
              </View>
              <Text style={styles.podiumName}>{topThree[2].name}</Text>
              <Text style={styles.podiumXP}>
                {activeTimeframe === 'weekly' ? topThree[2].weeklyXP.toLocaleString() : topThree[2].totalXP.toLocaleString()} XP
              </Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  const renderUserRankCard = () => {
    if (!user || !userRank) return null;

    const userEntry = leaderboard.find(entry => entry.userId === user.id);
    if (!userEntry) return null;

    return (
      <Card style={styles.userRankCard}>
        <View style={styles.userRankHeader}>
          <Text style={styles.userRankTitle}>Your Rank</Text>
          <Badge
            text={`#${userRank}`}
            color={userRank <= 10 ? theme.colors.success : userRank <= 50 ? theme.colors.warning : theme.colors.gray[600]}
            size="small"
          />
        </View>
        <View style={styles.userRankContent}>
          <View style={styles.userRankInfo}>
            <Text style={styles.userRankName}>{user.name}</Text>
            <View style={styles.userRankStats}>
              <View style={styles.userRankStat}>
                <StarIcon size={14} color={theme.colors.warning} />
                <Text style={styles.userRankStatText}>
                  {activeTimeframe === 'weekly' ? userEntry.weeklyXP.toLocaleString() : userEntry.totalXP.toLocaleString()} XP
                </Text>
              </View>
              <View style={styles.userRankStat}>
                <TargetIcon size={14} color={theme.colors.primary} />
                <Text style={styles.userRankStatText}>Level {userEntry.level}</Text>
              </View>
              <View style={styles.userRankStat}>
                <FlameIcon size={14} color={theme.colors.danger} />
                <Text style={styles.userRankStatText}>{userEntry.streak} day streak</Text>
              </View>
            </View>
          </View>
        </View>
      </Card>
    );
  };

  const renderTabBar = () => (
    <View style={styles.tabBar}>
      <TouchableOpacity
        style={[styles.tab, activeTab === 'global' && styles.activeTab]}
        onPress={() => setActiveTab('global')}
      >
        <GlobeIcon size={20} color={activeTab === 'global' ? theme.colors.primary : theme.colors.gray[600]} />
        <Text style={[styles.tabText, activeTab === 'global' && styles.activeTabText]}>
          Global
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.tab, activeTab === 'friends' && styles.activeTab]}
        onPress={() => setActiveTab('friends')}
      >
        <UsersIcon size={20} color={activeTab === 'friends' ? theme.colors.primary : theme.colors.gray[600]} />
        <Text style={[styles.tabText, activeTab === 'friends' && styles.activeTabText]}>
          Friends
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.tab, activeTab === 'country' && styles.activeTab]}
        onPress={() => setActiveTab('country')}
      >
        <ShieldIcon size={20} color={activeTab === 'country' ? theme.colors.primary : theme.colors.gray[600]} />
        <Text style={[styles.tabText, activeTab === 'country' && styles.activeTabText]}>
          Country
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderTimeframeSelector = () => (
    <View style={styles.timeframeSelector}>
      <TouchableOpacity
        style={[styles.timeframeTab, activeTimeframe === 'weekly' && styles.activeTimeframeTab]}
        onPress={() => setActiveTimeframe('weekly')}
      >
        <CalendarIcon size={16} color={activeTimeframe === 'weekly' ? theme.colors.primary : theme.colors.gray[600]} />
        <Text style={[styles.timeframeText, activeTimeframe === 'weekly' && styles.activeTimeframeText]}>
          Weekly
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.timeframeTab, activeTimeframe === 'allTime' && styles.activeTimeframeTab]}
        onPress={() => setActiveTimeframe('allTime')}
      >
        <TrophyIcon size={16} color={activeTimeframe === 'allTime' ? theme.colors.primary : theme.colors.gray[600]} />
        <Text style={[styles.timeframeText, activeTimeframe === 'allTime' && styles.activeTimeframeText]}>
          All Time
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Leaderboard</Text>
        <Text style={styles.subtitle}>See how you rank against other learners</Text>
      </View>

      {renderTabBar()}
      {renderTimeframeSelector()}

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {renderTopThree()}
        {renderUserRankCard()}

        <View style={styles.leaderboardSection}>
          <Text style={styles.leaderboardTitle}>Full Rankings</Text>
          <FlatList
            data={leaderboard}
            renderItem={renderLeaderboardItem}
            keyExtractor={(item) => item.userId}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </ScrollView>
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
  timeframeSelector: {
    flexDirection: 'row',
    backgroundColor: theme.colors.gray[50],
    marginHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.xs,
    marginBottom: theme.spacing.lg,
  },
  timeframeTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    gap: theme.spacing.xs,
  },
  activeTimeframeTab: {
    backgroundColor: theme.colors.white,
    shadowColor: theme.colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  timeframeText: {
    fontSize: theme.fontSize.sm,
    fontWeight: '500',
    color: theme.colors.gray[600],
  },
  activeTimeframeText: {
    color: theme.colors.primary,
  },
  content: {
    flex: 1,
  },
  topThreeContainer: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  topThreeTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: '600',
    color: theme.colors.black,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
  podium: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    gap: theme.spacing.md,
  },
  podiumItem: {
    alignItems: 'center',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    minWidth: 80,
  },
  firstPlace: {
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    borderWidth: 2,
    borderColor: '#FFD700',
    transform: [{ scale: 1.1 }],
  },
  secondPlace: {
    backgroundColor: 'rgba(192, 192, 192, 0.1)',
    borderWidth: 2,
    borderColor: '#C0C0C0',
  },
  thirdPlace: {
    backgroundColor: 'rgba(205, 127, 50, 0.1)',
    borderWidth: 2,
    borderColor: '#CD7F32',
  },
  podiumAvatar: {
    position: 'relative',
    marginBottom: theme.spacing.sm,
  },
  podiumAvatarText: {
    fontSize: 32,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: theme.colors.white,
    textAlign: 'center',
    lineHeight: 50,
  },
  podiumName: {
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
    color: theme.colors.black,
    textAlign: 'center',
    marginBottom: theme.spacing.xs,
  },
  podiumXP: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.gray[600],
    textAlign: 'center',
  },
  userRankCard: {
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.primary,
  },
  userRankHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  userRankTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: '600',
    color: theme.colors.white,
  },
  userRankContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userRankInfo: {
    flex: 1,
  },
  userRankName: {
    fontSize: theme.fontSize.lg,
    fontWeight: '600',
    color: theme.colors.white,
    marginBottom: theme.spacing.sm,
  },
  userRankStats: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  userRankStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  userRankStatText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.white,
    opacity: 0.9,
  },
  leaderboardSection: {
    paddingHorizontal: theme.spacing.lg,
  },
  leaderboardTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: '600',
    color: theme.colors.black,
    marginBottom: theme.spacing.md,
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.gray[200],
  },
  currentUserItem: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  topThreeItem: {
    borderColor: theme.colors.warning,
    borderWidth: 2,
  },
  rankContainer: {
    width: 40,
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  topRankContainer: {
    alignItems: 'center',
  },
  rankNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.gray[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankText: {
    fontSize: theme.fontSize.sm,
    fontWeight: 'bold',
  },
  userInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: theme.spacing.md,
  },
  avatarText: {
    fontSize: 24,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.gray[100],
    textAlign: 'center',
    lineHeight: 40,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.colors.success,
    borderWidth: 2,
    borderColor: theme.colors.white,
  },
  userDetails: {
    flex: 1,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  userName: {
    fontSize: theme.fontSize.md,
    fontWeight: '600',
    color: theme.colors.black,
    marginRight: theme.spacing.sm,
  },
  currentUserName: {
    color: theme.colors.white,
  },
  countryFlag: {
    fontSize: 16,
  },
  userStats: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  statText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.gray[600],
  },
  statusContainer: {
    alignItems: 'flex-end',
  },
  onlineStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.gray[500],
  },
});
