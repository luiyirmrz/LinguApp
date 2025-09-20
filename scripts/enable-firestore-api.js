#!/usr/bin/env node

/**
 * Script to enable Firestore API for linguapp-final project
 * This script uses the Google Cloud API to enable Firestore
 */

const { execSync } = require('child_process');
const https = require('https');

const PROJECT_ID = 'linguapp-final';
const FIRESTORE_API = 'firestore.googleapis.com';

console.log('🚀 Enabling Firestore API for linguapp-final project...');

async function enableFirestoreAPI() {
  try {
    // Method 1: Try using gcloud CLI if available
    try {
      console.log('📋 Checking if gcloud CLI is available...');
      execSync('gcloud --version', { stdio: 'pipe' });
      
      console.log('🔧 Using gcloud CLI to enable Firestore API...');
      execSync(`gcloud services enable ${FIRESTORE_API} --project=${PROJECT_ID}`, { stdio: 'inherit' });
      
      console.log('✅ Firestore API enabled successfully via gcloud CLI');
      return true;
    } catch (gcloudError) {
      console.log('⚠️  gcloud CLI not available, trying alternative method...');
    }

    // Method 2: Direct API call (requires authentication)
    console.log('🌐 Attempting to enable via REST API...');
    
    const enableAPI = () => {
      return new Promise((resolve, reject) => {
        const postData = JSON.stringify({});
        
        const options = {
          hostname: 'serviceusage.googleapis.com',
          port: 443,
          path: `/v1/projects/${PROJECT_ID}/services/${FIRESTORE_API}:enable`,
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData),
            // Note: This would need proper authentication in a real scenario
            // For now, we'll provide instructions
          },
        };

        const req = https.request(options, (res) => {
          let data = '';
          res.on('data', (chunk) => {
            data += chunk;
          });
          res.on('end', () => {
            if (res.statusCode === 200) {
              resolve(JSON.parse(data));
            } else {
              reject(new Error(`API call failed with status ${res.statusCode}: ${data}`));
            }
          });
        });

        req.on('error', (error) => {
          reject(error);
        });

        req.write(postData);
        req.end();
      });
    };

    try {
      await enableAPI();
      console.log('✅ Firestore API enabled successfully via REST API');
      return true;
    } catch (apiError) {
      console.log('⚠️  REST API method failed:', apiError.message);
    }

    // Method 3: Provide manual instructions
    console.log('\n📖 Manual Setup Required:');
    console.log('Since automated methods failed, please enable Firestore manually:');
    console.log('\n🔗 Quick Link:');
    console.log(`https://console.developers.google.com/apis/api/firestore.googleapis.com/overview?project=${PROJECT_ID}`);
    console.log('\n📋 Steps:');
    console.log('1. Click the link above');
    console.log('2. Click "Enable" button');
    console.log('3. Wait 2-5 minutes for changes to propagate');
    console.log('4. Run: npm run test:firebase');
    
    return false;

  } catch (error) {
    console.error('❌ Error enabling Firestore API:', error.message);
    return false;
  }
}

async function testFirestoreConnection() {
  console.log('\n🧪 Testing Firestore connection...');
  
  try {
    // Import the test script
    const { testFirebaseConnection } = require('./test-firebase-connection.js');
    await testFirebaseConnection();
    return true;
  } catch (error) {
    console.error('❌ Firestore connection test failed:', error.message);
    return false;
  }
}

async function main() {
  console.log('🔧 LinguApp Firestore API Setup');
  console.log('================================\n');
  
  const enabled = await enableFirestoreAPI();
  
  if (enabled) {
    console.log('\n⏳ Waiting 30 seconds for API changes to propagate...');
    await new Promise(resolve => setTimeout(resolve, 30000));
    
    const connected = await testFirestoreConnection();
    
    if (connected) {
      console.log('\n🎉 SUCCESS! Firestore is now enabled and working!');
      console.log('Your LinguApp can now use Firebase Firestore in production.');
    } else {
      console.log('\n⚠️  Firestore API enabled but connection test failed.');
      console.log('Please wait a few more minutes and run: npm run test:firebase');
    }
  } else {
    console.log('\n📝 Please follow the manual setup instructions above.');
    console.log('After enabling, run: npm run test:firebase');
  }
}

// Run the script
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { enableFirestoreAPI, testFirestoreConnection };
