import { YStack, H1 } from 'tamagui';
import { Button } from '@hello-world/ui';
import { StatusBar } from 'expo-status-bar';
import { Alert } from 'react-native';
import { Link } from 'solito/link';

export default function IndexScreen() {
  return (
    <YStack flex={1} alignItems="center" justifyContent="center" space>
      <H1>Expo Home</H1>
      <Button onPress={() => Alert.alert('Button Pressed!')}>
        Test Button
      </Button>
      <Link href="/notes">
        <Button>Notes</Button>
      </Link>
      <Link href="/protected-notes">
        <Button>Protected Notes</Button>
      </Link>
      <StatusBar style="auto" />
    </YStack>
  );
}
