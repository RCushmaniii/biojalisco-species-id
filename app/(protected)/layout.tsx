import { NavBrand } from '@/components/nav-brand';
import { NavLinks } from '@/components/nav-links';
import { LanguageToggle } from '@/components/language-toggle';
import { ThemeToggle } from '@/components/theme-toggle';
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
      <div className="toolbar-toggles">
        <ThemeToggle />
        <LanguageToggle />
      </div>
      <nav className="nav-bar nav-bar-wide">
        <NavBrand href="/dashboard" />
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
