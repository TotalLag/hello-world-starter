/**
 * @file packages/api-types/src/noteSchemas.ts
 * @description Defines Zod schemas and TypeScript types for note-related API endpoints.
 *
 * This file establishes the data contracts for creating and retrieving notes.
 * Like `authSchemas.ts`, it uses Zod for schema definition, enabling runtime
 * data validation and static TypeScript type inference. These schemas ensure
 * consistency in data structures between the frontend and backend for note operations.
 *
 * For a learner:
 * - Understand how Zod schemas define the expected shape and types of data for notes.
 * - `z.array(NoteSchema)` demonstrates how to define an array of a specific schema.
 * - `.optional()` marks a field as not required.
 * - Reusability of `NoteSchema` in different response types promotes consistency.
 */
import { z } from 'zod'; // Imports Zod for schema definition and validation.

/**
 * NoteSchema defines the structure and validation rules for a single note object.
 * This schema is used to represent a note in API responses and potentially in client-side state.
 * - `id`: Unique numeric identifier for the note.
 * - `title`: String, the title of the note.
 * - `content`: String, the main content of the note.
 * - `userId`: Numeric identifier of the user who authored the note.
 * - `authorName`: Optional string. This field is likely populated by the backend when notes
 *   are fetched (e.g., by joining with the users table) to display the author's name.
 *   Marking it as `.optional()` means it might not be present in all contexts or if the author lookup fails.
 * - `created_at`, `updated_at`: Timestamps (as strings) indicating when the note was created and last updated.
 */
export const NoteSchema = z.object({
  id: z.number({
    required_error: 'Note ID is required',
    invalid_type_error: 'Note ID must be a number',
  }),
  title: z
    .string({
      required_error: 'Title is required',
      invalid_type_error: 'Title must be a string',
    })
    .min(1, { message: 'Title cannot be empty' }), // Basic validation for presence
  content: z
    .string({
      required_error: 'Content is required',
      invalid_type_error: 'Content must be a string',
    })
    .min(1, { message: 'Content cannot be empty' }), // Basic validation for presence
  userId: z.number({
    required_error: 'User ID is required',
    invalid_type_error: 'User ID must be a number',
  }),
  authorName: z.string().optional(), // Author's name, may not always be present.
  created_at: z.string(),
  updated_at: z.string(),
});
/** TypeScript type inferred from `NoteSchema`. Represents a single note. */
export type Note = z.infer<typeof NoteSchema>;

/**
 * GetNotesResponseSchema defines the structure for the API response when fetching a list of notes.
 * It expects an array, where each element conforms to `NoteSchema`.
 */
export const GetNotesResponseSchema = z.array(NoteSchema);
/** TypeScript type inferred from `GetNotesResponseSchema`. Represents an array of notes. */
export type GetNotesResponse = z.infer<typeof GetNotesResponseSchema>;

/**
 * CreateNoteRequestSchema defines the payload structure for creating a new note.
 * - `title`: The title for the new note (string).
 * - `content`: The content for the new note (string).
 */
export const CreateNoteRequestSchema = z.object({
  title: z
    .string({
      required_error: 'Title is required for creating a note',
      invalid_type_error: 'Title must be a string',
    })
    .min(1, { message: 'Title is required' }),
  content: z
    .string({
      required_error: 'Content is required for creating a note',
      invalid_type_error: 'Content must be a string',
    })
    .min(1, { message: 'Content is required' }),
});
/** TypeScript type inferred from `CreateNoteRequestSchema`. */
export type CreateNoteRequest = z.infer<typeof CreateNoteRequestSchema>;

/**
 * CreateNoteResponseSchema defines the structure for the API response after successfully creating a note.
 * It reuses `NoteSchema`, as the response is typically the newly created note object itself.
 */
export const CreateNoteResponseSchema = NoteSchema;
/** TypeScript type inferred from `CreateNoteResponseSchema`. Represents the created note. */
export type CreateNoteResponse = z.infer<typeof CreateNoteResponseSchema>;
