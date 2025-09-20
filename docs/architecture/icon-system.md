# Icon System Documentation

## Overview

The LinguApp icon system provides a standardized way to use icons throughout the application. It's built on top of Lucide React Native icons with consistent sizing, colors, and usage patterns.

## Basic Usage

### Using the Icon Component

```tsx
import { Icon } from '@/components';

// Basic usage
<Icon name="Home" size="lg" color="#007AFF" />

// With custom size
<Icon name="Settings" size={24} color={theme.colors.primary} />

// With onPress handler
<Icon 
  name="Heart" 
  size="md" 
  color={theme.colors.error}
  onPress={() => console.log('Heart pressed')}
/>
```

### Using Predefined Icons

```tsx
import { Icons } from '@/components';

// Navigation icons
<Icons.home size="lg" color={theme.colors.primary} />
<Icons.back size="md" onPress={handleBack} />
<Icons.close size="sm" />

// Action icons
<Icons.add size="lg" />
<Icons.edit size="md" />
<Icons.delete size="sm" color={theme.colors.error} />

// Status icons
<Icons.success size="lg" color={theme.colors.success} />
<Icons.error size="md" color={theme.colors.error} />
<Icons.warning size="sm" color={theme.colors.warning} />
<Icons.info size="md" color={theme.colors.primary} />
```

## Size Options

The icon system supports both predefined sizes and custom numeric values:

### Predefined Sizes
- `xs`: 12px
- `sm`: 16px
- `md`: 20px (default)
- `lg`: 24px
- `xl`: 32px
- `xxl`: 48px

### Custom Sizes
```tsx
<Icon name="Star" size={18} />
<Icon name="Trophy" size={64} />
```

## Color Usage

### Using Theme Colors
```tsx
import { theme } from '@/constants/theme';

<Icons.heart color={theme.colors.primary} />
<Icons.error color={theme.colors.error} />
<Icons.success color={theme.colors.success} />
```

### Using Custom Colors
```tsx
<Icons.star color="#FFD700" />
<Icons.trophy color="#FF6B6B" />
```

## Icon Categories

### Navigation Icons
- `home` - Home screen
- `profile` - User profile
- `settings` - Settings screen
- `back` - Back navigation
- `close` - Close/dismiss

### Action Icons
- `add` - Add new item
- `edit` - Edit item
- `delete` - Delete item
- `save` - Save changes
- `share` - Share content
- `search` - Search functionality
- `filter` - Filter options
- `refresh` - Refresh/reload

### Status Icons
- `success` - Success state
- `error` - Error state
- `warning` - Warning state
- `info` - Information state

### Learning Icons
- `book` - Learning materials
- `lesson` - Lesson content
- `flashcard` - Flashcard exercises
- `practice` - Practice sessions
- `progress` - Progress tracking

### Gamification Icons
- `trophy` - Achievements
- `star` - Ratings/reviews
- `heart` - Favorites/likes
- `flame` - Streaks
- `zap` - Power-ups

### Social Icons
- `users` - User groups
- `message` - Messaging
- `like` - Like/reactions
- `comment` - Comments

### Media Icons
- `play` - Play audio/video
- `pause` - Pause audio/video
- `volume` - Volume control
- `mic` - Microphone/recording
- `camera` - Camera functionality

### Communication Icons
- `mail` - Email
- `phone` - Phone calls
- `globe` - Global/international
- `language` - Language selection

### Time Icons
- `clock` - Time display
- `calendar` - Calendar/date
- `timer` - Timer/countdown

### Data Icons
- `chart` - Charts/graphs
- `analytics` - Analytics data
- `data` - Data storage

### System Icons
- `menu` - Menu/hamburger
- `more` - More options
- `download` - Download
- `upload` - Upload
- `lock` - Locked/secure
- `unlock` - Unlocked

### Direction Icons
- `chevronRight` - Right navigation
- `chevronLeft` - Left navigation
- `chevronUp` - Up navigation
- `chevronDown` - Down navigation
- `arrowRight` - Right arrow
- `arrowLeft` - Left arrow
- `arrowUp` - Up arrow
- `arrowDown` - Down arrow

## Best Practices

### 1. Consistent Sizing
Use consistent icon sizes within the same context:
```tsx
// Good - Consistent sizing in a list
<Icons.home size="md" />
<Icons.settings size="md" />
<Icons.profile size="md" />

// Avoid - Mixed sizes in same context
<Icons.home size="lg" />
<Icons.settings size="sm" />
<Icons.profile size="md" />
```

### 2. Semantic Colors
Use colors that match the semantic meaning:
```tsx
// Good - Semantic colors
<Icons.success color={theme.colors.success} />
<Icons.error color={theme.colors.error} />
<Icons.warning color={theme.colors.warning} />

// Avoid - Non-semantic colors
<Icons.success color={theme.colors.error} />
<Icons.error color={theme.colors.success} />
```

### 3. Accessibility
Always provide meaningful context for screen readers:
```tsx
// Good - With accessibility
<TouchableOpacity accessibilityLabel="Add new lesson">
  <Icons.add size="lg" />
</TouchableOpacity>

// Avoid - No accessibility context
<Icons.add size="lg" />
```

### 4. Touch Targets
Ensure adequate touch targets for interactive icons:
```tsx
// Good - Adequate touch target
<TouchableOpacity 
  style={{ padding: 8 }}
  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
>
  <Icons.close size="md" />
</TouchableOpacity>
```

## Adding New Icons

### 1. Check Lucide Icons
First, check if the icon exists in Lucide React Native:
https://lucide.dev/icons/

### 2. Add to Predefined Icons
If the icon is commonly used, add it to the `Icons` object in `components/Icon.tsx`:

```tsx
export const Icons = {
  // ... existing icons
  
  // New category
  newIcon: (props: Omit<IconProps, 'name'>) => <Icon name="NewIcon" {...props} />,
};
```

### 3. Use Direct Icon Component
For one-off icons, use the Icon component directly:
```tsx
<Icon name="NewIcon" size="md" color={theme.colors.primary} />
```

## Migration Guide

### From Direct Lucide Imports
```tsx
// Before
import { Home, Settings, User } from 'lucide-react-native';

<Home size={24} color="#007AFF" />
<Settings size={20} color="#666" />
<User size={16} color="#333" />

// After
import { Icons } from '@/components';

<Icons.home size="lg" color={theme.colors.primary} />
<Icons.settings size="md" color={theme.colors.textSecondary} />
<Icons.profile size="sm" color={theme.colors.text} />
```

### From Custom Icon Components
```tsx
// Before
<CustomIcon name="home" size={24} />

// After
<Icons.home size="lg" />
```

## Performance Considerations

### 1. Icon Caching
Icons are automatically cached by React Native, so repeated usage is efficient.

### 2. Bundle Size
Only import the icons you need. The predefined Icons object helps with this.

### 3. Re-renders
Icons are lightweight components, but avoid unnecessary re-renders by memoizing when appropriate.

## Troubleshooting

### Icon Not Found
If you see a warning about an icon not being found:
1. Check the icon name spelling
2. Verify the icon exists in Lucide
3. Check the import path

### Performance Issues
If you experience performance issues with many icons:
1. Use smaller icon sizes when possible
2. Consider lazy loading for large icon sets
3. Memoize icon components in lists

### Styling Issues
If icons don't appear correctly:
1. Check the color prop
2. Verify the size prop
3. Ensure proper container styling
