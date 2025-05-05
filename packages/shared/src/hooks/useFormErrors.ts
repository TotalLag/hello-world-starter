/**
 * @file packages/shared/src/hooks/useFormErrors.ts
 * @description Custom React hook for managing and displaying form errors consistently.
 *
 * This hook centralizes form error handling logic, making it reusable across various forms
 * in the application. It can process errors from client-side validation (e.g., Zod)
 * and API responses, translating them into a structured format (`FormErrors`) that
 * UI components can easily consume to display feedback to the user.
 *
 * Key features:
 * - Manages `fieldErrors` (errors specific to individual form inputs) and `generalError` (form-wide messages).
 * - Provides a `handleError` function that intelligently processes different error types.
 * - Integrates with logging services (`logError`) and error parsing utilities (`mapErrorToFields`, `handleFormError`).
 * - Offers utility functions to set, clear, and retrieve errors.
 *
 * For a learner:
 * - This hook demonstrates a robust pattern for form error management.
 * - The `handleError` function shows a pipeline approach to error processing, prioritizing
 *   specific error types (like Zod errors) before falling back to more generic handlers.
 * - Consistent error state management improves user experience and simplifies form component logic.
 */
import { useState } from 'react';
import { z } from 'zod'; // Used for checking if an error is a ZodError instance.
import { handleFormError } from '../errorUtils'; // Utility for more generic API error formatting.
import {
  logError, // Centralized error logging service.
  ErrorSeverity,
  mapErrorToFields, // Utility to map structured API errors (e.g., Laravel validation) to field errors.
  getUserFriendlyMessage, // Utility to get a generic user-friendly message.
} from '../services/errorLogger';

/**
 * Defines the structure for storing form errors.
 * - `fieldErrors`: An optional record (object) where keys are field names (strings)
 *   and values are their corresponding error messages (strings).
 * - `generalError`: An optional string for displaying a form-wide error message
 *   that isn't specific to any single field (e.g., "Network connection failed").
 */
export type FormErrors = {
  fieldErrors?: Record<string, string>;
  generalError?: string;
};

/**
 * `useFormErrors` is a custom React hook for managing form error state.
 * It provides functions to set, clear, and process errors from various sources.
 *
 * @returns An object containing:
 *  - `errors` (FormErrors): The current error state.
 *  - `clearErrors` (function): Clears all current errors.
 *  - `setFieldError` (function): Sets an error for a specific field.
 *  - `setGeneralError` (function): Sets a general form error message.
 *  - `handleError` (function): Processes an error object and updates the error state.
 *  - `getFieldError` (function): Retrieves the error message for a specific field.
 *  - `hasErrors` (boolean): True if there are any general or field errors.
 */
