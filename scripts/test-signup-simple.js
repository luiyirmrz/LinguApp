#!/usr/bin/env node

const http = require('http');

function testSignup() {
  const postData = JSON.stringify({
    '0': {
      'json': {
        'name': 'Test User',
        'email': 'newuser@example.com', 
        'password': 'TestPass123!',
      },
    },
  });

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
    console.log(`Status: ${res.statusCode}`);
    console.log('Headers:', res.headers);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('Response:', data);
      
      if (res.statusCode === 200) {
        console.log('✅ Signup successful!');
      } else if (res.statusCode === 400) {
        console.log('❌ Bad Request - Input validation error');
      } else if (res.statusCode === 500) {
        console.log('❌ Internal Server Error');
      } else {
        console.log(`⚠️ Unexpected status: ${res.statusCode}`);
      }
    });
  });

  req.on('error', (e) => {
    console.error(`Problem with request: ${e.message}`);
  });

  req.write(postData);
  req.end();
}

console.log('🧪 Testing signup endpoint...');
testSignup();
