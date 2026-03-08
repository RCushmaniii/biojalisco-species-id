import { PublicNav } from '@/components/public-nav';
import { OnboardingSection } from '@/components/onboarding-section';
import { SiteFooter } from '@/components/site-footer';

export default function HomePage() {
  return (
    <>
      <PublicNav />
      <OnboardingSection />
      <SiteFooter />
    </>
  );
}
