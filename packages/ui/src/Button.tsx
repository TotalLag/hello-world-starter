/**
 * @file packages/ui/src/Button.tsx
 * @description A reusable Button component built with Tamagui.
 *
 * This component provides a consistent button styling and behavior across the application,
 * leveraging Tamagui's styling system, variants, and theme tokens. It supports different
 * visual variants (primary, secondary, tertiary), sizes, disabled states, loading states,
 * full-width layout, and optional icons.
 *
 * For a learner:
 * - This demonstrates building reusable UI components within a shared package (`@hello-world/ui`).
 * - `styled` from Tamagui is used to create components with baked-in styles.
 * - `variants` allow for easy prop-based styling variations (e.g., `<Button variant="secondary">`).
 * - Theme tokens (e.g., `$primary500`) ensure the button adapts to the current theme (light/dark).
 * - Platform-specific styles (`$platform-web`) handle web-only features like focus outlines and cursors.
 * - `ButtonFrame.styleable` is used to compose the final component, combining styled elements
 *   with logic for props like `isLoading` and icons.
 * - `forwardRef` allows parent components to get a reference to the underlying element.
 */
import {
  styled, // Tamagui's function for creating styled components.
  Text, // Base text component.
  Stack, // Base layout component (like `div` or `View`).
  StackProps, // Props for the Stack component.
  ThemeableStack, // A Stack that automatically responds to theme changes.
  Theme, // Component for applying themes directly.
  useTheme, // Hook to access theme values.
  Spinner, // Loading indicator component.
  TamaguiElement, // Import the base Tamagui element type for ref typing
} from 'tamagui';
import { forwardRef, ReactNode } from 'react'; // React's forwardRef and type for children.

// Define the main button container using `styled`.
// It's based on `ThemeableStack` so it reacts to theme changes.
const ButtonFrame = styled(ThemeableStack, {
  name: 'Button', // Component name for debugging and tooling.
  tag: 'button', // Renders as `<button>` on web, `Pressable` (within View) on native.
  // Default styles applied to all button variants.
  alignItems: 'center',
  justifyContent: 'center',
  flexDirection: 'row', // Layout children (icon, text, icon) horizontally.
  paddingHorizontal: '$4', // Use theme token for padding. Default: 16
  paddingVertical: '$3', // Use theme token for padding. Default: 8
  borderRadius: '$2', // Use theme token for border radius. Default: 6
  gap: '$2', // Use theme token for gap between children. Default: 8
  borderWidth: 0, // Default to no border (variants can add it).
  // Add transition for smooth visual changes on hover/press/focus.
  transition: 'all 0.05s ease-in-out',

  // Platform-specific styles for web.
  '$platform-web': {
    cursor: 'pointer', // Standard pointer cursor for buttons.
    outlineWidth: 0, // Remove default browser outline; focus state handled by `focusStyle`.
    // Define styles applied when the button receives focus.
    focusStyle: {
      outlineColor: '$primary500', // Use theme token for outline color.
      outlineWidth: 2,
      outlineStyle: 'solid',
      outlineOffset: 2, // Add slight offset for better visibility.
    },
  },

  // Variants define different styles based on props.
  variants: {
    // --- Visual Variants ---
    variant: {
      primary: {
        backgroundColor: '$primary500', // Use theme token.
        // Text color is handled by ButtonText variant.
        hoverStyle: {
          backgroundColor: '$primary600', // Darken slightly on hover.
        },
        pressStyle: {
          backgroundColor: '$primary700', // Darken more on press.
        },
      },
      secondary: {
        backgroundColor: 'transparent', // No background fill.
        borderWidth: 1,
        borderColor: '$primary500', // Border uses primary color.
        // Text color handled by ButtonText variant.
        hoverStyle: {
          backgroundColor: '$primary100', // Light primary background on hover.
        },
        pressStyle: {
          backgroundColor: '$primary200', // Slightly darker on press.
        },
      },
      tertiary: {
        // Similar to secondary but without the border initially. Often used for text-like buttons.
        backgroundColor: 'transparent',
        // Text color handled by ButtonText variant.
        hoverStyle: {
          backgroundColor: '$primary100',
        },
        pressStyle: {
          backgroundColor: '$primary200',
        },
      },
    },
    // --- Size Variants ---
    size: {
      small: {
        paddingHorizontal: '$3', // 12
        paddingVertical: '$1.5', // 6
        borderRadius: '$1', // 4
        gap: '$1', // 4
      },
      medium: {
        // Uses the default padding/borderRadius/gap defined above.
      },
      large: {
        paddingHorizontal: '$5', // 20
        paddingVertical: '$2.5', // 10
        borderRadius: '$3', // 8
        gap: '$3', // 10
      },
    },
    // --- State Variants ---
    disabled: {
      true: {
        opacity: 0.5, // Visually indicate disabled state.
        // Tamagui's Pressable underlying component likely handles pointerEvents: 'none'.
        '$platform-web': {
          cursor: 'not-allowed', // Specific cursor for disabled state on web.
        },
      },
      // It can be useful to define the 'false' state explicitly if needed,
      // though often the default styles cover the non-disabled state.
      false: {
        opacity: 1,
      },
    },
    // --- Layout Variants ---
    fullWidth: {
      true: {
        width: '100%', // Make button span the full width of its container.
      },
    },
  } as const, // `as const` helps TypeScript infer the exact variant names and types.

  // Default props applied if not specified by the consumer.
  defaultVariants: {
    variant: 'primary',
    size: 'medium',
    disabled: false,
    fullWidth: false,
  },
});

