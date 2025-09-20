/**
 * Adaptive Theme System Tests
 * Tests for language-specific color palettes and cultural elements
 */

import { 
  getAdaptiveTheme, 
  getCulturalColor, 
  getCulturalPattern, 
  getCulturalIcons,
  languageColorPalettes,
  culturalElements,
  themeColors,
} from '@/constants/adaptiveTheme';

describe('Adaptive Theme System', () => {
  describe('Language Color Palettes', () => {
    test('should return Spanish colors for es language', () => {
      const theme = getAdaptiveTheme('es');
      
      expect(theme.language).toBe('es');
      expect(theme.colors.primary).toBe('#FF6B6B');
      expect(theme.colors.secondary).toBe('#FF8E53');
      expect(theme.colors.accent).toBe('#FFD93D');
      expect(theme.colors.background).toBe('#FFF8F5');
    });

    test('should return French colors for fr language', () => {
      const theme = getAdaptiveTheme('fr');
      
      expect(theme.language).toBe('fr');
      expect(theme.colors.primary).toBe('#4A90E2');
      expect(theme.colors.secondary).toBe('#50E3C2');
      expect(theme.colors.accent).toBe('#9B59B6');
      expect(theme.colors.background).toBe('#F8FAFF');
    });

    test('should return Croatian colors for hr language', () => {
      const theme = getAdaptiveTheme('hr');
      
      expect(theme.language).toBe('hr');
      expect(theme.colors.primary).toBe('#1E90FF');
      expect(theme.colors.secondary).toBe('#FF6347');
      expect(theme.colors.accent).toBe('#32CD32');
      expect(theme.colors.background).toBe('#F0F8FF');
    });

    test('should return German colors for de language', () => {
      const theme = getAdaptiveTheme('de');
      
      expect(theme.language).toBe('de');
      expect(theme.colors.primary).toBe('#FF6B35');
      expect(theme.colors.secondary).toBe('#2C3E50');
      expect(theme.colors.accent).toBe('#F39C12');
      expect(theme.colors.background).toBe('#F8F9FA');
    });

    test('should return Italian colors for it language', () => {
      const theme = getAdaptiveTheme('it');
      
      expect(theme.language).toBe('it');
      expect(theme.colors.primary).toBe('#E74C3C');
      expect(theme.colors.secondary).toBe('#F39C12');
      expect(theme.colors.accent).toBe('#8E44AD');
      expect(theme.colors.background).toBe('#FFF5F5');
    });

    test('should return Portuguese colors for pt language', () => {
      const theme = getAdaptiveTheme('pt');
      
      expect(theme.language).toBe('pt');
      expect(theme.colors.primary).toBe('#3498DB');
      expect(theme.colors.secondary).toBe('#E67E22');
      expect(theme.colors.accent).toBe('#9B59B6');
      expect(theme.colors.background).toBe('#F8F9FA');
    });

    test('should return English colors for en language', () => {
      const theme = getAdaptiveTheme('en');
      
      expect(theme.language).toBe('en');
      expect(theme.colors.primary).toBe('#007AFF');
      expect(theme.colors.secondary).toBe('#5856D6');
      expect(theme.colors.accent).toBe('#FF9500');
      expect(theme.colors.background).toBe('#FFFFFF');
    });

    test('should return default colors for unknown language', () => {
      const theme = getAdaptiveTheme('unknown');
      
      expect(theme.language).toBe('unknown');
      expect(theme.colors.primary).toBe('#58CC02');
      expect(theme.colors.secondary).toBe('#1CB0F6');
      expect(theme.colors.accent).toBe('#FFC800');
      expect(theme.colors.background).toBe('#FFFFFF');
    });
  });

  describe('Dark Mode Support', () => {
    test('should apply dark mode colors when enabled', () => {
      const theme = getAdaptiveTheme('es', true);
      
      expect(theme.isDarkMode).toBe(true);
      expect(theme.colors.background).toBe('#1A1A1A');
      expect(theme.colors.surface).toBe('#2D2D2D');
      expect(theme.colors.text).toBe('#FFFFFF');
      expect(theme.colors.textSecondary).toBe('#CCCCCC');
    });

    test('should use light mode colors when disabled', () => {
      const theme = getAdaptiveTheme('es', false);
      
      expect(theme.isDarkMode).toBe(false);
      expect(theme.colors.background).toBe('#FFF8F5');
      expect(theme.colors.surface).toBe('#FFF0E8');
      expect(theme.colors.text).toBe('#2D1B1B');
    });
  });

  describe('Cultural Elements', () => {
    test('should return Spanish cultural elements', () => {
      const pattern = getCulturalPattern('es');
      const icons = getCulturalIcons('es');
      
      expect(pattern).toBe('flamenco');
      expect(icons).toEqual(['🌶️', '🎭', '🏛️', '🌅']);
    });

    test('should return French cultural elements', () => {
      const pattern = getCulturalPattern('fr');
      const icons = getCulturalIcons('fr');
      
      expect(pattern).toBe('fleur-de-lis');
      expect(icons).toEqual(['🗼', '🥐', '🎨', '🌹']);
    });

    test('should return Croatian cultural elements', () => {
      const pattern = getCulturalPattern('hr');
      const icons = getCulturalIcons('hr');
      
      expect(pattern).toBe('adriatic');
      expect(icons).toEqual(['🏖️', '🏰', '🌊', '🍯']);
    });

    test('should return German cultural elements', () => {
      const pattern = getCulturalPattern('de');
      const icons = getCulturalIcons('de');
      
      expect(pattern).toBe('precision');
      expect(icons).toEqual(['🏰', '🍺', '⚙️', '🌲']);
    });

    test('should return Italian cultural elements', () => {
      const pattern = getCulturalPattern('it');
      const icons = getCulturalIcons('it');
      
      expect(pattern).toBe('renaissance');
      expect(icons).toEqual(['🍝', '🏛️', '🎭', '🍷']);
    });

    test('should return Portuguese cultural elements', () => {
      const pattern = getCulturalPattern('pt');
      const icons = getCulturalIcons('pt');
      
      expect(pattern).toBe('azulejo');
      expect(icons).toEqual(['🌊', '🏰', '🐟', '☀️']);
    });

    test('should return English cultural elements', () => {
      const pattern = getCulturalPattern('en');
      const icons = getCulturalIcons('en');
      
      expect(pattern).toBe('classic');
      expect(icons).toEqual(['☕', '🏰', '🌧️', '📚']);
    });
  });

  describe('Cultural Colors', () => {
    test('should return Spanish flag colors', () => {
      const flagColor = getCulturalColor('es', 'flag');
      expect(flagColor).toBe('#C60B1E');
    });

    test('should return French flag colors', () => {
      const flagColor = getCulturalColor('fr', 'flag');
      expect(flagColor).toBe('#002395');
    });

    test('should return Croatian flag colors', () => {
      const flagColor = getCulturalColor('hr', 'flag');
      expect(flagColor).toBe('#FF0000');
    });

    test('should return German flag colors', () => {
      const flagColor = getCulturalColor('de', 'flag');
      expect(flagColor).toBe('#000000');
    });

    test('should return Italian flag colors', () => {
      const flagColor = getCulturalColor('it', 'flag');
      expect(flagColor).toBe('#009246');
    });

    test('should return Portuguese flag colors', () => {
      const flagColor = getCulturalColor('pt', 'flag');
      expect(flagColor).toBe('#006600');
    });

    test('should return English flag colors', () => {
      const flagColor = getCulturalColor('en', 'flag');
      expect(flagColor).toBe('#012169');
    });

    test('should return architecture colors', () => {
      const archColor = getCulturalColor('es', 'architecture');
      expect(archColor).toBe('#D2691E');
    });

    test('should return nature colors', () => {
      const natureColor = getCulturalColor('es', 'nature');
      expect(natureColor).toBe('#228B22');
    });

    test('should return art colors', () => {
      const artColor = getCulturalColor('es', 'art');
      expect(artColor).toBe('#DC143C');
    });
  });

  describe('Theme Colors Export', () => {
    test('should export correct theme colors', () => {
      expect(themeColors.es).toEqual(['#FF6B6B', '#FF8E53']);
      expect(themeColors.fr).toEqual(['#4A90E2', '#50E3C2']);
      expect(themeColors.hr).toEqual(['#1E90FF', '#FF6347']);
      expect(themeColors.de).toEqual(['#FF6B35', '#2C3E50']);
      expect(themeColors.it).toEqual(['#E74C3C', '#F39C12']);
      expect(themeColors.pt).toEqual(['#3498DB', '#E67E22']);
      expect(themeColors.en).toEqual(['#007AFF', '#5856D6']);
      expect(themeColors.default).toEqual(['#58CC02', '#1CB0F6']);
    });
  });

  describe('Language Color Palettes Structure', () => {
    test('should have all required languages', () => {
      const languages = Object.keys(languageColorPalettes);
      expect(languages).toContain('es');
      expect(languages).toContain('fr');
      expect(languages).toContain('hr');
      expect(languages).toContain('de');
      expect(languages).toContain('it');
      expect(languages).toContain('pt');
      expect(languages).toContain('en');
      expect(languages).toContain('default');
    });

    test('should have consistent color structure for all languages', () => {
      Object.values(languageColorPalettes).forEach(palette => {
        expect(palette).toHaveProperty('primary');
        expect(palette).toHaveProperty('primaryDark');
        expect(palette).toHaveProperty('primaryLight');
        expect(palette).toHaveProperty('secondary');
        expect(palette).toHaveProperty('secondaryDark');
        expect(palette).toHaveProperty('secondaryLight');
        expect(palette).toHaveProperty('accent');
        expect(palette).toHaveProperty('accentDark');
        expect(palette).toHaveProperty('accentLight');
        expect(palette).toHaveProperty('background');
        expect(palette).toHaveProperty('surface');
        expect(palette).toHaveProperty('text');
        expect(palette).toHaveProperty('textSecondary');
        expect(palette).toHaveProperty('success');
        expect(palette).toHaveProperty('warning');
        expect(palette).toHaveProperty('error');
        expect(palette).toHaveProperty('cultural');
      });
    });

    test('should have cultural color structure', () => {
      Object.values(languageColorPalettes).forEach(palette => {
        expect(palette.cultural).toHaveProperty('flag');
        expect(palette.cultural).toHaveProperty('architecture');
        expect(palette.cultural).toHaveProperty('nature');
        expect(palette.cultural).toHaveProperty('art');
      });
    });
  });

  describe('Cultural Elements Structure', () => {
    test('should have all required languages', () => {
      const languages = Object.keys(culturalElements);
      expect(languages).toContain('es');
      expect(languages).toContain('fr');
      expect(languages).toContain('hr');
      expect(languages).toContain('de');
      expect(languages).toContain('it');
      expect(languages).toContain('pt');
      expect(languages).toContain('en');
      expect(languages).toContain('default');
    });

    test('should have consistent cultural structure for all languages', () => {
      Object.values(culturalElements).forEach(cultural => {
        expect(cultural).toHaveProperty('patterns');
        expect(cultural).toHaveProperty('icons');
        expect(cultural).toHaveProperty('fonts');
        expect(cultural).toHaveProperty('borders');
        expect(cultural).toHaveProperty('shadows');
        expect(Array.isArray(cultural.patterns)).toBe(true);
        expect(Array.isArray(cultural.icons)).toBe(true);
        expect(cultural.fonts).toHaveProperty('primary');
        expect(cultural.fonts).toHaveProperty('decorative');
      });
    });
  });

  describe('Case Insensitive Language Codes', () => {
    test('should handle uppercase language codes', () => {
      const theme = getAdaptiveTheme('ES');
      expect(theme.language).toBe('es');
      expect(theme.colors.primary).toBe('#FF6B6B');
    });

    test('should handle mixed case language codes', () => {
      const theme = getAdaptiveTheme('Fr');
      expect(theme.language).toBe('fr');
      expect(theme.colors.primary).toBe('#4A90E2');
    });
  });

  describe('Edge Cases', () => {
    test('should handle empty language code', () => {
      const theme = getAdaptiveTheme('');
      expect(theme.language).toBe('');
      expect(theme.colors.primary).toBe('#58CC02'); // default
    });

    test('should handle null/undefined language code', () => {
      const theme = getAdaptiveTheme(null as any);
      expect(theme.language).toBe('');
      expect(theme.colors.primary).toBe('#58CC02'); // default
    });

    test('should handle very long language codes', () => {
      const theme = getAdaptiveTheme('verylonglanguagecode');
      expect(theme.language).toBe('verylonglanguagecode');
      expect(theme.colors.primary).toBe('#58CC02'); // default
    });
  });
});
