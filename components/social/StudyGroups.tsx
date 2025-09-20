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
  TextInput,
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
  Users as UsersIcon,
  Plus as PlusIcon,
  Search as SearchIcon,
  X as XIcon,
  Check as CheckIcon,
  Clock as ClockIcon,
  Star as StarIcon,
  Trophy as TrophyIcon,
  MessageCircle as MessageCircleIcon,
  MoreVertical as MoreVerticalIcon,
  UserMinus as UserMinusIcon,
  Shield as ShieldIcon,
  Globe as GlobeIcon,
  Heart as HeartIcon,
  Activity as ActivityIcon,
  BookOpen as BookOpenIcon,
  Target as TargetIcon,
  Calendar as CalendarIcon,
  Settings as SettingsIcon,
  Crown as CrownIcon,
  UserPlus as UserPlusIcon,
} from '@/components/icons/LucideReplacement';

const { width } = Dimensions.get('window');

interface StudyGroup {
  id: string;
  name: string;
  description: string;
  language: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'all';
  memberCount: number;
  maxMembers: number;
  isPrivate: boolean;
  isJoined: boolean;
  isOwner: boolean;
  owner: {
    id: string;
    name: string;
    avatar?: string;
  };
  members: {
    id: string;
    name: string;
    avatar?: string;
    level: number;
    joinedAt: string;
    isOnline: boolean;
  }[];
  recentActivity: {
    type: 'lesson' | 'challenge' | 'message' | 'achievement';
    user: string;
    description: string;
    timestamp: string;
  }[];
  studyGoals: {
    dailyGoal: number;
    weeklyGoal: number;
    monthlyGoal: number;
  };
  createdAt: string;
  lastActivity: string;
}

interface StudyGroupsProps {
  onNavigateToGroup?: (groupId: string) => void;
  onNavigateToProfile?: (userId: string) => void;
}

