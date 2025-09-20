import React, { useState, memo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, FlatList, SafeAreaView } from 'react-native';
// Lazy loaded: lucide-react-native
import { Language } from '@/types';
import { languages } from '@/mocks/languages';
import { theme } from '@/constants/theme';
import { useUnifiedAuth } from "@/hooks/useUnifiedAuth";
import { Check, X, Globe } from '@/components/icons';

interface MainLanguageSelectorProps {
  visible: boolean;
  onClose: () => void;
  currentMainLanguage: Language;
  onLanguageSelect: (language: Language) => void;
}

export function MainLanguageSelector({ 
  visible,  
  onClose, 
  currentMainLanguage, 
  onLanguageSelect, 
}: MainLanguageSelectorProps) {
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(currentMainLanguage);

  const handleLanguageSelect = (language: Language) => {
    setSelectedLanguage(language);
  };

  const handleConfirm = () => {
    onLanguageSelect(selectedLanguage);
    onClose();
  };

  const renderLanguageItem = ({ item }: { item: Language }) => (
    <TouchableOpacity
      style={[
        styles.languageItem,
        selectedLanguage.code === item.code && styles.selectedLanguageItem,
      ]}
      onPress={() => handleLanguageSelect(item)}
    >
      <View style={styles.languageInfo}>
        <Text style={styles.flag}>{item.flag}</Text>
        <View style={styles.languageText}>
          <Text style={styles.languageName}>{item.name}</Text>
          <Text style={styles.nativeName}>{item.nativeName}</Text>
        </View>
      </View>
      {selectedLanguage.code === item.code && (
        <Check size={24} color={theme.colors.primary} />
      )}
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Select Main Language</Text>
          <TouchableOpacity onPress={handleConfirm} style={styles.confirmButton}>
            <Text style={styles.confirmText}>Done</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.description}>
          <Globe size={20} color={theme.colors.gray[400]} />
          <Text style={styles.descriptionText}>
            Choose your main language. This will be used for all app interface text, instructions, and explanations.
          </Text>
        </View>

        <FlatList
          data={languages}
          renderItem={renderLanguageItem}
          keyExtractor={(item) => item.code}
          style={styles.languageList}
          showsVerticalScrollIndicator={false}
        />
      </SafeAreaView>
    </Modal>
  );
}

interface MainLanguageButtonProps {
  currentLanguage: Language;
  onPress: () => void;
}

export function MainLanguageButton({ currentLanguage, onPress }: MainLanguageButtonProps) {
  return (
    <TouchableOpacity style={styles.languageButton} onPress={onPress}>
      <View style={styles.languageButtonContent}>
        <Text style={styles.languageButtonFlag}>{currentLanguage.flag}</Text>
        <View style={styles.languageButtonText}>
          <Text style={styles.languageButtonLabel}>Main Language</Text>
          <Text style={styles.languageButtonName}>{currentLanguage.name}</Text>
        </View>
      </View>
      <Text style={styles.changeText}>Change</Text>
    </TouchableOpacity>
  );
}

// Hook for main language management
export function useMainLanguage() {
  const { user, signIn, signOut, signUp, resetPassword, updateUser } = useUnifiedAuth();
  const [selectorVisible, setSelectorVisible] = useState(false);

  const showSelector = () => setSelectorVisible(true);
  const hideSelector = () => setSelectorVisible(false);

  const changeMainLanguage = async (newLanguage: Language) => {
    if (user) {
      // TODO: Implement user update functionality
      console.debug('Main language changed to:', newLanguage.name);
    }
  };

  return {
    currentMainLanguage: user?.mainLanguage || languages[0],
    selectorVisible,
    showSelector,
    hideSelector,
    changeMainLanguage,
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
  },
  confirmText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.primary,
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
  languageList: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
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
  nativeName: {
    fontSize: 14,
    color: theme.colors.gray[600],
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

MainLanguageSelector.displayName = 'MainLanguageSelector';

export default memo(MainLanguageSelector);