export function useFormErrors() {
  // `useState` hook to store the current form errors. Initialized to an empty object.
  const [errors, setErrors] = useState<FormErrors>({});

  /**
   * Clears all current form errors by resetting the state to an empty object.
   * Typically called when a form is submitted successfully or when it's reset.
   */
  const clearErrors = () => {
    setErrors({});
  };

  /**
   * Sets an error message for a specific form field.
   * If other errors exist, they are preserved.
   * @param field - The name of the form field (e.g., 'email', 'password').
   * @param message - The error message to display for this field.
   */
  const setFieldError = (field: string, message: string) => {
    setErrors((prev) => ({
      ...prev, // Preserve existing generalError or other fieldErrors.
      fieldErrors: {
        ...(prev.fieldErrors || {}), // Preserve other existing field errors.
        [field]: message, // Set or overwrite the error for the specified field.
      },
      generalError: prev.generalError, // Ensure generalError is not lost if only fieldError is set
    }));
  };

  /**
   * Sets a general error message for the form.
   * This is used for errors that aren't tied to a specific input field.
   * @param message - The general error message.
   */
  const setGeneralError = (message: string) => {
    setErrors((prev) => ({
      ...prev, // Preserve existing fieldErrors.
      fieldErrors: prev.fieldErrors, // Ensure fieldErrors are not lost
      generalError: message,
    }));
  };

  /**
   * Processes an error object from various sources (e.g., API calls, client-side validation)
   * and updates the form error state accordingly.
   *
   * The function follows a priority:
   * 1. Logs the raw error for debugging/monitoring.
   * 2. If it's a `z.ZodError` (client-side validation), extracts field-specific errors.
   * 3. If not Zod, tries `mapErrorToFields` for structured API validation errors (e.g., Laravel).
   * 4. If still no field errors, uses `handleFormError` for more generic API error formatting.
   * 5. As an absolute fallback, uses `getUserFriendlyMessage` for a generic message.
   *
   * @param error - The error object to handle (can be `unknown`).
   * @param isAuthError - Optional boolean indicating if the error is related to authentication.
   * @param context - Optional context (component name, action) for more detailed logging.
   */
  const handleError = (
    error: unknown,
    isAuthError: boolean = false, // Defaults to false
    context: { component?: string; action?: string } = {} // Defaults to empty object
  ) => {
    try {
      // First, log the raw error for backend/developer diagnostics.
      // This is important for understanding the root cause, regardless of user-facing message.
      logError(error, ErrorSeverity.ERROR, {
        component: context.component || 'Form', // Default component context to 'Form'.
        action:
          context.action || (isAuthError ? 'Authentication' : 'FormSubmission'), // Default action context.
        additionalData: {
          isAuthError,
          // Attempt to include response data if available (common for Axios errors).
          responseData: (error as any).response?.data,
          errorObject: error, // The raw error object.
        },
      });

      // 1. Handle client-side Zod validation errors first.
      // These are typically the most specific to form fields.
      if (error instanceof z.ZodError) {
        // `error.errors` is an array of detailed issues from Zod.
        // We transform this into a `Record<string, string>` for `fieldErrors`.
        const fieldErrors = error.errors.reduce(
          (acc, zodIssue) => {
            // `zodIssue.path` is an array of strings/numbers indicating the path to the error.
            // For simple objects, `path[0]` is usually the field name.
            if (zodIssue.path.length > 0) {
              const field = zodIssue.path[0].toString();
              // Take the first error message for a field if multiple Zod rules fail for it.
              if (!acc[field]) {
                acc[field] = zodIssue.message;
              }
            }
            return acc;
          },
          {} as Record<string, string> // Initial accumulator.
        );
        setErrors({ fieldErrors, generalError: undefined }); // Clear any previous general error.
        return; // Error handled.
      }

      // 2. If not a ZodError, try to map structured API errors (e.g., Laravel validation)
      // using `mapErrorToFields`. This utility is expected to understand specific backend error formats.
      const fieldErrorsFromMapper = mapErrorToFields(error);
      if (
        fieldErrorsFromMapper && // Ensure it's not null/undefined.
        typeof fieldErrorsFromMapper === 'object' && // Ensure it's an object.
        Object.keys(fieldErrorsFromMapper).length > 0 // Ensure it has at least one error.
      ) {
        setErrors({
          fieldErrors: fieldErrorsFromMapper,
          generalError: undefined,
        });
        return; // Error handled.
      }

      // 3. If `mapErrorToFields` didn't produce field errors, try a more generic
      // API error formatter `handleFormError` (from `errorUtils.ts`).
      // This might extract a general message or attempt to find field errors from less structured responses.
      const formattedGenericErrors = handleFormError(error, isAuthError);
      if (
        formattedGenericErrors.fieldErrors ||
        formattedGenericErrors.generalError
      ) {
        setErrors(formattedGenericErrors);
        return; // Error handled.
      }

      // 4. As an absolute fallback, if no specific errors could be parsed,
      // set a general error message using `getUserFriendlyMessage`.
      setErrors({
        fieldErrors: undefined, // Clear any previous field errors.
        generalError: getUserFriendlyMessage(error),
      });
    } catch (e) {
      // Safeguard: If the `handleError` logic itself throws an error,
      // log it and set a very generic error message to prevent crashing the app.
      console.error('Critical error within useFormErrors.handleError:', e);
      setErrors({
        generalError:
          'An unexpected error occurred while processing the form submission. Please try again.',
      });
    }
  };

  /**
   * Retrieves the error message for a specific form field.
   * Useful for displaying an error message directly associated with an input.
   * @param fieldName - The name of the form field.
   * @returns The error message string if an error exists for the field, otherwise `undefined`.
   */
  const getFieldError = (fieldName: string): string | undefined => {
    return errors.fieldErrors?.[fieldName];
  };

  // Return the error state and handler functions to be used by form components.
  return {
    errors, // The current FormErrors object { fieldErrors?: ..., generalError?: ... }.
    clearErrors,
    setFieldError,
    setGeneralError,
    handleError,
    getFieldError,
    /** Boolean indicating if any errors (field-specific or general) are currently set. */
    hasErrors:
      !!errors.generalError ||
      (!!errors.fieldErrors && Object.keys(errors.fieldErrors).length > 0),
  };
}