// Define a separate styled component for the button's text.
// This allows applying text-specific styles and variants cleanly.
const ButtonText = styled(Text, {
  name: 'ButtonText',
  fontWeight: '600', // Medium-bold text.
  textAlign: 'center', // Ensure text is centered if button width changes.
  userSelect: 'none', // Prevent text selection during clicks on web.
  // Add transition for smooth visual changes (e.g., color).
  transition: 'color 0.05s ease-in-out',

  variants: {
    // Match text size to button size.
    size: {
      small: { fontSize: '$3' }, // 14 (using theme size tokens)
      medium: { fontSize: '$4' }, // 16
      large: { fontSize: '$5' }, // 18
    },
    // Match text color to button variant.
    variant: {
      primary: { color: '$primary50' }, // Light text on dark background.
      secondary: { color: '$primary500' }, // Primary color text.
      tertiary: { color: '$primary500' }, // Primary color text.
    },
  } as const,

  // Default variants should match ButtonFrame's defaults.
  defaultVariants: {
    size: 'medium',
    variant: 'primary',
  },
});

// Define the props interface for the public Button component.
// Extends StackProps to allow passing standard Tamagui layout/style props.
export interface ButtonProps extends StackProps {
  children: ReactNode; // Button text or custom content.
  type?: 'button' | 'submit'; // HTML button type attribute (for web only)
  variant?: 'primary' | 'secondary' | 'tertiary';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  fullWidth?: boolean;
  isLoading?: boolean; // Prop to show loading spinner.
  leftIcon?: ReactNode; // Optional icon to display before text.
  rightIcon?: ReactNode; // Optional icon to display after text.
  // `onPress` is inherited from StackProps (which includes PressableProps).
}

/**
 * The main Button component exported for use in the application.
 * It uses `ButtonFrame.styleable` to create a component that accepts ButtonProps,
 * applies the correct variants to the underlying ButtonFrame and ButtonText,
 * and handles logic for loading states and icons.
 * `forwardRef` allows passing a ref to the underlying ButtonFrame element.
 */
export const Button = ButtonFrame.styleable<ButtonProps>(
  forwardRef<TamaguiElement, ButtonProps>( // Explicitly type the forwarded ref and props
    (
      {
        children,
        // Set default values for props if not provided.
        type = 'button', // Default to 'button', but can be overridden with 'submit'
        variant = 'primary',
        size = 'medium',
        disabled = false,
        fullWidth = false,
        isLoading = false,
        leftIcon,
        rightIcon,
        animation, // Extract animation prop
        ...props // Collect remaining props (like onPress, style, id, etc.)
      },
      ref // The forwarded ref.
    ) => {
      // Determine icon/spinner color based on variant.
      const iconColor = variant === 'primary' ? '$primary50' : '$primary500';
      const spinnerColor = iconColor; // Use the same color for consistency.

      // For submit buttons, we need to completely remove the animation prop
      // as it interferes with form submission
      const isSubmitButton = type === 'submit';

      return (
        <ButtonFrame
          ref={ref}
          variant={variant}
          size={size}
          disabled={disabled || isLoading}
          fullWidth={fullWidth}
          role="button"
          aria-disabled={disabled || isLoading}
          // @ts-expect-error Not in the type definition but required for web.
          type={type}
          // Only apply animation for non-submit buttons
          {...(!isSubmitButton && animation ? { animation } : {})}
          {...props}
        >
          {/* Conditionally render Spinner when isLoading is true */}
          {isLoading && (
            // Optional: Add animation for spinner appearance/disappearance.
            <Stack
              animation={!isSubmitButton ? 'quick' : undefined}
              enterStyle={{ opacity: 0 }}
              exitStyle={{ opacity: 0 }}
            >
              <Spinner
                size={size === 'large' ? 'large' : 'small'} // Adjust spinner size based on button size.
                color={spinnerColor} // Use determined color.
              />
            </Stack>
          )}

          {/* Conditionally render leftIcon if provided and not loading */}
          {!isLoading && leftIcon && <Stack>{leftIcon}</Stack>}
          {/* Note: Icons might need specific styling (color, size) passed to them,
              or they could be wrapped in a component that applies theme colors.
              Using a simple Stack here for layout. */}

          {/* Render the button text, applying size and variant styles */}
          <ButtonText size={size} variant={variant}>
            {children}
          </ButtonText>

          {/* Conditionally render rightIcon if provided and not loading */}
          {!isLoading && rightIcon && <Stack>{rightIcon}</Stack>}
        </ButtonFrame>
      );
    }
  )
);

// Setting displayName is usually handled automatically by Tamagui/React based on component definition.
// Button.displayName = 'Button';
