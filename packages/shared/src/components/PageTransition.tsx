import React, { useEffect, useState } from 'react';
import { YStack, Spinner, Text, Theme, AnimatePresence, ZStack } from 'tamagui';
import { useRouter } from 'solito/navigation';

interface PageTransitionProps {
  show: boolean;
  message?: string;
  onComplete?: () => void;
  destination?: string;
  delay?: number; // Delay in ms before navigation
}

export function PageTransition({
  show,
  message = 'Loading...',
  onComplete,
  destination,
  delay = 800,
}: PageTransitionProps) {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setIsVisible(true);

      // If a destination is provided, navigate after the delay
      if (destination) {
        const timer = setTimeout(() => {
          router.push(destination);
          if (onComplete) {
            onComplete();
          }
        }, delay);

        return () => clearTimeout(timer);
      }
    } else {
      setIsVisible(false);
    }
  }, [show, destination, delay, router, onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <ZStack
          // @ts-expect-error There's no position fixed support in React native, but we're leaving this here for web
          position="fixed"
          top={0}
          left={0}
          right={0}
          bottom={0}
          width="100vw"
          height="100vh"
          zIndex={9999}
          animation="quick"
          enterStyle={{ opacity: 0, scale: 1.05 }}
          exitStyle={{ opacity: 0, scale: 0.95 }}
          opacity={1}
        >
          <Theme name="dark">
            <YStack
              width="100%"
              height="100%"
              flex={1}
              backgroundColor="$background"
              justifyContent="center"
              alignItems="center"
              gap="$4"
              opacity={0.9}
            >
              <Spinner size="large" color="$color" />
              <Text fontSize="$5" fontWeight="bold" color="$color">
                {message}
              </Text>
            </YStack>
          </Theme>
        </ZStack>
      )}
    </AnimatePresence>
  );
}
