import Link from 'next/link';
import { NavLinks } from '@/components/nav-links';
import { LanguageToggle } from '@/components/language-toggle';
import { ClerkUserButton } from '@/components/clerk-user-button';

export const dynamic = 'force-dynamic';

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <LanguageToggle />
      <nav className="nav-bar">
        <Link href="/" className="nav-brand">
          <span className="accent">Bio</span>Jalisco
        </Link>
        <div className="nav-links">
          <NavLinks />
          <ClerkUserButton />
        </div>
      </nav>
      {children}
      <div className="footer">
        Powered by GPT-4o Vision &middot; <a href="https://cushlabs.ai">CushLabs AI</a>
      </div>
    </>
  );
}
