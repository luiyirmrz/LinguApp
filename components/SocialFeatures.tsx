import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { theme } from '@/constants/theme';
import { 
  Users,
  Trophy,
  MessageCircle,
  Target,
  BookOpen,
  Bell,
} from '@/components/icons/LucideReplacement';

// Import the new social components
import FriendsSystem from '@/components/social/FriendsSystem';
import GlobalLeaderboard from '@/components/social/GlobalLeaderboard';
import UserChallenges from '@/components/social/UserChallenges';
import StudyGroups from '@/components/social/StudyGroups';
import FriendChat from '@/components/social/FriendChat';
import SocialNotifications from '@/components/social/SocialNotifications';

interface SocialFeaturesProps {
  onNavigateToProfile?: (userId: string) => void;
  onNavigateToChallenge?: (challengeId: string) => void;
  onNavigateToGroup?: (groupId: string) => void;
  onNavigateToChat?: (userId: string) => void;
}

export default function SocialFeatures({
  onNavigateToProfile,
  onNavigateToChallenge,
  onNavigateToGroup,
  onNavigateToChat,
}: SocialFeaturesProps) {
  const [activeTab, setActiveTab] = useState<'friends' | 'leaderboard' | 'challenges' | 'groups' | 'chat' | 'notifications'>('friends');

  const renderTabBar = () => (
    <View style={styles.tabBar}>
      <TouchableOpacity
        style={[styles.tab, activeTab === 'friends' && styles.activeTab]}
        onPress={() => setActiveTab('friends')}
      >
        <Users size={20} color={activeTab === 'friends' ? theme.colors.primary : theme.colors.gray[600]} />
        <Text style={[styles.tabText, activeTab === 'friends' && styles.activeTabText]}>Friends</Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.tab, activeTab === 'leaderboard' && styles.activeTab]}
        onPress={() => setActiveTab('leaderboard')}
      >
        <Trophy size={20} color={activeTab === 'leaderboard' ? theme.colors.primary : theme.colors.gray[600]} />
        <Text style={[styles.tabText, activeTab === 'leaderboard' && styles.activeTabText]}>Leaderboard</Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.tab, activeTab === 'challenges' && styles.activeTab]}
        onPress={() => setActiveTab('challenges')}
      >
        <Target size={20} color={activeTab === 'challenges' ? theme.colors.primary : theme.colors.gray[600]} />
        <Text style={[styles.tabText, activeTab === 'challenges' && styles.activeTabText]}>Challenges</Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.tab, activeTab === 'groups' && styles.activeTab]}
        onPress={() => setActiveTab('groups')}
      >
        <BookOpen size={20} color={activeTab === 'groups' ? theme.colors.primary : theme.colors.gray[600]} />
        <Text style={[styles.tabText, activeTab === 'groups' && styles.activeTabText]}>Groups</Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.tab, activeTab === 'chat' && styles.activeTab]}
        onPress={() => setActiveTab('chat')}
      >
        <MessageCircle size={20} color={activeTab === 'chat' ? theme.colors.primary : theme.colors.gray[600]} />
        <Text style={[styles.tabText, activeTab === 'chat' && styles.activeTabText]}>Chat</Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.tab, activeTab === 'notifications' && styles.activeTab]}
        onPress={() => setActiveTab('notifications')}
      >
        <Bell size={20} color={activeTab === 'notifications' ? theme.colors.primary : theme.colors.gray[600]} />
        <Text style={[styles.tabText, activeTab === 'notifications' && styles.activeTabText]}>Notifications</Text>
      </TouchableOpacity>
    </View>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'friends':
        return (
          <FriendsSystem
            onNavigateToProfile={onNavigateToProfile}
            onNavigateToChat={onNavigateToChat}
          />
        );

      case 'leaderboard':
        return (
          <GlobalLeaderboard
            onNavigateToProfile={onNavigateToProfile}
          />
        );

      case 'challenges':
        return (
          <UserChallenges
            onNavigateToProfile={onNavigateToProfile}
            onNavigateToChallenge={onNavigateToChallenge}
          />
        );

      case 'groups':
        return (
          <StudyGroups
            onNavigateToProfile={onNavigateToProfile}
            onNavigateToGroup={onNavigateToGroup}
          />
        );

      case 'chat':
        return (
          <FriendChat
            friend={{ id: 'temp', name: 'Friend', avatar: '', isOnline: false, level: 1, lastActive: new Date().toISOString() }}
            onBack={() => {}}
            onNavigateToProfile={onNavigateToProfile}
          />
        );

      case 'notifications':
        return (
          <SocialNotifications
            onNavigateToProfile={onNavigateToProfile}
            onNavigateToChallenge={onNavigateToChallenge}
            onNavigateToGroup={onNavigateToGroup}
            onNavigateToChat={onNavigateToChat}
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
    fontSize: theme.fontSize.sm,
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
