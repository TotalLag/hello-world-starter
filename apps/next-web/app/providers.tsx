/**
 * @file apps/next-web/app/providers.tsx
 * @description Centralized component for wrapping the Next.js web application
 * with essential context providers. This file is marked with `'use client'`
 * as it contains client-side logic including React context and state.
 *
 * This `Providers` component ensures that core services and configurations, such as
 * Tamagui for UI theming/styling and React Query for server state management,
 * are available throughout the application tree.
 *
 * For a learner:
 * - `'use client';` is a Next.js App Router directive that marks this module as a Client Component.
 *   Client Components can use React hooks like `useState` and `useEffect`, and are necessary
 *   for components that provide React Context (like TamaguiProvider and QueryClientProvider).
 * - This setup is similar to the Expo app's providers but tailored for the web environment.
 *   For instance, it doesn't include native-specific font loading or color scheme detection
 *   from `react-native` (though web-equivalent theme handling could be added).
 */
'use client'; // This directive is essential for Next.js App Router.

import React, { useState, PropsWithChildren } from 'react';
import TamaguiConfig from '../tamagui.config'; // Tamagui configuration for the Next.js app.
import { TamaguiProvider, TamaguiProviderProps } from 'tamagui'; // Core Tamagui provider.
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'; // Core React Query provider and client.

/**
 * Props for the `Providers` component.
 * It accepts all props that `TamaguiProvider` accepts, except for `config`,
 * as the `config` is hardcoded from `../tamagui.config`.
 * `PropsWithChildren` is used to correctly type the `children` prop.
 */
type AppProvidersProps = PropsWithChildren<
  Omit<TamaguiProviderProps, 'config'>
>;

/**
 * The main `Providers` component for the Next.js web application.
 * It sets up Tamagui and React Query.
 *
 * @param {AppProvidersProps} props - The props for the component, including children.
 */
export function Providers({ children, ...rest }: AppProvidersProps) {
  // Initialize the React Query client.
  // `useState(() => new QueryClient())` ensures that the QueryClient instance
  // is created only once when the component mounts on the client-side and is
  // persisted across re-renders. This is the recommended way to create and
  // provide the client in a React application.
  const [queryClient] = useState(() => new QueryClient());

  // Render the providers, wrapping the application's children.
  return (
    // TamaguiProvider initializes the Tamagui UI kit.
    // - `config`: Uses the specific Tamagui configuration for the Next.js app.
    // - `defaultTheme="light"`: Sets the default theme. For web, dynamic theme switching
    //   (e.g., based on system preference or user toggle) would typically be implemented
    //   separately if desired, potentially by managing a theme state here or in a theme context.
    <TamaguiProvider config={TamaguiConfig} defaultTheme="light" {...rest}>
      {/*
        QueryClientProvider makes the `queryClient` instance available to all
        descendant components, allowing them to use React Query hooks (useQuery, useMutation).
      */}
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </TamaguiProvider>
  );
}
