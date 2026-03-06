'use client';

import { UserButton } from '@clerk/nextjs';

const hasClerk = (() => {
  const key = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || '';
  return key.length > 20 && !key.endsWith('...');
})();

export function ClerkUserButton() {
  if (!hasClerk) return null;

  return (
    <UserButton
      appearance={{
        elements: {
          avatarBox: { width: '28px', height: '28px' },
        },
      }}
    />
  );
}
