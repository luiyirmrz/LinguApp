/**
 * Adaptive Lesson Screen - Example Implementation
 * Demonstrates how to use the adaptive design system in a lesson component
 */

import React, { useState, memo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useAdaptiveTheme } from '@/contexts/AdaptiveThemeContext';
import { CulturalBackground } from './CulturalBackground';
import { CulturalHeader } from './CulturalHeader';
import { useLanguage } from '@/hooks/useLanguage';

interface AdaptiveLessonScreenProps {
  lessonId: string;
  title: string;
  content: string;
  onComplete: () => void;
}

export const AdaptiveLessonScreen: React.FC<AdaptiveLessonScreenProps> = ({
  lessonId,
  title,
  content,
  onComplete,
}) => {
  const { 
    theme, 
    getPrimaryColor, 
    getSecondaryColor, 
    getAccentColor,
    getBackgroundColor,
    getSurfaceColor,
    getTextColor,
    getTextSecondaryColor,
    getCulturalIcons,
    getCulturalColor,
    isDarkMode,
    toggleDarkMode,
  } = useAdaptiveTheme();
  
  const { currentLanguage } = useLanguage();
  const [isCompleted, setIsCompleted] = useState(false);
  
  const culturalIcons = getCulturalIcons();
  const flagColor = getCulturalColor('flag');
  const architectureColor = getCulturalColor('architecture');
  
  const handleComplete = () => {
    setIsCompleted(true);
    setTimeout(() => {
      onComplete();
    }, 1500);
  };

  return (
    <CulturalBackground pattern="medium" opacity={0.1}>
      <ScrollView style={styles.container}>
        {/* Cultural Header */}
        <CulturalHeader
          title={title}
          subtitle={`${currentLanguage?.name || 'Language'} Lesson`}
          showCulturalIcons={true}
          showLanguageFlag={true}
        />
        
        {/* Language Info Card */}
        <View style={[
          styles.infoCard,
          { 
            backgroundColor: getSurfaceColor(),
            borderColor: getPrimaryColor(),
          },
        ]}>
          <View style={styles.languageInfo}>
            <View style={[styles.flagIndicator, { backgroundColor: flagColor }]}>
              <Text style={styles.flagText}>{currentLanguage?.flag}</Text>
            </View>
            <View style={styles.languageDetails}>
              <Text style={[styles.languageName, { color: getTextColor() }]}>
                {currentLanguage?.name}
              </Text>
              <Text style={[styles.languageCode, { color: getTextSecondaryColor() }]}>
                {currentLanguage?.code.toUpperCase()}
              </Text>
            </View>
          </View>
          
          <View style={styles.culturalInfo}>
            <Text style={[styles.culturalLabel, { color: getTextSecondaryColor() }]}>
              Cultural Elements:
            </Text>
            <View style={styles.culturalIcons}>
              {culturalIcons.map((icon, index) => (
                <Text key={index} style={styles.culturalIcon}>
                  {icon}
                </Text>
              ))}
            </View>
          </View>
        </View>
        
        {/* Lesson Content */}
        <View style={[
          styles.contentCard,
          { 
            backgroundColor: getSurfaceColor(),
            borderColor: getSecondaryColor(),
          },
        ]}>
          <Text style={[styles.contentTitle, { color: getTextColor() }]}>
            Lesson Content
          </Text>
          <Text style={[styles.contentText, { color: getTextColor() }]}>
            {content}
          </Text>
        </View>
        
        {/* Cultural Color Palette Display */}
        <View style={[
          styles.paletteCard,
          { backgroundColor: getSurfaceColor() },
        ]}>
          <Text style={[styles.paletteTitle, { color: getTextColor() }]}>
            {theme.language.toUpperCase()} Color Palette
          </Text>
          
          <View style={styles.colorSwatches}>
            <View style={styles.colorRow}>
              <View style={[styles.colorSwatch, { backgroundColor: getPrimaryColor() }]}>
                <Text style={styles.colorLabel}>Primary</Text>
              </View>
              <View style={[styles.colorSwatch, { backgroundColor: getSecondaryColor() }]}>
                <Text style={styles.colorLabel}>Secondary</Text>
              </View>
              <View style={[styles.colorSwatch, { backgroundColor: getAccentColor() }]}>
                <Text style={styles.colorLabel}>Accent</Text>
              </View>
            </View>
            
            <View style={styles.colorRow}>
              <View style={[styles.colorSwatch, { backgroundColor: flagColor }]}>
                <Text style={styles.colorLabel}>Flag</Text>
              </View>
              <View style={[styles.colorSwatch, { backgroundColor: architectureColor }]}>
                <Text style={styles.colorLabel}>Architecture</Text>
              </View>
              <View style={[styles.colorSwatch, { backgroundColor: getCulturalColor('nature') }]}>
                <Text style={styles.colorLabel}>Nature</Text>
              </View>
            </View>
          </View>
        </View>
        
        {/* Dark Mode Toggle */}
        <TouchableOpacity
          style={[
            styles.darkModeToggle,
            { 
              backgroundColor: getPrimaryColor(),
              borderColor: getSecondaryColor(),
            },
          ]}
          onPress={toggleDarkMode}
        >
          <Text style={styles.toggleText}>
            {isDarkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
          </Text>
        </TouchableOpacity>
        
        {/* Complete Button */}
        <TouchableOpacity
          style={[
            styles.completeButton,
            { 
              backgroundColor: isCompleted ? getAccentColor() : getPrimaryColor(),
              borderColor: getSecondaryColor(),
            },
          ]}
          onPress={handleComplete}
          disabled={isCompleted}
        >
          <Text style={styles.completeButtonText}>
            {isCompleted ? '✅ Completed!' : 'Complete Lesson'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </CulturalBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  infoCard: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  languageInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  flagIndicator: {
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
  languageDetails: {
    flex: 1,
  },
  languageName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 2,
  },
  languageCode: {
    fontSize: 14,
    fontWeight: '400',
  },
  culturalInfo: {
    marginTop: 8,
  },
  culturalLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  culturalIcons: {
    flexDirection: 'row',
    gap: 8,
  },
  culturalIcon: {
    fontSize: 24,
  },
  contentCard: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  contentTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
  },
  contentText: {
    fontSize: 16,
    lineHeight: 24,
  },
  paletteCard: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  paletteTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  colorSwatches: {
    gap: 12,
  },
  colorRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 8,
  },
  colorSwatch: {
    flex: 1,
    height: 60,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  colorLabel: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    textShadowColor: '#000000',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  darkModeToggle: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
  },
  toggleText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  completeButton: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 3.84,
    elevation: 5,
  },
  completeButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default memo(AdaptiveLessonScreen);


AdaptiveLessonScreen.displayName = 'AdaptiveLessonScreen';
