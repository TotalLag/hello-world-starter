/**
 * @file packages/shared/src/errorUtils.ts
 * @description Provides utility functions for formatting and handling errors,
 * particularly Zod validation errors and potential API errors, often for form contexts.
 *
 * These functions are lower-level utilities that can be used by higher-level error handlers
 * like the `useFormErrors` hook or directly in components if needed.
 *
 * For a learner:
 * - This file shows how to specifically parse and format errors from the Zod library.
 * - It demonstrates handling different error types (`ZodError`, generic `Error`, Axios-like errors).
 * - Note the potential overlap and areas for simplification when comparing this file with
 *   `useFormErrors.ts` and `errorLogger.ts` regarding API error handling (especially Laravel validation).
 *   A real-world refactor might consolidate this logic.
 */
import { z } from 'zod'; // Zod is used for type checking (`instanceof`) and accessing error details.

/**
 * Formats a Zod validation error (`z.ZodError`) into a user-friendly
 * record of field names mapped to error messages.
 *
 * This function attempts to create clearer messages than Zod's defaults for common cases
 * like required fields or invalid email formats. It also prioritizes showing only one
 * message per field, prioritizing "required" messages.
 *
 * @param error - The `z.ZodError` instance.
 * @returns An object where keys are field names and values are formatted error messages.
 *          Example: `{ email: "Please enter a valid email address", name: "Name is required" }`
 */
export function formatZodErrors(error: z.ZodError): Record<string, string> {
  const formattedErrors: Record<string, string> = {};

  // Sort Zod issues to potentially prioritize certain errors (e.g., required fields)
  // and ensure consistent error display order.
  const sortedErrors = [...error.errors].sort((a, b) => {
    // Prioritize "required" field errors (approximated by checking for invalid_type or too_small with minimum 1).
    const aIsRequired =
      a.code === 'invalid_type' || (a.code === 'too_small' && a.minimum === 1);
    const bIsRequired =
      b.code === 'invalid_type' || (b.code === 'too_small' && b.minimum === 1);

    if (aIsRequired && !bIsRequired) return -1; // a comes first
    if (!aIsRequired && bIsRequired) return 1; // b comes first

    // If priority is the same, sort alphabetically by field path for consistency.
    const aField = a.path[0]?.toString() || '';
    const bField = b.path[0]?.toString() || '';
    return aField.localeCompare(bField);
  });

  // Iterate through the (potentially sorted) Zod issues.
  sortedErrors.forEach((err) => {
    // Ensure the error has a path (indicating it's related to a specific field).
    if (err.path.length > 0) {
      const field = err.path[0].toString(); // Get the field name (assuming simple object structure).

      // Only assign the first error encountered for a given field based on sorted order.
      if (formattedErrors[field]) return;

      // Attempt to create a more readable field name (e.g., 'password_confirmation' -> 'Password confirmation').
      const fieldName =
        field.charAt(0).toUpperCase() + field.slice(1).replace(/_/g, ' ');

      // Generate user-friendly messages based on common Zod error codes.
      switch (err.code) {
        case 'invalid_string': // Specific handling for invalid string formats.
          if (err.validation === 'email') {
            formattedErrors[field] = `Please enter a valid email address`;
          } else {
            // Generic message for other invalid string types (e.g., URL, UUID if used).
            formattedErrors[field] =
              `Invalid ${fieldName.toLowerCase()} format`;
          }
          break;
        case 'too_small': // Handling for minimum length/value errors.
          // If it's a string and minimum is > 1, assume it's a length requirement and use Zod's message.
          if (err.type === 'string' && err.minimum > 1) {
            formattedErrors[field] = err.message; // e.g., "Password must be at least 8 characters"
          } else {
            // Otherwise (e.g., min(1) for strings, or number/date minimums), treat as "required".
            formattedErrors[field] = `${fieldName} is required`;
          }
          break;
        case 'invalid_type': // Typically means the field is missing or has the wrong JS type.
          formattedErrors[field] = `${fieldName} is required`;
          break;
        default:
          // For other Zod error codes, use the default message provided by Zod.
          // This includes custom errors from `.refine()` or specific messages set in the schema.
          formattedErrors[field] = err.message;
      }
    }
  });

  return formattedErrors;
}

