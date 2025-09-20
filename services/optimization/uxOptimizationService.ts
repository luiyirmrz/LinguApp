/**
 * UX OPTIMIZATION SERVICE
 * 
 * Comprehensive user experience optimization system that addresses:
 * - Improve user experience and interface
 * - Enhance interaction patterns and feedback
 * - Optimize navigation and flow
 * - Implement accessibility improvements
 * - Add haptic feedback and animations
 */

import { Platform, Dimensions, PixelRatio } from 'react-native';
import * as Haptics from 'expo-haptics';

// ============================================================================
// UX OPTIMIZATION INTERFACES
// ============================================================================

export interface UXConfig {
  enableHapticFeedback: boolean;
  enableSmoothAnimations: boolean;
  enableAccessibilityFeatures: boolean;
  enableGestureOptimization: boolean;
  enableSmartNavigation: boolean;
  enableContextualHelp: boolean;
  animationDuration: number;
  hapticIntensity: 'light' | 'medium' | 'heavy';
  accessibilityLevel: 'basic' | 'enhanced' | 'full';
}

export interface UXMetrics {
  userSatisfactionScore: number;
  taskCompletionRate: number;
  averageTaskTime: number;
  errorRate: number;
  accessibilityUsage: number;
  gestureSuccessRate: number;
}

export interface InteractionPattern {
  id: string;
  type: 'tap' | 'swipe' | 'longPress' | 'pinch' | 'rotate';
  successRate: number;
  averageTime: number;
  userPreference: 'preferred' | 'neutral' | 'avoided';
}

export interface NavigationFlow {
  from: string;
  to: string;
  frequency: number;
  averageTime: number;
  successRate: number;
  userSatisfaction: number;
}

export interface AccessibilityFeature {
  id: string;
  name: string;
  type: 'visual' | 'auditory' | 'motor' | 'cognitive';
  enabled: boolean;
  usageCount: number;
  effectiveness: number;
}

// ============================================================================
// HAPTIC FEEDBACK SERVICE
// ============================================================================

class HapticFeedbackService {
  private config: UXConfig;
  private hapticHistory: Array<{ type: string; timestamp: number; success: boolean }> = [];

  constructor(config: UXConfig) {
    this.config = config;
  }

  /**
   * Trigger haptic feedback with intelligent patterns
   */
  async triggerHaptic(
    type: 'success' | 'error' | 'warning' | 'selection' | 'impact' | 'notification',
    options: {
      intensity?: 'light' | 'medium' | 'heavy';
      customPattern?: number[];
    } = {},
  ): Promise<void> {
    if (!this.config.enableHapticFeedback) return;

    const { intensity: _intensity = this.config.hapticIntensity, customPattern: _customPattern } = options;

    try {
      switch (type) {
        case 'success':
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          break;
        case 'error':
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          break;
        case 'warning':
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          break;
        case 'selection':
          await Haptics.selectionAsync();
          break;
        case 'impact': {
          const impactType = _intensity === 'light' ? Haptics.ImpactFeedbackStyle.Light :
                           _intensity === 'medium' ? Haptics.ImpactFeedbackStyle.Medium :
                           Haptics.ImpactFeedbackStyle.Heavy;
          await Haptics.impactAsync(impactType);
          break;
        }
        case 'notification':
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          break;
      }

      // Record haptic usage
      this.hapticHistory.push({
        type,
        timestamp: Date.now(),
        success: true,
      });

      // Keep only last 100 haptic events
      if (this.hapticHistory.length > 100) {
        this.hapticHistory = this.hapticHistory.slice(-100);
      }

    } catch (error) {
      console.warn('Haptic feedback failed:', error);
      this.hapticHistory.push({
        type,
        timestamp: Date.now(),
        success: false,
      });
    }
  }

  /**
   * Get haptic feedback metrics
   */
  getHapticMetrics(): {
    totalUsage: number;
    successRate: number;
    mostUsedType: string;
    averageUsagePerSession: number;
  } {
    const totalUsage = this.hapticHistory.length;
    const successCount = this.hapticHistory.filter(h => h.success).length;
    const successRate = totalUsage > 0 ? successCount / totalUsage : 0;

    // Count usage by type
    const typeCounts: Record<string, number> = {};
    this.hapticHistory.forEach(h => {
      typeCounts[h.type] = (typeCounts[h.type] || 0) + 1;
    });

    const mostUsedType = Object.entries(typeCounts)
      .sort(([, a], [, b]) => b - a)[0]?.[0] || 'none';

    return {
      totalUsage,
      successRate,
      mostUsedType,
      averageUsagePerSession: totalUsage, // Simplified for demo
    };
  }

