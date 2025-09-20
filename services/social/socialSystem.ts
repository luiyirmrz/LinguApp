/**
 * Social System Service - Manages friends, leaderboards, and social features
 * Handles friend requests, challenges, and social interactions
 */

import { User, Friend, FriendRequest, SocialStats } from '@/types';
import { unifiedDataService } from '../database/unifiedDataService';
import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

class SocialSystemService {
  /**
   * Send a friend request
   */
  async sendFriendRequest(fromUserId: string, toUserId: string, message?: string): Promise<{
    success: boolean;
    friendRequest?: FriendRequest;
    error?: string;
  }> {
    try {
      if (fromUserId === toUserId) {
        return {
          success: false,
          error: 'Cannot send friend request to yourself',
        };
      }

      const fromUser = await unifiedDataService.getUser(fromUserId);
      const toUser = await unifiedDataService.getUser(toUserId);

      if (!fromUser || !toUser) {
        return {
          success: false,
          error: 'User not found',
        };
      }

      // Check if already friends
      if (fromUser.friends?.includes(toUserId)) {
        return {
          success: false,
          error: 'Already friends',
        };
      }

      // Check if request already exists
      const existingRequest = await this.getFriendRequest(fromUserId, toUserId);
      if (existingRequest) {
        return {
          success: false,
          error: 'Friend request already sent',
        };
      }

      const friendRequest: FriendRequest = {
        id: `friend_request_${Date.now()}_${fromUserId}_${toUserId}`,
        fromUserId,
        fromUserName: fromUser.name,
        fromUserAvatar: fromUser.avatar,
        toUserId,
        toUserName: toUser.name,
        status: 'pending',
        createdAt: new Date().toISOString(),
        message,
      };

      // Save friend request
      await this.saveFriendRequest(friendRequest);

      // Add to recipient's friend requests
      const updatedToUser: User = {
        ...toUser,
        friendRequests: [...(toUser.friendRequests || []), friendRequest],
      };

      await unifiedDataService.saveUser(updatedToUser);

      // Haptic feedback
      await this.triggerHapticFeedback('success');

      console.debug(`Friend request sent from ${fromUserId} to ${toUserId}`);

      return {
        success: true,
        friendRequest,
      };
    } catch (error) {
      console.error('Error sending friend request:', error);
      return {
        success: false,
        error: 'Failed to send friend request',
      };
    }
  }

  /**
   * Accept a friend request
   */
  async acceptFriendRequest(requestId: string, userId: string): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      const user = await unifiedDataService.getUser(userId);
      if (!user) {
        return {
          success: false,
          error: 'User not found',
        };
      }

      const friendRequest = user.friendRequests?.find(req => req.id === requestId);
      if (!friendRequest) {
        return {
          success: false,
          error: 'Friend request not found',
        };
      }

      if (friendRequest.status !== 'pending') {
        return {
          success: false,
          error: 'Friend request already processed',
        };
      }

      // Get the sender
      const fromUser = await unifiedDataService.getUser(friendRequest.fromUserId);
      if (!fromUser) {
        return {
          success: false,
          error: 'Sender not found',
        };
      }

      // Update friend request status
      friendRequest.status = 'accepted';
      friendRequest.respondedAt = new Date().toISOString();

      // Add each other as friends
      const updatedUser: User = {
        ...user,
        friends: [...(user.friends || []), friendRequest.fromUserId],
        friendRequests: user.friendRequests?.map(req => 
          req.id === requestId ? friendRequest : req,
        ) || [],
        socialStats: {
          totalFriends: (user.socialStats?.totalFriends || 0) + 1,
          friendsCount: (user.socialStats?.friendsCount || 0) + 1,
          challengesWon: user.socialStats?.challengesWon || 0,
          challengesLost: user.socialStats?.challengesLost || 0,
          helpfulVotes: user.socialStats?.helpfulVotes || 0,
          communityRank: user.socialStats?.communityRank || 0,
          helpGiven: user.socialStats?.helpGiven || 0,
          helpReceived: user.socialStats?.helpReceived || 0,
          groupsJoined: user.socialStats?.groupsJoined || [],
        },
      };

      const updatedFromUser: User = {
        ...fromUser,
        friends: [...(fromUser.friends || []), userId],
        socialStats: {
          totalFriends: (fromUser.socialStats?.totalFriends || 0) + 1,
          friendsCount: (fromUser.socialStats?.friendsCount || 0) + 1,
          challengesWon: fromUser.socialStats?.challengesWon || 0,
          challengesLost: fromUser.socialStats?.challengesLost || 0,
          helpfulVotes: fromUser.socialStats?.helpfulVotes || 0,
          communityRank: fromUser.socialStats?.communityRank || 0,
          helpGiven: fromUser.socialStats?.helpGiven || 0,
          helpReceived: fromUser.socialStats?.helpReceived || 0,
          groupsJoined: fromUser.socialStats?.groupsJoined || [],
        },
      };

