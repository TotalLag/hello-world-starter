/**
 * @file packages/config/src/tamagui.config.ts
 * @description Central Tamagui configuration file for the monorepo.
 *
 * This configuration is shared between the Next.js web app and the Expo mobile app,
 * ensuring a consistent UI foundation across platforms. It defines the core elements
 * of the design system:
 * - Design Tokens (colors, spacing, sizes - merged from Tamagui defaults and brand package)
 * - Themes (light, dark - mapping tokens to semantic roles, based on brand package)
 * - Fonts (heading, body - using Inter font)
 * - Media Queries (for responsive styling)
 * - Animations (predefined animation curves)
 * - Shorthands (CSS property shortcuts)
 * - Icons (using Lucide icon set)
 *
 * The configuration is created using `createTamagui` and exported. TypeScript module
 * augmentation is used to make Tamagui components and hooks aware of this specific
 * configuration, enabling type safety and autocompletion for custom tokens, themes, etc.
 *
 * For a learner:
 * - This file is the heart of the Tamagui setup. Understanding it is key to customizing the UI.
 * - Design tokens are the primitive values of your design system.
 * - Themes apply these tokens semantically (e.g., `background` color token might be `white` in light theme, `black` in dark theme).
 * - Media queries enable responsive design based on screen size or other device characteristics.
 * - Module augmentation (`declare module`) is an advanced TypeScript feature used here to integrate
 *   the custom configuration deeply with the Tamagui library's types.
 */
import { createAnimations } from '@tamagui/animations-react-native'; // Helper for defining animations (works on web too)
import { createInterFont } from '@tamagui/font-inter'; // Helper for configuring the Inter font family
import { createMedia } from '@tamagui/react-native-media-driver'; // Helper for defining media queries (works on web too)
import { shorthands } from '@tamagui/shorthands'; // Predefined shorthand style properties (e.g., `fos` for `fontSize`)
import { tokens as defaultTokens } from '@tamagui/themes'; // Base design tokens from Tamagui (colors, spacing, radius, zIndex, etc.)
import {
  brandColors, // Specific brand color values (e.g., primary, secondary)
  palettes, // Generated color palettes (e.g., primary50, primary100...primary900)
  themes as brandThemes, // Base light/dark themes generated from palettes by Tamagui theme builder
} from '@hello-world/brand'; // Imports from the local brand definition package
import { createTamagui, TamaguiInternalConfig } from '@tamagui/core'; // Core function to create the config object
import * as lucideIcons from '@tamagui/lucide-icons'; // Imports the Lucide icon set for use with Tamagui

// --- Animations ---
// Defines named animation presets that can be used with Tamagui's animated components
// (e.g., `<Stack animation="bouncy">`). Uses react-native-reanimated/Moti syntax.
const animations = createAnimations({
  bouncy: {
    type: 'spring', // Uses a spring physics model
    damping: 10, // How quickly the spring settles
    mass: 0.9, // The mass of the object being animated
    stiffness: 100, // The stiffness of the spring
  },
  lazy: {
    type: 'spring',
    damping: 20,
    stiffness: 60,
  },
  quick: {
    type: 'spring',
    damping: 20,
    mass: 1.2,
    stiffness: 250,
  },
});

// --- Fonts ---
// Defines the fonts available in the application. Tamagui uses logical names ('heading', 'body')
// which are then mapped to specific font configurations. Here, both use Inter.
// Different weights/styles can be configured within `createInterFont`.
const headingFont = createInterFont();
const bodyFont = createInterFont();

// --- Media Queries ---
// Defines named breakpoints and conditions for responsive styling.
// These keys can be used as style props, e.g., `<Stack $sm={{ width: '100%' }} $gtSm={{ width: '50%' }}>`.
// Uses `react-native-media-driver`, which works across platforms.
export const media = createMedia({
  // Standard breakpoints based on max-width
  xs: { maxWidth: 660 },
  sm: { maxWidth: 800 },
  md: { maxWidth: 1020 },
  lg: { maxWidth: 1280 },
  xl: { maxWidth: 1420 },
  xxl: { maxWidth: 1600 },
  // Breakpoints based on min-width (useful for "greater than" styles)
  gtXs: { minWidth: 660 + 1 },
  gtSm: { minWidth: 800 + 1 },
  gtMd: { minWidth: 1020 + 1 },
  gtLg: { minWidth: 1280 + 1 },
  // Height-based queries
  short: { maxHeight: 820 },
  tall: { minHeight: 820 },
  // Feature/interaction queries
  hoverNone: { hover: 'none' }, // Targets devices where hover is not supported or disabled
  pointerCoarse: { pointer: 'coarse' }, // Targets devices with coarse pointers (e.g., touch screens)
});

