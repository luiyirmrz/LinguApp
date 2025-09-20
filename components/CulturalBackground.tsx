/**
 * Cultural Background Component
 * Provides language-specific background patterns and visual elements
 */

import React, { memo } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { useAdaptiveTheme } from '@/contexts/AdaptiveThemeContext';

interface CulturalBackgroundProps {
  children: React.ReactNode;
  pattern?: 'subtle' | 'medium' | 'strong';
  opacity?: number;
  style?: any;
}

const { width, height } = Dimensions.get('window');

export const CulturalBackground: React.FC<CulturalBackgroundProps> = ({
  children,
  pattern = 'subtle',
  opacity = 0.1,
  style,
}) => {
  const { theme, getCulturalPattern, getCulturalIcons } = useAdaptiveTheme();
  
  const culturalPattern = getCulturalPattern();
  const culturalIcons = getCulturalIcons();
  
  // Get pattern-specific styles
  const getPatternStyles = () => {
    const baseOpacity = opacity;
    
    switch (pattern) {
      case 'strong':
        return {
          opacity: baseOpacity * 3,
          scale: 1.2,
        };
      case 'medium':
        return {
          opacity: baseOpacity * 2,
          scale: 1.0,
        };
      case 'subtle':
      default:
        return {
          opacity: baseOpacity,
          scale: 0.8,
        };
    }
  };

  const patternConfig = getPatternStyles();

  // Render different patterns based on language
  const renderCulturalPattern = () => {
    switch (culturalPattern) {
      case 'flamenco':
        return renderFlamencoPattern();
      case 'tiles':
        return renderTilePattern();
      case 'geometric':
        return renderGeometricPattern();
      case 'fleur-de-lis':
        return renderFleurDeLisPattern();
      case 'elegant':
        return renderElegantPattern();
      case 'minimalist':
        return renderMinimalistPattern();
      case 'adriatic':
        return renderAdriaticPattern();
      case 'waves':
        return renderWavePattern();
      case 'coastal':
        return renderCoastalPattern();
      case 'precision':
        return renderPrecisionPattern();
      case 'industrial':
        return renderIndustrialPattern();
      case 'renaissance':
        return renderRenaissancePattern();
      case 'artistic':
        return renderArtisticPattern();
      case 'ornate':
        return renderOrnatePattern();
      case 'azulejo':
        return renderAzulejoPattern();
      case 'oceanic':
        return renderOceanicPattern();
      case 'maritime':
        return renderMaritimePattern();
      case 'classic':
        return renderClassicPattern();
      case 'clean':
        return renderCleanPattern();
      case 'professional':
        return renderProfessionalPattern();
      case 'modern':
      default:
        return renderModernPattern();
    }
  };

  // Pattern renderers
  const renderFlamencoPattern = () => (
    <View style={[styles.patternContainer, { opacity: patternConfig.opacity }]}>
      {/* Flamenco-inspired geometric patterns */}
      <View style={[styles.flamencoElement, { 
        backgroundColor: theme.colors.primary,
        transform: [{ scale: patternConfig.scale }],
      }]} />
      <View style={[styles.flamencoElement, { 
        backgroundColor: theme.colors.secondary,
        transform: [{ scale: patternConfig.scale }, { rotate: '45deg' }],
      }]} />
    </View>
  );

  const renderTilePattern = () => (
    <View style={[styles.patternContainer, { opacity: patternConfig.opacity }]}>
      {/* Tile-inspired patterns */}
      <View style={[styles.tileElement, { backgroundColor: theme.colors.primary }]} />
      <View style={[styles.tileElement, { backgroundColor: theme.colors.secondary }]} />
      <View style={[styles.tileElement, { backgroundColor: theme.colors.accent }]} />
    </View>
  );

  const renderGeometricPattern = () => (
    <View style={[styles.patternContainer, { opacity: patternConfig.opacity }]}>
      {/* Geometric shapes */}
      <View style={[styles.geometricElement, { backgroundColor: theme.colors.primary }]} />
      <View style={[styles.geometricElement, { backgroundColor: theme.colors.secondary }]} />
    </View>
  );

  const renderFleurDeLisPattern = () => (
    <View style={[styles.patternContainer, { opacity: patternConfig.opacity }]}>
      {/* Elegant French-inspired patterns */}
      <View style={[styles.elegantElement, { backgroundColor: theme.colors.primary }]} />
    </View>
  );

  const renderElegantPattern = () => (
    <View style={[styles.patternContainer, { opacity: patternConfig.opacity }]}>
      {/* Elegant French patterns */}
      <View style={[styles.elegantElement, { backgroundColor: theme.colors.primary }]} />
      <View style={[styles.elegantElement, { backgroundColor: theme.colors.secondary }]} />
    </View>
  );

  const renderMinimalistPattern = () => (
    <View style={[styles.patternContainer, { opacity: patternConfig.opacity }]}>
      {/* Minimalist patterns */}
      <View style={[styles.minimalistElement, { backgroundColor: theme.colors.primary }]} />
    </View>
  );

  const renderAdriaticPattern = () => (
    <View style={[styles.patternContainer, { opacity: patternConfig.opacity }]}>
      {/* Adriatic-inspired patterns */}
      <View style={[styles.waveElement, { backgroundColor: theme.colors.primary }]} />
      <View style={[styles.waveElement, { backgroundColor: theme.colors.secondary }]} />
    </View>
  );

  const renderWavePattern = () => (
    <View style={[styles.patternContainer, { opacity: patternConfig.opacity }]}>
      {/* Wave patterns */}
      <View style={[styles.waveElement, { backgroundColor: theme.colors.primary }]} />
    </View>
  );

  const renderCoastalPattern = () => (
    <View style={[styles.patternContainer, { opacity: patternConfig.opacity }]}>
      {/* Coastal patterns */}
      <View style={[styles.coastalElement, { backgroundColor: theme.colors.primary }]} />
    </View>
  );

  const renderPrecisionPattern = () => (
    <View style={[styles.patternContainer, { opacity: patternConfig.opacity }]}>
      {/* Precision German patterns */}
      <View style={[styles.precisionElement, { backgroundColor: theme.colors.primary }]} />
    </View>
  );

  const renderIndustrialPattern = () => (
    <View style={[styles.patternContainer, { opacity: patternConfig.opacity }]}>
      {/* Industrial patterns */}
      <View style={[styles.industrialElement, { backgroundColor: theme.colors.primary }]} />
    </View>
  );

  const renderRenaissancePattern = () => (
    <View style={[styles.patternContainer, { opacity: patternConfig.opacity }]}>
      {/* Renaissance Italian patterns */}
      <View style={[styles.renaissanceElement, { backgroundColor: theme.colors.primary }]} />
    </View>
  );

  const renderArtisticPattern = () => (
    <View style={[styles.patternContainer, { opacity: patternConfig.opacity }]}>
      {/* Artistic patterns */}
      <View style={[styles.artisticElement, { backgroundColor: theme.colors.primary }]} />
    </View>
  );

  const renderOrnatePattern = () => (
    <View style={[styles.patternContainer, { opacity: patternConfig.opacity }]}>
      {/* Ornate patterns */}
      <View style={[styles.ornateElement, { backgroundColor: theme.colors.primary }]} />
    </View>
  );

  const renderAzulejoPattern = () => (
    <View style={[styles.patternContainer, { opacity: patternConfig.opacity }]}>
      {/* Portuguese azulejo patterns */}
      <View style={[styles.azulejoElement, { backgroundColor: theme.colors.primary }]} />
    </View>
  );

  const renderOceanicPattern = () => (
    <View style={[styles.patternContainer, { opacity: patternConfig.opacity }]}>
      {/* Oceanic patterns */}
      <View style={[styles.oceanicElement, { backgroundColor: theme.colors.primary }]} />
    </View>
  );

  const renderMaritimePattern = () => (
    <View style={[styles.patternContainer, { opacity: patternConfig.opacity }]}>
      {/* Maritime patterns */}
      <View style={[styles.maritimeElement, { backgroundColor: theme.colors.primary }]} />
    </View>
  );

  const renderClassicPattern = () => (
    <View style={[styles.patternContainer, { opacity: patternConfig.opacity }]}>
      {/* Classic English patterns */}
      <View style={[styles.classicElement, { backgroundColor: theme.colors.primary }]} />
    </View>
  );

  const renderCleanPattern = () => (
    <View style={[styles.patternContainer, { opacity: patternConfig.opacity }]}>
      {/* Clean patterns */}
      <View style={[styles.cleanElement, { backgroundColor: theme.colors.primary }]} />
    </View>
  );

  const renderProfessionalPattern = () => (
    <View style={[styles.patternContainer, { opacity: patternConfig.opacity }]}>
      {/* Professional patterns */}
      <View style={[styles.professionalElement, { backgroundColor: theme.colors.primary }]} />
    </View>
  );

  const renderModernPattern = () => (
    <View style={[styles.patternContainer, { opacity: patternConfig.opacity }]}>
      {/* Modern patterns */}
      <View style={[styles.modernElement, { backgroundColor: theme.colors.primary }]} />
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }, style]}>
      {renderCulturalPattern()}
      <View style={styles.content}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  patternContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
  },
  content: {
    flex: 1,
    zIndex: 1,
  },
  // Pattern element styles
  flamencoElement: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    top: '20%',
    left: '10%',
  },
  tileElement: {
    position: 'absolute',
    width: 80,
    height: 80,
    top: '30%',
    left: '20%',
  },
  geometricElement: {
    position: 'absolute',
    width: 60,
    height: 60,
    top: '40%',
    left: '30%',
  },
  elegantElement: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    top: '25%',
    left: '15%',
  },
  minimalistElement: {
    position: 'absolute',
    width: 200,
    height: 2,
    top: '50%',
    left: '10%',
  },
  waveElement: {
    position: 'absolute',
    width: 150,
    height: 20,
    borderRadius: 10,
    top: '35%',
    left: '20%',
  },
  coastalElement: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    top: '30%',
    left: '25%',
  },
  precisionElement: {
    position: 'absolute',
    width: 80,
    height: 80,
    top: '40%',
    left: '20%',
  },
  industrialElement: {
    position: 'absolute',
    width: 100,
    height: 20,
    top: '35%',
    left: '25%',
  },
  renaissanceElement: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    top: '30%',
    left: '20%',
  },
  artisticElement: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    top: '35%',
    left: '25%',
  },
  ornateElement: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    top: '25%',
    left: '15%',
  },
  azulejoElement: {
    position: 'absolute',
    width: 90,
    height: 90,
    top: '35%',
    left: '25%',
  },
  oceanicElement: {
    position: 'absolute',
    width: 110,
    height: 110,
    borderRadius: 55,
    top: '30%',
    left: '20%',
  },
  maritimeElement: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    top: '35%',
    left: '25%',
  },
  classicElement: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    top: '30%',
    left: '20%',
  },
  cleanElement: {
    position: 'absolute',
    width: 200,
    height: 1,
    top: '50%',
    left: '10%',
  },
  professionalElement: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    top: '30%',
    left: '20%',
  },
  modernElement: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    top: '35%',
    left: '25%',
  },
});

export default memo(CulturalBackground);


CulturalBackground.displayName = 'CulturalBackground';
