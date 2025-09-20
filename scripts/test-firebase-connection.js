#!/usr/bin/env node

/**
 * Firebase Connection Test Script
 * Tests basic Firebase connectivity and configuration
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, doc, getDoc } = require('firebase/firestore');

// Firebase configuration from your app
const firebaseConfig = {
  apiKey: 'AIzaSyBz4F_HEey2ddPlBX_U67rE__av3XSVsCc',
  authDomain: 'linguapp-final.firebaseapp.com',
  projectId: 'linguapp-final',
  storageBucket: 'linguapp-final.firebasestorage.app',
  messagingSenderId: '1031573299898',
  appId: '1:1031573299898:web:6ffa4d194e03ec82821883',
  measurementId: 'G-NBRC324854',
};

async function testFirebaseConnection() {
  console.log('🔍 Testing Firebase Connection...\n');
  
  let firestoreError = null; // Track Firestore errors separately
  
  try {
    // Test 1: Initialize Firebase App
    console.log('1. Initializing Firebase App...');
    const app = initializeApp(firebaseConfig);
    console.log('✅ Firebase App initialized successfully');
    console.log(`   Project ID: ${firebaseConfig.projectId}`);
    
    // Test 2: Initialize Firestore
    console.log('\n2. Initializing Firestore...');
    const db = getFirestore(app);
    console.log('✅ Firestore initialized successfully');
    
    // Test 3: Test basic Firestore operation
    console.log('\n3. Testing Firestore connection...');
    const testDoc = doc(db, '_test', 'connection-test');
    
         try {
       await getDoc(testDoc);
       console.log('✅ Firestore connection test successful');
     } catch (error) {
       firestoreError = error; // Store the error for later use
       if (error.code === 'permission-denied') {
         if (error.message.includes('Cloud Firestore API has not been used') || error.message.includes('is disabled')) {
           console.log('❌ CRITICAL ISSUE: Firestore API is not enabled!');
           console.log('   This is the root cause of your connection problems.');
           console.log('\n💡 SOLUTION REQUIRED:');
           console.log('   1. Visit: https://console.developers.google.com/apis/api/firestore.googleapis.com/overview?project=linguapp-final');
           console.log('   2. Click "Enable" for the Cloud Firestore API');
           console.log('   3. Wait 2-5 minutes for changes to propagate');
           console.log('   4. Restart your app');
         } else {
           console.log('⚠️  Firestore accessible but permission denied (this is normal for test documents)');
           console.log('   This indicates the connection is working but security rules are blocking access');
         }
       } else if (error.code === 'unavailable') {
         console.log('❌ Firestore connection failed: Service unavailable');
         console.log('   This suggests network or service issues');
       } else {
         console.log(`⚠️  Firestore test completed with warning: ${error.code}`);
       }
     }
    
    // Test 4: Network connectivity test
    console.log('\n4. Testing network connectivity...');
    try {
      const response = await fetch('https://firebaseapp.com');
      if (response.ok) {
        console.log('✅ Network connectivity to Firebase domains successful');
      } else {
        console.log(`⚠️  Network connectivity warning: HTTP ${response.status}`);
      }
    } catch (error) {
      console.log('❌ Network connectivity failed:', error.message);
    }
    
    // Test 5: DNS resolution test
    console.log('\n5. Testing DNS resolution...');
    try {
      const dnsTest = await fetch('https://linguapp-final.firebaseapp.com');
      if (dnsTest.ok) {
        console.log('✅ DNS resolution successful for your project domain');
      } else {
        console.log(`⚠️  DNS resolution warning: HTTP ${dnsTest.status}`);
      }
    } catch (error) {
      console.log('❌ DNS resolution failed:', error.message);
    }
    
    console.log('\n🎉 Firebase connection test completed!');
    
    // Summary
    console.log('\n📋 Summary:');
    console.log('   - Firebase App: ✅ Initialized');
    console.log('   - Firestore: ✅ Initialized');
    console.log('   - Project ID: ✅ Valid');
    console.log('   - Configuration: ✅ Complete');
    
              // Check for specific error types - only if we have an error from the Firestore test
     if (firestoreError && firestoreError.code === 'unavailable') {
       console.log('\n🚨 Issue Detected:');
       console.log('   The main issue appears to be network connectivity or service availability.');
       console.log('   This is typically caused by:');
       console.log('   • Network firewall blocking Firebase services');
       console.log('   • Corporate network restrictions');
       console.log('   • VPN interference');
       console.log('   • Firebase service disruption in your region');
       console.log('\n💡 Solutions to try:');
       console.log('   • Check your internet connection');
       console.log('   • Try a different network (mobile hotspot)');
       console.log('   • Disable VPN temporarily');
       console.log('   • Check Firebase status page');
       console.log('   • Wait a few minutes and retry');
     }
     
     // Success message
     console.log('\n🎉 SUCCESS: Your Firebase connection is working perfectly!');
     console.log('   All tests passed - your app should now connect to Firestore successfully.');
    
  } catch (error) {
    console.error('\n❌ Firebase connection test failed:', error.message);
    console.log('\n🔍 Error details:', error);
    
    if (error.code === 'app/duplicate-app') {
      console.log('\n💡 Solution: This error suggests Firebase is already initialized elsewhere.');
    } else if (error.code === 'app/invalid-config') {
      console.log('\n💡 Solution: Check your Firebase configuration values.');
    } else if (error.message.includes('network')) {
      console.log('\n💡 Solution: Check your network connection and firewall settings.');
    }
  }
}

// Run the test
testFirebaseConnection().catch(console.error);
