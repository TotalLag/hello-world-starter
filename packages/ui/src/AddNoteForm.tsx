// packages/ui/src/AddNoteForm.tsx
import React, { useState } from 'react';
import { YStack, TextArea } from 'tamagui';
import { Button } from './Button';
import { Input } from './Input';

interface AddNoteFormProps {
  onSubmit: (data: { title: string; content: string }) => void;
  isLoading?: boolean;
}

export const AddNoteForm: React.FC<AddNoteFormProps> = ({
  onSubmit,
  isLoading = false,
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const handleSubmit = () => {
    if (!isLoading) {
      onSubmit({ title, content });
    }
  };

  return (
    <YStack gap="$3" padding="$2">
      <Input
        value={title}
        onChangeText={setTitle}
        placeholder="Note Title"
        backgroundColor="$background"
        color="$color"
      />
      <TextArea
        value={content}
        onChangeText={setContent}
        placeholder="Note Content"
        backgroundColor="$background"
        color="$color"
      />
      <Button
        onPress={handleSubmit}
        disabled={isLoading}
        isLoading={isLoading} // Use the isLoading prop for the spinner
        animation="quick" // Add animation for smooth transitions
      >
        Add Note
      </Button>
    </YStack>
  );
};
