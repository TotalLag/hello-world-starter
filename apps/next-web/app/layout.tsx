/**
 * @file apps/next-web/app/layout.tsx
 * @description Root layout component for the Next.js web application.
 *
 * This file, named `layout.tsx` within the `app` directory, is a special Next.js App Router
 * file that defines the root layout for the entire application. It's responsible for:
 * - Defining the `<html>` and `<body>` tags.
 * - Importing global CSS resets or styles.
 * - Wrapping the application with the `Providers` component for essential contexts.
 * - Rendering global UI elements like a common `Header`.
 * - Structuring the main content area where page content will be rendered.
 *
 * The `'use client';` directive at the top indicates that this root layout, and potentially
 * components it directly renders, will be treated as Client Components. This is often
 * necessary if the layout or its children (like Providers) use client-side React features
 * such as `useState`, `useEffect`, or Context that relies on client-side state.
 *
 * For a learner:
 * - `layout.tsx` in Next.js App Router is fundamental for page structure.
 * - The `'use client';` directive has significant implications for rendering (client vs. server).
 *   While root layouts can be Server Components, using client features directly or via
 *   child components like `Providers` often necessitates making the layout a Client Component.
 *   An alternative is to keep the layout as a Server Component and wrap only specific
 *   client-side parts with their own `'use client';` boundary.
 * - This file sets up the global page shell, including CSS resets, providers, and common UI.
 */
'use client'; // Marks this component as a Client Component for Next.js App Router.

import '@tamagui/core/reset.css'; // Imports Tamagui's basic CSS reset for consistent styling.
import React from 'react';
import { Providers } from './providers'; // Centralized context providers.
import { Header } from '../components/Header'; // Global header component.
import { YStack } from 'tamagui'; // Tamagui component for vertical stacking/layout.

/**
 * Defines the root layout for the Next.js application.
 * This component wraps every page in the application.
 *
 * @param {object} props - The component's props.
 * @param {React.ReactNode} props.children - The content of the current page or nested layout,
 *   provided by Next.js.
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // The `<html>` and `<body>` tags are defined here, as is standard for Next.js root layouts.
    // The `lang="en"` attribute sets the language of the document.
    <html lang="en">
      <body>
        {/*
          The `Providers` component wraps all content, making contexts like
          Tamagui theme and React Query client available throughout the app.
        */}
        <Providers>
          {/* The global `Header` component is rendered at the top of every page. */}
          <Header />
          {/*
            This `YStack` (a Tamagui layout component, like a div with flex-direction: column)
            serves as the main content wrapper for pages.
            - `tag="main"`: Renders as an HTML `<main>` element for semantic correctness.
            - `flex={1}`: Allows the main content area to grow and fill available vertical space
              (assuming the body/html or a parent container has display: flex and height: 100%).
            - `maxWidth={1100}`: Sets a maximum width for the content area.
            - `width="100%"`: Ensures it takes full width up to the maxWidth.
            - `marginHorizontal="auto"`: Centers the content block on the page when maxWidth is reached.
            - `padding="$4"`: Applies consistent padding using Tamagui's theme spacing.
          */}
          <YStack
            tag="main"
            flex={1}
            maxWidth={1100}
            width="100%"
            marginHorizontal="auto"
            padding="$4"
          >
            {/* `children` will be the actual page component rendered by Next.js routing. */}
            {children}
          </YStack>
        </Providers>
      </body>
    </html>
  );
}
