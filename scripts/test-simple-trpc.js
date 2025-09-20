#!/usr/bin/env node

const http = require('http');

function testSimple() {
  const postData = JSON.stringify({
    '0': {
      'json': {
        'name': 'Test',
      },
    },
  });

  const options = {
    hostname: 'localhost',
    port: 8082,
    path: '/trpc/hello',
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
        console.log('✅ Simple tRPC test successful!');
      } else {
        console.log(`❌ Simple tRPC test failed with status: ${res.statusCode}`);
      }
    });
  });

  req.on('error', (e) => {
    console.error(`Problem with request: ${e.message}`);
  });

  req.write(postData);
  req.end();
}

console.log('🧪 Testing simple tRPC endpoint...');
testSimple();
