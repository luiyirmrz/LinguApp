import React, { memo } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { theme } from '@/constants/theme';

interface ProgressBarProps {
  progress: number;
  color?: string;
  backgroundColor?: string;
  height?: number;
  style?: any;
  size?: number;
  showPercentage?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  color = theme.colors.primary,
  backgroundColor = theme.colors.gray[100],
  height = 8,
  style,
  size,
  showPercentage,
}) => {
  const animatedWidth = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(animatedWidth, {
      toValue: progress,
      duration: 500,
      useNativeDriver: false,
    }).start();
  }, [progress, animatedWidth]);

  return (
    <View style={[styles.container, { backgroundColor, height }, style]}>
      <Animated.View
        style={[
          styles.progress,
          {
            backgroundColor: color,
            width: animatedWidth.interpolate({
              inputRange: [0, 1],
              outputRange: ['0%', '100%'],
            }),
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: theme.borderRadius.full,
    overflow: 'hidden',
  },
  progress: {
    height: '100%',
    borderRadius: theme.borderRadius.full,
  },
});

ProgressBar.displayName = 'ProgressBar';

export default memo(ProgressBar);
