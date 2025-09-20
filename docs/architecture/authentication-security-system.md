# Authentication & Security System Documentation

## Overview

The LinguApp Authentication & Security System provides comprehensive security measures to protect user accounts and data. This system addresses all critical security issues identified in the original implementation and provides enterprise-grade security features.

## 🔒 Security Issues Addressed

### ❌ Previous Problems
1. **Insecure Development Mode**: Hardcoded demo credentials and mock authentication
2. **Weak Input Validation**: Basic email/password validation without security measures
3. **No Rate Limiting**: Vulnerable to brute force attacks
4. **No Token Refresh**: Sessions could expire without warning
5. **Missing Security Headers**: No CSRF protection or security headers
6. **Weak Password Requirements**: Only 6 characters minimum
7. **No Account Lockout**: No protection against repeated failed attempts

### ✅ Current Solutions
1. **Secure Development Mode**: Environment-based configuration with proper credential management
2. **Comprehensive Input Validation**: Multi-layer validation with sanitization
3. **Rate Limiting**: Configurable rate limiting with account lockout
4. **Token Management**: Automatic token refresh with session monitoring
5. **CSRF Protection**: Built-in CSRF token generation and validation
6. **Strong Password Requirements**: 8+ characters with complexity requirements
7. **Account Lockout**: Automatic lockout after failed attempts with configurable duration

## 🏗️ Architecture

### Core Components

#### 1. SecurityService (`services/securityService.ts`)
- **Rate Limiting**: Prevents brute force attacks
- **Input Validation**: Comprehensive validation and sanitization
- **Password Strength**: Advanced password strength validation
- **Account Lockout**: Automatic account protection
- **Security Logging**: Comprehensive security event logging
- **CSRF Protection**: Cross-site request forgery protection
- **Session Management**: Secure session handling

#### 2. EnhancedAuthService (`services/enhancedAuthService.ts`)
- **Secure Authentication**: Wraps Firebase auth with security measures
- **Token Management**: Automatic token refresh and monitoring
- **Session Validation**: Continuous session monitoring
- **Security Integration**: Integrates with SecurityService
- **Error Handling**: Comprehensive error handling and logging

#### 3. EnhancedAuth Hook (`hooks/useEnhancedAuth.tsx`)
- **React Integration**: Provides secure auth methods to components
- **Security Status**: Real-time security status monitoring
- **Input Validation**: Exposes validation methods to components
- **Security Logging**: Automatic security event logging

#### 4. Security Monitoring Component (`components/SecurityMonitoringComponent.tsx`)
- **Security Dashboard**: Real-time security status display
- **Event Logging**: View security events and logs
- **Password Testing**: Interactive password strength testing
- **Settings Management**: Security configuration management

## 🔧 Configuration

### Security Configuration

```typescript
const SECURITY_CONFIG = {
  // Rate limiting
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION_MINUTES: 15,
  RATE_LIMIT_WINDOW_MINUTES: 5,
  MAX_REQUESTS_PER_WINDOW: 10,
  
  // Password requirements
  MIN_PASSWORD_LENGTH: 8,
  REQUIRE_UPPERCASE: true,
  REQUIRE_LOWERCASE: true,
  REQUIRE_NUMBERS: true,
  REQUIRE_SPECIAL_CHARS: true,
  
  // Token management
  TOKEN_REFRESH_THRESHOLD_MINUTES: 5,
  SESSION_TIMEOUT_MINUTES: 60,
  
  // Security headers
  CSRF_TOKEN_EXPIRY_HOURS: 24,
  
  // Monitoring
  SUSPICIOUS_ACTIVITY_THRESHOLD: 3,
  LOG_RETENTION_DAYS: 30
};
```

### Environment Configuration

```bash
# Firebase Configuration (Required for production)
EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

## 🚀 Usage

### Basic Authentication

```typescript
import { useEnhancedAuth } from '@/hooks/useEnhancedAuth';

function LoginComponent() {
  const { signIn, securityStatus, error } = useEnhancedAuth();

  const handleLogin = async () => {
    try {
      const result = await signIn(email, password);
      if (result.success) {
        // Navigate to main app
      }
    } catch (error) {
      // Handle error
    }
  };

  return (
    <View>
      {/* Show security warnings */}
      {securityStatus.accountLocked && (
        <Text>Account locked for {securityStatus.lockoutRemaining} minutes</Text>
      )}
      
      {/* Login form */}
    </View>
  );
}
```

### Password Strength Validation

```typescript
import { useEnhancedAuth } from '@/hooks/useEnhancedAuth';

