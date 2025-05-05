import { NotesScreen } from '@hello-world/features-notes';
import { YStack, Text } from 'tamagui';
import { Link } from 'solito/link';
import { Button } from '@hello-world/ui';

export default function NotesPage() {
  return (
    <YStack f={1} p="$4" space>
      <Text fontSize="$6" fontWeight="bold">
        Public Notes
      </Text>
      <NotesScreen />
      <Link href="/">
        <Button>Back to Home</Button>
      </Link>
    </YStack>
  );
}
