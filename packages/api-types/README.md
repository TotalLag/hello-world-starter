# API Types Package

This package contains TypeScript types and Zod schemas for the API endpoints.

## Structure

- `src/generated/` - Auto-generated types and schemas from the OpenAPI specification
- `src/authSchemas.ts` - Manual schemas for authentication endpoints
- `src/noteSchemas.ts` - Manual schemas for note endpoints
- `src/extendedSchemas.ts` - Extended schemas with custom error messages

## Extended Schemas

The `extendedSchemas.ts` file contains extended versions of the auto-generated schemas with custom error messages. These extended schemas are the single source of truth for validation error messages in the application.

### Why Extended Schemas?

The auto-generated schemas from the OpenAPI specification don't include custom error messages. The extended schemas wrap the auto-generated schemas and add custom error messages for better user experience.

### Understanding Zod Validation and Empty Strings

#### Why We Use `.min(1)` Instead of `required_error`

In Zod, there's a critical distinction in how validation works that affects form validation:

- **`required_error`** is only triggered when a field is completely **missing** (i.e., `undefined` or `null`)
- When a user submits a form with an empty input field, the value is an **empty string** (`""`), not `undefined`
- Empty strings (`""`) will pass the "required" check in Zod because they are defined values
- However, empty strings will fail a `.min(1)` check, which ensures the string has at least one character

This behavior is important to understand because:

1. In HTML forms, empty fields are submitted as empty strings, not as `undefined`
2. The `required_error` message will never be shown for empty form fields
3. To validate that a user has entered something, we must use `.min(1)` validation

For example:

```typescript
// This will NOT show an error for empty strings ("")
z.string({ required_error: 'Field is required' });

// This WILL show an error for empty strings ("")
z.string().min(1, { message: 'Field is required' });
```

### Maintaining Extended Schemas

**IMPORTANT**: The extended schemas are the source of truth for validation error messages. When updating validation rules in Laravel controllers, make sure to update the corresponding error messages in the extended schemas.

#### Schema Generation Process

1. **OpenAPI Spec Generation**: Laravel generates an OpenAPI spec with validation rules.
2. **Schema Generation**: The `generate-api-types.js` script generates TypeScript types and Zod schemas.
3. **Post-processing**: The `post-process-schemas.js` script adds `.min(1)` validation for required fields.
4. **Extended Schemas**: The `extendedSchemas.ts` file extends the auto-generated schemas with custom error messages.

#### When to Update Extended Schemas

Update the extended schemas when:

1. Adding new fields that need custom error messages
2. Changing the desired validation error messages
3. Adding custom validation logic not covered by the auto-generated schemas

#### How to Update Extended Schemas

1. Regenerate the API types after updating Laravel controllers:

   ```bash
   cd packages/api-types
   yarn generate
   ```

2. Update the corresponding extended schema in `packages/api-types/src/extendedSchemas.ts` if needed:

   ```typescript
   export const ExtendedRegisterSchema = schemas.auth_register_Body.extend({
     name: z
       .string({
         invalid_type_error: 'Name must be a string',
       })
       .min(1, { message: 'Please enter your name' }) // <-- Update this message
       .max(255, { message: 'Name must be less than 255 characters' }),
     // ...
   });
   ```

3. After updating the Laravel API, regenerate the API types:
   ```bash
   cd packages/api-types
   yarn generate
   ```

## Usage

Import the extended schemas in your components:

```typescript
import { ExtendedRegisterSchema } from '@hello-world/api-types';

// Use the schema for validation
const validationResult = ExtendedRegisterSchema.safeParse(formData);
```
