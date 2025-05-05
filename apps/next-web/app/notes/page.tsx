'use client'; // Required for pages that use client-side hooks like TanStack Query

import { NotesScreen } from '@hello-world/features-notes';
import { YStack } from 'tamagui';

export default function NotesPage() {
  return (
    <YStack f={1} p="$4">
      <NotesScreen />
    </YStack>
  );
}
