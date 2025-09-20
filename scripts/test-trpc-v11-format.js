#!/usr/bin/env node

const http = require('http');

function testTRPCFormat(format, data) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(data);
    
    const options = {
      hostname: 'localhost',
      port: 8081,
      path: '/trpc/auth.signup',
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
  console.log('🧪 Testing tRPC v11 request formats...');
  
  const inputData = {
    name: 'Test User',
    email: 'newuser@example.com',
    password: 'TestPass123!',
  };
  
  // Different formats to try
  const formats = [
    {
      name: 'Standard tRPC v11 batch',
      data: [{
        'id': 0,
        'jsonrpc': '2.0',
        'method': 'auth.signup',
        'params': {
          'input': inputData,
        },
      }],
    },
    {
      name: 'tRPC v11 single',
      data: {
        '0': {
          'json': inputData,
          'meta': {
            'values': ['undefined'],
          },
        },
      },
    },
    {
      name: 'Direct input',
      data: inputData,
    },
    {
      name: 'Wrapped input',
      data: {
        'input': inputData,
      },
    },
    {
      name: 'tRPC batch format',
      data: [inputData],
    },
  ];
  
  for (const format of formats) {
    console.log(`\n📤 Testing ${format.name}:`);
    console.log(`Data: ${JSON.stringify(format.data).substring(0, 100)}...`);
    
    try {
      const result = await testTRPCFormat(format.name, format.data);
      console.log(`Status: ${result.statusCode}`);
      
      if (result.statusCode === 200) {
        console.log('✅ SUCCESS!');
        console.log(`Response: ${result.data}`);
        return; // Stop on first success
      } else {
        console.log('❌ Failed');
        // Show error type
        if (result.data.includes('expected object, received undefined')) {
          console.log('  Error: Input not received');
        } else if (result.data.includes('expected string')) {
          console.log('  Error: Field validation failed');
        } else {
          console.log('  Error: Other error');
        }
      }
    } catch (error) {
      console.log(`❌ Request failed: ${error.message}`);
    }
  }
  
  console.log('\n🔍 All formats failed. This suggests a server configuration issue.');
}

testFormats().catch(console.error);
