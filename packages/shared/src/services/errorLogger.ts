/**
 * @file packages/shared/src/services/errorLogger.ts
 * @description Centralized service for error logging and user-friendly error message generation.
 *
 * This module provides a consistent way to:
 * 1. Log errors throughout the application, with severity levels and contextual information.
 *    In a production environment, this would typically integrate with an external monitoring
 *    service like Sentry, Datadog, or LogRocket.
 * 2. Generate user-friendly error messages from various error types, abstracting
 *    technical details from the end-user.
 * 3. Map structured API errors (especially validation errors from Laravel) to a
 *    format suitable for display in forms.
 *
 * The philosophy is to log detailed, raw errors for developers and monitoring,
 * while presenting clear, actionable, and non-technical messages to users.
 * This service helps decouple error handling presentation from the components or services
 * where errors might originate.
 *
 * For a learner:
 * - Understand the importance of centralized error logging for debugging and monitoring.
 * - Differentiate between logging for developers and presenting messages to users.
 * - See how to handle different error structures (e.g., Axios errors, Laravel validation)
 *   to extract meaningful information.
 * - `ErrorSeverity` and `ErrorContext` help in categorizing and understanding errors.
 */

// `process.env['NODE_ENV'] === 'production'` is a standard way in Node.js and bundler
// (like Webpack, Vite) environments to check if the application is running in production mode.
// This allows for different behaviors, such as sending logs to a remote service in production
// versus logging verbosely to the console in development.
const isProd = process.env['NODE_ENV'] === 'production';

/**
 * Defines severity levels for errors, allowing for categorization and filtering
 * in logging systems.
 */
export enum ErrorSeverity {
  INFO = 'info', // Informational messages, not necessarily errors.
  WARNING = 'warning', // Potential issues or non-critical errors.
  ERROR = 'error', // Standard errors that affect functionality.
  CRITICAL = 'critical', // Critical errors that might halt parts of the application.
}

/**
 * Interface for providing structured context when logging an error.
 * This context is invaluable for debugging, as it provides information about
 * where and why an error occurred.
 * - `userId`: Identifier for the user experiencing the error.
 * - `component`: Name of the component or module where the error originated.
 * - `action`: The specific action being performed when the error occurred (e.g., 'login', 'fetchData').
 * - `additionalData`: A flexible record for any other relevant debugging information.
 */
export interface ErrorContext {
  userId?: string | number;
  component?: string;
  action?: string;
  additionalData?: Record<string, any>;
}

/**
 * Logs an error, potentially sending it to an external logging service in production.
 *
 * @param error - The error object or value to log. Using `unknown` for type safety as errors can be varied.
 * @param severity - The severity level of the error (defaults to `ErrorSeverity.ERROR`).
 * @param context - Additional structured context about the error (defaults to an empty object).
 */
export function logError(
  error: unknown,
  severity: ErrorSeverity = ErrorSeverity.ERROR,
  context: ErrorContext = {}
): void {
  // In a real production environment, this section would integrate with a service like Sentry.
  // Example:
  // if (isProd) {
  //   Sentry.captureException(error, {
  //     level: severity,
  //     extra: context,
  //   });
  //   return;
  // }

  // For this project, we log to the console for both environments,
  // but a production setup would differ.
  if (isProd) {
    // In a real app, production logging might be less verbose or formatted differently.
    // The key is that it *would* go to a persistent, searchable logging system.
    console.error(
      `[PROD LOG - ${severity.toUpperCase()}] Error:`,
      error, // The raw error object/message.
      'Context:',
      context // Additional structured data.
    );
  } else {
    // Development logging can be more verbose and is typically directed to the console.
    console.error(
      `[DEV LOG - ${severity.toUpperCase()}] Error:`,
      error,
      'Context:',
      context
    );
  }
}

