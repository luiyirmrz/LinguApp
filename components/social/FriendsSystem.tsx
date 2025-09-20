import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  RefreshControl,
  Modal,
  ScrollView,
  Dimensions,
} from 'react-native';
import { theme } from '@/constants/theme';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';
import { useI18n } from '@/hooks/useI18n';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Badge } from '@/components/Badge';
import { ProgressBar } from '@/components/ProgressBar';
import { 
  Users as UsersIcon,
  UserPlus as UserPlusIcon,
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
} from '@/components/icons/LucideReplacement';
import { socialSystemService } from '@/services/social/socialSystem';
import { Friend, FriendRequest } from '@/types';

const { width } = Dimensions.get('window');

interface FriendsSystemProps {
  onNavigateToChat?: (friendId: string) => void;
  onNavigateToProfile?: (userId: string) => void;
}

export default function FriendsSystem({ 
  onNavigateToChat, 
  onNavigateToProfile, 
}: FriendsSystemProps) {
  const { user, signIn, signOut, signUp, resetPassword, updateUser } = useUnifiedAuth();
  const { t } = useI18n();

  // State management
  const [activeTab, setActiveTab] = useState<'friends' | 'requests' | 'search'>('friends');
  const [friends, setFriends] = useState<Friend[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const [showFriendActions, setShowFriendActions] = useState(false);

  useEffect(() => {
    if (user) {
      loadFriendsData();
    }
  }, [user, activeTab]);

  const loadFriendsData = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      if (activeTab === 'friends') {
        const friendsList = await socialSystemService.getFriends(user.id);
        setFriends(friendsList);
      } else if (activeTab === 'requests') {
        const requests = user.friendRequests || [];
        setFriendRequests(requests);
      }
    } catch (error) {
      console.error('Error loading friends data:', error);
      Alert.alert('Error', 'Failed to load friends data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await loadFriendsData();
    setIsRefreshing(false);
  }, [activeTab, user]);

  const handleSearchUsers = async (query: string) => {
    if (!user || !query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      const results = await socialSystemService.searchUsers(query, user.id);
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching users:', error);
      Alert.alert('Error', 'Failed to search users');
    }
  };

  const handleSendFriendRequest = async (targetUserId: string) => {
    if (!user) return;

    try {
      const result = await socialSystemService.sendFriendRequest(
        user.id, 
        targetUserId, 
        'Let\'s learn together!',
      );

      if (result.success) {
        Alert.alert('Success', 'Friend request sent!');
        // Update search results to show pending status
        setSearchResults(prev => 
          prev.map(user => 
            user.id === targetUserId 
              ? { ...user, hasPendingRequest: true }
              : user,
          ),
        );
      } else {
        Alert.alert('Error', result.error || 'Failed to send friend request');
      }
    } catch (error) {
      console.error('Error sending friend request:', error);
      Alert.alert('Error', 'Failed to send friend request');
    }
  };

  const handleAcceptFriendRequest = async (requestId: string) => {
    if (!user) return;

    try {
      const result = await socialSystemService.acceptFriendRequest(requestId, user.id);
      
      if (result.success) {
        Alert.alert('Success', 'Friend request accepted!');
        await loadFriendsData();
      } else {
        Alert.alert('Error', result.error || 'Failed to accept friend request');
      }
    } catch (error) {
      console.error('Error accepting friend request:', error);
      Alert.alert('Error', 'Failed to accept friend request');
    }
  };

  const handleDeclineFriendRequest = async (requestId: string) => {
    if (!user) return;

    try {
      const result = await socialSystemService.declineFriendRequest(requestId, user.id);
      
      if (result.success) {
        Alert.alert('Success', 'Friend request declined');
        await loadFriendsData();
      } else {
        Alert.alert('Error', result.error || 'Failed to decline friend request');
      }
    } catch (error) {
      console.error('Error declining friend request:', error);
      Alert.alert('Error', 'Failed to decline friend request');
    }
  };

  const handleRemoveFriend = async (friendId: string) => {
    if (!user) return;

    Alert.alert(
      'Remove Friend',
      'Are you sure you want to remove this friend?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              const result = await socialSystemService.removeFriend(user.id, friendId);
              
              if (result.success) {
                Alert.alert('Success', 'Friend removed');
                await loadFriendsData();
              } else {
                Alert.alert('Error', result.error || 'Failed to remove friend');
              }
            } catch (error) {
              console.error('Error removing friend:', error);
              Alert.alert('Error', 'Failed to remove friend');
            }
          },
        },
      ],
    );
  };

  const formatLastActive = (lastActive: string): string => {
    const now = new Date();
    const active = new Date(lastActive);
    const diffMs = now.getTime() - active.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return active.toLocaleDateString();
  };

  const renderFriendItem = ({ item }: { item: Friend }) => (
    <Card style={styles.friendCard}>
      <View style={styles.friendHeader}>
        <View style={styles.friendInfo}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>{item.avatar || '👤'}</Text>
            {item.isOnline && <View style={styles.onlineIndicator} />}
          </View>
          <View style={styles.friendDetails}>
            <Text style={styles.friendName}>{item.name}</Text>
            <Text style={styles.friendLevel}>Level {item.level}</Text>
            <View style={styles.friendStats}>
              <View style={styles.statItem}>
                <StarIcon size={12} color={theme.colors.warning} />
                <Text style={styles.statText}>{item.totalXP.toLocaleString()} XP</Text>
              </View>
              <View style={styles.statItem}>
                <TrophyIcon size={12} color={theme.colors.primary} />
                <Text style={styles.statText}>{item.streak} day streak</Text>
              </View>
            </View>
          </View>
        </View>
        <TouchableOpacity
          style={styles.moreButton}
          onPress={() => {
            setSelectedFriend(item);
            setShowFriendActions(true);
          }}
        >
          <MoreVerticalIcon size={20} color={theme.colors.gray[600]} />
        </TouchableOpacity>
      </View>

      <View style={styles.friendFooter}>
        <View style={styles.lastActiveContainer}>
          <ClockIcon size={12} color={theme.colors.gray[500]} />
          <Text style={styles.lastActiveText}>
            {item.isOnline ? 'Online' : `Last active ${formatLastActive(item.lastActive)}`}
          </Text>
        </View>
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.chatButton}
            onPress={() => onNavigateToChat?.(item.id)}
          >
            <MessageCircleIcon size={16} color={theme.colors.primary} />
            <Text style={styles.chatButtonText}>Chat</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => onNavigateToProfile?.(item.id)}
          >
            <UsersIcon size={16} color={theme.colors.gray[600]} />
            <Text style={styles.profileButtonText}>Profile</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Card>
  );

  const renderFriendRequestItem = ({ item }: { item: FriendRequest }) => (
    <Card style={styles.requestCard}>
      <View style={styles.requestHeader}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>{item.fromUserAvatar || '👤'}</Text>
        </View>
        <View style={styles.requestDetails}>
          <Text style={styles.requestName}>{item.fromUserName}</Text>
          <Text style={styles.requestTime}>
            {formatLastActive(item.createdAt)}
          </Text>
          {item.message && (
            <Text style={styles.requestMessage}>"{item.message}"</Text>
          )}
        </View>
      </View>

      <View style={styles.requestActions}>
        <Button
          title="Accept"
          onPress={() => handleAcceptFriendRequest(item.id)}
          style={styles.acceptButton}
          icon={<CheckIcon size={16} color={theme.colors.white} />}
        />
        <Button
          title="Decline"
          onPress={() => handleDeclineFriendRequest(item.id)}
          variant="outline"
          style={styles.declineButton}
          icon={<XIcon size={16} color={theme.colors.danger} />}
        />
      </View>
    </Card>
  );

  const renderSearchResultItem = ({ item }: { item: any }) => (
    <Card style={styles.searchCard}>
      <View style={styles.searchHeader}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>{item.avatar || '👤'}</Text>
        </View>
        <View style={styles.searchDetails}>
          <Text style={styles.searchName}>{item.name}</Text>
          <Text style={styles.searchLevel}>Level {item.level} • {item.totalXP.toLocaleString()} XP</Text>
        </View>
        <View style={styles.searchActions}>
          {item.isAlreadyFriend ? (
            <Badge text="Friends" color={theme.colors.success} size="small" />
          ) : item.hasPendingRequest ? (
            <Badge text="Pending" color={theme.colors.warning} size="small" />
          ) : (
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => handleSendFriendRequest(item.id)}
            >
              <UserPlusIcon size={16} color={theme.colors.primary} />
              <Text style={styles.addButtonText}>Add</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Card>
  );

  const renderTabBar = () => (
    <View style={styles.tabBar}>
      <TouchableOpacity
        style={[styles.tab, activeTab === 'friends' && styles.activeTab]}
        onPress={() => setActiveTab('friends')}
      >
        <UsersIcon size={20} color={activeTab === 'friends' ? theme.colors.primary : theme.colors.gray[600]} />
        <Text style={[styles.tabText, activeTab === 'friends' && styles.activeTabText]}>
          Friends ({friends.length})
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.tab, activeTab === 'requests' && styles.activeTab]}
        onPress={() => setActiveTab('requests')}
      >
        <ClockIcon size={20} color={activeTab === 'requests' ? theme.colors.primary : theme.colors.gray[600]} />
        <Text style={[styles.tabText, activeTab === 'requests' && styles.activeTabText]}>
          Requests ({friendRequests.length})
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.tab, activeTab === 'search' && styles.activeTab]}
        onPress={() => setActiveTab('search')}
      >
        <SearchIcon size={20} color={activeTab === 'search' ? theme.colors.primary : theme.colors.gray[600]} />
        <Text style={[styles.tabText, activeTab === 'search' && styles.activeTabText]}>
          Search
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
          placeholder="Search for users..."
          value={searchQuery}
          onChangeText={(text) => {
            setSearchQuery(text);
            handleSearchUsers(text);
          }}
          placeholderTextColor={theme.colors.gray[500]}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={() => {
              setSearchQuery('');
              setSearchResults([]);
            }}
          >
            <XIcon size={20} color={theme.colors.gray[500]} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const renderContent = () => {
    if (activeTab === 'friends') {
      return (
        <FlatList
          data={friends}
          renderItem={renderFriendItem}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <UsersIcon size={48} color={theme.colors.gray[400]} />
              <Text style={styles.emptyTitle}>No Friends Yet</Text>
              <Text style={styles.emptySubtitle}>
                Start by searching for users to add as friends
              </Text>
              <Button
                title="Search Users"
                onPress={() => setActiveTab('search')}
                style={styles.emptyButton}
              />
            </View>
          }
        />
      );
    }

    if (activeTab === 'requests') {
      return (
        <FlatList
          data={friendRequests}
          renderItem={renderFriendRequestItem}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <ClockIcon size={48} color={theme.colors.gray[400]} />
              <Text style={styles.emptyTitle}>No Friend Requests</Text>
              <Text style={styles.emptySubtitle}>
                You don't have any pending friend requests
              </Text>
            </View>
          }
        />
      );
    }

    if (activeTab === 'search') {
      return (
        <View style={styles.searchContainer}>
          {renderSearchSection()}
          <FlatList
            data={searchResults}
            renderItem={renderSearchResultItem}
            keyExtractor={(item) => item.id}
            ListEmptyComponent={
              searchQuery.length > 0 ? (
                <View style={styles.emptyState}>
                  <SearchIcon size={48} color={theme.colors.gray[400]} />
                  <Text style={styles.emptyTitle}>No Users Found</Text>
                  <Text style={styles.emptySubtitle}>
                    Try searching with a different name
                  </Text>
                </View>
              ) : (
                <View style={styles.emptyState}>
                  <SearchIcon size={48} color={theme.colors.gray[400]} />
                  <Text style={styles.emptyTitle}>Search for Friends</Text>
                  <Text style={styles.emptySubtitle}>
                    Enter a name to find and add friends
                  </Text>
                </View>
              )
            }
          />
        </View>
      );
    }

    return null;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Friends</Text>
        <Text style={styles.subtitle}>Connect with other learners</Text>
      </View>

      {renderTabBar()}
      {renderContent()}

      {/* Friend Actions Modal */}
      <Modal
        visible={showFriendActions}
        transparent
        animationType="fade"
        onRequestClose={() => setShowFriendActions(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Friend Actions</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowFriendActions(false)}
              >
                <XIcon size={24} color={theme.colors.gray[600]} />
              </TouchableOpacity>
            </View>

            {selectedFriend && (
              <View style={styles.modalBody}>
                <View style={styles.friendInfo}>
                  <Text style={styles.friendAvatar}>{selectedFriend.avatar || '👤'}</Text>
                  <Text style={styles.friendName}>{selectedFriend.name}</Text>
                  <Text style={styles.friendLevel}>Level {selectedFriend.level}</Text>
                </View>

                <View style={styles.modalActions}>
                  <Button
                    title="Start Chat"
                    onPress={() => {
                      setShowFriendActions(false);
                      onNavigateToChat?.(selectedFriend.id);
                    }}
                    style={styles.modalActionButton}
                    icon={<MessageCircleIcon size={16} color={theme.colors.white} />}
                  />
                  <Button
                    title="View Profile"
                    onPress={() => {
                      setShowFriendActions(false);
                      onNavigateToProfile?.(selectedFriend.id);
                    }}
                    variant="outline"
                    style={styles.modalActionButton}
                    icon={<UsersIcon size={16} color={theme.colors.primary} />}
                  />
                  <Button
                    title="Remove Friend"
                    onPress={() => {
                      setShowFriendActions(false);
                      handleRemoveFriend(selectedFriend.id);
                    }}
                    variant="outline"
                    style={[styles.modalActionButton, styles.removeButton] as any}
                    icon={<UserMinusIcon size={16} color={theme.colors.danger} />}
                  />
                </View>
              </View>
            )}
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
  friendCard: {
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    padding: theme.spacing.lg,
  },
  friendHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  friendInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: theme.spacing.md,
  },
  avatarText: {
    fontSize: 32,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: theme.colors.gray[100],
    textAlign: 'center',
    lineHeight: 50,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: theme.colors.success,
    borderWidth: 2,
    borderColor: theme.colors.white,
  },
  friendDetails: {
    flex: 1,
  },
  friendName: {
    fontSize: theme.fontSize.lg,
    fontWeight: '600',
    color: theme.colors.black,
    marginBottom: theme.spacing.xs,
  },
  friendLevel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.gray[600],
    marginBottom: theme.spacing.sm,
  },
  friendStats: {
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
    color: theme.colors.gray[600],
  },
  moreButton: {
    padding: theme.spacing.sm,
  },
  friendFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  lastActiveContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  lastActiveText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.gray[500],
  },
  actionButtons: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  chatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    gap: theme.spacing.xs,
  },
  chatButtonText: {
    color: theme.colors.white,
    fontSize: theme.fontSize.sm,
    fontWeight: '500',
  },
  profileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.gray[100],
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    gap: theme.spacing.xs,
  },
  profileButtonText: {
    color: theme.colors.gray[600],
    fontSize: theme.fontSize.sm,
    fontWeight: '500',
  },
  requestCard: {
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    padding: theme.spacing.lg,
  },
  requestHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  requestDetails: {
    flex: 1,
    marginLeft: theme.spacing.md,
  },
  requestName: {
    fontSize: theme.fontSize.lg,
    fontWeight: '600',
    color: theme.colors.black,
    marginBottom: theme.spacing.xs,
  },
  requestTime: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.gray[500],
    marginBottom: theme.spacing.xs,
  },
  requestMessage: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.gray[600],
    fontStyle: 'italic',
  },
  requestActions: {
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
  searchContainer: {
    flex: 1,
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
  searchCard: {
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    padding: theme.spacing.lg,
  },
  searchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchDetails: {
    flex: 1,
    marginLeft: theme.spacing.md,
  },
  searchName: {
    fontSize: theme.fontSize.lg,
    fontWeight: '600',
    color: theme.colors.black,
    marginBottom: theme.spacing.xs,
  },
  searchLevel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.gray[600],
  },
  searchActions: {
    marginLeft: theme.spacing.md,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    gap: theme.spacing.xs,
  },
  addButtonText: {
    color: theme.colors.white,
    fontSize: theme.fontSize.sm,
    fontWeight: '500',
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
  friendAvatar: {
    fontSize: 48,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  modalActions: {
    gap: theme.spacing.md,
  },
  modalActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
  },
  removeButton: {
    borderColor: theme.colors.danger,
  },
});
