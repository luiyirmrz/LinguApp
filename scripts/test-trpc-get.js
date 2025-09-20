#!/usr/bin/env node

const http = require('http');

function testTRPCGet() {
  // Try GET request with query parameters
  const input = encodeURIComponent(JSON.stringify({
    name: 'Test User',
    email: 'newuser@example.com',
    password: 'TestPass123!',
  }));
  
  const options = {
    hostname: 'localhost',
    port: 8081,
    path: `/trpc/auth.signup?input=${input}`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const req = http.request(options, (res) => {
    console.log(`Status: ${res.statusCode}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('Response:', data);
      
      if (res.statusCode === 200) {
        console.log('✅ tRPC GET test successful!');
      } else {
        console.log(`❌ tRPC GET test failed with status: ${res.statusCode}`);
      }
    });
  });

  req.on('error', (e) => {
    console.error(`Problem with request: ${e.message}`);
  });

  req.end();
}

console.log('🧪 Testing tRPC with GET request...');
testTRPCGet();