/**
 * Attempts to extract or generate a user-friendly error message from an error object.
 * This function tries to parse common error structures (like Axios errors from API responses)
 * and falls back to a generic message.
 *
 * @param error - The error object (of unknown type).
 * @returns A string containing a user-friendly error message.
 */
export function getUserFriendlyMessage(error: unknown): string {
  // Default message for truly unexpected or unparseable errors.
  let message = 'An unexpected error occurred. Please try again later.';

  // Attempt to handle errors that might come from Axios (common for API calls).
  // `error as any` is a type assertion. Used cautiously here to inspect potential properties.
  // A more type-safe approach might involve custom error classes or type guards if error structures are well-defined.
  const axiosError = error as any;
  if (axiosError?.response?.data) {
    const responseData = axiosError.response.data;

    // Specifically check for Laravel's validation error structure.
    // Laravel typically returns a 422 response with an `errors` object,
    // where keys are field names and values are arrays of error messages.
    if (
      responseData.errors &&
      typeof responseData.errors === 'object' &&
      Object.keys(responseData.errors).length > 0
    ) {
      // For simplicity, return the first message of the first field with an error.
      // A more sophisticated UI might display all field errors.
      const firstErrorField = Object.keys(responseData.errors)[0];
      if (
        firstErrorField &&
        Array.isArray(responseData.errors[firstErrorField]) &&
        responseData.errors[firstErrorField].length > 0
      ) {
        return responseData.errors[firstErrorField][0] as string;
      }
    }

    // If there's a general `message` property in the API response data, use that.
    // This is a common pattern for APIs to send back a human-readable error summary.
    if (typeof responseData.message === 'string' && responseData.message) {
      return responseData.message;
    }
  }

  // If the error is a standard JavaScript `Error` instance, use its message.
  // In development, this can provide more direct feedback. In production,
  // we might still prefer the generic message to avoid exposing technical details.
  if (error instanceof Error) {
    if (!isProd) {
      message = error.message;
    }
    // In production, we might choose to not use `error.message` directly if it could be too technical.
    // The default generic message would be used unless overridden by API response parsing above.
  }

  return message;
}

/**
 * Maps an error object (especially from an API) to a record of field-specific errors.
 * This is particularly useful for populating form field errors based on backend validation.
 *
 * @param error - The error object (of unknown type).
 * @returns A record where keys are field names and values are error messages, or `null` if no field-specific errors could be mapped.
 */
export function mapErrorToFields(
  error: unknown
): Record<string, string> | null {
  const axiosError = error as any; // Type assertion for inspecting error structure.
  if (axiosError?.response?.data) {
    const responseData = axiosError.response.data;

    // Handle Laravel's standard validation error structure (`errors` object).
    // The backend (Laravel) is the source of truth for these validation messages.
    if (responseData.errors && typeof responseData.errors === 'object') {
      const fieldErrors: Record<string, string> = {};
      let hasFieldErrors = false;
      // Iterate over the `errors` object from the API response.
      Object.entries(responseData.errors).forEach(([field, messages]) => {
        // Laravel typically sends messages as an array of strings for each field.
        if (
          Array.isArray(messages) &&
          messages.length > 0 &&
          typeof messages[0] === 'string'
        ) {
          fieldErrors[field] = messages[0]; // Take the first message for the field.
          hasFieldErrors = true;
        }
      });

      if (hasFieldErrors) {
        return fieldErrors;
      }
    }

    // Handle specific, known API error messages that imply a field error.
    // This is a way to provide more targeted UX for certain backend responses.
    // Example: If the API returns a general message "The email has already been taken."
    if (typeof responseData.message === 'string') {
      if (responseData.message === 'The email has already been taken.') {
        return {
          // Map this specific message to the 'email' field.
          email:
            'This email is already registered. Please use a different email or try logging in.',
        };
      }
      // Other specific message-to-field mappings could be added here.
    }
  }

  // If no specific field errors could be mapped, return null.
  return null;
}
