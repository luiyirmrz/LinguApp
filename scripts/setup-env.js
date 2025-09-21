#!/usr/bin/env node
/**
 * Environment Setup Script
 * Helps developers set up secure environment variables
 * Run with: node scripts/setup-env.js
 */

import fs from 'fs';
import path from 'path';
import readline from 'readline';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function colorLog(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function generateSecureJWTSecret() {
  colorLog('\n🔐 Generating secure JWT secret...', 'cyan');
  const secret = crypto.randomBytes(32).toString('base64');
  colorLog(`✅ Generated 32-byte secure JWT secret`, 'green');
  return secret;
}

async function setupEnvironment() {
  console.clear();
  colorLog('🚀 LinguApp Environment Setup', 'bright');
  colorLog('=====================================', 'bright');
  colorLog('This script will help you set up secure environment variables.\n', 'cyan');

  // Check if .env already exists
  const envPath = path.join(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    colorLog('⚠️  .env file already exists!', 'yellow');
    const overwrite = await question('Do you want to overwrite it? (y/N): ');
    if (overwrite.toLowerCase() !== 'y' && overwrite.toLowerCase() !== 'yes') {
      colorLog('Setup cancelled. Existing .env file preserved.', 'yellow');
      rl.close();
      return;
    }
  }

  // Copy from .env.example
  const examplePath = path.join(process.cwd(), '.env.example');
  if (!fs.existsSync(examplePath)) {
    colorLog('❌ .env.example file not found!', 'red');
    colorLog('Please make sure you\'re running this from the project root directory.', 'red');
    rl.close();
    return;
  }

  let envContent = fs.readFileSync(examplePath, 'utf8');

  colorLog('\n📋 Environment Variable Configuration', 'bright');
  colorLog('=====================================\n', 'bright');

  try {
    // Generate secure JWT secret
    const jwtSecret = await generateSecureJWTSecret();
    envContent = envContent.replace(
      'JWT_SECRET=your_super_secure_jwt_secret_key_minimum_32_chars',
      `JWT_SECRET=${jwtSecret}`
    );

    // Firebase Configuration
    colorLog('\n🔥 Firebase Configuration', 'magenta');
    colorLog('Get these from: https://console.firebase.google.com/\n', 'cyan');
    
    const firebaseApiKey = await question('Firebase API Key: ');
    const firebaseProjectId = await question('Firebase Project ID: ');
    const firebaseAuthDomain = await question(`Firebase Auth Domain (${firebaseProjectId}.firebaseapp.com): `) || `${firebaseProjectId}.firebaseapp.com`;
    const firebaseStorageBucket = await question(`Firebase Storage Bucket (${firebaseProjectId}.appspot.com): `) || `${firebaseProjectId}.appspot.com`;
    const firebaseMessagingId = await question('Firebase Messaging Sender ID (optional): ');
    const firebaseAppId = await question('Firebase App ID: ');

    envContent = envContent.replace('EXPO_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key_here', `EXPO_PUBLIC_FIREBASE_API_KEY=${firebaseApiKey}`);
    envContent = envContent.replace('EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id', `EXPO_PUBLIC_FIREBASE_PROJECT_ID=${firebaseProjectId}`);
    envContent = envContent.replace('EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com', `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=${firebaseAuthDomain}`);
    envContent = envContent.replace('EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com', `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=${firebaseStorageBucket}`);
    envContent = envContent.replace('EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id', `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=${firebaseMessagingId}`);
    envContent = envContent.replace('EXPO_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id', `EXPO_PUBLIC_FIREBASE_APP_ID=${firebaseAppId}`);

    // ElevenLabs Configuration
    colorLog('\n🎤 ElevenLabs Configuration', 'magenta');
    colorLog('Get your API key from: https://elevenlabs.io/\n', 'cyan');
    
    const elevenLabsKey = await question('ElevenLabs API Key (required for TTS): ');
    if (elevenLabsKey) {
      envContent = envContent.replace('EXPO_PUBLIC_ELEVENLABS_API_KEY=your_elevenlabs_api_key_here', `EXPO_PUBLIC_ELEVENLABS_API_KEY=${elevenLabsKey}`);
    }

    // Google TTS Configuration
    colorLog('\n🌐 Google Cloud TTS Configuration', 'magenta');
    colorLog('Get your API key from: https://console.cloud.google.com/\n', 'cyan');
    
    const googleTTSKey = await question('Google TTS API Key (required for TTS): ');
    if (googleTTSKey) {
      envContent = envContent.replace('EXPO_PUBLIC_GOOGLE_TTS_API_KEY=your_google_tts_api_key_here', `EXPO_PUBLIC_GOOGLE_TTS_API_KEY=${googleTTSKey}`);
    }

    // Test Credentials (optional)
    colorLog('\n🧪 Test Credentials (Development)', 'magenta');
    colorLog('These are used for testing authentication flows\n', 'cyan');
    
    const setupTestCreds = await question('Set up test credentials? (Y/n): ');
    if (setupTestCreds.toLowerCase() !== 'n' && setupTestCreds.toLowerCase() !== 'no') {
      const testEmail1 = await question('Test Email 1 (test@yourdomain.com): ') || 'test@yourdomain.com';
      const testPassword1 = await question('Test Password 1: ') || `TestPass${Math.floor(Math.random() * 1000)}!`;
      const demoEmail = await question('Demo Email (demo@yourdomain.com): ') || 'demo@yourdomain.com';
      const demoPassword = await question('Demo Password: ') || `DemoPass${Math.floor(Math.random() * 1000)}!`;

      envContent = envContent.replace('BACKEND_TEST_EMAIL_1=test@example.com', `BACKEND_TEST_EMAIL_1=${testEmail1}`);
      envContent = envContent.replace('BACKEND_TEST_PASSWORD_1=SecureTestPass123!', `BACKEND_TEST_PASSWORD_1=${testPassword1}`);
      envContent = envContent.replace('BACKEND_DEMO_EMAIL=demo@localhost.dev', `BACKEND_DEMO_EMAIL=${demoEmail}`);
      envContent = envContent.replace('BACKEND_DEMO_PASSWORD=SecureDemoPass123!', `BACKEND_DEMO_PASSWORD=${demoPassword}`);
    }

    // Write the .env file
    fs.writeFileSync(envPath, envContent);

    colorLog('\n✅ Environment setup complete!', 'green');
    colorLog('=====================================', 'green');
    colorLog('📁 Created: .env', 'green');
    colorLog('🔐 Generated secure JWT secret', 'green');
    colorLog('🔧 Configured environment variables\n', 'green');

    // Validate the setup
    colorLog('🔍 Validating configuration...', 'cyan');
    
    // Run validation
    try {
      const { default: validateEnv } = await import('./validate-env.js');
      if (validateEnv) {
        await validateEnv();
      }
    } catch (error) {
      colorLog('⚠️  Validation script not found, but .env file was created successfully.', 'yellow');
    }

    colorLog('\n📚 Next Steps:', 'bright');
    colorLog('=====================================', 'bright');
    colorLog('1. Review your .env file and verify all values', 'cyan');
    colorLog('2. Never commit your .env file to version control', 'cyan');
    colorLog('3. Run: npm start (or your preferred start command)', 'cyan');
    colorLog('4. Check console for any remaining configuration issues', 'cyan');
    colorLog('\n🛡️  Security Reminder:', 'yellow');
    colorLog('- Keep your API keys secure and private', 'yellow');
    colorLog('- Use different keys for development and production', 'yellow');
    colorLog('- Regularly rotate your API keys', 'yellow');
    colorLog('- Monitor usage for any suspicious activity\n', 'yellow');

  } catch (error) {
    colorLog(`\n❌ Setup failed: ${error.message}`, 'red');
    colorLog('Please try again or set up your .env file manually using .env.example as a template.', 'red');
  } finally {
    rl.close();
  }
}

// Handle script interruption
process.on('SIGINT', () => {
  colorLog('\n\n⚠️  Setup interrupted. You can run this script again anytime.', 'yellow');
  rl.close();
  process.exit(0);
});

// Main execution
if (import.meta.url === `file://${process.argv[1]}`) {
  setupEnvironment().catch(error => {
    colorLog(`\n❌ Unexpected error: ${error.message}`, 'red');
    process.exit(1);
  });
}

export { setupEnvironment };