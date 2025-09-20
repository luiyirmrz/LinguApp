# Adaptive Design System Documentation

## Overview

The Adaptive Design System provides language-specific color palettes and cultural visual elements that reflect the culture of the language being learned. This enhances user experience by creating a more immersive and culturally relevant learning environment.

## Features

### 🎨 Language-Specific Color Palettes
- **Spanish (es)**: Warm, vibrant colors reflecting Spanish culture
- **French (fr)**: Elegant blues and sophisticated colors
- **Croatian (hr)**: Adriatic blues and Mediterranean colors
- **German (de)**: Strong, reliable colors
- **Italian (it)**: Rich, artistic colors
- **Portuguese (pt)**: Ocean blues and warm earth tones
- **English (en)**: Classic, professional colors

### 🌍 Cultural Visual Elements
- **Patterns**: Language-specific background patterns
- **Icons**: Cultural emojis and symbols
- **Colors**: Flag colors, architecture, nature, and art themes
- **Typography**: Language-appropriate font suggestions

### 🌙 Dark Mode Support
- Automatic dark mode color adjustments
- Maintains cultural identity in dark themes
- Smooth transitions between light and dark modes

## Implementation

### Core Files

#### `constants/adaptiveTheme.ts`
Main theme configuration with language-specific palettes and cultural elements.

#### `contexts/AdaptiveThemeContext.tsx`
React context provider for theme management and language switching.

#### `components/CulturalBackground.tsx`
Background component with language-specific patterns and visual elements.

#### `components/CulturalHeader.tsx`
Header component displaying cultural icons and language indicators.

### Usage Examples

#### Basic Theme Usage
```typescript
import { useAdaptiveTheme } from '@/contexts/AdaptiveThemeContext';

const MyComponent = () => {
  const { theme, getPrimaryColor, getCulturalIcons } = useAdaptiveTheme();
  
  return (
    <View style={{ backgroundColor: getPrimaryColor() }}>
      <Text>Current language: {theme.language}</Text>
      {getCulturalIcons().map(icon => <Text key={icon}>{icon}</Text>)}
    </View>
  );
};
```

#### Cultural Background
```typescript
import { CulturalBackground } from '@/components/CulturalBackground';

const LessonScreen = () => {
  return (
    <CulturalBackground pattern="medium" opacity={0.15}>
      <Text>Lesson content here</Text>
    </CulturalBackground>
  );
};
```

#### Cultural Header
```typescript
import { CulturalHeader } from '@/components/CulturalHeader';

const LessonHeader = () => {
  return (
    <CulturalHeader
      title="Spanish Lesson"
      subtitle="Basic Greetings"
      showCulturalIcons={true}
      showLanguageFlag={true}
    />
  );
};
```

## Color Palettes

### Spanish (es)
```typescript
{
  primary: '#FF6B6B',      // Warm coral red
  secondary: '#FF8E53',    // Warm orange
  accent: '#FFD93D',       // Golden yellow
  background: '#FFF8F5',   // Warm white
  cultural: {
    flag: ['#C60B1E', '#FFC400'], // Spanish flag colors
    architecture: '#D2691E',      // Terracotta
    nature: '#228B22',            // Forest green
    art: '#DC143C',               // Crimson
  }
}
```

### French (fr)
```typescript
{
  primary: '#4A90E2',      // Elegant blue
  secondary: '#50E3C2',    // Mint green
  accent: '#9B59B6',       // Purple accent
  background: '#F8FAFF',   // Cool white
  cultural: {
    flag: ['#002395', '#FFFFFF', '#ED2939'], // French flag colors
    architecture: '#708090',                 // Slate gray
    nature: '#2E8B57',                       // Sea green
    art: '#8A2BE2',                          // Blue violet
  }
}
```

### Croatian (hr)
```typescript
{
  primary: '#1E90FF',      // Dodger blue
  secondary: '#FF6347',    // Tomato red
  accent: '#32CD32',       // Lime green
  background: '#F0F8FF',   // Alice blue
  cultural: {
    flag: ['#FF0000', '#FFFFFF', '#0000FF'], // Croatian flag colors
    architecture: '#CD853F',                 // Peru (stone)
    nature: '#228B22',                       // Forest green
    art: '#4169E1',                          // Royal blue
  }
}
```

## Cultural Elements

### Patterns
Each language has specific background patterns:
- **Spanish**: Flamenco, tiles, geometric
- **French**: Fleur-de-lis, elegant, minimalist
- **Croatian**: Adriatic, waves, coastal
- **German**: Precision, geometric, industrial
- **Italian**: Renaissance, artistic, ornate
- **Portuguese**: Azulejo, oceanic, maritime
- **English**: Classic, clean, professional

### Icons
Cultural emojis and symbols:
- **Spanish**: 🌶️ 🎭 🏛️ 🌅
- **French**: 🗼 🥐 🎨 🌹
- **Croatian**: 🏖️ 🏰 🌊 🍯
- **German**: 🏰 🍺 ⚙️ 🌲
- **Italian**: 🍝 🏛️ 🎭 🍷
- **Portuguese**: 🌊 🏰 🐟 ☀️
- **English**: ☕ 🏰 🌧️ 📚

## API Reference

