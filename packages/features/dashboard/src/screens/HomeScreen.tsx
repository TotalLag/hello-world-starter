import React from 'react';
import { YStack, H2, Paragraph, Spinner } from 'tamagui';
import { Button } from '@hello-world/ui';
import { useAuth } from '@hello-world/auth';
import { useRouter } from 'solito/navigation';

export function HomeScreen() {
  const { user, logout, isLoggingOut } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout({
      // Pass undefined as payload if not needed
      onSuccess: () => {
        // Redirect to login after successful logout
        router.push('/login');
      },
      onError: (error) => {
        console.error('Logout failed in component:', error);
        // Optionally still redirect or show message even if API fails
        router.push('/login');
      },
    });
  };

  if (!user) {
    // This case shouldn't ideally be reached if the route is protected,
    // but it's good practice to handle it.
    // Could show a loading state or redirect.
    return (
      <YStack flex={1} justifyContent="center" alignItems="center">
        <Spinner />
      </YStack>
    );
  }

  return (
    <YStack
      flex={1}
      justifyContent="center"
      alignItems="center"
      space="$4"
      padding="$4"
    >
      <H2>Welcome Home!</H2>
      <Paragraph>
        You are logged in as: {user.name} ({user.email})
      </Paragraph>
      <Button
        onPress={handleLogout}
        disabled={isLoggingOut}
        isLoading={isLoggingOut}
        variant="tertiary" // Use tertiary variant for logout action
      >
        Logout
      </Button>
    </YStack>
  );
}