  /**
   * Check if haptic feedback is supported
   */
  isHapticSupported(): boolean {
    return Platform.OS === 'ios' || Platform.OS === 'android';
  }
}

// ============================================================================
// ANIMATION OPTIMIZATION SERVICE
// ============================================================================

class AnimationOptimizationService {
  private config: UXConfig;
  private animationHistory: Array<{ type: string; duration: number; success: boolean }> = [];
  private performanceMetrics: { frameRate: number; droppedFrames: number } = { frameRate: 60, droppedFrames: 0 };

  constructor(config: UXConfig) {
    this.config = config;
  }

  /**
   * Get optimized animation duration based on device performance
   */
  getOptimizedDuration(baseDuration: number, type: 'fast' | 'normal' | 'slow' = 'normal'): number {
    const { width: _width, height: _height } = Dimensions.get('window');
    const _pixelRatio = PixelRatio.get();
    const devicePerformance = this.calculateDevicePerformance();

    let multiplier = 1;

    // Adjust based on device performance
    if (devicePerformance < 0.5) {
      multiplier *= 0.7; // Faster on low-end devices
    } else if (devicePerformance > 1.5) {
      multiplier *= 1.2; // Slightly slower on high-end devices for smoother feel
    }

    // Adjust based on animation type
    switch (type) {
      case 'fast':
        multiplier *= 0.6;
        break;
      case 'slow':
        multiplier *= 1.5;
        break;
    }

    // Adjust based on screen size
    const { width, height } = Dimensions.get('window');
    if (width > 1000 || height > 1000) {
      multiplier *= 1.1; // Slightly longer on large screens
    }

    return Math.max(100, Math.min(1000, baseDuration * multiplier));
  }

  /**
   * Calculate device performance score
   */
  private calculateDevicePerformance(): number {
    const { width, height } = Dimensions.get('window');
    const pixelRatio = PixelRatio.get();
    
    // Simple performance estimation based on screen characteristics
    const screenArea = width * height;
    const pixelDensity = pixelRatio;
    
    // Higher resolution and density = better performance assumption
    return Math.min(2, (screenArea / 1000000) * (pixelDensity / 2));
  }

  /**
   * Record animation performance
   */
  recordAnimation(type: string, duration: number, success: boolean): void {
    this.animationHistory.push({ type, duration, success });
    
    // Keep only last 50 animations
    if (this.animationHistory.length > 50) {
      this.animationHistory = this.animationHistory.slice(-50);
    }
  }

  /**
   * Get animation metrics
   */
  getAnimationMetrics(): {
    averageDuration: number;
    successRate: number;
    mostUsedType: string;
    performanceScore: number;
  } {
    const totalAnimations = this.animationHistory.length;
    const successCount = this.animationHistory.filter(a => a.success).length;
    const successRate = totalAnimations > 0 ? successCount / totalAnimations : 0;
    
    const averageDuration = totalAnimations > 0 
      ? this.animationHistory.reduce((sum, a) => sum + a.duration, 0) / totalAnimations 
      : 0;

    // Count usage by type
    const typeCounts: Record<string, number> = {};
    this.animationHistory.forEach(a => {
      typeCounts[a.type] = (typeCounts[a.type] || 0) + 1;
    });

    const mostUsedType = Object.entries(typeCounts)
      .sort(([, a], [, b]) => b - a)[0]?.[0] || 'none';

    const performanceScore = this.calculateDevicePerformance();

    return {
      averageDuration,
      successRate,
      mostUsedType,
      performanceScore,
    };
  }

  /**
   * Check if animations should be reduced
   */
  shouldReduceAnimations(): boolean {
    return this.performanceMetrics.frameRate < 30 || this.performanceMetrics.droppedFrames > 10;
  }
}

