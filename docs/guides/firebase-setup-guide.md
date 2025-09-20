# Firebase Setup Guide for LinguApp

## Quick Fix for Current Error

The Firebase error you're seeing occurs because the app is trying to initialize Firebase without proper configuration. Here's how to fix it:

### Option 1: Use Mock Services (Immediate Fix)
The app will automatically use mock services when Firebase environment variables are not configured. This allows you to continue development without Firebase setup.

### Option 2: Set Up Firebase (Recommended for Production)

1. **Create a Firebase Project**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Click "Create a project" or use an existing project
   - Enable the services you need: Authentication, Firestore, Storage, Functions

2. **Get Your Configuration**
   - In your Firebase project, go to Project Settings (gear icon)
   - Scroll down to "Your apps" section
   - Click on the web app icon `</>` to create a web app
   - Copy the configuration object

3. **Set Environment Variables**
   - Copy `.env.example` to `.env`
   - Fill in your Firebase configuration values:

   ```env
   EXPO_PUBLIC_FIREBASE_API_KEY=your_actual_api_key
   EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
   EXPO_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef
   ```

4. **Enable Firebase Services**
   - **Authentication**: Enable Email/Password, Google, Apple sign-in methods
   - **Firestore**: Create database in production mode
   - **Storage**: Set up storage bucket
   - **Functions**: Deploy cloud functions if needed

5. **Configure Security Rules**
   
   **Firestore Rules:**
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       // Users can read/write their own data
       match /users/{userId} {
         allow read, write: if request.auth != null && request.auth.uid == userId;
       }
       
       // User progress data
       match /userProgress/{userId}/{document=**} {
         allow read, write: if request.auth != null && request.auth.uid == userId;
       }
       
       // Reviews data
       match /reviews/{userId}/{document=**} {
         allow read, write: if request.auth != null && request.auth.uid == userId;
       }
       
       // Public word data (read-only for users)
       match /words/{language}/{document=**} {
         allow read: if request.auth != null;
         allow write: if request.auth != null && 
           resource.data.admin == true; // Only admins can write
       }
     }
   }
   ```

   **Storage Rules:**
   ```javascript
   rules_version = '2';
   service firebase.storage {
     match /b/{bucket}/o {
       // User profile images
       match /users/{userId}/profile/{allPaths=**} {
         allow read, write: if request.auth != null && request.auth.uid == userId;
       }
       
       // Public content (read-only)
       match /content/{allPaths=**} {
         allow read: if request.auth != null;
         allow write: if request.auth != null && 
           request.auth.token.admin == true;
       }
     }
   }
   ```

## Current App Behavior

- **Without Firebase Config**: App uses mock services, all data is local/temporary
- **With Firebase Config**: App connects to your Firebase project for real data persistence
- **Development Mode**: Automatically detected, provides additional logging
- **Error Handling**: Graceful fallback to mock services if Firebase fails

## Testing Your Setup

1. Check the console logs when the app starts
2. Look for: `Firebase Config Status: { hasConfig: true, ... }`
3. Successful setup shows: `Firebase initialized successfully`
4. Mock mode shows: `No Firebase configuration found, using mock services`

## Troubleshooting

- **Invalid API Key**: Double-check your `.env` file values
- **Project Not Found**: Verify `EXPO_PUBLIC_FIREBASE_PROJECT_ID`
- **Permission Denied**: Check Firestore security rules
- **Network Issues**: Ensure internet connection and Firebase services are enabled

The app is designed to work in both modes, so you can continue development while setting up Firebase.