function SignUpComponent() {
  const { validatePassword, signUp } = useEnhancedAuth();
  const [password, setPassword] = useState('');
  const [strength, setStrength] = useState(null);

  const handlePasswordChange = (text) => {
    setPassword(text);
    if (text.length > 0) {
      setStrength(validatePassword(text));
    }
  };

  return (
    <View>
      <TextInput
        value={password}
        onChangeText={handlePasswordChange}
        secureTextEntry
      />
      
      {strength && (
        <View>
          <Text>Strength: {strength.strength.toUpperCase()}</Text>
          <Text>Score: {strength.score}/100</Text>
          {strength.errors.map(error => (
            <Text key={error}>• {error}</Text>
          ))}
        </View>
      )}
    </View>
  );
}
```

### Security Monitoring

```typescript
import SecurityMonitoringComponent from '@/components/SecurityMonitoringComponent';

function SecurityScreen() {
  return <SecurityMonitoringComponent />;
}
```

## 🔍 Security Features

### 1. Rate Limiting
- **Window-based**: 5-minute sliding window
- **Per-action**: Separate limits for login, signup, password reset
- **Configurable**: Adjustable limits and windows
- **Persistent**: Survives app restarts

### 2. Account Lockout
- **Automatic**: Triggers after 5 failed attempts
- **Temporary**: 15-minute lockout duration
- **Progressive**: Longer lockouts for repeated violations
- **Reset**: Automatically resets on successful login

### 3. Password Strength Validation
- **Length**: Minimum 8 characters
- **Complexity**: Requires uppercase, lowercase, numbers, special characters
- **Common Passwords**: Blocks common weak passwords
- **Scoring**: 0-100 strength score
- **Real-time**: Updates as user types

### 4. Input Validation & Sanitization
- **Email Validation**: RFC-compliant email validation
- **Name Validation**: Character restrictions and length limits
- **Sanitization**: Removes dangerous characters and scripts
- **Type Safety**: Comprehensive TypeScript validation

### 5. Session Management
- **Automatic Refresh**: Refreshes tokens before expiry
- **Session Monitoring**: Continuous session validation
- **Timeout Handling**: Graceful session expiry
- **Device Tracking**: Tracks device information

### 6. Security Logging
- **Comprehensive**: Logs all security events
- **Structured**: JSON-formatted event data
- **Severity Levels**: Low, medium, high, critical
- **Retention**: Configurable log retention (30 days default)

### 7. CSRF Protection
- **Token Generation**: Automatic CSRF token generation
- **Validation**: Validates tokens on sensitive operations
- **Expiry**: Configurable token expiry (24 hours default)
- **Secure Storage**: Encrypted token storage

## 📊 Security Events

### Event Types
- `LOGIN_ATTEMPT`: User attempts to log in
- `LOGIN_SUCCESS`: Successful authentication
- `LOGIN_FAILURE`: Failed authentication attempt
- `ACCOUNT_LOCKOUT`: Account locked due to failed attempts
- `PASSWORD_RESET`: Password reset requested/completed
- `SUSPICIOUS_ACTIVITY`: Detected suspicious behavior
- `TOKEN_REFRESH`: Token refreshed automatically
- `SESSION_EXPIRED`: Session expired
- `RATE_LIMIT_EXCEEDED`: Rate limit exceeded

### Event Structure
```typescript
interface SecurityEvent {
  id: string;
  type: SecurityEventType;
  userId?: string;
  email?: string;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
  details: Record<string, any>;
  severity: 'low' | 'medium' | 'high' | 'critical';
}
```

## 🛡️ Security Best Practices

### 1. Password Requirements
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character
- Not a common password

### 2. Rate Limiting
- 10 requests per 5-minute window for login
- 5 requests per 5-minute window for signup
- 3 requests per 5-minute window for password reset
- Automatic account lockout after 5 failed attempts

### 3. Session Security
- 60-minute session timeout
- Automatic token refresh 5 minutes before expiry
- Device fingerprinting for session tracking
- Secure session storage

### 4. Input Security
- All inputs validated and sanitized
- Email addresses normalized and validated
- Names restricted to safe characters
- Maximum length limits enforced

## 🔧 Development Setup

### 1. Install Dependencies
```bash
npm install @react-native-async-storage/async-storage
npm install firebase
npm install @nkzw/create-context-hook
```

### 2. Environment Configuration
Create `.env` file with Firebase configuration:
```bash
EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
# ... other Firebase config
```

### 3. Initialize Services
```typescript
// In your app initialization
import { enhancedAuthService } from '@/services/enhancedAuthService';
import { securityService } from '@/services/securityService';

