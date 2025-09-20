/**
 * Enhanced Language Selector Component
 * Provides dynamic language switching for the entire app interface
 * Preserves user progress across language changes
 */

import React, { useState, memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from 'react-native';
// Lazy loaded: lucide-react-native
import { theme } from '@/constants/theme';
import { Language } from '@/types';
import { useLanguage, useTranslations } from '@/hooks/useLanguage';
import { getAvailableTranslationLanguages } from '@/constants/i18n';
import { useErrorHandler } from '@/services/monitoring/centralizedErrorService';
import { Check, X, AlertCircle, Globe } from '@/components/icons';

interface EnhancedLanguageSelectorProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  showNativeLanguageSection?: boolean;
}

export function EnhancedLanguageSelector({ 
  visible, 
  onClose,
  title,
  description,
  showNativeLanguageSection = true,
}: EnhancedLanguageSelectorProps) {
  const { 
    currentUILanguage, 
    changeUILanguage, 
    isLoading,
    error, 
  } = useLanguage();
  const { t } = useTranslations();
  const { handleError } = useErrorHandler();
  
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(currentUILanguage);
  const [isChanging, setIsChanging] = useState(false);

  // Get languages that have translations available
  const translationLanguages = getAvailableTranslationLanguages();

  const handleLanguageSelect = (language: Language) => {
    setSelectedLanguage(language);
  };

  const handleConfirm = async () => {
    if (selectedLanguage.code === currentUILanguage.code) {
      onClose();
      return;
    }

    try {
      setIsChanging(true);

      // Show confirmation dialog for language change
      Alert.alert(
        t('chooseLanguage'),
        `${t('continue')} ${selectedLanguage.name}?`,
        [
          {
            text: t('cancel'),
            style: 'cancel',
          },
          {
            text: t('continue'),
            onPress: async () => {
              try {
                await changeUILanguage(selectedLanguage);
                onClose();
              } catch (error) {
                const { userMessage } = await handleError(error as Error, 'api', {
                  action: 'changeLanguage',
                  additionalData: { languageCode: selectedLanguage.code },
                });
                Alert.alert(
                  t('errorGeneral'),
                  userMessage,
                  [{ text: t('retry'), onPress: () => {} }],
                );
              }
            },
          },
        ],
      );
    } catch (error) {
      await handleError(error as Error, 'api', {
        action: 'languageChangeConfirmation',
        additionalData: { languageCode: selectedLanguage.code },
      });
    } finally {
      setIsChanging(false);
    }
  };

  const renderLanguageItem = ({ item }: { item: Language }) => {
    const isSelected = selectedLanguage.code === item.code;
    const isCurrent = currentUILanguage.code === item.code;
    
    return (
      <TouchableOpacity
        style={[
          styles.languageItem,
          isSelected && styles.selectedLanguageItem,
          isCurrent && styles.currentLanguageItem,
        ]}
        onPress={() => handleLanguageSelect(item)}
        disabled={isChanging || isLoading}
      >
        <View style={styles.languageInfo}>
          <Text style={styles.flag}>{item.flag}</Text>
          <View style={styles.languageText}>
            <Text style={[
              styles.languageName,
              isCurrent && styles.currentLanguageName,
            ]}>
              {item.name}
            </Text>
            <Text style={styles.nativeName}>{item.nativeName}</Text>
          </View>
        </View>
        
        <View style={styles.languageStatus}>
          {isCurrent && (
            <View style={styles.currentBadge}>
              <Text style={styles.currentBadgeText}>Current</Text>
            </View>
          )}
          {isSelected && !isCurrent && (
            <Check size={24} color={theme.colors.primary} />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType='slide'
      presentationStyle='pageSheet'
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header as any}>
          <TouchableOpacity 
            onPress={onClose} 
            style={styles.closeButton as any}
            disabled={isChanging}
          >
            <X size={24} color={theme.colors.text} />
          </TouchableOpacity>
          
          <Text style={styles.title as any}>
            {title || t('chooseLanguage')}
          </Text>
          
          <TouchableOpacity 
            onPress={handleConfirm} 
            style={[
              styles.confirmButton as any,
              (isChanging || isLoading) && styles.confirmButtonDisabled as any,
            ]}
            disabled={isChanging || isLoading}
          >
            {isChanging || isLoading ? (
              <ActivityIndicator size='small' color={theme.colors.primary} />
            ) : (
              <Text style={styles.confirmText as any}>{t('done')}</Text>
            )}
          </TouchableOpacity>
        </View>

        {error && (
          <View style={styles.errorContainer as any}>
            <AlertCircle size={20} color={theme.colors.error} />
            <Text style={styles.errorText as any}>{error}</Text>
          </View>
        )}

        <View style={styles.description as any}>
          <Globe size={20} color={theme.colors.gray[400]} />
          <Text style={styles.descriptionText as any}>
            {description || t('selectNativeLanguage')}
          </Text>
        </View>

        <View style={styles.progressNote as any}>
          <Text style={styles.progressNoteText as any}>
            Your learning progress will be preserved when changing languages.
          </Text>
        </View>

        <FlatList
          data={translationLanguages}
          renderItem={renderLanguageItem}
          keyExtractor={(item) => item.code}
          style={styles.languageList as any}
          showsVerticalScrollIndicator={false}
          scrollEnabled={!isChanging && !isLoading}
        />

        {showNativeLanguageSection && (
          <View style={styles.infoSection as any}>
            <Text style={styles.infoTitle as any}>About Language Changes</Text>
            <Text style={styles.infoText as any}>
              {`• All app interface text will update immediately
• Your learning progress and XP are preserved
• Lesson content remains in your target language
• Settings sync across all your devices`}
            </Text>
          </View>
        )}
      </SafeAreaView>
    </Modal>
  );
}

// Compact language button component
interface LanguageButtonProps {
  onPress: () => void;
  showLabel?: boolean;
}

export function LanguageButton({ onPress, showLabel = true }: LanguageButtonProps) {
  const { currentUILanguage } = useLanguage();
  const { t } = useTranslations();

  return (
    <TouchableOpacity style={styles.languageButton as any} onPress={onPress}>
      <View style={styles.languageButtonContent as any}>
        <Text style={styles.languageButtonFlag as any}>{currentUILanguage.flag}</Text>
        {showLabel && (
          <View style={styles.languageButtonText as any}>
            <Text style={styles.languageButtonLabel as any}>{t('chooseLanguage')}</Text>
            <Text style={styles.languageButtonName as any}>{currentUILanguage.name}</Text>
          </View>
        )}
      </View>
      <Text style={styles.changeText as any}>{t('edit')}</Text>
    </TouchableOpacity>
  );
}

// Hook for managing language selector state
export function useLanguageSelector() {
  const [selectorVisible, setSelectorVisible] = useState(false);

  const showSelector = () => setSelectorVisible(true);
  const hideSelector = () => setSelectorVisible(false);

  return {
    selectorVisible,
    showSelector,
    hideSelector,
  };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray[200],
  },
  closeButton: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
  },
  confirmButton: {
    padding: 8,
    minWidth: 60,
    alignItems: 'center',
  },
  confirmButtonDisabled: {
    opacity: 0.5,
  },
  confirmText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: `${theme.colors.error  }10`,
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 8,
  },
  errorText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: theme.colors.error,
  },
  description: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: theme.colors.gray[50],
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 12,
  },
  descriptionText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    color: theme.colors.gray[600],
    lineHeight: 20,
  },
  progressNote: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  progressNoteText: {
    fontSize: 13,
    color: theme.colors.success,
    textAlign: 'center',
    fontWeight: '500',
  },
  languageList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 8,
    backgroundColor: theme.colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.gray[200],
  },
  selectedLanguageItem: {
    borderColor: theme.colors.primary,
    backgroundColor: `${theme.colors.primary  }10`,
  },
  currentLanguageItem: {
    borderColor: theme.colors.success,
    backgroundColor: `${theme.colors.success  }10`,
  },
  languageInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  flag: {
    fontSize: 24,
    marginRight: 16,
  },
  languageText: {
    flex: 1,
  },
  languageName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 2,
  },
  currentLanguageName: {
    color: theme.colors.success,
  },
  nativeName: {
    fontSize: 14,
    color: theme.colors.gray[600],
  },
  languageStatus: {
    alignItems: 'center',
    minWidth: 80,
  },
  currentBadge: {
    backgroundColor: theme.colors.success,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  currentBadgeText: {
    color: theme.colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  infoSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: theme.colors.gray[200],
    backgroundColor: theme.colors.gray[50],
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 13,
    color: theme.colors.gray[600],
    lineHeight: 18,
  },
  languageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: theme.colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.gray[200],
    marginBottom: 16,
  },
  languageButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  languageButtonFlag: {
    fontSize: 24,
    marginRight: 16,
  },
  languageButtonText: {
    flex: 1,
  },
  languageButtonLabel: {
    fontSize: 12,
    color: theme.colors.gray[500],
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  languageButtonName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
  },
  changeText: {
    fontSize: 14,
    color: theme.colors.primary,
    fontWeight: '500',
  },
});

EnhancedLanguageSelector.displayName = 'EnhancedLanguageSelector';

export default memo(EnhancedLanguageSelector);
