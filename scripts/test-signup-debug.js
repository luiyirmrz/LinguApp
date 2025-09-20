#!/usr/bin/env node

/**
 * Debug script for signup endpoint 500 error
 */

const http = require('http');

const BASE_URL = 'http://localhost:8081';

function makeRequest(path, data) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(data);
    
    const options = {
      hostname: 'localhost',
      port: 8081,
      path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
      },
    };

    const req = http.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsedData = JSON.parse(responseData);
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: parsedData,
          });
        } catch (e) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: responseData,
          });
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

async function testSignup() {
  console.log('🧪 Testing signup endpoint...');
  
  const testData = {
    '0': {
      'json': {
        'name': 'Test User',
        'email': 'newuser@example.com',
        'password': 'TestPass123!',
      },
    },
  };
  
  try {
    console.log('📤 Sending signup request...');
    console.log('Data:', JSON.stringify(testData, null, 2));
    
    const response = await makeRequest('/trpc/auth.signup', testData);
    
    console.log('\n📥 Response:');
    console.log('Status Code:', response.statusCode);
    console.log('Headers:', response.headers);
    console.log('Data:', JSON.stringify(response.data, null, 2));
    
    if (response.statusCode === 500) {
      console.log('\n❌ 500 Error detected!');
      console.log('Error details:', response.data);
    } else if (response.statusCode === 200) {
      console.log('\n✅ Signup successful!');
    } else {
      console.log('\n⚠️ Unexpected status code:', response.statusCode);
    }
    
  } catch (error) {
    console.error('❌ Request failed:', error.message);
  }
}

async function checkServer() {
  try {
    const response = await makeRequest('/', {});
    if (response.statusCode === 200) {
      console.log('✅ Server is running');
      return true;
    }
  } catch (error) {
    console.log('❌ Server is not running');
    console.log('Error:', error.message);
    return false;
  }
}

async function main() {
  console.log('🔍 Checking server status...');
  const serverRunning = await checkServer();
  
  if (serverRunning) {
    await testSignup();
  } else {
    console.log('💡 Please start the server with: npx tsx backend/server.ts');
  }
}

main().catch(console.error);