// Initialize security services
await securityService.initialize();
await enhancedAuthService.initialize();
```

### 4. Wrap App with Provider
```typescript
import { EnhancedAuthProvider } from '@/hooks/useEnhancedAuth';

export default function App() {
  return (
    <EnhancedAuthProvider>
      {/* Your app components */}
    </EnhancedAuthProvider>
  );
}
```

## 🧪 Testing

### Security Testing
```typescript
// Test rate limiting
for (let i = 0; i < 6; i++) {
  await signIn('test@example.com', 'wrongpassword');
}
// Should trigger account lockout

// Test password strength
const weakPassword = validatePassword('password');
console.log(weakPassword.isValid); // false

const strongPassword = validatePassword('MySecureP@ssw0rd!');
console.log(strongPassword.isValid); // true
```

### Integration Testing
```typescript
// Test complete authentication flow
const result = await signIn('user@example.com', 'password');
expect(result.success).toBe(true);
expect(result.securityInfo.rateLimitRemaining).toBeGreaterThan(0);
```

## 📈 Monitoring & Analytics

### Security Dashboard
The SecurityMonitoringComponent provides:
- Real-time security status
- Rate limiting information
- Account lockout status
- Security event logs
- Password strength testing
- Security configuration

### Log Analysis
Security events are logged with:
- Timestamp and user information
- Event type and severity
- Detailed context information
- Device and platform data
- IP address (when available)

## 🔄 Migration Guide

### From Old Auth System
1. **Replace imports**:
   ```typescript
   // Old
   import { useAuth } from '@/hooks/useAuth';
   
   // New
   import { useEnhancedAuth } from '@/hooks/useEnhancedAuth';
   ```

2. **Update method calls**:
   ```typescript
   // Old
   const { signIn, signUp } = useAuth();
   
   // New
   const { signIn, signUp, securityStatus } = useEnhancedAuth();
   ```

3. **Add security monitoring**:
   ```typescript
   // Add to your app
   import SecurityMonitoringComponent from '@/components/SecurityMonitoringComponent';
   ```

4. **Update password requirements**:
   - Minimum length: 6 → 8 characters
   - Add complexity requirements
   - Implement strength validation

## 🚨 Security Alerts

### Critical Alerts
- Account lockout events
- Rate limit exceeded
- Suspicious activity detected
- Session compromise detected

### Warning Alerts
- Multiple failed login attempts
- Weak password usage
- Unusual login patterns
- Token refresh failures

## 📞 Support

### Security Issues
For security-related issues or vulnerabilities:
1. Check security logs in SecurityMonitoringComponent
2. Review rate limiting and lockout status
3. Verify password strength requirements
4. Check session and token status

### Configuration Issues
For configuration problems:
1. Verify environment variables
2. Check Firebase configuration
3. Validate security settings
4. Review initialization order

## 🔮 Future Enhancements

### Planned Features
- **Biometric Authentication**: Face ID, Touch ID support
- **Two-Factor Authentication**: SMS, email, authenticator app
- **Advanced Threat Detection**: Machine learning-based anomaly detection
- **Security Score**: User security rating system
- **Compliance**: GDPR, CCPA compliance features
- **Audit Trail**: Comprehensive audit logging
- **Security Notifications**: Push notifications for security events

### Integration Opportunities
- **SIEM Integration**: Security information and event management
- **SOC Integration**: Security operations center integration
- **Compliance Reporting**: Automated compliance reporting
- **Security Analytics**: Advanced security analytics and insights

---

This authentication and security system provides enterprise-grade security for LinguApp while maintaining excellent user experience and developer productivity.
