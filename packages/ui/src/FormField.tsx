/**
 * @file packages/ui/src/FormField.tsx
 * @description A reusable component for laying out form fields with labels and error messages.
 *
 * This component standardizes the structure and spacing for form elements like inputs,
 * selects, etc. It ensures consistent placement of the label, the input control itself
 * (passed as `children`), and an area for displaying validation errors.
 * A key feature is its attempt to prevent layout shifts when error messages appear or disappear
 * by reserving space for the error message area.
 *
 * For a learner:
 * - This demonstrates creating layout components to enforce consistency in forms.
 * - Composition (`children` prop) makes the component flexible for different input types.
 * - Using styled components (`FieldContainer`, `ErrorMessage`) encapsulates styling logic.
 * - The fixed height and non-empty content (`{error || ' '}`) for `ErrorMessage` is a common
 *   technique to avoid layout jumps.
 */
import React, { ReactNode } from 'react';
import { YStack, Label, Paragraph, styled } from 'tamagui'; // Import necessary Tamagui components

/**
 * Styled container for the entire form field (Label + Input + Error).
 * Uses YStack for vertical arrangement.
 */
const FieldContainer = styled(YStack, {
  name: 'FormFieldContainer',
  width: '100%', // Take full width available.
  // minWidth: 300, // Consider if this is necessary; often 100% width is more flexible.
  // Original comment "Match the Input maxWidth" seems incorrect as Input doesn't have maxWidth set.
  minHeight: 70, // Reserve minimum height to accommodate label, input, and error message space.
  marginBottom: '$3', // Use theme token for consistent spacing below the field. Default: 10
  // alignSelf: 'center', // Centering might not be desired for all form layouts, consider removing or making optional.
});

/**
 * Styled component for displaying the error message text.
 * Uses Paragraph for text rendering and applies error-specific styling.
 */
const ErrorMessage = styled(Paragraph, {
  name: 'FormFieldError',
  color: '$red500', // Use theme token for error color.
  fontSize: '$1', // Use theme token for font size (e.g., 12px).
  marginTop: '$1', // Use theme token for spacing above the error. Default: 4
  height: 20, // Fixed height ensures space is reserved even when no error is present.
  opacity: 0.8, // Slightly reduce opacity for subtlety.
  // Ensure text doesn't wrap unexpectedly if container is narrow
  // whiteSpace: 'nowrap', // Consider if needed
  // overflow: 'hidden',
  // textOverflow: 'ellipsis',
});

/**
 * Props for the FormField component.
 */
interface FormFieldProps {
  /** The text label displayed above the input field. */
  label: string;
  /** Optional error message string to display below the input. */
  error?: string;
  /** The input component itself (e.g., <Input />, <Select />) passed as children. */
  children: ReactNode;
  /** Optional ID for the input element, used to associate the label correctly. */
  inputId?: string;
}

/**
 * FormField component renders a label, the provided input control (children),
 * and an area for an error message in a consistent vertical layout.
 */
export const FormField: React.FC<FormFieldProps> = ({
  label,
  error,
  children,
  inputId, // Receive inputId prop
}) => {
  return (
    <FieldContainer>
      {/* Tamagui Label component, associate with input using htmlFor */}
      <Label htmlFor={inputId}>{label}</Label>
      {/* Render the actual input component passed as children */}
      {children}
      {/* ErrorMessage component displays the error or a space */}
      <ErrorMessage>
        {/* Render the error message if provided, otherwise render a non-breaking space ('\u00A0' or ' ')
            to ensure the component occupies its fixed height (20px) and prevents layout shifts. */}
        {error || '\u00A0'}
      </ErrorMessage>
    </FieldContainer>
  );
};
