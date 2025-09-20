#!/usr/bin/env node

const http = require('http');

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

async function testDirectSignup() {
  console.log('🧪 Testing direct HTTP signup endpoint...');
  
  // Test 1: Valid signup data
  console.log('\n📤 Test 1: Valid signup data');
  const validData = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    password: 'SecurePass123!',
  };
  
  try {
    const response = await makeRequest('/api/auth/signup', validData);
    console.log(`Status: ${response.statusCode}`);
    console.log('Response:', JSON.stringify(response.data, null, 2));
    
    if (response.statusCode === 201) {
      console.log('✅ Valid signup successful!');
    } else {
      console.log(`❌ Valid signup failed with status: ${response.statusCode}`);
    }
  } catch (error) {
    console.error('❌ Valid signup request failed:', error.message);
  }
  
  // Test 2: Invalid email
  console.log('\n📤 Test 2: Invalid email');
  const invalidEmailData = {
    name: 'Jane Doe',
    email: 'invalid-email',
    password: 'SecurePass123!',
  };
  
  try {
    const response = await makeRequest('/api/auth/signup', invalidEmailData);
    console.log(`Status: ${response.statusCode}`);
    console.log('Response:', JSON.stringify(response.data, null, 2));
    
    if (response.statusCode === 400 && response.data.field === 'email') {
      console.log('✅ Invalid email validation working!');
    } else {
      console.log('❌ Invalid email validation failed');
    }
  } catch (error) {
    console.error('❌ Invalid email request failed:', error.message);
  }
  
  // Test 3: Weak password
  console.log('\n📤 Test 3: Weak password');
  const weakPasswordData = {
    name: 'Bob Smith',
    email: 'bob.smith@example.com',
    password: '123',
  };
  
  try {
    const response = await makeRequest('/api/auth/signup', weakPasswordData);
    console.log(`Status: ${response.statusCode}`);
    console.log('Response:', JSON.stringify(response.data, null, 2));
    
    if (response.statusCode === 400 && response.data.field === 'password') {
      console.log('✅ Weak password validation working!');
    } else {
      console.log('❌ Weak password validation failed');
    }
  } catch (error) {
    console.error('❌ Weak password request failed:', error.message);
  }
  
  // Test 4: Duplicate email
  console.log('\n📤 Test 4: Duplicate email');
  const duplicateEmailData = {
    name: 'Test User',
    email: 'test@example.com', // This should trigger duplicate email error
    password: 'SecurePass123!',
  };
  
  try {
    const response = await makeRequest('/api/auth/signup', duplicateEmailData);
    console.log(`Status: ${response.statusCode}`);
    console.log('Response:', JSON.stringify(response.data, null, 2));
    
    if (response.statusCode === 409 && response.data.field === 'email') {
      console.log('✅ Duplicate email validation working!');
    } else {
      console.log('❌ Duplicate email validation failed');
    }
  } catch (error) {
    console.error('❌ Duplicate email request failed:', error.message);
  }
  
  // Test 5: Missing fields
  console.log('\n📤 Test 5: Missing fields');
  const missingFieldsData = {
    name: 'Alice Johnson',
    // Missing email and password
  };
  
  try {
    const response = await makeRequest('/api/auth/signup', missingFieldsData);
    console.log(`Status: ${response.statusCode}`);
    console.log('Response:', JSON.stringify(response.data, null, 2));
    
    if (response.statusCode === 400 && response.data.field === 'general') {
      console.log('✅ Missing fields validation working!');
    } else {
      console.log('❌ Missing fields validation failed');
    }
  } catch (error) {
    console.error('❌ Missing fields request failed:', error.message);
  }
}

async function checkServer() {
  try {
    const options = {
      hostname: 'localhost',
      port: 8081,
      path: '/',
      method: 'GET',
    };

    return new Promise((resolve, reject) => {
      const req = http.request(options, (res) => {
        if (res.statusCode === 200) {
          console.log('✅ Server is running');
          resolve(true);
        } else {
          console.log('❌ Server returned:', res.statusCode);
          resolve(false);
        }
      });

      req.on('error', (error) => {
        console.log('❌ Server is not running');
        console.log('💡 Please start the server with: npx tsx backend/server.ts');
        resolve(false);
      });

      req.end();
    });
  } catch (error) {
    console.log('❌ Server check failed:', error.message);
    return false;
  }
}

async function main() {
  console.log('🔍 Checking server status...');
  const serverRunning = await checkServer();
  
  if (serverRunning) {
    await testDirectSignup();
    console.log('\n🎉 Direct HTTP signup endpoint tests completed!');
  }
}

main().catch(console.error);
