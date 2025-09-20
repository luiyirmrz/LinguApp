/**
 * Lucide Icons Replacement using @expo/vector-icons
 * This file provides a compatible replacement for lucide-react-native icons
 * using @expo/vector-icons which is more stable with Expo SDK 54
 */

import React from 'react';
import { 
  Ionicons, 
  MaterialIcons, 
  MaterialCommunityIcons, 
  Feather,
  AntDesign,
  FontAwesome5,
  Entypo,
} from '@expo/vector-icons';

// Common icon props interface
interface IconProps {
  size?: number;
  color?: string;
  style?: any;
}

// Icon mappings from Lucide to @expo/vector-icons
export const Home = ({ size = 24, color = '#000', style }: IconProps) => (
  <Ionicons name="home" size={size} color={color} style={style} />
);

export const User = ({ size = 24, color = '#000', style }: IconProps) => (
  <Ionicons name="person" size={size} color={color} style={style} />
);

export const Trophy = ({ size = 24, color = '#000', style }: IconProps) => (
  <Ionicons name="trophy" size={size} color={color} style={style} />
);

export const ShoppingBag = ({ size = 24, color = '#000', style }: IconProps) => (
  <Ionicons name="bag" size={size} color={color} style={style} />
);

export const Heart = ({ size = 24, color = '#000', style }: IconProps) => (
  <Ionicons name="heart" size={size} color={color} style={style} />
);

export const Flame = ({ size = 24, color = '#000', style }: IconProps) => (
  <Ionicons name="flame" size={size} color={color} style={style} />
);

export const Gem = ({ size = 24, color = '#000', style }: IconProps) => (
  <MaterialCommunityIcons name="diamond-stone" size={size} color={color} style={style} />
);

export const Lock = ({ size = 24, color = '#000', style }: IconProps) => (
  <Ionicons name="lock-closed" size={size} color={color} style={style} />
);

export const Globe = ({ size = 24, color = '#000', style }: IconProps) => (
  <Ionicons name="globe" size={size} color={color} style={style} />
);

export const Star = ({ size = 24, color = '#000', style }: IconProps) => (
  <Ionicons name="star" size={size} color={color} style={style} />
);

export const Settings = ({ size = 24, color = '#000', style }: IconProps) => (
  <Ionicons name="settings" size={size} color={color} style={style} />
);

export const ArrowLeft = ({ size = 24, color = '#000', style }: IconProps) => (
  <Ionicons name="arrow-back" size={size} color={color} style={style} />
);

export const Mail = ({ size = 24, color = '#000', style }: IconProps) => (
  <Ionicons name="mail" size={size} color={color} style={style} />
);

export const MailIcon = ({ size = 24, color = '#000', style }: IconProps) => (
  <Ionicons name="mail" size={size} color={color} style={style} />
);

export const Github = ({ size = 24, color = '#000', style }: IconProps) => (
  <AntDesign name="github" size={size} color={color} style={style} />
);

export const Apple = ({ size = 24, color = '#000', style }: IconProps) => (
  <AntDesign name="apple" size={size} color={color} style={style} />
);

export const X = ({ size = 24, color = '#000', style }: IconProps) => (
  <Ionicons name="close" size={size} color={color} style={style} />
);


export const CheckCircle = ({ size = 24, color = '#000', style }: IconProps) => (
  <Ionicons name="checkmark-circle" size={size} color={color} style={style} />
);

export const AlertCircle = ({ size = 24, color = '#000', style }: IconProps) => (
  <Ionicons name="alert-circle" size={size} color={color} style={style} />
);

export const AlertTriangle = ({ size = 24, color = '#000', style }: IconProps) => (
  <Ionicons name="warning" size={size} color={color} style={style} />
);

export const Info = ({ size = 24, color = '#000', style }: IconProps) => (
  <Ionicons name="information-circle" size={size} color={color} style={style} />
);

export const Award = ({ size = 24, color = '#000', style }: IconProps) => (
  <Ionicons name="ribbon" size={size} color={color} style={style} />
);

export const Calendar = ({ size = 24, color = '#000', style }: IconProps) => (
  <Ionicons name="calendar" size={size} color={color} style={style} />
);

export const Target = ({ size = 24, color = '#000', style }: IconProps) => (
  <MaterialCommunityIcons name="target" size={size} color={color} style={style} />
);

