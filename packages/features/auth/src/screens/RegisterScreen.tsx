/**
 * @file packages/features/auth/src/screens/RegisterScreen.tsx
 * @description Provides the user interface and logic for the user registration screen.
 *
 * This component renders the registration form using Tamagui and custom UI components.
 * It mirrors the structure and functionality of `LoginScreen` but handles registration.
 * Key aspects include:
 * - `useState` for managing form input state (name, email, password, confirmation).
 * - `useAuth` hook to access the `registerMutation`.
 * - `useFormErrors` hook for handling validation and API errors.
 * - Client-side validation using the `ExtendedRegisterSchema` from `@hello-world/api-types`,
 *   which provides more user-friendly error messages suitable for immediate feedback.
 * - Triggering the `registerMutation` on successful client-side validation.
 * - Displaying errors using `errors.generalError` and `getFieldError`.
 * - Using `PageTransition` for visual feedback on successful registration.
 * - Linking to the login screen using Solito's `Link`.
 *
 * For a learner:
 * - Compare this screen with `LoginScreen` to see similarities in form handling patterns.
 * - Note the use of `ExtendedRegisterSchema` for client-side validation, demonstrating how
 *   different schemas can be used for different validation contexts (e.g., base vs. extended).
 * - Observe the handling of multiple input fields and state variables.
 * - Reinforces the pattern of using React Query mutations (`registerMutation`) and error handling hooks (`useFormErrors`).
 */
import React, { useState } from 'react';
import { YStack, H2, XStack, Form, Paragraph } from 'tamagui'; // Core Tamagui layout/text components
import { Button, Input, FormField } from '@hello-world/ui'; // Custom UI components
import { useAuth } from '@hello-world/auth'; // Auth hook for mutations/state
import { Link } from 'solito/link'; // Cross-platform Link
import { useRouter } from 'solito/navigation'; // Cross-platform navigation hook
import { useFormErrors, PageTransition } from '@hello-world/shared'; // Form error hook and transition component
import { ExtendedRegisterSchema } from '@hello-world/api-types'; // Using the extended schema for better client-side messages
import { z } from 'zod'; // Zod is still needed for type inference

// Infer the TypeScript type from the Zod schema for type safety.
type RegisterRequestSchema = z.infer<typeof ExtendedRegisterSchema>;

export function RegisterScreen() {
  // Get the registration mutation object from the useAuth hook.
  const { registerMutation } = useAuth();
  // Solito router hook.
  const router = useRouter();
  // Local state for form inputs.
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  // State for controlling the page transition animation.
  const [showTransition, setShowTransition] = useState(false);
  // Hook for managing form error state.
  const { errors, clearErrors, handleError, getFieldError } = useFormErrors();

  /**
   * Handles the form submission process for registration.
   */
  const handleRegister = async () => {
    // 1. Clear previous errors.
    clearErrors();

    // 2. Prepare form data.
    const formData: RegisterRequestSchema = {
      name: name.trim(),
      email: email.trim(),
      password,
      password_confirmation: passwordConfirmation,
    };

    // 3. Client-side validation using the *Extended* schema.
    // This schema likely contains more user-friendly error messages defined in
    // `packages/api-types/src/extendedSchemas.ts`, suitable for immediate form feedback.
    const validationResult = ExtendedRegisterSchema.safeParse(formData);

    // 4. Handle client-side validation failure.
    if (!validationResult.success) {
      // `handleError` processes the ZodError from `validationResult.error`.
      handleError(validationResult.error, false, {
        // isAuthError = false for registration validation
        component: 'RegisterScreen',
        action: 'client_validation_register',
      });
      return; // Stop submission.
    }

    // 5. If client validation passes, attempt the registration mutation.
    // The backend (Laravel) will perform its own authoritative validation using rules
    // defined in `AuthController.php`.
    try {
      await registerMutation.mutateAsync(
        validationResult.data, // Pass the validated data.
        {
          // `onSuccess` specific to this call. Runs after `useAuth`'s onSuccess.
          onSuccess: () => {
            setShowTransition(true); // Trigger transition on successful registration.
            // Navigation handled by PageTransition.
          },
          // `onError` specific to this call. Runs after `useAuth`'s onError.
          onError: (serverError: unknown) => {
            // Handle errors returned from the server API call.
            handleError(serverError, false, {
              // isAuthError = false
              component: 'RegisterScreen',
              action: 'server_register',
            });
          },
        }
      );
    } catch (errorInAwait) {
      // Fallback catch block, similar to LoginScreen.
      if (!errors.fieldErrors && !errors.generalError) {
        handleError(errorInAwait, false, {
          component: 'RegisterScreen',
          action: 'register_catch_fallback',
        });
      }
    }
  };

  // Render the Registration Screen UI
  return (
    // Main container stack
    <YStack
      flex={1}
      justifyContent="center"
      alignItems="center"
      gap="$4"
      padding="$4"
      maxWidth={400}
      marginHorizontal="auto"
    >
      {/* Transition component */}
      <PageTransition
        show={showTransition}
        message="Creating your account..."
        destination="/" // Navigate to home on success
      />
      <H2>Register</H2>

      {/* Display general form error */}
      {errors.generalError && (
        <Paragraph theme="red" textAlign="center">
          {errors.generalError}
        </Paragraph>
      )}

      {/* Registration Form */}
      <Form onSubmit={handleRegister} width="100%">
        <FormField label="Name" error={getFieldError('name')}>
          <Input
            id="name"
            placeholder="Enter your name"
            value={name}
            onChangeText={setName}
            autoCapitalize="words" // Capitalize first letter of each word
            textContentType="name" // Hint for mobile autofill
            aria-label="Name Input"
          />
        </FormField>

        <FormField label="Email" error={getFieldError('email')}>
          <Input
            id="email"
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            textContentType="emailAddress"
            aria-label="Email Input"
          />
        </FormField>

        <FormField label="Password" error={getFieldError('password')}>
          <Input
            id="password"
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            textContentType="newPassword" // Hint for password managers to suggest strong password
            aria-label="Password Input"
          />
        </FormField>

        <FormField
          label="Confirm Password"
          error={getFieldError('password_confirmation')} // Error specifically for confirmation field
        >
          <Input
            id="passwordConfirmation"
            placeholder="Confirm your password"
            value={passwordConfirmation}
            onChangeText={setPasswordConfirmation}
            secureTextEntry
            textContentType="newPassword"
            aria-label="Confirm Password Input"
          />
        </FormField>

        {/* Form submission trigger */}
        <Form.Trigger asChild marginTop="$4">
          <Button
            type="submit"
            disabled={registerMutation.isPending} // Disable while mutation is running
            isLoading={registerMutation.isPending} // Show loading state
            fullWidth={true}
            variant="primary"
            animation="quick"
            aria-label="Register Button"
          >
            Register
          </Button>
        </Form.Trigger>
      </Form>

      {/* Link to Login screen */}
      <XStack gap="$2" justifyContent="center">
        <Paragraph>Already have an account?</Paragraph>
        <Link href="/login">
          <Paragraph
            cursor="pointer"
            theme="blue"
            textDecorationLine="underline"
          >
            Login
          </Paragraph>
        </Link>
      </XStack>
    </YStack>
  );
}