// --- Design Tokens ---
// Defines the raw design values (colors, spacing, sizes, etc.).
// Starts with Tamagui's default tokens and merges custom values.
const customTokens = {
  ...defaultTokens, // Includes default spacing, size, radius, zIndex tokens.
  color: {
    ...defaultTokens.color, // Includes default color palettes (blue, gray, green, etc.).
    ...palettes, // Merges *all* generated color palettes from `@hello-world/brand`
    // This makes `primary50`, `primary100`, ..., `secondary50`, etc., available as color tokens.
    // Add specific legacy/semantic color tokens if needed for direct use or backward compatibility.
    // Note: It's generally preferred to use theme-based semantic tokens (defined in `customThemes`)
    // like `background`, `color`, `borderColor` in components, rather than directly using palette
    // colors like `primary500` or these legacy tokens, as themes handle light/dark mode adaptation.
    brandPrimary: brandColors.primary,
    brandSecondary: brandColors.secondary,
    appBackground: brandColors.backgroundLight, // Example legacy token
    appText: brandColors.textLight, // Example legacy token
    cardBackground: brandColors.neutralLight, // Example legacy token
    cardBorder: brandColors.borderColorLight, // Example legacy token
  },
  // Spacing, size, radius, zIndex tokens are inherited from `defaultTokens`.
  // Custom values could be added here if needed, e.g.:
  // space: { ...defaultTokens.space, '$true': 8, '$0.5': 4, ... },
};

// --- Themes ---
// Defines themes (e.g., 'light', 'dark') which map design tokens to semantic roles.
// Components use theme values (like `backgroundColor="$background"`) to adapt to the current theme.
const customThemes = {
  // Include the base light and dark themes generated by the theme builder in `@hello-world/brand`.
  // These typically map the color palettes (primary100-900, etc.) to theme variables.
  ...brandThemes,

  // Enhance the base 'light' theme with specific semantic overrides or additions.
  // These semantic tokens (`background`, `color`, `borderColor`, etc.) are what components
  // should primarily use for styling, allowing them to adapt to different themes easily.
  light: {
    ...brandThemes.light, // Inherits all mappings from the base light theme.
    // Define core semantic colors for the light theme.
    background: brandColors.backgroundLight, // Page background
    color: brandColors.textLight, // Default text color
    cardBackground: brandColors.neutralLight, // Background for cards/containers
    borderColor: brandColors.borderColorLight, // Default border color
    // Define interaction colors
    backgroundHover: palettes.primary50, // Background color on hover (using a light primary shade)
    // ... add other semantic tokens as needed (e.g., focus, active, success, error colors)
  },

  // Enhance the base 'dark' theme similarly.
  dark: {
    ...brandThemes.dark, // Inherits all mappings from the base dark theme.
    // Define core semantic colors for the dark theme.
    background: brandColors.backgroundDark,
    color: brandColors.textDark,
    cardBackground: brandColors.neutralDark,
    borderColor: brandColors.borderColorDark,
    // Define interaction colors
    backgroundHover: palettes.primary800, // Background color on hover (using a dark primary shade)
    // ... add other semantic tokens
  },
  // ... other themes could be defined here (e.g., high contrast)
};

// --- Tamagui Configuration ---
// Creates the final configuration object by combining all the defined parts.
const config = createTamagui({
  animations,
  // When true, Tamagui attempts to set the initial theme based on `prefers-color-scheme` media query.
  shouldAddPrefersColorThemes: true,
  // When true on web, adds theme class names to the root HTML element (`<body class="t_light">`),
  // useful for integrating with non-Tamagui components or global CSS.
  themeClassNameOnRoot: true,
  shorthands, // Use predefined CSS shorthands
  fonts: {
    heading: headingFont, // Assign the configured Inter font to the 'heading' logical name
    body: bodyFont, // Assign the configured Inter font to the 'body' logical name
  },
  themes: customThemes, // Use the merged and enhanced themes defined above
  tokens: customTokens, // Use the merged tokens (defaults + brand palettes + legacy)
  media, // Use the defined media queries
  // Configure the icon set to be used with Tamagui's `<Icon />` component (or similar).
  // Here, we use the popular Lucide icon set.
  icons: lucideIcons,
  // Set the default theme to 'light' if no theme is explicitly specified or detected.
  defaultTheme: 'light',
});

// --- Type Generation ---

// Export the TypeScript type of the generated configuration object.
// This can be useful for type checking in other parts of the application.
export type AppConfig = typeof config;

// TypeScript Module Augmentation:
// This tells the Tamagui library (specifically '@tamagui/core') about the shape
// of our custom configuration (`AppConfig`). By extending `TamaguiCustomConfig`,
// Tamagui's built-in hooks (like `useTheme`) and components become aware of our
// custom themes, tokens, fonts, etc., providing strong type checking and autocompletion
// in our application code. This is a crucial step for a good developer experience.
declare module '@tamagui/core' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface TamaguiCustomConfig extends AppConfig {}
}

// Export the generated configuration object as the default export.
// This object will be imported by the TamaguiProvider in both the Expo and Next.js apps.
export default config;
