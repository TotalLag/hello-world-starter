/**
 * @file packages/features/notes/src/hooks/useNotes.ts
 * @description Custom React Query hooks for managing note-related data operations.
 *
 * This file provides hooks to interact with the notes API:
 * - `useGetNotes`: Fetches the list of all notes.
 * - `useCreateNote`: Creates a new note.
 *
 * These hooks encapsulate the logic for API calls (via `apiClient`) and server state
 * management (caching, refetching, mutations) using `@tanstack/react-query`.
 * This approach simplifies UI components by abstracting data fetching and mutation logic.
 *
 * For a learner:
 * - `useQuery` is used for fetching (GET-like) data.
 * - `useMutation` is used for creating, updating, or deleting (POST, PUT, DELETE-like) data.
 * - `queryKey` is essential for React Query to manage caching and automatic refetching.
 * - `queryClient.invalidateQueries()` is a common pattern to refresh data after a mutation.
 */
import { apiClient } from '@hello-world/shared';
import {
  CreateNoteRequest,
  GetNotesResponse,
  CreateNoteResponse, // Import the specific response type for createNote
} from '@hello-world/api-types';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

/**
 * Custom hook to fetch the list of notes.
 * It uses React Query's `useQuery` to handle data fetching, caching, and state management.
 *
 * @returns {import('@tanstack/react-query').UseQueryResult<GetNotesResponse, Error>}
 *   The result object from `useQuery`, containing:
 *   - `data`: The fetched notes (type `GetNotesResponse`) or undefined.
 *   - `isLoading`: Boolean indicating if the query is currently fetching.
 *   - `isError`: Boolean indicating if an error occurred.
 *   - `error`: The error object if `isError` is true.
 *   - And other helpful states and functions like `refetch`, `isSuccess`, etc.
 */
export function useGetNotes() {
  return useQuery<GetNotesResponse, Error>({
    // `queryKey`: A unique key for this query. React Query uses this for caching.
    // If other parts of the app need to interact with this cached data (e.g., invalidate it),
    // they will use this same key.
    queryKey: ['notes'],
    // `queryFn`: The asynchronous function that fetches the data.
    // It calls the `getNotes` method from our `apiClient`.
    queryFn: () => apiClient.notes.getNotes(),
    // Default staleTime and cacheTime from QueryClient will be used.
    // Options like `staleTime`, `cacheTime`, `enabled`, `retry` can be configured here.
  });
}

/**
 * Custom hook to create a new note.
 * It uses React Query's `useMutation` to handle the creation process and update related data.
 *
 * @returns {import('@tanstack/react-query').UseMutationResult<CreateNoteResponse, Error, CreateNoteRequest>}
 *   The result object from `useMutation`, containing:
 *   - `mutate`: Function to trigger the mutation (takes `CreateNoteRequest` as argument).
 *   - `mutateAsync`: Async version of `mutate`.
 *   - `data`: The response from the successful mutation (type `CreateNoteResponse`) or undefined.
 *   - `isPending`: Boolean indicating if the mutation is in progress.
 *   - `isSuccess`: Boolean indicating if the mutation was successful.
 *   - `isError`: Boolean indicating if an error occurred.
 *   - `error`: The error object if `isError` is true.
 */
export function useCreateNote() {
  // `useQueryClient` provides access to the QueryClient instance,
  // which is used here to invalidate queries after a successful mutation.
  const queryClient = useQueryClient();

  return useMutation<CreateNoteResponse, Error, CreateNoteRequest>({
    // `mutationFn`: The asynchronous function that performs the mutation.
    // It takes the new note data (`CreateNoteRequest`) and calls `apiClient.notes.createNote`.
    mutationFn: (newNoteData: CreateNoteRequest) =>
      apiClient.notes.createNote(newNoteData),

    // `onSuccess`: A callback function executed if the mutation is successful.
    onSuccess: (data, variables, context) => {
      // After a new note is successfully created, we need to update the
      // list of notes displayed in the application.
      // `queryClient.invalidateQueries({ queryKey: ['notes'] })` marks the data associated
      // with the 'notes' queryKey as stale. React Query will then automatically
      // refetch this data if it's currently being observed (e.g., by a component using `useGetNotes`).
      // This ensures the UI reflects the newly created note.
      queryClient.invalidateQueries({ queryKey: ['notes'] });

      // `data` here is the `CreateNoteResponse` (the newly created note).
      // `variables` is the `CreateNoteRequest` that was passed to `mutateFn`.
      // `context` can be used if `onMutate` returned a value.
    },
    // `onError`: Callback for mutation failure.
    // `apiClient` already handles global error logging. Specific UI error handling
    // can be done in the component calling `mutate` or `mutateAsync` by checking
    // the `isError` and `error` properties from this hook.
    // onError: (error, variables, context) => {
    //   console.error("Create note failed:", error);
    // },
  });
}
