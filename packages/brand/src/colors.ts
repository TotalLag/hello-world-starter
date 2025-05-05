/**
 * Brand color palettes using Tamagui's theme builder approach
 * This file defines color palettes with proper shade variations
 * that can be referenced in components using $primary50, $primary500, etc.
 */
import { createThemeBuilder } from '@tamagui/theme-builder';

// Define our primary color palette (red-based)
const primaryPalette = {
  primary50: '#FFEBEE', // Lightest shade
  primary100: '#FFCDD2',
  primary200: '#EF9A9A',
  primary300: '#E57373',
  primary400: '#EF5350',
  primary500: '#E53935', // Our main brand color
  primary600: '#D32F2F',
  primary700: '#C62828',
  primary800: '#B71C1C',
  primary900: '#8B0000', // Darkest shade
};

// Define our secondary color palette (blue-based)
const secondaryPalette = {
  secondary50: '#E3F2FD', // Lightest shade
  secondary100: '#BBDEFB',
  secondary200: '#90CAF9',
  secondary300: '#64B5F6',
  secondary400: '#42A5F5',
  secondary500: '#1E88E5', // Our secondary brand color
  secondary600: '#1976D2',
  secondary700: '#1565C0',
  secondary800: '#0D47A1',
  secondary900: '#0A3880', // Darkest shade
};

// Define red palette for error states
const redPalette = {
  red50: '#FFEBEE',
  red100: '#FFCDD2',
  red200: '#EF9A9A',
  red300: '#E57373',
  red400: '#EF5350',
  red500: '#F44336',
  red600: '#E53935',
  red700: '#D32F2F',
  red800: '#C62828',
  red900: '#B71C1C',
};

// Define green palette for success states
const greenPalette = {
  green50: '#E8F5E9',
  green100: '#C8E6C9',
  green200: '#A5D6A7',
  green300: '#81C784',
  green400: '#66BB6A',
  green500: '#4CAF50',
  green600: '#43A047',
  green700: '#388E3C',
  green800: '#2E7D32',
  green900: '#1B5E20',
};

// Define yellow palette for warning states
const yellowPalette = {
  yellow50: '#FFFDE7',
  yellow100: '#FFF9C4',
  yellow200: '#FFF59D',
  yellow300: '#FFF176',
  yellow400: '#FFEE58',
  yellow500: '#FFEB3B',
  yellow600: '#FDD835',
  yellow700: '#FBC02D',
  yellow800: '#F9A825',
  yellow900: '#F57F17',
};

// Legacy brand colors for backward compatibility
export const brandColors = {
  primary: primaryPalette.primary500,
  secondary: secondaryPalette.secondary500,
  backgroundLight: '#FFFFFF',
  backgroundDark: '#121212',
  textLight: '#000000',
  textDark: '#E0E0E0',
  neutralLight: '#F5F5F5',
  neutralDark: '#1E1E1E',
  borderColorLight: '#E0E0E0',
  borderColorDark: '#333333',
};

// Export the full palettes for use in theme building
export const palettes = {
  ...primaryPalette,
  ...secondaryPalette,
  ...redPalette,
  ...greenPalette,
  ...yellowPalette,
};

// Create theme builder for generating themes
export const themesBuilder = createThemeBuilder()
  // Add primary color palettes
  .addPalettes({
    light: [
      primaryPalette.primary50,
      primaryPalette.primary100,
      primaryPalette.primary200,
      primaryPalette.primary300,
      primaryPalette.primary400,
      primaryPalette.primary500,
      primaryPalette.primary600,
      primaryPalette.primary700,
      primaryPalette.primary800,
      primaryPalette.primary900,
    ],
    dark: [
      primaryPalette.primary900,
      primaryPalette.primary800,
      primaryPalette.primary700,
      primaryPalette.primary600,
      primaryPalette.primary500,
      primaryPalette.primary400,
      primaryPalette.primary300,
      primaryPalette.primary200,
      primaryPalette.primary100,
      primaryPalette.primary50,
    ],
  })
  // Add templates for mapping palette indices to semantic color names
  .addTemplates({
    base: {
      // Primary colors
      primary50: 0,
      primary100: 1,
      primary200: 2,
      primary300: 3,
      primary400: 4,
      primary500: 5,
      primary600: 6,
      primary700: 7,
      primary800: 8,
      primary900: 9,
    },
  })
  // Create themes using the templates and palettes
  .addThemes({
    light: {
      template: 'base',
      palette: 'light',
    },
    dark: {
      template: 'base',
      palette: 'dark',
    },
  });

// Build and export the themes
export const themes = themesBuilder.build();

// Add additional colors to the themes
// This ensures all our components have access to the colors they need
// Use type assertion to avoid TypeScript errors
Object.keys(themes).forEach((themeName) => {
  const theme = themes[themeName as keyof typeof themes];
  if (!theme) return;

  // Add red palette to all themes
  Object.entries(redPalette).forEach(([key, value]) => {
    (theme as any)[key] = value;
  });

  // Add green palette to all themes
  Object.entries(greenPalette).forEach(([key, value]) => {
    (theme as any)[key] = value;
  });

  // Add yellow palette to all themes
  Object.entries(yellowPalette).forEach(([key, value]) => {
    (theme as any)[key] = value;
  });
});
