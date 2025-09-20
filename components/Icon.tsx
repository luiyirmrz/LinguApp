import React, { memo } from 'react';
import { View, Text, ViewStyle, TextStyle } from 'react-native';
import { theme } from '@/constants/theme';

export interface IconProps {
  name: string;
  size?: number;
  color?: string;
  style?: ViewStyle;
}

// Simple icon system using emojis and basic shapes
const IconMap: Record<string, string> = {
  // Navigation
  home: '🏠',
  user: '👤',
  settings: '⚙️',
  arrowLeft: '←',
  arrowRight: '→',
  arrowUp: '↑',
  arrowDown: '↓',
  close: '✕',
  plus: '+',
  edit: '✏️',
  delete: '🗑️',
  save: '💾',
  share: '📤',
  
  // Actions
  search: '🔍',
  filter: '🔧',
  refresh: '🔄',
  check: '✓',
  alert: '⚠️',
  info: 'ℹ️',
  
  // Learning
  book: '📚',
  graduation: '🎓',
  target: '🎯',
  trophy: '🏆',
  star: '⭐',
  heart: '❤️',
  flame: '🔥',
  zap: '⚡',
  
  // Social
  users: '👥',
  message: '💬',
  like: '👍',
  comment: '💭',
  
  // Media
  play: '▶️',
  pause: '⏸️',
  volume: '🔊',
  mic: '🎤',
  camera: '📷',
  
  // Communication
  mail: '📧',
  phone: '📞',
  globe: '🌐',
  language: '🌍',
  
  // Time
  clock: '🕐',
  calendar: '📅',
  timer: '⏱️',
  
  // Data
  chart: '📊',
  activity: '📈',
  database: '🗄️',
  
  // UI
  menu: '☰',
  more: '⋯',
  download: '⬇️',
  upload: '⬆️',
  lock: '🔒',
  unlock: '🔓',
  
  // Chevrons
  chevronRight: '›',
  chevronLeft: '‹',
  chevronUp: '⌃',
  chevronDown: '⌄',
};

export const Icon: React.FC<IconProps> = ({ 
  name, 
  size = 24, 
  color = theme.colors.text,
  style, 
}) => {
  const iconChar = IconMap[name] || '?';
  
  return (
    <Text 
      style={[
        {
          fontSize: size,
          color,
          textAlign: 'center',
        } as TextStyle,
        style as TextStyle,
      ]}
    >
      {iconChar}
    </Text>
  );
};

// Export all icon names for type safety
export const IconNames = Object.keys(IconMap) as Array<keyof typeof IconMap>;

// Export the icon map for advanced usage
export { IconMap };


Icon.displayName = 'Icon';

export default memo(Icon);
