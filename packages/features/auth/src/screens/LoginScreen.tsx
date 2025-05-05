/**
 * @file packages/features/auth/src/screens/LoginScreen.tsx
 * @description Provides the user interface and logic for the login screen.
 *
 * This component renders the login form using Tamagui components and custom UI elements.
 * It utilizes several hooks for state management, navigation, authentication logic,
 * and error handling:
 * - `useState`: Manages local component state (email, password, transition visibility).
 * - `useAuth`: Provides the `loginMutation` object from React Query for handling the login API call.
 * - `useRouter` (from Solito): Handles navigation logic (though delegated to PageTransition here).
 * - `useFormErrors`: Manages form validation and API error display.
 * - `Link` (from Solito): Provides cross-platform navigation links.
 *
 * The login process involves:
 * 1. User input for email and password.
 * 2. Client-side validation using the Zod `LoginRequestSchema`.
 * 3. If validation passes, triggering the `loginMutation` via `mutateAsync`.
 * 4. Handling success (showing transition, navigating) or error (displaying messages via `useFormErrors`).
 *
 * For a learner:
 * - Observe how UI components (Tamagui, custom UI) are assembled to create the form.
 * - See how state (`useState`) is used for controlled inputs.
 * - Understand the role of custom hooks (`useAuth`, `useFormErrors`) in encapsulating logic.
 * - Note the importance of client-side validation (`LoginRequestSchema.safeParse`) before API calls.
 * - See how React Query's mutation state (`loginMutation.isPending`) controls UI elements (button disabled/loading).
 * - Understand the error handling flow: client validation -> API call -> success/error callbacks -> display via `useFormErrors`.
 * - Solito (`Link`, `useRouter`) enables navigation code to work across platforms (web/native).
 */
import React, { useState } from 'react';
import { YStack, H2, Paragraph, XStack, Form } from 'tamagui'; // Core Tamagui layout and text components (Removed Spinner, Label as they are implicitly handled by FormField/Button)
import { Button, Input, FormField } from '@hello-world/ui'; // Custom UI components from the shared UI package
import { useAuth } from '@hello-world/auth'; // Custom hook providing authentication logic (mutations, user state)
import { Link } from 'solito/link'; // Cross-platform Link component from Solito
import { useRouter } from 'solito/navigation'; // Cross-platform navigation hook from Solito
import { useFormErrors, PageTransition } from '@hello-world/shared'; // Hook for form errors and custom transition component
import { LoginRequestSchema } from '@hello-world/api-types'; // Zod schema for client-side validation

