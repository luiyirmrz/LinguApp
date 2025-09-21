# Security Policy

## Supported Versions

Use this section to tell people about which versions of your project are
currently being supported with security updates.

| Version | Supported          |
| ------- | ------------------ |
| 5.1.x   | :white_check_mark: |
| 5.0.x   | :x:                |
| 4.0.x   | :white_check_mark: |
| < 4.0   | :x:                |

## Reporting a Vulnerability

Use this section to tell people how to report a vulnerability.

Tell them where to go, how often they can expect to get an update on a
reported vulnerability, what to expect if the vulnerability is accepted or
declined, etc.
>>>>>>> 6c1cb96ddd36c64e188feaca5be4175690dce47f
# Security Guide: Environment Variables & API Keys

## 🚨 CRITICAL SECURITY FIXES APPLIED

This document outlines the security vulnerabilities that have been fixed and provides guidelines for secure API key management.

## 🔒 Issues Fixed

### 1. **ElevenLabs API Key Exposure** (CRITICAL)
- **File**: `services/audio/elevenLabsService.ts`
- **Issue**: Hard-coded API key `0fb1f07e5e709c4161d22a5dd4a77796c8b8ccb2b9a7b46d4974731946186780`
- **Fix**: Removed hard-coded key, now requires `EXPO_PUBLIC_ELEVENLABS_API_KEY` environment variable
- **Security Impact**: Prevents unauthorized access to ElevenLabs services and associated costs

### 2. **Google TTS API Key Exposure** (CRITICAL)
- **File**: `services/audio/googleTTSConfig.ts`
- **Issue**: Hard-coded API key `AIzaSyAgOFZ9VfrZmvG9TkqCs2WQc8elCqyS6Yo`
- **Fix**: Removed hard-coded key, now requires `EXPO_PUBLIC_GOOGLE_TTS_API_KEY` environment variable
- **Security Impact**: Prevents unauthorized access to Google Cloud services and associated costs

### 3. **Test Credentials Exposure** (HIGH)
- **Files**: `backend/hono.ts`, `backend/trpc/routes/auth/signin.ts`
- **Issue**: Hard-coded fallback credentials for testing
- **Fix**: Removed fallback values, now requires proper environment variables
- **Security Impact**: Prevents predictable test accounts from being exploited

### 4. **Insecure JWT Token Generation** (CRITICAL)
- **Files**: `backend/hono.ts:235`, `backend/trpc/routes/auth/signin.ts:53`
- **Issue**: Predictable timestamp-based token generation (`jwt_token_${Date.now()}`)
- **Fix**: Implemented cryptographically secure JWT tokens with HMAC signatures
- **Security Impact**: Prevents authentication bypass, session hijacking, and token prediction

### 5. **Inadequate Rate Limiting Configuration** (HIGH)
- **File**: `backend/middleware/rateLimiter.ts`
- **Issue**: Too permissive rate limits (5 auth attempts/15min, 100 requests/15min)
- **Fix**: Reduced to 3 auth attempts/15min, 50 general requests/15min, added progressive lockout
- **Security Impact**: Better protection against brute force attacks and DDoS

### 6. **CORS Configuration Security Gaps** (HIGH)
- **File**: `backend/middleware/securityMiddleware.ts:124-144`
- **Issue**: Overly permissive CORS allowing any origin when no origin header present
- **Fix**: Strict origin validation, reject requests without origin headers
- **Security Impact**: Prevents cross-origin attacks and unauthorized API access

### 7. **Insufficient Input Validation** (HIGH)
- **Files**: Multiple validation services across the application
- **Issue**: Missing validation on endpoints, potential injection vulnerabilities
- **Fix**: Comprehensive input validation middleware with SQL/XSS/Command injection protection
- **Security Impact**: Prevents injection attacks and data breaches

### 8. **Incomplete Security Headers** (HIGH)
- **File**: `backend/middleware/securityMiddleware.ts:33-43`
- **Issue**: Missing critical security headers (CSP, HSTS, etc.)
- **Fix**: Comprehensive security headers including CSP, HSTS, CORP, COOP, and more
- **Security Impact**: Prevents XSS attacks, clickjacking, and insecure transport

## 🔧 Environment Variables Setup

### Step 1: Create Your .env File

```bash
# Copy the example file
cp .env.example .env
```

### Step 2: Configure Required Variables

Edit your `.env` file with your actual values:

```bash
# Firebase Configuration
EXPO_PUBLIC_FIREBASE_API_KEY=your_actual_firebase_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id

# ElevenLabs TTS Service
EXPO_PUBLIC_ELEVENLABS_API_KEY=your_elevenlabs_api_key

# Google Cloud TTS
EXPO_PUBLIC_GOOGLE_TTS_API_KEY=your_google_tts_api_key

# Backend Test Credentials (use secure values)
BACKEND_TEST_EMAIL_1=secure_test@yourdomain.com
BACKEND_TEST_PASSWORD_1=SecureTestPassword123!
BACKEND_DEMO_EMAIL=demo@yourdomain.com
BACKEND_DEMO_PASSWORD=SecureDemoPassword123!

# JWT Secret (CRITICAL - minimum 32 characters)
# Generate with: openssl rand -base64 32 or node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
JWT_SECRET=your_cryptographically_secure_jwt_secret_32_chars_minimum

# CORS Configuration (Production Security)
FRONTEND_URL=http://localhost:3000
FRONTEND_URL_DEV=http://localhost:3001  
FRONTEND_URL_STAGING=https://staging.yourdomain.com
FRONTEND_URL_PRODUCTION=https://yourdomain.com
```