      await unifiedDataService.saveUser(updatedUser);
      await unifiedDataService.saveUser(updatedFromUser);

      // Update friend request in storage
      await this.saveFriendRequest(friendRequest);

      // Haptic feedback
      await this.triggerHapticFeedback('success');

      console.debug(`Friend request accepted: ${requestId}`);

      return {
        success: true,
      };
    } catch (error) {
      console.error('Error accepting friend request:', error);
      return {
        success: false,
        error: 'Failed to accept friend request',
      };
    }
  }

  /**
   * Decline a friend request
   */
  async declineFriendRequest(requestId: string, userId: string): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      const user = await unifiedDataService.getUser(userId);
      if (!user) {
        return {
          success: false,
          error: 'User not found',
        };
      }

      const friendRequest = user.friendRequests?.find(req => req.id === requestId);
      if (!friendRequest) {
        return {
          success: false,
          error: 'Friend request not found',
        };
      }

      // Update friend request status
      friendRequest.status = 'declined';
      friendRequest.respondedAt = new Date().toISOString();

      // Remove from user's friend requests
      const updatedUser: User = {
        ...user,
        friendRequests: user.friendRequests?.filter(req => req.id !== requestId) || [],
      };

      await unifiedDataService.saveUser(updatedUser);

      // Update friend request in storage
      await this.saveFriendRequest(friendRequest);

      console.debug(`Friend request declined: ${requestId}`);

      return {
        success: true,
      };
    } catch (error) {
      console.error('Error declining friend request:', error);
      return {
        success: false,
        error: 'Failed to decline friend request',
      };
    }
  }

  /**
   * Get user's friends list
   */
  async getFriends(userId: string): Promise<Friend[]> {
    try {
      const user = await unifiedDataService.getUser(userId);
      if (!user || !user.friends) {
        return [];
      }

      const friends: Friend[] = [];
      
      for (const friendId of user.friends) {
        const friendUser = await unifiedDataService.getUser(friendId);
        if (friendUser) {
          const friend: Friend = {
            id: friendUser.id,
            name: friendUser.name,
            avatar: friendUser.avatar,
            level: friendUser.level || 1,
            totalXP: friendUser.totalXP || 0,
            streak: friendUser.streak || 0,
            lastActive: friendUser.lastLoginAt || friendUser.createdAt || new Date().toISOString(),
            isOnline: this.isUserOnline(friendUser.lastLoginAt),
            currentLanguage: friendUser.currentLanguage?.name,
            mutualFriends: await this.getMutualFriendsCount(userId, friendId),
          };
          friends.push(friend);
        }
      }

      // Sort by online status, then by last active
      friends.sort((a, b) => {
        if (a.isOnline && !b.isOnline) return -1;
        if (!a.isOnline && b.isOnline) return 1;
        return new Date(b.lastActive).getTime() - new Date(a.lastActive).getTime();
      });

      return friends;
    } catch (error) {
      console.error('Error getting friends:', error);
      return [];
    }
  }

  /**
   * Get leaderboard (global, friends, or country)
   */
  async getLeaderboard(
    type: 'global' | 'friends' | 'country' = 'global',
    timeframe: 'weekly' | 'allTime' = 'allTime',
    userId?: string,
    limit: number = 50,
  ): Promise<LeaderboardEntry[]> {
    try {
      // For now, return mock data since we don't have a full user database
      const mockLeaderboard: LeaderboardEntry[] = [
        {
          userId: 'user1',
          name: 'LanguageMaster',
          avatar: '🎓',
          totalXP: 15000,
          weeklyXP: 2500,
          level: 25,
          streak: 45,
          rank: 1,
          country: 'US',
          isOnline: true,
          lastActive: new Date().toISOString(),
        },
        {
          userId: 'user2',
          name: 'PolyglotPro',
          avatar: '🌟',
          totalXP: 12000,
          weeklyXP: 2200,
          level: 22,
          streak: 38,
          rank: 2,
          country: 'UK',
          isOnline: false,
          lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        },
        {
          userId: 'user3',
          name: 'StudyBuddy',
          avatar: '📚',
          totalXP: 10500,
          weeklyXP: 2000,
          level: 20,
          streak: 32,
          rank: 3,
          country: 'CA',
          isOnline: true,
          lastActive: new Date().toISOString(),
        },
        {
          userId: 'user4',
          name: 'FluentFriend',
          avatar: '🗣️',
          totalXP: 9800,
          weeklyXP: 1600,
          level: 18,
          streak: 28,
          rank: 4,
          country: 'DE',
          isOnline: false,
          lastActive: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        },
        {
          userId: 'user5',
          name: 'VocabVirtuoso',
          avatar: '📖',
          totalXP: 8900,
          weeklyXP: 1400,
          level: 16,
          streak: 25,
          rank: 5,
          country: 'FR',
          isOnline: true,
          lastActive: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        },
      ];

      // If user is provided, add them to the leaderboard if not already present
      if (userId) {
        const user = await unifiedDataService.getUser(userId);
        if (user && !mockLeaderboard.find(entry => entry.userId === userId)) {
          const userEntry: LeaderboardEntry = {
            userId: user.id,
            name: user.name,
            avatar: user.avatar,
            totalXP: user.totalXP || 0,
            weeklyXP: user.weeklyXP || 0,
            level: user.level || 1,
            streak: user.streak || 0,
            rank: mockLeaderboard.length + 1,
            isOnline: true,
            lastActive: new Date().toISOString(),
          };
          mockLeaderboard.push(userEntry);
        }
      }

      // Filter based on type
      let filteredLeaderboard = mockLeaderboard;
      
      if (type === 'friends' && userId) {
        const friends = await this.getFriends(userId);
        const friendIds = friends.map(f => f.id);
        filteredLeaderboard = mockLeaderboard.filter(entry => 
          friendIds.includes(entry.userId) || entry.userId === userId,
        );
      }

      // Sort based on timeframe
      if (timeframe === 'weekly') {
        filteredLeaderboard.sort((a, b) => b.weeklyXP - a.weeklyXP);
      } else {
        filteredLeaderboard.sort((a, b) => b.totalXP - a.totalXP);
      }

      // Update ranks
      filteredLeaderboard.forEach((entry, index) => {
        entry.rank = index + 1;
      });

      return filteredLeaderboard.slice(0, limit);
    } catch (error) {
      console.error('Error getting leaderboard:', error);
      return [];
    }
  }

  /**
   * Search for users to add as friends
   */
  async searchUsers(query: string, currentUserId: string): Promise<{
    id: string;
    name: string;
    avatar?: string;
    level: number;
    totalXP: number;
    isAlreadyFriend: boolean;
    hasPendingRequest: boolean;
  }[]> {
    try {
      // Mock search results for now
      const mockUsers = [
        {
          id: 'search_user_1',
          name: 'Alex Johnson',
          avatar: '👨‍💼',
          level: 12,
          totalXP: 5600,
          isAlreadyFriend: false,
          hasPendingRequest: false,
        },
        {
          id: 'search_user_2',
          name: 'Maria Garcia',
          avatar: '👩‍🎓',
          level: 18,
          totalXP: 8900,
          isAlreadyFriend: false,
          hasPendingRequest: false,
        },
        {
          id: 'search_user_3',
          name: 'Chen Wei',
          avatar: '👨‍🔬',
          level: 15,
          totalXP: 7200,
          isAlreadyFriend: false,
          hasPendingRequest: false,
        },
      ];

      // Filter by query
      const filteredUsers = mockUsers.filter(user => 
        user.name.toLowerCase().includes(query.toLowerCase()),
      );

      // Check friendship status
      const currentUser = await unifiedDataService.getUser(currentUserId);
      if (currentUser) {
        filteredUsers.forEach(user => {
          user.isAlreadyFriend = currentUser.friends?.includes(user.id) || false;
          user.hasPendingRequest = currentUser.friendRequests?.some(req => 
            req.fromUserId === user.id && req.status === 'pending',
          ) || false;
        });
      }

      return filteredUsers;
    } catch (error) {
      console.error('Error searching users:', error);
      return [];
    }
  }

  /**
   * Get mutual friends count
   */
  private async getMutualFriendsCount(userId1: string, userId2: string): Promise<number> {
    try {
      const user1 = await unifiedDataService.getUser(userId1);
      const user2 = await unifiedDataService.getUser(userId2);

      if (!user1 || !user2 || !user1.friends || !user2.friends) {
        return 0;
      }

      const mutualFriends = user1.friends.filter(friendId => 
        user2.friends!.includes(friendId),
      );

      return mutualFriends.length;
    } catch (error) {
      console.error('Error getting mutual friends count:', error);
      return 0;
    }
  }

  /**
   * Check if user is online (last active within 5 minutes)
   */
  private isUserOnline(lastLoginAt?: string): boolean {
    if (!lastLoginAt) return false;
    
    const lastLogin = new Date(lastLoginAt);
    const now = new Date();
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
    
    return lastLogin > fiveMinutesAgo;
  }

  /**
   * Save friend request to storage
   */
  private async saveFriendRequest(friendRequest: FriendRequest): Promise<void> {
    try {
      const key = `friend_request_${friendRequest.id}`;
      await AsyncStorage.setItem(key, JSON.stringify(friendRequest));
    } catch (error) {
      console.error('Error saving friend request:', error);
    }
  }

  /**
   * Get friend request from storage
   */
  private async getFriendRequest(fromUserId: string, toUserId: string): Promise<FriendRequest | null> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const friendRequestKeys = keys.filter(key => key.startsWith('friend_request_'));
      
      for (const key of friendRequestKeys) {
        const data = await AsyncStorage.getItem(key);
        if (data) {
          const request: FriendRequest = JSON.parse(data);
          if (request.fromUserId === fromUserId && request.toUserId === toUserId && request.status === 'pending') {
            return request;
          }
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error getting friend request:', error);
      return null;
    }
  }

  /**
   * Remove friend
   */
  async removeFriend(userId: string, friendId: string): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      const user = await unifiedDataService.getUser(userId);
      const friend = await unifiedDataService.getUser(friendId);

      if (!user || !friend) {
        return {
          success: false,
          error: 'User not found',
        };
      }

      // Remove from both users' friend lists
      const updatedUser: User = {
        ...user,
        friends: user.friends?.filter(id => id !== friendId) || [],
        socialStats: {
          totalFriends: Math.max(0, (user.socialStats?.totalFriends || 0) - 1),
          friendsCount: Math.max(0, (user.socialStats?.friendsCount || 0) - 1),
          challengesWon: user.socialStats?.challengesWon || 0,
          challengesLost: user.socialStats?.challengesLost || 0,
          helpfulVotes: user.socialStats?.helpfulVotes || 0,
          communityRank: user.socialStats?.communityRank || 0,
          helpGiven: user.socialStats?.helpGiven || 0,
          helpReceived: user.socialStats?.helpReceived || 0,
          groupsJoined: user.socialStats?.groupsJoined || [],
        },
      };

      const updatedFriend: User = {
        ...friend,
        friends: friend.friends?.filter(id => id !== userId) || [],
        socialStats: {
          totalFriends: Math.max(0, (friend.socialStats?.totalFriends || 0) - 1),
          friendsCount: Math.max(0, (friend.socialStats?.friendsCount || 0) - 1),
          challengesWon: friend.socialStats?.challengesWon || 0,
          challengesLost: friend.socialStats?.challengesLost || 0,
          helpfulVotes: friend.socialStats?.helpfulVotes || 0,
          communityRank: friend.socialStats?.communityRank || 0,
          helpGiven: friend.socialStats?.helpGiven || 0,
          helpReceived: friend.socialStats?.helpReceived || 0,
          groupsJoined: friend.socialStats?.groupsJoined || [],
        },
      };

      await unifiedDataService.saveUser(updatedUser);
      await unifiedDataService.saveUser(updatedFriend);

      console.debug(`Friendship removed between ${userId} and ${friendId}`);

      return {
        success: true,
      };
    } catch (error) {
      console.error('Error removing friend:', error);
      return {
        success: false,
        error: 'Failed to remove friend',
      };
    }
  }

  /**
   * Trigger haptic feedback with web compatibility
   */
  private async triggerHapticFeedback(type: 'success' | 'error' | 'light' = 'light'): Promise<void> {
    if (Platform.OS === 'web') return;
    
    try {
      switch (type) {
        case 'success':
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          break;
        case 'error':
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          break;
        default:
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    } catch (error) {
      console.error('Haptic feedback error:', error);
    }
  }

  /**
   * Cache social data for offline access
   */
  async cacheSocialData(userId: string, data: {
    friends: Friend[];
    leaderboard: LeaderboardEntry[];
    friendRequests: FriendRequest[];
  }): Promise<void> {
    try {
      await AsyncStorage.setItem(`social_data_${userId}`, JSON.stringify({
        ...data,
        cachedAt: new Date().toISOString(),
      }));
    } catch (error) {
      console.error('Error caching social data:', error);
    }
  }

  /**
   * Get cached social data for offline mode
   */
  async getCachedSocialData(userId: string): Promise<{
    friends: Friend[];
    leaderboard: LeaderboardEntry[];
    friendRequests: FriendRequest[];
    cachedAt: string;
  } | null> {
    try {
      const cached = await AsyncStorage.getItem(`social_data_${userId}`);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.error('Error getting cached social data:', error);
      return null;
    }
  }
}

export const socialSystemService = new SocialSystemService();
export default socialSystemService;
