/**
 * Cultural Header Component
 * Displays language-specific cultural elements and icons
 */

import React, { memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useAdaptiveTheme } from '@/contexts/AdaptiveThemeContext';
import { useLanguage } from '@/hooks/useLanguage';

interface CulturalHeaderProps {
  title?: string;
  subtitle?: string;
  showCulturalIcons?: boolean;
  showLanguageFlag?: boolean;
  onPress?: () => void;
  style?: any;
}

export const CulturalHeader: React.FC<CulturalHeaderProps> = ({
  title,
  subtitle,
  showCulturalIcons = true,
  showLanguageFlag = true,
  onPress,
  style,
}) => {
  const { theme, getCulturalIcons, getCulturalColor } = useAdaptiveTheme();
  const { currentLanguage } = useLanguage();
  
  const culturalIcons = getCulturalIcons();
  const flagColor = getCulturalColor('flag');
  
  const HeaderContent = () => (
    <View style={[styles.container, { backgroundColor: theme.colors.surface }, style]}>
      {/* Language flag indicator */}
      {showLanguageFlag && currentLanguage && (
        <View style={[styles.flagContainer, { backgroundColor: flagColor }]}>
          <Text style={styles.flagText}>{currentLanguage.flag}</Text>
        </View>
      )}
      
      {/* Title and subtitle */}
      <View style={styles.textContainer}>
        {title && (
          <Text style={[styles.title, { color: theme.colors.text }]}>
            {title}
          </Text>
        )}
        {subtitle && (
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            {subtitle}
          </Text>
        )}
      </View>
      
      {/* Cultural icons */}
      {showCulturalIcons && (
        <View style={styles.iconsContainer}>
          {culturalIcons.slice(0, 3).map((icon, index) => (
            <Text key={index} style={styles.culturalIcon}>
              {icon}
            </Text>
          ))}
        </View>
      )}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        <HeaderContent />
      </TouchableOpacity>
    );
  }

  return <HeaderContent />;
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  flagContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  flagText: {
    fontSize: 20,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '400',
  },
  iconsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  culturalIcon: {
    fontSize: 20,
    marginLeft: 8,
  },
});

export default memo(CulturalHeader);


CulturalHeader.displayName = 'CulturalHeader';