### Step 3: Verify Configuration

Run the application and check the console for configuration status:

```bash
npm start
```

Look for initialization messages:
- `[ElevenLabs] API Key status: LOADED`
- `[Google TTS] API configuration loaded successfully`

## 🛡️ Security Best Practices

### Environment Variable Security

1. **Never commit .env files** to version control
   ```bash
   # Add to .gitignore
   .env
   .env.local
   .env.production
   ```

2. **Use different keys for different environments**
   - Development: Limited quotas, restricted access
   - Staging: Separate keys for testing
   - Production: Full access, monitoring enabled

3. **Regularly rotate API keys**
   - Set up calendar reminders (quarterly)
   - Monitor usage for suspicious activity
   - Revoke old keys after rotation

### 1. **Hardened Rate Limiting**

- **Authentication**: 3 attempts per 15 minutes (reduced from 5)
- **Signup**: 2 attempts per hour (reduced from 3)
- **General API**: 50 requests per 15 minutes (reduced from 100)
- **Progressive Lockout**: Automatic escalation for repeat violations
  - 3-5 violations: 15 minutes lockout
  - 6-10 violations: 1 hour lockout  
  - 11-20 violations: 6 hours lockout
  - 20+ violations: 24 hours lockout

### 2. **Strict CORS Configuration**

- **No Origin Rejection**: Requests without origin headers are blocked
- **Environment-Based Origins**: Only configured domains allowed
- **Credential Protection**: Secure credential handling with strict validation
- **Method Restriction**: Only specified HTTP methods allowed
- **Header Limitation**: Restricted allowed and exposed headers

### 3. **Enhanced Security Headers**

- **Content Security Policy (CSP)**: Prevents XSS and injection attacks
- **Strict Transport Security**: Forces HTTPS in production
- **X-Frame-Options**: Prevents clickjacking
- **Content Type Validation**: Ensures proper request formats
- **Request Size Limits**: Reduced to 512KB (from 1MB)

### 4. **Progressive Security Monitoring**

- **IP Violation Tracking**: Persistent violation counting
- **Automatic Escalation**: Progressive penalties for abuse
- **Security Logging**: Comprehensive audit trail
- **Request Timeout**: 30-second timeout protection

### 5. **Comprehensive Input Validation & Injection Protection**

- **SQL Injection Protection**: Pattern detection for UNION, SELECT, INSERT, etc.
- **XSS Prevention**: Script tag removal, event handler filtering, protocol blocking
- **Command Injection Protection**: Shell metacharacter filtering and path traversal prevention
- **NoSQL Injection Protection**: MongoDB operator detection and blocking
- **Content Sanitization**: HTML tag filtering, dangerous character removal
- **File Upload Validation**: Type checking, size limits, filename sanitization
- **Real-time Scanning**: Security middleware scans all requests for attack patterns
- **Zod Schema Validation**: Type-safe validation with comprehensive error handling

### 6. **Enhanced Security Headers**

- **Content Security Policy (CSP)**: Comprehensive directive set preventing XSS
- **Strict Transport Security (HSTS)**: 2-year HTTPS enforcement with preload
- **Cross-Origin Policies**: CORP, COOP, COEP for isolation
- **X-Frame-Options**: DENY to prevent clickjacking
- **X-Content-Type-Options**: nosniff to prevent MIME confusion
- **Permissions Policy**: Disabled dangerous browser features
- **Cache Control**: Prevents sensitive data caching
- **Server Header Removal**: Eliminates server fingerprinting

### 7. **API Key Management**

1. **ElevenLabs API Keys**
   - Get your key from: https://elevenlabs.io/
   - Monitor usage in the ElevenLabs dashboard
   - Set usage limits to prevent overcharges

2. **Google Cloud API Keys**
   - Get your key from: https://console.cloud.google.com/
   - Enable only required APIs (Text-to-Speech)
   - Set up quotas and usage alerts
   - Restrict key usage by IP/domain in production

3. **Firebase Configuration**
   - Get config from Firebase Console > Project Settings
   - Use separate projects for dev/staging/production
   - Enable App Check for production

### Deployment Security

#### For Development
```bash
# Local development
cp .env.example .env
# Edit .env with your development keys
```

#### For Production Deployment

1. **Expo/EAS Build**
   ```bash
   # Set in eas.json or via EAS CLI
   eas secret:create --scope project --name EXPO_PUBLIC_ELEVENLABS_API_KEY --value your_key
   ```

