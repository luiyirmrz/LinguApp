import React, { memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { theme } from '@/constants/theme';

export interface LoadingSpinnerProps {
  size?: 'small' | 'large';
  color?: string;
  text?: string;
  containerStyle?: ViewStyle;
  textStyle?: TextStyle;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'large',
  color = theme.colors.primary,
  text,
  containerStyle,
  textStyle,
}) => {
  return (
    <View style={[styles.spinnerContainer, containerStyle]}>
      <ActivityIndicator size={size} color={color} />
      {text && (
        <Text style={[styles.spinnerText, textStyle]}>
          {text}
        </Text>
      )}
    </View>
  );
};

export interface LoadingSkeletonProps {
  width?: number;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  width = 200,
  height = 20,
  borderRadius = theme.borderRadius.sm,
  style,
}) => {
  return (
    <View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
        },
        style,
      ]}
    />
  );
};

// Simple loading dots component
export const LoadingDots: React.FC<{ color?: string }> = ({ 
  color = theme.colors.primary, 
}) => {
  return (
    <View style={styles.dotsContainer}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <View style={[styles.dot, { backgroundColor: color }]} />
      <View style={[styles.dot, { backgroundColor: color }]} />
    </View>
  );
};

// Simple loading pulse component
export const LoadingPulse: React.FC<{ color?: string }> = ({ 
  color = theme.colors.primary, 
}) => {
  return (
    <View style={[styles.pulse, { backgroundColor: color }]} />
  );
};

// Simple loading wave component
export const LoadingWave: React.FC<{ color?: string }> = ({ 
  color = theme.colors.primary, 
}) => {
  return (
    <View style={styles.waveContainer}>
      <View style={[styles.wave, { backgroundColor: color }]} />
      <View style={[styles.wave, { backgroundColor: color }]} />
      <View style={[styles.wave, { backgroundColor: color }]} />
    </View>
  );
};

// Main LoadingStates component that exports all loading components
const LoadingStates = {
  LoadingSpinner,
  LoadingSkeleton,
  LoadingDots,
  LoadingPulse,
  LoadingWave,
};

// LoadingStates.displayName = 'LoadingStates';

export default LoadingStates;

const styles = StyleSheet.create({
  spinnerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.md,
  },
  spinnerText: {
    marginTop: theme.spacing.sm,
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    textAlign: 'center',
  },
  skeleton: {
    backgroundColor: theme.colors.surface,
    opacity: 0.6,
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  pulse: {
    width: 40,
    height: 40,
    borderRadius: 20,
    opacity: 0.6,
  },
  waveContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  wave: {
    width: 4,
    height: 20,
    marginHorizontal: 2,
    borderRadius: 2,
  },
});
