import Link from 'next/link';
import { NavBrand } from '@/components/nav-brand';
import { OnboardingSection } from '@/components/onboarding-section';
import { SiteFooter } from '@/components/site-footer';
import { LanguageToggle } from '@/components/language-toggle';

export default function HomePage() {
  return (
    <>
      <LanguageToggle />
      <nav className="nav-bar nav-bar-wide">
        <NavBrand />
        <div className="nav-links">
          <Link href="/faq" className="nav-link">FAQ</Link>
          <Link href="/sign-in" className="nav-link">Sign In</Link>
        </div>
      </nav>
      <OnboardingSection />
      <SiteFooter />
    </>
  );
}
