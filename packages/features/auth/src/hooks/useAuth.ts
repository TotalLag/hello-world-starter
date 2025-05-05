/**
 * @file useAuth.ts
 * @description Custom React Query hook for managing authentication state and operations.
 *
 * This hook encapsulates all authentication-related logic, including:
 * - User login and registration.
 * - Fetching the current user's profile.
 * - User logout.
 *
 * It leverages `@tanstack/react-query` for server state management, ensuring efficient
 * data fetching, caching, and synchronization. API interactions are delegated to the
 * `apiClient`, and local authentication token persistence is handled by `useTokenStore`.
 *
 * For a learner:
 * - This hook is a central piece of the authentication feature.
 * - Understand how `useMutation` is used for actions that change server state (login, register, logout).
 * - Understand how `useQuery` is used for fetching server state (user profile).
 * - Note the interaction between React Query's cache (`queryClient`) and the `useTokenStore`.
 * - Observe how Zod-inferred types (`LoginRequest`, `RegisterRequest`) are used for type safety.
 * - The hook returns state and functions that UI components can use to trigger auth actions
 *   and display auth status.
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient, schemas } from '@hello-world/shared'; // Central API client and Zod schemas
import { useTokenStore } from '../stores/tokenStore'; // Zustand store for token management
import { z } from 'zod';

// Infer TypeScript types from Zod schemas for request payloads.
// This ensures that the data passed to mutation functions matches the expected API contract.
// `schemas.auth_login_Body` and `schemas.auth_register_Body` are Zod schemas likely generated
// from an OpenAPI specification or defined in `@hello-world/api-types`.
type LoginRequest = z.infer<typeof schemas.auth_login_Body>;
type RegisterRequest = z.infer<typeof schemas.auth_register_Body>;

/**
 * @typedef {object} User - Represents the structure of a user object.
 * Typically inferred from `apiClient.auth.getUser()` response or a Zod schema.
 * For example: { id: number; name: string; email: string; }
 */

/**
 * @typedef {object} AuthHookReturn
 * @property {import('@tanstack/react-query').UseMutationResult<LoginResponse, Error, LoginRequest>} loginMutation - React Query mutation object for login.
 *   Includes `mutateAsync`, `isPending`, `isError`, `error`, `data`.
 * @property {import('@tanstack/react-query').UseMutationResult<RegisterResponse, Error, RegisterRequest>} registerMutation - React Query mutation object for registration.
 *   Includes `mutateAsync`, `isPending`, `isError`, `error`, `data`.
 * @property {User | undefined | null} user - The currently authenticated user's data, or null/undefined if not fetched/logged in.
 * @property {(options?: { onSuccess?: () => void; onError?: (error: unknown) => void; }) => void} logout - Function to log the user out.
 * @property {boolean} isLoggingOut - True if the logout mutation is currently in progress.
 * @property {boolean} isLoadingUser - True if the user profile query is currently fetching.
 * @property {boolean} isAuthenticated - True if user data exists, the query was successful, and a token is present.
 * @property {Error | null} userError - Error object if the user profile query failed.
 * @property {any} LoginResponse - Response type for login, typically from `apiClient`.
 * @property {any} RegisterResponse - Response type for registration, typically from `apiClient`.
 */

/**
 * Custom hook `useAuth` for managing authentication logic.
 *
 * @returns {AuthHookReturn} An object containing authentication state and action handlers.
 */
