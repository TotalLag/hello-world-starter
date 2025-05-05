// packages/features/notes/src/screens/ProtectedNotesScreen.tsx
import React, { useEffect } from 'react';
import { YStack, Text, Spinner } from 'tamagui';
import { useGetNotes, useCreateNote } from '../hooks/useNotes';
import { useAuth } from '@hello-world/auth';
import { NotesList, AddNoteForm } from '@hello-world/ui';
import type { CreateNoteRequest, Note } from '@hello-world/api-types';

type ProtectedNotesScreenProps = {
  onUnauthorized?: () => void;
};

// Screen component for Protected Notes: ensures user is authenticated
export function ProtectedNotesScreen({
  onUnauthorized,
}: ProtectedNotesScreenProps) {
  // Get authentication state
  const { isAuthenticated, isLoadingUser } = useAuth();

  // Fetch notes data
  const {
    data: notesData,
    isLoading: isLoadingNotes,
    error: notesError,
  } = useGetNotes();

  // Create note mutation
  const {
    mutate: createNote,
    isPending: isCreatingNote,
    error: createNoteError,
  } = useCreateNote();

  // Handle unauthorized access
  useEffect(() => {
    if (!isLoadingUser && !isAuthenticated && onUnauthorized) {
      onUnauthorized();
    }
  }, [isAuthenticated, isLoadingUser, onUnauthorized]);

  // While notes or auth data is loading, display a loading spinner
  if (isLoadingNotes || isLoadingUser) {
    return (
      <YStack flex={1} justifyContent="center" alignItems="center">
        <Spinner />
        <Text marginTop="$2">Loading notes...</Text>
      </YStack>
    );
  }

  // If not authenticated, show a message
  if (!isAuthenticated) {
    return (
      <YStack flex={1} justifyContent="center" alignItems="center" padding="$4">
        <Text fontSize="$5" textAlign="center">
          You need to be logged in to view your notes
        </Text>
      </YStack>
    );
  }

  // Display error message if fetching notes fails
  if (notesError) {
    return (
      <YStack padding="$4">
        <Text color="red">Error fetching notes: {notesError.message}</Text>
      </YStack>
    );
  }

  // Handle form submission: call createNote mutation with form data
  const handleAddNoteSubmit = (data: { title: string; content: string }) => {
    createNote(data as CreateNoteRequest);
  };

  return (
    <YStack flex={1} padding="$2" space>
      <Text fontSize="$6" fontWeight="bold">
        Your Protected Notes
      </Text>
      <Text>These notes are only visible to you when logged in.</Text>

      {/* Render the list of notes */}
      <NotesList notes={(notesData ?? []) as Note[]} />

      {/* Add note form */}
      <YStack marginTop="$4">
        <AddNoteForm
          onSubmit={handleAddNoteSubmit}
          isLoading={isCreatingNote}
        />
        {createNoteError && (
          <Text color="red" marginTop="$2">
            Error creating note: {createNoteError.message}
          </Text>
        )}
      </YStack>
    </YStack>
  );
}
