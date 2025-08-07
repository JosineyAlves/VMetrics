const fetch = require('node-fetch');

// Test configuration
const API_KEY = 'test_api_key'; // Replace with actual API key for testing
const BASE_URL = 'http://localhost:3000'; // Adjust if needed

async function testForceRefresh(endpoint, params = {}) {
  console.log(`\n🧪 Testing ${endpoint} with force_refresh...`);
  
  try {
    // Test without force_refresh
    const normalParams = new URLSearchParams({
      api_key: API_KEY,
      ...params
    });
    
    const normalResponse = await fetch(`${BASE_URL}/api/${endpoint}?${normalParams}`);
    console.log(`✅ Normal request (${endpoint}): ${normalResponse.status}`);
    
    // Test with force_refresh
    const forceParams = new URLSearchParams({
      api_key: API_KEY,
      force_refresh: 'true',
      ...params
    });
    
    const forceResponse = await fetch(`${BASE_URL}/api/${endpoint}?${forceParams}`);
    console.log(`✅ Force refresh request (${endpoint}): ${forceResponse.status}`);
    
    return true;
  } catch (error) {
    console.error(`❌ Error testing ${endpoint}:`, error.message);
    return false;
  }
}

async function runTests() {
  console.log('🚀 Starting force_refresh tests...\n');
  
  const endpoints = [
    'report',
    'campaigns', 
    'conversions',
    'tracks',
    'dashboard',
    'settings',
    'performance',
    'funnel'
  ];
  
  const testParams = {
    date_from: '2024-01-01',
    date_to: '2024-01-31'
  };
  
  let passed = 0;
  let total = 0;
  
  for (const endpoint of endpoints) {
    total++;
    const success = await testForceRefresh(endpoint, testParams);
    if (success) passed++;
  }
  
  console.log(`\n📊 Test Results: ${passed}/${total} endpoints passed`);
  
  if (passed === total) {
    console.log('🎉 All force_refresh tests passed!');
  } else {
    console.log('⚠️ Some tests failed. Check the logs above.');
  }
}

// Run tests
runTests().catch(console.error); 