/**
 * Retrieves an error message for a specific field from an error record.
 *
 * @param errors - An optional record of field errors (e.g., `errors.fieldErrors` from `useFormErrors`).
 * @param fieldName - The name of the field to get the error for.
 * @returns The error message string, or `undefined` if no error exists for that field.
 *
 * @deprecated Consider using the `getFieldError` function returned directly by the `useFormErrors` hook instead,
 *             as this provides the same functionality based on the hook's internal state. The intention of this function is legacy, and one of the exercises is to refactor it.
 */
export function getFieldError(
  errors: Record<string, string> | undefined,
  fieldName: string
): string | undefined {
  return errors?.[fieldName];
}

/**
 * Processes an unknown error, attempting to format it into the `FormErrors` structure
 * ({ fieldErrors?: ..., generalError?: ... }).
 *
 * This function acts as a general error handler, checking for specific error types
 * like ZodError or Axios/Laravel validation errors, and providing fallbacks.
 *
 * @param error - The error object to handle (can be `unknown`).
 * @param isAuthError - Optional flag to indicate if the context is authentication-related,
 *                      which might influence generic error messages. Defaults to `false`.
 * @returns An object conforming to `FormErrors`.
 *
 * @learningNote There is significant overlap between this function, `mapErrorToFields` (in `errorLogger.ts`),
 *               and the main `handleError` function within the `useFormErrors` hook. All three handle
 *               Zod errors and/or Laravel validation errors. This suggests the error handling strategy
 *               could potentially be simplified or consolidated in a future refactor. For example,
 *               `useFormErrors` might primarily use `mapErrorToFields` for API errors and this function
 *               might be simplified or deprecated.
 */
export function handleFormError(
  error: unknown,
  isAuthError: boolean = false
): {
  fieldErrors?: Record<string, string>;
  generalError?: string;
} {
  // 1. Handle Zod Errors (Client-side validation)
  if (error instanceof z.ZodError) {
    // Special handling for auth errors: sometimes a generic message is better than field specifics.
    // The current check for `err.code === 'custom'` on password seems potentially fragile and
    // might need refinement based on how authentication errors are actually signaled.
    if (isAuthError) {
      const hasSpecificAuthFailure = error.errors.some(
        (err) => err.path.includes('password') && err.code === 'custom' // Example check - might need adjustment
      );
      if (hasSpecificAuthFailure) {
        // If a specific auth-related check fails (e.g., custom rule in Zod schema for auth)
        return { generalError: 'Invalid email or password. Please try again.' };
      }
      // Otherwise, for auth forms, still prefer showing specific field errors from Zod if available.
    }
    // For general validation errors, format them into field-specific messages.
    return { fieldErrors: formatZodErrors(error) };
  }
  // 2. Handle Generic Errors (Potentially API errors)
  else if (error instanceof Error) {
    // Attempt to parse as an Axios error containing Laravel validation errors.
    // NOTE: This duplicates logic found in `mapErrorToFields` in `errorLogger.ts`.
    const axiosError = error as any; // Use type assertion cautiously
    if (
      axiosError.response?.data?.errors &&
      typeof axiosError.response.data.errors === 'object'
    ) {
      const responseData = axiosError.response.data;
      const fieldErrors: Record<string, string> = {};
      let hasFieldErrors = false;
      // Convert Laravel validation errors { field: ["message"] } to { field: "message" }
      Object.entries(responseData.errors).forEach(([field, messages]) => {
        if (
          Array.isArray(messages) &&
          messages.length > 0 &&
          typeof messages[0] === 'string'
        ) {
          fieldErrors[field] = messages[0];
          hasFieldErrors = true;
        }
      });
      if (hasFieldErrors) {
        return { fieldErrors };
      }
      // If responseData.errors exists but is empty or malformed, fall through.
    }

    // If not a recognized Laravel validation structure, return a general error.
    // Use a specific message for auth contexts if `isAuthError` is true.
    if (isAuthError) {
      // Consider using `getUserFriendlyMessage(error)` here too for consistency?
      return { generalError: 'Authentication failed. Please try again.' };
    }
    // Otherwise, use the generic Error message (might be technical).
    // `getUserFriendlyMessage(error)` could provide a better fallback here.
    return { generalError: error.message || 'An error occurred.' };
  }
  // 3. Handle Unknown Errors (Fallback)
  else {
    // If the error is not an instance of Error (e.g., a string was thrown).
    return { generalError: 'An unexpected error occurred. Please try again.' };
  }
}
