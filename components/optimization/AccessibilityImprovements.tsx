import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Dimensions,
  Platform,
} from 'react-native';
import { theme } from '@/constants/theme';
import { useAccessibility, useUXMetrics } from '@/services/optimization/uxOptimizationService';
import { 
  EyeIcon,
  EarIcon,
  HandIcon,
  BrainIcon,
  SettingsIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  InfoIcon,
  Volume2Icon,
  VolumeXIcon,
  ZoomInIcon,
  ZoomOutIcon,
  ContrastIcon,
  TextIcon,
  MouseIcon,
  KeyboardIcon,
  VoiceIcon,
  AccessibilityIcon,
  HelpCircleIcon,
  ChevronRightIcon,
  ChevronDownIcon,
} from '@/components/icons/LucideReplacement';

const { width } = Dimensions.get('window');

interface AccessibilityImprovementsProps {
  onAccessibilityChange?: (feature: string, enabled: boolean) => void;
}

export default function AccessibilityImprovements({
  onAccessibilityChange,
}: AccessibilityImprovementsProps) {
  const { features, enableFeature, recordUsage } = useAccessibility();
  const uxMetrics = useUXMetrics();

  // State management
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['visual', 'auditory']));
  const [accessibilityLevel, setAccessibilityLevel] = useState<'basic' | 'enhanced' | 'full'>('enhanced');
  const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large' | 'extra-large'>('medium');
  const [contrastLevel, setContrastLevel] = useState<'normal' | 'high' | 'extra-high'>('normal');
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [voiceControlEnabled, setVoiceControlEnabled] = useState(false);

  useEffect(() => {
    // Initialize accessibility features based on current level
    updateAccessibilityLevel(accessibilityLevel);
  }, [accessibilityLevel]);

  const updateAccessibilityLevel = (level: 'basic' | 'enhanced' | 'full') => {
    features.forEach(feature => {
      let shouldEnable = false;
      
      switch (level) {
        case 'basic':
          shouldEnable = feature.type === 'visual' && feature.id === 'screen_reader';
          break;
        case 'enhanced':
          shouldEnable = feature.type === 'visual' || feature.type === 'motor';
          break;
        case 'full':
          shouldEnable = true;
          break;
      }
      
      if (shouldEnable && !feature.enabled) {
        enableFeature(feature.id);
      }
    });
  };

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const handleFeatureToggle = (featureId: string, enabled: boolean) => {
    if (enabled) {
      enableFeature(featureId);
      recordUsage(featureId);
    }
    onAccessibilityChange?.(featureId, enabled);
  };

  const handleAccessibilityLevelChange = (level: 'basic' | 'enhanced' | 'full') => {
    setAccessibilityLevel(level);
    updateAccessibilityLevel(level);
  };

  const handleFontSizeChange = (size: 'small' | 'medium' | 'large' | 'extra-large') => {
    setFontSize(size);
    recordUsage('large_text');
  };

  const handleContrastChange = (contrast: 'normal' | 'high' | 'extra-high') => {
    setContrastLevel(contrast);
    recordUsage('high_contrast');
  };

  const handleAudioToggle = (enabled: boolean) => {
    setAudioEnabled(enabled);
    recordUsage('audio_descriptions');
  };

  const handleVoiceControlToggle = (enabled: boolean) => {
    setVoiceControlEnabled(enabled);
    recordUsage('voice_control');
  };

  const getAccessibilityIcon = (type: string) => {
    switch (type) {
      case 'visual':
        return <EyeIcon size={24} color={theme.colors.primary} />;
      case 'auditory':
        return <EarIcon size={24} color={theme.colors.success} />;
      case 'motor':
        return <HandIcon size={24} color={theme.colors.warning} />;
      case 'cognitive':
        return <BrainIcon size={24} color={theme.colors.info} />;
      default:
        return <AccessibilityIcon size={24} color={theme.colors.gray[600]} />;
    }
  };

  const getFeatureIcon = (featureId: string) => {
    switch (featureId) {
      case 'screen_reader':
        return <EyeIcon size={20} color={theme.colors.primary} />;
      case 'high_contrast':
        return <ContrastIcon size={20} color={theme.colors.success} />;
      case 'large_text':
        return <TextIcon size={20} color={theme.colors.warning} />;
      case 'voice_control':
        return <VoiceIcon size={20} color={theme.colors.info} />;
      case 'gesture_alternatives':
        return <MouseIcon size={20} color={theme.colors.danger} />;
      case 'audio_descriptions':
        return <Volume2Icon size={20} color={theme.colors.primary} />;
      case 'cognitive_assistance':
        return <BrainIcon size={20} color={theme.colors.success} />;
      default:
        return <AccessibilityIcon size={20} color={theme.colors.gray[600]} />;
    }
  };

  const renderAccessibilityLevelSelector = () => (
    <View style={styles.levelSelector}>
      <Text style={styles.sectionTitle}>Accessibility Level</Text>
      <View style={styles.levelButtons}>
        {(['basic', 'enhanced', 'full'] as const).map((level) => (
          <TouchableOpacity
            key={level}
            style={[
              styles.levelButton,
              accessibilityLevel === level && styles.activeLevelButton,
            ]}
            onPress={() => handleAccessibilityLevelChange(level)}
          >
            <Text style={[
              styles.levelButtonText,
              accessibilityLevel === level && styles.activeLevelButtonText,
            ]}>
              {level.charAt(0).toUpperCase() + level.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderVisualAccessibility = () => {
    const visualFeatures = features.filter(f => f.type === 'visual');

    return (
      <View style={styles.section}>
        <TouchableOpacity
          style={styles.sectionHeader}
          onPress={() => toggleSection('visual')}
        >
          <View style={styles.sectionTitleContainer}>
            {getAccessibilityIcon('visual')}
            <Text style={styles.sectionTitle}>Visual Accessibility</Text>
          </View>
          {expandedSections.has('visual') ? 
            <ChevronDownIcon size={20} color={theme.colors.gray[600]} /> :
            <ChevronRightIcon size={20} color={theme.colors.gray[600]} />
          }
        </TouchableOpacity>

        {expandedSections.has('visual') && (
          <View style={styles.sectionContent}>
            {/* Font Size Settings */}
            <View style={styles.settingGroup}>
              <Text style={styles.settingTitle}>Text Size</Text>
              <View style={styles.fontSizeButtons}>
                {(['small', 'medium', 'large', 'extra-large'] as const).map((size) => (
                  <TouchableOpacity
                    key={size}
                    style={[
                      styles.fontSizeButton,
                      fontSize === size && styles.activeFontSizeButton,
                    ]}
                    onPress={() => handleFontSizeChange(size)}
                  >
                    <Text style={[
                      styles.fontSizeButtonText,
                      fontSize === size && styles.activeFontSizeButtonText,
                    ]}>
                      {size === 'small' ? 'S' : size === 'medium' ? 'M' : size === 'large' ? 'L' : 'XL'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Contrast Settings */}
            <View style={styles.settingGroup}>
              <Text style={styles.settingTitle}>Contrast Level</Text>
              <View style={styles.contrastButtons}>
                {(['normal', 'high', 'extra-high'] as const).map((contrast) => (
                  <TouchableOpacity
                    key={contrast}
                    style={[
                      styles.contrastButton,
                      contrastLevel === contrast && styles.activeContrastButton,
                    ]}
                    onPress={() => handleContrastChange(contrast)}
                  >
                    <Text style={[
                      styles.contrastButtonText,
                      contrastLevel === contrast && styles.activeContrastButtonText,
                    ]}>
                      {contrast === 'normal' ? 'Normal' : contrast === 'high' ? 'High' : 'Extra High'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Visual Features */}
            {visualFeatures.map((feature) => (
              <View key={feature.id} style={styles.featureItem}>
                <View style={styles.featureInfo}>
                  {getFeatureIcon(feature.id)}
                  <View style={styles.featureDetails}>
                    <Text style={styles.featureName}>{feature.name}</Text>
                    <Text style={styles.featureDescription}>
                      {feature.id === 'screen_reader' && 'Support for screen readers and assistive technologies'}
                      {feature.id === 'high_contrast' && 'Enhanced contrast for better visibility'}
                      {feature.id === 'large_text' && 'Larger text sizes for easier reading'}
                    </Text>
                  </View>
                </View>
                <Switch
                  value={feature.enabled}
                  onValueChange={(enabled) => handleFeatureToggle(feature.id, enabled)}
                  trackColor={{ false: theme.colors.gray[300], true: theme.colors.primary }}
                  thumbColor={feature.enabled ? theme.colors.white : theme.colors.gray[500]}
                />
              </View>
            ))}
          </View>
        )}
      </View>
    );
  };

  const renderAuditoryAccessibility = () => {
    const auditoryFeatures = features.filter(f => f.type === 'auditory');

    return (
      <View style={styles.section}>
        <TouchableOpacity
          style={styles.sectionHeader}
          onPress={() => toggleSection('auditory')}
        >
          <View style={styles.sectionTitleContainer}>
            {getAccessibilityIcon('auditory')}
            <Text style={styles.sectionTitle}>Auditory Accessibility</Text>
          </View>
          {expandedSections.has('auditory') ? 
            <ChevronDownIcon size={20} color={theme.colors.gray[600]} /> :
            <ChevronRightIcon size={20} color={theme.colors.gray[600]} />
          }
        </TouchableOpacity>

        {expandedSections.has('auditory') && (
          <View style={styles.sectionContent}>
            {/* Audio Settings */}
            <View style={styles.settingGroup}>
              <View style={styles.featureItem}>
                <View style={styles.featureInfo}>
                  {audioEnabled ? <Volume2Icon size={20} color={theme.colors.success} /> : <VolumeXIcon size={20} color={theme.colors.gray[600]} />}
                  <View style={styles.featureDetails}>
                    <Text style={styles.featureName}>Audio Descriptions</Text>
                    <Text style={styles.featureDescription}>
                      Provide audio descriptions for visual content
                    </Text>
                  </View>
                </View>
                <Switch
                  value={audioEnabled}
                  onValueChange={handleAudioToggle}
                  trackColor={{ false: theme.colors.gray[300], true: theme.colors.success }}
                  thumbColor={audioEnabled ? theme.colors.white : theme.colors.gray[500]}
                />
              </View>
            </View>

            {/* Auditory Features */}
            {auditoryFeatures.map((feature) => (
              <View key={feature.id} style={styles.featureItem}>
                <View style={styles.featureInfo}>
                  {getFeatureIcon(feature.id)}
                  <View style={styles.featureDetails}>
                    <Text style={styles.featureName}>{feature.name}</Text>
                    <Text style={styles.featureDescription}>
                      {feature.id === 'audio_descriptions' && 'Audio descriptions for visual content'}
                    </Text>
                  </View>
                </View>
                <Switch
                  value={feature.enabled}
                  onValueChange={(enabled) => handleFeatureToggle(feature.id, enabled)}
                  trackColor={{ false: theme.colors.gray[300], true: theme.colors.success }}
                  thumbColor={feature.enabled ? theme.colors.white : theme.colors.gray[500]}
                />
              </View>
            ))}
          </View>
        )}
      </View>
    );
  };

  const renderMotorAccessibility = () => {
    const motorFeatures = features.filter(f => f.type === 'motor');

    return (
      <View style={styles.section}>
        <TouchableOpacity
          style={styles.sectionHeader}
          onPress={() => toggleSection('motor')}
        >
          <View style={styles.sectionTitleContainer}>
            {getAccessibilityIcon('motor')}
            <Text style={styles.sectionTitle}>Motor Accessibility</Text>
          </View>
          {expandedSections.has('motor') ? 
            <ChevronDownIcon size={20} color={theme.colors.gray[600]} /> :
            <ChevronRightIcon size={20} color={theme.colors.gray[600]} />
          }
        </TouchableOpacity>

        {expandedSections.has('motor') && (
          <View style={styles.sectionContent}>
            {/* Voice Control */}
            <View style={styles.settingGroup}>
              <View style={styles.featureItem}>
                <View style={styles.featureInfo}>
                  {voiceControlEnabled ? <VoiceIcon size={20} color={theme.colors.info} /> : <KeyboardIcon size={20} color={theme.colors.gray[600]} />}
                  <View style={styles.featureDetails}>
                    <Text style={styles.featureName}>Voice Control</Text>
                    <Text style={styles.featureDescription}>
                      Control the app using voice commands
                    </Text>
                  </View>
                </View>
                <Switch
                  value={voiceControlEnabled}
                  onValueChange={handleVoiceControlToggle}
                  trackColor={{ false: theme.colors.gray[300], true: theme.colors.info }}
                  thumbColor={voiceControlEnabled ? theme.colors.white : theme.colors.gray[500]}
                />
              </View>
            </View>

            {/* Motor Features */}
            {motorFeatures.map((feature) => (
              <View key={feature.id} style={styles.featureItem}>
                <View style={styles.featureInfo}>
                  {getFeatureIcon(feature.id)}
                  <View style={styles.featureDetails}>
                    <Text style={styles.featureName}>{feature.name}</Text>
                    <Text style={styles.featureDescription}>
                      {feature.id === 'voice_control' && 'Voice control for hands-free operation'}
                      {feature.id === 'gesture_alternatives' && 'Alternative input methods for gestures'}
                    </Text>
                  </View>
                </View>
                <Switch
                  value={feature.enabled}
                  onValueChange={(enabled) => handleFeatureToggle(feature.id, enabled)}
                  trackColor={{ false: theme.colors.gray[300], true: theme.colors.warning }}
                  thumbColor={feature.enabled ? theme.colors.white : theme.colors.gray[500]}
                />
              </View>
            ))}
          </View>
        )}
      </View>
    );
  };

  const renderCognitiveAccessibility = () => {
    const cognitiveFeatures = features.filter(f => f.type === 'cognitive');

    return (
      <View style={styles.section}>
        <TouchableOpacity
          style={styles.sectionHeader}
          onPress={() => toggleSection('cognitive')}
        >
          <View style={styles.sectionTitleContainer}>
            {getAccessibilityIcon('cognitive')}
            <Text style={styles.sectionTitle}>Cognitive Accessibility</Text>
          </View>
          {expandedSections.has('cognitive') ? 
            <ChevronDownIcon size={20} color={theme.colors.gray[600]} /> :
            <ChevronRightIcon size={20} color={theme.colors.gray[600]} />
          }
        </TouchableOpacity>

        {expandedSections.has('cognitive') && (
          <View style={styles.sectionContent}>
            {cognitiveFeatures.map((feature) => (
              <View key={feature.id} style={styles.featureItem}>
                <View style={styles.featureInfo}>
                  {getFeatureIcon(feature.id)}
                  <View style={styles.featureDetails}>
                    <Text style={styles.featureName}>{feature.name}</Text>
                    <Text style={styles.featureDescription}>
                      {feature.id === 'cognitive_assistance' && 'Assistance features for cognitive accessibility'}
                    </Text>
                  </View>
                </View>
                <Switch
                  value={feature.enabled}
                  onValueChange={(enabled) => handleFeatureToggle(feature.id, enabled)}
                  trackColor={{ false: theme.colors.gray[300], true: theme.colors.info }}
                  thumbColor={feature.enabled ? theme.colors.white : theme.colors.gray[500]}
                />
              </View>
            ))}
          </View>
        )}
      </View>
    );
  };

  const renderAccessibilityMetrics = () => (
    <View style={styles.metricsSection}>
      <Text style={styles.sectionTitle}>Accessibility Metrics</Text>
      <View style={styles.metricsGrid}>
        <View style={styles.metricItem}>
          <Text style={styles.metricValue}>{uxMetrics.accessibilityMetrics?.totalFeatures || 0}</Text>
          <Text style={styles.metricLabel}>Total Features</Text>
        </View>
        <View style={styles.metricItem}>
          <Text style={styles.metricValue}>{uxMetrics.accessibilityMetrics?.enabledFeatures || 0}</Text>
          <Text style={styles.metricLabel}>Enabled</Text>
        </View>
        <View style={styles.metricItem}>
          <Text style={styles.metricValue}>
            {Math.round((uxMetrics.accessibilityMetrics?.usageRate || 0) * 100)}%
          </Text>
          <Text style={styles.metricLabel}>Usage Rate</Text>
        </View>
        <View style={styles.metricItem}>
          <Text style={styles.metricValue}>
            {Math.round((uxMetrics.accessibilityMetrics?.effectivenessScore || 0) * 100)}%
          </Text>
          <Text style={styles.metricLabel}>Effectiveness</Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Accessibility Improvements</Text>
        <Text style={styles.subtitle}>Enhanced accessibility features for all users</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {renderAccessibilityLevelSelector()}
        {renderVisualAccessibility()}
        {renderAuditoryAccessibility()}
        {renderMotorAccessibility()}
        {renderCognitiveAccessibility()}
        {renderAccessibilityMetrics()}
      </ScrollView>
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
    alignItems: 'center',
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
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
  },
  levelSelector: {
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: '600',
    color: theme.colors.black,
    marginBottom: theme.spacing.md,
  },
  levelButtons: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  levelButton: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.gray[100],
    alignItems: 'center',
  },
  activeLevelButton: {
    backgroundColor: theme.colors.primary,
  },
  levelButtonText: {
    fontSize: theme.fontSize.sm,
    fontWeight: '500',
    color: theme.colors.gray[600],
  },
  activeLevelButtonText: {
    color: theme.colors.white,
  },
  section: {
    marginBottom: theme.spacing.lg,
    backgroundColor: theme.colors.gray[50],
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.lg,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  sectionContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
  },
  settingGroup: {
    marginBottom: theme.spacing.lg,
  },
  settingTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: '600',
    color: theme.colors.black,
    marginBottom: theme.spacing.sm,
  },
  fontSizeButtons: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  fontSizeButton: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.white,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.gray[200],
  },
  activeFontSizeButton: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  fontSizeButtonText: {
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
    color: theme.colors.gray[600],
  },
  activeFontSizeButtonText: {
    color: theme.colors.white,
  },
  contrastButtons: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  contrastButton: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.white,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.gray[200],
  },
  activeContrastButton: {
    backgroundColor: theme.colors.success,
    borderColor: theme.colors.success,
  },
  contrastButtonText: {
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
    color: theme.colors.gray[600],
  },
  activeContrastButtonText: {
    color: theme.colors.white,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray[200],
  },
  featureInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: theme.spacing.md,
  },
  featureDetails: {
    flex: 1,
  },
  featureName: {
    fontSize: theme.fontSize.md,
    fontWeight: '600',
    color: theme.colors.black,
    marginBottom: theme.spacing.xs,
  },
  featureDescription: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.gray[600],
    lineHeight: 18,
  },
  metricsSection: {
    marginBottom: theme.spacing.xl,
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.gray[50],
    borderRadius: theme.borderRadius.lg,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
  },
  metricItem: {
    flex: 1,
    minWidth: (width - theme.spacing.lg * 4) / 2,
    alignItems: 'center',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.md,
  },
  metricValue: {
    fontSize: theme.fontSize.xl,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: theme.spacing.xs,
  },
  metricLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.gray[600],
    textAlign: 'center',
  },
});
