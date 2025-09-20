/**
 * Centralized Icons Component
 * Provides all the icons used throughout the app
 */

import React from 'react';
import {
  Star,
  Target,
  Clock,
  Check,
  Bell,
  Shield,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  RefreshCw,
  Home,
  Bug,
  Globe,
  AlertCircle,
  CheckCircle,
  Info,
  X,
  Eye,
  EyeOff,
  Mail,
  Wifi,
  Lock as LockIcon,
  Play,
  Mic,
  MicOff,
  Volume2,
  RotateCcw,
  XCircle,
} from '@/components/icons/LucideReplacement';

// Re-export all icons for easy importing
export {
  Star,
  Target,
  Clock,
  Check,
  Bell,
  Shield,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  RefreshCw,
  Home,
  Bug,
  Globe,
  AlertCircle,
  CheckCircle,
  Info,
  X,
  Eye,
  EyeOff,
  Mail,
  Wifi,
  LockIcon as Lock,
  Play,
  Mic,
  MicOff,
  Volume2,
  RotateCcw,
  XCircle,
};

// Icon component with proper typing
interface IconProps {
  name: keyof typeof iconMap;
  size?: number;
  color?: string;
  style?: any;
}

const iconMap = {
  Star,
  Target,
  Clock,
  Check,
  Bell,
  Shield,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  RefreshCw,
  Home,
  Bug,
  Globe,
  AlertCircle,
  CheckCircle,
  Info,
  X,
  Eye,
  EyeOff,
  Mail,
  Wifi,
  Lock: LockIcon,
  Play,
  Mic,
  MicOff,
  Volume2,
  RotateCcw,
  XCircle,
};

export const Icon: React.FC<IconProps> = ({ name, size = 24, color = '#000', style }) => {
  const IconComponent = iconMap[name];
  
  if (!IconComponent) {
    console.warn(`Icon "${name}" not found`);
    return null;
  }
  
  return <IconComponent size={size} color={color} style={style} />;
};

export default Icon;
