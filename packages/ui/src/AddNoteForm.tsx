// packages/ui/src/AddNoteForm.tsx
import React, { useState } from 'react';
import { YStack, TextArea, Form } from 'tamagui';
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
    <Form onSubmit={handleSubmit} width="100%">
      <YStack gap="$3" padding="$2">
        <Input
          id="title"
          value={title}
          onChangeText={setTitle}
          placeholder="Note Title"
          backgroundColor="$background"
          color="$color"
        />
        <TextArea
          id="content"
          value={content}
          onChangeText={setContent}
          placeholder="Note Content"
          backgroundColor="$background"
          color="$color"
        />
        <Form.Trigger asChild marginTop="$2">
          <Button
            type="submit"
            disabled={isLoading}
            isLoading={isLoading}
            animation="quick"
            fullWidth={true}
          >
            Add Note
          </Button>
        </Form.Trigger>
      </YStack>
    </Form>
  );
};