export const Play = ({ size = 24, color = '#000', style }: IconProps) => (
  <Ionicons name="play" size={size} color={color} style={style} />
);

export const Clock = ({ size = 24, color = '#000', style }: IconProps) => (
  <Ionicons name="time" size={size} color={color} style={style} />
);

export const Users = ({ size = 24, color = '#000', style }: IconProps) => (
  <Ionicons name="people" size={size} color={color} style={style} />
);

export const Medal = ({ size = 24, color = '#000', style }: IconProps) => (
  <Ionicons name="medal" size={size} color={color} style={style} />
);

export const Crown = ({ size = 24, color = '#000', style }: IconProps) => (
  <MaterialCommunityIcons name="crown" size={size} color={color} style={style} />
);

export const Zap = ({ size = 24, color = '#000', style }: IconProps) => (
  <Ionicons name="flash" size={size} color={color} style={style} />
);

export const Shield = ({ size = 24, color = '#000', style }: IconProps) => (
  <Ionicons name="shield" size={size} color={color} style={style} />
);

export const Coins = ({ size = 24, color = '#000', style }: IconProps) => (
  <MaterialCommunityIcons name="currency-usd" size={size} color={color} style={style} />
);

export const Sparkles = ({ size = 24, color = '#000', style }: IconProps) => (
  <MaterialCommunityIcons name="star" size={size} color={color} style={style} />
);

// Additional icons used in other components
export const Volume2 = ({ size = 24, color = '#000', style }: IconProps) => (
  <Ionicons name="volume-high" size={size} color={color} style={style} />
);

export const VolumeX = ({ size = 24, color = '#000', style }: IconProps) => (
  <Ionicons name="volume-mute" size={size} color={color} style={style} />
);

export const Pause = ({ size = 24, color = '#000', style }: IconProps) => (
  <Ionicons name="pause" size={size} color={color} style={style} />
);

export const RotateCcw = ({ size = 24, color = '#000', style }: IconProps) => (
  <Ionicons name="refresh" size={size} color={color} style={style} />
);

export const ChevronRight = ({ size = 24, color = '#000', style }: IconProps) => (
  <Ionicons name="chevron-forward" size={size} color={color} style={style} />
);

export const ChevronLeft = ({ size = 24, color = '#000', style }: IconProps) => (
  <Ionicons name="chevron-back" size={size} color={color} style={style} />
);

export const Eye = ({ size = 24, color = '#000', style }: IconProps) => (
  <Ionicons name="eye" size={size} color={color} style={style} />
);

export const EyeOff = ({ size = 24, color = '#000', style }: IconProps) => (
  <Ionicons name="eye-off" size={size} color={color} style={style} />
);

export const EyeOffIcon = ({ size = 24, color = '#000', style }: IconProps) => (
  <Ionicons name="eye-off" size={size} color={color} style={style} />
);

export const Mic = ({ size = 24, color = '#000', style }: IconProps) => (
  <Ionicons name="mic" size={size} color={color} style={style} />
);

export const MicOff = ({ size = 24, color = '#000', style }: IconProps) => (
  <Ionicons name="mic-off" size={size} color={color} style={style} />
);

export const BookOpen = ({ size = 24, color = '#000', style }: IconProps) => (
  <Ionicons name="book-outline" size={size} color={color} style={style} />
);

export const Brain = ({ size = 24, color = '#000', style }: IconProps) => (
  <MaterialCommunityIcons name="brain" size={size} color={color} style={style} />
);

export const Headphones = ({ size = 24, color = '#000', style }: IconProps) => (
  <Ionicons name="headset" size={size} color={color} style={style} />
);

export const MessageSquare = ({ size = 24, color = '#000', style }: IconProps) => (
  <Ionicons name="chatbubble" size={size} color={color} style={style} />
);

export const ThumbsUp = ({ size = 24, color = '#000', style }: IconProps) => (
  <Ionicons name="thumbs-up" size={size} color={color} style={style} />
);

export const ThumbsDown = ({ size = 24, color = '#000', style }: IconProps) => (
  <Ionicons name="thumbs-down" size={size} color={color} style={style} />
);

export const BarChart3 = ({ size = 24, color = '#000', style }: IconProps) => (
  <Ionicons name="bar-chart" size={size} color={color} style={style} />
);

export const TrendingUp = ({ size = 24, color = '#000', style }: IconProps) => (
  <Ionicons name="trending-up" size={size} color={color} style={style} />
);

