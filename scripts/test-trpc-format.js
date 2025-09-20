#!/usr/bin/env node

const http = require('http');

// Test different tRPC request formats

function makeRequest(path, data, format) {
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
        resolve({
          format,
          statusCode: res.statusCode,
          data: responseData,
        });
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

async function testFormats() {
  console.log('🧪 Testing different tRPC request formats...');
  
  const testData = {
    name: 'Test User',
    email: 'newuser@example.com',
    password: 'TestPass123!',
  };
  
  // Format 1: Standard tRPC format
  const format1 = {
    '0': {
      'json': testData,
    },
  };
  
  // Format 2: Direct object
  const format2 = testData;
  
  // Format 3: Different tRPC format
  const format3 = {
    'input': {
      '0': {
        'json': testData,
      },
    },
  };
  
  // Format 4: Query parameter style
  const format4 = {
    '0': testData,
  };
  
  const formats = [
    { name: 'Standard tRPC', data: format1 },
    { name: 'Direct object', data: format2 },
    { name: 'Input wrapper', data: format3 },
    { name: 'Simple array', data: format4 },
  ];
  
  for (const format of formats) {
    console.log(`\n📤 Testing ${format.name}:`);
    console.log(`Data: ${JSON.stringify(format.data)}`);
    
    try {
      const result = await makeRequest('/trpc/auth.signup', format.data, format.name);
      console.log(`Status: ${result.statusCode}`);
      
      if (result.statusCode === 200) {
        console.log('✅ SUCCESS!');
        console.log(`Response: ${result.data}`);
      } else {
        console.log('❌ Failed');
        // Only show first part of error to avoid clutter
        const shortError = `${result.data.substring(0, 200)  }...`;
        console.log(`Error: ${shortError}`);
      }
    } catch (error) {
      console.log(`❌ Request failed: ${error.message}`);
    }
  }
}

testFormats().catch(console.error);