2. **Vercel Deployment**
   ```bash
   # Via Vercel CLI or dashboard
   vercel env add EXPO_PUBLIC_ELEVENLABS_API_KEY
   ```

3. **Netlify Deployment**
   ```bash
   # Via Netlify CLI or dashboard
   netlify env:set EXPO_PUBLIC_ELEVENLABS_API_KEY your_key
   ```

## 🔍 Security Monitoring

### 1. API Usage Monitoring

- **ElevenLabs**: Monitor usage in dashboard
- **Google Cloud**: Set up billing alerts
- **Firebase**: Monitor authentication logs

### 2. Error Monitoring

The application now fails securely:
- Missing API keys cause initialization errors
- No fallback to insecure defaults
- Clear error messages for developers

### 3. Access Logging

```typescript
// Example: Monitor API key usage
console.log('[Security] API key loaded:', apiKey ? 'SUCCESS' : 'FAILED');
```

## ⚠️ Troubleshooting

### Common Issues

1. **"API key not found" errors**
   - Verify .env file exists in project root
   - Check variable names match exactly
   - Restart development server after changes

2. **Service initialization failures**
   - Check API key format (ElevenLabs keys start with specific prefix)
   - Verify API key permissions
   - Check network connectivity

3. **Authentication failures**
   - Verify test credentials are set in environment
   - Check password complexity requirements
   - Ensure email format is valid

### Validation Scripts

Create a validation script to check your configuration:

```bash
# Check environment variables
node scripts/validate-env.js

# Interactive setup (recommended for first-time setup)
node scripts/setup-env.js
```

The validation script will check:
- All required environment variables are present
- API keys have correct format and length
- JWT secrets meet minimum security requirements
- No compromised or default values are being used

## 📋 Security Checklist

- [ ] Removed all hard-coded API keys
- [ ] Removed all hard-coded test credentials
- [ ] Replaced insecure JWT token generation with cryptographically secure tokens
- [ ] **Hardened rate limiting configuration (3 auth attempts, 50 general requests)**
- [ ] **Fixed CORS security gaps (strict origin validation)**
- [ ] **Implemented progressive lockout mechanisms**
- [ ] **Added enhanced security headers (CSP, HSTS, CORP, COOP, etc.)**
- [ ] **Implemented comprehensive input validation (SQL/XSS/Command injection protection)**
- [ ] **Added security scanning middleware for attack detection**
- [ ] **Enhanced XSS protection and content sanitization**
- [ ] Created .env file with actual values
- [ ] Generated secure JWT secret (minimum 32 characters)
- [ ] **Configured CORS origins for all environments**
- [ ] Added .env to .gitignore
- [ ] Set up production environment variables
- [ ] Configured monitoring and alerts
- [ ] Set up key rotation schedule
- [ ] Tested all services with new configuration
- [ ] Validated JWT token generation and verification
- [ ] **Tested rate limiting and lockout mechanisms**
- [ ] **Verified CORS configuration in all environments**
- [ ] **Tested input validation on all endpoints**
- [ ] **Verified security headers are properly applied**
- [ ] Documented access credentials securely
- [ ] Set up backup access method
- [ ] Ran environment validation script

## 🆘 Emergency Response

If API keys are compromised:

1. **Immediately revoke the compromised keys** in the respective service dashboards
2. **Generate new API keys** with different values
3. **Update environment variables** in all environments
4. **Deploy updates** to all running instances
5. **Monitor usage** for suspicious activity
6. **Review access logs** for unauthorized usage

## 📞 Support

For security-related issues:
- Review this documentation first
- Check service-specific documentation (ElevenLabs, Google Cloud, Firebase)
- Ensure all environment variables are properly configured
- Test in development before deploying to production

## 🔄 Supported Versions

This security guide applies to all current versions of LinguApp. For version-specific security updates:

| Version | Security Support   |
| ------- | ------------------ |
| Latest  | :white_check_mark: |
| 1.x.x   | :white_check_mark: |
| Beta    | :white_check_mark: |

## 🚨 Reporting Security Vulnerabilities

If you discover a security vulnerability in LinguApp:

1. **Do NOT create a public issue**
2. **Email security concerns** to the project maintainers
3. **Include detailed information** about the vulnerability
4. **Wait for confirmation** before public disclosure
5. **Expect updates** within 48 hours of reporting

We take security seriously and will work quickly to address any verified vulnerabilities.

---

**Remember**: Security is not a one-time setup but an ongoing process. Regular reviews and updates are essential to maintain the security of your application.
=======
# Security Policy

## Supported Versions

Use this section to tell people about which versions of your project are
currently being supported with security updates.

| Version | Supported          |
| ------- | ------------------ |
| 5.1.x   | :white_check_mark: |
| 5.0.x   | :x:                |
| 4.0.x   | :white_check_mark: |
| < 4.0   | :x:                |

## Reporting a Vulnerability

Use this section to tell people how to report a vulnerability.

Tell them where to go, how often they can expect to get an update on a
reported vulnerability, what to expect if the vulnerability is accepted or
declined, etc.
>>>>>>> 6c1cb96ddd36c64e188feaca5be4175690dce47f
