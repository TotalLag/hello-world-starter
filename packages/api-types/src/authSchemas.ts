/**
 * @file packages/api-types/src/authSchemas.ts
 * @description Defines Zod schemas and TypeScript types for authentication API endpoints.
 *
 * This file serves as the single source of truth for the data structures (contracts)
 * used in authentication-related API requests and responses. Zod (imported as `z`)
 * is used for schema definition, which provides:
 * 1. Runtime validation of data (e.g., ensuring an email is a valid email string).
 * 2. Static TypeScript type inference using `z.infer<typeof SchemaName>`, eliminating
 *    the need to manually define types and ensuring they stay in sync with validation rules.
 *
 * These schemas are typically used by:
 * - The frontend (`apiClient`) to validate request payloads before sending and to parse responses.
 * - Potentially by the backend (Laravel) if it were to use Zod for validation, or as a reference
 *   for its own validation rules to ensure consistency.
 * - The `extendedSchemas.ts` file in this package builds upon these base schemas to provide
 *   more user-friendly or UI-specific validation messages for frontend forms.
 *
 * For a learner:
 * - Zod is a powerful library for data validation and schema definition.
 * - `z.object({...})` defines an object schema with specified properties.
 * - `z.string()`, `z.number()`, `z.email()` are examples of type-specific validators.
 * - Methods like `.min()`, `.max()` add further constraints.
 * - `z.infer<T>` is a key feature for deriving TypeScript types directly from schemas.
 */
import { z } from 'zod';

/**
 * UserSchema defines the structure and validation rules for a user object.
 * This schema is reused across different API responses.
 * - `id`: A number, typically the user's unique identifier.
 * - `name`: A string for the user's name.
 * - `email`: A string that must also be a valid email format.
 * - `created_at`, `updated_at`: Timestamps, represented as strings (e.g., ISO 8601 format).
 */
export const UserSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string().email({ message: 'Invalid email address' }), // Example of a Zod-level message
  created_at: z.string(),
  updated_at: z.string(),
});
/** TypeScript type inferred from `UserSchema`. Represents a user object. */
export type User = z.infer<typeof UserSchema>;

/**
 * LoginRequestSchema defines the expected structure for a login request payload.
 * - `email`: Must be a string in valid email format.
 * - `password`: Must be a string.
 */
export const LoginRequestSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: z.string().min(1, { message: 'Password is required' }), // Added min(1) for basic presence
});
/** TypeScript type inferred from `LoginRequestSchema`. */
export type LoginRequest = z.infer<typeof LoginRequestSchema>;

/**
 * LoginResponseSchema defines the expected structure of a successful login API response.
 * - `token`: A string representing the authentication token (e.g., Sanctum API token).
 * - `user`: The authenticated user's details, conforming to `UserSchema`.
 */
export const LoginResponseSchema = z.object({
  token: z.string(),
  user: UserSchema, // Reuses the UserSchema
});
/** TypeScript type inferred from `LoginResponseSchema`. */
export type LoginResponse = z.infer<typeof LoginResponseSchema>;

/**
 * RegisterRequestSchema defines the structure and validation for a new user registration payload.
 * It includes specific error messages that can be used for validation feedback.
 * Note: `extendedSchemas.ts` might provide more UI-friendly overrides for these messages.
 */
export const RegisterRequestSchema = z
  .object({
    name: z
      .string({
        // `required_error` is shown if the field is missing entirely.
        required_error: 'Name is required',
        // `invalid_type_error` is shown if the field is present but not a string.
        invalid_type_error: 'Name must be a string',
      })
      .min(1, { message: 'Name is required' }), // Ensures name is not an empty string.

    email: z
      .string({
        required_error: 'Email is required',
        invalid_type_error: 'Email must be a string',
      })
      .min(1, { message: 'Email is required' })
      .email({ message: 'Please enter a valid email address' }), // Validates email format.

    password: z
      .string({
        required_error: 'Password is required',
        invalid_type_error: 'Password must be a string',
      })
      // Example: Enforce a minimum password length at the schema level.
      // Laravel's `Rules\Password::defaults()` might enforce stricter rules on the backend.
      .min(8, { message: 'Password must be at least 8 characters' }),

    password_confirmation: z
      .string({
        required_error: 'Password confirmation is required',
        invalid_type_error: 'Password confirmation must be a string',
      })
      .min(1, { message: 'Password confirmation is required' }),
  })
  // `.refine()` is used for validations that depend on multiple fields.
  // Here, it checks if `password` and `password_confirmation` match.
  .refine(
    (data) => data.password === data.password_confirmation, // The validation function.
    {
      message: "Passwords don't match", // Error message if validation fails.
      path: ['password_confirmation'], // Associates the error with the 'password_confirmation' field.
    }
  );
/** TypeScript type inferred from `RegisterRequestSchema`. */
export type RegisterRequest = z.infer<typeof RegisterRequestSchema>;

/**
 * RegisterResponseSchema defines the structure of a successful registration API response.
 * Similar to `LoginResponseSchema`, it includes the auth token and user details.
 */
export const RegisterResponseSchema = z.object({
  token: z.string(),
  user: UserSchema, // Reuses UserSchema
});
/** TypeScript type inferred from `RegisterResponseSchema`. */
export type RegisterResponse = z.infer<typeof RegisterResponseSchema>;

/**
 * GetUserResponseSchema defines the structure for the API response when fetching
 * the currently authenticated user's profile.
 * It directly reuses `UserSchema` as the response is the user object itself.
 */
export const GetUserResponseSchema = UserSchema;
/** TypeScript type inferred from `GetUserResponseSchema`. Represents the authenticated user's profile. */
export type GetUserResponse = z.infer<typeof GetUserResponseSchema>;

/**
 * LogoutResponseSchema defines the structure for the API response after a successful logout.
 * Typically, this might just be a success message.
 */
export const LogoutResponseSchema = z.object({
  message: z.string(),
});
/** TypeScript type inferred from `LogoutResponseSchema`. */
export type LogoutResponse = z.infer<typeof LogoutResponseSchema>;
