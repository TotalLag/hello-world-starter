#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Paths
const OPENAPI_JSON_PATH = path.resolve(
  __dirname,
  '../../../apps/laravel-api/storage/openapi.json'
);
const OUTPUT_DIR = path.resolve(__dirname, '../src/generated');
const TS_TYPES_FILE = path.resolve(OUTPUT_DIR, 'api-types.ts');
const ZOD_CLIENT_FILE = path.resolve(OUTPUT_DIR, 'api-client.ts');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Check if OpenAPI JSON exists
if (!fs.existsSync(OPENAPI_JSON_PATH)) {
  console.error(
    'OpenAPI JSON file not found. Please generate it first using the Laravel API server.'
  );
  process.exit(1);
}

try {
  // Step 1: Generate TypeScript types using openapi-typescript
  console.log('Generating TypeScript types from OpenAPI specification...');
  execSync(
    `npx openapi-typescript ${OPENAPI_JSON_PATH} --output ${TS_TYPES_FILE}`
  );
  console.log(`TypeScript types generated successfully at ${TS_TYPES_FILE}`);

  // Step 2: Generate Zod schemas and API client using openapi-zod-client
  console.log(
    'Generating Zod schemas and API client from OpenAPI specification...'
  );
  execSync(
    `npx openapi-zod-client ${OPENAPI_JSON_PATH} -o ${ZOD_CLIENT_FILE} --export-schemas --with-description --with-docs --api-client-name apiClient`
  );
  console.log(
    `Zod schemas and API client generated successfully at ${ZOD_CLIENT_FILE}`
  );

  // Step 3: Post-process the generated Zod schemas to add required field validation
  console.log('Post-processing Zod schemas...');
  execSync('node ' + path.resolve(__dirname, 'post-process-schemas.js'));
  console.log('Post-processing completed successfully');

  // Step 4: Create an index file to export everything
  const indexContent = `// Generated API types and Zod schemas
export * from './api-types';
export * from './api-client';
`;

  fs.writeFileSync(path.resolve(OUTPUT_DIR, 'index.ts'), indexContent);
  console.log(`Index file created at ${path.resolve(OUTPUT_DIR, 'index.ts')}`);

  console.log('API types and schemas generation completed successfully!');
} catch (error) {
  console.error('Error generating API types and schemas:', error);
  process.exit(1);
}
