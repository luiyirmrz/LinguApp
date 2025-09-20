import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Dimensions,
  Animated,
} from 'react-native';
import { theme } from '@/constants/theme';
import { useI18n } from '@/hooks/useI18n';
import { useUnifiedAuth } from "@/hooks/useUnifiedAuth";
import { useGameState } from '@/hooks/useGameState';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Badge } from '@/components/Badge';
import { 
  UserIcon, 
  CameraIcon, 
  ImageIcon, 
  PaletteIcon, 
  SaveIcon,
  XIcon,
  CheckIcon,
  StarIcon,
  CrownIcon,
  GemIcon,
  HeartIcon,
  FlameIcon,
} from '@/components/icons/LucideReplacement';

const { width } = Dimensions.get('window');

interface AvatarItem {
  id: string;
  name: string;
  emoji: string;
  color: string;
  unlocked: boolean;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  cost?: number;
  currency?: 'gems' | 'hearts' | 'xp';
}

interface AvatarCustomizationProps {
  onSave?: (avatar: AvatarItem) => void;
  onCancel?: () => void;
}

export default function AvatarCustomization({
  onSave,
  onCancel,
}: AvatarCustomizationProps) {
  const { t } = useI18n();
  const { user, signIn, signOut, signUp, resetPassword, updateUser } = useUnifiedAuth();
  const { getUserProgress } = useGameState();

  const [selectedAvatar, setSelectedAvatar] = useState<AvatarItem | null>(null);
  const [availableAvatars, setAvailableAvatars] = useState<AvatarItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [animationValue] = useState(new Animated.Value(0));

  const avatarCategories = [
    { key: 'all', label: 'All', icon: 'user' },
    { key: 'common', label: 'Common', icon: 'star' },
    { key: 'uncommon', label: 'Uncommon', icon: 'star' },
    { key: 'rare', label: 'Rare', icon: 'crown' },
    { key: 'epic', label: 'Epic', icon: 'gem' },
    { key: 'legendary', label: 'Legendary', icon: 'crown' },
  ];

  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    loadAvatarData();
    animateComponents();
  }, []);

  const animateComponents = () => {
    Animated.timing(animationValue, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  };

  const loadAvatarData = async () => {
    try {
      setLoading(true);
      
      if (!user) return;

      const userProgress = await getUserProgress(user.id);
      const avatars = generateAvatarData(userProgress);
      setAvailableAvatars(avatars);

      // Set current avatar as selected
      const currentAvatar = avatars.find(avatar => avatar.id === userProgress.currentAvatar) || avatars[0];
      setSelectedAvatar(currentAvatar);

    } catch (error) {
      console.error('Error loading avatar data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateAvatarData = (userProgress: any): AvatarItem[] => {
    const avatars: AvatarItem[] = [
      // Common avatars (free)
      {
        id: 'default',
        name: 'Default',
        emoji: '👤',
        color: theme.colors.primary,
        unlocked: true,
        rarity: 'common',
      },
      {
        id: 'smiley',
        name: 'Smiley',
        emoji: '😊',
        color: theme.colors.warning,
        unlocked: true,
        rarity: 'common',
      },
      {
        id: 'cool',
        name: 'Cool',
        emoji: '😎',
        color: theme.colors.info,
        unlocked: true,
        rarity: 'common',
      },
      {
        id: 'happy',
        name: 'Happy',
        emoji: '😄',
        color: theme.colors.success,
        unlocked: true,
        rarity: 'common',
      },
      
      // Uncommon avatars (unlocked by level)
      {
        id: 'star',
        name: 'Star',
        emoji: '⭐',
        color: theme.colors.warning,
        unlocked: userProgress.level >= 3,
        rarity: 'uncommon',
      },
      {
        id: 'fire',
        name: 'Fire',
        emoji: '🔥',
        color: theme.colors.danger,
        unlocked: userProgress.level >= 5,
        rarity: 'uncommon',
      },
      {
        id: 'heart',
        name: 'Heart',
        emoji: '❤️',
        color: theme.colors.danger,
        unlocked: userProgress.level >= 7,
        rarity: 'uncommon',
      },
      
      // Rare avatars (unlocked by achievements)
      {
        id: 'crown',
        name: 'Crown',
        emoji: '👑',
        color: theme.colors.warning,
        unlocked: userProgress.achievements?.includes('level_10'),
        rarity: 'rare',
      },
      {
        id: 'trophy',
        name: 'Trophy',
        emoji: '🏆',
        color: theme.colors.warning,
        unlocked: userProgress.achievements?.includes('streak_30'),
        rarity: 'rare',
      },
      {
        id: 'diamond',
        name: 'Diamond',
        emoji: '💎',
        color: theme.colors.info,
        unlocked: userProgress.achievements?.includes('vocabulary_master'),
        rarity: 'rare',
      },
      
      // Epic avatars (unlocked by special achievements)
      {
        id: 'rainbow',
        name: 'Rainbow',
        emoji: '🌈',
        color: theme.colors.primary,
        unlocked: userProgress.achievements?.includes('perfect_week'),
        rarity: 'epic',
      },
      {
        id: 'rocket',
        name: 'Rocket',
        emoji: '🚀',
        color: theme.colors.success,
        unlocked: userProgress.achievements?.includes('speed_learner'),
        rarity: 'epic',
      },
      
      // Legendary avatars (unlocked by major achievements)
      {
        id: 'phoenix',
        name: 'Phoenix',
        emoji: '🔥',
        color: theme.colors.danger,
        unlocked: userProgress.achievements?.includes('legendary_learner'),
        rarity: 'legendary',
      },
      {
        id: 'dragon',
        name: 'Dragon',
        emoji: '🐉',
        color: theme.colors.warning,
        unlocked: userProgress.achievements?.includes('dragon_master'),
        rarity: 'legendary',
      },
    ];

    return avatars;
  };

  const getRarityColor = (rarity: string): string => {
    const colors = {
      common: theme.colors.gray[500],
      uncommon: theme.colors.success,
      rare: theme.colors.primary,
      epic: theme.colors.warning,
      legendary: theme.colors.danger,
    };
    return colors[rarity as keyof typeof colors] || theme.colors.gray[500];
  };

  const getRarityIcon = (rarity: string) => {
    switch (rarity) {
      case 'common':
        return <UserIcon size={16} color={theme.colors.gray[500]} />;
      case 'uncommon':
        return <StarIcon size={16} color={theme.colors.success} />;
      case 'rare':
        return <CrownIcon size={16} color={theme.colors.primary} />;
      case 'epic':
        return <GemIcon size={16} color={theme.colors.warning} />;
      case 'legendary':
        return <CrownIcon size={16} color={theme.colors.danger} />;
      default:
        return <UserIcon size={16} color={theme.colors.gray[500]} />;
    }
  };

  const filteredAvatars = selectedCategory === 'all' 
    ? availableAvatars 
    : availableAvatars.filter(avatar => avatar.rarity === selectedCategory);

  const handleAvatarSelect = (avatar: AvatarItem) => {
    if (!avatar.unlocked) {
      Alert.alert(
        'Avatar Locked',
        `This avatar is locked. ${getUnlockRequirement(avatar)}`,
        [{ text: 'OK' }],
      );
      return;
    }
    setSelectedAvatar(avatar);
  };

  const getUnlockRequirement = (avatar: AvatarItem): string => {
    switch (avatar.id) {
      case 'star':
        return 'Reach level 3 to unlock.';
      case 'fire':
        return 'Reach level 5 to unlock.';
      case 'heart':
        return 'Reach level 7 to unlock.';
      case 'crown':
        return 'Reach level 10 to unlock.';
      case 'trophy':
        return 'Achieve a 30-day streak to unlock.';
      case 'diamond':
        return 'Learn 100 vocabulary words to unlock.';
      case 'rainbow':
        return 'Complete 7 lessons in a week to unlock.';
      case 'rocket':
        return 'Complete lessons with 90% accuracy to unlock.';
      case 'phoenix':
        return 'Achieve legendary learner status to unlock.';
      case 'dragon':
        return 'Master all CEFR levels to unlock.';
      default:
        return 'Complete specific achievements to unlock.';
    }
  };

  const handleSave = async () => {
    if (!selectedAvatar) return;

    try {
      if (onSave) {
        onSave(selectedAvatar);
      }
      
      Alert.alert('Success', 'Avatar updated successfully!');
    } catch (error) {
      console.error('Error saving avatar:', error);
      Alert.alert('Error', 'Failed to save avatar. Please try again.');
    }
  };

  const renderCategoryButton = (category: any) => (
    <TouchableOpacity
      key={category.key}
      style={[
        styles.categoryButton,
        selectedCategory === category.key && styles.categoryButtonActive,
      ]}
      onPress={() => setSelectedCategory(category.key)}
    >
      <Text style={[
        styles.categoryButtonText,
        selectedCategory === category.key && styles.categoryButtonTextActive,
      ]}>
        {category.label}
      </Text>
    </TouchableOpacity>
  );

  const renderAvatarItem = (avatar: AvatarItem, index: number) => (
    <Animated.View
      key={avatar.id}
      style={[
        styles.avatarItem,
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
          styles.avatarCard,
          selectedAvatar?.id === avatar.id && styles.avatarCardSelected,
          !avatar.unlocked && styles.avatarCardLocked,
        ]}
        onPress={() => handleAvatarSelect(avatar)}
        activeOpacity={0.7}
      >
        <View style={styles.avatarContainer}>
          <View style={[
            styles.avatarEmoji,
            { backgroundColor: avatar.color },
          ]}>
            <Text style={styles.avatarEmojiText}>{avatar.emoji}</Text>
          </View>
          
          {!avatar.unlocked && (
            <View style={styles.lockedOverlay}>
              <Text style={styles.lockedText}>🔒</Text>
            </View>
          )}
          
          {selectedAvatar?.id === avatar.id && (
            <View style={styles.selectedOverlay}>
              <CheckIcon size={20} color={theme.colors.white} />
            </View>
          )}
        </View>
        
        <View style={styles.avatarInfo}>
          <Text style={[
            styles.avatarName,
            !avatar.unlocked && styles.avatarNameLocked,
          ]}>
            {avatar.name}
          </Text>
          
          <View style={styles.avatarRarity}>
            {getRarityIcon(avatar.rarity)}
            <Text style={[
              styles.avatarRarityText,
              { color: getRarityColor(avatar.rarity) },
            ]}>
              {avatar.rarity.charAt(0).toUpperCase() + avatar.rarity.slice(1)}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading avatars...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Avatar Customization</Text>
          <Text style={styles.headerSubtitle}>
            Choose your avatar to represent you in the app
          </Text>
        </View>

        {/* Current Avatar Preview */}
        {selectedAvatar && (
          <Card style={styles.previewCard}>
            <Text style={styles.previewTitle}>Current Selection</Text>
            <View style={styles.previewContainer}>
              <View style={[
                styles.previewAvatar,
                { backgroundColor: selectedAvatar.color },
              ]}>
                <Text style={styles.previewEmoji}>{selectedAvatar.emoji}</Text>
              </View>
              <View style={styles.previewInfo}>
                <Text style={styles.previewName}>{selectedAvatar.name}</Text>
                <View style={styles.previewRarity}>
                  {getRarityIcon(selectedAvatar.rarity)}
                  <Text style={[
                    styles.previewRarityText,
                    { color: getRarityColor(selectedAvatar.rarity) },
                  ]}>
                    {selectedAvatar.rarity.charAt(0).toUpperCase() + selectedAvatar.rarity.slice(1)}
                  </Text>
                </View>
              </View>
            </View>
          </Card>
        )}

        {/* Category Filter */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.categoryContainer}
          contentContainerStyle={styles.categoryContent}
        >
          {avatarCategories.map(renderCategoryButton)}
        </ScrollView>

        {/* Avatars Grid */}
        <View style={styles.avatarsGrid}>
          {filteredAvatars.map(renderAvatarItem)}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <Button
            title="Cancel"
            onPress={onCancel || (() => {})}
            variant="outline"
            style={styles.cancelButton}
          />
          <Button
            title="Save Avatar"
            onPress={handleSave}
            style={styles.saveButton}
            disabled={!selectedAvatar}
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
  scrollView: {
    flex: 1,
    padding: theme.spacing.lg,
  },
  header: {
    marginBottom: theme.spacing.lg,
  },
  headerTitle: {
    fontSize: theme.fontSize.xxl,
    fontWeight: 'bold',
    color: theme.colors.black,
    marginBottom: theme.spacing.xs,
  },
  headerSubtitle: {
    fontSize: theme.fontSize.md,
    color: theme.colors.gray[600],
  },
  previewCard: {
    marginBottom: theme.spacing.lg,
    padding: theme.spacing.lg,
  },
  previewTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: '600',
    color: theme.colors.black,
    marginBottom: theme.spacing.md,
  },
  previewContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  previewAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  previewEmoji: {
    fontSize: 32,
  },
  previewInfo: {
    flex: 1,
  },
  previewName: {
    fontSize: theme.fontSize.lg,
    fontWeight: '600',
    color: theme.colors.black,
    marginBottom: theme.spacing.xs,
  },
  previewRarity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  previewRarityText: {
    fontSize: theme.fontSize.sm,
    fontWeight: '500',
  },
  categoryContainer: {
    marginBottom: theme.spacing.lg,
  },
  categoryContent: {
    paddingRight: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  categoryButton: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.gray[100],
  },
  categoryButtonActive: {
    backgroundColor: theme.colors.primary,
  },
  categoryButtonText: {
    fontSize: theme.fontSize.sm,
    fontWeight: '500',
    color: theme.colors.gray[600],
  },
  categoryButtonTextActive: {
    color: theme.colors.white,
  },
  avatarsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  avatarItem: {
    width: '45%',
  },
  avatarCard: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 2,
    borderColor: theme.colors.gray[200],
    alignItems: 'center',
  },
  avatarCardSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primaryLight,
  },
  avatarCardLocked: {
    opacity: 0.6,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: theme.spacing.md,
  },
  avatarEmoji: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarEmojiText: {
    fontSize: 32,
  },
  lockedOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 30,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  lockedText: {
    fontSize: 20,
  },
  selectedOverlay: {
    position: 'absolute',
    top: -5,
    right: -5,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.colors.white,
  },
  avatarInfo: {
    alignItems: 'center',
  },
  avatarName: {
    fontSize: theme.fontSize.md,
    fontWeight: '600',
    color: theme.colors.black,
    marginBottom: theme.spacing.xs,
  },
  avatarNameLocked: {
    color: theme.colors.gray[500],
  },
  avatarRarity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  avatarRarityText: {
    fontSize: theme.fontSize.xs,
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginTop: theme.spacing.lg,
  },
  cancelButton: {
    flex: 1,
  },
  saveButton: {
    flex: 1,
  },
});
