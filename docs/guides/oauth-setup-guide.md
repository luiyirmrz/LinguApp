# OAuth Setup Guide for LinguApp

This guide explains how to configure OAuth providers (Google, GitHub, Apple) for LinguApp.

## 🔐 OAuth Providers Configuration

### Google OAuth Setup

1. **Create Google Cloud Project**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing one
   - Enable Google+ API

2. **Create OAuth 2.0 Credentials**
   - Go to "Credentials" in the API & Services section
   - Click "Create Credentials" → "OAuth 2.0 Client IDs"
   - Create separate client IDs for each platform:

   **Web Application:**
   ```
   Authorized redirect URIs:
   - https://auth.expo.io/@your-username/linguapp
   - http://localhost:19006/auth (for development)
   ```

   **iOS Application:**
   ```
   Bundle ID: app.rork.linguapp
   ```

   **Android Application:**
   ```
   Package name: app.rork.linguapp
   SHA-1 certificate fingerprint: [Your debug/release keystore SHA-1]
   ```

3. **Add to Environment Variables**
   ```env
   EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=your_web_client_id
   EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=your_ios_client_id
   EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=your_android_client_id
   ```

### GitHub OAuth Setup

1. **Create GitHub OAuth App**
   - Go to GitHub Settings → Developer settings → OAuth Apps
   - Click "New OAuth App"
   - Fill in the details:

   ```
   Application name: LinguApp
   Homepage URL: https://linguapp.app
   Authorization callback URL: https://auth.expo.io/@your-username/linguapp
   ```

2. **Add to Environment Variables**
   ```env
   EXPO_PUBLIC_GITHUB_CLIENT_ID=your_github_client_id
   EXPO_PUBLIC_GITHUB_CLIENT_SECRET=your_github_client_secret
   ```

### Apple Sign-In Setup

1. **Configure Apple Developer Account**
   - Go to [Apple Developer Console](https://developer.apple.com/)
   - Navigate to Certificates, Identifiers & Profiles
   - Create/edit your App ID
   - Enable "Sign In with Apple" capability

2. **Configure in Expo**
   - Apple Sign-In is automatically configured through `app.json`
   - No additional environment variables needed
   - The plugin is already added: `expo-apple-authentication`

## 🚀 Testing OAuth Implementation

### Development Testing

1. **Start Development Server**
   ```bash
   npx expo start
   ```

2. **Test Each Provider**
   - Open the app in Expo Go or simulator
   - Navigate to Sign In screen
   - Test each OAuth button:
     - Google Sign-In
     - GitHub Sign-In
     - Apple Sign-In (iOS only)

### Error Handling

The OAuth implementation includes comprehensive error handling:

- **Configuration errors**: Missing client IDs
- **User cancellation**: User cancels OAuth flow
- **Network errors**: API failures
- **Platform limitations**: Apple Sign-In availability

### Security Considerations

1. **Environment Variables**
   - Never commit `.env` files to version control
   - Use different credentials for development/production
   - Keep client secrets secure (GitHub)

2. **Redirect URIs**
   - Use HTTPS in production
   - Validate redirect URIs match exactly
   - Use deep linking scheme: `linguapp://auth`

3. **Token Handling**
   - Tokens are handled securely within the app
   - No sensitive data is logged
   - Implement proper token refresh logic

## 📱 Platform-Specific Notes

### iOS
- Apple Sign-In is required if other social logins are offered
- Test on physical device for best results
- Ensure proper entitlements are configured

### Android
- Generate proper SHA-1 fingerprints for Google OAuth
- Test deep linking functionality
- Handle back button during OAuth flow

### Web
- Configure proper CORS settings
- Test in different browsers
- Handle popup blockers

## 🔧 Troubleshooting

### Common Issues

1. **"Client ID not configured"**
   - Check environment variables are set correctly
   - Ensure `.env` file is in project root
   - Restart development server after changes

2. **"Redirect URI mismatch"**
   - Verify redirect URIs in OAuth provider settings
   - Check app scheme matches `app.json`
   - Ensure deep linking is configured

3. **"Apple Sign-In not available"**
   - Test on iOS device/simulator
   - Ensure iOS version supports Apple Sign-In
   - Check app.json plugin configuration

### Debug Mode

Enable debug logging by setting:
```env
EXPO_PUBLIC_DEBUG_MODE=true
```

This will provide detailed OAuth flow information in console logs.

## 📚 Additional Resources

- [Expo AuthSession Documentation](https://docs.expo.dev/versions/latest/sdk/auth-session/)
- [Google OAuth 2.0 Guide](https://developers.google.com/identity/protocols/oauth2)
- [GitHub OAuth Documentation](https://docs.github.com/en/developers/apps/building-oauth-apps)
- [Apple Sign-In Documentation](https://developer.apple.com/documentation/sign_in_with_apple)
