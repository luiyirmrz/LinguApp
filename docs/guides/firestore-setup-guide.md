# Firestore Setup Guide - Quick Fix

## 🚨 **URGENT: Firestore API Not Enabled**

Your Firebase project `linguapp-final` has the Firestore API disabled. This is why you're getting the error:

```
Cloud Firestore API has not been used in project linguapp-final before or it is disabled.
```

## 🔧 **Quick Fix (Choose One Method):**

### Method 1: Direct API Enable Link
**Click this link to enable Firestore immediately:**
**https://console.developers.google.com/apis/api/firestore.googleapis.com/overview?project=linguapp-final**

1. Click the link above
2. Click **"Enable"** button
3. Wait 2-5 minutes for changes to propagate
4. Restart your app

### Method 2: Firebase Console
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project `linguapp-final`
3. Click **"Firestore Database"** in left sidebar
4. Click **"Create database"**
5. Choose location (recommend: `us-central1` for US)
6. Choose security rules: **"Start in test mode"** (for development)
7. Click **"Done"**

### Method 3: Google Cloud Console
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select project `linguapp-final`
3. Search for **"Cloud Firestore API"**
4. Click **"Enable"**

## ⏱️ **Timeline:**
- **Immediate**: Enable the API
- **2-5 minutes**: Wait for propagation
- **Restart app**: Test the connection

## ✅ **Verification:**
After enabling, run the test script:
```bash
npm run test:firebase
```

You should see:
```
✅ Firestore connection test successful
```

## 🔍 **Why This Happened:**
- New Firebase projects don't automatically enable all APIs
- Firestore must be explicitly enabled before use
- This is a one-time setup requirement

## 🚀 **After Enabling:**
1. Your app will connect to Firestore successfully
2. All Firebase operations will work normally
3. The connection retry logic we implemented will handle future network issues
4. You can remove the FirebaseStatusMonitor from production if desired

## 📞 **Need Help?**
If you still have issues after enabling:
1. Check the troubleshooting guide: `docs/firebase-troubleshooting.md`
2. Verify billing is enabled in Firebase Console
3. Check if your Google account has proper permissions

---

**This is a configuration issue, not a code issue. Once Firestore is enabled, your app should work perfectly!**