export function useAuth() {
  // `queryClient` is the heart of React Query, used to interact with the cache,
  // invalidate queries, and manage query states.
  const queryClient = useQueryClient();

  // Destructure methods from `useTokenStore` for managing the auth token in secure storage.
  // `setToken`: Stores the token.
  // `clearToken`: Removes the token.
  // `hasToken`: Synchronously checks if a token exists (useful for `enabled` flags in `useQuery`).
  const { setToken, clearToken, hasToken } = useTokenStore();

  /**
   * Login Mutation.
   * Handles the user login process by calling the `apiClient.auth.login` endpoint.
   *
   * `mutationFn`: The asynchronous function that performs the mutation (API call).
   *   - Takes `credentials` (email, password) of type `LoginRequest`.
   *   - `apiClient.auth.login` already handles Zod parsing of request/response.
   * `onSuccess`: Callback executed when the mutation is successful.
   *   - Sets the received token using `setToken`.
   *   - Invalidates the `['auth', 'user']` query to trigger a refetch of user data.
   *     This ensures the app reflects the newly logged-in user's state.
   * `onError`: Callback executed if the mutation fails.
   *   - Logs the error for debugging (primary logging is in `apiClient`).
   *   - Clears any existing token and resets the user query to ensure a clean state.
   */
  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginRequest) => {
      // Note: Client-side validation of `credentials` against a Zod schema (e.g., ExtendedLoginSchema from api-types)
      // should ideally happen in the UI component *before* calling `loginMutation.mutateAsync(credentials)`.
      // This provides immediate feedback to the user. The `apiClient` also validates.
      const response = await apiClient.auth.login(credentials);
      return response; // `apiClient` ensures this response is Zod-parsed.
    },
    onSuccess: (data) => {
      // `data` is the Zod-parsed response from `apiClient.auth.login`.
      if (data.token) {
        setToken(data.token);
        // Invalidate the user query. React Query will automatically refetch data for this queryKey.
        // This is crucial for updating the UI with the authenticated user's information.
        queryClient.invalidateQueries({ queryKey: ['auth', 'user'] });
      } else {
        // This case (login success by API, but no token) should ideally be handled by robust API design
        // or more specific error types from the backend.
        console.error(
          'Login successful according to API, but no token was received in the response.'
        );
        clearToken(); // Ensure inconsistent state is cleared.
        queryClient.resetQueries({ queryKey: ['auth', 'user'] }); // Reset user data.
      }
    },
    onError: (error: any) => {
      // The `apiClient`'s response interceptor already logs errors comprehensively.
      // Additional console logging here can be for quick debugging during development.
      console.error(
        'Login mutation failed in useAuth:',
        error.message || error
      );
      if (error.response?.data) {
        console.error(
          'Server response data during login failure:',
          error.response.data
        );
      }
      clearToken(); // Critical: ensure any stale token is cleared on login failure.
      // Reset user query to ensure no stale user data is shown.
      queryClient.resetQueries({ queryKey: ['auth', 'user'] });
    },
  });

  /**
   * Registration Mutation.
   * Handles new user registration by calling `apiClient.auth.register`.
   *
   * `gcTime: 0`: Garbage collection time. Setting to 0 means React Query will not cache
   * the result of this mutation beyond its immediate use. This is often suitable for mutations
   * whose direct result isn't typically re-queried (unlike GET requests).
   */
  const registerMutation = useMutation({
    mutationFn: async (data: RegisterRequest) => {
      // Similar to login, UI components should validate `data` with a Zod schema before calling.
      const response = await apiClient.auth.register(data);
      return response; // `apiClient` ensures Zod parsing.
    },
    onSuccess: (data) => {
      if (data.token) {
        setToken(data.token);
        queryClient.invalidateQueries({ queryKey: ['auth', 'user'] }); // Fetch user data for new user.
      } else {
        console.error(
          'Registration successful according to API, but no token was received.'
        );
        // This scenario might require specific error handling or feedback to the user.
      }
    },
    onError: (error: any) => {
      console.error(
        'Register mutation failed in useAuth:',
        error.message || error
      );
      if (error.response?.data) {
        console.error(
          'Server response data during registration failure:',
          error.response.data
        );
      }
      // The mutation's state (isError, error) is automatically updated by React Query.
      // Components can use these properties to display feedback.
      // No explicit reset or cancellation is typically needed here for the mutation itself.
      // If a previous token existed, it's generally not cleared on registration failure,
      // as that's a separate concern from a failed attempt to create a new account.
    },
    gcTime: 0, // Don't cache mutation results long-term.
  });

  /**
   * User Profile Query.
   * Fetches the currently authenticated user's data using `apiClient.auth.getUser`.
   *
   * `queryKey: ['auth', 'user']`: A unique key for this query. React Query uses this for
   *   caching, refetching, and invalidation. The key structure (e.g., array of strings/objects)
   *   helps organize and target queries.
   * `queryFn`: The asynchronous function that fetches the data.
   * `enabled: hasToken()`: Crucially, this query only runs if `hasToken()` returns true.
   *   This prevents attempts to fetch user data when no auth token is present, saving resources
   *   and avoiding unnecessary errors.
   * `staleTime: 5 * 60 * 1000` (5 minutes): Data is considered fresh for 5 minutes.
   *   React Query will not refetch from the network during this period for new component mounts
   *   or query hook usages, unless the query is explicitly invalidated or refetched.
   * `retry: 1`: If the query fails, it will be retried once before marking it as errored.
   *   This can help with transient network issues.
   */
  const userQuery = useQuery({
    queryKey: ['auth', 'user'],
    queryFn: () => apiClient.auth.getUser(),
    enabled: hasToken(),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  /**
   * Logout Mutation.
   * Handles user logout by calling `apiClient.auth.logout`.
   *
   * `onSuccess`: Clears the local token and resets/removes the user query data,
   *   ensuring the application state reflects that the user is logged out.
   *   `queryClient.setQueryData(['auth', 'user'], null)` immediately updates the cached user data to null,
   *   providing a fast UI update.
   *   `queryClient.removeQueries({ queryKey: ['auth', 'user'] })` completely removes the query from the cache,
   *   which is a more thorough cleanup.
   * `onError`: Even if the API logout call fails (e.g., network issue),
   *   the client-side state is still reset to ensure the user appears logged out locally.
   *   This prioritizes a consistent client-side logged-out state.
   */
  const logoutMutation = useMutation({
    mutationFn: () => apiClient.auth.logout(),
    onSuccess: () => {
      clearToken();
      queryClient.setQueryData(['auth', 'user'], null); // Optimistic update of user data to null.
      // `removeQueries` is more thorough if we want to ensure no stale data or query state remains.
      queryClient.removeQueries({ queryKey: ['auth', 'user'] });
      // Consider invalidating/resetting other queries that depend on authentication.
      // Example: queryClient.invalidateQueries({ predicate: query => query.queryKey.includes('protected-data') });
    },
    onError: (error: any) => {
      console.error('Logout mutation failed:', error.message || error);
      // Regardless of API error, force client-side logout for consistent UX.
      clearToken();
      queryClient.setQueryData(['auth', 'user'], null);
      queryClient.removeQueries({ queryKey: ['auth', 'user'] });
    },
  });

  /**
   * Wrapper function for `logoutMutation.mutate`.
   * Provides a simpler `logout()` function to components, abstracting React Query's `mutate` call.
   * Allows passing `onSuccess` and `onError` callbacks specific to the logout call site,
   * which are executed *after* the main mutation's `onSuccess`/`onError` handlers.
   * @param {object} [options] - Optional callbacks.
   * @param {function} [options.onSuccess] - Callback on successful logout.
   * @param {function} [options.onError] - Callback on logout error.
   */
  const logout = (options?: {
    onSuccess?: () => void;
    onError?: (error: unknown) => void;
  }) => {
    // `mutate` is used for fire-and-forget mutations. `mutateAsync` returns a promise.
    return logoutMutation.mutate(undefined, {
      // `undefined` as logout takes no arguments.
      onSuccess: () => {
        // The main mutation's onSuccess (clearing token, resetting queries) runs first.
        options?.onSuccess?.(); // Then, call any component-provided onSuccess.
      },
      onError: (error) => {
        // The main mutation's onError (clearing token, resetting queries) runs first.
        options?.onError?.(error); // Then, call component-provided onError.
      },
    });
  };

  // The hook returns an object with state and functions for components to consume.
  // This pattern provides a clear API for interacting with authentication features.
  return {
    // Expose the full mutation objects to give components access to all states
    // (isPending, isError, error, data, mutateAsync, etc.).
    loginMutation,
    registerMutation,

    // User-related state derived from `userQuery`.
    user: userQuery.data,
    isLoadingUser: userQuery.isLoading, // True while fetching user data for the first time or during refetch.
    // `isAuthenticated` is a derived state: true if user data is present, successfully fetched, and a token exists.
    isAuthenticated: !!userQuery.data && userQuery.isSuccess && hasToken(),
    userError: userQuery.error, // Error object from the user query, if any.

    // Logout function and state.
    logout, // The simplified logout function.
    isLoggingOut: logoutMutation.isPending, // True if logout API call is in progress.

    // Note: The original return signature had properties like `isLoggingIn`, `loginError`.
    // These are available directly on `loginMutation.isPending`, `loginMutation.error`, etc.
    // Encouraging components to use the mutation objects directly is a common React Query pattern
    // as it provides a richer set of states and control.
  };
}
