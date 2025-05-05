/**
 * @file apiClient.ts
 * @description
 * This file serves as the central hub for all frontend API interactions with the Laravel backend.
 * It configures a global Axios instance with interceptors for request and response handling,
 * such as automatically attaching authentication tokens and managing global API errors.
 *
 * The `apiClient` object exported from this file provides type-safe functions for each API
 * endpoint, leveraging Zod schemas for runtime request validation and response parsing.
 * This ensures data integrity and provides excellent developer experience with autocompletion
 * and type checking.
 *
 * For a learner:
 * - Understand how Axios is configured for a project (baseURL, default headers).
 * - See how interceptors can automate common tasks (auth headers, error logging).
 * - Observe the pattern of defining typed API functions that abstract direct HTTP calls.
 * - Note the crucial role of Zod in maintaining a strong contract between frontend and backend.
 */
import axios from 'axios';
import { useTokenStore } from '@hello-world/auth'; // Zustand store for managing auth tokens
import { logError, ErrorSeverity } from './services/errorLogger'; // Centralized error logging service

// Import Zod schemas from @hello-world/api-types.
// These schemas are essential for:
// 1. Runtime validation of request payloads before sending them to the API.
// 2. Runtime parsing and validation of API responses.
// 3. Providing static TypeScript types inferred from the schemas, ensuring type safety.
// This robust approach helps catch data-related errors early and maintains a clear
// contract between the frontend and the backend API.
import {
  LoginRequestSchema,
  LoginRequest,
  LoginResponseSchema,
  LoginResponse,
  RegisterRequestSchema,
  RegisterRequest,
  RegisterResponseSchema,
  RegisterResponse,
  GetUserResponseSchema,
  GetUserResponse,
  LogoutResponseSchema,
  LogoutResponse,
} from '@hello-world/api-types/src/authSchemas';
import {
  NoteSchema,
  Note,
  GetNotesResponseSchema,
  GetNotesResponse,
  CreateNoteRequestSchema,
  CreateNoteRequest,
  CreateNoteResponseSchema,
  CreateNoteResponse,
} from '@hello-world/api-types/src/noteSchemas';

// --- API Configuration ---

// Define the base URL for the Laravel API.
// `process.env['NEXT_PUBLIC_API_HOST']` is used to access environment variables in Next.js.
// The `NEXT_PUBLIC_` prefix makes the variable accessible on the client-side.
// Ensure the Laravel backend application is running and accessible at this address.
// For local development, this typically defaults to 'http://localhost:8000'.
const API_HOST = process.env['NEXT_PUBLIC_API_HOST'] || 'http://localhost:8000';
const API_BASE_URL = `${API_HOST}/api`; // Standard practice to namespace API routes under '/api'

// --- Axios Instance Setup ---

// Note on CSRF: For stateless API authentication (like Sanctum token-based auth),
// traditional CSRF protection via tokens in requests is often not necessary because
// the Bearer token itself serves as a credential. If using Sanctum's cookie-based SPA
// authentication, CSRF mechanisms would be relevant. This setup assumes token-based auth.

/**
 * Global Axios instance.
 * Configuring a single instance allows for centralized setup of:
 * - Base URL for all API requests.
 * - Default headers (e.g., 'Accept', 'Content-Type').
 * - Interceptors for global request/response transformations and error handling.
 * - `withCredentials: true` is included for scenarios where cookies might be involved
 *   (e.g., if parts of the API used Sanctum's cookie-based SPA auth, or other cookie needs).
 *   It doesn't interfere with token-based authentication.
 */
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest', // Often needed for Laravel Sanctum CSRF protection if using web routes, but good practice for API consistency
  },
  withCredentials: true, // Important for Sanctum cookie-based auth if used, also helps with CSRF if applicable
});

// --- Axios Interceptors ---
// Interceptors allow you to run code or modify requests/responses globally.

