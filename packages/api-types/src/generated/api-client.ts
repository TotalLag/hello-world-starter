import { makeApi, Zodios, type ZodiosOptions } from '@zodios/core';
import { z } from 'zod';

const auth_register_Body = z
  .object({
    name: z.string().min(1, { message: 'name is required' }).max(255),
    email: z.string().max(255).email(),
    password: z.string().min(1, { message: 'password is required' }),
    password_confirmation: z
      .string()
      .min(1, { message: 'password_confirmation is required' }),
  })
  .passthrough();
const UserResource = z
  .object({
    id: z.number().int(),
    name: z.string(),
    email: z.string(),
    created_at: z.string(),
    updated_at: z.string(),
  })
  .passthrough();
const auth_login_Body = z
  .object({
    email: z.string().email(),
    password: z.string().min(1, { message: 'password is required' }),
  })
  .passthrough();
const NoteResource = z
  .object({
    id: z.number().int(),
    title: z.string(),
    content: z.string(),
    userId: z.number().int(),
    authorName: z.string().optional(),
    created_at: z.string(),
    updated_at: z.string(),
  })
  .passthrough();
const note_store_Body = z
  .object({
    title: z.string().min(1, { message: 'title is required' }).max(255),
    content: z.string().min(1, { message: 'content is required' }),
  })
  .passthrough();

export const schemas = {
  auth_register_Body,
  UserResource,
  auth_login_Body,
  NoteResource,
  note_store_Body,
};

const endpoints = makeApi([
  {
    method: 'post',
    path: '/auth/login',
    alias: 'auth.login',
    description: `Custom validation error messages for this endpoint are defined in ExtendedLoginSchema
at packages/api-types/src/extendedSchemas.ts.`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'body',
        type: 'Body',
        schema: auth_login_Body,
      },
    ],
    response: z
      .object({ message: z.string(), user: UserResource, token: z.string() })
      .passthrough(),
    errors: [
      {
        status: 422,
        description: `Validation error`,
        schema: z
          .object({
            message: z.string().describe('Errors overview.'),
            errors: z
              .record(z.array(z.string()))
              .describe(
                'A detailed description of each field that failed validation.'
              ),
          })
          .passthrough(),
      },
    ],
  },
  {
    method: 'post',
    path: '/auth/logout',
    alias: 'auth.logout',
    requestFormat: 'json',
    response: z.object({ message: z.string() }).passthrough(),
    errors: [
      {
        status: 401,
        description: `Unauthenticated`,
        schema: z
          .object({ message: z.string().describe('Error overview.') })
          .passthrough(),
      },
    ],
  },
  {
    method: 'post',
    path: '/auth/register',
    alias: 'auth.register',
    description: `Custom validation error messages for this endpoint are defined in ExtendedRegisterSchema
at packages/api-types/src/extendedSchemas.ts.`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'body',
        type: 'Body',
        schema: auth_register_Body,
      },
    ],
    response: z
      .object({ message: z.string(), user: UserResource, token: z.string() })
      .passthrough(),
    errors: [
      {
        status: 422,
        description: `Validation error`,
        schema: z
          .object({
            message: z.string().describe('Errors overview.'),
            errors: z
              .record(z.array(z.string()))
              .describe(
                'A detailed description of each field that failed validation.'
              ),
          })
          .passthrough(),
      },
    ],
  },
  {
    method: 'get',
    path: '/auth/user',
    alias: 'auth.user',
    requestFormat: 'json',
    response: UserResource,
    errors: [
      {
        status: 401,
        description: `Unauthenticated`,
        schema: z
          .object({ message: z.string().describe('Error overview.') })
          .passthrough(),
      },
    ],
  },
  {
    method: 'get',
    path: '/documentation',
    alias: 'l5-swagger.default.api',
    requestFormat: 'json',
    response: z.string(),
  },
  {
    method: 'get',
    path: '/notes',
    alias: 'note.index',
    description: `Retrieves all notes from the database with their associated authors.
This endpoint is public and does not require authentication.`,
    requestFormat: 'json',
    response: z.array(NoteResource),
  },
  {
    method: 'post',
    path: '/notes',
    alias: 'note.store',
    description: `Custom validation error messages for this endpoint are defined in ExtendedNoteSchema
at packages/api-types/src/extendedSchemas.ts.`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'body',
        type: 'Body',
        schema: note_store_Body,
      },
    ],
    response: NoteResource,
    errors: [
      {
        status: 401,
        description: `Unauthenticated`,
        schema: z
          .object({ message: z.string().describe('Error overview.') })
          .passthrough(),
      },
      {
        status: 422,
        description: `Validation error`,
        schema: z
          .object({
            message: z.string().describe('Errors overview.'),
            errors: z
              .record(z.array(z.string()))
              .describe(
                'A detailed description of each field that failed validation.'
              ),
          })
          .passthrough(),
      },
    ],
  },
  {
    method: 'get',
    path: '/oauth2-callback',
    alias: 'l5-swagger.default.oauth2_callback',
    requestFormat: 'json',
    response: z.string(),
  },
]);

export const apiClient = new Zodios(endpoints);

export function createApiClient(baseUrl: string, options?: ZodiosOptions) {
  return new Zodios(baseUrl, endpoints, options);
}