export const Download = ({ size = 24, color = '#000', style }: IconProps) => (
  <Ionicons name="download" size={size} color={color} style={style} />
);

export const DownloadIcon = ({ size = 24, color = '#000', style }: IconProps) => (
  <Ionicons name="download" size={size} color={color} style={style} />
);

export const Upload = ({ size = 24, color = '#000', style }: IconProps) => (
  <Ionicons name="cloud-upload" size={size} color={color} style={style} />
);

export const Wifi = ({ size = 24, color = '#000', style }: IconProps) => (
  <Ionicons name="wifi" size={size} color={color} style={style} />
);

export const WifiOff = ({ size = 24, color = '#000', style }: IconProps) => (
  <MaterialCommunityIcons name="wifi-off" size={size} color={color} style={style} />
);

export const Activity = ({ size = 24, color = '#000', style }: IconProps) => (
  <Ionicons name="pulse" size={size} color={color} style={style} />
);

export const Database = ({ size = 24, color = '#000', style }: IconProps) => (
  <MaterialCommunityIcons name="database" size={size} color={color} style={style} />
);

export const Server = ({ size = 24, color = '#000', style }: IconProps) => (
  <MaterialCommunityIcons name="server" size={size} color={color} style={style} />
);

export const Monitor = ({ size = 24, color = '#000', style }: IconProps) => (
  <Ionicons name="desktop" size={size} color={color} style={style} />
);

export const Smartphone = ({ size = 24, color = '#000', style }: IconProps) => (
  <Ionicons name="phone-portrait" size={size} color={color} style={style} />
);

export const Plus = ({ size = 24, color = '#000', style }: IconProps) => (
  <Ionicons name="add" size={size} color={color} style={style} />
);


export const Minus = ({ size = 24, color = '#000', style }: IconProps) => (
  <Ionicons name="remove" size={size} color={color} style={style} />
);

export const Search = ({ size = 24, color = '#000', style }: IconProps) => (
  <Ionicons name="search" size={size} color={color} style={style} />
);

export const Filter = ({ size = 24, color = '#000', style }: IconProps) => (
  <Ionicons name="funnel" size={size} color={color} style={style} />
);

export const MoreHorizontal = ({ size = 24, color = '#000', style }: IconProps) => (
  <Ionicons name="ellipsis-horizontal" size={size} color={color} style={style} />
);

export const MoreVertical = ({ size = 24, color = '#000', style }: IconProps) => (
  <Ionicons name="ellipsis-vertical" size={size} color={color} style={style} />
);

export const Check = ({ size = 24, color = '#000', style }: IconProps) => (
  <Ionicons name="checkmark" size={size} color={color} style={style} />
);

export const HelpCircle = ({ size = 24, color = '#000', style }: IconProps) => (
  <Ionicons name="help-circle" size={size} color={color} style={style} />
);

export const ArrowRight = ({ size = 24, color = '#000', style }: IconProps) => (
  <Ionicons name="arrow-forward" size={size} color={color} style={style} />
);

export const Volume = ({ size = 24, color = '#000', style }: IconProps) => (
  <Ionicons name="volume-medium" size={size} color={color} style={style} />
);

export const Repeat = ({ size = 24, color = '#000', style }: IconProps) => (
  <Ionicons name="repeat" size={size} color={color} style={style} />
);

export const ArrowUp = ({ size = 24, color = '#000', style }: IconProps) => (
  <Ionicons name="arrow-up" size={size} color={color} style={style} />
);

export const ArrowDown = ({ size = 24, color = '#000', style }: IconProps) => (
  <Ionicons name="arrow-down" size={size} color={color} style={style} />
);

export const FileText = ({ size = 24, color = '#000', style }: IconProps) => (
  <Ionicons name="document-text" size={size} color={color} style={style} />
);

export const FileTextIcon = ({ size = 24, color = '#000', style }: IconProps) => (
  <Ionicons name="document-text" size={size} color={color} style={style} />
);

export const Image = ({ size = 24, color = '#000', style }: IconProps) => (
  <Ionicons name="image" size={size} color={color} style={style} />
);

export const Camera = ({ size = 24, color = '#000', style }: IconProps) => (
  <Ionicons name="camera" size={size} color={color} style={style} />
);

export const Shuffle = ({ size = 24, color = '#000', style }: IconProps) => (
  <Ionicons name="shuffle" size={size} color={color} style={style} />
);

