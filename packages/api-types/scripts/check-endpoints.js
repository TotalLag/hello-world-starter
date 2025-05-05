#!/usr/bin/env node

/**
 * This script demonstrates how to check all available endpoints in the generated API client.
 * Run it with: node packages/api-types/scripts/check-endpoints.js
 */

// Import the generated API client
// First, let's check if the file exists
const fs = require('fs');
const path = require('path');

const apiClientPath = path.resolve(__dirname, '../src/generated/api-client.ts');
const indexPath = path.resolve(__dirname, '../src/generated/index.ts');

// Check if the files exist
if (!fs.existsSync(apiClientPath)) {
  console.error('Error: API client file not found at:', apiClientPath);
  console.error(
    'Please run "yarn generate-api-types" first to generate the API client.'
  );
  process.exit(1);
}

console.log('API client file found at:', apiClientPath);
console.log('Reading the file to extract endpoint information...');

// Read the file content
const apiClientContent = fs.readFileSync(apiClientPath, 'utf8');

// Extract endpoint information using regex
const endpointRegex =
  /method:\s*['"](\w+)['"],\s*path:\s*['"]([^'"]+)['"],\s*alias:\s*['"]([^'"]+)['"]/g;
const extractedEndpoints = [];
let match;

while ((match = endpointRegex.exec(apiClientContent)) !== null) {
  extractedEndpoints.push({
    method: match[1],
    path: match[2],
    alias: match[3],
  });
}

// Function to organize endpoints by prefix
function organizeEndpoints(endpointList) {
  // Group endpoints by prefix (e.g., 'auth', 'note')
  const groupedEndpoints = endpointList.reduce((acc, endpoint) => {
    const [prefix] = endpoint.alias.split('.');
    if (!acc[prefix]) {
      acc[prefix] = [];
    }
    acc[prefix].push(endpoint);
    return acc;
  }, {});

  return {
    // All available endpoints
    all: endpointList,
    // Endpoints grouped by prefix
    grouped: groupedEndpoints,
    // Count of endpoints
    count: endpointList.length,
  };
}

// Organize the extracted endpoints
const endpointInfo = organizeEndpoints(extractedEndpoints);

// Print the results
console.log('=== Available API Endpoints ===');
console.log(`Total endpoints: ${endpointInfo.count}`);
console.log('\n=== Grouped by prefix ===');

// Print endpoints grouped by prefix
Object.entries(endpointInfo.grouped).forEach(([prefix, endpointList]) => {
  console.log(`\n${prefix.toUpperCase()} (${endpointList.length}):`);
  endpointList.forEach((endpoint) => {
    console.log(
      `  - ${endpoint.method.toUpperCase()} ${endpoint.path} (alias: ${endpoint.alias})`
    );
  });
});

// Check if our example client implements all endpoints
console.log('\n=== Checking implementation coverage ===');
console.log('To ensure your apiClient.example.ts covers all endpoints:');
console.log(
  '1. Compare the endpoints listed above with those implemented in your client'
);
console.log('2. Add any missing endpoints to your client implementation');
console.log(
  '3. Run this script again after updating your API to check for new endpoints'
);

// Example of how to check if a specific endpoint exists
const endpointToCheck = 'auth.login';
const endpointExists = endpointInfo.all.some(
  (endpoint) => endpoint.alias === endpointToCheck
);
if (endpointExists) {
  console.log(`\nEndpoint '${endpointToCheck}' exists in the API client.`);
} else {
  console.log(
    `\nEndpoint '${endpointToCheck}' does NOT exist in the API client.`
  );
}
