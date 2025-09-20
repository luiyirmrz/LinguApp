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
import { theme } from '@/constants/theme';
import { useUnifiedAuth } from "@/hooks/useUnifiedAuth";
import { useI18n } from '@/hooks/useI18n';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Badge } from '@/components/Badge';
import { 
  Bell as BellIcon,
  Check as CheckIcon,
  X as XIcon,
  Users as UsersIcon,
  Trophy as TrophyIcon,
  MessageCircle as MessageCircleIcon,
  UserPlus as UserPlusIcon,
  Star as StarIcon,
  Target as TargetIcon,
  BookOpen as BookOpenIcon,
  Zap as ZapIcon,
  Heart as HeartIcon,
  Crown as CrownIcon,
  Medal as MedalIcon,
  Clock as ClockIcon,
  Settings as SettingsIcon,
  Trash as TrashIcon,
  Eye as EyeIcon,
  EyeOff as EyeOffIcon,
} from '@/components/icons/LucideReplacement';

const { width } = Dimensions.get('window');

interface SocialNotification {
  id: string;
  type: 'friend_request' | 'friend_accepted' | 'challenge_received' | 'challenge_completed' | 'achievement_earned' | 'group_invite' | 'group_activity' | 'message_received' | 'streak_milestone' | 'level_up';
  title: string;
  message: string;
  sender?: {
    id: string;
    name: string;
    avatar?: string;
  };
  isRead: boolean;
  isActionable: boolean;
  actionRequired?: 'accept' | 'decline' | 'view' | 'join';
  timestamp: string;
  metadata?: {
    friendRequestId?: string;
    challengeId?: string;
    groupId?: string;
    achievementId?: string;
    messageId?: string;
  };
}

interface SocialNotificationsProps {
  onNavigateToProfile?: (userId: string) => void;
  onNavigateToChallenge?: (challengeId: string) => void;
  onNavigateToGroup?: (groupId: string) => void;
  onNavigateToChat?: (userId: string) => void;
}