export const RefreshCw = ({ size = 24, color = '#000', style }: IconProps) => (
  <Ionicons name="refresh" size={size} color={color} style={style} />
);

export const ChevronUp = ({ size = 24, color = '#000', style }: IconProps) => (
  <Ionicons name="chevron-up" size={size} color={color} style={style} />
);

export const ChevronDown = ({ size = 24, color = '#000', style }: IconProps) => (
  <Ionicons name="chevron-down" size={size} color={color} style={style} />
);

export const Save = ({ size = 24, color = '#000', style }: IconProps) => (
  <Ionicons name="save" size={size} color={color} style={style} />
);

export const Trash2 = ({ size = 24, color = '#000', style }: IconProps) => (
  <Ionicons name="trash" size={size} color={color} style={style} />
);

export const Edit = ({ size = 24, color = '#000', style }: IconProps) => (
  <Ionicons name="create" size={size} color={color} style={style} />
);

export const Bug = ({ size = 24, color = '#000', style }: IconProps) => (
  <MaterialCommunityIcons name="bug" size={size} color={color} style={style} />
);

export const Inbox = ({ size = 24, color = '#000', style }: IconProps) => (
  <Ionicons name="mail" size={size} color={color} style={style} />
);

export const MessageCircle = ({ size = 24, color = '#000', style }: IconProps) => (
  <Ionicons name="chatbubble" size={size} color={color} style={style} />
);

export const XCircle = ({ size = 24, color = '#000', style }: IconProps) => (
  <Ionicons name="close-circle" size={size} color={color} style={style} />
);

export const TestTube = ({ size = 24, color = '#000', style }: IconProps) => (
  <MaterialIcons name="science" size={size} color={color} style={style} />
);

export const TrendingDown = ({ size = 24, color = '#000', style }: IconProps) => (
  <Ionicons name="trending-down" size={size} color={color} style={style} />
);

export const LogOut = ({ size = 24, color = '#000', style }: IconProps) => (
  <Ionicons name="log-out" size={size} color={color} style={style} />
);

export const Share = ({ size = 24, color = '#000', style }: IconProps) => (
  <Ionicons name="share" size={size} color={color} style={style} />
);

export const Bell = ({ size = 24, color = '#000', style }: IconProps) => (
  <Ionicons name="notifications" size={size} color={color} style={style} />
);

export const UserPlus = ({ size = 24, color = '#000', style }: IconProps) => (
  <Ionicons name="person-add" size={size} color={color} style={style} />
);

export const UserMinus = ({ size = 24, color = '#000', style }: IconProps) => (
  <Ionicons name="person-remove" size={size} color={color} style={style} />
);

export const Trash = ({ size = 24, color = '#000', style }: IconProps) => (
  <Ionicons name="trash" size={size} color={color} style={style} />
);

export const Send = ({ size = 24, color = '#000', style }: IconProps) => (
  <Ionicons name="send" size={size} color={color} style={style} />
);

export const CheckCheck = ({ size = 24, color = '#000', style }: IconProps) => (
  <Ionicons name="checkmark-done" size={size} color={color} style={style} />
);

export const Cpu = ({ size = 24, color = '#000', style }: IconProps) => (
  <MaterialIcons name="memory" size={size} color={color} style={style} />
);

export const HardDrive = ({ size = 24, color = '#000', style }: IconProps) => (
  <MaterialIcons name="storage" size={size} color={color} style={style} />
);

// Additional missing icon definitions
export const Palette = ({ size = 24, color = '#000', style }: IconProps) => (
  <MaterialIcons name="palette" size={size} color={color} style={style} />
);

export const Theater = ({ size = 24, color = '#000', style }: IconProps) => (
  <MaterialIcons name="theater-comedy" size={size} color={color} style={style} />
);

export const Script = ({ size = 24, color = '#000', style }: IconProps) => (
  <MaterialIcons name="description" size={size} color={color} style={style} />
);

export const Music = ({ size = 24, color = '#000', style }: IconProps) => (
  <MaterialIcons name="music-note" size={size} color={color} style={style} />
);

export const Waveform = ({ size = 24, color = '#000', style }: IconProps) => (
  <MaterialIcons name="graphic-eq" size={size} color={color} style={style} />
);

export const Vibrate = ({ size = 24, color = '#000', style }: IconProps) => (
  <MaterialIcons name="vibration" size={size} color={color} style={style} />
);

