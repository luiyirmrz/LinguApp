// Optimized Lesson Layout - Adaptive lesson interface for different devices
// Provides optimal learning experience across phones, tablets, and different orientations
// Includes accessibility improvements and responsive exercise presentation

import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';
import { theme } from '@/constants/theme';
import { ProgressBar } from '@/components/ProgressBar';
import { Button } from '@/components/Button';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface OptimizedLessonLayoutProps {
  children: React.ReactNode;
  progress: number;
  hearts: number;
  onClose: () => void;
  onSubmit?: () => void;
  onSkip?: () => void;
  submitDisabled?: boolean;
  showHints?: boolean;
  title?: string;
  instruction?: string;
}

export const OptimizedLessonLayout: React.FC<OptimizedLessonLayoutProps> = ({
  children,
  progress,
  hearts,
  onClose,
  onSubmit,
  onSkip,
  submitDisabled = false,
  showHints = false,
  title,
  instruction,
}) => {
  const {
    isTablet,
    isLandscape,
    isSmallPhone,
    responsiveValues,
    getAccessibleTouchSize,
    dimensions,
  } = useResponsiveLayout();

  // Calculate optimal layout based on device
  const layoutConfig = useMemo(() => {
    const isCompactHeight = dimensions.height < 600;
    const isCompactWidth = dimensions.width < 400;

    return {
      // Header configuration
      headerHeight: isCompactHeight ? 60 : isTablet ? 80 : 70,
      showTitle: !isCompactHeight || isTablet,
      
      // Content area
      contentPadding: isTablet ? 24 : isSmallPhone ? 12 : 16,
      maxContentWidth: isTablet ? 600 : undefined,
      
      // Footer configuration
      footerHeight: isCompactHeight ? 70 : 80,
      buttonSize: isTablet ? 'lg' as const : 'md' as const,
      
      // Exercise area
      exerciseMinHeight: isCompactHeight ? 200 : isTablet ? 400 : 300,
      exerciseSpacing: isTablet ? 20 : isSmallPhone ? 12 : 16,
      
      // Typography scaling
      instructionSize: isTablet ? 18 : isSmallPhone ? 14 : 16,
      titleSize: isTablet ? 24 : isSmallPhone ? 18 : 20,
    };
  }, [isTablet, isSmallPhone, dimensions]);

  const styles = useMemo(() => createStyles(layoutConfig, responsiveValues, isTablet, isLandscape), 
    [layoutConfig, responsiveValues, isTablet, isLandscape],
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        {/* Progress and Hearts Row */}
        <View style={styles.headerTop}>
          <Button
            title="✕"
            onPress={onClose}
            variant="ghost"
            size="sm"
            style={styles.closeButton}
          />
          
          <View style={styles.progressContainer}>
            <ProgressBar 
              progress={progress} 
              height={isTablet ? 8 : 6}
              style={styles.progressBar}
            />
          </View>
          
          <View style={styles.heartsContainer}>
            <Text style={styles.heartsText}>❤️ {hearts}</Text>
          </View>
        </View>

        {/* Title and Instruction */}
        {layoutConfig.showTitle && title && (
          <Text style={styles.title}>{title}</Text>
        )}
        {instruction && (
          <Text style={styles.instruction}>{instruction}</Text>
        )}
      </View>

      {/* Exercise Content */}
      <View style={styles.content}>
        <View style={styles.exerciseContainer}>
          {children}
        </View>
      </View>

      {/* Footer with Actions */}
      <View style={styles.footer}>
        <View style={styles.footerContent}>
          {onSkip && (
            <Button
              title="Skip"
              onPress={onSkip}
              variant="ghost"
              size={layoutConfig.buttonSize}
              style={styles.skipButton}
            />
          )}
          
          <View style={styles.spacer} />
          
          {onSubmit && (
            <Button
              title="Submit"
              onPress={onSubmit}
              disabled={submitDisabled}
              size={layoutConfig.buttonSize}
              style={styles.submitButton}
            />
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

const createStyles = (
  config: any,
  responsiveValues: any,
  isTablet: boolean,
  isLandscape: boolean,
) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    backgroundColor: theme.colors.white,
    paddingHorizontal: config.contentPadding,
    paddingVertical: responsiveValues.spacing.sm,
    minHeight: config.headerHeight,
    ...Platform.select({
      ios: {
        shadowColor: theme.colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: responsiveValues.spacing.sm,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: responsiveValues.spacing.sm,
  },
  progressContainer: {
    flex: 1,
    marginRight: responsiveValues.spacing.sm,
  },
  progressBar: {
    backgroundColor: theme.colors.gray[200],
    borderRadius: 4,
  },
  heartsContainer: {
    minWidth: 50,
    alignItems: 'flex-end',
  },
  heartsText: {
    fontSize: config.instructionSize - 2,
    fontWeight: '600',
    color: theme.colors.danger,
  },
  title: {
    fontSize: config.titleSize,
    fontWeight: 'bold',
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: responsiveValues.spacing.xs,
  },
  instruction: {
    fontSize: config.instructionSize,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: config.instructionSize * 1.4,
  },
  content: {
    flex: 1,
    paddingHorizontal: config.contentPadding,
    paddingVertical: responsiveValues.spacing.md,
    ...(config.maxContentWidth && {
      maxWidth: config.maxContentWidth,
      alignSelf: 'center',
      width: '100%',
    }),
  },
  exerciseContainer: {
    flex: 1,
    minHeight: config.exerciseMinHeight,
    justifyContent: 'center',
  },
  footer: {
    backgroundColor: theme.colors.white,
    paddingHorizontal: config.contentPadding,
    paddingVertical: responsiveValues.spacing.md,
    minHeight: config.footerHeight,
    borderTopWidth: 1,
    borderTopColor: theme.colors.gray[200],
  },
  footerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  skipButton: {
    minWidth: isTablet ? 100 : 80,
  },
  spacer: {
    flex: 1,
  },
  submitButton: {
    minWidth: isTablet ? 120 : 100,
  },
});

// Specialized lesson components
export const LessonExerciseCard: React.FC<{
  children: React.ReactNode;
  style?: any;
}> = ({ children, style }) => {
  const { responsiveValues, isTablet } = useResponsiveLayout();
  
  return (
    <View style={[
      {
        backgroundColor: theme.colors.white,
        borderRadius: responsiveValues.borderRadius.lg,
        padding: isTablet ? 24 : 16,
        marginBottom: responsiveValues.spacing.md,
        ...Platform.select({
          ios: {
            shadowColor: theme.colors.black,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
          },
          android: {
            elevation: 2,
          },
        }),
      },
      style,
    ]}>
      {children}
    </View>
  );
};

export const LessonQuestion: React.FC<{
  question: string;
  style?: any;
}> = ({ question, style }) => {
  const { responsiveValues, isTablet, getAccessibleFontSize } = useResponsiveLayout();
  
  return (
    <Text style={[
      {
        fontSize: getAccessibleFontSize(isTablet ? 20 : 18),
        fontWeight: '600',
        color: theme.colors.text,
        textAlign: 'center',
        lineHeight: getAccessibleFontSize(isTablet ? 20 : 18) * 1.3,
        marginBottom: responsiveValues.spacing.lg,
      },
      style,
    ]}>
      {question}
    </Text>
  );
};

export const LessonOptionButton: React.FC<{
  text: string;
  onPress: () => void;
  selected?: boolean;
  correct?: boolean;
  incorrect?: boolean;
  disabled?: boolean;
  style?: any;
}> = ({ 
  text, 
  onPress, 
  selected = false, 
  correct = false, 
  incorrect = false, 
  disabled = false,
  style, 
}) => {
  const { responsiveValues, getAccessibleTouchSize, getAccessibleFontSize } = useResponsiveLayout();
  
  const getButtonColor = () => {
    if (correct) return theme.colors.success;
    if (incorrect) return theme.colors.danger;
    if (selected) return theme.colors.primary;
    return theme.colors.white;
  };
  
  const getTextColor = () => {
    if (correct || incorrect || selected) return theme.colors.white;
    return theme.colors.text;
  };
  
  const TouchableOpacity = require('react-native').TouchableOpacity;
  
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={[
        {
          backgroundColor: getButtonColor(),
          borderRadius: responsiveValues.borderRadius.md,
          padding: responsiveValues.spacing.md,
          marginBottom: responsiveValues.spacing.sm,
          minHeight: getAccessibleTouchSize(),
          justifyContent: 'center',
          alignItems: 'center',
          borderWidth: selected || correct || incorrect ? 0 : 2,
          borderColor: theme.colors.gray[200],
          opacity: disabled ? 0.6 : 1,
          ...Platform.select({
            ios: {
              shadowColor: theme.colors.black,
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.1,
              shadowRadius: 2,
            },
            android: {
              elevation: 1,
            },
          }),
        },
        style,
      ]}
      activeOpacity={0.8}
    >
      <Text style={{
        fontSize: getAccessibleFontSize(responsiveValues.fontSize.md),
        color: getTextColor(),
        fontWeight: selected || correct || incorrect ? '600' : '400',
        textAlign: 'center',
      }}>
        {text}
      </Text>
    </TouchableOpacity>
  );
};
