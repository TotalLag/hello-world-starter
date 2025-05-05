'use client'; // Required for hooks like useEffect, useAuth, useRouter

import React, { useEffect } from 'react';
import { useRouter } from 'solito/navigation';
import { useAuth } from '@hello-world/auth';
import { HomeScreen } from '@hello-world/dashboard';
import { YStack, Spinner } from 'tamagui'; // Import Spinner for loading state

export default function ProtectedHomePage() {
  const { isAuthenticated, isLoadingUser } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Wait until the auth state is determined (not loading)
    if (!isLoadingUser && !isAuthenticated) {
      // If not loading and not authenticated, redirect to notes
      router.replace('/notes');
    }
  }, [isAuthenticated, isLoadingUser, router]);

  // Show loading indicator while checking auth status
  if (isLoadingUser) {
    return (
      <YStack flex={1} justifyContent="center" alignItems="center">
        <Spinner size="large" />
      </YStack>
    );
  }

  // If authenticated, render the actual home screen content
  // The HomeScreen component itself handles displaying user info and logout
  if (isAuthenticated) {
    return <HomeScreen />;
  }

  // Render null or a minimal layout while redirecting or if auth state is indeterminate
  // This prevents flashing unauthenticated content
  return null;
}