### `getAdaptiveTheme(languageCode, isDarkMode?)`
Returns complete theme configuration for a language.

**Parameters:**
- `languageCode`: Language code (e.g., 'es', 'fr', 'hr')
- `isDarkMode`: Optional dark mode flag

**Returns:**
```typescript
{
  language: string;
  colors: ColorPalette;
  cultural: CulturalElements;
  isDarkMode: boolean;
}
```

### `getCulturalColor(languageCode, context)`
Returns cultural color for specific context.

**Parameters:**
- `languageCode`: Language code
- `context`: 'flag' | 'architecture' | 'nature' | 'art'

**Returns:** `string` - Color hex code

### `getCulturalPattern(languageCode)`
Returns primary cultural pattern for language.

**Parameters:**
- `languageCode`: Language code

**Returns:** `string` - Pattern name

### `getCulturalIcons(languageCode)`
Returns cultural icons for language.

**Parameters:**
- `languageCode`: Language code

**Returns:** `string[]` - Array of emoji icons

## React Hooks

### `useAdaptiveTheme()`
Main hook for accessing theme context.

**Returns:**
```typescript
{
  theme: AdaptiveThemeConfig;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  updateLanguage: (languageCode: string) => void;
  getCulturalColor: (context: string) => string;
  getCulturalPattern: () => string;
  getCulturalIcons: () => string[];
  // ... color getters
}
```

### `useThemeColors()`
Hook for accessing theme colors only.

**Returns:** `ColorPalette`

### `useCulturalElements()`
Hook for accessing cultural elements only.

**Returns:** `CulturalElements`

### `useThemeUtils()`
Hook for theme utility functions.

**Returns:** Theme utility functions

## Integration

### App Setup
```typescript
import { AdaptiveThemeProvider } from '@/contexts/AdaptiveThemeContext';

export default function App() {
  return (
    <AdaptiveThemeProvider>
      <YourAppContent />
    </AdaptiveThemeProvider>
  );
}
```

### Component Integration
```typescript
import { useAdaptiveTheme } from '@/contexts/AdaptiveThemeContext';

const MyComponent = () => {
  const { getPrimaryColor, getSecondaryColor } = useAdaptiveTheme();
  
  return (
    <View style={{
      backgroundColor: getPrimaryColor(),
      borderColor: getSecondaryColor()
    }}>
      {/* Component content */}
    </View>
  );
};
```

## Testing

The system includes comprehensive tests covering:
- Language-specific color palettes
- Cultural elements
- Dark mode support
- Edge cases and error handling
- Theme switching functionality

Run tests with:
```bash
npm test -- __tests__/adaptiveTheme.test.ts
```

## Performance Considerations

- **Lazy Loading**: Cultural patterns are rendered only when needed
- **Memoization**: Theme calculations are memoized for performance
- **Efficient Updates**: Only necessary components re-render on theme changes
- **Memory Management**: Proper cleanup of theme resources

## Accessibility

- **High Contrast**: All color combinations meet WCAG guidelines
- **Screen Reader Support**: Cultural elements have proper accessibility labels
- **Keyboard Navigation**: Full keyboard support for theme switching
- **Color Blindness**: Alternative indicators for color-dependent information

## Future Enhancements

- **Seasonal Themes**: Time-based cultural variations
- **Regional Variations**: Sub-language specific themes
- **User Customization**: Allow users to customize cultural elements
- **Animation**: Smooth transitions between themes
- **Accessibility**: Enhanced accessibility features
- **Performance**: Further optimization for large applications

## Migration Guide

### From Static Theme
1. Wrap your app with `AdaptiveThemeProvider`
2. Replace static color references with `useAdaptiveTheme()` hook
3. Update components to use cultural elements
4. Test with different languages

### Example Migration
```typescript
// Before
const styles = StyleSheet.create({
  container: {
    backgroundColor: '#58CC02', // Static green
  }
});

// After
const MyComponent = () => {
  const { getPrimaryColor } = useAdaptiveTheme();
  
  return (
    <View style={{
      backgroundColor: getPrimaryColor() // Dynamic based on language
    }}>
      {/* Content */}
    </View>
  );
};
```

## Best Practices

1. **Consistent Usage**: Always use theme hooks instead of hardcoded colors
2. **Cultural Sensitivity**: Respect cultural elements and use them appropriately
3. **Performance**: Use `useThemeColors()` when you only need colors
4. **Testing**: Test with multiple languages and dark mode
5. **Accessibility**: Ensure all cultural elements are accessible
6. **Documentation**: Document any custom cultural elements you add

## Troubleshooting

### Common Issues

1. **Theme not updating**: Ensure `AdaptiveThemeProvider` is properly wrapped
2. **Colors not changing**: Check if language code is correct
3. **Dark mode not working**: Verify `isDarkMode` parameter
4. **Cultural elements missing**: Check if language is supported

### Debug Mode
Enable debug logging to troubleshoot theme issues:
```typescript
const { theme } = useAdaptiveTheme();
console.log('Current theme:', theme);
```

## Contributing

When adding new languages:
1. Add color palette to `languageColorPalettes`
2. Add cultural elements to `culturalElements`
3. Update tests with new language
4. Document cultural choices and rationale
5. Ensure accessibility compliance
