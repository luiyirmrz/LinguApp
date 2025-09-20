# Firebase Connection Troubleshooting Guide

## Overview
This guide helps resolve the "Could not reach Cloud Firestore backend" error that occurs when your app cannot connect to Firebase services.

## Common Errors and Solutions

### 1. **CRITICAL: Firestore API Not Enabled**
**Error:** `Cloud Firestore API has not been used in project linguapp-final before or it is disabled`

**Solution:** 
- **Click this link to enable immediately:** https://console.developers.google.com/apis/api/firestore.googleapis.com/overview?project=linguapp-final
- Or follow the detailed guide: `docs/firestore-setup-guide.md`

### 2. **Connection Error: `FirebaseError: [code=unavailable]: The operation could not be completed`**

### Immediate Steps to Try

1. **Check Internet Connection**
   - Ensure your device has a stable internet connection
   - Try switching between WiFi and mobile data
   - Test with a different network if possible

2. **Restart the App**
   - Close the app completely
   - Clear app cache if possible
   - Restart the app

3. **Check Firebase Project Status**
   - Visit [Firebase Console](https://console.firebase.google.com/)
   - Verify your project `linguapp-final` is active
   - Check if there are any service disruptions

### Configuration Issues

#### 1. Firebase Project Setup
- **Project ID**: `linguapp-final`
- **API Key**: `AIzaSyBz4F_HEey2ddPlBX_U67rE__av3XSVsCc`
- **Auth Domain**: `linguapp-final.firebaseapp.com`

**Verify in Firebase Console:**
- Go to Project Settings > General
- Check if the project ID matches
- Verify the API key is correct
- Ensure the project is not in a suspended state

#### 2. Firestore Database
- **Check if Firestore is enabled:**
  - Go to Firestore Database in Firebase Console
  - Verify the database exists and is in the correct region
  - Check if there are any billing issues

#### 3. Security Rules
- **Current Firestore Rules** (if any):
  ```javascript
  // Default rules - adjust as needed
  rules_version = '2';
  service cloud.firestore {
    match /databases/{database}/documents {
      match /{document=**} {
        allow read, write: if true; // WARNING: This allows all access
      }
    }
  }
  ```

**Recommended Rules for Development:**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### Network and Firewall Issues

#### 1. Corporate/Institutional Networks
- Some networks block Firebase services
- Check with your network administrator
- Try using a mobile hotspot

#### 2. Firewall Settings
- Ensure ports 443 (HTTPS) are open
- Check if your firewall blocks Google services
- Verify DNS resolution for `firebaseapp.com`

#### 3. VPN Issues
- Disable VPN temporarily
- Some VPNs block Google services
- Try different VPN servers

### Firebase Service Status

#### 1. Check Service Health
- Visit [Google Cloud Status](https://status.cloud.google.com/)
- Check [Firebase Status](https://status.firebase.google.com/)
- Look for any ongoing issues

#### 2. Regional Issues
- Firebase services might be down in specific regions
- Try changing your device's region/language temporarily
- Check if the issue affects other Firebase projects

### Code-Level Solutions

#### 1. Enhanced Error Handling
The updated Firebase configuration now includes:
- Automatic connection retry logic
- Connection health monitoring
- Graceful fallback to mock services
- Better error reporting

#### 2. Connection Retry Logic
```typescript
// Automatic retry on connection failures
const CONNECTION_RETRY_ATTEMPTS = 3;
const CONNECTION_RETRY_DELAY = 2000; // 2 seconds

// The system will automatically retry failed connections
```

#### 3. Health Monitoring
```typescript
// Check connection health
import { checkConnectionHealth } from '../config/firebase';

const isHealthy = await checkConnectionHealth();
if (!isHealthy) {
  // Handle unhealthy connection
}
```

### Development vs Production

#### 1. Development Mode
- Uses mock services when Firebase is unavailable
- Provides detailed logging
- Allows development without Firebase connection

#### 2. Production Mode
- Requires stable Firebase connection
- Minimal logging for performance
- Graceful degradation on failures

### Environment Variables

#### 1. Required Variables
```bash
EXPO_PUBLIC_FIREBASE_API_KEY=AIzaSyBz4F_HEey2ddPlBX_U67rE__av3XSVsCc
EXPO_PUBLIC_FIREBASE_PROJECT_ID=linguapp-final
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=linguapp-final.firebaseapp.com
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=linguapp-final.firebasestorage.app
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=1031573299898
EXPO_PUBLIC_FIREBASE_APP_ID=1:1031573299898:web:6ffa4d194e03ec82821883
```

#### 2. Optional Variables
```bash
EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID=G-NBRC324854
```

### Testing and Debugging

#### 1. Use FirebaseStatusMonitor Component
```typescript
import FirebaseStatusMonitor from '../components/FirebaseStatusMonitor';

// Add to your screen for real-time monitoring
<FirebaseStatusMonitor />
```

#### 2. Console Logging
- Check browser/device console for detailed error messages
- Look for Firebase initialization logs
- Monitor connection retry attempts

#### 3. Network Tab
- Open browser DevTools > Network tab
- Look for failed requests to Firebase
- Check response status codes and error messages

### Alternative Solutions

#### 1. Use Firebase Emulator
```typescript
// Connect to local emulator
if (USE_EMULATOR) {
  connectFirestoreEmulator(db, 'localhost', 8080);
}
```

#### 2. Mock Services
- The app automatically falls back to mock services
- Allows development without Firebase
- Provides realistic data simulation

#### 3. Offline Mode
- Firestore supports offline operations
- Data syncs when connection is restored
- Configure offline persistence

### Billing and Quotas

#### 1. Check Billing Status
- Visit Firebase Console > Usage and billing
- Ensure billing is enabled
- Check if you've exceeded free tier limits

#### 2. Quota Limits
- Free tier: 50,000 reads, 20,000 writes per day
- Check current usage in Firebase Console
- Upgrade plan if needed

### Platform-Specific Issues

#### 1. React Native
- Ensure `expo-dev-client` is properly configured
- Check Metro bundler configuration
- Verify native dependencies

#### 2. Web Platform
- Check browser compatibility
- Ensure HTTPS is used in production
- Verify CORS settings

#### 3. iOS/Android
- Check device-specific network settings
- Verify app permissions
- Test on different devices

### Long-term Solutions

#### 1. Implement Retry Logic
- Exponential backoff for retries
- Circuit breaker pattern
- Graceful degradation

#### 2. Connection Pooling
- Maintain persistent connections
- Connection health monitoring
- Automatic reconnection

#### 3. Caching Strategy
- Implement local caching
- Offline-first approach
- Sync when connection is restored

### Getting Help

#### 1. Firebase Support
- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase Community](https://firebase.google.com/community)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/firebase)

#### 2. Debugging Tools
- Firebase Console > Project Settings > Service accounts
- Firebase CLI for local testing
- Firebase Emulator Suite

#### 3. Logs and Monitoring
- Enable Firebase Crashlytics
- Use Firebase Performance Monitoring
- Check Google Cloud Logging

### Prevention

#### 1. Regular Health Checks
- Monitor connection status
- Implement proactive error detection
- Regular testing of Firebase services

#### 2. Error Tracking
- Log all Firebase errors
- Monitor error patterns
- Set up alerts for critical failures

#### 3. Documentation
- Keep configuration up to date
- Document any custom Firebase rules
- Maintain troubleshooting procedures

---

**Remember**: Most Firebase connection issues are temporary and resolve themselves. The enhanced configuration now includes automatic retry logic and better error handling to minimize user impact.
