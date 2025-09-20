import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { theme } from '@/constants/theme';
import { Trophy, Users, Globe, Medal, Crown, Star } from '@/components/icons/LucideReplacement';

export default function LeaderboardScreen() {
  const [selectedTab, setSelectedTab] = useState<'weekly' | 'monthly' | 'alltime'>('weekly');

  // Mock leaderboard data
  const leaderboardData = {
    weekly: [
      { rank: 1, name: 'Alex Chen', xp: 1250, streak: 12, avatar: '👑' },
      { rank: 2, name: 'Sarah Johnson', xp: 1180, streak: 10, avatar: '🥇' },
      { rank: 3, name: 'Mike Rodriguez', xp: 1100, streak: 9, avatar: '🥈' },
      { rank: 4, name: 'Emma Wilson', xp: 1050, streak: 8, avatar: '🥉' },
      { rank: 5, name: 'You', xp: 950, streak: 7, avatar: '👤' },
      { rank: 6, name: 'David Kim', xp: 900, streak: 6, avatar: '👤' },
      { rank: 7, name: 'Lisa Brown', xp: 850, streak: 5, avatar: '👤' },
    ],
    monthly: [
      { rank: 1, name: 'Alex Chen', xp: 5200, streak: 25, avatar: '👑' },
      { rank: 2, name: 'Sarah Johnson', xp: 4800, streak: 22, avatar: '🥇' },
      { rank: 3, name: 'Mike Rodriguez', xp: 4500, streak: 20, avatar: '🥈' },
      { rank: 4, name: 'Emma Wilson', xp: 4200, streak: 18, avatar: '🥉' },
      { rank: 5, name: 'You', xp: 3800, streak: 15, avatar: '👤' },
    ],
    alltime: [
      { rank: 1, name: 'Alex Chen', xp: 25000, streak: 45, avatar: '👑' },
      { rank: 2, name: 'Sarah Johnson', xp: 22000, streak: 40, avatar: '🥇' },
      { rank: 3, name: 'Mike Rodriguez', xp: 20000, streak: 35, avatar: '🥈' },
      { rank: 4, name: 'Emma Wilson', xp: 18000, streak: 32, avatar: '🥉' },
      { rank: 5, name: 'You', xp: 15000, streak: 28, avatar: '👤' },
    ],
  };

  const currentData = leaderboardData[selectedTab];

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown size={24} color="#FFD700" />;
      case 2:
        return <Medal size={24} color="#C0C0C0" />;
      case 3:
        return <Medal size={24} color="#CD7F32" />;
      default:
        return <Text style={styles.rankNumber}>#{rank}</Text>;
    }
  };

  const renderLeaderboardItem = (item: any) => (
    <View 
      key={item.rank}
      style={[
        styles.leaderboardItem,
        item.name === 'You' && styles.currentUserItem,
      ]}
    >
      <View style={styles.rankContainer}>
        {getRankIcon(item.rank)}
      </View>
      
      <View style={styles.avatarContainer}>
        <Text style={styles.avatar}>{item.avatar}</Text>
      </View>
      
      <View style={styles.userInfo}>
        <Text style={[
          styles.userName,
          item.name === 'You' && styles.currentUserName,
        ]}>
          {item.name}
        </Text>
        <View style={styles.userStats}>
          <View style={styles.statItem}>
            <Star size={14} color={theme.colors.primary} />
            <Text style={styles.statText}>{item.xp} XP</Text>
          </View>
          <View style={styles.statItem}>
            <Trophy size={14} color={theme.colors.orange} />
            <Text style={styles.statText}>{item.streak} streak</Text>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Leaderboard</Text>
        <Text style={styles.subtitle}>Compete with learners worldwide</Text>
      </View>

      {/* Tab Selector */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'weekly' && styles.activeTab]}
          onPress={() => setSelectedTab('weekly')}
        >
          <Text style={[styles.tabText, selectedTab === 'weekly' && styles.activeTabText]}>
            Weekly
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'monthly' && styles.activeTab]}
          onPress={() => setSelectedTab('monthly')}
        >
          <Text style={[styles.tabText, selectedTab === 'monthly' && styles.activeTabText]}>
            Monthly
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'alltime' && styles.activeTab]}
          onPress={() => setSelectedTab('alltime')}
        >
          <Text style={[styles.tabText, selectedTab === 'alltime' && styles.activeTabText]}>
            All Time
          </Text>
        </TouchableOpacity>
      </View>

      {/* Leaderboard */}
      <ScrollView style={styles.leaderboard} showsVerticalScrollIndicator={false}>
        <View style={styles.leaderboardHeader}>
          <Text style={styles.leaderboardTitle}>
            {selectedTab === 'weekly' && 'This Week'}
            {selectedTab === 'monthly' && 'This Month'}
            {selectedTab === 'alltime' && 'All Time'}
          </Text>
          <View style={styles.totalUsers}>
            <Users size={16} color={theme.colors.textSecondary} />
            <Text style={styles.totalUsersText}>{currentData.length} learners</Text>
          </View>
        </View>

        <View style={styles.leaderboardList}>
          {currentData.map(renderLeaderboardItem)}
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
    padding: theme.spacing.lg,
    paddingTop: theme.spacing.md,
  },
  title: {
    fontSize: theme.fontSize.xxl,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  subtitle: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    alignItems: 'center',
    borderRadius: theme.borderRadius.sm,
  },
  activeTab: {
    backgroundColor: theme.colors.primary,
  },
  tabText: {
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  activeTabText: {
    color: theme.colors.white,
  },
  leaderboard: {
    flex: 1,
  },
  leaderboardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  leaderboardTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  totalUsers: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  totalUsersText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  leaderboardList: {
    paddingHorizontal: theme.spacing.lg,
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
  },
  currentUserItem: {
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  rankContainer: {
    width: 40,
    alignItems: 'center',
  },
  rankNumber: {
    fontSize: theme.fontSize.md,
    fontWeight: 'bold',
    color: theme.colors.textSecondary,
  },
  avatarContainer: {
    marginHorizontal: theme.spacing.md,
  },
  avatar: {
    fontSize: 24,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: theme.fontSize.md,
    fontWeight: '600',
    color: theme.colors.text,
  },
  currentUserName: {
    color: theme.colors.primary,
  },
  userStats: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginTop: theme.spacing.xs,
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
