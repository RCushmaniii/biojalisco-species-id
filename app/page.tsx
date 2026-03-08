import Link from 'next/link';
import { NavBrand } from '@/components/nav-brand';
import { OnboardingSection } from '@/components/onboarding-section';
import { SiteFooter } from '@/components/site-footer';
import { LanguageToggle } from '@/components/language-toggle';
import { ThemeToggle } from '@/components/theme-toggle';

export default function HomePage() {
  return (
    <>
      <div className="toolbar-toggles">
        <ThemeToggle />
        <LanguageToggle />
      </div>
      <nav className="nav-bar nav-bar-wide">
        <NavBrand />
        <div className="nav-links">
          <Link href="/observations" className="nav-link">Observations</Link>
          <Link href="/faq" className="nav-link">FAQ</Link>
          <Link href="/sign-in" className="nav-link">Sign In</Link>
        </div>
      </nav>
      <OnboardingSection />
      <SiteFooter />
    </>
  );
}