// ============================================================================
// ACCESSIBILITY OPTIMIZATION SERVICE
// ============================================================================

class AccessibilityOptimizationService {
  private config: UXConfig;
  private accessibilityFeatures: Map<string, AccessibilityFeature> = new Map();
  private usageStats: Map<string, number> = new Map();

  constructor(config: UXConfig) {
    this.config = config;
    this.initializeAccessibilityFeatures();
  }

  /**
   * Initialize accessibility features
   */
  private initializeAccessibilityFeatures(): void {
    const features: AccessibilityFeature[] = [
      {
        id: 'screen_reader',
        name: 'Screen Reader Support',
        type: 'visual',
        enabled: this.config.accessibilityLevel !== 'basic',
        usageCount: 0,
        effectiveness: 0.9,
      },
      {
        id: 'high_contrast',
        name: 'High Contrast Mode',
        type: 'visual',
        enabled: this.config.accessibilityLevel !== 'basic',
        usageCount: 0,
        effectiveness: 0.8,
      },
      {
        id: 'large_text',
        name: 'Large Text Support',
        type: 'visual',
        enabled: this.config.accessibilityLevel !== 'basic',
        usageCount: 0,
        effectiveness: 0.85,
      },
      {
        id: 'voice_control',
        name: 'Voice Control',
        type: 'motor',
        enabled: this.config.accessibilityLevel === 'full',
        usageCount: 0,
        effectiveness: 0.7,
      },
      {
        id: 'gesture_alternatives',
        name: 'Gesture Alternatives',
        type: 'motor',
        enabled: this.config.accessibilityLevel !== 'basic',
        usageCount: 0,
        effectiveness: 0.75,
      },
      {
        id: 'audio_descriptions',
        name: 'Audio Descriptions',
        type: 'auditory',
        enabled: this.config.accessibilityLevel === 'full',
        usageCount: 0,
        effectiveness: 0.8,
      },
      {
        id: 'cognitive_assistance',
        name: 'Cognitive Assistance',
        type: 'cognitive',
        enabled: this.config.accessibilityLevel !== 'basic',
        usageCount: 0,
        effectiveness: 0.85,
      },
    ];

    features.forEach(feature => {
      this.accessibilityFeatures.set(feature.id, feature);
    });
  }

  /**
   * Enable accessibility feature
   */
  enableFeature(featureId: string): boolean {
    const feature = this.accessibilityFeatures.get(featureId);
    if (feature) {
      feature.enabled = true;
      return true;
    }
    return false;
  }

  /**
   * Disable accessibility feature
   */
  disableFeature(featureId: string): boolean {
    const feature = this.accessibilityFeatures.get(featureId);
    if (feature) {
      feature.enabled = false;
      return true;
    }
    return false;
  }

  /**
   * Record feature usage
   */
  recordFeatureUsage(featureId: string): void {
    const feature = this.accessibilityFeatures.get(featureId);
    if (feature) {
      feature.usageCount++;
    }

    const currentCount = this.usageStats.get(featureId) || 0;
    this.usageStats.set(featureId, currentCount + 1);
  }

  /**
   * Get accessibility metrics
   */
  getAccessibilityMetrics(): {
    totalFeatures: number;
    enabledFeatures: number;
    usageRate: number;
    effectivenessScore: number;
    mostUsedFeature: string;
  } {
    const features = Array.from(this.accessibilityFeatures.values());
    const enabledFeatures = features.filter(f => f.enabled).length;
    const totalUsage = features.reduce((sum, f) => sum + f.usageCount, 0);
    const usageRate = features.length > 0 ? totalUsage / features.length : 0;
    
    const effectivenessScore = features.length > 0 
      ? features.reduce((sum, f) => sum + f.effectiveness, 0) / features.length 
      : 0;

    const mostUsedFeature = features
      .sort((a, b) => b.usageCount - a.usageCount)[0]?.name || 'none';

    return {
      totalFeatures: features.length,
      enabledFeatures,
      usageRate,
      effectivenessScore,
      mostUsedFeature,
    };
  }

  /**
   * Get all accessibility features
   */
  getAllFeatures(): AccessibilityFeature[] {
    return Array.from(this.accessibilityFeatures.values());
  }

