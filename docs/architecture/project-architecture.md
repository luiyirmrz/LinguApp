# LinguApp - Scalable Language Learning Platform

## Project Architecture Overview

This is a comprehensive React Native + Firebase language learning platform built with TypeScript, featuring gamification, adaptive learning, social features, and immersive experiences.

## 📁 Project Structure

```
linguapp/
├── 📁 app/                          # Expo Router file-based routing
│   ├── 📁 (auth)/                   # Authentication flow (grouped route)
│   │   ├── _layout.tsx              # Auth layout wrapper
│   │   ├── welcome.tsx              # Welcome/onboarding screen
│   │   ├── signin.tsx               # Enhanced sign in with social login
│   │   └── signup.tsx               # Sign up screen
│   ├── 📁 (tabs)/                   # Main app tabs (grouped route)
│   │   ├── _layout.tsx              # Tab navigation layout
│   │   ├── home.tsx                 # Dashboard/home screen
│   │   ├── profile.tsx              # User profile & settings
│   │   ├── leaderboard.tsx          # Social leaderboards
│   │   └── shop.tsx                 # In-app purchases & rewards
│   ├── _layout.tsx                  # Root layout with providers
│   ├── index.tsx                    # App entry point
│   └── lesson.tsx                   # Lesson screen (modal)
│
├── 📁 components/                   # Reusable UI components
│   ├── Button.tsx                   # Enhanced button component
│   ├── ProgressBar.tsx              # Progress visualization
│   ├── LanguageSelector.tsx         # Language selection UI
│   └── MainLanguageSelector.tsx     # Main UI language selector
│
├── 📁 config/                       # Configuration files
│   └── firebase.ts                  # Firebase initialization & config
│
├── 📁 services/                     # Business logic & API services
│   ├── auth.ts                      # Firebase authentication service
│   ├── database.ts                  # Firestore database operations
│   ├── spacedRepetition.ts          # SRS algorithm implementation
│   └── gamification.ts              # XP, achievements, leaderboards
│
├── 📁 hooks/                        # Custom React hooks
│   ├── useAuth.tsx                  # Enhanced authentication hook
│   ├── useGameState.tsx             # Game state management
│   ├── useGamification.tsx          # Gamification features
│   ├── useSpacedRepetition.tsx      # SRS learning system
│   ├── useMultilingualLearning.tsx  # Multilingual lesson management
│   └── useLanguageLearning.tsx      # Core learning logic
│
├── 📁 types/                        # TypeScript type definitions
│   └── index.ts                     # Comprehensive type system
│
├── 📁 constants/                    # App constants & configuration
│   ├── colors.ts                    # Color palette
│   └── theme.ts                     # Design system theme
│
├── 📁 mocks/                        # Mock data & content generators
│   ├── languages.ts                 # Supported languages data
│   ├── skills.ts                    # Skill definitions
│   ├── shopItems.ts                 # Shop items & rewards
│   ├── lessonContent.ts             # Sample lesson content
│   ├── vocabularyDatabase.ts        # Vocabulary management
│   ├── lessonFramework.ts           # Lesson structure framework
│   ├── lessonContentGenerator.ts    # Dynamic content generation
│   ├── lessonContentManager.ts      # Content management system
│   └── multilingualLessonFramework.ts # Multilingual support
│
├── 📁 levels/                       # CEFR level content organization
│   └── 📁 A1/                       # Beginner level content
│       └── croatian-a1-lessons.ts   # Croatian A1 lessons
│
└── 📁 docs/                         # Documentation
    ├── multilingual-framework.md    # Multilingual system docs
    ├── implementation-summary.md    # Implementation guide
    └── multilingual-framework-summary.md # Framework overview
```

## 🏗️ Architecture Components

### 1. **Authentication System** (`services/auth.ts`, `hooks/useAuth.tsx`)
- **Firebase Authentication** with email/password, Google, GitHub, Apple
- **Social Login Integration** using Expo AuthSession
- **User Profile Management** with Firestore persistence
- **Session Management** with automatic state synchronization
- **Password Reset** and email verification
- **Error Handling** with user-friendly messages

### 2. **Multilingual Framework** (`types/index.ts`, `hooks/useMultilingualLearning.tsx`)
- **Dynamic UI Language** switching (English, Spanish, French, Italian, Croatian, Chinese)
- **Target Language Learning** with progress tracking per language
- **CEFR Level Support** (A1-C2) with structured progression
- **Vocabulary Management** with spaced repetition integration
- **Grammar Concepts** with multilingual explanations
- **Cultural Context** learning scenarios