/**
 * Axios Request Interceptor.
 * This function is executed before any request is sent.
 * Its primary purpose here is to:
 * 1. Retrieve the authentication token from the `useTokenStore`.
 *    `useTokenStore.getState()` provides synchronous access to the store's current state,
 *    which is suitable for use within interceptors.
 * 2. If a token exists, attach it to the `Authorization` header as a Bearer token.
 * This is a common and clean pattern for handling authentication tokens, ensuring
 * that all necessary requests are authenticated without repetitive logic in each API call function.
 */
axiosInstance.interceptors.request.use(
  (config) => {
    const token = useTokenStore.getState().token;
    if (token) {
      // Attach the token for API routes that require authentication.
      // Most authenticated routes will expect a 'Bearer' token.
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config; // The modified config must be returned.
  },
  (error) => {
    // Handle request errors (e.g., network issue before sending)
    logError(error, ErrorSeverity.ERROR, { action: 'API_Request_Interceptor' });
    return Promise.reject(error);
  }
);

/**
 * Axios Response Interceptor.
 * This function is executed when a response is received or an error occurs.
 * It's used for global response handling:
 * 1. Successful responses (2xx status codes) are passed through.
 * 2. API errors are caught and processed:
 *    - Unauthorized (401) errors trigger token clearance from `useTokenStore`
 *      and log the event. This is a standard security and UX measure.
 *      Further actions like redirecting to a login page can be added here or handled by UI components.
 *    - Other errors (4xx, 5xx) are logged with appropriate severity using the
 *      centralized `logError` service, providing context like URL, method, and status code.
 *    - In development, errors are also logged to the console for immediate visibility.
 * 3. The error is re-rejected (`Promise.reject(error)`), allowing individual API call sites
 *    or UI components to implement specific error handling logic if needed (e.g., displaying
 *    a user-friendly message for a particular failed request).
 */
axiosInstance.interceptors.response.use(
  (response) => response, // Pass through successful responses
  (error) => {
    const requestUrl = error.config?.url || 'unknown_url';
    const requestMethod =
      error.config?.method?.toUpperCase() || 'UNKNOWN_METHOD';
    const statusCode = error.response?.status;

    if (statusCode === 401) {
      logError(error, ErrorSeverity.WARNING, {
        action: 'API_Unauthorized_Response',
        additionalData: { url: requestUrl, method: requestMethod, statusCode },
      });
      // Critical step: Clear the potentially invalid token.
      // This prevents the app from continuing to use an invalid session.
      useTokenStore.getState().clearToken();
      // Consider global navigation to login page here or let UI components react to token absence.
      // Example: window.location.href = '/login'; (if not in a pure library context)
    } else {
      let severity = ErrorSeverity.ERROR;
      if (statusCode >= 500) {
        severity = ErrorSeverity.CRITICAL; // Server-side errors
      } else if (statusCode >= 400 && statusCode < 500) {
        severity = ErrorSeverity.WARNING; // Client-side request errors (e.g., bad request, not found)
      }

      logError(error, severity, {
        action: 'API_Error_Response',
        additionalData: {
          url: requestUrl,
          method: requestMethod,
          statusCode,
          responseData: error.response?.data, // Include response data for debugging
        },
      });
    }

    // For easier debugging during development, log concise error to console.
    if (process.env['NODE_ENV'] !== 'production') {
      console.error(
        `[API Client Error] ${requestMethod} ${requestUrl} - Status: ${statusCode}`,
        error.response?.data || error.message
      );
    }

    // Important: Re-reject the error so that the original caller can also handle it.
    return Promise.reject(error);
  }
);

// --- Typed API Client ---

/**
 * `apiClient` provides a collection of strongly-typed functions for interacting with the backend API.
 * Each function encapsulates an API endpoint, handling request/response logic and leveraging Zod
 * for validation and type safety. This abstraction simplifies API calls from UI components and hooks.
 *
 * For a learner:
 * - This demonstrates the "Service Layer" or "Repository" pattern for data fetching.
 * - Each function clearly defines its purpose, request parameters, and response type.
 * - Zod schemas (`*.parse()`) are used for:
 *   1. Validating the structure and types of request data before sending.
 *   2. Validating the structure and types of response data upon receipt.
 *   This catches errors early and ensures data consistency.
 */
export const apiClient = {
  // --- Authentication Endpoints ---
  auth: {
    /**
     * Logs a user in.
     * Validates credentials against `LoginRequestSchema`, sends a POST request to `/auth/login`,
     * and parses the response with `LoginResponseSchema`.
     * @param credentials - User's email and password.
     * @returns A promise that resolves to the login response, typically including a token and user data.
     */
    login: async (credentials: LoginRequest): Promise<LoginResponse> => {
      // Runtime validation of the request payload.
      // If validation fails, Zod throws an error, preventing the API call.
      LoginRequestSchema.parse(credentials);
      const response = await axiosInstance.post('/auth/login', credentials);
      // Runtime validation and parsing of the response data.
      // Ensures the frontend receives data in the expected format.
      return LoginResponseSchema.parse(response.data);
    },

    /**
     * Registers a new user.
     * Validates registration data against `RegisterRequestSchema`, sends a POST request to `/auth/register`,
     * and parses the response with `RegisterResponseSchema`.
     * @param data - User registration details (name, email, password).
     * @returns A promise that resolves to the registration response.
     */
    register: async (data: RegisterRequest): Promise<RegisterResponse> => {
      RegisterRequestSchema.parse(data);
      const response = await axiosInstance.post('/auth/register', data);
      return RegisterResponseSchema.parse(response.data);
    },

    /**
     * Logs the current user out.
     * Sends a POST request to `/auth/logout` (typically invalidating the token on the server).
     * Parses the response, usually a success message, with `LogoutResponseSchema`.
     * @returns A promise that resolves to the logout response.
     */
    logout: async (): Promise<LogoutResponse> => {
      const response = await axiosInstance.post('/auth/logout');
      return LogoutResponseSchema.parse(response.data);
    },

    /**
     * Fetches the currently authenticated user's profile.
     * Sends a GET request to `/auth/user` (requires a valid auth token).
     * Parses the response with `GetUserResponseSchema`.
     * @returns A promise that resolves to the user's profile data.
     */
    getUser: async (): Promise<GetUserResponse> => {
      const response = await axiosInstance.get('/auth/user');
      return GetUserResponseSchema.parse(response.data);
    },
  },

  // --- Notes Endpoints ---
  notes: {
    /**
     * Fetches a list of notes for the authenticated user.
     * Sends a GET request to `/notes`.
     * Parses the response (an array of notes) with `GetNotesResponseSchema`.
     * @returns A promise that resolves to an array of notes.
     */
    getNotes: async (): Promise<GetNotesResponse> => {
      const response = await axiosInstance.get('/notes');
      return GetNotesResponseSchema.parse(response.data);
    },

    /**
     * Creates a new note for the authenticated user.
     * Validates the note data against `CreateNoteRequestSchema`, sends a POST request to `/notes`,
     * and parses the created note data with `CreateNoteResponseSchema`.
     * @param data - The title and content of the note to create.
     * @returns A promise that resolves to the newly created note.
     */
    createNote: async (
      data: CreateNoteRequest
    ): Promise<CreateNoteResponse> => {
      CreateNoteRequestSchema.parse(data);
      const response = await axiosInstance.post('/notes', data);
      return CreateNoteResponseSchema.parse(response.data);
    },
  },

  // --- Example Endpoint ---
  /**
   * Example of a simple GET request to a hypothetical `/hello` endpoint.
   * This demonstrates the basic structure for adding new API calls.
   * @returns A promise that resolves to an object with a message string.
   */
  hello: async (): Promise<{ message: string }> => {
    // For endpoints without Zod schemas (e.g., simple ones or those not yet typed),
    // response.data is used directly. However, defining Zod schemas is highly recommended.
    const response = await axiosInstance.get('/hello');
    return response.data;
  },
};