export const Ear = ({ size = 24, color = '#000', style }: IconProps) => (
  <MaterialIcons name="hearing" size={size} color={color} style={style} />
);

export const Hand = ({ size = 24, color = '#000', style }: IconProps) => (
  <MaterialIcons name="pan-tool" size={size} color={color} style={style} />
);

export const ZoomIn = ({ size = 24, color = '#000', style }: IconProps) => (
  <MaterialIcons name="zoom-in" size={size} color={color} style={style} />
);

export const ZoomOut = ({ size = 24, color = '#000', style }: IconProps) => (
  <MaterialIcons name="zoom-out" size={size} color={color} style={style} />
);

export const Contrast = ({ size = 24, color = '#000', style }: IconProps) => (
  <MaterialIcons name="contrast" size={size} color={color} style={style} />
);

export const Type = ({ size = 24, color = '#000', style }: IconProps) => (
  <MaterialIcons name="text-fields" size={size} color={color} style={style} />
);

export const Mouse = ({ size = 24, color = '#000', style }: IconProps) => (
  <MaterialIcons name="mouse" size={size} color={color} style={style} />
);

export const Keyboard = ({ size = 24, color = '#000', style }: IconProps) => (
  <MaterialIcons name="keyboard" size={size} color={color} style={style} />
);

export const Accessibility = ({ size = 24, color = '#000', style }: IconProps) => (
  <MaterialIcons name="accessibility" size={size} color={color} style={style} />
);

export const Gauge = ({ size = 24, color = '#000', style }: IconProps) => (
  <MaterialIcons name="speed" size={size} color={color} style={style} />
);

export const Memory = ({ size = 24, color = '#000', style }: IconProps) => (
  <MaterialIcons name="memory" size={size} color={color} style={style} />
);

export const LineChart = ({ size = 24, color = '#000', style }: IconProps) => (
  <MaterialIcons name="show-chart" size={size} color={color} style={style} />
);

export const PieChart = ({ size = 24, color = '#000', style }: IconProps) => (
  <MaterialIcons name="pie-chart" size={size} color={color} style={style} />
);

export const Share2 = ({ size = 24, color = '#000', style }: IconProps) => (
  <MaterialIcons name="share" size={size} color={color} style={style} />
);

// Additional missing icon definitions
export const Bookmark = ({ size = 24, color = '#000', style }: IconProps) => (
  <MaterialIcons name="bookmark" size={size} color={color} style={style} />
);








export const Languages = ({ size = 24, color = '#000', style }: IconProps) => (
  <MaterialIcons name="language" size={size} color={color} style={style} />
);

export const Lightbulb = ({ size = 24, color = '#000', style }: IconProps) => (
  <MaterialIcons name="lightbulb" size={size} color={color} style={style} />
);

export const Timer = ({ size = 24, color = '#000', style }: IconProps) => (
  <MaterialIcons name="timer" size={size} color={color} style={style} />
);

// Export icons with "Icon" suffix for compatibility
export const LightbulbIcon = ({ size = 24, color = '#000', style }: IconProps) => (
  <Ionicons name="bulb" size={size} color={color} style={style} />
);

export const TargetIcon = Target;
export const TrendingUpIcon = TrendingUp;
export const StarIcon = Star;
export const PlayIcon = Play;
export const PauseIcon = Pause;
export const Volume2Icon = Volume2;
export const BookOpenIcon = BookOpen;
export const ClockIcon = Clock;
export const AwardIcon = Award;
export const CheckIcon = Check;
export const ArrowRightIcon = ArrowRight;
export const RotateCcwIcon = RotateCcw;
export const XIcon = X;
export const AlertCircleIcon = AlertCircle;
export const ArrowLeftIcon = ArrowLeft;
export const SendIcon = Send;
export const SmileIcon = ({ size = 24, color = '#000', style }: IconProps) => (
  <Ionicons name="happy" size={size} color={color} style={style} />
);
export const ImageIcon = Image;
export const MicIcon = Mic;
export const PhoneIcon = ({ size = 24, color = '#000', style }: IconProps) => (
  <Ionicons name="call" size={size} color={color} style={style} />
);
export const VideoIcon = ({ size = 24, color = '#000', style }: IconProps) => (
  <Ionicons name="videocam" size={size} color={color} style={style} />
);
export const MoreVerticalIcon = MoreVertical;
export const CheckCheckIcon = CheckCheck;
export const UserIcon = User;
export const MessageCircleIcon = MessageCircle;
export const TrophyIcon = Trophy;
export const ZapIcon = Zap;
export const PlusIcon = Plus;
export const MicOffIcon = MicOff;
export const VolumeXIcon = VolumeX;
export const HeadphonesIcon = Headphones;
export const TrendingDownIcon = TrendingDown;
export const BarChart3Icon = BarChart3;

