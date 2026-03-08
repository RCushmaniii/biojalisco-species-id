import Link from 'next/link';
import { NavLinks } from '@/components/nav-links';
import { LanguageToggle } from '@/components/language-toggle';
import { ClerkUserButton } from '@/components/clerk-user-button';
import { SiteFooter } from '@/components/site-footer';

export const dynamic = 'force-dynamic';

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <LanguageToggle />
      <nav className="nav-bar nav-bar-wide">
        <Link href="/dashboard" className="nav-brand">
          <span className="accent">Bio</span>Jalisco
        </Link>
        <div className="nav-links">
          <NavLinks />
          <ClerkUserButton />
        </div>
      </nav>
      {children}
      <SiteFooter />
    </>
  );
}
