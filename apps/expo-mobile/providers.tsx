/**
 * @file providers.tsx
 * @description Centralized component for wrapping the entire Expo mobile application
 * with essential context providers.
 *
 * This `Providers` component ensures that core services and configurations, such as
 * Tamagui for UI theming/styling and React Query for server state management,
 * are available throughout the application tree. It also handles the loading of
 * custom fonts before rendering the main application content.
 *
 * For a learner:
 * - This is a common pattern in React applications to set up the "root" environment.
 * - `TamaguiProvider` initializes the Tamagui UI kit with specific configurations and themes.
 * - `QueryClientProvider` makes React Query's caching and data fetching capabilities accessible.
 * - Font loading (`useFonts`) is crucial for ensuring custom fonts are ready before UI renders,
 *   preventing layout shifts or incorrect text rendering.
 */
import config from './tamagui.config'; // Tamagui configuration specific to the expo-mobile app.
import { TamaguiProvider, TamaguiProviderProps } from 'tamagui'; // Core Tamagui provider.
import { useColorScheme } from 'react-native'; // Hook to get the device's current color scheme (light/dark).
import React, { useState, PropsWithChildren } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'; // Core React Query provider and client.
import { useFonts } from 'expo-font'; // Expo hook for loading custom fonts.

/**
 * Props for the `Providers` component.
 * It accepts all props that `TamaguiProvider` accepts, except for `config`,
 * as the `config` is hardcoded from `./tamagui.config`.
 * `PropsWithChildren` is used to correctly type the `children` prop.
 */
type AppProvidersProps = PropsWithChildren<
  Omit<TamaguiProviderProps, 'config'>
>;

/**
 * The main `Providers` component.
 * It sets up Tamagui, React Query, and handles font loading.
 *
 * @param {AppProvidersProps} props - The props for the component, including children.
 */
export function Providers({ children, ...rest }: AppProvidersProps) {
  // Determine the device's current color scheme (e.g., 'light' or 'dark').
  // Defaults to 'light' if `useColorScheme()` returns null or undefined.
  // This is used to set the `defaultTheme` for Tamagui.
  const colorScheme = useColorScheme() ?? 'light';

  // Initialize the React Query client.
  // `useState(() => new QueryClient())` ensures that the QueryClient instance
  // is created only once when the component mounts and is persisted across re-renders.
  // This is the recommended way to create and provide the client.
  const [queryClient] = useState(() => new QueryClient());

  // Load custom fonts required by the application.
  // `useFonts` is an asynchronous hook. `loaded` will be true once fonts are ready.
  const [loaded] = useFonts({
    Inter: require('@tamagui/font-inter/otf/Inter-Medium.otf'),
    InterBold: require('@tamagui/font-inter/otf/Inter-Bold.otf'),
    // Add other custom fonts here if needed.
  });

  // If fonts are not yet loaded, return null to prevent rendering the rest of the app.
  // This avoids FOUC (Flash Of Unstyled Content) or text rendering with default fonts
  // before custom fonts are available. A loading spinner or splash screen could also be shown here.
  if (!loaded) {
    return null;
  }

  // Render the providers, wrapping the application's children.
  // The order of providers can matter if one provider depends on another,
  // though in this case, TamaguiProvider and QueryClientProvider are largely independent.
  return (
    <TamaguiProvider config={config} defaultTheme={colorScheme} {...rest}>
      {/*
        QueryClientProvider makes the `queryClient` instance available to all
        descendant components, allowing them to use React Query hooks (useQuery, useMutation).
      */}
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </TamaguiProvider>
  );
}
