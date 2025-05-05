'use client';

import React from 'react';
import { XStack, Paragraph, styled, Stack } from 'tamagui';
import { Link } from 'solito/link';
import { useAuth } from '@hello-world/auth';
import { Button } from '@hello-world/ui';

// Create a styled container for our links
const NavContainer = styled(Stack, {
  borderRadius: '$2',
  padding: '$2 $3',
  hoverStyle: {
    backgroundColor: '$backgroundHover',
  },
});

// Create a NavLink component that uses the container and Link properly
function NavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <NavContainer>
      <Link href={href}>{children}</Link>
    </NavContainer>
  );
}

export function Header() {
  const { isAuthenticated, logout, isLoggingOut, user } = useAuth();

  const handleLogout = () => {
    logout({
      onSuccess: () => {
        console.log(
          'Logout successful, navigation handled by auth state change.'
        );
      },
    });
  };

  // Define auth links dynamically
  const authLinks = [
    { href: '/login', label: 'Login' },
    { href: '/register', label: 'Register' },
  ];

  // Define authenticated user links dynamically
  const userLinks = [
    { href: '/', label: 'Home' },
    { href: '/notes', label: 'Notes' },
    { href: '/protected-notes', label: 'Protected Notes' },
  ];

  return (
    <XStack
      tag="header"
      gap="$4"
      padding="$4"
      alignItems="center"
      borderBottomWidth={1}
      borderBottomColor="$borderColor"
    >
      <XStack alignItems="center" gap="$4">
        <NavLink href="/">
          <Paragraph cursor="pointer" fontWeight="bold">
            MyApp
          </Paragraph>
        </NavLink>
        {isAuthenticated && user && (
          <Paragraph cursor="default" fontWeight="normal">
            Hello {user.name}!
          </Paragraph>
        )}
      </XStack>
      <XStack gap="$2" marginLeft="auto">
        {isAuthenticated ? (
          <>
            {userLinks.map((link) => (
              <NavLink key={link.href} href={link.href}>
                <Paragraph cursor="pointer">{link.label}</Paragraph>
              </NavLink>
            ))}
            <Button onPress={handleLogout} disabled={isLoggingOut} size="small">
              {isLoggingOut ? 'Logging out...' : 'Logout'}
            </Button>
          </>
        ) : (
          <>
            {authLinks.map((link) => (
              <NavLink key={link.href} href={link.href}>
                <Paragraph cursor="pointer">{link.label}</Paragraph>
              </NavLink>
            ))}
          </>
        )}
      </XStack>
    </XStack>
  );
}
