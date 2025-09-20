#!/usr/bin/env node

const http = require('http');

function testSignin() {
  const postData = JSON.stringify({
    '0': {
      'json': {
        'email': 'test@example.com',
        'password': 'password123',
      },
    },
  });

  const options = {
    hostname: 'localhost',
    port: 8081,
    path: '/trpc/auth.signin',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData),
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
        console.log('✅ Signin successful!');
      } else {
        console.log(`❌ Signin failed with status: ${res.statusCode}`);
      }
    });
  });

  req.on('error', (e) => {
    console.error(`Problem with request: ${e.message}`);
  });

  req.write(postData);
  req.end();
}

console.log('🧪 Testing signin endpoint...');
testSignin();
