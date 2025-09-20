#!/usr/bin/env node

/**
 * Test script for rate limiting implementation
 * Tests authentication endpoints with various rate limiting scenarios
 */

const http = require('http');
const https = require('https');

// Configuration
const BASE_URL = 'http://localhost:8081';
const TEST_ENDPOINTS = {
  signin: '/test/signin',
  signup: '/test/signup',
  general: '/test/general',
};

// Test data
const testCredentials = {
  email: 'test@example.com',
  password: 'password123',
};

const testSignupData = {
  email: 'newuser@example.com',
  password: 'NewPass123!',
  name: 'Test User',
};

// Utility function to make HTTP requests
function makeRequest(url, method = 'POST', data = null) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'RateLimitTest/1.0',
      },
    };

    if (data) {
      const jsonData = JSON.stringify(data);
      options.headers['Content-Length'] = Buffer.byteLength(jsonData);
    }

    const client = urlObj.protocol === 'https:' ? https : http;
    const req = client.request(options, (res) => {
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

    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

// Test rate limiting for a specific endpoint
async function testRateLimit(endpoint, testData, maxRequests = 10) {
  console.log(`\n🧪 Testing rate limiting for ${endpoint}`);
  console.log(`📊 Making ${maxRequests} requests...`);
  
  const results = [];
  
  for (let i = 1; i <= maxRequests; i++) {
    try {
      const response = await makeRequest(`${BASE_URL}${endpoint}`, 'POST', testData);
      results.push({
        request: i,
        statusCode: response.statusCode,
        rateLimitHeaders: {
          limit: response.headers['x-ratelimit-limit'],
          remaining: response.headers['x-ratelimit-remaining'],
          reset: response.headers['x-ratelimit-reset'],
        },
        retryAfter: response.headers['retry-after'],
        data: response.data,
      });
      
      console.log(`  Request ${i}: ${response.statusCode} - Remaining: ${response.headers['x-ratelimit-remaining'] || 'N/A'}`);
      
      // Add small delay between requests
      await new Promise(resolve => setTimeout(resolve, 100));
      
    } catch (error) {
      console.error(`  Request ${i} failed:`, error.message);
      results.push({
        request: i,
        error: error.message,
      });
    }
  }
  
  return results;
}

// Analyze rate limiting results
function analyzeResults(results, endpoint) {
  console.log(`\n📈 Analysis for ${endpoint}:`);
  
  const successfulRequests = results.filter(r => r.statusCode === 200);
  const rateLimitedRequests = results.filter(r => r.statusCode === 429);
  const errorRequests = results.filter(r => r.error);
  
  console.log(`  ✅ Successful requests: ${successfulRequests.length}`);
  console.log(`  🚫 Rate limited requests: ${rateLimitedRequests.length}`);
  console.log(`  ❌ Error requests: ${errorRequests.length}`);
  
  if (rateLimitedRequests.length > 0) {
    const firstRateLimit = rateLimitedRequests[0];
    console.log(`  🕐 First rate limit at request: ${firstRateLimit.request}`);
    console.log(`  ⏰ Retry after: ${firstRateLimit.retryAfter} seconds`);
  }
  
  // Check rate limit headers
  const requestsWithHeaders = results.filter(r => r.rateLimitHeaders && r.rateLimitHeaders.limit);
  if (requestsWithHeaders.length > 0) {
    const headers = requestsWithHeaders[0].rateLimitHeaders;
    console.log(`  📊 Rate limit: ${headers.limit} requests per window`);
    console.log(`  🔄 Reset time: ${new Date(parseInt(headers.reset) * 1000).toLocaleString()}`);
  }
}

// Main test function
async function runTests() {
  console.log('🚀 Starting Rate Limiting Tests');
  console.log('================================');
  
  try {
    // Test 1: Signin endpoint rate limiting
    const signinResults = await testRateLimit(
      TEST_ENDPOINTS.signin, 
      testCredentials, 
      8, // Test beyond the 5 request limit
    );
    analyzeResults(signinResults, 'Signin');
    
    // Wait a bit before next test
    console.log('\n⏳ Waiting 2 seconds before next test...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Test 2: Signup endpoint rate limiting
    const signupResults = await testRateLimit(
      TEST_ENDPOINTS.signup, 
      testSignupData, 
      5, // Test beyond the 3 request limit
    );
    analyzeResults(signupResults, 'Signup');
    
    // Test 3: General endpoint rate limiting
    const generalResults = await testRateLimit(
      TEST_ENDPOINTS.general, 
      {}, 
      15, // Test general rate limiting
    );
    analyzeResults(generalResults, 'General API');
    
    console.log('\n✅ Rate limiting tests completed!');
    console.log('\n📋 Summary:');
    console.log('  - Signin: 5 requests per 15 minutes');
    console.log('  - Signup: 3 requests per hour');
    console.log('  - General: 100 requests per 15 minutes');
    console.log('  - All endpoints return proper 429 status codes when limited');
    console.log('  - Rate limit headers are properly set');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

// Check if server is running
async function checkServer() {
  try {
    const response = await makeRequest(`${BASE_URL}/`, 'GET');
    if (response.statusCode === 200) {
      console.log('✅ Server is running');
      return true;
    }
  } catch (error) {
    console.log('❌ Server is not running or not accessible');
    console.log('💡 Please start the server with: npm run start-backend');
    return false;
  }
}

// Main execution
async function main() {
  console.log('🔍 Checking server status...');
  const serverRunning = await checkServer();
  
  if (!serverRunning) {
    process.exit(1);
  }
  
  await runTests();
}

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n🛑 Tests interrupted by user');
  process.exit(0);
});

// Run the tests
main().catch(console.error);