export default function SocialNotifications({
  onNavigateToProfile,
  onNavigateToChallenge,
  onNavigateToGroup,
  onNavigateToChat,
}: SocialNotificationsProps) {
  const { user, signIn, signOut, signUp, resetPassword, updateUser } = useUnifiedAuth();
  const { t } = useI18n();

  // State management
  const [notifications, setNotifications] = useState<SocialNotification[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'actionable'>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<SocialNotification | null>(null);
  const [showNotificationDetails, setShowNotificationDetails] = useState(false);

  // Mock notifications data
  const mockNotifications: SocialNotification[] = [
    {
      id: 'notif_1',
      type: 'friend_request',
      title: 'New Friend Request',
      message: 'Alex Johnson wants to be your friend',
      sender: {
        id: 'user_1',
        name: 'Alex Johnson',
        avatar: '👨‍💼',
      },
      isRead: false,
      isActionable: true,
      actionRequired: 'accept',
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      metadata: {
        friendRequestId: 'friend_request_1',
      },
    },
    {
      id: 'notif_2',
      type: 'challenge_received',
      title: 'Challenge Received',
      message: 'Maria Garcia challenged you to a vocabulary quiz',
      sender: {
        id: 'user_2',
        name: 'Maria Garcia',
        avatar: '👩‍🎓',
      },
      isRead: false,
      isActionable: true,
      actionRequired: 'accept',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      metadata: {
        challengeId: 'challenge_vocab_quiz',
      },
    },
    {
      id: 'notif_3',
      type: 'achievement_earned',
      title: 'Achievement Unlocked',
      message: 'You earned the "Grammar Master" badge!',
      isRead: true,
      isActionable: false,
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      metadata: {
        achievementId: 'achievement_grammar_master',
      },
    },
    {
      id: 'notif_4',
      type: 'friend_accepted',
      title: 'Friend Request Accepted',
      message: 'Chen Wei accepted your friend request',
      sender: {
        id: 'user_3',
        name: 'Chen Wei',
        avatar: '👨‍🔬',
      },
      isRead: true,
      isActionable: false,
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'notif_5',
      type: 'group_invite',
      title: 'Group Invitation',
      message: 'You\'re invited to join "Spanish Learners United"',
      sender: {
        id: 'user_4',
        name: 'Pierre Dubois',
        avatar: '👨‍🍳',
      },
      isRead: false,
      isActionable: true,
      actionRequired: 'join',
      timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
      metadata: {
        groupId: 'group_spanish_learners',
      },
    },
    {
      id: 'notif_6',
      type: 'streak_milestone',
      title: 'Streak Milestone',
      message: 'Congratulations! You\'ve reached a 7-day learning streak!',
      isRead: true,
      isActionable: false,
      timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'notif_7',
      type: 'level_up',
      title: 'Level Up!',
      message: 'You\'ve reached Level 12! Keep up the great work!',
      isRead: true,
      isActionable: false,
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'notif_8',
      type: 'message_received',
      title: 'New Message',
      message: 'You have a new message from Alex Johnson',
      sender: {
        id: 'user_1',
        name: 'Alex Johnson',
        avatar: '👨‍💼',
      },
      isRead: false,
      isActionable: true,
      actionRequired: 'view',
      timestamp: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(),
      metadata: {
        messageId: 'msg_123',
      },
    },
  ];

  useEffect(() => {
    loadNotifications();
  }, [activeTab]);

  const loadNotifications = async () => {
    setIsLoading(true);
    try {
      let filteredNotifications = mockNotifications;
      
      switch (activeTab) {
        case 'unread':
          filteredNotifications = mockNotifications.filter(n => !n.isRead);
          break;
        case 'actionable':
          filteredNotifications = mockNotifications.filter(n => n.isActionable);
          break;
      }
      
      // Sort by timestamp (newest first)
      filteredNotifications.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      );
      
      setNotifications(filteredNotifications);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await loadNotifications();
    setIsRefreshing(false);
  }, [activeTab]);

  const handleMarkAsRead = async (notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => 
        n.id === notificationId 
          ? { ...n, isRead: true }
          : n,
      ),
    );
  };

  const handleMarkAllAsRead = async () => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, isRead: true })),
    );
    Alert.alert('Success', 'All notifications marked as read');
  };

  const handleDeleteNotification = async (notificationId: string) => {
    Alert.alert(
      'Delete Notification',
      'Are you sure you want to delete this notification?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setNotifications(prev => prev.filter(n => n.id !== notificationId));
          },
        },
      ],
    );
  };

  const handleNotificationAction = async (notification: SocialNotification) => {
    switch (notification.actionRequired) {
      case 'accept':
        if (notification.type === 'friend_request') {
          Alert.alert('Friend Request', 'Friend request accepted!');
        } else if (notification.type === 'challenge_received') {
          onNavigateToChallenge?.(notification.metadata?.challengeId || '');
        }
        break;
      case 'decline':
        Alert.alert('Request Declined', 'Request has been declined');
        break;
      case 'view':
        if (notification.type === 'message_received') {
          onNavigateToChat?.(notification.sender?.id || '');
        }
        break;
      case 'join':
        onNavigateToGroup?.(notification.metadata?.groupId || '');
        break;
    }
    
    // Mark as read after action
    handleMarkAsRead(notification.id);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'friend_request':
        return <UserPlusIcon size={20} color={theme.colors.primary} />;
      case 'friend_accepted':
        return <CheckIcon size={20} color={theme.colors.success} />;
      case 'challenge_received':
        return <TrophyIcon size={20} color={theme.colors.warning} />;
      case 'challenge_completed':
        return <MedalIcon size={20} color={theme.colors.success} />;
      case 'achievement_earned':
        return <StarIcon size={20} color={theme.colors.warning} />;
      case 'group_invite':
        return <UsersIcon size={20} color={theme.colors.info} />;
      case 'group_activity':
        return <UsersIcon size={20} color={theme.colors.primary} />;
      case 'message_received':
        return <MessageCircleIcon size={20} color={theme.colors.primary} />;
      case 'streak_milestone':
        return <ZapIcon size={20} color={theme.colors.danger} />;
      case 'level_up':
        return <CrownIcon size={20} color="#FFD700" />;
      default:
        return <BellIcon size={20} color={theme.colors.gray[600]} />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'friend_request':
        return theme.colors.primary;
      case 'friend_accepted':
        return theme.colors.success;
      case 'challenge_received':
        return theme.colors.warning;
      case 'challenge_completed':
        return theme.colors.success;
      case 'achievement_earned':
        return theme.colors.warning;
      case 'group_invite':
        return theme.colors.info;
      case 'group_activity':
        return theme.colors.primary;
      case 'message_received':
        return theme.colors.primary;
      case 'streak_milestone':
        return theme.colors.danger;
      case 'level_up':
        return '#FFD700';
      default:
        return theme.colors.gray[600];
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

  const renderNotificationItem = ({ item }: { item: SocialNotification }) => (
    <Card style={[
      styles.notificationCard,
      !item.isRead && styles.unreadNotification,
    ] as any}>
      <TouchableOpacity
        style={styles.notificationContent}
        onPress={() => {
          setSelectedNotification(item);
          setShowNotificationDetails(true);
          if (!item.isRead) {
            handleMarkAsRead(item.id);
          }
        }}
      >
        <View style={styles.notificationHeader}>
          <View style={styles.notificationIcon}>
            {getNotificationIcon(item.type)}
          </View>
          <View style={styles.notificationInfo}>
            <Text style={[
              styles.notificationTitle,
              !item.isRead && styles.unreadTitle,
            ]}>
              {item.title}
            </Text>
            <Text style={styles.notificationMessage}>{item.message}</Text>
            {item.sender && (
              <View style={styles.senderInfo}>
                <Text style={styles.senderAvatar}>{item.sender.avatar || '👤'}</Text>
                <Text style={styles.senderName}>{item.sender.name}</Text>
              </View>
            )}
          </View>
          <View style={styles.notificationMeta}>
            <Text style={styles.notificationTime}>
              {formatTimeAgo(item.timestamp)}
            </Text>
            {!item.isRead && <View style={styles.unreadIndicator} />}
          </View>
        </View>
      </TouchableOpacity>

      {item.isActionable && (
        <View style={styles.notificationActions}>
          {item.actionRequired === 'accept' && (
            <>
              <Button
                title="Accept"
                onPress={() => handleNotificationAction(item)}
                style={styles.acceptButton}
                icon={<CheckIcon size={16} color={theme.colors.white} />}
              />
              <Button
                title="Decline"
                onPress={() => {
                  handleNotificationAction({ ...item, actionRequired: 'decline' });
                  handleDeleteNotification(item.id);
                }}
                variant="outline"
                style={styles.declineButton}
                icon={<XIcon size={16} color={theme.colors.danger} />}
              />
            </>
          )}
          {item.actionRequired === 'view' && (
            <Button
              title="View"
              onPress={() => handleNotificationAction(item)}
              style={styles.viewButton}
            />
          )}
          {item.actionRequired === 'join' && (
            <Button
              title="Join"
              onPress={() => handleNotificationAction(item)}
              style={styles.joinButton}
            />
          )}
        </View>
      )}
    </Card>
  );

  const renderTabBar = () => (
    <View style={styles.tabBar}>
      <TouchableOpacity
        style={[styles.tab, activeTab === 'all' && styles.activeTab]}
        onPress={() => setActiveTab('all')}
      >
        <BellIcon size={20} color={activeTab === 'all' ? theme.colors.primary : theme.colors.gray[600]} />
        <Text style={[styles.tabText, activeTab === 'all' && styles.activeTabText]}>
          All ({notifications.length})
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.tab, activeTab === 'unread' && styles.activeTab]}
        onPress={() => setActiveTab('unread')}
      >
        <EyeIcon size={20} color={activeTab === 'unread' ? theme.colors.primary : theme.colors.gray[600]} />
        <Text style={[styles.tabText, activeTab === 'unread' && styles.activeTabText]}>
          Unread ({notifications.filter(n => !n.isRead).length})
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.tab, activeTab === 'actionable' && styles.activeTab]}
        onPress={() => setActiveTab('actionable')}
      >
        <TargetIcon size={20} color={activeTab === 'actionable' ? theme.colors.primary : theme.colors.gray[600]} />
        <Text style={[styles.tabText, activeTab === 'actionable' && styles.activeTabText]}>
          Actionable ({notifications.filter(n => n.isActionable).length})
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        <Text style={styles.title}>Notifications</Text>
        <Text style={styles.subtitle}>Stay updated with your social activity</Text>
      </View>
      <View style={styles.headerRight}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={handleMarkAllAsRead}
        >
          <CheckIcon size={20} color={theme.colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => setShowSettings(true)}
        >
          <SettingsIcon size={20} color={theme.colors.gray[600]} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {renderHeader()}
      {renderTabBar()}

      <FlatList
        data={notifications}
        renderItem={renderNotificationItem}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <BellIcon size={48} color={theme.colors.gray[400]} />
            <Text style={styles.emptyTitle}>No Notifications</Text>
            <Text style={styles.emptySubtitle}>
              {activeTab === 'all' && 'You don\'t have any notifications yet'}
              {activeTab === 'unread' && 'You\'re all caught up! No unread notifications'}
              {activeTab === 'actionable' && 'No notifications requiring action'}
            </Text>
          </View>
        }
        contentContainerStyle={styles.listContainer}
      />

      {/* Notification Details Modal */}
      <Modal
        visible={showNotificationDetails}
        transparent
        animationType="fade"
        onRequestClose={() => setShowNotificationDetails(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Notification Details</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowNotificationDetails(false)}
              >
                <XIcon size={24} color={theme.colors.gray[600]} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalBody}>
              {selectedNotification && (
                <>
                  <View style={styles.modalNotificationHeader}>
                    <View style={styles.modalNotificationIcon}>
                      {getNotificationIcon(selectedNotification.type)}
                    </View>
                    <View style={styles.modalNotificationInfo}>
                      <Text style={styles.modalNotificationTitle}>
                        {selectedNotification.title}
                      </Text>
                      <Text style={styles.modalNotificationTime}>
                        {formatTimeAgo(selectedNotification.timestamp)}
                      </Text>
                    </View>
                  </View>
                  
                  <Text style={styles.modalNotificationMessage}>
                    {selectedNotification.message}
                  </Text>
                  
                  {selectedNotification.sender && (
                    <View style={styles.modalSenderInfo}>
                      <Text style={styles.modalSenderAvatar}>
                        {selectedNotification.sender.avatar || '👤'}
                      </Text>
                      <View style={styles.modalSenderDetails}>
                        <Text style={styles.modalSenderName}>
                          {selectedNotification.sender.name}
                        </Text>
                        <Text style={styles.modalSenderLabel}>From</Text>
                      </View>
                    </View>
                  )}
                  
                  {selectedNotification.isActionable && (
                    <View style={styles.modalActions}>
                      <Text style={styles.modalActionsTitle}>Actions Available:</Text>
                      {selectedNotification.actionRequired === 'accept' && (
                        <Text style={styles.modalActionItem}>• Accept or decline the request</Text>
                      )}
                      {selectedNotification.actionRequired === 'view' && (
                        <Text style={styles.modalActionItem}>• View the message or content</Text>
                      )}
                      {selectedNotification.actionRequired === 'join' && (
                        <Text style={styles.modalActionItem}>• Join the group or activity</Text>
                      )}
                    </View>
                  )}
                </>
              )}
            </ScrollView>
            <View style={styles.modalFooter}>
              <Button
                title="Close"
                onPress={() => setShowNotificationDetails(false)}
                style={styles.modalButton}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Settings Modal */}
      <Modal
        visible={showSettings}
        transparent
        animationType="slide"
        onRequestClose={() => setShowSettings(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Notification Settings</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowSettings(false)}
              >
                <XIcon size={24} color={theme.colors.gray[600]} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalBody}>
              <Text style={styles.modalSubtitle}>
                Notification settings feature coming soon! You'll be able to customize which types of notifications you receive.
              </Text>
              <View style={styles.comingSoonFeatures}>
                <Text style={styles.featureTitle}>Planned Features:</Text>
                <Text style={styles.featureItem}>• Friend request notifications</Text>
                <Text style={styles.featureItem}>• Challenge notifications</Text>
                <Text style={styles.featureItem}>• Achievement notifications</Text>
                <Text style={styles.featureItem}>• Group activity notifications</Text>
                <Text style={styles.featureItem}>• Message notifications</Text>
                <Text style={styles.featureItem}>• Push notification preferences</Text>
              </View>
            </ScrollView>
            <View style={styles.modalFooter}>
              <Button
                title="Got it!"
                onPress={() => setShowSettings(false)}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
  },
  headerLeft: {
    flex: 1,
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
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    padding: theme.spacing.sm,
    marginLeft: theme.spacing.sm,
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
  listContainer: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
  },
  notificationCard: {
    marginBottom: theme.spacing.md,
    padding: theme.spacing.lg,
  },
  unreadNotification: {
    backgroundColor: theme.colors.primary,
    opacity: 0.05,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary,
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.gray[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  notificationInfo: {
    flex: 1,
    marginRight: theme.spacing.md,
  },
  notificationTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: '600',
    color: theme.colors.black,
    marginBottom: theme.spacing.xs,
  },
  unreadTitle: {
    color: theme.colors.primary,
  },
  notificationMessage: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.gray[600],
    lineHeight: 18,
    marginBottom: theme.spacing.sm,
  },
  senderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  senderAvatar: {
    fontSize: 16,
    marginRight: theme.spacing.sm,
  },
  senderName: {
    fontSize: theme.fontSize.sm,
    fontWeight: '500',
    color: theme.colors.primary,
  },
  notificationMeta: {
    alignItems: 'flex-end',
  },
  notificationTime: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.gray[500],
    marginBottom: theme.spacing.xs,
  },
  unreadIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.primary,
  },
  notificationActions: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginTop: theme.spacing.md,
  },
  acceptButton: {
    flex: 1,
    backgroundColor: theme.colors.success,
  },
  declineButton: {
    flex: 1,
    borderColor: theme.colors.danger,
  },
  viewButton: {
    flex: 1,
    backgroundColor: theme.colors.primary,
  },
  joinButton: {
    flex: 1,
    backgroundColor: theme.colors.info,
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
  modalNotificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  modalNotificationIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.gray[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  modalNotificationInfo: {
    flex: 1,
  },
  modalNotificationTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: '600',
    color: theme.colors.black,
    marginBottom: theme.spacing.xs,
  },
  modalNotificationTime: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.gray[500],
  },
  modalNotificationMessage: {
    fontSize: theme.fontSize.md,
    color: theme.colors.gray[600],
    lineHeight: 22,
    marginBottom: theme.spacing.lg,
  },
  modalSenderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  modalSenderAvatar: {
    fontSize: 24,
    marginRight: theme.spacing.md,
  },
  modalSenderDetails: {
    flex: 1,
  },
  modalSenderName: {
    fontSize: theme.fontSize.md,
    fontWeight: '600',
    color: theme.colors.black,
  },
  modalSenderLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.gray[500],
  },
  modalActions: {
    backgroundColor: theme.colors.gray[50],
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },
  modalActionsTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: '600',
    color: theme.colors.black,
    marginBottom: theme.spacing.sm,
  },
  modalActionItem: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.gray[600],
    marginBottom: theme.spacing.xs,
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