// Additional missing icons
export const CameraIcon = Camera;
export const PaletteIcon = Palette;
export const SaveIcon = Save;
export const CrownIcon = Crown;
export const GemIcon = Gem;
export const HeartIcon = Heart;
export const FlameIcon = Flame;
export const CalendarIcon = Calendar;
export const UsersIcon = Users;
export const RepeatIcon = Repeat;
export const TheaterIcon = Theater;
export const ScriptIcon = Script;
export const MusicIcon = Music;
export const WaveformIcon = Waveform;
export const ActivityIcon = Activity;
export const VolumeIcon = Volume2;
export const ShuffleIcon = Shuffle;
export const ShareIcon = Share;
export const SearchIcon = Search;
export const FilterIcon = Filter;
export const LockIcon = Lock;
export const SettingsIcon = Settings;
export const GlobeIcon = Globe;
export const BellIcon = Bell;
export const VibrateIcon = Vibrate;
export const SmartphoneIcon = Smartphone;
export const EyeIcon = Eye;
export const EarIcon = Ear;
export const HandIcon = Hand;
export const BrainIcon = Brain;
export const CheckCircleIcon = CheckCircle;
export const InfoIcon = Info;
export const ZoomInIcon = ZoomIn;
export const ZoomOutIcon = ZoomOut;
export const ContrastIcon = Contrast;
export const TextIcon = Type;
export const MouseIcon = Mouse;
export const KeyboardIcon = Keyboard;
export const VoiceIcon = Mic;
export const AccessibilityIcon = Accessibility;
export const HelpCircleIcon = HelpCircle;
export const ChevronRightIcon = ChevronRight;
export const ChevronDownIcon = ChevronDown;
export const GaugeIcon = Gauge;
export const MemoryIcon = Memory;
export const RefreshCwIcon = RefreshCw;
export const LineChartIcon = LineChart;
export const PieChartIcon = PieChart;
export const Share2Icon = Share2;

// Additional missing icons
export const MedalIcon = Award;
export const BookmarkIcon = Bookmark;
export const MessageSquareIcon = MessageSquare;
export const ThumbsUpIcon = ThumbsUp;
export const ThumbsDownIcon = ThumbsDown;
export const ArrowUpIcon = ArrowUp;
export const ArrowDownIcon = ArrowDown;
export const MinusIcon = Minus;
export const EditIcon = Edit;
export const TrashIcon = Trash;
export const LanguagesIcon = Languages;
export const TimerIcon = Timer;
export const BeatIcon = Heart;

// Export all icons as a default object for easy importing
export default {
  Home,
  User,
  Trophy,
  ShoppingBag,
  Heart,
  Flame,
  Gem,
  Lock,
  Globe,
  Star,
  Settings,
  ArrowLeft,
  Mail,
  MailIcon,
  Github,
  Apple,
  X,
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  Info,
  Award,
  Calendar,
  Target,
  Play,
  Clock,
  Users,
  Medal,
  Crown,
  Zap,
  Shield,
  Coins,
  Sparkles,
  Volume2,
  VolumeX,
  Pause,
  RotateCcw,
  ChevronRight,
  ChevronLeft,
  Eye,
  EyeOff,
  EyeOffIcon,
  Mic,
  MicOff,
  BookOpen,
  Brain,
  Headphones,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  BarChart3,
  TrendingUp,
  Download,
  DownloadIcon,
  Upload,
  Wifi,
  WifiOff,
  Activity,
  Database,
  Server,
  Monitor,
  Smartphone,
  Plus,
  Minus,
  Search,
  Filter,
  MoreHorizontal,
  MoreVertical,
  Check,
  HelpCircle,
  ArrowRight,
  Volume,
  Repeat,
  ArrowUp,
  ArrowDown,
  FileText,
  FileTextIcon,
  Image,
  Camera,
  Shuffle,
  RefreshCw,
  ChevronUp,
  ChevronDown,
  Bug,
  Inbox,
  MessageCircle,
  XCircle,
  Cpu,
  HardDrive,
};
