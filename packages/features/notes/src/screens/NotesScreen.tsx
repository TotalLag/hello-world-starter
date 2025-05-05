// packages/features/notes/src/screens/NotesScreen.tsx
import React from 'react';
import { YStack, Text, Spinner } from 'tamagui';
import { useGetNotes, useCreateNote } from '../hooks/useNotes';
import { useAuth } from '@hello-world/auth';
import { NotesList, AddNoteForm } from '@hello-world/ui';
import type { CreateNoteRequest, Note } from '@hello-world/api-types';

export function NotesScreen() {
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

  // While notes or auth data is loading, display a loading spinner
  if (isLoadingNotes || isLoadingUser) {
    return (
      <YStack flex={1} justifyContent="center" alignItems="center">
        <Spinner />
        <Text marginTop="$2">Loading notes...</Text>
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
        Public Notes
      </Text>
      <Text>These notes are visible to everyone.</Text>

      {/* Render the list of notes */}
      <NotesList notes={(notesData ?? []) as Note[]} />

      {/* Only show AddNoteForm to authenticated users */}
      {isAuthenticated ? (
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
      ) : (
        <YStack
          marginTop="$4"
          padding="$2"
          borderRadius="$2"
          backgroundColor="$backgroundHover"
        >
          <Text textAlign="center">Please log in to add notes</Text>
        </YStack>
      )}
    </YStack>
  );
}