export function LoginScreen() {
  // Get the login mutation object from the useAuth hook.
  // Contains methods like `mutateAsync` and states like `isPending`, `error`.
  const { loginMutation } = useAuth();
  // Solito's router hook (though navigation is handled by PageTransition on success).
  const router = useRouter();
  // Local state for form inputs.
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // Local state to control the visibility of the PageTransition component.
  const [showTransition, setShowTransition] = useState(false);
  // Hook for managing form error state and handling error objects.
  const { errors, clearErrors, handleError, getFieldError } = useFormErrors();

  /**
   * Handles the form submission process for login.
   */
  const handleLogin = async () => {
    // 1. Clear any previous errors shown on the form.
    clearErrors();

    // 2. Prepare form data. Trimming email is good practice.
    const formData = {
      email: email.trim(),
      password, // Password is not trimmed.
    };

    // 3. Perform client-side validation using the Zod schema.
    // `safeParse` is used instead of `parse` because it doesn't throw an error on failure;
    // instead, it returns a result object with `success: false` and an `error` property (a ZodError instance).
    // This provides immediate feedback to the user without waiting for an API call.
    const validationResult = LoginRequestSchema.safeParse(formData);

    // 4. If client-side validation fails, handle the Zod error and stop.
    if (!validationResult.success) {
      // `handleError` (from useFormErrors) processes the ZodError and updates the `errors` state.
      // It knows how to extract field-specific messages from the ZodError.
      handleError(validationResult.error, true, {
        // Pass ZodError, mark as auth-related context
        component: 'LoginScreen',
        action: 'client_validation_login',
      });
      return; // Prevent API call if client validation fails.
    }

    // 5. If client-side validation passes, attempt the login mutation via API.
    // `mutateAsync` returns a promise, allowing use of `await` and `try...catch`.
    // It's preferred here because we want to trigger the page transition *after* the async operation completes successfully.
    try {
      await loginMutation.mutateAsync(
        validationResult.data, // Use the validated and typed data from `safeParse`.
        {
          // `onSuccess` callback specific to this `mutateAsync` call.
          // Runs *after* the mutation is successful and *after* the `onSuccess` defined in `useAuth` hook (which handles token setting and query invalidation).
          onSuccess: () => {
            // Trigger the visual transition before navigating away.
            setShowTransition(true);
            // Navigation to the home page ('/') is handled internally by the PageTransition component upon showing.
          },
          // `onError` callback specific to this `mutateAsync` call.
          // Runs if the API call itself fails (e.g., network error, server error response).
          // It runs *after* the `onError` defined in `useAuth` hook (which handles token clearing).
          onError: (serverError: unknown) => {
            // Process the server error using the form error handler.
            // `handleError` will attempt to parse field errors or set a general error.
            handleError(serverError, true, {
              // Mark as auth-related error.
              component: 'LoginScreen',
              action: 'server_login',
            });
          },
        }
      );
    } catch (errorInAwait) {
      // This catch block handles errors during the `await mutateAsync` call *if* they weren't
      // already processed and resulted in setting errors via the `onError` callback above.
      // This can act as a fallback for unexpected issues during the mutation execution itself,
      // although most API/validation errors should be caught by `onError`.
      // The check prevents processing the same error twice if `handleError` already populated the `errors` state.
      if (!errors.fieldErrors && !errors.generalError) {
        handleError(errorInAwait, true, {
          component: 'LoginScreen',
          action: 'login_catch_fallback',
        });
      }
    }
  };

  // Render the Login Screen UI
  return (
    // Main container stack, centered vertically and horizontally.
    <YStack
      flex={1}
      justifyContent="center"
      alignItems="center"
      gap="$4" // Apply spacing between children using Tamagui theme space tokens.
      padding="$4"
      maxWidth={400} // Limit form width for better readability on wider screens.
      marginHorizontal="auto" // Center the stack horizontally.
    >
      {/* PageTransition component handles showing a message and navigating on success */}
      <PageTransition
        show={showTransition}
        message="Logging in..."
        destination="/" // Navigate to home page on completion.
      />
      <H2>Login</H2>

      {/* Display general form error message if one exists */}
      {errors.generalError && (
        <Paragraph theme="red" textAlign="center">
          {errors.generalError}
        </Paragraph>
      )}

      {/* Tamagui Form component - handles form submission via onSubmit */}
      <Form onSubmit={handleLogin} width="100%">
        {/* Custom FormField component likely wraps Label and Input, handling error display */}
        <FormField label="Email" error={getFieldError('email')}>
          {/* Custom Input component from @hello-world/ui */}
          <Input
            id="email" // ID for label association (accessibility)
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail} // Update email state on change
            autoCapitalize="none" // Disable auto-capitalization
            keyboardType="email-address" // Hint for mobile keyboard type
            textContentType="emailAddress" // Hint for mobile autofill
            aria-label="Email Input" // Accessibility label
          />
        </FormField>

        <FormField label="Password" error={getFieldError('password')}>
          <Input
            id="password"
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry // Hides password input characters
            textContentType="password" // Hint for mobile autofill
            aria-label="Password Input"
          />
        </FormField>

        {/* Form.Trigger associates the Button with the Form's onSubmit event */}
        <Form.Trigger asChild marginTop="$4">
          {/* Custom Button component from @hello-world/ui */}
          <Button
            // Disable button while login mutation is pending using state from useAuth hook.
            disabled={loginMutation.isPending}
            // Show loading indicator (e.g., Spinner) inside button when pending.
            isLoading={loginMutation.isPending}
            fullWidth={true} // Make button take full width of its container
            variant="primary" // Apply primary button styling defined in the theme/UI package
            animation="quick" // Apply animation (defined in tamagui.config) on interaction
            aria-label="Login Button"
          >
            Login
          </Button>
        </Form.Trigger>
      </Form>

      {/* Link to registration screen */}
      <XStack gap="$2" justifyContent="center">
        <Paragraph>Don't have an account?</Paragraph>
        {/* Solito Link for cross-platform navigation to the /register route */}
        <Link href="/register">
          <Paragraph
            cursor="pointer" // Indicate interactivity on web
            theme="blue" // Apply blue theme color for link styling
            textDecorationLine="underline" // Style as a link
          >
            Register
          </Paragraph>
        </Link>
      </XStack>
    </YStack>
  );
}
