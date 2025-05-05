'use client';

import { useRouter } from 'next/navigation';
import { ProtectedNotesScreen } from '@hello-world/features-notes';
import { YStack } from 'tamagui';

export default function ProtectedNotesPage() {
  const router = useRouter();

  // Handle unauthorized access by redirecting to login
  const handleUnauthorized = () => {
    router.push('/login?returnUrl=/protected-notes');
  };

  return (
    <YStack f={1} p="$4">
      <ProtectedNotesScreen onUnauthorized={handleUnauthorized} />
    </YStack>
  );
}
