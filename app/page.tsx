import { PublicNav } from '@/components/public-nav';
import { OnboardingSection } from '@/components/onboarding-section';
import { SiteFooter } from '@/components/site-footer';
import { OrganizationJsonLd, WebSiteJsonLd } from '@/components/json-ld';

export default function HomePage() {
  return (
    <>
      <OrganizationJsonLd />
      <WebSiteJsonLd />
      <PublicNav />
      <OnboardingSection />
      <SiteFooter />
    </>
  );
}