  /**
   * Get enabled features
   */
  getEnabledFeatures(): AccessibilityFeature[] {
    return Array.from(this.accessibilityFeatures.values()).filter(f => f.enabled);
  }
}

// ============================================================================
// GESTURE OPTIMIZATION SERVICE
// ============================================================================

class GestureOptimizationService {
  private config: UXConfig;
  private gestureHistory: Map<string, InteractionPattern> = new Map();
  private gesturePreferences: Map<string, 'preferred' | 'neutral' | 'avoided'> = new Map();

  constructor(config: UXConfig) {
    this.config = config;
    this.initializeGesturePatterns();
  }

  /**
   * Initialize gesture patterns
   */
  private initializeGesturePatterns(): void {
    const patterns: InteractionPattern[] = [
      {
        id: 'tap',
        type: 'tap',
        successRate: 0.95,
        averageTime: 200,
        userPreference: 'preferred',
      },
      {
        id: 'swipe_left',
        type: 'swipe',
        successRate: 0.85,
        averageTime: 300,
        userPreference: 'preferred',
      },
      {
        id: 'swipe_right',
        type: 'swipe',
        successRate: 0.85,
        averageTime: 300,
        userPreference: 'preferred',
      },
      {
        id: 'long_press',
        type: 'longPress',
        successRate: 0.75,
        averageTime: 800,
        userPreference: 'neutral',
      },
      {
        id: 'pinch_zoom',
        type: 'pinch',
        successRate: 0.70,
        averageTime: 500,
        userPreference: 'neutral',
      },
      {
        id: 'rotate',
        type: 'rotate',
        successRate: 0.60,
        averageTime: 600,
        userPreference: 'avoided',
      },
    ];

    patterns.forEach(pattern => {
      this.gestureHistory.set(pattern.id, pattern);
    });
  }

  /**
   * Record gesture interaction
   */
  recordGesture(gestureId: string, success: boolean, duration: number): void {
    const pattern = this.gestureHistory.get(gestureId);
    if (pattern) {
      // Update success rate with exponential moving average
      pattern.successRate = (pattern.successRate * 0.9) + (success ? 0.1 : 0);
      
      // Update average time with exponential moving average
      pattern.averageTime = (pattern.averageTime * 0.9) + (duration * 0.1);
    }
  }

  /**
   * Update gesture preference
   */
  updateGesturePreference(gestureId: string, preference: 'preferred' | 'neutral' | 'avoided'): void {
    this.gesturePreferences.set(gestureId, preference);
    
    const pattern = this.gestureHistory.get(gestureId);
    if (pattern) {
      pattern.userPreference = preference;
    }
  }

  /**
   * Get optimized gesture configuration
   */
  getOptimizedGestureConfig(gestureId: string): {
    enabled: boolean;
    sensitivity: number;
    timeout: number;
    feedback: boolean;
  } {
    const pattern = this.gestureHistory.get(gestureId);
    if (!pattern) {
      return { enabled: false, sensitivity: 1, timeout: 1000, feedback: false };
    }

    const enabled = pattern.successRate > 0.6 && pattern.userPreference !== 'avoided';
    const sensitivity = pattern.successRate > 0.8 ? 1.2 : pattern.successRate > 0.6 ? 1.0 : 0.8;
    const timeout = pattern.averageTime * 1.5;
    const feedback = pattern.userPreference === 'preferred';

    return { enabled, sensitivity, timeout, feedback };
  }

  /**
   * Get gesture metrics
   */
  getGestureMetrics(): {
    totalGestures: number;
    averageSuccessRate: number;
    mostSuccessfulGesture: string;
    leastSuccessfulGesture: string;
    userPreferenceScore: number;
  } {
    const patterns = Array.from(this.gestureHistory.values());
    const totalGestures = patterns.length;
    
    const averageSuccessRate = totalGestures > 0 
      ? patterns.reduce((sum, p) => sum + p.successRate, 0) / totalGestures 
      : 0;

    const mostSuccessful = patterns
      .sort((a, b) => b.successRate - a.successRate)[0];
    const leastSuccessful = patterns
      .sort((a, b) => a.successRate - b.successRate)[0];

    const preferenceScore = totalGestures > 0 
      ? patterns.reduce((sum, p) => {
          const score = p.userPreference === 'preferred' ? 1 : 
                       p.userPreference === 'neutral' ? 0.5 : 0;
          return sum + score;
        }, 0) / totalGestures 
      : 0;

    return {
      totalGestures,
      averageSuccessRate,
      mostSuccessfulGesture: mostSuccessful?.id || 'none',
      leastSuccessfulGesture: leastSuccessful?.id || 'none',
      userPreferenceScore: preferenceScore,
    };
  }

