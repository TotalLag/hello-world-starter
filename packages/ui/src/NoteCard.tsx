/**
 * @file packages/ui/src/NoteCard.tsx
 * @description A presentational component for displaying a single note in a card format.
 *
 * This component takes a `Note` object as a prop and renders its details (title, content, author, date)
 * using Tamagui components for layout (`YStack`) and text (`Text`). It relies heavily on theme tokens
 * (e.g., `$cardBackground`, `$color`, `$borderColor`) defined in the Tamagui configuration
 * to ensure consistent styling and adaptability to different themes (light/dark).
 *
 * For a learner:
 * - This is an example of a simple, reusable presentational component.
 * - It receives data via props (`note: Note`). The `Note` type comes from the shared `api-types` package.
 * - Styling is applied directly using Tamagui's style props and theme tokens.
 * - It demonstrates how to display data fetched from the API (passed down through props).
 */
import React from 'react';
import { YStack, Text } from 'tamagui'; // Import layout and text components from Tamagui
import type { Note } from '@hello-world/api-types'; // Import the TypeScript type definition for a Note

/**
 * Props accepted by the NoteCard component.
 */
interface NoteCardProps {
  /** The note object containing data to display. */
  note: Note;
}

/**
 * NoteCard component displays the details of a single note.
 * It's a functional component using React.FC for type safety.
 */
export const NoteCard: React.FC<NoteCardProps> = ({ note }) => (
  // YStack provides vertical layout for the card content.
  <YStack
    // Styling using Tamagui theme tokens. These values are defined in tamagui.config.ts
    // and will adapt based on the current theme (e.g., light/dark).
    backgroundColor="$cardBackground" // Background color for the card.
    padding="$4" // Inner padding using theme spacing scale.
    borderRadius="$3" // Rounded corners using theme radius scale.
    borderColor="$borderColor" // Border color using theme semantic token.
    borderWidth={1} // Standard border width.
    gap="$2" // Spacing between child elements (Text components) using theme spacing scale.
    // Consider adding other props like elevation/shadow for more card-like appearance if needed.
    // elevation="$1"
  >
    {/* Display the note title */}
    <Text fontSize="$6" fontWeight="600" color="$color">
      {note.title}
    </Text>
    {/* Display the note content */}
    <Text color="$color">{note.content}</Text>
    {/* Display the author's name. Note: `authorName` might be optional in the Note type
        if the backend doesn't always include it. Add conditional rendering if needed. */}
    <Text fontSize="$2" color="$color" opacity={0.7}>
      By: {note.authorName || 'Unknown Author'}{' '}
      {/* Fallback if authorName is missing */}
    </Text>
    {/* Display the creation timestamp. Consider formatting this date more nicely. */}
    <Text fontSize="$1" color="$color" opacity={0.5}>
      Created: {note.created_at} {/* TODO: Format date */}
    </Text>
  </YStack>
);
