import { schemas } from './generated/api-client';
import { z } from 'zod';

/**
 * Extended schemas with custom error messages
 *
 * IMPORTANT: When updating validation rules or messages in Laravel controllers,
 * make sure to update the corresponding error messages here to keep them in sync.
 *
 * See:
 * - apps/laravel-api/app/Http/Controllers/AuthController.php
 * - apps/laravel-api/app/Http/Controllers/NoteController.php
 */

/**
 * Extended Register Request Schema with custom error messages
 */
export const ExtendedRegisterSchema = schemas.auth_register_Body
  .extend({
    name: z
      .string({
        invalid_type_error: 'Name must be a string',
      })
      .min(1, { message: 'Please enter your name' })
      .max(255, { message: 'Name must be less than 255 characters' }),

    email: z
      .string({
        invalid_type_error: 'Email must be a string',
      })
      .min(1, { message: 'Email is required' })
      .max(255)
      .email({ message: 'Please enter a valid email address' }),

    password: z
      .string({
        invalid_type_error: 'Password must be a string',
      })
      .min(8, { message: 'Password must be at least 8 characters' }),

    password_confirmation: z
      .string({
        invalid_type_error: 'Password confirmation must be a string',
      })
      .min(1, { message: 'Password confirmation is required' }),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: "Passwords don't match",
    path: ['password_confirmation'],
  });

/**
 * Extended Login Request Schema with custom error messages
 */
export const ExtendedLoginSchema = schemas.auth_login_Body.extend({
  email: z
    .string({
      invalid_type_error: 'Email must be a string',
    })
    .min(1, { message: 'Email is required' })
    .email({ message: 'Please enter a valid email address' }),

  password: z
    .string({
      invalid_type_error: 'Password must be a string',
    })
    .min(1, { message: 'Password is required' }),
});

/**
 * Extended Note Request Schema with custom error messages
 */
export const ExtendedNoteSchema = schemas.note_store_Body.extend({
  title: z
    .string({
      invalid_type_error: 'Title must be a string',
    })
    .min(1, { message: 'Title is required' })
    .max(255, { message: 'Title must be less than 255 characters' }),

  content: z
    .string({
      invalid_type_error: 'Content must be a string',
    })
    .min(1, { message: 'Content is required' }),
});

// Export types based on the extended schemas
export type ExtendedRegisterRequest = z.infer<typeof ExtendedRegisterSchema>;
export type ExtendedLoginRequest = z.infer<typeof ExtendedLoginSchema>;
export type ExtendedNoteRequest = z.infer<typeof ExtendedNoteSchema>;

// Re-export other schemas from the generated file
export { schemas };