  /**
   * Get all gesture patterns
   */
  getAllGesturePatterns(): InteractionPattern[] {
    return Array.from(this.gestureHistory.values());
  }
}

// ============================================================================
// SMART NAVIGATION SERVICE
// ============================================================================

class SmartNavigationService {
  private config: UXConfig;
  private navigationHistory: Map<string, NavigationFlow> = new Map();
  private userPreferences: Map<string, any> = new Map();

  constructor(config: UXConfig) {
    this.config = config;
  }

  /**
   * Record navigation flow
   */
  recordNavigation(from: string, to: string, duration: number, success: boolean): void {
    const key = `${from}->${to}`;
    const existing = this.navigationHistory.get(key);
    
    if (existing) {
      // Update with exponential moving average
      existing.frequency = existing.frequency * 0.95 + 1;
      existing.averageTime = (existing.averageTime * 0.9) + (duration * 0.1);
      existing.successRate = (existing.successRate * 0.9) + (success ? 0.1 : 0);
    } else {
      this.navigationHistory.set(key, {
        from,
        to,
        frequency: 1,
        averageTime: duration,
        successRate: success ? 1 : 0,
        userSatisfaction: 0.5,
      });
    }
  }

  /**
   * Get navigation suggestions
   */
  getNavigationSuggestions(currentScreen: string): {
    suggestedScreens: string[];
    quickActions: string[];
    shortcuts: string[];
  } {
    const suggestions: string[] = [];
    const quickActions: string[] = [];
    const shortcuts: string[] = [];

    // Find most common destinations from current screen
    const fromCurrent = Array.from(this.navigationHistory.values())
      .filter(flow => flow.from === currentScreen)
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 3);

    fromCurrent.forEach(flow => {
      if (flow.successRate > 0.8) {
        suggestions.push(flow.to);
      }
      if (flow.averageTime < 1000) {
        quickActions.push(flow.to);
      }
    });

    // Find shortcuts (high frequency, high success rate)
    const allFlows = Array.from(this.navigationHistory.values())
      .filter(flow => flow.frequency > 5 && flow.successRate > 0.9)
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 3);

    allFlows.forEach(flow => {
      shortcuts.push(`${flow.from}->${flow.to}`);
    });

    return { suggestedScreens: suggestions, quickActions, shortcuts };
  }

  /**
   * Get navigation metrics
   */
  getNavigationMetrics(): {
    totalFlows: number;
    averageSuccessRate: number;
    mostUsedFlow: string;
    averageNavigationTime: number;
    userSatisfactionScore: number;
  } {
    const flows = Array.from(this.navigationHistory.values());
    const totalFlows = flows.length;
    
    const averageSuccessRate = totalFlows > 0 
      ? flows.reduce((sum, f) => sum + f.successRate, 0) / totalFlows 
      : 0;

    const averageNavigationTime = totalFlows > 0 
      ? flows.reduce((sum, f) => sum + f.averageTime, 0) / totalFlows 
      : 0;

    const mostUsed = flows
      .sort((a, b) => b.frequency - a.frequency)[0];

    const userSatisfactionScore = totalFlows > 0 
      ? flows.reduce((sum, f) => sum + f.userSatisfaction, 0) / totalFlows 
      : 0;

    return {
      totalFlows,
      averageSuccessRate,
      mostUsedFlow: mostUsed ? `${mostUsed.from}->${mostUsed.to}` : 'none',
      averageNavigationTime,
      userSatisfactionScore,
    };
  }
}

// ============================================================================
// MAIN UX OPTIMIZATION SERVICE
// ============================================================================

