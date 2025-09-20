import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { theme } from '@/constants/theme';
import { Heart, Zap, Shield, Coins, Star, Sparkles, Gem } from '@/components/icons/LucideReplacement';

export default function ShopScreen() {
  const [selectedCategory, setSelectedCategory] = useState<'powerups' | 'cosmetics' | 'hearts'>('powerups');

  // Mock user data
  const user = {
    gems: 120,
    hearts: 5,
  };

  // Mock shop items
  const shopItems = {
    powerups: [
      {
        id: 'streak_freeze',
        name: 'Streak Freeze',
        description: 'Protect your streak for 1 day',
        price: 50,
        icon: Shield,
        color: theme.colors.blue,
      },
      {
        id: 'double_xp',
        name: 'Double XP',
        description: 'Earn 2x XP for 1 hour',
        price: 30,
        icon: Zap,
        color: theme.colors.orange,
      },
      {
        id: 'perfect_lesson',
        name: 'Perfect Lesson',
        description: 'Skip to next lesson without mistakes',
        price: 25,
        icon: Star,
        color: theme.colors.purple,
      },
    ],
    cosmetics: [
      {
        id: 'golden_avatar',
        name: 'Golden Avatar',
        description: 'Shine bright with a golden avatar',
        price: 100,
        icon: Sparkles,
        color: '#FFD700',
      },
      {
        id: 'rainbow_border',
        name: 'Rainbow Border',
        description: 'Colorful border for your profile',
        price: 75,
        icon: Sparkles,
        color: theme.colors.primary,
      },
    ],
    hearts: [
      {
        id: 'heart_1',
        name: '1 Heart',
        description: 'Get 1 heart to continue learning',
        price: 10,
        icon: Heart,
        color: theme.colors.red,
      },
      {
        id: 'heart_5',
        name: '5 Hearts',
        description: 'Get 5 hearts to continue learning',
        price: 40,
        icon: Heart,
        color: theme.colors.red,
      },
      {
        id: 'heart_10',
        name: '10 Hearts',
        description: 'Get 10 hearts to continue learning',
        price: 70,
        icon: Heart,
        color: theme.colors.red,
      },
    ],
  };

  const currentItems = shopItems[selectedCategory];

  const handlePurchase = (item: any) => {
    if (user.gems < item.price) {
      Alert.alert('Not Enough Gems', 'You need more gems to purchase this item.');
      return;
    }

    Alert.alert(
      'Purchase Confirmed',
      `You bought ${item.name} for ${item.price} gems!`,
      [{ text: 'OK' }],
    );
  };

  const renderShopItem = (item: any) => {
    const IconComponent = item.icon;
    const canAfford = user.gems >= item.price;

    return (
      <View key={item.id} style={styles.shopItem}>
        <View style={styles.itemHeader}>
          <View style={[styles.itemIcon, { backgroundColor: `${item.color  }20` }]}>
            <IconComponent size={24} color={item.color} />
          </View>
          <View style={styles.itemInfo}>
            <Text style={styles.itemName}>{item.name}</Text>
            <Text style={styles.itemDescription}>{item.description}</Text>
          </View>
        </View>
        
        <View style={styles.itemFooter}>
          <View style={styles.priceContainer}>
            <Gem size={16} color={theme.colors.blue} />
            <Text style={styles.price}>{item.price}</Text>
          </View>
          
          <TouchableOpacity
            style={[
              styles.buyButton,
              !canAfford && styles.buyButtonDisabled,
            ]}
            onPress={() => handlePurchase(item)}
            disabled={!canAfford}
          >
            <Text style={[
              styles.buyButtonText,
              !canAfford && styles.buyButtonTextDisabled,
            ]}>
              {canAfford ? 'Buy' : 'Not Enough'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Shop</Text>
        <View style={styles.currencyContainer}>
          <View style={styles.currencyItem}>
            <Gem size={20} color={theme.colors.blue} />
            <Text style={styles.currencyText}>{user.gems}</Text>
          </View>
          <View style={styles.currencyItem}>
            <Heart size={20} color={theme.colors.red} />
            <Text style={styles.currencyText}>{user.hearts}</Text>
          </View>
          </View>
        </View>
        
      {/* Category Selector */}
      <View style={styles.categoryContainer}>
        <TouchableOpacity
          style={[styles.categoryTab, selectedCategory === 'powerups' && styles.activeCategoryTab]}
          onPress={() => setSelectedCategory('powerups')}
        >
          <Text style={[styles.categoryText, selectedCategory === 'powerups' && styles.activeCategoryText]}>
            Power-ups
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.categoryTab, selectedCategory === 'cosmetics' && styles.activeCategoryTab]}
          onPress={() => setSelectedCategory('cosmetics')}
        >
          <Text style={[styles.categoryText, selectedCategory === 'cosmetics' && styles.activeCategoryText]}>
            Cosmetics
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.categoryTab, selectedCategory === 'hearts' && styles.activeCategoryTab]}
          onPress={() => setSelectedCategory('hearts')}
        >
          <Text style={[styles.categoryText, selectedCategory === 'hearts' && styles.activeCategoryText]}>
            Hearts
          </Text>
        </TouchableOpacity>
        </View>
        
      {/* Shop Items */}
      <ScrollView style={styles.shopItems} showsVerticalScrollIndicator={false}>
        <View style={styles.itemsList}>
          {currentItems.map(renderShopItem)}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.lg,
    paddingTop: theme.spacing.md,
  },
  title: {
    fontSize: theme.fontSize.xxl,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  currencyContainer: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  currencyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    gap: theme.spacing.xs,
  },
  currencyText: {
    fontSize: theme.fontSize.md,
    fontWeight: '600',
    color: theme.colors.text,
  },
  categoryContainer: {
    flexDirection: 'row',
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: 4,
  },
  categoryTab: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    alignItems: 'center',
    borderRadius: theme.borderRadius.sm,
  },
  activeCategoryTab: {
    backgroundColor: theme.colors.primary,
  },
  categoryText: {
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  activeCategoryText: {
    color: theme.colors.white,
  },
  shopItems: {
    flex: 1,
  },
  itemsList: {
    paddingHorizontal: theme.spacing.lg,
  },
  shopItem: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  itemIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: theme.fontSize.md,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  itemDescription: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  price: {
    fontSize: theme.fontSize.md,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  buyButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
  },
  buyButtonDisabled: {
    backgroundColor: theme.colors.gray[300],
  },
  buyButtonText: {
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
    color: theme.colors.white,
  },
  buyButtonTextDisabled: {
    color: theme.colors.gray[500],
  },
});
