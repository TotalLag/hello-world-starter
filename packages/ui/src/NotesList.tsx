// packages/ui/src/NotesList.tsx
import React from 'react';
import { ScrollView, YStack } from 'tamagui';
import type { Note } from '@hello-world/api-types';
import { NoteCard } from './NoteCard';

interface NotesListProps {
  notes: Note[];
}

export const NotesList: React.FC<NotesListProps> = ({ notes }) => (
  <ScrollView>
    <YStack gap="$3" padding="$2">
      {notes.map((note) => (
        <NoteCard key={note.id} note={note} />
      ))}
    </YStack>
  </ScrollView>
);