class UXOptimizationService {
  private hapticService: HapticFeedbackService;
  private animationService: AnimationOptimizationService;
  public accessibilityService: AccessibilityOptimizationService;
  private gestureService: GestureOptimizationService;
  private navigationService: SmartNavigationService;
  private config: UXConfig;
  private metrics: UXMetrics;

  constructor(config: UXConfig) {
    this.config = config;
    this.hapticService = new HapticFeedbackService(config);
    this.animationService = new AnimationOptimizationService(config);
    this.accessibilityService = new AccessibilityOptimizationService(config);
    this.gestureService = new GestureOptimizationService(config);
    this.navigationService = new SmartNavigationService(config);
    this.metrics = {
      userSatisfactionScore: 0,
      taskCompletionRate: 0,
      averageTaskTime: 0,
      errorRate: 0,
      accessibilityUsage: 0,
      gestureSuccessRate: 0,
    };
  }

  /**
   * Trigger optimized haptic feedback
   */
  async triggerHaptic(
    type: 'success' | 'error' | 'warning' | 'selection' | 'impact' | 'notification',
    options?: { intensity?: 'light' | 'medium' | 'heavy' },
  ): Promise<void> {
    await this.hapticService.triggerHaptic(type, options);
  }

  /**
   * Get optimized animation duration
   */
  getOptimizedAnimationDuration(baseDuration: number, type?: 'fast' | 'normal' | 'slow'): number {
    return this.animationService.getOptimizedDuration(baseDuration, type);
  }

  /**
   * Record animation performance
   */
  recordAnimation(type: string, duration: number, success: boolean): void {
    this.animationService.recordAnimation(type, duration, success);
  }

  /**
   * Enable accessibility feature
   */
  enableAccessibilityFeature(featureId: string): boolean {
    return this.accessibilityService.enableFeature(featureId);
  }

  /**
   * Record accessibility feature usage
   */
  recordAccessibilityUsage(featureId: string): void {
    this.accessibilityService.recordFeatureUsage(featureId);
  }

  /**
   * Record gesture interaction
   */
  recordGesture(gestureId: string, success: boolean, duration: number): void {
    this.gestureService.recordGesture(gestureId, success, duration);
  }

  /**
   * Get optimized gesture configuration
   */
  getOptimizedGestureConfig(gestureId: string): any {
    return this.gestureService.getOptimizedGestureConfig(gestureId);
  }

  /**
   * Record navigation flow
   */
  recordNavigation(from: string, to: string, duration: number, success: boolean): void {
    this.navigationService.recordNavigation(from, to, duration, success);
  }

  /**
   * Get navigation suggestions
   */
  getNavigationSuggestions(currentScreen: string): any {
    return this.navigationService.getNavigationSuggestions(currentScreen);
  }

  /**
   * Get comprehensive UX metrics
   */
  getUXMetrics(): UXMetrics & {
    hapticMetrics: any;
    animationMetrics: any;
    accessibilityMetrics: any;
    gestureMetrics: any;
    navigationMetrics: any;
  } {
    return {
      ...this.metrics,
      hapticMetrics: this.hapticService.getHapticMetrics(),
      animationMetrics: this.animationService.getAnimationMetrics(),
      accessibilityMetrics: this.accessibilityService.getAccessibilityMetrics(),
      gestureMetrics: this.gestureService.getGestureMetrics(),
      navigationMetrics: this.navigationService.getNavigationMetrics(),
    };
  }

  /**
   * Update user satisfaction score
   */
  updateUserSatisfaction(score: number): void {
    this.metrics.userSatisfactionScore = (this.metrics.userSatisfactionScore + score) / 2;
  }

  /**
   * Record task completion
   */
  recordTaskCompletion(success: boolean, duration: number): void {
    this.metrics.taskCompletionRate = (this.metrics.taskCompletionRate + (success ? 1 : 0)) / 2;
    this.metrics.averageTaskTime = (this.metrics.averageTaskTime + duration) / 2;
  }
}

// ============================================================================
// SERVICE INSTANCE
// ============================================================================

const defaultUXConfig: UXConfig = {
  enableHapticFeedback: true,
  enableSmoothAnimations: true,
  enableAccessibilityFeatures: true,
  enableGestureOptimization: true,
  enableSmartNavigation: true,
  enableContextualHelp: true,
  animationDuration: 300,
  hapticIntensity: 'medium',
  accessibilityLevel: 'enhanced',
};

