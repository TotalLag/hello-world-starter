/**
 * @file packages/ui/src/Input.tsx
 * @description A reusable Input component based on Tamagui's Input.
 *
 * This component provides a standardized text input field for use throughout the application.
 * It wraps the base `TamaguiInput` component and applies consistent default styling
 * (height, width, border, padding, etc.) using theme tokens where appropriate.
 * This ensures all input fields share a common look and feel.
 *
 * For a learner:
 * - This demonstrates creating custom UI components by styling base components from a library (Tamagui).
 * - Default styles ensure consistency across all instances of this `Input`.
 * - Theme tokens (`$borderColor`) link the component's appearance to the central theme configuration.
 * - Placeholders for `variants` show where future variations (e.g., error state, different sizes) could be added.
 */
import { styled, Input as TamaguiInput, InputProps } from 'tamagui'; // Import base Tamagui Input and its props type

/**
 * Styled Input component.
 * Wraps the base `TamaguiInput` to apply project-specific default styles.
 */
export const Input = styled(TamaguiInput, {
  name: 'Input', // Component name for debugging/tooling.
  // --- Default Styles ---
  height: '$4', // Use theme token for height (e.g., 40px if $4 = 40).
  width: '100%', // Default to full width of its container.
  // minWidth: 300, // Consider if a minWidth is truly needed globally. Can make responsiveness tricky.
  // Commenting out for now as 100% width is often more flexible.
  // Original comment "Add fixed maximum width" was likely a typo for minWidth.
  borderWidth: 1,
  borderColor: '$borderColor', // Use theme token for border color (adapts to light/dark).
  borderRadius: '$2', // Use theme token (e.g., 6px if $2 = 6).
  paddingHorizontal: '$3', // Use theme token (e.g., 12px if $3 = 12).
  backgroundColor: '$background', // Use theme token for background (adapts to light/dark).
  color: '$color', // Use theme token for text color (adapts to light/dark).

  // Add transition for smooth visual changes on focus, hover, etc.
  transition:
    'border-color 0.2s ease-in-out, background-color 0.2s ease-in-out',

  // Define styles for the focus state.
  focusStyle: {
    borderColor: '$primary500', // Highlight with primary color on focus.
    // Optional: Add outline for web accessibility if default browser outline is removed elsewhere.
    // outlineWidth: 2,
    // outlineColor: '$primary500',
    // outlineStyle: 'solid',
  },

  // Define styles for the hover state (primarily for web).
  hoverStyle: {
    borderColor: '$borderColorHover', // Use a slightly different border color on hover if defined in theme.
  },

  // Placeholder for variants if needed later (e.g., error state, different sizes).
  variants: {
    // Example:
    // error: {
    //   true: {
    //     borderColor: '$red500',
    //     focusStyle: {
    //       borderColor: '$red600',
    //     }
    //   }
    // }
  } as const,

  // Placeholder for default variant values if variants are added.
  defaultVariants: {},
});

// Type alias for the props of the styled Input component.
// Useful if you need to reference the props type elsewhere.
export type StyledInputProps = InputProps;
