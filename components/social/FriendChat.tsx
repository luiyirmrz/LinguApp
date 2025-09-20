import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  Image,
} from 'react-native';
import { theme } from '@/constants/theme';
import { useUnifiedAuth } from "@/hooks/useUnifiedAuth";
import { useI18n } from '@/hooks/useI18n';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Badge } from '@/components/Badge';
import { 
  ArrowLeftIcon,
  SendIcon,
  SmileIcon,
  ImageIcon,
  PlusIcon,
  MicIcon,
  PhoneIcon,
  VideoIcon,
  MoreVerticalIcon,
  CheckIcon,
  CheckCheckIcon,
  ClockIcon,
  UserIcon,
  MessageCircleIcon,
  StarIcon,
  TrophyIcon,
  TargetIcon,
  BookOpenIcon,
  ZapIcon,
} from '@/components/icons/LucideReplacement';

const { width, height } = Dimensions.get('window');

interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  type: 'text' | 'image' | 'audio' | 'challenge' | 'achievement' | 'lesson';
  timestamp: string;
  isRead: boolean;
  isDelivered: boolean;
  metadata?: {
    challengeId?: string;
    achievementId?: string;
    lessonId?: string;
    imageUrl?: string;
    audioUrl?: string;
  };
}

interface Friend {
  id: string;
  name: string;
  avatar?: string;
  level: number;
  isOnline: boolean;
  lastActive: string;
}

interface FriendChatProps {
  friend: Friend;
  onBack: () => void;
  onNavigateToProfile?: (userId: string) => void;
  onNavigateToChallenge?: (challengeId: string) => void;
  onNavigateToLesson?: (lessonId: string) => void;
}