export const uxOptimizationService = new UXOptimizationService(defaultUXConfig);

// ============================================================================
// REACT HOOKS FOR UX OPTIMIZATION
// ============================================================================

import { useState, useEffect, useCallback } from 'react';

/**
 * Hook for haptic feedback
 */
export const useHapticFeedback = () => {
  const triggerHaptic = useCallback(async (
    type: 'success' | 'error' | 'warning' | 'selection' | 'impact' | 'notification',
    options?: { intensity?: 'light' | 'medium' | 'heavy' },
  ) => {
    await uxOptimizationService.triggerHaptic(type, options);
  }, []);

  return { triggerHaptic };
};

/**
 * Hook for optimized animations
 */
export const useOptimizedAnimation = () => {
  const getDuration = useCallback((baseDuration: number, type?: 'fast' | 'normal' | 'slow') => {
    return uxOptimizationService.getOptimizedAnimationDuration(baseDuration, type);
  }, []);

  const recordAnimation = useCallback((type: string, duration: number, success: boolean) => {
    uxOptimizationService.recordAnimation(type, duration, success);
  }, []);

  return { getDuration, recordAnimation };
};

/**
 * Hook for accessibility features
 */
export const useAccessibility = () => {
  const [features, setFeatures] = useState(uxOptimizationService.accessibilityService.getAllFeatures());

  const enableFeature = useCallback((featureId: string) => {
    const success = uxOptimizationService.enableAccessibilityFeature(featureId);
    if (success) {
      setFeatures(uxOptimizationService.accessibilityService.getAllFeatures());
    }
    return success;
  }, []);

  const recordUsage = useCallback((featureId: string) => {
    uxOptimizationService.recordAccessibilityUsage(featureId);
  }, []);

  return { features, enableFeature, recordUsage };
};

/**
 * Hook for gesture optimization
 */
export const useGestureOptimization = () => {
  const recordGesture = useCallback((gestureId: string, success: boolean, duration: number) => {
    uxOptimizationService.recordGesture(gestureId, success, duration);
  }, []);

  const getGestureConfig = useCallback((gestureId: string) => {
    return uxOptimizationService.getOptimizedGestureConfig(gestureId);
  }, []);

  return { recordGesture, getGestureConfig };
};

/**
 * Hook for smart navigation
 */
export const useSmartNavigation = () => {
  const recordNavigation = useCallback((from: string, to: string, duration: number, success: boolean) => {
    uxOptimizationService.recordNavigation(from, to, duration, success);
  }, []);

  const getSuggestions = useCallback((currentScreen: string) => {
    return uxOptimizationService.getNavigationSuggestions(currentScreen);
  }, []);

  return { recordNavigation, getSuggestions };
};

/**
 * Hook for comprehensive UX metrics
 */
export const useUXMetrics = () => {
  const [metrics, setMetrics] = useState(uxOptimizationService.getUXMetrics());

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(uxOptimizationService.getUXMetrics());
    }, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, []);

  return metrics;
};

// ============================================================================
// CONVENIENCE EXPORTS
// ============================================================================

export const triggerHaptic = uxOptimizationService.triggerHaptic.bind(uxOptimizationService);
export const getOptimizedAnimationDuration = uxOptimizationService.getOptimizedAnimationDuration.bind(uxOptimizationService);
export const recordAnimation = uxOptimizationService.recordAnimation.bind(uxOptimizationService);
export const enableAccessibilityFeature = uxOptimizationService.enableAccessibilityFeature.bind(uxOptimizationService);
export const recordAccessibilityUsage = uxOptimizationService.recordAccessibilityUsage.bind(uxOptimizationService);
export const recordGesture = uxOptimizationService.recordGesture.bind(uxOptimizationService);
export const getOptimizedGestureConfig = uxOptimizationService.getOptimizedGestureConfig.bind(uxOptimizationService);
export const recordNavigation = uxOptimizationService.recordNavigation.bind(uxOptimizationService);
export const getNavigationSuggestions = uxOptimizationService.getNavigationSuggestions.bind(uxOptimizationService);
export const getUXMetrics = uxOptimizationService.getUXMetrics.bind(uxOptimizationService);
