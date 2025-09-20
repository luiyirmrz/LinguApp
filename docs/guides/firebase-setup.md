# Firebase Setup Instructions for LinguApp

This guide will help you set up Firebase for your LinguApp project with all the necessary services.

## 1. Firebase Console Setup

### Create a Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Enter project name: `linguapp-production` (or your preferred name)
4. Enable Google Analytics (recommended)
5. Choose or create a Google Analytics account
6. Click "Create project"

### Enable Authentication
1. In the Firebase console, go to **Authentication** > **Sign-in method**
2. Enable the following providers:
   - **Email/Password**: Enable and allow users to create accounts
   - **Google**: Enable and configure OAuth consent screen
   - **Apple**: Enable (for iOS/macOS support)
   - **GitHub**: Enable and add OAuth app credentials

### Set up Firestore Database
1. Go to **Firestore Database** > **Create database**
2. Choose **Start in test mode** (we'll configure security rules later)
3. Select a location close to your users
4. Click "Done"

### Configure Storage
1. Go to **Storage** > **Get started**
2. Start in test mode
3. Choose the same location as Firestore
4. Click "Done"

### Set up Remote Config
1. Go to **Remote Config** > **Create configuration**
2. Add the following parameters with default values:
   ```
   xpPerWord: 10
   xpPerReview: 5
   xpPerLesson: 50
   cefrA1Threshold: 500
   cefrA2Threshold: 1000
   cefrB1Threshold: 2000
   cefrB2Threshold: 3500
   cefrC1Threshold: 5500
   cefrC2Threshold: 8000
   maxHeartsPerDay: 5
   heartRefillTimeMinutes: 30
   streakFreezeEnabled: true
   doubleXPEnabled: true
   ```
3. Click "Publish changes"

### Enable Analytics and Performance
1. **Analytics**: Already enabled if you chose it during project creation
2. **Performance Monitoring**: Go to **Performance** > **Get started**

## 2. Environment Variables Setup

Create a `.env` file in your project root with your Firebase configuration:

```env
# Firebase Configuration
EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key_here
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

### Get Firebase Configuration
1. In Firebase Console, go to **Project Settings** (gear icon)
2. Scroll down to "Your apps" section
3. Click "Add app" and choose **Web** (</>) 
4. Register your app with nickname "LinguApp Web"
5. Copy the configuration values to your `.env` file

### For Mobile Apps (Optional)
If you want to deploy to mobile:
1. Add **Android app**: Download `google-services.json`
2. Add **iOS app**: Download `GoogleService-Info.plist`
3. Place these files in your project as per Expo documentation

## 3. Firestore Security Rules

Replace the default Firestore rules with these secure rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // User progress - users can read/write their own progress
    match /userProgress/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // SRS items - users can read/write their own SRS data
    match /srsItems/{itemId} {
      allow read, write: if request.auth != null && 
        resource.data.userId == request.auth.uid;
    }
    
    // Analytics - users can write their own analytics
    match /analytics/{analyticsId} {
      allow create: if request.auth != null && 
        request.resource.data.userId == request.auth.uid;
      allow read: if request.auth != null && 
        resource.data.userId == request.auth.uid;
    }
    
    // Challenges - users can read/write challenges they're part of
    match /challenges/{challengeId} {
      allow read, write: if request.auth != null && 
        (resource.data.challengerId == request.auth.uid || 
         resource.data.challengedId == request.auth.uid);
    }
    
    // Leaderboards - read-only for authenticated users
    match /leaderboards/{leaderboardId} {
      allow read: if request.auth != null;
    }
    
    // Public content (lessons, vocabulary) - read-only
    match /lessons/{lessonId} {
      allow read: if true;
    }
    
    match /vocabulary/{vocabId} {
      allow read: if true;
    }
    
    match /languages/{languageId} {
      allow read: if true;
    }
  }
}
```

## 4. Storage Security Rules

Set up Storage security rules:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // User profile images
    match /users/{userId}/profile/{fileName} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Audio files for lessons (public read)
    match /audio/{allPaths=**} {
      allow read: if true;
      allow write: if false; // Only admins can upload via console
    }
    
    // Images for lessons (public read)
    match /images/{allPaths=**} {
      allow read: if true;
      allow write: if false; // Only admins can upload via console
    }
  }
}
```

## 5. Development vs Production

The app automatically detects if Firebase is configured:

- **Development Mode**: Uses mock services when `EXPO_PUBLIC_FIREBASE_API_KEY` is not set
- **Production Mode**: Uses real Firebase when environment variables are configured

### Testing with Mock Data
For development without Firebase:
1. Don't set the environment variables
2. The app will use local storage and mock authentication
3. Demo accounts are automatically created:
   - `demo@localhost.dev` / `DemoPass123!`
   - `test1@localhost.dev` / `TestPass123!`
   - `user@example.com` / `example123`

## 6. Optional: Cloud Functions

For advanced features, you can deploy Cloud Functions:

```bash
npm install -g firebase-tools
firebase login
firebase init functions
```

Example functions you might want:
- User cleanup on account deletion
- Leaderboard calculations
- Push notifications
- Content moderation

## 7. Monitoring and Analytics

### Set up Crashlytics (Mobile)
1. In Firebase Console, go to **Crashlytics**
2. Follow the setup guide for React Native

### Performance Monitoring
Already configured in the app for web. For mobile, add the SDK.

### Analytics Events
The app automatically tracks:
- User sign-ups and logins
- Lesson completions
- XP gains
- Streak updates
- Purchase events

## 8. Backup and Security

### Regular Backups
1. Set up automated Firestore backups
2. Export user data regularly
3. Monitor usage and costs

### Security Checklist
- [ ] Environment variables are secure
- [ ] Firestore rules are restrictive
- [ ] Storage rules prevent unauthorized uploads
- [ ] Authentication providers are properly configured
- [ ] API keys are restricted to your domains
- [ ] Regular security audits

## Troubleshooting

### Common Issues
1. **"Firebase not configured"**: Check environment variables
2. **Permission denied**: Review Firestore security rules
3. **Auth errors**: Verify provider configuration
4. **Network errors**: Check internet connection and Firebase status

### Debug Mode
Set `__DEV__ = true` to enable detailed logging and mock services.

### Support
- Firebase Documentation: https://firebase.google.com/docs
- React Native Firebase: https://rnfirebase.io/
- Expo Firebase: https://docs.expo.dev/guides/using-firebase/

---

Your LinguApp is now ready for production with Firebase! 🚀