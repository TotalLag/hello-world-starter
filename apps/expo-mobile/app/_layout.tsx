/**
 * @file _layout.tsx
 * @description Root layout component for the Expo mobile application.
 *
 * This file, named `_layout.tsx` according to Expo Router conventions, defines
 * the top-level layout structure for all routes within the `app` directory.
 * It's responsible for:
 * 1. Wrapping the entire application with the `Providers` component, which supplies
 *    essential contexts like Tamagui (UI), React Query (server state), etc.
 * 2. Setting up the root navigator, in this case, a `Stack` navigator from Expo Router.
 *
 * For a learner:
 * - `_layout.tsx` is a fundamental concept in Expo Router for defining shared UI
 *   and behavior for a segment of your app. This one is at the root, so it applies globally.
 * - The `Providers` component is crucial for making app-wide services available.
 * - `<Stack />` is how you initiate stack navigation (screens pushed on top of each other).
 * - `screenOptions` on the `Stack` allow you to define default appearances/behaviors
 *   for all screens within that navigator.
 */
import { Providers } from '../providers'; // Imports the central Providers component.
import { Stack } from 'expo-router'; // Imports the Stack navigator from Expo Router.

/**
 * Defines the root layout for the application.
 * All other screens and navigators will be nested within this layout.
 */
export default function RootLayout() {
  return (
    // The `Providers` component wraps the entire navigation stack, ensuring that
    // all contexts (Tamagui, React Query, etc.) are available to every screen.
    <Providers>
      {/*
        The `<Stack />` component from Expo Router initializes a stack navigator.
        - All files and directories within `app/` that define routes will be
          rendered as screens within this stack.
        - `screenOptions={{ headerShown: false }}` is a common setting to disable
          the default header provided by the stack navigator for all screens.
          This allows for custom header implementations per screen or a global
          custom header component if desired.
      */}
      <Stack screenOptions={{ headerShown: false }} />
    </Providers>
  );
}