export default function StudyGroups({ 
  onNavigateToGroup, 
  onNavigateToProfile, 
}: StudyGroupsProps) {
  const { user, signIn, signOut, signUp, resetPassword, updateUser } = useUnifiedAuth();
  const { t } = useI18n();

  // State management
  const [activeTab, setActiveTab] = useState<'joined' | 'discover' | 'create'>('joined');
  const [groups, setGroups] = useState<StudyGroup[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<StudyGroup | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data for study groups
  const mockGroups: StudyGroup[] = [
    {
      id: 'group_1',
      name: 'Spanish Learners United',
      description: 'A supportive community for Spanish learners of all levels. We practice together, share tips, and motivate each other!',
      language: 'Spanish',
      level: 'all',
      memberCount: 24,
      maxMembers: 50,
      isPrivate: false,
      isJoined: true,
      isOwner: false,
      owner: {
        id: 'user_1',
        name: 'Maria Garcia',
        avatar: '👩‍🎓',
      },
      members: [
        {
          id: 'user_1',
          name: 'Maria Garcia',
          avatar: '👩‍🎓',
          level: 18,
          joinedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          isOnline: true,
        },
        {
          id: 'user_2',
          name: 'Alex Johnson',
          avatar: '👨‍💼',
          level: 12,
          joinedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
          isOnline: false,
        },
        {
          id: user?.id || 'current_user',
          name: user?.name || 'You',
          avatar: user?.avatar || '👤',
          level: user?.level || 10,
          joinedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          isOnline: true,
        },
      ],
      recentActivity: [
        {
          type: 'lesson',
          user: 'Alex Johnson',
          description: 'completed "Basic Greetings" lesson',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        },
        {
          type: 'achievement',
          user: 'Maria Garcia',
          description: 'earned "Grammar Master" badge',
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        },
        {
          type: 'challenge',
          user: 'Chen Wei',
          description: 'won vocabulary challenge',
          timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        },
      ],
      studyGoals: {
        dailyGoal: 30,
        weeklyGoal: 200,
        monthlyGoal: 800,
      },
      createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
      lastActivity: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'group_2',
      name: 'French Conversation Club',
      description: 'Practice French conversation skills with native speakers and fellow learners.',
      language: 'French',
      level: 'intermediate',
      memberCount: 15,
      maxMembers: 25,
      isPrivate: false,
      isJoined: false,
      isOwner: false,
      owner: {
        id: 'user_3',
        name: 'Pierre Dubois',
        avatar: '👨‍🍳',
      },
      members: [
        {
          id: 'user_3',
          name: 'Pierre Dubois',
          avatar: '👨‍🍳',
          level: 25,
          joinedAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
          isOnline: true,
        },
      ],
      recentActivity: [
        {
          type: 'message',
          user: 'Pierre Dubois',
          description: 'shared pronunciation tips',
          timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        },
      ],
      studyGoals: {
        dailyGoal: 45,
        weeklyGoal: 300,
        monthlyGoal: 1200,
      },
      createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
      lastActivity: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'group_3',
      name: 'English Grammar Masters',
      description: 'Advanced English grammar study group for serious learners.',
      language: 'English',
      level: 'advanced',
      memberCount: 8,
      maxMembers: 15,
      isPrivate: true,
      isJoined: true,
      isOwner: true,
      owner: {
        id: user?.id || 'current_user',
        name: user?.name || 'You',
        avatar: user?.avatar || '👤',
      },
      members: [
        {
          id: user?.id || 'current_user',
          name: user?.name || 'You',
          avatar: user?.avatar || '👤',
          level: user?.level || 10,
          joinedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
          isOnline: true,
        },
      ],
      recentActivity: [
        {
          type: 'lesson',
          user: user?.name || 'You',
          description: 'created new grammar exercise',
          timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        },
      ],
      studyGoals: {
        dailyGoal: 60,
        weeklyGoal: 400,
        monthlyGoal: 1600,
      },
      createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
      lastActivity: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    },
  ];

  useEffect(() => {
    loadGroups();
  }, [activeTab, searchQuery]);

  const loadGroups = async () => {
    setIsLoading(true);
    try {
      let filteredGroups = mockGroups;
      
      // Filter based on active tab
      switch (activeTab) {
        case 'joined':
          filteredGroups = mockGroups.filter(g => g.isJoined);
          break;
        case 'discover':
          filteredGroups = mockGroups.filter(g => !g.isJoined);
          break;
      }
      
      // Filter by search query
      if (searchQuery.trim()) {
        filteredGroups = filteredGroups.filter(g => 
          g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          g.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          g.language.toLowerCase().includes(searchQuery.toLowerCase()),
        );
      }
      
      setGroups(filteredGroups);
    } catch (error) {
      console.error('Error loading groups:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await loadGroups();
    setIsRefreshing(false);
  }, [activeTab, searchQuery]);

  const handleJoinGroup = async (groupId: string) => {
    try {
      setGroups(prev => 
        prev.map(g => 
          g.id === groupId 
            ? { 
                ...g, 
                isJoined: true, 
                memberCount: g.memberCount + 1,
                members: [...g.members, {
                  id: user?.id || 'current_user',
                  name: user?.name || 'You',
                  avatar: user?.avatar || '👤',
                  level: user?.level || 10,
                  joinedAt: new Date().toISOString(),
                  isOnline: true,
                }],
              }
            : g,
        ),
      );
      
      Alert.alert('Success', 'You have joined the study group!');
    } catch (error) {
      console.error('Error joining group:', error);
      Alert.alert('Error', 'Failed to join group');
    }
  };

  const handleLeaveGroup = async (groupId: string) => {
    Alert.alert(
      'Leave Group',
      'Are you sure you want to leave this study group?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Leave',
          style: 'destructive',
          onPress: () => {
            setGroups(prev => 
              prev.map(g => 
                g.id === groupId 
                  ? { 
                      ...g, 
                      isJoined: false, 
                      memberCount: g.memberCount - 1,
                      members: g.members.filter(m => m.id !== user?.id),
                    }
                  : g,
              ),
            );
            Alert.alert('Left Group', 'You have left the study group');
          },
        },
      ],
    );
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner':
        return theme.colors.success;
      case 'intermediate':
        return theme.colors.warning;
      case 'advanced':
        return theme.colors.danger;
      case 'all':
        return theme.colors.primary;
      default:
        return theme.colors.gray[600];
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'lesson':
        return <BookOpenIcon size={16} color={theme.colors.primary} />;
      case 'challenge':
        return <TrophyIcon size={16} color={theme.colors.warning} />;
      case 'message':
        return <MessageCircleIcon size={16} color={theme.colors.info} />;
      case 'achievement':
        return <StarIcon size={16} color={theme.colors.success} />;
      default:
        return <ActivityIcon size={16} color={theme.colors.gray[600]} />;
    }
  };

  const formatTimeAgo = (timestamp: string): string => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now.getTime() - time.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return time.toLocaleDateString();
  };

  const renderGroupItem = ({ item }: { item: StudyGroup }) => (
    <Card style={styles.groupCard}>
      <View style={styles.groupHeader}>
        <View style={styles.groupInfo}>
          <View style={styles.groupTitleRow}>
            <Text style={styles.groupName}>{item.name}</Text>
            {item.isPrivate && (
              <ShieldIcon size={16} color={theme.colors.gray[600]} />
            )}
            {item.isOwner && (
              <CrownIcon size={16} color="#FFD700" />
            )}
          </View>
          <Text style={styles.groupDescription}>{item.description}</Text>
          <View style={styles.groupMeta}>
            <Badge
              text={item.language}
              color={theme.colors.primary}
              size="small"
            />
            <Badge
              text={item.level}
              color={getLevelColor(item.level)}
              size="small"
            />
            <View style={styles.memberCount}>
              <UsersIcon size={14} color={theme.colors.gray[500]} />
              <Text style={styles.memberCountText}>
                {item.memberCount}/{item.maxMembers}
              </Text>
            </View>
          </View>
        </View>
        <TouchableOpacity
          style={styles.moreButton}
          onPress={() => {
            setSelectedGroup(item);
            setShowJoinModal(true);
          }}
        >
          <MoreVerticalIcon size={20} color={theme.colors.gray[600]} />
        </TouchableOpacity>
      </View>

      <View style={styles.groupMembers}>
        <Text style={styles.membersTitle}>Members</Text>
        <View style={styles.membersList}>
          {item.members.slice(0, 5).map((member, index) => (
            <TouchableOpacity
              key={member.id}
              style={styles.memberAvatar}
              onPress={() => onNavigateToProfile?.(member.id)}
            >
              <Text style={styles.memberAvatarText}>{member.avatar || '👤'}</Text>
              {member.isOnline && <View style={styles.onlineIndicator} />}
            </TouchableOpacity>
          ))}
          {item.memberCount > 5 && (
            <View style={styles.moreMembers}>
              <Text style={styles.moreMembersText}>+{item.memberCount - 5}</Text>
            </View>
          )}
        </View>
      </View>

      {item.recentActivity.length > 0 && (
        <View style={styles.recentActivity}>
          <Text style={styles.activityTitle}>Recent Activity</Text>
          {item.recentActivity.slice(0, 2).map((activity, index) => (
            <View key={index} style={styles.activityItem}>
              {getActivityIcon(activity.type)}
              <Text style={styles.activityText}>
                <Text style={styles.activityUser}>{activity.user}</Text> {activity.description}
              </Text>
              <Text style={styles.activityTime}>
                {formatTimeAgo(activity.timestamp)}
              </Text>
            </View>
          ))}
        </View>
      )}

      <View style={styles.groupActions}>
        {item.isJoined ? (
          <>
            <Button
              title="Open Group"
              onPress={() => onNavigateToGroup?.(item.id)}
              style={styles.openButton}
              icon={<MessageCircleIcon size={16} color={theme.colors.white} />}
            />
            <Button
              title="Leave"
              onPress={() => handleLeaveGroup(item.id)}
              variant="outline"
              style={styles.leaveButton}
              icon={<UserMinusIcon size={16} color={theme.colors.danger} />}
            />
          </>
        ) : (
          <Button
            title="Join Group"
            onPress={() => handleJoinGroup(item.id)}
            style={styles.joinButton}
            icon={<UserPlusIcon size={16} color={theme.colors.white} />}
          />
        )}
      </View>
    </Card>
  );

  const renderTabBar = () => (
    <View style={styles.tabBar}>
      <TouchableOpacity
        style={[styles.tab, activeTab === 'joined' && styles.activeTab]}
        onPress={() => setActiveTab('joined')}
      >
        <UsersIcon size={20} color={activeTab === 'joined' ? theme.colors.primary : theme.colors.gray[600]} />
        <Text style={[styles.tabText, activeTab === 'joined' && styles.activeTabText]}>
          Joined ({groups.filter(g => g.isJoined).length})
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.tab, activeTab === 'discover' && styles.activeTab]}
        onPress={() => setActiveTab('discover')}
      >
        <SearchIcon size={20} color={activeTab === 'discover' ? theme.colors.primary : theme.colors.gray[600]} />
        <Text style={[styles.tabText, activeTab === 'discover' && styles.activeTabText]}>
          Discover ({groups.filter(g => !g.isJoined).length})
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.tab, activeTab === 'create' && styles.activeTab]}
        onPress={() => setActiveTab('create')}
      >
        <PlusIcon size={20} color={activeTab === 'create' ? theme.colors.primary : theme.colors.gray[600]} />
        <Text style={[styles.tabText, activeTab === 'create' && styles.activeTabText]}>
          Create
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderSearchSection = () => (
    <View style={styles.searchSection}>
      <View style={styles.searchInputContainer}>
        <SearchIcon size={20} color={theme.colors.gray[500]} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search groups..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor={theme.colors.gray[500]}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={() => setSearchQuery('')}
          >
            <XIcon size={20} color={theme.colors.gray[500]} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const renderCreateGroupButton = () => (
    <View style={styles.createButtonContainer}>
      <Button
        title="Create Study Group"
        onPress={() => setShowCreateModal(true)}
        style={styles.createButton}
        icon={<PlusIcon size={20} color={theme.colors.white} />}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Study Groups</Text>
        <Text style={styles.subtitle}>Learn together with friends and peers</Text>
      </View>

      {renderTabBar()}
      {activeTab === 'discover' && renderSearchSection()}
      {activeTab === 'create' && renderCreateGroupButton()}

      <FlatList
        data={groups}
        renderItem={renderGroupItem}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <UsersIcon size={48} color={theme.colors.gray[400]} />
            <Text style={styles.emptyTitle}>
              {activeTab === 'joined' && 'No Joined Groups'}
              {activeTab === 'discover' && 'No Groups Found'}
              {activeTab === 'create' && 'Create Your First Group'}
            </Text>
            <Text style={styles.emptySubtitle}>
              {activeTab === 'joined' && 'Join study groups to start learning together'}
              {activeTab === 'discover' && 'Try searching with different keywords'}
              {activeTab === 'create' && 'Create a study group to invite friends and learn together'}
            </Text>
            <Button
              title={activeTab === 'create' ? 'Create Group' : 'Discover Groups'}
              onPress={() => {
                if (activeTab === 'create') {
                  setShowCreateModal(true);
                } else {
                  setActiveTab('discover');
                }
              }}
              style={styles.emptyButton}
            />
          </View>
        }
        contentContainerStyle={styles.listContainer}
      />

      {/* Create Group Modal */}
      <Modal
        visible={showCreateModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create Study Group</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowCreateModal(false)}
              >
                <XIcon size={24} color={theme.colors.gray[600]} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalBody}>
              <Text style={styles.modalSubtitle}>
                Study group creation feature coming soon! You'll be able to create custom study groups with specific goals and invite friends to join.
              </Text>
              <View style={styles.comingSoonFeatures}>
                <Text style={styles.featureTitle}>Planned Features:</Text>
                <Text style={styles.featureItem}>• Custom group settings</Text>
                <Text style={styles.featureItem}>• Study goals and tracking</Text>
                <Text style={styles.featureItem}>• Member management</Text>
                <Text style={styles.featureItem}>• Group challenges</Text>
                <Text style={styles.featureItem}>• Progress sharing</Text>
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

      {/* Group Details Modal */}
      <Modal
        visible={showJoinModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowJoinModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Group Details</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowJoinModal(false)}
              >
                <XIcon size={24} color={theme.colors.gray[600]} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalBody}>
              {selectedGroup && (
                <>
                  <Text style={styles.groupModalName}>{selectedGroup.name}</Text>
                  <Text style={styles.groupModalDescription}>{selectedGroup.description}</Text>
                  
                  <View style={styles.groupModalMeta}>
                    <View style={styles.modalMetaItem}>
                      <Text style={styles.modalMetaLabel}>Language</Text>
                      <Badge text={selectedGroup.language} color={theme.colors.primary} size="small" />
                    </View>
                    <View style={styles.modalMetaItem}>
                      <Text style={styles.modalMetaLabel}>Level</Text>
                      <Badge text={selectedGroup.level} color={getLevelColor(selectedGroup.level)} size="small" />
                    </View>
                    <View style={styles.modalMetaItem}>
                      <Text style={styles.modalMetaLabel}>Members</Text>
                      <Text style={styles.modalMetaValue}>{selectedGroup.memberCount}/{selectedGroup.maxMembers}</Text>
                    </View>
                  </View>

                  <View style={styles.modalMembers}>
                    <Text style={styles.modalMembersTitle}>All Members</Text>
                    {selectedGroup.members.map((member) => (
                      <View key={member.id} style={styles.modalMemberItem}>
                        <Text style={styles.modalMemberAvatar}>{member.avatar || '👤'}</Text>
                        <View style={styles.modalMemberInfo}>
                          <Text style={styles.modalMemberName}>{member.name}</Text>
                          <Text style={styles.modalMemberLevel}>Level {member.level}</Text>
                        </View>
                        {member.isOnline && <View style={styles.modalOnlineIndicator} />}
                      </View>
                    ))}
                  </View>
                </>
              )}
            </ScrollView>
            <View style={styles.modalFooter}>
              {selectedGroup && !selectedGroup.isJoined ? (
                <Button
                  title="Join Group"
                  onPress={() => {
                    handleJoinGroup(selectedGroup.id);
                    setShowJoinModal(false);
                  }}
                  style={styles.modalButton}
                />
              ) : (
                <Button
                  title="Close"
                  onPress={() => setShowJoinModal(false)}
                  style={styles.modalButton}
                />
              )}
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
  searchSection: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  searchInputContainer: {
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
  clearButton: {
    padding: theme.spacing.xs,
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
  groupCard: {
    marginBottom: theme.spacing.lg,
    padding: theme.spacing.lg,
  },
  groupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.md,
  },
  groupInfo: {
    flex: 1,
    marginRight: theme.spacing.md,
  },
  groupTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
    gap: theme.spacing.sm,
  },
  groupName: {
    fontSize: theme.fontSize.lg,
    fontWeight: '600',
    color: theme.colors.black,
    flex: 1,
  },
  groupDescription: {
    fontSize: theme.fontSize.md,
    color: theme.colors.gray[600],
    marginBottom: theme.spacing.sm,
    lineHeight: 20,
  },
  groupMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  memberCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  memberCountText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.gray[600],
  },
  moreButton: {
    padding: theme.spacing.sm,
  },
  groupMembers: {
    marginBottom: theme.spacing.md,
  },
  membersTitle: {
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
    color: theme.colors.black,
    marginBottom: theme.spacing.sm,
  },
  membersList: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  memberAvatar: {
    position: 'relative',
  },
  memberAvatarText: {
    fontSize: 20,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.gray[100],
    textAlign: 'center',
    lineHeight: 32,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.success,
    borderWidth: 1,
    borderColor: theme.colors.white,
  },
  moreMembers: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.gray[200],
    alignItems: 'center',
    justifyContent: 'center',
  },
  moreMembersText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.gray[600],
    fontWeight: '500',
  },
  recentActivity: {
    marginBottom: theme.spacing.md,
  },
  activityTitle: {
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
    color: theme.colors.black,
    marginBottom: theme.spacing.sm,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
    gap: theme.spacing.sm,
  },
  activityText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.gray[600],
    flex: 1,
  },
  activityUser: {
    fontWeight: '600',
    color: theme.colors.black,
  },
  activityTime: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.gray[500],
  },
  groupActions: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  openButton: {
    flex: 1,
    backgroundColor: theme.colors.primary,
  },
  leaveButton: {
    flex: 1,
    borderColor: theme.colors.danger,
  },
  joinButton: {
    flex: 1,
    backgroundColor: theme.colors.success,
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
  groupModalName: {
    fontSize: theme.fontSize.lg,
    fontWeight: '600',
    color: theme.colors.black,
    marginBottom: theme.spacing.sm,
  },
  groupModalDescription: {
    fontSize: theme.fontSize.md,
    color: theme.colors.gray[600],
    lineHeight: 20,
    marginBottom: theme.spacing.lg,
  },
  groupModalMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  modalMetaItem: {
    alignItems: 'center',
  },
  modalMetaLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.gray[600],
    marginBottom: theme.spacing.xs,
  },
  modalMetaValue: {
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
    color: theme.colors.black,
  },
  modalMembers: {
    marginBottom: theme.spacing.lg,
  },
  modalMembersTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: '600',
    color: theme.colors.black,
    marginBottom: theme.spacing.md,
  },
  modalMemberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    gap: theme.spacing.md,
  },
  modalMemberAvatar: {
    fontSize: 24,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.gray[100],
    textAlign: 'center',
    lineHeight: 40,
  },
  modalMemberInfo: {
    flex: 1,
  },
  modalMemberName: {
    fontSize: theme.fontSize.md,
    fontWeight: '600',
    color: theme.colors.black,
  },
  modalMemberLevel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.gray[600],
  },
  modalOnlineIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.colors.success,
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
