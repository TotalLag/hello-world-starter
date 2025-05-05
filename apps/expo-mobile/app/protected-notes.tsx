import { ProtectedNotesScreen } from '@hello-world/features-notes';
import { YStack, Text } from 'tamagui';
import { useRouter } from 'solito/navigation';
import { Link } from 'solito/link';
import { Button } from '@hello-world/ui';

export default function ProtectedNotesPage() {
  const router = useRouter();

  // Handle unauthorized access by redirecting to login
  const handleUnauthorized = () => {
    router.push('/login');
  };

  return (
    <YStack f={1} p="$4" space>
      <Text fontSize="$6" fontWeight="bold">
        Protected Notes
      </Text>
      <ProtectedNotesScreen onUnauthorized={handleUnauthorized} />
      <Link href="/">
        <Button>Back to Home</Button>
      </Link>
    </YStack>
  );
}
