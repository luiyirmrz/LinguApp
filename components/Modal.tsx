import React, { useEffect, useRef, memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal as RNModal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Animated,
  Dimensions,
  ViewStyle,
  TextStyle,
} from 'react-native';
// Lazy loaded: react-native-safe-area-context
// Lazy loaded: lucide-react-native
import { theme } from '@/constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AlertCircle, CheckCircle, Info, AlertTriangle, X } from '@/components/icons';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  variant?: 'default' | 'alert' | 'success' | 'info' | 'warning';
  size?: 'small' | 'medium' | 'large' | 'full';
  showCloseButton?: boolean;
  closeOnBackdropPress?: boolean;
  containerStyle?: ViewStyle;
  contentStyle?: ViewStyle;
  titleStyle?: TextStyle;
  icon?: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({
  visible,
  onClose,
  title,
  children,
  variant = 'default',
  size = 'medium',
  showCloseButton = true,
  closeOnBackdropPress = true,
  containerStyle,
  contentStyle,
  titleStyle,
  icon,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const slideAnim = useRef(new Animated.Value(screenHeight)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: screenHeight,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, fadeAnim, scaleAnim, slideAnim]);

  const getVariantIcon = () => {
    if (icon) return icon;

    const iconSize = 24;
    const iconColor = getVariantColor();

    switch (variant) {
      case 'alert':
        return <AlertCircle size={iconSize} color={iconColor} />;
      case 'success':
        return <CheckCircle size={iconSize} color={iconColor} />;
      case 'info':
        return <Info size={iconSize} color={iconColor} />;
      case 'warning':
        return <AlertTriangle size={iconSize} color={iconColor} />;
      default:
        return null;
    }
  };

  const getVariantColor = () => {
    switch (variant) {
      case 'alert':
        return theme.colors.error;
      case 'success':
        return theme.colors.success;
      case 'info':
        return theme.colors.primary;
      case 'warning':
        return theme.colors.warning;
      default:
        return theme.colors.primary;
    }
  };

  const getSizeStyle = (): ViewStyle => {
    switch (size) {
      case 'small':
        return {
          width: screenWidth * 0.8,
          maxWidth: 300,
        };
      case 'large':
        return {
          width: screenWidth * 0.95,
          maxWidth: 500,
        };
      case 'full':
        return {
          width: screenWidth,
          height: screenHeight,
          margin: 0,
          borderRadius: 0,
        };
      default: // medium
        return {
          width: screenWidth * 0.9,
          maxWidth: 400,
        };
    }
  };

  const handleBackdropPress = () => {
    if (closeOnBackdropPress) {
      onClose();
    }
  };

  return (
    <RNModal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={handleBackdropPress}>
        <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]}>
          <TouchableWithoutFeedback onPress={() => {}}>
            <Animated.View
              style={[
                styles.container,
                getSizeStyle(),
                {
                  transform: [
                    { scale: scaleAnim },
                    { translateY: slideAnim },
                  ],
                },
                containerStyle,
              ]}
            >
              <SafeAreaView style={styles.safeArea}>
                {(title || getVariantIcon()) && (
                  <View style={styles.header}>
                    <View style={styles.titleContainer}>
                      {getVariantIcon() && (
                        <View style={styles.iconContainer}>
                          {getVariantIcon()}
                        </View>
                      )}
                      {title && (
                        <Text style={[styles.title, titleStyle]}>
                          {title}
                        </Text>
                      )}
                    </View>
                    {showCloseButton && (
                      <TouchableOpacity
                        style={styles.closeButton}
                        onPress={onClose}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      >
                        <X size={20} color={theme.colors.textSecondary} />
                      </TouchableOpacity>
                    )}
                  </View>
                )}

                <View style={[styles.content, contentStyle]}>
                  {children}
                </View>
              </SafeAreaView>
            </Animated.View>
          </TouchableWithoutFeedback>
        </Animated.View>
      </TouchableWithoutFeedback>
    </RNModal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  container: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
    maxHeight: screenHeight * 0.8,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray[100],
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    marginRight: theme.spacing.sm,
  },
  title: {
    fontSize: theme.fontSize.lg,
    fontWeight: '600' as const,
    color: theme.colors.text,
    flex: 1,
  },
  closeButton: {
    padding: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  content: {
    flex: 1,
    padding: theme.spacing.lg,
  },
});


Modal.displayName = 'Modal';

export default memo(Modal);
