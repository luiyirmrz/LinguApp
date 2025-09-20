#!/usr/bin/env node

/**
 * Simple rate limiting test
 */

const http = require('http');

const BASE_URL = 'http://localhost:8081';

function makeRequest(path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 8081,
      path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': 2,
      },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data,
        });
      });
    });

    req.on('error', reject);
    req.write('{}');
    req.end();
  });
}

async function testRateLimit() {
  console.log('🧪 Testing rate limiting...');
  
  try {
    // Test signin endpoint (should be limited to 5 requests per 15 minutes)
    console.log('\n📊 Testing signin endpoint (limit: 5 requests per 15 minutes)');
    
    for (let i = 1; i <= 7; i++) {
      const response = await makeRequest('/test/signin');
      console.log(`  Request ${i}: ${response.statusCode} - Remaining: ${response.headers['x-ratelimit-remaining'] || 'N/A'}`);
      
      if (response.statusCode === 429) {
        console.log(`  🚫 Rate limited! Retry after: ${response.headers['retry-after']} seconds`);
        break;
      }
      
      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log('\n✅ Rate limiting test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Check server first
async function checkServer() {
  try {
    const response = await makeRequest('/');
    if (response.statusCode === 200) {
      console.log('✅ Server is running');
      return true;
    }
  } catch (error) {
    console.log('❌ Server is not running');
    console.log('💡 Please start the server with: npx tsx backend/server.ts');
    return false;
  }
}

async function main() {
  const serverRunning = await checkServer();
  if (serverRunning) {
    await testRateLimit();
  }
}

main().catch(console.error);
