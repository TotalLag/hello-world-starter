#!/usr/bin/env node

/**
 * Post-processes the auto-generated Zod schemas to add .min(1) validation for required fields.
 * This script should be run after generating the API types.
 */

const fs = require('fs');
const path = require('path');

// Paths
const OPENAPI_JSON_PATH = path.resolve(
  __dirname,
  '../../../apps/laravel-api/storage/openapi.json'
);
const OUTPUT_DIR = path.resolve(__dirname, '../src/generated');
const ZOD_CLIENT_FILE = path.resolve(OUTPUT_DIR, 'api-client.ts');

// Function to parse OpenAPI spec and extract required fields
function getRequiredFieldsFromOpenAPI() {
  const openApiSpec = JSON.parse(fs.readFileSync(OPENAPI_JSON_PATH, 'utf8'));
  const requiredFieldsMap = {};

  // Process each path and operation
  Object.entries(openApiSpec.paths).forEach(([path, pathItem]) => {
    Object.entries(pathItem).forEach(([method, operation]) => {
      if (
        operation.operationId &&
        operation.requestBody?.content?.['application/json']?.schema
      ) {
        const schema = operation.requestBody.content['application/json'].schema;
        const schemaName = operation.operationId.replace(/\./g, '_') + '_Body';

        if (schema.required && schema.required.length > 0) {
          requiredFieldsMap[schemaName] = schema.required;
        }
      }
    });
  });

  return requiredFieldsMap;
}

// Function to add min(1) validation to required string fields in generated Zod schemas
function addRequiredValidationToZodSchemas(requiredFieldsMap) {
  let content = fs.readFileSync(ZOD_CLIENT_FILE, 'utf8');

  // For each schema with required fields
  Object.entries(requiredFieldsMap).forEach(([schemaName, requiredFields]) => {
    // Find the schema definition
    const schemaRegex = new RegExp(
      `const ${schemaName} = z\\s*\\.object\\(\\{([^}]+)\\}\\)\\s*\\.passthrough\\(\\);`,
      's'
    );
    const match = content.match(schemaRegex);

    if (match) {
      let schemaContent = match[1];

      // For each required field, add min(1) validation for string fields
      requiredFields.forEach((field) => {
        // Only add min(1) to string fields that don't already have validation
        const fieldRegex = new RegExp(
          `${field}:\\s*z\\.string\\(\\)([^,]*)`,
          'g'
        );
        schemaContent = schemaContent.replace(fieldRegex, (match, p1) => {
          // If it already has validation, don't modify it
          if (p1.includes('.min(') || p1.includes('.email()')) {
            return match;
          }

          // Add min(1) validation with field name in the message
          return `${field}: z.string().min(1, { message: '${field} is required' })${p1}`;
        });
      });

      // Replace the schema content
      content = content.replace(match[1], schemaContent);
    }
  });

  return content;
}

try {
  console.log(
    'Post-processing Zod schemas to add required field validation...'
  );
  const requiredFieldsMap = getRequiredFieldsFromOpenAPI();
  const updatedContent = addRequiredValidationToZodSchemas(requiredFieldsMap);
  fs.writeFileSync(ZOD_CLIENT_FILE, updatedContent);
  console.log('Added required field validation to Zod schemas');
} catch (error) {
  console.error('Error post-processing Zod schemas:', error);
  process.exit(1);
}