export default function FriendChat({
  friend,
  onBack,
  onNavigateToProfile,
  onNavigateToChallenge,
  onNavigateToLesson,
}: FriendChatProps) {
  const { user, signIn, signOut, signUp, resetPassword, updateUser } = useUnifiedAuth();
  const { t } = useI18n();

  // State management
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);

  // Refs
  const flatListRef = useRef<FlatList>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Mock messages data
  const mockMessages: ChatMessage[] = [
    {
      id: 'msg_1',
      senderId: friend.id,
      senderName: friend.name,
      senderAvatar: friend.avatar,
      content: 'Hey! How\'s your Spanish learning going?',
      type: 'text',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      isRead: true,
      isDelivered: true,
    },
    {
      id: 'msg_2',
      senderId: user?.id || 'current_user',
      senderName: user?.name || 'You',
      senderAvatar: user?.avatar,
      content: 'Great! I just completed the "Basic Greetings" lesson. It was really helpful!',
      type: 'text',
      timestamp: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString(),
      isRead: true,
      isDelivered: true,
    },
    {
      id: 'msg_3',
      senderId: friend.id,
      senderName: friend.name,
      senderAvatar: friend.avatar,
      content: 'That\'s awesome! I\'m working on the same lesson. Want to practice together?',
      type: 'text',
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      isRead: true,
      isDelivered: true,
    },
    {
      id: 'msg_4',
      senderId: friend.id,
      senderName: friend.name,
      senderAvatar: friend.avatar,
      content: 'I just earned the "Grammar Master" badge! 🏆',
      type: 'achievement',
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      isRead: true,
      isDelivered: true,
      metadata: {
        achievementId: 'achievement_grammar_master',
      },
    },
    {
      id: 'msg_5',
      senderId: user?.id || 'current_user',
      senderName: user?.name || 'You',
      senderAvatar: user?.avatar,
      content: 'Congratulations! That\'s a tough one to get. I\'m still working on it.',
      type: 'text',
      timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
      isRead: true,
      isDelivered: true,
    },
    {
      id: 'msg_6',
      senderId: friend.id,
      senderName: friend.name,
      senderAvatar: friend.avatar,
      content: 'Want to challenge each other to a vocabulary quiz?',
      type: 'challenge',
      timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
      isRead: false,
      isDelivered: true,
      metadata: {
        challengeId: 'challenge_vocab_quiz',
      },
    },
  ];

  useEffect(() => {
    loadMessages();
  }, [friend.id]);

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const loadMessages = async () => {
    setIsLoading(true);
    try {
      // Simulate loading messages
      setTimeout(() => {
        setMessages(mockMessages);
        setIsLoading(false);
      }, 500);
    } catch (error) {
      console.error('Error loading messages:', error);
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !user) return;

    const message: ChatMessage = {
      id: `msg_${Date.now()}`,
      senderId: user.id,
      senderName: user.name,
      senderAvatar: user.avatar,
      content: newMessage.trim(),
      type: 'text',
      timestamp: new Date().toISOString(),
      isRead: false,
      isDelivered: false,
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');

    // Simulate message delivery
    setTimeout(() => {
      setMessages(prev => 
        prev.map(msg => 
          msg.id === message.id 
            ? { ...msg, isDelivered: true }
            : msg,
        ),
      );
    }, 1000);

    // Simulate friend reading the message
    setTimeout(() => {
      setMessages(prev => 
        prev.map(msg => 
          msg.id === message.id 
            ? { ...msg, isRead: true }
            : msg,
        ),
      );
    }, 3000);
  };

  const handleTyping = (text: string) => {
    setNewMessage(text);
    
    // Simulate typing indicator
    if (text.length > 0 && !isTyping) {
      setIsTyping(true);
    }
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
    }, 1000) as any;
  };

  const handleMessagePress = (message: ChatMessage) => {
    switch (message.type) {
      case 'challenge':
        if (message.metadata?.challengeId) {
          onNavigateToChallenge?.(message.metadata.challengeId);
        }
        break;
      case 'lesson':
        if (message.metadata?.lessonId) {
          onNavigateToLesson?.(message.metadata.lessonId);
        }
        break;
      case 'achievement':
        // Show achievement details
        Alert.alert('Achievement', `Congratulations on earning the "${message.content}" badge!`);
        break;
    }
  };

  const formatTime = (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return date.toLocaleDateString();
  };

  const getMessageIcon = (type: string) => {
    switch (type) {
      case 'challenge':
        return <TrophyIcon size={16} color={theme.colors.warning} />;
      case 'achievement':
        return <StarIcon size={16} color={theme.colors.success} />;
      case 'lesson':
        return <BookOpenIcon size={16} color={theme.colors.primary} />;
      case 'image':
        return <ImageIcon size={16} color={theme.colors.info} />;
      case 'audio':
        return <MicIcon size={16} color={theme.colors.danger} />;
      default:
        return null;
    }
  };

  const renderMessage = ({ item, index }: { item: ChatMessage; index: number }) => {
    const isCurrentUser = user && item.senderId === user.id;
    const showAvatar = index === 0 || messages[index - 1].senderId !== item.senderId;
    const showTime = index === messages.length - 1 || 
      new Date(item.timestamp).getTime() - new Date(messages[index + 1].timestamp).getTime() > 5 * 60 * 1000;

    return (
      <View style={[
        styles.messageContainer,
        isCurrentUser ? styles.currentUserMessage : styles.otherUserMessage,
      ]}>
        {!isCurrentUser && showAvatar && (
          <TouchableOpacity
            style={styles.avatarContainer}
            onPress={() => onNavigateToProfile?.(item.senderId)}
          >
            <Text style={styles.avatarText}>{item.senderAvatar || '👤'}</Text>
          </TouchableOpacity>
        )}
        
        <View style={[
          styles.messageBubble,
          isCurrentUser ? styles.currentUserBubble : styles.otherUserBubble,
        ]}>
          {!isCurrentUser && showAvatar && (
            <Text style={styles.senderName}>{item.senderName}</Text>
          )}
          
          <TouchableOpacity
            style={styles.messageContent}
            onPress={() => handleMessagePress(item)}
            disabled={item.type === 'text'}
          >
            {item.type !== 'text' && (
              <View style={styles.messageTypeIndicator}>
                {getMessageIcon(item.type)}
              </View>
            )}
            <Text style={[
              styles.messageText,
              isCurrentUser ? styles.currentUserText : styles.otherUserText,
            ]}>
              {item.content}
            </Text>
          </TouchableOpacity>
          
          <View style={styles.messageFooter}>
            <Text style={[
              styles.messageTime,
              isCurrentUser ? styles.currentUserTime : styles.otherUserTime,
            ]}>
              {formatTime(item.timestamp)}
            </Text>
            {isCurrentUser && (
              <View style={styles.messageStatus}>
                {item.isRead ? (
                  <CheckCheckIcon size={12} color={theme.colors.primary} />
                ) : item.isDelivered ? (
                  <CheckIcon size={12} color={theme.colors.gray[500]} />
                ) : (
                  <ClockIcon size={12} color={theme.colors.gray[400]} />
                )}
              </View>
            )}
          </View>
        </View>
      </View>
    );
  };

  const renderTypingIndicator = () => {
    if (!isTyping) return null;

    return (
      <View style={styles.typingContainer}>
        <View style={styles.typingBubble}>
          <Text style={styles.typingText}>{friend.name} is typing...</Text>
          <View style={styles.typingDots}>
            <View style={[styles.typingDot, styles.typingDot1]} />
            <View style={[styles.typingDot, styles.typingDot2]} />
            <View style={[styles.typingDot, styles.typingDot3]} />
          </View>
        </View>
      </View>
    );
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <ArrowLeftIcon size={24} color={theme.colors.black} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.friendInfo}
          onPress={() => onNavigateToProfile?.(friend.id)}
        >
          <View style={styles.friendAvatarContainer}>
            <Text style={styles.friendAvatar}>{friend.avatar || '👤'}</Text>
            {friend.isOnline && <View style={styles.onlineIndicator} />}
          </View>
          <View style={styles.friendDetails}>
            <Text style={styles.friendName}>{friend.name}</Text>
            <Text style={styles.friendStatus}>
              {friend.isOnline ? 'Online' : 'Last seen recently'}
            </Text>
          </View>
        </TouchableOpacity>
      </View>
      <View style={styles.headerRight}>
        <TouchableOpacity style={styles.headerButton}>
          <PhoneIcon size={20} color={theme.colors.gray[600]} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.headerButton}>
          <VideoIcon size={20} color={theme.colors.gray[600]} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.headerButton}>
          <MoreVerticalIcon size={20} color={theme.colors.gray[600]} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderInput = () => (
    <View style={styles.inputContainer}>
      <TouchableOpacity
        style={styles.attachmentButton}
        onPress={() => setShowAttachmentMenu(!showAttachmentMenu)}
      >
        <PlusIcon size={20} color={theme.colors.gray[600]} />
      </TouchableOpacity>
      
      <View style={styles.textInputContainer}>
        <TextInput
          style={styles.textInput}
          placeholder="Type a message..."
          value={newMessage}
          onChangeText={handleTyping}
          multiline
          maxLength={1000}
          placeholderTextColor={theme.colors.gray[500]}
        />
        <TouchableOpacity
          style={styles.emojiButton}
          onPress={() => setShowEmojiPicker(!showEmojiPicker)}
        >
          <SmileIcon size={20} color={theme.colors.gray[600]} />
        </TouchableOpacity>
      </View>
      
      <TouchableOpacity
        style={[
          styles.sendButton,
          newMessage.trim() ? styles.sendButtonActive : styles.sendButtonInactive,
        ]}
        onPress={handleSendMessage}
        disabled={!newMessage.trim()}
      >
        <SendIcon size={20} color={newMessage.trim() ? theme.colors.white : theme.colors.gray[400]} />
      </TouchableOpacity>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {renderHeader()}
      
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        style={styles.messagesList}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        ListFooterComponent={renderTypingIndicator}
      />
      
      {renderInput()}
    </KeyboardAvoidingView>
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
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray[200],
    backgroundColor: theme.colors.white,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backButton: {
    padding: theme.spacing.sm,
    marginRight: theme.spacing.sm,
  },
  friendInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  friendAvatarContainer: {
    position: 'relative',
    marginRight: theme.spacing.md,
  },
  friendAvatar: {
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
  },
  friendStatus: {
    fontSize: theme.fontSize.sm,
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
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    padding: theme.spacing.lg,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: theme.spacing.sm,
  },
  currentUserMessage: {
    justifyContent: 'flex-end',
  },
  otherUserMessage: {
    justifyContent: 'flex-start',
  },
  avatarContainer: {
    marginRight: theme.spacing.sm,
    marginTop: theme.spacing.xs,
  },
  avatarText: {
    fontSize: 16,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.colors.gray[100],
    textAlign: 'center',
    lineHeight: 28,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
  },
  currentUserBubble: {
    backgroundColor: theme.colors.primary,
    borderBottomRightRadius: theme.spacing.xs,
  },
  otherUserBubble: {
    backgroundColor: theme.colors.gray[100],
    borderBottomLeftRadius: theme.spacing.xs,
  },
  senderName: {
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
    color: theme.colors.black,
    marginBottom: theme.spacing.xs,
  },
  messageContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  messageTypeIndicator: {
    marginRight: theme.spacing.sm,
    marginTop: 2,
  },
  messageText: {
    fontSize: theme.fontSize.md,
    lineHeight: 20,
    flex: 1,
  },
  currentUserText: {
    color: theme.colors.white,
  },
  otherUserText: {
    color: theme.colors.black,
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: theme.spacing.xs,
  },
  messageTime: {
    fontSize: theme.fontSize.xs,
  },
  currentUserTime: {
    color: theme.colors.white,
    opacity: 0.8,
  },
  otherUserTime: {
    color: theme.colors.gray[500],
  },
  messageStatus: {
    marginLeft: theme.spacing.xs,
  },
  typingContainer: {
    flexDirection: 'row',
    marginBottom: theme.spacing.sm,
  },
  typingBubble: {
    backgroundColor: theme.colors.gray[100],
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    borderBottomLeftRadius: theme.spacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
  },
  typingText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.gray[600],
    marginRight: theme.spacing.sm,
  },
  typingDots: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typingDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.gray[500],
    marginHorizontal: 1,
  },
  typingDot1: {
    animationDelay: '0s',
  },
  typingDot2: {
    animationDelay: '0.2s',
  },
  typingDot3: {
    animationDelay: '0.4s',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.gray[200],
    backgroundColor: theme.colors.white,
  },
  attachmentButton: {
    padding: theme.spacing.sm,
    marginRight: theme.spacing.sm,
  },
  textInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: theme.colors.gray[50],
    borderRadius: theme.borderRadius.xl,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    marginRight: theme.spacing.sm,
  },
  textInput: {
    flex: 1,
    fontSize: theme.fontSize.md,
    color: theme.colors.black,
    maxHeight: 100,
    paddingVertical: theme.spacing.sm,
  },
  emojiButton: {
    padding: theme.spacing.sm,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonActive: {
    backgroundColor: theme.colors.primary,
  },
  sendButtonInactive: {
    backgroundColor: theme.colors.gray[200],
  },
});
