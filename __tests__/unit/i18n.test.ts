/**
 * Unit Tests for Enhanced i18n System
 * Tests translation, pluralization, RTL support, and language management
 */

import { I18nService, PLURAL_RULES, RTL_LANGUAGES } from '@/constants/i18n';

describe('I18nService', () => {
  let i18n: I18nService;

  beforeEach(() => {
    i18n = new I18nService('en');
  });

  describe('Language Management', () => {
    it('should initialize with default language', () => {
      expect(i18n.getCurrentLanguage()).toBe('en');
    });

    it('should set language correctly', () => {
      i18n.setLanguage('es');
      expect(i18n.getCurrentLanguage()).toBe('es');
    });

    it('should fallback to English for unsupported language', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      i18n.setLanguage('unsupported');
      expect(i18n.getCurrentLanguage()).toBe('en');
      expect(consoleSpy).toHaveBeenCalledWith(
        'Language unsupported not available, falling back to en',
      );
      consoleSpy.mockRestore();
    });

    it('should check if language has translations', () => {
      expect(i18n.hasTranslations('en')).toBe(true);
      expect(i18n.hasTranslations('es')).toBe(true);
      expect(i18n.hasTranslations('unsupported')).toBe(false);
    });

    it('should get available languages', () => {
      const languages = i18n.getAvailableLanguages();
      expect(languages).toContain('en');
      expect(languages).toContain('es');
      expect(languages).toContain('hr');
    });
  });

  describe('RTL Support', () => {
    it('should detect RTL languages correctly', () => {
      expect(i18n.isRTL()).toBe(false); // English is LTR
      
      i18n.setLanguage('ar');
      expect(i18n.isRTL()).toBe(true); // Arabic is RTL
    });

    it('should get correct text direction', () => {
      expect(i18n.getTextDirection()).toBe('ltr');
      
      i18n.setLanguage('ar');
      expect(i18n.getTextDirection()).toBe('rtl');
    });

    it('should include all RTL languages in constants', () => {
      expect(RTL_LANGUAGES).toContain('ar');
      expect(RTL_LANGUAGES).toContain('he');
      expect(RTL_LANGUAGES).toContain('fa');
      expect(RTL_LANGUAGES).toContain('ur');
    });
  });

  describe('Translation', () => {
    it('should translate basic strings', () => {
      expect(i18n.t('home')).toBe('Home');
      expect(i18n.t('profile')).toBe('Profile');
      expect(i18n.t('settings')).toBe('Settings');
    });

    it('should translate in different languages', () => {
      i18n.setLanguage('es');
      expect(i18n.t('home')).toBe('Inicio');
      expect(i18n.t('profile')).toBe('Perfil');
      expect(i18n.t('settings')).toBe('Configuración');
    });

    it('should fallback to English for missing translations', () => {
      i18n.setLanguage('unsupported');
      expect(i18n.t('home')).toBe('Home');
    });

    it('should return key for completely missing translations', () => {
      expect(i18n.t('nonexistentKey' as any)).toBe('nonexistentKey');
    });
  });

  describe('Pluralization', () => {
    it('should handle English pluralization', () => {
      expect(i18n.tPlural('lessons', 1)).toBe('Lesson');
      expect(i18n.tPlural('lessons', 2)).toBe('Lessons');
      expect(i18n.tPlural('lessons', 0)).toBe('Lessons');
    });

    it('should handle Spanish pluralization', () => {
      i18n.setLanguage('es');
      expect(i18n.tPlural('lessons', 1)).toBe('Lección');
      expect(i18n.tPlural('lessons', 2)).toBe('Lecciones');
    });

    it('should handle Croatian pluralization', () => {
      i18n.setLanguage('hr');
      expect(i18n.tPlural('lessons', 1)).toBe('Lekcija');
      expect(i18n.tPlural('lessons', 2)).toBe('Lekcije');
      expect(i18n.tPlural('lessons', 5)).toBe('Lekcija');
    });

    it('should fallback to singular for non-pluralized strings', () => {
      expect(i18n.tPlural('home', 5)).toBe('Home');
    });
  });

  describe('Pluralization Rules', () => {
    it('should handle English plural rules', () => {
      expect(PLURAL_RULES.en(1)).toBe('one');
      expect(PLURAL_RULES.en(2)).toBe('other');
      expect(PLURAL_RULES.en(0)).toBe('other');
    });

    it('should handle Croatian plural rules', () => {
      expect(PLURAL_RULES.hr(1)).toBe('one');
      expect(PLURAL_RULES.hr(2)).toBe('few');
      expect(PLURAL_RULES.hr(5)).toBe('other');
      expect(PLURAL_RULES.hr(11)).toBe('other');
      expect(PLURAL_RULES.hr(21)).toBe('one');
      expect(PLURAL_RULES.hr(22)).toBe('few');
    });

    it('should handle Arabic plural rules', () => {
      expect(PLURAL_RULES.ar(0)).toBe('zero');
      expect(PLURAL_RULES.ar(1)).toBe('one');
      expect(PLURAL_RULES.ar(2)).toBe('two');
      expect(PLURAL_RULES.ar(5)).toBe('few');
      expect(PLURAL_RULES.ar(15)).toBe('many');
      expect(PLURAL_RULES.ar(100)).toBe('other');
    });
  });

  describe('Accessibility', () => {
    it('should provide accessibility translations', () => {
      expect(i18n.accessibility('closeButton')).toBe('Close');
      expect(i18n.accessibility('menuButton')).toBe('Open menu');
      expect(i18n.accessibility('backButton')).toBe('Go back');
    });

    it('should provide accessibility translations in different languages', () => {
      i18n.setLanguage('es');
      expect(i18n.accessibility('closeButton')).toBe('Cerrar');
      expect(i18n.accessibility('menuButton')).toBe('Abrir menú');
    });
  });

  describe('Edge Cases', () => {
    it('should handle null/undefined values gracefully', () => {
      expect(() => i18n.setLanguage('')).not.toThrow();
      expect(() => i18n.setLanguage(null as any)).not.toThrow();
    });

    it('should handle missing plural forms gracefully', () => {
      // Test with a language that might not have all plural forms
      i18n.setLanguage('en');
      expect(i18n.tPlural('lessons', 999)).toBe('Lessons'); // Should fallback to 'other'
    });

    it('should handle rapid language changes', () => {
      i18n.setLanguage('en');
      i18n.setLanguage('es');
      i18n.setLanguage('hr');
      expect(i18n.getCurrentLanguage()).toBe('hr');
      expect(i18n.t('home')).toBe('Početna');
    });
  });
});