### 3. **Gamification System** (`services/gamification.ts`, `hooks/useGamification.tsx`)
- **XP & Level System** with dynamic progression
- **Streak Tracking** with daily practice rewards
- **Achievement System** with unlockable badges
- **Leaderboards** (global, friends, weekly competitions)
- **Virtual Currency** (coins, gems, hearts)
- **Daily/Weekly Challenges** with adaptive difficulty

### 4. **Adaptive Learning** (`services/spacedRepetition.ts`, `hooks/useSpacedRepetition.tsx`)
- **Spaced Repetition System** (SRS) for vocabulary retention
- **Performance Tracking** with mistake analysis
- **Difficulty Adjustment** based on user performance
- **Review Scheduling** with optimal intervals
- **Weak Area Identification** and targeted practice
- **Learning Analytics** with progress insights

### 5. **Lesson System** (`mocks/lessonFramework.ts`, `levels/`)
- **Modular Lesson Structure** with reusable components
- **Exercise Types**: matching, fill-in-blank, listening, speaking, reading, writing
- **Interactive Games**: word-image matching, sentence building, pronunciation challenges
- **Media Integration**: audio, images, video placeholders
- **Progress Tracking** with completion criteria
- **Adaptive Review** integration

### 6. **Social Features** (planned in types)
- **Friend System** with friend requests and connections
- **1v1 Challenges** with real-time competition
- **Chat Practice** with language exchange
- **Group Learning** with study circles
- **Progress Sharing** and motivation features

## 🔧 Technical Stack

### **Frontend**
- **React Native** 0.79.1 with Expo 53
- **TypeScript** for type safety and developer experience
- **Expo Router** for file-based navigation
- **React Query** for server state management
- **@nkzw/create-context-hook** for local state management

### **Backend & Services**
- **Firebase Authentication** for user management
- **Firestore** for real-time database
- **Firebase Cloud Functions** for server-side logic
- **Firebase Analytics** for usage tracking
- **Expo AuthSession** for social login

### **Development Tools**
- **TypeScript** strict mode for type checking
- **ESLint** for code quality
- **Expo CLI** for development and building
- **React Native Web** for web compatibility

## 🚀 Key Features Implemented

### ✅ **Authentication & User Management**
- Multi-provider social login (Google, GitHub, Apple)
- Secure user profile management with Firestore
- Password reset and email verification
- Session persistence and automatic login

### ✅ **Multilingual Support**
- Dynamic UI language switching
- Comprehensive type system for multilingual content
- Language progress tracking per target language
- Cultural context integration

### ✅ **Gamification**
- XP and level progression system
- Streak tracking with daily rewards
- Virtual currency management (hearts, gems, coins)
- Achievement system framework

### ✅ **Learning Framework**
- CEFR-compliant lesson structure
- Spaced repetition system for vocabulary
- Adaptive difficulty adjustment
- Progress tracking and analytics

### ✅ **Mobile-First Design**
- Safe area handling for all device types
- Responsive layouts for different screen sizes
- Platform-specific optimizations (iOS/Android/Web)
- Accessibility considerations

## 🔄 Data Flow Architecture

```
User Authentication → Firebase Auth → User Profile (Firestore)
                                   ↓
Lesson Progress → Local State → Firestore Sync → Analytics
                     ↓
Gamification → XP/Achievements → Leaderboards → Social Features
                     ↓
SRS Algorithm → Review Schedule → Adaptive Learning → Performance Tracking
```

## 📱 Screen Flow

```
Welcome → Sign In/Up → Language Selection → Home Dashboard
                                              ↓
Lesson Selection → Lesson Exercises → Progress Update → Review Schedule
                                              ↓
Profile → Settings → Language Switch → Social Features → Shop
```

## 🔐 Security & Privacy

- **Firebase Security Rules** for data protection
- **User Data Encryption** in transit and at rest
- **Privacy-First Design** with minimal data collection
- **GDPR Compliance** considerations
- **Secure Authentication** with industry standards

## 📈 Scalability Considerations

- **Modular Architecture** for easy feature additions
- **Type-Safe Development** reducing runtime errors
- **Efficient State Management** with React Query caching
- **Offline Support** with local data persistence
- **Performance Optimization** with React.memo and useMemo

## 🎯 Next Steps for Full Implementation

1. **Complete Lesson Content Generation** for all languages and levels
2. **Implement Real-time Social Features** with WebSocket connections
3. **Add Speech Recognition** for pronunciation assessment
4. **Integrate AI-Powered** content generation and personalization
5. **Implement Offline Mode** with full lesson caching
6. **Add Analytics Dashboard** for learning insights
7. **Create Admin Panel** for content management
8. **Implement Push Notifications** for engagement
9. **Add Subscription System** for premium features
10. **Optimize Performance** for large-scale deployment

This architecture provides a solid foundation for a world-class language learning application that can scale to millions of users while maintaining excellent performance and user experience.