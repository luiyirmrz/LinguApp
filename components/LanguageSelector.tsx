import React, { memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  SafeAreaView,
} from 'react-native';
// Lazy loaded: lucide-react-native
import { theme } from '@/constants/theme';
import { Language } from '@/types';
import { languages } from '@/mocks/languages';
import { useUnifiedAuth } from "@/hooks/useUnifiedAuth";
import { useGameState } from '@/hooks/useGameState';
import { X } from '@/components/icons';

interface LanguageSelectorProps {
  visible: boolean;
  onClose: () => void;
  currentLanguage: Language;
  onLanguageSelect: (language: Language) => void;
}

export function LanguageSelector({ 
  visible, 
  onClose, 
  currentLanguage, 
  onLanguageSelect, 
}: LanguageSelectorProps) {
  const { user, signIn, signOut, signUp, resetPassword, updateUser } = useUnifiedAuth();
  const { switchLanguage } = useGameState();

  const handleLanguageSelect = async (language: Language) => {
    if (language.code !== currentLanguage.code) {
      await switchLanguage(language);
      onLanguageSelect(language);
    }
    onClose();
  };

  const renderLanguageItem = ({ item }: { item: Language }) => (
    <TouchableOpacity
      style={[
        styles.languageItem,
        item.code === currentLanguage.code && styles.selectedLanguageItem,
      ]}
      onPress={() => handleLanguageSelect(item)}
    >
      <Text style={styles.flag}>{item.flag}</Text>
      <View style={styles.languageInfo}>
        <Text style={styles.languageName}>{item.name}</Text>
      </View>
      {item.code === currentLanguage.code && (
        <View style={styles.checkmark}>
          <Text style={styles.checkmarkText}>✓</Text>
        </View>
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
          <Text style={styles.title}>Choose Language</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color={theme.colors.gray[400]} />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Learning</Text>
          <Text style={styles.sectionDescription}>
            Select the language you want to learn
          </Text>
        </View>

        <FlatList
          data={languages.filter(lang => lang.code !== user?.nativeLanguage?.code)}
          renderItem={renderLanguageItem}
          keyExtractor={(item) => item.code}
          style={styles.languageList}
          showsVerticalScrollIndicator={false}
        />

        {user?.nativeLanguage && (
          <View style={styles.nativeLanguageSection}>
            <Text style={styles.sectionTitle}>Native Language</Text>
            <View style={styles.nativeLanguageItem}>
              <Text style={styles.flag}>{user.nativeLanguage.flag}</Text>
              <Text style={styles.languageName}>{user.nativeLanguage.name}</Text>
            </View>
          </View>
        )}
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray[100],
  },
  title: {
    fontSize: theme.fontSize.xl,
    fontWeight: '600' as const,
    color: theme.colors.black,
  },
  closeButton: {
    padding: theme.spacing.xs,
  },
  section: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: '600' as const,
    color: theme.colors.black,
    marginBottom: theme.spacing.xs,
  },
  sectionDescription: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.gray[400],
  },
  languageList: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.sm,
    backgroundColor: theme.colors.gray[50],
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedLanguageItem: {
    backgroundColor: `${theme.colors.primary  }10`,
    borderColor: theme.colors.primary,
  },
  flag: {
    fontSize: 32,
    marginRight: theme.spacing.md,
  },
  languageInfo: {
    flex: 1,
  },
  languageName: {
    fontSize: theme.fontSize.md,
    fontWeight: '600' as const,
    color: theme.colors.black,
  },
  nativeName: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.gray[400],
    marginTop: 2,
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkText: {
    color: theme.colors.white,
    fontSize: theme.fontSize.sm,
    fontWeight: '600' as const,
  },
  nativeLanguageSection: {
    padding: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.gray[100],
  },
  nativeLanguageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.gray[50],
    borderRadius: theme.borderRadius.lg,
    marginTop: theme.spacing.sm,
  },
});

LanguageSelector.displayName = 'LanguageSelector';

export default memo(LanguageSelector);
