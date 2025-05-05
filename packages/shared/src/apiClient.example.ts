/**
 * Enhanced API client example that combines generated types with robust error handling
 *
 * This example demonstrates the hybrid approach:
 * 1. Uses the auto-generated client and schemas from OpenAPI spec
 * 2. Enhances with robust error handling and logging
 * 3. Adds additional validation for critical operations
 */
import { createApiClient, schemas } from '@hello-world/api-types';
import axios from 'axios';
import { useTokenStore } from '@hello-world/auth';
import { logError, ErrorSeverity } from './services/errorLogger';
import { z } from 'zod';

// Define types based on the generated schemas
type LoginRequest = z.infer<typeof schemas.auth_login_Body>;
type RegisterRequest = z.infer<typeof schemas.auth_register_Body>;
type CreateNoteRequest = z.infer<typeof schemas.note_store_Body>;

// Configure the API client with the base URL
const API_HOST = process.env['NEXT_PUBLIC_API_HOST'] || 'http://localhost:8000';
const API_BASE_URL = `${API_HOST}/api`;

// Create an instance of the API client with the base URL
const baseClient = createApiClient(API_BASE_URL);

// Add custom axios interceptors for authentication and error handling
if (baseClient.axios) {
  // Add request interceptor for authentication
  baseClient.axios.interceptors.request.use(
    (config) => {
      const token = useTokenStore.getState().token;
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Add response interceptor with detailed error handling
  baseClient.axios.interceptors.response.use(
    (response) => response,
    (error) => {
      // Get request details for logging context
      const requestUrl = error.config?.url || 'unknown';
      const requestMethod = error.config?.method?.toUpperCase() || 'UNKNOWN';
      const statusCode = error.response?.status;

      // Handle specific errors (e.g., 401 Unauthorized)
      if (error.response?.status === 401) {
        logError(error, ErrorSeverity.WARNING, {
          action: 'API_Unauthorized',
          additionalData: {
            url: requestUrl,
            method: requestMethod,
            statusCode,
          },
        });

        // Clear token on unauthorized
        useTokenStore.getState().clearToken();
      } else {
        // Determine severity based on status code
        let severity = ErrorSeverity.ERROR;
        if (statusCode >= 500) {
          severity = ErrorSeverity.CRITICAL;
        } else if (statusCode >= 400 && statusCode < 500) {
          severity = ErrorSeverity.WARNING;
        }

        logError(error, severity, {
          action: 'API_Request',
          additionalData: {
            url: requestUrl,
            method: requestMethod,
            statusCode,
            responseData: error.response?.data,
          },
        });
      }

      // Development logging
      if (process.env['NODE_ENV'] !== 'production') {
        console.error(
          `API Error (${requestMethod} ${requestUrl}):`,
          error.response?.data || error.message
        );
      }

      return Promise.reject(error);
    }
  );
}

// Enhanced API client with additional validation and error handling
export const apiClient = {
  auth: {
    // Register a new user with enhanced validation and error handling
    register: async (data: RegisterRequest) => {
      try {
        // Additional pre-validation if needed
        schemas.auth_register_Body.parse(data);
        return await baseClient['auth.register'](data);
      } catch (error) {
        // Custom error handling
        logError(error, ErrorSeverity.ERROR, {
          action: 'API_Register',
          additionalData: { email: data.email },
        });
        throw error;
      }
    },

    // Login with enhanced validation and error handling
    login: async (credentials: LoginRequest) => {
      try {
        schemas.auth_login_Body.parse(credentials);
        return await baseClient['auth.login'](credentials);
      } catch (error) {
        logError(error, ErrorSeverity.ERROR, {
          action: 'API_Login',
          additionalData: { email: credentials.email },
        });
        throw error;
      }
    },

    // Logout with error handling
    logout: async () => {
      try {
        return await baseClient['auth.logout'](undefined);
      } catch (error) {
        logError(error, ErrorSeverity.ERROR, {
          action: 'API_Logout',
        });
        throw error;
      }
    },

    // Get user with error handling
    getUser: async () => {
      try {
        return await baseClient['auth.user'](undefined);
      } catch (error) {
        logError(error, ErrorSeverity.ERROR, {
          action: 'API_GetUser',
        });
        throw error;
      }
    },
  },

  notes: {
    // Get all notes with error handling
    getNotes: async () => {
      try {
        return await baseClient['note.index'](undefined);
      } catch (error) {
        logError(error, ErrorSeverity.ERROR, {
          action: 'API_GetNotes',
        });
        throw error;
      }
    },

    // Create a new note with enhanced validation and error handling
    createNote: async (data: CreateNoteRequest) => {
      try {
        schemas.note_store_Body.parse(data);
        return await baseClient['note.store'](data);
      } catch (error) {
        logError(error, ErrorSeverity.ERROR, {
          action: 'API_CreateNote',
          additionalData: { title: data.title },
        });
        throw error;
      }
    },
  },
};

// Note: This example client intentionally excludes the Swagger documentation endpoints
// (l5-swagger.default.api and l5-swagger.default.oauth2_callback) as they are only
// used for API documentation and not needed for actual API consumption.

// Export the configured client and schemas
export { baseClient, schemas };
